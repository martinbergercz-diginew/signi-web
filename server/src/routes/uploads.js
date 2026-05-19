import { randomBytes } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { requireAuth } from '../lib/auth.js';
import { p } from '../lib/config.js';

const here = dirname(fileURLToPath(import.meta.url));
export const uploadDir = join(here, '../../data/uploads');

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

export default async function uploadRoutes(app) {
  app.post('/api/uploads', { preHandler: requireAuth }, async (request, reply) => {
    const file = await request.file();
    if (!file) return reply.code(400).send({ error: 'No file provided' });

    const ext = extname(file.filename).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return reply.code(400).send({ error: 'Unsupported file type' });
    }

    await mkdir(uploadDir, { recursive: true });
    const name = randomBytes(16).toString('hex') + ext;
    await pipeline(file.file, createWriteStream(join(uploadDir, name)));

    if (file.file.truncated) {
      return reply.code(413).send({ error: 'File too large' });
    }
    return reply.code(201).send({ url: p(`/uploads/${name}`) });
  });
}
