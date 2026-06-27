import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../store.jsx';
import { CATEGORIES, WORK_TYPES } from '../constants.js';
import Header from '../components/Header.jsx';
import VacancyCard from '../components/VacancyCard.jsx';
import Loader from '../components/Loader.jsx';

const CAT_EMOJI = {
  'Продажи': '🛍️',
  'Общепит': '🍽️',
  'IT и разработка': '💻',
  'Строительство': '🏗️',
  'Логистика': '🚚',
  'Красота': '💅',
  'Образование': '📚',
  'Медицина': '⚕️',
  'Транспорт': '🚗',
  'Маркетинг': '📈',
  'Без категории': '📌',
};

export default function Home() {
  const { user, navigate } = useApp();
  const isEmployer = user.role === 'employer';
  const [vacancies, setVacancies] = useState(null);

  useEffect(() => {
    const load = isEmployer ? api.myVacancies() : api.listVacancies();
    load.then((r) => setVacancies(r.vacancies)).catch(() => setVacancies([]));
  }, [isEmployer]);

  return (
    <div className="page">
      <Header
        title={isEmployer ? 'Мои вакансии' : 'Найти работу'}
        subtitle={isEmployer ? user.company || 'Управляйте вакансиями' : 'Свежие предложения рядом с вами'}
      />

      {!isEmployer && (
        <>
          <div className="quick-row">
            {WORK_TYPES.map((t) => (
              <button key={t.value} className="quick-pill"
                onClick={() => navigate('search', { work_type: t.value })}>
                {t.label}
              </button>
            ))}
          </div>

          <h2 className="section-title">Категории</h2>
          <div className="cat-grid">
            {CATEGORIES.filter((c) => c !== 'Без категории').map((c) => (
              <button key={c} className="cat-tile"
                onClick={() => navigate('search', { category: c })}>
                <span className="cat-emoji">{CAT_EMOJI[c]}</span>
                <span>{c}</span>
              </button>
            ))}
          </div>

          <h2 className="section-title">Все вакансии</h2>
        </>
      )}

      {isEmployer && (
        <button className="btn btn-block" onClick={() => navigate('post')}>
          + Разместить вакансию
        </button>
      )}

      {vacancies === null ? (
        <Loader />
      ) : vacancies.length === 0 ? (
        <p className="empty">
          {isEmployer ? 'У вас пока нет вакансий.' : 'Вакансий пока нет. Загляните позже.'}
        </p>
      ) : (
        <div className="vac-list">
          {vacancies.map((v) => (
            <VacancyCard key={v.id} vacancy={v} />
          ))}
        </div>
      )}
    </div>
  );
}
