# Marketplace Simulation Competition — Reference Brief

This document consolidates context for the AI innovation competition: what Marketplace offers today, how to position a winning proposal, submission requirements, and a sharpened product concept. Use it as the single place to align demo, writeup, and talking points.

---

## Competition and prize context

- **Goal:** Propose an AI solution that innovates on what Marketplace already offers. First place can win **$4,000** (publicly confirmed).
- **Total prize pool:** A **$14,000** total pool was **not** verified from public official sources. In external-facing copy, prefer phrasing like “**$4,000 first-place competition**” unless the course instructor provides separate confirmation.
- **Public promotion:** Marketplace has promoted the competition with the **$4,000 grand prize**, additional cash prizes, and an **April 26** closing date (as of research referenced in this brief).
- **Rules detail:** No more detailed public rules page was found beyond the class post — treat the **professor’s assignment post** as the source of truth for exact submission requirements.

### What you must submit (from the assignment)

The proposal should answer:

1. How businesses **currently use** this type of AI in real work.
2. How that type of AI could **fit into Marketplace**.
3. What **specific AI tools or applications** could support it.

You also need a **written proposal**. **Optional** supporting uploads are encouraged: mockups, reports, graphs, screenshots, or other visuals.

- Teams: up to **3 people**.
- **Multiple entries** allowed.

---

## What Marketplace Simulations already offers

Marketplace positions itself as a **serious business simulation** platform: students run a business or division, often in teams, competing against classmates or computer-generated competitors. Formats include semester-long and self-paced experiences. Catalog areas include marketing, strategy, capstone, supply chain, and entrepreneurship.

**Decision domains** in the simulations include:

- Product design  
- Pricing and promotion  
- Demand projection  
- Production scheduling  
- Capacity expansion  
- Financial management  
- Strategic analysis

### Reporting and assessment (already mature)

Marketplace emphasizes a strong **reporting and assessment** layer, including:

- Balanced Scorecard feedback  
- Dashboard performance reports  
- Comparative reports  
- Data-driven assessments such as **Career Readiness Reports** (e.g., **24 competency metrics** tied to simulation gameplay)

**Strategic implication:** They already believe simulation data can power meaningful analytics and feedback — your idea should **extend** that story, not ignore it.

---

## What AI they already have today (critical for strategy)

Marketplace already offers:

- **AI Coach**  
- **Tactical Plan Reviewer**

**Official framing (paraphrased):**

- AI answers **routine** simulation and business-concept questions.  
- It promotes **guided reflection**, **challenges assumptions**, and increases **critical thinking**.  
- AI should **not** simply hand students **direct strategic answers**.  
- The **Tactical Plan Reviewer** is framed like a **board member** pushing students to **defend** decisions and forecasts.

**What this means for a winning idea:**

- A winner is **unlikely** to be “a bot that tells students exactly what to do.”  
- A winner is **more likely** to be “a **smarter assistant** that interprets **current game data**, surfaces **patterns**, explains **tradeoffs**, and helps students **think like executives**” — aligned with their product direction.

---

## What judges probably want

From how Marketplace presents itself, they likely weight:

1. **Real workplace relevance**
2. **Better student decision-making** (not shortcuts)
3. **Critical thinking** over easy answers
4. **Ideas realistic to build** in a reasonable timeframe

**Positioning:** A **realistic business analyst tool** beats a **novelty chatbot**.

---

## Your idea — sharpened positioning

### Avoid pitching only this

- “A **RAG chatbot** over all simulation data” as the whole story.

### Prefer pitching this

- A **hybrid AI Analyst and Decision Support Assistant**.

### Why the distinction matters

Much of the useful Marketplace information is **structured numeric data**, not just text:

- Revenue, cost, market share  
- Capacity, cash, productivity  
- Scorecard metrics  
- Competitor comparisons  
- Prior quarter results

Marketplace’s own materials suggest some tasks are better handled with **deterministic logic** than a **pure LLM**, because **consistency** matters.

### Strong architecture (conceptual)

