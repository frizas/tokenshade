#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { StringDecoder } from "node:string_decoder";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const POLICY_FILE = path.resolve(SCRIPT_DIR, "..", "assets", "tokenshade-policy.md");
const PORTABLE_POLICY_FILE = path.resolve(
  SCRIPT_DIR,
  "..",
  "assets",
  "tokenshade-portable-policy.md",
);
const START_MARKER = "<!-- tokenshade:start -->";
const END_MARKER = "<!-- tokenshade:end -->";
const BENCHMARK_CONTROL_START = "<!-- tokenshade-benchmark-control:start -->";
const BENCHMARK_CONTROL_END = "<!-- tokenshade-benchmark-control:end -->";
const BENCHMARK_CONTROL = `${BENCHMARK_CONTROL_START}
### TokenShade benchmark control: serial tool staging

- For the current TokenShade benchmark task only, issue exactly one Node-backed Code Mode call for each explicitly listed file, in the listed order. Wait for each result before issuing the next call.
- Read exactly one file per call. Do not use \`Promise.all\`, \`Promise.allSettled\`, or any other multi-operation wrapper.
${BENCHMARK_CONTROL_END}`;
const BACKUP_DIRNAME = ".tokenshade-backups";
const VERSION = "0.1.0";

class CliError extends Error {
  constructor(message, code = 2) {
    super(message);
    this.name = "CliError";
    this.code = code;
  }
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function defaultTarget() {
  const codexHome = process.env.CODEX_HOME
    ? path.resolve(process.env.CODEX_HOME)
    : path.join(os.homedir(), ".codex");
  return path.join(codexHome, "AGENTS.md");
}

function normalizeProfile(profile = "codex") {
  if (!["codex", "portable"].includes(profile)) {
    throw new CliError("Policy profile must be codex or portable.");
  }
  return profile;
}

function canonicalPolicy(profile = "codex") {
  const selected =
    normalizeProfile(profile) === "portable" ? PORTABLE_POLICY_FILE : POLICY_FILE;
  return fs.readFileSync(selected, "utf8").replace(/\r\n/g, "\n").trimEnd();
}

function detectEol(content) {
  return content.includes("\r\n") ? "\r\n" : "\n";
}

function renderCanonical(content = "", profile = "codex") {
  return canonicalPolicy(profile).replace(/\n/g, detectEol(content));
}

function markerMatches(content, marker) {
  const expression = new RegExp(
    `^[\\t ]*${escapeRegExp(marker)}[\\t ]*$`,
    "gm",
  );
  return [...content.matchAll(expression)];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function markerSpan(content) {
  const starts = markerMatches(content, START_MARKER);
  const ends = markerMatches(content, END_MARKER);
  if (starts.length !== 1 || ends.length !== 1) return null;
  const start = starts[0].index;
  const end = ends[0].index + ends[0][0].length;
  if (start >= end) return null;
  return { start, end };
}

function classifyContent(content, profile = "codex") {
  const starts = markerMatches(content, START_MARKER);
  const ends = markerMatches(content, END_MARKER);
  if (starts.length === 0 && ends.length === 0) return "absent";
  const span = markerSpan(content);
  if (!span) return "malformed";
  const installed = content.slice(span.start, span.end).replace(/\r\n/g, "\n");
  return installed === canonicalPolicy(profile) ? "current" : "outdated";
}

function appendPolicy(content, profile = "codex") {
  const block = renderCanonical(content, profile);
  if (content.length === 0) return `${block}${detectEol(content)}`;
  const eol = detectEol(content);
  const separator = content.endsWith(`${eol}${eol}`)
    ? ""
    : content.endsWith(eol)
      ? eol
      : `${eol}${eol}`;
  return `${content}${separator}${block}${eol}`;
}

function replacePolicy(content, profile = "codex") {
  const span = markerSpan(content);
  if (!span) throw new CliError("TokenShade markers are malformed; use --recover.");
  return `${content.slice(0, span.start)}${renderCanonical(content, profile)}${content.slice(span.end)}`;
}

function removePolicy(content) {
  const span = markerSpan(content);
  if (!span) throw new CliError("TokenShade markers are malformed; use --recover.");
  return `${content.slice(0, span.start)}${content.slice(span.end)}`;
}

function appendBenchmarkControl(content) {
  if (
    content.includes(BENCHMARK_CONTROL_START) ||
    content.includes(BENCHMARK_CONTROL_END)
  ) {
    throw new CliError(
      "Benchmark control markers already exist in the global policy.",
    );
  }
  const eol = detectEol(content);
  const block = BENCHMARK_CONTROL.replace(/\n/g, eol);
  if (content.length === 0) return `${block}${eol}`;
  const separator = content.endsWith(`${eol}${eol}`)
    ? ""
    : content.endsWith(eol)
      ? eol
      : `${eol}${eol}`;
  return `${content}${separator}${block}${eol}`;
}

function recoverKnownPolicy(content, profile = "codex") {
  const markerLine = new RegExp(
    `^[\\t ]*(?:${escapeRegExp(START_MARKER)}|${escapeRegExp(END_MARKER)})[\\t ]*(?:\\r?\\n|$)`,
    "gm",
  );
  let recovered = content.replace(markerLine, "");
  const eol = detectEol(recovered);
  const canonicalLines = canonicalPolicy(profile).split("\n");
  const recognizedBody = canonicalLines.slice(1, -1).join(eol);
  const bodyIndex = recovered.indexOf(recognizedBody);
  if (bodyIndex >= 0) {
    recovered =
      recovered.slice(0, bodyIndex) +
      recovered.slice(bodyIndex + recognizedBody.length);
  }
  return recovered;
}

function policyContentForPhase(content, phase) {
  const state = classifyContent(content, "codex");
  if (state === "malformed") {
    throw new CliError("TokenShade markers are malformed; repair them before benchmarking.");
  }
  if (phase === "baseline") {
    const withoutTokenShade = state === "absent" ? content : removePolicy(content);
    return appendBenchmarkControl(withoutTokenShade);
  }
  if (phase === "treatment") {
    if (state === "absent") return appendPolicy(content, "codex");
    return state === "current" ? content : replacePolicy(content);
  }
  throw new CliError(`Unknown policy phase: ${phase}.`);
}

function readTarget(target) {
  if (!fs.existsSync(target)) return { exists: false, content: "" };
  const stat = fs.lstatSync(target);
  if (stat.isSymbolicLink()) {
    throw new CliError(`Policy target must not be a symbolic link: ${target}`);
  }
  if (!stat.isFile()) throw new CliError(`Policy target is not a file: ${target}`);
  return { exists: true, content: fs.readFileSync(target, "utf8"), mode: stat.mode };
}

function atomicWrite(target, content, mode) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = path.join(
    path.dirname(target),
    `.${path.basename(target)}.tokenshade-${process.pid}-${crypto.randomBytes(6).toString("hex")}.tmp`,
  );
  try {
    fs.writeFileSync(temporary, content, { encoding: "utf8", mode: mode ?? 0o600 });
    try {
      fs.renameSync(temporary, target);
    } catch (error) {
      if (!["EEXIST", "EPERM"].includes(error.code)) throw error;
      fs.copyFileSync(temporary, target);
      fs.unlinkSync(temporary);
    }
    if (mode !== undefined) fs.chmodSync(target, mode);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

function backupDirectory(target, explicit) {
  return explicit
    ? path.resolve(explicit)
    : path.join(path.dirname(target), BACKUP_DIRNAME);
}

function createBackup(target, content, explicitDirectory) {
  const directory = backupDirectory(target, explicitDirectory);
  if (fs.existsSync(directory) && fs.lstatSync(directory).isSymbolicLink()) {
    throw new CliError(
      `Backup directory must not be a symbolic link: ${directory}`,
    );
  }
  fs.mkdirSync(directory, { recursive: true });
  const hash = sha256(content);
  const destination = path.join(
    directory,
    `${hash}-${path.basename(target)}.bak`,
  );
  if (fs.existsSync(destination)) {
    const existing = fs.readFileSync(destination);
    if (sha256(existing) !== hash) {
      throw new CliError("Existing TokenShade backup failed its content hash.");
    }
    return { path: destination, sha256: hash, reused: true };
  }
  atomicWrite(destination, content, 0o600);
  if (sha256(fs.readFileSync(destination)) !== hash) {
    throw new CliError("TokenShade backup verification failed.");
  }
  return { path: destination, sha256: hash, reused: false };
}

function policyStatus(target, profile = "codex") {
  const selectedProfile = normalizeProfile(profile);
  const current = readTarget(target);
  return {
    exists: current.exists,
    profile: selectedProfile,
    state: classifyContent(current.content, selectedProfile),
    targetSha256: current.exists ? sha256(current.content) : null,
    policySha256: sha256(
      Buffer.from(`${canonicalPolicy(selectedProfile)}\n`, "utf8"),
    ),
  };
}

function mutatePolicy(command, options) {
  const profile = normalizeProfile(options.profile ?? "codex");
  const target = path.resolve(options.target ?? defaultTarget());
  const before = readTarget(target);
  const beforeState = classifyContent(before.content, profile);
  let next = before.content;

  if (beforeState === "malformed") {
    if (!options.recover) {
      throw new CliError(
        "TokenShade markers are malformed. Re-run with --recover to preserve unknown text and repair recognized policy lines.",
      );
    }
    next = recoverKnownPolicy(before.content, profile);
  }

  if (command === "install" || command === "update") {
    const recoveredState = classifyContent(next, profile);
    if (recoveredState === "absent") next = appendPolicy(next, profile);
    else if (recoveredState !== "current") next = replacePolicy(next, profile);
  } else if (command === "uninstall") {
    const recoveredState = classifyContent(next, profile);
    if (recoveredState === "current" || recoveredState === "outdated") {
      next = removePolicy(next);
    }
  } else {
    throw new CliError(`Unsupported policy command: ${command}`);
  }

  const changed = next !== before.content;
  const result = {
    schemaVersion: 1,
    command,
    profile,
    target,
    before: beforeState,
    after: classifyContent(next, profile),
    changed,
    dryRun: options.dryRun === true,
    recovered: beforeState === "malformed" && options.recover === true,
    beforeSha256: before.exists ? sha256(before.content) : null,
    afterSha256: sha256(next),
    backupPlanned: changed && before.exists,
    backup: null,
  };

  if (!changed || options.dryRun) return result;
  if (before.exists) {
    result.backup = createBackup(target, before.content, options.backupDir);
  }
  atomicWrite(target, next, before.mode);
  const verified = readTarget(target).content;
  if (verified !== next) throw new CliError("Policy write verification failed.");
  return result;
}

function purgeBackups(options) {
  if (!options.yes) {
    throw new CliError("Backup purge requires an explicit --yes.");
  }
  const target = path.resolve(options.target ?? defaultTarget());
  const directory = backupDirectory(target, options.backupDir);
  if (!fs.existsSync(directory)) {
    return {
      schemaVersion: 1,
      command: "purge-backups",
      target,
      backupDirectory: directory,
      matched: 0,
      removed: 0,
      dryRun: options.dryRun === true,
    };
  }
  const directoryRoot = path.resolve(directory);
  const entries = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        /^[a-f0-9]{64}-.+\.bak$/i.test(entry.name),
    );
  let removed = 0;
  for (const entry of entries) {
    const candidate = path.resolve(directory, entry.name);
    if (
      candidate !== directoryRoot &&
      !candidate.startsWith(`${directoryRoot}${path.sep}`)
    ) {
      throw new CliError("Backup purge candidate escaped its directory.");
    }
    if (!options.dryRun) fs.unlinkSync(candidate);
    removed += 1;
  }
  return {
    schemaVersion: 1,
    command: "purge-backups",
    target,
    backupDirectory: directory,
    matched: entries.length,
    removed,
    dryRun: options.dryRun === true,
  };
}

function listJsonlFiles(root) {
  if (!fs.existsSync(root)) return [];
  const stat = fs.lstatSync(root);
  if (stat.isSymbolicLink()) {
    throw new CliError("Session root must not be a symbolic link.");
  }
  if (!stat.isDirectory()) throw new CliError("Session root must be a directory.");
  const files = [];
  const stack = [path.resolve(root)];
  while (stack.length) {
    const directory = stack.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      const candidate = path.join(directory, entry.name);
      if (entry.isDirectory()) stack.push(candidate);
      else if (
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".jsonl") &&
        entry.name.toLowerCase() !== "auth.json"
      ) {
        files.push(candidate);
      }
    }
  }
  return files.sort();
}

