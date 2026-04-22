# Marketplace Analyst

**Live demo:** [https://marketplace-analyst.vercel.app](https://marketplace-analyst.vercel.app) · **Source:** [github.com/AlexGiurea/marketplace-analyst](https://github.com/AlexGiurea/marketplace-analyst)

**Marketplace Analyst** is a demonstration web app that pairs a **Marketplace®-style business simulation** (bikes strategy course context) with an **AI coach**. The coach answers in plain language while staying **grounded in the current quarter’s snapshot**: KPIs, brands, competitors, manufacturing, finance, and scorecard themes are compiled into retrievable text chunks; the model may call **tools** to pull exact figures from the live `DemoSnapshot` so it does not invent numbers. It is designed as **decision support**, not as a decision maker for the student.

> **Disclaimer:** The UI and data are **fictional** and recreated for a student innovation pitch. Not affiliated with Marketplace® or ILS.

---

## Purpose

- **Teaching / pitch:** Help learners explore **tradeoffs** (volume vs margin, capacity vs demand, share vs profitability) using **their current scenario data**, without outsourcing judgment or final decisions.
- **Trustworthy answers:** The server **compiles** structured snapshot fields into knowledge text, runs **lexical retrieval** on the user question, and uses the **OpenAI Responses API** with **function tools** backed by the real snapshot.
- **Single local URL:** In development, one Node process serves **Vite + `/api`** on one port (default `5173`, or `PORT` from `server/.env`).

---

## What’s in the repo

| Area | Role |
|------|------|
| `frontend/` | React + Vite + Tailwind — workspace views and **AI Coach** chat (`fetch('/api/chat')`). |
| `server/` | Express app, chat orchestration (`chatOrchestrator.ts`), retrieval, OpenAI tools, Vitest tests. |
| `api/` | **Vercel serverless** entrypoints (`/api/health`, `/api/chat`) that reuse `server/src/chatRoute.ts`. |

---

## Prerequisites

- **Node.js 20+**
- **OpenAI API key** with access to the configured model (default **`gpt-5.4`**, overridable via `OPENAI_MODEL`).

---

## Local setup

1. **Install dependencies**

   ```bash
   cd server && npm install
   cd ../frontend && npm install
   ```

2. **Configure the API**

   ```bash
   cd server
   cp .env.example .env
   ```

   Edit `server/.env` and set:

   - `OPENAI_API_KEY` — required for chat.
   - `OPENAI_MODEL` — optional (defaults to `gpt-5.4`).
   - `PORT` — optional (defaults to `5173`).

3. **Run (one URL)**

   From the **repository root**:

   ```bash
   npm run dev
   ```

   Or from `server/`:

   ```bash
   npm run dev
   ```

   Open **`http://127.0.0.1:5173`** (or your `PORT`). The UI and **`/api/*`** are same-origin.

4. **Production-style local run**

   ```bash
   npm run build --prefix frontend
   cross-env NODE_ENV=production npm run start --prefix server
   ```

---

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | `{ ok, openaiConfigured, model }` — no secrets exposed. |
| `POST` | `/api/chat` | Body: `{ messages: { role, content }[], snapshot: DemoSnapshot }` → `{ message, retrievedChunkIds }`. |

---

## Tests

```bash
cd server
npm test
npm run typecheck
```

Integration tests call OpenAI when `OPENAI_API_KEY` is set in `server/.env`.

---

## Deploy on Vercel

The repo includes:

- **`vercel.json`** — installs `server/` and `frontend/`, builds the Vite app, serves `frontend/dist`, and deploys **`api/health.ts`** and **`api/chat.ts`** as serverless routes.

### Environment variables (Vercel dashboard or CLI)

Set for **Production** (and **Preview** if you want previews to chat):

| Name | Required | Example / notes |
|------|----------|-----------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI secret key. |
| `OPENAI_MODEL` | No | Defaults to `gpt-5.4` if unset. |

**Do not** commit `.env`. After connecting the GitHub repo, add these under **Project → Settings → Environment Variables**, then redeploy.

CLI (after `npx vercel link`):

```bash
npx vercel env add OPENAI_API_KEY
npx vercel env add OPENAI_MODEL
```

Paste values when prompted; map them to Production (and Preview if desired).

Deploy:

```bash
npx vercel --yes
```

For a production alias:

```bash
npx vercel --prod --yes
```

---

## GitHub

After you create the remote repository, update `package.json` → `repository.url`, then:

```bash
git remote add origin https://github.com/<you>/marketplace-analyst.git
git push -u origin main
```

Suggested **repository description** (GitHub “About” field):

> AI coach for a Marketplace-style business simulation — grounded answers from the live demo snapshot, retrieval, and OpenAI tool calls (React + Vite + Node).

Suggested **topics:** `react`, `vite`, `openai`, `education`, `business-simulation`, `typescript`, `vercel`

---

## Security

- Keep **`OPENAI_API_KEY`** only on the server and in **Vercel Project → Settings → Environment Variables** (Production / Preview as needed). Never put keys in the frontend bundle, `Vite` `import.meta.env` public vars, or committed files. Use `server/.env` locally (gitignored); copy from `server/.env.example`.
- **Rate limits** on `POST /api/chat`: per-IP sliding window (default 20 requests per 60s) plus an hourly ceiling (default 150/hour). Tunable with `CHAT_RATE_LIMIT_*` in `server/.env.example`. Payload size and message length are capped to reduce abuse. In-memory limits apply per serverless instance; for heavy public traffic add Vercel **Deployment Protection** / WAF or a shared store (e.g. Redis) for global quotas.
- Rotate keys if exposed.

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Competition submission materials (Teaching Innovations Con / Marketplace AI)

Prepared for Round 1 (written proposal), Round 2 (prototype + video), and shared messaging:

| Document | Purpose |
|----------|---------|
| [docs/submission-audit-2025.md](./docs/submission-audit-2025.md) | Product/assets audit vs live demo |
| [docs/submission-round-1-proposal.md](./docs/submission-round-1-proposal.md) | Round 1 proposal draft (paste into form) |
| [docs/submission-messaging-kit.md](./docs/submission-messaging-kit.md) | One-liners, pitch, features, wording guardrails |
| [docs/submission-round-2-kit.md](./docs/submission-round-2-kit.md) | Round 2 prototype package: link, code, screenshots, placement |
| [docs/submission-round-2-demo-script.md](./docs/submission-round-2-demo-script.md) | Video/live demo script |
| [docs/pre-submission-browser-checklist.md](./docs/pre-submission-browser-checklist.md) | Production QA + screenshot filenames |

Round 1 PDF exports: [docs/Marketplace-Analyst-Round-1-Submission.pdf](./docs/Marketplace-Analyst-Round-1-Submission.pdf) (full-size figures), [docs/Marketplace-Analyst-Round-1-Submission-compact.pdf](./docs/Marketplace-Analyst-Round-1-Submission-compact.pdf) (smaller centered screenshots), [docs/Marketplace-Analyst-Round-1-Submission-spaced.pdf](./docs/Marketplace-Analyst-Round-1-Submission-spaced.pdf) (extra text between figures, widget callouts, compact centered screenshots). Source HTML: [docs/submission-round-1-upload.html](./docs/submission-round-1-upload.html), [docs/submission-round-1-upload-compact.html](./docs/submission-round-1-upload-compact.html), [docs/submission-round-1-upload-spaced.html](./docs/submission-round-1-upload-spaced.html).

Screenshots: `assets/submission-*.png` and `assets/r1-proposal-*.png` (Round 1 doc embeds the latter from production captures).
