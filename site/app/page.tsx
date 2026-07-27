import { CopyInstall } from "./CopyInstall";
import { ShadeDemo } from "./ShadeDemo";

const installCommands = `codex plugin marketplace add frizas/tokenshade
codex plugin add tokenshade@tokenshade`;

const agents = [
  {
    name: "OpenAI Codex",
    support: "Native plugin + AGENTS.md",
    state: "Benchmarked",
  },
  {
    name: "Kimi Code CLI",
    support: "Portable AGENTS.md",
    state: "Compatible",
  },
  {
    name: "Claude Code",
    support: "CLAUDE.md adapter",
    state: "Compatible",
  },
  {
    name: "Other coding agents",
    support: "Agent-neutral prompt",
    state: "Portable",
  },
];

export default function Home() {
  return (
    <main>
      <div className="notice">
        <span>Independent open source</span>
        <span aria-hidden="true">·</span>
        <span>No telemetry</span>
        <span aria-hidden="true">·</span>
        <span>MIT licensed</span>
      </div>

      <header className="shell nav">
        <a className="brand" href="#top" aria-label="TokenShade home">
          <img src="/tokenshade-mark.svg" width="42" height="42" alt="" />
          <span>TokenShade</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#how">How it works</a>
          <a href="#proof">Proof</a>
          <a href="#install">Install</a>
          <a
            className="nav-github"
            href="https://github.com/frizas/tokenshade"
          >
            GitHub
          </a>
        </nav>
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Sol runs hot. Shade the waste.</p>
          <h1>Stop the token burn on your plan.</h1>
          <p className="lede">
            TokenShade helps Codex batch independent tools and stop spending
            full model turns on repetitive polling—without touching the work
            that needs to stay sequential.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#install">
              Install in 60 seconds
            </a>
            <a
              className="button button-quiet"
              href="https://github.com/frizas/tokenshade"
            >
              View the source
            </a>
          </div>
          <p className="fine-print">
            For OpenAI Codex. Independent and not affiliated with OpenAI.
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
          <h2 id="how-heading">Shade the waste. Keep the work.</h2>
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
              Long Windows commands get a real initial yield and meaningful
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
              The release benchmark uses five matched baseline/treatment pairs,
              the same Sol model and XHigh effort, a fixed eight-file public
              fixture, exact coverage requirements, and committed sanitized
              run metrics.
            </p>
            <a href="https://github.com/frizas/tokenshade/blob/main/docs/HONEST-NUMBERS.md">
              Read the method and limitations →
            </a>
          </div>
          <div className="scorecard" aria-label="TokenShade benchmark release gate">
            <div className="scorecard-top">
              <span>PUBLIC RELEASE GATE</span>
              <strong>5 × A/B pairs</strong>
            </div>
            <div className="score-row">
              <span>Model cycles</span>
              <strong data-benchmark="cycles">≥30% fewer required</strong>
            </div>
            <div className="score-row">
              <span>Total tokens</span>
              <strong data-benchmark="tokens">≥20% fewer required</strong>
            </div>
            <div className="score-row">
              <span>Coverage</span>
              <strong>8 / 8 files required</strong>
            </div>
            <div className="score-row">
              <span>Conclusions</span>
              <strong>Equivalent required</strong>
            </div>
            <p>
              Release claims stay gated until the public run passes. No
              extrapolation. No estimated savings dressed up as usage.
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
            <li>No hooks, backend, MCP server, or telemetry</li>
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
          <CopyInstall text={installCommands} />
          <p>Then ask Codex: <code>@tokenshade install</code></p>
        </div>
      </section>

      <section className="compatibility" aria-labelledby="compatibility-heading">
        <div className="shell">
          <div className="section-heading compact">
            <p className="eyebrow">Bring your own agent</p>
            <h2 id="compatibility-heading">Codex-first. Agent-portable.</h2>
            <p className="section-copy">
              The measured claim is Codex-only. Portable instruction adapters
              are included for other agents and are labeled honestly until
              separately benchmarked.
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

      <footer>
        <div className="shell footer-grid">
          <div className="brand footer-brand">
            <img src="/tokenshade-mark.svg" width="42" height="42" alt="" />
            <span>TokenShade</span>
          </div>
          <p>
            Built by <a href="https://github.com/frizas">frizas</a>.
          </p>
          <div className="footer-links">
            <a href="https://x.com/frizas">X</a>
            <a href="https://www.linkedin.com/in/fabiofrizas/">LinkedIn</a>
            <a href="https://github.com/frizas">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
