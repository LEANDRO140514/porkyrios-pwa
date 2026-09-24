import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Each db.select() chain resolves to the next queued result; updates are recorded
const results: unknown[][] = [];
const updates: unknown[] = [];
const chain = (): any => {
  const value = results.shift() ?? [];
  const c: any = {
    from: () => c,
    where: () => c,
    limit: () => c,
    then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) => Promise.resolve(value).then(resolve, reject),
  };
  return c;
};
vi.mock('@/db', () => ({
  db: {
    select: () => chain(),
    update: () => ({ set: (v: unknown) => { updates.push(v); return { where: () => Promise.resolve() }; } }),
  },
}));

const mockCreatePreference = vi.fn();
vi.mock('@/lib/payment-service', () => ({ createPaymentPreference: mockCreatePreference }));

const { POST: preferencePOST } = await import('@/app/api/payment/preference/route');
const { POST: couponPOST } = await import('@/app/api/coupons/validate/route');

const order = {
  id: 7,
  orderNumber: 'PK-12345',
  customerName: 'María García',
  customerEmail: 'maria@example.com',
  phone: '5512345678',
  total: 116,
  status: 'pending_payment',
};

const req = (url: string, body: unknown) =>
  new NextRequest(`http://localhost${url}`, { method: 'POST', body: JSON.stringify(body) });

describe('POST /api/payment/preference', () => {
  beforeEach(() => {
    results.length = 0;
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockCreatePreference.mockResolvedValue({ id: 'pref_1', init_point: 'https://mp/checkout', sandbox_init_point: '', external_reference: 'PK-12345' });
  });

  it('charges the stored order total, ignoring any price from the browser', async () => {
    results.push([order]);

    const res = await preferencePOST(req('/api/payment/preference', { externalReference: 'PK-12345', price: 1, quantity: 1, payerEmail: 'x@y.com' }));

    expect(res.status).toBe(201);
    const pref = mockCreatePreference.mock.calls[0][0];
    expect(pref.items).toEqual([expect.objectContaining({ unit_price: 116, quantity: 1 })]);
    expect(pref.email).toBe('maria@example.com');
  });

  it('returns 404 for an unknown order and 409 for an order that is not pending payment', async () => {
    results.push([]);
    expect((await preferencePOST(req('/api/payment/preference', { externalReference: 'PK-00000' }))).status).toBe(404);

    results.push([{ ...order, status: 'preparing' }]);
    expect((await preferencePOST(req('/api/payment/preference', { externalReference: 'PK-12345' }))).status).toBe(409);

    expect(mockCreatePreference).not.toHaveBeenCalled();
  });
});

describe('POST /api/coupons/validate', () => {
  beforeEach(() => {
    results.length = 0;
    updates.length = 0;
  });

  it('computes the discount without counting a use', async () => {
    results.push([{ id: 3, code: 'PORKY10', type: 'percentage', value: 10, minPurchase: null, maxDiscount: null, usageLimit: 5, usedCount: 0, startDate: null, endDate: null, active: true }]);

    const res = await couponPOST(req('/api/coupons/validate', { code: 'porky10', subtotal: 100 }));

    expect(await res.json()).toMatchObject({ valid: true, discount: 10, finalTotal: 90 });
    expect(updates).toHaveLength(0);
  });
});
