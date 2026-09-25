import { NextRequest, NextResponse } from 'next/server';
import { CheckoutError, parseCheckoutInput, quoteCheckout } from '@/lib/checkout';

// Price a cart exactly as POST /api/checkout will charge it, without creating
// anything, so the payment page can show the real total before paying.
export async function POST(request: NextRequest) {
  try {
    const input = parseCheckoutInput(await request.json().catch(() => null), { forQuote: true });
    const { priced } = await quoteCheckout(input);

    return NextResponse.json({
      items: priced.lines.map(({ productId, name, quantity, price }) => ({ productId, name, quantity, price })),
      subtotal: priced.subtotal,
      iva: priced.iva,
      deliveryCost: priced.deliveryCost,
      discount: priced.discount,
      total: priced.total,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error('POST /api/checkout/quote error:', error);
    return NextResponse.json({ error: 'No se pudo calcular el total' }, { status: 500 });
  }
}
