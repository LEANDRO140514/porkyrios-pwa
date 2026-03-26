"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, X } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

export default function NotificationPermissionPrompt() {
  const { isSupported, permission, requestPermission, sendTestNotification } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Show prompt if notifications are supported but not yet granted/denied
    if (isSupported && permission === "default") {
      const dismissed = localStorage.getItem("notification-prompt-dismissed");
      if (!dismissed) {
        // Show after 3 seconds delay
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isSupported, permission]);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    try {
      const result = await requestPermission();
      
      if (result === "granted") {
        toast.success("¡Notificaciones activadas! 🔔");
        setShowPrompt(false);
        
        // Send a welcome notification
        setTimeout(() => {
          sendTestNotification(
            "¡Bienvenido a Porkyrios!",
            "Recibirás notificaciones sobre el estado de tus pedidos"
          );
        }, 1000);
      } else if (result === "denied") {
        toast.error("Notificaciones bloqueadas. Puedes habilitarlas en la configuración de tu navegador.");
        setShowPrompt(false);
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error("Error al habilitar notificaciones");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("notification-prompt-dismissed", "true");
  };

  if (!isSupported || permission !== "default" || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-top-5">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 border-2 border-[#FF6B35]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-[#FF6B35]" />
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                ¿Activar Notificaciones?
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Te avisaremos cuando tu pedido esté listo o cambie de estado
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleEnableNotifications}
                disabled={isRequesting}
                size="sm"
                className="bg-[#FF6B35] text-white hover:bg-[#FF8E53] font-bold"
              >
                {isRequesting ? "Activando..." : "Activar"}
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Ahora no
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
