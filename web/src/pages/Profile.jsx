import { useApp } from '../store.jsx';
import { formatDate } from '../constants.js';
import Header from '../components/Header.jsx';

export default function Profile() {
  const { user, navigate } = useApp();
  const isEmployer = user.role === 'employer';
  const initials = (user.name || user.first_name || '?').slice(0, 1).toUpperCase();

  return (
    <div className="page">
      <Header title="Профиль" />

      <div className="profile-head card">
        {user.photo_url ? (
          <img className="avatar" src={user.photo_url} alt="" />
        ) : (
          <div className="avatar avatar-fallback">{initials}</div>
        )}
        <div>
          <h2>{isEmployer ? user.company || user.first_name : user.name || user.first_name}</h2>
          <p className="muted">
            {isEmployer ? 'Работодатель' : 'Соискатель'}
            {user.username ? ` · @${user.username}` : ''}
          </p>
        </div>
      </div>

      {isEmployer ? (
        <>
          <div className="stats-grid">
            <Stat value={user.stats.vacancies_total} label="Вакансий" />
            <Stat value={user.stats.vacancies_closed} label="Закрыто" />
            <Stat value={(user.rating ?? 5).toFixed(1)} label="Рейтинг ⭐" />
          </div>
          <div className="card info-list">
            <InfoRow label="Компания" value={user.company || '—'} />
            <InfoRow label="Город" value={user.city || '—'} />
            <InfoRow label="Дата регистрации" value={formatDate(user.created_at)} />
          </div>
        </>
      ) : (
        <div className="card info-list">
          <InfoRow label="Имя" value={user.name || '—'} />
          <InfoRow label="Возраст" value={user.age ? `${user.age}` : '—'} />
          <InfoRow label="Город" value={user.city || '—'} />
          <InfoRow label="Желаемая зарплата" value={user.desired_salary || '—'} />
          <InfoRow label="О себе" value={user.about || '—'} />
          <InfoRow label="Дата регистрации" value={formatDate(user.created_at)} />
        </div>
      )}

      <button className="btn btn-block btn-secondary" onClick={() => navigate('editProfile')}>
        Редактировать
      </button>
      <button className="btn btn-block btn-ghost" onClick={() => navigate('chats')}>
        Встроенный чат
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
