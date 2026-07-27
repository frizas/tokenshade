/* eslint-disable @next/next/no-img-element -- Local, pre-sized brand assets keep the static Sites build simple. */
import { CopyInstall } from "./CopyInstall";
import { SiteAnalytics } from "./SiteAnalytics";
import { SharePrompt } from "./SharePrompt";
import { ShadeDemo } from "./ShadeDemo";
import { sitePath } from "./sitePath";

const installCommands = `codex plugin marketplace add frizas/tokenshade
codex plugin add tokenshade@tokenshade`;

const tweetPrompt =
  "Build me a skill based on TokenShade (https://tokenshade.vercel.app). Layer batching and polling rules over my setup; preserve instructions. Keep dependencies, exploration, approvals, conflicting writes, waits, and resumes sequential. Show dry-run and diff first.";

const agents = [
  {
    name: "OpenAI Codex",
    support: "Native plugin + AGENTS.md",
    state: "Benchmarked",
  },
  {
    name: "Claude Code",
    support: "CLAUDE.md adapter",
    state: "Compatible",
  },
  {
    name: "Kimi Code CLI",
    support: "Portable AGENTS.md",
    state: "Compatible",
  },
  {
    name: "Other coding agents",
    support: "Agent-neutral prompt",
    state: "Portable",
  },
];

