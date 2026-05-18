import cookie from '@fastify/cookie';
import Fastify from 'fastify';

// The CMS application. Routes for auth, articles, users, submissions, the
// admin panel and blog SSR are added in Phases 3-7.
export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cookie);

  app.get('/health', async () => ({ ok: true }));

  return app;
}
