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

## One-time VPS setup (staging)

1. Install Node 20+ on the VPS.
2. Create the database directory and the systemd unit:
   ```sh
   mkdir -p /var/lib/signi-web
   cp deploy/signi-cms.service /etc/systemd/system/
   systemctl daemon-reload
   ```
3. Add the Caddy block from `deploy/Caddyfile` into the existing
   `dev.signi.com` site block; reload Caddy.
4. First deploy: run `./deploy/deploy.sh` from a workstation.
5. On the VPS, initialise the database and an admin user:
   ```sh
   cd /var/www/dev/prototypes/signi-web/server
   DB_PATH=/var/lib/signi-web/signi.sqlite npm run db:seed -- you@signi.com 'a-password'
   DB_PATH=/var/lib/signi-web/signi.sqlite npm run import:wp   # imports blog posts
   systemctl restart signi-cms
   ```
6. (Recommended) Set up backups: install Litestream, copy `deploy/litestream.yml`
   to `/etc/litestream.yml`, fill in the replica credentials, `systemctl enable
   --now litestream`.

## Routine deploy

```sh
./deploy/deploy.sh
```

Builds both static bundles with the staging base path, syncs all three parts,
and restarts the CMS. The server's `data/` directory (uploads) is preserved;
the database lives outside the synced tree at `/var/lib/signi-web/`.

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
4. **Caddy** — use the production block sketched at the bottom of
   `deploy/Caddyfile` (root paths, redirect import).
5. Lower the signi.com DNS TTL a day ahead.
6. Final content re-sync: re-run `npm run import:wp` after the WordPress
   content freeze.
7. QA all four languages, the blog, and the form on the new origin.
8. Switch DNS to the new host; watch logs and uptime.
9. Resubmit the sitemap (`/sitemap-index.xml`) in Google Search Console.
