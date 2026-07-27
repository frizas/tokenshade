import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "TokenShade for OpenAI Codex";
const description =
  "Stop the burn on your plan. TokenShade helps AI coding agents batch independent tools and avoid repetitive polling.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost ?? requestHeaders.get("host");
  const forwardedProtocol = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol =
    forwardedProtocol ?? (host?.startsWith("localhost") ? "http" : "https");
  let image: string | undefined;
  try {
    image = host ? new URL("/og.png", `${protocol}://${host}`).toString() : undefined;
  } catch {
    image = undefined;
  }

  return {
    title,
    description,
    keywords: [
      "TokenShade",
      "ChatGPT Work",
      "ChatGPT coding agent",
      "OpenAI Codex",
      "Codex CLI",
      "AGENTS.md",
      "GPT-5.6 Sol",
      "AI coding agent",
      "token usage",
      "tool batching",
    ],
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
