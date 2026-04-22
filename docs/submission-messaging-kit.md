# Marketplace Analyst — Messaging kit (competition & judge-facing)

Use this kit consistently across Round 1 text, Round 2 prototype description, video voiceover, and captions.

---

## One sentence

**Marketplace Analyst** is an AI-powered **decision-support** assistant that helps students interpret their Marketplace-style simulation data, weigh tradeoffs, and defend strategy with **evidence**—without outsourcing the final decision.

---

## Short paragraph (elevator pitch)

Marketplace Analyst pairs a **Marketplace-style workspace** with an **AI Coach** that answers in plain language while staying **grounded in the team’s quarter snapshot**: KPIs, brands, competitors, manufacturing, finance, and scorecard themes. Students get **short explanations**, **optional charts and tradeoff panels**, and **citations** that link back to report areas so they can verify numbers. It is designed as **professional-style analytics support**: faster clarity and stronger reasoning, not a shortcut that plays the simulation for them.

---

## Taglines (pick one)

- *Clarity and evidence for your strategy—not the strategy itself.*  
- *Interpret the quarter. Inspect the tradeoffs. Own the decision.*  
- *An analyst brief for every round—grounded in your data.*

---

## Feature / capability list (accurate to the prototype)

| Capability | Student benefit |
|------------|-----------------|
| **Quarter-aware AI Coach** | Questions scoped to loaded scenario and active quarter (multi-quarter when available). |
| **Grounded responses** | Server-side snapshot compilation, retrieval, and tool use so figures align with demo data. |
| **Source notes + citations** | Links from chat into workspace sections—**inspectability** and trust. |
| **Embedded widgets** | Charts (share, demand vs sold, capacity pressure, scorecard, trends, etc.), tradeoff comparisons, dashboard previews. |
| **Quarter / Project dashboard shortcuts** | One-click prompts for a visual overview across the quarter or the whole loaded run. |
| **Workspace mirror** | Sim-style module navigation (performance, marketing, manufacturing, finance, etc.) for realistic context. |
| **New scenario** | Refresh demo data and reset chat for repeatable demos. |
| **Public demo** | Deployed on Vercel with serverless `/api/chat`. |

---

## Why this helps students (pedagogy)

- **Reduces cognitive load** on raw tables and dashboards.  
- **Surfaces tradeoffs and risks** in language teams can use in discussion.  
- **Rewards verification** via citations and workspace links—**critical thinking**, not passive acceptance.  
- **Aligns with career skills**: interpreting data, briefing peers, and justifying decisions—the same moves as in workplace analytics and strategy reviews.

---

## Why this is realistic to build and adopt

- **Modular architecture:** structured game state + retrieval + LLM + tools (already demonstrated).  
- **Fits Marketplace’s product direction:** extends “coach” and “challenge the plan” with **live quantitative context** and **evidence**, not black-box answers.  
- **Reasonable scope:** incremental integration with existing reports and quarter state rather than a multi-year platform rebuild.

---

## Technical one-liner (for judges who want stack)

**React + Vite** frontend, **Node** chat route on **Vercel** serverless, **OpenAI** Responses API with **function tools** and lexical retrieval over compiled snapshot text—see root `README.md`.

---

## Words to prefer / avoid

| Prefer | Avoid |
|--------|--------|
| Decision support, evidence, tradeoffs, interpret, verify | “The AI tells you what to do” |
| Grounded in snapshot / quarter data | “Always knows everything” |
| Options, risks, lenses | Guaranteed optimal strategy |
| Analyst, coach, briefing | Autopilot, cheat |

---

## Official links (keep in sync with README)

- **Live demo:** https://marketplace-analyst.vercel.app  
- **Repository:** https://github.com/AlexGiurea/marketplace-analyst  
