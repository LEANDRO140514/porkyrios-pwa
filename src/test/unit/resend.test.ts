import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockSend = vi.fn();
const ResendMock = vi.fn(function () {
  return { emails: { send: mockSend } };
});

vi.mock('resend', () => ({ Resend: ResendMock }));

describe('sendEmail', () => {
  const originalKey = process.env.RESEND_API_KEY;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.RESEND_API_KEY = originalKey;
    vi.restoreAllMocks();
  });

  it('does not create a client on import or throw when RESEND_API_KEY is missing', async () => {
    delete process.env.RESEND_API_KEY;
    const { sendEmail } = await import('@/lib/resend');

    const result = await sendEmail({ to: 'a@example.com', subject: 'Hola', react: null as any });

    expect(ResendMock).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
  });

  it('creates the client lazily and sends when RESEND_API_KEY is set', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    mockSend.mockResolvedValue({ data: { id: 'email_1' }, error: null });
    const { sendEmail } = await import('@/lib/resend');

    expect(ResendMock).not.toHaveBeenCalled();

    const result = await sendEmail({ to: 'a@example.com', subject: 'Hola', react: null as any });

    expect(ResendMock).toHaveBeenCalledWith('re_test_key');
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ to: 'a@example.com', subject: 'Hola' }));
    expect(result.success).toBe(true);
  });
});
