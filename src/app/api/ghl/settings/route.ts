import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { inArray, eq } from 'drizzle-orm';

export const runtime = 'nodejs';

const GHL_KEYS = ['ghl_enabled', 'ghl_api_key', 'ghl_location_id'];

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, GHL_KEYS));

    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }

    return NextResponse.json({
      enabled: map['ghl_enabled'] === 'true',
      apiKey: map['ghl_api_key'] || '',
      locationId: map['ghl_location_id'] || '',
    });
  } catch (error) {
    console.error('[GHL Settings GET]', error);
    return NextResponse.json({ error: 'Error al cargar configuración GHL' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enabled, apiKey, locationId } = body as {
      enabled: boolean;
      apiKey: string;
      locationId: string;
    };

    const now = new Date().toISOString();

    const upsert = async (key: string, value: string, description: string) => {
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(settings).values({ key, value, description, createdAt: now, updatedAt: now });
      } else {
        await db.update(settings).set({ value, updatedAt: now }).where(eq(settings.key, key));
      }
    };

    await upsert('ghl_enabled', String(enabled), 'Activa/desactiva la integración con GoHighLevel');
    await upsert('ghl_api_key', apiKey || '', 'API Key de la subcuenta GoHighLevel');
    await upsert('ghl_location_id', locationId || '', 'Location ID de la subcuenta GoHighLevel');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[GHL Settings POST]', error);
    return NextResponse.json({ error: 'Error al guardar configuración GHL' }, { status: 500 });
  }
}
