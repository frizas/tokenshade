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
  assert.match(html, /<title>TokenShade — Stop the burn on your plan<\/title>/);
  const visibleText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert.match(visibleText, /Stop the burn on your plan\./);
  assert.match(visibleText, /Open source · No tracking · Free forever/);
  assert.match(html, /Install in 60 seconds/);
  assert.match(html, /frizas\/tokenshade/);
  assert.match(html, /or plugin tracking/);
  assert.match(html, /not affiliated with OpenAI/);
  assert.match(html, /ONE-TWEET PROMPT/);
  assert.match(visibleText, /85%\+ fewer/);
  assert.match(visibleText, /70%\+ fewer/);
  assert.match(visibleText, /263 \/ 280/);
  assert.match(html, /Does TokenShade work with ChatGPT\?/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /ONE-TWEET PROMPT/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("keeps metadata, accessibility, analytics, and responsive contracts in source", async () => {
  const [page, shadeDemo, sharePrompt, siteAnalytics, layout, css, vercel, robots] =
    await Promise.all([
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
        readFile(new URL("../app/SiteAnalytics.tsx", import.meta.url), "utf8"),
      ),
      import("node:fs/promises").then(({ readFile }) =>
        readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
      ),
      import("node:fs/promises").then(({ readFile }) =>
        readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
      ),
      import("node:fs/promises").then(({ readFile }) =>
        readFile(new URL("../vercel.json", import.meta.url), "utf8"),
      ),
      import("node:fs/promises").then(({ readFile }) =>
        readFile(new URL("../public/robots.txt", import.meta.url), "utf8"),
      ),
    ]);

  assert.match(page, /aria-label="Main navigation"/);
  assert.match(page, /<ShadeDemo \/>/);
  assert.match(page, /<SiteAnalytics \/>/);
  assert.doesNotMatch(page, /Built by|Built in Rio|Fábio Frizas/);
  assert.match(page, /Proudly made with AI by <strong>HiLeverage Studios/);
  assert.match(page, /https:\/\/www\.manapanic\.com\//);
  assert.match(page, /https:\/\/accounts\.manapanic\.com\/billing/);
  assert.match(page, /const tweetPrompt/);
  assert.match(page, /Do it yourself/);
  assert.doesNotMatch(page, /name: "ChatGPT Work"/);
  assert.ok(
    page.indexOf('name: "Claude Code"') < page.indexOf('name: "Kimi Code CLI"'),
    "Claude Code should be listed before Kimi Code CLI",
  );
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
  assert.match(layout, /favicon-32x32\.png/);
  assert.match(layout, /apple-touch-icon\.png/);
  assert.match(layout, /site\.webmanifest/);
  assert.match(layout, /ChatGPT Work/);
  assert.match(layout, /https:\/\/tokenshade\.vercel\.app/);
  assert.match(layout, /siteName: "TokenShade"/);
  assert.match(layout, /alt: "TokenShade — Stop the burn on your plan"/);
  assert.match(layout, /google: "4-0I7YOqzhN-rwFDTYFzLPCJBGBlbNhM36e995Y8Me0"/);
  assert.match(page, /"@type": "WebSite"/);
  assert.match(page, /price: "0"/);
  assert.match(siteAnalytics, /G-XF80ZZLVB0/);
  assert.match(siteAnalytics, /allow_google_signals: false/);
  assert.match(siteAnalytics, /allow_ad_personalization_signals: false/);
  assert.match(siteAnalytics, /page_location: `\$\{window\.location\.origin\}\$\{window\.location\.pathname\}`/);
  assert.match(siteAnalytics, /\^ts_\[a-z0-9_\]\+\$/);
  assert.doesNotMatch(siteAnalytics, /dataset\.(?:href|text|value)|textContent|innerText/);
  assert.match(vercel, /https:\/\/www\.googletagmanager\.com/);
  assert.match(vercel, /https:\/\/\*\.google-analytics\.com/);
  assert.doesNotMatch(vercel, /doubleclick|googlesyndication|googleadservices/);
  assert.match(robots, /OAI-SearchBot/);
  assert.match(robots, /Claude-SearchBot/);
  assert.match(robots, /PerplexityBot/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.prompt-card-actions/);
  assert.match(css, /\.analytics-consent/);
  assert.match(css, /focus-visible/);
  assert.doesNotMatch(css, /@import|url\(["']?https?:/);
  assert.doesNotMatch(css, /#62d9d2|#ffba4a|#26343d|#f5ead9/i);
});
