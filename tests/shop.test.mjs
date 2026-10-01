// End-to-End-Test der Shop-Funktionen mit gemockten Stripe-, Prodigi- und Resend-APIs.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';

Object.assign(process.env, {
  SITE_URL: 'https://shop.example',
  STRIPE_SECRET_KEY: 'sk_test_123',
  STRIPE_WEBHOOK_SECRET: 'whsec_test',
  PRODIGI_API_KEY: 'prodigi_key',
  PRODIGI_SKU: 'TEST-TAROT-SKU',
  PRODIGI_ASSETS: JSON.stringify([{ printArea: 'default', url: 'https://cdn.example/deck.pdf' }]),
  PRODIGI_CALLBACK_TOKEN: 'geheim',
  RESEND_API_KEY: 're_test',
  SHOP_OWNER_EMAIL: 'owner@example.com',
});

let calls = [];
let state;
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === 'string' ? input : input.url);
  const method = (init.method ?? 'GET').toUpperCase();
  const body = init.body ? String(init.body) : '';
  calls.push({ host: url.host, path: url.pathname, method, body, headers: init.headers });

  if (url.host === 'api.stripe.com') {
    if (method === 'POST' && url.pathname === '/v1/checkout/sessions') {
      return reply({ id: 'cs_test_1', object: 'checkout.session', url: 'https://checkout.stripe.com/c/pay/cs_test_1' });
    }
    if (method === 'GET' && url.pathname === '/v1/checkout/sessions/cs_test_1') return reply(state.session);
    if (url.pathname === '/v1/payment_intents/pi_1') {
      if (method === 'POST') {
        const params = new URLSearchParams(body);
        for (const [k, v] of params) {
          const m = k.match(/^metadata\[(.+)\]$/);
          if (m) state.session.payment_intent.metadata[m[1]] = v;
        }
      }
      return reply(state.session.payment_intent);
    }
  }
  if (url.host === 'api.sandbox.prodigi.com') {
    if (method === 'POST' && url.pathname === '/v4.0/orders') {
      state.prodigiOrders++;
      return reply({ outcome: 'Created', order: { id: 'ord_1' } }, 200);
    }
    if (method === 'GET' && url.pathname === '/v4.0/orders/ord_1') return reply({ outcome: 'Ok', order: state.prodigiOrder });
  }
  if (url.host === 'api.resend.com') return reply({ id: 'mail_' + calls.length });
  throw new Error(`Unerwarteter Request: ${method} ${url}`);
};

const { default: checkout } = await import('../netlify/functions/create-checkout.mjs');
const { default: webhook } = await import('../netlify/functions/stripe-webhook.mjs');
const { default: callback } = await import('../netlify/functions/prodigi-callback.mjs');

const stripe = new Stripe('sk_test_123');
const signed = (event) => {
  const payload = JSON.stringify(event);
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_test' });
  return new Request('https://shop.example/api/stripe-webhook', { method: 'POST', body: payload, headers: { 'stripe-signature': header } });
};
const mails = () => calls.filter((c) => c.host === 'api.resend.com').map((c) => JSON.parse(c.body));

beforeEach(() => {
  calls = [];
  state = {
    prodigiOrders: 0,
    session: {
      id: 'cs_test_1', object: 'checkout.session', payment_status: 'paid', amount_total: 5800,
      customer_details: { email: 'paar@example.com', name: 'Lea Muster', phone: '+49151000' },
      collected_information: { shipping_details: { name: 'Lea Muster', address: { line1: 'Hauptstr. 1', line2: null, postal_code: '33602', city: 'Bielefeld', country: 'DE', state: null } } },
      line_items: { object: 'list', data: [{ quantity: 2 }] },
      payment_intent: { id: 'pi_1', object: 'payment_intent', metadata: {} },
    },
    prodigiOrder: {
      id: 'ord_1', merchantReference: 'pi_1', metadata: { stripePaymentIntentId: 'pi_1' },
      recipient: { name: 'Lea Muster', email: 'paar@example.com' },
      status: { stage: 'InProgress', issues: [] },
      shipments: [],
    },
  };
});

test('checkout erstellt Stripe-Session mit serverseitigem Preis', async () => {
  const res = await checkout(new Request('https://shop.example/api/checkout', { method: 'POST', body: JSON.stringify({ quantity: 2 }) }));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).url, 'https://checkout.stripe.com/c/pay/cs_test_1');
  const params = new URLSearchParams(calls[0].body);
  assert.equal(params.get('line_items[0][price_data][unit_amount]'), '2900');
  assert.equal(params.get('line_items[0][quantity]'), '2');
  assert.equal(params.get('shipping_address_collection[allowed_countries][0]'), 'DE');
  assert.equal(params.get('consent_collection[terms_of_service]'), 'required');
  assert.match(params.get('success_url'), /danke\.html\?session_id=\{CHECKOUT_SESSION_ID\}/);
});

