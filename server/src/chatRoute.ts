import type { DemoScenario, DemoSnapshot } from "../../frontend/src/types/demoSnapshot.js";
import { materializeSnapshot } from "../../frontend/src/data/demoScenario.js";
import { runChat } from "./chatOrchestrator.js";

export function getModel(): string {
  return process.env.OPENAI_MODEL || "gpt-5.4";
}

export function getHealthPayload(): { ok: true; openaiConfigured: boolean; model: string } {
  return {
    ok: true,
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    model: getModel(),
  };
}

function isDemoScenario(x: unknown): x is DemoScenario {
  if (!x || typeof x !== "object") return false;
  const o = x as DemoScenario;
  return Array.isArray(o.quarters) && o.quarters.length > 0 && typeof o.company === "object";
}

/** Shared JSON handler for POST /api/chat (Express + Vercel). */
export async function handleChatPost(body: unknown): Promise<{ status: number; json: Record<string, unknown> }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return {
      status: 503,
      json: {
        error: "OPENAI_API_KEY is not set. Copy server/.env.example to server/.env and add your key.",
      },
    };
  }

  const parsed = body as {
    messages?: unknown;
    snapshot?: unknown;
    scenario?: unknown;
    activeQuarterIndex?: unknown;
  };
  const messages = parsed.messages;

  let snapshot: DemoSnapshot;
  let scenario: DemoScenario | undefined;
  let activeQuarterIndex: number | undefined;

  if (isDemoScenario(parsed.scenario)) {
    scenario = parsed.scenario;
    const n = parsed.activeQuarterIndex;
    const idx =
      typeof n === "number" && Number.isFinite(n)
        ? Math.max(0, Math.min(Math.floor(n), scenario.quarters.length - 1))
        : scenario.quarters.length - 1;
    activeQuarterIndex = idx;
    snapshot = materializeSnapshot(scenario, idx);
  } else if (parsed.snapshot && typeof parsed.snapshot === "object" && "company" in parsed.snapshot) {
    snapshot = parsed.snapshot as DemoSnapshot;
    activeQuarterIndex = 0;
  } else {
    return {
      status: 400,
      json: {
        error: "Request body must include `scenario` (multi-quarter) or a `snapshot` (single quarter).",
      },
    };
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return { status: 400, json: { error: "`messages` must be a non-empty array of { role, content }." } };
  }

  const turns = messages
    .filter(
      (m): m is { role: string; content: string } =>
        !!m &&
        typeof m === "object" &&
        typeof (m as { role?: unknown }).role === "string" &&
        typeof (m as { content?: unknown }).content === "string",
    )
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  if (turns.length === 0 || turns[turns.length - 1]?.role !== "user") {
    return { status: 400, json: { error: "Last message must be from the user." } };
  }

  try {
    const result = await runChat({
      snapshot,
      scenario,
      activeQuarterIndex,
      messages: turns,
      apiKey: key,
      model: getModel(),
    });
    return { status: 200, json: result as unknown as Record<string, unknown> };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(e);
    return { status: 500, json: { error: msg } };
  }
}
