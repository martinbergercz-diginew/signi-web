// Blog categories — fixed set, carried over from the WordPress site.
// The blog is Czech-only (see discovery/url-inventory.md).

export const CATEGORIES = [
  { slug: 'novinky-v-aplikaci', name: 'Novinky v aplikaci' },
  { slug: 'legislativa', name: 'Legislativa' },
  { slug: 'pripadove-studie', name: 'Případové studie' },
  { slug: 'webinare', name: 'Webináře' },
  { slug: 'ostatni', name: 'Ostatní' },
  { slug: 'nezarazene', name: 'Nezařazené' },
];

const bySlug = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function categoryName(slug) {
  return bySlug.get(slug)?.name ?? null;
}

export function isCategory(slug) {
  return bySlug.has(slug);
}
