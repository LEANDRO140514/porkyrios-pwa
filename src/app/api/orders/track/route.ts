import { NextRequest, NextResponse } from 'next/server';
import { findTrackedOrder } from '@/lib/order-tracking';

// Public order tracking: requires the order number AND the customer's phone.
// POST keeps the phone out of URLs, logs and caches.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone : '';

    if (!orderNumber || !phone) {
      return NextResponse.json(
        { error: 'Número de pedido y teléfono son requeridos', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    const tracked = await findTrackedOrder(orderNumber, phone);
    if (!tracked) {
      // Same answer for a missing order and a wrong phone
      return NextResponse.json(
        { error: 'Pedido no encontrado', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(tracked, { status: 200 });
  } catch (error) {
    console.error('POST /api/orders/track error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