test('checkout lehnt ungültige Mengen ab', async () => {
  for (const quantity of [0, 6, 'abc', -1]) {
    const res = await checkout(new Request('https://x/api/checkout', { method: 'POST', body: JSON.stringify({ quantity }) }));
    assert.equal(res.status, 400, `Menge ${quantity}`);
  }
  assert.equal(calls.length, 0);
});

test('webhook mit falscher Signatur wird abgelehnt', async () => {
  const req = new Request('https://x/api/stripe-webhook', { method: 'POST', body: '{}', headers: { 'stripe-signature': 't=1,v1=falsch' } });
  assert.equal((await webhook(req)).status, 400);
  assert.equal(state.prodigiOrders, 0);
});

test('bezahlte Bestellung löst Druckauftrag und Mails aus – genau einmal', async () => {
  const event = { id: 'evt_1', type: 'checkout.session.completed', data: { object: { id: 'cs_test_1' } } };
  assert.equal((await webhook(signed(event))).status, 200);
  assert.equal(state.prodigiOrders, 1);

  const order = JSON.parse(calls.find((c) => c.path === '/v4.0/orders').body);
  assert.equal(order.idempotencyKey, 'cs_test_1');
  assert.equal(order.items[0].sku, 'TEST-TAROT-SKU');
  assert.equal(order.items[0].copies, 2);
  assert.deepEqual(order.recipient.address, { line1: 'Hauptstr. 1', postalOrZipCode: '33602', townOrCity: 'Bielefeld', countryCode: 'DE' });
  assert.equal(order.recipient.email, 'paar@example.com');
  assert.equal(order.callbackUrl, 'https://shop.example/api/prodigi-callback?token=geheim');
  assert.equal(calls.find((c) => c.path === '/v4.0/orders').headers['X-API-Key'], 'prodigi_key');
  assert.equal(state.session.payment_intent.metadata.prodigi_order_id, 'ord_1');

  const sent = mails();
  assert.deepEqual(sent.map((m) => m.to[0]).sort(), ['owner@example.com', 'paar@example.com']);
  assert.match(sent.find((m) => m.to[0] === 'paar@example.com').html, /58,00/);

  // Stripe stellt das Event erneut zu → kein zweiter Auftrag, keine zweite Mail
  calls = [];
  assert.equal((await webhook(signed(event))).status, 200);
  assert.equal(state.prodigiOrders, 1);
  assert.equal(mails().length, 0);
});

test('noch nicht bezahlte Session (z. B. SEPA) wird nicht gedruckt', async () => {
  state.session.payment_status = 'unpaid';
  const event = { id: 'evt_2', type: 'checkout.session.completed', data: { object: { id: 'cs_test_1' } } };
  assert.equal((await webhook(signed(event))).status, 200);
  assert.equal(state.prodigiOrders, 0);
});

test('Prodigi-Fehler → 500 (Stripe wiederholt) und Fehlermail an den Shop', async () => {
  delete process.env.PRODIGI_SKU;
  try {
    const event = { id: 'evt_3', type: 'checkout.session.completed', data: { object: { id: 'cs_test_1' } } };
    assert.equal((await webhook(signed(event))).status, 500);
    assert.equal(mails()[0].to[0], 'owner@example.com');
  } finally {
    process.env.PRODIGI_SKU = 'TEST-TAROT-SKU';
  }
});

test('Prodigi-Callback: falsches Token wird abgelehnt', async () => {
  const res = await callback(new Request('https://x/api/prodigi-callback?token=nein', { method: 'POST', body: '{}' }));
  assert.equal(res.status, 403);
});

test('Prodigi-Callback: Versandmail mit Tracking genau einmal', async () => {
  state.prodigiOrder.shipments = [{ id: 'shp_1', status: 'Shipped', carrier: { name: 'DHL' }, tracking: { url: 'https://track.example/1', number: 'TN123' } }];
  const req = () => new Request('https://x/api/prodigi-callback?token=geheim', {
    method: 'POST', body: JSON.stringify({ specversion: '1.0', type: 'com.prodigi.order.status.stage.changed', subject: 'ord_1', data: { order: { id: 'ord_1' } } }),
  });
  assert.equal((await callback(req())).status, 200);
  const sent = mails();
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to[0], 'paar@example.com');
  assert.match(sent[0].html, /TN123/);
  assert.match(sent[0].html, /track\.example/);
  assert.equal(state.session.payment_intent.metadata.notified_shipments, 'shp_1');

  calls = [];
  assert.equal((await callback(req())).status, 200);
  assert.equal(mails().length, 0);
});

test('Prodigi-Callback: Stornierung alarmiert den Shop einmal', async () => {
  state.prodigiOrder.status = { stage: 'Cancelled', issues: [] };
  const req = () => new Request('https://x/api/prodigi-callback?token=geheim', { method: 'POST', body: JSON.stringify({ data: { order: { id: 'ord_1' } } }) });
  await callback(req());
  assert.equal(mails()[0].to[0], 'owner@example.com');
  calls = [];
  await callback(req());
  assert.equal(mails().length, 0);
});
