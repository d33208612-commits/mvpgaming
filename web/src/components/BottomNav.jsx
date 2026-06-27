import { useApp } from '../store.jsx';

const ICONS = {
  home: 'M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
  post: 'M12 5v14M5 12h14',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4 4-6 8-6s8 2 8 6',
};

export default function BottomNav() {
  const { nav, navigate, user } = useApp();
  const isEmployer = user.role === 'employer';

  const tabs = [
    { key: 'home', label: 'Главная' },
    { key: 'search', label: 'Поиск' },
    isEmployer
      ? { key: 'post', label: 'Разместить' }
      : { key: 'chats', label: 'Чаты', icon: 'post' },
    { key: 'profile', label: 'Профиль' },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((t) => {
        const active = nav.screen === t.key;
        return (
          <button
            key={t.key}
            className={active ? 'nav-item active' : 'nav-item'}
            onClick={() => navigate(t.key)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={ICONS[t.icon || t.key]} />
            </svg>
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
