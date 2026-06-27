import crypto from 'node:crypto';
import { config } from './config.js';

/**
 * Validate Telegram Mini App initData and return the parsed `user` object.
 * Algorithm: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Returns { ok: true, user, authDate } or { ok: false, reason }.
 */
export function validateInitData(initDataRaw) {
  if (!initDataRaw || typeof initDataRaw !== 'string') {
    return { ok: false, reason: 'empty' };
  }
  if (!config.botToken) {
    return { ok: false, reason: 'no_bot_token' };
  }

  const params = new URLSearchParams(initDataRaw);
  const hash = params.get('hash');
  if (!hash) return { ok: false, reason: 'no_hash' };

  // Build the data-check-string: all fields except `hash`, sorted, joined by \n.
  const pairs = [];
  for (const [key, value] of params.entries()) {
    if (key === 'hash') continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(config.botToken)
    .digest();
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  const valid =
    computedHash.length === hash.length &&
    crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
  if (!valid) return { ok: false, reason: 'bad_hash' };

  const authDate = Number(params.get('auth_date') || 0);
  if (config.initDataMaxAge > 0) {
    const ageSec = Math.floor(Date.now() / 1000) - authDate;
    if (ageSec > config.initDataMaxAge) return { ok: false, reason: 'expired' };
  }

  let user = null;
  try {
    user = JSON.parse(params.get('user') || 'null');
  } catch {
    return { ok: false, reason: 'bad_user_json' };
  }
  if (!user || !user.id) return { ok: false, reason: 'no_user' };

  return { ok: true, user, authDate };
}
