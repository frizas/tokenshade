import type { Metadata } from "next";
import "./globals.css";
import { sitePath } from "./sitePath";

const title = "TokenShade — Stop the burn on your plan";
const description =
  "Free, open-source tool orchestration for Codex and ChatGPT Work. Batch independent AI coding-agent tools and cut repetitive polling without changing your model.";
const siteUrl = new URL("https://tokenshade.vercel.app");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "TokenShade",
  title,
  description,
  authors: [{ name: "HiLeverage Studios" }],
  creator: "HiLeverage Studios",
  publisher: "HiLeverage Studios",
  category: "developer tools",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: sitePath("/favicon.svg"), type: "image/svg+xml" },
      {
        url: sitePath("/favicon-32x32.png"),
        sizes: "32x32",
        type: "image/png",
      },
    ],
    shortcut: sitePath("/favicon.ico"),
    apple: [
      {
        url: sitePath("/apple-touch-icon.png"),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: sitePath("/site.webmanifest"),
  openGraph: {
    title,
    description,
    type: "website",
    url: siteUrl,
    siteName: "TokenShade",
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "TokenShade — Stop the burn on your plan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
    creator: "@frizas",
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
