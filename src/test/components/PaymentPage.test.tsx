/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentPage from '@/app/payment/page';
import { CartProvider } from '@/contexts/CartContext';
import { toast } from 'sonner';

// Setup localStorage mock before any test code
if (typeof localStorage === 'undefined') {
  class LocalStorageMock implements Storage {
    private store: Record<string, string> = {};

    get length(): number {
      return Object.keys(this.store).length;
    }

    clear(): void {
      this.store = {};
    }

    getItem(key: string): string | null {
      return this.store[key] || null;
    }

    setItem(key: string, value: string): void {
      this.store[key] = String(value);
    }

    removeItem(key: string): void {
      delete this.store[key];
    }

    key(index: number): string | null {
      const keys = Object.keys(this.store);
      return keys[index] || null;
    }
  }

  (global as any).localStorage = new LocalStorageMock();
}

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock auth client
const mockSession = {
  user: {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
  },
};

const mockUseSession = vi.fn();
vi.mock('@/lib/auth-client', () => ({
  useSession: () => mockUseSession(),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('PaymentPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockBack.mockClear();
    localStorage.clear();
    
    // Default: authenticated user
    mockUseSession.mockReturnValue({
      data: mockSession,
      isPending: false,
    });

    // Mock successful API responses
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/orders') && !url.includes('/items')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1, orderNumber: 'PK-12345' }),
        });
      }
      if (url.includes('/api/orders/items')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1 }),
        });
      }
      if (url.includes('/api/payment/preference')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            initPoint: 'https://mercadopago.com/checkout/test123' 
          }),
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderPaymentPage = () => {
    return render(
      <CartProvider>
        <PaymentPage />
      </CartProvider>
    );
  };

  describe('Authentication', () => {
    it('should show loading spinner while checking session', () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: true,
      });

      renderPaymentPage();

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should redirect to login if not authenticated', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
      });

      renderPaymentPage();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fpayment');
      }, { timeout: 5000 });
    });

    it('should render payment page when authenticated', async () => {
      // Add items to cart
      const mockCart = [
        {
          id: 1,
          name: 'Taco al Pastor',
          price: 25.0,
          stock: 10,
          quantity: 1,
          categoryId: 1,
          image: null,
        },
      ];
      localStorage.setItem('porkyrios_cart', JSON.stringify(mockCart));

      renderPaymentPage();

      // Wait for both session check AND cart to load
      await waitFor(() => {
        expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Now check for contact info section
      expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
    });
  });

  describe('Cart Validation', () => {
    it('should redirect to menu if cart is empty', async () => {
      localStorage.setItem('porkyrios_cart', JSON.stringify([]));

      renderPaymentPage();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/menu');
      }, { timeout: 5000 });
    });

    it('should not render if cart is empty', async () => {
      localStorage.setItem('porkyrios_cart', JSON.stringify([]));

      const { container } = renderPaymentPage();

      await waitFor(() => {
        expect(container.textContent).toBe('');
      }, { timeout: 5000 });
    });
  });

  describe('Order Summary', () => {
    beforeEach(() => {
      const mockCart = [
        {
          id: 1,
          name: 'Taco al Pastor',
          price: 25.0,
          stock: 10,
          quantity: 2,
          categoryId: 1,
          image: null,
        },
        {
          id: 2,
          name: 'Torta de Jamón',
          price: 45.0,
          stock: 5,
          quantity: 1,
          categoryId: 2,
          image: null,
        },
      ];
      localStorage.setItem('porkyrios_cart', JSON.stringify(mockCart));
    });

    it('should display order summary section', async () => {
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should display all cart items', async () => {
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
        expect(screen.getByText('Torta de Jamón')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should display item prices and quantities', async () => {
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('$25.00 x 2')).toBeInTheDocument();
        expect(screen.getByText('$45.00 x 1')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should calculate subtotal correctly', async () => {
      renderPaymentPage();

      await waitFor(() => {
        // Subtotal = (25 * 2) + (45 * 1) = 95
        expect(screen.getByText('$95.00')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should calculate IVA (16%) correctly', async () => {
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('IVA (16%)')).toBeInTheDocument();
        // IVA = 95 * 0.16 = 15.20
        expect(screen.getByText('$15.20')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should calculate total correctly', async () => {
      renderPaymentPage();

      await waitFor(() => {
        // Total = 95 + 15.20 = 110.20
        expect(screen.getByText('$110.20')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should display item subtotals', async () => {
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('$50.00')).toBeInTheDocument(); // 25 * 2
        expect(screen.getByText('$45.00')).toBeInTheDocument(); // 45 * 1
      }, { timeout: 5000 });
    });
  });

  describe('Contact Form', () => {
    beforeEach(() => {
      const mockCart = [
        {
          id: 1,
          name: 'Taco al Pastor',
          price: 25.0,
          stock: 10,
          quantity: 1,
          categoryId: 1,
          image: null,
        },
      ];
      localStorage.setItem('porkyrios_cart', JSON.stringify(mockCart));
    });

    it('should display contact information form', async () => {
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should pre-fill name from session', async () => {
      renderPaymentPage();

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Nombre') as HTMLInputElement;
        expect(nameInput.value).toBe('Test User');
        expect(nameInput).toBeDisabled();
      }, { timeout: 5000 });
    });

    it('should pre-fill email from session', async () => {
      renderPaymentPage();

      await waitFor(() => {
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        expect(emailInput.value).toBe('test@example.com');
        expect(emailInput).toBeDisabled();
      }, { timeout: 5000 });
    });

    it('should have phone input field', async () => {
      renderPaymentPage();

      await waitFor(() => {
        const phoneInput = screen.getByLabelText(/Teléfono/);
        expect(phoneInput).toBeInTheDocument();
        expect(phoneInput).not.toBeDisabled();
      }, { timeout: 5000 });
    });

    it('should show phone field as required', async () => {
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('*', { selector: 'span.text-destructive' })).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should format phone number (remove non-digits)', async () => {
      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const phoneInput = screen.getByLabelText(/Teléfono/) as HTMLInputElement;
      await user.type(phoneInput, '123-456-7890');

      expect(phoneInput.value).toBe('1234567890');
    });

    it('should limit phone to 15 characters', async () => {
      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const phoneInput = screen.getByLabelText(/Teléfono/) as HTMLInputElement;
      await user.type(phoneInput, '12345678901234567890');

      expect(phoneInput.value.length).toBeLessThanOrEqual(15);
    });

    it('should show minimum phone length hint', async () => {
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Mínimo 10 dígitos')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('MercadoPago Integration', () => {
    beforeEach(() => {
      const mockCart = [
        {
          id: 1,
          name: 'Taco al Pastor',
          price: 25.0,
          stock: 10,
          quantity: 1,
          categoryId: 1,
          image: null,
        },
      ];
      localStorage.setItem('porkyrios_cart', JSON.stringify(mockCart));
    });

    it('should display MercadoPago information', async () => {
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Pago seguro con MercadoPago')).toBeInTheDocument();
        expect(screen.getByText('Acepta tarjetas de crédito, débito, y más métodos de pago')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should have payment button with correct text', async () => {
      renderPaymentPage();

      await waitFor(() => {
        const payButton = screen.getByRole('button', { name: /Pagar \$29.00 con MercadoPago/i });
        expect(payButton).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should validate phone before payment', async () => {
      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const payButton = screen.getByRole('button', { name: /Pagar/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Por favor ingresa un teléfono válido (mínimo 10 dígitos)');
      }, { timeout: 5000 });
    });

    it('should require minimum 10 digits for phone', async () => {
      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const phoneInput = screen.getByLabelText(/Teléfono/);
      await user.type(phoneInput, '123456789'); // Only 9 digits

      const payButton = screen.getByRole('button', { name: /Pagar/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Por favor ingresa un teléfono válido (mínimo 10 dígitos)');
      }, { timeout: 5000 });
    });
  });

  describe('Payment Flow', () => {
    beforeEach(() => {
      const mockCart = [
        {
          id: 1,
          name: 'Taco al Pastor',
          price: 25.0,
          stock: 10,
          quantity: 2,
          categoryId: 1,
          image: null,
        },
      ];
      localStorage.setItem('porkyrios_cart', JSON.stringify(mockCart));

      // Mock window.open
      global.window.open = vi.fn();
      
      // Mock window.parent.postMessage
      Object.defineProperty(window, 'parent', {
        value: {
          postMessage: vi.fn(),
        },
        writable: true,
      });
    });

    it('should create order on payment submission', async () => {
      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const phoneInput = screen.getByLabelText(/Teléfono/);
      await user.type(phoneInput, '1234567890');

      const payButton = screen.getByRole('button', { name: /Pagar/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/orders',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }, { timeout: 5000 });
    });

    it('should create order items', async () => {
      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const phoneInput = screen.getByLabelText(/Teléfono/);
      await user.type(phoneInput, '1234567890');

      const payButton = screen.getByRole('button', { name: /Pagar/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/orders/items',
          expect.objectContaining({
            method: 'POST',
          })
        );
      }, { timeout: 5000 });
    });

    it('should create MercadoPago preference', async () => {
      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const phoneInput = screen.getByLabelText(/Teléfono/);
      await user.type(phoneInput, '1234567890');

      const payButton = screen.getByRole('button', { name: /Pagar/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/payment/preference',
          expect.objectContaining({
            method: 'POST',
          })
        );
      }, { timeout: 5000 });
    });

    it('should show loading state during payment', async () => {
      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const phoneInput = screen.getByLabelText(/Teléfono/);
      await user.type(phoneInput, '1234567890');

      const payButton = screen.getByRole('button', { name: /Pagar/i });
      await user.click(payButton);

      // Check for loading state
      await waitFor(() => {
        expect(screen.getByText('Procesando...')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should disable buttons during payment', async () => {
      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const phoneInput = screen.getByLabelText(/Teléfono/);
      await user.type(phoneInput, '1234567890');

      const payButton = screen.getByRole('button', { name: /Pagar/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(payButton).toBeDisabled();
        expect(screen.getByRole('button', { name: /Regresar/i })).toBeDisabled();
      }, { timeout: 5000 });
    });

    it('should open MercadoPago in new tab when not in iframe', async () => {
      // Mock not in iframe
      Object.defineProperty(window, 'self', { value: window, writable: true });
      Object.defineProperty(window, 'top', { value: window, writable: true });

      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const phoneInput = screen.getByLabelText(/Teléfono/);
      await user.type(phoneInput, '1234567890');

      const payButton = screen.getByRole('button', { name: /Pagar/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith(
          'https://mercadopago.com/checkout/test123',
          '_blank',
          'noopener,noreferrer'
        );
      }, { timeout: 5000 });
    });

    it('should clear cart after successful payment', async () => {
      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const phoneInput = screen.getByLabelText(/Teléfono/);
      await user.type(phoneInput, '1234567890');

      const payButton = screen.getByRole('button', { name: /Pagar/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      }, { timeout: 5000 });

      // Check cart is cleared
      const savedCart = JSON.parse(localStorage.getItem('porkyrios_cart') || '[]');
      expect(savedCart).toHaveLength(0);
    });

    it('should redirect to tracking after payment', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const phoneInput = screen.getByLabelText(/Teléfono/);
      await user.type(phoneInput, '1234567890');

      const payButton = screen.getByRole('button', { name: /Pagar/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      }, { timeout: 5000 });

      // Fast-forward time
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/tracking?order='));
      }, { timeout: 5000 });

      vi.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const mockCart = [
        {
          id: 1,
          name: 'Taco al Pastor',
          price: 25.0,
          stock: 10,
          quantity: 1,
          categoryId: 1,
          image: null,
        },
      ];
      localStorage.setItem('porkyrios_cart', JSON.stringify(mockCart));
    });

    it('should handle order creation error', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/orders')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Error al crear la orden' }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const phoneInput = screen.getByLabelText(/Teléfono/);
      await user.type(phoneInput, '1234567890');

      const payButton = screen.getByRole('button', { name: /Pagar/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al crear la orden');
      }, { timeout: 5000 });
    });

    it('should handle preference creation error', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/orders') && !url.includes('/items')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: 1, orderNumber: 'PK-12345' }),
          });
        }
        if (url.includes('/api/orders/items')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: 1 }),
          });
        }
        if (url.includes('/api/payment/preference')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Error al crear la preferencia' }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const phoneInput = screen.getByLabelText(/Teléfono/);
      await user.type(phoneInput, '1234567890');

      const payButton = screen.getByRole('button', { name: /Pagar/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al crear la preferencia');
      }, { timeout: 5000 });
    });

    it('should handle network error', async () => {
      (global.fetch as any).mockImplementation(() => {
        return Promise.reject(new Error('Network error'));
      });

      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const phoneInput = screen.getByLabelText(/Teléfono/);
      await user.type(phoneInput, '1234567890');

      const payButton = screen.getByRole('button', { name: /Pagar/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      }, { timeout: 5000 });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      const mockCart = [
        {
          id: 1,
          name: 'Taco al Pastor',
          price: 25.0,
          stock: 10,
          quantity: 1,
          categoryId: 1,
          image: null,
        },
      ];
      localStorage.setItem('porkyrios_cart', JSON.stringify(mockCart));
    });

    it('should have back button', async () => {
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
      }, { timeout: 5000 });

      expect(screen.getByRole('button', { name: /Regresar al Carrito/i })).toBeInTheDocument();
    });

    it('should navigate back when back button clicked', async () => {
      const user = userEvent.setup();
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const backButton = screen.getByRole('button', { name: /Regresar al Carrito/i });
      await user.click(backButton);

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('UI Elements', () => {
    beforeEach(() => {
      const mockCart = [
        {
          id: 1,
          name: 'Taco al Pastor',
          price: 25.0,
          stock: 10,
          quantity: 1,
          categoryId: 1,
          image: null,
        },
      ];
      localStorage.setItem('porkyrios_cart', JSON.stringify(mockCart));
    });

    it('should display credit card icon', async () => {
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
      }, { timeout: 5000 });

      const icons = document.querySelectorAll('.lucide-credit-card');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display shopping cart icon', async () => {
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
      }, { timeout: 5000 });

      const icons = document.querySelectorAll('.lucide-shopping-cart');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have proper form structure', async () => {
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      }, { timeout: 5000 });

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should display MercadoPago logo/icon', async () => {
      renderPaymentPage();

      await waitFor(() => {
        expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Check for SVG checkmark icon in MercadoPago section
      const svg = document.querySelector('svg path[d*="12 2C6.48"]');
      expect(svg).toBeInTheDocument();
    });
  });
});