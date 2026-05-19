// Blog stylesheet — served by the Fastify app at /blog/styles.css.
// Mirrors the public Astro site's design system (Montserrat headings, Roboto
// body, purple #7031b4 + green #39e88d accent) so the SSR blog matches.

export const BLOG_CSS = `
:root {
  --brand: #7031b4;
  --brand-dark: #5b2790;
  --brand-light: #f9f4fe;
  --accent: #39e88d;
  --accent-dark: #35d883;
  --ink: #303334;
  --body: #4a4253;
  --muted: #6b6f70;
  --line: #e1e3e4;
  --bg-alt: #f9f4fe;
  --radius: 16px;
  --radius-sm: 13px;
  --maxw: 1300px;
  --shadow-sm: 0 6px 20px rgba(48,51,52,.07);
  --font-head: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-body: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-body); color: var(--body); background: #fff; line-height: 1.75; font-size: 16px; }
h1,h2,h3,h4 { font-family: var(--font-head); color: var(--brand); line-height: 1.3; margin: 0 0 .5em; font-weight: 700; }
h1 { font-size: clamp(2.1rem, 1.4rem + 2.9vw, 3.1rem); }
h2 { font-size: 1.7rem; }
h3 { font-size: 1.3rem; color: var(--ink); }
p { margin: 0 0 1rem; }
a { color: var(--brand); text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; height: auto; }

.container { max-width: var(--maxw); margin: 0 auto; padding: 0 32px; }
.narrow { max-width: 760px; }

/* Top utility bar */
.topbar { background: #fff; border-bottom: 1px solid var(--line); font-size: .85rem; }
.topbar__inner { display: flex; justify-content: flex-end; align-items: center; gap: 22px; height: 42px; }
.topbar a { color: var(--muted); }
.topbar a:hover { color: var(--brand); }

/* Header */
.site-header { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,.97);
  backdrop-filter: saturate(160%) blur(8px); border-bottom: 1px solid var(--line); }
.site-header__inner { display: flex; align-items: center; gap: 32px; height: 80px; }
.brand-logo { font-family: var(--font-head); font-weight: 800; font-size: 1.55rem;
  color: var(--brand); letter-spacing: -.02em; }
.brand-logo:hover { text-decoration: none; }
.brand-logo span { color: var(--accent-dark); }
.site-nav { display: flex; gap: 32px; margin: 0 auto; }
.site-nav a { color: var(--ink); font-weight: 500; font-size: 1rem; }
.site-nav a:hover { color: var(--brand); }
.btn { display: inline-flex; align-items: center; padding: 13px 26px; border-radius: var(--radius-sm);
  font-weight: 500; font-size: 1rem; background: var(--brand);
  color: #fff; border: 2px solid var(--brand); box-shadow: 0 10px 22px rgba(112,49,180,.28); }
.btn:hover { background: var(--brand-dark); border-color: var(--brand-dark); text-decoration: none; }

/* Hero */
.blog-hero { background: var(--bg-alt); padding: 72px 0 56px; }
.eyebrow { display: inline-block; font-size: .8rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--accent-dark); margin-bottom: 14px; }
.lead { font-size: 1.15rem; color: var(--muted); }

/* Category chips */
.cat-bar { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
.chip { display: inline-block; padding: 8px 18px; border-radius: 999px; font-size: .88rem;
  font-family: var(--font-head); font-weight: 600; background: #fff; border: 2px solid var(--line); color: var(--body); }
.chip:hover { border-color: var(--brand); color: var(--brand); text-decoration: none; }
.chip[aria-current="true"] { background: var(--brand); color: #fff; border-color: var(--brand); }

/* Post grid */
.section { padding: 64px 0; }
.post-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 32px; }
.post-card { display: flex; flex-direction: column; background: #fff; border-radius: var(--radius);
  overflow: hidden; box-shadow: var(--shadow-sm); }
.post-card__img { aspect-ratio: 16/9; object-fit: cover; width: 100%; background: var(--brand-light); display: block; }
.post-card__body { padding: 26px; display: flex; flex-direction: column; flex: 1; }
.post-card__meta { font-family: var(--font-head); font-size: .8rem; font-weight: 600; color: var(--accent-dark);
  text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; }
.post-card h3 { margin-bottom: 10px; font-size: 1.2rem; }
.post-card h3 a { color: var(--ink); }
.post-card h3 a:hover { color: var(--brand); }
.post-card p { font-size: .97rem; color: var(--body); }
.post-card__more { margin-top: auto; font-family: var(--font-head); font-weight: 700; font-size: .9rem; }

/* Pagination */
.pagination { display: flex; gap: 10px; justify-content: center; align-items: center; margin-top: 48px; }
.pagination a, .pagination span { padding: 11px 20px; border-radius: var(--radius-sm);
  border: 2px solid var(--line); font-family: var(--font-head); font-weight: 600; font-size: .9rem; }
.pagination span { color: var(--muted); border-color: transparent; }

/* Single post */
.post-header { padding: 64px 0 8px; background: var(--bg-alt); }
.post-meta { font-family: var(--font-head); color: var(--accent-dark); font-weight: 600;
  font-size: .85rem; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 16px; }
.post-meta a { color: var(--accent-dark); }
.post-cover { width: 100%; border-radius: var(--radius); margin: 32px 0; }
.prose { font-size: 1.07rem; margin-top: 32px; }
.prose h2 { margin-top: 1.8em; font-size: 1.6rem; }
.prose h3 { margin-top: 1.5em; }
.prose img { border-radius: var(--radius-sm); margin: 1em 0; }
.prose ul, .prose ol { padding-left: 1.3em; }
.prose li { margin-bottom: .4em; }
.prose a { text-decoration: underline; }
.back-link { display: inline-block; margin: 48px 0 0; font-family: var(--font-head); font-weight: 700; }
.empty { color: var(--muted); padding: 24px 0; }

/* Footer */
.site-footer { background: var(--ink); color: rgba(255,255,255,.7); padding: 56px 0; margin-top: 0; font-size: .92rem; }
.site-footer a { color: rgba(255,255,255,.7); }
.site-footer a:hover { color: #fff; }
.site-footer__inner { display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; }

@media (max-width: 960px) { .post-grid { grid-template-columns: repeat(2,1fr); } .site-nav { display: none; } }
@media (max-width: 720px) {
  body { font-size: 16px; }
  .container { padding: 0 20px; }
  .post-grid { grid-template-columns: 1fr; }
  .topbar__inner { gap: 14px; height: auto; padding: 8px 0; flex-wrap: wrap; justify-content: center; }
}
`;
