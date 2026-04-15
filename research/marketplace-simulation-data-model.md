# Marketplace Simulations — Research Notes for Demo Data & RAG

This document summarizes **public** information about **Marketplace®** business simulations (Innovative Learning Solutions / `marketplace-simulation.com`, also reachable as `marketplacesimulation.com` per Terms of Use) to support a **fictional demo dataset** and future **RAG** over simulation knowledge. Where the vendor site is marketing-level or login-gated, items are labeled **confirmed** (from official pages) vs **inferred** (reasonable extrapolation or third-party student materials).

---

## Executive summary

- **Official product framing**: Marketplace positions simulations as team-based competitive business games with **decision rounds** that build on prior rounds; content is delivered when needed for decisions; students interpret **market feedback**, **competitor moves**, and **financial reports** (Core / IBS product pages).
- **Round counts vary by product**: Example **confirmed** ranges from the core comparison table: **4** decision rounds (e.g. Business Primer, Business Fundamentals in one row) vs **6** rounds (e.g. Introduction to Business and Strategy, Introduction to Marketing), with suggested **session lengths** per round (e.g. 30–75 minutes) on the same pages—not a single universal “N quarters” for all titles.
- **Balanced Scorecard (confirmed categories)**: Public pages list **nine** thematic areas: financial performance; market performance; marketing effectiveness; HR management; manufacturing productivity; asset management; financial risk; creation of wealth; investment in the firm’s future (repeated on multiple product pages such as Introduction to Business and Strategy and Business Fundamentals). *(Prior note incorrectly said ten; theme count verified against product page bullet lists.)*
- **Reports & feedback (confirmed at high level)**: Marketing copy references **automated performance reports**, **grading**, **Balanced Scorecard** feedback, **brand profitability** and **financial statements/ratios** (core category and product pages). **LMS integration** states grades can sync as a **scalar** from the **last Quarter’s Cumulative Balanced Scorecard** for the main simulation.
- **Scheduling & access (confirmed, limited detail)**: **Terms of Use** tie student account validity to instructor-set **due dates** (accounts ending 8 weeks after completion due date); **usage schedule** may be designed up to **18 months**; instructor dashboard features described on **online resources** include visibility into **login time, time spent, and actions**—but **no public step-by-step** of “submit by 5pm / batch processing at midnight.”
- **Student-visible data (confirmed categories only)**: Public text describes **simplified market data**, **customer feedback**, **competitor analysis**, **basic financial statements**, **profitability reports**, **industry financial ratios**, **maps/segments** (e.g. up to 3 segments, up to 4 markets in bike scenarios)—not the exact table names or column headers inside the app.
- **Third-party detail (unverified)**: Student study guides (e.g. course-specific tip sheets) mention **Performance Report**, **Quarter** numbering, **learning checks** gating quarters, **email when a round finishes processing**, and UI elements like **Quick Links** / **Workspace**—useful for **demo UX copy**, but treat as **inferred** until confirmed against instructor manuals or in-app help.

---

## How quarters / rounds work (verified vs inferred)

### Confirmed from Marketplace marketing and legal pages

- **Terminology**: Consumer-facing product pages describe **decision rounds**; **LMS** documentation explicitly refers to **Quarter** and **Last Quarter’s Cumulative Balanced Scorecard** for grade export.
- **Progression**: “Each decision round played builds upon knowledge retained from the previous round” (multiple product pages). In **classmate vs classmate** mode, teams **advance in sync**; vs **computer**, teams can progress at **own pace** (product pages).
- **Duration**: Per-simulation **number of decision rounds** and **approximate minutes per round** appear in comparison tables (e.g. Core Business simulations page—values differ by SKU).
- **Feedback loop**: Students are expected to **interpret market feedback**, **competitors**, and **financial reports** after decisions (product pages).
- **Instructor scheduling**: **Terms** reference instructor-set **due dates** for completing the Learning Tool and **account validity** windows; **online resources** mention **flexible time frames** (from short sessions to a full semester) and **monitoring** of student activity.

### Inferred or partially supported (not fully specified on scraped pages)

- **Exact submission mechanics**: Public pages do **not** consistently spell out whether processing is **real-time**, **instructor-triggered**, or **scheduled batch**—reasonable for a fictional demo to model **submit → process → results available** with timestamps.
- **Whether “Quarter 1” is practice**: Some **third-party** student documents suggest a **test round** not counted in scoring; that may be **course-specific**—do **not** treat as universal Marketplace rules without instructor manual confirmation.
- **Numbering alignment**: A given university course might map **6 decision rounds** to **Q1–Q6** or include **Q7** for cumulative reporting in their LMS—**inferred** from student guides, not from the vendor pages reviewed here.

