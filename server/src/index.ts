import { config as loadEnv } from "dotenv";
import http from "node:http";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { getClientKeyFromNodeLikeRequest } from "./clientKey.js";
import { handleChatPost, getHealthPayload } from "./chatRoute.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** `.env` wins over inherited shell vars so OPENAI_MODEL=gpt-5.4 is not overridden by the IDE. */
loadEnv({ path: resolve(__dirname, "../.env"), override: true });

const PORT = Number(process.env.PORT) || 5173;
const isProd = process.env.NODE_ENV === "production";

function createApp(): express.Express {
  const app = express();
  app.set("trust proxy", 1);
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json(getHealthPayload());
  });

  app.post("/api/chat", async (req, res) => {
    const clientKey = getClientKeyFromNodeLikeRequest(req);
    const out = await handleChatPost(req.body, { clientKey });
    if (out.headers) {
      for (const [k, v] of Object.entries(out.headers)) {
        res.setHeader(k, v);
      }
    }
    res.status(out.status).json(out.json);
  });

  return app;
}

async function start(): Promise<void> {
  const app = createApp();

  if (isProd) {
    const dist = resolve(__dirname, "../../frontend/dist");
    app.use(express.static(dist));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.sendFile(join(dist, "index.html"));
    });
    app.listen(PORT, "127.0.0.1", () => {
      console.log(`Open http://127.0.0.1:${PORT}  (static UI + /api, model ${getHealthPayload().model})`);
    });
    return;
  }

  const httpServer = http.createServer(app);
  const { createServer: createViteServer } = await import("vite");
  const frontendRoot = resolve(__dirname, "../../frontend");
  const vite = await createViteServer({
    root: frontendRoot,
    configFile: resolve(frontendRoot, "vite.config.ts"),
    cacheDir: resolve(__dirname, "../.vite"),
    server: {
      middlewareMode: true,
      hmr: { server: httpServer },
    },
    appType: "spa",
  });
  app.use(vite.middlewares);
  httpServer.listen(PORT, "127.0.0.1", () => {
    console.log(`Open http://127.0.0.1:${PORT}  (Vite + /api, model ${getHealthPayload().model})`);
  });
}

void start().catch((err) => {
  console.error(err);
  process.exit(1);
});
