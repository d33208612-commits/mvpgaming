import { useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../store.jsx';
import { haptic } from '../telegram.js';

export default function RoleSelect() {
  const { user, setUser } = useApp();
  const [busy, setBusy] = useState(false);

  async function choose(role) {
    if (busy) return;
    setBusy(true);
    haptic('medium');
    try {
      const { user } = await api.setRole(role);
      setUser(user);
    } catch (e) {
      alert('Не удалось сохранить роль: ' + e.message);
      setBusy(false);
    }
  }

  return (
    <div className="role-screen">
      <div className="role-hero">
        <div className="role-logo">💼</div>
        <h1>Работа рядом</h1>
        <p>Привет, {user.first_name || 'друг'}! Кем вы хотите быть?</p>
      </div>

      <div className="role-cards">
        <button className="role-card" disabled={busy} onClick={() => choose('seeker')}>
          <span className="role-emoji">🔎</span>
          <span className="role-title">Ищу работу</span>
          <span className="role-desc">Просматривайте вакансии и откликайтесь</span>
        </button>

        <button className="role-card" disabled={busy} onClick={() => choose('employer')}>
          <span className="role-emoji">🏢</span>
          <span className="role-title">Я работодатель</span>
          <span className="role-desc">Размещайте вакансии и находите сотрудников</span>
        </button>
      </div>

      <p className="role-note">Роль можно учитывать в профиле. Регистрация происходит автоматически через Telegram.</p>
    </div>
  );
}
