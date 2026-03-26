"use client";

import { useState, useEffect } from "react";

export interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isLoading: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: "default",
    subscription: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check if browser supports notifications
    const isSupported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    
    if (!isSupported) {
      setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
      return;
    }

    // Get current permission and subscription
    const init = async () => {
      try {
        const permission = Notification.permission;
        
        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        setState({
          isSupported: true,
          permission,
          subscription,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error initializing push notifications:", error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    init();
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!state.isSupported) {
      throw new Error("Push notifications not supported");
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      // If granted, subscribe to push
      if (permission === "granted") {
        await subscribe();
      }
      
      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      throw error;
    }
  };

  const subscribe = async (): Promise<PushSubscription | null> => {
    if (!state.isSupported || state.permission !== "granted") {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // For demo purposes, we'll use a mock VAPID key
      // In production, you'd use your own VAPID keys
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          "BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrXj-6bJ4Rr2jJPCW8FQxZ8MjhwLnGGUlCIQEn-0s-LhNLZJZ1Y"
        ),
      });

      setState(prev => ({ ...prev, subscription }));
      
      // Store subscription in localStorage for demo
      localStorage.setItem("push-subscription", JSON.stringify(subscription));
      
      return subscription;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      throw error;
    }
  };

  const unsubscribe = async (): Promise<void> => {
    if (!state.subscription) {
      return;
    }

    try {
      await state.subscription.unsubscribe();
      setState(prev => ({ ...prev, subscription: null }));
      localStorage.removeItem("push-subscription");
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      throw error;
    }
  };

  const sendTestNotification = async (title: string, body: string, url?: string) => {
    if (!state.isSupported || state.permission !== "granted") {
      throw new Error("Notifications not enabled");
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(title, {
        body,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "test-notification",
        data: { url: url || "/tracking" },
        requireInteraction: false,
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      throw error;
    }
  };

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
