import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error('MERCADOPAGO_ACCESS_TOKEN is required');
}

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export const preferenceClient = new Preference(mpClient);
export const paymentClient = new Payment(mpClient);
