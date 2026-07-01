import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

const dir = path.dirname(config.dbPath);
if (dir && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

export const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id   INTEGER UNIQUE NOT NULL,
  username      TEXT,
  first_name    TEXT,
  last_name     TEXT,
  photo_url     TEXT,
  role          TEXT,                       -- NULL | 'employer' | 'seeker'
  created_at    INTEGER NOT NULL,
  -- employer profile
  company       TEXT,
  rating        REAL DEFAULT 5.0,
  -- seeker profile
  name          TEXT,
  age           INTEGER,
  city          TEXT,
  desired_salary TEXT,
  about         TEXT
);

CREATE TABLE IF NOT EXISTS vacancies (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  employer_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  city          TEXT NOT NULL,
  salary        TEXT NOT NULL,
  salary_num    INTEGER DEFAULT 0,
  work_type     TEXT NOT NULL,              -- full | remote | partial | shift
  category      TEXT,
  description   TEXT,
  requirements  TEXT,
  schedule      TEXT,
  address       TEXT,
  remote        INTEGER DEFAULT 0,
  no_experience INTEGER DEFAULT 0,
  contact       TEXT,                       -- "Написать в Telegram" or custom
  status        TEXT NOT NULL DEFAULT 'open', -- open | closed
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  vacancy_id    INTEGER REFERENCES vacancies(id) ON DELETE CASCADE,
  from_user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text          TEXT NOT NULL,
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vacancy_id   INTEGER NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
  created_at   INTEGER NOT NULL,
  UNIQUE(user_id, vacancy_id)
);

CREATE INDEX IF NOT EXISTS idx_vac_status ON vacancies(status, created_at);
CREATE INDEX IF NOT EXISTS idx_vac_employer ON vacancies(employer_id);
CREATE INDEX IF NOT EXISTS idx_msg_vac ON messages(vacancy_id, created_at);
CREATE INDEX IF NOT EXISTS idx_app_user ON applications(user_id, created_at);
`);

// --- Lightweight migrations: add columns that may be missing on older DBs ---
function addColumn(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
addColumn('users', 'profession', 'TEXT');
addColumn('users', 'lang', "TEXT DEFAULT 'ru'");
addColumn('users', 'is_admin', 'INTEGER DEFAULT 0');
addColumn('vacancies', 'work_format', 'TEXT');       // onsite|remote|hybrid|field
addColumn('vacancies', 'work_hours', 'TEXT');         // e.g. 09:00–18:00
addColumn('vacancies', 'experience', 'TEXT');         // required|none|remote
addColumn('vacancies', 'contact_type', "TEXT DEFAULT 'telegram'"); // telegram|phone
addColumn('vacancies', 'contact_phone', 'TEXT');
