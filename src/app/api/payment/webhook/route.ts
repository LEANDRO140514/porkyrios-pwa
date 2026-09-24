import { NextRequest, NextResponse } from 'next/server';
import { WebhookPayload } from '@/types/mercadopago';
import { getPaymentStatus } from '@/lib/payment-service';
import { applyPaymentUpdate } from '@/lib/payment-processing';

export const runtime = 'nodejs';

interface PaymentData {
  id: string;
  external_reference: string;
  status: string;
  status_detail: string;
  transaction_amount: number;
  payer: {
    email: string;
    id: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json();

    console.log('[MercadoPago Webhook] Received:', payload);

    // Validate webhook
    if (!payload.data?.id) {
      return NextResponse.json(
        { received: true },
        { status: 200 }
      );
    }

    // Only process payment notifications
    if (payload.type !== 'payment') {
      return NextResponse.json(
        { received: true },
        { status: 200 }
      );
    }

    // Fetch full payment details
    const payment = await getPaymentStatus(payload.data.id);
    const paymentData = payment as unknown as PaymentData;

    console.log('[MercadoPago Webhook] Payment data:', paymentData);

    // Extract order number from external_reference
    const orderNumber = paymentData.external_reference;

    if (!orderNumber) {
      console.error('[MercadoPago Webhook] No external_reference found');
      return NextResponse.json(
        { received: true },
        { status: 200 }
      );
    }

    // Idempotent: repeated or out-of-order notifications never double-count stock
    const result = await applyPaymentUpdate({
      orderNumber,
      paymentId: String(paymentData.id),
      status: paymentData.status,
      amount: Number(paymentData.transaction_amount) || 0,
    });

    console.log(`[MercadoPago Webhook] Order ${orderNumber}: payment ${paymentData.status} -> ${result}`);

    // Return 200 to confirm receipt
    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('[MercadoPago Webhook] Processing error:', error);

    // Let MercadoPago retry: processing is idempotent, so a retry cannot double-count
    return NextResponse.json(
      { received: false },
      { status: 500 }
    );
  }
}

// GET for webhook validation (MercadoPago may test the endpoint)
export async function GET() {
  return NextResponse.json(
    { message: 'MercadoPago webhook endpoint is active' },
    { status: 200 }
  );
}
