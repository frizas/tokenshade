# Agent portability

TokenShade is Codex-first because its measured policy refers to Codex Code Mode
and its benchmark reads Codex event traces.

The core rule is agent-neutral: batch independent, already-known calls with the
host's native concurrent tool mechanism; keep dependent or risky work
sequential; poll long work at meaningful intervals.

| Host | File | Status |
|---|---|---|
| OpenAI Codex | `~/.codex/AGENTS.md` | Native and benchmarked |
| Kimi Code CLI | project `AGENTS.md` | Compatible, not benchmarked |
| Claude Code | project or user `CLAUDE.md` | Compatible, not benchmarked |
| Other hosts | persistent Markdown instructions | Portable prompt only |

## Kimi Code CLI

Kimi loads `AGENTS.md` instructions in its agent context. Copy
`adapters/kimi/AGENTS.md` into a project or merge its marker block into an
existing file.

## Claude Code

Claude Code reads `CLAUDE.md`, not `AGENTS.md`. Copy
`adapters/claude/CLAUDE.md`, merge its marker block, or import an existing
portable file from `CLAUDE.md`.

```markdown
@path/to/tokenshade/policy/PORTABLE.md
```

Claude's own documentation describes `~/.claude/CLAUDE.md` for user-wide
instructions and project `CLAUDE.md` for shared instructions. Keep the block
concise because persistent instructions consume context.

## Utility-assisted installation

The same safe marker installer can target another host's instruction file:

```text
node plugins/tokenshade/scripts/tokenshade.mjs install \
  --profile portable \
  --target /path/to/instructions.md \
  --dry-run --json
```

Run it again without `--dry-run` after inspecting the exact target and planned
state.

Portability means the instruction format can be applied. It does not mean the
Codex benchmark result transfers to another model or host.

Official host references:

- Claude Code: https://code.claude.com/docs/en/memory
- Kimi Code CLI: https://moonshotai.github.io/kimi-cli/en/customization/agents.html
