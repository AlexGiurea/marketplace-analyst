import type { KnowledgeChunk } from "./compileKnowledge.js";

const STOP = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "for",
  "on",
  "is",
  "are",
  "was",
  "what",
  "how",
  "why",
  "we",
  "our",
  "us",
  "my",
  "do",
  "does",
  "did",
  "can",
  "could",
  "should",
  "with",
  "from",
  "as",
  "at",
  "by",
  "it",
  "this",
  "that",
  "be",
  "have",
  "has",
  "any",
  "about",
  "your",
  "team",
]);

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9$%.]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** 1-based quarter index if the user names a quarter explicitly (Q2, quarter 3, …). */
export function parseExplicitQuarterFromQuery(query: string): number | null {
  const q = query.toLowerCase();
  const m1 = q.match(/\b(?:q|quarter)\s*([1-9]\d*)\b/);
  if (m1) {
    const n = parseInt(m1[1], 10);
    return Number.isFinite(n) && n >= 1 ? n : null;
  }
  const m2 = q.match(/\bquarter\s*([1-9]\d*)\b/);
  if (m2) {
    const n = parseInt(m2[1], 10);
    return Number.isFinite(n) && n >= 1 ? n : null;
  }
  return null;
}

export type RetrieveChunksOptions = {
  /** 0-based index of the quarter the UI is focused on. */
  activeQuarterIndex?: number;
  /** When true, chunk corpus includes `metadata.quarterIndex`. */
  multiQuarter?: boolean;
};

/** Lightweight lexical retriever — good enough for small compiled corpora. */
export function retrieveChunks(
  query: string,
  chunks: KnowledgeChunk[],
  max = 8,
  opts?: RetrieveChunksOptions,
): KnowledgeChunk[] {
  const terms = tokenize(query);
  if (terms.length === 0) return chunks.slice(0, max);

  const explicitQuarter = parseExplicitQuarterFromQuery(query);
  const active1Based =
    opts?.activeQuarterIndex !== undefined ? opts.activeQuarterIndex + 1 : null;

  const scored = chunks.map((c) => {
    const hay = `${c.id} ${c.section} ${c.text}`.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (hay.includes(t)) score += 2;
    }
    if (c.section.toLowerCase().includes("scorecard") && (query.includes("score") || query.includes("balanced"))) score += 4;
    if (c.section === "manufacturing" && (query.includes("capacity") || query.includes("inventory") || query.includes("stock"))) score += 4;
    if (c.section === "finance" && (query.includes("cash") || query.includes("debt") || query.includes("dividend"))) score += 4;
    if (c.section === "marketing" && (query.includes("price") || query.includes("ad") || query.includes("brand"))) score += 3;

    const qMeta = c.metadata.quarterIndex;
    if (opts?.multiQuarter && qMeta) {
      if (explicitQuarter !== null) {
        if (qMeta === String(explicitQuarter)) score += 8;
      } else if (active1Based !== null && qMeta === String(active1Based)) {
        score += 5;
      }
    }

    return { c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((s) => s.score > 0).slice(0, max).map((s) => s.c);
  if (top.length >= 3) return top;
  return [...top, ...chunks.filter((c) => !top.includes(c))].slice(0, max);
}
