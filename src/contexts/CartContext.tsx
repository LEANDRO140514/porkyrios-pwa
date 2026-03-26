"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  categoryId: number | null;
  image: string | null;
};

export type DeliveryMethod = "delivery" | "pickup";

type CartContextType = {
  cart: CartItem[];
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
  postalCode: string;
  validatedPostalCode: {
    valid: boolean;
    deliveryCost: number;
    municipality: string | null;
    state: string | null;
  } | null;
  isLoading: boolean;
  isValidatingPostalCode: boolean;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  setDeliveryAddress: (address: string) => void;
  setPostalCode: (code: string) => void;
  validatePostalCode: (code: string) => Promise<boolean>;
  getDeliveryCost: () => number;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [validatedPostalCode, setValidatedPostalCode] = useState<{
    valid: boolean;
    deliveryCost: number;
    municipality: string | null;
    state: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidatingPostalCode, setIsValidatingPostalCode] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("porkyrios_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }

    const savedDeliveryMethod = localStorage.getItem("porkyrios_delivery_method");
    if (savedDeliveryMethod) {
      setDeliveryMethod(savedDeliveryMethod as DeliveryMethod);
    }

    const savedDeliveryAddress = localStorage.getItem("porkyrios_delivery_address");
    if (savedDeliveryAddress) {
      setDeliveryAddress(savedDeliveryAddress);
    }

    const savedPostalCode = localStorage.getItem("porkyrios_postal_code");
    const savedValidatedPostalCode = localStorage.getItem("porkyrios_validated_postal_code");
    
    if (savedValidatedPostalCode) {
      try {
        const parsed = JSON.parse(savedValidatedPostalCode);
        // CRITICAL: Validate data format to prevent errors from corrupted data
        if (parsed && typeof parsed === 'object' && typeof parsed.valid === 'boolean') {
          // Ensure deliveryCost is always a number
          const deliveryCost = typeof parsed.deliveryCost === 'number' 
            ? parsed.deliveryCost 
            : parseFloat(parsed.deliveryCost) || 35.00;
          
          setValidatedPostalCode({
            valid: parsed.valid,
            deliveryCost: deliveryCost,
            municipality: parsed.municipality || null,
            state: parsed.state || null,
          });
        } else {
          // Invalid format - clear it
          console.warn("Invalid validated postal code format, clearing...");
          localStorage.removeItem("porkyrios_validated_postal_code");
        }
      } catch (error) {
        console.error("Error loading validated postal code:", error);
        localStorage.removeItem("porkyrios_validated_postal_code");
      }
    }
    
    if (savedPostalCode) {
      setPostalCode(savedPostalCode);
    }

    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("porkyrios_cart", JSON.stringify(cart));
  }, [cart]);

  // Save delivery method to localStorage
  useEffect(() => {
    localStorage.setItem("porkyrios_delivery_method", deliveryMethod);
  }, [deliveryMethod]);

  // Save delivery address to localStorage
  useEffect(() => {
    localStorage.setItem("porkyrios_delivery_address", deliveryAddress);
  }, [deliveryAddress]);

  // Save postal code to localStorage
  useEffect(() => {
    localStorage.setItem("porkyrios_postal_code", postalCode);
  }, [postalCode]);

  // Save validated postal code to localStorage
  useEffect(() => {
    if (validatedPostalCode) {
      localStorage.setItem("porkyrios_validated_postal_code", JSON.stringify(validatedPostalCode));
    } else {
      localStorage.removeItem("porkyrios_validated_postal_code");
    }
  }, [validatedPostalCode]);

  const validatePostalCode = async (code: string): Promise<boolean> => {
    if (!code || code.length < 4) {
      setValidatedPostalCode(null);
      localStorage.removeItem("porkyrios_validated_postal_code");
      return false;
    }

    setIsValidatingPostalCode(true);

    try {
      const response = await fetch("/api/postal-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("Failed to validate postal code");
      }

      const data = await response.json();

      if (data.valid) {
        // CRITICAL: Ensure deliveryCost is ALWAYS a number
        const deliveryCost = typeof data.deliveryCost === 'number' 
          ? data.deliveryCost 
          : parseFloat(data.deliveryCost) || 35.00;

        const validatedData = {
          valid: true,
          deliveryCost: deliveryCost,
          municipality: data.postalCode?.municipality || null,
          state: data.postalCode?.state || null,
        };
        
        setValidatedPostalCode(validatedData);
        return true;
      } else {
        const invalidData = {
          valid: false,
          deliveryCost: 0,
          municipality: null,
          state: null,
        };
        setValidatedPostalCode(invalidData);
        return false;
      }
    } catch (error) {
      console.error("Error validating postal code:", error);
      setValidatedPostalCode(null);
      localStorage.removeItem("porkyrios_validated_postal_code");
      return false;
    } finally {
      setIsValidatingPostalCode(false);
    }
  };

  const getDeliveryCost = () => {
    if (deliveryMethod === "pickup") return 0;
    
    // Use validated postal code cost if available
    if (validatedPostalCode?.valid && typeof validatedPostalCode.deliveryCost === 'number') {
      return validatedPostalCode.deliveryCost;
    }
    
    // Default delivery cost
    return 35;
  };

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);

      if (existingItem) {
        // Check if we can add more
        if (existingItem.quantity >= item.stock) {
          toast.error(`Solo hay ${item.stock} unidades disponibles`);
          return prevCart;
        }

        toast.success(`${item.name} agregado al carrito`);
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      // Check stock before adding
      if (item.stock <= 0) {
        toast.error("Producto agotado");
        return prevCart;
      }

      toast.success(`${item.name} agregado al carrito`);
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.id === id);
      if (item) {
        toast.success(`${item.name} eliminado del carrito`);
      }
      return prevCart.filter((i) => i.id !== id);
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id) {
          // Check stock limit
          if (quantity > item.stock) {
            toast.error(`Solo hay ${item.stock} unidades disponibles`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
    setDeliveryAddress("");
    setPostalCode("");
    setValidatedPostalCode(null);
    toast.success("Carrito vaciado");
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        deliveryMethod,
        deliveryAddress,
        postalCode,
        validatedPostalCode,
        isLoading,
        isValidatingPostalCode,
        setDeliveryMethod,
        setDeliveryAddress,
        setPostalCode,
        validatePostalCode,
        getDeliveryCost,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};