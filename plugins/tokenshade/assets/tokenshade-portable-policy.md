<!-- tokenshade:start -->
### TokenShade: shade the waste, not the work

- When two or more tool calls are independent, already known, and their arguments do not depend on one another, issue them in one concurrent tool stage using the agent host's native batching mechanism. Inspect every result; preserve useful partial results when the host supports settled outcomes.
- Keep dependencies, adaptive exploration, approvals, conflicting mutations, waits, and resumes sequential. Do not disguise one call as a batch, expand scope to fill a batch, or combine calls whose results determine later arguments.
- Give long commands a meaningful initial wait. If a command remains active, resume at intervals appropriate to the expected runtime; do not spend model turns on rapid polling.
<!-- tokenshade:end -->
