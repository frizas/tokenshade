<!-- tokenshade:start -->
### TokenShade: shade the waste, not the work

- In one Code Mode `exec` stage, group two or more independent, already-known tool calls so they run concurrently. Use `Promise.allSettled` when partial results remain useful and inspect every result; use `Promise.all` when any failure should abort the stage.
- Keep dependencies, adaptive exploration, approvals, conflicting mutations, waits, and resumes sequential. Do not disguise one call as a batch, expand scope to fill a batch, or combine calls whose results determine later arguments.
- Give a long-running command the longest useful initial yield supported by the tool, targeting 30 seconds when available. If it remains active, resume at meaningful 45–60-second intervals; do not burn turns on rapid polling.
<!-- tokenshade:end -->
