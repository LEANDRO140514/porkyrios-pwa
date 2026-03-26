import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { referrals, user, session } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'MISSING_AUTH_TOKEN' 
      }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Query session table to validate token and get userId
    const sessionResult = await db.select({
      userId: session.userId,
      expiresAt: session.expiresAt
    })
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid or expired session',
        code: 'INVALID_SESSION' 
      }, { status: 401 });
    }

    const { userId, expiresAt } = sessionResult[0];

    // Check if session is expired
    if (new Date(expiresAt) < new Date()) {
      return NextResponse.json({ 
        error: 'Session expired',
        code: 'SESSION_EXPIRED' 
      }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Get total count of referrals for this user
    const totalResult = await db.select({ 
      count: sql<number>`count(*)` 
    })
      .from(referrals)
      .where(eq(referrals.referrerUserId, userId));

    const total = Number(totalResult[0].count);

    // Query referrals with user information
    const referralsList = await db.select({
      id: referrals.id,
      referralCode: referrals.referralCode,
      status: referrals.status,
      createdAt: referrals.createdAt,
      completedAt: referrals.completedAt,
      rewardCouponId: referrals.rewardCouponId,
      referredUserName: user.name,
      referredUserEmail: user.email
    })
      .from(referrals)
      .leftJoin(user, eq(referrals.referredUserId, user.id))
      .where(eq(referrals.referrerUserId, userId))
      .orderBy(desc(referrals.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      referrals: referralsList.map(r => ({
        id: r.id,
        referralCode: r.referralCode,
        status: r.status,
        referredUserName: r.referredUserName || null,
        referredUserEmail: r.referredUserEmail || null,
        createdAt: r.createdAt,
        completedAt: r.completedAt || null,
        rewardCouponId: r.rewardCouponId || null
      })),
      pagination: {
        limit,
        offset,
        total
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}