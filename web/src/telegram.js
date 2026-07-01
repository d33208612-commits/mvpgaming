// Thin wrapper around the official Telegram Mini App SDK (telegram-web-app.js).
const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

export const webApp = tg;
export const isTelegram = !!(tg && tg.initData);

export function initTelegram() {
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    // Fixed dark-navy brand theme (matches the app design).
    tg.setBackgroundColor?.('#060a14');
    tg.setHeaderColor?.('#060a14');
    tg.disableVerticalSwipes?.();
  } catch {
    /* older clients */
  }
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

export function openPhone(phone) {
  const num = String(phone || '').replace(/[^\d+]/g, '');
  if (num) window.location.href = `tel:${num}`;
}
