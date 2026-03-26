import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single category fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { 
            error: 'Valid ID is required',
            code: 'INVALID_ID' 
          },
          { status: 400 }
        );
      }

      const category = await db.select()
        .from(categories)
        .where(eq(categories.id, parseInt(id)))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json(
          { 
            error: 'Category not found',
            code: 'CATEGORY_NOT_FOUND' 
          },
          { status: 404 }
        );
      }

      return NextResponse.json(category[0], { status: 200 });
    }

    // List all categories with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(categories).orderBy(desc(categories.createdAt));

    if (search) {
      query = query.where(like(categories.name, `%${search}%`));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, emoji, image, active } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Name is required',
          code: 'MISSING_REQUIRED_FIELDS' 
        },
        { status: 400 }
      );
    }

    if (!emoji || emoji.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Emoji is required',
          code: 'MISSING_REQUIRED_FIELDS' 
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedEmoji = emoji.trim();

    // Prepare data with defaults and auto-generated fields
    const newCategory = await db.insert(categories)
      .values({
        name: sanitizedName,
        emoji: sanitizedEmoji,
        image: image ? image.trim() : null,
        active: active !== undefined ? active : true,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const categoryId = parseInt(id);

    // Check if category exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { 
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Get update data
    const body = await request.json();
    const updates: {
      name?: string;
      emoji?: string;
      image?: string | null;
      active?: boolean;
    } = {};

    // Build update object with only provided fields
    if (body.name !== undefined) {
      if (body.name.trim() === '') {
        return NextResponse.json(
          { 
            error: 'Name cannot be empty',
            code: 'INVALID_INPUT' 
          },
          { status: 400 }
        );
      }
      updates.name = body.name.trim();
    }

    if (body.emoji !== undefined) {
      if (body.emoji.trim() === '') {
        return NextResponse.json(
          { 
            error: 'Emoji cannot be empty',
            code: 'INVALID_INPUT' 
          },
          { status: 400 }
        );
      }
      updates.emoji = body.emoji.trim();
    }

    if (body.image !== undefined) {
      updates.image = body.image ? body.image.trim() : null;
    }

    if (body.active !== undefined) {
      updates.active = body.active;
    }

    // Perform update
    const updated = await db.update(categories)
      .set(updates)
      .where(eq(categories.id, categoryId))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const categoryId = parseInt(id);

    // Check if category exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { 
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Perform delete
    const deleted = await db.delete(categories)
      .where(eq(categories.id, categoryId))
      .returning();

    return NextResponse.json(
      {
        message: 'Category deleted successfully',
        category: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}