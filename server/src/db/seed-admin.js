// Creates the first admin user. Usage:
//   node src/db/seed-admin.js <email> <password>
const { db } = await import('./index.js');
const { hashPassword } = await import('../lib/auth.js');

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: node src/db/seed-admin.js <email> <password>');
  process.exit(1);
}

if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
  console.error(`User ${email} already exists.`);
  process.exit(1);
}

db.prepare(
  `INSERT INTO users (email, password_hash, role, permissions)
   VALUES (?, ?, 'admin', '["blog","logs","users"]')`,
).run(email, await hashPassword(password));

console.log(`Admin user ${email} created.`);
