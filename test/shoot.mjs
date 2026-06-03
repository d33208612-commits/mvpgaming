import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

const root = path.resolve(".");
const out = path.join(root, "test", "shots");
fs.mkdirSync(out, { recursive: true });
const url = "file://" + path.join(root, "index.html");
const shot = (p) => path.join(out, p);

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1400, height: 880 }, deviceScaleFactor: 1.5 });
page.setDefaultTimeout(12000);
const errs = [];
page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error" && !/CERT|net::/.test(m.text())) errs.push("console.error: " + m.text()); });
const phase = async (name, fn) => { try { console.log("• " + name); await fn(); } catch (e) { console.log("  ⚠ " + name + ": " + e.message.split("\n")[0]); } };

await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(1400);
console.log("export libs:", await page.evaluate(() => !!window.html2canvas && !!(window.jspdf || window.jsPDF)));

await phase("landing dark", async () => { await page.screenshot({ path: shot("01-landing-dark.png") }); });
await phase("features", async () => { await page.evaluate(() => document.getElementById("features").scrollIntoView()); await page.waitForTimeout(500); await page.screenshot({ path: shot("02-features.png") }); });
await phase("templates", async () => { await page.evaluate(() => document.getElementById("templates").scrollIntoView()); await page.waitForTimeout(500); await page.screenshot({ path: shot("03-templates.png") }); });
await phase("pricing", async () => { await page.evaluate(() => document.getElementById("pricing").scrollIntoView()); await page.waitForTimeout(500); await page.screenshot({ path: shot("04-pricing.png") }); });
await phase("landing light", async () => { await page.evaluate(() => window.scrollTo(0, 0)); await page.click("#themeToggle"); await page.waitForTimeout(400); await page.screenshot({ path: shot("05-landing-light.png") }); await page.click("#themeToggle"); await page.waitForTimeout(200); });

// Build a synthetic product photo (polka-dot dress on light bg) to upload
const dataUrl = await page.evaluate(() => {
  const c = document.createElement("canvas"); c.width = 800; c.height = 1000; const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 1000); g.addColorStop(0, "#efefee"); g.addColorStop(1, "#e2e2e0"); x.fillStyle = g; x.fillRect(0, 0, 800, 1000);
  // dress A-line path
  x.beginPath();
  x.moveTo(330, 150); x.lineTo(470, 150); x.lineTo(500, 330); x.lineTo(560, 760); x.lineTo(620, 860); x.lineTo(180, 860); x.lineTo(240, 760); x.lineTo(300, 330); x.closePath();
  x.fillStyle = "#fbfbfa"; x.shadowColor = "rgba(0,0,0,.18)"; x.shadowBlur = 40; x.shadowOffsetY = 24; x.fill(); x.shadowColor = "transparent";
  // straps
  x.strokeStyle = "#fbfbfa"; x.lineWidth = 14; x.beginPath(); x.moveTo(340, 152); x.quadraticCurveTo(360, 90, 400, 96); x.moveTo(460, 152); x.quadraticCurveTo(440, 90, 400, 96); x.stroke();
  // polka dots clipped to dress
  x.save(); x.beginPath();
  x.moveTo(330, 150); x.lineTo(470, 150); x.lineTo(500, 330); x.lineTo(560, 760); x.lineTo(620, 860); x.lineTo(180, 860); x.lineTo(240, 760); x.lineTo(300, 330); x.closePath(); x.clip();
  x.fillStyle = "#2a2a2a";
  for (let yy = 180; yy < 860; yy += 52) for (let xx = 200; xx < 620; xx += 52) { x.beginPath(); x.arc(xx + (Math.floor(yy / 52) % 2 ? 26 : 0), yy, 9, 0, 7); x.fill(); }
  x.restore();
  return c.toDataURL("image/png");
});
const buffer = Buffer.from(dataUrl.split(",")[1], "base64");

await phase("studio upload (real photo)", async () => {
  await page.click("header [data-nav='studio']");
  await page.waitForTimeout(400);
  await page.setInputFiles("#studioFile", { name: "dress-polkadot.png", mimeType: "image/png", buffer });
  await page.waitForFunction(() => document.getElementById("detectionBox") && !document.getElementById("detectionBox").hidden, null, { timeout: 9000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: shot("06-studio-analysis.png") });
});
await phase("generate", async () => {
  await page.click("#generateBtn");
  await page.waitForFunction(() => document.querySelector("#resultStage .slide"), null, { timeout: 9000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: shot("07-studio-result.png") });
});

const types = ["main", "advantages", "specs", "compare", "bonus"];
for (let i = 0; i < 5; i++) {
  await phase("slide " + types[i], async () => {
    const thumbs = await page.$$("#slidesThumbs .sthumb");
    if (thumbs[i]) { await thumbs[i].click(); await page.waitForTimeout(350); }
    const stage = await page.$("#resultStage .slide-frame");
    if (stage) await stage.screenshot({ path: shot(`08-slide-${i}-${types[i]}.png`) });
  });
}

await phase("editor", async () => { await page.click("#editBtn"); await page.waitForTimeout(700); await page.screenshot({ path: shot("09-editor.png") }); });
await phase("editorial light style", async () => {
  await page.click('.etab[data-etab="design"]'); await page.waitForTimeout(200);
  const cards = await page.$$("#editorFields .estyle-grid .style-card");
  if (cards[1]) await cards[1].click(); // minimal (light)
  await page.waitForTimeout(500);
  const stage = await page.$("#editorStage .slide-frame");
  if (stage) await stage.screenshot({ path: shot("10-editorial-light.png") });
  await page.click("#editorDone");
});

let exportOk = false;
await phase("PNG export", async () => {
  const dl = page.waitForEvent("download", { timeout: 9000 }).catch(() => null);
  await page.click("#dlPngBtn");
  const d = await dl;
  if (d) { await d.saveAs(shot("11-exported.png")); exportOk = true; }
});
console.log("PNG export file:", exportOk);

await browser.close();
console.log("\n==== DONE ====");
if (errs.length) { console.log("PAGE ERRORS:"); [...new Set(errs)].forEach((e) => console.log(" - " + e)); }
else console.log("No page errors.");
