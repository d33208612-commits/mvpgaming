/* ============================================================
   MVP Gaming — App core: router, shared UI, customer screens
   ============================================================ */
(function () {
  const MVP = (window.MVP = window.MVP || {});
  const S = MVP.store;
  const t = MVP.t;
  const icon = MVP.icon;
  const art = MVP.art;

  /* ---------- small helpers ---------- */
  const screenEl = () => document.getElementById('screen');
  const byId = (id) => document.getElementById(id);
  const val = (id) => (byId(id) ? byId(id).value.trim() : '');
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const attr = (params) => (params ? " data-params='" + JSON.stringify(params).replace(/'/g, '&#39;') + "'" : '');

  function fmt(n) {
    return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  function priceFrom(n) {
    const f = t('from');
    return (f ? f + ' ' : '') + fmt(n) + ' ' + t('perHour');
  }
  MVP.imgFallback = function (img) {
    img.onerror = null;
    img.src = img.getAttribute('data-fb');
  };
  function pic(src, opts) {
    opts = opts || {};
    const fb = (opts.kind === 'banner' ? art.banner : art.scene)(opts.seed || src || 'x', { palette: opts.palette });
    const real = typeof src === 'string' && /^https?:/.test(src) ? src : fb;
    return '<img src="' + real + '" data-fb="' + fb + '" onerror="MVP.imgFallback(this)" loading="lazy" alt="">';
  }
  function avatar(name, size) {
    return '<img src="' + art.avatar(name, { size: size || 96 }) + '" alt="">';
  }
  function starsRow(rating, size) {
    let h = '<span class="rv-stars" style="color:var(--gold)">';
    for (let i = 1; i <= 5; i++) h += icon(i <= Math.round(rating) ? 'starFill' : 'star', { size: size || 14 });
    return h + '</span>';
  }
  function roomTypeLabel(type) {
    const map = { standard: 'Standard', vip: 'VIP', premium: 'Premium', bootcamp: 'Bootcamp', console: 'Console' };
    return map[type] || type;
  }
  function gameChip(gid) {
    const label = MVP.GAMES[gid] || gid;
    const p = art.pal(gid);
    const ini = label.replace(/[^A-Za-z0-9 ]/g, '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    return '<span class="game-chip"><span class="gc-ico" style="background:linear-gradient(135deg,' + p.a + ',' + p.b + ')">' + ini + '</span>' + esc(label) + '</span>';
  }

  const WEEK = {
    ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    uz: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  };
  const MON = {
    ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    uz: ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  };
  function weekday(d) { return (WEEK[S.getLang()] || WEEK.ru)[d.getDay()]; }
  function monShort(m) { return (MON[S.getLang()] || MON.ru)[m]; }

  /* ---------- toast ---------- */
  function toast(msg, type) {
    const wrap = byId('toast-wrap');
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.innerHTML = (type === 'success' ? icon('checkCircle', { size: 18 }) : type === 'error' ? icon('info', { size: 18 }) : '') + '<span>' + esc(msg) + '</span>';
    wrap.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; el.style.transition = '.3s'; }, 2200);
    setTimeout(() => el.remove(), 2600);
  }

  /* ---------- overlay / sheet ---------- */
  function openSheet(html, opts) {
    opts = opts || {};
    const root = byId('overlay-root');
    root.innerHTML =
      '<div class="overlay" id="cur-overlay"><div class="sheet">' +
      '<div class="sheet-grip"></div>' + html + '</div></div>';
    const ov = byId('cur-overlay');
    requestAnimationFrame(() => ov.classList.add('open'));
    ov.addEventListener('click', (e) => { if (e.target === ov && opts.dismissable !== false) closeSheet(); });
    if (opts.onMount) opts.onMount(ov);
    return ov;
  }
  function closeSheet() {
    const ov = byId('cur-overlay');
    if (!ov) return;
    ov.classList.remove('open');
    setTimeout(() => { ov.remove(); }, 240);
  }
  MVP.app = MVP.app || {};
  function dialog(opts) {
    const ic = opts.icon || 'checkCircle';
    const html =
      '<div class="dialog"><div class="d-ico ' + (opts.danger ? 'red' : '') + '">' + icon(ic, { size: 36 }) + '</div>' +
      '<h3>' + esc(opts.title) + '</h3>' + (opts.text ? '<p>' + esc(opts.text) + '</p>' : '') +
      '<div class="mt20">' + (opts.actions || '<button class="btn btn-primary btn-block" data-action="closeSheet">' + t('ok') + '</button>') + '</div></div>';
    openSheet(html);
  }

  /* ---------- header ---------- */
  function header(opts) {
    opts = opts || {};
    let left = '';
    if (opts.brand) {
      left =
        '<div class="brand"><div class="logo-mark">' + icon('logo', { size: 20 }) + '</div>' +
        '<div><div class="b-name">MVP Gaming</div>' +
        '<div class="loc-row">' + icon('location', { size: 13 }) + ' ' + t('home_location') + ' ' + icon('chevD', { size: 13 }) + '</div></div></div>';
    } else if (opts.back) {
      left = '<button class="btn-back" data-back>' + icon('back', { size: 22 }) + '</button>';
    }
    let title = opts.title && !opts.brand ? '<div class="h-title">' + esc(opts.title) + '</div>' : '';
    let right = opts.right || '';
    return '<div class="header' + (opts.bordered ? ' bordered' : '') + '">' + left + title + '<div class="spacer"></div>' + right + '</div>';
  }
  function bellBtn() {
    const c = S.unreadCount();
    return '<button class="icon-btn plain" data-go="notifications" style="position:relative">' + icon('bell', { size: 22 }) +
      (c ? '<span class="badge-dot">' + c + '</span>' : '') + '</button>';
  }

  /* ---------- router ---------- */
  let history = [{ name: 'home', params: {} }];
  MVP.app.ui = {};
  const tabRoot = { home: 'home', map: 'map', favorites: 'favorites', admin: 'admin', profile: 'profile' };
  const tabOf = (name) => {
    if (['club', 'room', 'booking'].includes(name)) return 'home';
    if (['adminClub', 'adminRoom', 'adminReviews'].includes(name)) return 'admin';
    if (['discounts', 'history', 'referral', 'support', 'notifications', 'settings', 'clubRegister'].includes(name)) return 'profile';
    return tabRoot[name] ? name : 'home';
  };
  function current() { return history[history.length - 1]; }
  function go(name, params) {
    history.push({ name, params: params || {} });
    MVP.app.ui = {};
    render();
    screenEl().scrollTop = 0;
  }
  function back() {
    if (history.length > 1) history.pop();
    MVP.app.ui = {};
    render();
  }
  function selectTab(tab) {
    let root = tab;
    if (tab === 'third') root = S.isAdmin() ? 'admin' : 'favorites';
    history = [{ name: root, params: {} }];
    MVP.app.ui = {};
    render();
    screenEl().scrollTop = 0;
  }
  MVP.app.go = go; MVP.app.back = back; MVP.app.rerender = () => render();
  MVP.app.toast = toast; MVP.app.openSheet = openSheet; MVP.app.closeSheet = closeSheet;
  MVP.app.dialog = dialog; MVP.app.header = header; MVP.app.pic = pic; MVP.app.avatar = avatar;
  MVP.app.fmt = fmt; MVP.app.starsRow = starsRow; MVP.app.esc = esc; MVP.app.attr = attr;
  MVP.app.gameChip = gameChip; MVP.app.bellBtn = bellBtn; MVP.app.icon = icon;
  MVP.app.renderers = {}; MVP.app.mounts = {}; MVP.app.actions = {};

  /* ---------- bottom nav ---------- */
  function renderNav(activeTab) {
    const admin = S.isAdmin();
    const items = [
      { tab: 'home', icon: 'home', label: t('tab_home') },
      { tab: 'map', icon: 'map', label: t('tab_map') },
      admin
        ? { tab: 'third', icon: 'gear', label: t('tab_admin'), active: activeTab === 'admin' }
        : { tab: 'third', icon: 'heart', label: t('tab_favorites'), active: activeTab === 'favorites' },
      { tab: 'profile', icon: 'user', label: t('tab_profile') },
    ];
    const nav = byId('bottom-nav');
    nav.innerHTML = items
      .map((it) => {
        const on = it.active != null ? it.active : activeTab === it.tab;
        return '<button class="nav-item' + (on ? ' active' : '') + '" data-tab="' + it.tab + '">' +
          icon(it.icon, { size: 24 }) + '<span>' + it.label + '</span></button>';
      })
      .join('');
  }

  /* ---------- render ---------- */
  let timers = [];
  function clearTimers() { timers.forEach((tm) => clearInterval(tm)); timers = []; }
  MVP.app.addTimer = (tm) => timers.push(tm);
  function render() {
    clearTimers();
    const route = current();
    const r = MVP.app.renderers[route.name] || MVP.app.renderers.home;
    screenEl().innerHTML = r(route.params || {});
    renderNav(tabOf(route.name));
    const m = MVP.app.mounts[route.name];
    if (m) m(route.params || {});
  }

  /* ============================================================
     CUSTOMER SCREENS
     ============================================================ */

  /* ---- Home ---- */
  MVP.app.renderers.home = function () {
    const clubs = S.visibleClubs();
    const popular = clubs.slice().sort((a, b) => b.rating - a.rating);
    const nearby = clubs.slice().sort((a, b) => a.distanceKm - b.distanceKm);
    const promos = S.getPromos();

    const heroSlides = promos
      .map((p, i) =>
        '<div class="hero-slide" data-i="' + i + '" style="' + (i ? 'display:none' : '') + '">' +
        pic(null, { seed: 'promo-' + p.id, palette: p.palette, kind: 'scene' }) +
        '<div class="hero-body"><h3>' + esc(i === 0 ? t('home_promo_title') : p.title) + '</h3>' +
        '<p>' + esc(i === 0 ? t('home_promo_sub') : p.subtitle) + '</p>' +
        '<button class="btn btn-primary btn-sm" data-action="usePromo" data-code="' + esc(p.code) + '">' + t('home_promo_btn') + '</button>' +
        '</div></div>'
      )
      .join('');

    const promoCards = promos
      .map(
        (p) =>
          '<button class="promo-card" data-action="usePromo" data-code="' + esc(p.code) + '">' +
          pic(null, { seed: 'pc-' + p.id, palette: p.palette }) +
          '<span class="pc-tag">−' + p.discount + '%</span>' +
          '<div class="pc-body"><h4>' + esc(p.title) + '</h4><p>' + esc(p.subtitle) + '</p></div></button>'
      )
      .join('');

    return (
      header({
        brand: true,
        right: '<button class="icon-btn plain" data-action="openSearch">' + icon('search', { size: 22 }) + '</button>' + bellBtn(),
      }) +
      '<div class="screen">' +
      '<div class="hero" id="hero">' + heroSlides + '</div>' +
      '<div class="dots" id="hero-dots">' + promos.map((p, i) => '<i class="' + (i === 0 ? 'on' : '') + '"></i>').join('') + '</div>' +
      section(t('home_promotions'), '<div class="hrow">' + promoCards + '</div>', null) +
      section(t('home_popular'), '<div class="hrow">' + popular.map((c) => clubCardMedium(c)).join('') + '</div>') +
      '<div class="section"><div class="section-head"><h2>' + t('home_nearby') + '</h2></div><div class="pad">' +
      nearby.map((c) => clubCard(c)).join('') + '</div></div>' +
      '</div>'
    );
  };
  MVP.app.mounts.home = function () {
    const slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    const dots = Array.prototype.slice.call(document.querySelectorAll('#hero-dots i'));
    if (slides.length < 2) return;
    let i = 0;
    MVP.app.addTimer(
      setInterval(() => {
        slides[i].style.display = 'none';
        dots[i].classList.remove('on');
        i = (i + 1) % slides.length;
        slides[i].style.display = '';
        dots[i].classList.add('on');
      }, 3500)
    );
  };

  function section(title, body, link) {
    const head =
      '<div class="section-head"><h2>' + esc(title) + '</h2>' +
      (link === null ? '' : '<a class="link"' + (link && link.go ? ' data-go="' + link.go + '"' : '') + '>' + (link ? esc(link.label) : t('seeAll')) + ' ' + icon('chevR', { size: 14 }) + '</a>') +
      '</div>';
    return '<div class="section">' + head + body + '</div>';
  }

  function clubCard(c) {
    const fav = S.isFavorite(c.id);
    return (
      '<div class="card club-card mb12" data-go="club"' + attr({ id: c.id }) + '>' +
      '<div class="cc-media">' + pic(c.gallery[0], { seed: 'club-' + c.id }) +
      '<span class="status-pill ' + (c.online ? 'on' : 'off') + '"><span class="dot"></span>' + (c.online ? t('online') : t('offline')) + '</span>' +
      '<button class="fav-btn ' + (fav ? 'on' : '') + '" data-action="favToggle" data-id="' + c.id + '">' + icon(fav ? 'heartFill' : 'heart', { size: 20 }) + '</button>' +
      '</div>' +
      '<div class="cc-body"><div class="cc-title-row"><h3>' + esc(c.name) + '</h3>' +
      '<span class="rating">' + icon('starFill', { size: 14 }) + c.rating.toFixed(1) + '</span></div>' +
      '<div class="cc-meta"><span class="m">' + icon('location', { size: 14 }) + esc(c.address) + '</span>' +
      '<span class="m">' + c.distanceKm + ' ' + t('km') + '</span></div>' +
      '<div class="cc-price">' + priceFrom(S.clubPriceFrom(c)) + '</div></div></div>'
    );
  }
  function clubCardMedium(c) {
    const fav = S.isFavorite(c.id);
    return (
      '<div class="card club-card" style="width:250px;flex:none" data-go="club"' + attr({ id: c.id }) + '>' +
      '<div class="cc-media">' + pic(c.gallery[0], { seed: 'club-' + c.id }) +
      '<button class="fav-btn ' + (fav ? 'on' : '') + '" data-action="favToggle" data-id="' + c.id + '">' + icon(fav ? 'heartFill' : 'heart', { size: 18 }) + '</button>' +
      '<span class="status-pill ' + (c.online ? 'on' : 'off') + '"><span class="dot"></span>' + (c.online ? t('open') : t('closed')) + '</span></div>' +
      '<div class="cc-body"><div class="cc-title-row"><h3 style="font-size:14.5px">' + esc(c.name) + '</h3>' +
      '<span class="rating">' + icon('starFill', { size: 13 }) + c.rating.toFixed(1) + '</span></div>' +
      '<div class="cc-price" style="margin-top:6px">' + priceFrom(S.clubPriceFrom(c)) + '</div></div></div>'
    );
  }

  /* ---- Club detail ---- */
  MVP.app.renderers.club = function (p) {
    const c = S.getClub(p.id);
    if (!c) return notFound();
    const ui = MVP.app.ui;
    const tab = ui.clubTab || 'specs';
    const gi = ui.gi || 0;
    const fav = S.isFavorite(c.id);

    const gallery =
      '<div class="pad" style="padding-top:12px"><div class="gallery-main">' + pic(c.gallery[gi], { seed: 'club-' + c.id + '-' + gi }) +
      '<button class="btn-back" data-back style="position:absolute;top:12px;left:12px;background:rgba(10,11,15,.55);backdrop-filter:blur(6px)">' + icon('back', { size: 22 }) + '</button>' +
      '<div style="position:absolute;top:12px;right:12px;display:flex;gap:8px">' +
      '<button class="fav-btn" style="position:static" data-action="shareClub" data-id="' + c.id + '">' + icon('share', { size: 18 }) + '</button>' +
      '<button class="fav-btn ' + (fav ? 'on' : '') + '" style="position:static" data-action="favToggle" data-id="' + c.id + '">' + icon(fav ? 'heartFill' : 'heart', { size: 18 }) + '</button>' +
      '</div></div>' +
      '<div class="gal-thumbs">' + c.gallery.map((g, i) => '<button class="th ' + (i === gi ? 'on' : '') + '" data-action="setGallery" data-i="' + i + '">' + pic(g, { seed: 'club-' + c.id + '-' + i }) + '</button>').join('') + '</div></div>';

    const titleBlock =
      '<div class="pad mt16"><div class="cc-title-row"><h3 style="font-size:20px">' + esc(c.name) + '</h3>' +
      '<span class="rating" style="font-size:15px">' + icon('starFill', { size: 16 }) + c.rating.toFixed(1) + '</span></div>' +
      '<div class="cc-meta mt8"><span class="m">' + icon('location', { size: 14 }) + esc(c.address) + '</span>' +
      '<span class="m">' + icon('clock', { size: 14 }) + esc(c.hours) + '</span></div>' +
      '<div class="cc-meta mt8"><span class="m">' + (c.online ? '<span class="tag green">' + t('online') + '</span>' : '<span class="tag" style="background:var(--surface-3);color:var(--text-3)">' + t('offline') + '</span>') + '</span>' +
      '<span class="muted-3 fz13">' + c.reviewsCount + ' ' + t('reviews_count') + '</span></div></div>';

    const tabs =
      '<div class="tabs mt16">' +
      '<button class="tab ' + (tab === 'specs' ? 'active' : '') + '" data-action="clubTab" data-tab="specs">' + t('club_specs') + '</button>' +
      '<button class="tab ' + (tab === 'reviews' ? 'active' : '') + '" data-action="clubTab" data-tab="reviews">' + t('club_reviews') + '</button>' +
      '</div>';

    let body;
    if (tab === 'reviews') body = reviewsBlock(c);
    else {
      const s = c.specsHighlight;
      const specRow =
        '<div class="pad mt16"><div class="spec-grid">' +
        specCell('cpu', t('spec_cpu'), s.cpu) + specCell('gpu', t('spec_gpu'), s.gpu) +
        specCell('ram', t('spec_ram'), s.ram) + specCell('monitor', t('spec_monitor'), s.monitor) +
        '</div></div>';
      const rooms =
        section(
          t('club_rooms'),
          '<div class="pad"><div class="room-cards">' + c.rooms.map((r) => roomCard(c, r)).join('') + '</div></div>',
          null
        );
      const about =
        '<div class="section"><div class="section-head"><h2>' + t('club_about') + '</h2></div><div class="pad"><p class="muted fz13" style="line-height:1.55">' + esc(c.description) + '</p></div></div>';
      body = specRow + rooms + about;
    }

    return (
      '<div class="screen has-cta">' + gallery + titleBlock + tabs + body + '</div>' +
      '<div class="cta-bar"><button class="btn btn-primary btn-lg btn-block btn-uppercase" data-go="booking"' + attr({ clubId: c.id }) + '>' + t('club_book') + '</button></div>'
    );
  };

  function specCell(ic, lbl, v) {
    return '<div class="spec-cell">' + icon(ic, { size: 22 }) + '<div class="lbl">' + esc(lbl) + '</div><div class="val">' + esc(v) + '</div></div>';
  }
  function roomCard(c, r) {
    return (
      '<button class="room-card" data-go="room"' + attr({ clubId: c.id, roomId: r.id }) + '>' +
      '<div class="rc-img">' + pic(r.gallery[0], { seed: 'room-' + r.id }) +
      '<span class="room-type-badge rt-' + r.type + '">' + roomTypeLabel(r.type) + '</span></div>' +
      '<div class="rc-body"><div class="rc-name">' + esc(r.name) + '</div>' +
      '<div class="rc-type">' + r.seats + ' ' + (S.getLang() === 'en' ? 'seats' : S.getLang() === 'uz' ? 'joy' : 'мест') + '</div>' +
      '<div class="rc-price">' + fmt(r.price) + '</div></div></button>'
    );
  }
  function reviewsBlock(c) {
    const list = c.reviews.length
      ? '<div class="card" style="margin:0 16px">' + c.reviews.map((rv) => reviewItem(rv)).join('') + '</div>'
      : '<div class="empty"><div class="e-ico">' + icon('chat', { size: 30 }) + '</div><h3>' + t('no_reviews') + '</h3></div>';
    return (
      '<div class="mt16">' + list +
      '<div class="pad mt16"><button class="btn btn-ghost btn-block" data-action="openReview" data-id="' + c.id + '">' + icon('edit', { size: 18 }) + ' ' + t('write_review') + '</button></div></div>'
    );
  }
  function reviewItem(rv) {
    return (
      '<div class="review"><div class="rv-head">' + '<img src="' + art.avatar(rv.author, { size: 76 }) + '">' +
      '<div><div class="rv-name">' + esc(rv.author) + '</div><div class="rv-date">' + esc(rv.date) + '</div></div>' +
      starsRow(rv.rating) + '</div>' +
      '<div class="rv-text">' + esc(rv.text) + '</div>' +
      (rv.reply ? '<div class="rv-reply"><div class="rr-label">' + esc(t('appName')) + '</div><p>' + esc(rv.reply) + '</p></div>' : '') +
      '</div>'
    );
  }

  /* ---- Room detail ---- */
  MVP.app.renderers.room = function (p) {
    const c = S.getClub(p.clubId);
    const r = S.getRoom(p.clubId, p.roomId);
    if (!c || !r) return notFound();
    const ui = MVP.app.ui;
    const gi = ui.gi || 0;
    const s = r.specs;
    return (
      header({ back: true, title: r.name + ' · ' + c.name, bordered: true }) +
      '<div class="screen has-cta"><div class="pad" style="padding-top:12px">' +
      '<div class="gallery-main">' + pic(r.gallery[gi], { seed: 'room-' + r.id + '-' + gi }) +
      '<span class="room-type-badge rt-' + r.type + '" style="top:12px;left:12px;font-size:11px">' + roomTypeLabel(r.type) + '</span></div>' +
      '<div class="gal-thumbs">' + r.gallery.map((g, i) => '<button class="th ' + (i === gi ? 'on' : '') + '" data-action="setGallery" data-i="' + i + '">' + pic(g, { seed: 'room-' + r.id + '-' + i }) + '</button>').join('') + '</div>' +
      '<div class="mt16"><div class="muted fz13">' + t('room_price') + '</div><div style="font-size:24px;font-weight:800;margin-top:2px">' + fmt(r.price) + ' <span style="font-size:14px;font-weight:600;color:var(--text-2)">' + t('perHour') + '</span></div></div>' +
      (r.description ? '<p class="muted fz13 mt12" style="line-height:1.55">' + esc(r.description) + '</p>' : '') +
      '</div>' +
      section(t('club_specs'),
        '<div class="pad"><div class="spec-list">' +
        slRow('cpu', t('spec_cpu'), s.cpu) + slRow('gpu', t('spec_gpu'), s.gpu) + slRow('ram', t('spec_ram'), s.ram) +
        slRow('monitor', t('spec_monitor'), s.monitor) + (s.periph ? slRow('gamepad', t('spec_periph'), s.periph) : '') +
        '</div></div>', null) +
      section(t('room_games'), '<div class="pad"><div class="chips">' + r.games.map((g) => gameChip(g)).join('') + '</div></div>', null) +
      section(t('room_gallery'), '<div class="pad"><div class="media-grid">' + r.gallery.concat(r.gallery.slice(0, 2)).slice(0, 6).map((g, i) => '<div class="m">' + pic(g, { seed: 'rmedia-' + r.id + '-' + i }) + '</div>').join('') + '</div></div>', null) +
      '</div>' +
      '<div class="cta-bar"><button class="btn btn-primary btn-lg btn-block btn-uppercase" data-go="booking"' + attr({ clubId: c.id, roomId: r.id }) + '>' + t('club_book') + '</button></div>'
    );
  };
  function slRow(ic, lbl, v) {
    return '<div class="sl-row">' + icon(ic, { size: 20 }) + '<span class="lbl">' + esc(lbl) + '</span><span class="val">' + esc(v) + '</span></div>';
  }

  /* ---- Booking ---- */
  MVP.app.renderers.booking = function (p) {
    const c = S.getClub(p.clubId);
    if (!c) return notFound();
    const ui = MVP.app.ui;
    if (!ui.roomId) ui.roomId = p.roomId || (c.rooms[0] && c.rooms[0].id);
    if (ui.dateIdx == null) ui.dateIdx = 0;
    if (!ui.time) ui.time = '18:00';
    if (!ui.duration) ui.duration = 2;
    const room = c.rooms.find((r) => r.id === ui.roomId) || c.rooms[0];

    const dates = [];
    const today = new Date(2026, 5, 2);
    for (let i = 0; i < 14; i++) {
      const d = new Date(today.getTime() + i * 86400000);
      dates.push(d);
    }
    const dateRow = dates
      .map((d, i) => '<button class="date-cell ' + (i === ui.dateIdx ? 'active' : '') + '" data-action="setDate" data-i="' + i + '"><div class="dw">' + weekday(d) + '</div><div class="dd">' + d.getDate() + '</div></button>')
      .join('');

    const times = [];
    for (let h = 10; h <= 23; h++) times.push((h < 10 ? '0' : '') + h + ':00');
    const timeGrid = times.map((tm) => '<button class="time-cell ' + (tm === ui.time ? 'active' : '') + '" data-action="setTime" data-t="' + tm + '">' + tm + '</button>').join('');

    const durs = [1, 2, 3, 4, 5, 6, 8, 10, 12];
    const durGrid = durs.map((n) => '<button class="time-cell ' + (n === ui.duration ? 'active' : '') + '" data-action="setDuration" data-n="' + n + '">' + n + ' ' + t('hours') + '</button>').join('');

    const subtotal = room.price * ui.duration;
    let discount = 0;
    if (ui.promo) discount = Math.round((subtotal * ui.promo.discount) / 100);
    const total = subtotal - discount;

    return (
      header({ back: true, title: t('booking_title'), bordered: true }) +
      '<div class="screen has-cta">' +
      '<div class="pad mt16"><div class="card club-row"><div class="cr-img">' + pic(c.gallery[0], { seed: 'club-' + c.id }) + '</div>' +
      '<div class="cr-body"><h3>' + esc(c.name) + '</h3><div class="cc-meta"><span class="m">' + icon('location', { size: 13 }) + esc(c.address) + '</span></div></div>' +
      '<span class="rating">' + icon('starFill', { size: 14 }) + c.rating.toFixed(1) + '</span></div></div>' +

      blockTitle(t('booking_pick_room')) +
      '<div class="pad"><div class="room-cards">' + c.rooms.map((r) => '<button class="room-card ' + (r.id === ui.roomId ? 'selected' : '') + '" data-action="setRoom" data-id="' + r.id + '"><div class="rc-img">' + pic(r.gallery[0], { seed: 'room-' + r.id }) + '<span class="room-type-badge rt-' + r.type + '">' + roomTypeLabel(r.type) + '</span></div><div class="rc-body"><div class="rc-name">' + esc(r.name) + '</div><div class="rc-price">' + fmt(r.price) + '</div></div></button>').join('') + '</div></div>' +

      blockTitle(t('booking_pick_date')) +
      '<div class="pad"><div class="date-row">' + dateRow + '</div></div>' +

      blockTitle(t('booking_pick_time')) +
      '<div class="pad"><div class="time-grid">' + timeGrid + '</div></div>' +

      blockTitle(t('booking_duration')) +
      '<div class="pad"><div class="time-grid">' + durGrid + '</div></div>' +

      blockTitle(t('booking_promo')) +
      '<div class="pad"><div class="input-with-btn"><input class="input" id="promo-inp" placeholder="' + t('booking_promo_ph') + '" value="' + (ui.promo ? esc(ui.promo.code) : '') + '">' +
      '<button class="btn btn-ghost" data-action="applyPromo">' + t('booking_apply') + '</button></div>' +
      (ui.promo ? '<div class="tag green mt8">' + icon('check', { size: 14 }) + ' ' + t('promo_applied') + ' · −' + ui.promo.discount + '%</div>' : '') + '</div>' +

      '<div class="pad mt20"><div class="card card-pad">' +
      '<div class="row" style="justify-content:space-between"><span class="muted">' + t('booking_subtotal') + '</span><span>' + fmt(subtotal) + ' ' + t('perHour').split('/')[0] + '</span></div>' +
      (discount ? '<div class="row mt8" style="justify-content:space-between"><span class="muted">' + t('booking_discount') + '</span><span style="color:var(--green)">−' + fmt(discount) + '</span></div>' : '') +
      '<div class="divider"></div>' +
      '<div class="row" style="justify-content:space-between"><span class="fw700">' + t('booking_total') + '</span><span style="font-size:20px;font-weight:800">' + fmt(total) + '</span></div></div></div>' +
      '</div>' +
      '<div class="cta-bar"><button class="btn btn-primary btn-lg btn-block btn-uppercase" data-action="confirmBooking"' + attr({ clubId: c.id }) + '>' + t('booking_pay') + '</button></div>'
    );
  };
  function blockTitle(txt) {
    return '<div class="section-head" style="margin-top:22px;margin-bottom:10px"><h2 style="font-size:15px">' + esc(txt) + '</h2></div>';
  }

  /* ---- Map ---- */
  MVP.app.renderers.map = function () {
    const clubs = S.visibleClubs();
    const ui = MVP.app.ui;
    const sel = ui.mapSel || clubs[0].id;
    const bbox = { latMin: 41.285, latMax: 41.34, lngMin: 69.21, lngMax: 69.30 };
    const pins = clubs
      .map((c) => {
        const x = ((c.lng - bbox.lngMin) / (bbox.lngMax - bbox.lngMin)) * 100;
        const y = (1 - (c.lat - bbox.latMin) / (bbox.latMax - bbox.latMin)) * 100;
        return '<button class="map-pin ' + (c.id === sel ? 'active' : '') + '" style="left:' + Math.max(8, Math.min(92, x)) + '%;top:' + Math.max(12, Math.min(86, y)) + '%" data-action="mapSelect" data-id="' + c.id + '">' +
          '<span class="mp-dot">' + icon('gamepad', { size: 15 }) + '</span></button>';
      })
      .join('');
    return (
      header({ title: t('map_title'), right: bellBtn(), bordered: true }) +
      '<div class="screen"><div class="pad mt12">' +
      '<div class="map-wrap"><div class="map-canvas">' + mapBg() + '</div>' +
      '<div class="map-logo"><span class="logo-mark" style="display:grid;place-items:center;background:linear-gradient(135deg,var(--red),var(--red-2))">' + icon('logo', { size: 16 }) + '</span><b style="font-size:13px">MVP Gaming</b></div>' +
      pins + '</div></div>' +
      '<div class="section"><div class="section-head"><h2>' + t('map_list') + '</h2><span class="muted-3 fz13">' + clubs.length + '</span></div><div class="pad">' +
      clubs.map((c) => '<div class="card club-row mb12 ' + (c.id === sel ? '' : '') + '" data-go="club"' + attr({ id: c.id }) + ' style="' + (c.id === sel ? 'border-color:var(--red)' : '') + '"><div class="cr-img">' + pic(c.gallery[0], { seed: 'club-' + c.id }) + '</div><div class="cr-body"><h3>' + esc(c.name) + '</h3><div class="cc-meta"><span class="rating" style="font-size:12px">' + icon('starFill', { size: 12 }) + c.rating.toFixed(1) + '</span><span class="m">' + c.distanceKm + ' ' + t('km') + '</span></div><div class="cc-price" style="margin-top:6px">' + priceFrom(S.clubPriceFrom(c)) + '</div></div>' + icon('chevR', { size: 18, cls: 'muted-3' }) + '</div>').join('') +
      '</div></div></div>'
    );
  };
  function mapBg() {
    let roads = '';
    for (let i = 1; i < 7; i++) roads += '<line x1="0" y1="' + i * 50 + '" x2="400" y2="' + (i * 50 - 30) + '" stroke="#1b2230" stroke-width="6"/>';
    for (let i = 1; i < 6; i++) roads += '<line x1="' + i * 70 + '" y1="0" x2="' + (i * 70 - 20) + '" y2="340" stroke="#161c28" stroke-width="5"/>';
    let blocks = '';
    for (let i = 0; i < 22; i++) {
      const x = (i * 53) % 380, y = (i * 71) % 300;
      blocks += '<rect x="' + x + '" y="' + y + '" width="34" height="26" rx="4" fill="#11161f"/>';
    }
    return '<svg viewBox="0 0 400 340" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%"><rect width="400" height="340" fill="#0c111a"/>' + blocks + roads + '<circle cx="200" cy="170" r="120" fill="rgba(229,51,58,0.05)"/></svg>';
  }

  /* ---- Favorites ---- */
  MVP.app.renderers.favorites = function () {
    const favs = S.favoriteClubs();
    const body = favs.length
      ? '<div class="pad mt12">' + favs.map((c) => clubCard(c)).join('') + '</div>'
      : '<div class="empty"><div class="e-ico">' + icon('heart', { size: 32 }) + '</div><h3>' + t('fav_empty') + '</h3><p>' + t('fav_empty_sub') + '</p><button class="btn btn-primary mt16" data-tab="home">' + t('home_popular') + '</button></div>';
    return header({ title: t('fav_title'), bordered: true }) + '<div class="screen">' + body + '</div>';
  };

  /* ---- Profile (+ auth) ---- */
  MVP.app.renderers.profile = function () {
    const u = S.currentUser();
    if (!u) return profileGuest();
    if (u.role === 'admin') return profileAdmin(u);
    return profileUser(u);
  };

  function profileGuest() {
    const ui = MVP.app.ui;
    const mode = ui.authMode || 'login';
    const form =
      mode === 'login'
        ? '<div class="field"><label>' + t('auth_phone') + '</label><input class="input" id="lg-phone" inputmode="tel" placeholder="' + t('auth_phone_ph') + '"></div>' +
          '<div class="field"><label>' + t('auth_password') + '</label><input class="input" id="lg-pass" type="password" placeholder="••••"></div>' +
          '<button class="btn btn-primary btn-block btn-lg mt20" data-action="doLogin">' + t('auth_login') + '</button>'
        : '<div class="field"><label>' + t('auth_name') + '</label><input class="input" id="rg-name" placeholder="' + t('auth_name_ph') + '"></div>' +
          '<div class="field"><label>' + t('auth_phone') + '</label><input class="input" id="rg-phone" inputmode="tel" placeholder="' + t('auth_phone_ph') + '"></div>' +
          '<div class="field"><label>' + t('auth_password') + '</label><input class="input" id="rg-pass" type="password" placeholder="••••"></div>' +
          '<button class="btn btn-primary btn-block btn-lg mt20" data-action="startRegister">' + t('auth_get_code') + '</button>';

    return (
      header({ title: t('tab_profile'), bordered: true }) +
      '<div class="screen"><div class="pad mt16">' +
      '<div style="text-align:center;margin-bottom:18px"><div class="logo-mark" style="width:56px;height:56px;border-radius:16px;margin:0 auto 12px;display:grid;place-items:center;background:linear-gradient(135deg,var(--red),var(--red-2))">' + icon('logo', { size: 30 }) + '</div>' +
      '<h2 style="font-size:20px;font-weight:800">MVP Gaming</h2><p class="muted fz13 mt8">' + t('profile_login_prompt') + '</p></div>' +
      '<div class="seg mb12"><button class="' + (mode === 'login' ? 'active' : '') + '" data-action="authMode" data-m="login">' + t('auth_login') + '</button>' +
      '<button class="' + (mode === 'register' ? 'active' : '') + '" data-action="authMode" data-m="register">' + t('auth_register') + '</button></div>' +
      '<div class="card card-pad">' + form + '</div>' +
      '<div class="divider"></div>' +
      '<button class="btn btn-outline btn-block" data-go="clubRegister">' + icon('gear', { size: 18 }) + ' ' + t('auth_register_club') + '</button>' +
      '<div class="note mt16">' + icon('info', { size: 15 }) + ' Демо-вход админа: телефон <b>+998 90 123 45 67</b>, пароль <b>admin</b>.</div>' +
      langQuickRow() +
      '</div></div>'
    );
  }

  function profileUser(u) {
    return (
      header({ title: t('tab_profile'), right: bellBtn(), bordered: true }) +
      '<div class="screen"><div class="profile-head"><div class="pa">' + avatar(u.name) + '</div>' +
      '<div class="pn">' + esc(u.name) + '</div>' +
      '<div class="level-badge">' + icon('starFill', { size: 14 }) + ' MVP ' + (u.level || 'GOLD') + ' · <span class="points-pill">' + fmt(u.points) + '</span> MP</div>' +
      '<div class="muted-3 fz13 mt8">' + esc(u.phone) + '</div></div>' +
      '<div class="pad mt16"><div class="menu">' +
      menuRow('gift', t('pm_discounts'), null, { go: 'discounts' }, true) +
      menuRow('clock', t('pm_history'), null, { go: 'history' }) +
      menuRow('share', t('pm_referral'), t('ref_headline'), { go: 'referral' }) +
      menuRow('chat', t('pm_support'), null, { go: 'support' }) +
      menuRow('settings', t('pm_settings'), null, { go: 'settings' }) +
      '</div>' +
      '<div class="menu mt16">' + menuRowAction('logout', t('auth_logout'), 'logout') + '</div>' +
      '</div></div>'
    );
  }

  function profileAdmin(u) {
    const club = S.getClub(u.clubId);
    return (
      header({ title: t('tab_profile'), right: bellBtn(), bordered: true }) +
      '<div class="screen"><div class="profile-head"><div class="pa">' + avatar(u.name) + '</div>' +
      '<div class="pn">' + esc(u.name) + '</div>' +
      '<div class="level-badge" style="color:var(--red);border-color:rgba(229,51,58,.35);background:rgba(229,51,58,.12)">' + icon('gear', { size: 14 }) + ' ' + t('clubreg_role_admin') + (club ? ' · ' + esc(club.name) : '') + '</div></div>' +
      '<div class="pad mt16"><div class="menu">' +
      '<div class="menu-row" data-action="backToPanel"><div class="mr-ico red">' + icon('gear', { size: 20 }) + '</div><div class="mr-body"><div class="mr-title">' + t('pm_admin_panel') + '</div>' + (club ? '<div class="mr-sub">' + esc(club.name) + '</div>' : '') + '</div>' + icon('chevR', { size: 18, cls: 'chev' }) + '</div>' +
      (S.state.adminViewPublic ? '' : menuRowAction('eye', t('adm_view_public'), 'viewPublic')) +
      menuRow('chat', t('pm_support'), null, { go: 'support' }) +
      menuRow('settings', t('pm_settings'), null, { go: 'settings' }) +
      '</div><div class="menu mt16">' + menuRowAction('logout', t('auth_logout'), 'logout') + '</div></div></div>'
    );
  }

  function menuRow(ic, title, sub, target, red) {
    const tg = target.go ? ' data-go="' + target.go + '"' : target.tab ? ' data-tab="' + target.tab + '"' : '';
    return '<div class="menu-row"' + tg + '><div class="mr-ico ' + (red ? 'red' : '') + '">' + icon(ic, { size: 20 }) + '</div><div class="mr-body"><div class="mr-title">' + esc(title) + '</div>' + (sub ? '<div class="mr-sub">' + esc(sub) + '</div>' : '') + '</div>' + icon('chevR', { size: 18, cls: 'chev' }) + '</div>';
  }
  function menuRowAction(ic, title, action) {
    return '<div class="menu-row" data-action="' + action + '"><div class="mr-ico">' + icon(ic, { size: 20 }) + '</div><div class="mr-body"><div class="mr-title">' + esc(title) + '</div></div>' + icon('chevR', { size: 18, cls: 'chev' }) + '</div>';
  }
  function langQuickRow() {
    return '<div class="menu mt16">' + menuRow('globe', t('pm_language'), MVP.i18n.LANGS.find((l) => l.code === S.getLang()).label, { go: 'settings' }) + '</div>';
  }

  /* ---- Club registration ---- */
  MVP.app.renderers.clubRegister = function () {
    return (
      header({ back: true, title: t('clubreg_title'), bordered: true }) +
      '<div class="screen"><div class="pad mt16">' +
      '<p class="muted fz13" style="line-height:1.55">' + t('clubreg_intro') + '</p>' +
      '<div class="card card-pad mt16">' +
      '<div class="field"><label>' + t('clubreg_name') + '</label><input class="input" id="cr-name" placeholder="GL HF Gaming Club"></div>' +
      '<div class="field"><label>' + t('clubreg_address') + '</label><input class="input" id="cr-addr" placeholder="Tashkent, ул. ..."></div>' +
      '<div class="field"><label>' + t('clubreg_phone') + '</label><input class="input" id="cr-phone" inputmode="tel" placeholder="' + t('auth_phone_ph') + '"></div>' +
      '<div class="field"><label>' + t('clubreg_role') + '</label><select class="input" id="cr-role"><option value="owner">' + t('clubreg_role_owner') + '</option><option value="admin">' + t('clubreg_role_admin') + '</option><option value="manager">' + t('clubreg_role_manager') + '</option></select></div>' +
      '<div class="field"><label>' + t('clubreg_desc') + '</label><textarea class="textarea" id="cr-desc" placeholder="..."></textarea></div>' +
      '<button class="btn btn-primary btn-block btn-lg mt20 btn-uppercase" data-action="submitClubReg">' + t('clubreg_submit') + '</button>' +
      '</div>' +
      '<button class="btn btn-ghost btn-block mt16" data-action="demoAdmin">' + icon('eye', { size: 18 }) + ' ' + t('clubreg_demo_admin') + '</button>' +
      '</div></div>'
    );
  };

  /* ---- Discounts ---- */
  MVP.app.renderers.discounts = function () {
    const promos = S.getPromos();
    return (
      header({ back: true, title: t('disc_title'), bordered: true }) +
      '<div class="screen"><div class="pad mt16">' +
      refBanner() +
      '<div class="section-head" style="padding:0;margin:22px 0 12px"><h2 style="font-size:15px">' + t('disc_active') + '</h2></div>' +
      promos.map((p) => promoBigCard(p)).join('') +
      '</div></div>'
    );
  };
  function promoBigCard(p) {
    return (
      '<div class="card mb12" style="overflow:hidden"><div style="display:flex">' +
      '<div style="width:96px;flex:none;position:relative">' + pic(null, { seed: 'pc-' + p.id, palette: p.palette }) + '<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:22px;font-weight:900;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6)">−' + p.discount + '%</div></div>' +
      '<div class="card-pad" style="flex:1"><div class="fw700">' + esc(p.title) + '</div><div class="muted fz12 mt8">' + esc(p.subtitle) + '</div>' +
      '<div class="row gap8 mt12"><div class="code-box" style="flex:1;padding:8px 12px"><span class="code" style="font-size:15px">' + esc(p.code) + '</span></div>' +
      '<button class="btn btn-primary btn-sm" data-action="copyCode" data-code="' + esc(p.code) + '">' + t('ref_copy') + '</button></div></div></div></div>'
    );
  }

  /* ---- History ---- */
  MVP.app.renderers.history = function () {
    const bks = S.getBookings();
    if (!bks.length)
      return header({ back: true, title: t('hist_title'), bordered: true }) + '<div class="screen"><div class="empty"><div class="e-ico">' + icon('clock', { size: 30 }) + '</div><h3>' + t('hist_empty') + '</h3></div></div>';
    return (
      header({ back: true, title: t('hist_title'), bordered: true }) +
      '<div class="screen"><div class="pad mt16">' +
      bks.map((b) => {
        const c = S.getClub(b.clubId); const r = S.getRoom(b.clubId, b.roomId);
        return '<div class="card card-pad mb12"><div class="row" style="justify-content:space-between"><div class="fw700">' + esc(c ? c.name : '—') + '</div><span class="tag ' + (b.status === 'upcoming' ? 'green' : 'gold') + '">' + (b.status === 'upcoming' ? t('hist_upcoming') : t('hist_past')) + '</span></div>' +
          '<div class="cc-meta mt8"><span class="m">' + icon('gamepad', { size: 14 }) + esc(r ? r.name : '') + '</span><span class="m">' + icon('calendar', { size: 14 }) + esc(b.dateLabel) + '</span><span class="m">' + icon('clock', { size: 14 }) + esc(b.time) + ' · ' + b.hours + ' ' + t('hours') + '</span></div>' +
          '<div class="divider"></div><div class="row" style="justify-content:space-between"><span class="muted fz13">' + t('booking_total') + '</span><span class="fw700">' + fmt(b.total) + ' ' + t('perHour').split('/')[0] + '</span></div></div>';
      }).join('') +
      '</div></div>'
    );
  };

  /* ---- Referral ---- */
  MVP.app.renderers.referral = function () {
    const u = S.currentUser();
    const code = (u && u.referralCode) || 'MVP2026';
    return (
      header({ back: true, title: t('ref_title'), bordered: true }) +
      '<div class="screen"><div class="pad mt16">' +
      '<div class="hero" style="aspect-ratio:1.7/1;margin:0"><img src="' + art.banner('referral', { palette: 0 }) + '"><div class="hero-body" style="max-width:85%"><h3>' + t('ref_headline') + '</h3><p>' + t('ref_desc') + '</p></div></div>' +
      '<div class="field"><label>' + t('ref_your_code') + '</label><div class="code-box"><span class="code">' + esc(code) + '</span><button class="btn btn-primary btn-sm" data-action="copyCode" data-code="' + esc(code) + '">' + icon('copy', { size: 16 }) + ' ' + t('ref_copy') + '</button></div></div>' +
      '<button class="btn btn-primary btn-block btn-lg mt20" data-action="shareApp" data-code="' + esc(code) + '">' + icon('share', { size: 18 }) + ' ' + t('ref_share') + '</button>' +
      '</div></div>'
    );
  };
  function refBanner() {
    return '<div class="hero" style="aspect-ratio:2.4/1;margin:0" data-go="referral"><img src="' + art.banner('referral', { palette: 0 }) + '"><div class="hero-body"><h3 style="font-size:16px">' + t('ref_headline') + '</h3><p>' + t('ref_desc') + '</p></div></div>';
  }

  /* ---- Support ---- */
  MVP.app.renderers.support = function () {
    const chat = S.state.chat;
    const faqs = [
      { q: { ru: 'Как забронировать место?', uz: 'Joyni qanday bron qilish mumkin?', en: 'How do I book a seat?' }, a: { ru: 'Откройте клуб, выберите комнату, дату и время, затем нажмите «Подтвердить и оплатить».', uz: 'Klubni oching, xona, sana va vaqtni tanlang, soʻng «Tasdiqlash va toʻlash»ni bosing.', en: 'Open a club, pick a room, date and time, then tap “Confirm & pay”.' } },
      { q: { ru: 'Как получить скидку?', uz: 'Chegirmani qanday olish mumkin?', en: 'How do I get a discount?' }, a: { ru: 'Используйте промокоды из раздела «Скидки» или пригласите друга и получите −20%.', uz: '«Chegirmalar» boʻlimidagi promokodlardan foydalaning yoki doʻstingizni taklif qilib −20% oling.', en: 'Use promo codes from the Discounts section or invite a friend for −20%.' } },
      { q: { ru: 'Можно ли отменить бронь?', uz: 'Bronni bekor qilsa boʻladimi?', en: 'Can I cancel a booking?' }, a: { ru: 'Да, свяжитесь с клубом не позднее чем за 2 часа до начала сессии.', uz: 'Ha, sessiya boshlanishidan kamida 2 soat oldin klub bilan bogʻlaning.', en: 'Yes, contact the club at least 2 hours before your session.' } },
    ];
    const lang = S.getLang();
    return (
      header({ back: true, title: t('sup_title'), bordered: true }) +
      '<div class="screen has-cta"><div class="chat-wrap" id="chat-wrap">' +
      '<div class="bubble in">' + esc(t('sup_bot_reply')) + '</div>' +
      chat.map((m) => '<div class="bubble ' + (m.from === 'me' ? 'out' : 'in') + '">' + esc(m.text) + '</div>').join('') +
      '</div>' +
      '<div class="section"><div class="section-head"><h2>' + t('sup_faq') + '</h2></div><div class="pad"><div class="acc">' +
      faqs.map((f, i) => '<div class="acc-item" data-action="toggleFaq" data-i="' + i + '"><div class="acc-q">' + esc(f.q[lang]) + icon('chevD', { size: 18 }) + '</div><div class="acc-a"><p>' + esc(f.a[lang]) + '</p></div></div>').join('') +
      '</div></div></div>' +
      '<div style="height:70px"></div></div>' +
      '<div class="chat-input"><input class="input" id="chat-inp" placeholder="' + t('sup_chat_ph') + '"><button class="send" data-action="sendChat">' + icon('send', { size: 20 }) + '</button></div>'
    );
  };
  MVP.app.mounts.support = function () {
    const w = byId('chat-wrap'); if (w) w.scrollTop = w.scrollHeight;
  };

  /* ---- Notifications ---- */
  MVP.app.renderers.notifications = function () {
    S.markNotificationsRead();
    const list = S.state.notifications;
    const body = list.length
      ? '<div class="pad mt12"><div class="menu">' + list.map((n) => '<div class="menu-row"><div class="mr-ico red">' + icon(n.icon || 'bell', { size: 20 }) + '</div><div class="mr-body"><div class="mr-title">' + esc(n.title) + '</div><div class="mr-sub">' + esc(n.body) + '</div></div><span class="muted-3 fz12">' + esc(n.date) + '</span></div>').join('') + '</div></div>'
      : '<div class="empty"><div class="e-ico">' + icon('bell', { size: 30 }) + '</div><h3>' + t('notif_empty') + '</h3></div>';
    return header({ back: true, title: t('notif_title'), bordered: true }) + '<div class="screen">' + body + '</div>';
  };

  /* ---- Settings ---- */
  MVP.app.renderers.settings = function () {
    const cur = S.getLang();
    return (
      header({ back: true, title: t('set_title'), bordered: true }) +
      '<div class="screen"><div class="pad mt16">' +
      '<div class="section-head" style="padding:0;margin-bottom:10px"><h2 style="font-size:14px">' + t('set_language') + '</h2></div>' +
      '<div class="menu">' + MVP.i18n.LANGS.map((l) => '<div class="lang-opt ' + (l.code === cur ? 'on' : '') + '" data-action="setLang" data-code="' + l.code + '"><span class="flag">' + l.flag + '</span><span class="fw700">' + l.label + '</span><span class="ck">' + icon('check', { size: 20 }) + '</span></div>').join('') + '</div>' +
      '</div></div>'
    );
  };

  function notFound() {
    return header({ back: true, title: '—', bordered: true }) + '<div class="screen"><div class="empty"><h3>404</h3></div></div>';
  }

  /* ============================================================
     ACTIONS
     ============================================================ */
  const A = MVP.app.actions;
  A.closeSheet = () => closeSheet();
  A.favToggle = (el) => {
    const on = S.toggleFavorite(el.dataset.id);
    toast(on ? '★ ' + t('fav_title') : t('fav_title'), on ? 'success' : '');
    render();
  };
  A.openSearch = () => openSearchSheet();
  A.usePromo = (el) => {
    const p = S.findPromo(el.dataset.code);
    if (!p) { toast(t('promo_invalid'), 'error'); return; }
    // jump to a relevant club booking with promo pre-applied
    const clubId = p.clubId || S.visibleClubs()[0].id;
    go('booking', { clubId });
    MVP.app.ui.promo = p;
    render();
    toast(t('promo_applied') + ' · −' + p.discount + '%', 'success');
  };
  A.copyCode = (el) => copyText(el.dataset.code, t('ref_copied'));
  A.shareClub = (el) => {
    const c = S.getClub(el.dataset.id);
    shareApp(c ? c.name + ' — MVP Gaming' : 'MVP Gaming');
  };
  A.shareApp = () => shareApp();

  // club detail
  A.clubTab = (el) => { MVP.app.ui.clubTab = el.dataset.tab; render(); };
  A.setGallery = (el) => { MVP.app.ui.gi = +el.dataset.i; render(); };
  A.openReview = (el) => openReviewSheet(el.dataset.id);

  // booking
  A.setRoom = (el) => { MVP.app.ui.roomId = el.dataset.id; render(); };
  A.setDate = (el) => { MVP.app.ui.dateIdx = +el.dataset.i; render(); };
  A.setTime = (el) => { MVP.app.ui.time = el.dataset.t; render(); };
  A.setDuration = (el) => { MVP.app.ui.duration = +el.dataset.n; render(); };
  A.applyPromo = () => {
    const code = val('promo-inp');
    if (!code) return;
    const p = S.findPromo(code);
    if (!p) { MVP.app.ui.promo = null; toast(t('promo_invalid'), 'error'); render(); return; }
    MVP.app.ui.promo = p; toast(t('promo_applied'), 'success'); render();
  };
  A.confirmBooking = (el) => {
    const u = S.currentUser();
    if (!u) { toast(t('booking_login_required'), 'error'); selectTab('profile'); return; }
    const c = S.getClub(el.dataset.clubId);
    const ui = MVP.app.ui;
    const room = c.rooms.find((r) => r.id === ui.roomId);
    const subtotal = room.price * ui.duration;
    const total = ui.promo ? subtotal - Math.round((subtotal * ui.promo.discount) / 100) : subtotal;
    const today = new Date(2026, 5, 2);
    const d = new Date(today.getTime() + (ui.dateIdx || 0) * 86400000);
    const dateLabel = d.getDate() + ' ' + monShort(d.getMonth());
    S.addBooking({ clubId: c.id, roomId: room.id, dateLabel, time: ui.time, hours: ui.duration, total });
    S.addNotification({ icon: 'checkCircle', title: t('booking_success'), body: c.name + ' · ' + room.name + ' · ' + dateLabel + ' ' + ui.time });
    dialog({ title: t('booking_success'), text: t('booking_success_sub'), actions: '<button class="btn btn-primary btn-block" data-action="afterBooking">' + t('pm_history') + '</button>' });
  };
  A.afterBooking = () => { closeSheet(); history = [{ name: 'profile', params: {} }]; go('history'); };

  // auth
  A.authMode = (el) => { MVP.app.ui.authMode = el.dataset.m; render(); };
  A.doLogin = () => {
    const phone = val('lg-phone'), pass = val('lg-pass');
    if (!validPhone(phone)) { toast(t('auth_invalid_phone'), 'error'); return; }
    const u = S.login(phone, pass);
    if (!u) { toast(t('auth_invalid_creds'), 'error'); return; }
    toast(t('auth_welcome'), 'success');
    selectTab(u.role === 'admin' ? 'admin' : 'home');
  };
  A.startRegister = async () => {
    const name = val('rg-name'), phone = val('rg-phone'), pass = val('rg-pass');
    if (!name) { toast(t('auth_name') + ': ' + t('required'), 'error'); return; }
    if (!validPhone(phone)) { toast(t('auth_invalid_phone'), 'error'); return; }
    if (pass.length < 4) { toast(t('auth_pass_short'), 'error'); return; }
    MVP.app._auth = { name, phone, password: pass };
    openTgSheet();
    const r = await MVP.tg.requestCode(phone);
    MVP.app._auth.token = r.token;
    MVP.app._auth.demo = r.demo;
    MVP.app._auth.demoCode = r.demoCode;
    MVP.app._auth.botLink = r.botLink;
    updateTgSheet();
  };
  A.resendCode = async () => {
    if (!MVP.app._auth) return;
    const r = await MVP.tg.requestCode(MVP.app._auth.phone);
    Object.assign(MVP.app._auth, { token: r.token, demo: r.demo, demoCode: r.demoCode, botLink: r.botLink });
    updateTgSheet();
    toast(t('tg_sent'), 'success');
  };
  A.openBot = () => { if (MVP.app._auth && MVP.app._auth.botLink) window.open(MVP.app._auth.botLink, '_blank'); };
  A.verifyTg = async () => {
    const code = collectOtp();
    const a = MVP.app._auth;
    if (!a) return;
    const r = await MVP.tg.verifyCode(a.token, code);
    if (!r.ok) { toast(t('tg_wrong_code'), 'error'); return; }
    const u = S.register({ phone: a.phone, name: a.name, password: a.password });
    closeSheet();
    toast(t('auth_welcome'), 'success');
    selectTab(u.role === 'admin' ? 'admin' : 'home');
  };
  A.logout = () => { S.logout(); selectTab('profile'); MVP.app.ui.authMode = 'login'; render(); };
  A.viewPublic = () => { S.setAdminViewPublic(true); toast(t('adm_view_public'), ''); selectTab('home'); };
  A.backToPanel = () => { S.setAdminViewPublic(false); selectTab('admin'); };
  A.demoAdmin = () => { S.login('+998 90 123 45 67', 'admin'); toast(t('auth_welcome'), 'success'); selectTab('admin'); };

  // club registration
  A.submitClubReg = () => {
    const name = val('cr-name'), addr = val('cr-addr'), phone = val('cr-phone');
    const role = byId('cr-role') ? byId('cr-role').value : 'owner';
    const desc = val('cr-desc');
    if (!name) { toast(t('clubreg_name') + ': ' + t('required'), 'error'); return; }
    if (!addr) { toast(t('clubreg_address') + ': ' + t('required'), 'error'); return; }
    if (!validPhone(phone)) { toast(t('auth_invalid_phone'), 'error'); return; }
    S.addClubRequest({ name, address: addr, phone, role, desc });
    dialog({ title: t('clubreg_success'), text: t('clubreg_success_sub'), actions: '<button class="btn btn-primary btn-block" data-action="afterClubReg">' + t('ok') + '</button>' });
  };
  A.afterClubReg = () => { closeSheet(); back(); };

  // settings / lang
  A.setLang = (el) => { S.setLang(el.dataset.code); render(); toast(MVP.i18n.LANGS.find((l) => l.code === el.dataset.code).label, 'success'); };

  // support
  A.sendChat = () => {
    const txt = val('chat-inp');
    if (!txt) return;
    S.addChat({ from: 'me', text: txt });
    render();
    setTimeout(() => {
      S.addChat({ from: 'bot', text: t('sup_bot_reply') });
      render();
    }, 700);
  };
  A.toggleFaq = (el) => { el.classList.toggle('open'); };

  // map
  A.mapSelect = (el) => { MVP.app.ui.mapSel = el.dataset.id; render(); };

  /* ---------- sheets ---------- */
  function openTgSheet() {
    const html =
      '<h3 class="sheet-title">' + t('tg_title') + '</h3>' +
      '<p class="muted fz13 mb12" style="line-height:1.5">' + t('tg_intro') + '</p>' +
      '<div id="tg-body"><div class="center muted-3" style="padding:20px">' + t('loading') + '</div></div>';
    openSheet(html);
  }
  function updateTgSheet() {
    const body = byId('tg-body');
    if (!body) return;
    const a = MVP.app._auth;
    body.innerHTML =
      '<button class="btn btn-ghost btn-block mb12" data-action="openBot">' + icon('send', { size: 18 }) + ' ' + t('tg_open_bot') + '</button>' +
      (a.demo ? '<div class="note warn mb12">' + t('tg_sim_hint') + '<div class="code-box mt8"><span class="muted fz12">' + t('tg_enter_code') + '</span><span class="code">' + a.demoCode + '</span></div></div>' : '') +
      '<label class="muted fz13" style="display:block;text-align:center;margin-bottom:10px">' + t('tg_enter_code') + '</label>' +
      '<div class="otp-box" id="otp">' +
      [0, 1, 2, 3].map((i) => '<input inputmode="numeric" maxlength="1" data-i="' + i + '">').join('') + '</div>' +
      '<button class="btn btn-primary btn-block btn-lg mt20" data-action="verifyTg">' + t('tg_verify') + '</button>' +
      '<button class="btn btn-block mt12" style="color:var(--text-2)" data-action="resendCode">' + t('tg_resend') + '</button>';
    wireOtp();
  }
  function wireOtp() {
    const inputs = Array.prototype.slice.call(document.querySelectorAll('#otp input'));
    inputs.forEach((inp, i) => {
      inp.addEventListener('input', () => {
        inp.value = inp.value.replace(/\D/g, '');
        if (inp.value && i < 3) inputs[i + 1].focus();
        if (inp.value && i === 3) { const code = collectOtp(); if (code.length === 4) A.verifyTg(); }
      });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus(); });
    });
    if (inputs[0]) inputs[0].focus();
  }
  function collectOtp() {
    return Array.prototype.slice.call(document.querySelectorAll('#otp input')).map((i) => i.value).join('');
  }

  function openReviewSheet(clubId) {
    if (!S.currentUser()) { toast(t('booking_login_required'), 'error'); selectTab('profile'); return; }
    MVP.app.ui.revRating = 5;
    const stars = [1, 2, 3, 4, 5].map((n) => '<button data-action="revStar" data-n="' + n + '" style="color:var(--gold)">' + icon('starFill', { size: 30 }) + '</button>').join('');
    openSheet(
      '<h3 class="sheet-title">' + t('write_review') + '</h3>' +
      '<div class="row gap8 mt12" id="rev-stars" style="justify-content:center">' + stars + '</div>' +
      '<div class="field"><textarea class="textarea" id="rev-text" placeholder="..."></textarea></div>' +
      '<button class="btn btn-primary btn-block btn-lg mt16" data-action="submitReview" data-id="' + clubId + '">' + t('confirm') + '</button>'
    );
  }
  A.revStar = (el) => {
    MVP.app.ui.revRating = +el.dataset.n;
    Array.prototype.slice.call(document.querySelectorAll('#rev-stars button')).forEach((b, i) => { b.style.opacity = i < MVP.app.ui.revRating ? '1' : '.3'; });
  };
  A.submitReview = (el) => {
    const text = val('rev-text');
    if (!text) { toast(t('required'), 'error'); return; }
    const u = S.currentUser();
    S.addReview(el.dataset.id, { author: u.name, rating: MVP.app.ui.revRating || 5, text });
    closeSheet();
    toast(t('ok'), 'success');
    render();
  };

  function openSearchSheet() {
    const clubs = S.visibleClubs();
    openSheet(
      '<h3 class="sheet-title">' + t('search') + '</h3>' +
      '<div class="field"><input class="input" id="srch" placeholder="' + t('home_search_ph') + '" autofocus></div>' +
      '<div id="srch-res" class="mt12">' + clubs.map((c) => searchRow(c)).join('') + '</div>',
      {
        onMount: () => {
          const inp = byId('srch');
          inp.addEventListener('input', () => {
            const q = inp.value.toLowerCase();
            const res = clubs.filter((c) => c.name.toLowerCase().includes(q) || c.rooms.some((r) => r.games.some((g) => (MVP.GAMES[g] || '').toLowerCase().includes(q))));
            byId('srch-res').innerHTML = res.length ? res.map((c) => searchRow(c)).join('') : '<div class="empty" style="padding:30px"><h3>' + t('home_no_results') + '</h3></div>';
          });
          inp.focus();
        },
      }
    );
  }
  function searchRow(c) {
    return '<div class="card club-row mb12" data-go="club"' + attr({ id: c.id }) + ' data-action="closeSheetGo"><div class="cr-img">' + pic(c.gallery[0], { seed: 'club-' + c.id }) + '</div><div class="cr-body"><h3>' + esc(c.name) + '</h3><div class="cc-meta"><span class="rating" style="font-size:12px">' + icon('starFill', { size: 12 }) + c.rating.toFixed(1) + '</span></div></div></div>';
  }
  A.closeSheetGo = (el) => { closeSheet(); go('club', { id: el.dataset.params ? JSON.parse(el.dataset.params.replace(/&#39;/g, "'")).id : el.dataset.id }); };

  /* ---------- utils ---------- */
  function validPhone(p) { return String(p || '').replace(/\D/g, '').length >= 9; }
  function copyText(text, okMsg) {
    const done = () => toast(okMsg || t('ref_copied'), 'success');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove(); done();
  }
  function shareApp(text) {
    const u = S.currentUser();
    const code = (u && u.referralCode) || 'MVP2026';
    const msg = (text || 'MVP Gaming') + ' — ' + t('ref_headline') + ' (' + code + ')';
    if (navigator.share) navigator.share({ title: 'MVP Gaming', text: msg }).catch(() => {});
    else copyText(msg, t('ref_copied'));
  }

  /* ---------- delegation ---------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action],[data-go],[data-back],[data-tab]');
    if (!el) return;
    if (el.dataset.action) {
      e.preventDefault();
      const fn = MVP.app.actions[el.dataset.action];
      if (fn) fn(el, e);
      return;
    }
    if (el.hasAttribute('data-back')) { back(); return; }
    if (el.dataset.tab) { selectTab(el.dataset.tab); return; }
    if (el.dataset.go) {
      const params = el.dataset.params ? JSON.parse(el.dataset.params.replace(/&#39;/g, "'")) : {};
      go(el.dataset.go, params);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && byId('chat-inp') === document.activeElement) A.sendChat();
  });

  MVP.app.render = render;
  MVP.app.t = t;

  /* ---------- init ---------- */
  function init() {
    S.load();
    const clock = () => {
      const d = new Date();
      const el = byId('sb-time');
      if (el) el.textContent = d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    };
    clock(); setInterval(clock, 30000);
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
