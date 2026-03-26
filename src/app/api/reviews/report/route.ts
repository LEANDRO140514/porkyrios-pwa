import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, reviewReports, session } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_REASONS = ['spam', 'offensive', 'inappropriate', 'fake'] as const;

export async function POST(request: NextRequest) {
  try {
    // Extract and validate Bearer token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado', code: 'MISSING_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Query session to get authenticated user
    const sessionRecord = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionRecord.length === 0) {
      return NextResponse.json(
        { error: 'No autorizado', code: 'INVALID_SESSION' },
        { status: 401 }
      );
    }

    const authenticatedUserId = sessionRecord[0].userId;

    // Parse and validate request body
    const body = await request.json();
    const { reviewId, reason, details } = body;

    // Validate reviewId
    if (!reviewId || isNaN(parseInt(reviewId.toString()))) {
      return NextResponse.json(
        { error: 'reviewId válido es requerido', code: 'INVALID_REVIEW_ID' },
        { status: 400 }
      );
    }

    const parsedReviewId = parseInt(reviewId.toString());

    // Validate reason
    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        {
          error: `reason debe ser uno de: ${VALID_REASONS.join(', ')}`,
          code: 'INVALID_REASON',
        },
        { status: 400 }
      );
    }

    // Check if review exists
    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, parsedReviewId))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Reseña no encontrada', code: 'REVIEW_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check for duplicate report
    const existingReport = await db
      .select()
      .from(reviewReports)
      .where(
        and(
          eq(reviewReports.reviewId, parsedReviewId),
          eq(reviewReports.reporterUserId, authenticatedUserId)
        )
      )
      .limit(1);

    if (existingReport.length > 0) {
      return NextResponse.json(
        { error: 'Ya has reportado esta reseña', code: 'DUPLICATE_REPORT' },
        { status: 409 }
      );
    }

    // Insert the report
    await db.insert(reviewReports).values({
      reviewId: parsedReviewId,
      reporterUserId: authenticatedUserId,
      reason,
      details: details || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    // Increment reported count
    const currentReview = existingReview[0];
    const newReportedCount = (currentReview.reportedCount || 0) + 1;

    // Check if auto-moderation threshold is reached
    let autoRejected = false;
    let message = 'Reseña reportada exitosamente';

    if (newReportedCount >= 3) {
      // Auto-reject the review
      await db
        .update(reviews)
        .set({
          reportedCount: newReportedCount,
          status: 'rejected',
          moderationReason: 'Múltiples reportes de usuarios',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(reviews.id, parsedReviewId));

      autoRejected = true;
      message = 'Reseña reportada y automáticamente rechazada por múltiples reportes';
    } else {
      // Just increment the count
      await db
        .update(reviews)
        .set({
          reportedCount: newReportedCount,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(reviews.id, parsedReviewId));
    }

    return NextResponse.json(
      {
        success: true,
        message,
        reportedCount: newReportedCount,
        autoRejected,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/reviews/report error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}