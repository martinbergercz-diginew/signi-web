# Live-site audit — signi.com

_Captured 2026-05-18 from the live WordPress site._

## Platform

- WordPress, custom theme `signi`.
- Apache/2.4.58 (Ubuntu). No CDN.
- `wp-json` REST API exposed — usable for content export.
- curl could not verify the TLS chain — the live origin may serve an
  incomplete certificate chain. Caddy resolves this automatically.

### WordPress internals (wp-admin, 2026-05-18)

- WordPress 6.9.x, **Classic Editor** — content is plain HTML, not Gutenberg
  blocks (simpler to migrate).
- **Polylang** is the multilingual plugin (cs/en/sk/hu) — translations are
  linked posts.
- **ACF PRO** — pages use Advanced Custom Fields; content export must
  include ACF data.
- 21 plugins. Notable: Rank Math (SEO), Contact Form 7 + Dynamic Text +
  Redirection-for-CF7 (forms), Redirection + Rank Math (redirects), Easy WP
  SMTP (mail), UpdraftPlus (backups), Wordfence (security), Redis Object
  Cache, Converter for Media (WebP/AVIF).
- **Pipedrive CRM** is in use via the "LeadBooster Chatbot by Pipedrive"
  plugin — the chat captures visitors as Pipedrive deals. (Contact-form
  leads still go to email; the chatbot is a separate channel.)
- Redirects: see [redirects.md](redirects.md). Forms: see [forms.md](forms.md).

## Analytics & marketing tech

- **Google Tag Manager** — container `GTM-WP6ZVZF`.
- **Leady** — B2B visitor-identification tool. Sales-relevant; keep.
- **LinkedIn** tag detected.
- **Cookie consent: Cookiebot** — fired via GTM (a "Cookiebot CMP" tag),
  with Consent Mode wired through the container. The new site keeps it.

### Google Analytics (GA4) — checked 2026-05-18

- Property **"Signi.com - Web - GA4"** (`a137051505` / `p336132239`), data
  stream **"Web Signi"**.
- Traffic: ~4.3K sessions/day, ~2.8K active users/day; ~160K users and ~4.7M
  events per 28 days. Audience is overwhelmingly Czech (CZ ≫ SK > AT).
- **18 event types firing.** Beyond GA4 defaults (`page_view`, `scroll`,
  `session_start`, `user_engagement`, `first_visit`, `click`, `file_download`,
  `form_start`), the custom events are: `generate_lead` (118 / 28 days),
  `odeslat_poptavku` (44), `form_submit_40_hr_dokumentu` (6), and a
  `website_*_cz` family (`freetrial`, `pricelist`, `product`, `requestdemo`,
  `companies`, `articles`, `security`) — page/section interaction events.
- **Key events (conversions): 15 events are marked as key events, but only
  `generate_lead` has received any data in the last 28 days.** All the others
  (`conversion_event_submit_lead_form`, `form_sent`, `register__submit_`,
  `koupil_předplatné`, etc.) show "No stream data detected" — the conversion
  configuration is largely stale legacy.

### GA4 property is shared with the product app

Top pages by views (28 days) are dominated by the **Signi product
application**, not the marketing site: `/login` (155K views), `/signing/`,
`/account/phone`, `/dashboard/workspace/.../documents`, `/register`. The
marketing homepage `/` ranks only #2 (31K). So the GA4 property
"Signi.com - Web - GA4" tracks **both** the marketing website and the app —
the headline traffic numbers above are app-dominated, and real
marketing-site traffic is a fraction of them.

**Scope:** the migration replaces only the marketing/content website (the
138 WordPress pages + blog). The product application is separate and **out of
scope** — and its analytics must not be disturbed by the migration.

**Migration implications:**

- The one live conversion that **must survive** the Contact Form 7 → custom
  form swap is **`generate_lead`**. Its GTM trigger / `dataLayer` push must be
  replicated on the new form's success/thank-you step.
- The marketing-site rebuild must not break the **app's** tracking, which
  shares this GA property. Confirm via GTM whether the app uses the same
  container.
- The migration is a chance to retire ~15 dead key events.

### Google Tag Manager — checked 2026-05-18

The marketing site uses container **`GTM-WP6ZVZF`** (account "Signi.com").
There is also a **server-side container** (`GTM-KS3GQTW`) — the GA4 server
tag routes through it. Other containers (`GTM-NV2B3DH`, `GTM-5JTJZ24`)
belong to the app / other properties.

`GTM-WP6ZVZF` is large and aging — **66 tags**, live version 54 (published 4
months ago), flagged "Container quality: Needs Attention". It fires a wide
stack of tools:

- Analytics: GA4 (server-side routed), Hotjar, Microsoft Clarity, Smartlook
- Ads: Google Ads, Facebook Pixel, Adform, Sklik (Seznam), LinkedIn Insight
- Lead/B2B: Leady, Leadfeeder
- Other: **Cookiebot** (consent), Beamer, Ecomail pixel, **Pipedrive chat**
  widget (cs/en/hu/web)

**Form-conversion tracking depends entirely on Contact Form 7.** A custom
"cHTML - CF7 listener" tag pushes `dataLayer` events on form submit, which
fire conversions across **five ad platforms**. The relevant events/triggers:

- `cf7submission` (+ "kontakt" and "podpis" variants) → GA4, Google Ads
- `odeslat_poptavku` → GA4, Google Ads, Facebook, Adform
- `form_start` → Facebook, Adform
- `form_poptavka`, `form_kontakt - sent` → Facebook, Sklik, Google Ads
- `cf7 submit hr dokumenty` → GA4, Google Ads

**Migration implication — highest-risk item.** The safe path is to keep
`GTM-WP6ZVZF` unchanged, embed it on the new site, and **reproduce these
exact `dataLayer` pushes** on the custom form's submit/success step.
Replacing Contact Form 7 without replicating its `dataLayer` events breaks
conversion tracking on all five ad platforms at once.

**Notes:**

- `generate_lead` (the one live GA4 key event) has no distinctly-named tag —
  it is likely the event name set inside a GA4 form tag, or fired
  server-side. Confirm exact origin when building Phase 7.
- The Pipedrive chat widget is present on-site; the contact *form* leads go
  to email (per Martin), but the chat is a separate Pipedrive channel.

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
