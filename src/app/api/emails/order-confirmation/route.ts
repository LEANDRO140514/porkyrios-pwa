import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import { getOrderEmailData } from '@/lib/order-email';
import OrderConfirmation from '@/emails/OrderConfirmation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderNumber,
      subtotal,
      deliveryCost,
      iva,
      deliveryMethod,
      estimatedDelivery,
    } = body;

    // Validar campos requeridos
    if (!orderNumber || typeof orderNumber !== 'string') {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Recipient, name, items and total come from the database, never from the request
    const order = await getOrderEmailData(orderNumber);
    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Enviar email de confirmación
    const result = await sendEmail({
      to: order.customerEmail,
      subject: `¡Pedido Confirmado! - ${order.orderNumber}`,
      react: OrderConfirmation({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        items: order.items,
        subtotal: Number(subtotal) || 0,
        deliveryCost: Number(deliveryCost) || 0,
        iva: Number(iva) || 0,
        total: order.total,
        deliveryMethod: deliveryMethod === 'delivery' ? 'delivery' : 'pickup',
        estimatedDelivery: typeof estimatedDelivery === 'string' ? estimatedDelivery : '',
      }),
    });

    if (!result.success) {
      console.error('Error enviando email de confirmación:', result.error);
      return NextResponse.json(
        { error: 'Error al enviar email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email de confirmación enviado',
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error('Error en API de confirmación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
