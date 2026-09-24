import { db } from '@/db';
import { coupons, orderItems, orders, postalCodes, products } from '@/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { evaluateCoupon } from '@/lib/coupons';
import { normalizePhone } from '@/lib/order-tracking';

export const IVA_RATE = 0.16;
const MAX_QUANTITY_PER_ITEM = 100;

type Product = typeof products.$inferSelect;
type Coupon = typeof coupons.$inferSelect;

export class CheckoutError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}

export type CheckoutInput = {
  items: { productId: number; quantity: number }[];
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: string | null;
  postalCode?: string | null;
  couponCode?: string | null;
  phone: string;
};

export type PricedCart = {
  lines: { productId: number; name: string; quantity: number; price: number }[];
  subtotal: number;
  iva: number;
  deliveryCost: number;
  discount: number;
  total: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Validate the raw request body; quantities for the same product are merged.
 * For a quote only the parts that affect the price are required (no phone or address).
 */
export function parseCheckoutInput(body: unknown, { forQuote = false } = {}): CheckoutInput {
  const b = (body ?? {}) as Record<string, unknown>;

  if (!Array.isArray(b.items) || b.items.length === 0) {
    throw new CheckoutError('EMPTY_CART', 'Tu carrito está vacío');
  }
  const merged = new Map<number, number>();
  for (const raw of b.items as Record<string, unknown>[]) {
    const productId = Number(raw?.productId);
    const quantity = Number(raw?.quantity);
    if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
      throw new CheckoutError('INVALID_ITEM', 'Producto o cantidad no válidos');
    }
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }
  for (const quantity of merged.values()) {
    if (quantity > MAX_QUANTITY_PER_ITEM) {
      throw new CheckoutError('INVALID_ITEM', `Máximo ${MAX_QUANTITY_PER_ITEM} unidades por producto`);
    }
  }

  const deliveryMethod = b.deliveryMethod === 'delivery' ? 'delivery' : 'pickup';
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
  const deliveryAddress = str(b.deliveryAddress);
  const postalCode = str(b.postalCode);
  if (deliveryMethod === 'delivery' && (!postalCode || (!forQuote && !deliveryAddress))) {
    throw new CheckoutError('MISSING_DELIVERY_INFO', 'Falta la dirección o el código postal de entrega');
  }

  const phone = typeof b.phone === 'string' ? b.phone.trim() : '';
  if (!forQuote && normalizePhone(phone).length < 10) {
    throw new CheckoutError('INVALID_PHONE', 'Por favor ingresa un teléfono válido (mínimo 10 dígitos)');
  }

  return {
    items: [...merged].map(([productId, quantity]) => ({ productId, quantity })),
    deliveryMethod,
    deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : null,
    postalCode: deliveryMethod === 'delivery' ? postalCode : null,
    couponCode: str(b.couponCode),
    phone,
  };
}

/**
 * Price the cart from database rows only: product prices, stock, delivery
 * cost and coupon. Pure, so it can be unit tested.
 */
export function priceCart(
  items: CheckoutInput['items'],
  productRows: Product[],
  deliveryCost: number,
  coupon: Coupon | null
): PricedCart {
  const byId = new Map(productRows.map((p) => [p.id, p]));

  const lines = items.map(({ productId, quantity }) => {
    const product = byId.get(productId);
    if (!product || product.active === false) {
      throw new CheckoutError('PRODUCT_UNAVAILABLE', 'Uno de los productos ya no está disponible', 409);
    }
    const stock = product.stock ?? 0;
    if (quantity > stock) {
      throw new CheckoutError(
        'INSUFFICIENT_STOCK',
        stock > 0 ? `Solo quedan ${stock} de ${product.name}` : `${product.name} está agotado`,
        409
      );
    }
    return { productId, name: product.name, quantity, price: product.price };
  });

  const subtotal = round2(lines.reduce((sum, l) => sum + l.price * l.quantity, 0));
  const iva = round2(subtotal * IVA_RATE);

  let discount = 0;
  if (coupon) {
    const evaluation = evaluateCoupon(coupon, subtotal);
    if (!evaluation.valid) {
      throw new CheckoutError('INVALID_COUPON', evaluation.message);
    }
    discount = evaluation.discount;
  }

  const total = round2(subtotal + iva + deliveryCost - discount);
  return { lines, subtotal, iva, deliveryCost: round2(deliveryCost), discount, total };
}

async function generateOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `PK-${Math.floor(10000 + Math.random() * 90000)}`;
    const [existing] = await db.select({ id: orders.id }).from(orders).where(eq(orders.orderNumber, candidate)).limit(1);
    if (!existing) return candidate;
  }
  throw new CheckoutError('ORDER_NUMBER_UNAVAILABLE', 'No se pudo generar el número de pedido', 503);
}

/**
 * Price a cart with database data only, without creating anything. Used both
 * to show the total before paying and by createCheckoutOrder, so the amount
 * shown and the amount charged come from the same calculation.
 */
export async function quoteCheckout(input: CheckoutInput): Promise<{ priced: PricedCart; coupon: Coupon | null }> {
  const productRows = await db
    .select()
    .from(products)
    .where(inArray(products.id, input.items.map((i) => i.productId)));

  let deliveryCost = 0;
  if (input.deliveryMethod === 'delivery') {
    const [postal] = await db
      .select()
      .from(postalCodes)
      .where(sql`UPPER(${postalCodes.code}) = UPPER(${input.postalCode})`)
      .limit(1);
    if (!postal || !postal.active) {
      throw new CheckoutError('POSTAL_CODE_UNAVAILABLE', 'No realizamos entregas en este código postal');
    }
    deliveryCost = postal.deliveryCost;
  }

  let coupon: Coupon | null = null;
  if (input.couponCode) {
    const [found] = await db
      .select()
      .from(coupons)
      .where(sql`UPPER(${coupons.code}) = UPPER(${input.couponCode})`)
      .limit(1);
    if (!found) {
      throw new CheckoutError('INVALID_COUPON', 'Cupón no válido');
    }
    coupon = found;
  }

  return { priced: priceCart(input.items, productRows, deliveryCost, coupon), coupon };
}

/**
 * Create the order and its items in one transaction, with every amount
 * computed on the server. The customer's name and email come from the session.
 */
export async function createCheckoutOrder(
  input: CheckoutInput,
  customer: { name: string; email: string }
) {
  const { priced, coupon } = await quoteCheckout(input);
  const orderNumber = await generateOrderNumber();
  const now = new Date().toISOString();

  const order = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(orders)
      .values({
        orderNumber,
        customerName: customer.name,
        customerEmail: customer.email,
        phone: input.phone,
        deliveryAddress: input.deliveryAddress ?? null,
        postalCode: input.postalCode ?? null,
        total: priced.total,
        status: 'pending_payment',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await tx.insert(orderItems).values(
      priced.lines.map((line) => ({
        orderId: created.id,
        productId: line.productId,
        quantity: line.quantity,
        price: line.price,
      }))
    );

    if (coupon) {
      await tx
        .update(coupons)
        .set({ usedCount: sql`${coupons.usedCount} + 1` })
        .where(eq(coupons.id, coupon.id));
    }

    return created;
  });

  return { order, priced };
}
