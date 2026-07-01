import 'dotenv/config';

export const config = {
  botToken: process.env.BOT_TOKEN || '',
  port: Number(process.env.PORT || 3001),
  allowDevAuth: process.env.ALLOW_DEV_AUTH !== '0',
  initDataMaxAge: Number(process.env.INITDATA_MAX_AGE ?? 86400),
  dbPath: process.env.DB_PATH || './data/app.db',
  isProd: process.env.NODE_ENV === 'production',
  // Public HTTPS URL of the deployed Mini App. Used to auto-configure the bot
  // menu button and the /start button. Render/Railway expose this automatically.
  publicUrl:
    process.env.PUBLIC_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : ''),
  // Run the built-in bot (menu button + /start handler) alongside the server.
  runBot: process.env.RUN_BOT !== '0',
  // Admin panel password (set via env; provided by the owner).
  adminPassword: process.env.ADMIN_PASSWORD || '',
  // Telegram username opened by the "Поддержка" button (without @).
  supportUsername: (process.env.SUPPORT_USERNAME || 'developer_kd').replace('@', ''),
  // Max vacancies a single employer may publish per rolling 7 days.
  vacancyWeeklyLimit: Number(process.env.VACANCY_WEEKLY_LIMIT || 5),
};

if (!config.botToken) {
  console.warn(
    '[config] BOT_TOKEN is not set. Telegram initData validation will fail. ' +
      'Set BOT_TOKEN in server/.env for production use.'
  );
}
