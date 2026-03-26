import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, user, reviewReports, session } from '@/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'No autorizado',
        code: 'MISSING_TOKEN' 
      }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Query session table to validate token
    const sessionResult = await db.select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return NextResponse.json({ 
        error: 'No autorizado',
        code: 'INVALID_TOKEN' 
      }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate status parameter if provided
    if (statusParam && !['pending', 'approved', 'rejected'].includes(statusParam)) {
      return NextResponse.json({ 
        error: 'Invalid status filter. Must be: pending, approved, or rejected',
        code: 'INVALID_STATUS' 
      }, { status: 400 });
    }

    // Build query with LEFT JOIN to user table
    let query = db.select({
      id: reviews.id,
      userId: reviews.userId,
      userName: user.name,
      userEmail: user.email,
      rating: reviews.rating,
      comment: reviews.comment,
      status: reviews.status,
      moderationReason: reviews.moderationReason,
      ipAddress: reviews.ipAddress,
      userAgent: reviews.userAgent,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      reportedCount: reviews.reportedCount,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      moderatedAt: reviews.moderatedAt,
      moderatedBy: reviews.moderatedBy,
    })
      .from(reviews)
      .leftJoin(user, eq(reviews.userId, user.id));

    // Apply status filter if provided
    if (statusParam) {
      query = query.where(eq(reviews.status, statusParam));
    }

    // Apply ordering and pagination
    const reviewsResult = await query
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);

    // Get reports for each review
    const reviewsWithReports = await Promise.all(
      reviewsResult.map(async (review) => {
        const reportsResult = await db.select({
          id: reviewReports.id,
          reporterUserId: reviewReports.reporterUserId,
          reporterName: user.name,
          reason: reviewReports.reason,
          details: reviewReports.details,
          status: reviewReports.status,
          createdAt: reviewReports.createdAt,
        })
          .from(reviewReports)
          .leftJoin(user, eq(reviewReports.reporterUserId, user.id))
          .where(eq(reviewReports.reviewId, review.id));

        return {
          ...review,
          reports: reportsResult,
        };
      })
    );

    // Get total count with same filters
    let countQuery = db.select({ count: sql<number>`count(*)` })
      .from(reviews);

    if (statusParam) {
      countQuery = countQuery.where(eq(reviews.status, statusParam));
    }

    const countResult = await countQuery;
    const total = countResult[0]?.count || 0;

    return NextResponse.json({
      reviews: reviewsWithReports,
      pagination: {
        limit,
        offset,
        total,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}