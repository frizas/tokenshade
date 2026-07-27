import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { summarizeResults } from "../plugins/tokenshade/scripts/tokenshade.mjs";

function temporaryDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "tokenshade-summary-test-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function run(phase, index, modelCycles, totalTokens, grouped) {
  return {
    kind: "tokenshade-benchmark-run",
    phase,
    pair: index,
    metrics: {
      modelCycles,
      inputTokens: totalTokens - 10,
      cachedInputTokens: Math.floor(totalTokens / 2),
      outputTokens: 10,
      totalTokens,
      toolCalls: modelCycles,
      pollingCalls: 0,
    },
    validation: {
      coverageComplete: true,
      conclusionsComplete: true,
      genuineGrouping: grouped,
    },
  };
}

test("summarizer computes medians without double-counting cached input", (t) => {
  const directory = temporaryDirectory(t);
  const runs = [
    run("baseline", 1, 10, 1000, false),
    run("baseline", 2, 12, 1200, false),
    run("treatment", 1, 3, 400, true),
    run("treatment", 2, 4, 500, true),
  ];
  runs.forEach((value, index) => {
    fs.writeFileSync(
      path.join(directory, `run-${index}.json`),
      JSON.stringify(value),
    );
  });

  const summary = summarizeResults({ results: directory });
  assert.equal(summary.evidence, "observed-workload-specific");
  assert.equal(summary.aggregate.baseline.medianModelCycles, 11);
  assert.equal(summary.aggregate.treatment.medianModelCycles, 3.5);
  assert.equal(summary.aggregate.baseline.medianTotalTokens, 1100);
  assert.equal(summary.aggregate.treatment.medianTotalTokens, 450);
  assert.equal(summary.aggregate.reductions.modelCyclesPercent, 68.18);
  assert.equal(summary.aggregate.reductions.totalTokensPercent, 59.09);
  assert.equal(summary.gate.modelCyclesAtLeast30Percent, true);
  assert.equal(summary.gate.totalTokensAtLeast20Percent, true);
  assert.equal(summary.gate.genuineGroupingEveryTreatment, true);
});
