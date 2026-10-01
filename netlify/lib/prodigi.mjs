import { config } from './shop.mjs';

const request = async (method, path, body) => {
  const res = await fetch(`${config.prodigiBaseUrl}${path}`, {
    method,
    headers: { 'X-API-Key': config.prodigiApiKey, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) {
    const err = new Error(`Prodigi ${method} ${path} → ${res.status}: ${text.slice(0, 500)}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

/** Erstellt den Druck- und Versandauftrag für eine bezahlte Stripe-Checkout-Session. */
export const createOrder = async ({ sessionId, paymentIntentId, quantity, customer }) => {
  const { name, email, phone, address } = customer;
  const data = await request('POST', '/orders', {
    merchantReference: paymentIntentId,
    // Stripe stellt Webhooks u. U. mehrfach zu – derselbe Schlüssel verhindert Doppeldrucke.
    idempotencyKey: sessionId,
    shippingMethod: config.prodigiShippingMethod,
    callbackUrl: `${config.siteUrl}/api/prodigi-callback?token=${encodeURIComponent(config.prodigiCallbackToken)}`,
    recipient: {
      name,
      ...(email && { email }),
      ...(phone && { phoneNumber: phone }),
      address: {
        line1: address.line1,
        ...(address.line2 && { line2: address.line2 }),
        postalOrZipCode: address.postal_code,
        townOrCity: address.city,
        countryCode: address.country,
        ...(address.state && { stateOrCounty: address.state }),
      },
    },
    items: [{
      merchantReference: 'hochzeitstarot-deck',
      sku: config.prodigiSku,
      copies: quantity,
      sizing: 'fillPrintArea',
      assets: config.prodigiAssets,
    }],
    metadata: { stripeSessionId: sessionId, stripePaymentIntentId: paymentIntentId },
  });
  return data.order ?? data;
};

export const getOrder = async (orderId) => {
  const data = await request('GET', `/orders/${encodeURIComponent(orderId)}`);
  return data.order ?? data;
};
