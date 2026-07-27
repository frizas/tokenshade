import { requestCatalogSnapshot } from "./protocol.mjs";

const MAX_RECORDS = 256;
const records = new Map();

export function applyCatalogMessage(message) {
  if (
    !message ||
    message.version !== 1 ||
    !["upsert", "remove"].includes(message.action)
  ) {
    return false;
  }

  if (message.action === "remove") {
    if (!Array.isArray(message.ids) || message.ids.length > MAX_RECORDS) {
      return false;
    }
    for (const id of message.ids) records.delete(id);
    return true;
  }

  if (
    !Array.isArray(message.records) ||
    message.records.length > MAX_RECORDS
  ) {
    return false;
  }
  for (const record of message.records) {
    if (
      Number.isInteger(record?.id) &&
      record.id > 0 &&
      typeof record.title === "string"
    ) {
      records.set(record.id, { title: record.title, theme: record.theme });
    }
  }
  return true;
}

export function onSessionStart(transport) {
  requestCatalogSnapshot(transport);
}

export function onSessionEnd() {
  records.clear();
}

export function snapshot() {
  return [...records.entries()];
}
