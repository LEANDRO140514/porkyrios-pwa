import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const featuredProducts = await db.select()
      .from(products)
      .where(
        and(
          eq(products.featured, true),
          eq(products.active, true)
        )
      )
      .orderBy(desc(products.createdAt));

    return NextResponse.json(featuredProducts, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}