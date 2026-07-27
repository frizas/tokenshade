#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  atomicWrite,
  canonicalPolicy,
  defaultTarget,
  policyContentForPhase,
  sha256,
  summarizeResults,
} from "./tokenshade.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(SCRIPT_DIR, "..");
const BENCHMARK_ROOT = path.join(PLUGIN_ROOT, "benchmark");
const FIXTURE_ROOT = path.join(BENCHMARK_ROOT, "fixture");
const PROMPT_PATH = path.join(BENCHMARK_ROOT, "prompt.txt");
const EXPECTED_PATH = path.join(BENCHMARK_ROOT, "expected-findings.json");
const REPOSITORY_ROOT = path.resolve(PLUGIN_ROOT, "..", "..");
const DEFAULT_RESULTS = path.join(REPOSITORY_ROOT, "benchmarks", "results");

class BenchmarkError extends Error {}

function parseArgs(argv) {
  const options = {
    pairs: 5,
    model: "gpt-5.6-sol",
    effort: "xhigh",
    codex: "codex",
    results: DEFAULT_RESULTS,
    policyTarget: defaultTarget(),
    dryRun: false,
    force: false,
    json: false,
  };
  const values = new Set([
    "pairs",
    "model",
    "effort",
    "codex",
    "results",
    "policy-target",
  ]);
  const booleans = new Set(["dry-run", "force", "json", "help"]);
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) throw new BenchmarkError(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    if (values.has(key)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new BenchmarkError(`Missing value for --${key}.`);
      }
      options[toCamel(key)] = key === "pairs" ? Number(value) : value;
      index += 1;
    } else if (booleans.has(key)) {
      options[toCamel(key)] = true;
    } else {
      throw new BenchmarkError(`Unknown option: --${key}.`);
    }
  }
  if (!Number.isInteger(options.pairs) || options.pairs < 1 || options.pairs > 20) {
    throw new BenchmarkError("--pairs must be an integer from 1 to 20.");
  }
  if (!/^[A-Za-z0-9._:-]+$/.test(options.model)) {
    throw new BenchmarkError("--model contains unsupported characters.");
  }
  if (!/^[A-Za-z0-9._-]+$/.test(options.effort)) {
    throw new BenchmarkError("--effort contains unsupported characters.");
  }
  options.results = path.resolve(options.results);
  options.policyTarget = path.resolve(options.policyTarget);
  if (options.policyTarget !== path.resolve(defaultTarget())) {
    throw new BenchmarkError(
      "--policy-target must resolve to the active Codex global AGENTS.md. Set CODEX_HOME to benchmark another isolated home.",
    );
  }
  return options;
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function help() {
  return `TokenShade matched benchmark

Usage:
  node benchmark.mjs [--pairs 5] [--model gpt-5.6-sol] [--effort xhigh]
                     [--results <directory>] [--dry-run] [--force] [--json]

The harness alternates baseline and treatment against the same eight-file fixture,
uses read-only Codex execution, stores sanitized metrics only, and restores the
original global policy bytes in a finally block.
`;
}

