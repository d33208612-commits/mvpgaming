import { useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../store.jsx';
import { useLang } from '../i18n.jsx';
import { haptic } from '../telegram.js';
import {
  CITIES, CATEGORIES, WORK_FORMATS, SCHEDULES, WORK_HOURS, EXPERIENCE, CONTACT_TYPES, localize,
} from '../constants.js';
import Header from '../components/Header.jsx';
import { Field, TextInput, TextArea, Select, Chips } from '../components/Field.jsx';

const CalIcon = <Ic d="M8 2v3M16 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />;
const PinIcon = <Ic d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11zM12 10a2 2 0 1 0 0-.01" />;
const SendIcon = <Ic d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />;

function Ic({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
  );
}

export default function PostJob() {
  const { navigate } = useApp();
  const { t, lang } = useLang();
  const [f, setF] = useState({
    title: '', city: '', salary: '', category: '',
    work_format: 'onsite', schedule: '5/2', schedule_other: '',
    work_hours: '09:00–18:00', hours_other: '',
    experience: 'required', description: '', requirements: '', address: '',
    contact_type: 'telegram', contact_phone: '',
  });
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const canSubmit = f.title && f.city && f.salary && f.work_format;

  function onPhone(e) {
    const val = e.target.value;
    if (/[^\d\s+()-]/.test(val)) {
      setErrors((x) => ({ ...x, phone: t('onlyDigits') }));
      return;
    }
    setErrors((x) => ({ ...x, phone: null }));
    set('contact_phone', val);
  }

  // Salary: digits only (no spaces, text or ranges).
  function onSalary(e) {
    const val = e.target.value;
    if (/[^\d]/.test(val)) {
      setErrors((x) => ({ ...x, salary: t('onlyDigits') }));
      return;
    }
    setErrors((x) => ({ ...x, salary: null }));
    set('salary', val);
  }

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    haptic('medium');
    const payload = {
      title: f.title, city: f.city, salary: f.salary, category: f.category,
      work_format: f.work_format,
      schedule: f.schedule === 'other' ? f.schedule_other : f.schedule,
      work_hours: f.work_hours === 'other' ? f.hours_other : f.work_hours,
      experience: f.experience,
      description: f.description, requirements: f.requirements, address: f.address,
      contact_type: f.contact_type,
      contact_phone: f.contact_phone,
      contact: f.contact_type === 'phone' ? f.contact_phone : t('howToApply'),
    };
    try {
      await api.createVacancy(payload);
      setSubmitted(true);
    } catch (e) {
      let msg = t('errGeneric', { msg: e.message });
      if (e.code === 'banned_word') msg = t('errBanned');
      else if (e.code === 'weekly_limit') msg = t('errLimit', { limit: e.data?.limit ?? 5 });
      alert(msg);
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="page">
        <Header title={t('newVacancy')} back="home" />
        <div className="pending-screen">
          <div className="pending-check">✓</div>
          <h2>{t('pendingTitle')}</h2>
          <p>{t('pendingNotice')}</p>
          <button className="btn" onClick={() => navigate('home')}>{t('done')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header title={t('newVacancy')} back="home" />

      <Field label={t('jobTitle')} required>
        <TextInput placeholder={t('jobTitlePh')} value={f.title}
          onChange={(e) => set('title', e.target.value)} />
      </Field>

      <Field label={t('city')} icon={PinIcon} required>
        <Select options={localize(CITIES, lang)} placeholder={t('selectCity')}
          value={f.city} onChange={(e) => set('city', e.target.value)} />
      </Field>

      <Field label={t('salary')} hint={t('salaryHint')} error={errors.salary} required>
        <TextInput type="text" inputMode="numeric" invalid={!!errors.salary}
          placeholder="3000000" value={f.salary} onChange={onSalary} />
      </Field>

      <Field label={t('workFormat')} required>
        <Chips options={localize(WORK_FORMATS, lang)} value={f.work_format}
          onChange={(v) => set('work_format', v || 'onsite')} allowUnset={false} />
      </Field>

      <Field label={t('category')}>
        <Select options={localize(CATEGORIES, lang)} placeholder={t('selectCategory')}
          value={f.category} onChange={(e) => set('category', e.target.value)} />
      </Field>

      <Field label={t('schedule')} icon={CalIcon}>
        <Chips options={localize(SCHEDULES, lang)} value={f.schedule}
          onChange={(v) => set('schedule', v || '5/2')} allowUnset={false} />
      </Field>
      {f.schedule === 'other' && (
        <Field label="">
          <TextInput placeholder={t('otherSchedulePh')} value={f.schedule_other}
            onChange={(e) => set('schedule_other', e.target.value)} />
        </Field>
      )}

      <Field label={t('workHours')}>
        <Chips options={localize(WORK_HOURS, lang)} value={f.work_hours}
          onChange={(v) => set('work_hours', v || '09:00–18:00')} allowUnset={false} />
      </Field>
      {f.work_hours === 'other' && (
        <Field label="">
          <TextInput placeholder={t('otherHoursPh')} value={f.hours_other}
            onChange={(e) => set('hours_other', e.target.value)} />
        </Field>
      )}

      <Field label={t('experience')}>
        <Chips options={localize(EXPERIENCE, lang)} value={f.experience}
          onChange={(v) => set('experience', v || 'required')} allowUnset={false} />
      </Field>

      <Field label={t('description')}>
        <TextArea rows={4} placeholder={t('descriptionPh')} value={f.description}
          onChange={(e) => set('description', e.target.value)} />
      </Field>

      <Field label={t('requirements')}>
        <TextArea rows={3} placeholder={t('requirementsPh')} value={f.requirements}
          onChange={(e) => set('requirements', e.target.value)} />
      </Field>

      <Field label={t('address')} icon={PinIcon}>
        <TextInput placeholder={t('addressPh')} value={f.address}
          onChange={(e) => set('address', e.target.value)} />
      </Field>

      <Field label={t('howToApply')} icon={SendIcon}>
        <Chips options={localize(CONTACT_TYPES, lang)} value={f.contact_type}
          onChange={(v) => set('contact_type', v || 'telegram')} allowUnset={false} />
      </Field>
      {f.contact_type === 'phone' && (
        <Field label="" hint={t('phoneUzHint')} error={errors.phone}>
          <TextInput type="tel" inputMode="tel" placeholder={t('phonePh')}
            invalid={!!errors.phone} value={f.contact_phone} onChange={onPhone} />
        </Field>
      )}

      <button className="btn btn-block" disabled={!canSubmit || busy} onClick={submit}>
        {busy ? t('publishing') : t('publish')}
      </button>
    </div>
  );
}
