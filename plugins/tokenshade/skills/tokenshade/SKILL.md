---
name: tokenshade
description: Install, update, inspect, or remove the TokenShade marker block in a Codex AGENTS.md without changing unrelated instructions. Use when a user asks to enable safer concurrent tool batching, tune long-command polling, check TokenShade status, dry-run an installation, uninstall TokenShade, recover a malformed marker, or explicitly purge TokenShade backups.
---

# TokenShade

Use the dependency-free utility at `../../scripts/tokenshade.mjs`, resolved relative to this skill directory.

## Manage the policy

1. Run `node ../../scripts/tokenshade.mjs status --json` and inspect the exact target and state.
2. For install, update, or malformed-marker recovery, run the requested command with `--dry-run --json` first.
3. Report the target, current state, planned state, and whether a content-hash backup will be created.
4. Run the mutation only when it is within the user's request.
5. Run `status --json` again and report the verified result.

Use `--target <path>` only when the user selected a non-default policy file. Otherwise target `$CODEX_HOME/AGENTS.md`, falling back to `~/.codex/AGENTS.md`.

Use `--profile portable` only when the user selected a non-Codex instruction
file such as Claude Code's `CLAUDE.md` or Kimi's `AGENTS.md`. The default
`codex` profile keeps the measured Code Mode and Windows cadence wording.

Commands:

```text
node ../../scripts/tokenshade.mjs install [--target <AGENTS.md>] [--dry-run] [--recover] [--json]
node ../../scripts/tokenshade.mjs update [--target <AGENTS.md>] [--dry-run] [--recover] [--json]
node ../../scripts/tokenshade.mjs status [--target <AGENTS.md>] [--json]
node ../../scripts/tokenshade.mjs uninstall [--target <AGENTS.md>] [--dry-run] [--recover] [--json]
node ../../scripts/tokenshade.mjs purge-backups [--target <AGENTS.md>] --yes [--dry-run] [--json]
```

## Preserve safety boundaries

- Preserve every instruction outside the exact TokenShade markers.
- Create a content-hash backup before changing an existing policy file.
- Treat malformed markers as an error unless the user requested recovery.
- During recovery, remove only exact marker lines and a recognized canonical policy body; preserve unknown text.
- Never purge backups without an explicit user request and `--yes`.
- Never alter model, reasoning, memory, permissions, authentication, repositories, or production systems.
