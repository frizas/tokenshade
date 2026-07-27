# Privacy

The TokenShade plugin, command-line utility, audit, benchmark, and policy have
no product telemetry, analytics backend, hosted API, MCP server, or added
runtime network client. The public website has separate, consent-based
analytics described below.

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

## Public website analytics

The website at `tokenshade.vercel.app` offers an explicit analytics choice.
Google Analytics does not load until a visitor selects **Allow analytics**. A
visitor who selects **No thanks**, has browser Do Not Track enabled, or has not
made a choice sends no analytics request from TokenShade.

When allowed, the website records:

- a page view using the canonical path without URL query parameters; and
- fixed, code-defined event names for important button and link clicks.

TokenShade never places prompt text, code, file contents, credentials, copied
commands, user-entered values, or destination URLs in analytics events. Google
Signals and advertising-personalization signals are disabled, and the
TokenShade data stream has enhanced measurement disabled. Google Analytics may
still process its standard measurement fields, such as a first-party client
identifier, device and browser information, referrer, and coarse location.

The browser stores only the visitor's `granted` or `denied` choice under
`tokenshade-analytics-consent`. Clear site data for `tokenshade.vercel.app` to
reset that choice.

Google Analytics is operated by Google under
[Google's privacy policy](https://policies.google.com/privacy). Website
analytics are used only to understand aggregate traffic and which TokenShade
calls to action are useful.
