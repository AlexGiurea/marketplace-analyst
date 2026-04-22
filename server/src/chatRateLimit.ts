/**
 * In-memory sliding-window rate limits (per process). On Vercel serverless, each instance has its own counters;
 * combine with Vercel WAF, deployment protection, or a shared store for high-traffic public abuse protection.
 */
const buckets = new Map<string, number[]>();

function parsePositiveInt(v: string | undefined, defaultValue: number): number {
  if (v == null || v === "") return defaultValue;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : defaultValue;
}

function isDisabled(): boolean {
  return process.env.CHAT_RATE_LIMIT_DISABLE === "1" || process.env.CHAT_RATE_LIMIT_DISABLE === "true";
}

function prunedInWindow(key: string, now: number, windowMs: number): number[] {
  const arr = buckets.get(key) ?? [];
  return arr.filter((t) => t > now - windowMs);
}

function retryAfterFromOldest(oldest: number, now: number, windowMs: number): number {
  return Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
}

export function resetChatRateLimitStateForTest(): void {
  buckets.clear();
}

/**
 * Enforces a short window (e.g. per minute) and a longer one (e.g. per hour) to cap total prompt volume
 * from a single client key without changing per-model response size limits in the model call.
 */
export function checkChatRateLimit(clientKey: string): { ok: true } | { ok: false; retryAfterSec: number } {
  if (isDisabled()) {
    return { ok: true };
  }

  const now = Date.now();
  const minuteWindowMs = parsePositiveInt(process.env.CHAT_RATE_LIMIT_WINDOW_MS, 60_000);
  const minuteMax = parsePositiveInt(process.env.CHAT_RATE_LIMIT_MAX, 20);
  const hourWindowMs = 3_600_000;
  const hourMax = parsePositiveInt(process.env.CHAT_RATE_LIMIT_HOUR_MAX, 150);

  const mKey = `m:${clientKey}`;
  const hKey = `h:${clientKey}`;
  const m = prunedInWindow(mKey, now, minuteWindowMs);
  const h = prunedInWindow(hKey, now, hourWindowMs);

  if (m.length >= minuteMax) {
    return { ok: false, retryAfterSec: retryAfterFromOldest(Math.min(...m), now, minuteWindowMs) };
  }
  if (h.length >= hourMax) {
    return { ok: false, retryAfterSec: retryAfterFromOldest(Math.min(...h), now, hourWindowMs) };
  }

  m.push(now);
  h.push(now);
  buckets.set(mKey, m);
  buckets.set(hKey, h);
  return { ok: true };
}
