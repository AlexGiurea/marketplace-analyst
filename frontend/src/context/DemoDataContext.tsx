import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { initialDemoScenario, materializeSnapshot } from "../data/demoScenario";
import { randomizeDemoScenario } from "../data/randomizeDemoSnapshot";
import type { DemoScenario, DemoSnapshot } from "../types/demoSnapshot";

const LAST_QUARTER_INDEX = initialDemoScenario.quarters.length - 1;

type DemoDataContextValue = {
  scenario: DemoScenario;
  activeQuarterIndex: number;
  setActiveQuarterIndex: (index: number) => void;
  snapshot: DemoSnapshot;
  randomize: () => void;
  reset: () => void;
};

const DemoDataContext = createContext<DemoDataContextValue | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<DemoScenario>(initialDemoScenario);
  const [activeQuarterIndex, setActiveQuarterIndex] = useState(LAST_QUARTER_INDEX);

  const snapshot = useMemo(
    () => materializeSnapshot(scenario, activeQuarterIndex),
    [scenario, activeQuarterIndex],
  );

  const randomize = useCallback(() => {
    setScenario(randomizeDemoScenario());
    setActiveQuarterIndex(LAST_QUARTER_INDEX);
  }, []);

  const reset = useCallback(() => {
    setScenario(initialDemoScenario);
    setActiveQuarterIndex(LAST_QUARTER_INDEX);
  }, []);

  const value = useMemo(
    () => ({
      scenario,
      activeQuarterIndex,
      setActiveQuarterIndex,
      snapshot,
      randomize,
      reset,
    }),
    [scenario, activeQuarterIndex, snapshot, randomize, reset],
  );

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData(): DemoDataContextValue {
  const ctx = useContext(DemoDataContext);
  if (!ctx) {
    throw new Error("useDemoData must be used within DemoDataProvider");
  }
  return ctx;
}
