#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const pluginRoot = path.join(root, "plugins", "tokenshade");

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (
      [
        ".benchmark-work",
        ".git",
        ".next",
        ".vercel",
        ".vinext",
        ".wrangler",
        "coverage",
        "dist",
        "node_modules",
        "out",
      ].includes(entry.name)
    ) {
      continue;
    }
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(candidate));
    else if (entry.isFile()) files.push(candidate);
  }
  return files;
}

const files = walk(root);
const textFiles = files.filter(
  (file) => ![".png", ".ico"].includes(path.extname(file).toLowerCase()),
);
const checkerPath = fileURLToPath(import.meta.url);
const productText = textFiles
  .filter((file) => path.resolve(file) !== path.resolve(checkerPath))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

assert.equal(
  productText.includes("[TODO:"),
  false,
  "TODO scaffold placeholder remains",
);
assert.equal(
  /\boctoturn\b/i.test(productText),
  false,
  "old Octoturn brand remains",
);
assert.equal(
  /\bShinobi\b/i.test(productText),
  false,
  "private fixture name leaked",
);
assert.equal(
  /[A-Za-z]:[\\/]Users[\\/]|\/(?:Users|home)\/[^/\s]+\/Documents\/Codex/i.test(
    productText,
  ),
  false,
  "device-specific absolute path leaked",
);

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json")));
assert.equal(packageJson.name, "tokenshade");
assert.equal(packageJson.dependencies, undefined);
assert.equal(packageJson.devDependencies, undefined);

const marketplace = JSON.parse(
  fs.readFileSync(path.join(root, ".agents", "plugins", "marketplace.json")),
);
assert.equal(marketplace.name, "tokenshade");
assert.equal(marketplace.plugins.length, 1);
assert.equal(marketplace.plugins[0].name, "tokenshade");
assert.equal(marketplace.plugins[0].source.path, "./plugins/tokenshade");

const manifest = JSON.parse(
  fs.readFileSync(path.join(pluginRoot, ".codex-plugin", "plugin.json")),
);
assert.equal(manifest.name, "tokenshade");
assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
assert.equal(manifest.mcpServers, undefined);
assert.equal(manifest.apps, undefined);
assert.equal(manifest.hooks, undefined);

assert.deepEqual(
  fs.readFileSync(path.join(root, "policy", "AGENTS.md")),
  fs.readFileSync(path.join(pluginRoot, "assets", "tokenshade-policy.md")),
  "portable and plugin policy copies diverged",
);
assert.deepEqual(
  fs.readFileSync(path.join(root, "llms.txt")),
  fs.readFileSync(path.join(root, "site", "public", "llms.txt")),
  "repository and landing-page llms.txt copies diverged",
);
assert.equal(
  productText.includes("tokenshade.fgfrizas.chatgpt.site"),
  false,
  "rejected preview hostname remains",
);
assert.match(
  fs.readFileSync(path.join(root, "llms.txt"), "utf8"),
  /Build me a TokenShade skill/,
  "llms.txt is missing the one-tweet prompt",
);
assert.equal(
  fs.existsSync(path.join(root, "site", "public", "robots.txt")),
  true,
  "landing page is missing robots.txt",
);
assert.equal(
  fs.existsSync(path.join(root, "site", "public", "sitemap.xml")),
  true,
  "landing page is missing sitemap.xml",
);
for (const favicon of [
  "favicon.svg",
  "favicon.ico",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "site.webmanifest",
]) {
  assert.equal(
    fs.existsSync(path.join(root, "site", "public", favicon)),
    true,
    `landing page is missing ${favicon}`,
  );
}
assert.deepEqual(
  fs.readFileSync(path.join(root, "AGENTS.md")),
  fs.readFileSync(path.join(root, "policy", "AGENTS.md")),
  "root AGENTS.md and canonical Codex policy diverged",
);
assert.deepEqual(
  fs.readFileSync(path.join(root, "policy", "PORTABLE.md")),
  fs.readFileSync(
    path.join(pluginRoot, "assets", "tokenshade-portable-policy.md"),
  ),
  "portable policy copies diverged",
);
for (const adapter of [
  path.join(root, "adapters", "claude", "CLAUDE.md"),
  path.join(root, "adapters", "kimi", "AGENTS.md"),
]) {
  assert.deepEqual(
    fs.readFileSync(adapter),
    fs.readFileSync(path.join(root, "policy", "PORTABLE.md")),
    `portable adapter diverged: ${path.relative(root, adapter)}`,
  );
}

