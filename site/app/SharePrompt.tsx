"use client";

import { useState } from "react";

const productUrl = "https://tokenshade.vercel.app";

function currentPromptUrl(): string {
  return new URL("#prompt", window.location.href).toString();
}

export function SharePrompt({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const fallbackText = encodeURIComponent(`${text}\n\nTokenShade: ${productUrl}`);

  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "TokenShade",
          text,
          url: currentPromptUrl(),
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    setOpen((value) => !value);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(currentPromptUrl());
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 1800);
  }

  return (
    <div className="prompt-share">
      <button
        className="prompt-share-button"
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={share}
        data-analytics-event="ts_prompt_share"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 15V3m0 0L8 7m4-4 4 4M6 10H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
        <span>Share</span>
      </button>
      {open ? (
        <div className="share-menu" role="menu" aria-label="Share TokenShade">
          <a
            role="menuitem"
            href={`https://wa.me/?text=${fallbackText}`}
            target="_blank"
            rel="noreferrer"
            data-analytics-event="ts_share_whatsapp"
          >
            WhatsApp
          </a>
          <a
            role="menuitem"
            href={`https://twitter.com/intent/tweet?text=${fallbackText}`}
            target="_blank"
            rel="noreferrer"
            data-analytics-event="ts_share_x"
          >
            X
          </a>
          <button
            role="menuitem"
            type="button"
            onClick={copyLink}
            data-analytics-event="ts_share_copy_link"
          >
            {linkCopied ? "Link copied" : "Copy link"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
