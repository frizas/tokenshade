import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the TokenShade landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>TokenShade/);
  const visibleText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert.match(visibleText, /Stop the burn on your plan\./);
  assert.match(visibleText, /Free forever · No tracking · Open source/);
  assert.match(html, /Install in 60 seconds/);
  assert.match(html, /frizas\/tokenshade/);
  assert.match(html, /No tracking/);
  assert.match(html, /or telemetry/);
  assert.match(html, /not affiliated with OpenAI/);
  assert.match(html, /ONE-TWEET PROMPT/);
  assert.match(visibleText, /85%\+ fewer/);
  assert.match(visibleText, /70%\+ fewer/);
  assert.match(visibleText, /272 \/ 280/);
  assert.match(html, /Does TokenShade work with ChatGPT\?/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /ONE-TWEET PROMPT/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("keeps metadata, accessibility, and responsive contracts in source", async () => {
  const [page, shadeDemo, sharePrompt, layout, css] = await Promise.all([
    import("node:fs/promises").then(({ readFile }) =>
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    ),
    import("node:fs/promises").then(({ readFile }) =>
      readFile(new URL("../app/ShadeDemo.tsx", import.meta.url), "utf8"),
    ),
    import("node:fs/promises").then(({ readFile }) =>
      readFile(new URL("../app/SharePrompt.tsx", import.meta.url), "utf8"),
    ),
    import("node:fs/promises").then(({ readFile }) =>
      readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    ),
    import("node:fs/promises").then(({ readFile }) =>
      readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    ),
  ]);

  assert.match(page, /aria-label="Main navigation"/);
  assert.match(page, /<ShadeDemo \/>/);
  assert.doesNotMatch(page, /Built by|Built in Rio|Fábio Frizas/);
  assert.match(page, /Proudly made with AI by <strong>HiLeverage Studios/);
  assert.match(page, /https:\/\/www\.manapanic\.com\//);
  assert.match(page, /https:\/\/accounts\.manapanic\.com\/billing/);
  assert.match(page, /const tweetPrompt/);
  assert.match(page, /Do it yourself/);
  assert.doesNotMatch(page, /name: "ChatGPT Work"/);
  assert.match(page, /Read llms\.txt/);
  assert.match(page, /<SharePrompt text=\{tweetPrompt\}/);
  assert.match(sharePrompt, /navigator\.share/);
  assert.match(sharePrompt, /https:\/\/wa\.me/);
  assert.match(sharePrompt, /twitter\.com\/intent\/tweet/);
  assert.match(sharePrompt, /Copy link/);
  assert.doesNotMatch(page, /Entirely optional/);
  assert.match(page, /https:\/\/www\.linkedin\.com\/in\/frizas\//);
  assert.match(page, /aria-label="frizas on X"/);
  assert.match(page, /aria-label="frizas on LinkedIn"/);
  assert.match(page, /aria-label="frizas on GitHub"/);
  assert.match(shadeDemo, /width="1254"/);
  assert.match(shadeDemo, /height="1254"/);
  assert.match(shadeDemo, /aria-pressed=\{shaded\}/);
  assert.match(layout, /summary_large_image/);
  assert.match(layout, /ChatGPT Work/);
  assert.match(layout, /GPT-5\.6 Sol/);
  assert.match(layout, /https:\/\/tokenshade\.vercel\.app/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.prompt-card-actions/);
  assert.match(css, /focus-visible/);
  assert.doesNotMatch(css, /@import|url\(["']?https?:/);
  assert.doesNotMatch(css, /#62d9d2|#ffba4a|#26343d|#f5ead9/i);
});
