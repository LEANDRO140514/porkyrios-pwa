import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orderItems, orders, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId || isNaN(parseInt(orderId))) {
      return NextResponse.json(
        { error: 'Valid order ID is required', code: 'INVALID_ORDER_ID' },
        { status: 400 }
      );
    }

    // Get order items with product details
    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        productName: products.name,
        productImage: products.image,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, parseInt(orderId)));

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, productId, quantity, price } = body;

    // Validate required fields
    if (!orderId || isNaN(parseInt(orderId))) {
      return NextResponse.json(
        { error: 'Valid order ID is required', code: 'INVALID_ORDER_ID' },
        { status: 400 }
      );
    }

    if (!productId || isNaN(parseInt(productId))) {
      return NextResponse.json(
        { error: 'Valid product ID is required', code: 'INVALID_PRODUCT_ID' },
        { status: 400 }
      );
    }

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be positive', code: 'INVALID_QUANTITY' },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || price < 0) {
      return NextResponse.json(
        { error: 'Valid price is required', code: 'INVALID_PRICE' },
        { status: 400 }
      );
    }

    // Verify order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(orderId)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(productId)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Create order item
    const newItem = await db
      .insert(orderItems)
      .values({
        orderId: parseInt(orderId),
        productId: parseInt(productId),
        quantity,
        price,
      })
      .returning();

    return NextResponse.json(newItem[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}