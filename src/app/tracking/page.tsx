"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, ChefHat, Package, CheckCheck, Search, Loader2, Truck, XCircle, CreditCard, MapPin, Bell } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import Image from "next/image";
import NotificationSettings from "@/components/NotificationSettings";

type OrderStatus = "pending_payment" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";

interface StatusConfig {
  label: string;
  progress: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
  getEstimatedTime: (createdAt: string) => string;
}

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  deliveryAddress: string | null;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

const calculateEstimatedTime = (createdAt: string, status: OrderStatus): string => {
  const now = new Date();
  const orderTime = new Date(createdAt);
  const minutesElapsed = Math.floor((now.getTime() - orderTime.getTime()) / 60000);

  switch (status) {
    case "pending_payment":
      return "Esperando confirmación de pago";
    case "confirmed":
      return "Iniciando preparación...";
    case "preparing":
      const prepTime = Math.max(0, 20 - minutesElapsed);
      return prepTime > 0 ? `${prepTime} minutos aproximadamente` : "Casi listo para cocinar";
    case "ready":
      return "¡Tu pedido está listo para recoger!";
    case "out_for_delivery":
      const deliveryTime = Math.max(0, 30 - minutesElapsed);
      return deliveryTime > 0 ? `${deliveryTime} minutos aproximadamente` : "Llegando pronto";
    case "delivered":
      return "Pedido entregado exitosamente";
    case "cancelled":
      return "Pedido cancelado";
    default:
      return "Calculando tiempo...";
  }
};

const statusConfig: Record<OrderStatus, StatusConfig> = {
  pending_payment: {
    label: "Pendiente de Pago",
    progress: 10,
    icon: <CreditCard className="w-6 h-6" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500",
    description: "Esperando confirmación del pago",
    getEstimatedTime: (createdAt) => calculateEstimatedTime(createdAt, "pending_payment"),
  },
  confirmed: {
    label: "Confirmado",
    progress: 20,
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-500",
    description: "Tu pedido ha sido confirmado",
    getEstimatedTime: (createdAt) => calculateEstimatedTime(createdAt, "confirmed"),
  },
  preparing: {
    label: "En Preparación",
    progress: 50,
    icon: <ChefHat className="w-6 h-6" />,
    color: "text-orange-600",
    bgColor: "bg-[#FF6B35]",
    description: "Estamos preparando tu pedido con cuidado",
    getEstimatedTime: (createdAt) => calculateEstimatedTime(createdAt, "preparing"),
  },
  ready: {
    label: "Listo",
    progress: 75,
    icon: <CheckCheck className="w-6 h-6" />,
    color: "text-green-600",
    bgColor: "bg-green-500",
    description: "Tu pedido está listo para ser entregado",
    getEstimatedTime: (createdAt) => calculateEstimatedTime(createdAt, "ready"),
  },
  out_for_delivery: {
    label: "En Camino",
    progress: 90,
    icon: <Truck className="w-6 h-6" />,
    color: "text-purple-600",
    bgColor: "bg-purple-500",
    description: "Tu pedido está en camino",
    getEstimatedTime: (createdAt) => calculateEstimatedTime(createdAt, "out_for_delivery"),
  },
  delivered: {
    label: "Entregado",
    progress: 100,
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: "text-green-600",
    bgColor: "bg-green-500",
    description: "Tu pedido ha sido entregado exitosamente",
    getEstimatedTime: (createdAt) => calculateEstimatedTime(createdAt, "delivered"),
  },
  cancelled: {
    label: "Cancelado",
    progress: 0,
    icon: <XCircle className="w-6 h-6" />,
    color: "text-red-600",
    bgColor: "bg-red-500",
    description: "Este pedido ha sido cancelado",
    getEstimatedTime: (createdAt) => calculateEstimatedTime(createdAt, "cancelled"),
  },
};

