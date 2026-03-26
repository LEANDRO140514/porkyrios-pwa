import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Extract and validate ID from params
    const { id } = await context.params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const productId = parseInt(id);

    // Parse and validate request body
    const body = await request.json();
    const { featured } = body;

    // Validate featured field is provided
    if (featured === undefined || featured === null) {
      return NextResponse.json(
        { 
          error: 'Featured field is required',
          code: 'MISSING_FEATURED' 
        },
        { status: 400 }
      );
    }

    // Validate featured is a boolean
    if (typeof featured !== 'boolean') {
      return NextResponse.json(
        { 
          error: 'Featured must be a boolean value',
          code: 'INVALID_FEATURED' 
        },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { 
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Update product's featured field
    const updatedProduct = await db.update(products)
      .set({
        featured: featured
      })
      .where(eq(products.id, productId))
      .returning();

    return NextResponse.json(updatedProduct[0], { status: 200 });

  } catch (error) {
    console.error('PUT /api/products/[id]/featured error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}