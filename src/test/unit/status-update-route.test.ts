import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetSession = vi.fn();
const mockSendEmail = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: mockGetSession } } }));
vi.mock('@/lib/resend', () => ({ sendEmail: mockSendEmail }));
vi.mock('@/emails/OrderStatusUpdate', () => ({ default: (props: unknown) => props }));

const { POST } = await import('@/app/api/emails/status-update/route');
const { isAdminEmail } = await import('@/lib/admin-auth');

const body = {
  email: 'cliente@example.com',
  orderNumber: 'PK-12345',
  customerName: 'María García',
  status: 'preparing',
};

const post = () =>
  POST(
    new NextRequest('http://localhost/api/emails/status-update', {
      method: 'POST',
      headers: { Authorization: 'Bearer token123' },
      body: JSON.stringify(body),
    })
  );

describe('isAdminEmail', () => {
  it('matches emails from the comma-separated list, ignoring case and spaces', () => {
    expect(isAdminEmail('Admin@Porkyrios.com', ' admin@porkyrios.com , otro@example.com')).toBe(true);
    expect(isAdminEmail('otro@example.com', 'admin@porkyrios.com,otro@example.com')).toBe(true);
  });

  it('denies everyone when the list is empty or the email is missing', () => {
    expect(isAdminEmail('admin@porkyrios.com', '')).toBe(false);
    expect(isAdminEmail('admin@porkyrios.com', undefined)).toBe(false);
    expect(isAdminEmail(null, 'admin@porkyrios.com')).toBe(false);
    expect(isAdminEmail('intruso@example.com', 'admin@porkyrios.com')).toBe(false);
  });
});

describe('POST /api/emails/status-update', () => {
  const originalAdmins = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    process.env.ADMIN_EMAILS = 'admin@porkyrios.com';
    mockSendEmail.mockResolvedValue({ success: true, data: { id: 'email_1' } });
  });

  afterEach(() => {
    process.env.ADMIN_EMAILS = originalAdmins;
    vi.restoreAllMocks();
  });

  it('returns 401 and sends nothing without a session', async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await post();

    expect(res.status).toBe(401);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('returns 403 and sends nothing for a logged-in non-admin', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u2', email: 'cliente@example.com' } });

    const res = await post();

    expect(res.status).toBe(403);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('sends the email for an admin session', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1', email: 'admin@porkyrios.com' } });

    const res = await post();

    expect(res.status).toBe(200);
    expect(mockGetSession).toHaveBeenCalledWith({ headers: expect.any(Headers) });
    expect(mockGetSession.mock.calls[0][0].headers.get('authorization')).toBe('Bearer token123');
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'cliente@example.com' }));
  });
});
