-- signi-web CMS database schema (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  permissions   TEXT NOT NULL DEFAULT '[]',          -- JSON array of section keys
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,                       -- random token, stored in the cookie
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  language          TEXT NOT NULL DEFAULT 'cs' CHECK (language IN ('cs', 'en', 'sk', 'hu')),
  slug              TEXT NOT NULL,
  title             TEXT NOT NULL,
  main_image        TEXT,
  content_html      TEXT NOT NULL DEFAULT '',
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  translation_group TEXT,                            -- links the same article across languages
  author_id         INTEGER REFERENCES users(id),
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
  published_at      TEXT,
  UNIQUE (language, slug)
);

CREATE TABLE IF NOT EXISTS submissions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  form_type  TEXT NOT NULL,                          -- e.g. 'contact', 'demo'
  payload    TEXT NOT NULL,                          -- JSON of submitted fields
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user       ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_articles_status_lang ON articles (status, language);
CREATE INDEX IF NOT EXISTS idx_submissions_created  ON submissions (created_at);
