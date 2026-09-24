import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetSession = vi.fn();
const dbUsed = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: mockGetSession } } }));
// Any database access throws, so a handler that gets past the guard fails with 500, never 401/403
vi.mock('@/db', () => ({
  db: new Proxy({}, {
    get() {
      dbUsed();
      throw new Error('db should not be reached');
    },
  }),
}));

type Handler = (req: NextRequest, ctx?: unknown) => Promise<Response>;
type Route = Record<string, Handler>;

const routes: Record<string, () => Promise<unknown>> = {
  'analytics/overview': () => import('@/app/api/analytics/overview/route'),
  'analytics/revenue': () => import('@/app/api/analytics/revenue/route'),
  'analytics/sales': () => import('@/app/api/analytics/sales/route'),
  'analytics/top-products': () => import('@/app/api/analytics/top-products/route'),
  inventory: () => import('@/app/api/inventory/route'),
  'inventory/adjust': () => import('@/app/api/inventory/adjust/route'),
  'inventory/low-stock': () => import('@/app/api/inventory/low-stock/route'),
  'inventory/movements': () => import('@/app/api/inventory/movements/route'),
  'inventory/report': () => import('@/app/api/inventory/report/route'),
  'ghl/settings': () => import('@/app/api/ghl/settings/route'),
  'ghl/test': () => import('@/app/api/ghl/test/route'),
  'reviews/admin': () => import('@/app/api/reviews/admin/route'),
  'reviews/admin/stats': () => import('@/app/api/reviews/admin/stats/route'),
  'reviews/admin/[id]': () => import('@/app/api/reviews/admin/[id]/route'),
  upload: () => import('@/app/api/upload/route'),
  storage: () => import('@/app/api/storage/route'),
  'notifications/send': () => import('@/app/api/notifications/send/route'),
  coupons: () => import('@/app/api/coupons/route'),
  'postal-codes': () => import('@/app/api/postal-codes/route'),
  categories: () => import('@/app/api/categories/route'),
  products: () => import('@/app/api/products/route'),
  'products/[id]/featured': () => import('@/app/api/products/[id]/featured/route'),
  'promotional-banner': () => import('@/app/api/promotional-banner/route'),
  'promotional-banner/[id]': () => import('@/app/api/promotional-banner/[id]/route'),
  settings: () => import('@/app/api/settings/route'),
  orders: () => import('@/app/api/orders/route'),
};

const adminOnly: [string, string, string?][] = [
  ['analytics/overview', 'GET'],
  ['analytics/revenue', 'GET'],
  ['analytics/sales', 'GET'],
  ['analytics/top-products', 'GET'],
  ['inventory', 'PUT'],
  ['inventory/adjust', 'POST'],
  ['inventory/low-stock', 'GET'],
  ['inventory/movements', 'GET'],
  ['inventory/movements', 'POST'],
  ['inventory/report', 'GET'],
  ['ghl/settings', 'GET'],
  ['ghl/settings', 'POST'],
  ['ghl/test', 'POST'],
  ['reviews/admin', 'GET'],
  ['reviews/admin/stats', 'GET'],
  ['reviews/admin/[id]', 'PUT'],
  ['upload', 'POST'],
  ['upload', 'DELETE'],
  ['storage', 'GET'],
  ['notifications/send', 'POST'],
  ['coupons', 'GET'],
  ['coupons', 'POST'],
  ['coupons', 'PUT'],
  ['coupons', 'DELETE'],
  ['postal-codes', 'GET'],
  ['postal-codes', 'POST'],
  ['postal-codes', 'PUT'],
  ['postal-codes', 'DELETE'],
  ['categories', 'POST'],
  ['categories', 'PUT'],
  ['categories', 'DELETE'],
  ['products', 'POST'],
  ['products', 'PUT'],
  ['products', 'DELETE'],
  ['products/[id]/featured', 'PUT'],
  ['promotional-banner', 'POST'],
  ['promotional-banner/[id]', 'PUT'],
  ['promotional-banner/[id]', 'DELETE'],
  ['settings', 'PUT'],
  ['settings', 'GET', '?key=ghl_api_key'],
  ['orders', 'PUT'],
  ['orders', 'DELETE'],
  ['orders', 'GET'],
];

const publicCalls: [string, string, string][] = [
  ['categories', 'GET', ''],
  ['products', 'GET', ''],
  ['promotional-banner', 'GET', ''],
  ['settings', 'GET', '?key=tracking_section_enabled'],
  ['orders', 'GET', '?orderNumber=PK-12345'],
  ['orders', 'GET', '?id=1'],
];

async function call(route: string, method: string, query = '') {
  const mod = (await routes[route]()) as Route;
  const handler = mod[method];
  const req = new NextRequest(`http://localhost/api/${route}${query}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: method === 'GET' ? undefined : '{}',
  });
  return handler(req, { params: Promise.resolve({ id: '1' }) });
}

describe('admin-only API routes', () => {
  const originalAdmins = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    process.env.ADMIN_EMAILS = 'admin@porkyrios.com';
  });

  afterEach(() => {
    process.env.ADMIN_EMAILS = originalAdmins;
    vi.restoreAllMocks();
  });

  it.each(adminOnly)('%s %s%s returns 401 without a session and never reaches the database', async (route, method, query) => {
    mockGetSession.mockResolvedValue(null);

    const res = await call(route, method, query);

    expect(res.status).toBe(401);
    expect(dbUsed).not.toHaveBeenCalled();
  });

  it.each(adminOnly)('%s %s%s returns 403 for a non-admin session', async (route, method, query) => {
    mockGetSession.mockResolvedValue({ user: { id: 'u2', email: 'cliente@example.com' } });

    const res = await call(route, method, query);

    expect(res.status).toBe(403);
    expect(dbUsed).not.toHaveBeenCalled();
  });

  it.each(adminOnly)('%s %s%s lets an admin session through the guard', async (route, method, query) => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1', email: 'admin@porkyrios.com' } });

    const res = await call(route, method, query);

    expect([401, 403]).not.toContain(res.status);
  });

  it.each(publicCalls)('%s %s%s stays public', async (route, method, query) => {
    mockGetSession.mockResolvedValue(null);

    const res = await call(route, method, query);

    expect([401, 403]).not.toContain(res.status);
    expect(mockGetSession).not.toHaveBeenCalled();
  });
});
