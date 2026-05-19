import { db } from '../db/index.js';
import { BLOG_CSS } from '../blog/styles.js';
import { renderPage, escapeHtml, formatDate } from '../blog/layout.js';
import { CATEGORIES, categoryName, isCategory } from '../lib/categories.js';
import { SITE, p } from '../lib/config.js';

// The public blog is Czech-only — see discovery/url-inventory.md.
const LANG = 'cs';
const PER_PAGE = 12;

const listPublished = db.prepare(
  `SELECT * FROM articles
    WHERE status = 'published' AND language = ?
      AND (@category IS NULL OR category = @category)
    ORDER BY COALESCE(published_at, created_at) DESC
    LIMIT @limit OFFSET @offset`,
);
const countPublished = db.prepare(
  `SELECT COUNT(*) AS n FROM articles
    WHERE status = 'published' AND language = ?
      AND (@category IS NULL OR category = @category)`,
);
const getBySlug = db.prepare(
  `SELECT * FROM articles WHERE slug = ? AND language = ? AND status = 'published'`,
);

function categoryBar(activeSlug) {
  const chip = (href, label, active) =>
    `<a class="chip" href="${href}"${active ? ' aria-current="true"' : ''}>${escapeHtml(label)}</a>`;
  return `<div class="cat-bar">
    ${chip(p('/blog/'), 'Všechny články', !activeSlug)}
    ${CATEGORIES.map((c) => chip(p(`/category/${c.slug}/`), c.name, c.slug === activeSlug)).join('\n    ')}
  </div>`;
}

function postCard(a) {
  const href = p(`/blog/${escapeHtml(a.slug)}/`);
  const img = a.main_image
    ? `<a href="${href}"><img class="post-card__img" src="${escapeHtml(a.main_image)}" alt="" loading="lazy" /></a>`
    : `<a href="${href}"><span class="post-card__img"></span></a>`;
  return `<article class="post-card">
    ${img}
    <div class="post-card__body">
      <div class="post-card__meta">${[cat(a), formatDate(a.published_at || a.created_at)].filter(Boolean).map(escapeHtml).join(' · ')}</div>
      <h3><a href="${href}">${escapeHtml(a.title)}</a></h3>
      ${a.perex ? `<p>${escapeHtml(a.perex)}</p>` : ''}
      <span class="post-card__more">Číst dál →</span>
    </div>
  </article>`;
}
function cat(a) {
  return categoryName(a.category);
}

function pagination(basePath, page, totalPages) {
  if (totalPages <= 1) return '';
  const link = (n, label) => `<a href="${basePath}${n > 1 ? `?page=${n}` : ''}">${label}</a>`;
  return `<nav class="pagination" aria-label="Stránkování">
    ${page > 1 ? link(page - 1, '← Novější') : ''}
    <span>Strana ${page} z ${totalPages}</span>
    ${page < totalPages ? link(page + 1, 'Starší →') : ''}
  </nav>`;
}

function renderListing({ eyebrow, heading, lead, activeCategory, basePath, page }) {
  const offset = (page - 1) * PER_PAGE;
  const params = { category: activeCategory ?? null, limit: PER_PAGE, offset };
  const articles = listPublished.all(LANG, params);
  const total = countPublished.get(LANG, { category: activeCategory ?? null }).n;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const grid = articles.length
    ? `<div class="post-grid">${articles.map(postCard).join('\n')}</div>`
    : '<p class="empty">Zatím tu nejsou žádné články.</p>';

  return `
  <section class="blog-hero">
    <div class="container">
      <span class="eyebrow">${escapeHtml(eyebrow)}</span>
      <h1>${escapeHtml(heading)}</h1>
      ${lead ? `<p class="lead">${escapeHtml(lead)}</p>` : ''}
      ${categoryBar(activeCategory)}
    </div>
  </section>
  <section class="section">
    <div class="container">
      ${grid}
      ${pagination(basePath, page, totalPages)}
    </div>
  </section>`;
}

function pageNumber(query) {
  const n = Number.parseInt(query?.page, 10);
  return Number.isFinite(n) && n > 1 ? n : 1;
}

