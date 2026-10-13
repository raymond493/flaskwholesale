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

Initial import (does not overwrite existing Coffee Mug edits): run `sanity exec scripts/import-coffee-mugs.mjs --with-user-token` inside `sanity-studio`.

Products with `isActive: false` are excluded from collection pages, detail routes, related products, quote options and sitemap. CM-10 is offline; its document and images are retained. Existing browser inquiry drafts are filtered against available products.

Mobile layouts use collapsible scrollable navigation, compact WhatsApp buttons, 44px gallery controls, horizontally scrollable thumbnails and 16px form inputs. Shared Sanity images provide responsive CDN sizes; navigation and product-card automatic prefetch is disabled to avoid downloading unseen pages. Full image galleries remain available.
