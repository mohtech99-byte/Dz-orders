import type { CreateShipmentInput, CreateShipmentResult, DeliveryCredentials, DeliveryProvider } from './types';

const YALIDINE_BASE_URL = 'https://api.yalidine.app/v1';

/**
 * NOTE ON CONFIDENCE: the base URL and parcel-creation payload fields below
 * (order_id, from_wilaya_name, firstname, familyname, contact_phone, address,
 * to_commune_name, to_wilaya_name, product_list, price, is_stopdesk,
 * stopdesk_id, has_exchange, freeshipping) are corroborated by multiple
 * independent community integrations (a Laravel package and a maintained npm
 * SDK). The `X-API-ID` / `X-API-TOKEN` header names follow the convention
 * Yalidine's own onboarding docs describe (an "API ID" + "API Token" pair),
 * but could not be independently verified byte-for-byte from public sources.
 * Use "Test connection" with real credentials before creating live shipments.
 */
async function yalidineFetch(path: string, credentials: DeliveryCredentials, init?: RequestInit) {
  const response = await fetch(`${YALIDINE_BASE_URL}${path}`, {
    ...init,
    headers: {
      'X-API-ID': credentials.apiId,
      'X-API-TOKEN': credentials.apiToken,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Yalidine API error (${response.status}): ${text || response.statusText}`);
  }

  return response.json();
}

async function testConnection(credentials: DeliveryCredentials): Promise<boolean> {
  try {
    // /wilayas is a lightweight read-only endpoint — good for a credentials smoke test.
    await yalidineFetch('/wilayas', credentials);
    return true;
  } catch {
    return false;
  }
}

async function createShipment(credentials: DeliveryCredentials, input: CreateShipmentInput): Promise<CreateShipmentResult> {
  const payload = [
    {
      order_id: input.orderNumber,
      from_wilaya_name: input.fromWilayaName,
      firstname: input.customerFirstName,
      familyname: input.customerLastName || input.customerFirstName,
      contact_phone: input.phone,
      address: input.address,
      to_commune_name: input.toCommuneName,
      to_wilaya_name: input.toWilayaName,
      product_list: input.productLabel,
      price: input.codAmount,
      is_stopdesk: input.isStopDesk,
      stopdesk_id: input.stopDeskId ?? null,
      has_exchange: false,
      freeshipping: false
    }
  ];

  const result = await yalidineFetch('/parcels', credentials, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  // Community SDKs report the response as either an array of created parcels
  // or an object keyed by order_id — handle both defensively.
  const firstEntry = Array.isArray(result) ? result[0] : Object.values((result as Record<string, unknown>) ?? {})[0];
  const entry = firstEntry as { tracking?: string; tracking_number?: string } | undefined;
  const trackingNumber = entry?.tracking ?? entry?.tracking_number;

  if (!trackingNumber) {
    throw new Error('Yalidine did not return a tracking number. Check the raw response for details.');
  }

  return { trackingNumber, raw: result };
}

export const yalidineProvider: DeliveryProvider = {
  companyName: 'Yalidine',
  testConnection,
  createShipment
};
