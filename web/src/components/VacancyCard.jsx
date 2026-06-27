import { useApp } from '../store.jsx';
import { workTypeLabel, timeAgo } from '../constants.js';

export default function VacancyCard({ vacancy }) {
  const { navigate } = useApp();
  const v = vacancy;
  return (
    <button className="vac-card" onClick={() => navigate('vacancy', { id: v.id })}>
      <div className="vac-card-top">
        <h3>{v.title}</h3>
        <span className="salary">{v.salary}</span>
      </div>
      <div className="vac-tags">
        <span className="tag">📍 {v.city}</span>
        <span className="tag">{workTypeLabel(v.work_type)}</span>
        {v.remote ? <span className="tag">🌐 Удалённо</span> : null}
        {v.no_experience ? <span className="tag">Без опыта</span> : null}
      </div>
      <div className="vac-card-bottom">
        <span className="company">
          {v.employer?.company || v.employer?.first_name || 'Работодатель'}
        </span>
        <span className="muted">{timeAgo(v.created_at)}</span>
      </div>
    </button>
  );
}
