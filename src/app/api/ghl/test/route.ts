import { NextRequest, NextResponse } from 'next/server';
import { testGHLConnection } from '@/lib/ghl';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, locationId } = body as { apiKey: string; locationId: string };

    if (!apiKey?.trim() || !locationId?.trim()) {
      return NextResponse.json(
        { success: false, error: 'API Key y Location ID son requeridos' },
        { status: 400 }
      );
    }

    const result = await testGHLConnection(apiKey.trim(), locationId.trim());

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('[GHL Test]', error);
    return NextResponse.json(
      { success: false, error: 'Error interno al probar la conexión' },
      { status: 500 }
    );
  }
}
