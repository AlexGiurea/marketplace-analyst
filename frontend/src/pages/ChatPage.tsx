import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CoachWidgetRenderer,
  InlineRichText,
  parseAssistantSegments,
  type ChatRenderContext,
} from "../chat/coachWidgets";
import { TopNav } from "../components/TopNav";
import { useChatCoach, type ChatMessage } from "../context/ChatCoachContext";
import { useDemoData } from "../context/DemoDataContext";
import { buildCitationHref, resolveCitationDestination } from "../workspace/citationLinks";

type FormattedBlock =
  | {
      kind: "paragraph";
      lines: string[];
    }
  | {
      kind: "bullets" | "numbered";
      lines: string[];
    };

function cleanMessageContent(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/:\s+-\s+/g, ":\n- ")
    .replace(/\]\.\s+-\s+/g, "].\n- ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseMessageBlocks(content: string): FormattedBlock[] {
  const cleaned = cleanMessageContent(content);
  if (!cleaned) return [];

  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks: FormattedBlock[] = [];
  let current: FormattedBlock | null = null;

  const flush = () => {
    if (current && current.lines.length > 0) blocks.push(current);
    current = null;
  };

  for (const line of lines) {
    const bullet = line.match(/^[-*•]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);

    if (bullet) {
      if (!current || current.kind !== "bullets") {
        flush();
        current = { kind: "bullets", lines: [] };
      }
      current.lines.push(bullet[1]);
      continue;
    }

    if (numbered) {
      if (!current || current.kind !== "numbered") {
        flush();
        current = { kind: "numbered", lines: [] };
      }
      current.lines.push(numbered[1]);
      continue;
    }

    if (!current || current.kind !== "paragraph") {
      flush();
      current = { kind: "paragraph", lines: [] };
    }
    current.lines.push(line);
  }

  flush();
  return blocks;
}

function ThinkingDots({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className={`thinking-dot h-1.5 w-1.5 rounded-full ${light ? "bg-white" : "bg-[#0D50AC]"}`}
          style={{ animationDelay: `${dot * 140}ms` }}
        />
      ))}
    </span>
  );
}

function AssistantTextBlocks({ content }: { content: string }) {
  const blocks = parseMessageBlocks(content);
  if (blocks.length === 0) return null;

  return blocks.map((block, index) => {
    if (block.kind === "paragraph") {
      return (
        <p key={index} className="text-[0.95rem] leading-7 text-slate-800">
          <InlineRichText text={block.lines.join(" ")} />
        </p>
      );
    }

    const ListTag = block.kind === "numbered" ? "ol" : "ul";
    const listClass =
      block.kind === "numbered"
        ? "list-decimal space-y-1.5 pl-5 text-[0.95rem] leading-7 text-slate-800"
        : "list-disc space-y-1.5 pl-5 text-[0.95rem] leading-7 text-slate-800";

    return (
      <ListTag key={index} className={listClass}>
        {block.lines.map((line, itemIndex) => (
          <li key={itemIndex}>
            <InlineRichText text={line} />
          </li>
        ))}
      </ListTag>
    );
  });
}

function AssistantBody({ content, context }: { content: string; context: ChatRenderContext }) {
  const segments = parseAssistantSegments(content);
  if (segments.length === 0) return null;

  return (
    <div className="space-y-3">
      {segments.map((segment, index) =>
        segment.kind === "text" ? (
          <div key={index} className="space-y-3">
            <AssistantTextBlocks content={segment.content} />
          </div>
        ) : (
          <CoachWidgetRenderer key={index} widget={segment.widget} context={context} />
        ),
      )}
    </div>
  );
}

function CoachAvatar() {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-white/50 shadow-inner backdrop-blur-sm"
      aria-hidden
    >
      <svg
        viewBox="0 0 40 40"
        className="h-8 w-8 text-chat-teal"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        <circle cx="20" cy="18" r="8" fill="currentColor" opacity="0.2" />
        <path
          d="M12 28c2.5 3 13.5 3 16 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="16" cy="17" r="1.5" fill="currentColor" />
        <circle cx="24" cy="17" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
}

