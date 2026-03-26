import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, session } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Extract and validate ID from route params
    const { id } = await context.params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'ID válido es requerido', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Extract Bearer token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Query session table to authenticate
    const sessionResult = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return NextResponse.json(
        { error: 'No autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const authenticatedUserId = sessionResult[0].userId;

    // Parse and validate request body
    const body = await request.json();
    const { status: reviewStatus, moderationReason } = body;

    // Validate status field
    if (!reviewStatus || (reviewStatus !== 'approved' && reviewStatus !== 'rejected')) {
      return NextResponse.json(
        { 
          error: 'El estado debe ser "approved" o "rejected"', 
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    // Validate moderationReason is required for rejected status
    if (reviewStatus === 'rejected' && (!moderationReason || moderationReason.trim() === '')) {
      return NextResponse.json(
        { 
          error: 'La razón de moderación es requerida para reseñas rechazadas', 
          code: 'MISSING_MODERATION_REASON' 
        },
        { status: 400 }
      );
    }

    // Check if review exists
    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Reseña no encontrada', code: 'REVIEW_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update review with moderation data
    const updated = await db
      .update(reviews)
      .set({
        status: reviewStatus,
        moderationReason: reviewStatus === 'rejected' ? moderationReason.trim() : null,
        moderatedAt: new Date().toISOString(),
        moderatedBy: authenticatedUserId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(reviews.id, parseInt(id)))
      .returning();

    const message = reviewStatus === 'approved' 
      ? 'Reseña aprobada exitosamente' 
      : 'Reseña rechazada exitosamente';

    return NextResponse.json(
      {
        success: true,
        message,
        review: updated[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/reviews/admin/[id] error:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}