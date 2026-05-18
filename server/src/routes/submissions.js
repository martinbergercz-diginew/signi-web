import { db } from '../db/index.js';
import { requireSection } from '../lib/auth.js';

// Admin-facing view of contact-form submissions. The public intake endpoint
// that creates these rows is built in Phase 7.
export default async function submissionRoutes(app) {
  const guard = { preHandler: requireSection('logs') };

  app.get('/api/submissions', guard, async (request) => {
    const { status } = request.query ?? {};
    const sql =
      'SELECT * FROM submissions' +
      (status ? ' WHERE status = ?' : '') +
      ' ORDER BY created_at DESC';
    const rows = status ? db.prepare(sql).all(status) : db.prepare(sql).all();
    return rows.map((s) => ({ ...s, payload: JSON.parse(s.payload) }));
  });

  app.get('/api/submissions/:id', guard, async (request, reply) => {
    const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(request.params.id);
    if (!row) return reply.code(404).send({ error: 'Not found' });
    return { ...row, payload: JSON.parse(row.payload) };
  });

  app.patch('/api/submissions/:id', guard, async (request, reply) => {
    const status = request.body?.status;
    if (status !== 'new' && status !== 'read') {
      return reply.code(400).send({ error: 'status must be "new" or "read"' });
    }
    const info = db
      .prepare('UPDATE submissions SET status = ? WHERE id = ?')
      .run(status, request.params.id);
    if (info.changes === 0) return reply.code(404).send({ error: 'Not found' });
    return { ok: true };
  });
}
