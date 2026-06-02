/* ============================================================
   MVP Gaming — Admin panel (dashboard, club editor, room editor,
   reviews management). Registers into MVP.app registry.
   ============================================================ */
(function () {
  const MVP = window.MVP;
  const S = MVP.store;
  const t = MVP.t;
  const icon = MVP.icon;
  const App = MVP.app;
  const { pic, esc, attr, fmt, header, toast, dialog, openSheet, closeSheet, avatar, starsRow } = App;
  const R = App.renderers;
  const A = App.actions;
  const render = () => App.render();
  const go = App.go;
  const val = (id) => (document.getElementById(id) ? document.getElementById(id).value.trim() : '');

  function guard() {
    const club = S.adminClub();
    if (!club) {
      App.go('home');
      return null;
    }
    return club;
  }

  /* ---------- charts ---------- */
  function areaChart(data, color) {
    color = color || 'var(--red)';
    const W = 320, H = 120, pad = 6;
    const max = Math.max.apply(null, data) * 1.1 || 1;
    const min = Math.min.apply(null, data) * 0.85;
    const span = max - min || 1;
    const step = (W - pad * 2) / (data.length - 1);
    const pts = data.map((v, i) => [pad + i * step, H - pad - ((v - min) / span) * (H - pad * 2)]);
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const area = 'M' + pts[0][0] + ' ' + H + ' L' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ' L' + pts[pts.length - 1][0] + ' ' + H + ' Z';
    const last = pts[pts.length - 1];
    return (
      '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
      '<defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + color + '" stop-opacity="0.45"/><stop offset="100%" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#cg)"/>' +
      '<path d="' + line + '" fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="4" fill="' + color + '" stroke="#fff" stroke-width="1.5"/>' +
      '</svg>'
    );
  }
  function chartLabels() {
    const lang = S.getLang();
    const MON = { ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'], uz: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun'], en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] };
    return (MON[lang] || MON.ru).map((m) => '<span>' + m + '</span>').join('');
  }

  /* ============================================================
     DASHBOARD
     ============================================================ */
  R.admin = function () {
    const club = S.adminClub();
    if (!club) return App.renderers.home();
    const st = club.stats;
    const interest = club.stats.roomInterest;
    const maxInt = Math.max.apply(null, Object.values(interest)) || 1;
    const intColors = ['var(--blue)', 'var(--gold)', 'var(--violet)', 'var(--green)'];

    return (
      '<div class="header bordered"><div class="brand"><div class="logo-mark">' + icon('logo', { size: 20 }) + '</div>' +
      '<div><div class="b-name" style="font-size:15px">' + t('adm_dashboard') + '</div><div class="loc-row" style="color:var(--text-2)">' + esc(club.name) + '</div></div></div>' +
      '<div class="spacer"></div>' + App.bellBtn() + '</div>' +
      '<div class="screen"><div class="pad mt16">' +

      // big stat
      '<div class="stat-card"><div class="sc-top"><span class="sc-label">' + t('adm_card_views') + '</span><span class="trend up">' + icon('trend', { size: 13 }) + ' +' + st.cardViewsTrend + '%</span></div>' +
      '<div class="sc-val">' + fmt(st.cardViews) + '</div><div class="sc-sub">' + t('adm_month_may') + '</div></div>' +

      // chart
      '<div class="chart-card mt12"><div class="row" style="justify-content:space-between"><div><div class="fw700">' + t('adm_analytics') + '</div><div class="muted-3 fz12">' + t('adm_attendance') + '</div></div><span class="tag" style="background:var(--surface-2);color:var(--text-2)">' + t('adm_month_may') + '</span></div>' +
      '<div class="mt12">' + areaChart(st.attendance) + '</div><div class="chart-x">' + chartLabels() + '</div></div>' +

      // mini stats
      '<div class="stat-3 mt12">' +
      miniStat(fmt(st.uniqueVisitors), t('adm_unique_visitors'), 'var(--green)', 1) +
      miniStat(st.avgTimeH.toString().replace('.', ',') + ' ' + t('hours'), t('adm_avg_time'), 'var(--blue)', 0.7) +
      miniStat(st.conversion.toString().replace('.', ',') + '%', t('adm_conversion'), 'var(--red)', st.conversion / 25) +
      '</div>' +

      // room interest
      '<div class="card card-pad mt12"><div class="fw700 mb12">' + t('adm_room_interest') + '</div>' +
      Object.keys(interest).map((k, i) => {
        const pct = Math.round((interest[k] / maxInt) * 100);
        return '<div class="mt12"><div class="row" style="justify-content:space-between"><span class="fz13">' + esc(k) + '</span><span class="fw700 fz13">' + interest[k] + '</span></div>' +
          '<div style="height:8px;border-radius:8px;background:var(--surface-2);margin-top:6px;overflow:hidden"><div style="height:100%;width:' + pct + '%;border-radius:8px;background:' + intColors[i % intColors.length] + '"></div></div></div>';
      }).join('') + '</div>' +

      // total bookings
      '<div class="stat-card mt12" data-go="history"><div class="sc-top"><span class="sc-label">' + t('adm_total_bookings') + '</span>' + icon('chevR', { size: 18, cls: 'muted-3' }) + '</div><div class="sc-val">' + fmt(st.totalBookings) + '</div><div class="sc-sub">' + t('adm_month_may') + ' · <span style="color:var(--green)">+' + st.bookingsTrend + '%</span></div></div>' +

      // status
      '<div class="card card-pad mt12"><div class="row" style="justify-content:space-between;margin-bottom:12px"><span class="fw700">' + t('adm_status') + '</span></div>' +
      '<div class="big-status ' + (club.online ? 'on' : 'off') + '">' + icon(club.online ? 'wifi' : 'x', { size: 22 }) + ' ' + (club.online ? t('online') : t('offline')) + '</div>' +
      '<div class="row gap12 mt12"><button class="btn ' + (club.online ? 'btn-outline' : 'btn-primary') + ' btn-block" data-action="admToggleOnline">' + (club.online ? t('adm_set_offline') : t('adm_set_online')) + '</button>' +
      '<button class="btn ' + (club.hidden ? 'btn-primary' : 'btn-ghost') + ' btn-block" data-action="admToggleHidden">' + (club.hidden ? t('open') : t('adm_hide_club')) + '</button></div></div>' +

      // quick actions
      '<div class="menu mt16">' +
      qrow('edit', t('adm_edit_club'), { go: 'adminClub' }) +
      qrow('chat', t('adm_manage_reviews'), { go: 'adminReviews' }) +
      qrowAction('eye', t('adm_view_public'), 'viewPublic') +
      '</div>' +

      // recent notifications
      '<div class="section"><div class="section-head" style="padding:0;margin:22px 0 12px"><h2 style="font-size:15px">' + t('adm_recent_notif') + '</h2></div>' +
      '<div class="menu">' + S.state.notifications.slice(0, 3).map((n) => '<div class="menu-row"><div class="mr-ico red">' + icon(n.icon || 'bell', { size: 18 }) + '</div><div class="mr-body"><div class="mr-title" style="font-size:13.5px">' + esc(n.title) + '</div><div class="mr-sub">' + esc(n.body) + '</div></div><span class="muted-3 fz12">' + esc(n.date) + '</span></div>').join('') + '</div></div>' +

      '</div></div>'
    );
  };
  function miniStat(v, lbl, color, ratio) {
    return '<div class="mini-stat"><div class="ms-val">' + v + '</div><div class="ms-lbl">' + esc(lbl) + '</div><div class="bar" style="background:' + color + ';opacity:.9;width:' + Math.max(20, Math.min(100, (ratio || 0.6) * 100)) + '%;margin-left:auto;margin-right:auto"></div></div>';
  }
  function qrow(ic, title, target) {
    const tg = target.go ? ' data-go="' + target.go + '"' : '';
    return '<div class="menu-row"' + tg + '><div class="mr-ico red">' + icon(ic, { size: 20 }) + '</div><div class="mr-body"><div class="mr-title">' + esc(title) + '</div></div>' + icon('chevR', { size: 18, cls: 'chev' }) + '</div>';
  }
  function qrowAction(ic, title, action) {
    return '<div class="menu-row" data-action="' + action + '"><div class="mr-ico">' + icon(ic, { size: 20 }) + '</div><div class="mr-body"><div class="mr-title">' + esc(title) + '</div></div>' + icon('chevR', { size: 18, cls: 'chev' }) + '</div>';
  }

  A.admToggleOnline = () => { const c = S.adminClub(); S.updateClub(c.id, { online: !c.online }); render(); };
  A.admToggleHidden = () => { const c = S.adminClub(); S.updateClub(c.id, { hidden: !c.hidden }); toast(c.hidden ? t('open') : t('adm_hide_club')); render(); };

  /* ============================================================
     CLUB EDITOR
     ============================================================ */
  R.adminClub = function () {
    const c = guard();
    if (!c) return '';
    return (
      header({ back: true, title: t('adm_edit_club'), bordered: true }) +
      '<div class="screen has-cta"><div class="pad mt12">' +
      '<div class="gallery-main">' + pic(c.gallery[0], { seed: 'club-' + c.id }) +
      '<button class="btn btn-ghost btn-sm" style="position:absolute;left:50%;bottom:12px;transform:translateX(-50%)" data-action="admPhoto" data-target="main">' + icon('camera', { size: 16 }) + ' ' + t('adm_change_photo') + '</button></div>' +

      '<div class="section-head" style="padding:0;margin:22px 0 10px"><h2 style="font-size:15px">' + t('adm_main_info') + '</h2></div>' +
      '<div class="card card-pad">' +
      editField('ac-name', t('adm_field_name'), c.name) +
      editField('ac-addr', t('adm_field_address'), c.address) +
      editField('ac-phone', t('adm_field_phone'), c.phone) +
      editField('ac-hours', t('adm_field_hours'), c.hours) +
      '<div class="field"><label>' + t('adm_field_desc') + '</label><textarea class="textarea" id="ac-desc">' + esc(c.description) + '</textarea></div>' +
      '</div>' +

      '<div class="section-head" style="padding:0;margin:22px 0 10px"><h2 style="font-size:15px">' + t('adm_gallery') + '</h2></div>' +
      '<div class="media-grid">' + c.gallery.map((g, i) => '<div class="m">' + pic(g, { seed: 'club-' + c.id + '-' + i }) + (i > 0 ? '<button class="fav-btn" style="top:4px;right:4px;width:26px;height:26px" data-action="admDelGallery" data-i="' + i + '">' + icon('x', { size: 14 }) + '</button>' : '') + '</div>').join('') +
      '<button class="m add" data-action="admPhoto" data-target="gallery">' + icon('plus', { size: 26 }) + '</button></div>' +

      '<div class="section-head" style="padding:0;margin:22px 0 10px"><h2 style="font-size:15px">' + t('adm_manage_rooms') + '</h2></div>' +
      c.rooms.map((r) => adminRoomRow(c, r)).join('') +
      '<button class="btn btn-ghost btn-block mt12" data-action="admNewRoom">' + icon('plus', { size: 18 }) + ' ' + t('adm_add_room') + '</button>' +
      '</div>' +
      '<div class="cta-bar"><button class="btn btn-primary btn-lg btn-block btn-uppercase" data-action="admSaveClub">' + t('adm_update_club') + '</button></div>'
    );
  };
  function editField(id, label, value) {
    return '<div class="field inline-edit"><label>' + esc(label) + '</label><input class="input has-edit" id="' + id + '" value="' + esc(value) + '"><span class="edit-pin">' + icon('edit', { size: 16 }) + '</span></div>';
  }
  function adminRoomRow(c, r) {
    return (
      '<div class="card mb12" style="overflow:hidden"><div style="display:flex">' +
      '<div style="width:90px;flex:none;position:relative">' + pic(r.gallery[0], { seed: 'room-' + r.id }) + '<span class="room-type-badge rt-' + r.type + '" style="font-size:8.5px">' + (r.type) + '</span></div>' +
      '<div class="card-pad" style="flex:1"><div class="row" style="justify-content:space-between"><div class="fw700">' + esc(r.name) + '</div><div class="fw700" style="color:var(--red)">' + fmt(r.price) + '</div></div>' +
      '<div class="cc-meta" style="margin-top:6px;flex-wrap:wrap"><span class="m fz12">' + icon('cpu', { size: 13 }) + esc(shortSpec(r.specs.cpu)) + '</span><span class="m fz12">' + icon('gpu', { size: 13 }) + esc(shortSpec(r.specs.gpu)) + '</span></div>' +
      '<button class="btn btn-ghost btn-sm mt12" data-go="adminRoom"' + attr({ roomId: r.id }) + '>' + icon('edit', { size: 15 }) + ' ' + t('adm_edit_details') + '</button></div></div></div>'
    );
  }
  function shortSpec(s) { return String(s).replace(/^(Intel Core |NVIDIA |PlayStation )/, '').slice(0, 16); }

  A.admDelGallery = (el) => {
    const c = S.adminClub();
    c.gallery.splice(+el.dataset.i, 1);
    S.save(); render();
  };
  A.admPhoto = (el) => {
    const target = el.dataset.target;
    openSheet(
      '<h3 class="sheet-title">' + t('adm_add_photo') + '</h3>' +
      '<div class="field"><input class="input" id="photo-url" placeholder="https://..."></div>' +
      '<div class="note mt12">' + icon('info', { size: 14 }) + ' Вставьте ссылку на изображение. Если оставить пустым — используется фирменная обложка.</div>' +
      '<button class="btn btn-primary btn-block btn-lg mt16" data-action="admPhotoSave" data-target="' + target + '"' + (el.dataset.rid ? ' data-rid="' + el.dataset.rid + '"' : '') + '>' + t('save') + '</button>'
    );
  };
  A.admPhotoSave = (el) => {
    const url = val('photo-url') || ('gen-' + Date.now());
    const c = S.adminClub();
    const target = el.dataset.target;
    if (target === 'main') c.gallery[0] = url;
    else if (target === 'gallery') c.gallery.push(url);
    else if (target === 'roomMain' || target === 'roomGallery') {
      const r = c.rooms.find((x) => x.id === el.dataset.rid) || App._editRoom;
      if (r) { if (target === 'roomMain') r.gallery[0] = url; else r.gallery.push(url); }
    }
    S.save(); closeSheet(); render();
  };
  A.admSaveClub = () => {
    const c = S.adminClub();
    S.updateClub(c.id, { name: val('ac-name') || c.name, address: val('ac-addr'), phone: val('ac-phone'), hours: val('ac-hours'), description: val('ac-desc') });
    toast(t('adm_club_saved'), 'success');
    dialog({ title: t('adm_club_saved'), actions: '<button class="btn btn-primary btn-block" data-action="afterClubSave">' + t('ok') + '</button>' });
  };
  A.afterClubSave = () => { closeSheet(); App.go('admin'); };
  A.admNewRoom = () => go('adminRoom', { roomId: 'new' });

  /* ============================================================
     ROOM EDITOR
     ============================================================ */
  R.adminRoom = function (p) {
    const c = guard();
    if (!c) return '';
    const isNew = p.roomId === 'new';
    const r = isNew
      ? { id: null, name: '', type: 'standard', seats: 8, price: 15000, specs: { cpu: '', gpu: '', ram: '', monitor: '', periph: '' }, games: [], gallery: ['new-room-1'], description: '' }
      : c.rooms.find((x) => x.id === p.roomId);
    if (!r) return App.renderers.adminClub();
    App._editRoom = r;
    const tab = App.ui.roomTab || 'specs';

    let body;
    if (tab === 'services') {
      body =
        '<div class="field"><label>' + t('adm_games_csv') + '</label><textarea class="textarea" id="ar-games">' + esc(r.games.map((g) => MVP.GAMES[g] || g).join(', ')) + '</textarea></div>' +
        '<div class="chips mt12">' + r.games.map((g) => App.gameChip(g)).join('') + '</div>';
    } else if (tab === 'media') {
      body =
        '<div class="media-grid">' + r.gallery.map((g, i) => '<div class="m">' + pic(g, { seed: 'room-' + (r.id || 'new') + '-' + i }) + (i > 0 ? '<button class="fav-btn" style="top:4px;right:4px;width:26px;height:26px" data-action="admDelRoomGallery" data-i="' + i + '">' + icon('x', { size: 14 }) + '</button>' : '') + '</div>').join('') +
        '<button class="m add" data-action="admPhoto" data-target="roomGallery" data-rid="' + (r.id || '') + '">' + icon('plus', { size: 26 }) + '</button></div>';
    } else {
      body =
        '<div class="field"><label>' + t('adm_room_name') + '</label><input class="input" id="ar-name" value="' + esc(r.name) + '" placeholder="Standard / VIP / Bootcamp"></div>' +
        '<div class="row gap12"><div class="field" style="flex:1"><label>' + t('adm_room_type') + '</label><select class="input" id="ar-type">' +
        ['standard', 'vip', 'premium', 'bootcamp', 'console'].map((tp) => '<option value="' + tp + '"' + (r.type === tp ? ' selected' : '') + '>' + tp + '</option>').join('') + '</select></div>' +
        '<div class="field" style="width:110px"><label>' + t('adm_room_seats') + '</label><input class="input" id="ar-seats" inputmode="numeric" value="' + r.seats + '"></div></div>' +
        '<div class="field"><label>' + t('adm_room_price') + '</label><input class="input" id="ar-price" inputmode="numeric" value="' + r.price + '"></div>' +
        editRow('ar-cpu', t('spec_cpu'), r.specs.cpu) +
        editRow('ar-gpu', t('spec_gpu'), r.specs.gpu) +
        editRow('ar-ram', t('spec_ram'), r.specs.ram) +
        editRow('ar-monitor', t('spec_monitor'), r.specs.monitor) +
        editRow('ar-periph', t('spec_periph'), r.specs.periph) +
        '<div class="field"><label>' + t('adm_field_desc') + '</label><textarea class="textarea" id="ar-desc">' + esc(r.description) + '</textarea></div>';
    }

    return (
      header({ back: true, title: isNew ? t('adm_room_new') : t('adm_room_edit'), bordered: true }) +
      '<div class="screen has-cta"><div class="pad mt12">' +
      '<div class="gallery-main">' + pic(r.gallery[0], { seed: 'room-' + (r.id || 'new') }) +
      '<button class="btn btn-ghost btn-sm" style="position:absolute;left:50%;bottom:12px;transform:translateX(-50%)" data-action="admPhoto" data-target="roomMain" data-rid="' + (r.id || '') + '">' + icon('camera', { size: 16 }) + ' ' + t('adm_change_photo') + '</button></div>' +
      '<div class="tabs mt16" style="padding:0">' +
      tabBtn('specs', t('adm_tab_specs'), tab) + tabBtn('services', t('adm_tab_services'), tab) + tabBtn('media', t('adm_tab_media'), tab) +
      '</div><div class="mt16">' + body + '</div>' +
      (!isNew ? '<button class="btn btn-outline btn-block mt20" style="color:var(--red);border-color:rgba(229,51,58,.4)" data-action="admDeleteRoom" data-id="' + r.id + '">' + icon('trash', { size: 18 }) + ' ' + t('delete') + '</button>' : '') +
      '</div>' +
      '<div class="cta-bar"><button class="btn btn-primary btn-lg btn-block btn-uppercase" data-action="admSaveRoom" data-id="' + (r.id || '') + '">' + t('save') + '</button></div>'
    );
  };
  function tabBtn(id, label, cur) {
    return '<button class="tab ' + (cur === id ? 'active' : '') + '" data-action="admRoomTab" data-tab="' + id + '">' + esc(label) + '</button>';
  }
  function editRow(id, label, value) {
    return '<div class="field"><label>' + esc(label) + '</label><input class="input" id="' + id + '" value="' + esc(value || '') + '"></div>';
  }
  A.admRoomTab = (el) => {
    // preserve typed specs before switching tabs
    stashRoomEdits();
    App.ui.roomTab = el.dataset.tab;
    render();
  };
  function stashRoomEdits() {
    const r = App._editRoom;
    if (!r) return;
    if (document.getElementById('ar-name')) {
      r.name = val('ar-name'); r.type = document.getElementById('ar-type').value;
      r.seats = parseInt(val('ar-seats'), 10) || r.seats; r.price = parseInt(val('ar-price'), 10) || r.price;
      r.specs.cpu = val('ar-cpu'); r.specs.gpu = val('ar-gpu'); r.specs.ram = val('ar-ram');
      r.specs.monitor = val('ar-monitor'); r.specs.periph = val('ar-periph'); r.description = val('ar-desc');
    }
    if (document.getElementById('ar-games')) {
      r.games = parseGames(val('ar-games'));
    }
  }
  function parseGames(csv) {
    const rev = {};
    Object.keys(MVP.GAMES).forEach((k) => (rev[MVP.GAMES[k].toLowerCase()] = k));
    return csv.split(',').map((s) => s.trim()).filter(Boolean).map((s) => rev[s.toLowerCase()] || s);
  }
  A.admDelRoomGallery = (el) => {
    App._editRoom.gallery.splice(+el.dataset.i, 1);
    S.save(); render();
  };
  A.admSaveRoom = (el) => {
    stashRoomEdits();
    const c = S.adminClub();
    const r = App._editRoom;
    if (!r.name) { toast(t('adm_room_name') + ': ' + t('required'), 'error'); return; }
    const saved = S.upsertRoom(c.id, r);
    App._editRoom = null;
    App.ui.roomTab = 'specs';
    toast(t('adm_room_saved'), 'success');
    App.go('adminClub');
  };
  A.admDeleteRoom = (el) => {
    dialog({
      icon: 'trash', danger: true, title: t('adm_delete_room_q'),
      actions: '<button class="btn btn-primary btn-block" style="background:var(--red)" data-action="admDeleteRoomYes" data-id="' + el.dataset.id + '">' + t('delete') + '</button>' +
        '<button class="btn btn-ghost btn-block mt8" data-action="closeSheet">' + t('cancel') + '</button>',
    });
  };
  A.admDeleteRoomYes = (el) => {
    const c = S.adminClub();
    S.deleteRoom(c.id, el.dataset.id);
    closeSheet();
    toast(t('adm_room_deleted'), 'success');
    App.go('adminClub');
  };

  /* ============================================================
     REVIEWS MANAGEMENT
     ============================================================ */
  R.adminReviews = function () {
    const c = guard();
    if (!c) return '';
    return (
      header({ back: true, title: t('adm_manage_reviews'), bordered: true }) +
      '<div class="screen has-cta"><div class="pad mt16">' +
      '<div class="section-head" style="padding:0;margin-bottom:10px"><h2 style="font-size:15px">' + t('adm_reviews_notif') + '</h2></div>' +
      '<div class="menu">' +
      '<div class="menu-row" data-go="support"><div class="mr-ico red">' + icon('chat', { size: 20 }) + '</div><div class="mr-body"><div class="mr-title">' + t('adm_support_chat') + '</div></div><span class="badge-dot" style="position:static">2</span></div>' +
      '<div class="menu-row"><div class="mr-ico">' + icon('info', { size: 20 }) + '</div><div class="mr-body"><div class="mr-title">' + t('adm_general_faq') + '</div><div class="mr-sub">help.mvpgaming.uz/faq</div></div>' + icon('chevR', { size: 18, cls: 'chev' }) + '</div>' +
      '</div>' +

      '<div class="section-head" style="padding:0;margin:22px 0 10px"><h2 style="font-size:15px">' + t('adm_reviews_for') + ' «' + esc(c.name) + '»</h2></div>' +
      '<div class="card">' + c.reviews.map((rv) => adminReview(c, rv)).join('') + '</div>' +
      '</div>' +
      '<div style="height:20px"></div></div>' +
      '<div class="cta-bar"><button class="btn btn-primary btn-lg btn-block btn-uppercase" data-action="admNotifyPromo">' + icon('send', { size: 18 }) + ' ' + t('adm_notify_promo') + '</button></div>'
    );
  };
  function adminReview(c, rv) {
    return (
      '<div class="review"><div class="rv-head"><img src="' + avatar(rv.author, 76) + '" style="width:38px;height:38px;border-radius:50%">' +
      '<div><div class="rv-name">' + esc(rv.author) + '</div><div class="rv-date">' + esc(rv.date) + '</div></div>' + starsRow(rv.rating) + '</div>' +
      '<div class="rv-text">' + esc(rv.text) + '</div>' +
      (rv.reply
        ? '<div class="rv-reply"><div class="rr-label">' + esc(t('appName')) + '</div><p>' + esc(rv.reply) + '</p></div>'
        : '<button class="btn btn-ghost btn-sm mt12" data-action="admReply" data-id="' + rv.id + '">' + icon('chat', { size: 15 }) + ' ' + t('adm_reply') + '</button>') +
      '</div>'
    );
  }
  A.admReply = (el) => {
    const id = el.dataset.id;
    openSheet(
      '<h3 class="sheet-title">' + t('adm_reply') + '</h3>' +
      '<div class="field"><textarea class="textarea" id="reply-text" placeholder="' + t('adm_reply_ph') + '" autofocus></textarea></div>' +
      '<button class="btn btn-primary btn-block btn-lg mt16" data-action="admReplySend" data-id="' + id + '">' + t('confirm') + '</button>'
    );
  };
  A.admReplySend = (el) => {
    const text = val('reply-text');
    if (!text) { toast(t('required'), 'error'); return; }
    const c = S.adminClub();
    S.replyReview(c.id, el.dataset.id, text);
    closeSheet();
    toast(t('adm_reply_sent'), 'success');
    render();
  };
  A.admNotifyPromo = () => {
    openSheet(
      '<h3 class="sheet-title">' + t('adm_notify_promo') + '</h3>' +
      '<div class="field"><label>' + t('clubreg_name') + '</label><input class="input" id="np-title" placeholder="−30% Kibernight" value="−30% Kibernight"></div>' +
      '<div class="field"><label>' + t('adm_field_desc') + '</label><textarea class="textarea" id="np-body" placeholder="...">Скидка −30% на все комнаты с 00:00 до 06:00!</textarea></div>' +
      '<button class="btn btn-primary btn-block btn-lg mt16" data-action="admNotifySend">' + icon('send', { size: 18 }) + ' ' + t('adm_notify_promo') + '</button>'
    );
  };
  A.admNotifySend = () => {
    const title = val('np-title') || '—';
    const body = val('np-body') || '';
    const c = S.adminClub();
    S.addNotification({ icon: 'gift', title, body: c.name + ' · ' + body });
    closeSheet();
    toast(t('adm_notify_sent'), 'success');
    render();
  };
})();
