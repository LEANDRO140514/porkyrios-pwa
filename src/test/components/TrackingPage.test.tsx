import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TrackingPage from '@/app/tracking/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams('order=PK-12345'),
}));
vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <img alt={alt} /> }));
vi.mock('@/lib/auth-client', () => ({
  useSession: () => ({ data: { user: { id: 'u1', email: 'maria@example.com' } }, isPending: false }),
}));
vi.mock('@/lib/last-order', () => ({ readLastOrder: () => ({ orderNumber: 'PK-12345', phone: '5512345678' }) }));
vi.mock('@/components/NotificationSettings', () => ({ default: () => null }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

function mockOrder(status: string) {
  global.fetch = vi.fn((url: string) => {
    if (url.startsWith('/api/settings')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ value: 'true' }) });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        order: {
          id: 7, orderNumber: 'PK-12345', customerName: 'María', customerEmail: 'maria@example.com',
          phone: '5512345678', deliveryAddress: null, total: 116, status,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        },
        items: [{ id: 1, productName: 'Taco al Pastor', quantity: 4, price: 25 }],
      }),
    });
  }) as any;
}

describe('TrackingPage status display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['cooking', 'Cocinando', 'Tu pedido está en la parrilla'],
    ['packing', 'Empacando', 'Estamos empacando tu pedido'],
    ['completed', 'Completado', 'Tu pedido fue entregado. ¡Buen provecho!'],
    ['preparing', 'En Preparación', 'Estamos preparando tu pedido con cuidado'],
  ])('renders the %s status', async (status, label, description) => {
    mockOrder(status);
    render(<TrackingPage />);

    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: label })).toBeInTheDocument());
    expect(screen.getAllByText(description).length).toBeGreaterThan(0);
    expect(screen.getByText('Taco al Pastor x4')).toBeInTheDocument();
  });

  it('does not break on an unknown status', async () => {
    mockOrder('some_new_status');
    render(<TrackingPage />);

    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Actualizando estado' })).toBeInTheDocument());
    expect(screen.getByText('PK-12345')).toBeInTheDocument();
    expect(screen.getByText('Taco al Pastor x4')).toBeInTheDocument();
  });

  it('marks earlier steps as done in the timeline', async () => {
    mockOrder('packing');
    render(<TrackingPage />);

    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Empacando' })).toBeInTheDocument());
    expect(screen.getByText('70%')).toBeInTheDocument();
    // Timeline lists the admin workflow steps
    for (const step of ['Pendiente de Pago', 'En Preparación', 'Cocinando', 'Listo', 'Completado']) {
      expect(screen.getAllByText(step).length).toBeGreaterThan(0);
    }
  });
});
