#!/usr/bin/env bash
# Deploys signi-web to the dev.signi.com staging path.
# Builds the public site and admin panel with the staging base path, syncs all
# three parts to the VPS, and restarts the CMS service.
#
# Usage:  ./deploy/deploy.sh
# Prereq: SSH access to the VPS; the systemd unit (deploy/signi-cms.service)
#         and Caddy snippet (deploy/Caddyfile) installed once beforehand.
set -euo pipefail

BASE_PATH=/prototypes/signi-web
SITE_URL=https://dev.signi.com
VPS=root@dev.signi.com
REMOTE=/var/www/dev/prototypes/signi-web

cd "$(dirname "$0")/.."

echo "==> Building public site (base $BASE_PATH)"
( cd site && npm ci && BASE_PATH="$BASE_PATH" SITE_URL="$SITE_URL" npm run build )

echo "==> Building admin panel"
( cd admin && npm ci && BASE_PATH="$BASE_PATH" npm run build )

echo "==> Syncing static builds"
ssh "$VPS" "mkdir -p $REMOTE/site $REMOTE/admin $REMOTE/server"
rsync -az --delete site/dist/  "$VPS:$REMOTE/site/"
rsync -az --delete admin/dist/ "$VPS:$REMOTE/admin/"

echo "==> Syncing CMS server (data/ is preserved)"
rsync -az --delete --exclude node_modules --exclude data \
  server/ "$VPS:$REMOTE/server/"
ssh "$VPS" "cd $REMOTE/server && npm ci --omit=dev && systemctl restart signi-cms"

echo "==> Done — https://dev.signi.com$BASE_PATH/"
