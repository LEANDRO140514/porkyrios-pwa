import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { coupons } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    // 1. Validate request body
    if (!code || subtotal === undefined || subtotal === null) {
      return NextResponse.json(
        { 
          error: "Code and subtotal are required",
          code: "MISSING_FIELDS" 
        },
        { status: 400 }
      );
    }

    // Validate subtotal is positive number
    if (typeof subtotal !== 'number' || subtotal <= 0) {
      return NextResponse.json(
        { 
          error: "Subtotal must be a positive number",
          code: "INVALID_SUBTOTAL" 
        },
        { status: 400 }
      );
    }

    // 2. Find coupon by code (case-insensitive)
    const couponResults = await db.select()
      .from(coupons)
      .where(sql`UPPER(${coupons.code}) = UPPER(${code})`)
      .limit(1);

    if (couponResults.length === 0) {
      return NextResponse.json({
        valid: false,
        discount: 0,
        message: "Cupón no válido"
      }, { status: 200 });
    }

    const coupon = couponResults[0];

    // 3. Check if coupon is active
    if (!coupon.active) {
      return NextResponse.json({
        valid: false,
        discount: 0,
        message: "Cupón inactivo"
      }, { status: 200 });
    }

    // 4. Check start date
    if (coupon.startDate) {
      const startDate = new Date(coupon.startDate);
      const currentDate = new Date();
      
      if (currentDate < startDate) {
        return NextResponse.json({
          valid: false,
          discount: 0,
          message: "Cupón aún no válido"
        }, { status: 200 });
      }
    }

    // 5. Check end date
    if (coupon.endDate) {
      const endDate = new Date(coupon.endDate);
      const currentDate = new Date();
      
      if (currentDate > endDate) {
        return NextResponse.json({
          valid: false,
          discount: 0,
          message: "Cupón expirado"
        }, { status: 200 });
      }
    }

    // 6. Check usage limit
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined) {
      if (coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({
          valid: false,
          discount: 0,
          message: "Cupón agotado"
        }, { status: 200 });
      }
    }

    // 7. Check minimum purchase
    if (coupon.minPurchase !== null && coupon.minPurchase !== undefined) {
      if (subtotal < coupon.minPurchase) {
        return NextResponse.json({
          valid: false,
          discount: 0,
          message: `Compra mínima requerida: $${coupon.minPurchase.toFixed(2)}`
        }, { status: 200 });
      }
    }

    // 8. Calculate discount based on type
    let discount = 0;

    if (coupon.type === "percentage") {
      discount = (subtotal * coupon.value) / 100;
      
      // Apply max discount if exists
      if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.type === "fixed") {
      discount = coupon.value;
      
      // Can't discount more than total
      if (discount > subtotal) {
        discount = subtotal;
      }
    }

    // 9. Increment usedCount
    await db.update(coupons)
      .set({ 
        usedCount: coupon.usedCount + 1 
      })
      .where(eq(coupons.id, coupon.id));

    // 10. Calculate final total
    const finalTotal = subtotal - discount;

    // 11. Return success response
    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount
      },
      discount: parseFloat(discount.toFixed(2)),
      finalTotal: parseFloat(finalTotal.toFixed(2)),
      message: `Cupón aplicado: ${discount > 0 ? `$${discount.toFixed(2)}` : '0'} de descuento`
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}