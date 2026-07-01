// Minimal Telegram bot using the Bot API directly (Node's built-in fetch,
// no extra dependencies). Self-configures the Mini App menu button and handles
// /start with three buttons: open app, support, admin panel (password-gated).
import { config } from './config.js';
import { db } from './db.js';

const API = (method) => `https://api.telegram.org/bot${config.botToken}/${method}`;

async function call(method, body) {
  const res = await fetch(API(method), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.ok) throw new Error(`${method}: ${data.description || res.status}`);
  return data.result;
}

const WELCOME =
  '👋 Добро пожаловать в «Работа рядом» / «Ish yaqin»!\n\n' +
  'Здесь можно найти работу по категориям или разместить вакансию.\n' +
  'Bu yerda ish topishingiz yoki vakansiya joylashingiz mumkin.\n\n' +
  'Нажмите кнопку ниже, чтобы открыть приложение.';

function startKeyboard(url) {
  return {
    inline_keyboard: [
      [{ text: '🚀 Открыть приложение', web_app: { url } }],
      [{ text: '💬 Поддержка', url: `https://t.me/${config.supportUsername}` }],
      [{ text: '🛠 Админ-панель', callback_data: 'admin' }],
    ],
  };
}

async function configureMenuButton(url) {
  await call('setChatMenuButton', {
    menu_button: { type: 'web_app', text: 'Открыть', web_app: { url } },
  });
  console.log('[bot] menu button configured →', url);
}

// Chats currently entering the admin password.
const awaitingPassword = new Set();
const attempts = new Map();

async function handleMessage(msg, url) {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  if (awaitingPassword.has(chatId)) {
    awaitingPassword.delete(chatId);
    const rec = attempts.get(chatId) || 0;
    if (rec >= 5) {
      await call('sendMessage', { chat_id: chatId, text: '⛔ Слишком много попыток. Попробуйте позже.' });
      return;
    }
    if (config.adminPassword && text === config.adminPassword) {
      attempts.delete(chatId);
      db.prepare('UPDATE users SET is_admin=1 WHERE telegram_id=?').run(msg.from.id);
      await call('sendMessage', {
        chat_id: chatId,
        text: '✅ Доступ администратора открыт. Откройте панель:',
        reply_markup: { inline_keyboard: [[{ text: '🛠 Открыть админ-панель', web_app: { url } }]] },
      });
    } else {
      attempts.set(chatId, rec + 1);
      await call('sendMessage', { chat_id: chatId, text: '❌ Неверный пароль.' });
    }
    return;
  }

  if (text.startsWith('/start')) {
    await call('sendMessage', {
      chat_id: chatId,
      text: WELCOME,
      reply_markup: startKeyboard(url),
    });
  }
}

async function handleCallback(cq) {
  const chatId = cq.message?.chat?.id;
  await call('answerCallbackQuery', { callback_query_id: cq.id }).catch(() => {});
  if (cq.data === 'admin' && chatId) {
    if (!config.adminPassword) {
      await call('sendMessage', { chat_id: chatId, text: 'Админ-панель не настроена.' });
      return;
    }
    awaitingPassword.add(chatId);
    await call('sendMessage', { chat_id: chatId, text: '🔐 Введите пароль для входа.' });
  }
}

async function poll(url) {
  let offset = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const updates = await call('getUpdates', {
        offset,
        timeout: 30,
        allowed_updates: ['message', 'callback_query'],
      });
      for (const u of updates) {
        offset = u.update_id + 1;
        try {
          if (u.message) await handleMessage(u.message, url);
          else if (u.callback_query) await handleCallback(u.callback_query);
        } catch (e) {
          console.error('[bot] update error:', e.message);
        }
      }
    } catch (e) {
      console.error('[bot] poll error:', e.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

export async function startBot() {
  if (!config.botToken) {
    console.warn('[bot] BOT_TOKEN not set — bot disabled.');
    return;
  }
  try {
    const me = await call('getMe');
    console.log(`[bot] running as @${me.username}`);
  } catch (e) {
    console.error('[bot] cannot reach Telegram API:', e.message);
    return;
  }

  if (config.publicUrl) {
    await configureMenuButton(config.publicUrl).catch((e) =>
      console.error('[bot] menu button failed:', e.message)
    );
    poll(config.publicUrl);
  } else {
    console.warn('[bot] PUBLIC_URL not set — bot buttons cannot be configured.');
  }
}
