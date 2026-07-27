import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const isStaticExport = process.env.VERCEL === "1" || isGitHubPages;

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        images: { unoptimized: true },
        typescript: { tsconfigPath: "tsconfig.static.json" },
      }
    : {}),
  ...(isGitHubPages ? { basePath: "/tokenshade" } : {}),
};

export default nextConfig;
