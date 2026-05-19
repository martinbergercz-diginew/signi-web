// One-off importer for existing blog posts. Run with `npm run import:wp`.
//
// The WordPress posts store their body in a page builder, so `content.rendered`
// from the REST API is empty. We therefore use the REST API only to enumerate
// posts (slug, title, date, category, featured image, language) and scrape the
// article body from each rendered post page — the same approach used for the
// marketing pages in Phase 5.
//
// The live origin currently serves a broken TLS chain (see discovery/findings.md),
// so certificate verification is disabled for this import only.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { db } from './db/index.js';
import { isCategory } from './lib/categories.js';

const ORIGIN = process.env.WP_ORIGIN ?? 'https://signi.com';
const WP = `${ORIGIN}/wp-json/wp/v2`;
const CONCURRENCY = 6;

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  hellip: '…', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', euro: '€',
};

function decodeEntities(input) {
  return String(input ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);
}

function stripTags(html) {
  return decodeEntities(String(html ?? '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

const ALLOWED = new Set([
  'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'blockquote', 'strong', 'b',
  'em', 'i', 'a', 'img', 'br',
]);

// Reduces the scraped post markup to clean prose: keeps semantic tags, unwraps
// layout containers, and strips all attributes except links and image sources.
function sanitize(html) {
  let h = html.replace(/<!--[\s\S]*?-->/g, '');
  h = h.replace(/<\/?([a-z0-9]+)((?:"[^"]*"|'[^']*'|[^>])*)>/gi, (m, rawTag, attrs) => {
    const tag = rawTag.toLowerCase();
    const closing = m.startsWith('</');
    if (!ALLOWED.has(tag)) return ''; // unwrap: drop the tag, keep its children
    if (closing) return `</${tag}>`;
    if (tag === 'a') {
      const href = attrs.match(/href\s*=\s*"([^"]*)"/i);
      return href ? `<a href="${href[1]}">` : '<a>';
    }
    if (tag === 'img') {
      const src = attrs.match(/(?:data-src|src)\s*=\s*"([^"]*)"/i);
      const alt = attrs.match(/alt\s*=\s*"([^"]*)"/i);
      return src ? `<img src="${src[1]}"${alt ? ` alt="${alt[1]}"` : ''} />` : '';
    }
    return `<${tag}>`;
  });
  return h
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<li>\s*<\/li>/gi, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Pulls the article body out of a rendered post page. The body lives in a
// <div class="content content--single"> container; everything from there up to
// the first trailing block (share bar, related posts, footer) is the article.
function extractBody(pageHtml) {
  let h = pageHtml.replace(/<(script|style|svg|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '');
  const container = h.match(/<div[^>]*class="[^"]*content--single[^"]*"[^>]*>/i);
  let body;
  if (container) {
    body = h.slice(container.index + container[0].length);
  } else {
    const h1End = h.search(/<\/h1>/i);
    if (h1End < 0) return '';
    body = h.slice(h1End + 5);
  }
  const endMarkers = [
    /class="[^"]*blog-carousel/i,
    /class="[^"]*share/i,
    /class="[^"]*mega-menu/i,
    /<footer/i,
  ];
  let cut = body.length;
  for (const re of endMarkers) {
    const idx = body.search(re);
    if (idx >= 0 && idx < cut) cut = idx;
  }
  // back up to the start of the tag that the marker sits inside
  const tagStart = body.lastIndexOf('<', cut);
  return sanitize(body.slice(0, tagStart >= 0 ? tagStart : cut));
}

function firstParagraph(cleanHtml) {
  const m = cleanHtml.match(/<p>([\s\S]*?)<\/p>/i);
  return m ? stripTags(m[1]).slice(0, 280) : '';
}

function languageOf(post) {
  const m = String(post.link ?? '').match(/\/\/[^/]+\/(en|sk|hu)\//);
  return m ? m[1] : 'cs';
}

function categoryOf(post) {
  const groups = post._embedded?.['wp:term'] ?? [];
  for (const group of groups) {
    for (const term of group) {
      if (term.taxonomy === 'category' && isCategory(term.slug)) return term.slug;
    }
  }
  return null;
}

async function fetchPostList() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const url = `${WP}/posts?per_page=100&page=${page}&_embed=wp:term,wp:featuredmedia`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`WP API ${res.status} for posts page ${page}`);
    totalPages = Number(res.headers.get('x-wp-totalpages') ?? 1);
    all.push(...(await res.json()));
    page += 1;
  } while (page <= totalPages);
  return all;
}

const upsert = db.prepare(
  `INSERT INTO articles
     (language, slug, title, main_image, perex, content_html, category, status, published_at)
   VALUES
     (@language, @slug, @title, @main_image, @perex, @content_html, @category, 'published', @published_at)
   ON CONFLICT (language, slug) DO UPDATE SET
     title = excluded.title, main_image = excluded.main_image, perex = excluded.perex,
     content_html = excluded.content_html, category = excluded.category,
     status = 'published', published_at = excluded.published_at, updated_at = datetime('now')`,
);

async function importPost(post) {
  const language = languageOf(post);
  const slug = post.slug;
  const title = decodeEntities(post.title?.rendered ?? '').trim();
  if (!slug || !title) return { skipped: true };

  let contentHtml = '';
  try {
    const res = await fetch(post.link);
    if (res.ok) contentHtml = extractBody(await res.text());
  } catch {
    contentHtml = '';
  }

  let perex = stripTags(post.excerpt?.rendered).slice(0, 280);
  if (!perex) perex = firstParagraph(contentHtml);

  upsert.run({
    language,
    slug,
    title,
    main_image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null,
    perex,
    content_html: contentHtml,
    category: categoryOf(post),
    published_at: post.date_gmt ? `${post.date_gmt}Z` : new Date().toISOString(),
  });
  return { language, empty: contentHtml.length === 0 };
}

async function run() {
  console.log('Fetching post list from WordPress…');
  const posts = await fetchPostList();
  console.log(`${posts.length} posts found. Scraping bodies…`);

  const stats = { imported: 0, empty: 0, byLang: {} };
  for (let i = 0; i < posts.length; i += CONCURRENCY) {
    const batch = posts.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(importPost));
    for (const r of results) {
      if (r.skipped) continue;
      stats.imported += 1;
      if (r.empty) stats.empty += 1;
      stats.byLang[r.language] = (stats.byLang[r.language] ?? 0) + 1;
    }
    process.stdout.write(`  ${Math.min(i + CONCURRENCY, posts.length)}/${posts.length}\r`);
  }

  console.log(`\nImported ${stats.imported} posts:`, stats.byLang);
  if (stats.empty) console.log(`${stats.empty} posts had no extractable body (kept as published with title only).`);
}

run().catch((err) => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
