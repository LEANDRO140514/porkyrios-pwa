import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, session } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function getUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  const record = await db.select({ userId: session.userId, expiresAt: session.expiresAt })
    .from(session).where(eq(session.token, token)).limit(1);
  if (record.length === 0 || new Date(record[0].expiresAt) < new Date()) return null;
  return record[0].userId;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const existing = await db.select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      status: reviews.status,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
    })
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ review: null }, { status: 200 });
    }

    return NextResponse.json({ review: existing[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
