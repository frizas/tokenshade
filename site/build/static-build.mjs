import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");
const mode = process.argv[2] ?? "--vercel";

if (!["--vercel", "--pages"].includes(mode)) {
  throw new Error(`Unknown static build target: ${mode}`);
}

const targetEnvironment =
  mode === "--pages"
    ? {
        GITHUB_PAGES: "true",
        NEXT_PUBLIC_BASE_PATH:
          process.env.NEXT_PUBLIC_BASE_PATH ?? "/tokenshade",
      }
    : { VERCEL: "1" };

const result = spawnSync(process.execPath, [nextCli, "build"], {
  env: {
    ...process.env,
    ...targetEnvironment,
    NEXT_TELEMETRY_DISABLED: "1",
  },
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