export function ChatPage() {
  const { snapshot: d, scenario, activeQuarterIndex, randomize } = useDemoData();
  const { messages, setMessages, input, setInput, loading, setLoading, resetChat } = useChatCoach();

  function startNewScenario() {
    randomize();
    resetChat();
  }
  const [showIndex, setShowIndex] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const currentRenderContext: ChatRenderContext = { snapshot: d, scenario, activeQuarterIndex };

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const uid = `u-${crypto.randomUUID()}`;
    const userMessage: ChatMessage = { id: uid, role: "user", content: text };
    const history = [...messages, userMessage];
    setInput("");
    setMessages(history);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          activeQuarterIndex,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const raw = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;
      if (!res.ok) {
        const errText =
          raw && typeof raw.error === "string"
            ? raw.error
            : `I couldn't get a reply right now (${res.status}).`;
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${crypto.randomUUID()}`,
            role: "assistant",
            content: errText,
            widgetContext: currentRenderContext,
          },
        ]);
        return;
      }
      const reply =
        raw && typeof raw.message === "string"
          ? raw.message
          : "I couldn't generate a reply right now.";
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${crypto.randomUUID()}`,
          role: "assistant",
          content: reply,
          widgetContext: currentRenderContext,
        },
      ]);
    } catch (e) {
      const hint =
        e instanceof Error
          ? e.message
          : "Check that the dev server is running (from the repo: npm run dev in server/, or npm run dev at the root).";
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${crypto.randomUUID()}`,
          role: "assistant",
          content: `I couldn't reach the AI coach right now. ${hint}`,
          widgetContext: currentRenderContext,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-sky-100/90 via-[#e8f4f7] to-[#c5dfe8] px-3 py-6 sm:px-6">
      <div className="animate-page-shell mx-auto flex min-h-[calc(100dvh-3rem)] max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/55 border-l-[5px] border-l-[#0B6381] bg-white/25 shadow-[0_24px_80px_-12px_rgba(11,99,129,0.25)] backdrop-blur-xl">
        <TopNav />

        <div className="stagger-chat-1 flex flex-wrap items-center justify-end gap-2 border-b border-white/45 bg-white/40 px-4 py-2.5 backdrop-blur-xl sm:px-5">
          <button
            type="button"
            onClick={startNewScenario}
            className="ui-btn-primary rounded-xl px-4 py-2.5 text-sm"
            title="New demo numbers and a fresh coach conversation"
          >
            New scenario
          </button>
        </div>

        <div className="stagger-chat-2 border-b border-white/45 bg-white/50 px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0B6381]">Current context</p>
            <p className="mt-0.5 text-sm text-slate-800">
              <span className="font-semibold">{d.quarter.label}</span>
              <span className="text-slate-400"> · </span>
              <span>{d.company.name}</span>
              <span className="text-slate-400"> · </span>
              <span className="text-slate-600">demo snapshot</span>
            </p>
          </div>

          <div className="mt-3 rounded-2xl border border-white/55 bg-white/50 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setShowIndex((v) => !v)}
              className="ui-btn-light flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs"
            >
              <span>Source notes</span>
              <span className="text-[#0D50AC]">{showIndex ? "Hide" : "Show"}</span>
            </button>
            {showIndex && (
              <ul className="mt-2 space-y-2 border-t border-white/50 pt-2 text-xs text-slate-600">
                {d.knowledgeIndex.map((k) => (
                  <li key={k.id} className="leading-snug">
                    <Link
                      to={buildCitationHref(k.id)}
                      className="font-mono text-[10px] text-[#0D50AC] underline decoration-[#0D50AC]/35 underline-offset-2"
                      title={resolveCitationDestination(k.id)?.title ?? k.section}
                    >
                      {k.id}
                    </Link>
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="font-medium text-slate-700">{k.section}:</span> {k.fact}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="stagger-chat-3 flex shrink-0 items-center gap-3 border-b border-white/35 bg-[#C4D4DB]/45 px-4 py-2.5 backdrop-blur-xl sm:px-5">
          <CoachAvatar />
          <div className="min-w-0 pr-1">
            <p className="text-xs font-semibold text-[#0B6381] sm:text-sm">AI Coach</p>
            <p className="truncate text-[10px] text-slate-600/80 sm:text-xs">
              {scenario.quarters.length > 1 ? "Multi-quarter data; defaults to your workspace quarter" : "Grounded in the current quarter"}
            </p>
          </div>
        </div>

        <div
          ref={listRef}
          className="stagger-list-in min-h-0 flex-1 space-y-4 overflow-y-auto bg-white/88 px-3 py-5 backdrop-blur-[2px] sm:px-6"
        >
          {messages.map((m, i) => (
            <div
              key={m.id}
              className={`message-animate flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              {m.role === "assistant" ? (
                <div className="flex max-w-[min(100%,32rem)] gap-2.5">
                  <div className="mt-0.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#0B6381]/15 bg-white/70 text-[10px] font-extrabold leading-none text-[#0B6381] shadow-sm backdrop-blur-sm sm:flex">
                    AI
                  </div>
                  <div className="rounded-2xl rounded-tl-md border border-white/60 bg-white/80 px-4 py-3 text-slate-800 shadow-[0_2px_16px_rgba(11,99,129,0.06)] backdrop-blur-sm">
                    <AssistantBody content={m.content} context={m.widgetContext ?? currentRenderContext} />
                  </div>
                </div>
              ) : (
                <div
                  className="max-w-[min(100%,26rem)] rounded-2xl rounded-tr-md border border-white/50 px-4 py-2.5 text-[0.9375rem] leading-relaxed text-slate-800 shadow-sm backdrop-blur-sm"
                  style={{ backgroundColor: "#D1D9DC" }}
                >
                  {m.content}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="message-animate flex justify-start">
              <div className="flex max-w-[min(100%,20rem)] gap-2.5">
                <div className="mt-0.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#0B6381]/15 bg-white/70 text-[10px] font-extrabold leading-none text-[#0B6381] shadow-sm backdrop-blur-sm sm:flex">
                  AI
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/60 bg-white/80 px-4 py-3 text-sm font-medium text-slate-600 shadow-[0_2px_16px_rgba(11,99,129,0.06)] backdrop-blur-sm">
                  Thinking
                  <ThinkingDots />
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="stagger-chat-4 shrink-0 border-t border-white/50 bg-white/50 px-3 py-4 backdrop-blur-xl sm:px-5">
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              disabled={loading}
              placeholder="Ask about results, risks, or next steps…"
              className="min-w-0 flex-1 rounded-2xl border border-white/65 bg-white/80 px-4 py-3 text-[0.9375rem] text-slate-800 shadow-inner outline-none ring-[#0D50AC]/0 backdrop-blur-md transition-[box-shadow,ring,transform] duration-300 placeholder:text-slate-400 focus:border-[#0D50AC]/40 focus:bg-white focus:ring-4 focus:ring-[#0D50AC]/20 disabled:opacity-60"
              aria-label="Message"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading}
              className="ui-btn-primary shrink-0 rounded-2xl px-5 py-3 text-sm disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  Thinking
                  <ThinkingDots light />
                </span>
              ) : (
                "Ask"
              )}
            </button>
          </div>
          <p className="mt-3 text-center text-xs leading-snug text-slate-500/90">
            Use the coach to inspect options and evidence, then make the decision yourself.
          </p>
        </footer>
      </div>
    </div>
  );
}
