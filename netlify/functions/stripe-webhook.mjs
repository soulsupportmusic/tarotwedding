import { config as shop, getStripe, json } from '../lib/shop.mjs';
import { createOrder } from '../lib/prodigi.mjs';
import { orderConfirmationMail, ownerMail, sendMail } from '../lib/mail.mjs';

/** Liest Name/Adresse aus der Session – unterstützt alte und neue Stripe-API-Versionen. */
const customerFromSession = (session) => {
  const shipping = session.collected_information?.shipping_details ?? session.shipping_details;
  const details = session.customer_details ?? {};
  if (!shipping?.address) throw new Error(`Session ${session.id} hat keine Lieferadresse`);
  return {
    name: shipping.name ?? details.name,
    email: details.email,
    phone: details.phone,
    address: shipping.address,
  };
};

/**
 * Löst nach erfolgreicher Zahlung den Druckauftrag aus und informiert Käufer:in und Shop.
 * Idempotent: Eine bereits verarbeitete Zahlung (Metadatum prodigi_order_id) wird übersprungen.
 */
export const fulfill = async (sessionId) => {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  });
  if (session.payment_status !== 'paid') return 'not-paid';

  const paymentIntent = session.payment_intent;
  if (paymentIntent?.metadata?.prodigi_order_id) return 'already-fulfilled';

  const customer = customerFromSession(session);
  const quantity = session.line_items.data.reduce((sum, item) => sum + item.quantity, 0);

  const order = await createOrder({
    sessionId: session.id,
    paymentIntentId: paymentIntent.id,
    quantity,
    customer,
  });

  await stripe.paymentIntents.update(paymentIntent.id, {
    metadata: { prodigi_order_id: order.id },
  });

  const orderNumber = paymentIntent.id.slice(-8).toUpperCase();
  const results = await Promise.allSettled([
    sendMail(orderConfirmationMail({ customer, quantity, amountTotal: session.amount_total, orderNumber })),
    sendMail(ownerMail(`Neue Bestellung ${orderNumber} (${quantity}×)`, [
      `Kund:in: ${customer.name} <${customer.email}>`,
      `Betrag: ${(session.amount_total / 100).toFixed(2)} €`,
      `Stripe: ${paymentIntent.id}`,
      `Prodigi-Auftrag: ${order.id}`,
    ].join('\n'))),
  ]);
  results.filter((r) => r.status === 'rejected').forEach((r) => console.error('Mailversand fehlgeschlagen:', r.reason));
  return 'fulfilled';
};

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let event;
  try {
    const payload = await req.text();
    event = getStripe().webhooks.constructEvent(payload, req.headers.get('stripe-signature'), shop.stripeWebhookSecret);
  } catch (err) {
    console.warn('Ungültige Stripe-Signatur:', err.message);
    return json({ error: 'Invalid signature' }, 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const result = await fulfill(event.data.object.id);
        console.log(`${event.type} ${event.data.object.id}: ${result}`);
        break;
      }
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
        await sendMail(ownerMail('Zahlung fehlgeschlagen', `Session ${session.id}\nE-Mail: ${session.customer_details?.email ?? '–'}`));
        break;
      }
      default:
        break;
    }
    return json({ received: true });
  } catch (err) {
    console.error(`Fehler bei ${event.type}:`, err);
    await sendMail(ownerMail('Fehler bei der Bestellabwicklung – bitte prüfen', `${event.type}\n${event.data.object.id}\n\n${err.stack ?? err}`))
      .catch((mailErr) => console.error('Auch die Fehler-Mail ist fehlgeschlagen:', mailErr));
    // 500 → Stripe stellt das Event später erneut zu; der Prodigi-Idempotenzschlüssel verhindert Doppelaufträge.
    return json({ error: 'Fulfillment failed' }, 500);
  }
};

export const config = { path: '/api/stripe-webhook' };
