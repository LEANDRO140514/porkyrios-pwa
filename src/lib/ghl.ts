// GoHighLevel (GHL) API v2 integration service
// Docs: https://highlevel.stoplight.io/docs/integrations

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

function ghlHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: GHL_API_VERSION,
    'Content-Type': 'application/json',
  };
}

export interface GHLContactInput {
  name: string;
  email: string;
  phone?: string;
  orderNumber: string;
  total: number;
  deliveryAddress?: string | null;
}

/**
 * Test if GHL credentials are valid by fetching location info.
 */
export async function testGHLConnection(
  apiKey: string,
  locationId: string
): Promise<{ success: boolean; locationName?: string; error?: string }> {
  try {
    const response = await fetch(`${GHL_BASE_URL}/locations/${locationId}`, {
      headers: ghlHeaders(apiKey),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Error ${response.status}: ${response.statusText}. Verifica el API Key y Location ID.`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      locationName: data.location?.name || data.name || 'Subcuenta GHL',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de conexión con GHL',
    };
  }
}

/**
 * Search a contact by email, returns contact ID or null.
 */
async function searchContactByEmail(
  apiKey: string,
  locationId: string,
  email: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${GHL_BASE_URL}/contacts/?email=${encodeURIComponent(email)}&locationId=${locationId}&limit=1`,
      { headers: ghlHeaders(apiKey) }
    );
    if (!response.ok) return null;

    const data = await response.json();
    const contacts: Array<{ id: string }> = data.contacts || [];
    return contacts.length > 0 ? contacts[0].id : null;
  } catch {
    return null;
  }
}

/**
 * Create a new contact in GHL. Returns the new contact ID.
 */
async function createContact(
  apiKey: string,
  locationId: string,
  contact: GHLContactInput
): Promise<string> {
  const nameParts = contact.name.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';

  const body: Record<string, unknown> = {
    firstName,
    lastName,
    email: contact.email,
    locationId,
    source: 'Porkyrios PWA',
    tags: ['porkyrios-cliente'],
  };

  if (contact.phone) {
    // GHL expects E.164 format, e.g. +521234567890
    body.phone = contact.phone.startsWith('+') ? contact.phone : `+52${contact.phone}`;
  }

  if (contact.deliveryAddress) {
    body.address1 = contact.deliveryAddress;
  }

  const response = await fetch(`${GHL_BASE_URL}/contacts/`, {
    method: 'POST',
    headers: ghlHeaders(apiKey),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GHL create contact failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return (result.contact?.id || result.id) as string;
}

/**
 * Add an order note to an existing contact.
 */
async function addNoteToContact(
  apiKey: string,
  contactId: string,
  orderNumber: string,
  total: number
): Promise<void> {
  await fetch(`${GHL_BASE_URL}/contacts/${contactId}/notes`, {
    method: 'POST',
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({
      body: `🛒 Nuevo pedido: ${orderNumber} — Total: $${total.toFixed(2)} MXN (Porkyrios)`,
    }),
  });
}

/**
 * Main integration: create or update contact in GHL when an order is placed.
 * Non-blocking — does NOT throw if GHL fails, so the order always gets created.
 */
export async function syncOrderToGHL(
  apiKey: string,
  locationId: string,
  order: GHLContactInput
): Promise<void> {
  try {
    let contactId = await searchContactByEmail(apiKey, locationId, order.email);

    if (!contactId) {
      contactId = await createContact(apiKey, locationId, order);
      console.log(`[GHL] Contacto creado: ${contactId} para orden ${order.orderNumber}`);
    } else {
      console.log(`[GHL] Contacto existente: ${contactId} para orden ${order.orderNumber}`);
    }

    await addNoteToContact(apiKey, contactId, order.orderNumber, order.total);
    console.log(`[GHL] Nota de orden agregada a contacto ${contactId}`);
  } catch (error) {
    console.error('[GHL] Sync falló (non-blocking):', error instanceof Error ? error.message : error);
  }
}
