/* eslint-disable @next/next/no-img-element -- Local, pre-sized brand assets keep the static Sites build simple. */
"use client";

import { useState } from "react";
import { sitePath } from "./sitePath";

const states = {
  shaded: {
    mode: "SHADED",
    action: "See the burn",
    title: "Cooler orchestration",
    points: [
      "Independent calls share one stage",
      "Context is revisited less",
      "Long work gets a real polling cadence",
    ],
  },
  unshaded: {
    mode: "UNSHADED",
    action: "Put on the shades",
    title: "Turn-by-turn burn",
    points: [
      "Independent calls can serialize",
      "The same context can return every turn",
      "Rapid polls can add empty loops",
    ],
  },
} as const;

export function ShadeDemo() {
  const [shaded, setShaded] = useState(true);
  const state = states[shaded ? "shaded" : "unshaded"];

  return (
    <div className={`shade-demo ${shaded ? "is-shaded" : "is-unshaded"}`}>
      <button
        className="hero-mark"
        type="button"
        aria-pressed={shaded}
        aria-label={`${state.mode}. ${state.action}.`}
        onClick={() => setShaded((value) => !value)}
        data-analytics-event="ts_shade_toggle"
      >
        <span className="mode-label">{state.mode}</span>
        <img
          src={
            shaded
              ? sitePath("/tokenshade-generated-mark.png")
              : sitePath("/tokenshade-unshaded.svg")
          }
          width="1254"
          height="1254"
          alt=""
          fetchPriority="high"
        />
        <span className="switch-label">{state.action} →</span>
      </button>
      <div className="shade-state" aria-live="polite">
        <strong>{state.title}</strong>
        <ul>
          {state.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
