import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../store.jsx';
import { useLang } from '../i18n.jsx';
import { haptic, openTelegramChat, openPhone } from '../telegram.js';
import { labelOf, timeAgo, formatSalary } from '../constants.js';
import Header from '../components/Header.jsx';
import Loader from '../components/Loader.jsx';

export default function VacancyDetail({ id }) {
  const { user, navigate } = useApp();
  const { t, lang } = useLang();
  const [v, setV] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getVacancy(id).then((r) => setV(r.vacancy)).catch(() => setV(false));
  }, [id]);

  if (v === null) return <Loader full />;
  if (v === false)
    return (
      <div className="page">
        <Header title={t('vacancy')} back="home" />
        <p className="empty">{t('vacancyNotFound')}</p>
      </div>
    );

  const isOwner = v.employer?.id === user.id;
  const back = user.is_admin ? 'requests' : user.role === 'employer' ? 'home' : 'search';
  const format = v.work_format || v.work_type;

  async function apply() {
    setBusy(true);
    haptic('medium');
    try {
      const r = await api.apply(v.id);
      navigate('chat', { vacancyId: r.vacancy_id, peerId: r.peer_id });
    } catch (e) {
      alert(t('errGeneric', { msg: e.message }));
      setBusy(false);
    }
  }

  async function toggleStatus() {
    const next = v.status === 'open' ? 'closed' : 'open';
    const r = await api.setVacancyStatus(v.id, next);
    setV(r.vacancy);
  }

  return (
    <div className="page detail">
      <Header title={t('vacancy')} back={back} />

      <div className="detail-head">
        <h1>{v.title}</h1>
        <div className="salary big">{formatSalary(v.salary, lang)}</div>
        <div className="vac-tags">
          <span className="tag">📍 {labelOf(v.city, lang) || v.city}</span>
          {format && <span className="tag">{labelOf(format, lang)}</span>}
          {v.category ? <span className="tag">{labelOf(v.category, lang)}</span> : null}
          {v.experience ? <span className="tag">{labelOf(v.experience, lang)}</span> : null}
        </div>
        <p className="muted small" style={{ marginTop: 8 }}>
          {t('publishedAgo', { ago: timeAgo(v.created_at, lang) })}
        </p>
        {v.status === 'closed' && <p className="closed-badge">{t('closedBadge')}</p>}
      </div>

      <Section title={t('company')} body={v.employer?.company || v.employer?.first_name || t('employer')} />
      {v.description && <Section title={t('description')} body={v.description} />}
      {v.requirements && <Section title={t('requirements')} body={v.requirements} />}
      {v.schedule && <Section title={t('schedule')} body={v.schedule} />}
      {v.work_hours && <Section title={t('workHours')} body={v.work_hours} />}
      {v.address && <Section title={t('address')} body={v.address} />}

      <div className="detail-actions">
        {isOwner ? (
          <button className="btn btn-block btn-secondary" onClick={toggleStatus}>
            {v.status === 'open' ? t('closeVacancy') : t('reopenVacancy')}
          </button>
        ) : (
          <>
            <button className="btn btn-block" disabled={busy} onClick={apply}>
              {t('apply')}
            </button>
            {v.contact_type === 'phone' && v.contact_phone ? (
              <button className="btn btn-block btn-secondary" onClick={() => openPhone(v.contact_phone)}>
                {t('callEmployer')} · {v.contact_phone}
              </button>
            ) : (
              <button className="btn btn-block btn-secondary"
                onClick={() => navigate('chat', { vacancyId: v.id, peerId: v.employer.id })}>
                {t('writeEmployer')}
              </button>
            )}
            {v.employer?.username && (
              <button className="link-btn" onClick={() => openTelegramChat(v.employer.username)}>
                {t('openInTelegram')} @{v.employer.username}
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
