import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleChatPost } from "../server/src/chatRoute";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const out = await handleChatPost(req.body);
  res.status(out.status).json(out.json);
}
