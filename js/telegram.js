/* ============================================================
   MVP Gaming — Telegram phone verification (frontend)
   Flow:
     1) requestCode(phone)  -> backend creates a pending session,
        returns a t.me deep link (https://t.me/<bot>?start=<token>)
     2) user opens the bot, presses START -> bot DMs a 4-digit code
     3) verifyCode(token, code) -> backend confirms the match
   If no backend is configured/reachable, a DEMO mode runs entirely
   client-side (code shown on screen) so the UX is fully testable.
   NOTE: the bot TOKEN lives ONLY in the backend (.env), never here.
   ============================================================ */
(function () {
  const MVP = (window.MVP = window.MVP || {});
  const cfg = Object.assign(
    {
      apiBase: '',        // e.g. 'http://localhost:8787'. Empty + useBackend:false => demo mode
      useBackend: false,  // set true when serving the app from the bot backend (same origin)
      botUsername: 'MVPGamingBot', // set to your bot's @username
    },
    window.MVP_CONFIG || {}
  );
  const backendOn = () => !!(cfg.apiBase || cfg.useBackend);

  let demo = null; // { token, code, phone }

  function rand4() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  function botLink(token) {
    return 'https://t.me/' + cfg.botUsername + '?start=' + encodeURIComponent(token);
  }

  async function api(path, body) {
    const res = await fetch(cfg.apiBase + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  const tg = {
    cfg,
    botLink,
    /** Begin verification. Returns {ok, token, botLink, demo, demoCode?} */
    async requestCode(phone) {
      const token = 'sess_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      if (backendOn()) {
        try {
          const r = await api('/api/auth/request-code', { phone, token });
          return { ok: true, token: r.token || token, botLink: r.botLink || botLink(r.token || token), demo: false };
        } catch (e) {
          // fall through to demo if backend unreachable
        }
      }
      demo = { token, code: rand4(), phone };
      return { ok: true, token, botLink: botLink(token), demo: true, demoCode: demo.code };
    },
    /** Verify the entered code. Returns {ok} */
    async verifyCode(token, code) {
      if (backendOn()) {
        try {
          const r = await api('/api/auth/verify-code', { token, code });
          return { ok: !!r.ok };
        } catch (e) {
          return { ok: false, error: 'network' };
        }
      }
      return { ok: !!(demo && demo.token === token && demo.code === String(code).trim()) };
    },
  };

  MVP.tg = tg;
})();
