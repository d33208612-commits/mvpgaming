/* ==========================================================================
   Kartix AI — Backend
   Serves the static frontend and exposes POST /api/generate, which uses the
   Claude API (vision + tool use) to analyze a product photo and return the
   structured card JSON the renderer consumes.

   No ANTHROPIC_API_KEY? The endpoint reports { fallback: true } and the
   frontend uses its built-in local generator, so the app still works.

   Env:
     ANTHROPIC_API_KEY   required for real AI
     KARTIX_MODEL        model id (default: claude-opus-4-8)
     PORT                default 8787
   ========================================================================== */
"use strict";

const path = require("path");
const express = require("express");

// Anthropic SDK is optional at boot (so the static server runs without it).
let AnthropicCtor = null;
try { const mod = require("@anthropic-ai/sdk"); AnthropicCtor = mod.default || mod; } catch (e) { AnthropicCtor = null; }

// Minimal .env loader (no extra dependency).
try {
  const fs = require("fs");
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch (e) { /* ignore */ }

const MODEL = process.env.KARTIX_MODEL || "claude-opus-4-8";
const PORT = process.env.PORT || 8787;
const isLive = () => !!process.env.ANTHROPIC_API_KEY && !!AnthropicCtor;

const CATEGORY_IDS = ["furniture", "clothing", "electronics", "accessory", "footwear", "beauty", "kitchen", "kids", "sport", "generic"];

function langName(l) { return l === "uz" ? "Uzbek (Latin script, O‘zbekcha)" : l === "en" ? "English" : "Russian"; }
function currencyName(l) { return l === "uz" ? "so‘m" : l === "en" ? "UZS" : "сум"; }

/* ------------------------- System prompt (cached) ------------------------- */
const SYSTEM_PROMPT = `You are Kartix AI, an expert marketplace strategist, product photographer's eye, and conversion copywriter for the marketplaces Uzum Market, Wildberries and Ozon (Uzbekistan and the CIS region).

Your job: given a product photo (and optional hints), analyze the product and produce the complete content for a professional, high-converting product infographic card. You ALWAYS return your answer by calling the "generate_card" tool — never as plain text.

Analysis:
- Look carefully at the photo. Identify what the product actually is.
- Pick the single best "category" from the allowed list.
- Infer plausible materials, key features and selling advantages from what you can see. Be specific but do NOT invent precise certifications, brand names, exact lab numbers, or guarantees you cannot support — keep unverifiable specifics generic and credible.

Copywriting rules:
- Write ALL text fields in the requested target language only. Sound like a native, professional marketplace copywriter — punchy, concrete, benefit-driven, not generic AI filler.
- Russian: respect gender/number agreement (e.g. «Идеальная сумка», not «Идеальный сумка»). Uzbek: natural Latin-script O‘zbekcha. English: clean and modern.
- Tailor tone to the marketplace: Uzum — emotional, value, local; Wildberries — bold benefits, big claims; Ozon — clean, spec-driven, rational.
- Honor the user's custom prompt and product name if provided. If no product name is given, invent a fitting one.
- Prices are in the local currency for the target language, realistic for this exact product (round, marketplace-style numbers). discount_percent is a believable promo (0–60). rating is 4.5–5.0; reviews is a believable integer.
- feature_chips: exactly 3 short benefit chips, each with a fitting emoji. benefits: 3–4 advantage blocks (icon emoji + short title + one supporting line). specs: 4–5 key/value rows. compare_rows: exactly 5 short points where "our product" wins. bonus: exactly 4 trust blocks (delivery, warranty, returns, gift) with emoji. seo: one keyword-rich marketplace paragraph. cta: a short call to action.
- sizes: ONLY for clothing/footwear return a realistic size run (e.g. ["XS","S","M","L","XL"] or ["37","39","41","43","45"]); otherwise return an empty array.

Keep everything tasteful, premium and truthful. Return via generate_card only.`;

/* ------------------------------- Card tool ------------------------------- */
const strObj = (props, required) => ({ type: "object", additionalProperties: false, properties: props, required });
const arr = (items, description) => ({ type: "array", description, items });

const CARD_TOOL = {
  name: "generate_card",
  description: "Return the complete marketplace product-card content for the analyzed product.",
  strict: true,
  input_schema: strObj({
    category: { type: "string", enum: CATEGORY_IDS, description: "Best-fit product category id." },
    name: { type: "string", description: "Product name / title in the target language." },
    headline: { type: "string", description: "Short selling headline (3–6 words)." },
    description: { type: "string", description: "One-sentence selling description." },
    badge: { type: "string", description: "Short promo badge text, e.g. BEST SELLER." },
    discount_percent: { type: "integer", description: "Promo discount percent, 0–60." },
    price: { type: "integer", description: "Current price in local currency (integer)." },
    rating: { type: "string", description: "Rating like \"4.9\"." },
    reviews: { type: "integer", description: "Number of reviews." },
    materials: arr({ type: "string" }, "3–5 detected materials."),
    detected_features: arr({ type: "string" }, "3–5 detected features."),
    advantages: arr({ type: "string" }, "3–4 selling advantages."),
    feature_chips: arr(strObj({ emoji: { type: "string" }, text: { type: "string" } }, ["emoji", "text"]), "Exactly 3 chips."),
    benefits: arr(strObj({ icon: { type: "string" }, title: { type: "string" }, desc: { type: "string" } }, ["icon", "title", "desc"]), "3–4 benefit blocks."),
    specs: arr(strObj({ key: { type: "string" }, value: { type: "string" } }, ["key", "value"]), "4–5 spec rows."),
    compare_us: { type: "string", description: "Label for our product column." },
    compare_them: { type: "string", description: "Label for the competitor column." },
    compare_rows: arr({ type: "string" }, "Exactly 5 comparison points."),
    bonus: arr(strObj({ icon: { type: "string" }, title: { type: "string" }, desc: { type: "string" } }, ["icon", "title", "desc"]), "Exactly 4 trust blocks."),
    seo: { type: "string", description: "Keyword-rich SEO paragraph." },
    sizes: arr({ type: "string" }, "Size run for apparel/footwear, else empty array."),
    cta: { type: "string", description: "Short call to action." },
  }, [
    "category", "name", "headline", "description", "badge", "discount_percent", "price", "rating", "reviews",
    "materials", "detected_features", "advantages", "feature_chips", "benefits", "specs",
    "compare_us", "compare_them", "compare_rows", "bonus", "seo", "sizes", "cta",
  ]),
};

/* --------------------------- Request building ---------------------------- */
function buildUserText({ lang, marketplace, prompt, productName, hasImage }) {
  const lines = [
    `Target marketplace: ${marketplace || "uzum"}.`,
    `Target language: ${langName(lang)} — write every text field in this language only.`,
    `Local currency: ${currencyName(lang)}.`,
    hasImage ? "A product photo is attached — analyze it to identify the product." : "No photo is available; use the category hint and prompt to write the card.",
    productName ? `Use this product name: "${productName}".` : "No product name was given — invent a fitting one.",
    prompt ? `Follow this creative direction from the seller: "${prompt}".` : "No extra creative direction.",
    "Now produce the full card via the generate_card tool.",
  ];
  return lines.join("\n");
}

function buildRequest({ image, lang, marketplace, prompt, productName }) {
  const content = [];
  if (image && image.data) {
    content.push({ type: "image", source: { type: "base64", media_type: image.mediaType || "image/png", data: image.data } });
  }
  content.push({ type: "text", text: buildUserText({ lang, marketplace, prompt, productName, hasImage: !!(image && image.data) }) });
  return {
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: "disabled" }, // forced tool_choice + snappy structured output
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    tools: [CARD_TOOL],
    tool_choice: { type: "tool", name: "generate_card" },
    messages: [{ role: "user", content }],
  };
}