export default async function blogRoutes(app) {
  app.get('/blog/styles.css', async (request, reply) => {
    reply.header('Content-Type', 'text/css; charset=utf-8');
    reply.header('Cache-Control', 'public, max-age=3600');
    return BLOG_CSS;
  });

  app.get('/blog/rss.xml', async (request, reply) => {
    const items = listPublished.all(LANG, { category: null, limit: 30, offset: 0 });
    const xmlItems = items
      .map((a) => {
        const link = `${SITE}/blog/${a.slug}/`;
        const date = new Date(a.published_at || a.created_at).toUTCString();
        return `    <item>
      <title>${escapeHtml(a.title)}</title>
      <link>${escapeHtml(link)}</link>
      <guid isPermaLink="true">${escapeHtml(link)}</guid>
      <pubDate>${date}</pubDate>
      ${a.category ? `<category>${escapeHtml(categoryName(a.category) ?? a.category)}</category>` : ''}
      <description>${escapeHtml(a.perex)}</description>
    </item>`;
      })
      .join('\n');
    reply.header('Content-Type', 'application/rss+xml; charset=utf-8');
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Signi blog</title>
    <link>${SITE}/blog/</link>
    <description>Novinky a články o digitálním podepisování dokumentů.</description>
    <language>cs</language>
${xmlItems}
  </channel>
</rss>`;
  });

  app.get('/blog/sitemap.xml', async (request, reply) => {
    const posts = db
      .prepare(
        `SELECT slug, COALESCE(published_at, created_at) AS d FROM articles
          WHERE status = 'published' AND language = ? ORDER BY d DESC`,
      )
      .all(LANG);
    const entry = (loc, lastmod) =>
      `  <url><loc>${escapeHtml(loc)}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}</url>`;
    const entries = [
      entry(`${SITE}/blog/`),
      ...CATEGORIES.map((c) => entry(`${SITE}/category/${c.slug}/`)),
      ...posts.map((post) => entry(`${SITE}/blog/${post.slug}/`, post.d)),
    ];
    reply.type('application/xml; charset=utf-8');
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;
  });

  app.get('/blog/', async (request, reply) => {
    const page = pageNumber(request.query);
    reply.type('text/html; charset=utf-8');
    return renderPage({
      title: page > 1 ? `Blog — strana ${page} | Signi` : 'Blog | Signi',
      description: 'Novinky a články o digitálním podepisování dokumentů a digitalizaci firem.',
      canonical: `${SITE}/blog/`,
      body: renderListing({
        eyebrow: 'Blog',
        heading: 'Novinky ze světa digitálního podepisování',
        lead: 'Píšeme o tom, jak se posunout od papírů k digitálním dokumentům.',
        activeCategory: null,
        basePath: p('/blog/'),
        page,
      }),
    });
  });

  app.get('/category/:slug/', async (request, reply) => {
    const { slug } = request.params;
    if (!isCategory(slug)) return reply.code(404).type('text/html').send(notFound());
    const page = pageNumber(request.query);
    const name = categoryName(slug);
    reply.type('text/html; charset=utf-8');
    return renderPage({
      title: `${name} | Signi blog`,
      description: `Články z kategorie ${name} na blogu Signi.`,
      canonical: `${SITE}/category/${slug}/`,
      body: renderListing({
        eyebrow: 'Kategorie',
        heading: name,
        lead: '',
        activeCategory: slug,
        basePath: p(`/category/${slug}/`),
        page,
      }),
    });
  });

  app.get('/blog/:slug/', async (request, reply) => {
    const article = getBySlug.get(request.params.slug, LANG);
    if (!article) return reply.code(404).type('text/html').send(notFound());
    reply.type('text/html; charset=utf-8');

    const name = categoryName(article.category);
    const meta = [
      name ? `<a href="${p(`/category/${escapeHtml(article.category)}/`)}">${escapeHtml(name)}</a>` : '',
      escapeHtml(formatDate(article.published_at || article.created_at)),
    ]
      .filter(Boolean)
      .join(' · ');

    const body = `
  <article>
    <header class="post-header">
      <div class="container narrow">
        <div class="post-meta">${meta}</div>
        <h1>${escapeHtml(article.title)}</h1>
      </div>
    </header>
    <div class="container narrow">
      ${article.main_image ? `<img class="post-cover" src="${escapeHtml(article.main_image)}" alt="" />` : ''}
      <div class="prose">${article.content_html}</div>
      <a class="back-link" href="${p('/blog/')}">← Zpět na blog</a>
    </div>
  </article>`;

    const publishedAt = article.published_at || article.created_at;
    const blogPosting = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      datePublished: publishedAt,
      dateModified: article.updated_at || publishedAt,
      mainEntityOfPage: `${SITE}/blog/${article.slug}/`,
      publisher: {
        '@type': 'Organization',
        name: 'Signi',
        logo: { '@type': 'ImageObject', url: `${SITE}/favicon.svg` },
      },
      ...(article.perex ? { description: article.perex } : {}),
      ...(article.main_image ? { image: article.main_image } : {}),
    };

    return renderPage({
      title: `${article.title} | Signi blog`,
      description: article.perex,
      canonical: `${SITE}/blog/${article.slug}/`,
      ogType: 'article',
      ogImage: article.main_image || '',
      jsonLd: blogPosting,
      body,
    });
  });
}

function notFound() {
  return renderPage({
    title: 'Stránka nenalezena | Signi blog',
    body: `<section class="section"><div class="container narrow">
      <h1>Stránka nenalezena</h1>
      <p>Tento článek neexistuje nebo byl přesunut.</p>
      <a class="back-link" href="${p('/blog/')}">← Zpět na blog</a>
    </div></section>`,
  });
}
