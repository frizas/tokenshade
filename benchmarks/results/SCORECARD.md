# TokenShade benchmark scorecard

5 matched serial-control/TokenShade pairs on the bundled eight-file public fixture.

| Metric | Serial control median | TokenShade median | Change |
|---|---:|---:|---:|
| Model cycles | 8 | 1 | 87.5% fewer |
| Input tokens | 241,514 | 68,740 | workload observation |
| Cached input tokens | 209,664 | 41,472 | workload observation |
| Output tokens | 1,861 | 1,359 | workload observation |
| Total tokens | 243,314 | 70,085 | 71.2% fewer |
| Tool calls / outer stage | 1 | 1 | staging observation |
| Max grouped operations | 1 | 8 | staging observation |
| Polling calls | 0 | 0 | aggregate |

Gate: **PASS**

- Model: `gpt-5.6-sol`
- Reasoning effort: `xhigh`
- Sandbox: `read-only`
- Fixture tree: `e107c4b3b5c46829b0b4f8f1217fa245459fe70c8213c9d2e9b06db8a3225175`
- Fixture commit: `d167aad4b92de2ae0b276d22f2535f383665b4de`
- Prompt SHA-256: `7d77d1874aa34ac22b59497d84733174bccf0e9f15cbf33120bae6666fbeb267`
- Policy SHA-256: `16a4247a8ea35bd069f2078c9ba9f3b2d45be235850829fff6220473987b72a9`
- Codex: `codex-cli 0.144.1`
- Node: `v22.22.2`
- Platform: `win32-x64`

These are observed medians for this bounded workload, not a universal token-savings promise.
The serial control is an explicit mechanism baseline, not a claim about default Sol behavior.
Cached input is included inside input tokens and is never added a second time.
