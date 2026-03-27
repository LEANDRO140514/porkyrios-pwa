import { preferenceClient, paymentClient } from './mercadopago';
import { PaymentPreferenceData, MercadoPagoPreferenceResponse } from '@/types/mercadopago';

export async function createPaymentPreference(
  data: PaymentPreferenceData
): Promise<MercadoPagoPreferenceResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await preferenceClient.create({
      body: {
        items: data.items.map(item => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          description: item.description || '',
        })),
        payer: {
          email: data.email,
          name: data.payer?.name || '',
          phone: data.payer?.phone,
        },
        back_urls: {
          success: `${baseUrl}/tracking?status=success`,
          failure: `${baseUrl}/tracking?status=failure`,
          pending: `${baseUrl}/tracking?status=pending`,
        },
        auto_return: 'approved',
        statement_descriptor: 'Porkyrios',
        notification_url: `${baseUrl}/api/payment/webhook`,
        external_reference: data.orderId,
      },
    });

    return response as MercadoPagoPreferenceResponse;
  } catch (error) {
    console.error('MercadoPago preference creation error:', error);
    throw new Error(`Failed to create payment preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getPaymentStatus(paymentId: string) {
  try {
    const response = await paymentClient.get({
      id: paymentId,
    });
    return response;
  } catch (error) {
    console.error('MercadoPago payment fetch error:', error);
    throw new Error(`Failed to fetch payment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}