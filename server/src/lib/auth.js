import { hash, verify } from '@node-rs/argon2';
import { randomBytes } from 'node:crypto';
import { db } from '../db/index.js';

const SESSION_DAYS = 30;

export function hashPassword(plain) {
  return hash(plain);
}

export function verifyPassword(storedHash, plain) {
  return verify(storedHash, plain);
}

export function createSession(userId) {
  const id = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(
    id,
    userId,
    expiresAt,
  );
  return { id, maxAge: SESSION_DAYS * 86400 };
}

export function destroySession(id) {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

// Resolves the current user from the session cookie, or null.
export function userFromRequest(request) {
  const sid = request.cookies?.sid;
  if (!sid) return null;
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.role, u.permissions, s.expires_at
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.id = ?`,
    )
    .get(sid);
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    destroySession(sid);
    return null;
  }
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    permissions: JSON.parse(row.permissions || '[]'),
  };
}

// preHandler guards ---------------------------------------------------------

export async function requireAuth(request, reply) {
  const user = userFromRequest(request);
  if (!user) return reply.code(401).send({ error: 'Unauthorized' });
  request.user = user;
}

export async function requireAdmin(request, reply) {
  const user = userFromRequest(request);
  if (!user) return reply.code(401).send({ error: 'Unauthorized' });
  if (user.role !== 'admin') return reply.code(403).send({ error: 'Forbidden' });
  request.user = user;
}

// Admins pass everything; other users need the section in their permissions.
export function requireSection(section) {
  return async function sectionGuard(request, reply) {
    const user = userFromRequest(request);
    if (!user) return reply.code(401).send({ error: 'Unauthorized' });
    if (user.role !== 'admin' && !user.permissions.includes(section)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    request.user = user;
  };
}