1. **Structured retrieval** from the **current simulation state** (live team data + current quarter inputs).
2. **Deterministic business calculators:** break-even, payback, utilization, risk flags, trend deltas, variance, margins, etc.
3. **LLM layer** for explanation, synthesis, scenario framing, and **guided** recommendations — not raw “do X” orders.

This reads as more credible than “we’ll RAG everything.”

---

## Core product concept (competition-ready one-liner)

**Marketplace AI Analyst** is an **in-simulation executive assistant** that:

- Reads a team’s **live game data** and **current quarter inputs**  
- Explains **what changed**  
- Surfaces **risks and opportunities**  
- Runs **on-demand business analysis**  
- Returns **evidence-backed options**, **reasoning**, and **coaching questions** so **students** make **better decisions themselves**

**Positioning:** It extends the **AI Coach** and **Tactical Plan Reviewer** with **live quantitative analysis** — a natural next product step from “AI that explains and challenges” to “AI that **also analyzes**.”

---

## What the assistant should do (behaviors)

### Example student prompts

- What changed from last quarter and why?  
- Where are we underperforming right now?  
- What are the top 3 risks in our current plan?  
- How would increasing ad spend affect our break-even point?  
- Are we likely to overbuild capacity?  
- What metrics are hurting our Balanced Scorecard the most?  
- What are 3 reasonable options for next quarter, and what is the tradeoff of each?

### Output style (sweet spot vs cheating)

**Not:** “Do X.”

**Yes:**

- Here is **what changed**  
- Here is the **evidence** (numbers, trends, thresholds)  
- Here are **2–3 options**  
- Here is the **likely upside and downside** of each  
- Here are **follow-up questions** the team should answer before locking a decision

---

## Why this fits Marketplace better than a generic chatbot

They already have:

- AI for **routine coaching**  
- AI for **questioning tactical plans**  
- **Data-driven** performance reports  
- **Data-driven** career readiness reporting

Your proposal = **natural extension:** from coaching and challenge → **plus** structured, live **analysis**.

---

## Technical angle for proposal / demo

### Frontend

- Clean **chat** embedded beside or above Marketplace-style **reports/dashboards**.

### Data layer

- A **fictional structured game state** (e.g. **JSON**): quarterly financials, scorecard metrics, market research, production, competitors, prior-quarter trends.

### Logic layer

- **Deterministic functions:** margin, break-even, utilization, variance, trend movement, warning thresholds.

### AI layer

- A modern **reasoning** model: plain-language explanation, follow-ups, reflection, tool use over calculators + structured state.

**Example vendor framing (for the writeup):** OpenAI is a reasonable example; their docs position **gpt-5.4**-class models for complex reasoning, and the **Responses API** supports stateful interactions and **tool calling** — a good match for this assistant pattern.

---

## Demo recommendations (Vercel or similar)

A **live demo** plus **2–3 polished screenshots** can strengthen the submission (optional materials are encouraged).

**Minimum credible demo:**

- A **fake quarter dashboard**  
- A **chat panel**  
- **Three sample prompts** with distinct response types:  
  1. **Executive summary**
  2. **What changed since last quarter**
  3. **Capacity and demand risk**

Enough to feel **real** without building the full product.

---

## Verdict (strategic)

**Strong potential** — if positioned correctly.

- **Weaker pitch:** “Chatbot that accesses all the data and gives recommendations.”  
- **Stronger pitch:** “**AI Analyst** that uses **live simulation data** to **explain performance**, run **business analysis**, surface **tradeoffs**, and **coach** stronger executive thinking **without replacing the student’s judgment**.”

Use that tighter wording in proposals, slides, and judge-facing copy.

---

## Original user intent (for later reference)

- Win first place by offering an **AI solution** that **innovates** on Marketplace’s existing stack.  
- Initial instinct: an **AI analyst** with **real-time retrieval** of **numerical** simulation knowledge when the user chats — **at that moment**.  
- This brief **refines** that into a **hybrid** analyst: **structured data + deterministic math + LLM** for explanation and coaching, aligned with Marketplace’s **no shortcuts** philosophy.

---

*Document assembled from competition context, public Marketplace positioning, and strategy notes for the Marketplace Analyst project. Update dates, prize details, and submission rules if the instructor or official channels publish changes.*