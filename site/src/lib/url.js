// Prefixes internal links with the site's configured base path
// (import.meta.env.BASE_URL — set from the `base` option in astro.config.mjs).
// External links, mailto:, tel: and in-page anchors are returned unchanged.

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path) {
  if (path == null || path === '') return path;
  if (/^(https?:|mailto:|tel:|#)/i.test(path)) return path;
  return BASE + (path.startsWith('/') ? path : `/${path}`);
}
