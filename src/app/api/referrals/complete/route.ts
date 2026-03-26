import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { referrals, user, coupons } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

function generateCouponCode(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

async function ensureUniqueCouponCode(prefix: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const code = generateCouponCode(prefix);
    const existing = await db.select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);
    
    if (existing.length === 0) {
      return code;
    }
    attempts++;
  }
  
  throw new Error('Failed to generate unique coupon code');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, newUserId } = body;

    if (!referralCode || !newUserId) {
      return NextResponse.json({ 
        error: "Referral code and new user ID are required",
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    const referralRecord = await db.select()
      .from(referrals)
      .where(eq(referrals.referralCode, referralCode))
      .limit(1);

    if (referralRecord.length === 0) {
      return NextResponse.json({ 
        error: "Referral code not found",
        code: "REFERRAL_NOT_FOUND" 
      }, { status: 404 });
    }

    const referral = referralRecord[0];

    if (referral.status !== 'pending') {
      return NextResponse.json({ 
        error: "Referral already completed",
        code: "REFERRAL_ALREADY_COMPLETED" 
      }, { status: 400 });
    }

    const referrerRecord = await db.select()
      .from(user)
      .where(eq(user.id, referral.referrerUserId))
      .limit(1);

    if (referrerRecord.length === 0) {
      return NextResponse.json({ 
        error: "Referrer user not found",
        code: "REFERRER_NOT_FOUND" 
      }, { status: 404 });
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30);

    const referrerCouponCode = await ensureUniqueCouponCode('REFERIDO');
    const referredCouponCode = await ensureUniqueCouponCode('BIENVENIDA');

    const referrerCoupon = await db.insert(coupons)
      .values({
        code: referrerCouponCode,
        type: 'percentage',
        value: 15.0,
        minPurchase: 100.0,
        usageLimit: 1,
        usedCount: 0,
        active: true,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        createdAt: now.toISOString()
      })
      .returning();

    const referredCoupon = await db.insert(coupons)
      .values({
        code: referredCouponCode,
        type: 'percentage',
        value: 10.0,
        minPurchase: 100.0,
        usageLimit: 1,
        usedCount: 0,
        active: true,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        createdAt: now.toISOString()
      })
      .returning();

    const updatedReferral = await db.update(referrals)
      .set({
        referredUserId: newUserId,
        status: 'rewarded',
        rewardCouponId: referrerCoupon[0].id,
        completedAt: now.toISOString()
      })
      .where(eq(referrals.id, referral.id))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Referral completed successfully",
      referral: updatedReferral[0],
      coupons: {
        referrerCoupon: referrerCoupon[0],
        referredCoupon: referredCoupon[0]
      }
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}