import { timingSafeEqual } from 'node:crypto';
import { config as shop, getStripe, json } from '../lib/shop.mjs';
import { getOrder } from '../lib/prodigi.mjs';
import { ownerMail, sendMail, shippingMail } from '../lib/mail.mjs';

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length === y.length && timingSafeEqual(x, y);
};

/**
 * Statusmeldungen von Prodigi. Der Inhalt des Callbacks wird nicht vertraut:
 * Wir lesen nur die Auftrags-ID und holen den echten Status direkt über die API.
 */
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!safeEqual(new URL(req.url).searchParams.get('token'), shop.prodigiCallbackToken)) {
    return json({ error: 'Forbidden' }, 403);
  }

  let orderId;
  try {
    const event = await req.json();
    orderId = event?.data?.order?.id ?? event?.order?.id ?? String(event?.subject ?? '').split('/').pop();
  } catch { /* ungültiges JSON */ }
  if (!orderId) return json({ error: 'Keine Auftrags-ID' }, 400);

  try {
    const order = await getOrder(orderId);
    const paymentIntentId = order.metadata?.stripePaymentIntentId ?? order.merchantReference;
    if (!paymentIntentId) return json({ ignored: true });

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const notified = new Set((paymentIntent.metadata?.notified_shipments ?? '').split(',').filter(Boolean));

    const newlyShipped = (order.shipments ?? []).filter((s) => s.status === 'Shipped' && !notified.has(s.id));
    for (const shipment of newlyShipped) {
      await sendMail(shippingMail({
        email: order.recipient?.email,
        name: order.recipient?.name,
        trackingUrl: shipment.tracking?.url,
        trackingNumber: shipment.tracking?.number,
        carrier: shipment.carrier?.name,
      }));
      notified.add(shipment.id);
    }

    const stage = order.status?.stage;
    const alreadyAlerted = paymentIntent.metadata?.prodigi_alert === stage;
    const hasIssues = (order.status?.issues ?? []).length > 0;
    if ((stage === 'Cancelled' || hasIssues) && !alreadyAlerted) {
      await sendMail(ownerMail(`Prodigi-Auftrag ${order.id}: ${stage}${hasIssues ? ' mit Problemen' : ''}`,
        JSON.stringify(order.status, null, 2)));
    }

    if (newlyShipped.length || ((stage === 'Cancelled' || hasIssues) && !alreadyAlerted)) {
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          notified_shipments: [...notified].join(','),
          ...((stage === 'Cancelled' || hasIssues) && { prodigi_alert: stage }),
        },
      });
    }
    return json({ received: true });
  } catch (err) {
    console.error('Prodigi-Callback fehlgeschlagen:', err);
    return json({ error: 'Callback failed' }, 500);
  }
};

export const config = { path: '/api/prodigi-callback' };
