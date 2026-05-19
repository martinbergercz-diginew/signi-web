import { db } from '../db/index.js';
import { requireSection } from '../lib/auth.js';

export default async function articleRoutes(app) {
  const guard = { preHandler: requireSection('blog') };

  app.get('/api/articles', guard, async (request) => {
    const { language, status } = request.query ?? {};
    const where = [];
    const params = [];
    if (language) {
      where.push('language = ?');
      params.push(language);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }
    const sql =
      'SELECT * FROM articles' +
      (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
      ' ORDER BY updated_at DESC';
    return db.prepare(sql).all(...params);
  });

  app.get('/api/articles/:id', guard, async (request, reply) => {
    const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(request.params.id);
    if (!row) return reply.code(404).send({ error: 'Not found' });
    return row;
  });

  app.post('/api/articles', guard, async (request, reply) => {
    const b = request.body ?? {};
    if (!b.title || !b.slug || !b.language) {
      return reply.code(400).send({ error: 'title, slug and language are required' });
    }
    const status = b.status === 'published' ? 'published' : 'draft';
    const info = db
      .prepare(
        `INSERT INTO articles
           (language, slug, title, main_image, perex, content_html, category, status, translation_group, author_id, published_at)
         VALUES
           (@language, @slug, @title, @main_image, @perex, @content_html, @category, @status, @translation_group, @author_id, @published_at)`,
      )
      .run({
        language: b.language,
        slug: b.slug,
        title: b.title,
        main_image: b.main_image ?? null,
        perex: b.perex ?? '',
        content_html: b.content_html ?? '',
        category: b.category ?? null,
        status,
        translation_group: b.translation_group ?? null,
        author_id: request.user.id,
        published_at: status === 'published' ? new Date().toISOString() : null,
      });
    return reply
      .code(201)
      .send(db.prepare('SELECT * FROM articles WHERE id = ?').get(info.lastInsertRowid));
  });

  app.put('/api/articles/:id', guard, async (request, reply) => {
    const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(request.params.id);
    if (!existing) return reply.code(404).send({ error: 'Not found' });
    const b = request.body ?? {};
    const status = b.status ?? existing.status;
    const publishedAt =
      status === 'published' && existing.status !== 'published'
        ? new Date().toISOString()
        : existing.published_at;
    db.prepare(
      `UPDATE articles SET
         language = @language, slug = @slug, title = @title, main_image = @main_image,
         perex = @perex, content_html = @content_html, category = @category,
         status = @status, translation_group = @translation_group,
         updated_at = datetime('now'), published_at = @published_at
       WHERE id = @id`,
    ).run({
      id: existing.id,
      language: b.language ?? existing.language,
      slug: b.slug ?? existing.slug,
      title: b.title ?? existing.title,
      main_image: b.main_image ?? existing.main_image,
      perex: b.perex ?? existing.perex,
      content_html: b.content_html ?? existing.content_html,
      category: b.category ?? existing.category,
      status,
      translation_group: b.translation_group ?? existing.translation_group,
      published_at: publishedAt,
    });
    return db.prepare('SELECT * FROM articles WHERE id = ?').get(existing.id);
  });

  app.delete('/api/articles/:id', guard, async (request, reply) => {
    const info = db.prepare('DELETE FROM articles WHERE id = ?').run(request.params.id);
    if (info.changes === 0) return reply.code(404).send({ error: 'Not found' });
    return { ok: true };
  });
}
