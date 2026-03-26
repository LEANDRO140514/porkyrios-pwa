import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CartPage from "@/app/cart/page";
import { CartProvider } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  useSession: vi.fn(),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Next Image
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

describe('CartPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Default: authenticated user
    useSession.mockReturnValue({
      data: {
        user: {
          id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      isPending: false,
    });
  });

  const renderCartPage = () => {
    return render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );
  };

  describe('Authentication', () => {
    it('should show loading spinner while checking session', () => {
      (useSession as any).mockReturnValue({ data: null, isPending: true, refetch: vi.fn() });
      render(<CartPage />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should redirect to login if not authenticated', () => {
      (useSession as any).mockReturnValue({ data: null, isPending: false, refetch: vi.fn() });
      render(<CartPage />);
      expect(useRouter().push).toHaveBeenCalledWith('/login');
    });

    it('should render cart page when authenticated', async () => {
      renderCartPage();
      
      // Should show empty cart state when no items
      await waitFor(() => {
        expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
      });
    });
  });

  describe('Empty Cart State', () => {
    it('should show empty cart message when cart is empty', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
        expect(screen.getByText('Agrega productos del menú para comenzar tu pedido')).toBeInTheDocument();
      });
    });

    it('should have "Ver Menú" button in empty state', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Ver Menú' })).toBeInTheDocument();
      });
    });

    it('should navigate to menu when "Ver Menú" clicked', async () => {
      const user = userEvent.setup();
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
      });

      const menuButton = screen.getByRole('button', { name: 'Ver Menú' });
      await user.click(menuButton);

      expect(useRouter().push).toHaveBeenCalledWith('/menu');
    });
  });

  describe('Cart with Items', () => {
    beforeEach(() => {
      // Pre-populate cart
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

    it('should display all cart items', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
        expect(screen.getByText('Torta de Jamón')).toBeInTheDocument();
      });
    });

    it('should display correct item count', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('3 producto(s)')).toBeInTheDocument();
      });
    });

    it('should display item prices', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('$25.00')).toBeInTheDocument();
        expect(screen.getByText('$45.00')).toBeInTheDocument();
      });
    });

    it('should display item quantities', async () => {
      renderCartPage();

      await waitFor(() => {
        const inputs = screen.getAllByRole('spinbutton');
        expect(inputs[0]).toHaveValue(2);
        expect(inputs[1]).toHaveValue(1);
      });
    });

    it('should show low stock warning', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('⚠️ Solo quedan 5 disponibles')).toBeInTheDocument();
      });
    });
  });

  describe('Quantity Controls', () => {
    beforeEach(() => {
      const mockCart = [
        {
          id: 1,
          name: 'Taco al Pastor',
          price: 25.0,
          stock: 10,
          quantity: 3,
          categoryId: 1,
          image: null,
        },
      ];
      localStorage.setItem('porkyrios_cart', JSON.stringify(mockCart));
    });

    it('should increment quantity when plus button clicked', async () => {
      const user = userEvent.setup();
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const plusButtons = screen.getAllByRole('button', { name: '' }).filter(btn => {
        const svg = btn.querySelector('svg');
        return svg?.classList.contains('lucide-plus');
      });

      await user.click(plusButtons[0]);

      await waitFor(() => {
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(4);
      });
    });

    it('should decrement quantity when minus button clicked', async () => {
      const user = userEvent.setup();
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const minusButtons = screen.getAllByRole('button', { name: '' }).filter(btn => {
        const svg = btn.querySelector('svg');
        return svg?.classList.contains('lucide-minus');
      });

      await user.click(minusButtons[0]);

      await waitFor(() => {
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(2);
      });
    });

    it('should update quantity with manual input', async () => {
      const user = userEvent.setup();
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '5');

      await waitFor(() => {
        expect(input).toHaveValue(5);
      });
    });

    it('should disable increment when at max stock', async () => {
      // Set quantity to max stock
      const mockCart = [
        {
          id: 1,
          name: 'Taco al Pastor',
          price: 25.0,
          stock: 10,
          quantity: 10,
          categoryId: 1,
          image: null,
        },
      ];
      localStorage.setItem('porkyrios_cart', JSON.stringify(mockCart));

      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const plusButtons = screen.getAllByRole('button', { name: '' }).filter(btn => {
        const svg = btn.querySelector('svg');
        return svg?.classList.contains('lucide-plus');
      });

      expect(plusButtons[0]).toBeDisabled();
    });

    it('should show trash icon when quantity is 1', async () => {
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

      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const trashIcons = document.querySelectorAll('.lucide-trash-2');
      expect(trashIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Remove Items', () => {
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

    it('should remove item when remove button clicked', async () => {
      const user = userEvent.setup();
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
        expect(screen.getByText('Torta de Jamón')).toBeInTheDocument();
      });

      // Find all trash buttons (exclude the "Vaciar" button in header)
      const removeButtons = screen.getAllByRole('button', { name: '' }).filter(btn => {
        const svg = btn.querySelector('.lucide-trash-2');
        return svg && btn.closest('.bg-red-600');
      });

      await user.click(removeButtons[0]);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should clear all items when "Vaciar" clicked', async () => {
      const user = userEvent.setup();
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /Vaciar/i });
      await user.click(clearButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Carrito vaciado');
        expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
      });
    });
  });

  describe('Delivery Method', () => {
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

    it('should default to pickup method', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      // Pickup should be selected (has checkmark)
      const pickupButton = screen.getByText('🏪 Recoger').closest('button');
      expect(pickupButton).toHaveClass('border-[#FF6B35]');
    });

    it('should switch to delivery method', async () => {
      const user = userEvent.setup();
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const deliveryButton = screen.getByText('🏍️ Delivery').closest('button');
      await user.click(deliveryButton!);

      await waitFor(() => {
        expect(deliveryButton).toHaveClass('border-[#FF6B35]');
      });
    });

    it('should show delivery cost when delivery selected', async () => {
      const user = userEvent.setup();
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const deliveryButton = screen.getByText('🏍️ Delivery').closest('button');
      await user.click(deliveryButton!);

      await waitFor(() => {
        expect(screen.getByText('Envío')).toBeInTheDocument();
        expect(screen.getByText('$35.00')).toBeInTheDocument();
      });
    });

    it('should not show delivery cost when pickup selected', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      expect(screen.queryByText('Envío')).not.toBeInTheDocument();
    });

    it('should show correct info message for delivery', async () => {
      const user = userEvent.setup();
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const deliveryButton = screen.getByText('🏍️ Delivery').closest('button');
      await user.click(deliveryButton!);

      await waitFor(() => {
        expect(screen.getByText(/Tu pedido será entregado a domicilio en 15-20 minutos/i)).toBeInTheDocument();
      });
    });

    it('should show correct info message for pickup', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      expect(screen.getByText(/Recoge tu pedido en nuestro local en 10-15 minutos/i)).toBeInTheDocument();
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

    it('should display order summary', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
      });
    });

    it('should calculate subtotal correctly', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      // Subtotal = (25 * 2) + (45 * 1) = 95
      const subtotalElements = screen.getAllByText('$95.00');
      expect(subtotalElements.length).toBeGreaterThan(0);
    });

    it('should calculate tax (16%) correctly', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      // Tax = 95 * 0.16 = 15.20
      expect(screen.getByText('IVA (16%)')).toBeInTheDocument();
      expect(screen.getByText('$15.20')).toBeInTheDocument();
    });

    it('should calculate total without delivery', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      // Total = 95 + 15.20 = 110.20
      expect(screen.getByText('$110.20')).toBeInTheDocument();
    });

    it('should calculate total with delivery', async () => {
      const user = userEvent.setup();
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const deliveryButton = screen.getByText('🏍️ Delivery').closest('button');
      await user.click(deliveryButton!);

      await waitFor(() => {
        // Total = 95 + 15.20 + 35 = 145.20
        expect(screen.getByText('$145.20')).toBeInTheDocument();
      });
    });

    it('should show item breakdown in summary', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      expect(screen.getByText('Taco al Pastor x2')).toBeInTheDocument();
      expect(screen.getByText('Torta de Jamón x1')).toBeInTheDocument();
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

    it('should navigate to menu when "Seguir Comprando" clicked', async () => {
      const user = userEvent.setup();
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const continueButton = screen.getByRole('button', { name: /Seguir Comprando/i });
      await user.click(continueButton);

      expect(useRouter().push).toHaveBeenCalledWith('/menu');
    });

    it('should navigate to payment when "Proceder al Pago" clicked', async () => {
      const user = userEvent.setup();
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const checkoutButton = screen.getByRole('button', { name: /Proceder al Pago/i });
      await user.click(checkoutButton);

      expect(useRouter().push).toHaveBeenCalledWith('/payment');
    });

    it('should not navigate to payment if cart is empty', async () => {
      localStorage.setItem('porkyrios_cart', JSON.stringify([]));
      
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /Proceder al Pago/i })).not.toBeInTheDocument();
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

    it('should display cart icon in header', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('🛒 Mi Carrito')).toBeInTheDocument();
      });
    });

    it('should display delivery method section', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('🚚 Método de Entrega')).toBeInTheDocument();
      });
    });

    it('should display reservation info', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('💡 Los productos se reservarán al confirmar el pago')).toBeInTheDocument();
      });
    });

    it('should display delivery images', async () => {
      renderCartPage();

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });
    });
  });
});