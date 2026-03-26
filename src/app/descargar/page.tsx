"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Zap, Bell, Wifi, Check, Smartphone, Monitor, Tablet, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function DescargarPage() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">("mobile");

  useEffect(() => {
    // Detect if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Detect device type
    const width = window.innerWidth;
    if (width < 768) {
      setDeviceType("mobile");
    } else if (width < 1024) {
      setDeviceType("tablet");
    } else {
      setDeviceType("desktop");
    }

    // Setup PWA install prompt listener
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.error("La instalación no está disponible en este navegador");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      toast.success("¡App instalada exitosamente! 🎉");
      setCanInstall(false);
    } else {
      toast.error("Instalación cancelada");
    }

    setDeferredPrompt(null);
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="w-10 h-10 md:w-12 md:h-12 text-[#FF6B35]" />;
      case "tablet":
        return <Tablet className="w-10 h-10 md:w-12 md:h-12 text-[#FF6B35]" />;
      default:
        return <Monitor className="w-10 h-10 md:w-12 md:h-12 text-[#FF6B35]" />;
    }
  };

  const getInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIOS) {
      return {
        title: "Instalación en iOS (iPhone/iPad)",
        steps: [
          "Abre esta página en Safari (no funciona en Chrome)",
          'Toca el botón "Compartir" (📤) en la parte inferior',
          'Selecciona "Agregar a inicio"',
          'Confirma el nombre "Porkyrios" y toca "Agregar"',
          "¡Listo! El icono aparecerá en tu pantalla de inicio",
        ],
      };
    }

    if (isAndroid) {
      return {
        title: "Instalación en Android",
        steps: [
          "Abre esta página en Chrome o tu navegador predeterminado",
          'Toca los 3 puntos (⋮) o busca "Instalar app"',
          'Selecciona "Instalar aplicación" o "Agregar a pantalla de inicio"',
          'Confirma el nombre "Porkyrios"',
          "¡Listo! El icono aparecerá en tu pantalla de inicio",
        ],
      };
    }

    if (deviceType === "desktop") {
      return {
        title: "Instalación en Escritorio",
        steps: [
          "Abre esta página en Chrome, Edge o Brave",
          'Busca el icono "Instalar" (⊕) en la barra de direcciones',
          'O ve a los 3 puntos (⋮) → "Instalar Porkyrios"',
          "Confirma la instalación",
          "¡Listo! La app se abrirá en su propia ventana",
        ],
      };
    }

    return {
      title: "Instalación en Tablet",
      steps: [
        "Sigue los pasos según tu dispositivo:",
        "iPad: Usa Safari y los pasos de iOS",
        "Android Tablet: Usa Chrome y los pasos de Android",
        "Confirma la instalación",
        "¡Listo! Tendrás acceso rápido desde tu pantalla de inicio",
      ],
    };
  };

  const instructions = getInstructions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] to-[#FF8E53]">
      {/* Header with back button - Optimizado Mobile First */}
      <div className="container mx-auto px-4 pt-4 md:pt-6">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="bg-white/10 text-white border-white hover:bg-white/20 backdrop-blur text-sm md:text-base h-9 md:h-10"
        >
          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
          Volver al Inicio
        </Button>
      </div>

      {/* Hero Section - Optimizado Mobile First */}
      <div className="container mx-auto px-4 py-10 md:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-5 md:space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Porkyrios-1763088561391.png?width=8000&height=8000&resize=contain"
                alt="Porkyrios Logo"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white px-2">
            📲 Instala la App de Porkyrios
          </h1>

          <p className="text-base md:text-xl lg:text-2xl text-white/90 px-2">
            Pide más rápido, rastrea tu entrega y recibe notificaciones en tiempo real
          </p>

          {/* Status messages - Optimizado Mobile First */}
          {isStandalone ? (
            <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl p-6 md:p-8 text-center">
              <Check className="w-12 h-12 md:w-16 md:h-16 text-green-500 mx-auto mb-3 md:mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                ¡Ya tienes la app instalada! ✅
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                Estás usando Porkyrios como una aplicación instalada
              </p>
            </div>
          ) : canInstall ? (
            <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl p-6 md:p-8">
              <Download className="w-12 h-12 md:w-16 md:h-16 text-[#FF6B35] mx-auto mb-3 md:mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                ¡Tu dispositivo soporta instalación!
              </h2>
              <Button
                onClick={handleInstall}
                size="lg"
                className="bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90 text-base md:text-xl px-8 md:px-10 py-6 md:py-8 h-auto font-bold shadow-2xl"
              >
                <Download className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                Instalar App Ahora
              </Button>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl p-6 md:p-8">
              {getDeviceIcon()}
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-3 md:mt-4 mb-2">
                Sigue las instrucciones para instalar
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                Tu navegador requiere instalación manual
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Benefits Section - Optimizado Mobile First */}
      <div className="container mx-auto px-4 pb-10 md:pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center mb-8 md:mb-12 px-2">
            🎯 Beneficios de Instalar la App
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl p-6 md:p-8 text-center space-y-3 md:space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#FF6B35] rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">⚡ Carga Ultra Rápida</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Acceso instantáneo sin esperar a que cargue el navegador
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl p-6 md:p-8 text-center space-y-3 md:space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#FF6B35] rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">🔔 Notificaciones Push</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Recibe alertas cuando tu pedido esté listo o en camino
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl p-6 md:p-8 text-center space-y-3 md:space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#FF6B35] rounded-full flex items-center justify-center">
                  <Wifi className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">📡 Funciona Offline</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Consulta el menú y tu carrito sin conexión a internet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Section - Optimizado Mobile First */}
      <div className="container mx-auto px-4 pb-10 md:pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl p-6 md:p-8 lg:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
              {instructions.title}
            </h2>

            <div className="space-y-3 md:space-y-4">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 md:gap-4">
                  <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base">
                    {index + 1}
                  </div>
                  <p className="text-base md:text-lg text-gray-700 pt-0.5 md:pt-1">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">
                ¿Necesitas ayuda? Contáctanos
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35]/10 text-sm md:text-base h-10 md:h-11"
                >
                  Volver al Inicio
                </Button>
                <Button
                  onClick={() => router.push("/menu")}
                  className="bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90 text-sm md:text-base h-10 md:h-11"
                >
                  Ir al Menú
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section - Optimizado Mobile First */}
      <div className="container mx-auto px-4 pb-10 md:pb-16 lg:pb-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6 md:mb-8 px-2">
            ❓ Preguntas Frecuentes
          </h2>

          <div className="space-y-3 md:space-y-4">
            <div className="bg-white/95 backdrop-blur rounded-lg md:rounded-xl p-4 md:p-6">
              <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2">
                ¿Es gratis instalar la app?
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Sí, completamente gratis. No ocupa mucho espacio y se actualiza automáticamente.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-lg md:rounded-xl p-4 md:p-6">
              <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2">
                ¿Funciona en todos los dispositivos?
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Sí, funciona en iPhone, Android, tablets y computadoras. Solo necesitas un navegador moderno.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-lg md:rounded-xl p-4 md:p-6">
              <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2">
                ¿Necesito descargarla de la tienda de apps?
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                No, se instala directamente desde nuestro sitio web. Es más rápido y ligero que una app tradicional.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-lg md:rounded-xl p-4 md:p-6">
              <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2">
                ¿Puedo desinstalarla si no me gusta?
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Sí, puedes desinstalarla como cualquier otra app desde la configuración de tu dispositivo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}