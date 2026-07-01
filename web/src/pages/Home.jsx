import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../store.jsx';
import { useLang } from '../i18n.jsx';
import { CATEGORIES, WORK_FORMATS, labelOf } from '../constants.js';
import Header from '../components/Header.jsx';
import VacancyCard from '../components/VacancyCard.jsx';
import Loader from '../components/Loader.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';

const CAT_EMOJI = {
  'Продажи': '🛍️', 'Общепит': '🍽️', 'IT и разработка': '💻', 'Строительство': '🏗️',
  'Логистика': '🚚', 'Красота': '💅', 'Образование': '📚', 'Медицина': '⚕️',
  'Транспорт': '🚗', 'Маркетинг': '📈',
};

export default function Home() {
  const { user, navigate } = useApp();
  const { t, lang } = useLang();
  const isEmployer = user.role === 'employer';
  const [employerVacs, setEmployerVacs] = useState(null);
  const [feed, setFeed] = useState(null);

  useEffect(() => {
    if (isEmployer) {
      api.myVacancies().then((r) => setEmployerVacs(r.vacancies)).catch(() => setEmployerVacs([]));
    } else {
      api.feed().then(setFeed).catch(() => setFeed({ applied: [], fresh: [] }));
    }
  }, [isEmployer]);

  return (
    <div className="page">
      <LanguageSwitcher />
      <Header
        title={isEmployer ? t('myVacancies') : t('findJob')}
        subtitle={isEmployer ? user.company || t('manageVacancies') : t('findJobSub')}
      />

      {isEmployer ? (
        <>
          <button className="btn btn-block" onClick={() => navigate('post')}>
            <span className="plus-box">+</span> {t('postVacancy')}
          </button>
          {employerVacs === null ? (
            <Loader />
          ) : employerVacs.length === 0 ? (
            <Empty icon="💼" text={t('noVacanciesEmployer')} />
          ) : (
            <div className="vac-list" style={{ marginTop: 16 }}>
              {employerVacs.map((v) => <VacancyCard key={v.id} vacancy={v} />)}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="quick-row">
            {WORK_FORMATS.map((f) => (
              <button key={f.value} className="quick-pill"
                onClick={() => navigate('search', { work_format: f.value })}>
                {labelOf(f.value, lang)}
              </button>
            ))}
          </div>

          <h2 className="section-title">{t('categories')}</h2>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <button key={c.value} className="cat-tile"
                onClick={() => navigate('search', { category: c.value })}>
                <span className="cat-emoji">{CAT_EMOJI[c.value] || '📌'}</span>
                <span>{labelOf(c.value, lang)}</span>
              </button>
            ))}
          </div>

          {feed === null ? (
            <Loader />
          ) : (
            <>
              {feed.applied.length > 0 && (
                <>
                  <h2 className="section-title">{t('appliedSection')}</h2>
                  <div className="vac-list">
                    {feed.applied.map((v) => <VacancyCard key={v.id} vacancy={v} />)}
                  </div>
                </>
              )}
              <h2 className="section-title">
                {feed.profession && feed.profession !== 'any'
                  ? labelOf(feed.profession, lang)
                  : t('freshSection')}
              </h2>
              {feed.fresh.length === 0 ? (
                <Empty icon="🔎" text={t('noVacancies')} />
              ) : (
                <div className="vac-list">
                  {feed.fresh.map((v) => <VacancyCard key={v.id} vacancy={v} />)}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}
