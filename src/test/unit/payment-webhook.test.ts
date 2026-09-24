import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

// Real SQLite database (same tables as the app) so the idempotency is exercised for real
const dbFile = path.join(os.tmpdir(), `porkyrios-webhook-${process.pid}-${Date.now()}.db`);

vi.mock('@/db', async () => {
  const { createClient } = await import('@libsql/client');
  const { drizzle } = await import('drizzle-orm/libsql');
  const schema = await import('@/db/schema');
  const client = createClient({ url: `file:${dbFile}` });
  return { db: drizzle(client, { schema }), client };
});

const mockGetPaymentStatus = vi.fn();
vi.mock('@/lib/payment-service', () => ({ getPaymentStatus: mockGetPaymentStatus }));

const { client } = (await import('@/db')) as any;
const { applyPaymentUpdate } = await import('@/lib/payment-processing');
const { POST } = await import('@/app/api/payment/webhook/route');

const DDL = [
  `CREATE TABLE products (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, name text NOT NULL, description text,
    price real NOT NULL, category_id integer, stock integer DEFAULT 0, image text, image_public_id text,
    image_size integer, active integer DEFAULT true, featured integer DEFAULT false, created_at text NOT NULL, updated_at text)`,
  `CREATE TABLE orders (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, order_number text NOT NULL, customer_name text NOT NULL,
    customer_email text NOT NULL, phone text NOT NULL, delivery_address text, postal_code text, total real NOT NULL,
    status text DEFAULT 'preparing' NOT NULL, created_at text NOT NULL, updated_at text NOT NULL)`,
  `CREATE TABLE order_items (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, order_id integer, product_id integer,
    quantity integer NOT NULL, price real NOT NULL)`,
  `CREATE TABLE inventory_movements (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, product_id integer NOT NULL,
    type text NOT NULL, quantity integer NOT NULL, previous_stock integer NOT NULL, new_stock integer NOT NULL,
    reason text, order_id integer, created_by text, created_at integer NOT NULL)`,
];

