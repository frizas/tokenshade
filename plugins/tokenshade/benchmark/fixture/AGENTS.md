# Raybox fixture policy

This fixture describes a fictional offline-first reading client.

## Product boundary

Keep Raybox-specific copy, colors, reconnect behavior, and product rules in
`adapters/raybox/`. Files under `src/` are reusable engine code and must remain
product-neutral. A generic hook in `src/` may expose behavior to an adapter.

## Asset contract

Installed catalog assets have one runtime source of truth:

- `data/catalog/<version>/`
- `data/audio/<version>/`

Temporary download and staging directories are not runtime sources.

Integrity is strict by default:

- `verifyManifestSha256 = true`
- `allowHashMismatch = false`

Mobile builds must support ZIP installation without requiring the optional
native archive extension.

## Review expectation

Architecture investigations must distinguish packaging from proven runtime
installation. A bundle being present in an application package does not prove
that versioned runtime assets can be installed, verified, and loaded.
