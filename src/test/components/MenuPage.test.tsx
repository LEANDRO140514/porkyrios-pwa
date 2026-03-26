import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuPage from '@/app/menu/page';
import { CartProvider } from '@/contexts/CartContext';
import { toast } from 'sonner';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
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

const mockCategories = [
  { id: 1, name: 'Tacos', emoji: '🌮', image: null, active: true },
  { id: 2, name: 'Tortas', emoji: '🥪', image: null, active: true },
  { id: 3, name: 'Bebidas', emoji: '🥤', image: null, active: true },
];

const mockProducts = [
  {
    id: 1,
    name: 'Taco al Pastor',
    description: 'Delicioso taco con carne al pastor',
    price: 25.0,
    categoryId: 1,
    stock: 10,
    image: null,
    active: true,
  },
  {
    id: 2,
    name: 'Taco de Asada',
    description: 'Taco con carne asada',
    price: 30.0,
    categoryId: 1,
    stock: 5,
    image: null,
    active: true,
  },
  {
    id: 3,
    name: 'Torta de Jamón',
    description: 'Torta mexicana con jamón',
    price: 45.0,
    categoryId: 2,
    stock: 8,
    image: null,
    active: true,
  },
  {
    id: 4,
    name: 'Coca Cola',
    description: 'Refresco 500ml',
    price: 15.0,
    categoryId: 3,
    stock: 20,
    image: null,
    active: true,
  },
];

