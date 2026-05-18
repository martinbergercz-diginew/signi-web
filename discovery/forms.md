# Contact Form 7 forms

The live site has **49 CF7 forms** — but they collapse into ~8 functional
types, each duplicated across languages (cs/en/sk/hu) and topics. Many are
stale duplicates (`_copy`, years old). The migration consolidates these into
a handful of real forms, each handling 4 languages via fields — not 49.

Submissions were **never stored** in WordPress (the Flamingo plugin is
inactive) — leads only ever went to email. So there is no lead history to
migrate.

## Functional types

| Type | Purpose | Variants |
|------|---------|----------|
| Kontaktní formulář | Main contact / sales | base, "Nový" ×4 langs, Partneři, EN/HU/HU2 |
| Poptávka | Inquiry / quote request | base, EN, HU, Specialista ×4 langs + _copy, Paperless academy |
| Vyzkoušejte si | Free-trial signup | cs, EN, HU, SK |
| Zájemce | Prospect | cs, EN, HU, _copy ×2 |
| Newsletter | Newsletter signup | cs, EN, HU |
| Materiál | Gated content / lead-magnet downloads | 40 HR dokumentů, Ebook Digitalizace, HR ebook + 5 "Stáhněte si" topic forms |
| Pracovní pozice | Job applications (careers) | cs, EN, HU, SK |
| Misc | webinar, Právní analýza, Digitalna firma, Flowdoc | — |

## Phase 7 notes

- Newsletter signup likely feeds **Ecomail** (email marketing — its pixel is
  in GTM), not just an inbox — confirm.
- "Materiál" forms gate a PDF download behind an email — the new form must
  deliver the file after submit.
- Job-application forms belong with the careers section.
- Capture each real form's mail template (recipient addresses) and thank-you
  redirect when building Phase 7.
- Form submits drive conversion tracking across 5 ad platforms — see the GTM
  section in `findings.md`.
