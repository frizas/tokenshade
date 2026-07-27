"use client";

import { useState } from "react";

export function CopyInstall({
  text,
  label = "Copy commands",
  className = "copy-button",
  clipboardIcon = false,
  analyticsEvent,
}: {
  text: string;
  label?: string;
  className?: string;
  clipboardIcon?: boolean;
  analyticsEvent?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      className={className}
      type="button"
      onClick={copy}
      data-analytics-event={analyticsEvent}
    >
      {clipboardIcon ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 5h6m-5-2h4a2 2 0 0 1 2 2v1h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V3h2Zm6 5H8v11h10V8Z" />
        </svg>
      ) : null}
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}
