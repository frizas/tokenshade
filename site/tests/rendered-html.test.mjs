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
  assert.match(html, /Stop the token burn on your plan\./);
  assert.match(html, /Install in 60 seconds/);
  assert.match(html, /frizas\/tokenshade/);
  assert.match(html, /No telemetry/);
  assert.match(html, /not affiliated with OpenAI/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("keeps metadata, accessibility, and responsive contracts in source", async () => {
  const [page, shadeDemo, layout, css] = await Promise.all([
    import("node:fs/promises").then(({ readFile }) =>
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    ),
    import("node:fs/promises").then(({ readFile }) =>
      readFile(new URL("../app/ShadeDemo.tsx", import.meta.url), "utf8"),
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
  assert.match(page, />frizas<\/a>/);
  assert.doesNotMatch(page, /Built in Rio|Fábio Frizas/);
  assert.match(shadeDemo, /width="1254"/);
  assert.match(shadeDemo, /height="1254"/);
  assert.match(shadeDemo, /aria-pressed=\{shaded\}/);
  assert.match(layout, /summary_large_image/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /focus-visible/);
  assert.doesNotMatch(css, /@import|url\(["']?https?:/);
  assert.doesNotMatch(css, /#62d9d2|#ffba4a|#26343d|#f5ead9/i);
});
