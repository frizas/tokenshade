# Security

## Supported versions

Security fixes are applied to the latest tagged release.

## Report a vulnerability

Use GitHub's private vulnerability reporting for `frizas/tokenshade`. Do not
open a public issue containing a credential, private prompt, session log, or
exploit that has not been remediated.

## Security properties

- Exact marker-only policy changes.
- Dry-run before mutation.
- SHA-256 named and verified backups.
- Atomic writes and post-write verification.
- Fail-closed malformed-marker handling.
- Symlink target and backup-directory rejection.
- Explicit `--yes` for backup purging.
- No credential reads, telemetry, hooks, MCP server, or runtime network client.
- Audit output excludes prompts, tool arguments, paths, and contents.

Instruction policies shape model behavior; they are not a security boundary.
Keep host sandboxes, permissions, approval gates, and normal review enabled.

## Threat model limits

TokenShade does not protect a compromised operating system, Node runtime,
agent host, repository, or user account. It does not enforce concurrency at the
tool layer. Review third-party forks and installer commands before running them.
