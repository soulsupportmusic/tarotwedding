import Stripe from 'stripe';

const env = (name, fallback) => {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
};

const required = (name) => {
  const value = env(name);
  if (value === undefined) throw new Error(`Umgebungsvariable ${name} fehlt`);
  return value;
};

export const config = {
  get siteUrl() { return required('SITE_URL').replace(/\/+$/, ''); },
  get priceCents() { return Number.parseInt(env('PRICE_CENTS', '2900'), 10); },
  get maxQuantity() { return Number.parseInt(env('MAX_QUANTITY', '5'), 10); },
  get shipCountries() {
    return env('SHIP_COUNTRIES', 'DE').split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
  },
  get stripeSecretKey() { return required('STRIPE_SECRET_KEY'); },
  get stripeWebhookSecret() { return required('STRIPE_WEBHOOK_SECRET'); },
  get prodigiApiKey() { return required('PRODIGI_API_KEY'); },
  get prodigiBaseUrl() {
    return env('PRODIGI_ENV', 'sandbox') === 'live'
      ? 'https://api.prodigi.com/v4.0'
      : 'https://api.sandbox.prodigi.com/v4.0';
  },
  get prodigiSku() { return required('PRODIGI_SKU'); },
  get prodigiAssets() {
    const assets = JSON.parse(env('PRODIGI_ASSETS', '[]'));
    if (!Array.isArray(assets) || assets.length === 0) {
      throw new Error('PRODIGI_ASSETS ist leer – Druckdaten-URLs fehlen');
    }
    return assets;
  },
  get prodigiShippingMethod() { return env('PRODIGI_SHIPPING_METHOD', 'Standard'); },
  get prodigiCallbackToken() { return required('PRODIGI_CALLBACK_TOKEN'); },
  get resendApiKey() { return env('RESEND_API_KEY'); },
  get mailFrom() { return env('MAIL_FROM', 'Das Hochzeitstarot <bestellung@example.com>'); },
  get ownerEmail() { return env('SHOP_OWNER_EMAIL'); },
};

let stripeClient;
export const getStripe = () => {
  // Fetch-basierter HTTP-Client: läuft in jeder Serverless-Umgebung und ist testbar.
  stripeClient ??= new Stripe(config.stripeSecretKey, { httpClient: Stripe.createFetchHttpClient() });
  return stripeClient;
};

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
