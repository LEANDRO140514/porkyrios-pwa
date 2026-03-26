import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { sql, gte, eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Calculate date boundaries
    const now = new Date();
    const today_start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const week_start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const month_start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const year_start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();

    // Query for total revenue and average order (all-time completed orders)
    const totalStats = await db
      .select({
        total_revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
        average_order: sql<number>`COALESCE(AVG(${orders.total}), 0)`,
      })
      .from(orders)
      .where(eq(orders.status, 'completed'));

    // Query for today's revenue
    const todayStats = await db
      .select({
        today_revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'completed'),
          gte(orders.createdAt, today_start)
        )
      );

    // Query for week revenue
    const weekStats = await db
      .select({
        week_revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'completed'),
          gte(orders.createdAt, week_start)
        )
      );

    // Query for month revenue
    const monthStats = await db
      .select({
        month_revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'completed'),
          gte(orders.createdAt, month_start)
        )
      );

    // Query for year revenue
    const yearStats = await db
      .select({
        year_revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'completed'),
          gte(orders.createdAt, year_start)
        )
      );

    // Combine results and round to 2 decimal places
    const statistics = {
      total_revenue: Math.round((totalStats[0]?.total_revenue || 0) * 100) / 100,
      average_order: Math.round((totalStats[0]?.average_order || 0) * 100) / 100,
      today_revenue: Math.round((todayStats[0]?.today_revenue || 0) * 100) / 100,
      week_revenue: Math.round((weekStats[0]?.week_revenue || 0) * 100) / 100,
      month_revenue: Math.round((monthStats[0]?.month_revenue || 0) * 100) / 100,
      year_revenue: Math.round((yearStats[0]?.year_revenue || 0) * 100) / 100,
    };

    return NextResponse.json(statistics, { status: 200 });
  } catch (error) {
    console.error('GET revenue statistics error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'REVENUE_STATS_ERROR',
      },
      { status: 500 }
    );
  }
}