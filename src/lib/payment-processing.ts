import { db } from '@/db';
import { inventoryMovements, orderItems, orders, products } from '@/db/schema';
import { and, eq, inArray } from 'drizzle-orm';

/** Status a paid order moves to: the first step of the admin panel's workflow. */
export const PAID_ORDER_STATUS = 'preparing';

// A payment can be approved after an earlier attempt was rejected (which cancels the order)
const PAYABLE_STATUSES = ['pending_payment', 'cancelled'];

export type PaymentUpdate = {
  orderNumber: string;
  paymentId: string;
  status: string; // MercadoPago payment status
  amount: number; // transaction_amount
};

export type PaymentUpdateResult =
  | 'paid'
  | 'already_processed'
  | 'amount_mismatch'
  | 'order_not_found'
  | 'cancelled'
  | 'refunded'
  | 'ignored';

/**
 * Apply a MercadoPago payment to its order. Safe to call any number of times
 * for the same payment: stock is decremented only by the call that moves the
 * order out of a payable status, inside the same transaction.
 */
export async function applyPaymentUpdate(update: PaymentUpdate): Promise<PaymentUpdateResult> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, update.orderNumber))
    .limit(1);

  if (!order) {
    return 'order_not_found';
  }

  const now = new Date().toISOString();

  if (update.status === 'approved') {
    if (update.amount + 0.01 < order.total) {
      console.error(
        `[Payment] ${update.orderNumber}: paid ${update.amount} but order total is ${order.total}; not confirming`
      );
      return 'amount_mismatch';
    }

    return db.transaction(async (tx) => {
      // Conditional transition: only one webhook can win it
      const moved = await tx
        .update(orders)
        .set({ status: PAID_ORDER_STATUS, updatedAt: now })
        .where(and(eq(orders.id, order.id), inArray(orders.status, PAYABLE_STATUSES)))
        .returning({ id: orders.id });

      if (moved.length === 0) {
        return 'already_processed';
      }

      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));

      for (const item of items) {
        if (!item.productId) continue;

        const [product] = await tx
          .select({ stock: products.stock })
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);
        if (!product) continue;

        const previousStock = product.stock ?? 0;
        const newStock = Math.max(previousStock - item.quantity, 0);
        if (previousStock < item.quantity) {
          console.warn(
            `[Payment] ${update.orderNumber}: product ${item.productId} oversold (stock ${previousStock}, sold ${item.quantity})`
          );
        }

        await tx.update(products).set({ stock: newStock }).where(eq(products.id, item.productId));
        await tx.insert(inventoryMovements).values({
          productId: item.productId,
          type: 'sale',
          quantity: item.quantity,
          previousStock,
          newStock,
          reason: `Venta pedido ${update.orderNumber} (pago MercadoPago ${update.paymentId})`,
          orderId: order.id,
          createdBy: 'mercadopago-webhook',
          createdAt: new Date(),
        });
      }

      return 'paid';
    });
  }

  if (update.status === 'rejected' || update.status === 'cancelled') {
    // Only an unpaid order can be cancelled by a failed payment
    await db
      .update(orders)
      .set({ status: 'cancelled', updatedAt: now })
      .where(and(eq(orders.id, order.id), eq(orders.status, 'pending_payment')));
    return 'cancelled';
  }

  if (update.status === 'refunded' || update.status === 'charged_back') {
    return db.transaction(async (tx): Promise<PaymentUpdateResult> => {
      await tx
        .update(orders)
        .set({ status: 'cancelled', updatedAt: now })
        .where(eq(orders.id, order.id));

      // Put back exactly what the sale took out, once: the 'return' movements
      // recorded here mark the order as restocked
      const movements = await tx
        .select()
        .from(inventoryMovements)
        .where(and(eq(inventoryMovements.orderId, order.id), inArray(inventoryMovements.type, ['sale', 'return'])));

      if (movements.some((m) => m.type === 'return')) {
        return 'refunded';
      }

      for (const sale of movements.filter((m) => m.type === 'sale')) {
        // What the sale actually removed (less than the quantity if stock ran out)
        const quantity = sale.previousStock - sale.newStock;
        if (quantity <= 0) continue;

        const [product] = await tx
          .select({ stock: products.stock })
          .from(products)
          .where(eq(products.id, sale.productId))
          .limit(1);
        if (!product) continue;

        const previousStock = product.stock ?? 0;
        const newStock = previousStock + quantity;

        await tx.update(products).set({ stock: newStock }).where(eq(products.id, sale.productId));
        await tx.insert(inventoryMovements).values({
          productId: sale.productId,
          type: 'return',
          quantity,
          previousStock,
          newStock,
          reason: `Reembolso pedido ${update.orderNumber} (pago MercadoPago ${update.paymentId})`,
          orderId: order.id,
          createdBy: 'mercadopago-webhook',
          createdAt: new Date(),
        });
      }

      return 'refunded';
    });
  }

  // pending, in_process, in_mediation...: nothing changes
  return 'ignored';
}
