import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

/** Keep only digits: "(55) 1234-5678" and "5512345678" compare equal. */
export function normalizePhone(phone: string | null | undefined): string {
  return (phone ?? '').replace(/\D/g, '');
}

/**
 * Phones match when their digits are equal, or when both have at least 10
 * digits and the last 10 are equal (so "+52 55 1234 5678" matches "5512345678").
 */
export function phonesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const x = normalizePhone(a);
  const y = normalizePhone(b);
  if (!x || !y) return false;
  if (x === y) return true;
  return x.length >= 10 && y.length >= 10 && x.slice(-10) === y.slice(-10);
}

export type TrackedOrder = {
  order: {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    phone: string;
    deliveryAddress: string | null;
    total: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  items: { id: number; productName: string; quantity: number; price: number }[];
};

/**
 * Return the order and its items only when the phone matches the one stored
 * on the order. A wrong phone is indistinguishable from a missing order.
 */
export async function findTrackedOrder(orderNumber: string, phone: string): Promise<TrackedOrder | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber.trim()))
    .limit(1);

  if (!order || !phonesMatch(order.phone, phone)) {
    return null;
  }

  const items = await db
    .select({
      id: orderItems.id,
      productName: products.name,
      quantity: orderItems.quantity,
      price: orderItems.price,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, order.id));

  return {
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      phone: order.phone,
      deliveryAddress: order.deliveryAddress,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
    items: items.map((item) => ({ ...item, productName: item.productName ?? 'Producto' })),
  };
}
