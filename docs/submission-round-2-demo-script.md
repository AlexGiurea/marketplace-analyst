# Round 2 — Video / live demo script (Marketplace Analyst)

**Target length:** 3–5 minutes (adjust for organizer limits).  
**Tone:** Confident, clear, slightly technical—education and workforce value first.  
**Live URL:** [https://marketplace-analyst.vercel.app](https://marketplace-analyst.vercel.app)  
**On-screen:** Browser full width; show URL bar briefly at start.

---

## 0:00–0:30 — Hook + problem

**Say:**

> “In Marketplace simulations, students get rich dashboards and reports—but the hard part is the same as in real companies: turning raw performance into a clear story, tradeoffs, and a defensible next move.  
> **Marketplace Analyst** is an AI **decision-support** layer that sits on top of that data: it answers questions in plain language, shows charts when they help, and links every important claim back to the report so students can **verify** it—without ever making the decision for them.”

**Show:** Home `/` — AI Coach, **Current context** strip (quarter, team, demo snapshot).

---

## 0:30–1:00 — Pedagogy (why not a cheat bot)

**Say:**

> “We designed this for **learning**, not shortcuts. The coach is instructed to give **evidence**, **options**, and **tradeoffs**—not to pick the winning strategy. That matches how Marketplace already talks about AI: guided reflection and critical thinking.”

**Show:** Scroll to the **footer** line about inspecting options and making the decision yourself. Optionally show the **seed message** in the thread.

---

## 1:00–2:00 — Demo prompt 1 (interpretation + citations)

**Type or paste:**

> “What’s driving our overall share this quarter, and what should we double-check before next quarter?”

**Say (while waiting / after reply):**

> “The model stays grounded in the **loaded quarter snapshot**. It can cite **source IDs** that become **clickable links**—students jump straight to the relevant workspace section.”

**Show:** A reply that includes `[citation]` links; click one to show navigation to `/workspace` with hash if applicable.

---

## 2:00–2:45 — Demo prompt 2 (visuals / widgets)

**Say:**

> “When a chart or comparison helps, the assistant can embed **widgets**—competitor share, demand vs sold, capacity pressure, scorecard themes—so the answer isn’t a wall of text.”

**Optional prompt:** “Show competitor share and balanced scorecard themes for this quarter.”

**Show:** Chart widgets in the thread.

---

## 2:45–3:30 — Dashboard shortcut

**Click:** **Quarter dashboard** (or **Project dashboard** if multi-quarter).

**Say:**

> “For a quick executive-style view, students can ask for a **dashboard preview**—quarter scope or whole project—without leaving the sim context.”

**Show:** `dashboard_preview` widget; if useful, **Open full dashboard** → `/dashboard`.

---

## 3:30–4:15 — Workspace (where it lives in Marketplace)

**Navigate:** **Quarter workspace** (TopNav) → `/workspace`.

**Say:**

> “In a full integration, this same coach sits **beside** the reports students already use—Performance, Manufacturing, Finance—so analysis is **in flow**, not in a separate app.”

**Show:** Module nav, one **data-heavy panel** (e.g. performance table).

---

## 4:15–4:45 — Stack & feasibility (technical credibility)

**Say:**

> “The prototype is **deployed on Vercel**: React front end, serverless `/api/chat` with **OpenAI** and **tool calling** so numbers come from structured state, not hallucination. The code is **open source**—judges can inspect how retrieval and tools work.”

**Optional:** Show `GET /api/health` in a second tab or mention it verbally.

---

## 4:45–5:00 — Close

**Say:**

> “**Marketplace Analyst** helps students **interpret**, **compare**, and **justify**—the same skills they’ll use with analytics and strategy teams in the workforce. Thank you—live demo at **marketplace-analyst.vercel.app**, code on GitHub.”

**Show:** Full URL on screen; optional QR if you add one for slides.

---

## Backup prompts (if one fails)

1. “What changed from the prior quarter on revenue and cash?”
2. “Where is capacity pressure highest relative to demand?”
3. “Give two plausible strategic lenses for next quarter—no single ‘right’ answer.”

---

## B-roll / screenshots checklist

- Coach + context strip  
- Source notes expanded  
- Reply with citations + chart  
- Workspace overview + one panel  
- Optional: `/dashboard` full view

Filenames: see `assets/submission-*.png` and [submission-audit-2025.md](./submission-audit-2025.md).