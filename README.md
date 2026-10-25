# FlaskWholesale

Next.js wholesale drinkware website for `flaskwholesale.com`.

## Local preview

```bash
npm run build
npm run dev
```

The site uses shared React components, centralized product data, dynamic product/category routes, and daily ISR caching. Common layout or business-copy changes only need to be made once.

## Coffee Mug

`/coffee-mug` reproduces the Ecopak Drinkware collection, its 14 product detail pages, galleries, video support, options, inquiry list and customization pages. Metadata is independently editable in FlaskWholesale's Sanity project (`12npkiv4`, dataset `production`, Coffee Mug documents). Images continue using the original Sanity CDN URLs without duplicate uploads or Vercel image transformations. Keep the original Sanity assets available; deleting a source asset would break its shared URL. Routes and queries use one-hour ISR caching.

Quotes open WhatsApp `+86 13267102135` with a prepared message. Visitors must send the message and attach artwork themselves; opening WhatsApp is not confirmation of a received inquiry. Original Ecopak payment credentials are not copied.

Email RFQ is implemented at `/api/rfq` for coffee single/bulk inquiries and the Contact form. Enable it with Flask-specific `RESEND_API_KEY`, `RFQ_FROM_EMAIL` (a verified Resend sender) and `RFQ_NOTIFY_EMAIL` in Vercel, then redeploy. No EcoPak credentials/recipients are copied or defaulted. Until all settings exist, forms retain WhatsApp. `GET /api/rfq` exposes only `{configured:boolean}`; it does not verify domain ownership or deliverability.

The shared message builder includes stable model codes in the subject, a deduplicated Model / SKU immediately after Reference and per-line codes. Server validation resolves canonical available products, allows unique exact legacy name matches, validates quantities, escapes HTML, bounds the body and artwork (2 MB), rejects a honeypot and cross-origin requests, and applies a best-effort warm-instance throttle (not distributed rate limiting). Add Vercel Firewall protections for production abuse control. User-entered prices are not trusted as a final quote. Resend idempotency keys and frozen client retry payloads protect repeated identical submissions within the provider retention window; there is no automatic send retry. Unknown delivery outcomes remain errors, not success. No customer auto-reply is sent.

Run `node scripts/test-rfq-message.mjs` and `node scripts/test-rfq-server.mjs` for mocked checks without real emails. Actual sender verification, DNS and authorized delivery testing remain required after configuration. API keys must never be exposed in client code or committed.

Initial import (does not overwrite existing Coffee Mug edits): run `sanity exec scripts/import-coffee-mugs.mjs --with-user-token` inside `sanity-studio`.

Products with `isActive: false` are excluded from collection pages, detail routes, related products, quote options and sitemap. CM-10 is offline; its document and images are retained. Existing browser inquiry drafts are filtered against available products.

Mobile layouts use collapsible scrollable navigation, compact WhatsApp buttons, 44px gallery controls, horizontally scrollable thumbnails and 16px form inputs. Shared Sanity images provide responsive CDN sizes; navigation and product-card automatic prefetch is disabled to avoid downloading unseen pages. Full image galleries remain available.
