"use client";

import { Button } from "@/components/ui/button";
import { Bell, BellOff, TestTube } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";
import { useState } from "react";

export default function NotificationSettings() {
  const { isSupported, permission, requestPermission, sendTestNotification, unsubscribe } = usePushNotifications();
  const [isLoading, setIsLoading] = useState(false);

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BellOff className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
              Notificaciones no disponibles
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Tu navegador no soporta notificaciones push. Prueba con Chrome, Firefox o Edge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const result = await requestPermission();
      if (result === "granted") {
        toast.success("¡Notificaciones activadas! 🔔");
      } else if (result === "denied") {
        toast.error("Notificaciones bloqueadas. Verifica la configuración de tu navegador.");
      }
    } catch (error) {
      toast.error("Error al habilitar notificaciones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    try {
      await unsubscribe();
      toast.success("Notificaciones desactivadas");
    } catch (error) {
      toast.error("Error al desactivar notificaciones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      await sendTestNotification(
        "¡Tu pedido está listo! 🍽️",
        "Pedido #POR-12345 - Listo para recoger",
        "/tracking"
      );
      toast.success("Notificación de prueba enviada");
    } catch (error) {
      toast.error("Error al enviar notificación");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          permission === "granted" 
            ? "bg-green-100 dark:bg-green-900/30" 
            : permission === "denied"
            ? "bg-red-100 dark:bg-red-900/30"
            : "bg-gray-100 dark:bg-gray-700"
        }`}>
          {permission === "granted" ? (
            <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
          ) : (
            <BellOff className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
            Notificaciones Push
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {permission === "granted" 
              ? "Recibirás notificaciones sobre el estado de tus pedidos"
              : permission === "denied"
              ? "Las notificaciones están bloqueadas. Habilítalas en la configuración de tu navegador."
              : "Activa las notificaciones para recibir actualizaciones de tus pedidos"}
          </p>

          <div className="flex gap-2">
            {permission === "granted" ? (
              <>
                <Button
                  onClick={handleTest}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  Probar
                </Button>
                <Button
                  onClick={handleDisable}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <BellOff className="w-4 h-4" />
                  Desactivar
                </Button>
              </>
            ) : permission === "default" ? (
              <Button
                onClick={handleEnable}
                disabled={isLoading}
                size="sm"
                className="bg-[#FF6B35] text-white hover:bg-[#FF8E53] gap-2"
              >
                <Bell className="w-4 h-4" />
                {isLoading ? "Activando..." : "Activar Notificaciones"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
