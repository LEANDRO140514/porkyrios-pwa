import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { referrals, user } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    // Validate code is provided
    if (!code || typeof code !== 'string' || code.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Referral code is required',
          code: 'MISSING_CODE' 
        },
        { status: 400 }
      );
    }

    // Query referrals table with case-insensitive search
    const referralResult = await db
      .select({
        referralCode: referrals.referralCode,
        referrerId: referrals.referrerUserId,
        referrerName: user.name,
      })
      .from(referrals)
      .leftJoin(user, eq(referrals.referrerUserId, user.id))
      .where(sql`lower(${referrals.referralCode}) = lower(${code.trim()})`)
      .limit(1);

    // If no referral found, return invalid response
    if (referralResult.length === 0) {
      return NextResponse.json(
        {
          valid: false,
          referrerName: null,
        },
        { status: 200 }
      );
    }

    // Return valid response with referrer name
    return NextResponse.json(
      {
        valid: true,
        referrerName: referralResult[0].referrerName,
      },
      { status: 200 }
    );

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