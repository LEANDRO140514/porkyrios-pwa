import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, settings } from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import * as Sentry from '@sentry/nextjs';
import { syncOrderToGHL } from '@/lib/ghl';

const VALID_STATUSES = ['pending_payment', 'preparing', 'cooking', 'packing', 'ready', 'completed', 'cancelled'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single order by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, parseInt(id)))
        .limit(1);

      if (order.length === 0) {
        return NextResponse.json(
          { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(order[0], { status: 200 });
    }

    // List orders with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const orderNumber = searchParams.get('orderNumber');

    let query = db.select().from(orders);

    const conditions = [];

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status value', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      conditions.push(eq(orders.status, status));
    }

    if (orderNumber) {
      conditions.push(eq(orders.orderNumber, orderNumber));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    
    // Capture error in Sentry
    Sentry.captureException(error, {
      tags: {
        api_route: '/api/orders',
        method: 'GET',
      },
      contexts: {
        request: {
          url: request.url,
        },
      },
    });
    
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, customerName, customerEmail, phone, deliveryAddress, total, status } = body;

    // Validate required fields
    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required', code: 'MISSING_ORDER_NUMBER' },
        { status: 400 }
      );
    }

    if (!customerName) {
      return NextResponse.json(
        { error: 'Customer name is required', code: 'MISSING_CUSTOMER_NAME' },
        { status: 400 }
      );
    }

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email is required', code: 'MISSING_CUSTOMER_EMAIL' },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone is required', code: 'MISSING_PHONE' },
        { status: 400 }
      );
    }

    if (total === undefined || total === null) {
      return NextResponse.json(
        { error: 'Total is required', code: 'MISSING_TOTAL' },
        { status: 400 }
      );
    }

    // Validate total is positive
    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json(
        { error: 'Total must be a positive number', code: 'INVALID_TOTAL' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Check for duplicate orderNumber
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber.trim()))
      .limit(1);

    if (existingOrder.length > 0) {
      return NextResponse.json(
        { error: 'Order number already exists', code: 'DUPLICATE_ORDER_NUMBER' },
        { status: 409 }
      );
    }

    // Create new order
    const now = new Date().toISOString();
    const newOrder = await db
      .insert(orders)
      .values({
        orderNumber: orderNumber.trim(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        phone: phone.trim(),
        deliveryAddress: deliveryAddress ? deliveryAddress.trim() : null,
        total,
        status: status || 'preparing',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // ── GHL sync (non-blocking) ──────────────────────────────────
    try {
      const ghlRows = await db
        .select()
        .from(settings)
        .where(inArray(settings.key, ['ghl_enabled', 'ghl_api_key', 'ghl_location_id']));

      const ghlMap: Record<string, string> = {};
      for (const row of ghlRows) ghlMap[row.key] = row.value;

      if (ghlMap['ghl_enabled'] === 'true' && ghlMap['ghl_api_key'] && ghlMap['ghl_location_id']) {
        void syncOrderToGHL(ghlMap['ghl_api_key'], ghlMap['ghl_location_id'], {
          name: customerName,
          email: customerEmail,
          phone: phone,
          orderNumber: orderNumber,
          total: total,
          deliveryAddress: deliveryAddress || null,
        });
      }
    } catch (ghlError) {
      console.error('[GHL] Error loading settings (non-blocking):', ghlError);
    }
    // ─────────────────────────────────────────────────────────────

    return NextResponse.json(newOrder[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);

    // Capture error in Sentry
    Sentry.captureException(error, {
      tags: {
        api_route: '/api/orders',
        method: 'POST',
      },
      contexts: {
        request: {
          url: request.url,
        },
      },
    });
    
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { customerName, phone, total, status } = body;

    // Check if order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value. Must be one of: pending_payment, preparing, cooking, packing, ready, completed, cancelled', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Validate total if provided
    if (total !== undefined && (typeof total !== 'number' || total <= 0)) {
      return NextResponse.json(
        { error: 'Total must be a positive number', code: 'INVALID_TOTAL' },
        { status: 400 }
      );
    }

    // Build update object with explicit typing
    const updates: {
      customerName?: string;
      phone?: string;
      total?: number;
      status?: string;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (customerName !== undefined) {
      updates.customerName = customerName.trim();
    }

    if (phone !== undefined) {
      updates.phone = phone.trim();
    }

    if (total !== undefined) {
      updates.total = total;
    }

    if (status !== undefined) {
      updates.status = status;
    }

    // Update order
    const updatedOrder = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedOrder[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    
    // Capture error in Sentry
    Sentry.captureException(error, {
      tags: {
        api_route: '/api/orders',
        method: 'PUT',
      },
      contexts: {
        request: {
          url: request.url,
        },
      },
    });
    
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

    // Check if order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete order
    const deleted = await db
      .delete(orders)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Order deleted successfully',
        order: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    
    // Capture error in Sentry
    Sentry.captureException(error, {
      tags: {
        api_route: '/api/orders',
        method: 'DELETE',
      },
      contexts: {
        request: {
          url: request.url,
        },
      },
    });
    
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}