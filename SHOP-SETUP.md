# Shop-Einrichtung: Direktkauf mit automatischem Druck & Versand

## So funktioniert der Ablauf

```
Website  ──„Jetzt kaufen“──▶  /api/checkout  ──▶  Stripe Checkout (Karte, PayPal, Klarna, SEPA, Apple/Google Pay)
                                                        │ Zahlung erfolgreich
                                                        ▼
                                              /api/stripe-webhook
                                    ├─▶ Prodigi: Druckauftrag anlegen (druckt & verschickt direkt)
                                    ├─▶ E-Mail an Käufer:in: Bestellbestätigung
                                    └─▶ E-Mail an euch: „Neue Bestellung“
                                                        │ Paket verschickt
                                                        ▼
                                             /api/prodigi-callback
                                    └─▶ E-Mail an Käufer:in: „Euer Paket ist unterwegs“ + Tracking-Link
```

Ihr müsst nach einem Kauf **nichts von Hand machen**. Bei Problemen (Prodigi lehnt den Auftrag ab, Auftrag storniert, Zahlung fehlgeschlagen) bekommt ihr automatisch eine E-Mail.

| Baustein | Anbieter | Warum | Kosten |
|---|---|---|---|
| Zahlung | **Stripe** | Alle in DE üblichen Zahlarten in einem Checkout, Quittung, Betrugsschutz, kein eigener Server für Kartendaten | ca. 1,5 % + 0,25 € pro Zahlung mit EU-Karte, keine Grundgebühr |
| Druck & Versand | **Prodigi** | Print-on-Demand mit API, Produktion in UK/EU, Tarot-/Oracle-Decks im Sortiment, Sandbox zum Testen | Großhandelspreis pro Deck + Versand |
| E-Mails | **Resend** | Einfache API, eigene Absenderdomain | kostenlos bis 3.000 Mails/Monat |
| Hosting | **Netlify** | Statische Seite + Serverless-Funktionen, Deploy direkt aus GitHub | Free-Tier reicht |

> **Alternative Druckerei:** [QPMN](https://www.qpmarketnetwork.com/) ist auf Karten & Spiele spezialisiert (auch Tarot mit Box) und hat ebenfalls eine API. Wenn euch Qualität oder Preis bei Prodigi nicht gefallen, muss nur `netlify/lib/prodigi.mjs` ausgetauscht werden.

## Einrichtung Schritt für Schritt

### 1. Prodigi (Druckpartner)
1. Konto anlegen auf prodigi.com und in der Produktsuche ein **Tarot-/Oracle-Deck** auswählen (Kartengröße, Anzahl = 36, Verpackung/Box).
2. Die **SKU** des Produkts notieren und die Druckvorgaben herunterladen (Maße, Beschnitt, Dateiformat – meist ein mehrseitiges PDF).
3. Die Druckdatei(en) öffentlich erreichbar ablegen (z. B. hier im Repo unter `print/`, auf Netlify, oder Dropbox-Direktlink).
4. **Unbedingt eine Musterbestellung** an euch selbst machen und Qualität, Box und Lieferzeit prüfen.
5. Den **Einkaufspreis + Versand** prüfen. Er muss deutlich unter 29 € liegen, sonst `PRICE_CENTS` anpassen.
6. Unter *Settings → API* den Schlüssel kopieren. Für Tests den **Sandbox**-Schlüssel nehmen, dann wird nichts gedruckt oder berechnet.
7. Zahlungsmittel bei Prodigi hinterlegen. Live-Aufträge werden automatisch von eurem Prodigi-Konto bezahlt.

### 2. Stripe (Zahlung)
1. Konto auf stripe.com anlegen und verifizieren.
2. *Einstellungen → Zahlungsmethoden*: PayPal, Klarna, SEPA, Apple Pay und Google Pay aktivieren.
3. *Einstellungen → Öffentliche Unternehmensdetails*: Die **AGB-URL** (`https://eure-domain/agb.html`) eintragen. Das ist Pflicht, weil der Checkout die AGB-Zustimmung abfragt.
4. *Einstellungen → Kunden-E-Mails*: „Erfolgreiche Zahlungen“ aktivieren, dann verschickt Stripe zusätzlich eine Quittung.
5. *Entwickler → Webhooks → Endpunkt hinzufügen*
   - URL: `https://eure-domain/api/stripe-webhook`
   - Ereignisse: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`
   - Das **Signing Secret** (`whsec_…`) kopieren.

### 3. Resend (E-Mails)
1. Konto auf resend.com anlegen und die **eigene Domain verifizieren** (DNS-Einträge setzen).
2. API-Key erstellen.

### 4. Netlify (Hosting)
1. Auf netlify.com „Add new site → Import from GitHub“ wählen und dieses Repository auswählen. Build-Einstellungen kommen aus `netlify.toml`.
2. Unter *Site configuration → Environment variables* alle Werte aus `.env.example` eintragen.
3. Eigene Domain verbinden und `SITE_URL` darauf setzen.

### 5. Testen, bevor es live geht
1. Mit `sk_test_…` (Stripe) und `PRODIGI_ENV=sandbox` deployen.
2. Auf der Website kaufen und die Testkarte `4242 4242 4242 4242` verwenden (beliebiges Datum in der Zukunft, beliebige Prüfziffer).
3. Prüfen, ob die Bestätigungsmail kommt, ob die Shop-Mail kommt und ob der Auftrag im Prodigi-Sandbox-Dashboard auftaucht.
4. Erst danach auf `sk_live_…`, den Live-Webhook-Secret und `PRODIGI_ENV=live` umstellen.

## Rechtliches (Pflicht vor dem Livegang)
`impressum.html`, `agb.html`, `widerruf.html` und `datenschutz.html` sind **Entwürfe mit gelb markierten Platzhaltern**. Füllt sie aus und lasst sie prüfen, zum Beispiel per Abo bei IT-Recht Kanzlei, Händlerbund oder eRecht24. Klärt außerdem:
- **Gewerbeanmeldung** und steuerliche Einordnung (Kleinunternehmer ja/nein → Preisangabe „inkl. MwSt.“)
- **Verpackungsregister LUCID**: Wer verpackte Ware an Endkund:innen verschickt, muss sich registrieren, auch beim Dropshipping. Mit Prodigi klären, wer die Systembeteiligung übernimmt.
- **Google Fonts** am besten lokal einbinden (DSGVO).

## Lokal entwickeln
```bash
npm install
npm test            # Tests mit gemockten APIs
npx netlify dev     # Website + Funktionen lokal, liest .env
stripe listen --forward-to localhost:8888/api/stripe-webhook   # Stripe-CLI für lokale Webhooks
```

## Dateien
- `netlify/functions/create-checkout.mjs`: startet den Stripe-Checkout (Preis, Versand und Mengen werden nur serverseitig festgelegt)
- `netlify/functions/stripe-webhook.mjs`: nach der Zahlung Druckauftrag anlegen und Mails verschicken. Läuft idempotent, es entstehen also keine Doppelaufträge, wenn Stripe ein Event erneut zustellt.
- `netlify/functions/prodigi-callback.mjs`: Versandmeldungen von Prodigi entgegennehmen und Tracking-Mail verschicken
- `netlify/lib/`: Konfiguration, Prodigi-Client, Mailvorlagen
- `danke.html`: Seite nach erfolgreicher Zahlung
