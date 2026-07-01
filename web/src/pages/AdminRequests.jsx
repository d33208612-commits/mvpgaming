import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../store.jsx';
import { useLang } from '../i18n.jsx';
import { openTelegramChat, openPhone, haptic } from '../telegram.js';
import { labelOf, timeAgo, formatSalary } from '../constants.js';
import Header from '../components/Header.jsx';
import Loader from '../components/Loader.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';

const STATUS_KEY = { pending: 'statusPending', open: 'statusOpen', rejected: 'statusRejected', closed: 'statusClosed' };

export default function AdminRequests() {
  const { navigate } = useApp();
  const { t, lang } = useLang();
  const [vacancies, setVacancies] = useState(null);

  const load = () => api.adminVacancies().then((r) => setVacancies(r.vacancies)).catch(() => setVacancies([]));
  useEffect(() => { load(); }, []);

  const replace = (v) => setVacancies((list) => list.map((x) => (x.id === v.id ? v : x)));

  async function moderate(id, action) {
    haptic('medium');
    const { vacancy } = await api.adminModerate(id, action);
    replace(vacancy);
  }

  async function remove(id) {
    if (!confirm(t('deleteConfirm'))) return;
    haptic('medium');
    await api.adminDelete(id);
    setVacancies((list) => list.filter((v) => v.id !== id));
  }

  return (
    <div className="page">
      <LanguageSwitcher />
      <Header title={t('requests')} subtitle={t('requestsSub')} />

      {vacancies === null ? (
        <Loader />
      ) : vacancies.length === 0 ? (
        <p className="empty">{t('noRequests')}</p>
      ) : (
        <div className="vac-list">
          {vacancies.map((v) => (
            <div key={v.id} className="card" style={{ padding: 16 }}>
              <div className="vac-card-top">
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{v.title}</h3>
                <span className="salary">{formatSalary(v.salary, lang)}</span>
              </div>
              <div className="vac-tags">
                <span className={`status-badge ${v.status}`}>{t(STATUS_KEY[v.status] || 'statusOpen')}</span>
                <span className="tag">📍 {labelOf(v.city, lang) || v.city}</span>
                <span className="tag muted">{timeAgo(v.created_at, lang)}</span>
              </div>
              {v.description && <p className="muted small" style={{ marginTop: 10 }}>{v.description}</p>}

              <div className="info-row" style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12, borderBottom: 'none' }}>
                <span className="info-label">{t('employer')}</span>
                <span className="info-value">
                  {v.employer?.company || v.employer?.first_name || '—'}
                  {v.employer?.username ? ` · @${v.employer.username}` : ''}
                </span>
              </div>
              {v.contact_type === 'phone' && v.contact_phone && (
                <div className="info-row" style={{ paddingTop: 6, borderBottom: 'none' }}>
                  <span className="info-label">{t('contacts')}</span>
                  <span className="info-value">{v.contact_phone}</span>
                </div>
              )}

              <div className="detail-actions" style={{ marginTop: 14 }}>
                {v.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn" style={{ flex: 1 }} onClick={() => moderate(v.id, 'approve')}>
                      {t('approve')}
                    </button>
                    <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => moderate(v.id, 'reject')}>
                      {t('reject')}
                    </button>
                  </div>
                )}
                <button className="btn btn-block btn-secondary" onClick={() => navigate('adminEdit', { id: v.id })}>
                  {t('editVacancy')}
                </button>
                <button className="btn btn-block btn-secondary"
                  onClick={() => navigate('chat', { vacancyId: v.id, peerId: v.employer?.id })}>
                  {t('write')}
                </button>
                {v.employer?.username && (
                  <button className="link-btn" onClick={() => openTelegramChat(v.employer.username)}>
                    @{v.employer.username}
                  </button>
                )}
                {v.contact_type === 'phone' && v.contact_phone && (
                  <button className="link-btn" onClick={() => openPhone(v.contact_phone)}>
                    📞 {v.contact_phone}
                  </button>
                )}
                <button className="btn btn-block btn-danger" onClick={() => remove(v.id)}>
                  {t('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
