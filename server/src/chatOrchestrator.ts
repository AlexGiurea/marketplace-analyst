import OpenAI from "openai";
import type {
  EasyInputMessage,
  ResponseCreateParamsNonStreaming,
  ResponseFunctionToolCall,
  ResponseInputItem,
  ResponseOutputItem,
} from "openai/resources/responses/responses.js";
import type { DemoScenario, DemoSnapshot } from "../../frontend/src/types/demoSnapshot.js";
import { compileKnowledge, compileScenarioKnowledge } from "./compileKnowledge.js";
import { retrieveChunks } from "./retriever.js";
import { RESPONSE_TOOL_DEFINITIONS, runTool, type ToolRuntimeContext } from "./tools.js";

export type ChatTurn = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(snapshot: DemoSnapshot, retrievedBlock: string, overview: string, multiQuarter: boolean): string {
  const scope = multiQuarter
    ? "The client may have multiple quarters of data. Default to the active quarter unless the user names another quarter or asks for comparisons or trends."
    : "Focus on the current quarter snapshot.";

  return `You are the AI Coach for a Marketplace-style business simulation demo.

Rules (non-negotiable):
- ${scope}
- Treat the live snapshot and tool outputs as the only source of truth for numbers and facts.
- Never invent KPIs, financial figures, or competitor data.
- Never make the decision for the student.
- Never tell the student what they should do, what the right choice is, or which option is definitively best, safest, or correct.
- Frame the answer as decision support: evidence, tradeoffs, risks, and plausible options the student can evaluate.
- Write in plain, simple language.
- Keep most replies under 120 words unless the user explicitly asks for more detail.
- Default to one short answer followed by up to 3 short bullets only when they help.
- Use only the 2–4 most important numbers instead of dumping every metric.
- If the user asks for guidance, give 1–2 plausible options with the main tradeoff for each.
- If the user is comparing options or asking for tradeoffs, include exactly one tradeoff widget after the text answer.
- If a visual would help, include 1–2 chart widgets after the text answer. Prefer charts for competitors, brands, scorecard themes, quarter trends, demand vs sold, or capacity pressure.
- Ask at most one follow-up question, and only if it would materially improve the answer.
- Do not use markdown bold, long headings, or filler phrases.
- When you mention a concrete number, comparison, or interpretation from the snapshot, add 1–2 relevant square-bracket citations.
- These square-bracket citations become clickable source links in the UI, so prefer student-facing source IDs like [perf-share], [score-mfg], [mfg-cap], [fin-cash], [competitor-mira], [brand-core].
- If data is missing for a question, say what is missing and which workspace area would hold it.
- If a widget can still answer the core request with available data, render it and keep any caveat brief.
- Do not foreground missing-data caveats when the main chart is still useful.
- Competitor summary data for Mira may include share, average price, marketing budget, reliability, capacity index, and competitor-brand segment share. Use it when relevant.
- Widget syntax:
  - Use fenced code blocks with the exact language tag \`coach-widget\`.
  - Inside each block, output strict JSON only. No prose inside the code block.
  - Supported widget types:
    1. tradeoff_compare
       {"type":"tradeoff_compare","title":"...","left":{"label":"...","summary":"...","bullets":["..."]},"right":{"label":"...","summary":"...","bullets":["..."]},"verdict":"..."}
    2. chart
       {"type":"chart","chartKey":"competitor-share","title":"...","caption":"..."}
  - Supported chart keys:
    - "competitor-share"
    - "brand-demand-vs-sold"
    - "brand-profit"
    - "segment-demand"
    - "capacity-vs-forecast"
    - "scorecard-themes"
    - "quarter-trend" with metric one of "overall_share", "revenue", "net_income", "ending_cash", "scorecard_index"
    - "brand-history" with brand "Core" or "Nomad" and metric one of "demand", "sold", "revenue", "brand_profit"
    - "strategic-graph" with metric one of "share_pct", "market_appeal", "cumulative_profit"
  - You may use citations inside widget summary, bullets, verdict, or caption text.
  - If you use the tradeoff widget verdict field, phrase it as a decision lens or caution, not a recommendation.
  - Never invent chart data or unsupported widget fields.

Snapshot overview:
${overview}

Retrieved knowledge chunks (lexical retrieval over compiled snapshot text — use with tools for exact figures):
${retrievedBlock}
`;
}

