import { useApp } from '../store.jsx';
import { useLang } from '../i18n.jsx';

const ICONS = {
  home: 'M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
  post: 'M12 5v14M5 12h14',
  requests: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6M9 16h4',
  chats: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4 4-6 8-6s8 2 8 6',
  admin: 'M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7z',
};

const LABEL_KEY = {
  home: 'navHome',
  search: 'navSearch',
  post: 'navPost',
  requests: 'navRequests',
  chats: 'navChats',
  profile: 'navProfile',
  admin: 'admin',
};

export default function BottomNav({ tabs }) {
  const { nav, navigate } = useApp();
  const { t } = useLang();

  return (
    <nav className="bottom-nav">
      {tabs.map((key) => {
        const active = nav.screen === key;
        return (
          <button key={key} className={active ? 'nav-item active' : 'nav-item'}
            onClick={() => navigate(key)}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={ICONS[key]} />
            </svg>
            <span>{t(LABEL_KEY[key])}</span>
          </button>
        );
      })}
    </nav>
  );
}
