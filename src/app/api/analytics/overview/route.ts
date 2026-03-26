import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, products } from '@/db/schema';
import { sql, eq, lte, notInArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Execute all queries in parallel for optimal performance
    const [
      orderStats,
      revenueStats,
      productStats,
      customerStats
    ] = await Promise.all([
      // Order statistics - total, completed, cancelled, active
      db.select({
        total_orders: sql<number>`COUNT(*)`,
        completed_orders: sql<number>`SUM(CASE WHEN ${orders.status} = 'completed' THEN 1 ELSE 0 END)`,
        cancelled_orders: sql<number>`SUM(CASE WHEN ${orders.status} = 'cancelled' THEN 1 ELSE 0 END)`,
        active_orders: sql<number>`SUM(CASE WHEN ${orders.status} NOT IN ('completed', 'cancelled') THEN 1 ELSE 0 END)`
      }).from(orders),

      // Revenue statistics - total revenue and average order from completed orders
      db.select({
        total_revenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.status} = 'completed' THEN ${orders.total} ELSE 0 END), 0)`,
        average_order: sql<number>`COALESCE(AVG(CASE WHEN ${orders.status} = 'completed' THEN ${orders.total} ELSE NULL END), 0)`
      }).from(orders),

      // Product statistics - total products and low stock count
      db.select({
        total_products: sql<number>`COUNT(*)`,
        low_stock_products: sql<number>`SUM(CASE WHEN ${products.stock} <= 10 THEN 1 ELSE 0 END)`
      }).from(products),

      // Customer statistics - distinct email count
      db.select({
        total_customers: sql<number>`COUNT(DISTINCT ${orders.customerEmail})`
      }).from(orders)
    ]);

    // Extract results with safe defaults
    const orderStatsData = orderStats[0] || {
      total_orders: 0,
      completed_orders: 0,
      cancelled_orders: 0,
      active_orders: 0
    };

    const revenueStatsData = revenueStats[0] || {
      total_revenue: 0,
      average_order: 0
    };

    const productStatsData = productStats[0] || {
      total_products: 0,
      low_stock_products: 0
    };

    const customerStatsData = customerStats[0] || {
      total_customers: 0
    };

    // Combine all statistics into single response object
    const overview = {
      total_orders: Number(orderStatsData.total_orders) || 0,
      completed_orders: Number(orderStatsData.completed_orders) || 0,
      cancelled_orders: Number(orderStatsData.cancelled_orders) || 0,
      active_orders: Number(orderStatsData.active_orders) || 0,
      total_revenue: Math.round((Number(revenueStatsData.total_revenue) || 0) * 100) / 100,
      average_order: Math.round((Number(revenueStatsData.average_order) || 0) * 100) / 100,
      total_products: Number(productStatsData.total_products) || 0,
      low_stock_products: Number(productStatsData.low_stock_products) || 0,
      total_customers: Number(customerStatsData.total_customers) || 0
    };

    return NextResponse.json(overview, { status: 200 });

  } catch (error) {
    console.error('GET dashboard overview error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}