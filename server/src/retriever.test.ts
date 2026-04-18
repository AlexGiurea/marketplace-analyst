import { describe, it, expect } from "vitest";
import { compileKnowledge } from "./compileKnowledge.js";
import { retrieveChunks } from "./retriever.js";
import { initialDemoSnapshot } from "../../frontend/src/data/demoSnapshot.js";

describe("retrieveChunks", () => {
  it("ranks balanced scorecard when query mentions score", () => {
    const { chunks } = compileKnowledge(initialDemoSnapshot);
    const out = retrieveChunks("balanced scorecard weakest theme", chunks, 8);
    expect(out.some((c) => c.section === "balanced-scorecard" || c.id.includes("scorecard"))).toBe(true);
  });

  it("returns deterministic slice when query has no tokens", () => {
    const { chunks } = compileKnowledge(initialDemoSnapshot);
    const out = retrieveChunks("???", chunks, 5);
    expect(out.length).toBe(5);
  });
});
