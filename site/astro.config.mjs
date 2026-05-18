import { defineConfig } from 'astro/config';

// Public marketing site. 4 languages: cs at the root, en/sk/hu prefixed —
// matching the current WordPress URL structure (see ../discovery).
export default defineConfig({
  site: 'https://signi.com',
  i18n: {
    locales: ['cs', 'en', 'sk', 'hu'],
    defaultLocale: 'cs',
    routing: { prefixDefaultLocale: false },
  },
});
