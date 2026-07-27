# Privacy

TokenShade has no telemetry, analytics, backend, hosted API, MCP server, or
runtime network client.

## Policy commands

Install, update, status, recovery, uninstall, and backup purge operate only on
the selected local instruction file and its local backup directory.

## Audit

The audit reads only `.jsonl` files beneath the selected session directory. It
skips symbolic links and does not read `auth.json`.

Output includes aggregate numeric metrics and, only when requested, opaque
hash-derived session identifiers. It does not emit:

- prompts or responses;
- tool arguments or file contents;
- file or directory paths;
- environment variables;
- credentials or authentication data; or
- estimated token savings.

## Benchmark

The benchmark invokes the user's installed Codex CLI, which uses the user's
normal OpenAI service access. Raw event traces and final prose remain in a
temporary directory and are removed after each run. Only sanitized run metrics
are retained.

See the OpenAI service's own privacy terms for data processed by Codex.
