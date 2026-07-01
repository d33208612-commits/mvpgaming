import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../store.jsx';
import { useLang } from '../i18n.jsx';
import { haptic } from '../telegram.js';
import {
  CITIES, CATEGORIES, WORK_FORMATS, SCHEDULES, WORK_HOURS, EXPERIENCE, localize,
} from '../constants.js';
import Header from '../components/Header.jsx';
import Loader from '../components/Loader.jsx';
import { Field, TextInput, TextArea, Select, Chips } from '../components/Field.jsx';

export default function AdminEditVacancy({ id }) {
  const { navigate } = useApp();
  const { t, lang } = useLang();
  const [f, setF] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    api.getVacancy(id).then((r) => {
      const v = r.vacancy;
      setF({
        title: v.title || '', city: v.city || '', salary: String(v.salary_num || v.salary || ''),
        category: v.category || '', work_format: v.work_format || 'onsite',
        schedule: v.schedule || '', work_hours: v.work_hours || '', experience: v.experience || 'required',
        description: v.description || '', requirements: v.requirements || '', address: v.address || '',
      });
    }).catch(() => setF(false));
  }, [id]);

  function onSalary(e) {
    const val = e.target.value;
    if (/[^\d]/.test(val)) { setErrors((x) => ({ ...x, salary: t('onlyDigits') })); return; }
    setErrors((x) => ({ ...x, salary: null }));
    set('salary', val);
  }

  async function save() {
    if (busy) return;
    setBusy(true);
    haptic('medium');
    try {
      await api.adminUpdate(id, f);
      navigate('requests');
    } catch (e) {
      alert(t('errGeneric', { msg: e.message }));
      setBusy(false);
    }
  }

  if (f === null) return <Loader full />;
  if (f === false)
    return <div className="page"><Header title={t('editVacancy')} back="requests" /><p className="empty">{t('vacancyNotFound')}</p></div>;

  return (
    <div className="page">
      <Header title={t('editVacancy')} back="requests" />

      <Field label={t('jobTitle')}>
        <TextInput value={f.title} onChange={(e) => set('title', e.target.value)} />
      </Field>
      <Field label={t('city')}>
        <Select options={localize(CITIES, lang)} placeholder={t('selectCity')}
          value={f.city} onChange={(e) => set('city', e.target.value)} />
      </Field>
      <Field label={t('salary')} hint={t('salaryHint')} error={errors.salary}>
        <TextInput type="text" inputMode="numeric" invalid={!!errors.salary}
          value={f.salary} onChange={onSalary} />
      </Field>
      <Field label={t('category')}>
        <Select options={localize(CATEGORIES, lang)} placeholder={t('selectCategory')}
          value={f.category} onChange={(e) => set('category', e.target.value)} />
      </Field>
      <Field label={t('workFormat')}>
        <Chips options={localize(WORK_FORMATS, lang)} value={f.work_format}
          onChange={(v) => set('work_format', v || 'onsite')} allowUnset={false} />
      </Field>
      <Field label={t('schedule')}>
        <Chips options={localize(SCHEDULES, lang)} value={f.schedule}
          onChange={(v) => set('schedule', v)} />
      </Field>
      <Field label={t('workHours')}>
        <Chips options={localize(WORK_HOURS, lang)} value={f.work_hours}
          onChange={(v) => set('work_hours', v)} />
      </Field>
      <Field label={t('experience')}>
        <Chips options={localize(EXPERIENCE, lang)} value={f.experience}
          onChange={(v) => set('experience', v || 'required')} allowUnset={false} />
      </Field>
      <Field label={t('description')}>
        <TextArea rows={4} value={f.description} onChange={(e) => set('description', e.target.value)} />
      </Field>
      <Field label={t('requirements')}>
        <TextArea rows={3} value={f.requirements} onChange={(e) => set('requirements', e.target.value)} />
      </Field>
      <Field label={t('address')}>
        <TextInput value={f.address} onChange={(e) => set('address', e.target.value)} />
      </Field>

      <button className="btn btn-block" disabled={busy} onClick={save}>
        {busy ? t('saving') : t('save')}
      </button>
    </div>
  );
}
