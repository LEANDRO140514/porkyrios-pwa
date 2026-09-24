import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
};

/**
 * Load the order and its items from the database so emails never trust
 * the recipient, name or item text sent by the client.
 */
export async function getOrderEmailData(orderNumber: string): Promise<OrderEmailData | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  if (!order) {
    return null;
  }

  const items = await db
    .select({
      name: products.name,
      quantity: orderItems.quantity,
      price: orderItems.price,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, order.id));

  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    total: order.total,
    items: items.map((item) => ({
      name: item.name ?? 'Producto',
      quantity: item.quantity,
      price: item.price,
    })),
  };
}
