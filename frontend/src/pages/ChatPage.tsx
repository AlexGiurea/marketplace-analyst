import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TopNav } from "../components/TopNav";
import { useDemoData } from "../context/DemoDataContext";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
};

const SEED: Message[] = [
  {
    id: "s1",
    role: "assistant",
    content:
      "Hi — I'm your AI Coach. For this pitch demo, answers are meant to ground in your team's posted quarter snapshot (same data as the Workspace page). Open Quarter workspace anytime to see the numbers behind the coaching.",
  },
  {
    id: "s2",
    role: "assistant",
    content:
      'Try asking: "What changed in manufacturing vs last quarter?" or "Which Balanced Scorecard theme looks weakest and why?" The production assistant will pull facts from the indexed snapshot plus tools; this build still uses a demo echo.',
  },
];

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

function mockReply(userText: string): string {
  const trimmed = userText.trim();
  if (!trimmed) return "Send a message to see the demo echo.";
  return `Demo echo: "${trimmed}" — next step: wire /api/chat to inject snapshot JSON + retrieval chunks so replies cite section IDs like perf-share or score-mfg.`;
}

export function ChatPage() {
  const { snapshot: d, randomize, reset } = useDemoData();
  const [messages, setMessages] = useState<Message[]>(SEED);
  const [input, setInput] = useState("");
  const [showIndex, setShowIndex] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const uid = `u-${crypto.randomUUID()}`;
    const aid = `a-${crypto.randomUUID()}`;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: uid, role: "user", content: text },
      { id: aid, role: "assistant", content: mockReply(text) },
    ]);
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-sky-100/90 via-[#e8f4f7] to-[#c5dfe8] px-3 py-6 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/55 border-l-[5px] border-l-[#0B6381] bg-white/25 shadow-[0_24px_80px_-12px_rgba(11,99,129,0.25)] backdrop-blur-xl">
        <TopNav />

        <div className="border-b border-white/45 bg-white/50 px-4 py-3 backdrop-blur-md sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0B6381]">Grounded demo</p>
              <p className="mt-0.5 text-sm text-slate-800">
                <span className="font-semibold">{d.quarter.label}</span>
                <span className="text-slate-400"> · </span>
                <span>{d.company.name}</span>
                <span className="text-slate-400"> · </span>
                <span className="text-slate-600">snapshot v1 (fictional)</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={randomize}
                className="rounded-2xl border border-[#0B6381] bg-[#0B6381] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0c7394] sm:text-sm"
              >
                Randomize data
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:text-sm"
              >
                Reset
              </button>
              <Link
                to="/workspace"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-[#0B6381]/25 bg-[#0B6381]/10 px-4 py-2.5 text-sm font-semibold text-[#0B6381] shadow-sm transition hover:bg-[#0B6381]/15"
              >
                Open quarter workspace →
              </Link>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/60 bg-white/60 p-3 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setShowIndex((v) => !v)}
              className="flex w-full items-center justify-between text-left text-xs font-semibold text-slate-700"
            >
              <span>Knowledge index (what RAG / tools will retrieve)</span>
              <span className="text-[#0D50AC]">{showIndex ? "Hide" : "Show"}</span>
            </button>
            {showIndex && (
              <ul className="mt-2 space-y-2 border-t border-white/50 pt-2 text-xs text-slate-600">
                {d.knowledgeIndex.map((k) => (
                  <li key={k.id} className="leading-snug">
                    <span className="font-mono text-[10px] text-slate-500">{k.id}</span>
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="font-medium text-slate-700">{k.section}:</span> {k.fact}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-b border-white/35 bg-[#C4D4DB]/50 px-4 py-2 backdrop-blur-sm sm:px-5">
          <CoachAvatar />
          <div className="min-w-0 pr-1">
            <p className="text-xs font-semibold text-[#0B6381] sm:text-sm">AI Coach</p>
            <p className="truncate text-[10px] text-slate-600/80 sm:text-xs">Assistant · uses workspace snapshot (planned)</p>
          </div>
        </div>

        <div
          ref={listRef}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-white/90 px-3 py-5 sm:px-6"
        >
          {messages.map((m, i) => (
            <div
              key={m.id}
              className={`message-animate flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              {m.role === "assistant" ? (
                <div className="flex max-w-[min(100%,28rem)] gap-2.5">
                  <div className="mt-0.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#0B6381]/15 bg-white/70 text-[10px] font-extrabold leading-none text-[#0B6381] shadow-sm backdrop-blur-sm sm:flex">
                    AI
                  </div>
                  <div className="rounded-2xl rounded-tl-md border border-white/60 bg-white/80 px-4 py-2.5 text-[0.9375rem] leading-relaxed text-slate-800 shadow-[0_2px_16px_rgba(11,99,129,0.06)] backdrop-blur-sm">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div
                  className="max-w-[min(100%,24rem)] rounded-2xl rounded-tr-md border border-white/50 px-4 py-2.5 text-[0.9375rem] leading-relaxed text-slate-800 shadow-sm backdrop-blur-sm"
                  style={{ backgroundColor: "#D1D9DC" }}
                >
                  {m.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className="shrink-0 border-t border-white/50 bg-white/55 px-3 py-4 backdrop-blur-md sm:px-5">
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask about results, risks, or tradeoffs…"
              className="min-w-0 flex-1 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-[0.9375rem] text-slate-800 shadow-inner outline-none ring-[#0D50AC]/0 transition-[box-shadow,ring] duration-200 placeholder:text-slate-400 focus:border-[#0D50AC]/35 focus:bg-white focus:ring-4 focus:ring-[#0D50AC]/18"
              aria-label="Message"
            />
            <button
              type="button"
              onClick={send}
              className="shrink-0 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-md transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md"
              style={{ backgroundColor: "#0D50AC" }}
            >
              Send
            </button>
          </div>
          <p className="mt-3 text-center text-xs italic leading-snug text-slate-500/90">
            AI can make mistakes. Outputs may be visible to your organization — verify before acting.
          </p>
        </footer>
      </div>
    </div>
  );
}
