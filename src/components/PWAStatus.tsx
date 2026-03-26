"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const checkInstallStatus = () => {
      const isPWA =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");

      setIsInstalled(isPWA);

      if (isPWA) {
        console.log("✅ Ejecutando como PWA");
        toast.success("¡Bienvenido a Porkyrios!", {
          description: "App instalada correctamente",
          duration: 3000,
        });
      }
    };

    checkInstallStatus();

    // Listen for install event
    window.addEventListener("appinstalled", () => {
      console.log("✅ PWA instalada exitosamente");
      toast.success("¡App instalada!", {
        description: "Ya puedes acceder desde tu pantalla de inicio",
        duration: 5000,
      });
      setIsInstalled(true);
    });

    // Service worker interactions disabled to prevent errors
    // The PWA will still work for installation without active service worker
  }, []);

  return null;
}