/* ============================================================
   MVP Gaming — Telegram verification backend (zero dependencies)

   Responsibilities
     • REST API consumed by the frontend (js/telegram.js):
         POST /api/auth/request-code  { phone, token }  -> { token, botLink }
         POST /api/auth/verify-code   { token, code }   -> { ok }
         POST /api/club-request       { ... }           -> { ok }   (optional)
         GET  /health
     • Telegram bot (long polling): when a user opens the deep link
       https://t.me/<bot>?start=<token> and presses START, the bot DMs
       the 4-digit code tied to that session.
     • Optional static hosting of the app (so API + app share one origin).

   The bot TOKEN is read from the environment (BOT_TOKEN) — never hard-coded.
   ============================================================ */
'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

/* ---------- tiny .env loader (no dependency) ---------- */
(function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
})();

const BOT_TOKEN = process.env.BOT_TOKEN || '';
let BOT_USERNAME = process.env.BOT_USERNAME || '';
const PORT = parseInt(process.env.PORT, 10) || 8787;
const CODE_TTL = (parseInt(process.env.CODE_TTL_MIN, 10) || 10) * 60 * 1000;
const SERVE_STATIC = process.env.SERVE_STATIC !== 'false';
const APP_DIR = path.join(__dirname, '..');

if (!BOT_TOKEN) {
  console.warn('[warn] BOT_TOKEN is not set. Auth endpoints will return 503 and the');
  console.warn('       frontend will fall back to DEMO mode. Set it in server/.env');
}

/* ---------- pending verification sessions ---------- */
/* token -> { phone, code, chatId, verified, createdAt } */
const sessions = new Map();
function rand4() { return String(Math.floor(1000 + Math.random() * 9000)); }
function cleanup() {
  const now = Date.now();
  for (const [k, v] of sessions) if (now - v.createdAt > CODE_TTL) sessions.delete(k);
}
setInterval(cleanup, 60 * 1000).unref();

/* ---------- Telegram Bot API helper ---------- */
function tg(method, params) {
  return new Promise((resolve, reject) => {
    if (!BOT_TOKEN) return reject(new Error('no BOT_TOKEN'));
    const data = Buffer.from(JSON.stringify(params || {}));
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: '/bot' + BOT_TOKEN + '/' + method,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
        timeout: 60000,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (!json.ok) return reject(new Error(json.description || 'tg error'));
            resolve(json.result);
          } catch (e) { reject(e); }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.write(data);
    req.end();
  });
}

function codeMessage(code) {
  return (
    '🎮 *MVP Gaming*\n\n' +
    'Ваш код подтверждения: *' + code + '*\n' +
    'Введите его в приложении, чтобы завершить регистрацию.\n\n' +
    'Код действует ' + Math.round(CODE_TTL / 60000) + ' минут. Никому его не сообщайте.'
  );
}

/* ---------- Telegram long polling ---------- */
async function startBot() {
  if (!BOT_TOKEN) return;
  try {
    const me = await tg('getMe', {});
    if (me && me.username) BOT_USERNAME = me.username;
    console.log('[bot] connected as @' + BOT_USERNAME);
  } catch (e) {
    console.error('[bot] getMe failed:', e.message, '— check BOT_TOKEN / network');
    return;
  }
  let offset = 0;
  // long-poll loop
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let updates = [];
    try {
      updates = await tg('getUpdates', { offset, timeout: 30, allowed_updates: ['message'] });
    } catch (e) {
      await sleep(2000);
      continue;
    }
    for (const u of updates) {
      offset = u.update_id + 1;
      const msg = u.message;
      if (!msg || !msg.text) continue;
      const chatId = msg.chat.id;
      const m = msg.text.match(/^\/start(?:\s+(.+))?/);
      if (m) {
        const token = (m[1] || '').trim();
        const s = token && sessions.get(token);
        if (s) {
          s.chatId = chatId;
          try { await tg('sendMessage', { chat_id: chatId, text: codeMessage(s.code), parse_mode: 'Markdown' }); }
          catch (e) { console.error('[bot] sendMessage failed:', e.message); }
        } else {
          await tg('sendMessage', { chat_id: chatId, text: '👋 Добро пожаловать в MVP Gaming!\nОткройте приложение и нажмите «Получить код», чтобы продолжить регистрацию.' }).catch(() => {});
        }
      }
    }
  }
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

/* ---------- HTTP helpers ---------- */
function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { resolve({}); } });
  });
}
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  const filePath = path.normalize(path.join(APP_DIR, rel));
  if (!filePath.startsWith(APP_DIR)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(filePath, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(buf);
  });
}

/* ---------- routes ---------- */
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const p = u.pathname;
  if (req.method === 'OPTIONS') return send(res, 204, {});

  if (p === '/health') return send(res, 200, { ok: true, bot: BOT_USERNAME || null, sessions: sessions.size });

  if (p === '/api/auth/request-code' && req.method === 'POST') {
    if (!BOT_TOKEN) return send(res, 503, { ok: false, error: 'bot_not_configured' });
    const b = await readBody(req);
    const phone = String(b.phone || '').trim();
    const token = String(b.token || '').trim() || ('sess_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
    if (phone.replace(/\D/g, '').length < 9) return send(res, 400, { ok: false, error: 'invalid_phone' });
    sessions.set(token, { phone, code: rand4(), chatId: null, verified: false, createdAt: Date.now() });
    return send(res, 200, { ok: true, token, botLink: 'https://t.me/' + (BOT_USERNAME || 'YourBot') + '?start=' + encodeURIComponent(token) });
  }

  if (p === '/api/auth/verify-code' && req.method === 'POST') {
    const b = await readBody(req);
    const s = sessions.get(String(b.token || ''));
    if (!s) return send(res, 200, { ok: false, error: 'expired' });
    if (Date.now() - s.createdAt > CODE_TTL) { sessions.delete(b.token); return send(res, 200, { ok: false, error: 'expired' }); }
    if (String(b.code || '').trim() === s.code) {
      s.verified = true;
      const out = { ok: true, phone: s.phone };
      sessions.delete(b.token); // single-use
      return send(res, 200, out);
    }
    return send(res, 200, { ok: false, error: 'wrong_code' });
  }

  if (p === '/api/club-request' && req.method === 'POST') {
    const b = await readBody(req);
    console.log('[club-request]', JSON.stringify(b));
    // Optionally notify an admin chat if ADMIN_CHAT_ID is set.
    if (BOT_TOKEN && process.env.ADMIN_CHAT_ID) {
      tg('sendMessage', { chat_id: process.env.ADMIN_CHAT_ID, text: '🆕 Заявка на регистрацию клуба:\n' + JSON.stringify(b, null, 2) }).catch(() => {});
    }
    return send(res, 200, { ok: true });
  }

  if (p.startsWith('/api/')) return send(res, 404, { ok: false, error: 'not_found' });

  if (SERVE_STATIC) return serveStatic(req, res, p);
  return send(res, 404, { ok: false, error: 'not_found' });
});

server.listen(PORT, () => {
  console.log('[http] MVP Gaming backend on http://localhost:' + PORT);
  if (SERVE_STATIC) console.log('[http] serving app from ' + APP_DIR);
  startBot();
});
