import { db } from '../db/index.js';
import { hashPassword, requireAdmin } from '../lib/auth.js';

const PUBLIC_COLS = 'id, email, role, permissions, created_at, updated_at';

function shape(row) {
  return { ...row, permissions: JSON.parse(row.permissions || '[]') };
}

export default async function userRoutes(app) {
  const guard = { preHandler: requireAdmin };

  app.get('/api/users', guard, async () =>
    db.prepare(`SELECT ${PUBLIC_COLS} FROM users ORDER BY created_at`).all().map(shape),
  );

  app.post('/api/users', guard, async (request, reply) => {
    const b = request.body ?? {};
    if (!b.email || !b.password) {
      return reply.code(400).send({ error: 'email and password are required' });
    }
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(b.email)) {
      return reply.code(409).send({ error: 'Email already exists' });
    }
    const info = db
      .prepare('INSERT INTO users (email, password_hash, role, permissions) VALUES (?, ?, ?, ?)')
      .run(
        b.email,
        await hashPassword(b.password),
        b.role === 'admin' ? 'admin' : 'user',
        JSON.stringify(Array.isArray(b.permissions) ? b.permissions : []),
      );
    return reply
      .code(201)
      .send(shape(db.prepare(`SELECT ${PUBLIC_COLS} FROM users WHERE id = ?`).get(info.lastInsertRowid)));
  });

  app.put('/api/users/:id', guard, async (request, reply) => {
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(request.params.id);
    if (!existing) return reply.code(404).send({ error: 'Not found' });
    const b = request.body ?? {};
    db.prepare(
      `UPDATE users SET
         email = @email, password_hash = @password_hash, role = @role,
         permissions = @permissions, updated_at = datetime('now')
       WHERE id = @id`,
    ).run({
      id: existing.id,
      email: b.email ?? existing.email,
      password_hash: b.password ? await hashPassword(b.password) : existing.password_hash,
      role: b.role ?? existing.role,
      permissions: JSON.stringify(
        Array.isArray(b.permissions)
          ? b.permissions
          : JSON.parse(existing.permissions || '[]'),
      ),
    });
    return shape(db.prepare(`SELECT ${PUBLIC_COLS} FROM users WHERE id = ?`).get(existing.id));
  });

  app.delete('/api/users/:id', guard, async (request, reply) => {
    if (Number(request.params.id) === request.user.id) {
      return reply.code(400).send({ error: 'You cannot delete your own account' });
    }
    const info = db.prepare('DELETE FROM users WHERE id = ?').run(request.params.id);
    if (info.changes === 0) return reply.code(404).send({ error: 'Not found' });
    return { ok: true };
  });
}
