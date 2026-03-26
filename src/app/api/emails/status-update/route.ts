import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import OrderStatusUpdate from '@/emails/OrderStatusUpdate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, orderNumber, customerName, status, statusMessage, estimatedTime } = body;

    // Validar campos requeridos
    if (!email || !orderNumber || !customerName || !status) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Mapeo de estados para el subject
    const statusLabels: Record<string, string> = {
      pending_payment: 'Pendiente de Pago',
      confirmed: 'Confirmado',
      preparing: 'En Preparación',
      ready: 'Listo para Entregar',
      out_for_delivery: 'En Camino',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };

    const statusLabel = statusLabels[status] || 'Actualizado';

    // Enviar email de actualización
    const result = await sendEmail({
      to: email,
      subject: `Pedido ${statusLabel} - ${orderNumber}`,
      react: OrderStatusUpdate({
        orderNumber,
        customerName,
        status,
        statusMessage,
        estimatedTime,
      }),
    });

    if (!result.success) {
      console.error('Error enviando email de actualización:', result.error);
      return NextResponse.json(
        { error: 'Error al enviar email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email de actualización enviado',
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error('Error en API de actualización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
