// Thin wrapper around the official Telegram Mini App SDK (telegram-web-app.js).
const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

export const webApp = tg;
export const isTelegram = !!(tg && tg.initData);

export function initTelegram() {
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.('secondary_bg_color');
    tg.disableVerticalSwipes?.();
  } catch {
    /* older clients */
  }
  applyTheme();
  tg.onEvent?.('themeChanged', applyTheme);
}

export function getInitDataRaw() {
  return tg?.initData || '';
}

export function getTgUser() {
  return tg?.initDataUnsafe?.user || null;
}

export function haptic(type = 'light') {
  try {
    tg?.HapticFeedback?.impactOccurred?.(type);
  } catch {
    /* noop */
  }
}

export function openTelegramChat(username) {
  if (!username) return;
  const url = `https://t.me/${username.replace('@', '')}`;
  if (tg?.openTelegramLink) tg.openTelegramLink(url);
  else window.open(url, '_blank');
}

// Map Telegram theme params onto CSS variables so the app matches the client.
function applyTheme() {
  const p = tg?.themeParams;
  if (!p) return;
  const root = document.documentElement;
  const set = (name, val) => val && root.style.setProperty(name, val);
  set('--tg-bg', p.bg_color);
  set('--tg-secondary-bg', p.secondary_bg_color);
  set('--tg-text', p.text_color);
  set('--tg-hint', p.hint_color);
  set('--tg-link', p.link_color);
  set('--tg-button', p.button_color);
  set('--tg-button-text', p.button_text_color);
  root.dataset.theme = tg?.colorScheme || 'light';
}
