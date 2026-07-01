import { useApp } from '../store.jsx';
import { useLang } from '../i18n.jsx';
import { formatDate, labelOf } from '../constants.js';
import Header from '../components/Header.jsx';

export default function Profile() {
  const { user, navigate } = useApp();
  const { t, lang } = useLang();
  const isEmployer = user.role === 'employer';
  const initials = (user.name || user.first_name || '?').slice(0, 1).toUpperCase();

  return (
    <div className="page">
      <Header title={t('profile')} />

      <div className="profile-head card">
        {user.photo_url ? (
          <img className="avatar" src={user.photo_url} alt="" />
        ) : (
          <div className="avatar avatar-fallback">{initials}</div>
        )}
        <div>
          <h2>{isEmployer ? user.company || user.first_name : user.name || user.first_name}</h2>
          <p className="muted">
            {isEmployer ? t('employer') : t('seeker')}
            {user.username ? ` · @${user.username}` : ''}
          </p>
        </div>
      </div>

      {isEmployer ? (
        <>
          <div className="stats-grid">
            <Stat value={user.stats.vacancies_total} label={t('statVacancies')} />
            <Stat value={user.stats.vacancies_closed} label={t('statClosed')} />
            <Stat value={(user.rating ?? 5).toFixed(1)} label={`${t('statRating')} ⭐`} />
          </div>
          <div className="card info-list">
            <InfoRow label={t('company')} value={user.company || '—'} />
            <InfoRow label={t('city')} value={labelOf(user.city, lang) || '—'} />
            <InfoRow label={t('registeredAt')} value={formatDate(user.created_at, lang)} />
          </div>
        </>
      ) : (
        <div className="card info-list">
          <InfoRow label={t('name')} value={user.name || '—'} />
          <InfoRow label={t('age')} value={user.age ? `${user.age}` : '—'} />
          <InfoRow label={t('city')} value={labelOf(user.city, lang) || '—'} />
          <InfoRow label={t('profession')} value={user.profession ? labelOf(user.profession, lang) : '—'} />
          <InfoRow label={t('desiredSalary')} value={user.desired_salary || '—'} />
          <InfoRow label={t('about')} value={user.about || '—'} />
          <InfoRow label={t('registeredAt')} value={formatDate(user.created_at, lang)} />
        </div>
      )}

      <button className="btn btn-block btn-secondary" onClick={() => navigate('editProfile')}>
        {t('edit')}
      </button>
      <button className="btn btn-block btn-ghost" onClick={() => navigate('chats')}>
        {t('builtinChat')}
      </button>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="stat card">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
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
