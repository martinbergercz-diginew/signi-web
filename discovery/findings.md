# Live-site audit — signi.com

_Captured 2026-05-18 from the live WordPress site._

## Platform

- WordPress, custom theme `signi`.
- Apache/2.4.58 (Ubuntu). No CDN.
- `wp-json` REST API exposed — usable for content export.
- curl could not verify the TLS chain — the live origin may serve an
  incomplete certificate chain. Caddy resolves this automatically.

## Analytics & marketing tech

- **Google Tag Manager** — container `GTM-WP6ZVZF`. All analytics tags are
  presumed to live inside the container (GA4, ads, etc.).
- **Leady** — B2B visitor-identification tool. Sales-relevant; keep.
- **LinkedIn** tag detected.
- **No cookie-consent tool** found in the static HTML — likely GTM Consent
  Mode or JS-injected. **To confirm** (EU/GDPR requirement).

## SEO

- **Rank Math** plugin owns meta titles/descriptions, Open Graph, JSON-LD
  schema, sitemaps, and a redirect manager (existing redirects must be
  exported).
- Sitemap index: `page-sitemap.xml`, `post-sitemap.xml`,
  `category-sitemap.xml`.

## Forms

- **Contact Form 7** + `wpcf7-redirect` (redirects to a thank-you page after
  submit — relevant to GTM conversion tracking).
- Form pages found: `/kontakt/`, `/sk/kontaktujte-nas/`, `/en/contact/`,
  `/en/sales/`, `/en/request-demo/`.
- At least 2 distinct forms: contact (`f6064`) and a shared demo/sales form
  (`f6640`, used on both `/en/sales/` and `/en/request-demo/`).
- **TODO:** full field inventory, thank-you redirect targets, GTM conversion
  triggers.

## Languages

- 4 languages: `cs` (root), `en` (`/en/`), `sk` (`/sk/`), `hu` (`/hu/`).
- `hreflang` tags present for all four.

## URL inventory

See [url-inventory.md](url-inventory.md). Raw lists in [urls/](urls/).
