"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Zap, Beef, Heart, User, LogOut, Star, Download, ChefHat, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShareButtons } from "@/components/ShareButtons";
import { ReferralDialog } from "@/components/ReferralDialog";

// Lazy load heavy components
const InstallPWA = lazy(() => import("@/components/InstallPWA"));
const NotificationPermissionPrompt = lazy(() => import("@/components/NotificationPermissionPrompt"));
const ReviewDialog = lazy(() => import("@/components/ReviewDialog").then(mod => ({ default: mod.ReviewDialog })));

interface Review {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PromotionalBanner {
  id: number;
  title: string;
  description: string;
  couponCode: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeaturedProduct {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  categoryId: number | null;
  stock: number;
  active: boolean;
  featured: boolean;
  createdAt: string;
}

export default function Home() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [clickCount, setClickCount] = useState(0);
  const [konamiIndex, setKonamiIndex] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const konamiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
    // Reviews state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [reviewsEnabled, setReviewsEnabled] = useState(true);
    const [trackingEnabled, setTrackingEnabled] = useState(true);

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Banner and Featured Products state
  const [banner, setBanner] = useState<PromotionalBanner | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  // Referral dialog state
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [originUrl, setOriginUrl] = useState("");

  const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
  ];

  // Load promotional banner
  const loadBanner = async () => {
    try {
      const response = await fetch("/api/promotional-banner");
      if (response.ok) {
        const data = await response.json();
        setBanner(data);
      }
    } catch (error) {
      console.error("Error loading banner:", error);
    }
  };

  // Load featured products
  const loadFeaturedProducts = async () => {
    try {
      setIsLoadingFeatured(true);
      const response = await fetch("/api/products/featured");
      if (response.ok) {
        const data = await response.json();
        setFeaturedProducts(data.slice(0, 3)); // Máximo 3 productos destacados
      }
    } catch (error) {
      console.error("Error loading featured products:", error);
    } finally {
      setIsLoadingFeatured(false);
    }
  };

    // Load reviews setting
    const loadReviewsSetting = async () => {
      try {
        const response = await fetch("/api/settings?key=reviews_section_enabled");
        if (response.ok) {
          const data = await response.json();
          setReviewsEnabled(data.value === "true");
        }
      } catch (error) {
        console.error("Error loading reviews setting:", error);
        setReviewsEnabled(true); // Default to true on error
      }
    };

    // Load tracking setting
    const loadTrackingSetting = async () => {
      try {
        const response = await fetch("/api/settings?key=tracking_section_enabled");
        if (response.ok) {
          const data = await response.json();
          setTrackingEnabled(data.value === "true");
        }
      } catch (error) {
        console.error("Error loading tracking setting:", error);
        setTrackingEnabled(true);
      }
    };

  // Load reviews from API
  const loadReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const response = await fetch("/api/reviews?limit=3");
      
      if (!response.ok) {
        throw new Error("Failed to load reviews");
      }
      
      const data = await response.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast.error("Error al cargar las reseñas");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
      setOriginUrl(window.location.origin);
      loadBanner();
      loadFeaturedProducts();
      loadReviewsSetting();
      loadTrackingSetting();
      loadReviews();

