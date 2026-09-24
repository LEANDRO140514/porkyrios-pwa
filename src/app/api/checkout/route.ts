import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { CheckoutError, createCheckoutOrder, parseCheckoutInput } from '@/lib/checkout';
import { syncNewOrderToGHL } from '@/lib/ghl-sync';

// Creates the order server-side: prices, delivery cost, coupon and total come
// from the database. The browser only sends product ids, quantities and choices.
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Inicia sesión para completar tu pedido', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    const input = parseCheckoutInput(await request.json().catch(() => null));
    const { order, priced } = await createCheckoutOrder(input, {
      name: session.user.name,
      email: session.user.email,
    });

    void syncNewOrderToGHL({
      name: order.customerName,
      email: order.customerEmail,
      phone: order.phone,
      orderNumber: order.orderNumber,
      total: order.total,
      deliveryAddress: order.deliveryAddress,
    });

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: priced.lines.map(({ name, quantity, price }) => ({ name, quantity, price })),
        subtotal: priced.subtotal,
        iva: priced.iva,
        deliveryCost: priced.deliveryCost,
        discount: priced.discount,
        total: priced.total,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error('POST /api/checkout error:', error);
    Sentry.captureException(error, { tags: { api_route: '/api/checkout', method: 'POST' } });
    return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 });
  }
}
