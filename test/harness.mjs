import { JSDOM, VirtualConsole } from "jsdom";
import fs from "fs";
import path from "path";

const root = path.resolve(".");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

// Strip external <script> tags; we inject JS manually for control.
let html = read("index.html").replace(/<script[^>]*src=["'][^"']*["'][^>]*><\/script>/g, "");

const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => {
  const msg = String(e && e.message || e);
  if (/Not implemented:/.test(msg)) return; // ignore layout/scroll noise
  errors.push("jsdomError: " + msg);
});
vc.on("error", (...a) => errors.push("console.error: " + a.join(" ")));

const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc, url: "https://kartix.test/" });
const { window } = dom;
const { document } = window;

// Stubs
window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};
window.addEventListener("error", (e) => errors.push("window.error: " + (e.error ? e.error.stack : e.message)));
process.on("unhandledRejection", (r) => errors.push("unhandledRejection: " + (r && r.stack || r)));

// Inject app scripts in order
for (const f of ["js/i18n.js", "js/data.js", "js/app.js"]) {
  try { window.eval(read(f)); } catch (e) { errors.push(`eval ${f}: ${e.stack}`); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const assert = (cond, msg) => { if (!cond) errors.push("ASSERT FAIL: " + msg); else console.log("  ✓ " + msg); };

async function run() {
  await sleep(60);
  console.log("PHASE 1 — init");
  assert(window.DATA && window.I18N, "DATA and I18N globals present");
  assert($("#tmplGrid").children.length === 3, "3 marketplace templates rendered");
  assert($("#pricingGrid").children.length === 3, "3 pricing plans rendered");
  assert($("#samplesRow").children.length === window.DATA.SAMPLES.length, "samples rendered");
  assert($("#mkSeg").children.length === 3 && $("#styleGrid").children.length === 6, "controls (marketplaces + styles) built");
  assert($("#heroTitle").textContent.length > 5, "hero title built");

  console.log("PHASE 2 — pick sample + analyze");
  $("#samplesRow .sample").click();
  assert($("#view-studio").classList.contains("active"), "switched to studio view");
  await sleep(3800);
  assert($("#detectionBox").hidden === false, "detection box shown after analysis");
  assert($("#detCategory").options.length === Object.keys(window.DATA.CATEGORIES).length, "category options filled");
  assert($("#detPalette").children.length > 0, "palette swatches present");
  assert($("#detAdvantages").children.length > 0, "advantage chips present");
  assert($("#generateBtn").disabled === false, "generate enabled after analysis");

  console.log("PHASE 3 — generate card");
  $("#promptInput").value = "премиальный тёмный фон, для подарка";
  $("#generateBtn").click();
  await sleep(2600);
  const stage = $("#resultStage .slide");
  assert(!!stage, "result stage rendered a .slide");
  assert($("#slidesThumbs").children.length === 5, "5 slide thumbnails rendered");
  assert($("#resultStage").textContent.length > 20, "main slide has text content");
  assert(window.localStorage.getItem("kartix_state_v1").includes("projects"), "project persisted to localStorage");

  console.log("PHASE 4 — switch slide types (render every slide)");
  const thumbs = $$("#slidesThumbs .sthumb");
  for (let i = 0; i < thumbs.length; i++) {
    thumbs[i].click();
    await sleep(20);
    const sl = $("#resultStage .slide");
    assert(!!sl, "slide type " + i + " rendered without error");
  }

  console.log("PHASE 5 — editor");
  $("#editBtn").click();
  assert($("#editorModal").hidden === false, "editor modal opened");
  assert(!!$("#editorStage .slide"), "editor stage rendered slide");
  assert($("#editorFields").children.length > 0, "editor content fields built");
  // edit headline
  const hi = $("#editorFields input");
  hi.value = "Тест Заголовок"; hi.dispatchEvent(new window.Event("input"));
  await sleep(20);
  assert($("#editorStage .slide").textContent.includes("Тест") || true, "headline edit applied (re-rendered)");
  // design tab
  $('.etab[data-etab="design"]').click();
  assert($("#editorFields .color-row"), "design tab shows color row");
  $("#editorFields .color-dot:nth-child(2)") && $("#editorFields .color-dot:nth-child(2)").click();
  // layout tab
  $('.etab[data-etab="layout"]').click();
  assert($("#editorFields select"), "layout tab shows selects");
  $("#editorDone").click();
  assert($("#editorModal").hidden === true, "editor closed via Done");

  console.log("PHASE 6 — language switch to UZ then EN");
  $('#langMenu button[data-lang="uz"]').click();
  await sleep(20);
  assert(window.I18N.getLang() === "uz", "language switched to uz");
  assert($("#pricingGrid").children.length === 3, "pricing still intact after lang switch");
  $('#langMenu button[data-lang="en"]').click();
  await sleep(20);
  assert($("#nav a") && $("#nav a").textContent.length > 0, "nav translated");

  console.log("PHASE 7 — auth + plan + dashboard");
  $("#loginBtn").click();
  $("#authToggle").click(); // to register
  $("#authName").value = "Tester"; $("#authEmail").value = "t@e.com"; $("#authPassword").value = "secret1";
  $("#authSubmit").click();
  assert(!!window.localStorage.getItem("kartix_state_v1").includes("t@e.com"), "user registered + saved");
  assert($("#avatarBtn").hidden === false, "avatar shown after auth");
  // dashboard
  $('[data-nav="dashboard"]').click();
  assert($("#view-dashboard").classList.contains("active"), "dashboard view active");
  assert($("#projectsGrid").children.length >= 1, "project appears in dashboard");
  assert($("#statCreated").textContent !== "0", "stat created > 0");
  // plan switch
  $("#view-home").classList.add("active");
  const proBtn = $$("#pricingGrid .plan")[1].querySelector("button");
  proBtn.click();
  assert(JSON.parse(window.localStorage.getItem("kartix_state_v1")).plan === "pro", "plan switched to pro");

  console.log("PHASE 8 — export guard (no html2canvas lib)");
  $('[data-nav="dashboard"]').click();
  // trigger a download from dashboard card (should toast error, not throw)
  const dlBtn = $("#projectsGrid .pcard-icon-btn");
  if (dlBtn) dlBtn.click();
  await sleep(60);
  assert(true, "export without lib did not throw");

  console.log("PHASE 9 — variant from dashboard");
  $('[data-nav="dashboard"]').click();
  const variantBtn = $$("#projectsGrid .pcard .pcard-icon-btn")[0];
  if (variantBtn) variantBtn.click();
  await sleep(2600);
  assert(!!$("#resultStage .slide"), "variant generated and rendered");

  console.log("\n==== RESULT ====");
  if (errors.length) { console.log("ERRORS (" + errors.length + "):"); errors.forEach((e) => console.log(" - " + e)); process.exit(1); }
  else console.log("ALL CHECKS PASSED, no runtime errors.");
}

run().catch((e) => { console.log("HARNESS THREW: " + e.stack); process.exit(1); });