const faqs = [
  {
    question: "Does TokenShade work with ChatGPT?",
    answer:
      "TokenShade is built and benchmarked for OpenAI Codex. ChatGPT Work users can paste the one-tweet prompt into a session. Ordinary ChatGPT chats without agent tools have nothing to batch, so the measured savings claim does not apply.",
  },
  {
    question: "Does TokenShade change my model or reasoning?",
    answer:
      "No. It changes a small orchestration policy, not your model, reasoning level, permissions, memory, or sandbox.",
  },
  {
    question: "Does it work on Windows, macOS, and Linux?",
    answer:
      "Yes. The utility uses Node.js 20+ built-ins, and the policy describes tool behavior without depending on an operating system.",
  },
  {
    question: "Can I use the prompt with Claude Code or Kimi Code CLI?",
    answer:
      "Yes. Agent-neutral and host-specific adapters are included, but the published benchmark claim remains Codex-only until those hosts are measured separately.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://tokenshade.vercel.app/#website",
      name: "TokenShade",
      alternateName: ["TokenShade for Codex", "TokenShade for ChatGPT Work"],
      url: "https://tokenshade.vercel.app",
      description:
        "A free, open-source orchestration tool for Codex, ChatGPT Work, and portable AI coding-agent workflows.",
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://tokenshade.vercel.app/#software",
      name: "TokenShade",
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "AI coding agent workflow tool",
      operatingSystem: "Windows, macOS, Linux",
      softwareRequirements: "Node.js 20+ or OpenAI Codex",
      softwareVersion: "0.1.0",
      description:
        "A free, open-source orchestration policy that helps coding agents batch independent tools and avoid repetitive polling.",
      url: "https://tokenshade.vercel.app",
      isAccessibleForFree: true,
      license: "https://opensource.org/license/mit",
      downloadUrl: "https://github.com/frizas/tokenshade",
      sameAs: [
        "https://github.com/frizas/tokenshade",
        "https://frizas.github.io/tokenshade/",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Safe batching policy for independent tool calls",
        "Meaningful polling cadence for long-running commands",
        "Idempotent install, status, update, and uninstall",
        "Local aggregate session audit",
        "Reproducible before-and-after benchmark",
      ],
      author: {
        "@type": "Organization",
        name: "HiLeverage Studios",
      },
      isPartOf: {
        "@id": "https://tokenshade.vercel.app/#website",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteAnalytics />
      <div className="notice">
        <span>Open source</span>
        <span aria-hidden="true">·</span>
        <span>No tracking</span>
        <span aria-hidden="true">·</span>
        <span>Free forever</span>
      </div>

      <header className="shell nav">
        <a className="brand" href="#top" aria-label="TokenShade home">
          <img src={sitePath("/tokenshade-mark.svg")} width="42" height="42" alt="" />
          <span>TokenShade</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#how">How it works</a>
          <a href="#proof">Proof</a>
          <a href="#install">Install</a>
          <a
            className="nav-github"
            href="https://github.com/frizas/tokenshade"
            data-analytics-event="ts_github_nav"
          >
            GitHub
          </a>
        </nav>
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Sol runs hot. Shade the waste.</p>
          <h1>
            <span>Stop the burn</span>
            <span>on your plan.</span>
          </h1>
          <p className="lede">
            TokenShade helps your coding agent batch independent tool calls and
            stop wasting full model turns on repetitive polling—without
            touching work that must stay sequential.
          </p>
          <div className="hero-actions">
            <a
              className="button button-primary"
              href="#install"
              data-analytics-event="ts_install_hero"
            >
              Install in 60 seconds
            </a>
            <a
              className="button button-quiet"
              href="https://github.com/frizas/tokenshade"
              data-analytics-event="ts_source_hero"
            >
              View the source
            </a>
          </div>
          <p className="fine-print">
            For Codex or ChatGPT Work. Independent and not affiliated with OpenAI.
          </p>
        </div>

        <ShadeDemo />
      </section>

      <section className="problem" aria-labelledby="problem-heading">
        <div className="shell problem-grid">
          <div>
            <p className="eyebrow">The orchestration problem</p>
            <h2 id="problem-heading">The model is fast. The loop is expensive.</h2>
            <p className="section-copy">
              If four independent reads are issued one after another, the agent
              can re-enter the model between every call and process the same
              context again. Rapid “are you done yet?” polling adds more empty
              turns.
            </p>
          </div>

          <div className="turn-diagram" aria-label="Serial turns compared with a grouped turn">
            <div className="turn-row serial">
              <span className="diagram-label">Without shade</span>
              <div className="turn">turn 1</div>
              <i>→</i>
              <div className="turn">turn 2</div>
              <i>→</i>
              <div className="turn">turn 3</div>
              <i>→</i>
              <div className="turn">turn 4</div>
            </div>
            <div className="turn-row grouped">
              <span className="diagram-label">With TokenShade</span>
              <div className="turn one-turn">
                <strong>one turn</strong>
                <span>read · search · inspect · check</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell rule-section" id="how" aria-labelledby="how-heading">
        <div className="section-heading">
          <p className="eyebrow">Three narrow rules</p>
          <h2 id="how-heading">
            <span>Shade the waste.</span>
            <span>Keep the work.</span>
          </h2>
        </div>
        <ol className="rules">
          <li>
            <span>01</span>
            <h3>Group what is independent.</h3>
            <p>
              When two or more calls are already known and do not depend on one
              another, run them in the same tool stage and inspect every result.
            </p>
          </li>
          <li>
            <span>02</span>
            <h3>Sequence what is not.</h3>
            <p>
              Dependencies, exploration, approvals, conflicting edits, waits,
              and resumes remain sequential. TokenShade never invents work to
              fill a batch.
            </p>
          </li>
          <li>
            <span>03</span>
            <h3>Poll like a grown-up.</h3>
            <p>
              Long-running commands get a real initial yield and meaningful
              resume intervals—not a turn-burning stream of status checks.
            </p>
          </li>
        </ol>
      </section>

      <section className="proof" id="proof" aria-labelledby="proof-heading">
        <div className="shell proof-grid">
          <div className="proof-copy">
            <p className="eyebrow">Honest numbers</p>
            <h2 id="proof-heading">A claim you can rerun.</h2>
            <p>
              Five matched GPT-5.6 Sol/xhigh pairs showed the same pattern:
              less orchestration overhead, full file coverage, and the same
              required findings. The exact medians are in the scorecard.
            </p>
            <a
              href="https://github.com/frizas/tokenshade/blob/main/docs/HONEST-NUMBERS.md"
              data-analytics-event="ts_honest_numbers"
            >
              Read the method and limitations →
            </a>
          </div>
          <div className="scorecard" aria-label="TokenShade public benchmark result">
            <div className="scorecard-top">
              <span>PUBLIC BENCHMARK · PASS</span>
              <strong>5 matched pairs</strong>
            </div>
            <div className="score-row">
              <span>Model cycles</span>
              <strong data-benchmark="cycles">≥ 85% fewer</strong>
            </div>
            <div className="score-row">
              <span>Total tokens</span>
              <strong data-benchmark="tokens">≥ 70% fewer</strong>
            </div>
            <div className="score-row">
              <span>Coverage</span>
              <strong>8 / 8 files · every run</strong>
            </div>
            <div className="score-row">
              <span>Output</span>
              <strong>Consistent · every run</strong>
            </div>
            <p>
              Observed medians on a bounded serial-control mechanism benchmark.
              Expanded benchmarking encouraged.
            </p>
          </div>
        </div>
      </section>

      <section className="shell install" id="install" aria-labelledby="install-heading">
        <div className="install-copy">
          <p className="eyebrow">Incremental by design</p>
          <h2 id="install-heading">Put some shade on your Codex.</h2>
          <p>
            TokenShade adds one marker-fenced policy block. It preserves every
            instruction you already have, makes a content-hash backup before a
            change, and can be dry-run or removed cleanly.
          </p>
          <ul>
            <li>No model or reasoning changes</li>
            <li>Windows, macOS, and Linux</li>
            <li>No hooks, backend, MCP server, or plugin tracking</li>
            <li>No prompt, credential, or file-content uploads</li>
          </ul>
        </div>
        <div className="terminal" aria-label="TokenShade installation commands">
          <div className="terminal-bar">
            <span>terminal</span>
            <i aria-hidden="true">● ● ●</i>
          </div>
          <pre>
            <code>{installCommands}</code>
          </pre>
          <CopyInstall
            text={installCommands}
            analyticsEvent="ts_copy_commands"
          />
          <p>Then ask Codex: <code>@tokenshade install</code></p>
        </div>
      </section>

      <section className="compatibility" aria-labelledby="compatibility-heading">
        <div className="shell">
          <div className="section-heading compact">
            <p className="eyebrow">Bring your own agent</p>
            <h2 id="compatibility-heading">
              <span>Codex-first.</span>{" "}
              <span>Agent-portable.</span>
            </h2>
            <p className="section-copy">
              The measured claim is Codex-only. Portable adapters are included
              for other agents and should be benchmarked separately.
            </p>
          </div>
          <div className="agent-table">
            {agents.map((agent) => (
              <div className="agent-row" key={agent.name}>
                <strong>{agent.name}</strong>
                <span>{agent.support}</span>
                <em>{agent.state}</em>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell limits" aria-labelledby="limits-heading">
        <div>
          <p className="eyebrow">Where shade helps</p>
          <h2 id="limits-heading">Not every task runs hot.</h2>
        </div>
        <p>
          TokenShade is designed for tool-heavy investigations with independent
          calls and long-running commands. It may be neutral on one-step tasks,
          adaptive exploration, approval-heavy work, or workflows whose tools
          already run concurrently. It does not shrink your prompt, compress
          output, or make a weaker model choice for you.
        </p>
      </section>

      <section className="shell secondary-resources" aria-label="Secondary resources">
        <section className="secondary-card faq-card" id="faq" aria-labelledby="faq-heading">
          <div className="secondary-heading">
            <p className="eyebrow">Quick FAQ</p>
            <h2 id="faq-heading">A few straight answers.</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  <span>{faq.question}</span>
                  <i aria-hidden="true">+</i>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="secondary-card skill-card" id="prompt" aria-labelledby="prompt-heading">
          <div className="secondary-heading">
            <p className="eyebrow">Alternative path</p>
            <h2 id="prompt-heading">Do it yourself.</h2>
            <p>
              The plugin is the recommended path, but you don&apos;t need us.
              Prefer an internal skill? Paste this one-tweet prompt into your
              own agent and go wild. Have fun building!
            </p>
          </div>
          <div className="skill-prompt-meta">
            <span>ONE-TWEET PROMPT</span>
            <strong>{tweetPrompt.length} / 280</strong>
          </div>
          <blockquote>{tweetPrompt}</blockquote>
          <div className="prompt-card-actions">
            <CopyInstall
              text={tweetPrompt}
              label="Copy prompt"
              className="prompt-copy-button"
              clipboardIcon
              analyticsEvent="ts_prompt_copy"
            />
            <SharePrompt text={tweetPrompt} />
          </div>
          <div className="skill-links">
            <a
              href={sitePath("/llms.txt")}
              data-analytics-event="ts_llms"
            >
              Read llms.txt →
            </a>
            <a
              href="https://github.com/frizas/tokenshade/blob/main/PROMPTS.md"
              data-analytics-event="ts_prompt_pack"
            >
              Full prompt pack →
            </a>
          </div>
        </section>
      </section>

      <aside
        className="studio-plug"
        id="studio"
        aria-label="More from HiLeverage Studios"
      >
        <div className="shell studio-plug-grid">
          <div className="studio-links">
            <a
              href="https://www.manapanic.com/"
              target="_blank"
              rel="noreferrer"
              data-analytics-event="ts_manapanic"
            >
              <span className="studio-link-label">
                <span>+ more from us:</span>
                <strong>manapanic</strong>
                <span aria-hidden="true">↗</span>
              </span>
            </a>
            <a
              href="https://accounts.manapanic.com/billing"
              target="_blank"
              rel="noreferrer"
              data-analytics-event="ts_donate"
            >
              <span className="studio-link-label">
                <span>+ throw us a coin (and get in-game rewards)</span>
                <span aria-hidden="true">↗</span>
              </span>
            </a>
          </div>
        </div>
      </aside>

      <footer>
        <div className="shell footer-grid">
          <div className="brand footer-brand">
            <img src={sitePath("/tokenshade-mark.svg")} width="42" height="42" alt="" />
            <span>TokenShade</span>
          </div>
          <p>
            Proudly made with AI by <strong>HiLeverage Studios</strong>
          </p>
          <div className="footer-links">
            <a
              className="footer-legal"
              href="https://github.com/frizas/tokenshade/blob/main/PRIVACY.md"
              data-analytics-event="ts_privacy"
            >
              Privacy
            </a>
            <a
              href="https://x.com/frizas"
              aria-label="frizas on X"
              data-analytics-event="ts_social_x"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/frizas/"
              aria-label="frizas on LinkedIn"
              data-analytics-event="ts_social_linkedin"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4.98 3.5A2.49 2.49 0 1 1 0 3.5a2.49 2.49 0 0 1 4.98 0ZM.5 8h4V24h-4V8Zm7 0h3.83v2.19h.05c.53-1.01 1.83-2.07 3.77-2.07 4.03 0 4.78 2.65 4.78 6.1V24h-4v-8.58c0-2.05-.04-4.68-2.85-4.68-2.86 0-3.3 2.23-3.3 4.53V24h-4V8Z" />
              </svg>
            </a>
            <a
              href="https://github.com/frizas"
              aria-label="frizas on GitHub"
              data-analytics-event="ts_social_github"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.72.4.08.55-.17.55-.38 0-.19-.01-.7-.01-1.38-2.23.49-2.69-1.09-2.69-1.09-.36-.94-.89-1.19-.89-1.19-.73-.5.05-.49.05-.49.8.06 1.23.84 1.23.84.72 1.25 1.88.89 2.34.68.07-.53.28-.89.51-1.1-1.78-.21-3.65-.9-3.65-4.02 0-.89.31-1.61.82-2.18-.08-.2-.36-1.03.08-2.15 0 0 .67-.22 2.2.83A7.52 7.52 0 0 1 8 3.95c.68 0 1.36.09 2 .27 1.53-1.05 2.2-.83 2.2-.83.44 1.12.16 1.95.08 2.15.51.57.82 1.29.82 2.18 0 3.13-1.88 3.81-3.66 4.01.29.25.54.75.54 1.52 0 1.1-.01 1.98-.01 2.25 0 .21.14.46.55.38A8.15 8.15 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
