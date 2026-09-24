import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendOrderStatusEmail } from '@/lib/notifications';

describe('sendOrderStatusEmail', () => {
  const data = {
    email: 'cliente@example.com',
    orderNumber: 'PK-12345',
    customerName: 'María García',
    status: 'preparing',
  };

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('posts the fields required by /api/emails/status-update with the admin bearer token', async () => {
    localStorage.setItem('bearer_token', 'token123');
    (global.fetch as any).mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });

    const result = await sendOrderStatusEmail(data);

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('/api/emails/status-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token123' },
      body: JSON.stringify(data),
    });
  });

  it('returns false when the API responds with an error', async () => {
    (global.fetch as any).mockResolvedValue({ ok: false, text: () => Promise.resolve('Error al enviar email') });

    await expect(sendOrderStatusEmail(data)).resolves.toBe(false);
  });

  it('returns false instead of throwing on network errors', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    await expect(sendOrderStatusEmail(data)).resolves.toBe(false);
  });
});
