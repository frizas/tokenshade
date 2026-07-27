"use client";

import { useEffect, useState } from "react";

const measurementId = "G-XF80ZZLVB0";
const consentKey = "tokenshade-analytics-consent";

type Consent = "loading" | "pending" | "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function rememberConsent(value: "granted" | "denied") {
  try {
    window.localStorage.setItem(consentKey, value);
  } catch {
    // Analytics can still honor this choice for the current page.
  }
}

function startAnalytics() {
  if (window.gtag) return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: 60 * 60 * 24 * 180,
    cookie_flags: "SameSite=Lax;Secure",
    cookie_update: false,
    page_location: `${window.location.origin}${window.location.pathname}`,
    page_title: document.title,
    send_page_view: true,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.referrerPolicy = "strict-origin-when-cross-origin";
  document.head.append(script);
}

export function SiteAnalytics() {
  const [consent, setConsent] = useState<Consent>("loading");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (navigator.doNotTrack === "1") {
        setConsent("denied");
        return;
      }

      try {
        const stored = window.localStorage.getItem(consentKey);
        setConsent(
          stored === "granted" || stored === "denied" ? stored : "pending",
        );
      } catch {
        setConsent("pending");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (consent !== "granted") return;

    startAnalytics();

    function trackFixedInteraction(event: MouseEvent) {
      const origin = event.target;
      if (!(origin instanceof Element)) return;

      const target = origin.closest<HTMLElement>("[data-analytics-event]");
      const eventName = target?.dataset.analyticsEvent;
      if (!eventName || !/^ts_[a-z0-9_]+$/.test(eventName)) return;

      window.gtag?.("event", eventName);
    }

    document.addEventListener("click", trackFixedInteraction);
    return () => document.removeEventListener("click", trackFixedInteraction);
  }, [consent]);

  if (consent !== "pending") return null;

  return (
    <aside
      className="analytics-consent"
      aria-label="Website analytics choice"
      aria-live="polite"
    >
      <p>
        Mind if we count visits and clicks? Never prompts, code, files, or
        credentials.{" "}
        <a href="https://github.com/frizas/tokenshade/blob/main/PRIVACY.md">
          Privacy
        </a>
      </p>
      <div>
        <button
          type="button"
          onClick={() => {
            rememberConsent("denied");
            setConsent("denied");
          }}
        >
          No thanks
        </button>
        <button
          className="analytics-allow"
          type="button"
          onClick={() => {
            rememberConsent("granted");
            setConsent("granted");
          }}
        >
          Allow analytics
        </button>
      </div>
    </aside>
  );
}
