import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Guardrail: tracked source must not embed API key material.
 * Real keys live only in server/.env (gitignored). Vercel receives secrets via env, never in client bundles.
 */
describe("secret hygiene", () => {
  const needle = "sk-proj";

  it("no sk-proj literal in server src", () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    for (const rel of ["index.ts", "chatOrchestrator.ts", "tools.ts", "compileKnowledge.ts", "retriever.ts"]) {
      const p = resolve(dir, rel);
      if (!existsSync(p)) continue;
      const txt = readFileSync(p, "utf8");
      expect(txt.includes(needle), `${rel} must not contain API key prefix`).toBe(false);
    }
  });

  it("no sk-proj literal in API and clientKey paths", () => {
    const apiDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../api");
    for (const name of ["chat.ts", "health.ts"]) {
      const p = resolve(apiDir, name);
      if (!existsSync(p)) continue;
      const txt = readFileSync(p, "utf8");
      expect(txt.includes(needle), `${name} must not contain API key prefix`).toBe(false);
    }
    const ck = resolve(dirname(fileURLToPath(import.meta.url)), "clientKey.ts");
    if (existsSync(ck)) {
      expect(readFileSync(ck, "utf8").includes(needle), "clientKey.ts must not contain API key prefix").toBe(false);
    }
  });
});
