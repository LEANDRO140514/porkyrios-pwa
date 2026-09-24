import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Minimal drizzle-like mock: each select() chain resolves to the next queued result
const results: unknown[][] = [];
const chain = (): any => {
  const value = results.shift() ?? [];
  const c: any = {
    from: () => c,
    where: () => c,
    leftJoin: () => c,
    limit: () => c,
    then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) => Promise.resolve(value).then(resolve, reject),
  };
  return c;
};
vi.mock('@/db', () => ({ db: { select: () => chain() } }));

const { normalizePhone, phonesMatch, findTrackedOrder } = await import('@/lib/order-tracking');
const { POST } = await import('@/app/api/orders/track/route');

const storedOrder = {
  id: 7,
  orderNumber: 'PK-12345',
  customerName: 'María García',
  customerEmail: 'maria@example.com',
  phone: '5512345678',
  deliveryAddress: null,
  postalCode: null,
  total: 116,
  status: 'preparing',
  createdAt: '2026-09-24T10:00:00.000Z',
  updatedAt: '2026-09-24T10:05:00.000Z',
};
const storedItems = [{ id: 1, productName: 'Taco al Pastor', quantity: 4, price: 25 }];

const post = (body: unknown) =>
  POST(new NextRequest('http://localhost/api/orders/track', { method: 'POST', body: JSON.stringify(body) }));

describe('phone matching', () => {
  it('ignores formatting and a country code prefix', () => {
    expect(normalizePhone('(55) 1234-5678')).toBe('5512345678');
    expect(phonesMatch('55 1234 5678', '5512345678')).toBe(true);
    expect(phonesMatch('+52 55 1234 5678', '5512345678')).toBe(true);
  });

  it('rejects different or empty phones', () => {
    expect(phonesMatch('5512345679', '5512345678')).toBe(false);
    expect(phonesMatch('', '5512345678')).toBe(false);
    expect(phonesMatch('5678', '5512345678')).toBe(false);
  });
});

describe('findTrackedOrder', () => {
  beforeEach(() => {
    results.length = 0;
  });

  it('returns the order and items when the phone matches', async () => {
    results.push([storedOrder], storedItems);

    const tracked = await findTrackedOrder('PK-12345', '55-1234-5678');

    expect(tracked?.order.orderNumber).toBe('PK-12345');
    expect(tracked?.items).toEqual(storedItems);
  });

  it('returns null for a wrong phone', async () => {
    results.push([storedOrder], storedItems);

    await expect(findTrackedOrder('PK-12345', '5599999999')).resolves.toBeNull();
  });

  it('returns null for a missing order', async () => {
    results.push([]);

    await expect(findTrackedOrder('PK-00000', '5512345678')).resolves.toBeNull();
  });
});

describe('POST /api/orders/track', () => {
  beforeEach(() => {
    results.length = 0;
  });

  it('requires both order number and phone', async () => {
    expect((await post({ orderNumber: 'PK-12345' })).status).toBe(400);
    expect((await post({ phone: '5512345678' })).status).toBe(400);
  });

  it('answers 404 for a wrong phone, same as for a missing order', async () => {
    results.push([storedOrder], storedItems);
    const wrongPhone = await post({ orderNumber: 'PK-12345', phone: '5500000000' });

    results.push([]);
    const missing = await post({ orderNumber: 'PK-00000', phone: '5512345678' });

    expect(wrongPhone.status).toBe(404);
    expect(missing.status).toBe(404);
    expect(await wrongPhone.json()).toEqual(await missing.json());
  });

  it('returns the order and items with the right phone', async () => {
    results.push([storedOrder], storedItems);

    const res = await post({ orderNumber: 'PK-12345', phone: '5512345678' });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.order).toMatchObject({ orderNumber: 'PK-12345', status: 'preparing' });
    expect(body.items).toEqual(storedItems);
  });
});
