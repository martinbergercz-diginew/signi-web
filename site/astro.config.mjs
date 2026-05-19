import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Deployment is driven by two env vars so the same code ships to staging and
// production unchanged:
//   BASE_PATH — URL prefix the site is mounted under ('' at the production
//               root, '/prototypes/signi-web' on the dev.signi.com staging).
//   SITE_URL  — absolute origin, used for canonical/OG/sitemap URLs.
const BASE_PATH = process.env.BASE_PATH || '';
const SITE_URL = process.env.SITE_URL || 'https://signi.com';

// Public marketing site. 4 languages: cs at the root, en/sk/hu prefixed —
// matching the current WordPress URL structure (see ../discovery).
export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH || '/',
  i18n: {
    locales: ['cs', 'en', 'sk', 'hu'],
    defaultLocale: 'cs',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap()],
});
