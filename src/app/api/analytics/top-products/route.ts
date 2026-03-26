import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orderItems, products, orders } from '@/db/schema';
import { sql, eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');

    // Validate limit parameter
    let limit = 10; // default
    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return NextResponse.json(
          {
            error: 'Limit must be a positive integer',
            code: 'INVALID_LIMIT',
          },
          { status: 400 }
        );
      }
      if (parsedLimit > 100) {
        return NextResponse.json(
          {
            error: 'Limit cannot exceed 100',
            code: 'LIMIT_EXCEEDED',
          },
          { status: 400 }
        );
      }
      limit = parsedLimit;
    }

    // Query top selling products with aggregations
    const topProducts = await db
      .select({
        product_id: orderItems.productId,
        product_name: products.name,
        total_quantity: sql<number>`CAST(SUM(${orderItems.quantity}) AS INTEGER)`,
        total_revenue: sql<number>`SUM(${orderItems.quantity} * ${orderItems.price})`,
        order_count: sql<number>`CAST(COUNT(DISTINCT ${orderItems.orderId}) AS INTEGER)`,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(orders.status, 'completed'))
      .groupBy(orderItems.productId, products.name)
      .orderBy(desc(sql`SUM(${orderItems.quantity} * ${orderItems.price})`))
      .limit(limit);

    return NextResponse.json(topProducts, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}