export default function TrackingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const orderParam = searchParams.get("order");
  // MercadoPago sends back these params after payment
  const externalRef = searchParams.get("external_reference");
  const mpStatus = searchParams.get("collection_status") || searchParams.get("status");

  const effectiveOrderParam = orderParam || externalRef;

  const [searchQuery, setSearchQuery] = useState(effectiveOrderParam || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [trackingEnabled, setTrackingEnabled] = useState<boolean | null>(null);

  // Check if tracking is enabled
  useEffect(() => {
    const checkTracking = async () => {
      try {
        const response = await fetch("/api/settings?key=tracking_section_enabled");
        if (response.ok) {
          const data = await response.json();
          setTrackingEnabled(data.value === "true");
        } else {
          setTrackingEnabled(true);
        }
      } catch {
        setTrackingEnabled(true);
      }
    };
    checkTracking();
  }, []);

  const fetchOrderUpdate = useCallback(async () => {
    if (!order) return;

    try {
      const orderResponse = await fetch(`/api/orders?id=${order.id}`);
      
      if (orderResponse.ok) {
        const updatedOrder = await orderResponse.json();
        
        // Check if status changed
        if (updatedOrder.status !== order.status) {
          toast.success(`Estado actualizado: ${statusConfig[updatedOrder.status as OrderStatus].label}`);
        }
        
        setOrder(updatedOrder);
      }
    } catch (error) {
      console.error("Error fetching order update:", error);
    }
  }, [order]);

  const handleSearch = useCallback(async (orderNumber?: string) => {
    const query = orderNumber || searchQuery.trim();
    
    if (!query) {
      toast.error("Por favor ingresa un número de orden");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Search order by order number
      const orderResponse = await fetch(`/api/orders?orderNumber=${encodeURIComponent(query)}`);
      
      if (!orderResponse.ok) {
        if (orderResponse.status === 404) {
          toast.error("Orden no encontrada");
          setOrder(null);
          setOrderItems([]);
          return;
        }
        throw new Error("Error al buscar la orden");
      }

      const orders = await orderResponse.json();
      
      if (!orders || orders.length === 0) {
        toast.error("Orden no encontrada");
        setOrder(null);
        setOrderItems([]);
        return;
      }

      const foundOrder = orders[0];
      setOrder(foundOrder);

      // Fetch order items
      const itemsResponse = await fetch(`/api/orders/items?orderId=${foundOrder.id}`);
      
      if (itemsResponse.ok) {
        const items = await itemsResponse.json();
        setOrderItems(items);
      }

      toast.success("Orden encontrada");
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error al buscar la orden");
      setOrder(null);
      setOrderItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push(`/login?redirect=${encodeURIComponent("/tracking")}`);
    }
  }, [session, isPending, router]);

  // Show payment status toast when returning from MercadoPago
  useEffect(() => {
    if (!mpStatus) return;
    if (mpStatus === "approved") {
      toast.success("¡Pago aprobado! Tu pedido está confirmado.");
    } else if (mpStatus === "pending" || mpStatus === "in_process") {
      toast.info("Pago en proceso. Te notificaremos cuando se confirme.");
    } else if (mpStatus === "rejected" || mpStatus === "failure") {
      toast.error("El pago fue rechazado. Intenta con otro método de pago.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-search if order param or external_reference from MP is present
  useEffect(() => {
    if (effectiveOrderParam && !hasSearched) {
      handleSearch(effectiveOrderParam);
    }
  }, [effectiveOrderParam, handleSearch, hasSearched]);

  // Real-time polling for order updates (every 10 seconds)
  useEffect(() => {
    if (!order || order.status === "delivered" || order.status === "cancelled") {
      return;
    }

    const pollInterval = setInterval(() => {
      fetchOrderUpdate();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [order, fetchOrderUpdate]);

  // Update estimated time every minute
  useEffect(() => {
    if (!order) return;

    const updateTime = () => {
      const config = statusConfig[order.status];
      setEstimatedTime(config.getEstimatedTime(order.createdAt));
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 60000);

    return () => clearInterval(timeInterval);
  }, [order]);

  // Show loading while checking session or tracking setting
  if (isPending || trackingEnabled === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] flex items-center justify-center">
        <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-white animate-spin" />
      </div>
    );
  }

  // Show disabled message if tracking is off
  if (!trackingEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] py-6 md:py-8 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
            <div className="flex justify-center mb-3 md:mb-4">
              <div className="relative w-16 h-16 md:w-20 md:h-20 cursor-pointer" onClick={() => router.push("/")}>
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Porkyrios-1763088561391.png?width=8000&height=8000&resize=contain"
                  alt="Porkyrios Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <CardTitle className="text-xl md:text-2xl text-center">Rastreo no disponible</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm md:text-base">
              El servicio de rastreo de pedidos no está disponible en este momento.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full text-sm md:text-base h-10 md:h-11"
            >
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session?.user) return null;

  if (!order && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] py-6 md:py-8 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
            <div className="flex justify-center mb-3 md:mb-4">
              <div className="relative w-16 h-16 md:w-20 md:h-20 cursor-pointer" onClick={() => router.push("/")}>
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Porkyrios-1763088561391.png?width=8000&height=8000&resize=contain"
                  alt="Porkyrios Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <CardTitle className="text-xl md:text-2xl text-center">🔍 Rastrear Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground text-sm md:text-base">
              Ingresa tu número de orden para rastrear tu pedido en tiempo real
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="POR-12345"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="text-base md:text-lg h-10 md:h-11"
              />
              <Button onClick={() => handleSearch()} disabled={isLoading} className="h-10 md:h-11">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <NotificationSettings />
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full text-sm md:text-base h-10 md:h-11"
              >
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] py-6 md:py-8 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl p-6 md:p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-primary" />
            <p className="text-base md:text-lg font-medium">Buscando tu pedido...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!order) return null;

  const config = statusConfig[order.status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] py-6 md:py-8 px-4">
      <div className="max-w-2xl mx-auto">
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

        {/* Search Bar - Optimizado Mobile First */}
        <Card className="shadow-2xl mb-4 md:mb-6">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="POR-12345"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="text-sm md:text-base h-10 md:h-11"
              />
              <Button onClick={() => handleSearch()} disabled={isLoading} className="h-10 md:h-11">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <div className="mb-4 md:mb-6">
          <NotificationSettings />
        </div>

        {/* Status Header with Animation - Optimizado Mobile First */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 mb-4 md:mb-6 relative overflow-hidden">
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s infinite linear'
              }} 
            />
          )}
          
          <div className="relative text-center space-y-3 md:space-y-4">
            <div className="flex justify-center">
              <div className={`w-16 h-16 md:w-20 md:h-20 ${config.bgColor} rounded-full flex items-center justify-center shadow-lg animate-pulse`}>
                <div className="text-white scale-75 md:scale-100">{config.icon}</div>
              </div>
            </div>
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${config.color} mb-1 md:mb-2`}>
                {config.label}
              </h1>
              <p className="text-gray-600 text-base md:text-lg">{config.description}</p>
            </div>
            <div className="bg-[#FF6B35]/10 rounded-xl p-3 md:p-4 inline-block">
              <p className="text-xs md:text-sm text-gray-600 mb-1">Número de Orden</p>
              <p className="text-xl md:text-2xl font-bold text-[#FF6B35]">{order.orderNumber}</p>
            </div>

            {order.status !== "cancelled" && order.status !== "delivered" && (
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Actualizando en tiempo real</span>
              </div>
            )}
          </div>
        </div>

        {/* Estimated Time Card - Optimizado Mobile First */}
        {order.status !== "cancelled" && (
          <Card className="shadow-2xl mb-4 md:mb-6 border-2 border-[#FF6B35]">
            <CardContent className="pt-4 md:pt-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FF6B35] rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Tiempo Estimado</p>
                  <p className="text-lg md:text-xl font-bold text-gray-900">
                    {estimatedTime || config.getEstimatedTime(order.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Bar - Optimizado Mobile First */}
        {order.status !== "cancelled" && (
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-5 md:p-8 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
              Progreso del Pedido
            </h2>

            <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
              <Progress 
                value={config.progress} 
                className="h-3 md:h-4 bg-gray-200"
              />
              <div className="flex justify-between text-[10px] md:text-xs text-gray-600">
                <span className={order.status === "pending_payment" || order.status === "confirmed" ? "font-bold text-[#FF6B35]" : ""}>
                  Confirmando
                </span>
                <span className={order.status === "preparing" ? "font-bold text-[#FF6B35]" : ""}>
                  Preparando
                </span>
                <span className={order.status === "ready" ? "font-bold text-[#FF6B35]" : ""}>
                  Listo
                </span>
                <span className={order.status === "out_for_delivery" ? "font-bold text-[#FF6B35]" : ""}>
                  En Camino
                </span>
                <span className={order.status === "delivered" ? "font-bold text-green-600" : ""}>
                  Entregado
                </span>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-bold text-[#FF6B35]">
                  {config.progress}%
                </span>
                <span className="text-gray-600 text-sm md:text-base">Completado</span>
              </div>
            </div>

            {/* Status Timeline - Optimizado Mobile First */}
            <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Historial del Pedido</h3>
              <div className="space-y-2 md:space-y-3">
                {Object.entries(statusConfig).map(([status, statusInfo]) => {
                  const isActive = status === order.status;
                  const isPast = statusInfo.progress < config.progress;
                  
                  if (status === "cancelled") return null;
                  
                  return (
                    <div 
                      key={status}
                      className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg transition-all ${
                        isActive ? 'bg-[#FF6B35]/10 border-2 border-[#FF6B35]' : 
                        isPast ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive ? statusInfo.bgColor : 
                        isPast ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {isPast ? (
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        ) : (
                          <div className="text-white scale-[0.65] md:scale-75">{statusInfo.icon}</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium text-sm md:text-base ${isActive ? 'text-[#FF6B35]' : isPast ? 'text-green-700' : 'text-gray-500'}`}>
                          {statusInfo.label}
                        </p>
                        {isActive && (
                          <p className="text-xs md:text-sm text-gray-600">{statusInfo.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Order Details - Optimizado Mobile First */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-5 md:p-8 mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
            Detalles del Pedido
          </h2>
          <div className="space-y-3 md:space-y-4">
            <div className="flex justify-between items-center py-2 md:py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium text-sm md:text-base">Cliente:</span>
              <span className="text-gray-900 font-semibold text-right text-sm md:text-base">
                {order.customerName}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 md:py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium text-sm md:text-base">Email:</span>
              <span className="text-gray-900 font-semibold text-right text-xs md:text-sm">
                {order.customerEmail}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 md:py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium text-sm md:text-base">Teléfono:</span>
              <span className="text-gray-900 font-semibold text-right text-sm md:text-base">
                {order.phone}
              </span>
            </div>
            
            {order.deliveryAddress && (
              <div className="py-2 md:py-3 border-b border-gray-200">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#FF6B35] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-600 font-medium block mb-1 text-sm md:text-base">
                      Dirección de Entrega:
                    </span>
                    <span className="text-gray-900 font-semibold text-xs md:text-sm leading-relaxed">
                      {order.deliveryAddress}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {orderItems.length > 0 && (
              <div className="py-2 md:py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium mb-2 md:mb-3 block text-sm md:text-base">Productos:</span>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs md:text-sm bg-gray-50 p-2 rounded">
                      <span className="text-gray-700">
                        {item.productName} x{item.quantity}
                      </span>
                      <span className="text-gray-900 font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center py-2 md:py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium text-sm md:text-base">Total:</span>
              <span className="text-[#FF6B35] text-xl md:text-2xl font-bold">
                ${order.total.toFixed(2)} MXN
              </span>
            </div>
            <div className="flex justify-between items-center py-2 md:py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium text-sm md:text-base">Fecha de Pedido:</span>
              <span className="text-gray-900 font-semibold text-right text-xs md:text-sm">
                {new Date(order.createdAt).toLocaleString("es-MX", {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 md:py-3">
              <span className="text-gray-600 font-medium text-sm md:text-base">Última Actualización:</span>
              <span className="text-gray-900 font-semibold text-right text-xs md:text-sm">
                {new Date(order.updatedAt).toLocaleString("es-MX", {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Optimizado Mobile First */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <Button
            onClick={() => router.push("/menu")}
            size="lg"
            className="flex-1 bg-white text-[#FF6B35] hover:bg-white/90 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 h-auto font-bold shadow-2xl"
          >
            🍽️ Hacer Nuevo Pedido
          </Button>
          <Button
            onClick={() => router.push("/")}
            size="lg"
            variant="outline"
            className="flex-1 bg-white/10 text-white border-2 border-white hover:bg-white/20 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 h-auto font-bold shadow-2xl backdrop-blur"
          >
            🏠 Volver al Inicio
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}