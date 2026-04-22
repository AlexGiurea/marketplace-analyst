# Marketplace Analyst — Submission audit (2025)

This document records a product-and-assets audit so competition copy, screenshots, and the live demo stay aligned.

## Official demo

| Item | Value |
|------|--------|
| **Live URL** | [https://marketplace-analyst.vercel.app](https://marketplace-analyst.vercel.app) |
| **Source** | [github.com/AlexGiurea/marketplace-analyst](https://github.com/AlexGiurea/marketplace-analyst) |

## Routes to verify before screenshots / video

| Route | Purpose |
|-------|---------|
| `/` | AI Coach: context strip, source notes, chat, Quarter/Project dashboard shortcuts |
| `/workspace` | Quarter workspace: sim-style nav, panels, disclaimer |
| `/dashboard` | Full coach dashboard (transfer from chat when applicable) |

## Deployment / routing

- **`vercel.json`** includes a catch-all rewrite to `index.html` for the SPA, so **direct load of `/workspace` and `/dashboard` should work** in production (refresh the checklist if an older log still shows 404 for cold `/workspace`).
- API: `GET /api/health`, `POST /api/chat` (see root `README.md`).

## Product capabilities (ground truth for submissions)

Aligned with code and server orchestration:

- **Grounded coaching:** Chat sends `scenario`, `activeQuarterIndex`, and message history to `/api/chat`. The server compiles snapshot knowledge, runs lexical retrieval, and uses the OpenAI Responses API with **function tools** so numbers come from the live snapshot, not invention (`server/src/chatOrchestrator.ts`, `README.md`).
- **Pedagogy:** System rules enforce decision support (no “do X” answers); seed message in `ChatCoachContext` matches “evaluate options without making the decision for you.”
- **UI:** Source notes with links into workspace citations; assistant replies can include **`[citation]`** links and **` ```coach-widget` ** JSON blocks for charts, tradeoff panels, and `dashboard_preview`.
- **Widgets** (non-exhaustive): competitor share, brand demand vs sold, brand profit, segment demand, capacity vs forecast, scorecard themes, quarter trends, brand history, strategic graph, tradeoff compare, dashboard preview (`frontend/src/chat/coachWidgets.tsx`).

## Screenshot inventory (`assets/`)

| File | Intended use |
|------|----------------|
| `submission-01-chat-home.png` | Coach home, context strip |
| `submission-01b-chat-source-notes.png` | Source notes expanded |
| `submission-02-chat-reply.png` | Answer with citations/widgets |
| `submission-03-workspace-overview.png` | Workspace chrome + nav |
| `submission-04-workspace-panel.png` | Data-heavy panel |

**Action before final submit:** Re-capture if UI copy, theme, or routes changed since these files were saved.

## Gaps / follow-ups

- **`marketplace-analyst-showcase.html`** (repo root) is a standalone pitch page; it is **not** served by the Vite app unless copied to `public/` or hosted separately. For judges who only open the Vercel app, rely on the live routes above.
- Ensure **git** includes all files you demo (e.g. `ChatPage`, `coachWidgets`, `coachDashboard`) so deployment matches local.

## Audit conclusion

The product is **submission-ready** as a working prototype: live URL, SPA routes, grounded API, coach + workspace + dashboard story, and an existing screenshot set. Refresh screenshots after any UI deploy before Round 2.
