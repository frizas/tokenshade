<p align="center">
  <img src="./assets/tokenshade-generated-mark.png" alt="TokenShade sun wearing shades" width="160">
</p>

<h1 align="center">TokenShade</h1>

<p align="center"><strong>Stop the burn on your plan.</strong></p>

<p align="center">
  TokenShade helps your coding agent batch independent tools and stop spending model turns
  on repetitive polling.
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="./docs/HONEST-NUMBERS.md">Honest numbers</a> ·
  <a href="./docs/PORTABILITY.md">Other agents</a> ·
  <a href="./SECURITY.md">Security</a>
</p>

![TokenShade social card](./assets/social-card-generated.png)

## The problem

Four independent tool calls do not need four model loops.

```text
serial
model → tool → model → tool → model → tool → model → tool

TokenShade
model → [ tool · tool · tool · tool ] → model
```

When an agent serializes work whose arguments were already known, each return
can trigger another full-context model cycle. Rapid polling of a command that
is still running can add more turns without adding information.

TokenShade adds three narrow orchestration rules:

1. Group two or more independent, already-known calls in one tool stage.
2. Keep dependencies, exploration, approvals, conflicting writes, waits, and
   resumes sequential.
3. Give long commands a meaningful initial wait and stop rapid polling.

It does not change your model, reasoning effort, permissions, memory, or
existing instructions.

## Install

```text
codex plugin marketplace add frizas/tokenshade
codex plugin add tokenshade@tokenshade
```

Restart Codex, then ask:

```text
@tokenshade install
```

The installer previews the change, preserves everything outside the exact
TokenShade markers, and makes a content-hash backup before changing an existing
policy file.

### Instruction-only fallback

Clone the repository and run:

```text
node plugins/tokenshade/scripts/tokenshade.mjs install --dry-run --json
node plugins/tokenshade/scripts/tokenshade.mjs install --json
```

The dependency-free utility uses Node.js 20+ built-ins and works on Windows,
macOS, and Linux.

Status and removal are equally explicit:

```text
node plugins/tokenshade/scripts/tokenshade.mjs status --json
node plugins/tokenshade/scripts/tokenshade.mjs uninstall --dry-run --json
node plugins/tokenshade/scripts/tokenshade.mjs uninstall --json
```

## What ships

- `@tokenshade` — safe install, update, status, recovery, and removal.
- `@tokenshade-audit` — local aggregate orchestration metrics without prompts,
  file contents, paths, or credentials.
- `@tokenshade-benchmark` — five matched before/after pairs on a public
  eight-file fixture.
- `policy/AGENTS.md` — the compact Codex fallback.
- `policy/PORTABLE.md` — agent-neutral instructions for compatible hosts.
- `adapters/` — copy-ready Claude Code and Kimi Code CLI files.
- A dependency-free Node.js utility. No hooks, backend, MCP server, telemetry,
  or runtime network client.

## Honest numbers

TokenShade publishes only measured, workload-specific medians. The release
gate requires:

- at least 30% fewer median model cycles;
- at least 20% fewer median total tokens;
- complete eight-file coverage and equivalent conclusions;
- genuine grouping in every treatment run; and
- no treatment polling or expanded investigation scope.

The fixture, prompt, expected findings, sanitized run metrics, environment
versions, hashes, and reproduction command are committed. See
[Honest Numbers](./docs/HONEST-NUMBERS.md).

The public fixture is a serial-control/TokenShade mechanism test, not an
organic-workload simulator or comparison against default Sol. The task prompt
is identical in both phases; the harness swaps only the temporary global
staging policy. An unguided preflight was neutral on median cycles because Sol
already grouped most baseline runs; that failed preflight and the applicability
limit are documented in Honest Numbers.

## Where it may be neutral

TokenShade is aimed at tool-heavy investigations. It may be neutral for a
single call, adaptive exploration, approval-heavy work, tightly coupled
mutations, or hosts that already batch independent tools. It does not compress
prompts or output, minimize generated code, or choose a cheaper model.

## Other agents

Codex is the measured target. ChatGPT Work users can paste the one-session
prompt, and the same orchestration principle can be installed as agent-neutral
instructions for Claude Code, Kimi Code CLI, and hosts that load persistent
Markdown policy. Those paths are labeled compatible, not benchmarked. Ordinary
ChatGPT chats without agent tools have nothing to batch. See
[Portability](./docs/PORTABILITY.md) and [Prompts](./PROMPTS.md).

## Development

```text
npm test
npm run check
npm run benchmark -- --dry-run
```

The landing page is in `site/` and uses the supported Sites vinext runtime.

## Independence

TokenShade is independent open-source software for OpenAI Codex. It is not
affiliated with or endorsed by OpenAI. “OpenAI,” “Codex,” and model names are
used descriptively.

MIT © frizas.
