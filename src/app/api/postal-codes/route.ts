import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { postalCodes } from '@/db/schema';
import { eq, like, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(postalCodes)
        .where(eq(postalCodes.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Postal code not found', code: 'POSTAL_CODE_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const activeParam = searchParams.get('active');

    let query = db.select().from(postalCodes);

    // Apply filters
    const conditions = [];

    if (search) {
      conditions.push(like(postalCodes.code, `%${search}%`));
    }

    if (activeParam !== null) {
      const activeValue = activeParam === 'true';
      conditions.push(eq(postalCodes.active, activeValue));
    }

    if (conditions.length > 0) {
      query = query.where(
        conditions.length === 1 ? conditions[0] : conditions.reduce((acc, cond) => eq(acc, cond))
      );
    }

    const results = await query
      .orderBy(desc(postalCodes.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, municipality, state, deliveryCost, active } = body;

    // Validate required fields
    if (!code || typeof code !== 'string' || code.trim() === '') {
      return NextResponse.json(
        { error: 'Code is required and must be a non-empty string', code: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    // Validate deliveryCost if provided
    if (deliveryCost !== undefined && deliveryCost !== null) {
      const costNumber = parseFloat(deliveryCost);
      if (isNaN(costNumber) || costNumber < 0) {
        return NextResponse.json(
          { error: 'Delivery cost must be a positive number', code: 'INVALID_DELIVERY_COST' },
          { status: 400 }
        );
      }
    }

    const trimmedCode = code.trim();

    // Check for duplicate code
    const existing = await db
      .select()
      .from(postalCodes)
      .where(eq(postalCodes.code, trimmedCode))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Postal code already exists', code: 'DUPLICATE_CODE' },
        { status: 409 }
      );
    }

    // Prepare insert data
    const insertData: any = {
      code: trimmedCode,
      municipality: municipality ? municipality.trim() : null,
      state: state ? state.trim() : null,
      deliveryCost: deliveryCost !== undefined ? parseFloat(deliveryCost) : 35.00,
      active: active !== undefined ? active : true,
      createdAt: new Date().toISOString(),
    };

    const newRecord = await db
      .insert(postalCodes)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if postal code exists
    const existing = await db
      .select()
      .from(postalCodes)
      .where(eq(postalCodes.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Postal code not found', code: 'POSTAL_CODE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { municipality, state, deliveryCost, active } = body;

    // Validate deliveryCost if provided
    if (deliveryCost !== undefined && deliveryCost !== null) {
      const costNumber = parseFloat(deliveryCost);
      if (isNaN(costNumber) || costNumber < 0) {
        return NextResponse.json(
          { error: 'Delivery cost must be a positive number', code: 'INVALID_DELIVERY_COST' },
          { status: 400 }
        );
      }
    }

    // Prepare update data - only include defined fields
    const updateData: Record<string, any> = {};

    if (municipality !== undefined) {
      updateData.municipality = municipality ? municipality.trim() : null;
    }

    if (state !== undefined) {
      updateData.state = state ? state.trim() : null;
    }

    if (deliveryCost !== undefined && deliveryCost !== null) {
      updateData.deliveryCost = parseFloat(deliveryCost);
    }

    if (active !== undefined) {
      updateData.active = active ? 1 : 0;
    }

    const updated = await db
      .update(postalCodes)
      .set(updateData)
      .where(eq(postalCodes.id, parseInt(id)))
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if postal code exists
    const existing = await db
      .select()
      .from(postalCodes)
      .where(eq(postalCodes.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Postal code not found', code: 'POSTAL_CODE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(postalCodes)
      .where(eq(postalCodes.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Postal code deleted successfully',
        deletedRecord: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}