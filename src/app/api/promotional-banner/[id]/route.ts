import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promotionalBanner } from '@/db/schema';
import { eq, ne } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const bannerId = parseInt(id);

    const body = await request.json();
    const { title, description, couponCode, active } = body;

    if (description !== undefined && description.length > 120) {
      return NextResponse.json(
        {
          error: 'Description cannot exceed 120 characters',
          code: 'DESCRIPTION_TOO_LONG',
        },
        { status: 400 }
      );
    }

    const existingBanner = await db
      .select()
      .from(promotionalBanner)
      .where(eq(promotionalBanner.id, bannerId))
      .limit(1);

    if (existingBanner.length === 0) {
      return NextResponse.json(
        { error: 'Promotional banner not found', code: 'BANNER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (active === true) {
      await db
        .update(promotionalBanner)
        .set({ active: false })
        .where(ne(promotionalBanner.id, bannerId));
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (couponCode !== undefined) updates.couponCode = couponCode;
    if (active !== undefined) updates.active = active;

    const updatedBanner = await db
      .update(promotionalBanner)
      .set(updates)
      .where(eq(promotionalBanner.id, bannerId))
      .returning();

    return NextResponse.json(updatedBanner[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const bannerId = parseInt(id);

    const existingBanner = await db
      .select()
      .from(promotionalBanner)
      .where(eq(promotionalBanner.id, bannerId))
      .limit(1);

    if (existingBanner.length === 0) {
      return NextResponse.json(
        { error: 'Promotional banner not found', code: 'BANNER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(promotionalBanner)
      .where(eq(promotionalBanner.id, bannerId))
      .returning();

    return NextResponse.json(
      {
        message: 'Promotional banner deleted successfully',
        banner: deleted[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}