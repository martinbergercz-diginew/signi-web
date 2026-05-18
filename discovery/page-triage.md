# Page traffic triage

**Method:** GA4 "Pages and screens", 12 months (18 May 2025 – 17 May 2026),
sorted by views. The GA property is shared with the product app, so the
report is dominated by app pages; this triage reads the top 250 pages by
views and identifies which of the 138 marketing pages surface.

## Result: traffic is concentrated in ~38 pages

Of the 138 marketing pages, **~38 surface in the top 250** — i.e. clearly
have meaningful traffic. The other **~100 pages each draw well under ~2,800
views/year**, most far less. The suspicion is correct: roughly a **quarter
of the pages carry essentially all the traffic**.

## High-traffic marketing pages → KEEP (12-month views)

**Czech**

| Page | Views |
|------|------:|
| `/` | 274,483 |
| `/odeslat-poptavku/` (main inquiry form — 485 key events) | 30,114 |
| `/cenik/` | 13,816 |
| `/pro-firmy/` | 10,487 |
| `/produkt/` | 7,141 |
| `/kariera/` | 5,943 |
| `/novela/` | 5,276 |
| `/integrace/` | 5,030 |
| `/kontakt/` | 4,523 |
| `/partneri/` | 3,775 |
| `/blog/` | 3,466 |
| `/druhy-elektronickych-podpisu/` | 3,380 |
| `/signi-od-a-do-z...-2025/` (blog post) | 3,182 |
| `/dokumenty-ke-stazeni/` | 3,071 |

**English** — ~19 pages in the top 250 (`/en/` 33,799 plus `/en/`
for-companies, pricing, partners, human-resources, career, education,
request-demo, security, product, real-estate, logistics, contact, sales,
energy, about-us, finance-2, onboarding-services, blog-2): 5,000–34,000
views each.

**Slovak** — `/sk/` 27,861 · `/sk/cennik/` 3,469 · `/sk/vasa-kariera/` 3,131
**Hungarian** — only `/hu/` (9,085) surfaced.

## Caveats / signals

- **English & Hungarian counts look bot-inflated.** Average engagement on
  `/en/*` pages is ~9 s and `/hu/` ~13 s, versus 30–40 s on Czech pages.
  Much of the en/hu "traffic" is likely crawlers, not humans — treat those
  numbers as soft.
- **Hungarian has almost no real traffic** — only `/hu/` surfaced; the other
  ~26 hu pages are near-zero. Worth questioning how much effort hu deserves.
- The ~100 low-traffic pages are typically old campaign / landing / test /
  duplicate pages (slugs with `-2`, dated names like `digitalna-firma-2026`,
  etc.).

## Recommendation

- Migrate the **~38 high-traffic pages** as the Phase 4 core.
- For the **~100 low-traffic pages**: review each — most should be dropped
  or 301-redirected to a relevant parent, not rebuilt. Decide with Martin.
- Exact numbers for any specific long-tail page can be pulled individually
  via the GA report's search box.
