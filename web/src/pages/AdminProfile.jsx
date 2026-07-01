import { useApp } from '../store.jsx';
import { useLang } from '../i18n.jsx';
import { formatDate } from '../constants.js';
import Header from '../components/Header.jsx';

export default function AdminProfile() {
  const { user, navigate } = useApp();
  const { t, lang } = useLang();
  const initials = (user.first_name || 'A').slice(0, 1).toUpperCase();

  return (
    <div className="page">
      <Header title={t('admin')} />

      <div className="profile-head card">
        {user.photo_url ? (
          <img className="avatar" src={user.photo_url} alt="" />
        ) : (
          <div className="avatar avatar-fallback">{initials}</div>
        )}
        <div>
          <h2>{user.first_name || t('admin')}</h2>
          <p className="muted">
            🛠 {t('admin')}
            {user.username ? ` · @${user.username}` : ''}
          </p>
        </div>
      </div>

      <div className="card info-list">
        <InfoRow label={t('name')} value={user.first_name || '—'} />
        {user.username && <InfoRow label="Telegram" value={`@${user.username}`} />}
        <InfoRow label={t('registeredAt')} value={formatDate(user.created_at, lang)} />
      </div>

      <button className="btn btn-block btn-secondary" onClick={() => navigate('requests')}>
        {t('requests')}
      </button>
      <button className="btn btn-block btn-ghost" onClick={() => navigate('chats')}>
        {t('builtinChat')}
      </button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}
