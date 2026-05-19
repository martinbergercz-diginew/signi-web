# Deploy

signi-web ships as three parts that share one URL space:

| Part | Build | Served by |
|------|-------|-----------|
| `site/` | static (Astro) | Caddy, static files |
| `admin/` | static (Vite SPA) | Caddy, static files |
| `server/` | Node process (Fastify) | systemd, proxied by Caddy |

Everything is mounted under a configurable **base path** so the same code runs
on staging and production:

| Environment | `BASE_PATH` | `SITE_URL` | URL |
|-------------|-------------|------------|-----|
| Staging | `/prototypes/signi-web` | `https://dev.signi.com` | dev.signi.com/prototypes/signi-web/ |
| Production | _(empty)_ | `https://signi.com` | signi.com/ |

The staging domain is automatically `noindex` (the site only allows indexing
when `SITE_URL`'s host is `signi.com`).

## VPS layout (staging — dev.signi.com)

| Path | Contents |
|------|----------|
| `/var/www/dev/prototypes/signi-web/` | Astro static site (served by the dev.signi.com `file_server`) |
| `/var/www/dev/prototypes/signi-web/admin/` | admin panel SPA |
| `/srv/signi-web-cms/` | Fastify CMS source (outside the web root) |
| `/var/lib/signi-web/signi.sqlite` | database |

The CMS runs as the `signi-cms` systemd service on `127.0.0.1:8788`.

## One-time VPS setup (staging)

1. Create directories: `mkdir -p /srv/signi-web-cms /var/lib/signi-web /var/www/dev/prototypes/signi-web/admin`.
2. First `./deploy/deploy.sh` from a workstation (builds + syncs; the CMS
   restart will fail until the unit exists — that is expected).
3. Install the service: `cp deploy/signi-cms.service /etc/systemd/system/` then
   `systemctl daemon-reload`.
4. Initialise the database and an admin user, as `www-data`:
   ```sh
   cd /srv/signi-web-cms
   sudo -u www-data DB_PATH=/var/lib/signi-web/signi.sqlite npm run db:seed -- you@signi.com 'a-password'
   sudo -u www-data DB_PATH=/var/lib/signi-web/signi.sqlite npm run import:wp
   chown -R www-data:www-data /var/lib/signi-web
   systemctl enable --now signi-cms
   ```
5. Add the block from `deploy/Caddyfile` into the `dev.signi.com { … }` block
   in `/etc/caddy/Caddyfile`, then `caddy validate --config /etc/caddy/Caddyfile`
   and `systemctl reload caddy`.
6. (Recommended) Backups: install Litestream, copy `deploy/litestream.yml` to
   `/etc/litestream.yml`, fill in the replica credentials, enable the service.

## Routine deploy

```sh
./deploy/deploy.sh
```

Builds both static bundles with the staging base path, syncs all three parts,
and restarts the CMS. The server's `data/` directory is preserved; the database
lives outside the synced tree at `/var/lib/signi-web/`.

## Staging → production cutover

Once staging is signed off, switch to the production root:

1. **Redirect map** — export the 126 redirects from the WordPress *Redirection*
   plugin and append them to `deploy/redirects.caddy` (regenerate the blog-post
   half with `npm run gen:redirects`). Install it where the Caddyfile imports it.
2. **Image paths** — keep `/wp-content/uploads/*` resolving (blog posts link to
   images there). Either rsync the WordPress uploads folder to the new host or
   `reverse_proxy` that path to the old origin until images are migrated.
3. **Build for production** — `BASE_PATH=` (empty), `SITE_URL=https://signi.com`;
   set the same in `signi-cms.service`.
4. **Caddy** — a dedicated `signi.com` site block (root paths, redirect import).
5. Lower the signi.com DNS TTL a day ahead.
6. Final content re-sync: re-run `npm run import:wp` after the WordPress
   content freeze.
7. QA all four languages, the blog, and the form on the new origin.
8. Switch DNS to the new host; watch logs and uptime.
9. Resubmit the sitemap (`/sitemap-index.xml`) in Google Search Console.
