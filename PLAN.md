# signi.com — Migration Plan (WordPress → Static + Custom CMS)

_Last updated: 2026-05-18_

## Goal

Replace the fragile WordPress signi.com with a fast, mostly-static site plus a
small custom CMS. Fewer moving parts, full SEO preserved, Google Tag Manager
kept, 4 languages supported.

## Why

The current WordPress stack (PHP + MySQL + many plugins) keeps breaking — every
page is assembled live, so any component can take the site down. Static HTML
pages cannot break. A small backend that we fully control is a completely
different risk class from WordPress.

## Architecture

```
                          ┌─────────────────────────────┐
   visitor ──► Caddy ──┬──► signi.com/*      static HTML (Astro build), served from disk
                       │
                       ├──► signi.com/blog/* ─┐
                       ├──► signi.com/api/*  ─┤──► one Node app (Fastify)
                       └──► admin.signi.com  ─┘     blog SSR + form endpoint + admin
                                                          │
                                              ┌───────────▼──────────┐
                                              │  SQLite: articles,   │
                                              │  users, submissions  │
                                              └──────────────────────┘
```

- **Public marketing pages** — Astro, pre-built static HTML, served directly by
  Caddy. Bulletproof: stays up even if the Node app is down.
- **One Node app (Fastify)** — serves the admin API, the admin panel, the blog
  SSR, and the public form endpoint. One process, one deploy, one thing to
  monitor.
- **SQLite** — single database file: `articles`, `users`, `submissions`.
- Hosted on the **same VPS as dev.signi.com**, behind **Caddy**, run as a
  **systemd** service — same pattern as the `faktury` prototype.
- Email via a transactional service (**Resend** or **Postmark**).
- Optional: **Cloudflare** in front (CDN/cache for the SSR blog, origin
  protection).

## Locked decisions

- **Languages:** 4 — `cs` (root), `en` (`/en/`), `sk` (`/sk/`), `hu` (`/hu/`).
- **Blog:** server-rendered — publishing is instantly live.
- **Admin:** at `admin.signi.com`.
- **Forms:** stored in the CMS log **and** emailed to the sales inbox. No CRM.
- **Stack:** Fastify + SQLite + Astro. TipTap WYSIWYG editor. Per-section
  permissions (not hardcoded roles).
- **Repo:** this one (`signi-web`), separate from the prototypes monorepo.
- **Deploy:** a deliberate pipeline (build → SSH → restart service). NOT the
  per-turn auto-deploy hook used for throwaway prototypes.

## CMS data model (SQLite)

- `users` — email, password (hashed), role/permissions, timestamps
- `articles` — title, slug, language, main image, content (HTML), status
  (draft/published), author, translation group, timestamps
- `submissions` — form type, payload, timestamp, status (new/read)

## Roles & permissions

- **admin** — full access, including user management.
- **user** — access to whichever sections are granted (initially: blog, logs).
- Built as a per-section permission list so new sections add cleanly.

## The 9 phases

1. **Discovery** — URL inventory ×4 languages, redirect map, GTM container
   audit, consent mechanism, all CF7 forms + fields + thank-you redirects,
   export Rank Math redirects, media inventory. _(in progress — see
   `discovery/`)_
2. **Repo & skeleton** — single Fastify app, Astro, SQLite schema.
3. **CMS backend** — auth, per-section permissions, articles/users/submissions
   APIs, image upload.
4. **Admin panel** (`admin.signi.com`) — login, user management, TipTap blog
   editor, form-log viewer.
5. **Public site** — Astro static marketing pages ×4 languages, GTM embed,
   cookie consent.
6. **Blog** — SSR routes, category archive pages, RSS feed; import existing
   WordPress posts.
7. **Forms** — custom form + spam protection (honeypot, rate-limit, Turnstile)
   + email via Resend + autoresponder + thank-you page firing the `dataLayer`
   event so GTM conversion tracking survives.
8. **SEO parity** — meta / Open Graph / JSON-LD / canonical / hreflang,
   sitemap, robots, 301 redirects in Caddy, preserve `/wp-content/uploads/`
   image paths.
9. **Deploy & cutover** — systemd + Caddy, Litestream SQLite backups, uptime
   monitoring, `noindex` staging, lower DNS TTL, QA ×4 languages, content
   freeze + final re-sync, switch, resubmit sitemap to Search Console.

## Open items / risks

- **GTM audit** — container `GTM-WP6ZVZF`. Needs viewer access. Form-conversion
  events (currently fired on CF7 thank-you pages) must be replicated or
  marketing loses lead tracking.
- **Cookie consent** — no consent tool found in the static HTML; confirm
  whether it runs inside GTM (Consent Mode) or elsewhere. EU/GDPR requirement.
- **Co-location** — production signi.com will share the VPS with throwaway
  prototypes; isolate services (own systemd unit, own directory).
- **Content freeze** — marketing keeps publishing on WordPress during the
  project; a final content re-sync is needed before cutover.
