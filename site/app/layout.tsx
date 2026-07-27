import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "TokenShade — Stop the token burn on your plan";
const description =
  "TokenShade helps Codex batch independent tools and stop spending turns on repetitive polling.";

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
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title,
      description: "Safer tool batching and calmer polling for OpenAI Codex.",
      type: "website",
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: "Safer tool batching and calmer polling for OpenAI Codex.",
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
