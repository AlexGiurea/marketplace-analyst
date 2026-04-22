import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { checkChatRateLimit, resetChatRateLimitStateForTest } from "./chatRateLimit.js";

describe("checkChatRateLimit", () => {
  beforeEach(() => {
    resetChatRateLimitStateForTest();
    process.env.CHAT_RATE_LIMIT_DISABLE = "0";
    process.env.CHAT_RATE_LIMIT_WINDOW_MS = "1000";
    process.env.CHAT_RATE_LIMIT_MAX = "3";
    process.env.CHAT_RATE_LIMIT_HOUR_MAX = "1000";
  });

  afterAll(() => {
    delete process.env.CHAT_RATE_LIMIT_DISABLE;
    delete process.env.CHAT_RATE_LIMIT_WINDOW_MS;
    delete process.env.CHAT_RATE_LIMIT_MAX;
    delete process.env.CHAT_RATE_LIMIT_HOUR_MAX;
  });

  it("allows up to the per-window maximum", () => {
    expect(checkChatRateLimit("ip:test-a").ok).toBe(true);
    expect(checkChatRateLimit("ip:test-a").ok).toBe(true);
    expect(checkChatRateLimit("ip:test-a").ok).toBe(true);
  });

  it("blocks the next request in the same window", () => {
    checkChatRateLimit("ip:test-b");
    checkChatRateLimit("ip:test-b");
    checkChatRateLimit("ip:test-b");
    const r = checkChatRateLimit("ip:test-b");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.retryAfterSec).toBeGreaterThan(0);
    }
  });
});
