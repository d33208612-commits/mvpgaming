/* ==========================================================================
   Kartix AI — Application
   Studio flow, simulated AI (real palette extraction), infographic slide
   renderer, editor, PNG/PDF export, dashboard, auth and subscriptions.

   The AI here runs entirely in the browser (demo). To wire a real model,
   replace AI.analyze / AI.writeCopy / (optionally) image generation — the
   card data shapes stay the same.
   ========================================================================== */
(function () {
  "use strict";

  const I18N = window.I18N;
  const D = window.DATA;
  const t = I18N.t;
  const tl = (lang, key) => (I18N.dict[lang] && I18N.dict[lang][key]) || I18N.dict.ru[key] || key;

  /* ----------------------------- DOM helpers ----------------------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  function node(tag, cls) { const n = document.createElement(tag); if (cls) n.className = cls; return n; }
  function txt(tag, cls, text) { const n = node(tag, cls); if (text != null) n.textContent = text; return n; }
  const rand = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (arr) => arr[randi(0, arr.length - 1)];
  const pickN = (arr, n) => { const c = arr.slice(); const out = []; while (c.length && out.length < n) out.push(c.splice(randi(0, c.length - 1), 1)[0]); return out; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const fmtPrice = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  /* ----------------------------- Color utils ----------------------------- */
  function hexToRgb(hex) {
    hex = (hex || "#000").replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return { h: h * 360, s, l };
  }
  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p, q, tt) => {
        if (tt < 0) tt += 1; if (tt > 1) tt -= 1;
        if (tt < 1 / 6) return p + (q - p) * 6 * tt;
        if (tt < 1 / 2) return q;
        if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3);
    }
    return rgbToHex(r * 255, g * 255, b * 255);
  }
  const hexToHsl = (hex) => { const { r, g, b } = hexToRgb(hex); return rgbToHsl(r, g, b); };
  function rgba(hex, a) { const { r, g, b } = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
  function mix(h1, h2, w) { const a = hexToRgb(h1), b = hexToRgb(h2); return rgbToHex(a.r * w + b.r * (1 - w), a.g * w + b.g * (1 - w), a.b * w + b.b * (1 - w)); }
  function luminance(hex) { const { r, g, b } = hexToRgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
  function rotateHue(hex, deg) { const c = hexToHsl(hex); return hslToHex(c.h + deg, c.s, c.l); }
  // Force a color into a vivid, white-text-friendly range
  function solidify(hex) { const c = hexToHsl(hex); return hslToHex(c.h, clamp(c.s, 0.45, 0.95), clamp(c.l, 0.4, 0.6)); }
  // Accent tuned for text legibility on a given surface
  function readable(hex, onDark) {
    const c = hexToHsl(hex); let l = c.l;
    if (onDark) l = clamp(Math.max(l, 0.62), 0.62, 0.8);
    else l = clamp(Math.min(l, 0.46), 0.28, 0.46);
    return hslToHex(c.h, clamp(c.s, 0.45, 0.95), l);
  }

  /* ============================ STATE ============================ */
  const STORE = "kartix_state_v1";
  function defaultState() {
    return { user: null, plan: "free", used: 0, billing: "m", theme: "dark", projects: [], saved: [] };
  }
  let state = (() => { try { return Object.assign(defaultState(), JSON.parse(localStorage.getItem(STORE)) || {}); } catch (e) { return defaultState(); } })();
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); }
    catch (e) {
      // Quota: drop oldest project images, then oldest projects
      state.projects.forEach((p) => { if (p.card) p.card.imageSrc = null; });
      try { localStorage.setItem(STORE, JSON.stringify(state)); }
      catch (e2) { state.projects = state.projects.slice(-8); try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e3) {} }
    }
  }
  const planOf = () => D.PLANS[state.plan] || D.PLANS.free;
  const creditsLeft = () => Math.max(0, planOf().credits - state.used);

  /* Current studio working set */
  let cur = { source: null, detection: null, card: null, slideType: "main", projectRef: null };
  const SLIDE_TYPES = ["main", "advantages", "specs", "compare", "bonus"];
  let studioOpts = { marketplace: "uzum", lang: I18N.getLang(), style: "premium3d" };

  /* ============================ AI (simulated) ============================ */
  const AI = {};

  AI.extractPalette = function (img) {
    try {
      const cv = node("canvas");
      const w = 56, h = Math.max(1, Math.round(56 * (img.naturalHeight / img.naturalWidth)) || 56);
      cv.width = w; cv.height = h;
      const ctx = cv.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      const buckets = {};
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3]; if (a < 200) continue;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        // skip near white/black for palette dominance
        if (mx > 244 && mn > 238) continue;
        if (mx < 16) continue;
        const key = `${r >> 4},${g >> 4},${b >> 4}`;
        if (!buckets[key]) buckets[key] = { r: 0, g: 0, b: 0, n: 0 };
        const bk = buckets[key]; bk.r += r; bk.g += g; bk.b += b; bk.n++;
      }
      let arr = Object.values(buckets).map((bk) => ({ hex: rgbToHex(bk.r / bk.n, bk.g / bk.n, bk.b / bk.n), n: bk.n }));
      arr.sort((a, b) => b.n - a.n);
      const palette = arr.slice(0, 6).map((x) => x.hex);
      return palette.length ? palette : null;
    } catch (e) { return null; }
  };

  AI.vibrant = function (palette, fallback) {
    if (!palette || !palette.length) return fallback;
    let best = null, score = -1, bestSat = 0;
    palette.forEach((hex) => {
      const c = hexToHsl(hex);
      const s = c.s * (1 - Math.abs(c.l - 0.5) * 1.2);
      if (s > score) { score = s; best = hex; bestSat = c.s; }
    });
    // If the product is essentially grey/white (dull), prefer the nicer fallback accent
    if (!best || bestSat < 0.22) return fallback;
    return best;
  };

  function loadImage(src) {
    return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  }

  function detectCategory(fileName) {
    if (!fileName) return null;
    const f = fileName.toLowerCase();
    for (const id in D.CATEGORIES) {
      const kw = D.CATEGORIES[id].keywords || [];
      if (kw.some((k) => f.includes(k))) return id;
    }
    return null;
  }

  // Returns detection: { categoryId, palette, accent, emoji, imageSrc }
  AI.analyze = async function (source) {
    let palette = null, accent = null, categoryId = source.categoryHint || null;
    if (source.type === "file" && source.dataURL) {
      try { const img = await loadImage(source.dataURL); palette = AI.extractPalette(img); } catch (e) {}
      if (!categoryId) categoryId = detectCategory(source.fileName);
    }
    if (!categoryId) categoryId = "generic";
    const cat = D.CATEGORIES[categoryId];
    accent = AI.vibrant(palette, source.accent || cat.accent);
    if (!palette) {
      const base = source.accent || cat.accent;
      palette = [base, rotateHue(base, 18), mix(base, "#ffffff", 0.5), mix(base, "#000000", 0.5), "#e9e9ef"];
    }
    return { categoryId, palette, accent, emoji: source.emoji || cat.emoji, imageSrc: source.type === "file" ? source.dataURL : null };
  };

  function currency(lang) { return lang === "uz" ? "so‘m" : lang === "en" ? "UZS" : "сум"; }
  function weightUnit(lang) { return lang === "en" ? "kg" : "кг"; }
  // Russian nominative adjective agreement (our adjective bank is masculine "-ый")
  function declRu(adj, g) {
    const end = { m: "ый", f: "ая", n: "ое", pl: "ые" }[g] || "ый";
    return adj.replace(/(ый|ий|ой)$/, end);
  }

  // Produces all editable card copy from a category + language + options
  AI.writeCopy = function (categoryId, lang, opts) {
    opts = opts || {};
    const cat = D.CATEGORIES[categoryId] || D.CATEGORIES.generic;
    const C = D.COPY;
    const catName = cat.name[lang];
    const catL = catName.toLowerCase();
    let adj = pick(C.adjectives[lang]);
    if (lang === "ru") adj = declRu(adj, cat.gender || "m"); // gender agreement
    const adjL = adj.toLowerCase();
    const fill = (s) => s.replace(/{adj_l}/g, adjL).replace(/{adj}/g, adj).replace(/{cat_l}/g, catL).replace(/{cat}/g, catName);

    const name = (opts.name && opts.name.trim()) ? opts.name.trim() : `${adj} ${catName}`;
    const headline = fill(pick(C.headlines[lang]));
    const sub = pick(C.subheadlines[lang]);
    const badge = pick(C.badges[lang]);
    const discount = pick(C.discounts);
    const d = Math.abs(parseInt(discount, 10)) / 100; // "-25%" → 0.25
    const price = Math.round(rand(149, 899)) * 1000 + 900;
    const oldPrice = Math.round(price / (1 - d) / 1000) * 1000 + 900;

    const chipPool = ["⚡", "✅", "🔝", "💧", "🔋", "🎯", "🧩", "🛡️", "🌟", "♻️"];
    const featTexts = pickN(cat.features[lang], 3);
    const features = featTexts.map((tx, i) => ({ e: chipPool[i % chipPool.length], t: tx }));

    const benIcons = ["✅", "⚡", "🛡️", "💎", "🔋", "🎯", "🌟", "🧩"];
    const advList = pickN(cat.advantages[lang], Math.min(4, cat.advantages[lang].length));
    const featForDesc = cat.features[lang];
    const benefits = advList.map((adv, i) => ({ icon: benIcons[i % benIcons.length], t: adv, d: featForDesc[(i + 1) % featForDesc.length] }));

    const SL = C.specLabels[lang];
    const specs = [
      { k: SL.material, v: cat.materials[lang][0] },
      { k: SL.color, v: pick(C.specValues.colors[lang]) },
      { k: SL.weight, v: rand(0.3, 2.6).toFixed(1) + " " + weightUnit(lang) },
      { k: SL.warranty, v: pick(C.specValues.warranty[lang]) },
      { k: SL.country, v: pick(C.specValues.country[lang]) },
    ];

    const compareRows = C.compare.rows[lang].slice(0, 5);
    const bonus = C.bonus[lang].map((b) => ({ icon: b.icon, t: b.t, d: b.d }));
    const seo = fill(C.seo[lang].replace(/{name}/g, name).replace(/{benefit}/g, advList[0] || ""));
    const sizesByCat = { clothing: ["XS", "S", "M", "L", "XL"], footwear: ["37", "39", "41", "43", "45"] };
    const sizes = sizesByCat[categoryId] || null;

    return {
      name, headline, sub, badge, discount,
      price: fmtPrice(price), oldPrice: fmtPrice(oldPrice), currency: currency(lang),
      rating: pick(C.rating), reviews: pick(C.reviews),
      features, benefits, specs, sizes,
      compareUs: C.compare.us[lang], compareThem: C.compare.them[lang], compareRows,
      bonus, seo, cta: pick(C.cta[lang]),
    };
  };

  // Assemble a full card (project payload)
  function makeCard(det, opts) {
    const copy = AI.writeCopy(det.categoryId, opts.lang, opts);
    const mk = D.MARKETPLACES[opts.marketplace];
    const sizeId = opts.marketplace === "wb" ? "wb34" : "portrait34";
    return Object.assign({
      id: uid(), createdAt: Date.now(),
      categoryId: det.categoryId, accent: det.accent, palette: det.palette,
      emoji: det.emoji, imageSrc: det.imageSrc || null,
      lang: opts.lang, style: opts.style, marketplace: opts.marketplace, sizeId, font: "jakarta",
      brand: "BRAND", showBadge: true, showPrice: true, showRating: true,
      prompt: opts.prompt || "",
    }, copy, { title: copy.name });
  }
  const detFromCard = (c) => ({ categoryId: c.categoryId, accent: c.accent, palette: c.palette, emoji: c.emoji, imageSrc: c.imageSrc });

  /* ============================ SLIDE RENDERER ============================ */
  function sizeOf(card) { return D.SIZES.find((s) => s.id === card.sizeId) || D.SIZES[0]; }
  const FONTS = { jakarta: '"Plus Jakarta Sans", sans-serif', inter: '"Inter", sans-serif', mono: '"DejaVu Sans Mono", ui-monospace, monospace' };

  function computeColors(card) {
    const style = D.STYLES[card.style] || D.STYLES.premium3d;
    const light = !style.dark;
    const acc = solidify(card.accent || "#6d5cff");
    const acc2 = solidify(rotateHue(acc, 26));
    return {
      style, light, acc, acc2,
      accText: readable(acc, !light),
      accFaint: rgba(acc, 0.32),
      ink: light ? "#15151f" : "#ffffff",
      ink2: light ? "rgba(20,20,30,.6)" : "rgba(255,255,255,.72)",
      panel: light ? "rgba(20,22,45,.05)" : "rgba(255,255,255,.08)",
      panelBd: light ? "rgba(20,22,45,.12)" : "rgba(255,255,255,.16)",
      base1: light ? "#ffffff" : "#0c0c16",
      base2: light ? "#eef0f8" : "#08080f",
    };
  }

  function buildBackground(slide, co) {
    const bg = node("div", "slide-bg");
    const s = co.style.bg;
    if (s === "spotlight") {
      bg.style.background = `radial-gradient(120% 92% at 50% -8%, ${mix(co.acc, co.base2, 0.42)}, ${co.base2} 72%)`;
    } else if (s === "mesh") {
      bg.style.background =
        `radial-gradient(58% 48% at 14% 12%, ${rgba(co.acc, 0.55)}, transparent 60%),` +
        `radial-gradient(54% 44% at 88% 16%, ${rgba(co.acc2, 0.55)}, transparent 60%),` +
        `radial-gradient(70% 60% at 72% 96%, ${rgba(co.acc, 0.4)}, transparent 66%),` +
        `linear-gradient(160deg, ${co.base1}, ${co.base2})`;
    } else if (s === "grid") {
      bg.style.background = `linear-gradient(160deg, ${mix(co.acc, "#0a0c1a", 0.14)}, #0a0c18)`;
      const lines = node("div", "bg-grid-lines");
      lines.style.backgroundImage = `linear-gradient(${rgba(co.acc, 0.32)} 2px, transparent 2px), linear-gradient(90deg, ${rgba(co.acc, 0.32)} 2px, transparent 2px)`;
      bg.appendChild(lines);
    } else { // soft
      bg.style.background = co.light
        ? `linear-gradient(165deg, #ffffff, ${mix(co.acc, "#ffffff", 0.12)})`
        : `linear-gradient(165deg, #16161f, #0c0c14)`;
    }
    slide.appendChild(bg);
    // light decorative blobs (no blur dependency: gradient circles)
    const deco = node("div", "bg-deco");
    const blob = node("div", "glowblob");
    blob.style.cssText = `width:60%;height:60%;top:-12%;right:-8%;background:radial-gradient(circle, ${rgba(co.acc, 0.5)}, transparent 70%);`;
    deco.appendChild(blob);
    if (co.style.bg !== "soft") {
      const ring = node("div", "ring");
      ring.style.cssText = `width:520px;height:520px;bottom:-180px;left:-160px;border-color:${rgba(co.acc, 0.25)};`;
      deco.appendChild(ring);
    }
    slide.appendChild(deco);
  }

  function productEl(card, co, sizePx) {
    const wrap = node("div", "s-img-wrap");
    const glow = node("div", "s-img-glow");
    wrap.appendChild(glow);
    if (card.imageSrc) {
      const img = node("img", "s-img");
      img.src = card.imageSrc; img.crossOrigin = "anonymous"; img.alt = "";
      if (!co.light) {
        const photo = node("div");
        photo.style.cssText = "background:#fff;border-radius:28px;padding:26px;box-shadow:0 40px 70px -24px rgba(0,0,0,.5);position:relative;z-index:1;max-width:82%;";
        img.style.maxWidth = "100%"; img.style.maxHeight = (sizePx ? sizePx * 0.42 : 520) + "px";
        photo.appendChild(img); wrap.appendChild(photo);
      } else { wrap.appendChild(img); }
    } else {
      const em = txt("div", "s-emoji", card.emoji || "📦");
      if (sizePx) em.style.fontSize = Math.round(sizePx * 0.34) + "px";
      wrap.appendChild(em);
    }
    const ped = node("div", "s-pedestal"); wrap.appendChild(ped);
    return wrap;
  }

  function decorate(slide, card, co) {
    const mk = D.MARKETPLACES[card.marketplace];
    const logo = txt("div", "s-mk-logo", mk.logo);
    logo.style.color = co.ink; slide.appendChild(logo);
    if (planOf().watermark) {
      const wm = node("div", "s-watermark");
      const m = txt("span", "wm-mark", "K"); m.style.background = co.acc;
      wm.appendChild(m); wm.appendChild(txt("span", null, "Kartix AI"));
      slide.appendChild(wm);
    }
  }

  // Render a slide DOM element at TRUE pixel size.
  function renderSlide(card, type) {
    const co = computeColors(card);
    const size = sizeOf(card);
    const slide = node("div", "slide" + (co.light ? " slide-light" : ""));
    slide.style.width = size.w + "px"; slide.style.height = size.h + "px";
    slide.style.fontFamily = FONTS[card.font] || FONTS.jakarta;
    slide.style.setProperty("--acc", co.acc);
    slide.style.setProperty("--acc2", co.acc2);
    slide.style.setProperty("--acc-text", co.accText);
    slide.style.setProperty("--acc-faint", co.accFaint);
    slide.style.setProperty("--ink", co.ink);
    slide.style.setProperty("--ink2", co.ink2);
    slide.style.setProperty("--panel", co.panel);
    slide.style.setProperty("--panel-bd", co.panelBd);

    buildBackground(slide, co);
    const inner = node("div", "slide-inner");
    const pad = Math.round(size.w * 0.06);
    inner.style.padding = pad + "px";
    inner.style.gap = Math.round(size.w * 0.03) + "px";

    if (type === "main") renderMain(inner, slide, card, co, size);
    else if (type === "advantages") renderAdvantages(inner, card, co);
    else if (type === "specs") renderSpecs(inner, card, co, size);
    else if (type === "compare") renderCompare(inner, card, co);
    else if (type === "bonus") renderBonus(inner, card, co);

    slide.appendChild(inner);
    decorate(slide, card, co);
    return slide;
  }

  // Editorial main slide: real photo + detail zoom callouts + spec sidebar +
  // numbered features + size range — the "designer infographic" look.
  function renderMain(inner, slide, card, co, size) {
    const pad = Math.round(size.w * 0.06);
    const W = size.w - pad * 2;
    inner.style.position = "relative";

    /* ---- header ---- */
    const head = node("div");
    const krow = node("div"); krow.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px;";
    if (card.showBadge && card.badge) { const k = txt("div", "s-ed-kicker", card.badge); k.style.background = co.acc; krow.appendChild(k); }
    else krow.appendChild(node("div"));
    krow.appendChild(txt("div", "s-ed-trend", tl(card.lang, "slide.trend")));
    head.appendChild(krow);
    const title = txt("div", "s-ed-title", (card.title || card.name || "").toUpperCase());
    title.style.fontSize = Math.round(size.w * 0.084) + "px";
    head.appendChild(title);
    const desc = txt("div", "s-ed-desc", card.headline + (card.sub ? ". " + card.sub : ""));
    desc.style.fontSize = Math.round(size.w * 0.027) + "px"; desc.style.maxWidth = Math.round(W * 0.66) + "px"; desc.style.marginTop = "16px";
    head.appendChild(desc);
    const arow = node("div"); arow.style.cssText = "display:flex;align-items:center;gap:22px;margin-top:26px;";
    const more = node("div", "s-ed-more"); more.style.background = co.ink; more.style.color = co.base2;
    more.appendChild(txt("span", null, tl(card.lang, "slide.more"))); more.appendChild(txt("span", null, "↗"));
    arow.appendChild(more);
    if (card.showPrice) {
      const price = node("div", "s-ed-price");
      price.appendChild(txt("b", null, card.price + " " + card.currency));
      if (card.oldPrice) price.appendChild(txt("s", null, card.oldPrice));
      arow.appendChild(price);
    }
    head.appendChild(arow);
    inner.appendChild(head);

    /* ---- stage: photo + callouts + spec sidebar ---- */
    const stageH = Math.round(size.h * 0.45);
    const stage = node("div"); stage.style.cssText = `position:relative;height:${stageH}px;margin:${Math.round(size.h * 0.012)}px 0;`;
    const pbW = Math.round(W * 0.40), pbH = Math.round(stageH * 0.96), pcx = Math.round(W * 0.44);
    const pbox = node("div"); pbox.style.cssText = `position:absolute;left:${pcx - pbW / 2}px;top:${(stageH - pbH) / 2}px;width:${pbW}px;height:${pbH}px;display:flex;align-items:center;justify-content:center;`;
    if (card.imageSrc) {
      const img = node("img"); img.src = card.imageSrc; img.crossOrigin = "anonymous"; img.alt = "";
      img.style.cssText = "max-width:100%;max-height:100%;border-radius:18px;filter:drop-shadow(0 40px 60px rgba(0,0,0,.28));";
      pbox.appendChild(img);
    } else { const em = txt("div", "s-emoji", card.emoji || "📦"); em.style.fontSize = Math.round(pbH * 0.62) + "px"; pbox.appendChild(em); }
    stage.appendChild(pbox);

    const feats = (card.features || []).slice(0, 3);
    const slots = [
      { cx: W * 0.12, cy: stageH * 0.20, tx: W * 0.34, ty: stageH * 0.30 },
      { cx: W * 0.12, cy: stageH * 0.76, tx: W * 0.36, ty: stageH * 0.66 },
      { cx: W * 0.70, cy: stageH * 0.16, tx: W * 0.55, ty: stageH * 0.34 },
    ];
    const zoomPos = ["50% 16%", "44% 84%", "66% 50%"];
    feats.forEach((f, i) => { if (slots[i]) addCallout(stage, slots[i], i + 1, card, co, f, zoomPos[i]); });

    const side = node("div"); side.style.cssText = `position:absolute;right:0;top:50%;transform:translateY(-50%);width:${Math.round(W * 0.20)}px;display:flex;flex-direction:column;gap:${Math.round(stageH * 0.045)}px;`;
    (card.specs || []).slice(0, 3).forEach((s, i) => {
      const it = node("div", "s-ed-side-item");
      it.appendChild(txt("div", "s-ed-side-idx", "0" + (i + 1)));
      it.appendChild(txt("div", "s-ed-side-k", s.k));
      it.appendChild(txt("div", "s-ed-side-v", (s.v || "").toUpperCase()));
      side.appendChild(it);
    });
    stage.appendChild(side);

    if (card.showPrice && card.discount) {
      const disc = node("div", "s-disc"); disc.style.cssText += `left:${pcx - pbW / 2 - 6}px;top:0;width:118px;height:118px;font-size:40px;`;
      disc.appendChild(document.createTextNode(card.discount)); stage.appendChild(disc);
    }
    inner.appendChild(stage);

    /* ---- bottom: numbered features + sizes/rating ---- */
    const bottom = node("div"); bottom.style.cssText = "display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-top:auto;";
    const fcol = node("div", "s-ed-feats");
    feats.forEach((f, i) => { const fe = node("div"); fe.appendChild(txt("div", "s-ed-feat-num", "0" + (i + 1))); fe.appendChild(txt("div", "s-ed-feat-t", f.t)); fcol.appendChild(fe); });
    bottom.appendChild(fcol);
    const right = node("div"); right.style.textAlign = "right";
    if (card.sizes && card.sizes.length) {
      right.appendChild(txt("div", "s-ed-sizes-label", tl(card.lang, "slide.sizes")));
      const sz = node("div", "s-ed-sizes"); const active = card.sizes[Math.floor(card.sizes.length / 2)];
      card.sizes.forEach((s) => { const c = txt("div", "s-ed-size-chip" + (s === active ? " active" : ""), s); if (s === active) c.style.background = co.acc; sz.appendChild(c); });
      right.appendChild(sz);
    } else if (card.showRating) {
      const rt = node("div", "s-rating"); rt.style.justifyContent = "flex-end";
      rt.appendChild(txt("span", "s-stars", "★★★★★")); rt.appendChild(txt("span", null, `${card.rating} · ${card.reviews}`));
      right.appendChild(rt);
    }
    bottom.appendChild(right);
    inner.appendChild(bottom);
  }

  function addCallout(stage, slot, num, card, co, feat, zoomPos) {
    const r = 92, cx = slot.cx, cy = slot.cy, tx = slot.tx, ty = slot.ty;
    const dist = Math.hypot(tx - cx, ty - cy), ang = Math.atan2(ty - cy, tx - cx) * 180 / Math.PI;
    const line = node("div", "s-callout-line"); line.style.cssText = `left:${cx}px;top:${cy}px;width:${dist}px;transform:rotate(${ang}deg);`;
    stage.appendChild(line);
    const dot = node("div", "s-callout-dot"); dot.style.cssText = `left:${tx}px;top:${ty}px;`; dot.style.background = co.acc; stage.appendChild(dot);
    const circ = node("div", "s-callout"); circ.style.cssText = `left:${cx - r}px;top:${cy - r}px;width:${r * 2}px;height:${r * 2}px;`;
    circ.style.borderColor = co.light ? "#ffffff" : "rgba(255,255,255,.92)";
    if (card.imageSrc) { const bg = node("div", "s-callout-bg"); bg.style.cssText = `background-image:url("${card.imageSrc}");background-size:300%;background-position:${zoomPos};`; circ.appendChild(bg); }
    else { circ.appendChild(txt("div", "s-callout-ic", feat ? (feat.e || "✨") : "✨")); }
    const nb = txt("div", "s-callout-num", num); nb.style.background = co.acc; circ.appendChild(nb);
    stage.appendChild(circ);
  }

  function sectionTitle(card, key) {
    const wrap = node("div"); wrap.style.cssText = "margin-bottom:8px;";
    wrap.appendChild(headlineFromTitle(tl(card.lang, key)));
    return wrap;
  }
  function headlineFromTitle(text) { const h = txt("div", "s-headline", text); return h; }

  function renderAdvantages(inner, card, co) {
    inner.appendChild(sectionTitle(card, "slide.advantages"));
    const list = node("div", "s-benefits");
    (card.benefits || []).slice(0, 4).forEach((b) => {
      const row = node("div", "s-benefit");
      const ic = txt("div", "s-benefit-ic", b.icon || "✅");
      const tx = node("div", "s-benefit-tx");
      tx.appendChild(txt("b", null, b.t));
      if (b.d) tx.appendChild(txt("span", null, b.d));
      row.appendChild(ic); row.appendChild(tx); list.appendChild(row);
    });
    inner.appendChild(list);
  }

  function renderSpecs(inner, card, co, size) {
    inner.appendChild(sectionTitle(card, "slide.specs"));
    const prod = productEl(card, co, size.w);
    prod.style.flex = "0 0 auto"; prod.style.height = Math.round(size.h * 0.3) + "px";
    inner.appendChild(prod);
    const list = node("div", "s-specs");
    (card.specs || []).forEach((s) => {
      const row = node("div", "s-spec");
      row.appendChild(txt("span", "k", s.k));
      row.appendChild(txt("span", "v", s.v));
      list.appendChild(row);
    });
    inner.appendChild(list);
  }

  function renderCompare(inner, card, co) {
    inner.appendChild(sectionTitle(card, "slide.compare"));
    const grid = node("div", "s-compare"); grid.style.flex = "1";
    const us = node("div", "s-comp-col s-comp-us");
    us.appendChild(txt("div", "s-comp-h", card.compareUs));
    const them = node("div", "s-comp-col s-comp-them");
    them.appendChild(txt("div", "s-comp-h", card.compareThem));
    (card.compareRows || []).forEach((r) => {
      const ru = node("div", "s-comp-row");
      const icu = txt("div", "s-comp-ic", "✓"); ru.appendChild(icu); ru.appendChild(txt("span", null, r)); us.appendChild(ru);
      const rt = node("div", "s-comp-row");
      const ict = txt("div", "s-comp-ic", "✕"); rt.appendChild(ict); rt.appendChild(txt("span", null, r)); them.appendChild(rt);
    });
    grid.appendChild(us); grid.appendChild(them);
    inner.appendChild(grid);
  }

  function renderBonus(inner, card, co) {
    inner.appendChild(sectionTitle(card, "slide.bonus"));
    const grid = node("div", "s-bonus"); grid.style.flex = "1";
    (card.bonus || []).slice(0, 4).forEach((b) => {
      const c = node("div", "s-bonus-card");
      c.appendChild(txt("div", "s-bonus-ic", b.icon));
      c.appendChild(txt("b", null, b.t));
      c.appendChild(txt("span", null, b.d));
      grid.appendChild(c);
    });
    inner.appendChild(grid);
    const ctaWrap = node("div"); ctaWrap.style.cssText = "display:flex;justify-content:center;margin-top:10px;";
    ctaWrap.appendChild(txt("div", "s-cta", card.cta));
    inner.appendChild(ctaWrap);
  }

  // Mount a slide scaled to fit a host box
  function mountSlide(card, type, host, fitW, fitH) {
    host.innerHTML = "";
    const size = sizeOf(card);
    const slide = renderSlide(card, type);
    const frame = node("div", "slide-frame");
    const scaler = node("div", "slide-scaler");
    scaler.appendChild(slide); frame.appendChild(scaler); host.appendChild(frame);
    let scale = fitW / size.w;
    if (fitH) scale = Math.min(scale, fitH / size.h);
    scale = Math.max(0.04, scale);
    scaler.style.transform = `scale(${scale})`;
    frame.style.width = Math.round(size.w * scale) + "px";
    frame.style.height = Math.round(size.h * scale) + "px";
    return { slide, frame, scale, size };
  }

  /* ============================ TOASTS ============================ */
  function toast(key, kind) {
    const box = $("#toasts");
    const el = node("div", "toast " + (kind || "success"));
    el.appendChild(txt("span", "toast-ic", kind === "error" ? "⚠️" : "✓"));
    el.appendChild(txt("span", null, t(key)));
    box.appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 320); }, 2600);
  }

  /* ============================ ROUTING ============================ */
  function showView(name, scrollId) {
    $$(".view").forEach((v) => v.classList.remove("active"));
    const v = $("#view-" + name); if (v) v.classList.add("active");
    $$(".nav a").forEach((a) => a.classList.remove("active"));
    closeMobile();
    if (name === "home") {
      if (scrollId) { requestAnimationFrame(() => { const tgt = document.getElementById(scrollId); if (tgt) tgt.scrollIntoView({ behavior: "smooth" }); }); }
      else window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    } else { window.scrollTo({ top: 0 }); }
    if (name === "dashboard") renderDashboard();
  }

  /* ============================ STUDIO ============================ */
  function setStep(n) {
    $$("#stepper .stp").forEach((s) => {
      const k = +s.dataset.step;
      s.classList.toggle("active", k === n);
      s.classList.toggle("done", k < n);
    });
    $("#panelUpload").hidden = n !== 1;
    $("#panelAnalyze").hidden = n !== 2;
    $("#panelResult").hidden = n !== 3;
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 15 * 1024 * 1024) { toast("toast.export_fail", "error"); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataURL = await downscale(reader.result, 1000);
      cur.source = { type: "file", dataURL, fileName: file.name };
      startStudio(); startAnalyze();
    };
    reader.readAsDataURL(file);
  }
  function downscale(dataURL, maxDim) {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => {
        let { width: w, height: h } = img;
        if (Math.max(w, h) > maxDim) { const r = maxDim / Math.max(w, h); w = Math.round(w * r); h = Math.round(h * r); }
        const cv = node("canvas"); cv.width = w; cv.height = h;
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        try { res(cv.toDataURL("image/png")); } catch (e) { res(dataURL); }
      };
      img.onerror = () => res(dataURL);
      img.src = dataURL;
    });
  }

  function emojiDataURL(emoji, accent) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><defs><radialGradient id='g' cx='50%' cy='40%' r='70%'><stop offset='0%' stop-color='${accent || "#6d5cff"}' stop-opacity='0.25'/><stop offset='100%' stop-color='${accent || "#6d5cff"}' stop-opacity='0'/></radialGradient></defs><rect width='400' height='400' fill='url(%23g)'/><text x='50%' y='50%' font-size='220' text-anchor='middle' dominant-baseline='central'>${emoji}</text></svg>`;
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  function startStudio() { showView("studio"); }

  function pickSample(sample) {
    const cat = D.CATEGORIES[sample.category];
    cur.source = { type: "sample", emoji: sample.emoji, categoryHint: sample.category, accent: sample.accent };
    startStudio(); startAnalyze();
  }

  async function startAnalyze() {
    setStep(2);
    $("#analyzingBox").hidden = false;
    $("#detectionBox").hidden = true;
    $("#generateBtn").disabled = true; $("#generateBtn").style.opacity = ".55";
    // product preview image
    const prod = $("#prodImg");
    prod.src = cur.source.type === "file" ? cur.source.dataURL : emojiDataURL(cur.source.emoji, cur.source.accent);
    // reset steps
    $$("#analyzeSteps .as").forEach((s) => s.classList.remove("active", "done"));
    const detectionP = AI.analyze(cur.source);
    const steps = $$("#analyzeSteps .as");
    for (let i = 0; i < steps.length; i++) {
      steps[i].classList.add("active");
      await sleep(340 + Math.random() * 260);
      steps[i].classList.remove("active"); steps[i].classList.add("done");
    }
    cur.detection = await detectionP;
    fillDetection();
    $("#analyzingBox").hidden = true;
    $("#detectionBox").hidden = false;
    $("#generateBtn").disabled = false; $("#generateBtn").style.opacity = "1";
  }

  function fillDetection() {
    const det = cur.detection;
    // category select
    const sel = $("#detCategory"); sel.innerHTML = "";
    Object.values(D.CATEGORIES).forEach((c) => {
      const o = node("option"); o.value = c.id; o.textContent = c.emoji + " " + c.name[studioOpts.lang]; sel.appendChild(o);
    });
    sel.value = det.categoryId;
    // palette
    const pal = $("#detPalette"); pal.innerHTML = "";
    det.palette.slice(0, 5).forEach((hex) => { const sw = node("div", "swatch"); sw.style.background = hex; sw.title = hex; pal.appendChild(sw); });
    renderDetChips();
  }
  function renderDetChips() {
    const det = cur.detection; const lang = studioOpts.lang;
    const cat = D.CATEGORIES[det.categoryId];
    const fill = (host, arr) => { host.innerHTML = ""; arr.forEach((x) => host.appendChild(txt("span", "chip", x))); };
    fill($("#detMaterials"), cat.materials[lang]);
    fill($("#detFeatures"), cat.features[lang]);
    fill($("#detAdvantages"), cat.advantages[lang]);
  }

  function buildControls() {
    // marketplace seg
    const mk = $("#mkSeg"); mk.innerHTML = "";
    Object.values(D.MARKETPLACES).forEach((m) => {
      const b = node("button", "mk-" + m.id); b.dataset.mk = m.id; b.textContent = m.short;
      if (m.id === studioOpts.marketplace) b.classList.add("active");
      b.onclick = () => { studioOpts.marketplace = m.id; $$("#mkSeg button").forEach((x) => x.classList.remove("active")); b.classList.add("active"); };
      mk.appendChild(b);
    });
    // language seg
    const lg = $("#langSeg"); lg.innerHTML = "";
    [["ru", "🇷🇺 RU"], ["uz", "🇺🇿 UZ"], ["en", "🇬🇧 EN"]].forEach(([id, label]) => {
      const b = node("button"); b.dataset.lang = id; b.textContent = label;
      if (id === studioOpts.lang) b.classList.add("active");
      b.onclick = () => { studioOpts.lang = id; $$("#langSeg button").forEach((x) => x.classList.remove("active")); b.classList.add("active"); if (cur.detection) { renderDetChips(); refreshCatOptions(); } };
      lg.appendChild(b);
    });
    // styles
    const sg = $("#styleGrid"); sg.innerHTML = "";
    Object.values(D.STYLES).forEach((s) => {
      const c = node("div", "style-card"); if (s.id === studioOpts.style) c.classList.add("active");
      c.appendChild(txt("div", "style-emoji", s.emoji));
      c.appendChild(txt("div", "style-name", s.name[I18N.getLang()]));
      c.onclick = () => { studioOpts.style = s.id; $$("#styleGrid .style-card").forEach((x) => x.classList.remove("active")); c.classList.add("active"); };
      sg.appendChild(c);
    });
    // category change
    $("#detCategory").onchange = (e) => { cur.detection.categoryId = e.target.value; cur.detection.accent = AI.vibrant(cur.detection.palette, D.CATEGORIES[e.target.value].accent); cur.detection.emoji = D.CATEGORIES[e.target.value].emoji; renderDetChips(); fillPalette(); };
  }
  function fillPalette() {
    const pal = $("#detPalette"); pal.innerHTML = "";
    cur.detection.palette.slice(0, 5).forEach((hex) => { const sw = node("div", "swatch"); sw.style.background = hex; pal.appendChild(sw); });
  }
  function refreshCatOptions() {
    const sel = $("#detCategory"); const v = sel.value; sel.innerHTML = "";
    Object.values(D.CATEGORIES).forEach((c) => { const o = node("option"); o.value = c.id; o.textContent = c.emoji + " " + c.name[studioOpts.lang]; sel.appendChild(o); });
    sel.value = v;
  }

  function doGenerate(isVariant) {
    if (creditsLeft() <= 0) { openModal("limitModal"); return; }
    state.used++;
    const opts = { lang: studioOpts.lang, style: studioOpts.style, marketplace: studioOpts.marketplace, name: $("#nameInput").value, prompt: $("#promptInput").value };
    const det = cur.detection;
    const card = makeCard(det, opts);
    cur.card = card; cur.slideType = "main";
    const project = { id: card.id, createdAt: card.createdAt, card };
    state.projects.unshift(project);
    state.projects = state.projects.slice(0, 30);
    cur.projectRef = project;
    save();
    runGenOverlay().then(() => { setStep(3); showResult(); updateUsageUI(); toast(isVariant ? "toast.variant" : "toast.copy_done"); });
  }

  function runGenOverlay() {
    const ov = $("#genOverlay"); const bar = $("#genBarFill");
    ov.hidden = false; bar.style.width = "0%";
    return new Promise((res) => {
      let p = 0;
      const iv = setInterval(() => { p += rand(8, 20); bar.style.width = Math.min(100, p) + "%"; if (p >= 100) { clearInterval(iv); setTimeout(() => { ov.hidden = true; res(); }, 250); } }, 160);
    });
  }

  function showResult() {
    renderStage();
    renderThumbs();
  }
  function renderStage() {
    const host = $("#resultStage");
    const w = host.clientWidth || 520;
    mountSlide(cur.card, cur.slideType, host, Math.min(w, 560), Math.round(window.innerHeight * 0.66));
  }
  function renderThumbs() {
    const box = $("#slidesThumbs"); box.innerHTML = "";
    SLIDE_TYPES.forEach((type, i) => {
      const row = node("div", "sthumb" + (type === cur.slideType ? " active" : ""));
      const frameHost = node("div", "sthumb-frame");
      const meta = node("div");
      meta.appendChild(txt("div", "sthumb-name", tl(I18N.getLang(), "slide." + type)));
      meta.appendChild(txt("div", "sthumb-i", (i + 1) + " / " + SLIDE_TYPES.length));
      row.appendChild(frameHost); row.appendChild(meta);
      row.onclick = () => { cur.slideType = type; renderStage(); $$("#slidesThumbs .sthumb").forEach((x) => x.classList.remove("active")); row.classList.add("active"); };
      box.appendChild(row);
      mountSlide(cur.card, type, frameHost, 54);
    });
  }

  /* ============================ EDITOR ============================ */
  let editorTab = "content";
  function openEditor() {
    if (!cur.card) return;
    openModal("editorModal");
    renderEditorStage();
    buildEditorFields();
  }
  function renderEditorStage() {
    const host = $("#editorStage");
    const wrap = host.parentElement;
    const w = (wrap.clientWidth || 480) - 56;
    mountSlide(cur.card, cur.slideType, host, Math.max(180, w), window.innerHeight * 0.66);
  }
  function liveUpdate() { renderEditorStage(); }

  function field(labelKey, inputEl) {
    const f = node("div", "efield");
    f.appendChild(txt("label", null, t(labelKey)));
    f.appendChild(inputEl);
    return f;
  }
  function textInput(value, onInput) { const i = node("input"); i.type = "text"; i.value = value || ""; i.oninput = () => onInput(i.value); return i; }
  function textArea(value, onInput) { const i = node("textarea"); i.rows = 2; i.value = value || ""; i.oninput = () => onInput(i.value); return i; }
  function toggle(labelKey, val, onChange) {
    const row = node("div", "etoggle"); row.appendChild(txt("span", null, t(labelKey)));
    const sw = node("button", "switch" + (val ? " on" : "")); sw.appendChild(node("span", "knob"));
    sw.onclick = () => { const on = !sw.classList.contains("on"); sw.classList.toggle("on", on); onChange(on); };
    row.appendChild(sw); return row;
  }

  function buildEditorFields() {
    const host = $("#editorFields"); host.innerHTML = "";
    $$(".etab").forEach((b) => b.classList.toggle("active", b.dataset.etab === editorTab));
    const c = cur.card;
    if (editorTab === "content") {
      host.appendChild(field("editor.headline", textInput(c.headline, (v) => { c.headline = v; liveUpdate(); })));
      host.appendChild(field("editor.subheadline", textArea(c.sub, (v) => { c.sub = v; liveUpdate(); })));
      host.appendChild(field("editor.brand", textInput(c.brand, (v) => { c.brand = v.toUpperCase(); liveUpdate(); })));
      host.appendChild(field("editor.badge", textInput(c.badge, (v) => { c.badge = v; liveUpdate(); })));
      host.appendChild(toggle("editor.show_badge", c.showBadge, (v) => { c.showBadge = v; liveUpdate(); }));
      const pr = node("div"); pr.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:10px;";
      pr.appendChild(field("editor.price", textInput(c.price, (v) => { c.price = v; liveUpdate(); })));
      pr.appendChild(field("editor.oldprice", textInput(c.oldPrice, (v) => { c.oldPrice = v; liveUpdate(); })));
      host.appendChild(pr);
      host.appendChild(toggle("editor.show_price", c.showPrice, (v) => { c.showPrice = v; liveUpdate(); }));
      host.appendChild(toggle("editor.show_rating", c.showRating, (v) => { c.showRating = v; liveUpdate(); }));
      // blocks (benefits)
      const blocksLabel = txt("label", null, t("editor.add_block")); blocksLabel.style.cssText = "font-size:12.5px;font-weight:700;color:var(--text-2);margin-top:6px;";
      host.appendChild(blocksLabel);
      c.benefits = c.benefits || [];
      const blocksWrap = node("div"); blocksWrap.style.cssText = "display:flex;flex-direction:column;gap:8px;";
      function renderBlocks() {
        blocksWrap.innerHTML = "";
        c.benefits.forEach((b, idx) => {
          const row = node("div", "feature-edit");
          row.appendChild(textInput(b.t, (v) => { b.t = v; liveUpdate(); }));
          const del = txt("button", "feature-del", "🗑"); del.onclick = () => { c.benefits.splice(idx, 1); renderBlocks(); liveUpdate(); };
          row.appendChild(del); blocksWrap.appendChild(row);
        });
      }
      renderBlocks();
      host.appendChild(blocksWrap);
      const add = txt("button", "btn btn-ghost btn-block", "＋ " + t("editor.add_block"));
      add.onclick = () => { c.benefits.push({ icon: "✨", t: t("editor.feature_ph"), d: "" }); renderBlocks(); liveUpdate(); };
      host.appendChild(add);
    } else if (editorTab === "design") {
      // accent swatches from palette + presets
      const accLabel = txt("label", null, t("editor.accent")); host.appendChild(accLabel);
      const row = node("div", "color-row");
      const presets = (c.palette || []).concat(["#6d5cff", "#ff5470", "#22c08b", "#f5b13a", "#3b82f6", "#e07aa8"]);
      Array.from(new Set(presets)).slice(0, 10).forEach((hex) => {
        const d = node("div", "color-dot" + (hex.toLowerCase() === (c.accent || "").toLowerCase() ? " active" : ""));
        d.style.background = hex; d.onclick = () => { c.accent = hex; buildEditorFields(); liveUpdate(); };
        row.appendChild(d);
      });
      const cp = node("input", "color-pick"); cp.type = "color"; cp.value = /^#([0-9a-f]{6})$/i.test(c.accent) ? c.accent : "#6d5cff";
      cp.oninput = () => { c.accent = cp.value; liveUpdate(); };
      row.appendChild(cp);
      host.appendChild(row);
      // styles
      host.appendChild(txt("label", null, t("editor.style")));
      const sg = node("div", "estyle-grid");
      Object.values(D.STYLES).forEach((s) => {
        const card = node("div", "style-card" + (s.id === c.style ? " active" : ""));
        card.appendChild(txt("div", "style-emoji", s.emoji));
        card.appendChild(txt("div", "style-name", s.name[I18N.getLang()]));
        card.onclick = () => { c.style = s.id; buildEditorFields(); liveUpdate(); };
        sg.appendChild(card);
      });
      host.appendChild(sg);
      // font
      const fsel = node("select");
      [["jakarta", "Jakarta (Display)"], ["inter", "Inter (Clean)"], ["mono", "Mono (Tech)"]].forEach(([v, l]) => { const o = node("option"); o.value = v; o.textContent = l; if (v === c.font) o.selected = true; fsel.appendChild(o); });
      fsel.onchange = () => { c.font = fsel.value; liveUpdate(); };
      host.appendChild(field("editor.font", fsel));
    } else if (editorTab === "layout") {
      const msel = node("select");
      Object.values(D.MARKETPLACES).forEach((m) => { const o = node("option"); o.value = m.id; o.textContent = m.name; if (m.id === c.marketplace) o.selected = true; msel.appendChild(o); });
      msel.onchange = () => { c.marketplace = msel.value; liveUpdate(); };
      host.appendChild(field("editor.marketplace_size", msel));
      const ssel = node("select");
      D.SIZES.forEach((s) => { const o = node("option"); o.value = s.id; o.textContent = s.label; if (s.id === c.sizeId) o.selected = true; ssel.appendChild(o); });
      ssel.onchange = () => { c.sizeId = ssel.value; liveUpdate(); };
      host.appendChild(field("editor.layout", ssel));
    }
  }

  function closeEditor() {
    closeModal("editorModal");
    save();
    if (!$("#panelResult").hidden) showResult();
    toast("toast.applied");
  }

  /* ============================ EXPORT ============================ */
  async function renderFullForExport(card, type) {
    const root = $("#exportRoot");
    const slide = renderSlide(card, type);
    root.appendChild(slide);
    // wait for product image + fonts
    const imgs = $$("img", slide);
    await Promise.all(imgs.map((im) => im.complete ? Promise.resolve() : new Promise((r) => { im.onload = im.onerror = r; })));
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
    return slide;
  }
  async function captureSlide(card, type) {
    if (!window.html2canvas) throw new Error("nolib");
    const slide = await renderFullForExport(card, type);
    const size = sizeOf(card);
    const scale = planOf().watermark ? 1 : 2; // HD for paid plans
    const canvas = await window.html2canvas(slide, { backgroundColor: null, scale, width: size.w, height: size.h, windowWidth: size.w, windowHeight: size.h, logging: false, useCORS: true });
    slide.remove();
    return canvas;
  }
  function downloadDataURL(url, name) { const a = node("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }

  async function exportPng() {
    if (!cur.card) return;
    if (!window.html2canvas) { toast("toast.export_fail", "error"); return; }
    const btn = $("#dlPngBtn"); const old = btn.innerHTML; btn.innerHTML = "⏳"; btn.disabled = true;
    try {
      const canvas = await captureSlide(cur.card, cur.slideType);
      downloadDataURL(canvas.toDataURL("image/png"), `kartix-${cur.card.marketplace}-${cur.slideType}.png`);
      toast("toast.downloaded");
    } catch (e) { toast("toast.export_fail", "error"); }
    btn.innerHTML = old; btn.disabled = false;
  }
  async function exportPdf() {
    if (!cur.card) return;
    const jspdfNS = window.jspdf || window.jsPDF;
    if (!window.html2canvas || !jspdfNS) { toast("toast.export_fail", "error"); return; }
    const JsPDF = jspdfNS.jsPDF || jspdfNS;
    const btn = $("#dlPdfBtn"); const old = btn.innerHTML; btn.innerHTML = "⏳"; btn.disabled = true;
    try {
      const size = sizeOf(cur.card);
      const pdf = new JsPDF({ orientation: size.w > size.h ? "l" : "p", unit: "px", format: [size.w, size.h] });
      for (let i = 0; i < SLIDE_TYPES.length; i++) {
        const canvas = await captureSlide(cur.card, SLIDE_TYPES[i]);
        const img = canvas.toDataURL("image/jpeg", 0.92);
        if (i > 0) pdf.addPage([size.w, size.h], size.w > size.h ? "l" : "p");
        pdf.addImage(img, "JPEG", 0, 0, size.w, size.h);
      }
      pdf.save(`kartix-${cur.card.marketplace}.pdf`);
      toast("toast.pdf_ready");
    } catch (e) { toast("toast.export_fail", "error"); }
    btn.innerHTML = old; btn.disabled = false;
  }
  async function exportCardPng(card, type) {
    if (!window.html2canvas) { toast("toast.export_fail", "error"); return; }
    try { const canvas = await captureSlide(card, type || "main"); downloadDataURL(canvas.toDataURL("image/png"), `kartix-${card.marketplace}-main.png`); toast("toast.downloaded"); }
    catch (e) { toast("toast.export_fail", "error"); }
  }

  /* ============================ SAVE / PROJECTS ============================ */
  function saveProject() {
    if (!cur.card) return;
    const copy = JSON.parse(JSON.stringify(cur.card)); copy.id = uid();
    state.saved.unshift({ id: copy.id, createdAt: Date.now(), card: copy });
    state.saved = state.saved.slice(0, 40);
    save(); toast("toast.saved"); updateUsageUI();
  }

  /* ============================ DASHBOARD ============================ */
  let dashTab = "projects";
  function renderDashboard() {
    $("#dashName").textContent = state.user ? state.user.name : t("auth.guest").replace(/.*/, state.user ? state.user.name : "Guest");
    $("#dashName").textContent = state.user ? state.user.name : "Guest";
    $("#statCreated").textContent = state.projects.length;
    $("#statSaved").textContent = state.saved.length;
    $("#statCredits").textContent = creditsLeft() > 9000 ? "∞" : creditsLeft();
    $("#statPlan").textContent = capitalize(state.plan);
    $$(".dtab").forEach((b) => b.classList.toggle("active", b.dataset.tab === dashTab));
    $("#tabProjects").hidden = dashTab !== "projects";
    $("#tabSaved").hidden = dashTab !== "saved";
    $("#tabAccount").hidden = dashTab !== "account";
    if (dashTab === "projects") renderProjectGrid($("#projectsGrid"), state.projects, $("#emptyProjects"), false);
    if (dashTab === "saved") renderProjectGrid($("#savedGrid"), state.saved, $("#emptySaved"), true);
    if (dashTab === "account") renderAccount();
  }
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function renderProjectGrid(grid, list, emptyEl, isSaved) {
    grid.innerHTML = "";
    emptyEl.hidden = list.length > 0;
    grid.hidden = list.length === 0;
    list.forEach((p) => {
      const card = p.card;
      const pc = node("div", "pcard");
      const prev = node("div", "pcard-prev");
      const badges = node("div", "pcard-badges");
      const mk = D.MARKETPLACES[card.marketplace];
      const mkB = txt("span", "pcard-mk", mk.short); mkB.style.background = mk.color; badges.appendChild(mkB);
      badges.appendChild(txt("span", "pcard-lang", { ru: "🇷🇺", uz: "🇺🇿", en: "🇬🇧" }[card.lang] || "🌐"));
      prev.appendChild(badges);
      pc.appendChild(prev);
      const body = node("div", "pcard-body");
      body.appendChild(txt("div", "pcard-title", card.title || card.headline));
      body.appendChild(txt("div", "pcard-date", new Date(p.createdAt).toLocaleDateString()));
      const actions = node("div", "pcard-actions");
      const open = txt("button", "btn btn-ghost", t("dashboard.card.open")); open.onclick = () => openProject(p);
      const variant = txt("button", "pcard-icon-btn", "🔁"); variant.title = t("dashboard.card.variant"); variant.onclick = () => variantFrom(p);
      const dl = txt("button", "pcard-icon-btn", "⬇️"); dl.title = t("dashboard.card.download"); dl.onclick = () => exportCardPng(card, "main");
      const del = txt("button", "pcard-icon-btn", "🗑"); del.title = t("dashboard.card.delete"); del.onclick = () => { (isSaved ? state.saved : state.projects).splice((isSaved ? state.saved : state.projects).indexOf(p), 1); save(); renderDashboard(); toast("toast.deleted"); };
      actions.appendChild(open); actions.appendChild(variant); actions.appendChild(dl); actions.appendChild(del);
      body.appendChild(actions);
      pc.appendChild(body);
      grid.appendChild(pc);
      mountSlide(card, "main", prev, prev.clientWidth || 220);
    });
  }
  function openProject(p) {
    cur.card = p.card; cur.projectRef = p; cur.slideType = "main";
    cur.detection = detFromCard(p.card);
    studioOpts = { marketplace: p.card.marketplace, lang: p.card.lang, style: p.card.style };
    showView("studio"); setStep(3); showResult();
  }
  function variantFrom(p) {
    if (creditsLeft() <= 0) { showView("home", "pricing"); openModal("limitModal"); return; }
    state.used++;
    const det = detFromCard(p.card);
    const card = makeCard(det, { lang: p.card.lang, style: p.card.style, marketplace: p.card.marketplace, prompt: p.card.prompt });
    const project = { id: card.id, createdAt: card.createdAt, card };
    state.projects.unshift(project); state.projects = state.projects.slice(0, 30);
    cur.card = card; cur.projectRef = project; cur.slideType = "main"; cur.detection = det;
    studioOpts = { marketplace: card.marketplace, lang: card.lang, style: card.style };
    save(); showView("studio"); setStep(3); showResult(); updateUsageUI(); toast("toast.variant");
  }
  function renderAccount() {
    const u = state.user || { name: "Guest", email: "—" };
    $("#accAvatar").textContent = initials(u.name);
    $("#accName").textContent = u.name; $("#accEmail").textContent = u.email;
    $("#accPlanBadge").textContent = capitalize(state.plan);
    const total = planOf().credits; const used = state.used;
    $("#usageUsed").textContent = used; $("#usageTotal").textContent = total > 9000 ? "∞" : total;
    $("#usageFill").style.width = total > 9000 ? "12%" : Math.min(100, (used / total) * 100) + "%";
  }
  const initials = (n) => (n || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  function updateUsageUI() {
    const left = creditsLeft();
    $("#creditsLeft").textContent = left > 9000 ? "∞" : left;
    $("#statCredits") && ($("#statCredits").textContent = left > 9000 ? "∞" : left);
  }

  /* ============================ AUTH ============================ */
  let authMode = "login";
  function openAuth(mode) { authMode = mode || "login"; renderAuth(); openModal("authModal"); }
  function renderAuth() {
    const reg = authMode === "register";
    $("#authTitle").textContent = t(reg ? "auth.register.title" : "auth.login.title");
    $("#authSub").textContent = t(reg ? "auth.register.sub" : "auth.login.sub");
    $("#nameField").hidden = !reg;
    $("#authSubmit").textContent = t(reg ? "auth.register.btn" : "auth.login.btn");
    $("#authToggle").textContent = t(reg ? "auth.toggle.to_login" : "auth.toggle.to_register");
  }
  function submitAuth() {
    const email = $("#authEmail").value.trim();
    const pass = $("#authPassword").value;
    const name = $("#authName").value.trim();
    if (!email || !/.+@.+\..+/.test(email)) { $("#authEmail").focus(); return; }
    if (pass.length < 6) { $("#authPassword").focus(); return; }
    if (authMode === "register" && !name) { $("#authName").focus(); return; }
    state.user = { name: name || email.split("@")[0], email };
    save(); updateAuthUI(); closeModal("authModal");
    toast(authMode === "register" ? "toast.register_ok" : "toast.login_ok");
  }
  function updateAuthUI() {
    const has = !!state.user;
    $("#avatarBtn").hidden = !has;
    $("#loginBtn").style.display = has ? "none" : "";
    if (has) $("#avatarInitials").textContent = initials(state.user.name);
  }
  function logout() { state.user = null; save(); updateAuthUI(); showView("home"); toast("toast.logout"); }

  /* ============================ PRICING ============================ */
  function renderPricing() {
    const grid = $("#pricingGrid"); grid.innerHTML = "";
    const lang = I18N.getLang();
    const check = '<svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>';
    ["free", "pro", "business"].forEach((id) => {
      const plan = D.PLANS[id];
      const el = node("div", "plan" + (plan.popular ? " plan-pop" : ""));
      if (plan.popular) el.appendChild(txt("div", "plan-tag", t("pricing.popular")));
      el.appendChild(txt("div", "plan-name", t("pricing." + id + ".name")));
      el.appendChild(txt("div", "plan-desc", t("pricing." + id + ".d")));
      const price = node("div", "plan-price");
      const val = state.billing === "y" ? plan.price.y : plan.price.m;
      price.appendChild(txt("b", null, val === 0 ? "0" : fmtPrice(val)));
      price.appendChild(txt("small", null, t("pricing.mo")));
      el.appendChild(price);
      el.appendChild(txt("div", "plan-cur", val === 0 ? currency(lang) : currency(lang) + (state.billing === "y" ? " · " + t("pricing.yearly").replace("−20%", "").trim() : "")));
      const ul = node("ul", "plan-feats");
      plan.features.forEach((fk) => { const li = node("li"); li.innerHTML = check; li.appendChild(txt("span", null, t(fk))); ul.appendChild(li); });
      el.appendChild(ul);
      const isCurrent = state.plan === id;
      const btn = txt("button", "btn " + (plan.popular ? "btn-primary" : "btn-ghost") + (isCurrent ? " plan-current" : ""), isCurrent ? t("pricing.current") : t("pricing.cta_" + id));
      if (!isCurrent) btn.onclick = () => choosePlan(id);
      el.appendChild(btn);
      grid.appendChild(el);
    });
  }
  function choosePlan(id) {
    state.plan = id; state.used = 0; save();
    renderPricing(); updateUsageUI(); updateAuthUI();
    toast("toast.plan_changed");
  }

  /* ============================ TEMPLATES / SAMPLES ============================ */
  function renderTemplates() {
    const grid = $("#tmplGrid"); grid.innerHTML = "";
    const lang = I18N.getLang();
    Object.values(D.MARKETPLACES).forEach((m) => {
      const tm = node("div", "tmpl");
      const prev = node("div", "tmpl-preview");
      prev.style.background = `linear-gradient(150deg, ${rgba(m.color, 0.18)}, ${rgba(m.color2, 0.12)})`;
      const mini = node("div", "tmpl-mini");
      mini.style.background = `linear-gradient(165deg, ${m.color}, ${m.color2})`;
      mini.appendChild(txt("div", "tmpl-mini-badge", "-40%"));
      const sampleEmoji = { uzum: "🪑", wb: "👜", ozon: "🎧" }[m.id] || "📦";
      mini.appendChild(txt("div", "tmpl-mini-emoji", sampleEmoji));
      mini.appendChild(node("div", "tmpl-mini-bar"));
      mini.appendChild(node("div", "tmpl-mini-bar sm"));
      prev.appendChild(mini);
      tm.appendChild(prev);
      const body = node("div", "tmpl-body");
      const logo = txt("div", "tmpl-logo " + ("tl-" + m.id), m.name); body.appendChild(logo);
      body.appendChild(txt("p", null, t("templates." + m.id + ".d")));
      const meta = node("div", "tmpl-meta");
      const sz = node("span"); sz.innerHTML = t("templates.size") + ": <b>" + m.width + "×" + m.height + "</b>"; meta.appendChild(sz);
      const sl = node("span"); sl.innerHTML = "<b>5</b> " + t("templates.slides_n"); meta.appendChild(sl);
      body.appendChild(meta);
      const btn = txt("button", "btn btn-ghost", t("templates.try"));
      btn.onclick = () => { studioOpts.marketplace = m.id; showView("studio"); setStep(1); };
      body.appendChild(btn);
      tm.appendChild(body);
      grid.appendChild(tm);
    });
  }
  function renderSamples() {
    const row = $("#samplesRow"); row.innerHTML = "";
    D.SAMPLES.forEach((s) => {
      const el = node("button", "sample");
      el.appendChild(txt("div", "sample-emoji", s.emoji));
      el.appendChild(txt("div", "sample-label", s.label[I18N.getLang()]));
      el.onclick = () => pickSample(s);
      row.appendChild(el);
    });
  }

  /* ============================ MODALS ============================ */
  function openModal(id) { $("#" + id).hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal(id) { $("#" + id).hidden = true; document.body.style.overflow = ""; }
  function closeAllModals() { $$(".modal").forEach((m) => (m.hidden = true)); document.body.style.overflow = ""; }

  /* ============================ THEME / LANG / MOBILE ============================ */
  function applyTheme() { document.documentElement.setAttribute("data-theme", state.theme); }
  function toggleTheme() { state.theme = state.theme === "dark" ? "light" : "dark"; applyTheme(); save(); }
  function setLangUI() {
    const lang = I18N.getLang();
    $("#langFlag").textContent = { ru: "🇷🇺", uz: "🇺🇿", en: "🇬🇧" }[lang];
    $("#langCode").textContent = lang.toUpperCase();
    $$("#langMenu button").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
  }
  function buildHeroTitle() {
    const h = $("#heroTitle"); const full = t("hero.title"); const acc = t("hero.title_accent");
    h.innerHTML = "";
    if (acc && full.includes(acc)) {
      const parts = full.split(acc);
      h.appendChild(document.createTextNode(parts[0]));
      h.appendChild(txt("span", "grad", acc));
      h.appendChild(document.createTextNode(parts[1] || ""));
    } else h.textContent = full;
  }
  function closeMobile() { $("#nav").classList.remove("open"); $("#mobileBackdrop").classList.remove("show"); }

  function onLangChange() {
    I18N.applyTranslations();
    setLangUI();
    buildHeroTitle();
    renderTemplates(); renderSamples(); renderPricing();
    if (cur.detection) { refreshCatOptions(); }
    // rebuild style/lang labels in controls
    buildControls();
    if (state.user || true) renderDashboard();
    if (!$("#panelResult").hidden && cur.card) renderThumbs();
  }

  /* ============================ REVEAL / COUNTERS ============================ */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); if (e.target.querySelector("[data-count]") || e.target.hasAttribute("data-count")) animateCounters(e.target); } });
    }, { threshold: 0.12 });
    $$(".reveal").forEach((el) => io.observe(el));
  }
  function animateCounters(scope) {
    $$("[data-count]", scope.parentElement || document).forEach((el) => {
      if (el.dataset.done) return; el.dataset.done = "1";
      const target = +el.dataset.count; const dur = 1400; const start = performance.now();
      const step = (now) => { const p = Math.min(1, (now - start) / dur); el.textContent = fmtPrice(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }

  /* ============================ EVENTS / INIT ============================ */
  function bind() {
    // delegated nav + scroll + close
    document.addEventListener("click", (e) => {
      const navEl = e.target.closest("[data-nav]");
      const scrollEl = e.target.closest("[data-scroll]");
      const closeEl = e.target.closest("[data-close]");
      if (navEl && !scrollEl) { e.preventDefault(); showView(navEl.dataset.nav); return; }
      if (scrollEl) { e.preventDefault(); const navTarget = scrollEl.dataset.nav || "home"; showView(navTarget, scrollEl.dataset.scroll); closeAllModals(); return; }
      if (closeEl) { const modal = closeEl.closest(".modal"); if (modal) closeModal(modal.id); return; }
    });

    // header
    $("#themeToggle").onclick = () => { toggleTheme(); };
    $("#loginBtn").onclick = () => openAuth("login");
    $("#langBtn").onclick = (e) => { e.stopPropagation(); $("#langSwitch").classList.toggle("open"); $("#langBtn").setAttribute("aria-expanded", $("#langSwitch").classList.contains("open")); };
    document.addEventListener("click", () => $("#langSwitch").classList.remove("open"));
    $$("#langMenu button").forEach((b) => (b.onclick = (e) => { e.stopPropagation(); I18N.setLang(b.dataset.lang); studioOpts.lang = b.dataset.lang; $("#langSwitch").classList.remove("open"); }));
    $("#burger").onclick = () => { const open = $("#nav").classList.toggle("open"); $("#mobileBackdrop").classList.toggle("show", open); };
    $("#mobileBackdrop").onclick = closeMobile;
    $$("#nav a").forEach((a) => (a.onclick = () => closeMobile()));

    // hero drop
    const heroDrop = $("#heroDrop"), heroFile = $("#heroFile");
    heroDrop.onclick = (e) => { if (!e.target.closest("button") || e.target.id === "heroDropBtn") heroFile.click(); };
    heroFile.onchange = () => heroFile.files[0] && handleFile(heroFile.files[0]);
    dndZone(heroDrop, "drag", handleFile);

    // studio upload
    const uz = $("#uploadZone"), sf = $("#studioFile");
    uz.onclick = (e) => { if (e.target.id !== "studioPick") sf.click(); };
    $("#studioPick").onclick = (e) => { e.stopPropagation(); sf.click(); };
    sf.onchange = () => sf.files[0] && handleFile(sf.files[0]);
    dndZone(uz, "drag", handleFile);
    $("#prodChange").onclick = () => setStep(1);

    // generate / result actions
    $("#generateBtn").onclick = () => doGenerate(false);
    $("#variantBtn").onclick = () => { studioOpts = { marketplace: cur.card.marketplace, lang: cur.card.lang, style: cur.card.style }; doGenerate(true); };
    $("#editBtn").onclick = openEditor;
    $("#dlPngBtn").onclick = exportPng;
    $("#dlPdfBtn").onclick = exportPdf;
    $("#saveBtn").onclick = saveProject;
    $("#newUploadBtn").onclick = () => setStep(1);

    // editor
    $("#editorDone").onclick = closeEditor;
    $$(".etab").forEach((b) => (b.onclick = () => { editorTab = b.dataset.etab; buildEditorFields(); }));

    // auth
    $("#authSubmit").onclick = submitAuth;
    $("#authToggle").onclick = () => { authMode = authMode === "login" ? "register" : "login"; renderAuth(); };
    $("#guestBtn").onclick = () => { if (!state.user) state.user = { name: "Guest", email: "guest@kartix.ai", guest: true }; save(); updateAuthUI(); closeModal("authModal"); showView("studio"); };
    $("#logoutBtn").onclick = logout;

    // pricing billing
    $("#billingSwitch").onclick = () => { state.billing = state.billing === "m" ? "y" : "m"; $("#billingSwitch").classList.toggle("on", state.billing === "y"); $("#btMonthly").classList.toggle("active", state.billing === "m"); $("#btYearly").classList.toggle("active", state.billing === "y"); save(); renderPricing(); };

    // dashboard tabs
    $$(".dtab").forEach((b) => (b.onclick = () => { dashTab = b.dataset.tab; renderDashboard(); }));

    // language change
    document.addEventListener("languagechange", onLangChange);

    // escape closes modals
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAllModals(); });

    // header shadow on scroll
    window.addEventListener("scroll", () => { $("#header").style.boxShadow = window.scrollY > 10 ? "0 8px 30px -12px rgba(0,0,0,.3)" : "none"; }, { passive: true });

    // showcase parallax
    const sc = $("#showcase");
    if (sc) sc.addEventListener("mousemove", (e) => { const r = sc.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5; const c1 = sc.querySelector(".showcase-card-1"); if (c1) c1.style.transform = `rotateY(${-16 + x * 8}deg) rotateX(${6 - y * 8}deg) translateZ(40px)`; });

    // re-render result stage on resize
    let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (!$("#panelResult").hidden && cur.card) renderStage(); }, 200); });
  }

  function dndZone(zone, cls, cb) {
    ["dragenter", "dragover"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add(cls); }));
    ["dragleave", "drop"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); if (ev === "dragleave" && zone.contains(e.relatedTarget)) return; zone.classList.remove(cls); }));
    zone.addEventListener("drop", (e) => { const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) cb(f); });
  }

  function init() {
    applyTheme();
    I18N.applyTranslations();
    setLangUI();
    buildHeroTitle();
    studioOpts.lang = I18N.getLang();
    $("#year").textContent = new Date().getFullYear();
    $("#billingSwitch").classList.toggle("on", state.billing === "y");
    $("#btMonthly").classList.toggle("active", state.billing === "m");
    $("#btYearly").classList.toggle("active", state.billing === "y");
    renderTemplates(); renderSamples(); renderPricing(); buildControls();
    updateAuthUI(); updateUsageUI();
    setStep(1);
    bind();
    initReveal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
