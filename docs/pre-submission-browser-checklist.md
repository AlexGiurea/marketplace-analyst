# Pre-submission browser checklist (Vercel demo)

Use this on **production**: `https://marketplace-analyst.vercel.app/`

Mark each row **Pass** or **Fail** with a one-line note. Screenshots for submission can live under `assets/` (see filenames suggested per step).

## A. Load and routing

| # | Check | Pass criteria |
|---|--------|----------------|
| A1 | Home (`/`) loads | Title "Marketplace AI Demo", coach shell visible, no blank screen |
| A2 | Direct load `/workspace` | Same app shell, workspace layout (not 404) |
| A3 | Browser back/forward | Reasonable (SPA); no broken state after navigating Coach ↔ Workspace |

## B. AI Coach (`/`)

| # | Check | Pass criteria |
|---|--------|----------------|
| B1 | Seed message | Assistant intro mentions decision support / not deciding for the student |
| B2 | Context strip | Quarter, team name, "demo snapshot" visible |
| B3 | Footer copy | Short line about inspecting evidence / making the decision yourself |
| B4 | Source notes | "Source notes" toggles Show/Hide without breaking layout |
| B5 | New scenario | Button present; (optional) click resets conversation per product design |
| B6 | Ask flow | Type short message → Ask → "Thinking" then assistant reply (no stuck spinner) |
| B7 | Citations | If reply has `[…]` links, they render as links (smoke: one click optional) |

## C. Workspace (`/workspace`)

| # | Check | Pass criteria |
|---|--------|----------------|
| C1 | Top bar | Sim title, team, quarter dropdown, disabled "Wrap up / Submit" with demo tooltip |
| C2 | Disclaimer | Amber strip with fictional / not affiliated copy |
| C3 | Nav | Left modules expand; sub-items highlight; URL updates `module`, `sub`, `quarter` |
| C4 | Quarter switch | Changing quarter updates data labels (at least one visible difference or consistent Q label) |
| C5 | Panels | At least Performance → Performance report shows table + overall share |
| C6 | Scroll / hash | If citation links to `#section`, landing scrolls to section (smoke optional) |

## D. Design consistency (subjective but required pass)

| # | Check | Pass criteria |
|---|--------|----------------|
| D1 | Palette | Teal/sky/white theme; no clashing random colors in primary chrome |
| D2 | Typography | Readable body text; headings not oversized; no wall of bold |
| D3 | Density | Workspace tables scroll horizontally on narrow width without breaking nav |
| D4 | Complexity | No extra chrome beyond sim + coach story; disabled submit clearly "demo only" |

## E. API health (outside page UI; run in terminal or DevTools)

| # | Check | Pass criteria |
|---|--------|----------------|
| E1 | `GET /api/health` | `200`, JSON includes `"ok": true` and `openaiConfigured` reflects env |
| E2 | Chat POST | `POST /api/chat` returns 200 with `message` when key configured (smoke: one request) |

## F. Console / network (browser DevTools optional)

| # | Check | Pass criteria |
|---|--------|----------------|
| F1 | Console | No uncaught errors on load of `/` and `/workspace` |
| F2 | Network | `/api/chat` completes without repeated 4xx/5xx on one ask |

---

## Suggested screenshot set (submission)

1. `assets/submission-01-chat-home.png` — Coach home, context strip, footer  
2. `assets/submission-02-chat-reply.png` — After one short question with citations/widgets if any  
3. `assets/submission-03-workspace-overview.png` — Workspace header + disclaimer + nav  
4. `assets/submission-04-workspace-panel.png` — One data-heavy panel (e.g. performance table)

## Agent run log (fill when automated)

| Step | Result | Notes |
|------|--------|-------|
| A1–A3 | **Partial** | **A1 Pass** — `/` loads. **A2 Fail (direct URL)** — cold navigation to `https://marketplace-analyst.vercel.app/workspace` returns **Vercel 404 NOT_FOUND**. **A3 Pass (in-session)** — using in-app **Quarter workspace** / **AI Coach** links works; URL becomes `/workspace` or `/` and UI updates. **Action:** add SPA fallback in `vercel.json` (rewrite all non-API paths to `index.html`) so judges can open or refresh `/workspace`. |
| B1–B7 | **Mostly pass** | **B1** — Production still shows older seed copy (“compare to earlier quarters…”) and footer “Check important numbers before you act.” Redeploy after merging latest `ChatPage` / `ChatCoachContext` for the new decision-support wording. **B2–B5** Pass. **B6 Pass** — short question returned answer with share **18.4%** and citation links. **B7 Pass** — `[ Overall share ]` renders as links. |
| C1–C6 | **Pass (in-app)** | Workspace shows title bar, quarter dropdown, disabled **Wrap up / Submit** (demo), amber disclaimer, teal nav, performance table / overall share. Snapshot tree is sometimes thin; visual screenshot confirms layout. |
| D1–D4 | **Pass** | Coherent teal/sky/white theme; tables + sidebar readable; submit disabled with honest copy. |
| E1–E2 | **E1 Pass; E2 N/A as raw curl** | `GET /api/health` → `{"ok":true,"openaiConfigured":true,"model":"gpt-5.4"}`. **POST /api/chat** from curl without `scenario`/`snapshot` returns **400** (expected). UI chat proves API path works. |
| F1–F2 | **Pass** | Console: only Cursor browser harness warnings, no app errors. `/api/chat` succeeded from UI. |

### Screenshots captured (repo)

Saved under `assets/`:

- `submission-01-chat-home.png` — Coach home (full page)
- `submission-01b-chat-source-notes.png` — Source notes expanded
- `submission-02-chat-reply.png` — User question + assistant answer with citations
- `submission-03-workspace-overview.png` — Workspace after in-app navigation (full page)
- `submission-04-workspace-panel.png` — Workspace performance view (duplicate of overview pass; use for panel shot)

**Temp originals:** browser tool also wrote under `%LOCALAPPDATA%\Temp\cursor\screenshots\` (same filenames).
