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

Keep changes narrow. Do not add telemetry, credential access, a backend, hooks,
an MCP server, or runtime network calls without first opening a design issue.

Benchmark claims must include the harness, sanitized per-run metrics, versions,
hashes, limitations, and reproduction commands. Never commit raw personal
sessions, private repositories, prompts, credentials, or final model prose.

By participating, you agree to the Code of Conduct.
