import { config as shop, getStripe, json } from '../lib/shop.mjs';

/**
 * Startet einen Stripe-Checkout für Das Hochzeitstarot.
 * Preis und Versand werden ausschließlich serverseitig festgelegt.
 */
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let quantity = 1;
  try {
    const body = await req.json();
    quantity = Number.parseInt(body?.quantity ?? 1, 10);
  } catch { /* leerer Body → 1 Stück */ }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > shop.maxQuantity) {
    return json({ error: `Bitte eine Menge zwischen 1 und ${shop.maxQuantity} wählen.` }, 400);
  }

  try {
    const site = shop.siteUrl;
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      locale: 'de',
      submit_type: 'pay',
      line_items: [{
        quantity,
        adjustable_quantity: { enabled: true, minimum: 1, maximum: shop.maxQuantity },
        price_data: {
          currency: 'eur',
          unit_amount: shop.priceCents,
          product_data: {
            name: 'Das Hochzeitstarot',
            description: '6 Kategoriekarten, 30 handillustrierte Tarotkarten, Deutungen & hochwertige Schachtel',
            images: [`${site}/images/deck/tarot-22.jpg`],
          },
        },
      }],
      shipping_address_collection: { allowed_countries: shop.shipCountries },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: 'Kostenloser Versand',
          fixed_amount: { amount: 0, currency: 'eur' },
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 5 },
            maximum: { unit: 'business_day', value: 10 },
          },
        },
      }],
      phone_number_collection: { enabled: true },
      billing_address_collection: 'auto',
      // Erfordert eine hinterlegte AGB-URL unter Stripe → Einstellungen → Öffentliche Unternehmensdetails.
      consent_collection: { terms_of_service: 'required' },
      custom_text: {
        terms_of_service_acceptance: {
          message: `Ich akzeptiere die [AGB](${site}/agb.html) und habe die [Widerrufsbelehrung](${site}/widerruf.html) sowie die [Datenschutzerklärung](${site}/datenschutz.html) zur Kenntnis genommen.`,
        },
        submit: { message: 'Mit Klick auf „Bezahlen“ gebt ihr eine zahlungspflichtige Bestellung auf.' },
      },
      payment_intent_data: { description: 'Das Hochzeitstarot' },
      success_url: `${site}/danke.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/#bestellen`,
    });
    return json({ url: session.url });
  } catch (err) {
    console.error('Checkout konnte nicht erstellt werden:', err);
    return json({ error: 'Der Bezahlvorgang konnte gerade nicht gestartet werden. Bitte versucht es gleich noch einmal.' }, 500);
  }
};

export const config = { path: '/api/checkout' };
