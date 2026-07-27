# Contributing

Contributions that improve correctness, portability, safety, documentation, or
reproducibility are welcome.

Before opening a pull request:

```text
npm test
npm run check
npm run benchmark -- --dry-run
```

For site changes:

```text
npm ci --prefix site
npm test --prefix site
```

Keep changes narrow. Do not add product telemetry, credential access, a
backend, hooks, an MCP server, or additional runtime network calls without
first opening a design issue. The only website exception is the documented,
opt-in Google Analytics integration with fixed event names and no user content.

Benchmark claims must include the harness, sanitized per-run metrics, versions,
hashes, limitations, and reproduction commands. Never commit raw personal
sessions, private repositories, prompts, credentials, or final model prose.

By participating, you agree to the Code of Conduct.
