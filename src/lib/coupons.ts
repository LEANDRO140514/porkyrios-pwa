import { coupons } from '@/db/schema';

type Coupon = typeof coupons.$inferSelect;

export type CouponEvaluation =
  | { valid: true; discount: number }
  | { valid: false; discount: 0; message: string };

/**
 * Coupon rules shared by /api/coupons/validate and /api/checkout.
 * Pure: it does not touch the database or count a use.
 */
export function evaluateCoupon(coupon: Coupon, subtotal: number, now = new Date()): CouponEvaluation {
  if (!coupon.active) {
    return { valid: false, discount: 0, message: 'Cupón inactivo' };
  }
  if (coupon.startDate && now < new Date(coupon.startDate)) {
    return { valid: false, discount: 0, message: 'Cupón aún no válido' };
  }
  if (coupon.endDate && now > new Date(coupon.endDate)) {
    return { valid: false, discount: 0, message: 'Cupón expirado' };
  }
  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, message: 'Cupón agotado' };
  }
  if (coupon.minPurchase !== null && coupon.minPurchase !== undefined && subtotal < coupon.minPurchase) {
    return { valid: false, discount: 0, message: `Compra mínima requerida: $${coupon.minPurchase.toFixed(2)}` };
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.type === 'fixed') {
    discount = Math.min(coupon.value, subtotal);
  }

  return { valid: true, discount: Math.round(discount * 100) / 100 };
}