function asNumber(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
}

function emptyUsage() {
  return {
    inputTokens: 0,
    cachedInputTokens: 0,
    outputTokens: 0,
    reasoningOutputTokens: 0,
    totalTokens: 0,
  };
}

function addUsage(target, source) {
  const input = asNumber(source.input_tokens, source.inputTokens);
  const cached = asNumber(
    source.cached_input_tokens,
    source.cachedInputTokens,
  );
  const output = asNumber(source.output_tokens, source.outputTokens);
  const reasoning = asNumber(
    source.reasoning_output_tokens,
    source.reasoningOutputTokens,
  );
  target.inputTokens += input;
  target.cachedInputTokens += cached;
  target.outputTokens += output;
  target.reasoningOutputTokens += reasoning;
  target.totalTokens += input + output;
}

function parseToolRecord(record) {
  if (record.type === "item.started") {
    const item = record.item ?? {};
    if (!["mcp_tool_call", "command_execution"].includes(item.type)) return null;
    if (item.type === "command_execution") {
      return { name: "command_execution", code: String(item.command ?? "") };
    }
    return {
      name: `${item.server ?? "mcp"}/${item.tool ?? "tool"}`,
      code: String(item.arguments?.code ?? ""),
    };
  }
  if (record.type !== "response_item") return null;
  const payload = record.payload ?? {};
  if (!["custom_tool_call", "function_call"].includes(payload.type)) return null;
  let parsed = {};
  const raw = payload.input ?? payload.arguments ?? "";
  if (typeof raw === "object" && raw !== null) parsed = raw;
  else {
    try {
      parsed = JSON.parse(String(raw));
    } catch {
      parsed = {};
    }
  }
  return {
    name: String(payload.name ?? payload.tool_name ?? payload.call_id ?? "tool"),
    code: String(parsed.code ?? parsed.cmd ?? ""),
  };
}

