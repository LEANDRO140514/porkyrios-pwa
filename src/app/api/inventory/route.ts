import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    const productId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { stock } = body;

    // Validate stock is provided
    if (stock === undefined || stock === null) {
      return NextResponse.json(
        { 
          error: 'Stock is required',
          code: 'MISSING_STOCK' 
        },
        { status: 400 }
      );
    }

    // Validate stock is a valid non-negative integer
    if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { 
          error: 'Stock must be a non-negative integer',
          code: 'INVALID_STOCK' 
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

    // Update product stock
    const updatedProduct = await db.update(products)
      .set({
        stock: stock
      })
      .where(eq(products.id, productId))
      .returning();

    return NextResponse.json(updatedProduct[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}