import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSendEmail = vi.fn();
const mockGetOrderEmailData = vi.fn();

vi.mock('@/lib/resend', () => ({ sendEmail: mockSendEmail }));
vi.mock('@/lib/order-email', () => ({ getOrderEmailData: mockGetOrderEmailData }));
vi.mock('@/emails/OrderConfirmation', () => ({ default: (props: unknown) => props }));

const { POST } = await import('@/app/api/emails/order-confirmation/route');

const storedOrder = {
  orderNumber: 'PK-12345',
  customerName: 'María García',
  customerEmail: 'maria@example.com',
  total: 116,
  items: [{ name: 'Taco al Pastor', quantity: 4, price: 25 }],
};

const post = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/emails/order-confirmation', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  );

describe('POST /api/emails/order-confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSendEmail.mockResolvedValue({ success: true, data: { id: 'email_1' } });
  });

  it('returns 400 without an order number', async () => {
    const res = await post({});

    expect(res.status).toBe(400);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('returns 404 and sends nothing when the order does not exist', async () => {
    mockGetOrderEmailData.mockResolvedValue(null);

    const res = await post({ orderNumber: 'PK-99999', email: 'victim@example.com' });

    expect(res.status).toBe(404);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('sends to the stored email and ignores recipient, name and items from the request', async () => {
    mockGetOrderEmailData.mockResolvedValue(storedOrder);

    const res = await post({
      orderNumber: 'PK-12345',
      email: 'attacker@example.com',
      customerName: 'Click this link',
      items: [{ name: 'Phishing', quantity: 1, price: 0 }],
      total: 1,
      subtotal: 100,
      iva: 16,
      deliveryCost: 0,
      deliveryMethod: 'pickup',
    });

    expect(res.status).toBe(200);
    expect(mockGetOrderEmailData).toHaveBeenCalledWith('PK-12345');
    expect(mockSendEmail).toHaveBeenCalledTimes(1);

    const { to, react } = mockSendEmail.mock.calls[0][0];
    expect(to).toBe('maria@example.com');
    expect(react).toMatchObject({
      customerName: 'María García',
      items: storedOrder.items,
      total: 116,
      deliveryMethod: 'pickup',
    });
  });
});