async function reset(orderStatus = 'pending_payment') {
  for (const t of ['inventory_movements', 'order_items', 'orders', 'products']) {
    await client.execute(`DROP TABLE IF EXISTS ${t}`);
  }
  for (const ddl of DDL) await client.execute(ddl);
  const now = new Date().toISOString();
  await client.execute({ sql: `INSERT INTO products (id, name, price, stock, created_at) VALUES (1, 'Taco al Pastor', 25, 10, ?), (2, 'Torta', 45, 1, ?)`, args: [now, now] });
  // total = (25*2 + 45*1) * 1.16 = 110.2
  await client.execute({
    sql: `INSERT INTO orders (id, order_number, customer_name, customer_email, phone, total, status, created_at, updated_at)
          VALUES (7, 'PK-12345', 'María', 'maria@example.com', '5512345678', 110.2, ?, ?, ?)`,
    args: [orderStatus, now, now],
  });
  await client.execute(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (7, 1, 2, 25), (7, 2, 1, 45)`);
}

const stock = async () =>
  Object.fromEntries((await client.execute('SELECT id, stock FROM products ORDER BY id')).rows.map((r: any) => [r.id, r.stock]));
const orderStatus = async () => (await client.execute('SELECT status FROM orders WHERE id = 7')).rows[0].status;
const movements = async () => (await client.execute('SELECT product_id, type, quantity, previous_stock, new_stock, order_id FROM inventory_movements ORDER BY id')).rows;

const approved = { orderNumber: 'PK-12345', paymentId: 'pay_1', status: 'approved', amount: 110.2 };

afterAll(() => {
  client.close();
  fs.rmSync(dbFile, { force: true });
});

describe('applyPaymentUpdate', () => {
  beforeEach(async () => {
    await reset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('approved payment moves the order to preparing, decrements stock and records sale movements', async () => {
    await expect(applyPaymentUpdate(approved)).resolves.toBe('paid');

    expect(await orderStatus()).toBe('preparing');
    expect(await stock()).toEqual({ 1: 8, 2: 0 });
    const rows = await movements();
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ product_id: 1, type: 'sale', quantity: 2, previous_stock: 10, new_stock: 8, order_id: 7 });
  });

  it('a repeated approved notification does not decrement stock again', async () => {
    await applyPaymentUpdate(approved);

    await expect(applyPaymentUpdate(approved)).resolves.toBe('already_processed');
    await expect(applyPaymentUpdate(approved)).resolves.toBe('already_processed');

    expect(await stock()).toEqual({ 1: 8, 2: 0 });
    expect(await movements()).toHaveLength(2);
  });

  it('does not confirm when the paid amount is lower than the order total', async () => {
    await expect(applyPaymentUpdate({ ...approved, amount: 1 })).resolves.toBe('amount_mismatch');

    expect(await orderStatus()).toBe('pending_payment');
    expect(await stock()).toEqual({ 1: 10, 2: 1 });
  });

  it('a late pending or rejected notification does not undo a paid order', async () => {
    await applyPaymentUpdate(approved);

    await applyPaymentUpdate({ ...approved, status: 'pending' });
    await applyPaymentUpdate({ ...approved, status: 'rejected' });

    expect(await orderStatus()).toBe('preparing');
  });

  it('a rejected attempt followed by an approved one still pays the order once', async () => {
    await applyPaymentUpdate({ ...approved, paymentId: 'pay_0', status: 'rejected' });
    expect(await orderStatus()).toBe('cancelled');

    await expect(applyPaymentUpdate(approved)).resolves.toBe('paid');
    expect(await orderStatus()).toBe('preparing');
    expect(await stock()).toEqual({ 1: 8, 2: 0 });
  });

  it('never leaves stock negative', async () => {
    await client.execute('UPDATE products SET stock = 0 WHERE id = 2');

    await applyPaymentUpdate(approved);

    expect((await stock())[2]).toBe(0);
  });

  it('does not reset an order the admin already advanced', async () => {
    await reset('ready');

    await expect(applyPaymentUpdate(approved)).resolves.toBe('already_processed');
    expect(await orderStatus()).toBe('ready');
    expect(await stock()).toEqual({ 1: 10, 2: 1 });
  });
});

describe('refunds', () => {
  const refunded = { ...approved, status: 'refunded' };

  beforeEach(async () => {
    await reset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('a refund cancels the order and puts the sold stock back with return movements', async () => {
    await applyPaymentUpdate(approved);
    await client.execute('UPDATE products SET stock = stock + 5 WHERE id = 1'); // restocked by the admin meanwhile

    await expect(applyPaymentUpdate(refunded)).resolves.toBe('refunded');

    expect(await orderStatus()).toBe('cancelled');
    expect(await stock()).toEqual({ 1: 15, 2: 1 });
    const returns = (await movements()).filter((m: any) => m.type === 'return');
    expect(returns).toHaveLength(2);
    expect(returns[0]).toMatchObject({ product_id: 1, quantity: 2, previous_stock: 13, new_stock: 15, order_id: 7 });
  });

  it('a repeated refund notification does not put stock back twice', async () => {
    await applyPaymentUpdate(approved);

    await applyPaymentUpdate(refunded);
    await applyPaymentUpdate(refunded);
    await applyPaymentUpdate({ ...refunded, status: 'charged_back' });

    expect(await stock()).toEqual({ 1: 10, 2: 1 });
    expect((await movements()).filter((m: any) => m.type === 'return')).toHaveLength(2);
  });

  it('restocks when the admin had already cancelled the paid order', async () => {
    await applyPaymentUpdate(approved);
    await client.execute("UPDATE orders SET status = 'cancelled' WHERE id = 7");

    await applyPaymentUpdate(refunded);

    expect(await stock()).toEqual({ 1: 10, 2: 1 });
  });

  it('treats a chargeback like a refund', async () => {
    await applyPaymentUpdate(approved);

    await expect(applyPaymentUpdate({ ...approved, status: 'charged_back' })).resolves.toBe('refunded');

    expect(await orderStatus()).toBe('cancelled');
    expect(await stock()).toEqual({ 1: 10, 2: 1 });
  });

  it('does not add stock for an order that was never paid', async () => {
    await applyPaymentUpdate(refunded);

    expect(await orderStatus()).toBe('cancelled');
    expect(await stock()).toEqual({ 1: 10, 2: 1 });
    expect(await movements()).toHaveLength(0);
  });

  it('only puts back what the sale actually removed when stock had run out', async () => {
    await client.execute('UPDATE products SET stock = 0 WHERE id = 2'); // Torta sold out before payment
    await applyPaymentUpdate(approved); // Torta: 0 -> 0 (nothing removed)

    await applyPaymentUpdate(refunded);

    expect(await stock()).toEqual({ 1: 10, 2: 0 });
    expect((await movements()).filter((m: any) => m.type === 'return')).toHaveLength(1);
  });
});

describe('POST /api/payment/webhook', () => {
  const notify = () =>
    POST(new NextRequest('http://localhost/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({ type: 'payment', data: { id: 'pay_1' } }),
    }));

  beforeEach(async () => {
    await reset();
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('processes a notification by re-fetching the payment, and repeated notifications are no-ops', async () => {
    mockGetPaymentStatus.mockResolvedValue({ id: 'pay_1', external_reference: 'PK-12345', status: 'approved', transaction_amount: 110.2 });

    expect((await notify()).status).toBe(200);
    expect((await notify()).status).toBe(200);

    expect(mockGetPaymentStatus).toHaveBeenCalledWith('pay_1');
    expect(await orderStatus()).toBe('preparing');
    expect(await stock()).toEqual({ 1: 8, 2: 0 });
    expect(await movements()).toHaveLength(2);
  });

  it('returns 500 on processing errors so MercadoPago retries', async () => {
    mockGetPaymentStatus.mockRejectedValue(new Error('MercadoPago unavailable'));

    expect((await notify()).status).toBe(500);
    expect(await orderStatus()).toBe('pending_payment');
  });
});

// Runs last: with a local SQLite file the losing transactions fail with SQLITE_BUSY
// (the webhook answers 500 and MercadoPago retries; the retry is a no-op) and the
// driver keeps their connections open, which would lock the tables for later tests.
describe('simultaneous notifications', () => {
  beforeEach(async () => {
    await reset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('only one of several simultaneous approved notifications decrements stock', async () => {
    const results = await Promise.allSettled([applyPaymentUpdate(approved), applyPaymentUpdate(approved), applyPaymentUpdate(approved)]);

    expect(results.filter((r) => r.status === 'fulfilled' && r.value === 'paid')).toHaveLength(1);
    expect(await stock()).toEqual({ 1: 8, 2: 0 });
    expect(await movements()).toHaveLength(2);
  });
});
