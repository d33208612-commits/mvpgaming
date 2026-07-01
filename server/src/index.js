import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { db } from './db.js';
import { validateInitData } from './initData.js';
import { findBannedWord } from './moderation.js';
import crypto from 'node:crypto';

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

const now = () => Math.floor(Date.now() / 1000);

// ---------------------------------------------------------------------------
// User helpers
// ---------------------------------------------------------------------------
const findByTg = db.prepare('SELECT * FROM users WHERE telegram_id = ?');
const insertUser = db.prepare(`
  INSERT INTO users (telegram_id, username, first_name, last_name, photo_url, name, created_at)
  VALUES (@telegram_id, @username, @first_name, @last_name, @photo_url, @name, @created_at)
`);
const touchUser = db.prepare(`
  UPDATE users SET username=@username, first_name=@first_name,
    last_name=@last_name, photo_url=@photo_url WHERE telegram_id=@telegram_id
`);

function upsertUser(tg) {
  const existing = findByTg.get(tg.id);
  const fields = {
    telegram_id: tg.id,
    username: tg.username || null,
    first_name: tg.first_name || null,
    last_name: tg.last_name || null,
    photo_url: tg.photo_url || null,
  };
  if (existing) {
    touchUser.run(fields);
    return findByTg.get(tg.id);
  }
  insertUser.run({
    ...fields,
    name: tg.first_name || tg.username || 'Пользователь',
    created_at: now(),
  });
  return findByTg.get(tg.id);
}

