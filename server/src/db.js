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

CREATE INDEX IF NOT EXISTS idx_vac_status ON vacancies(status, created_at);
CREATE INDEX IF NOT EXISTS idx_vac_employer ON vacancies(employer_id);
CREATE INDEX IF NOT EXISTS idx_msg_vac ON messages(vacancy_id, created_at);
`);
