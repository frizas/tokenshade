# TokenShade prompts

Use these when a plugin is not available. They are intentionally small enough
to merge into an existing agent policy.

## Codex

```markdown
### TokenShade: shade the waste, not the work

- In one Code Mode `exec` stage, group two or more independent, already-known tool calls so they run concurrently. Use `Promise.allSettled` when partial results remain useful and inspect every result; use `Promise.all` when any failure should abort the stage.
- Keep dependencies, adaptive exploration, approvals, conflicting mutations, waits, and resumes sequential. Do not disguise one call as a batch, expand scope to fill a batch, or combine calls whose results determine later arguments.
- On Windows, give a long command a 30-second initial yield. If it remains active, resume at meaningful 45–60-second intervals; do not burn turns on rapid polling.
```

## Agent-neutral

```markdown
### TokenShade: shade the waste, not the work

- When two or more tool calls are independent, already known, and their arguments do not depend on one another, issue them in one concurrent tool stage using the agent host's native batching mechanism. Inspect every result; preserve useful partial results when the host supports settled outcomes.
- Keep dependencies, adaptive exploration, approvals, conflicting mutations, waits, and resumes sequential. Do not disguise one call as a batch, expand scope to fill a batch, or combine calls whose results determine later arguments.
- Give long commands a meaningful initial wait. If a command remains active, resume at intervals appropriate to the expected runtime; do not spend model turns on rapid polling.
```

## One-session activation

```text
For this session, use TokenShade: group 2+ independent, already-known tool
calls in one native concurrent stage; inspect every result; keep dependencies,
exploration, approvals, conflicting writes, waits, and resumes sequential; and
avoid rapid polling of long commands. Do not expand scope merely to make a batch.
```

These are behavioral instructions, not hard enforcement. Keep host permission
and sandbox controls enabled.
