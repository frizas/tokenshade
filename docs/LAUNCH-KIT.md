# Launch kit

Replace bracketed benchmark values only with the committed public scorecard.

## Short X post

Sol runs hot. Your workflow doesn't have to. 😎

TokenShade helps Codex batch independent tools and stop burning model turns on
repetitive polling.

Open source. No telemetry. A/B tested with a reproducible public fixture.

https://github.com/frizas/tokenshade

## X thread

1. I kept seeing Codex spend a full model loop between tool calls that could
   have run together. So I built TokenShade: stop the token burn on your plan.

2. The rule is narrow: batch independent calls whose arguments are already
   known. Keep dependencies, exploration, approvals, writes, waits, and resumes
   sequential.

3. It also stops rapid polling. A command that needs a minute should not consume
   a stack of “still running?” turns.

4. TokenShade preserves your existing AGENTS.md, changes one marker block,
   creates hash-verified backups, and supports dry-run, status, and uninstall.

5. No telemetry, backend, hooks, MCP server, credential reads, or runtime
   network client.

6. The public benchmark is five matched Sol/XHigh A/B pairs on a fixed
   eight-file fixture. Observed median: [PUBLIC SCORECARD]. Workload-specific,
   not a universal promise.

7. Repo, method, sanitized results, and portable Claude/Kimi prompts:
   https://github.com/frizas/tokenshade

## Reddit / Hacker News

**TokenShade: a small Codex policy for batching independent tools**

TokenShade addresses a narrow orchestration issue: independent tool calls can be
serialized across full model cycles, and long commands can be polled too often.
It installs three compact behavioral rules, preserves existing instructions,
and includes a reproducible matched benchmark.

It is dependency-free at runtime, MIT licensed, and has no telemetry, backend,
hooks, or MCP server. The benchmark claim is explicitly workload-specific.

## LinkedIn

I open-sourced TokenShade, a Codex-first optimization for a surprisingly costly
workflow pattern: serial independent tools and repetitive polling.

Instead of changing the model or compressing its output, TokenShade changes the
orchestration policy. Independent, already-known calls can share a tool stage;
dependent and risky work stays sequential.

The repository includes a safe marker installer, privacy-preserving local audit,
reproducible five-pair benchmark, honest limitations, and portable instructions
for Claude Code and Kimi Code CLI.

https://github.com/frizas/tokenshade

## Product description

TokenShade is sunscreen for your token budget. It helps OpenAI Codex batch
independent tool calls and avoid turn-burning command polling, while preserving
dependencies, approvals, safety checks, and every existing instruction outside
its exact marker block.

TokenShade is independent and not affiliated with OpenAI.
