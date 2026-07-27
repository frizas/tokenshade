# Catalog asset installation

When a selected catalog version is missing, the client downloads a release ZIP,
checks its manifest, and installs the files permanently into:

- `data/catalog/<version>/`
- `data/audio/<version>/`

The release ZIP is the primary path. Individual manifest files are a recovery
path when archive installation fails. Runtime loading must never switch to the
download cache.

Security defaults are mandatory:

```text
verifyManifestSha256 = true
allowHashMismatch = false
```

Desktop builds may use the optional native archive extension. Builds without
that extension must retain a pure ZIP fallback. Required RAR packages are not
portable and must be rejected with a clear error on unsupported platforms.

Completion means more than downloading: the manifest is verified, files are
atomically promoted into the versioned runtime locations, the active catalog
pointer changes, and the next read resolves from the standard paths.

Mobile validation must demonstrate the same downloaded-catalog flow. The
presence of `bootstrap.zip` in an APK is not evidence for this contract.
