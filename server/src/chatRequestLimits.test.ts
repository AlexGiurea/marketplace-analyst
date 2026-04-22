import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { checkChatPayloadGuards, getJsonPayloadByteSize } from "./chatRequestLimits.js";

describe("checkChatPayloadGuards", () => {
  beforeEach(() => {
    process.env.CHAT_MAX_REQUEST_BYTES = "200";
    process.env.CHAT_MAX_MESSAGES = "2";
    process.env.CHAT_MAX_MESSAGE_CHARS = "5";
  });

  afterAll(() => {
    delete process.env.CHAT_MAX_REQUEST_BYTES;
    delete process.env.CHAT_MAX_MESSAGES;
    delete process.env.CHAT_MAX_MESSAGE_CHARS;
  });

  it("rejects oversized JSON payload", () => {
    const body = { messages: [{ role: "user", content: "x".repeat(500) }], scenario: { x: 1 } } as unknown;
    expect(getJsonPayloadByteSize(body)).toBeGreaterThan(200);
    const r = checkChatPayloadGuards(body);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.status).toBe(413);
    }
  });

  it("rejects too many messages", () => {
    const r = checkChatPayloadGuards({
      messages: [
        { role: "user", content: "a" },
        { role: "assistant", content: "b" },
        { role: "user", content: "c" },
      ],
    });
    expect(r.ok).toBe(false);
  });

  it("rejects a message that is too long", () => {
    const r = checkChatPayloadGuards({
      messages: [{ role: "user", content: "123456" }],
    });
    expect(r.ok).toBe(false);
  });
});
