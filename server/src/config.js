import 'dotenv/config';

export const config = {
  botToken: process.env.BOT_TOKEN || '',
  port: Number(process.env.PORT || 3001),
  allowDevAuth: process.env.ALLOW_DEV_AUTH !== '0',
  initDataMaxAge: Number(process.env.INITDATA_MAX_AGE ?? 86400),
  dbPath: process.env.DB_PATH || './data/app.db',
  isProd: process.env.NODE_ENV === 'production',
};

if (!config.botToken) {
  console.warn(
    '[config] BOT_TOKEN is not set. Telegram initData validation will fail. ' +
      'Set BOT_TOKEN in server/.env for production use.'
  );
}
