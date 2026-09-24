import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetSession = vi.fn();
const mockCreateCheckoutOrder = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: mockGetSession } } }));
vi.mock('@/lib/ghl-sync', () => ({ syncNewOrderToGHL: vi.fn() }));
vi.mock('@/db', () => ({ db: {} }));

const checkout = await import('@/lib/checkout');
const { parseCheckoutInput, priceCart, CheckoutError } = checkout;

// The route uses the real parser and error class, with the DB-backed step mocked
vi.spyOn(checkout, 'createCheckoutOrder').mockImplementation(mockCreateCheckoutOrder);
const { POST } = await import('@/app/api/checkout/route');

const product = (over: Record<string, unknown> = {}) => ({
  id: 1,
  name: 'Taco al Pastor',
  description: null,
  price: 25,
  categoryId: 1,
  stock: 10,
  image: null,
  active: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  ...over,
}) as any;

const coupon = (over: Record<string, unknown> = {}) => ({
  id: 3,
  code: 'PORKY10',
  type: 'percentage',
  value: 10,
  minPurchase: null,
  maxDiscount: null,
  usageLimit: null,
  usedCount: 0,
  startDate: null,
  endDate: null,
  active: true,
  createdAt: '2026-01-01',
  ...over,
}) as any;

const validBody = {
  items: [{ productId: 1, quantity: 2 }],
  deliveryMethod: 'pickup',
  phone: '5512345678',
};

describe('parseCheckoutInput', () => {
  it('merges repeated products and keeps only ids and quantities', () => {
    const input = parseCheckoutInput({
      ...validBody,
      items: [{ productId: 1, quantity: 2, price: 0.01 }, { productId: 1, quantity: 1 }],
    });
    expect(input.items).toEqual([{ productId: 1, quantity: 3 }]);
  });

  it('rejects an empty cart, bad quantities and short phones', () => {
    expect(() => parseCheckoutInput({ ...validBody, items: [] })).toThrow(CheckoutError);
    expect(() => parseCheckoutInput({ ...validBody, items: [{ productId: 1, quantity: 0 }] })).toThrow(/cantidad/);
    expect(() => parseCheckoutInput({ ...validBody, items: [{ productId: 1, quantity: 1.5 }] })).toThrow(CheckoutError);
    expect(() => parseCheckoutInput({ ...validBody, items: [{ productId: 1, quantity: 101 }] })).toThrow(/Máximo/);
    expect(() => parseCheckoutInput({ ...validBody, phone: '12345' })).toThrow(/teléfono/);
  });

  it('requires address and postal code for delivery, and drops them for pickup', () => {
    expect(() => parseCheckoutInput({ ...validBody, deliveryMethod: 'delivery' })).toThrow(/dirección/);
    const pickup = parseCheckoutInput({ ...validBody, deliveryAddress: 'Calle 1', postalCode: '01000' });
    expect(pickup.deliveryAddress).toBeNull();
    expect(pickup.postalCode).toBeNull();
  });
});

describe('priceCart', () => {
  it('uses database prices and computes subtotal, IVA, delivery and total', () => {
    const priced = priceCart([{ productId: 1, quantity: 2 }], [product()], 35, null);
    expect(priced).toMatchObject({ subtotal: 50, iva: 8, deliveryCost: 35, discount: 0, total: 93 });
    expect(priced.lines).toEqual([{ productId: 1, name: 'Taco al Pastor', quantity: 2, price: 25 }]);
  });

  it('applies the coupon discount computed on the server', () => {
    const priced = priceCart([{ productId: 1, quantity: 4 }], [product()], 0, coupon());
    // subtotal 100, IVA 16, 10% discount = 10
    expect(priced).toMatchObject({ subtotal: 100, iva: 16, discount: 10, total: 106 });
  });

  it('rejects quantities above stock and unavailable products', () => {
    expect(() => priceCart([{ productId: 1, quantity: 11 }], [product()], 0, null)).toThrow('Solo quedan 10 de Taco al Pastor');
    expect(() => priceCart([{ productId: 1, quantity: 1 }], [product({ stock: 0 })], 0, null)).toThrow(/agotado/);
    expect(() => priceCart([{ productId: 1, quantity: 1 }], [product({ active: false })], 0, null)).toThrow(/no está disponible/);
    expect(() => priceCart([{ productId: 2, quantity: 1 }], [product()], 0, null)).toThrow(/no está disponible/);
  });

  it('rejects a coupon that is no longer valid', () => {
    expect(() => priceCart([{ productId: 1, quantity: 1 }], [product()], 0, coupon({ usageLimit: 5, usedCount: 5 }))).toThrow('Cupón agotado');
  });
});

describe('POST /api/checkout', () => {
  const post = (body: unknown) =>
    POST(new NextRequest('http://localhost/api/checkout', { method: 'POST', body: JSON.stringify(body) }));

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.mocked(console.error).mockRestore?.();
  });

  it('requires a session', async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await post(validBody);

    expect(res.status).toBe(401);
    expect(mockCreateCheckoutOrder).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid input without creating anything', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1', name: 'María', email: 'maria@example.com' } });

    const res = await post({ ...validBody, items: [] });

    expect(res.status).toBe(400);
    expect(mockCreateCheckoutOrder).not.toHaveBeenCalled();
  });

  it('maps checkout errors (e.g. stock) to their status and message', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1', name: 'María', email: 'maria@example.com' } });
    mockCreateCheckoutOrder.mockRejectedValue(new CheckoutError('INSUFFICIENT_STOCK', 'Solo quedan 1 de Taco al Pastor', 409));

    const res = await post(validBody);

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'Solo quedan 1 de Taco al Pastor', code: 'INSUFFICIENT_STOCK' });
  });

  it('creates the order with the session name and email', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1', name: 'María', email: 'maria@example.com' } });
    mockCreateCheckoutOrder.mockResolvedValue({
      order: { id: 7, orderNumber: 'PK-12345', customerName: 'María', customerEmail: 'maria@example.com', phone: '5512345678', total: 58, deliveryAddress: null },
      priced: { lines: [{ productId: 1, name: 'Taco al Pastor', quantity: 2, price: 25 }], subtotal: 50, iva: 8, deliveryCost: 0, discount: 0, total: 58 },
    });

    const res = await post({ ...validBody, customerEmail: 'otro@example.com', total: 1 });

    expect(res.status).toBe(201);
    expect(mockCreateCheckoutOrder).toHaveBeenCalledWith(
      expect.objectContaining({ items: [{ productId: 1, quantity: 2 }] }),
      { name: 'María', email: 'maria@example.com' }
    );
    expect(await res.json()).toMatchObject({ orderNumber: 'PK-12345', total: 58, items: [{ name: 'Taco al Pastor', quantity: 2, price: 25 }] });
  });
});
