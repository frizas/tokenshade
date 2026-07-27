import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { auditSessions } from "../plugins/tokenshade/scripts/tokenshade.mjs";

function temporaryDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "tokenshade-audit-test-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test("audit emits aggregate structure without prompts, paths, contents, or credentials", (t) => {
  const sessions = temporaryDirectory(t);
  const secret = "SUPER-SECRET-PROMPT-CONTENT";
  const events = [
    {
      type: "event_msg",
      payload: {
        type: "user_message",
        message: `${secret} C:\\private\\project`,
      },
    },
    {
      type: "event_msg",
      payload: {
        type: "token_count",
        info: {
          last_token_usage: {
            input_tokens: 100,
            cached_input_tokens: 70,
            output_tokens: 20,
            reasoning_output_tokens: 5,
          },
        },
      },
    },
    {
      type: "response_item",
      payload: {
        type: "custom_tool_call",
        name: "functions.exec",
        input: JSON.stringify({
          code: "await Promise.all([tools.alpha({secret:'SUPER-SECRET-PROMPT-CONTENT'}), tools.beta({})]);",
        }),
      },
    },
    {
      type: "response_item",
      payload: {
        type: "custom_tool_call",
        name: "functions.exec",
        input: JSON.stringify({ code: "await tools.alpha({});" }),
      },
    },
    {
      type: "response_item",
      payload: {
        type: "custom_tool_call",
        name: "functions.write_stdin",
        input: JSON.stringify({ session_id: 42 }),
      },
    },
  ];
  fs.writeFileSync(
    path.join(sessions, "rollout.jsonl"),
    `${events.map((event) => JSON.stringify(event)).join("\n")}\nnot-json\n`,
  );
  fs.writeFileSync(
    path.join(sessions, "auth.json"),
    JSON.stringify({ token: secret }),
  );

  const result = auditSessions({ sessions, perSession: true });
  const output = JSON.stringify(result);
  assert.equal(result.sessionFiles, 1);
  assert.equal(result.measured.modelCycles, 1);
  assert.equal(result.measured.usage.inputTokens, 100);
  assert.equal(result.measured.usage.cachedInputTokens, 70);
  assert.equal(result.measured.usage.outputTokens, 20);
  assert.equal(result.measured.usage.totalTokens, 120);
  assert.equal(result.measured.execCells, 2);
  assert.equal(result.measured.groupedExecCells, 1);
  assert.equal(result.measured.singletonExecCells, 1);
  assert.equal(result.measured.promiseAllCells, 1);
  assert.equal(result.measured.pollingCalls, 1);
  assert.equal(result.measured.parseErrors, 1);
  assert.equal(result.privacy.credentialsRead, false);
  assert.equal(result.privacy.networkAccess, false);
  assert.equal(output.includes(secret), false);
  assert.equal(output.includes(sessions), false);
  assert.equal(output.includes("C:\\private\\project"), false);
  assert.match(result.sessions[0].id, /^[a-f0-9]{12}$/);
});
