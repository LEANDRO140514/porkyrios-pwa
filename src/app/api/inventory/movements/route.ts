import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryMovements, products } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

const VALID_TYPES = ['addition', 'reduction', 'adjustment', 'sale', 'return'] as const;
type MovementType = typeof VALID_TYPES[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, type, quantity, reason, orderId, createdBy } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required', code: 'MISSING_PRODUCT_ID' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'type is required', code: 'MISSING_TYPE' },
        { status: 400 }
      );
    }

    if (quantity === undefined || quantity === null) {
      return NextResponse.json(
        { error: 'quantity is required', code: 'MISSING_QUANTITY' },
        { status: 400 }
      );
    }

    // Validate productId is valid integer
    const parsedProductId = parseInt(productId);
    if (isNaN(parsedProductId)) {
      return NextResponse.json(
        { error: 'productId must be a valid integer', code: 'INVALID_PRODUCT_ID' },
        { status: 400 }
      );
    }

    // Validate type
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { 
          error: `type must be one of: ${VALID_TYPES.join(', ')}`, 
          code: 'INVALID_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate quantity is positive integer
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return NextResponse.json(
        { error: 'quantity must be a positive integer', code: 'INVALID_QUANTITY' },
        { status: 400 }
      );
    }

    // Fetch product to get current stock
    const product = await db.select()
      .from(products)
      .where(eq(products.id, parsedProductId))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const currentStock = product[0].stock ?? 0;
    const previousStock = currentStock;
    let newStock: number;

    // Calculate newStock based on type
    switch (type as MovementType) {
      case 'addition':
        newStock = previousStock + parsedQuantity;
        break;
      case 'reduction':
        newStock = previousStock - parsedQuantity;
        break;
      case 'adjustment':
        newStock = parsedQuantity;
        break;
      case 'sale':
        newStock = previousStock - parsedQuantity;
        break;
      case 'return':
        newStock = previousStock + parsedQuantity;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid movement type', code: 'INVALID_TYPE' },
          { status: 400 }
        );
    }

    // Validate newStock is not negative
    if (newStock < 0) {
      return NextResponse.json(
        { 
          error: 'Operation would result in negative stock', 
          code: 'NEGATIVE_STOCK',
          details: {
            currentStock: previousStock,
            requestedQuantity: parsedQuantity,
            resultingStock: newStock
          }
        },
        { status: 400 }
      );
    }

    // Use transaction to insert movement and update product stock
    const result = await db.transaction(async (tx) => {
      // Insert inventory movement
      const movement = await tx.insert(inventoryMovements)
        .values({
          productId: parsedProductId,
          type,
          quantity: parsedQuantity,
          previousStock,
          newStock,
          reason: reason?.trim() || null,
          orderId: orderId ? parseInt(orderId) : null,
          createdBy: createdBy?.trim() || null,
          createdAt: new Date()
        })
        .returning();

      // Update product stock
      await tx.update(products)
        .set({ stock: newStock })
        .where(eq(products.id, parsedProductId));

      return movement[0];
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('POST inventory_movements error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query with join to products table
    let query = db.select({
      id: inventoryMovements.id,
      productId: inventoryMovements.productId,
      productName: products.name,
      type: inventoryMovements.type,
      quantity: inventoryMovements.quantity,
      previousStock: inventoryMovements.previousStock,
      newStock: inventoryMovements.newStock,
      reason: inventoryMovements.reason,
      orderId: inventoryMovements.orderId,
      createdBy: inventoryMovements.createdBy,
      createdAt: inventoryMovements.createdAt
    })
    .from(inventoryMovements)
    .leftJoin(products, eq(inventoryMovements.productId, products.id));

    // Build where conditions
    const conditions = [];

    // Filter by productId
    if (productId) {
      const parsedProductId = parseInt(productId);
      if (!isNaN(parsedProductId)) {
        conditions.push(eq(inventoryMovements.productId, parsedProductId));
      }
    }

    // Filter by type
    if (type && VALID_TYPES.includes(type as MovementType)) {
      conditions.push(eq(inventoryMovements.type, type));
    }

    // Filter by date range
    if (startDate) {
      try {
        const startDateObj = new Date(startDate);
        if (!isNaN(startDateObj.getTime())) {
          conditions.push(gte(inventoryMovements.createdAt, startDateObj));
        }
      } catch (error) {
        console.error('Invalid startDate:', error);
      }
    }

    if (endDate) {
      try {
        const endDateObj = new Date(endDate);
        if (!isNaN(endDateObj.getTime())) {
          conditions.push(lte(inventoryMovements.createdAt, endDateObj));
        }
      } catch (error) {
        console.error('Invalid endDate:', error);
      }
    }

    // Apply where conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    // Apply ordering, limit, and offset
    const results = await query
      .orderBy(desc(inventoryMovements.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET inventory_movements error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}