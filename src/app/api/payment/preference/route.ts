import { NextRequest, NextResponse } from 'next/server';
import { createPaymentPreference } from '@/lib/payment-service';
import { PaymentPreferenceData } from '@/types/mercadopago';

export const runtime = 'nodejs';

interface RequestBody {
  title: string;
  description: string;
  price: number;
  quantity: number;
  externalReference: string;
  payerEmail: string;
  payerName?: string;
  payerPhone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();

    // Validation
    if (!body.title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    if (!body.price || body.price <= 0) {
      return NextResponse.json(
        { error: 'price must be greater than 0' },
        { status: 400 }
      );
    }

    if (!body.quantity || body.quantity <= 0) {
      return NextResponse.json(
        { error: 'quantity must be greater than 0' },
        { status: 400 }
      );
    }

    if (!body.externalReference) {
      return NextResponse.json(
        { error: 'externalReference is required' },
        { status: 400 }
      );
    }

    if (!body.payerEmail) {
      return NextResponse.json(
        { error: 'payerEmail is required' },
        { status: 400 }
      );
    }

    // Build preference data
    const preferenceData: PaymentPreferenceData = {
      orderId: body.externalReference,
      email: body.payerEmail,
      items: [
        {
          title: body.title,
          quantity: body.quantity,
          unit_price: body.price,
          description: body.description || '',
        },
      ],
      payer: {
        name: body.payerName,
        email: body.payerEmail,
        phone: body.payerPhone ? {
          number: body.payerPhone,
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