// Minimal Telegram bot using the Bot API directly (Node's built-in fetch,
// no extra dependencies). It self-configures the Mini App so that after
// deployment no manual BotFather setup is required:
//   1. Sets the chat menu button to open the Mini App.
//   2. Replies to /start with a button that launches the Mini App.
import { config } from './config.js';

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
  '👋 Добро пожаловать в «Работа рядом»!\n\n' +
  'Здесь можно найти работу по категориям или разместить вакансию. ' +
  'Нажмите кнопку ниже, чтобы открыть приложение.';

async function configureMenuButton(url) {
  await call('setChatMenuButton', {
    menu_button: { type: 'web_app', text: 'Открыть', web_app: { url } },
  });
  console.log('[bot] menu button configured →', url);
}

function startKeyboard(url) {
  return {
    inline_keyboard: [[{ text: '🚀 Открыть приложение', web_app: { url } }]],
  };
}

async function poll(url) {
  let offset = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const updates = await call('getUpdates', { offset, timeout: 30 });
      for (const u of updates) {
        offset = u.update_id + 1;
        const msg = u.message;
        if (msg?.text && msg.text.startsWith('/start')) {
          await call('sendMessage', {
            chat_id: msg.chat.id,
            text: WELCOME,
            reply_markup: startKeyboard(url),
          }).catch((e) => console.error('[bot] sendMessage', e.message));
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
    console.warn(
      '[bot] PUBLIC_URL not set — menu button and /start button cannot be ' +
        'configured automatically. Set PUBLIC_URL to your HTTPS app URL.'
    );
  }
}