// ---------------------------------------------------------------------------
// Auth middleware — expects `Authorization: tma <initDataRaw>`
// In dev (ALLOW_DEV_AUTH) also accepts `Authorization: dev <telegram_id>`
// ---------------------------------------------------------------------------
function auth(req, res, next) {
  const header = req.get('authorization') || '';
  const [scheme, ...rest] = header.split(' ');
  const value = rest.join(' ');

  if (scheme === 'tma' && value) {
    const result = validateInitData(value);
    if (!result.ok) {
      return res.status(401).json({ error: 'invalid_init_data', reason: result.reason });
    }
    req.user = upsertUser(result.user);
    return next();
  }

  if (config.allowDevAuth && scheme === 'dev') {
    const id = Number(value) || 99999;
    req.user = upsertUser({ id, first_name: 'Dev', username: `dev${id}` });
    return next();
  }

  return res.status(401).json({ error: 'unauthorized' });
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------
function publicUser(u) {
  if (!u) return null;
  const closed = db
    .prepare("SELECT COUNT(*) c FROM vacancies WHERE employer_id=? AND status='closed'")
    .get(u.id).c;
  const total = db
    .prepare('SELECT COUNT(*) c FROM vacancies WHERE employer_id=?')
    .get(u.id).c;
  return {
    id: u.id,
    telegram_id: u.telegram_id,
    username: u.username,
    first_name: u.first_name,
    last_name: u.last_name,
    photo_url: u.photo_url,
    role: u.role,
    created_at: u.created_at,
    company: u.company,
    rating: u.rating,
    name: u.name,
    age: u.age,
    city: u.city,
    desired_salary: u.desired_salary,
    about: u.about,
    profession: u.profession,
    lang: u.lang || 'ru',
    is_admin: !!u.is_admin,
    stats: { vacancies_total: total, vacancies_closed: closed },
  };
}

function vacancyDTO(v) {
  const emp = db.prepare('SELECT * FROM users WHERE id=?').get(v.employer_id);
  return {
    ...v,
    remote: !!v.remote,
    no_experience: !!v.no_experience,
    employer: emp
      ? {
          id: emp.id,
          telegram_id: emp.telegram_id,
          username: emp.username,
          company: emp.company,
          first_name: emp.first_name,
          rating: emp.rating,
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Auth / current user
app.post('/api/auth', auth, (req, res) => res.json({ user: publicUser(req.user) }));
app.get('/api/me', auth, (req, res) => res.json({ user: publicUser(req.user) }));

// Choose role (registration step)
app.post('/api/role', auth, (req, res) => {
  const role = req.body?.role;
  if (!['employer', 'seeker'].includes(role)) {
    return res.status(400).json({ error: 'bad_role' });
  }
  db.prepare('UPDATE users SET role=? WHERE id=?').run(role, req.user.id);
  res.json({ user: publicUser(findByTg.get(req.user.telegram_id)) });
});

// Update profile
app.put('/api/profile', auth, (req, res) => {
  const b = req.body || {};
  const u = req.user;
  if (u.role === 'employer') {
    db.prepare('UPDATE users SET company=?, city=? WHERE id=?').run(
      b.company ?? u.company,
      b.city ?? u.city,
      u.id
    );
  } else {
    db.prepare(
      'UPDATE users SET name=?, age=?, city=?, desired_salary=?, about=?, profession=? WHERE id=?'
    ).run(
      b.name ?? u.name,
      b.age != null && b.age !== '' ? Number(b.age) : u.age,
      b.city ?? u.city,
      b.desired_salary ?? u.desired_salary,
      b.about ?? u.about,
      b.profession ?? u.profession,
      u.id
    );
  }
  res.json({ user: publicUser(findByTg.get(u.telegram_id)) });
});

// Persist UI language choice
app.post('/api/lang', auth, (req, res) => {
  const lang = req.body?.lang === 'uz' ? 'uz' : 'ru';
  db.prepare('UPDATE users SET lang=? WHERE id=?').run(lang, req.user.id);
  res.json({ ok: true, lang });
});

// List vacancies with filters
app.get('/api/vacancies', auth, (req, res) => {
  const q = req.query;
  const where = ["v.status='open'"];
  const args = [];
  if (q.city) { where.push('LOWER(v.city)=LOWER(?)'); args.push(q.city); }
  if (q.work_format) { where.push('v.work_format=?'); args.push(q.work_format); }
  if (q.category) { where.push('v.category=?'); args.push(q.category); }
  if (q.remote === '1') where.push("(v.work_format='remote' OR v.remote=1)");
  if (q.no_experience === '1') where.push("(v.experience='none' OR v.no_experience=1)");
  if (q.salary_min) { where.push('v.salary_num>=?'); args.push(Number(q.salary_min)); }
  if (q.q) {
    where.push('(LOWER(v.title) LIKE ? OR LOWER(v.description) LIKE ?)');
    const like = `%${String(q.q).toLowerCase()}%`;
    args.push(like, like);
  }
  const rows = db
    .prepare(
      `SELECT v.* FROM vacancies v WHERE ${where.join(' AND ')} ORDER BY v.created_at DESC LIMIT 200`
    )
    .all(...args);
  res.json({ vacancies: rows.map(vacancyDTO) });
});

// Single vacancy
app.get('/api/vacancies/:id', auth, (req, res) => {
  const v = db.prepare('SELECT * FROM vacancies WHERE id=?').get(req.params.id);
  if (!v) return res.status(404).json({ error: 'not_found' });
  res.json({ vacancy: vacancyDTO(v) });
});

// Create vacancy (employer only)
app.post('/api/vacancies', auth, (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({ error: 'not_employer' });
  }
  const b = req.body || {};
  const workFormat = b.work_format || b.work_type || 'onsite';
  if (!b.title || !b.city || !b.salary || !workFormat) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  // Moderation: reject banned words.
  const banned = findBannedWord(b.title, b.description, b.requirements, b.category);
  if (banned) {
    return res.status(400).json({ error: 'banned_word' });
  }

  // Weekly publication limit per employer.
  const weekAgo = now() - 7 * 24 * 3600;
  const recent = db
    .prepare('SELECT COUNT(*) c FROM vacancies WHERE employer_id=? AND created_at>=?')
    .get(req.user.id, weekAgo).c;
  if (recent >= config.vacancyWeeklyLimit) {
    return res
      .status(429)
      .json({ error: 'weekly_limit', limit: config.vacancyWeeklyLimit });
  }

  const salaryNum = parseInt(String(b.salary).replace(/[^\d]/g, ''), 10) || 0;
  const contactType = b.contact_type === 'phone' ? 'phone' : 'telegram';
  const info = db
    .prepare(
      `INSERT INTO vacancies
        (employer_id, title, city, salary, salary_num, work_type, work_format,
         category, description, requirements, schedule, work_hours, experience,
         address, remote, no_experience, contact, contact_type, contact_phone,
         status, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'pending', ?)`
    )
    .run(
      req.user.id,
      b.title,
      b.city,
      b.salary,
      salaryNum,
      workFormat,
      workFormat,
      b.category || null,
      b.description || null,
      b.requirements || null,
      b.schedule || null,
      b.work_hours || null,
      b.experience || null,
      b.address || null,
      workFormat === 'remote' ? 1 : 0,
      b.experience === 'none' ? 1 : 0,
      b.contact || 'Написать в Telegram',
      contactType,
      contactType === 'phone' ? String(b.contact_phone || '').trim() : null,
      now()
    );
  const v = db.prepare('SELECT * FROM vacancies WHERE id=?').get(info.lastInsertRowid);
  res.json({ vacancy: vacancyDTO(v) });
});

// Employer's own vacancies
app.get('/api/my/vacancies', auth, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM vacancies WHERE employer_id=? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json({ vacancies: rows.map(vacancyDTO) });
});

// Close / reopen vacancy
app.post('/api/vacancies/:id/status', auth, (req, res) => {
  const v = db.prepare('SELECT * FROM vacancies WHERE id=?').get(req.params.id);
  if (!v) return res.status(404).json({ error: 'not_found' });
  if (v.employer_id !== req.user.id) return res.status(403).json({ error: 'forbidden' });
  const status = req.body?.status === 'closed' ? 'closed' : 'open';
  db.prepare('UPDATE vacancies SET status=? WHERE id=?').run(status, v.id);
  res.json({ vacancy: vacancyDTO(db.prepare('SELECT * FROM vacancies WHERE id=?').get(v.id)) });
});

// --------------------------- Built-in chat ---------------------------------
function ensureUser(id) {
  return db.prepare('SELECT * FROM users WHERE id=?').get(id);
}

// Send a message
app.post('/api/messages', auth, (req, res) => {
  const b = req.body || {};
  const text = String(b.text || '').trim();
  const toId = Number(b.to_user_id);
  if (!text) return res.status(400).json({ error: 'empty_text' });
  if (!toId || !ensureUser(toId)) return res.status(400).json({ error: 'bad_recipient' });
  const vacancyId = b.vacancy_id ? Number(b.vacancy_id) : null;
  const info = db
    .prepare(
      'INSERT INTO messages (vacancy_id, from_user_id, to_user_id, text, created_at) VALUES (?,?,?,?,?)'
    )
    .run(vacancyId, req.user.id, toId, text, now());
  const msg = db.prepare('SELECT * FROM messages WHERE id=?').get(info.lastInsertRowid);
  res.json({ message: msg });
});

// "Откликнуться" — quick apply, creates an opening message to the employer
app.post('/api/vacancies/:id/apply', auth, (req, res) => {
  const v = db.prepare('SELECT * FROM vacancies WHERE id=?').get(req.params.id);
  if (!v) return res.status(404).json({ error: 'not_found' });
  const text =
    String(req.body?.text || '').trim() ||
    `Здравствуйте! Меня заинтересовала вакансия «${v.title}». Готов обсудить детали.`;
  const info = db
    .prepare(
      'INSERT INTO messages (vacancy_id, from_user_id, to_user_id, text, created_at) VALUES (?,?,?,?,?)'
    )
    .run(v.id, req.user.id, v.employer_id, text, now());
  db.prepare(
    'INSERT OR IGNORE INTO applications (user_id, vacancy_id, created_at) VALUES (?,?,?)'
  ).run(req.user.id, v.id, now());
  const msg = db.prepare('SELECT * FROM messages WHERE id=?').get(info.lastInsertRowid);
  res.json({ message: msg, peer_id: v.employer_id, vacancy_id: v.id });
});

// Seeker home feed: vacancies the user applied to + fresh vacancies
// (filtered by the chosen profession/category, or all if "any").
app.get('/api/feed', auth, (req, res) => {
  const uid = req.user.id;
  const appliedRows = db
    .prepare(
      `SELECT v.* FROM vacancies v
       JOIN applications a ON a.vacancy_id = v.id
       WHERE a.user_id=? ORDER BY a.created_at DESC LIMIT 50`
    )
    .all(uid);
  const appliedIds = new Set(appliedRows.map((v) => v.id));

  const prof = req.user.profession;
  const useCategory = prof && prof !== 'any';
  const freshRows = db
    .prepare(
      `SELECT v.* FROM vacancies v
       WHERE v.status='open' ${useCategory ? 'AND v.category=?' : ''}
       ORDER BY v.created_at DESC LIMIT 100`
    )
    .all(...(useCategory ? [prof] : []));

  res.json({
    applied: appliedRows.map(vacancyDTO),
    fresh: freshRows.filter((v) => !appliedIds.has(v.id)).map(vacancyDTO),
    profession: prof || null,
  });
});

// List conversations for the current user
app.get('/api/chats', auth, (req, res) => {
  const uid = req.user.id;
  const rows = db
    .prepare(
      `SELECT * FROM messages WHERE from_user_id=? OR to_user_id=? ORDER BY created_at DESC`
    )
    .all(uid, uid);
  const map = new Map();
  for (const m of rows) {
    const peerId = m.from_user_id === uid ? m.to_user_id : m.from_user_id;
    const key = `${m.vacancy_id || 0}:${peerId}`;
    if (map.has(key)) continue;
    const peer = ensureUser(peerId);
    const vac = m.vacancy_id
      ? db.prepare('SELECT id, title FROM vacancies WHERE id=?').get(m.vacancy_id)
      : null;
    map.set(key, {
      vacancy_id: m.vacancy_id,
      vacancy_title: vac?.title || null,
      peer: peer
        ? { id: peer.id, name: peer.name || peer.first_name, company: peer.company, username: peer.username, photo_url: peer.photo_url }
        : null,
      last_message: m.text,
      last_at: m.created_at,
    });
  }
  res.json({ chats: [...map.values()] });
});

// Messages of a single conversation
app.get('/api/chats/:vacancyId/:peerId', auth, (req, res) => {
  const uid = req.user.id;
  const peerId = Number(req.params.peerId);
  const vacancyId = Number(req.params.vacancyId) || null;
  const rows = db
    .prepare(
      `SELECT * FROM messages
       WHERE ((from_user_id=? AND to_user_id=?) OR (from_user_id=? AND to_user_id=?))
         AND (vacancy_id IS ? OR vacancy_id = ?)
       ORDER BY created_at ASC`
    )
    .all(uid, peerId, peerId, uid, vacancyId, vacancyId);
  const peer = ensureUser(peerId);
  const vac = vacancyId
    ? db.prepare('SELECT id, title FROM vacancies WHERE id=?').get(vacancyId)
    : null;
  res.json({
    messages: rows,
    me: uid,
    peer: peer ? { id: peer.id, name: peer.name || peer.first_name, company: peer.company, username: peer.username } : null,
    vacancy: vac || null,
  });
});

// ------------------------------- Admin -------------------------------------
// Simple brute-force guard: max 5 attempts per user per 10 minutes.
const adminAttempts = new Map();
function tooManyAttempts(uid) {
  const now = Date.now();
  const rec = adminAttempts.get(uid) || { n: 0, ts: now };
  if (now - rec.ts > 10 * 60 * 1000) { rec.n = 0; rec.ts = now; }
  rec.n += 1;
  adminAttempts.set(uid, rec);
  return rec.n > 5;
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// Log in to the admin panel with the password.
app.post('/api/admin/login', auth, (req, res) => {
  if (!config.adminPassword) return res.status(503).json({ error: 'admin_disabled' });
  if (tooManyAttempts(req.user.id)) return res.status(429).json({ error: 'too_many_attempts' });
  const password = String(req.body?.password || '');
  if (!safeEqual(password, config.adminPassword)) {
    return res.status(401).json({ error: 'wrong_password' });
  }
  db.prepare('UPDATE users SET is_admin=1 WHERE id=?').run(req.user.id);
  adminAttempts.delete(req.user.id);
  res.json({ user: publicUser(findByTg.get(req.user.telegram_id)) });
});

function requireAdmin(req, res, next) {
  if (!req.user.is_admin) return res.status(403).json({ error: 'not_admin' });
  next();
}

// All vacancies (moderation view) with author contacts — pending first.
app.get('/api/admin/vacancies', auth, requireAdmin, (req, res) => {
  const rows = db
    .prepare(
      `SELECT * FROM vacancies
       ORDER BY (status='pending') DESC, created_at DESC LIMIT 500`
    )
    .all();
  res.json({ vacancies: rows.map(vacancyDTO) });
});

// Approve (publish) or reject a vacancy.
app.post('/api/admin/vacancies/:id/moderate', auth, requireAdmin, (req, res) => {
  const v = db.prepare('SELECT * FROM vacancies WHERE id=?').get(req.params.id);
  if (!v) return res.status(404).json({ error: 'not_found' });
  const action = req.body?.action;
  const status = action === 'approve' ? 'open' : action === 'reject' ? 'rejected' : null;
  if (!status) return res.status(400).json({ error: 'bad_action' });
  db.prepare('UPDATE vacancies SET status=? WHERE id=?').run(status, v.id);
  res.json({ vacancy: vacancyDTO(db.prepare('SELECT * FROM vacancies WHERE id=?').get(v.id)) });
});

// Admin edits any vacancy field.
app.put('/api/admin/vacancies/:id', auth, requireAdmin, (req, res) => {
  const v = db.prepare('SELECT * FROM vacancies WHERE id=?').get(req.params.id);
  if (!v) return res.status(404).json({ error: 'not_found' });
  const b = req.body || {};
  const salaryNum = b.salary != null
    ? parseInt(String(b.salary).replace(/[^\d]/g, ''), 10) || 0
    : v.salary_num;
  db.prepare(
    `UPDATE vacancies SET title=?, city=?, salary=?, salary_num=?, category=?,
       work_format=?, schedule=?, work_hours=?, experience=?, description=?,
       requirements=?, address=?, contact_type=?, contact_phone=? WHERE id=?`
  ).run(
    b.title ?? v.title,
    b.city ?? v.city,
    b.salary ?? v.salary,
    salaryNum,
    b.category ?? v.category,
    b.work_format ?? v.work_format,
    b.schedule ?? v.schedule,
    b.work_hours ?? v.work_hours,
    b.experience ?? v.experience,
    b.description ?? v.description,
    b.requirements ?? v.requirements,
    b.address ?? v.address,
    b.contact_type ?? v.contact_type,
    b.contact_phone ?? v.contact_phone,
    v.id
  );
  res.json({ vacancy: vacancyDTO(db.prepare('SELECT * FROM vacancies WHERE id=?').get(v.id)) });
});

// Admin can remove a vacancy.
app.delete('/api/admin/vacancies/:id', auth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM vacancies WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Serve built frontend (production) if present
// ---------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDist = path.resolve(__dirname, '../../web/dist');
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get('*', (req, res, nextFn) => {
    if (req.path.startsWith('/api/')) return nextFn();
    res.sendFile(path.join(webDist, 'index.html'));
  });
}

app.listen(config.port, () => {
  console.log(`[server] listening on http://localhost:${config.port}`);
  if (config.runBot) {
    import('./bot.js')
      .then((m) => m.startBot())
      .catch((e) => console.error('[bot] failed to start:', e.message));
  }
});
