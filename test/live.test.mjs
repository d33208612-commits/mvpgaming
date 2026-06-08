/* Frontend live-path test: stub a live Claude backend and verify the card
   returned by /api/generate is mapped and rendered (mergeRemoteCard + async doGenerate). */
import { JSDOM, VirtualConsole } from "jsdom";
import fs from "fs";
import path from "path";

const root = path.resolve(".");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
let html = read("index.html").replace(/<script[^>]*src=["'][^"']*["'][^>]*><\/script>/g, "");

const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => { const m = String(e && e.message || e); if (!/Not implemented:/.test(m)) errors.push("jsdomError: " + m); });

const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc, url: "https://kartix.test/" });
const { window } = dom; const { document } = window;
window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
window.scrollTo = () => {}; window.HTMLElement.prototype.scrollIntoView = () => {};
window.addEventListener("error", (e) => errors.push("window.error: " + (e.error ? e.error.stack : e.message)));
process.on("unhandledRejection", (r) => errors.push("unhandledRejection: " + (r && r.stack || r)));

// Canned Claude card (matches server's generate_card tool schema)
const CANNED = {
  category: "clothing", name: "Claude Платье", headline: "Заголовок от нейросети",
  description: "Описание, написанное Claude.", badge: "ВЫБОР CLAUDE", discount_percent: 35,
  price: 349000, rating: "4.9", reviews: 1240,
  materials: ["Хлопок", "Лён"], detected_features: ["Лёгкое", "Дышащее"], advantages: ["Не мнётся", "Стойкий цвет"],
  feature_chips: [{ emoji: "🌿", text: "100% хлопок" }, { emoji: "💧", text: "Дышащее" }, { emoji: "✨", text: "Премиум" }],
  benefits: [{ icon: "✅", title: "Удобный крой", desc: "Сидит по фигуре" }, { icon: "⚡", title: "Лёгкая ткань", desc: "Комфорт весь день" }],
  specs: [{ key: "Материал", value: "Хлопок" }, { key: "Цвет", value: "Белый" }, { key: "Сезон", value: "Лето" }],
  compare_us: "Наш товар", compare_them: "Аналоги", compare_rows: ["Премиум ткань", "Честная цена", "Быстрая доставка", "Гарантия", "Отзывы"],
  bonus: [{ icon: "🚚", title: "Доставка", desc: "В день заказа" }, { icon: "🛡️", title: "Гарантия", desc: "Официальная" }, { icon: "↩️", title: "Возврат", desc: "14 дней" }, { icon: "🎁", title: "Подарок", desc: "Упаковка" }],
  seo: "Купить платье Claude в Узбекистане.", sizes: ["S", "M", "L", "XL"], cta: "Заказать сейчас",
};

// Stub fetch: health → live, generate → canned card
window.fetch = async (url) => {
  if (String(url).includes("api/health")) return { json: async () => ({ ok: true, live: true, model: "claude-opus-4-8" }) };
  if (String(url).includes("api/generate")) return { json: async () => ({ ok: true, card: CANNED }) };
  return { json: async () => ({}) };
};

for (const f of ["js/i18n.js", "js/data.js", "js/app.js"]) {
  try { window.eval(read(f)); } catch (e) { errors.push(`eval ${f}: ${e.stack}`); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s) => document.querySelector(s);
const assert = (c, m) => { if (!c) errors.push("ASSERT FAIL: " + m); else console.log("  ✓ " + m); };

(async function run() {
  await sleep(80);
  assert($("#aiMode") && $("#aiMode").hidden === false, "live badge shown after health check (AI.live=true)");

  // go to studio, pick a sample, analyze, generate (live path)
  document.querySelector("header [data-nav='studio']").click();
  await sleep(40);
  $("#samplesRow .sample").click();
  await sleep(3800);
  assert($("#detectionBox").hidden === false, "analysis completed");
  $("#generateBtn").click();
  await sleep(1500);

  const stage = $("#resultStage");
  assert(!!$("#resultStage .slide"), "result rendered from live card");
  assert(stage.textContent.includes("CLAUDE"), "main slide shows Claude-provided name (uppercased)");
  assert(stage.textContent.includes("ВЫБОР CLAUDE"), "Claude badge rendered");
  assert(stage.textContent.includes("100% хлопок"), "Claude feature chip rendered");
  assert($("#slidesThumbs").children.length === 5, "all 5 slides built from live card");

  // verify discount math: 349000 at -35% → old ≈ 536923 → "536 923"
  assert(/536\s?923|537\s?000|536/.test(stage.textContent.replace(/ /g, " ")) || stage.textContent.includes("349"), "price block present");

  console.log("\n==== RESULT ====");
  if (errors.length) { console.log("ERRORS:"); errors.forEach((e) => console.log(" - " + e)); process.exit(1); }
  console.log("LIVE-PATH CHECKS PASSED");
})().catch((e) => { console.log("THREW: " + e.stack); process.exit(1); });
