import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { session, referrals } from '@/db/schema';
import { eq, and, or, sql } from 'drizzle-orm';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REF-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function generateUniqueReferralCode(): Promise<string> {
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    code = generateReferralCode();
    const existing = await db.select()
      .from(referrals)
      .where(eq(referrals.referralCode, code))
      .limit(1);
    
    if (existing.length === 0) {
      isUnique = true;
      return code;
    }
    attempts++;
  }

  throw new Error('Failed to generate unique referral code');
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'MISSING_AUTH_TOKEN' 
      }, { status: 401 });
    }

    const token = authHeader.substring(7);

    const sessionRecord = await db.select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid or expired session',
        code: 'INVALID_SESSION' 
      }, { status: 401 });
    }

    const userSession = sessionRecord[0];
    
    if (new Date(userSession.expiresAt) < new Date()) {
      return NextResponse.json({ 
        error: 'Session expired',
        code: 'SESSION_EXPIRED' 
      }, { status: 401 });
    }

    const userId = userSession.userId;

    const existingReferral = await db.select()
      .from(referrals)
      .where(
        and(
          eq(referrals.referrerUserId, userId),
          or(
            eq(referrals.status, 'pending'),
            eq(referrals.status, 'completed')
          )
        )
      )
      .limit(1);

    let referralCode: string;

    if (existingReferral.length > 0) {
      referralCode = existingReferral[0].referralCode;
    } else {
      referralCode = await generateUniqueReferralCode();
      
      await db.insert(referrals).values({
        referrerUserId: userId,
        referralCode: referralCode,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    }

    const allReferrals = await db.select()
      .from(referrals)
      .where(eq(referrals.referrerUserId, userId));

    const total_referrals = allReferrals.length;
    const pending_referrals = allReferrals.filter(r => r.status === 'pending').length;
    const completed_referrals = allReferrals.filter(r => 
      r.status === 'completed' || r.status === 'rewarded'
    ).length;

    return NextResponse.json({
      referralCode,
      stats: {
        total_referrals,
        pending_referrals,
        completed_referrals
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET referral code error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}