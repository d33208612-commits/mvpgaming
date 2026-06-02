/* ============================================================
   MVP Gaming — Procedural artwork (self-contained SVG data-URIs)
   Generates gaming-room style images so the app looks rich even
   fully offline. Real photo URLs (if provided & reachable) can
   override these via <img onerror> fallback in the renderers.
   ============================================================ */
(function () {
  const PALETTES = [
    { a: '#e0303a', b: '#7a1530', c: '#1a0d14' }, // crimson
    { a: '#7c3aed', b: '#3b1d6e', c: '#120e1f' }, // violet
    { a: '#2563eb', b: '#0e2a66', c: '#0b1020' }, // blue
    { a: '#10b981', b: '#0c5a44', c: '#08160f' }, // teal
    { a: '#f59e0b', b: '#7c4a09', c: '#1a1206' }, // amber
    { a: '#ec4899', b: '#7a1247', c: '#1a0a14' }, // pink
  ];

  function hash(str) {
    let h = 2166136261;
    str = String(str);
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  function pal(seed, override) {
    if (typeof override === 'number') return PALETTES[override % PALETTES.length];
    return PALETTES[hash(seed) % PALETTES.length];
  }

  // A stylized gaming-setup scene
  function svgScene(seed, opts) {
    opts = opts || {};
    const w = opts.w || 800;
    const h = opts.h || 500;
    const p = pal(seed, opts.palette);
    const id = 'g' + (hash(seed) % 99999);
    const grid = [];
    for (let x = 40; x < w; x += 46) grid.push('<line x1="' + x + '" y1="0" x2="' + (x - 60) + '" y2="' + h + '"/>');
    for (let y = h * 0.55; y < h; y += 22) grid.push('<line x1="0" y1="' + y + '" x2="' + w + '" y2="' + y + '"/>');
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs>' +
      '<radialGradient id="' + id + 'r" cx="50%" cy="38%" r="75%">' +
        '<stop offset="0%" stop-color="' + p.a + '" stop-opacity="0.55"/>' +
        '<stop offset="45%" stop-color="' + p.b + '" stop-opacity="0.5"/>' +
        '<stop offset="100%" stop-color="' + p.c + '"/>' +
      '</radialGradient>' +
      '<linearGradient id="' + id + 'm" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="' + p.a + '" stop-opacity="0.95"/>' +
        '<stop offset="100%" stop-color="' + p.b + '" stop-opacity="0.7"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="' + p.c + '"/>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#' + id + 'r)"/>' +
      '<g stroke="' + p.a + '" stroke-opacity="0.12" stroke-width="1">' + grid.join('') + '</g>' +
      // monitor glow
      '<g>' +
        '<rect x="' + (w * 0.3) + '" y="' + (h * 0.26) + '" width="' + (w * 0.4) + '" height="' + (h * 0.34) + '" rx="10" fill="#05060a" stroke="' + p.a + '" stroke-opacity="0.9" stroke-width="2"/>' +
        '<rect x="' + (w * 0.32) + '" y="' + (h * 0.29) + '" width="' + (w * 0.36) + '" height="' + (h * 0.28) + '" rx="4" fill="url(#' + id + 'm)" opacity="0.85"/>' +
        '<rect x="' + (w * 0.46) + '" y="' + (h * 0.6) + '" width="' + (w * 0.08) + '" height="' + (h * 0.1) + '" fill="#0a0c12"/>' +
        '<rect x="' + (w * 0.4) + '" y="' + (h * 0.7) + '" width="' + (w * 0.2) + '" height="10" rx="4" fill="#0a0c12"/>' +
      '</g>' +
      // keyboard underglow
      '<rect x="' + (w * 0.24) + '" y="' + (h * 0.82) + '" width="' + (w * 0.52) + '" height="14" rx="6" fill="' + p.a + '" opacity="0.5"/>' +
      '<rect x="0" y="' + (h - 4) + '" width="' + w + '" height="4" fill="' + p.a + '" opacity="0.7"/>' +
      '</svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // A flat banner gradient (for promo cards)
  function svgBanner(seed, opts) {
    opts = opts || {};
    const w = opts.w || 600, h = opts.h || 300;
    const p = pal(seed, opts.palette);
    const id = 'b' + (hash(seed) % 99999);
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="' + p.a + '"/>' +
        '<stop offset="60%" stop-color="' + p.b + '"/>' +
        '<stop offset="100%" stop-color="' + p.c + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#' + id + ')"/>' +
      '<circle cx="' + (w * 0.82) + '" cy="' + (h * 0.3) + '" r="' + (h * 0.55) + '" fill="#fff" opacity="0.06"/>' +
      '<circle cx="' + (w * 0.2) + '" cy="' + (h * 0.85) + '" r="' + (h * 0.4) + '" fill="#000" opacity="0.12"/>' +
      '</svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // Avatar with initials
  function svgAvatar(name, opts) {
    opts = opts || {};
    const s = opts.size || 96;
    const p = pal(name, opts.palette);
    const initials = String(name || '?')
      .trim().split(/\s+/).slice(0, 2).map((x) => x[0] || '').join('').toUpperCase() || '?';
    const id = 'a' + (hash(name) % 99999);
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="' + p.a + '"/><stop offset="100%" stop-color="' + p.b + '"/></linearGradient></defs>' +
      '<rect width="' + s + '" height="' + s + '" rx="' + s + '" fill="url(#' + id + ')"/>' +
      '<text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="' + (s * 0.4) +
      '" font-weight="700" fill="#fff">' + initials + '</text></svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  const MVP = (window.MVP = window.MVP || {});
  MVP.art = { scene: svgScene, banner: svgBanner, avatar: svgAvatar, hash, pal };
})();
