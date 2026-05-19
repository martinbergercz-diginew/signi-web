// Blog stylesheet — served by the Fastify app at /blog/styles.css.
// Mirrors the public Astro site's design system (brand colour #7031b4) so the
// SSR blog looks like part of the same site.

export const BLOG_CSS = `
:root {
  --brand: #7031b4;
  --brand-dark: #59268f;
  --brand-light: #f3ecfb;
  --ink: #1c1230;
  --body: #44405a;
  --muted: #6f6b82;
  --line: #e6e2ef;
  --bg-alt: #faf8fd;
  --radius: 14px;
  --radius-sm: 8px;
  --maxw: 1140px;
  --shadow-sm: 0 2px 10px rgba(28,18,48,.06);
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font); color: var(--body); background: #fff; line-height: 1.6; font-size: 17px; }
h1,h2,h3,h4 { color: var(--ink); line-height: 1.2; margin: 0 0 .5em; font-weight: 700; }
h1 { font-size: clamp(2rem, 1.4rem + 2.6vw, 3rem); letter-spacing: -.02em; }
h2 { font-size: 1.6rem; }
h3 { font-size: 1.2rem; }
p { margin: 0 0 1rem; }
a { color: var(--brand); text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; height: auto; }

.container { max-width: var(--maxw); margin: 0 auto; padding: 0 24px; }
.narrow { max-width: 760px; }

/* Header */
.site-header { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,.95);
  backdrop-filter: saturate(160%) blur(8px); border-bottom: 1px solid var(--line); }
.site-header__inner { display: flex; align-items: center; gap: 28px; height: 68px; }
.brand-logo { font-weight: 800; font-size: 1.4rem; color: var(--brand); letter-spacing: -.02em; }
.brand-logo:hover { text-decoration: none; }
.site-nav { display: flex; gap: 22px; margin-right: auto; }
.site-nav a { color: var(--ink); font-weight: 500; font-size: .97rem; }
.btn { display: inline-flex; align-items: center; padding: 11px 22px; border-radius: var(--radius-sm);
  font-weight: 600; font-size: .95rem; background: var(--brand); color: #fff; }
.btn:hover { background: var(--brand-dark); text-decoration: none; }

/* Hero */
.blog-hero { background: linear-gradient(180deg, var(--brand-light) 0%, #fff 100%); padding: 64px 0 48px; }
.eyebrow { display: inline-block; font-size: .8rem; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--brand); margin-bottom: 12px; }
.lead { font-size: 1.15rem; color: var(--muted); }

/* Category chips */
.cat-bar { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
.chip { display: inline-block; padding: 6px 14px; border-radius: 999px; font-size: .85rem;
  font-weight: 600; background: #fff; border: 1px solid var(--line); color: var(--body); }
.chip:hover { border-color: var(--brand); color: var(--brand); text-decoration: none; }
.chip[aria-current="true"] { background: var(--brand); color: #fff; border-color: var(--brand); }

/* Post grid */
.section { padding: 56px 0; }
.post-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
.post-card { display: flex; flex-direction: column; background: #fff; border: 1px solid var(--line);
  border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); }
.post-card__img { aspect-ratio: 16/9; object-fit: cover; width: 100%; background: var(--brand-light); display: block; }
.post-card__body { padding: 22px; display: flex; flex-direction: column; flex: 1; }
.post-card__meta { font-size: .82rem; color: var(--muted); margin-bottom: 8px; }
.post-card h3 { margin-bottom: 8px; }
.post-card h3 a { color: var(--ink); }
.post-card h3 a:hover { color: var(--brand); }
.post-card p { font-size: .95rem; color: var(--body); }
.post-card__more { margin-top: auto; font-weight: 600; font-size: .9rem; }

/* Pagination */
.pagination { display: flex; gap: 10px; justify-content: center; margin-top: 40px; }
.pagination a, .pagination span { padding: 9px 16px; border-radius: var(--radius-sm);
  border: 1px solid var(--line); font-weight: 600; font-size: .9rem; }
.pagination span { color: var(--muted); }

/* Single post */
.post-header { padding: 56px 0 8px; }
.post-meta { color: var(--muted); font-size: .92rem; margin-bottom: 16px; }
.post-cover { width: 100%; border-radius: var(--radius); margin: 24px 0; }
.prose { font-size: 1.05rem; }
.prose h2 { margin-top: 1.8em; }
.prose h3 { margin-top: 1.5em; }
.prose img { border-radius: var(--radius-sm); margin: 1em 0; }
.prose ul, .prose ol { padding-left: 1.3em; }
.prose li { margin-bottom: .4em; }
.prose a { text-decoration: underline; }
.back-link { display: inline-block; margin: 40px 0 0; font-weight: 600; }
.empty { color: var(--muted); padding: 24px 0; }

/* Footer */
.site-footer { background: var(--ink); color: rgba(255,255,255,.7); padding: 48px 0; margin-top: 40px; font-size: .92rem; }
.site-footer a { color: rgba(255,255,255,.7); }
.site-footer a:hover { color: #fff; }
.site-footer__inner { display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; }

@media (max-width: 900px) { .post-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 640px) {
  body { font-size: 16px; }
  .post-grid { grid-template-columns: 1fr; }
  .site-nav { display: none; }
  .site-header .btn { display: none; }
  .site-header__inner { gap: 14px; }
}
`;
