---
name: tokenshade-audit
description: Produce privacy-preserving aggregate metrics from local Codex JSONL sessions. Use when a user asks how often Codex batches independent tools, how many model or tool stages and polling calls appear locally, whether orchestration may have batching opportunities, or wants a TokenShade audit without exposing prompts, file contents, paths, credentials, or auth data.
---

# TokenShade Audit

Run the dependency-free utility at `../../scripts/tokenshade.mjs`, resolved relative to this skill directory.

## Run a private aggregate audit

1. Default to `node ../../scripts/tokenshade.mjs audit --json`.
2. Use `--sessions <directory>` only when the user names another Codex session root.
3. Add `--per-session` only when opaque per-session rows materially help; identifiers remain hashes and never expose paths.
4. Report aggregate counts and measured token fields exactly as emitted.
5. Describe singleton Code Mode cells as opportunities, not measured savings.

The audit recursively reads only `.jsonl` files beneath the selected session root. It skips any file named `auth.json`, never emits prompts, tool arguments, file contents, paths, environment values, or credentials, and performs no network calls.

Do not infer universal efficiency, add cached tokens to input tokens, or label heuristic opportunities as measured token savings.
