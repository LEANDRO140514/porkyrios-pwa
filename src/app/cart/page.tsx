"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ArrowRight, Loader2, MapPin, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getTotal, 
    getItemCount, 
    deliveryMethod, 
    setDeliveryMethod, 
    deliveryAddress,
    setDeliveryAddress,
    postalCode,
    setPostalCode,
    validatedPostalCode,
    isValidatingPostalCode,
    validatePostalCode,
    getDeliveryCost, 
    isLoading 
  } = useCart();

  const [postalCodeInput, setPostalCodeInput] = useState("");
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);

  // Initialize postal code input from context
  useEffect(() => {
    if (postalCode) {
      setPostalCodeInput(postalCode);
    }
  }, [postalCode]);

  // Show loading state while cart is being loaded from localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[#FF6B35] animate-spin mx-auto mb-3 md:mb-4" />
          <p className="text-gray-400 text-sm md:text-base">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  const handlePostalCodeChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length <= 5) {
      setPostalCodeInput(cleanValue);
      setPostalCode(cleanValue);
      setHasAttemptedValidation(false);
    }
  };

  const handleValidatePostalCode = async () => {
    if (!postalCodeInput || postalCodeInput.length < 4) {
      toast.error("Por favor ingresa un código postal válido (mínimo 4 dígitos)");
      return;
    }

    setHasAttemptedValidation(true);
    const isValid = await validatePostalCode(postalCodeInput);

    if (isValid) {
      toast.success(`✅ Código postal válido - Envío: $${validatedPostalCode?.deliveryCost.toFixed(2)}`);
    } else {
      toast.error("❌ Lo sentimos, no realizamos entregas en este código postal");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Validate delivery address and postal code if delivery method is selected
    if (deliveryMethod === "delivery") {
      if (!deliveryAddress.trim()) {
        toast.error("Por favor ingresa tu dirección de entrega");
        return;
      }
      if (!postalCode.trim()) {
        toast.error("Por favor ingresa tu código postal");
        return;
      }
      if (postalCode.length < 4) {
        toast.error("Por favor ingresa un código postal válido");
        return;
      }
      // Check if postal code has been validated
      if (!validatedPostalCode?.valid) {
        toast.error("Por favor valida tu código postal antes de continuar");
        return;
      }
    }
    
    router.push("/payment");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-3 md:p-4">
        <Card className="w-full max-w-md p-6 md:p-8 bg-gray-800 border-gray-700 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="relative w-20 h-20 md:w-24 md:h-24">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Porkyrios-1763088561391.png?width=8000&height=8000&resize=contain"
                alt="Porkyrios Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="text-5xl md:text-6xl mb-3 md:mb-4">🛒</div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-400 mb-4 md:mb-6 text-sm md:text-base">
            Agrega productos del menú para comenzar tu pedido
          </p>
          <Button
            onClick={() => router.push("/menu")}
            className="w-full bg-[#FF6B35] hover:bg-[#FF8E53] text-white font-bold h-11 md:h-12 text-sm md:text-base"
          >
            Ver Menú
          </Button>
        </Card>
      </div>
    );
  }

  const deliveryCost = getDeliveryCost();
  const subtotal = getTotal();
  const tax = subtotal * 0.16;
  const total = subtotal + tax + deliveryCost;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header - Optimizado Mobile First */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              {/* Logo */}
              <div className="relative w-10 h-10 md:w-12 md:h-12 cursor-pointer flex-shrink-0" onClick={() => router.push("/")}>
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Porkyrios-1763088561391.png?width=8000&height=8000&resize=contain"
                  alt="Porkyrios"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-1 md:gap-2 truncate">
                  🛒 Mi Carrito
                </h1>
                <p className="text-gray-400 text-xs md:text-sm">{getItemCount()} producto(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs md:text-sm px-2 md:px-4 h-8 md:h-10"
                onClick={() => router.push("/menu")}
              >
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden sm:inline">Seguir Comprando</span>
              </Button>
              <Button
                variant="destructive"
                onClick={clearCart}
                className="bg-red-600 hover:bg-red-700 text-xs md:text-sm px-2 md:px-4 h-8 md:h-10"
              >
                <Trash2 className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden sm:inline">Vaciar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Cart Items - Optimizado Mobile First */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {cart.map((item) => (
              <Card
                key={item.id}
                className="bg-gray-800 border-gray-700 p-3 md:p-4 lg:p-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                  <div className="flex-1 w-full">
                    <h3 className="text-base md:text-lg font-bold text-white mb-1">
                      {item.name}
                    </h3>
                    <p className="text-[#FF6B35] font-bold text-lg md:text-xl">
                      ${item.price.toFixed(2)}
                    </p>
                    {item.stock <= 5 && (
                      <p className="text-yellow-400 text-xs md:text-sm mt-1">
                        ⚠️ Solo quedan {item.stock} disponibles
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 md:gap-2 flex-1 sm:flex-initial">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 w-8 h-8 md:w-10 md:h-10 p-0"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        ) : (
                          <Minus className="w-3 h-3 md:w-4 md:h-4" />
                        )}
                      </Button>

                      <Input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value > 0) {
                            updateQuantity(item.id, value);
                          }
                        }}
                        className="w-16 md:w-20 text-center bg-gray-700 border-gray-600 text-white font-bold text-sm md:text-base h-8 md:h-10"
                      />

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 w-8 h-8 md:w-10 md:h-10 p-0"
                      >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[60px] md:min-w-[80px]">
                      <p className="text-xs md:text-sm text-gray-400">Subtotal</p>
                      <p className="text-base md:text-xl font-bold text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-600 hover:bg-red-700 w-8 h-8 md:w-10 md:h-10 p-0"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary - Optimizado Mobile First */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 p-4 md:p-6 sticky top-24 space-y-4 md:space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-white">
                Resumen del Pedido
              </h2>

              <div className="space-y-2 md:space-y-3 max-h-[150px] md:max-h-[200px] overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs md:text-sm"
                  >
                    <span className="text-gray-400 truncate mr-2">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-white font-medium flex-shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* DELIVERY/PICKUP SECTION - Optimizado Mobile First */}
              <div className="border-t border-gray-700 pt-4 md:pt-6">
                <h3 className="text-base md:text-lg font-bold text-white mb-3 md:mb-4 text-center">
                  🚚 Método de Entrega
                </h3>
                
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {/* DELIVERY OPTION */}
                  <button
                    onClick={() => setDeliveryMethod("delivery")}
                    className={`relative p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all duration-300 ${
                      deliveryMethod === "delivery"
                        ? "border-[#FF6B35] bg-[#FF6B35]/10 shadow-lg shadow-[#FF6B35]/20"
                        : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 md:gap-3">
                      <div className="relative w-16 h-16 md:w-20 md:h-20">
                        <Image
                          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c771c46-d2be-4535-b34d-11950a9d3256/generated_images/modern-flat-illustration-of-a-delivery-m-37d4f558-20251115173238.jpg"
                          alt="Delivery"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold text-xs md:text-sm mb-1">
                          🏍️ Delivery
                        </p>
                        <p className="text-[#FF6B35] font-bold text-base md:text-lg">
                          {validatedPostalCode?.valid 
                            ? `+$${validatedPostalCode.deliveryCost.toFixed(2)}`
                            : "+$35.00"
                          }
                        </p>
                        <p className="text-gray-400 text-[10px] md:text-xs mt-1">
                          30-35 min
                        </p>
                      </div>
                    </div>
                    {deliveryMethod === "delivery" && (
                      <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-[#FF6B35] rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] md:text-xs font-bold">✓</span>
                      </div>
                    )}
                  </button>

                  {/* PICKUP OPTION */}
                  <button
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`relative p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all duration-300 ${
                      deliveryMethod === "pickup"
                        ? "border-[#FF6B35] bg-[#FF6B35]/10 shadow-lg shadow-[#FF6B35]/20"
                        : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 md:gap-3">
                      <div className="relative w-16 h-16 md:w-20 md:h-20">
                        <Image
                          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c771c46-d2be-4535-b34d-11950a9d3256/generated_images/modern-flat-illustration-of-a-restaurant-1e435ca5-20251115173238.jpg"
                          alt="Pickup"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold text-xs md:text-sm mb-1">
                          🏪 Recoger
                        </p>
                        <p className="text-green-400 font-bold text-base md:text-lg">
                          GRATIS
                        </p>
                        <p className="text-gray-400 text-[10px] md:text-xs mt-1">
                          10-15 min
                        </p>
                      </div>
                    </div>
                    {deliveryMethod === "pickup" && (
                      <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-[#FF6B35] rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] md:text-xs font-bold">✓</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* DELIVERY ADDRESS & POSTAL CODE INPUT - Optimizado Mobile First */}
                {deliveryMethod === "delivery" && (
                  <div className="mt-3 md:mt-4 space-y-2 md:space-y-3">
                    <div className="space-y-1.5 md:space-y-2">
                      <label className="text-white font-bold text-xs md:text-sm flex items-center gap-1.5 md:gap-2">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4 text-[#FF6B35]" />
                        Dirección de Entrega *
                      </label>
                      <Input
                        placeholder="Ej: Calle Reforma #123, Col. Centro"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 text-sm md:text-base h-9 md:h-10"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <label className="text-white font-bold text-xs md:text-sm flex items-center gap-1.5 md:gap-2">
                        📮 Código Postal *
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ej: 12345"
                          value={postalCodeInput}
                          onChange={(e) => handlePostalCodeChange(e.target.value)}
                          maxLength={5}
                          className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 text-sm md:text-base h-9 md:h-10"
                          required
                        />
                        <Button
                          onClick={handleValidatePostalCode}
                          disabled={isValidatingPostalCode || !postalCodeInput || postalCodeInput.length < 4}
                          className="bg-[#FF6B35] hover:bg-[#FF8E53] text-white px-3 md:px-4 h-9 md:h-10 text-xs md:text-sm"
                        >
                          {isValidatingPostalCode ? (
                            <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                          ) : (
                            "Validar"
                          )}
                        </Button>
                      </div>

                      {/* Validation Status - Optimizado */}
                      {hasAttemptedValidation && validatedPostalCode && (
                        <div className={`mt-2 p-2 md:p-3 rounded-lg flex items-start gap-1.5 md:gap-2 ${
                          validatedPostalCode.valid
                            ? "bg-green-500/10 border border-green-500/30"
                            : "bg-red-500/10 border border-red-500/30"
                        }`}>
                          {validatedPostalCode.valid ? (
                            <>
                              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-green-400 font-bold text-xs md:text-sm">
                                  ✅ Código Postal Válido
                                </p>
                                <p className="text-green-300 text-[10px] md:text-xs mt-1">
                                  {validatedPostalCode.municipality && validatedPostalCode.state
                                    ? `${validatedPostalCode.municipality}, ${validatedPostalCode.state}`
                                    : "Entrega disponible en esta zona"}
                                </p>
                                <p className="text-green-300 text-[10px] md:text-xs font-bold mt-1">
                                  Costo de envío: ${validatedPostalCode.deliveryCost.toFixed(2)}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-red-400 font-bold text-xs md:text-sm">
                                  ❌ Código Postal No Disponible
                                </p>
                                <p className="text-red-300 text-[10px] md:text-xs mt-1">
                                  Lo sentimos, actualmente no realizamos entregas en esta zona.
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {!hasAttemptedValidation && (
                        <div className="mt-2 p-2 md:p-3 rounded-lg flex items-start gap-1.5 md:gap-2 bg-blue-500/10 border border-blue-500/30">
                          <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-blue-400 text-[10px] md:text-xs">
                              💡 Ingresa tu código postal y presiona "Validar" para verificar disponibilidad de entrega
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Info */}
                <div className="mt-3 md:mt-4 p-2 md:p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-blue-400 text-[10px] md:text-xs text-center leading-relaxed">
                    {deliveryMethod === "delivery" 
                      ? "🏍️ Tu pedido será entregado a domicilio en 30-35 minutos"
                      : "🏪 Recoge tu pedido en nuestro local en 10-15 minutos"
                    }
                  </p>
                </div>
              </div>

              {/* Totals - Optimizado Mobile First */}
              <div className="border-t border-gray-700 pt-3 md:pt-4">
                <div className="flex items-center justify-between mb-1.5 md:mb-2 text-xs md:text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-medium">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                {deliveryCost > 0 && (
                  <div className="flex items-center justify-between mb-1.5 md:mb-2 text-xs md:text-sm">
                    <span className="text-gray-400">Envío</span>
                    <span className="text-white font-medium">
                      ${deliveryCost.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-1.5 md:mb-2 text-xs md:text-sm">
                  <span className="text-gray-400">IVA (16%)</span>
                  <span className="text-white font-medium">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-gray-700">
                  <span className="text-base md:text-xl font-bold text-white">Total</span>
                  <span className="text-xl md:text-2xl font-bold text-[#FF6B35]">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={
                  deliveryMethod === "delivery" && 
                  (!deliveryAddress.trim() || !postalCode.trim() || !validatedPostalCode?.valid)
                }
                className="w-full bg-[#FF6B35] hover:bg-[#FF8E53] text-white font-bold py-2.5 md:py-3 text-sm md:text-lg disabled:opacity-50 disabled:cursor-not-allowed h-auto"
              >
                Continuar al Pago
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </Button>

              {deliveryMethod === "delivery" && (!deliveryAddress.trim() || !postalCode.trim() || !validatedPostalCode?.valid) && (
                <p className="text-yellow-400 text-[10px] md:text-xs text-center">
                  {!deliveryAddress.trim() || !postalCode.trim()
                    ? "⚠️ Completa tu dirección y código postal para continuar"
                    : "⚠️ Valida tu código postal antes de continuar"
                  }
                </p>
              )}

              <div className="p-2 md:p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-[10px] md:text-sm text-center">
                  💡 {session?.user ? "Tu pedido será procesado" : "Te pediremos tus datos en el siguiente paso"}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}