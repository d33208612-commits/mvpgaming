import { useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../store.jsx';
import { useLang } from '../i18n.jsx';
import { haptic } from '../telegram.js';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';

export default function RoleSelect() {
  const { user, setUser } = useApp();
  const { t } = useLang();
  const [busy, setBusy] = useState(false);

  async function choose(role) {
    if (busy) return;
    setBusy(true);
    haptic('medium');
    try {
      const { user } = await api.setRole(role);
      setUser(user);
    } catch (e) {
      alert(t('errGeneric', { msg: e.message }));
      setBusy(false);
    }
  }

  return (
    <div className="role-screen">
      <div style={{ position: 'absolute', top: 12, left: 24 }}>
        <LanguageSwitcher />
      </div>

      <div className="role-hero">
        <h1>{t('appName')}</h1>
        <p>{t('roleGreeting', { name: user.first_name || '👋' })}</p>
      </div>

      <div className="role-cards">
        <button className="role-card" disabled={busy} onClick={() => choose('seeker')}>
          <span className="role-title">{t('roleSeeker')}</span>
          <span className="role-desc">{t('roleSeekerDesc')}</span>
        </button>

        <button className="role-card" disabled={busy} onClick={() => choose('employer')}>
          <span className="role-title">{t('roleEmployer')}</span>
          <span className="role-desc">{t('roleEmployerDesc')}</span>
        </button>
      </div>

      <p className="role-note">{t('roleNote')}</p>
    </div>
  );
}
