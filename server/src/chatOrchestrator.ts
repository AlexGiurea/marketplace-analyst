import OpenAI from "openai";
import type {
  EasyInputMessage,
  ResponseCreateParamsNonStreaming,
  ResponseFunctionToolCall,
  ResponseInputItem,
  ResponseOutputItem,
} from "openai/resources/responses/responses.js";
import type { DemoSnapshot } from "../../frontend/src/types/demoSnapshot.js";
import { compileKnowledge } from "./compileKnowledge.js";
import { retrieveChunks } from "./retriever.js";
import { RESPONSE_TOOL_DEFINITIONS, runTool } from "./tools.js";

export type ChatTurn = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(snapshot: DemoSnapshot, retrievedBlock: string, overview: string): string {
  return `You are the AI Coach for a Marketplace-style business simulation demo.

Rules (non-negotiable):
- Treat the live snapshot and tool outputs as the only source of truth for numbers and facts.
- Never invent KPIs, financial figures, or competitor data.
- Write in plain, simple language.
- Keep most replies under 120 words unless the user explicitly asks for more detail.
- Default to one short answer followed by up to 3 short bullets only when they help.
- Use only the 2–4 most important numbers instead of dumping every metric.
- If the user asks for guidance, give 1–2 plausible options with the main tradeoff for each.
- Ask at most one follow-up question, and only if it would materially improve the answer.
- Do not use markdown bold, long headings, or filler phrases.
- When you mention a concrete number, comparison, or recommendation from the snapshot, add 1–2 relevant square-bracket citations.
- These square-bracket citations become clickable source links in the UI, so prefer student-facing source IDs like [perf-share], [score-mfg], [mfg-cap], [fin-cash], [competitor-mira], [brand-core].
- If data is missing for a question, say what is missing and which workspace area would hold it.

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

function buildMetadata(snapshot: DemoSnapshot, retrievedChunkIds: string[]): Record<string, string> {
  return {
    app: "marketplace-analyst-chat",
    team_id: snapshot.company.teamId,
    quarter: snapshot.quarter.label,
    retrieved_chunks: retrievedChunkIds.slice(0, 8).join(","),
  };
}

export async function runChat(options: {
  snapshot: DemoSnapshot;
  messages: ChatTurn[];
  apiKey: string;
  model: string;
}): Promise<{ message: string; retrievedChunkIds: string[] }> {
  const { snapshot, messages, apiKey, model } = options;

  const bundle = compileKnowledge(snapshot);
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const retrieved = retrieveChunks(lastUser, bundle.chunks, 8);
  const retrievedBlock = retrieved.map((c) => `[${c.id}] (${c.section}) ${c.text}`).join("\n\n");
  const system = buildSystemPrompt(snapshot, retrievedBlock, bundle.overview);

  const openai = new OpenAI({ apiKey });
  const metadata = buildMetadata(snapshot, retrieved.map((c) => c.id));
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
        output: runTool(name, args, snapshot),
      };
    });
    previousResponseId = response.id;
  }

  return {
    message: "Tool loop limit reached — please simplify your question.",
    retrievedChunkIds: retrieved.map((c) => c.id),
  };
}
