import type { DemoScenario } from "../types/demoSnapshot";

export const COACH_DASHBOARD_TRANSFER_PREFIX = "ma-coach-dash:" as const;

export type CoachDashboardTransferPayload = {
  v: 1;
  scenario: DemoScenario;
  activeQuarterIndex: number;
  scope: "quarter" | "project";
};

export function stashCoachDashboardTransfer(tid: string, payload: CoachDashboardTransferPayload) {
  localStorage.setItem(COACH_DASHBOARD_TRANSFER_PREFIX + tid, JSON.stringify(payload));
}
