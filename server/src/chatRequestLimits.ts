import { Buffer } from "node:buffer";

function parsePositiveInt(v: string | undefined, defaultValue: number): number {
  if (v == null || v === "") return defaultValue;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : defaultValue;
}

export function getJsonPayloadByteSize(body: unknown): number {
  try {
    const s = typeof body === "string" ? body : JSON.stringify(body);
    return Buffer.byteLength(s, "utf8");
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

/**
 * Limits request size and message volume to reduce abuse and accidental huge payloads.
 * Does not change model per-response output limits (see chat orchestration).
 */
export function checkChatPayloadGuards(body: unknown):
  | { ok: true }
  | { ok: false; status: number; json: Record<string, unknown> } {
  const maxBytes = parsePositiveInt(process.env.CHAT_MAX_REQUEST_BYTES, 524_288);
  const size = getJsonPayloadByteSize(body);
  if (size > maxBytes) {
    return {
      ok: false,
      status: 413,
      json: { error: "Request body too large.", code: "payload_too_large" },
    };
  }

  if (!body || typeof body !== "object") {
    return { ok: true };
  }

  const parsed = body as { messages?: unknown };
  const messages = parsed.messages;
  if (!Array.isArray(messages)) {
    return { ok: true };
  }

  const maxMsgs = parsePositiveInt(process.env.CHAT_MAX_MESSAGES, 36);
  if (messages.length > maxMsgs) {
    return {
      ok: false,
      status: 400,
      json: { error: `Too many messages in history (max ${maxMsgs}).`, code: "too_many_messages" },
    };
  }

  const maxMsgChars = parsePositiveInt(process.env.CHAT_MAX_MESSAGE_CHARS, 12_000);
  for (const m of messages) {
    if (!m || typeof m !== "object") continue;
    const c = (m as { content?: unknown }).content;
    if (typeof c === "string" && c.length > maxMsgChars) {
      return {
        ok: false,
        status: 400,
        json: { error: `A message is too long (max ${maxMsgChars} characters).`, code: "message_too_long" },
      };
    }
  }

  return { ok: true };
}
