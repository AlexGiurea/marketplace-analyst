import { describe, it, expect } from "vitest";
import { runTool } from "./tools.js";
import { initialDemoSnapshot } from "../../frontend/src/data/demoSnapshot.js";

describe("runTool", () => {
  it("returns JSON for overview", () => {
    const s = runTool("get_team_quarter_overview", {}, initialDemoSnapshot);
    const j = JSON.parse(s) as { overallSharePct: number };
    expect(j.overallSharePct).toBe(initialDemoSnapshot.performance.overallSharePct);
  });

  it("filters brand when requested", () => {
    const s = runTool("get_brand_performance", { brandName: "Core" }, initialDemoSnapshot);
    const arr = JSON.parse(s) as { name: string }[];
    expect(arr.every((b) => b.name === "Core")).toBe(true);
  });
});
