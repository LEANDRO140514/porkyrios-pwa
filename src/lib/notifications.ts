// Utility functions for sending push notifications

export interface NotificationData {
  title: string;
  body: string;
  url?: string;
  orderNumber?: string;
}

/**
 * Send a push notification via the API
 */
export async function sendPushNotification(data: NotificationData): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('Failed to send notification:', await response.text());
      return false;
    }

    console.log('✅ Notification sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

/**
 * Get notification message based on order status
 */
export function getOrderStatusNotification(
  orderNumber: string,
  status: string
): NotificationData {
  const notifications: Record<string, NotificationData> = {
    confirmed: {
      title: '✅ Pedido Confirmado',
      body: `Tu pedido ${orderNumber} ha sido confirmado y está siendo preparado`,
      url: `/tracking?order=${orderNumber}`,
      orderNumber,
    },
    preparing: {
      title: '👨‍🍳 En Preparación',
      body: `Tu pedido ${orderNumber} está siendo preparado con cuidado`,
      url: `/tracking?order=${orderNumber}`,
      orderNumber,
    },
    ready: {
      title: '🎉 ¡Pedido Listo!',
      body: `Tu pedido ${orderNumber} está listo para recoger`,
      url: `/tracking?order=${orderNumber}`,
      orderNumber,
    },
    out_for_delivery: {
      title: '🚚 En Camino',
      body: `Tu pedido ${orderNumber} está en camino hacia ti`,
      url: `/tracking?order=${orderNumber}`,
      orderNumber,
    },
    delivered: {
      title: '✨ Pedido Entregado',
      body: `Tu pedido ${orderNumber} ha sido entregado. ¡Buen provecho!`,
      url: `/tracking?order=${orderNumber}`,
      orderNumber,
    },
    cancelled: {
      title: '❌ Pedido Cancelado',
      body: `Tu pedido ${orderNumber} ha sido cancelado`,
      url: `/tracking?order=${orderNumber}`,
      orderNumber,
    },
  };

  return (
    notifications[status] || {
      title: 'Actualización de Pedido',
      body: `Tu pedido ${orderNumber} ha sido actualizado`,
      url: `/tracking?order=${orderNumber}`,
      orderNumber,
    }
  );
}

/**
 * Send order status change notification
 */
export async function notifyOrderStatusChange(
  orderNumber: string,
  newStatus: string
): Promise<boolean> {
  const notification = getOrderStatusNotification(orderNumber, newStatus);
  return await sendPushNotification(notification);
}

/**
 * Check if user has granted notification permission
 */
export function hasNotificationPermission(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Send a local notification (client-side only)
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  url?: string
): Promise<void> {
  if (!hasNotificationPermission()) {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'order-notification',
      data: { url: url || '/tracking' },
      requireInteraction: false,
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
}
