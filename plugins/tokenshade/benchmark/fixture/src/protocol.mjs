export function encodeEnvelope(value) {
  const json = JSON.stringify(value);
  return `J1:${Buffer.from(json, "utf8").toString("hex")}`;
}

export function decodeEnvelope(payload) {
  const text = String(payload ?? "");
  if (!text.startsWith("J1:")) return text;
  const hex = text.slice(3);
  if (hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) {
    throw new Error("Malformed J1 envelope");
  }
  return JSON.parse(Buffer.from(hex, "hex").toString("utf8"));
}

export function sendChannel(transport, channel, payload = "") {
  if (!transport || typeof transport.send !== "function") return false;
  transport.send(channel, payload);
  return true;
}

export function requestCatalogSnapshot(transport) {
  return sendChannel(transport, 42, "snapshot");
}
