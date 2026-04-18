import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Guardrail: tracked source must not embed API key material.
 * Real keys live only in server/.env (gitignored).
 */
describe("secret hygiene", () => {
  it("no sk-proj literal in server src", () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const needle = "sk-proj";
    for (const rel of ["index.ts", "chatOrchestrator.ts", "tools.ts", "compileKnowledge.ts", "retriever.ts"]) {
      const p = resolve(dir, rel);
      if (!existsSync(p)) continue;
      const txt = readFileSync(p, "utf8");
      expect(txt.includes(needle), `${rel} must not contain API key prefix`).toBe(false);
    }
  });
});
