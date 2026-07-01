import { useApp } from '../store.jsx';
import { useLang } from '../i18n.jsx';
import { labelOf, timeAgo } from '../constants.js';

export default function VacancyCard({ vacancy }) {
  const { navigate } = useApp();
  const { t, lang } = useLang();
  const v = vacancy;
  const format = v.work_format || v.work_type;
  return (
    <button className="vac-card" onClick={() => navigate('vacancy', { id: v.id })}>
      <div className="vac-card-top">
        <h3>{v.title}</h3>
        <span className="salary">{v.salary}</span>
      </div>
      <div className="vac-tags">
        <span className="tag">📍 {labelOf(v.city, lang) || v.city}</span>
        {format && <span className="tag">{labelOf(format, lang)}</span>}
        {v.experience === 'none' && <span className="tag">{t('noExperience')}</span>}
      </div>
      <div className="vac-card-bottom">
        <span className="company">
          {v.employer?.company || v.employer?.first_name || t('employer')}
        </span>
        <span className="muted">{timeAgo(v.created_at, lang)}</span>
      </div>
    </button>
  );
}