function buildResponseMessages(messages: ChatTurn[]): EasyInputMessage[] {
  return messages.map((m) => ({
    type: "message",
    role: m.role,
    content: m.content,
  }));
}

function getFunctionCalls(items: ResponseOutputItem[]): ResponseFunctionToolCall[] {
  return items.filter((item): item is ResponseFunctionToolCall => item.type === "function_call");
}

function buildMetadata(
  snapshot: DemoSnapshot,
  retrievedChunkIds: string[],
  scenario: DemoScenario | undefined,
  activeQuarterIndex: number,
): Record<string, string> {
  return {
    app: "marketplace-analyst-chat",
    team_id: snapshot.company.teamId,
    quarter: snapshot.quarter.label,
    active_quarter_index: String(activeQuarterIndex),
    scenario_quarters: scenario ? String(scenario.quarters.length) : "1",
    retrieved_chunks: retrievedChunkIds.slice(0, 8).join(","),
  };
}

export async function runChat(options: {
  snapshot: DemoSnapshot;
  scenario?: DemoScenario;
  activeQuarterIndex?: number;
  messages: ChatTurn[];
  apiKey: string;
  model: string;
}): Promise<{ message: string; retrievedChunkIds: string[] }> {
  const { snapshot, messages, apiKey, model } = options;
  const scenario = options.scenario;
  const activeQuarterIndex =
    typeof options.activeQuarterIndex === "number" && Number.isFinite(options.activeQuarterIndex)
      ? Math.max(0, Math.floor(options.activeQuarterIndex))
      : scenario
        ? scenario.quarters.length - 1
        : 0;
  const multiQuarter = Boolean(scenario && scenario.quarters.length > 1);

  const bundle = scenario
    ? compileScenarioKnowledge(scenario, activeQuarterIndex)
    : compileKnowledge(snapshot);
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const retrieved = retrieveChunks(lastUser, bundle.chunks, 8, {
    activeQuarterIndex,
    multiQuarter,
  });
  const retrievedBlock = retrieved.map((c) => `[${c.id}] (${c.section}) ${c.text}`).join("\n\n");
  const system = buildSystemPrompt(snapshot, retrievedBlock, bundle.overview, multiQuarter);

  const openai = new OpenAI({ apiKey });
  const metadata = buildMetadata(snapshot, retrieved.map((c) => c.id), scenario, activeQuarterIndex);
  // Omit max_output_tokens: gpt-5.x returns 400 if the request maps to unsupported `max_tokens`.
  const baseRequest: Omit<ResponseCreateParamsNonStreaming, "input"> = {
    model,
    instructions: system,
    tools: RESPONSE_TOOL_DEFINITIONS,
    tool_choice: "auto",
    temperature: 0.35,
    store: true,
    metadata,
  };

  const maxRounds = 8;
  let previousResponseId: string | undefined;
  let pendingInput: string | ResponseInputItem[] = buildResponseMessages(messages);

  for (let round = 0; round < maxRounds; round++) {
    const response = await openai.responses.create({
      ...baseRequest,
      input: pendingInput,
      previous_response_id: previousResponseId,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    const functionCalls = getFunctionCalls(response.output);
    if (functionCalls.length === 0) {
      const text = response.output_text?.trim() || "(empty response)";
      return { message: text, retrievedChunkIds: retrieved.map((c) => c.id) };
    }

    const toolCtx: ToolRuntimeContext = {
      snapshot,
      scenario,
      activeQuarterIndex,
    };
    pendingInput = functionCalls.map((call) => {
      const name = call.name;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.arguments || "{}") as Record<string, unknown>;
      } catch {
        args = {};
      }
      return {
        type: "function_call_output" as const,
        call_id: call.call_id,
        output: runTool(name, args, toolCtx),
      };
    });
    previousResponseId = response.id;
  }

  return {
    message: "Tool loop limit reached — please simplify your question.",
    retrievedChunkIds: retrieved.map((c) => c.id),
  };
}
