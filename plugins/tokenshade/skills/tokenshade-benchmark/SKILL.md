---
name: tokenshade-benchmark
description: Run or summarize the bundled matched Codex batching benchmark on a public eight-file fixture. Use when a user asks to reproduce TokenShade's before and after evidence, compare baseline and treatment with identical model settings, validate coverage and conclusions, or generate a sanitized workload-specific scorecard.
---

# TokenShade Benchmark

Use the bundled harness at `../../scripts/benchmark.mjs`, resolved relative to this skill directory.

## Run a matched comparison

1. Explain that benchmark runs invoke the user's installed Codex CLI and therefore use the user's normal OpenAI service access; TokenShade itself adds no network client or telemetry.
2. Run `node ../../scripts/benchmark.mjs --dry-run` and inspect the model, effort, permissions, fixture hash, prompt hash, pair count, policy target, and restoration plan.
3. Run the benchmark only when the user requested model execution.
4. Keep the default five alternating baseline and treatment pairs unless the user explicitly selects another count.
5. Verify the harness restored the original policy bytes even when a run failed.
6. Report only sanitized per-run metrics and the aggregate scorecard.

Default command:

```text
node ../../scripts/benchmark.mjs --pairs 5 --model gpt-5.6-sol --effort xhigh
```

Summarize existing sanitized results without invoking Codex:

```text
node ../../scripts/tokenshade.mjs summarize --results <results-directory> --json
```

Keep raw JSONL, final prose, prompts, credentials, and private repository data out of committed results. Publish observed medians as workload-specific evidence, never as a universal promise.
