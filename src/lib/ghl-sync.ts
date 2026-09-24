import { db } from '@/db';
import { settings } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import { syncOrderToGHL, type GHLContactInput } from '@/lib/ghl';

/**
 * Sync a new order to GoHighLevel when the integration is enabled.
 * Never throws: order creation must not fail because of GHL.
 */
export async function syncNewOrderToGHL(order: GHLContactInput): Promise<void> {
  try {
    const ghlRows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, ['ghl_enabled', 'ghl_api_key', 'ghl_location_id']));

    const ghlMap: Record<string, string> = {};
    for (const row of ghlRows) ghlMap[row.key] = row.value;

    if (ghlMap['ghl_enabled'] === 'true' && ghlMap['ghl_api_key'] && ghlMap['ghl_location_id']) {
      void syncOrderToGHL(ghlMap['ghl_api_key'], ghlMap['ghl_location_id'], order);
    }
  } catch (ghlError) {
    console.error('[GHL] Error loading settings (non-blocking):', ghlError);
  }
}
