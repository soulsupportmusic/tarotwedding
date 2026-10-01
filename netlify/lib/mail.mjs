import { config } from './shop.mjs';

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const euro = (cents) => (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

const layout = (title, body) => `<!DOCTYPE html>
<html lang="de"><body style="margin:0;background:#f5f3f0;font-family:Georgia,serif;color:#2a2a2a;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="font-size:22px;font-weight:bold;margin-bottom:24px;">Das Hochzeitstarot</div>
    <div style="background:#fff;border-radius:16px;padding:32px;line-height:1.6;font-size:16px;">
      <h1 style="font-size:24px;margin:0 0 16px;">${escapeHtml(title)}</h1>
      ${body}
    </div>
    <p style="font-size:13px;color:#888;margin-top:24px;">
      Fragen? Antwortet einfach auf diese E-Mail.<br>Das Hochzeitstarot · Frederik &amp; Ludwig
    </p>
  </div>
</body></html>`;

export const sendMail = async ({ to, subject, html, replyTo }) => {
  if (!to) return;
  if (!config.resendApiKey) {
    console.log(`[mail – kein RESEND_API_KEY, nur Log] an=${to} betreff="${subject}"`);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: config.mailFrom,
      to: [to],
      subject,
      html,
      ...((replyTo ?? config.ownerEmail) && { reply_to: replyTo ?? config.ownerEmail }),
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
};

const addressHtml = ({ name, address }) => [
  name, address.line1, address.line2, `${address.postal_code} ${address.city}`, address.country,
].filter(Boolean).map(escapeHtml).join('<br>');

export const orderConfirmationMail = ({ customer, quantity, amountTotal, orderNumber }) => ({
  to: customer.email,
  subject: 'Danke für eure Bestellung – Das Hochzeitstarot',
  html: layout(`Danke, ${customer.name.split(' ')[0]}!`, `
    <p>Eure Zahlung ist eingegangen und euer Hochzeitstarot geht jetzt in den Druck.
    Sobald das Paket unterwegs ist, bekommt ihr eine weitere E-Mail mit der Sendungsverfolgung.</p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:15px;">
      <tr><td style="padding:8px 0;border-bottom:1px solid #eee;">Bestellnummer</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(orderNumber)}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #eee;">Das Hochzeitstarot × ${quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${euro(amountTotal)}</td></tr>
      <tr><td style="padding:8px 0;">Versand</td><td style="padding:8px 0;text-align:right;">kostenlos</td></tr>
    </table>
    <p style="margin-bottom:4px;"><strong>Lieferadresse</strong></p>
    <p style="margin-top:0;">${addressHtml(customer)}</p>
    <p>Die Herstellung dauert in der Regel wenige Werktage, danach ist euer Deck auf dem Weg zu euch.</p>
    <p>Wir wünschen euch ganz viel Freude beim Planen!</p>`),
});

export const shippingMail = ({ email, name, trackingUrl, trackingNumber, carrier }) => ({
  to: email,
  subject: 'Euer Hochzeitstarot ist unterwegs 📦',
  html: layout('Euer Paket ist unterwegs!', `
    <p>Hallo ${escapeHtml((name ?? '').split(' ')[0] || 'ihr zwei')},</p>
    <p>euer Hochzeitstarot wurde gerade verschickt${carrier ? ` (${escapeHtml(carrier)})` : ''}.</p>
    ${trackingNumber ? `<p>Sendungsnummer: <strong>${escapeHtml(trackingNumber)}</strong></p>` : ''}
    ${trackingUrl ? `<p style="margin:28px 0;"><a href="${escapeHtml(trackingUrl)}"
        style="background:#2a2a2a;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;">Sendung verfolgen</a></p>` : ''}
    <p>Viel Spaß beim Ziehen der ersten Karten!</p>`),
});

export const ownerMail = (subject, details) => ({
  to: config.ownerEmail,
  subject: `[Shop] ${subject}`,
  html: layout(subject, `<pre style="white-space:pre-wrap;font-size:13px;">${escapeHtml(details)}</pre>`),
});
