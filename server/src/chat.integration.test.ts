import { describe, it, expect } from "vitest";
import { runChat } from "./chatOrchestrator.js";
import { initialDemoSnapshot } from "../../frontend/src/data/demoSnapshot.js";

describe.skipIf(!process.env.OPENAI_API_KEY)("runChat (live OpenAI)", () => {
  it(
    "answers with grounded reply and retrieval ids",
    async () => {
      const key = process.env.OPENAI_API_KEY!;
      const model = process.env.OPENAI_MODEL || "gpt-5.4";
      const out = await runChat({
        snapshot: initialDemoSnapshot,
        messages: [
          {
            role: "user",
            content:
              "What is our team's overall market share percentage in this snapshot? Reply with the number and one short sentence of context.",
          },
        ],
        apiKey: key,
        model,
      });
      expect(out.message.length).toBeGreaterThan(15);
      expect(out.retrievedChunkIds.length).toBeGreaterThan(0);
      expect(out.message.toLowerCase()).toMatch(/share|market|percent|%/);
    },
    120_000,
  );
});
