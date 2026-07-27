import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import {
  analyzeTrace,
  numberedFindings,
  validateConclusion,
} from "../plugins/tokenshade/scripts/benchmark.mjs";

const repository = path.resolve(import.meta.dirname, "..");
const expected = JSON.parse(
  fs.readFileSync(
    path.join(
      repository,
      "plugins",
      "tokenshade",
      "benchmark",
      "expected-findings.json",
    ),
    "utf8",
  ),
);

test("trace analysis recognizes one concurrent outer stage and sanitized validation", () => {
  const events = [
    { type: "turn.started" },
    {
      type: "item.started",
      item: { type: "command_execution", command: "Get-Content AGENTS.md" },
    },
    {
      type: "item.started",
      item: {
        type: "command_execution",
        command: "Get-Content docs/mobile-package.md",
      },
    },
    {
      type: "item.completed",
      item: { type: "command_execution" },
    },
    {
      type: "item.completed",
      item: { type: "command_execution" },
    },
    {
      type: "turn.completed",
      usage: {
        input_tokens: 1000,
        cached_input_tokens: 700,
        output_tokens: 100,
        reasoning_output_tokens: 30,
      },
    },
  ];
  const rows = expected.paths
    .map((relative) => `| \`${relative}\` | role | contract |`)
    .join("\n");
  const final = `${rows}

1. \`src/reconnect.mjs\` embeds Raybox product copy in reusable src code instead of an adapter, violating the boundary.
2. Catalog synchronization sends a raw snapshot request while inbound catalog data is versioned JSON, splitting the protocol contract.
3. The mobile bootstrap ZIP does not prove downloaded runtime asset install or extraction without the native archive extension.
`;
  const analyzed = analyzeTrace(
    events.map((event) => JSON.stringify(event)).join("\n"),
    final,
    expected,
  );
  assert.equal(analyzed.metrics.modelCycles, 1);
  assert.equal(analyzed.metrics.toolCalls, 2);
  assert.equal(analyzed.metrics.maxGroupedOperations, 2);
  assert.equal(analyzed.metrics.totalTokens, 1100);
  assert.equal(analyzed.validation.coverageComplete, true);
  assert.equal(analyzed.validation.conclusionsComplete, true);
  assert.equal(analyzed.validation.genuineGrouping, true);
  assert.equal(analyzed.validation.extraScopeDetected, false);
});

test("finding extraction and expectation checks require three semantic themes", () => {
  const text = `1. reconnect in src violates the product adapter boundary.
2. catalog snapshot uses raw protocol beside versioned JSON.
3. mobile bootstrap ZIP lacks runtime extraction.`;
  const findings = numberedFindings(text);
  assert.equal(findings.length, 3);
  assert.equal(
    validateConclusion(findings, expected).every((value) => value.matched),
    true,
  );
});

test("benchmark dry-run does not create or modify the isolated policy", (t) => {
  const codexHome = fs.mkdtempSync(path.join(os.tmpdir(), "tokenshade-bench-home-"));
  t.after(() => fs.rmSync(codexHome, { recursive: true, force: true }));
  const script = path.join(
    repository,
    "plugins",
    "tokenshade",
    "scripts",
    "benchmark.mjs",
  );
  const result = spawnSync(
    process.execPath,
    [script, "--dry-run", "--json", "--pairs", "1"],
    {
      env: { ...process.env, CODEX_HOME: codexHome },
      encoding: "utf8",
      windowsHide: true,
    },
  );
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  assert.equal(plan.pairs, 1);
  assert.deepEqual(plan.sequence, ["baseline-1", "treatment-1"]);
  assert.equal(plan.restoration, "exact bytes and mode in finally");
  assert.equal(fs.existsSync(path.join(codexHome, "AGENTS.md")), false);
});

test("benchmark force mode refuses unknown JSON in the run directory", (t) => {
  const codexHome = fs.mkdtempSync(path.join(os.tmpdir(), "tokenshade-bench-home-"));
  const results = fs.mkdtempSync(path.join(os.tmpdir(), "tokenshade-bench-results-"));
  t.after(() => fs.rmSync(codexHome, { recursive: true, force: true }));
  t.after(() => fs.rmSync(results, { recursive: true, force: true }));
  fs.mkdirSync(path.join(results, "runs"));
  const unknown = path.join(results, "runs", "keep.json");
  fs.writeFileSync(unknown, "{}\n");
  const script = path.join(
    repository,
    "plugins",
    "tokenshade",
    "scripts",
    "benchmark.mjs",
  );
  const result = spawnSync(
    process.execPath,
    [script, "--pairs", "1", "--force", "--results", results],
    {
      env: { ...process.env, CODEX_HOME: codexHome },
      encoding: "utf8",
      windowsHide: true,
    },
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Refusing to remove unknown result files/);
  assert.equal(fs.existsSync(unknown), true);
});
