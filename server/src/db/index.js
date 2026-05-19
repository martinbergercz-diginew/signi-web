import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH ?? join(here, '../../data/signi.sqlite');

mkdirSync(dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema is all CREATE ... IF NOT EXISTS, so applying it on every open is safe.
db.exec(readFileSync(join(here, 'schema.sql'), 'utf8'));

// Idempotent column migrations — schema.sql defines new columns for fresh
// databases, this brings already-created tables up to date.
function addColumnIfMissing(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
addColumnIfMissing('articles', 'perex', "TEXT NOT NULL DEFAULT ''");
addColumnIfMissing('articles', 'category', 'TEXT');

// Indexes on migrated columns — created after the columns are guaranteed present.
db.exec('CREATE INDEX IF NOT EXISTS idx_articles_category ON articles (category)');
