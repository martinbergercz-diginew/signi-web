import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The admin panel is served at `${BASE_PATH}/admin/` — '' at the production
// root, '/prototypes/signi-web' on the dev.signi.com staging.
const BASE_PATH = process.env.BASE_PATH || '';

// In dev the CMS API runs separately on :3001; proxy to it so the browser
// sees one origin (keeps the session cookie working). In production the
// Fastify app serves this build, so no proxy is needed.
export default defineConfig({
  base: `${BASE_PATH}/admin/`,
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3001',
      '/uploads': 'http://127.0.0.1:3001',
    },
  },
});
