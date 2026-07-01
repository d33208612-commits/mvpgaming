import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../store.jsx';
import { useLang } from '../i18n.jsx';
import { timeAgo } from '../constants.js';
import Header from '../components/Header.jsx';
import Loader from '../components/Loader.jsx';

export default function Chats() {
  const { navigate } = useApp();
  const { t, lang } = useLang();
  const [chats, setChats] = useState(null);

  useEffect(() => {
    api.chats().then((r) => setChats(r.chats)).catch(() => setChats([]));
  }, []);

  return (
    <div className="page">
      <Header title={t('chats')} />
      {chats === null ? (
        <Loader />
      ) : chats.length === 0 ? (
        <div className="empty">
          <div className="empty-icon" style={{ fontSize: 34 }}>💬</div>
          {t('noChats')}
        </div>
      ) : (
        <div className="chat-list">
          {chats.map((c) => {
            const initials = (c.peer?.name || '?').slice(0, 1).toUpperCase();
            return (
              <button key={`${c.vacancy_id}-${c.peer?.id}`} className="chat-row"
                onClick={() => navigate('chat', { vacancyId: c.vacancy_id, peerId: c.peer?.id })}>
                {c.peer?.photo_url ? (
                  <img className="avatar sm" src={c.peer.photo_url} alt="" />
                ) : (
                  <div className="avatar sm avatar-fallback">{initials}</div>
                )}
                <div className="chat-row-body">
                  <div className="chat-row-top">
                    <span className="chat-name">{c.peer?.company || c.peer?.name || '—'}</span>
                    <span className="muted small">{timeAgo(c.last_at, lang)}</span>
                  </div>
                  {c.vacancy_title && (
                    <span className="chat-vac">{t('aboutVacancy', { title: c.vacancy_title })}</span>
                  )}
                  <span className="chat-last">{c.last_message}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
