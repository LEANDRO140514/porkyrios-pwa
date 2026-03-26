import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import OrderConfirmation from '@/emails/OrderConfirmation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      orderNumber,
      customerName,
      items,
      subtotal,
      deliveryCost,
      iva,
      total,
      deliveryMethod,
      estimatedDelivery,
    } = body;

    // Validar campos requeridos
    if (!email || !orderNumber || !customerName || !items) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Enviar email de confirmación
    const result = await sendEmail({
      to: email,
      subject: `¡Pedido Confirmado! - ${orderNumber}`,
      react: OrderConfirmation({
        orderNumber,
        customerName,
        items,
        subtotal,
        deliveryCost,
        iva,
        total,
        deliveryMethod,
        estimatedDelivery,
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
