import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryMovements, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, newStock, reason, createdBy } = body;

    // Validate required fields
    if (productId === undefined || productId === null) {
      return NextResponse.json(
        {
          error: 'productId is required',
          code: 'MISSING_PRODUCT_ID',
        },
        { status: 400 }
      );
    }

    if (newStock === undefined || newStock === null) {
      return NextResponse.json(
        {
          error: 'newStock is required',
          code: 'MISSING_NEW_STOCK',
        },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      return NextResponse.json(
        {
          error: 'reason is required and must be a non-empty string',
          code: 'MISSING_REASON',
        },
        { status: 400 }
      );
    }

    if (!createdBy || typeof createdBy !== 'string' || createdBy.trim() === '') {
      return NextResponse.json(
        {
          error: 'createdBy is required and must be a non-empty string',
          code: 'MISSING_CREATED_BY',
        },
        { status: 400 }
      );
    }

    // Validate productId is valid integer
    const parsedProductId = parseInt(productId as string);
    if (isNaN(parsedProductId)) {
      return NextResponse.json(
        {
          error: 'productId must be a valid integer',
          code: 'INVALID_PRODUCT_ID',
        },
        { status: 400 }
      );
    }

    // Validate newStock is non-negative integer
    const parsedNewStock = parseInt(newStock as string);
    if (isNaN(parsedNewStock) || parsedNewStock < 0) {
      return NextResponse.json(
        {
          error: 'newStock must be a non-negative integer',
          code: 'INVALID_NEW_STOCK',
        },
        { status: 400 }
      );
    }

    // Check if product exists and get current stock
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, parsedProductId))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        {
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const currentProduct = product[0];
    const previousStock = currentProduct.stock ?? 0;
    const quantity = parsedNewStock - previousStock;

    // Use transaction to insert movement and update stock
    const result = await db.transaction(async (tx) => {
      // Insert inventory movement
      const movement = await tx
        .insert(inventoryMovements)
        .values({
          productId: parsedProductId,
          type: 'adjustment',
          quantity: quantity,
          previousStock: previousStock,
          newStock: parsedNewStock,
          reason: reason.trim(),
          createdBy: createdBy.trim(),
          createdAt: new Date(),
        })
        .returning();

      // Update product stock
      await tx
        .update(products)
        .set({ stock: parsedNewStock })
        .where(eq(products.id, parsedProductId));

      return movement[0];
    });

    // Return response with product name
    return NextResponse.json(
      {
        id: result.id,
        productId: result.productId,
        productName: currentProduct.name,
        type: result.type,
        quantity: result.quantity,
        previousStock: result.previousStock,
        newStock: result.newStock,
        reason: result.reason,
        createdBy: result.createdBy,
        createdAt: result.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}