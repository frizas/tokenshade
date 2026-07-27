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

## Verify a release

Tagged source archives ship with `SHA256SUMS` and signed GitHub/Sigstore build
provenance. After downloading a release:

```text
gh attestation verify tokenshade-v0.1.0.zip --repo frizas/tokenshade
gh attestation verify tokenshade-v0.1.0.tar.gz --repo frizas/tokenshade
```

On Linux or macOS, run `sha256sum -c SHA256SUMS`. On Windows, compare
`Get-FileHash -Algorithm SHA256` output with `SHA256SUMS`.

## Threat model limits

TokenShade does not protect a compromised operating system, Node runtime,
agent host, repository, or user account. It does not enforce concurrency at the
tool layer. Review third-party forks and installer commands before running them.
