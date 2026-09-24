// The payment page remembers the last order in this browser so /tracking can
// look it up (order number + phone) when the customer returns from MercadoPago.
const LAST_ORDER_KEY = 'porkyrios_last_order';

export type LastOrder = { orderNumber: string; phone: string };

export function saveLastOrder(order: LastOrder): void {
  try {
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  } catch {
    // Storage unavailable (private mode); the customer can type the phone
  }
}

export function readLastOrder(): LastOrder | null {
  try {
    const saved = JSON.parse(localStorage.getItem(LAST_ORDER_KEY) || 'null');
    return saved && typeof saved.orderNumber === 'string' && typeof saved.phone === 'string' ? saved : null;
  } catch {
    return null;
  }
}
