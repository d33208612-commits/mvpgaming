/* ============================================================
   MVP Gaming — Inline SVG icon set (no external deps)
   Usage: MVP.icon('home', {size:24, cls:'foo'})
   ============================================================ */
(function () {
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-6h5v6"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14"/><path d="M15 6v14"/>',
    heart: '<path d="M12 20.5s-7.5-4.6-9.7-9.2C.9 8.2 2.4 5 5.6 5c2 0 3.3 1.2 4.4 2.6C11 6.2 12.3 5 14.4 5c3.2 0 4.7 3.2 3.3 6.3-2.2 4.6-9.7 9.2-9.7 9.2Z"/>',
    heartFill: '<path d="M12 20.5s-7.5-4.6-9.7-9.2C.9 8.2 2.4 5 5.6 5c2 0 3.3 1.2 4.4 2.6C11 6.2 12.3 5 14.4 5c3.2 0 4.7 3.2 3.3 6.3-2.2 4.6-9.7 9.2-9.7 9.2Z" fill="currentColor" stroke="none"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 13a7.8 7.8 0 0 0 .1-2l1.8-1.4-1.8-3.2-2.2.9a7.6 7.6 0 0 0-1.7-1l-.3-2.3H9.4l-.3 2.3a7.6 7.6 0 0 0-1.7 1l-2.2-.9-1.8 3.2L5.2 11a7.8 7.8 0 0 0 0 2l-1.8 1.4 1.8 3.2 2.2-.9c.5.4 1.1.8 1.7 1l.3 2.3h4.2l.3-2.3c.6-.2 1.2-.6 1.7-1l2.2.9 1.8-3.2L19.4 13Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5S20 17 20 21"/>',
    bell: '<path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/>',
    star: '<path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.3l1-5.9L3.5 9.2l5.9-.8L12 3Z"/>',
    starFill: '<path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.3l1-5.9L3.5 9.2l5.9-.8L12 3Z" fill="currentColor" stroke="none"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    back: '<path d="m15 5-7 7 7 7"/>',
    chevR: '<path d="m9 5 7 7-7 7"/>',
    chevD: '<path d="m5 9 7 7 7-7"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m14 6 4 4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    camera: '<path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.2"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 6.5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.6 2.6L16 9.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
    cpu: '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
    gpu: '<rect x="2.5" y="7" width="19" height="11" rx="2"/><circle cx="8" cy="12.5" r="2.4"/><circle cx="15" cy="12.5" r="2.4"/><path d="M4.5 18v3"/>',
    ram: '<rect x="2.5" y="8" width="19" height="8" rx="1.5"/><path d="M6 16v2M10 16v2M14 16v2M18 16v2M6 11v2M10 11v2M14 11v2M18 11v2"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>',
    gamepad: '<path d="M7.5 8h9a4.5 4.5 0 0 1 4.4 5.4l-.7 3.4A2.5 2.5 0 0 1 16 18l-1.5-2h-5L8 18a2.5 2.5 0 0 1-4.2-1.2l-.7-3.4A4.5 4.5 0 0 1 7.5 8Z"/><path d="M7 12h2M8 11v2"/><circle cx="15.5" cy="11.5" r=".8" fill="currentColor"/><circle cx="17" cy="13" r=".8" fill="currentColor"/>',
    phone: '<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M10 18h4"/>',
    location: '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    chat: '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>',
    gift: '<rect x="3.5" y="9" width="17" height="12" rx="1.5"/><path d="M3.5 13h17M12 9v12"/><path d="M12 9S10.5 4.5 8 5s-1 4 4 4ZM12 9s1.5-4.5 4-4 1 4-4 4Z"/>',
    logout: '<path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M3 12h12M11 8l4 4-4 4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9Z"/>',
    chart: '<path d="M4 4v16h16"/><path d="m7 14 3-4 3 3 4-6"/>',
    trend: '<path d="m3 16 5-5 4 4 8-8"/><path d="M16 7h4v4"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" stroke="none"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    send: '<path d="M21 4 3 11l7 2 2 7 9-16Z"/>',
    trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
    logo: '<path d="M4 19 7 5l5 8 5-8 3 14h-3.5l-1.3-7-3.2 5-3.2-5L7.5 19H4Z" fill="currentColor" stroke="none"/>',
    wifi: '<path d="M2 8.5C7.5 4 16.5 4 22 8.5M5 12c4-3 10-3 14 0M8.5 15.5c2-1.6 5-1.6 7 0"/><circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none"/>',
  };

  const MVP = (window.MVP = window.MVP || {});
  MVP.icon = function (name, opts) {
    opts = opts || {};
    const size = opts.size || 24;
    const cls = opts.cls ? ' ' + opts.cls : '';
    const sw = opts.sw || 1.7;
    const body = P[name] || P.info;
    return (
      '<svg class="ic' + cls + '" width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>'
    );
  };
})();
