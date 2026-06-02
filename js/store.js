/* ============================================================
   MVP Gaming — State store with localStorage persistence
   ============================================================ */
(function () {
  const MVP = (window.MVP = window.MVP || {});
  const KEY = 'mvp_gaming_state_v1';

  function freshState() {
    return {
      version: 1,
      lang: 'ru',
      clubs: MVP.seed.clubs(),
      promos: MVP.seed.promos(),
      users: MVP.seed.users(),
      session: null, // user id
      favorites: [], // club ids
      bookings: [], // {id, clubId, roomId, date, time, hours, total, status, createdAt}
      notifications: [
        { id: 'n1', icon: 'gift', title: '−20% на первую сессию', body: 'Используйте промокод FIRST20 при бронировании.', date: '2026-06-01', read: false },
        { id: 'n2', icon: 'gamepad', title: 'Новые игры в GL HF', body: 'Добавлены свежие тайтлы в Standard и VIP залах.', date: '2026-05-29', read: false },
      ],
      chat: [], // support chat messages
      clubRequests: [], // club registration requests
      adminViewPublic: false, // admin previewing the customer app
    };
  }

  let state = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        state = JSON.parse(raw);
        if (!state || state.version !== 1) state = freshState();
      } else {
        state = freshState();
      }
    } catch (e) {
      state = freshState();
    }
    // keep i18n in sync
    MVP.i18n.set(state.lang || 'ru');
    return state;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* storage may be unavailable (e.g. file:// in some browsers) */
    }
  }

  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  const store = {
    get state() {
      return state;
    },
    load,
    save,
    uid,
    reset() {
      state = freshState();
      save();
    },

    /* ---- language ---- */
    getLang() {
      return state.lang;
    },
    setLang(code) {
      state.lang = code;
      MVP.i18n.set(code);
      save();
    },

    /* ---- auth ---- */
    currentUser() {
      if (!state.session) return null;
      return state.users.find((u) => u.id === state.session) || null;
    },
    isAdmin() {
      const u = this.currentUser();
      return !!(u && u.role === 'admin' && !state.adminViewPublic);
    },
    adminClub() {
      const u = this.currentUser();
      if (!u || u.role !== 'admin') return null;
      return this.getClub(u.clubId);
    },
    findUserByPhone(phone) {
      const norm = (p) => String(p || '').replace(/\D/g, '');
      return state.users.find((u) => norm(u.phone) === norm(phone));
    },
    register({ phone, name, password }) {
      const existing = this.findUserByPhone(phone);
      if (existing) {
        existing.name = name || existing.name;
        existing.password = password || existing.password;
        existing.verified = true;
        state.session = existing.id;
        save();
        return existing;
      }
      const user = {
        id: uid('user'),
        phone,
        name: name || 'Игрок',
        password,
        role: 'user',
        clubId: null,
        points: 1500,
        level: 'GOLD',
        verified: true,
        referralCode: 'MVP' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      };
      state.users.push(user);
      state.session = user.id;
      save();
      return user;
    },
    login(phone, password) {
      const u = this.findUserByPhone(phone);
      if (!u || u.password !== password) return null;
      state.session = u.id;
      state.adminViewPublic = false;
      save();
      return u;
    },
    logout() {
      state.session = null;
      state.adminViewPublic = false;
      save();
    },
    setAdminViewPublic(v) {
      state.adminViewPublic = !!v;
      save();
    },

    /* ---- clubs / rooms ---- */
    getClubs() {
      return state.clubs;
    },
    visibleClubs() {
      return state.clubs.filter((c) => !c.hidden);
    },
    getClub(id) {
      return state.clubs.find((c) => c.id === id) || null;
    },
    getRoom(clubId, roomId) {
      const c = this.getClub(clubId);
      if (!c) return null;
      return c.rooms.find((r) => r.id === roomId) || null;
    },
    updateClub(id, patch) {
      const c = this.getClub(id);
      if (!c) return;
      Object.assign(c, patch);
      save();
    },
    upsertRoom(clubId, roomData) {
      const c = this.getClub(clubId);
      if (!c) return null;
      if (roomData.id) {
        const r = c.rooms.find((x) => x.id === roomData.id);
        if (r) {
          Object.assign(r, roomData);
          save();
          return r;
        }
      }
      const nr = Object.assign({ id: uid('room'), gallery: [] }, roomData);
      c.rooms.push(nr);
      save();
      return nr;
    },
    deleteRoom(clubId, roomId) {
      const c = this.getClub(clubId);
      if (!c) return;
      c.rooms = c.rooms.filter((r) => r.id !== roomId);
      save();
    },
    clubPriceFrom(club) {
      if (!club.rooms.length) return 0;
      return Math.min.apply(null, club.rooms.map((r) => r.price));
    },

    /* ---- favorites ---- */
    isFavorite(clubId) {
      return state.favorites.includes(clubId);
    },
    toggleFavorite(clubId) {
      const i = state.favorites.indexOf(clubId);
      if (i >= 0) state.favorites.splice(i, 1);
      else state.favorites.push(clubId);
      save();
      return this.isFavorite(clubId);
    },
    favoriteClubs() {
      return state.favorites.map((id) => this.getClub(id)).filter(Boolean);
    },

    /* ---- bookings ---- */
    addBooking(b) {
      const booking = Object.assign({ id: uid('bk'), status: 'upcoming', createdAt: Date.now() }, b);
      state.bookings.unshift(booking);
      // reflect in club stats
      const c = this.getClub(b.clubId);
      if (c && c.stats) c.stats.totalBookings += 1;
      save();
      return booking;
    },
    getBookings() {
      return state.bookings;
    },

    /* ---- reviews ---- */
    addReview(clubId, review) {
      const c = this.getClub(clubId);
      if (!c) return;
      c.reviews.unshift(Object.assign({ id: uid('rev'), date: new Date().toISOString().slice(0, 10), reply: null }, review));
      c.reviewsCount += 1;
      save();
    },
    replyReview(clubId, reviewId, reply) {
      const c = this.getClub(clubId);
      if (!c) return;
      const r = c.reviews.find((x) => x.id === reviewId);
      if (r) {
        r.reply = reply;
        save();
      }
    },

    /* ---- promos ---- */
    getPromos() {
      return state.promos;
    },
    findPromo(code) {
      const norm = (s) => String(s || '').trim().toUpperCase();
      return state.promos.find((p) => norm(p.code) === norm(code)) || null;
    },

    /* ---- notifications ---- */
    addNotification(n) {
      state.notifications.unshift(Object.assign({ id: uid('n'), date: new Date().toISOString().slice(0, 10), read: false }, n));
      save();
    },
    unreadCount() {
      return state.notifications.filter((n) => !n.read).length;
    },
    markNotificationsRead() {
      state.notifications.forEach((n) => (n.read = true));
      save();
    },

    /* ---- support chat ---- */
    addChat(msg) {
      state.chat.push(Object.assign({ id: uid('m'), ts: Date.now() }, msg));
      save();
    },

    /* ---- club registration requests ---- */
    addClubRequest(req) {
      const r = Object.assign({ id: uid('req'), status: 'pending', createdAt: Date.now() }, req);
      state.clubRequests.push(r);
      save();
      return r;
    },
  };

  MVP.store = store;
})();
