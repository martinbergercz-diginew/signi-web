import cookie from '@fastify/cookie';
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { mkdirSync } from 'node:fs';
import Fastify from 'fastify';
import articleRoutes from './routes/articles.js';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import formRoutes from './routes/forms.js';
import submissionRoutes from './routes/submissions.js';
import uploadRoutes, { uploadDir } from './routes/uploads.js';
import userRoutes from './routes/users.js';

// The CMS application: auth, articles, users, submissions, image uploads and
// the server-rendered public blog.
export async function buildApp() {
  const app = Fastify({ logger: true, ignoreTrailingSlash: true });

  mkdirSync(uploadDir, { recursive: true });

  await app.register(cookie);
  await app.register(formbody);
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
  await app.register(formRoutes);
  await app.register(blogRoutes);

  return app;
}
