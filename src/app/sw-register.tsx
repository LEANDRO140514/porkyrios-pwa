"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Temporarily disabled to fix runtime errors
    // Service worker will be re-enabled after clearing browser cache
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Unregister all existing service workers to clear the error state
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    }).catch((error) => {
      console.warn("Failed to unregister service workers:", error);
    });
  }, []);

  return null;
}