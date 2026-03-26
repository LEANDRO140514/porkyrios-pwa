import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { sql, gte, eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';

    // Validate period parameter
    const validPeriods = ['today', 'week', 'month', 'year'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        {
          error: 'Invalid period parameter. Must be one of: today, week, month, year',
          code: 'INVALID_PERIOD',
        },
        { status: 400 }
      );
    }

    // Calculate start date based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 364);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
    }

    const startDateISO = startDate.toISOString();

    // Query orders with grouping by date
    const results = await db
      .select({
        date: sql<string>`date(${orders.createdAt})`,
        total: sql<number>`CAST(SUM(${orders.total}) AS REAL)`,
        orders_count: sql<number>`CAST(COUNT(*) AS INTEGER)`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDateISO),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(sql`date(${orders.createdAt})`)
      .orderBy(sql`date(${orders.createdAt}) ASC`);

    // Format results to ensure proper types
    const formattedResults = results.map((row) => ({
      date: row.date,
      total: Number(row.total) || 0,
      orders_count: Number(row.orders_count) || 0,
    }));

    return NextResponse.json(formattedResults, { status: 200 });
  } catch (error) {
    console.error('GET sales analytics error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}