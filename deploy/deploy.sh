#!/usr/bin/env bash
# Deploys signi-web to the dev.signi.com staging path.
# Builds the public site and admin panel with the staging base path, syncs all
# three parts to the VPS, and restarts the CMS service.
#
# Usage:  ./deploy/deploy.sh
# Prereq: SSH access to the VPS; one-time setup done (see deploy/README.md):
#         the signi-cms systemd unit, the Caddy block, /var/lib/signi-web.
set -euo pipefail

BASE_PATH=/prototypes/signi-web
SITE_URL=https://dev.signi.com
VPS=root@dev.signi.com
WEB=/var/www/dev/prototypes/signi-web   # static site + admin
CMS=/srv/signi-web-cms                  # Fastify server (outside the web root)

cd "$(dirname "$0")/.."

echo "==> Building public site (base $BASE_PATH)"
( cd site && npm ci && BASE_PATH="$BASE_PATH" SITE_URL="$SITE_URL" npm run build )

echo "==> Building admin panel"
( cd admin && npm ci && BASE_PATH="$BASE_PATH" npm run build )

echo "==> Syncing static builds"
ssh "$VPS" "mkdir -p $WEB/admin $CMS"
# --exclude admin so the admin/ subdir survives the site's --delete
rsync -az --delete --exclude admin site/dist/  "$VPS:$WEB/"
rsync -az --delete            admin/dist/      "$VPS:$WEB/admin/"

echo "==> Syncing CMS server (data/ is preserved)"
rsync -az --delete --exclude node_modules --exclude data \
  server/ "$VPS:$CMS/"
ssh "$VPS" "cd $CMS && npm ci --omit=dev && chown -R www-data:www-data $CMS && systemctl restart signi-cms"

echo "==> Done — https://dev.signi.com$BASE_PATH/"
