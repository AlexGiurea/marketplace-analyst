# Chat API + local UI

Express serves **`/api/*`** and, in development, the React app via **Vite middleware** on a **single port** (default **5173**).

## Security

- Put **`OPENAI_API_KEY` only in `server/.env`**. That file is listed in the repo root `.gitignore` and must never be committed.
- Do not paste API keys into chat, client-side code, or screenshots you share publicly. If a key is exposed, rotate it in the OpenAI dashboard.
- `GET /api/health` returns `openaiConfigured: true/false` without revealing the key.

## Model

Default chat model is **`gpt-5.4`** (override with `OPENAI_MODEL` in `.env` only if you intend to experiment).

## Architecture

`/api/chat` uses the OpenAI **Responses API** with:

- `instructions` for the grounded coach system prompt
- `input` messages for conversation history
- `function` tools backed by the live `DemoSnapshot`
- `previous_response_id` + `function_call_output` for the tool loop
- `store: true` so requests are visible in the OpenAI dashboard logs

## Run (one URL)

From **`server/`** (after `npm install`):

```bash
cp .env.example .env
# edit .env — set OPENAI_API_KEY
npm install
npm run dev
```

Or from the **repository root** (after `cd server && npm install` once):

```bash
npm run dev
```

Open **`http://127.0.0.1:5173`** — UI and `/api` are the same origin (no separate Vite port).

### Production

Build the frontend, then start with `NODE_ENV=production`:

```bash
npm run build
npm start
```

Same URL; Express serves `frontend/dist` and `/api`.

## API

`POST /api/chat` body:

```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "snapshot": { "...": "DemoSnapshot" }
}
```

Response: `{ "message": "...", "retrievedChunkIds": ["..."] }`

## Tests

```bash
npm run typecheck
npm test
```

Integration test calls OpenAI and requires a valid `OPENAI_API_KEY` in `server/.env`.
