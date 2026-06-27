import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { CITIES, CATEGORIES, WORK_TYPES } from '../constants.js';
import Header from '../components/Header.jsx';
import VacancyCard from '../components/VacancyCard.jsx';
import Loader from '../components/Loader.jsx';
import { Field, Select, Chips, TextInput } from '../components/Field.jsx';

export default function Search({ initial = {} }) {
  const [filters, setFilters] = useState({
    q: '',
    city: initial.city || '',
    work_type: initial.work_type || '',
    category: initial.category || '',
    salary_min: '',
    remote: false,
    no_experience: false,
  });
  const [open, setOpen] = useState(false);
  const [vacancies, setVacancies] = useState(null);

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    setVacancies(null);
    const params = {
      q: filters.q,
      city: filters.city,
      work_type: filters.work_type,
      category: filters.category,
      salary_min: filters.salary_min,
      remote: filters.remote ? '1' : '',
      no_experience: filters.no_experience ? '1' : '',
    };
    const t = setTimeout(() => {
      api.listVacancies(params).then((r) => setVacancies(r.vacancies)).catch(() => setVacancies([]));
    }, 250);
    return () => clearTimeout(t);
  }, [filters]);

  const activeCount = ['city', 'work_type', 'category', 'salary_min']
    .filter((k) => filters[k]).length + (filters.remote ? 1 : 0) + (filters.no_experience ? 1 : 0);

  return (
    <div className="page">
      <Header title="Поиск вакансий" />

      <div className="search-bar">
        <input
          className="input"
          placeholder="Должность, ключевое слово…"
          value={filters.q}
          onChange={(e) => set('q', e.target.value)}
        />
        <button className="filter-btn" onClick={() => setOpen((o) => !o)}>
          Фильтры{activeCount ? ` · ${activeCount}` : ''}
        </button>
      </div>

      {open && (
        <div className="filters card">
          <Field label="Город">
            <Select options={CITIES} placeholder="Любой город"
              value={filters.city} onChange={(e) => set('city', e.target.value)} />
          </Field>
          <Field label="Категория">
            <Select options={CATEGORIES} placeholder="Любая категория"
              value={filters.category} onChange={(e) => set('category', e.target.value)} />
          </Field>
          <Field label="Тип работы">
            <Chips options={WORK_TYPES} value={filters.work_type}
              onChange={(v) => set('work_type', v)} />
          </Field>
          <Field label="Зарплата от">
            <TextInput type="number" inputMode="numeric" placeholder="например, 500"
              value={filters.salary_min} onChange={(e) => set('salary_min', e.target.value)} />
          </Field>
          <div className="switch-row">
            <label className="switch">
              <input type="checkbox" checked={filters.remote}
                onChange={(e) => set('remote', e.target.checked)} />
              <span>Удалённая работа</span>
            </label>
            <label className="switch">
              <input type="checkbox" checked={filters.no_experience}
                onChange={(e) => set('no_experience', e.target.checked)} />
              <span>Без опыта</span>
            </label>
          </div>
        </div>
      )}

      {vacancies === null ? (
        <Loader />
      ) : vacancies.length === 0 ? (
        <p className="empty">Ничего не найдено. Измените фильтры.</p>
      ) : (
        <>
          <p className="result-count">{vacancies.length} вакансий</p>
          <div className="vac-list">
            {vacancies.map((v) => (
              <VacancyCard key={v.id} vacancy={v} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