function parseToolResult(message) {
  const blocks = (message && message.content) || [];
  const tool = blocks.find((b) => b.type === "tool_use" && b.name === "generate_card");
  if (!tool) throw new Error("no tool_use block in response");
  return tool.input;
}

let _client = null;
function client() {
  if (!_client) _client = new AnthropicCtor(); // reads ANTHROPIC_API_KEY from env
  return _client;
}

async function generateCard(params) {
  const message = await client().messages.create(buildRequest(params));
  return parseToolResult(message);
}

/* -------------------------------- Server -------------------------------- */
const app = express();
app.use(express.json({ limit: "14mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, live: isLive(), model: isLive() ? MODEL : null });
});

app.post("/api/generate", async (req, res) => {
  if (!isLive()) { res.json({ ok: false, fallback: true, reason: "no_api_key" }); return; }
  try {
    const { image, lang, marketplace, prompt, productName } = req.body || {};
    const card = await generateCard({ image, lang: lang || "ru", marketplace: marketplace || "uzum", prompt, productName });
    res.json({ ok: true, card });
  } catch (err) {
    console.error("[generate] error:", err && err.message ? err.message : err);
    res.json({ ok: false, fallback: true, error: String(err && err.message ? err.message : err) });
  }
});

// Static frontend (ignore dotfiles so a real .env is never served)
app.use(express.static(path.join(__dirname), { dotfiles: "ignore", extensions: ["html"] }));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Kartix AI server → http://localhost:${PORT}`);
    console.log(isLive() ? `Claude API: LIVE (model ${MODEL})` : "Claude API: OFF (no ANTHROPIC_API_KEY) — frontend uses local generator");
  });
}

module.exports = { app, buildRequest, buildUserText, parseToolResult, generateCard, CARD_TOOL, CATEGORY_IDS, MODEL };
