import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, inventoryMovements } from '@/db/schema';
import { sql, eq, lte, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Calculate timestamp for 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Execute all queries in parallel for performance
    const [
      totalProductsResult,
      activeProductsResult,
      totalStockValueResult,
      lowStockResult,
      outOfStockResult,
      recentMovementsResult,
      totalMovementsResult,
    ] = await Promise.all([
      // Total products count
      db.select({ count: sql<number>`count(*)` })
        .from(products),

      // Active products count
      db.select({ count: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.active, true)),

      // Total stock value (price * stock for all products)
      db.select({ 
        value: sql<number>`COALESCE(SUM(${products.price} * ${products.stock}), 0)` 
      })
        .from(products),

      // Low stock count (stock <= 10)
      db.select({ count: sql<number>`count(*)` })
        .from(products)
        .where(lte(products.stock, 10)),

      // Out of stock count (stock = 0)
      db.select({ count: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.stock, 0)),

      // Recent movements count (last 7 days)
      db.select({ count: sql<number>`count(*)` })
        .from(inventoryMovements)
        .where(gte(inventoryMovements.createdAt, sevenDaysAgo)),

      // Total movements count
      db.select({ count: sql<number>`count(*)` })
        .from(inventoryMovements),
    ]);

    // Extract values from query results
    const totalProducts = totalProductsResult[0]?.count ?? 0;
    const activeProducts = activeProductsResult[0]?.count ?? 0;
    const totalStockValue = Number((totalStockValueResult[0]?.value ?? 0).toFixed(2));
    const lowStockCount = lowStockResult[0]?.count ?? 0;
    const outOfStockCount = outOfStockResult[0]?.count ?? 0;
    const recentMovementsCount = recentMovementsResult[0]?.count ?? 0;
    const totalMovements = totalMovementsResult[0]?.count ?? 0;

    // Return comprehensive inventory report
    return NextResponse.json({
      total_products: totalProducts,
      active_products: activeProducts,
      total_stock_value: totalStockValue,
      low_stock_count: lowStockCount,
      out_of_stock_count: outOfStockCount,
      recent_movements_count: recentMovementsCount,
      total_movements: totalMovements,
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}