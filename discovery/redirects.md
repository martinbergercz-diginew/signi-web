# Redirects

The live site has **two** redirect managers. Both must be consolidated into
the new site's Caddy config (Phase 8).

## Redirection plugin (John Godley) — 126 redirects

The primary redirect store: **126** 301s (active + inactive). Some point to
external URLs (e.g. a Google Drive folder). Export the full list via the
plugin's **Tools → Redirection → Import/Export** (CSV or JSON) when building
the Phase 8 redirect map.

## Rank Math redirects — 8 redirects

| From | To | Type | Hits |
|------|----|------|-----:|
| `/homeoffice` | `https://signi.com` | 301 | 12 |
| `/kompletni-cenik/` | `/wp-content/uploads/2023/04/kompletni-cenik-signi-v-52023.pdf` | 301 | 61 |
| `/webinar-signifikace` | `/category/webinare/` | 301 | 196 |
| `/wp-content/uploads/2022/07/budoucnost_hr_ebook_signi.pdf` | `/wp-content/uploads/2022/08/budoucnost_hr_ebook_signi.pdf` | 301 | 0 |
| `/funkce` | `/produkt` | 301 | 1 012 |
| `/aml` | `/produkt` | 301 | 15 904 |
| `/bankid` | `/bank-id` | 301 | 9 |
| `/jak-to-funguje` | `/produkt` | 301 | 2 158 |

**Total: ~134 redirects** to carry into Caddy.
