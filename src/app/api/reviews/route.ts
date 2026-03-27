import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, user, orders, session } from '@/db/schema';
import { eq, desc, sql, and, gt } from 'drizzle-orm';

// Profanity filter
const OFFENSIVE_WORDS = ['puto', 'puta', 'pendejo', 'idiota', 'mierda', 'verga', 'chingar'];

function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return OFFENSIVE_WORDS.some(word => lowerText.includes(word));
}

// Get IP address from request
function getIpAddress(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  return realIp || null;
}

// Authenticate user from Bearer token
async function authenticateUser(request: NextRequest): Promise<{ id: string; email: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    
    const sessionRecord = await db.select({
      userId: session.userId,
      expiresAt: session.expiresAt
    })
      .from(session)
      .where(eq(session.token, token))
      .limit(1);
    
    if (sessionRecord.length === 0) {
      return null;
    }
    
    const sessionData = sessionRecord[0];
    
    // Check if session is expired
    if (new Date(sessionData.expiresAt) < new Date()) {
      return null;
    }
    
    const userRecord = await db.select({
      id: user.id,
      email: user.email
    })
      .from(user)
      .where(eq(user.id, sessionData.userId))
      .limit(1);
    
    if (userRecord.length === 0) {
      return null;
    }
    
    return userRecord[0];
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authenticatedUser = await authenticateUser(request);
    
    if (!authenticatedUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }
    
    const body = await request.json();
    const { rating, comment } = body;
    
    // Validate rating
    if (!rating || typeof rating !== 'number' || ![1, 2, 3, 4, 5].includes(rating)) {
      return NextResponse.json({ 
        error: 'La calificación debe ser un número entre 1 y 5',
        code: 'INVALID_RATING' 
      }, { status: 400 });
    }
    
    // Validate comment
    if (!comment || typeof comment !== 'string') {
      return NextResponse.json({ 
        error: 'El comentario es requerido',
        code: 'MISSING_COMMENT' 
      }, { status: 400 });
    }
    
    const trimmedComment = comment.trim();
    
    if (trimmedComment.length < 10) {
      return NextResponse.json({ 
        error: 'El comentario debe tener al menos 10 caracteres',
        code: 'COMMENT_TOO_SHORT' 
      }, { status: 400 });
    }
    
    if (trimmedComment.length > 500) {
      return NextResponse.json({ 
        error: 'El comentario no puede exceder 500 caracteres',
        code: 'COMMENT_TOO_LONG' 
      }, { status: 400 });
    }
    
    // Check for profanity
    if (containsProfanity(trimmedComment)) {
      return NextResponse.json({ 
        error: 'El comentario contiene palabras inapropiadas',
        code: 'PROFANITY_DETECTED' 
      }, { status: 400 });
    }
    
    // Check for existing review (upsert: update if exists)
    const existingReview = await db.select()
      .from(reviews)
      .where(eq(reviews.userId, authenticatedUser.id))
      .limit(1);

    if (existingReview.length > 0) {
      const updated = await db.update(reviews)
        .set({
          rating,
          comment: trimmedComment,
          status: 'pending',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(reviews.userId, authenticatedUser.id))
        .returning();

      return NextResponse.json({
        message: 'Reseña actualizada. Será revisada antes de publicarse.',
        review: updated[0],
        updated: true,
      }, { status: 200 });
    }

    // Get IP address and User-Agent
    const ipAddress = getIpAddress(request);
    const userAgent = request.headers.get('user-agent') || null;

    // Check for rate limiting (5 minutes cooldown) — only for new reviews
    if (ipAddress) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const recentReviews = await db.select()
        .from(reviews)
        .where(
          and(
            eq(reviews.ipAddress, ipAddress),
            gt(reviews.createdAt, fiveMinutesAgo)
          )
        )
        .limit(1);

      if (recentReviews.length > 0) {
        return NextResponse.json({
          error: 'Espera 5 minutos antes de enviar otra reseña',
          code: 'RATE_LIMIT_EXCEEDED'
        }, { status: 429 });
      }
    }

    // Check for verified purchase
    const completedOrders = await db.select()
      .from(orders)
      .where(
        and(
          eq(orders.customerEmail, authenticatedUser.email),
          eq(orders.status, 'completed')
        )
      )
      .limit(1);

    const isVerifiedPurchase = completedOrders.length > 0;

    // Insert new review
    const newReview = await db.insert(reviews)
      .values({
        userId: authenticatedUser.id,
        rating,
        comment: trimmedComment,
        status: 'pending',
        ipAddress,
        userAgent,
        isVerifiedPurchase,
        reportedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({
      message: 'Reseña enviada. Será revisada antes de publicarse.',
      review: newReview[0],
      updated: false,
    }, { status: 201 });
    
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 50);
    const offset = (page - 1) * limit;
    
    // Get approved reviews with user information
    const approvedReviews = await db.select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      userName: user.name,
      userEmail: user.email,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      createdAt: reviews.createdAt,
    })
      .from(reviews)
      .innerJoin(user, eq(reviews.userId, user.id))
      .where(eq(reviews.status, 'approved'))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count of approved reviews
    const totalCountResult = await db.select({ 
      count: sql<number>`count(*)` 
    })
      .from(reviews)
      .where(eq(reviews.status, 'approved'));
    
    const total = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);
    
    // Calculate average rating
    const avgRatingResult = await db.select({ 
      avgRating: sql<number>`avg(${reviews.rating})` 
    })
      .from(reviews)
      .where(eq(reviews.status, 'approved'));
    
    const averageRating = avgRatingResult[0]?.avgRating 
      ? Math.round(avgRatingResult[0].avgRating * 10) / 10 
      : 0;
    
    return NextResponse.json({
      reviews: approvedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      averageRating
    }, { status: 200 });
    
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}