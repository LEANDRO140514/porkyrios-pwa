import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart, CartItem } from '@/contexts/CartContext';
import { toast } from 'sonner';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const mockProduct: Omit<CartItem, 'quantity'> = {
    id: 1,
    name: 'Test Product',
    price: 10.99,
    stock: 5,
    categoryId: 1,
    image: null,
  };

  const mockProduct2: Omit<CartItem, 'quantity'> = {
    id: 2,
    name: 'Test Product 2',
    price: 15.99,
    stock: 10,
    categoryId: 2,
    image: null,
  };

  describe('Initial State', () => {
    it('should initialize with empty cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.cart).toEqual([]);
      expect(result.current.getItemCount()).toBe(0);
      expect(result.current.getTotal()).toBe(0);
    });

    it('should initialize with pickup delivery method', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.deliveryMethod).toBe('pickup');
      expect(result.current.getDeliveryCost()).toBe(0);
    });

    it('should load cart from localStorage', async () => {
      const savedCart: CartItem[] = [
        { ...mockProduct, quantity: 2 },
      ];
      localStorage.setItem('porkyrios_cart', JSON.stringify(savedCart));

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      await waitFor(() => {
        expect(result.current.cart).toEqual(savedCart);
      });
    });
  });

  describe('addToCart', () => {
    it('should add new product to cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0]).toEqual({
        ...mockProduct,
        quantity: 1,
      });
      expect(toast.success).toHaveBeenCalledWith(`${mockProduct.name} agregado al carrito`);
    });

    it('should increment quantity when adding existing product', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart(mockProduct);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(2);
      expect(toast.success).toHaveBeenCalledTimes(2);
    });

    it('should not exceed stock limit', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        // Add up to stock limit
        for (let i = 0; i < mockProduct.stock; i++) {
          result.current.addToCart(mockProduct);
        }
      });

      expect(result.current.cart[0].quantity).toBe(mockProduct.stock);

      // Try to add beyond stock
      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(result.current.cart[0].quantity).toBe(mockProduct.stock);
      expect(toast.error).toHaveBeenCalledWith(`Solo hay ${mockProduct.stock} unidades disponibles`);
    });

    it('should not add product with zero stock', () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 };
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(outOfStockProduct);
      });

      expect(result.current.cart).toHaveLength(0);
      expect(toast.error).toHaveBeenCalledWith('Producto agotado');
    });

    it('should add multiple different products', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart(mockProduct2);
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[0].id).toBe(mockProduct.id);
      expect(result.current.cart[1].id).toBe(mockProduct2.id);
    });
  });

  describe('removeFromCart', () => {
    it('should remove product from cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.removeFromCart(mockProduct.id);
      });

      expect(result.current.cart).toHaveLength(0);
      expect(toast.success).toHaveBeenCalledWith(`${mockProduct.name} eliminado del carrito`);
    });

    it('should only remove specified product', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart(mockProduct2);
        result.current.removeFromCart(mockProduct.id);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].id).toBe(mockProduct2.id);
    });
  });

  describe('updateQuantity', () => {
    it('should update product quantity', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.updateQuantity(mockProduct.id, 3);
      });

      expect(result.current.cart[0].quantity).toBe(3);
    });

    it('should remove product when quantity is 0', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.updateQuantity(mockProduct.id, 0);
      });

      expect(result.current.cart).toHaveLength(0);
    });

    it('should remove product when quantity is negative', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.updateQuantity(mockProduct.id, -1);
      });

      expect(result.current.cart).toHaveLength(0);
    });

    it('should not exceed stock limit when updating', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.updateQuantity(mockProduct.id, mockProduct.stock + 5);
      });

      expect(result.current.cart[0].quantity).toBe(1); // Should remain unchanged
      expect(toast.error).toHaveBeenCalledWith(`Solo hay ${mockProduct.stock} unidades disponibles`);
    });

    it('should update quantity within stock limit', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.updateQuantity(mockProduct.id, mockProduct.stock);
      });

      expect(result.current.cart[0].quantity).toBe(mockProduct.stock);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart(mockProduct2);
        result.current.clearCart();
      });

      expect(result.current.cart).toHaveLength(0);
      expect(toast.success).toHaveBeenCalledWith('Carrito vaciado');
    });
  });

  describe('getTotal', () => {
    it('should return 0 for empty cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.getTotal()).toBe(0);
    });

    it('should calculate total for single product', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(result.current.getTotal()).toBe(mockProduct.price);
    });

    it('should calculate total for multiple quantities', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.updateQuantity(mockProduct.id, 3);
      });

      expect(result.current.getTotal()).toBe(mockProduct.price * 3);
    });

    it('should calculate total for multiple products', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart(mockProduct2);
        result.current.updateQuantity(mockProduct.id, 2);
        result.current.updateQuantity(mockProduct2.id, 3);
      });

      const expectedTotal = (mockProduct.price * 2) + (mockProduct2.price * 3);
      expect(result.current.getTotal()).toBe(expectedTotal);
    });
  });

  describe('getItemCount', () => {
    it('should return 0 for empty cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.getItemCount()).toBe(0);
    });

    it('should count single item', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(result.current.getItemCount()).toBe(1);
    });

    it('should count multiple quantities', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.updateQuantity(mockProduct.id, 5);
      });

      expect(result.current.getItemCount()).toBe(5);
    });

    it('should count total across multiple products', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart(mockProduct2);
        result.current.updateQuantity(mockProduct.id, 2);
        result.current.updateQuantity(mockProduct2.id, 3);
      });

      expect(result.current.getItemCount()).toBe(5);
    });
  });

  describe('Delivery Method', () => {
    it('should set delivery method', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.setDeliveryMethod('delivery');
      });

      expect(result.current.deliveryMethod).toBe('delivery');
    });

    it('should return correct delivery cost for delivery', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.setDeliveryMethod('delivery');
      });

      expect(result.current.getDeliveryCost()).toBe(35);
    });

    it('should return 0 delivery cost for pickup', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.setDeliveryMethod('pickup');
      });

      expect(result.current.getDeliveryCost()).toBe(0);
    });

    it('should persist delivery method to localStorage', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.setDeliveryMethod('delivery');
      });

      await waitFor(() => {
        expect(localStorage.getItem('porkyrios_delivery_method')).toBe('delivery');
      });
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should save cart to localStorage when updated', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
      });

      await waitFor(() => {
        const savedCart = JSON.parse(localStorage.getItem('porkyrios_cart') || '[]');
        expect(savedCart).toHaveLength(1);
        expect(savedCart[0].id).toBe(mockProduct.id);
      });
    });

    it('should clear localStorage when cart is cleared', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.clearCart();
      });

      await waitFor(() => {
        const savedCart = JSON.parse(localStorage.getItem('porkyrios_cart') || '[]');
        expect(savedCart).toHaveLength(0);
      });
    });
  });
});
