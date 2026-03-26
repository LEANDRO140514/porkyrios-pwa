import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { lte, eq, and, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const thresholdParam = searchParams.get('threshold');

    // Validate threshold parameter
    let threshold = 10; // default value
    
    if (thresholdParam !== null) {
      const parsedThreshold = parseInt(thresholdParam);
      
      if (isNaN(parsedThreshold) || parsedThreshold <= 0) {
        return NextResponse.json(
          {
            error: 'Threshold must be a positive integer',
            code: 'INVALID_THRESHOLD'
          },
          { status: 400 }
        );
      }
      
      if (parsedThreshold > 100) {
        return NextResponse.json(
          {
            error: 'Threshold cannot exceed 100',
            code: 'THRESHOLD_EXCEEDS_MAX'
          },
          { status: 400 }
        );
      }
      
      threshold = parsedThreshold;
    }

    // Query products with low stock
    const lowStockProducts = await db
      .select()
      .from(products)
      .where(
        and(
          lte(products.stock, threshold),
          eq(products.active, true)
        )
      )
      .orderBy(asc(products.stock), asc(products.name));

    return NextResponse.json(lowStockProducts, { status: 200 });

  } catch (error) {
    console.error('GET low stock products error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}