import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../store.jsx';
import { haptic, openTelegramChat } from '../telegram.js';
import { workTypeLabel, timeAgo } from '../constants.js';
import Header from '../components/Header.jsx';
import Loader from '../components/Loader.jsx';

export default function VacancyDetail({ id }) {
  const { user, navigate } = useApp();
  const [v, setV] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.getVacancy(id).then((r) => setV(r.vacancy)).catch(() => setV(false));
  useEffect(() => { load(); }, [id]);

  if (v === null) return <Loader full />;
  if (v === false) return <div className="page"><Header title="Вакансия" back="home" /><p className="empty">Вакансия не найдена.</p></div>;

  const isOwner = v.employer?.id === user.id;
  const back = user.role === 'employer' ? 'home' : 'search';

  async function apply() {
    setBusy(true);
    haptic('medium');
    try {
      const r = await api.apply(v.id);
      navigate('chat', { vacancyId: r.vacancy_id, peerId: r.peer_id });
    } catch (e) {
      alert('Не удалось откликнуться: ' + e.message);
      setBusy(false);
    }
  }

  function message() {
    navigate('chat', { vacancyId: v.id, peerId: v.employer.id });
  }

  async function toggleStatus() {
    const next = v.status === 'open' ? 'closed' : 'open';
    const r = await api.setVacancyStatus(v.id, next);
    setV(r.vacancy);
  }

  return (
    <div className="page detail">
      <Header title="Вакансия" back={back} />

      <div className="detail-head">
        <h1>{v.title}</h1>
        <div className="salary big">{v.salary}</div>
        <div className="vac-tags">
          <span className="tag">📍 {v.city}</span>
          <span className="tag">{workTypeLabel(v.work_type)}</span>
          {v.category ? <span className="tag">{v.category}</span> : null}
          {v.remote ? <span className="tag">🌐 Удалённо</span> : null}
          {v.no_experience ? <span className="tag">Без опыта</span> : null}
        </div>
        <p className="muted small">Опубликовано {timeAgo(v.created_at)}</p>
        {v.status === 'closed' && <p className="closed-badge">Вакансия закрыта</p>}
      </div>

      <Section title="Компания" body={v.employer?.company || v.employer?.first_name || 'Работодатель'} />
      {v.description && <Section title="Описание" body={v.description} />}
      {v.requirements && <Section title="Требования" body={v.requirements} />}
      {v.schedule && <Section title="График" body={v.schedule} />}
      {v.address && <Section title="Адрес" body={v.address} />}

      <div className="detail-actions">
        {isOwner ? (
          <button className="btn btn-block btn-secondary" onClick={toggleStatus}>
            {v.status === 'open' ? 'Закрыть вакансию' : 'Открыть снова'}
          </button>
        ) : (
          <>
            <button className="btn btn-block" disabled={busy} onClick={apply}>
              Откликнуться
            </button>
            <button className="btn btn-block btn-secondary" onClick={message}>
              Написать работодателю
            </button>
            {v.employer?.username && (
              <button className="link-btn" onClick={() => openTelegramChat(v.employer.username)}>
                Открыть в Telegram @{v.employer.username}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, body }) {
  return (
    <div className="detail-section">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
