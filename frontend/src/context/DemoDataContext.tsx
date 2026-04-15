import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { initialDemoSnapshot } from "../data/demoSnapshot";
import { randomizeDemoSnapshot } from "../data/randomizeDemoSnapshot";
import type { DemoSnapshot } from "../types/demoSnapshot";

type DemoDataContextValue = {
  snapshot: DemoSnapshot;
  randomize: () => void;
  reset: () => void;
};

const DemoDataContext = createContext<DemoDataContextValue | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<DemoSnapshot>(initialDemoSnapshot);

  const randomize = useCallback(() => {
    setSnapshot(randomizeDemoSnapshot());
  }, []);

  const reset = useCallback(() => {
    setSnapshot(initialDemoSnapshot);
  }, []);

  const value = useMemo(
    () => ({
      snapshot,
      randomize,
      reset,
    }),
    [snapshot, randomize, reset],
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
