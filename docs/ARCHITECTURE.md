# Architecture

TokenShade is deliberately instruction-first.

```text
Codex plugin
├── @tokenshade              policy lifecycle
├── @tokenshade-audit        local aggregate analysis
├── @tokenshade-benchmark    matched public fixture
└── dependency-free Node CLI
    ├── exact marker mutation
    ├── hash-verified backups
    ├── JSONL aggregate audit
    └── sanitized result summary
```

There is no backend, hosted API, telemetry SDK, MCP server, lifecycle hook, or
runtime network client.

The installer:

1. resolves one explicit instruction file;
2. rejects symlink targets and symlink backup directories;
3. classifies exact markers as absent, current, outdated, or malformed;
4. previews without writing when `--dry-run` is present;
5. backs up existing bytes under their SHA-256 hash;
6. changes only the marker span using an atomic write; and
7. verifies the resulting bytes.

Malformed recovery removes only exact marker lines and a recognized canonical
body. Unknown text is preserved.

The audit streams `.jsonl` files in bounded chunks and emits only aggregate
counts plus optional opaque session hashes. It never emits paths, prompts, tool
arguments, contents, or credentials.