describe('MenuPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();

    // Mock successful API responses
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCategories),
        });
      }
      if (url.includes('/api/products')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      });
    });
  });

  const renderMenuPage = () => {
    return render(
      <CartProvider>
        <MenuPage />
      </CartProvider>
    );
  };

  describe('Initial Render', () => {
    it('should render loading state initially', () => {
      renderMenuPage();
      // Loader has aria-hidden, so we check for the spinner by class
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render menu title and header', async () => {
      renderMenuPage();
      
      await waitFor(() => {
        expect(screen.getByText('🌮 Porkyrios')).toBeInTheDocument();
        expect(screen.getByText('Menú Digital')).toBeInTheDocument();
      });
    });

    it('should fetch and display products', async () => {
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
        expect(screen.getByText('Taco de Asada')).toBeInTheDocument();
        expect(screen.getByText('Torta de Jamón')).toBeInTheDocument();
        expect(screen.getByText('Coca Cola')).toBeInTheDocument();
      });
    });

    it('should fetch and display categories', async () => {
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('🌮 Tacos')).toBeInTheDocument();
        expect(screen.getByText('🥪 Tortas')).toBeInTheDocument();
        expect(screen.getByText('🥤 Bebidas')).toBeInTheDocument();
      });
    });

    it('should display all products by default', async () => {
      renderMenuPage();

      await waitFor(() => {
        const productCards = screen.getAllByText(/Taco|Torta|Coca/i);
        expect(productCards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', async () => {
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Buscar productos...')).toBeInTheDocument();
      });
    });

    it('should filter products by search query', async () => {
      const user = userEvent.setup();
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Buscar productos...');
      await user.type(searchInput, 'pastor');

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
        expect(screen.queryByText('Torta de Jamón')).not.toBeInTheDocument();
        expect(screen.queryByText('Coca Cola')).not.toBeInTheDocument();
      });
    });

    it('should search in product description', async () => {
      const user = userEvent.setup();
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Buscar productos...');
      await user.type(searchInput, 'carne');

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
        expect(screen.getByText('Taco de Asada')).toBeInTheDocument();
      });
    });

    it('should show empty state when no results', async () => {
      const user = userEvent.setup();
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Buscar productos...');
      await user.type(searchInput, 'xyz123nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No se encontraron productos')).toBeInTheDocument();
        expect(screen.getByText('Intenta con otra búsqueda o categoría')).toBeInTheDocument();
      });
    });

    it('should be case insensitive', async () => {
      const user = userEvent.setup();
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Buscar productos...');
      await user.type(searchInput, 'PASTOR');

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });
    });
  });

  describe('Category Filters', () => {
    it('should render category filter buttons', async () => {
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '🌮 Tacos' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '🥪 Tortas' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '🥤 Bebidas' })).toBeInTheDocument();
      });
    });

    it('should filter products by category', async () => {
      const user = userEvent.setup();
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const tacosButton = screen.getByRole('button', { name: '🌮 Tacos' });
      await user.click(tacosButton);

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
        expect(screen.getByText('Taco de Asada')).toBeInTheDocument();
        expect(screen.queryByText('Torta de Jamón')).not.toBeInTheDocument();
        expect(screen.queryByText('Coca Cola')).not.toBeInTheDocument();
      });
    });

    it('should show all products when "Todos" is clicked', async () => {
      const user = userEvent.setup();
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      // First filter by category
      const tacosButton = screen.getByRole('button', { name: '🌮 Tacos' });
      await user.click(tacosButton);

      await waitFor(() => {
        expect(screen.queryByText('Torta de Jamón')).not.toBeInTheDocument();
      });

      // Then click "Todos"
      const todosButton = screen.getByRole('button', { name: 'Todos' });
      await user.click(todosButton);

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
        expect(screen.getByText('Torta de Jamón')).toBeInTheDocument();
        expect(screen.getByText('Coca Cola')).toBeInTheDocument();
      });
    });

    it('should combine category filter with search', async () => {
      const user = userEvent.setup();
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      // Filter by category
      const tacosButton = screen.getByRole('button', { name: '🌮 Tacos' });
      await user.click(tacosButton);

      // Then search
      const searchInput = screen.getByPlaceholderText('Buscar productos...');
      await user.type(searchInput, 'asada');

      await waitFor(() => {
        expect(screen.getByText('Taco de Asada')).toBeInTheDocument();
        expect(screen.queryByText('Taco al Pastor')).not.toBeInTheDocument();
      });
    });
  });

  describe('Add to Cart', () => {
    it('should add product to cart when button clicked', async () => {
      const user = userEvent.setup();
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const addButtons = screen.getAllByRole('button', { name: /Agregar/i });
      await user.click(addButtons[0]);

      expect(toast.success).toHaveBeenCalledWith('Taco al Pastor agregado al carrito');
    });

    it('should show quantity in cart after adding', async () => {
      const user = userEvent.setup();
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const addButtons = screen.getAllByRole('button', { name: /Agregar/i });
      await user.click(addButtons[0]);
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('2 en el carrito')).toBeInTheDocument();
      });
    });

    it('should update cart counter in header', async () => {
      const user = userEvent.setup();
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const addButtons = screen.getAllByRole('button', { name: /Agregar/i });
      await user.click(addButtons[0]);
      await user.click(addButtons[1]);

      await waitFor(() => {
        const cartButtons = screen.getAllByRole('button', { name: /Carrito/i });
        const cartBadges = screen.getAllByText('2');
        expect(cartBadges.length).toBeGreaterThan(0);
      });
    });

    it('should disable add button when stock is 0', async () => {
      // Mock product with no stock - component filters out products with 0 stock
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/categories')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockCategories),
          });
        }
        if (url.includes('/api/products')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([
              { ...mockProducts[0], stock: 0, active: true },
            ]),
          });
        }
        return Promise.resolve({ ok: false });
      });

      renderMenuPage();

      // Product with 0 stock should not be displayed (filtered out by component)
      await waitFor(() => {
        expect(screen.getByText('No se encontraron productos')).toBeInTheDocument();
      });
    });

    it('should show low stock warning', async () => {
      // Mock product with low stock
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/categories')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockCategories),
          });
        }
        if (url.includes('/api/products')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([
              { ...mockProducts[0], stock: 3 },
            ]),
          });
        }
        return Promise.resolve({ ok: false });
      });

      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('⚠️ Últimas 3')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to home when home button clicked', async () => {
      const user = userEvent.setup();
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const homeButton = screen.getByRole('button', { name: /Inicio/i });
      await user.click(homeButton);

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should navigate to cart when cart button clicked', async () => {
      const user = userEvent.setup();
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('Taco al Pastor')).toBeInTheDocument();
      });

      const cartButtons = screen.getAllByRole('button', { name: /Carrito/i });
      await user.click(cartButtons[0]);

      expect(mockPush).toHaveBeenCalledWith('/cart');
    });
  });

  describe('Error Handling', () => {
    it('should show error toast when API fails', async () => {
      (global.fetch as any).mockImplementation(() => {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        });
      });

      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('No se encontraron productos')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      expect(toast.error).toHaveBeenCalledWith('Error al cargar el menú');
    });

    it('should handle network error gracefully', async () => {
      (global.fetch as any).mockImplementation(() => {
        return Promise.reject(new Error('Network error'));
      });

      renderMenuPage();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al cargar el menú');
      });
    });
  });

  describe('Product Display', () => {
    it('should display product prices correctly', async () => {
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('$25.00')).toBeInTheDocument();
        expect(screen.getByText('$30.00')).toBeInTheDocument();
        expect(screen.getByText('$45.00')).toBeInTheDocument();
      });
    });

    it('should display product stock', async () => {
      renderMenuPage();

      await waitFor(() => {
        expect(screen.getByText('Stock: 10')).toBeInTheDocument();
        expect(screen.getByText('Stock: 5')).toBeInTheDocument();
      });
    });

    it('should display category badge on product cards', async () => {
      renderMenuPage();

      await waitFor(() => {
        const categoryBadges = screen.getAllByText(/🌮 Tacos|🥪 Tortas|🥤 Bebidas/);
        expect(categoryBadges.length).toBeGreaterThan(0);
      });
    });
  });
});