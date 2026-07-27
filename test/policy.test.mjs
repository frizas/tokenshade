import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  canonicalPolicy,
  classifyContent,
  execute,
  policyContentForPhase,
} from "../plugins/tokenshade/scripts/tokenshade.mjs";

function temporaryDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "tokenshade-policy-test-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

test("fresh install supports dry-run, install, duplicate install, status, and uninstall", (t) => {
  const directory = temporaryDirectory(t);
  const target = path.join(directory, "AGENTS.md");

  const preview = execute("install", { target, dryRun: true });
  assert.equal(preview.before, "absent");
  assert.equal(preview.after, "current");
  assert.equal(preview.changed, true);
  assert.equal(fs.existsSync(target), false);

  const installed = execute("install", { target });
  assert.equal(installed.changed, true);
  assert.equal(installed.backup, null);
  assert.equal(classifyContent(fs.readFileSync(target, "utf8")), "current");

  const duplicate = execute("install", { target });
  assert.equal(duplicate.changed, false);
  assert.equal(
    fs.readFileSync(target, "utf8").match(/<!-- tokenshade:start -->/g)?.length,
    1,
  );

  const status = execute("status", { target });
  assert.equal(status.state, "current");

  const removed = execute("uninstall", { target });
  assert.equal(removed.changed, true);
  assert.equal(classifyContent(fs.readFileSync(target, "utf8")), "absent");
});

test("install and update preserve unrelated CRLF content and create hash backups", (t) => {
  const directory = temporaryDirectory(t);
  const target = path.join(directory, "AGENTS.md");
  const original = "# Existing\r\n\r\n- Keep me exactly.\r\n";
  fs.writeFileSync(target, original);

  const installed = execute("install", { target });
  assert.equal(installed.backup.sha256, hash(original));
  assert.equal(fs.readFileSync(installed.backup.path, "utf8"), original);
  const afterInstall = fs.readFileSync(target, "utf8");
  assert.ok(afterInstall.startsWith(original));
  assert.ok(afterInstall.includes("\r\n"));

  const outdated = afterInstall.replace(
    "TokenShade: shade the waste, not the work",
    "TokenShade: old policy",
  );
  fs.writeFileSync(target, outdated);
  assert.equal(classifyContent(outdated), "outdated");

  const updated = execute("update", { target });
  assert.equal(updated.before, "outdated");
  assert.equal(updated.after, "current");
  assert.equal(updated.backup.sha256, hash(outdated));
  const final = fs.readFileSync(target, "utf8");
  assert.ok(final.startsWith(original));
  assert.ok(final.includes("TokenShade: shade the waste, not the work"));
  assert.equal(final.includes("old policy"), false);
});

test("malformed markers fail closed and recover without deleting unknown text", (t) => {
  const directory = temporaryDirectory(t);
  const target = path.join(directory, "AGENTS.md");
  const inner = canonicalPolicy().split("\n").slice(1, -1).join("\n");
  const malformed = [
    "# Before",
    "<!-- tokenshade:start -->",
    inner,
    "UNKNOWN USER RULE",
    "# After",
    "",
  ].join("\n");
  fs.writeFileSync(target, malformed);

  assert.equal(execute("status", { target }).state, "malformed");
  assert.throws(() => execute("install", { target }), /--recover/);

  const repaired = execute("install", { target, recover: true });
  assert.equal(repaired.recovered, true);
  assert.equal(repaired.after, "current");
  const content = fs.readFileSync(target, "utf8");
  assert.ok(content.includes("# Before"));
  assert.ok(content.includes("UNKNOWN USER RULE"));
  assert.ok(content.includes("# After"));
  assert.equal((content.match(/<!-- tokenshade:start -->/g) ?? []).length, 1);
  assert.equal((content.match(/<!-- tokenshade:end -->/g) ?? []).length, 1);
});

test("portable profile installs agent-neutral rules without Codex-only syntax", (t) => {
  const directory = temporaryDirectory(t);
  const target = path.join(directory, "CLAUDE.md");
  fs.writeFileSync(target, "# Existing Claude instructions\n");

  const installed = execute("install", {
    target,
    profile: "portable",
  });
  const content = fs.readFileSync(target, "utf8");
  assert.equal(installed.profile, "portable");
  assert.equal(
    execute("status", { target, profile: "portable" }).state,
    "current",
  );
  assert.match(content, /agent host's native batching mechanism/);
  assert.doesNotMatch(content, /Code Mode|Promise\.all/);
  assert.match(content, /# Existing Claude instructions/);
});

test("backup purge requires explicit confirmation and ignores unrelated files", (t) => {
  const directory = temporaryDirectory(t);
  const target = path.join(directory, "AGENTS.md");
  fs.writeFileSync(target, "# Existing\n");
  const installation = execute("install", { target });
  const backupDirectory = path.dirname(installation.backup.path);
  const unrelated = path.join(backupDirectory, "notes.txt");
  fs.writeFileSync(unrelated, "keep");

  assert.throws(
    () => execute("purge-backups", { target }),
    /explicit --yes/,
  );
  const preview = execute("purge-backups", {
    target,
    yes: true,
    dryRun: true,
  });
  assert.equal(preview.matched, 1);
  assert.equal(fs.existsSync(installation.backup.path), true);

  const purge = execute("purge-backups", { target, yes: true });
  assert.equal(purge.removed, 1);
  assert.equal(fs.existsSync(installation.backup.path), false);
  assert.equal(fs.readFileSync(unrelated, "utf8"), "keep");
});

test("benchmark phases use an explicit serial control and canonical treatment", () => {
  const original = `# Existing

${canonicalPolicy()}
`;
  const baseline = policyContentForPhase(original, "baseline");
  assert.match(baseline, /TokenShade benchmark control: serial tool staging/);
  assert.match(baseline, /exactly one Node-backed Code Mode call/);
  assert.doesNotMatch(baseline, /TokenShade: shade the waste, not the work/);

  const treatment = policyContentForPhase(original, "treatment");
  assert.match(treatment, /TokenShade: shade the waste, not the work/);
  assert.doesNotMatch(treatment, /TokenShade benchmark control/);
});

test("policy mutations reject symbolic-link targets and backup directories", (t) => {
  if (process.platform === "win32") {
    const directory = temporaryDirectory(t);
    const realTarget = path.join(directory, "real-AGENTS.md");
    const linkedTarget = path.join(directory, "linked-AGENTS.md");
    fs.writeFileSync(realTarget, "# Existing\n");
    try {
      fs.symlinkSync(realTarget, linkedTarget, "file");
    } catch (error) {
      t.skip(`symbolic links are unavailable: ${error.code}`);
      return;
    }
    assert.throws(
      () => execute("install", { target: linkedTarget }),
      /must not be a symbolic link/,
    );
  }

  const directory = temporaryDirectory(t);
  const target = path.join(directory, "AGENTS.md");
  const realBackup = path.join(directory, "real-backups");
  const linkedBackup = path.join(directory, "linked-backups");
  fs.writeFileSync(target, "# Existing\n");
  fs.mkdirSync(realBackup);
  try {
    fs.symlinkSync(realBackup, linkedBackup, "junction");
  } catch (error) {
    t.skip(`symbolic links are unavailable: ${error.code}`);
    return;
  }
  assert.throws(
    () => execute("install", { target, backupDir: linkedBackup }),
    /must not be a symbolic link/,
  );
});
