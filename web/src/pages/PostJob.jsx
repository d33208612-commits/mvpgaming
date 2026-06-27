import { useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../store.jsx';
import { haptic } from '../telegram.js';
import { CITIES, CATEGORIES, WORK_TYPES } from '../constants.js';
import Header from '../components/Header.jsx';
import { Field, TextInput, TextArea, Select, Chips } from '../components/Field.jsx';

export default function PostJob() {
  const { navigate } = useApp();
  const [form, setForm] = useState({
    title: '',
    city: '',
    salary: '',
    work_type: 'full',
    category: '',
    description: '',
    requirements: '',
    schedule: '',
    address: '',
    remote: false,
    no_experience: false,
    contact: 'Написать в Telegram',
  });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canSubmit = form.title && form.city && form.salary && form.work_type;

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    haptic('medium');
    try {
      const { vacancy } = await api.createVacancy(form);
      navigate('vacancy', { id: vacancy.id });
    } catch (e) {
      alert('Не удалось создать вакансию: ' + e.message);
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <Header title="Новая вакансия" back="home" />

      <Field label="Название должности *">
        <TextInput placeholder="Например, продавец-консультант"
          value={form.title} onChange={(e) => set('title', e.target.value)} />
      </Field>

      <Field label="Город *">
        <Select options={CITIES} placeholder="Выберите город"
          value={form.city} onChange={(e) => set('city', e.target.value)} />
      </Field>

      <Field label="Зарплата *" hint="Например: 800 $ или от 5 000 000 сум">
        <TextInput placeholder="800 $"
          value={form.salary} onChange={(e) => set('salary', e.target.value)} />
      </Field>

      <Field label="Тип работы *">
        <Chips options={WORK_TYPES} value={form.work_type}
          onChange={(v) => set('work_type', v || 'full')} />
      </Field>

      <Field label="Категория">
        <Select options={CATEGORIES} placeholder="Выберите категорию"
          value={form.category} onChange={(e) => set('category', e.target.value)} />
      </Field>

      <Field label="Описание">
        <TextArea rows={4} placeholder="Расскажите о вакансии и обязанностях"
          value={form.description} onChange={(e) => set('description', e.target.value)} />
      </Field>

      <Field label="Требования">
        <TextArea rows={3} placeholder="Опыт, навыки, пожелания"
          value={form.requirements} onChange={(e) => set('requirements', e.target.value)} />
      </Field>

      <Field label="График">
        <TextInput placeholder="Например, 5/2 с 9:00 до 18:00"
          value={form.schedule} onChange={(e) => set('schedule', e.target.value)} />
      </Field>

      <Field label="Адрес">
        <TextInput placeholder="Улица, ориентир"
          value={form.address} onChange={(e) => set('address', e.target.value)} />
      </Field>

      <div className="switch-row">
        <label className="switch">
          <input type="checkbox" checked={form.remote}
            onChange={(e) => set('remote', e.target.checked)} />
          <span>Удалённая работа</span>
        </label>
        <label className="switch">
          <input type="checkbox" checked={form.no_experience}
            onChange={(e) => set('no_experience', e.target.checked)} />
          <span>Можно без опыта</span>
        </label>
      </div>

      <Field label="Как откликаться" hint="По умолчанию — встроенный чат / Telegram">
        <TextInput value={form.contact} onChange={(e) => set('contact', e.target.value)} />
      </Field>

      <button className="btn btn-block" disabled={!canSubmit || busy} onClick={submit}>
        {busy ? 'Публикуем…' : 'Опубликовать вакансию'}
      </button>
    </div>
  );
}