for (const skill of ["tokenshade", "tokenshade-audit", "tokenshade-benchmark"]) {
  const skillRoot = path.join(pluginRoot, "skills", skill);
  assert.equal(fs.existsSync(path.join(skillRoot, "SKILL.md")), true);
  assert.equal(fs.existsSync(path.join(skillRoot, "agents", "openai.yaml")), true);
}

const expected = JSON.parse(
  fs.readFileSync(path.join(pluginRoot, "benchmark", "expected-findings.json")),
);
assert.equal(expected.paths.length, 8);
for (const relative of expected.paths) {
  assert.equal(
    fs.existsSync(path.join(pluginRoot, "benchmark", "fixture", relative)),
    true,
    `missing fixture ${relative}`,
  );
}

const runtimeSources = [
  path.join(pluginRoot, "scripts", "tokenshade.mjs"),
  path.join(pluginRoot, "scripts", "benchmark.mjs"),
].map((file) => fs.readFileSync(file, "utf8"));
for (const source of runtimeSources) {
  assert.equal(
    /(?:from\s+|import\s*\()\s*["'](?:node:)?(?:http|https|net|tls|dgram)["']|\brequire\s*\(\s*["'](?:node:)?(?:http|https|net|tls|dgram)["']|\bfetch\s*\(|new\s+WebSocket|new\s+XMLHttpRequest/.test(source),
    false,
    "runtime network primitive found",
  );
}
assert.equal(
  /readFileSync\s*\([^)]*auth\.json/i.test(runtimeSources.join("\n")),
  false,
  "runtime reads auth.json",
);

for (const asset of [
  "assets/icon.png",
  "assets/logo.png",
  "assets/logo-dark.png",
]) {
  assert.equal(
    fs.existsSync(path.join(pluginRoot, asset)),
    true,
    `missing plugin asset ${asset}`,
  );
}

const sitePackage = JSON.parse(
  fs.readFileSync(path.join(root, "site", "package.json"), "utf8"),
);
assert.equal(sitePackage.name, "tokenshade-site");
assert.equal(
  sitePackage.scripts["build:static"],
  "node build/static-build.mjs",
);
assert.equal(sitePackage.scripts["build:vercel"], "npm run build:static");
assert.equal(sitePackage.scripts["build:pages"], "npm run build:static");
assert.equal(sitePackage.dependencies["react-loading-skeleton"], undefined);
assert.equal(sitePackage.dependencies["drizzle-orm"], undefined);
assert.equal(
  fs.existsSync(path.join(root, "site", "tsconfig.static.json")),
  true,
  "static builds are missing their host-isolated TypeScript project",
);
assert.match(
  fs.readFileSync(
    path.join(root, "site", "build", "static-build.mjs"),
    "utf8",
  ),
  /NEXT_TELEMETRY_DISABLED:\s*"1"/,
  "static build telemetry is not disabled",
);
const vercelConfig = JSON.parse(
  fs.readFileSync(path.join(root, "site", "vercel.json"), "utf8"),
);
assert.equal(vercelConfig.framework, null);
assert.equal(vercelConfig.outputDirectory, "out");
assert.match(
  JSON.stringify(vercelConfig.headers),
  /connect-src 'none'/,
  "Vercel static host policy allows runtime connections",
);
const siteRuntime = [
  path.join(root, "site", "app", "page.tsx"),
  path.join(root, "site", "app", "CopyInstall.tsx"),
  path.join(root, "site", "app", "SharePrompt.tsx"),
  path.join(root, "site", "app", "sitePath.ts"),
  path.join(root, "site", "app", "layout.tsx"),
].map((file) => fs.readFileSync(file, "utf8"));
assert.equal(
  /\bfetch\s*\(|new\s+WebSocket|new\s+XMLHttpRequest/.test(
    siteRuntime.join("\n"),
  ),
  false,
  "landing page contains a runtime network client",
);
const siteCss = fs.readFileSync(
  path.join(root, "site", "app", "globals.css"),
  "utf8",
);
assert.equal(
  /@import|url\(["']?https?:/i.test(siteCss),
  false,
  "landing page loads remote CSS or fonts",
);

process.stdout.write(
  `TokenShade repository check passed (${files.length} files, 8 fixture files, zero runtime network clients).\n`,
);
