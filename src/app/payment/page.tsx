"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ArrowLeft, Loader2, ShoppingCart, User, Tag, X, MapPin, Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSession, authClient } from "@/lib/auth-client";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { toast } from "sonner";
import Image from "next/image";

export default function PaymentPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const { cart, getTotal, getDeliveryCost, deliveryMethod, deliveryAddress, postalCode, validatedPostalCode, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isNewUser, setIsNewUser] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: string;
    value: number;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Populate form if user is already logged in
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
      setIsNewUser(false);
    }
  }, [session]);

  // Validation effect - runs in background without blocking UI
  useEffect(() => {
    if (isPending) return;
    
    // Validate cart is not empty
    if (cart.length === 0) {
      toast.error("Tu carrito está vacío");
      router.push("/menu");
      return;
    }
    
    // Validate delivery info for delivery orders
    if (deliveryMethod === "delivery") {
      if (!deliveryAddress.trim() || !postalCode.trim()) {
        toast.error("Por favor completa tu dirección y código postal en el carrito");
        router.push("/cart");
        return;
      }
      
      if (!validatedPostalCode?.valid) {
        toast.error("Por favor valida tu código postal en el carrito");
        router.push("/cart");
        return;
      }
    }
  }, [isPending, cart.length, deliveryMethod, deliveryAddress, postalCode, validatedPostalCode, router]);

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, "");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.length <= 15) {
      setFormData({ ...formData, phone: formatted });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Por favor ingresa un código de cupón");
      return;
    }

    setIsValidatingCoupon(true);

    try {
      const subtotal = getTotal();
      
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          subtotal: subtotal,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          discount: data.discount,
          type: data.coupon.type,
          value: data.coupon.value,
        });
        toast.success(`🎉 ${data.message}`);
        setCouponCode("");
      } else {
        toast.error(data.message || "Cupón no válido");
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      toast.error("Error al validar el cupón");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Cupón removido");
  };

  const validateForm = () => {
    // For new users (registration)
    if (!session?.user && isNewUser) {
      if (!formData.name.trim()) {
        toast.error("Por favor ingresa tu nombre");
        return false;
      }
      if (!formData.email.trim()) {
        toast.error("Por favor ingresa tu email");
        return false;
      }
      if (!formData.phone || formData.phone.length < 10) {
        toast.error("Por favor ingresa un teléfono válido (mínimo 10 dígitos)");
        return false;
      }
      if (formData.password.length < 8) {
        toast.error("La contraseña debe tener al menos 8 caracteres");
        return false;
      }
    }

    // For existing users (login)
    if (!session?.user && !isNewUser) {
      if (!formData.email.trim()) {
        toast.error("Por favor ingresa tu email");
        return false;
      }
      if (!formData.phone || formData.phone.length < 10) {
        toast.error("Por favor ingresa un teléfono válido (mínimo 10 dígitos)");
        return false;
      }
      if (!formData.password) {
        toast.error("Por favor ingresa tu contraseña");
        return false;
      }
    }

    // For logged in users
    if (session?.user) {
      if (!formData.phone || formData.phone.length < 10) {
        toast.error("Por favor ingresa un teléfono válido (mínimo 10 dígitos)");
        return false;
      }
    }

    return true;
  };

  const handleAuthentication = async () => {
    // If already logged in, skip auth
    if (session?.user) return true;

    try {
      if (isNewUser) {
        // Register new user
        const { error } = await authClient.signUp.email({
          email: formData.email,
          name: formData.name,
          password: formData.password,
        });

        if (error?.code) {
          if (error.code === "USER_ALREADY_EXISTS") {
            toast.error("Este email ya está registrado. Intenta iniciar sesión.");
            setIsNewUser(false);
          } else {
            toast.error("Error al crear la cuenta");
          }
          return false;
        }

        toast.success("¡Cuenta creada exitosamente!");
        await refetch();
        return true;
      } else {
        // Login existing user
        const { error } = await authClient.signIn.email({
          email: formData.email,
          password: formData.password,
        });

        if (error?.code) {
          toast.error("Email o contraseña incorrectos");
          return false;
        }

        toast.success("¡Sesión iniciada!");
        await refetch();
        return true;
      }
    } catch (error) {
      toast.error("Error de autenticación");
      return false;
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Validate delivery address AND postal code one more time
    if (deliveryMethod === "delivery") {
      if (!deliveryAddress.trim()) {
        toast.error("Falta la dirección de entrega");
        router.push("/cart");
        return;
      }
      if (!postalCode.trim()) {
        toast.error("Falta el código postal");
        router.push("/cart");
        return;
      }
      if (!validatedPostalCode?.valid) {
        toast.error("Código postal no válido. Por favor verifica en el carrito");
        router.push("/cart");
        return;
      }
    }

    setIsLoading(true);

    try {
      // Authenticate user first if not logged in
      const authSuccess = await handleAuthentication();
      if (!authSuccess) {
        setIsLoading(false);
        return;
      }

      // Generate order
      const orderNumber = `PK-${Math.floor(10000 + Math.random() * 90000)}`;
      const subtotal = getTotal();
      const deliveryCost = getDeliveryCost();
      const iva = subtotal * 0.16;
      const discount = appliedCoupon?.discount || 0;
      const total = subtotal + iva + deliveryCost - discount;

      // Create order with customerEmail, deliveryAddress, and postalCode
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("bearer_token")}`
        },
        body: JSON.stringify({
          orderNumber,
          customerName: formData.name,
          customerEmail: formData.email,
          phone: formData.phone,
          deliveryAddress: deliveryMethod === "delivery" ? deliveryAddress : null,
          postalCode: deliveryMethod === "delivery" ? postalCode : null,
          total,
          status: "pending_payment",
          deliveryMethod,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Error al crear la orden");
      }

      const order = await orderResponse.json();

      // Create order items
      for (const item of cart) {
        await fetch("/api/orders/items", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("bearer_token")}`
          },
          body: JSON.stringify({
            orderId: order.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          }),
        });
      }

      // Send confirmation email with delivery address and postal code
      try {
        const emailResponse = await fetch("/api/emails/order-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            orderNumber,
            customerName: formData.name,
            items: cart.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            subtotal,
            deliveryCost,
            iva,
            discount,
            couponCode: appliedCoupon?.code,
            total,
            deliveryMethod,
            deliveryAddress: deliveryMethod === "delivery" ? deliveryAddress : null,
            postalCode: deliveryMethod === "delivery" ? postalCode : null,
            estimatedDelivery: "45-60 minutos",
          }),
        });

        if (emailResponse.ok) {
          console.log("✅ Email de confirmación enviado");
          toast.success("📧 Te enviamos un email de confirmación");
        } else {
          console.warn("⚠️ No se pudo enviar el email de confirmación");
        }
      } catch (emailError) {
        console.error("Error enviando email:", emailError);
      }

      // Create MercadoPago preference
      const cartSummary = cart.map(item => `${item.name} x${item.quantity}`).join(", ");
      
      const preferenceResponse = await fetch("/api/payment/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Pedido Porkyrios - ${orderNumber}`,
          description: cartSummary,
          price: total,
          quantity: 1,
          externalReference: orderNumber,
          payerEmail: formData.email,
          payerName: formData.name,
          payerPhone: formData.phone,
        }),
      });

      if (!preferenceResponse.ok) {
        throw new Error("Error al crear la preferencia de pago");
      }

      const { initPoint } = await preferenceResponse.json();

      // Open MercadoPago checkout
      const isInIframe = window.self !== window.top;
      
      if (isInIframe) {
        window.parent.postMessage(
          { type: "OPEN_EXTERNAL_URL", data: { url: initPoint } },
          "*"
        );
        toast.success("Redirigiendo a MercadoPago...");
      } else {
        window.open(initPoint, "_blank", "noopener,noreferrer");
        toast.success("Se abrió MercadoPago en una nueva pestaña");
      }

      clearCart();
      
      setTimeout(() => {
        router.push(`/tracking?order=${orderNumber}`);
      }, 2000);

    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Error al procesar el pago");
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = getTotal();
  const deliveryCost = getDeliveryCost();
  const iva = subtotal * 0.16;
  const discount = appliedCoupon?.discount || 0;
  const total = subtotal + iva + deliveryCost - discount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] py-4 md:py-6 lg:py-8 px-3 md:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Logo Header - Optimizado Mobile First */}
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="relative w-16 h-16 md:w-20 md:h-20 cursor-pointer" onClick={() => router.push("/")}>
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Porkyrios-1763088561391.png?width=8000&height=8000&resize=contain"
              alt="Porkyrios Logo"
              fill
              className="object-contain drop-shadow-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Order Summary - Optimizado Mobile First */}
          <Card className="shadow-xl h-fit">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <CardTitle className="text-lg md:text-xl">Resumen del Pedido</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
              {/* Delivery Method & Address - Optimizado */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 md:p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="w-3 h-3 md:w-4 md:h-4 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-blue-900 dark:text-blue-100 text-xs md:text-sm">
                    {deliveryMethod === "delivery" ? "🏍️ Entrega a Domicilio" : "🏪 Recoger en Local"}
                  </span>
                </div>
                {deliveryMethod === "delivery" && deliveryAddress && (
                  <div className="space-y-2 mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300">
                        {deliveryAddress}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm font-semibold text-blue-600">📮 CP:</span>
                      <span className="text-xs md:text-sm text-blue-700 dark:text-blue-300">{postalCode}</span>
                      {validatedPostalCode?.municipality && validatedPostalCode?.state && (
                        <span className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400">
                          ({validatedPostalCode.municipality}, {validatedPostalCode.state})
                        </span>
                      )}
                    </div>
                    {validatedPostalCode?.valid && (
                      <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded px-2 py-1">
                        <p className="text-[10px] md:text-xs text-green-700 dark:text-green-400 font-medium">
                          ✅ Código postal validado - Envío: ${validatedPostalCode.deliveryCost.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 mt-2">
                  {deliveryMethod === "delivery" 
                    ? "Tiempo estimado: 30-35 minutos" 
                    : "Tiempo estimado: 10-15 minutos"}
                </p>
              </div>

              {/* Cart Items - Optimizado */}
              <div className="space-y-2 md:space-y-3 max-h-[200px] md:max-h-[300px] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b text-xs md:text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon Section - Optimizado */}
              <div className="pt-3 md:pt-4 border-t space-y-2 md:space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                  <span className="font-semibold text-xs md:text-sm">¿Tienes un cupón?</span>
                </div>
                
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="PORKY10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="uppercase text-sm md:text-base h-9 md:h-10"
                      disabled={isValidatingCoupon}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      variant="outline"
                      className="whitespace-nowrap text-xs md:text-sm h-9 md:h-10"
                    >
                      {isValidatingCoupon ? (
                        <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                      ) : (
                        "Aplicar"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-2 md:p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                        <div>
                          <p className="font-bold text-green-700 dark:text-green-400 text-xs md:text-sm">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-[10px] md:text-xs text-green-600 dark:text-green-500">
                            {appliedCoupon.type === "percentage" 
                              ? `${appliedCoupon.value}% de descuento` 
                              : `$${appliedCoupon.value} de descuento`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Totals - Optimizado */}
              <div className="space-y-1.5 md:space-y-2 pt-3 md:pt-4 border-t">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {deliveryCost > 0 && (
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">Envío 🏍️</span>
                    <span>${deliveryCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">IVA (16%)</span>
                  <span>${iva.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs md:text-sm text-green-600 dark:text-green-400">
                    <span className="font-semibold">Descuento ({appliedCoupon?.code})</span>
                    <span className="font-bold">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base md:text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <p className="text-[10px] md:text-xs text-center text-green-600 dark:text-green-400">
                    ¡Ahorraste ${discount.toFixed(2)}! 🎉
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form - Optimizado Mobile First */}
          <Card className="shadow-xl">
            <CardHeader className="space-y-1 p-4 md:p-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                <CardTitle className="text-xl md:text-2xl font-bold">
                  {session?.user ? "Confirmar Datos" : "Completa tu Información"}
                </CardTitle>
              </div>
              <CardDescription className="text-xs md:text-sm">
                {session?.user 
                  ? "Verifica tus datos para continuar" 
                  : isNewUser 
                    ? "Crea tu cuenta para finalizar tu pedido" 
                    : "Inicia sesión para continuar"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {/* Social Login - Only show if not logged in */}
              {!session?.user && (
                <SocialLoginButtons redirectUrl="/payment" mode={isNewUser ? "register" : "login"} />
              )}

              <form onSubmit={handleCheckout} className="space-y-4 md:space-y-6">
                {/* Customer Info - Optimizado */}
                <div className="space-y-3 md:space-y-4">
                  {/* Name - only for new users and logged in users */}
                  {(isNewUser || session?.user) && (
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="name" className="text-xs md:text-sm">
                        Nombre de usuario <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Juan Pérez"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!!session?.user}
                        required
                        className={`text-sm md:text-base h-9 md:h-10 ${session?.user ? "bg-muted" : ""}`}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="email" className="text-xs md:text-sm">
                      tu@email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!!session?.user}
                      required
                      className={`text-sm md:text-base h-9 md:h-10 ${session?.user ? "bg-muted" : ""}`}
                    />
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="phone" className="text-xs md:text-sm">
                      WhatsApp / Teléfono <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="1234567890"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      maxLength={15}
                      required
                      className="text-sm md:text-base h-9 md:h-10"
                    />
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      Para coordinar la entrega (mínimo 10 dígitos)
                    </p>
                  </div>

                  {/* Password fields - only if not logged in */}
                  {!session?.user && (
                    <>
                      <div className="space-y-1.5 md:space-y-2">
                        <Label htmlFor="password" className="text-xs md:text-sm">
                          Contraseña <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder={isNewUser ? "Mínimo 8 caracteres" : "Tu contraseña"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          autoComplete="off"
                          required
                          className="text-sm md:text-base h-9 md:h-10"
                        />
                      </div>

                      {/* Toggle between register/login - Optimizado */}
                      <div className="text-center pt-1 md:pt-2">
                        <button
                          type="button"
                          onClick={() => setIsNewUser(!isNewUser)}
                          className="text-sm md:text-base lg:text-lg font-bold text-[#FF6B35] hover:underline"
                        >
                          {isNewUser 
                            ? "¿YA TIENES CUENTA? INICIA SESIÓN" 
                            : "¿ERES NUEVO CLIENTE? REGÍSTRATE AQUÍ"}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* MercadoPago Info - Optimizado */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 md:p-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <div className="space-y-1">
                      <p className="font-semibold text-blue-900 dark:text-blue-100 text-xs md:text-sm">
                        Pago seguro con MercadoPago
                      </p>
                      <p className="text-[10px] md:text-xs lg:text-sm text-blue-700 dark:text-blue-300">
                        Tarjetas de crédito, débito y más métodos de pago
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons - Optimizado */}
                <div className="flex flex-col gap-2 md:gap-3 pt-1 md:pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 md:h-12 text-sm md:text-base"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Pagar ${total.toFixed(2)} con MercadoPago
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/cart")}
                    disabled={isLoading}
                    className="h-10 md:h-11 text-sm md:text-base"
                  >
                    <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:h-4" />
                    Regresar al Carrito
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}