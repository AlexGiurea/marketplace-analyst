import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getClientKeyFromNodeLikeRequest } from "../server/src/clientKey.js";
import { handleChatPost } from "../server/src/chatRoute.js";

function applyOutHeaders(res: VercelResponse, out: { headers?: Record<string, string> }): void {
  if (out.headers) {
    for (const [k, v] of Object.entries(out.headers)) {
      res.setHeader(k, v);
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const clientKey = getClientKeyFromNodeLikeRequest(req);
  const out = await handleChatPost(req.body, { clientKey });
  applyOutHeaders(res, out);
  res.status(out.status).json(out.json);
}
