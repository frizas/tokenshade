# Honest Numbers

TokenShade targets one specific source of waste: repeated model cycles caused
by serial independent tool calls and overly frequent command polling.

It does not claim universal token savings.

## Release benchmark

The public release run consists of five alternating serial-control/TokenShade
pairs. It is a mechanism benchmark: the harness temporarily installs an
explicit one-file-per-call global control policy for baseline runs and the
canonical TokenShade marker block for treatment runs. The fixed task prompt is
identical in both phases and simply requires the active global staging policy
to be followed. The prompt also names the three cross-file questions so
conclusion equivalence is deterministic rather than dependent on which valid
risks the model happens to prioritize.

Every run uses:

- model `gpt-5.6-sol`;
- reasoning effort `xhigh`;
- read-only sandbox;
- the same eight-file repository-owned fixture;
- the same prompt and expected findings;
- the same Codex and application version; and
- the same global policy, with only the temporary serial control or canonical
  TokenShade block installed for the relevant phase.

The harness stores sanitized per-run JSON only. Raw JSONL, final prose, prompts,
credentials, personal sessions, and private repository data are temporary and
are never committed.

## Gate

A release claim is allowed only when all conditions pass:

| Requirement | Gate |
|---|---:|
| Median model-cycle reduction | at least 30% |
| Median total-token reduction | at least 20% |
| Fixture coverage | 8 of 8 files in every run |
| Conclusions | all three expected themes in every run |
| Serial control | exactly eight one-file calls in every baseline |
| Treatment grouping | at least two operations in every run |
| Treatment polling | zero |
| Extra investigation scope | zero |

An earlier unguided preflight did not pass: Sol grouped the reads without
TokenShade in three of five baseline runs, producing 0% fewer median cycles and
16.21% fewer median total tokens. That result is why the release evidence is
described as a mechanism benchmark, not a comparison against default Sol or a
claim about every session. It also demonstrates an important limit: TokenShade
can be neutral when the host already groups the work. Its sanitized aggregate
is retained at `benchmarks/preflight/unguided-sol-xhigh.json`.

The authoritative release results live in `benchmarks/results/aggregate.json`,
with the human scorecard in `benchmarks/results/SCORECARD.md`.

## Token accounting

`totalTokens` is `input_tokens + output_tokens`. Cached input is already part of
input tokens and is reported separately; it is never added twice. “Fewer”
means a reduction in observed medians for this fixture, not an estimate of
future plan usage.

## What the benchmark can and cannot show

It can show the cost difference between explicitly serial and explicitly
grouped orchestration on a bounded Code Mode compliance workload while
preserving coverage and conclusions.

It cannot show:

- savings on every repository or task;
- savings for ChatGPT conversations without agent tools;
- savings on other models or agent hosts;
- dollar or plan-limit impact; or
- causality outside the matched workload.

TokenShade may be neutral when there is only one call, later arguments depend
on earlier results, approvals dominate, mutations conflict, or the host already
groups independent tools.

## Reproduce

```text
npm run benchmark -- --dry-run
npm run benchmark -- --pairs 5 --model gpt-5.6-sol --effort xhigh
```

Running the live comparison invokes the installed Codex CLI and therefore uses
the operator's normal OpenAI service access. TokenShade itself adds no network
client or telemetry.
