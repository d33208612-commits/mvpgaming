import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { haptic } from '../telegram.js';
import Header from '../components/Header.jsx';
import Loader from '../components/Loader.jsx';

export default function Chat({ params }) {
  const { vacancyId, peerId } = params;
  const [data, setData] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const load = () =>
    api.chatMessages(vacancyId, peerId).then(setData).catch(() => setData({ messages: [], me: null }));

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [vacancyId, peerId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages.length]);

  async function send() {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    haptic('light');
    try {
      await api.sendMessage({ vacancy_id: vacancyId || null, to_user_id: peerId, text: t });
      setText('');
      await load();
    } catch (e) {
      alert('Не отправлено: ' + e.message);
    } finally {
      setSending(false);
    }
  }

  if (data === null) return <Loader full />;

  const title = data.peer?.company || data.peer?.name || 'Чат';
  const subtitle = data.vacancy ? `по вакансии «${data.vacancy.title}»` : undefined;

  return (
    <div className="page chat-page">
      <Header title={title} subtitle={subtitle} back="chats" />

      <div className="messages">
        {data.messages.length === 0 && (
          <p className="empty small">Сообщений пока нет. Напишите первым.</p>
        )}
        {data.messages.map((m) => {
          const mine = m.from_user_id === data.me;
          return (
            <div key={m.id} className={mine ? 'msg mine' : 'msg'}>
              <span className="msg-text">{m.text}</span>
              <span className="msg-time">
                {new Date(m.created_at * 1000).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="chat-input">
        <input
          className="input"
          placeholder="Сообщение…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="send-btn" disabled={!text.trim() || sending} onClick={send}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M3 20.5 21 12 3 3.5 3 10l13 2-13 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
