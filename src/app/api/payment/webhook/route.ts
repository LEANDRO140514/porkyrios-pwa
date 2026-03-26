import { NextRequest, NextResponse } from 'next/server';
import { WebhookPayload } from '@/types/mercadopago';
import { getPaymentStatus } from '@/lib/payment-service';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    // Map payment status to order status
    const orderStatus = mapPaymentStatusToOrderStatus(paymentData.status);

    // Update order in database
    await db
      .update(orders)
      .set({
        status: orderStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.orderNumber, orderNumber));

    console.log(`[MercadoPago Webhook] Order ${orderNumber} updated to ${orderStatus}`);

    // Return 200 to confirm receipt
    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('[MercadoPago Webhook] Processing error:', error);

    // Always return 200 to MercadoPago to prevent retries
    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  }
}

function mapPaymentStatusToOrderStatus(mpStatus: string): string {
  switch (mpStatus) {
    case 'approved':
      return 'confirmed';
    case 'rejected':
    case 'cancelled':
      return 'cancelled';
    case 'refunded':
      return 'cancelled';
    case 'pending':
    case 'in_process':
    case 'in_mediation':
      return 'pending_payment';
    default:
      return 'pending_payment';
  }
}

// GET for webhook validation (MercadoPago may test the endpoint)
export async function GET() {
  return NextResponse.json(
    { message: 'MercadoPago webhook endpoint is active' },
    { status: 200 }
  );
}
