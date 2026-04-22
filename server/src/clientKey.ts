import type { IncomingHttpHeaders } from "node:http";

/**
 * Stable client id for per-IP rate limits. Never use raw IP in logs; this string is a bucket key only.
 */
export function getClientKeyFromNodeLikeRequest(req: {
  headers: IncomingHttpHeaders;
  ip?: string;
  socket?: { remoteAddress?: string | null };
}): string {
  if (typeof req.ip === "string" && req.ip.trim() && req.ip !== "::1" && req.ip !== "::ffff:127.0.0.1") {
    return `ip:${req.ip.trim()}`;
  }
  const xff = req.headers["x-forwarded-for"];
  const v = Array.isArray(xff) ? xff[0] : xff;
  if (typeof v === "string" && v.trim()) {
    const first = v.split(",")[0]?.trim();
    if (first) return `ip:${first}`;
  }
  const real = req.headers["x-real-ip"];
  if (typeof real === "string" && real.trim()) {
    return `ip:${real.trim()}`;
  }
  const ra = req.socket?.remoteAddress;
  if (typeof ra === "string" && ra.trim() && ra !== "::1" && ra !== "::ffff:127.0.0.1") {
    return `ip:${ra.trim()}`;
  }
  return "ip:unknown";
}