function resolveCommand(command) {
  if (process.platform !== "win32" || path.extname(command)) return command;
  const located = spawnSync("where.exe", [command], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (located.status !== 0) return command;
  const candidates = located.stdout
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
  return (
    candidates.find((candidate) => candidate.toLowerCase().endsWith(".cmd")) ??
    candidates.find((candidate) => candidate.toLowerCase().endsWith(".exe")) ??
    candidates[0] ??
    command
  );
}

function spawnCommand(command, args, options = {}) {
  const shell =
    process.platform === "win32" && /\.(?:cmd|bat)$/i.test(command);
  return spawnSync(command, args, { ...options, shell });
}

function commandVersion(command, args) {
  const result = spawnCommand(command, args, {
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error || result.status !== 0) return "unavailable";
  return String(result.stdout || result.stderr).trim().split(/\r?\n/)[0];
}

function fixtureTreeHash(expectedPaths) {
  const hash = [];
  for (const relative of [...expectedPaths].sort()) {
    const content = fs.readFileSync(path.join(FIXTURE_ROOT, relative));
    hash.push(relative, "\0", sha256(content), "\n");
  }
  return sha256(hash.join(""));
}

function repositoryCommit() {
  const result = spawnSync("git", ["-C", REPOSITORY_ROOT, "rev-parse", "HEAD"], {
    encoding: "utf8",
    windowsHide: true,
  });
  return result.status === 0 ? result.stdout.trim() : "uncommitted";
}

function isToolStart(event) {
  return (
    event.type === "item.started" &&
    ["mcp_tool_call", "command_execution"].includes(event.item?.type)
  );
}

function toolCode(event) {
  if (event.item?.type === "mcp_tool_call") {
    return String(event.item.arguments?.code ?? "");
  }
  return String(event.item?.command ?? "");
}

function toolName(event) {
  if (event.item?.type === "mcp_tool_call") {
    return `${event.item.server ?? "mcp"}/${event.item.tool ?? "tool"}`;
  }
  return "command_execution";
}

function outerStages(events) {
  let stages = 0;
  let previousWasStart = false;
  for (const event of events) {
    const started = isToolStart(event);
    if (started && !previousWasStart) stages += 1;
    previousWasStart = started;
  }
  return stages;
}

function longestStartCluster(events) {
  let current = 0;
  let maximum = 0;
  for (const event of events) {
    if (isToolStart(event)) {
      current += 1;
      maximum = Math.max(maximum, current);
    } else {
      current = 0;
    }
  }
  return maximum;
}

function promiseGroupSize(events, expectedPaths) {
  let maximum = 0;
  for (const event of events.filter(isToolStart)) {
    const code = toolCode(event);
    if (!/Promise\.all(?:Settled)?\s*\(/.test(code)) continue;
    const mentions = expectedPaths.filter((relative) => code.includes(relative)).length;
    maximum = Math.max(maximum, mentions);
  }
  return maximum;
}

function numberedFindings(text) {
  const starts = [...text.matchAll(/^\d+\.\s+/gm)].map((match) => match.index);
  return starts.map((start, index) => {
    const end = starts[index + 1] ?? text.length;
    return text.slice(start, end).trim().toLowerCase();
  });
}

function validateConclusion(findings, expected) {
  return expected.findings.map((finding) => {
    const matched = findings.some(
      (text) =>
        finding.all.every((word) => text.includes(word.toLowerCase())) &&
        finding.any.some((word) => text.includes(word.toLowerCase())),
    );
    return { id: finding.id, matched };
  });
}

function analyzeTrace(stdout, finalText, expected) {
  const events = stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const usage = events.find((event) => event.type === "turn.completed")?.usage;
  if (!usage) throw new BenchmarkError("Codex trace did not include measured usage.");
  const starts = events.filter(isToolStart);
  const maxGroupedOperations = Math.max(
    longestStartCluster(events),
    promiseGroupSize(events, expected.paths),
  );
  const findings = numberedFindings(finalText);
  const conclusionChecks = validateConclusion(findings, expected);
  const tableRows = finalText
    .split(/\r?\n/)
    .filter((line) => /^\|\s*`?[^|]+/.test(line))
    .filter((line) => expected.paths.some((relative) => line.includes(relative)));
  const pollingCalls = starts.reduce((sum, event) => {
    const name = toolName(event);
    const code = toolCode(event);
    return (
      sum +
      (/write_stdin|(?:^|[./_])wait(?:$|[./_])/.test(name) ? 1 : 0) +
      [...code.matchAll(/tools\.(?:write_stdin|wait)\s*\(/g)].length
    );
  }, 0);
  const extraScopeDetected = starts.some((event) =>
    /(?:^|[\s"'`])(rg|Get-ChildItem|git\s+(?:status|log|ls-files)|find)\b/i.test(
      toolCode(event),
    ),
  );
  const inputTokens = Number(usage.input_tokens ?? 0);
  const outputTokens = Number(usage.output_tokens ?? 0);
  return {
    metrics: {
      modelCycles: outerStages(events),
      inputTokens,
      cachedInputTokens: Number(usage.cached_input_tokens ?? 0),
      outputTokens,
      reasoningOutputTokens: Number(usage.reasoning_output_tokens ?? 0),
      totalTokens: inputTokens + outputTokens,
      toolCalls: starts.length,
      toolCallsPerOuterStage: Number(
        (starts.length / Math.max(outerStages(events), 1)).toFixed(2),
      ),
      maxGroupedOperations,
      pollingCalls,
    },
    validation: {
      coverageComplete:
        expected.paths.every((relative) => finalText.includes(relative)) &&
        tableRows.length === expected.paths.length,
      tableRows: tableRows.length,
      findingCount: findings.length,
      conclusionChecks,
      conclusionsComplete:
        findings.length === 3 && conclusionChecks.every((check) => check.matched),
      genuineGrouping: maxGroupedOperations >= 2,
      extraScopeDetected,
    },
  };
}

function runCodex(options, phase, pair, workRoot, metadata, expected, prompt) {
  const finalPath = path.join(workRoot, `${phase}-${pair}-final.md`);
  const started = Date.now();
  const args = [
    "exec",
    "--ephemeral",
    "--json",
    "-m",
    options.model,
    "-c",
    `model_reasoning_effort="${options.effort}"`,
    "-s",
    "read-only",
    "-C",
    FIXTURE_ROOT,
    "-o",
    finalPath,
    "-",
  ];
  const result = spawnCommand(options.codex, args, {
    input: prompt,
    encoding: "utf8",
    maxBuffer: 100 * 1024 * 1024,
    windowsHide: true,
  });
  if (result.error) {
    throw new BenchmarkError(`Could not start Codex: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new BenchmarkError(
      `Codex ${phase} pair ${pair} exited with code ${result.status}.`,
    );
  }
  const finalText = fs.readFileSync(finalPath, "utf8");
  const analyzed = analyzeTrace(result.stdout, finalText, expected);
  return {
    kind: "tokenshade-benchmark-run",
    schemaVersion: 1,
    pair,
    phase,
    model: options.model,
    reasoningEffort: options.effort,
    sandbox: "read-only",
    durationMs: Date.now() - started,
    ...metadata,
    ...analyzed,
  };
}

function scorecard(summary, metadata) {
  const baseline = summary.aggregate.baseline;
  const treatment = summary.aggregate.treatment;
  const reductions = summary.aggregate.reductions;
  const passed = Object.values(summary.gate).every(Boolean);
  return `# TokenShade benchmark scorecard

Five matched baseline/treatment pairs on the bundled eight-file public fixture.

| Metric | Baseline median | Treatment median | Change |
|---|---:|---:|---:|
| Model cycles | ${baseline.medianModelCycles} | ${treatment.medianModelCycles} | ${reductions.modelCyclesPercent}% fewer |
| Input tokens | ${baseline.medianInputTokens.toLocaleString("en-US")} | ${treatment.medianInputTokens.toLocaleString("en-US")} | workload observation |
| Cached input tokens | ${baseline.medianCachedInputTokens.toLocaleString("en-US")} | ${treatment.medianCachedInputTokens.toLocaleString("en-US")} | workload observation |
| Output tokens | ${baseline.medianOutputTokens.toLocaleString("en-US")} | ${treatment.medianOutputTokens.toLocaleString("en-US")} | workload observation |
| Total tokens | ${baseline.medianTotalTokens.toLocaleString("en-US")} | ${treatment.medianTotalTokens.toLocaleString("en-US")} | ${reductions.totalTokensPercent}% fewer |

Gate: **${passed ? "PASS" : "FAIL"}**

- Model: \`${metadata.model}\`
- Reasoning effort: \`${metadata.reasoningEffort}\`
- Sandbox: \`read-only\`
- Fixture tree: \`${metadata.fixtureTreeSha256}\`
- Fixture commit: \`${metadata.fixtureCommit}\`
- Prompt SHA-256: \`${metadata.promptSha256}\`
- Policy SHA-256: \`${metadata.policySha256}\`
- Codex: \`${metadata.codexVersion}\`
- Node: \`${metadata.nodeVersion}\`
- Platform: \`${metadata.platform}\`

These are observed medians for this bounded workload, not a universal token-savings promise.
Cached input is included inside input tokens and is never added a second time.
`;
}

function atomicRestore(target, original) {
  if (original.exists) {
    atomicWrite(target, original.bytes, original.mode);
    if (sha256(fs.readFileSync(target)) !== original.sha256) {
      throw new BenchmarkError("Original policy restoration hash mismatch.");
    }
  } else if (fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
}

function prepareResults(options) {
  const runs = path.join(options.results, "runs");
  if (fs.existsSync(runs)) {
    const existing = fs
      .readdirSync(runs)
      .filter((name) => name.endsWith(".json"));
    if (existing.length && !options.force) {
      throw new BenchmarkError(
        "Results already contain run JSON. Use a new --results directory or --force.",
      );
    }
    if (options.force) {
      const unexpected = existing.filter(
        (name) => !/^pair-\d+-(?:baseline|treatment)\.json$/.test(name),
      );
      if (unexpected.length) {
        throw new BenchmarkError(
          `Refusing to remove unknown result files: ${unexpected.join(", ")}.`,
        );
      }
      for (const name of existing) {
        fs.unlinkSync(path.join(runs, name));
      }
    }
  }
  fs.mkdirSync(runs, { recursive: true });
  return runs;
}

function dryRunPlan(options, metadata, originalState) {
  return {
    command: "tokenshade-benchmark",
    dryRun: true,
    pairs: options.pairs,
    sequence: Array.from({ length: options.pairs }, (_, index) => [
      `baseline-${index + 1}`,
      `treatment-${index + 1}`,
    ]).flat(),
    model: options.model,
    reasoningEffort: options.effort,
    sandbox: "read-only",
    fixtureFiles: 8,
    policyTarget: options.policyTarget,
    policyOriginalState: originalState,
    restoration: "exact bytes and mode in finally",
    rawArtifactsCommitted: false,
    ...metadata,
  };
}

async function main(argv = process.argv.slice(2)) {
  if (argv.includes("--help")) {
    process.stdout.write(help());
    return 0;
  }
  let options;
  try {
    options = parseArgs(argv);
    options.codex = resolveCommand(options.codex);
    const expected = JSON.parse(fs.readFileSync(EXPECTED_PATH, "utf8"));
    const prompt = fs.readFileSync(PROMPT_PATH, "utf8");
    const metadata = {
      fixtureCommit: repositoryCommit(),
      fixtureTreeSha256: fixtureTreeHash(expected.paths),
      promptSha256: sha256(prompt),
      policySha256: sha256(Buffer.from(`${canonicalPolicy()}\n`, "utf8")),
      codexVersion: commandVersion(options.codex, ["--version"]),
      nodeVersion: process.version,
      platform: `${process.platform}-${process.arch}`,
      model: options.model,
      reasoningEffort: options.effort,
    };
    const originalExists = fs.existsSync(options.policyTarget);
    const originalBytes = originalExists
      ? fs.readFileSync(options.policyTarget)
      : Buffer.alloc(0);
    const original = {
      exists: originalExists,
      bytes: originalBytes,
      text: originalBytes.toString("utf8"),
      mode: originalExists ? fs.statSync(options.policyTarget).mode : undefined,
      sha256: sha256(originalBytes),
    };
    const originalState =
      original.text.includes("<!-- tokenshade:start -->")
        ? "installed-or-malformed"
        : "absent";
    const plan = dryRunPlan(options, metadata, originalState);
    if (options.dryRun) {
      process.stdout.write(
        options.json
          ? `${JSON.stringify(plan, null, 2)}\n`
          : `${JSON.stringify(plan, null, 2)}\n`,
      );
      return 0;
    }

    const runsDirectory = prepareResults(options);
    const workRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tokenshade-benchmark-"));
    const backupPath = path.join(workRoot, `${original.sha256}-AGENTS.md.bak`);
    fs.writeFileSync(backupPath, original.bytes);
    if (sha256(fs.readFileSync(backupPath)) !== original.sha256) {
      throw new BenchmarkError("Temporary policy backup verification failed.");
    }

    let primaryError = null;
    try {
      for (let pair = 1; pair <= options.pairs; pair += 1) {
        for (const phase of ["baseline", "treatment"]) {
          const policy = policyContentForPhase(original.text, phase);
          atomicWrite(options.policyTarget, policy, original.mode);
          process.stderr.write(
            `TokenShade benchmark: ${phase} ${pair}/${options.pairs}\n`,
          );
          const run = runCodex(
            options,
            phase,
            pair,
            workRoot,
            metadata,
            expected,
            prompt,
          );
          fs.writeFileSync(
            path.join(runsDirectory, `pair-${pair}-${phase}.json`),
            `${JSON.stringify(run, null, 2)}\n`,
          );
        }
      }
    } catch (error) {
      primaryError = error;
    } finally {
      try {
        atomicRestore(options.policyTarget, original);
      } catch (restoreError) {
        if (primaryError) {
          throw new AggregateError(
            [primaryError, restoreError],
            "Benchmark failed and policy restoration also failed.",
          );
        }
        throw restoreError;
      } finally {
        fs.rmSync(workRoot, { recursive: true, force: true });
      }
    }
    if (primaryError) throw primaryError;

    const summary = summarizeResults({ results: runsDirectory });
    summary.gate.passed = Object.values(summary.gate).every(Boolean);
    fs.writeFileSync(
      path.join(options.results, "aggregate.json"),
      `${JSON.stringify({ ...summary, metadata }, null, 2)}\n`,
    );
    fs.writeFileSync(
      path.join(options.results, "SCORECARD.md"),
      scorecard(summary, metadata),
    );
    process.stdout.write(
      options.json
        ? `${JSON.stringify(summary, null, 2)}\n`
        : scorecard(summary, metadata),
    );
    return summary.gate.passed ? 0 : 3;
  } catch (error) {
    const message =
      error instanceof AggregateError
        ? error.errors.map((item) => item.message).join(" | ")
        : error instanceof Error
          ? error.message
          : String(error);
    process.stderr.write(`TokenShade benchmark error: ${message}\n`);
    return 1;
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) process.exitCode = await main();

export {
  analyzeTrace,
  fixtureTreeHash,
  main,
  numberedFindings,
  parseArgs,
  scorecard,
  validateConclusion,
};
