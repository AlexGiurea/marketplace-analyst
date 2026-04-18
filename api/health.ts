import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getHealthPayload } from "../server/src/chatRoute.js";

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  res.status(200).json(getHealthPayload());
}