---

## Decision categories and plausible numeric fields

### Confirmed decision *areas* (from public product pages)

Examples aggregate across Core Business simulations:

- **Strategy**: Segment choice, overall business strategy, competitive positioning (holistic “executive team” framing).
- **Marketing / product**: Brands, segments, pricing, promotion; **R&D** in advanced titles; **internet marketing** in some editions.
- **Sales / distribution**: Opening **sales outlets** in multiple geographic markets; **sales staff** hiring and training.
- **Operations / manufacturing**: **Demand projection**, **production scheduling**, **capacity / 3D printers**, inventory, **lost sales**, excess capacity.
- **HR / compensation**: **Compensation & benefits** packages tied to **sales force productivity**.
- **Finance / accounting**: **Financial statements**, **profitability by brand**, **ratios**, **cash flow**, **debt/equity** in more advanced simulations; **pro forma** tooling mentioned on core overview.

### Public detail on *data* students see (categories, not schemas)

- **Market / customer**: “Simplified” or analyzed market data; **customer needs** and segment-oriented inputs (bike scenarios); **market research** as a decision area in documentation-style pedagogy.
- **Competition**: **Competitor analysis** as an explicit input to decisions.
- **Financial**: **Basic financial statements**, **brand profitability reports**, **industry financial ratios**, **pro forma** planning.
- **Geography / structure**: Illustrations and copy reference **cities** for outlets and **market segments** to target.

---

## Proposed fictional JSON schema (demo dataset)

