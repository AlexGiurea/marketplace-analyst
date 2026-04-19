import { describe, it, expect } from "vitest";
import { runTool } from "./tools.js";
import { initialDemoSnapshot } from "../../frontend/src/data/demoSnapshot.js";
import { initialDemoScenario } from "../../frontend/src/data/demoScenario.js";

const ctxSingle = { snapshot: initialDemoSnapshot, activeQuarterIndex: 0 };

describe("runTool", () => {
  it("returns JSON for overview", () => {
    const s = runTool("get_team_quarter_overview", {}, ctxSingle);
    const j = JSON.parse(s) as { overallSharePct: number };
    expect(j.overallSharePct).toBe(initialDemoSnapshot.performance.overallSharePct);
  });

  it("filters brand when requested", () => {
    const s = runTool("get_brand_performance", { brandName: "Core" }, ctxSingle);
    const arr = JSON.parse(s) as { name: string }[];
    expect(arr.every((b) => b.name === "Core")).toBe(true);
  });

  it("returns quarter history when scenario is present", () => {
    const s = runTool("get_quarter_history_overview", {}, {
      snapshot: initialDemoSnapshot,
      scenario: initialDemoScenario,
      activeQuarterIndex: 3,
    });
    const rows = JSON.parse(s) as { quarterIndex: number }[];
    expect(rows.length).toBe(initialDemoScenario.quarters.length);
    expect(rows[0].quarterIndex).toBe(1);
  });
});
