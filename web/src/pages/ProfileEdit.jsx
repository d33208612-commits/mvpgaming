import { useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../store.jsx';
import { haptic } from '../telegram.js';
import { CITIES } from '../constants.js';
import Header from '../components/Header.jsx';
import { Field, TextInput, TextArea, Select } from '../components/Field.jsx';

export default function ProfileEdit() {
  const { user, setUser, navigate } = useApp();
  const isEmployer = user.role === 'employer';
  const [form, setForm] = useState({
    company: user.company || '',
    name: user.name || user.first_name || '',
    age: user.age || '',
    city: user.city || '',
    desired_salary: user.desired_salary || '',
    about: user.about || '',
  });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setBusy(true);
    haptic('medium');
    try {
      const { user } = await api.updateProfile(form);
      setUser(user);
      navigate('profile');
    } catch (e) {
      alert('Не удалось сохранить: ' + e.message);
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <Header title="Редактировать профиль" back="profile" />

      {isEmployer ? (
        <>
          <Field label="Название компании">
            <TextInput value={form.company} onChange={(e) => set('company', e.target.value)} />
          </Field>
          <Field label="Город">
            <Select options={CITIES} placeholder="Выберите город"
              value={form.city} onChange={(e) => set('city', e.target.value)} />
          </Field>
        </>
      ) : (
        <>
          <Field label="Имя">
            <TextInput value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Возраст">
            <TextInput type="number" inputMode="numeric"
              value={form.age} onChange={(e) => set('age', e.target.value)} />
          </Field>
          <Field label="Город">
            <Select options={CITIES} placeholder="Выберите город"
              value={form.city} onChange={(e) => set('city', e.target.value)} />
          </Field>
          <Field label="Желаемая зарплата">
            <TextInput placeholder="например, 600 $"
              value={form.desired_salary} onChange={(e) => set('desired_salary', e.target.value)} />
          </Field>
          <Field label="Кратко о себе">
            <TextArea rows={4} value={form.about} onChange={(e) => set('about', e.target.value)} />
          </Field>
        </>
      )}

      <button className="btn btn-block" disabled={busy} onClick={save}>
        {busy ? 'Сохраняем…' : 'Сохранить'}
      </button>
    </div>
  );
}
