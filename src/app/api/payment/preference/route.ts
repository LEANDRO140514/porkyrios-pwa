import { NextRequest, NextResponse } from 'next/server';
import { createPaymentPreference } from '@/lib/payment-service';
import { PaymentPreferenceData } from '@/types/mercadopago';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

interface RequestBody {
  externalReference: string;
  description?: string;
  payerName?: string;
  payerPhone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();

    if (!body.externalReference) {
      return NextResponse.json(
        { error: 'externalReference is required' },
        { status: 400 }
      );
    }

    // The amount always comes from the stored order, never from the browser
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, body.externalReference))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'pending_payment') {
      return NextResponse.json({ error: 'Order is not pending payment' }, { status: 409 });
    }

    // Build preference data
    const preferenceData: PaymentPreferenceData = {
      orderId: order.orderNumber,
      email: order.customerEmail,
      items: [
        {
          title: `Pedido Porkyrios - ${order.orderNumber}`,
          quantity: 1,
          unit_price: order.total,
          description: body.description || '',
        },
      ],
      payer: {
        name: body.payerName || order.customerName,
        email: order.customerEmail,
        phone: order.phone ? {
          number: order.phone,
        } : undefined,
      },
    };

    // Create preference
    const preference = await createPaymentPreference(preferenceData);

    return NextResponse.json(
      {
        success: true,
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
        externalReference: preference.external_reference,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Payment preference endpoint error:', error);

      return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}