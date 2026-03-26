import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { coupons } from '@/db/schema';
import { eq, like, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single coupon by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const coupon = await db
        .select()
        .from(coupons)
        .where(eq(coupons.id, parseInt(id)))
        .limit(1);

      if (coupon.length === 0) {
        return NextResponse.json(
          { error: 'Coupon not found', code: 'COUPON_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(coupon[0], { status: 200 });
    }

    // List coupons with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(coupons).orderBy(desc(coupons.createdAt));

    if (search) {
      query = query.where(like(coupons.code, `%${search.toUpperCase()}%`));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    const { code, type, value, minPurchase, maxDiscount, usageLimit, startDate, endDate, active } = body;

    // Validate required fields
    if (!code) {
      return NextResponse.json(
        { error: 'Code is required', code: 'MISSING_CODE' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required', code: 'MISSING_TYPE' },
        { status: 400 }
      );
    }

    if (value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Value is required', code: 'MISSING_VALUE' },
        { status: 400 }
      );
    }

    // Validate type
    if (type !== 'percentage' && type !== 'fixed') {
      return NextResponse.json(
        { error: 'Type must be either "percentage" or "fixed"', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    // Validate value
    if (typeof value !== 'number' || value <= 0) {
      return NextResponse.json(
        { error: 'Value must be a positive number', code: 'INVALID_VALUE' },
        { status: 400 }
      );
    }

    if (type === 'percentage' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: 'Percentage value must be between 0 and 100', code: 'INVALID_PERCENTAGE' },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (minPurchase !== undefined && minPurchase !== null && (typeof minPurchase !== 'number' || minPurchase <= 0)) {
      return NextResponse.json(
        { error: 'Min purchase must be a positive number', code: 'INVALID_MIN_PURCHASE' },
        { status: 400 }
      );
    }

    if (maxDiscount !== undefined && maxDiscount !== null && (typeof maxDiscount !== 'number' || maxDiscount <= 0)) {
      return NextResponse.json(
        { error: 'Max discount must be a positive number', code: 'INVALID_MAX_DISCOUNT' },
        { status: 400 }
      );
    }

    if (usageLimit !== undefined && usageLimit !== null && (typeof usageLimit !== 'number' || usageLimit <= 0 || !Number.isInteger(usageLimit))) {
      return NextResponse.json(
        { error: 'Usage limit must be a positive integer', code: 'INVALID_USAGE_LIMIT' },
        { status: 400 }
      );
    }

    // Validate date formats if provided
    if (startDate && isNaN(Date.parse(startDate))) {
      return NextResponse.json(
        { error: 'Start date must be a valid ISO timestamp', code: 'INVALID_START_DATE' },
        { status: 400 }
      );
    }

    if (endDate && isNaN(Date.parse(endDate))) {
      return NextResponse.json(
        { error: 'End date must be a valid ISO timestamp', code: 'INVALID_END_DATE' },
        { status: 400 }
      );
    }

    // Auto-uppercase the code
    const uppercaseCode = code.toUpperCase();

    // Check for duplicate code
    const existingCoupon = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, uppercaseCode))
      .limit(1);

    if (existingCoupon.length > 0) {
      return NextResponse.json(
        { error: 'Coupon code already exists', code: 'DUPLICATE_CODE' },
        { status: 409 }
      );
    }

    // Prepare insert data
    const insertData: any = {
      code: uppercaseCode,
      type,
      value,
      usedCount: 0,
      active: active !== undefined ? active : true,
      createdAt: new Date().toISOString(),
    };

    if (minPurchase !== undefined && minPurchase !== null) {
      insertData.minPurchase = minPurchase;
    }

    if (maxDiscount !== undefined && maxDiscount !== null) {
      insertData.maxDiscount = maxDiscount;
    }

    if (usageLimit !== undefined && usageLimit !== null) {
      insertData.usageLimit = usageLimit;
    }

    if (startDate) {
      insertData.startDate = startDate;
    }

    if (endDate) {
      insertData.endDate = endDate;
    }

    // Insert coupon
    const newCoupon = await db.insert(coupons).values(insertData).returning();

    return NextResponse.json(newCoupon[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const couponId = parseInt(id);

    // Check if coupon exists
    const existingCoupon = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, couponId))
      .limit(1);

    if (existingCoupon.length === 0) {
      return NextResponse.json(
        { error: 'Coupon not found', code: 'COUPON_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { code, type, value, minPurchase, maxDiscount, usageLimit, startDate, endDate, active } = body;

    // Prepare update data
    const updateData: Record<string, any> = {};

    // Validate and add code if provided
    if (code !== undefined) {
      const uppercaseCode = code.toUpperCase();
      
      // Check for duplicate code (excluding current coupon)
      const duplicateCheck = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, uppercaseCode))
        .limit(1);

      if (duplicateCheck.length > 0 && duplicateCheck[0].id !== couponId) {
        return NextResponse.json(
          { error: 'Coupon code already exists', code: 'DUPLICATE_CODE' },
          { status: 409 }
        );
      }

      updateData.code = uppercaseCode;
    }

    // Validate and add type if provided
    if (type !== undefined) {
      if (type !== 'percentage' && type !== 'fixed') {
        return NextResponse.json(
          { error: 'Type must be either "percentage" or "fixed"', code: 'INVALID_TYPE' },
          { status: 400 }
        );
      }
      updateData.type = type;
    }

    // Validate and add value if provided
    if (value !== undefined) {
      if (typeof value !== 'number' || value <= 0) {
        return NextResponse.json(
          { error: 'Value must be a positive number', code: 'INVALID_VALUE' },
          { status: 400 }
        );
      }

      const finalType = type !== undefined ? type : existingCoupon[0].type;
      if (finalType === 'percentage' && (value < 0 || value > 100)) {
        return NextResponse.json(
          { error: 'Percentage value must be between 0 and 100', code: 'INVALID_PERCENTAGE' },
          { status: 400 }
        );
      }

      updateData.value = value;
    }

    // Validate and add optional fields
    if (minPurchase !== undefined) {
      if (minPurchase !== null && (typeof minPurchase !== 'number' || minPurchase <= 0)) {
        return NextResponse.json(
          { error: 'Min purchase must be a positive number', code: 'INVALID_MIN_PURCHASE' },
          { status: 400 }
        );
      }
      updateData.minPurchase = minPurchase;
    }

    if (maxDiscount !== undefined) {
      if (maxDiscount !== null && (typeof maxDiscount !== 'number' || maxDiscount <= 0)) {
        return NextResponse.json(
          { error: 'Max discount must be a positive number', code: 'INVALID_MAX_DISCOUNT' },
          { status: 400 }
        );
      }
      updateData.maxDiscount = maxDiscount;
    }

    if (usageLimit !== undefined) {
      if (usageLimit !== null && (typeof usageLimit !== 'number' || usageLimit <= 0 || !Number.isInteger(usageLimit))) {
        return NextResponse.json(
          { error: 'Usage limit must be a positive integer', code: 'INVALID_USAGE_LIMIT' },
          { status: 400 }
        );
      }
      updateData.usageLimit = usageLimit;
    }

    if (startDate !== undefined) {
      if (startDate !== null && isNaN(Date.parse(startDate))) {
        return NextResponse.json(
          { error: 'Start date must be a valid ISO timestamp', code: 'INVALID_START_DATE' },
          { status: 400 }
        );
      }
      updateData.startDate = startDate;
    }

    if (endDate !== undefined) {
      if (endDate !== null && isNaN(Date.parse(endDate))) {
        return NextResponse.json(
          { error: 'End date must be a valid ISO timestamp', code: 'INVALID_END_DATE' },
          { status: 400 }
        );
      }
      updateData.endDate = endDate;
    }

    if (active !== undefined) {
      updateData.active = active;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    // Update coupon
    const updated = await db
      .update(coupons)
      .set(updateData)
      .where(eq(coupons.id, couponId))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if coupon exists
    const existingCoupon = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, parseInt(id)))
      .limit(1);

    if (existingCoupon.length === 0) {
      return NextResponse.json(
        { error: 'Coupon not found', code: 'COUPON_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete coupon
    const deleted = await db
      .delete(coupons)
      .where(eq(coupons.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Coupon deleted successfully',
        coupon: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}