The following is a **deliberately explicit** nested schema for demos and RAG grounding. Field names are **invented** but aligned with public **category labels**; **types** are suggestions.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.local/schemas/marketplace-demo-quarter-v1.json",
  "title": "MarketplaceStyleDemoSnapshot",
  "type": "object",
  "required": ["company", "quarter"],
  "properties": {
    "simulation": {
      "type": "object",
      "properties": {
        "productId": { "type": "string", "description": "e.g. intro_business_strategy_bikes" },
        "title": { "type": "string" },
        "decisionRoundsTotal": { "type": "integer", "minimum": 1 },
        "mode": { "type": "string", "enum": ["classmates", "computer"] }
      }
    },
    "company": {
      "type": "object",
      "required": ["teamId", "name"],
      "properties": {
        "teamId": { "type": "string" },
        "name": { "type": "string" },
        "hqRegion": { "type": "string" },
        "strategyStatement": { "type": "string" },
        "targetSegments": {
          "type": "array",
          "items": { "type": "string" },
          "maxItems": 3
        }
      }
    },
    "quarter": {
      "type": "object",
      "required": ["index", "label"],
      "properties": {
        "index": { "type": "integer", "minimum": 1 },
        "label": { "type": "string", "description": "e.g. Q3" },
        "decisionRoundIndex": { "type": "integer" },
        "status": {
          "type": "string",
          "enum": ["draft", "submitted", "processing", "results_ready"]
        },
        "submittedAt": { "type": "string", "format": "date-time" },
        "resultsAvailableAt": { "type": "string", "format": "date-time" }
      }
    },
    "marketing": {
      "type": "object",
      "properties": {
        "brands": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "brandId": { "type": "string" },
              "segment": { "type": "string" },
              "price": { "type": "number" },
              "adSpend": { "type": "number" },
              "features": { "type": "array", "items": { "type": "string" } }
            }
          }
        },
        "marketResearchEnabled": { "type": "boolean" },
        "webMarketingSpend": { "type": "number" }
      }
    },
    "hr": {
      "type": "object",
      "properties": {
        "compensationModel": { "type": "string" },
        "benefitsCost": { "type": "number" },
        "salesHires": { "type": "integer" },
        "trainingHoursPerRep": { "type": "number" }
      }
    },
    "finance": {
      "type": "object",
      "properties": {
        "cash": { "type": "number" },
        "shortTermDebt": { "type": "number" },
        "longTermDebt": { "type": "number" },
        "equityIssued": { "type": "number" },
        "dividends": { "type": "number" },
        "revenue": { "type": "number" },
        "netIncome": { "type": "number" },
        "roi": { "type": "number" },
        "currentRatio": { "type": "number" },
        "debtToEquity": { "type": "number" }
      }
    },
    "operations": {
      "type": "object",
      "properties": {
        "productionCapacityUnits": { "type": "number" },
        "unitsProduced": { "type": "number" },
        "unitsSold": { "type": "number" },
        "lostSales": { "type": "number" },
        "inventoryUnits": { "type": "number" },
        "plantInvestment": { "type": "number" }
      }
    },
    "salesChannels": {
      "type": "object",
      "properties": {
        "markets": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "marketId": { "type": "string" },
              "outletsOpen": { "type": "integer" },
              "salespeople": { "type": "integer" }
            }
          },
          "maxItems": 4
        }
      }
    },
    "competitors": {
      "type": "object",
      "properties": {
        "teams": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "teamId": { "type": "string" },
              "name": { "type": "string" },
              "marketSharePct": { "type": "number" },
              "cumulativeScorecard": { "type": "number" }
            }
          }
        }
      }
    },
    "scorecard": {
      "type": "object",
      "description": "Mirrors public Balanced Scorecard theme names; subscores are fictional.",
      "properties": {
        "financialPerformance": { "type": "number" },
        "marketPerformance": { "type": "number" },
        "marketingEffectiveness": { "type": "number" },
        "hrManagement": { "type": "number" },
        "manufacturingProductivity": { "type": "number" },
        "assetManagement": { "type": "number" },
        "financialRisk": { "type": "number" },
        "creationOfWealth": { "type": "number" },
        "investmentInFuture": { "type": "number" },
        "cumulativeTotal": { "type": "number" }
      }
    },
    "reports": {
      "type": "object",
      "properties": {
        "performanceReportUrl": { "type": "string", "format": "uri" },
        "brandProfitabilityRows": { "type": "integer" },
        "notes": { "type": "string" }
      }
    }
  }
}
```

**Note:** Keep a separate **`provenance`** field in your app layer (not shown) marking each block as `canonical_public`, `inferred_demo`, or `user_synthetic`.

---

## Suggested RAG chunking strategy

| Content type | Embed as text | Keep structured (DB / JSON) |
|--------------|----------------|-----------------------------|
| Pedagogy & rules | Short chunks: “what a decision round is,” Balanced Scorecard category definitions, how competition modes differ | Version IDs, exact round counts per SKU |
| Narrative / strategy | Team strategy statements, instructor prompts, reflection prompts | — |
| UI / workflow help | Steps: review last **Performance Report** before new quarter; use **Final Check** (if mirroring third-party tips—label as fictional UX) | State machine enums: `draft → submitted → results_ready` |
| KPIs & financials | One-sentence interpretations (“ROI fell because…”) generated from templates | All numeric series by `(teamId, quarter)`; store raw numbers for charting and to avoid embedding drift |
| Scorecard | Explanations of what “marketing effectiveness” measures in *your* demo | Numeric subscores and weights; **do not** rely on embeddings for arithmetic |
| Competitor tables | Natural language summaries per competitor for a given quarter | Full tables for sorting/filtering |

**Practical split:** Embed **concepts and narratives**; store **numbers and IDs** in structured form and pass retrieved text **plus** a numeric snapshot to the LLM when answering analytical questions.

---

## Sources (URLs consulted)

**Official Marketplace / ILS**

- https://www.marketplace-simulation.com/
- https://marketplacesimulation.com/
- https://www.marketplace-simulation.com/core-business-simulations/
- https://www.marketplace-simulation.com/compare-our-business-simulations/introduction-to-business-and-strategy-bikes/
- https://www.marketplace-simulation.com/compare-our-business-simulations/business-fundamentals-bikes/
- https://www.marketplace-simulation.com/online-resources/
- https://www.marketplace-simulation.com/lms-integration/
- https://www.marketplace-simulation.com/terms-of-use/
- https://www.marketplace-simulation.com/why-use-simulations/

**Third-party (context only; not authoritative for vendor behavior)**

- https://www.studocu.com/en-us/document/western-governors-university/business-core-capstone-an-integrated-application/business-performance-report/22980985 (student tips; course-specific)
- https://www.youtube.com/watch?v=_FsmgwJTt68 (generic title; minimal substantive detail)

---

## Gaps (explicit)

- **In-app schema**: No public source in this research lists exact database fields, CSV exports, or report table layouts.
- **Processing latency**: No authoritative public specification of engine timing; suitable for fictional **`processing`** states.
- **AI usage**: **Terms of Use** prohibit using AI to **create or formulate decisions** in the Learning Tools—worth a compliance note if your RAG assists **real** student accounts (not applicable to purely fictional demos).

---

*Generated for internal demo/RAG design. Not affiliated with Marketplace Simulations.*

---

**See also:** [marketplace-simulation-data-deep-dive.md](./marketplace-simulation-data-deep-dive.md) — ILS Help Center, LMS/Open Badge specifics, processing states, and extended JSON extension suggestions (April 2026).