    // Setup PWA install prompt listener
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Handle logout
  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token");

    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    if (error?.code) {
      toast.error("Error al cerrar sesión");
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Sesión cerrada exitosamente");
      router.push("/");
    }
  };

  // Handle referral click
  const handleReferralClick = () => {
    if (!session?.user) {
      router.push("/login?redirect=/");
      toast.error("Inicia sesión para acceder al programa de referidos");
    } else {
      setReferralDialogOpen(true);
    }
  };

  // Handle review submission click
  const handleReviewClick = () => {
    if (!session?.user) {
      router.push("/login?redirect=/");
      toast.error("Inicia sesión para dejar una reseña");
    } else {
      setReviewDialogOpen(true);
    }
  };

  // Handle logo click
  const handleLogoClick = () => {
    setClickCount((prev) => prev + 1);

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 500);
  };

  useEffect(() => {
    if (clickCount >= 3) {
      sessionStorage.removeItem("admin_auth");
      router.push("/admin");
      setClickCount(0);
    }
  }, [clickCount, router]);

  // Handle Konami Code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
      }

      if (e.key === konamiCode[konamiIndex]) {
        const newIndex = konamiIndex + 1;
        setKonamiIndex(newIndex);

        if (konamiTimeoutRef.current) {
          clearTimeout(konamiTimeoutRef.current);
        }

        if (newIndex < konamiCode.length) {
          konamiTimeoutRef.current = setTimeout(() => {
            setKonamiIndex(0);
          }, 2000);
        }
      } else if (e.key.startsWith("Arrow")) {
        setKonamiIndex(0);
        if (konamiTimeoutRef.current) {
          clearTimeout(konamiTimeoutRef.current);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (konamiTimeoutRef.current) {
        clearTimeout(konamiTimeoutRef.current);
      }
    };
  }, [konamiIndex]);

  useEffect(() => {
    if (konamiIndex === konamiCode.length) {
      sessionStorage.removeItem("admin_auth");
      toast.success("🎮 ¡Código secreto activado!");
      router.push("/admin");
      setKonamiIndex(0);
      if (konamiTimeoutRef.current) {
        clearTimeout(konamiTimeoutRef.current);
      }
    }
  }, [konamiIndex, router]);

  // Handle PWA installation from button
  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      toast.error("La instalación no está disponible en este dispositivo");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      toast.success("¡App instalada exitosamente! 🎉");
      setShowInstallButton(false);
    }

    setDeferredPrompt(null);
  };

  // Get user initials for avatar
  const getUserInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] to-[#FF8E53]">
      {/* Promotional Banner - Optimizado Mobile First */}
      {banner && (
        <div className="bg-white text-center py-3 px-4 md:py-4">
          <p className="text-sm md:text-base lg:text-lg font-bold text-[#FF6B35]">
            🎉 {banner.title}
          </p>
          <p className="text-xs md:text-sm lg:text-base text-gray-600 mt-1">
            {banner.description}
            {banner.couponCode && (
              <span className="ml-2 font-bold text-[#FF6B35]">Código: {banner.couponCode}</span>
            )}
          </p>
        </div>
      )}

      {/* Auth Header - Optimizado Mobile First */}
      <div className="container mx-auto px-4 pt-4 md:pt-6">
        <div className="flex justify-end">
          {!isPending && (
            <>
              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white/10 text-white border-white hover:bg-white/20 backdrop-blur text-sm md:text-base h-10 md:h-11"
                    >
                      <User className="w-4 h-4 mr-2" />
                      <span className="max-w-[120px] md:max-w-none truncate">{session.user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/tracking")}>
                      Mis Pedidos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleReferralClick}>
                      <Gift className="w-4 h-4 mr-2" />
                      Invita un Amigo
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-2 md:gap-3">
                  <Button
                    onClick={() => router.push("/login")}
                    variant="outline"
                    className="bg-white/10 text-white border-white hover:bg-white/20 backdrop-blur text-sm md:text-base h-10 md:h-11 px-3 md:px-4"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    onClick={() => router.push("/register")}
                    className="bg-white text-[#FF6B35] hover:bg-white/90 font-bold text-sm md:text-base h-10 md:h-11 px-3 md:px-4"
                  >
                    Registrarse
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hero Section - Optimizado Mobile First */}
      <div className="container mx-auto px-4 py-6 md:py-10 lg:py-12">
        <div className="text-center space-y-4 md:space-y-6 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center">
            <div 
              className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 cursor-pointer transition-transform hover:scale-105"
              onClick={handleLogoClick}
            >
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Porkyrios-1763088561391.png?width=512&height=512&resize=contain"
                  alt="Porkyrios Logo"
                  fill
                  sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                  className="object-contain drop-shadow-2xl rounded-full"
                  priority
                />
            </div>
          </div>

          {/* Título Principal */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight px-2">
            EL VERDADERO LUJO ESTÁ EN EL SABOR
          </h1>

          {/* Botones de Acción */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center px-2">
            <Button
              onClick={() => router.push("/menu")}
              size="lg"
              className="w-full sm:w-auto bg-white text-[#FF6B35] hover:bg-white/90 text-base md:text-lg lg:text-xl px-6 md:px-8 py-5 md:py-6 h-auto font-bold shadow-2xl"
            >
              🍽️ ¡Hacer mi pedido!
            </Button>
              {trackingEnabled && (
              <Button
                onClick={() => router.push("/tracking")}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 text-white border-2 border-white hover:bg-white/20 text-base md:text-lg lg:text-xl px-6 md:px-8 py-5 md:py-6 h-auto font-bold shadow-2xl backdrop-blur"
              >
                📍 Rastrear Pedido
              </Button>
              )}
            {showInstallButton && (
              <Button
                onClick={handleInstallApp}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 text-white border-2 border-white hover:bg-white/20 text-base md:text-lg lg:text-xl px-6 md:px-8 py-5 md:py-6 h-auto font-bold shadow-2xl backdrop-blur"
              >
                <Download className="w-5 h-5 mr-2" />
                Instalar App
              </Button>
            )}
          </div>

          {/* Link a página de descarga */}
          <p className="text-white/90 text-xs sm:text-sm md:text-base px-2">
            ¿Quieres instalar la app?{" "}
            <button
              onClick={() => router.push("/descargar")}
              className="underline font-bold hover:text-white transition-colors"
            >
              Más información aquí
            </button>
          </p>
        </div>
      </div>

      {/* Featured Products Section - AHORA PRIMERO - Optimizado Mobile First */}
      {!isLoadingFeatured && featuredProducts.length > 0 && (
        <div className="container mx-auto px-4 pb-6 md:pb-10 lg:pb-12">
          <div className="max-w-6xl mx-auto">
            {/* Section Title */}
            <div className="text-center mb-4 md:mb-6 lg:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                ⭐ Nuestros Productos Destacados
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-white/90">
                Los favoritos de nuestros clientes
              </p>
            </div>

            {/* Products Grid - Compacto en mobile, expandido en desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_rgba(255,107,53,0.3)] transition-all hover:scale-[1.02] md:hover:scale-105 cursor-pointer flex flex-row md:flex-col"
                  onClick={() => router.push("/menu")}
                >
                  {/* Imagen - horizontal en mobile, vertical en desktop */}
                  {product.image ? (
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-full md:h-44 bg-gradient-to-br from-orange-100 to-orange-50 flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-full md:h-44 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center flex-shrink-0">
                      <ChefHat className="w-10 h-10 md:w-14 md:h-14 text-[#FF6B35]/30" />
                    </div>
                  )}
                  
                  {/* Contenido */}
                  <div className="p-3 md:p-4 flex flex-col flex-1 justify-center">
                    <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 line-clamp-1 md:line-clamp-2">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-1 md:line-clamp-2 hidden sm:block">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-base md:text-xl font-bold text-[#FF6B35]">
                        ${product.price.toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        className="bg-[#FF6B35] text-white hover:bg-[#FF5722] text-xs px-3 py-1.5 h-auto font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push("/menu");
                        }}
                      >
                        Ordenar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Benefits Section - 3 columnas en mobile */}
      <div className="container mx-auto px-4 pb-6 md:pb-10 lg:pb-12">
        <div className="grid grid-cols-3 gap-2 md:gap-4 lg:gap-6 max-w-5xl mx-auto">
          <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl p-3 md:p-5 lg:p-6 text-center space-y-1.5 md:space-y-3 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-center">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-[#FF6B35] rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
            </div>
            <h3 className="text-xs md:text-lg font-bold text-gray-900 leading-tight">
              Entrega Rápida
            </h3>
            <p className="text-gray-600 text-[10px] md:text-base">
              30-35 min ⚡
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl p-3 md:p-5 lg:p-6 text-center space-y-1.5 md:space-y-3 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-center">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-[#FF6B35] rounded-full flex items-center justify-center">
                <Beef className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
            </div>
            <h3 className="text-xs md:text-lg font-bold text-gray-900 leading-tight">
              Ingredientes Premium
            </h3>
            <p className="text-gray-600 text-[10px] md:text-base">
              La mejor calidad 🥩
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl p-3 md:p-5 lg:p-6 text-center space-y-1.5 md:space-y-3 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-center">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-[#FF6B35] rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
            </div>
            <h3 className="text-xs md:text-lg font-bold text-gray-900 leading-tight">
              Hecho con Pasión
            </h3>
            <p className="text-gray-600 text-[10px] md:text-base">
              Amor en cada platillo ❤️
            </p>
          </div>
        </div>
      </div>

      {/* Referral Program CTA - Optimizado Mobile First */}
      <div className="container mx-auto px-4 pb-6 md:pb-10 lg:pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              🎁 Comparte y Gana
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-white/90 px-2">
              Invita amigos o comparte en redes sociales
            </p>
          </div>

          {/* Referral Program Button */}
          <div className="text-center mb-4 md:mb-6 px-2">
            <Button
              onClick={handleReferralClick}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-white/10 text-white border-2 border-white hover:bg-white/20 text-sm md:text-base lg:text-lg px-5 md:px-6 lg:px-8 py-4 md:py-5 h-auto font-bold shadow-2xl backdrop-blur"
            >
              <Gift className="w-5 h-5 mr-2" />
              Invita un Amigo y Gana 10% de Descuento
            </Button>
          </div>

          {/* Social Share Buttons */}
          <div className="text-center px-2">
            <p className="text-white/90 text-xs sm:text-sm md:text-base mb-3 md:mb-4 font-semibold">
              ¡Comparte Porkyrios con tus amigos! 🎉
            </p>
            <div className="flex justify-center">
              <ShareButtons
                  url={originUrl}
                title="Porkyrios - El Verdadero Lujo Está en el Sabor"
                description="¡Descubre los mejores platillos con entrega rápida en 30-35 minutos! 🍽️"
                hashtags={["Porkyrios", "ComidaDeliciosa", "EntregaRápida"]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section - Optimizado Mobile First */}
      {reviewsEnabled && (
        <div className="container mx-auto px-4 pb-6 md:pb-10 lg:pb-12">
          <div className="max-w-6xl mx-auto">
            {/* Section Title */}
            <div className="text-center mb-4 md:mb-6 lg:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                ⭐ Lo Que Dicen Nuestros Clientes
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-white/90 px-2">
                {averageRating > 0 && (
                  <>
                    Calificación promedio: {averageRating.toFixed(1)}/5.0 ⭐
                  </>
                )}
              </p>
            </div>

            {/* Reviews Grid */}
            {isLoadingReviews ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg animate-pulse"
                  >
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="w-3 h-3 md:w-4 md:h-4 bg-gray-200 rounded" />
                      ))}
                    </div>
                    <div className="space-y-2 mb-2">
                      <div className="h-2 md:h-3 bg-gray-200 rounded w-full" />
                      <div className="h-2 md:h-3 bg-gray-200 rounded w-5/6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <div className="h-2 md:h-3 bg-gray-200 rounded w-2/3" />
                        <div className="h-2 md:h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-6 md:py-8 px-2">
                <p className="text-white text-sm md:text-base mb-3 md:mb-4">
                  Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!
                </p>
                <Button
                  onClick={handleReviewClick}
                  size="lg"
                  className="w-full sm:w-auto bg-white text-[#FF6B35] hover:bg-white/90 text-sm md:text-base px-5 md:px-6 py-3 md:py-4 h-auto font-bold shadow-2xl"
                >
                  ⭐ Dejar una Reseña
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 md:w-4 md:h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-2 md:mb-3 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3">
                      {review.comment}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
                        {getUserInitial(review.userName)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs md:text-sm">{review.userName}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">
                          {review.isVerifiedPurchase ? "Compra verificada" : "Cliente"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA to leave review */}
            {!isLoadingReviews && reviews.length > 0 && (
              <div className="text-center mt-4 md:mt-6 px-2">
                <Button
                  onClick={handleReviewClick}
                  size="lg"
                  className="w-full sm:w-auto bg-white text-[#FF6B35] hover:bg-white/90 text-sm md:text-base px-5 md:px-6 py-3 md:py-4 h-auto font-bold shadow-2xl"
                >
                  ⭐ Comparte tu Experiencia
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PWA Install Banner - Lazy loaded */}
      <Suspense fallback={null}>
        <InstallPWA />
      </Suspense>

      {/* Notification Permission Prompt - Lazy loaded */}
      <Suspense fallback={null}>
        <NotificationPermissionPrompt />
      </Suspense>

      {/* Review Dialog - Lazy loaded */}
      <Suspense fallback={null}>
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          onSuccess={loadReviews}
        />
      </Suspense>

      {/* Referral Dialog */}
      <ReferralDialog
        open={referralDialogOpen}
        onOpenChange={setReferralDialogOpen}
      />
    </div>
  );
}