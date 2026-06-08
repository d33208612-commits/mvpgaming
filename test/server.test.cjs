/* Backend tests: request shape, response parsing, and HTTP routes (fallback path). */
const assert = require("assert");
const srvmod = require("../server.js");
const { buildRequest, parseToolResult, CARD_TOOL, app } = srvmod;

let failures = 0;
const ok = (cond, msg) => { if (!cond) { failures++; console.log("  ✗ " + msg); } else console.log("  ✓ " + msg); };

console.log("UNIT — buildRequest");
const req = buildRequest({
  image: { data: "QUJD", mediaType: "image/png" },
  lang: "uz", marketplace: "wb", prompt: "premium dark", productName: "Test",
});
ok(req.model && req.model.startsWith("claude-"), "model is a Claude id (" + req.model + ")");
ok(req.tool_choice && req.tool_choice.type === "tool" && req.tool_choice.name === "generate_card", "tool_choice forces generate_card");
ok(Array.isArray(req.tools) && req.tools[0].name === "generate_card", "card tool included");
ok(req.tools[0].strict === true, "tool is strict (guaranteed schema)");
ok(Array.isArray(req.system) && req.system[0].cache_control && req.system[0].cache_control.type === "ephemeral", "system prompt has prompt-caching breakpoint");
ok(req.thinking && req.thinking.type === "disabled", "thinking disabled (works with forced tool_choice)");
const content = req.messages[0].content;
ok(content.some((b) => b.type === "image" && b.source.type === "base64"), "image (vision) block present");
ok(content.some((b) => b.type === "text" && /Uzbek/.test(b.text)), "user text carries target language");
ok(content.some((b) => b.type === "text" && /wb/.test(b.text)), "user text carries marketplace");

console.log("UNIT — buildRequest without image");
const req2 = buildRequest({ image: null, lang: "ru", marketplace: "uzum" });
ok(!req2.messages[0].content.some((b) => b.type === "image"), "no image block when none supplied");

console.log("UNIT — CARD_TOOL schema");
const props = CARD_TOOL.input_schema.properties;
["category", "name", "headline", "feature_chips", "benefits", "specs", "compare_rows", "bonus", "seo", "sizes"].forEach((k) =>
  ok(!!props[k], "schema has " + k));
ok(props.category.enum.includes("clothing"), "category enum includes known ids");
ok(CARD_TOOL.input_schema.additionalProperties === false, "schema is closed (additionalProperties:false)");

console.log("UNIT — parseToolResult");
const fakeMsg = { content: [{ type: "text", text: "ignore" }, { type: "tool_use", name: "generate_card", input: { name: "Hi" } }] };
ok(parseToolResult(fakeMsg).name === "Hi", "extracts tool_use input");
assert.throws(() => parseToolResult({ content: [{ type: "text", text: "x" }] }), "throws when no tool_use");
ok(true, "throws cleanly when no tool_use block");

(async function httpTests() {
  console.log("HTTP — routes (no API key → fallback)");
  const server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  const base = "http://127.0.0.1:" + server.address().port;
  try {
    const h = await (await fetch(base + "/api/health")).json();
    ok(h.ok === true && h.live === false, "/api/health reports live:false without key");

    const g = await (await fetch(base + "/api/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: "ru", marketplace: "uzum" }),
    })).json();
    ok(g.ok === false && g.fallback === true, "/api/generate returns fallback without key");

    const indexRes = await fetch(base + "/");
    const html = await indexRes.text();
    ok(indexRes.status === 200 && /Kartix/.test(html), "GET / serves the frontend");

    const appjs = await fetch(base + "/js/app.js");
    ok(appjs.status === 200, "static assets served (js/app.js)");

    const env = await fetch(base + "/.env");
    ok(env.status === 404, "dotfiles not served (/.env → 404)");
  } finally {
    server.close();
  }

  console.log("\n==== RESULT ====");
  if (failures) { console.log(failures + " CHECK(S) FAILED"); process.exit(1); }
  console.log("ALL BACKEND CHECKS PASSED");
})();
