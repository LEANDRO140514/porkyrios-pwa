import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promotionalBanner } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const activeBanner = await db.select()
      .from(promotionalBanner)
      .where(eq(promotionalBanner.active, true))
      .limit(1);

    if (activeBanner.length === 0) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(activeBanner[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, couponCode, active } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ 
        error: 'Title is required',
        code: 'MISSING_TITLE' 
      }, { status: 400 });
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json({ 
        error: 'Description is required',
        code: 'MISSING_DESCRIPTION' 
      }, { status: 400 });
    }

    if (description.length > 120) {
      return NextResponse.json({ 
        error: 'Description cannot exceed 120 characters',
        code: 'DESCRIPTION_TOO_LONG' 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedTitle = title.trim();
    const sanitizedDescription = description.trim();
    const sanitizedCouponCode = couponCode ? couponCode.trim() : null;
    const isActive = active !== undefined ? Boolean(active) : true;

    // If the new banner is active, deactivate all existing banners
    if (isActive) {
      await db.update(promotionalBanner)
        .set({ active: false });
    }

    // Insert new banner
    const newBanner = await db.insert(promotionalBanner)
      .values({
        title: sanitizedTitle,
        description: sanitizedDescription,
        couponCode: sanitizedCouponCode,
        active: isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newBanner[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}