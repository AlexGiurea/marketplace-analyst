import type { DemoSnapshot } from "../types/demoSnapshot.js";
import { initialDemoScenario, materializeSnapshot } from "./demoScenario.js";

export { initialDemoScenario, materializeSnapshot } from "./demoScenario.js";

/** Baseline demo data — latest quarter (Q4) materialized from `initialDemoScenario`. */
export const initialDemoSnapshot: DemoSnapshot = materializeSnapshot(
  initialDemoScenario,
  initialDemoScenario.quarters.length - 1,
);

/** @deprecated Use `initialDemoSnapshot` or `useDemoData().snapshot` */
export const demoSnapshot = initialDemoSnapshot;
