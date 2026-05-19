// Deployment configuration, driven by env vars so the same build ships to
// staging and production unchanged:
//   BASE_PATH — URL prefix the app is mounted under ('' at the production
//               root, '/prototypes/signi-web' on the dev.signi.com staging).
//   SITE_URL  — absolute origin (no path), used to build canonical/RSS URLs.

export const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/+$/, '');
export const SITE_URL = (process.env.SITE_URL || 'https://signi.com').replace(/\/+$/, '');

// Absolute base for canonical / RSS / sitemap links — origin plus base path.
export const SITE = SITE_URL + BASE_PATH;

// Prefixes an internal (root-relative) path with the base path.
export function p(path) {
  return BASE_PATH + path;
}
