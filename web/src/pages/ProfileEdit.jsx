import { useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../store.jsx';
import { useLang } from '../i18n.jsx';
import { haptic } from '../telegram.js';
import { CITIES, PROFESSIONS, localize } from '../constants.js';
import Header from '../components/Header.jsx';
import { Field, TextInput, TextArea, Select } from '../components/Field.jsx';

export default function ProfileEdit() {
  const { user, setUser, navigate } = useApp();
  const { t, lang } = useLang();
  const isEmployer = user.role === 'employer';
  const [f, setF] = useState({
    company: user.company || '',
    name: user.name || user.first_name || '',
    age: user.age || '',
    city: user.city || '',
    profession: user.profession || '',
    desired_salary: user.desired_salary || '',
    about: user.about || '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  // Numeric-only handler: letters trigger a red message.
  function numeric(key, allowSpace = false) {
    return (e) => {
      const val = e.target.value;
      const re = allowSpace ? /[^\d\s]/ : /[^\d]/;
      if (re.test(val)) {
        setErrors((x) => ({ ...x, [key]: t('onlyDigits') }));
        return;
      }
      setErrors((x) => ({ ...x, [key]: null }));
      set(key, val);
    };
  }

  async function save() {
    if (busy) return;
    setBusy(true);
    haptic('medium');
    try {
      const { user } = await api.updateProfile(f);
      setUser(user);
      navigate('profile');
    } catch (e) {
      alert(t('errGeneric', { msg: e.message }));
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <Header title={t('editProfile')} back="profile" />

      {isEmployer ? (
        <>
          <Field label={t('companyName')}>
            <TextInput value={f.company} onChange={(e) => set('company', e.target.value)} />
          </Field>
          <Field label={t('city')}>
            <Select options={localize(CITIES, lang)} placeholder={t('selectCity')}
              value={f.city} onChange={(e) => set('city', e.target.value)} />
          </Field>
        </>
      ) : (
        <>
          <Field label={t('name')}>
            <TextInput value={f.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label={t('age')} error={errors.age}>
            <TextInput type="text" inputMode="numeric" invalid={!!errors.age}
              value={f.age} onChange={numeric('age')} />
          </Field>
          <Field label={t('city')}>
            <Select options={localize(CITIES, lang)} placeholder={t('selectCity')}
              value={f.city} onChange={(e) => set('city', e.target.value)} />
          </Field>
          <Field label={t('profession')} hint={t('professionHint')}>
            <Select options={localize(PROFESSIONS, lang)} placeholder={t('selectProfession')}
              value={f.profession} onChange={(e) => set('profession', e.target.value)} />
          </Field>
          <Field label={t('desiredSalary')} hint={t('salaryHint')} error={errors.desired_salary}>
            <TextInput type="text" inputMode="numeric" invalid={!!errors.desired_salary}
              placeholder="3 000 000" value={f.desired_salary} onChange={numeric('desired_salary', true)} />
          </Field>
          <Field label={t('about')}>
            <TextArea rows={4} value={f.about} onChange={(e) => set('about', e.target.value)} />
          </Field>
        </>
      )}

      <button className="btn btn-block" disabled={busy} onClick={save}>
        {busy ? t('saving') : t('save')}
      </button>
    </div>
  );
}
