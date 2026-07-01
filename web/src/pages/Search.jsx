import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useLang } from '../i18n.jsx';
import { CITIES, CATEGORIES, WORK_FORMATS, localize } from '../constants.js';
import Header from '../components/Header.jsx';
import VacancyCard from '../components/VacancyCard.jsx';
import Loader from '../components/Loader.jsx';
import { Field, Select, Chips, TextInput } from '../components/Field.jsx';

export default function Search({ initial = {} }) {
  const { t, lang } = useLang();
  const [filters, setFilters] = useState({
    q: '',
    city: initial.city || '',
    work_format: initial.work_format || '',
    category: initial.category || '',
    salary_min: '',
    remote: false,
    no_experience: false,
  });
  const [open, setOpen] = useState(Boolean(initial.city || initial.category || initial.work_format));
  const [vacancies, setVacancies] = useState(null);
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    setVacancies(null);
    const params = {
      q: filters.q,
      city: filters.city,
      work_format: filters.work_format,
      category: filters.category,
      salary_min: filters.salary_min,
      remote: filters.remote ? '1' : '',
      no_experience: filters.no_experience ? '1' : '',
    };
    const timer = setTimeout(() => {
      api.listVacancies(params).then((r) => setVacancies(r.vacancies)).catch(() => setVacancies([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  const activeCount =
    ['city', 'work_format', 'category', 'salary_min'].filter((k) => filters[k]).length +
    (filters.remote ? 1 : 0) + (filters.no_experience ? 1 : 0);

  return (
    <div className="page">
      <Header title={t('searchTitle')} />

      <div className="search-bar">
        <input className="input" placeholder={t('searchPlaceholder')}
          value={filters.q} onChange={(e) => set('q', e.target.value)} />
        <button className="filter-btn" onClick={() => setOpen((o) => !o)}>
          {t('filters')}{activeCount ? ` · ${activeCount}` : ''}
        </button>
      </div>

      {open && (
        <div className="filters card">
          <Field label={t('city')}>
            <Select options={localize(CITIES, lang)} placeholder={t('anyCity')}
              value={filters.city} onChange={(e) => set('city', e.target.value)} />
          </Field>
          <Field label={t('category')}>
            <Select options={localize(CATEGORIES, lang)} placeholder={t('anyCategory')}
              value={filters.category} onChange={(e) => set('category', e.target.value)} />
          </Field>
          <Field label={t('workFormat')}>
            <Chips options={localize(WORK_FORMATS, lang)} value={filters.work_format}
              onChange={(v) => set('work_format', v)} />
          </Field>
          <Field label={t('salaryFrom')}>
            <TextInput type="number" inputMode="numeric" placeholder="3000000"
              value={filters.salary_min} onChange={(e) => set('salary_min', e.target.value)} />
          </Field>
          <div className="switch-row">
            <label className="switch">
              <input type="checkbox" checked={filters.remote}
                onChange={(e) => set('remote', e.target.checked)} />
              <span>{t('remoteWork')}</span>
            </label>
            <label className="switch">
              <input type="checkbox" checked={filters.no_experience}
                onChange={(e) => set('no_experience', e.target.checked)} />
              <span>{t('noExperience')}</span>
            </label>
          </div>
        </div>
      )}

      {vacancies === null ? (
        <Loader />
      ) : vacancies.length === 0 ? (
        <p className="empty">{t('nothingFound')}</p>
      ) : (
        <>
          <p className="result-count">{t('resultCount', { n: vacancies.length })}</p>
          <div className="vac-list">
            {vacancies.map((v) => <VacancyCard key={v.id} vacancy={v} />)}
          </div>
        </>
      )}
    </div>
  );
}