function countMatches(value, expression) {
  return [...String(value).matchAll(expression)].length;
}

function* readLinesSync(file) {
  const descriptor = fs.openSync(file, "r");
  const decoder = new StringDecoder("utf8");
  const buffer = Buffer.allocUnsafe(64 * 1024);
  let pending = "";
  try {
    for (;;) {
      const bytesRead = fs.readSync(
        descriptor,
        buffer,
        0,
        buffer.length,
        null,
      );
      if (bytesRead === 0) break;
      pending += decoder.write(buffer.subarray(0, bytesRead));
      const lines = pending.split(/\r?\n/);
      pending = lines.pop() ?? "";
      yield* lines;
    }
    pending += decoder.end();
    if (pending) yield pending;
  } finally {
    fs.closeSync(descriptor);
  }
}

function analyzeSession(file, root) {
  const metrics = {
    modelCycles: 0,
    toolCalls: 0,
    execCells: 0,
    groupedExecCells: 0,
    singletonExecCells: 0,
    promiseAllCells: 0,
    promiseAllSettledCells: 0,
    pollingCalls: 0,
    parseErrors: 0,
    usage: emptyUsage(),
  };
  const tokenEvents = [];
  const completedTurns = [];
  for (const line of readLinesSync(file)) {
    if (!line.trim()) continue;
    let record;
    try {
      record = JSON.parse(line);
    } catch {
      metrics.parseErrors += 1;
      continue;
    }
    if (
      record.type === "event_msg" &&
      record.payload?.type === "token_count" &&
      record.payload?.info?.last_token_usage
    ) {
      tokenEvents.push(record.payload.info.last_token_usage);
    }
    if (record.type === "turn.completed" && record.usage) {
      completedTurns.push(record.usage);
    }
    const tool = parseToolRecord(record);
    if (!tool) continue;
    metrics.toolCalls += 1;
    const name = tool.name.toLowerCase();
    if (/write_stdin|(?:^|[./_])wait(?:$|[./_])/.test(name)) {
      metrics.pollingCalls += 1;
    }
    const isExec =
      name.includes("functions.exec") ||
      name.endsWith("/exec") ||
      name === "exec" ||
      tool.code.includes("tools.");
    if (!isExec) continue;
    metrics.execCells += 1;
    const nestedCalls = countMatches(tool.code, /tools\.[A-Za-z0-9_]+\s*\(/g);
    const allSettled = /Promise\.allSettled\s*\(/.test(tool.code);
    const all = /Promise\.all\s*\(/.test(tool.code);
    if (allSettled) metrics.promiseAllSettledCells += 1;
    else if (all) metrics.promiseAllCells += 1;
    if ((all || allSettled) && nestedCalls >= 2) metrics.groupedExecCells += 1;
    else if (nestedCalls <= 1) metrics.singletonExecCells += 1;
    metrics.pollingCalls += countMatches(
      tool.code,
      /tools\.(?:write_stdin|wait)\s*\(/g,
    );
  }
  const usages = tokenEvents.length ? tokenEvents : completedTurns;
  metrics.modelCycles = usages.length;
  for (const usage of usages) addUsage(metrics.usage, usage);
  return {
    id: sha256(path.relative(root, file)).slice(0, 12),
    metrics,
  };
}

function addMetrics(target, source) {
  for (const key of [
    "modelCycles",
    "toolCalls",
    "execCells",
    "groupedExecCells",
    "singletonExecCells",
    "promiseAllCells",
    "promiseAllSettledCells",
    "pollingCalls",
    "parseErrors",
  ]) {
    target[key] += source[key];
  }
  for (const key of Object.keys(target.usage)) {
    target.usage[key] += source.usage[key];
  }
}

function auditSessions(options) {
  const root = path.resolve(
    options.sessions ?? path.join(process.env.CODEX_HOME ?? path.join(os.homedir(), ".codex"), "sessions"),
  );
  const files = listJsonlFiles(root);
  const aggregate = {
    modelCycles: 0,
    toolCalls: 0,
    execCells: 0,
    groupedExecCells: 0,
    singletonExecCells: 0,
    promiseAllCells: 0,
    promiseAllSettledCells: 0,
    pollingCalls: 0,
    parseErrors: 0,
    usage: emptyUsage(),
  };
  const sessions = files.map((file) => analyzeSession(file, root));
  for (const session of sessions) addMetrics(aggregate, session.metrics);
  return {
    schemaVersion: 1,
    command: "audit",
    source: "local-session-aggregate",
    privacy: {
      promptsEmitted: false,
      toolArgumentsEmitted: false,
      pathsEmitted: false,
      credentialsRead: false,
      networkAccess: false,
    },
    sessionFiles: sessions.length,
    measured: aggregate,
    interpretation: {
      singletonExecCellsAreHeuristicOpportunities: true,
      tokenSavingsEstimated: false,
      cachedInputIncludedInsideInputTokens: true,
    },
    ...(options.perSession ? { sessions } : {}),
  };
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function percentReduction(before, after) {
  if (before === 0) return null;
  return Number((((before - after) / before) * 100).toFixed(2));
}

function listBenchmarkRuns(root) {
  if (!fs.existsSync(root)) throw new CliError("Benchmark results directory does not exist.");
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => {
      const data = JSON.parse(fs.readFileSync(path.join(root, entry.name), "utf8"));
      return data.kind === "tokenshade-benchmark-run" ? data : null;
    })
    .filter(Boolean);
}

function summarizeResults(options) {
  const root = path.resolve(options.results ?? path.join(process.cwd(), "benchmarks", "results", "runs"));
  const runs = listBenchmarkRuns(root);
  const baseline = runs.filter((run) => run.phase === "baseline");
  const treatment = runs.filter((run) => run.phase === "treatment");
  if (!baseline.length || !treatment.length) {
    throw new CliError("Summarization requires baseline and treatment run JSON.");
  }
  const aggregatePhase = (selected) => ({
    runs: selected.length,
    medianModelCycles: median(selected.map((run) => run.metrics.modelCycles)),
    medianInputTokens: median(selected.map((run) => run.metrics.inputTokens)),
    medianCachedInputTokens: median(
      selected.map((run) => run.metrics.cachedInputTokens),
    ),
    medianOutputTokens: median(selected.map((run) => run.metrics.outputTokens)),
    medianTotalTokens: median(selected.map((run) => run.metrics.totalTokens)),
    medianToolCalls: median(selected.map((run) => run.metrics.toolCalls)),
    medianToolCallsPerOuterStage: median(
      selected.map((run) => run.metrics.toolCallsPerOuterStage),
    ),
    medianMaxGroupedOperations: median(
      selected.map((run) => run.metrics.maxGroupedOperations),
    ),
    allCoverageComplete: selected.every((run) => run.validation.coverageComplete),
    allConclusionsComplete: selected.every(
      (run) => run.validation.conclusionsComplete,
    ),
    allGenuinelyGrouped: selected.every(
      (run) => run.validation.genuineGrouping,
    ),
    allControlCompliant: selected.every(
      (run) => run.validation.controlCompliant !== false,
    ),
    allNoExtraScope: selected.every(
      (run) => run.validation.extraScopeDetected !== true,
    ),
    totalPollingCalls: selected.reduce(
      (sum, run) => sum + run.metrics.pollingCalls,
      0,
    ),
  });
  const baselineAggregate = aggregatePhase(baseline);
  const treatmentAggregate = aggregatePhase(treatment);
  const reductions = {
    modelCyclesPercent: percentReduction(
      baselineAggregate.medianModelCycles,
      treatmentAggregate.medianModelCycles,
    ),
    totalTokensPercent: percentReduction(
      baselineAggregate.medianTotalTokens,
      treatmentAggregate.medianTotalTokens,
    ),
  };
  return {
    schemaVersion: 1,
    command: "summarize",
    evidence: "observed-workload-specific",
    runs: { baseline: baseline.length, treatment: treatment.length },
    aggregate: {
      baseline: baselineAggregate,
      treatment: treatmentAggregate,
      reductions,
    },
    gate: {
      modelCyclesAtLeast30Percent:
        reductions.modelCyclesPercent !== null &&
        reductions.modelCyclesPercent >= 30,
      totalTokensAtLeast20Percent:
        reductions.totalTokensPercent !== null &&
        reductions.totalTokensPercent >= 20,
      completeCoverage:
        baselineAggregate.allCoverageComplete &&
        treatmentAggregate.allCoverageComplete,
      equivalentConclusions:
        baselineAggregate.allConclusionsComplete &&
        treatmentAggregate.allConclusionsComplete,
      serialControlEveryBaseline:
        baselineAggregate.allControlCompliant,
      genuineGroupingEveryTreatment:
        treatmentAggregate.allGenuinelyGrouped,
      noTreatmentPolling: treatmentAggregate.totalPollingCalls === 0,
      noExtraScopeEveryRun:
        baselineAggregate.allNoExtraScope &&
        treatmentAggregate.allNoExtraScope,
    },
  };
}

function parseArguments(argv) {
  const command = argv[0] ?? "help";
  const options = {};
  const valueOptions = new Set([
    "target",
    "backup-dir",
    "sessions",
    "results",
    "output",
    "profile",
  ]);
  const booleanOptions = new Set([
    "dry-run",
    "recover",
    "json",
    "yes",
    "per-session",
    "help",
  ]);
  for (let index = 1; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) throw new CliError(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    if (valueOptions.has(key)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new CliError(`Missing value for --${key}.`);
      }
      options[toCamelCase(key)] = value;
      index += 1;
    } else if (booleanOptions.has(key)) {
      options[toCamelCase(key)] = true;
    } else {
      throw new CliError(`Unknown option: --${key}.`);
    }
  }
  return { command, options };
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function helpText() {
  return `TokenShade ${VERSION}

Usage:
  tokenshade install [--target <instructions.md>] [--profile codex|portable] [--dry-run] [--recover] [--json]
  tokenshade update [--target <instructions.md>] [--profile codex|portable] [--dry-run] [--recover] [--json]
  tokenshade status [--target <instructions.md>] [--profile codex|portable] [--json]
  tokenshade uninstall [--target <instructions.md>] [--profile codex|portable] [--dry-run] [--recover] [--json]
  tokenshade purge-backups [--target <AGENTS.md>] --yes [--dry-run] [--json]
  tokenshade audit [--sessions <directory>] [--per-session] [--json]
  tokenshade summarize [--results <directory>] [--json]

TokenShade performs no telemetry or network calls and never reads auth.json.
`;
}

function humanResult(result) {
  if (result.command === "status") {
    return `TokenShade status: ${result.state}\nTarget: ${result.target}\n`;
  }
  if (result.command === "audit") {
    return [
      `Sessions: ${result.sessionFiles}`,
      `Model cycles: ${result.measured.modelCycles}`,
      `Code Mode cells: ${result.measured.execCells}`,
      `Grouped cells: ${result.measured.groupedExecCells}`,
      `Singleton cells: ${result.measured.singletonExecCells}`,
      `Polling calls: ${result.measured.pollingCalls}`,
      "Singleton cells are heuristic opportunities, not measured savings.",
      "",
    ].join("\n");
  }
  if (result.command === "summarize") {
    const reduction = result.aggregate.reductions;
    return [
      `Baseline runs: ${result.runs.baseline}`,
      `Treatment runs: ${result.runs.treatment}`,
      `Median model-cycle reduction: ${reduction.modelCyclesPercent ?? "n/a"}%`,
      `Median total-token reduction: ${reduction.totalTokensPercent ?? "n/a"}%`,
      "Observed on this workload only.",
      "",
    ].join("\n");
  }
  if (result.command === "purge-backups") {
    return `${result.dryRun ? "Would remove" : "Removed"} ${result.removed} TokenShade backup(s).\n`;
  }
  return [
    `TokenShade ${result.command}: ${result.changed ? "changed" : "unchanged"}`,
    `Target: ${result.target}`,
    `State: ${result.before} -> ${result.after}`,
    result.dryRun ? "Dry run: no files changed." : null,
    result.backup ? `Backup: ${result.backup.path}` : null,
    "",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

function execute(command, options = {}) {
  if (["install", "update", "uninstall"].includes(command)) {
    return mutatePolicy(command, options);
  }
  if (command === "status") {
    const target = path.resolve(options.target ?? defaultTarget());
    return {
      schemaVersion: 1,
      command,
      target,
      ...policyStatus(target, options.profile ?? "codex"),
    };
  }
  if (command === "purge-backups") return purgeBackups(options);
  if (command === "audit") return auditSessions(options);
  if (command === "summarize") return summarizeResults(options);
  if (command === "help" || options.help) return null;
  throw new CliError(`Unknown command: ${command}.`);
}

async function main(argv = process.argv.slice(2)) {
  let parsed = { command: "help", options: {} };
  try {
    parsed = parseArguments(argv);
    if (parsed.command === "help" || parsed.options.help) {
      process.stdout.write(helpText());
      return 0;
    }
    const result = execute(parsed.command, parsed.options);
    const output = parsed.options.json
      ? `${JSON.stringify(result, null, 2)}\n`
      : humanResult(result);
    if (parsed.options.output) {
      atomicWrite(path.resolve(parsed.options.output), output);
    } else {
      process.stdout.write(output);
    }
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (parsed.options?.json) {
      process.stderr.write(`${JSON.stringify({ error: message })}\n`);
    } else {
      process.stderr.write(`TokenShade error: ${message}\n`);
    }
    return error instanceof CliError ? error.code : 1;
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  process.exitCode = await main();
}

export {
  END_MARKER,
  START_MARKER,
  atomicWrite,
  auditSessions,
  canonicalPolicy,
  classifyContent,
  defaultTarget,
  execute,
  main,
  mutatePolicy,
  policyContentForPhase,
  policyStatus,
  recoverKnownPolicy,
  sha256,
  summarizeResults,
};
