# signi-web

The signi.com website — fast static marketing pages (Astro) plus a small custom
CMS (Fastify + SQLite). Replaces the previous WordPress site.

**Status:** Phase 2 — repo skeleton.

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
cd server && npm install && npm run db:init && npm run dev
```
