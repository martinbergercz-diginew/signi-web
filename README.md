# signi-web

The signi.com website — fast static marketing pages (Astro) plus a small custom
CMS (Fastify + SQLite). Replaces the previous WordPress site.

**Status:** Phase 3 — CMS backend (auth, articles, users, submissions, uploads).

See [PLAN.md](PLAN.md) for the architecture, decisions, and migration phases.
See [discovery/](discovery/) for the live-site audit and URL inventory.

## Structure

| Folder | What | Stack |
|--------|------|-------|
| `site/` | Public marketing site, 4 languages | Astro |
| `server/` | CMS — admin, blog data, form intake | Fastify + SQLite |
| `discovery/` | Phase 1 live-site audit | — |

## Dev

```sh
# public site
cd site && npm install && npm run dev

# CMS
cd server && npm install
npm run db:seed -- you@example.com yourpassword   # first run only — creates an admin
npm run dev
```

The CMS API runs on `http://127.0.0.1:3001` (`POST /api/auth/login`,
`/api/articles`, `/api/users`, `/api/submissions`, `/api/uploads`).
