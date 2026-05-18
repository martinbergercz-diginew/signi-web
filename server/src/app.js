import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { mkdirSync } from 'node:fs';
import Fastify from 'fastify';
import articleRoutes from './routes/articles.js';
import authRoutes from './routes/auth.js';
import submissionRoutes from './routes/submissions.js';
import uploadRoutes, { uploadDir } from './routes/uploads.js';
import userRoutes from './routes/users.js';

// The CMS application: auth, articles, users, submissions and image uploads.
// The admin panel UI and blog SSR are added in Phases 4-6.
export async function buildApp() {
  const app = Fastify({ logger: true });

  mkdirSync(uploadDir, { recursive: true });

  await app.register(cookie);
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });
  await app.register(fastifyStatic, {
    root: uploadDir,
    prefix: '/uploads/',
    decorateReply: false,
  });

  app.get('/health', async () => ({ ok: true }));

  await app.register(authRoutes);
  await app.register(articleRoutes);
  await app.register(userRoutes);
  await app.register(submissionRoutes);
  await app.register(uploadRoutes);

  return app;
}
