import { db } from '../db/index.js';
import { createSession, destroySession, userFromRequest, verifyPassword } from '../lib/auth.js';

export default async function authRoutes(app) {
  app.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body ?? {};
    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !(await verifyPassword(user.password_hash, password))) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }
    const session = createSession(user.id);
    reply.setCookie('sid', session.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: session.maxAge,
    });
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: JSON.parse(user.permissions || '[]'),
    };
  });

  app.post('/api/auth/logout', async (request, reply) => {
    const sid = request.cookies?.sid;
    if (sid) destroySession(sid);
    reply.clearCookie('sid', { path: '/' });
    return { ok: true };
  });

  app.get('/api/auth/me', async (request, reply) => {
    const user = userFromRequest(request);
    if (!user) return reply.code(401).send({ error: 'Unauthorized' });
    return user;
  });
}
