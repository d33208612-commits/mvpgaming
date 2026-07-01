import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import { AppContext } from './store.jsx';
import { haptic } from './telegram.js';
import { useLang } from './i18n.jsx';

import RoleSelect from './pages/RoleSelect.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import PostJob from './pages/PostJob.jsx';
import Profile from './pages/Profile.jsx';
import ProfileEdit from './pages/ProfileEdit.jsx';
import VacancyDetail from './pages/VacancyDetail.jsx';
import Chats from './pages/Chats.jsx';
import Chat from './pages/Chat.jsx';
import AdminRequests from './pages/AdminRequests.jsx';
import AdminEditVacancy from './pages/AdminEditVacancy.jsx';
import AdminProfile from './pages/AdminProfile.jsx';
import BottomNav from './components/BottomNav.jsx';
import Loader from './components/Loader.jsx';

const NAV_EMPLOYER = ['home', 'post', 'profile'];
const NAV_SEEKER = ['home', 'search', 'chats', 'profile'];
const NAV_ADMIN = ['requests', 'search', 'chats', 'admin'];

export default function App() {
  const { t } = useLang();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nav, setNav] = useState({ screen: 'home', params: {} });

  const refreshUser = useCallback(async () => {
    const { user } = await api.me();
    setUser(user);
    return user;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await api.auth();
        setUser(user);
        if (user.is_admin) setNav({ screen: 'requests', params: {} });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const navigate = useCallback((screen, params = {}) => {
    haptic('light');
    setNav({ screen, params });
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <Loader full />;

  if (error) {
    return (
      <div className="centered">
        <p className="error">{t('authError')}: {error}</p>
        <button className="btn" onClick={() => location.reload()}>{t('retry')}</button>
      </div>
    );
  }

  const ctx = { user, setUser, refreshUser, navigate, nav };

  if (!user.role && !user.is_admin) {
    return (
      <AppContext.Provider value={ctx}>
        <RoleSelect />
      </AppContext.Provider>
    );
  }

  const { screen, params } = nav;
  let page;
  switch (screen) {
    case 'home': page = <Home />; break;
    case 'search': page = <Search initial={params} />; break;
    case 'post': page = <PostJob />; break;
    case 'profile': page = <Profile />; break;
    case 'editProfile': page = <ProfileEdit />; break;
    case 'vacancy': page = <VacancyDetail id={params.id} />; break;
    case 'chats': page = <Chats />; break;
    case 'chat': page = <Chat params={params} />; break;
    case 'requests': page = <AdminRequests />; break;
    case 'adminEdit': page = <AdminEditVacancy id={params.id} />; break;
    case 'admin': page = <AdminProfile />; break;
    default: page = user.is_admin ? <AdminRequests /> : <Home />;
  }

  const navScreens = user.is_admin
    ? NAV_ADMIN
    : user.role === 'employer'
    ? NAV_EMPLOYER
    : NAV_SEEKER;
  const showNav = navScreens.includes(screen);

  return (
    <AppContext.Provider value={ctx}>
      <div className={showNav ? 'app with-nav' : 'app'}>{page}</div>
      {showNav && <BottomNav tabs={navScreens} />}
    </AppContext.Provider>
  );
}
