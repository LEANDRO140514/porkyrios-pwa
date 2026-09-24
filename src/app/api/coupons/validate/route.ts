import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { coupons } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { evaluateCoupon } from '@/lib/coupons';

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

    // 3. Apply the shared coupon rules. Uses are counted when an order is
    // created (/api/checkout), not when a customer tries a code.
    const evaluation = evaluateCoupon(coupon, subtotal);
    if (!evaluation.valid) {
      return NextResponse.json({
        valid: false,
        discount: 0,
        message: evaluation.message
      }, { status: 200 });
    }
    const discount = evaluation.discount;

    // 4. Calculate final total
    const finalTotal = subtotal - discount;

    // 5. Return success response
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