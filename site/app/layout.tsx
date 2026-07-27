import type { Metadata } from "next";
import "./globals.css";

const title = "TokenShade for OpenAI Codex";
const description =
  "Stop the burn on your plan. TokenShade helps AI coding agents batch independent tools and avoid repetitive polling.";
const siteUrl = new URL("https://tokenshade.vercel.app");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title,
  description,
  alternates: {
    canonical: "/",
  },
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
    url: siteUrl,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

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
