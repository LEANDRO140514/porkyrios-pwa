import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, session } from '@/db/schema';
import { sql, eq, and, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify session exists
    const sessionResult = await db.select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    // Execute all queries in parallel for performance
    const [
      totalResult,
      pendingResult,
      approvedResult,
      rejectedResult,
      averageRatingResult,
      ratingDistributionResult,
      recentActivityResult
    ] = await Promise.all([
      // 1. Total Reviews Count
      db.select({ count: sql<number>`count(*)` })
        .from(reviews),

      // 2. Pending Reviews Count
      db.select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(eq(reviews.status, 'pending')),

      // 3. Approved Reviews Count
      db.select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(eq(reviews.status, 'approved')),

      // 4. Rejected Reviews Count
      db.select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(eq(reviews.status, 'rejected')),

      // 5. Average Rating (Approved Only)
      db.select({ avg: sql<number>`avg(${reviews.rating})` })
        .from(reviews)
        .where(eq(reviews.status, 'approved')),

      // 6. Rating Distribution (Approved Only)
      db.select({ 
        rating: reviews.rating, 
        count: sql<number>`count(*)` 
      })
        .from(reviews)
        .where(eq(reviews.status, 'approved'))
        .groupBy(reviews.rating),

      // 7. Recent Activity (Last 7 Days)
      db.select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(gte(reviews.createdAt, sevenDaysAgoISO))
    ]);

    // Process results
    const total = Number(totalResult[0]?.count ?? 0);
    const pending = Number(pendingResult[0]?.count ?? 0);
    const approved = Number(approvedResult[0]?.count ?? 0);
    const rejected = Number(rejectedResult[0]?.count ?? 0);

    // Calculate average rating, round to 2 decimal places
    const avgRating = averageRatingResult[0]?.avg;
    const averageRating = avgRating ? Math.round(Number(avgRating) * 100) / 100 : 0;

    // Format rating distribution
    const ratingDistribution: { [key: string]: number } = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    };

    for (const row of ratingDistributionResult) {
      if (row.rating >= 1 && row.rating <= 5) {
        ratingDistribution[row.rating.toString()] = Number(row.count);
      }
    }

    const recentActivity = Number(recentActivityResult[0]?.count ?? 0);

    // Return formatted response
    return NextResponse.json({
      total,
      pending,
      approved,
      rejected,
      averageRating,
      ratingDistribution,
      recentActivity
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}