# Marketplace® / ILS — Student-Visible Data Per Quarter (Deep Dive)

**Purpose:** Support **fictional demo JSON** expansion and **pitch accuracy** by cataloging how **Innovative Learning Solutions (ILS) DBA Marketplace Simulations** describes **reports, decisions, metrics, UI labels, grading, and LMS exports** in public materials. This note **extends** [`marketplace-simulation-data-model.md`](./marketplace-simulation-data-model.md); it does not replace it.

**Scope:** Public vendor pages (`marketplace-simulation.com`, `marketplacesimulation.com`), **ILS support** (`support.ilsworld.com`), **login/game** (`game.ilsworld.com`, `play.marketplace-simulation.com`), and limited third-party context. **No** authenticated instructor or in-app screenshots were used for primary claims.

---

## Executive summary

- **Terminology:** Product marketing emphasizes **decision rounds** and holistic play; **LMS integration** and **Open Badges** copy use **Quarter** and **Cumulative Balanced Scorecard**. Peer games **advance in sync** once all teams submit; vs-computer play is **own pace**. Results can be **delayed** by missing peer submissions, **instructor hold**, **processing/quality check**, or UI refresh (per student support article).
- **Student-facing information types (named in public copy):** **Customer feedback**, **competitor analysis**, **financial reports**, **basic financial statements**, **brand profitability reports**, **industry financial ratios**, **simplified market data**, **industry data**, plus support articles naming **pro forma** / **accounting sheets**, **cash flow sheet**, **factory simulation**, **Market Impact Graph**, **Lost Sales**, **Target Segments**, **Customer Union messages**, and task flow items like **wrap up** / **submit** and **next quarter**.
- **Balanced Scorecard:** Official product pages (e.g. IBS, Managerial Accounting) list **nine** named themes (e.g. Financial performance … Investment in the firm’s future). **No public formula or weighting** for how themes combine into a single course grade was found; **LMS grade export** is described as **one scalar** derived from the **last Quarter’s Cumulative Balanced Scorecard** (main simulation) or **bundle average** (Microsimulations).
- **Decision areas & inputs (high level, vendor-confirmed):** Strategy; **product marketing** (brands, segments, price, promotion; R&D in advanced titles); **sales channels** (e.g. up to **4 markets**, outlets, hire/train staff); **manufacturing** (demand projection, production, capacity, inventory, lost sales); **compensation & benefits**; **financial management** (statements, profitability, ratios, debt/equity, **pro forma**). **Microsimulations** are embedded learning modules at “critical points.”
- **Cadence & state:** Decisions are framed as **per round/quarter** with **cumulative** scorecard across the simulation. Support describes **quarter deadlines**, **all teams must submit** (peer mode), optional **instructor withholding** of results, and a **quality checker** step (extra **15–20 minutes** in rare cases).
- **LMS / grades:** **LTI** integration; grade transfer described as a **singular scalar** — **Microsimulations:** average across the **bundle**; **Marketplace Simulations:** **final grade** from **last Quarter’s Cumulative Balanced Scorecard**.

---

## How to read this document

| Section | Meaning |
|--------|---------|
| **Confirmed** | Vendor or ILS help center statements (URLs below). |
| **Inferred** | Student guides, forums, coaching sites, or logical glue not explicitly promised by ILS. |
| **Unknown / login-gated** | Not verifiable from public pages alone (exact column headers, internal APIs, instructor-only reports). |

---

## 1. Terminology: quarter vs decision round; sync vs async; results availability

### Confirmed

- **Decision rounds:** Core simulations are sold with a stated **number of decision rounds** and **session length** per round (comparison tables on [Core Business Simulations](https://www.marketplace-simulation.com/core-business-simulations/)).
- **Quarter (LMS & badges):** The [LMS Integration](https://www.marketplace-simulation.com/lms-integration/) page states grade export for the main simulation uses the **last Quarter’s Cumulative Balanced Scorecard**. The [1st Place Team Open Badge](https://game.ilsworld.com/openbadges?type=badgeclass&id=1st-in-class) criteria refer to **cumulative Balanced Scorecard** across **several simulated business quarters**.
- **Sync vs async competition:** [Introduction to Business and Strategy](https://www.marketplace-simulation.com/compare-our-business-simulations/introduction-to-business-and-strategy-bikes/) states **vs classmates** = teams **advance in sync**; **vs computer** = **own pace**.
- **Results gating / processing:** [“My game should have processed…”](https://support.ilsworld.com/hc/en-us/articles/203314496-My-game-should-have-processed-by-now-why-hasn-t-it) lists reasons results are not visible: **peer game** waiting on other teams; incomplete **wrap up/submit** (legacy Marketplace 6 wording); **instructor withholding** results; UI not refreshed (**next quarter** button, **log out and back in**); **quarter still processing**; rare **quality checker** (**15–20 min** extra).
- **Submission rules:** [Who can submit decisions](https://support.ilsworld.com/hc/en-us/articles/204112566-Who-can-submit-decisions-and-when): **Any student** may submit the team’s **full set of saved decisions** **any time during the quarter** (team process is social/normative; technically any member can submit).

### Inferred

- Mapping **“Round 3” ↔ “Q3”** in course syllabi is **instructor/course convention**; vendor pages use both **decision rounds** and **quarter** language in different contexts.
- YouTube and tutoring content often says **“Quarter 4 decisions”**; treat as **informal student language**, not a separate product term.

### Unknown / login-gated

- Exact **clock** for processing, **timezone** behavior, and whether **partial saves** vs **final submit** expose different data — not specified in scraped public pages.
- Full **task list** taxonomy for every SKU (some references to older **Marketplace 6** in support).

---

## 2. Categories of student-visible reports & feedback (named in public materials)

### Confirmed (vendor marketing — category labels, not table schemas)

- **Automated performance feedback** via **Balanced Scorecard** ([Core Business](https://www.marketplace-simulation.com/core-business-simulations/), [Online Resources](https://www.marketplace-simulation.com/online-resources/)).
- **Market feedback** / **customer feedback**; **competitor analysis**; **financial reports** ([Introduction to Business and Strategy](https://www.marketplace-simulation.com/compare-our-business-simulations/introduction-to-business-and-strategy-bikes/)).
- **Basic financial statements**; **brand profitability reports**; **industry financial ratios** ([Core Business — Accounting/Finance](https://www.marketplace-simulation.com/core-business-simulations/)).
- **Simplified market data** (product pages across Core SKUs).
- **Microsimulations** for deeper concept drills at “critical points” ([Introduction to Business and Strategy](https://www.marketplace-simulation.com/compare-our-business-simulations/introduction-to-business-and-strategy-bikes/), [Managerial Accounting](https://www.marketplace-simulation.com/compare-our-business-simulations/managerial-accounting-bikes/)).

### Confirmed (ILS support — specific UI / artifact names)

- **Pro forma** workflow: **factory simulation** → **pro forma** / **accounting sheets** → **cash flow sheet** with **modify** and **load data** actions ([Why aren’t my revenues showing…](https://support.ilsworld.com/hc/en-us/articles/204230193-Why-aren-t-my-revenues-showing-in-the-accounting-sheets)).
- **Market Impact Graph** ([Market Impact Graph](https://support.ilsworld.com/hc/en-us/articles/203312466-Market-Impact-Graph)) — explains comparative **impact** of sales-force programs (qualitative; “test the market” for quantitative effect).
- Additional article titles index **Lost Sales**, **Target Segments**, **Customer Union messages**, **Stock outs**, **false advertising message**, **support staff** ([Student FAQ index](https://support.ilsworld.com/hc/en-us/categories/200169493-FAQ-for-Students)).

### Inferred

- **“Performance Report”** appears in **third-party** student documents (e.g. course tip sheets); **not** found as a canonical report title on the vendor pages scraped for this memo. Safe for **demo UX copy** if labeled **fictional** or “student slang.”
- **Workspace / Quick Links** — referenced in some student PDFs; **not** confirmed on marketplace-simulation.com in this pass.

### Unknown / login-gated

- Exact **PDF/screen names** for every report tab, **export formats**, and **chart inventory** inside the live game.

---

## 3. Decision areas & typical inputs per round

### Confirmed — thematic areas (Core overview)

From [Core Business Simulations](https://www.marketplace-simulation.com/core-business-simulations/):

| Area | Public description (abridged) |
|------|-------------------------------|
| **Marketing Strategy** | Brands, segment needs, pricing, promotion; **internet marketing** in Bike editions. |
| **Sales** | Global expansion; **sales outlets** in multiple geographic markets. |
| **Manufacturing** | Demand projection, production scheduling, capacity, inventory, **lost sales**, excess capacity. |
| **Accounting/Finance** | Financial statements, **brand profitability**, **industry ratios**, **pro forma**, cash/profits; investing/lending in advanced titles. |
| **Human Resources** | **Compensation packages**, **benefits**, productivity. |
| **Entrepreneurship** | Startup lifecycle framing in holistic games. |

### Confirmed — concrete scope limits (example SKU)

[Introduction to Business and Strategy — Bikes](https://www.marketplace-simulation.com/compare-our-business-simulations/introduction-to-business-and-strategy-bikes/):

- **Up to 3 market segments**; **up to 4 markets** for stores.
- **R&D** investment for competitive edge.
- **3D printing / lean production** framing; **compensation & benefits**; **debt and equity** under Financial Management.

### Inferred

- Numeric **input fields** (exact sliders, currency buckets) differ by SKU and edition; public pages stay **qualitative**.

### Unknown / login-gated

- Per-brand **attribute matrices**, **advertising channel** breakdowns, and **minimum/maximum** constraints unless repeated in instructor manuals (not scraped here).

---

## 4. Balanced Scorecard — public theme list; weighting & grading linkage

### Confirmed — nine themes (Introduction to Business and Strategy)

From [Introduction to Business and Strategy — Bikes](https://www.marketplace-simulation.com/compare-our-business-simulations/introduction-to-business-and-strategy-bikes/) (same list appears on other Core SKUs such as [Managerial Accounting](https://www.marketplace-simulation.com/compare-our-business-simulations/managerial-accounting-bikes/)):

1. Financial performance  
2. Market performance  
3. Marketing effectiveness  
4. HR management  
5. Manufacturing productivity  
6. Asset management  
7. Financial risk  
8. Creation of wealth  
9. Investment in the firm’s future  

*(Marketing pages break the list across two columns; the discrete themes are **nine** on the pages scraped for this memo.)*

### Confirmed — grading linkage (high level)

- [Online Resources](https://www.marketplace-simulation.com/online-resources/): **“Automated grading based upon a Balanced Scorecard.”**
- [LMS Integration](https://www.marketplace-simulation.com/lms-integration/): LMS receives **one scalar**; for Marketplace Simulations, tied to **last Quarter’s Cumulative Balanced Scorecard**.

### Inferred

- **Open Badge** text says winners have the **highest cumulative Balanced Scorecard** and must balance **financial success, customer satisfaction, operational efficiency, and employee satisfaction** ([1st Place Team badge](https://game.ilsworld.com/openbadges?type=badgeclass&id=1st-in-class)) — useful **narrative**, not a formula.

### Unknown / login-gated

- **Weights** per theme, **normalization** across teams, handling of ties, and **instructor overrides** — **not** published in sources reviewed.

---

## 5. Competitive & market data students see

### Confirmed

- **Competitor analysis** and **market feedback** as explicit inputs ([Introduction to Business and Strategy](https://www.marketplace-simulation.com/compare-our-business-simulations/introduction-to-business-and-strategy-bikes/)).
- **Simplified market data**; **industry data**; **customer needs** / segment orientation ([Core Business](https://www.marketplace-simulation.com/core-business-simulations/), IBS page).
- **Geography:** **Cities** / **markets** for outlets; **segments** to target ([Online Resources](https://www.marketplace-simulation.com/online-resources/) visuals and copy).
- Support articles: **Target Segments** ([What are Target Segments?](https://support.ilsworld.com/hc/en-us/articles/203952326-What-are-Target-Segments-Can-I-change-my-target-segments)), **Market Impact Graph** ([link](https://support.ilsworld.com/hc/en-us/articles/203312466-Market-Impact-Graph)).

### Inferred

- **Competitor identities** (classmate team names vs AI personas) and **share tables** — implied by “compete” framing; **no** public schema.

### Unknown / login-gated

- Exact **competitor intelligence** metrics (e.g. whether full **P&L** of rivals is visible).

---

## 6. Financial artifacts (as named in public copy)

### Confirmed

- **Basic financial statements**; **brand profitability reports**; **industry financial ratios** ([Core Business](https://www.marketplace-simulation.com/core-business-simulations/)).
- **Pro forma accounting**; **cash flow**; **project finances**; **debt and equity** (IBS and advanced descriptions).
- Support workflow names **pro forma**, **accounting sheets**, **cash flow sheet**, **factory simulation** ([revenues article](https://support.ilsworld.com/hc/en-us/articles/204230193-Why-aren-t-my-revenues-showing-in-the-accounting-sheets)).
- [Managerial Accounting](https://www.marketplace-simulation.com/compare-our-business-simulations/managerial-accounting-bikes/): **simplified versions of standard accounting statements** to maximize profit.

### Inferred

- **Income statement** / **balance sheet** may appear inside the app; vendor pages often say **“financial statements”** generically.

### Unknown / login-gated

- Line-item **chart of accounts**, **GAAP** labeling, and **export** columns.

---

## 7. Data cadence: per processed round vs cumulative

### Confirmed

- **Each decision round builds on the previous** ([Managerial Accounting](https://www.marketplace-simulation.com/compare-our-business-simulations/managerial-accounting-bikes/)).
- **Cumulative Balanced Scorecard** language for **LMS grade** and **badges** ([LMS Integration](https://www.marketplace-simulation.com/lms-integration/), [Open Badge](https://game.ilsworld.com/openbadges?type=badgeclass&id=1st-in-class)).
- **Quick Feedback** as a pedagogy pillar ([Online Resources](https://www.marketplace-simulation.com/online-resources/)).
- Processing and visibility rules per [support article](https://support.ilsworld.com/hc/en-us/articles/203314496-My-game-should-have-processed-by-now-why-hasn-t-it).

### Inferred

- Students likely see **round/quarter results** after processing **plus** running **cumulative** scorecard — implied by LMS wording; **not** a detailed data model on the marketing site.

### Unknown / login-gated

- Whether **every** interim screen shows **both** period and cumulative metrics for **all** financial artifacts.

---

## 8. LMS / grade export — scalars & fields mentioned

### Confirmed

From [LMS Integration](https://www.marketplace-simulation.com/lms-integration/):

- **Grade transfer** sends **a singular scalar value**.
- **Microsimulations:** average score for the **entire bundle**.
- **Marketplace Simulations:** **final simulation grade** based on **last Quarter’s Cumulative Balanced Scorecard**.
- **LTI 1.1** and **LTI Advantage** certification mentioned; **Canvas, Moodle, Blackboard, Sakai, Brightspace** named as examples.
- **Link Launch** for passwordless SSO mentioned on the same page.

### Unknown / login-gated

- **LMS column name**, **grade scale** (0–100 vs 0–1000), **pass/fail**, **multiple attempts**, and **LTI custom parameters** — not detailed in the scraped page body.

---

## 9. Instructor-only telemetry (relevant to “what exists,” not student JSON)

### Confirmed

[Online Resources — Ideal for online classes](https://www.marketplace-simulation.com/online-resources/):

- Instructors can see when students are **logged in**, **how much time** they have spent, and **what exactly they have done** in the game.

### Unknown / login-gated

- Field-level **activity log** schema.

---

## 10. Legal / compliance notes touching data & AI

### Confirmed

[Terms of Use](https://www.marketplace-simulation.com/terms-of-use/):

- Users may **not** use AI technology to **create, design, and formulate decisions** for the Learning Tools (Section 3).
- Official domains include **`ilsworld.com`** and subdomains; student login referenced at **`game.ilsworld.com`** in support articles.
- Account validity ends **eight weeks after instructor due date**; schedule may extend up to **18 months** from design.

---

## Suggested additions to the team demo JSON schema

Use **parallel** or **nested** objects so fictional data can cite **provenance**. Names are **suggestions** aligned to public labels:

- **`integration.gradeExport`**: `{ "kind": "scalar", "marketplaceRule": "last_quarter_cumulative_balanced_scorecard" | "microsim_bundle_average", "ltiVersionsMentioned": ["1.1", "Advantage"] }`
- **`round.processing`**: `{ "blockers": ["peer_pending", "instructor_hold", "quality_check", "incomplete_submit"], "notesQualityCheckMinutesTypical": "15-20" }` (strings are **support-documented** reasons; enums are for demo only)
- **`ui.labelsReferencedInDocs`**: string array for artifacts like **`Market Impact Graph`**, **`cash flow sheet`**, **`pro forma`**, **`factory simulation`**, **`wrap up`/`submit`**, **`next quarter`**
- **`feedback.channels`**: `{ "customerFeedback": true, "competitorAnalysis": true, "financialReports": true }` (boolean flags mirroring marketing bullets)
- **`financialArtifacts`**: `{ "statements": ["basic_financial"], "reports": ["brand_profitability"], "ratios": ["industry_financial_ratios"], "planning": ["pro_forma", "cash_flow_projection"] }`
- **`balancedScorecard.themes`**: fixed array of **nine** canonical strings from IBS / Managerial Accounting pages (use for **demo** score breakdown)
- **`balancedScorecard.gradingWeights`**: **null** with `"publiclyUndisclosed": true` unless you invent fictional weights
- **`competition`**: `{ "mode": "classmates_sync" | "computer_async", "peerAdvanceRule": "all_teams_submitted" }`
- **`submission`**: `{ "anyTeamMemberCanSubmitFullSet": true, "during": "quarter" }`
- **`microsimulations`**: array of `{ "id", "title", "insertAfterRound" }` (placeholders — vendor does not list SKU-specific microsim titles on scraped pages)
- **`domains.official`**: `["marketplace-simulation.com", "marketplacesimulation.com", "ilsworld.com", "game.ilsworld.com", "play.marketplace-simulation.com"]`
- **`compliance.terms`**: `{ "aiDecisionAssistanceProhibited": true, "source": "terms_of_use" }`

---

## Relationship to `marketplace-simulation-data-model.md`

The existing file provides a **starter JSON Schema** and RAG chunking ideas. This deep dive adds **ILS Help Center** and **Open Badges** specifics (processing states, UI strings, LMS scalar rules, submission rules). Prefer **importing** the schema from the earlier doc and **layering** the objects above as optional `extensions`.

---

## Sources (URLs)

**Vendor — product & pedagogy**

- https://www.marketplace-simulation.com/core-business-simulations/
- https://www.marketplace-simulation.com/compare-our-business-simulations/introduction-to-business-and-strategy-bikes/
- https://www.marketplace-simulation.com/compare-our-business-simulations/managerial-accounting-bikes/
- https://www.marketplace-simulation.com/online-resources/
- https://www.marketplace-simulation.com/lms-integration/
- https://www.marketplace-simulation.com/terms-of-use/

**ILS support (student & instructor)**

- https://support.ilsworld.com/hc/en-us/
- https://support.ilsworld.com/hc/en-us/articles/203314496-My-game-should-have-processed-by-now-why-hasn-t-it
- https://support.ilsworld.com/hc/en-us/articles/204112566-Who-can-submit-decisions-and-when
- https://support.ilsworld.com/hc/en-us/articles/204230193-Why-aren-t-my-revenues-showing-in-the-accounting-sheets
- https://support.ilsworld.com/hc/en-us/articles/203312466-Market-Impact-Graph
- https://support.ilsworld.com/hc/en-us/articles/203501743-Where-do-I-register-for-the-simulation

**Game / badges**

- https://game.ilsworld.com/openbadges?type=badgeclass&id=1st-in-class

**Third-party (inferred only; not authoritative)**

- YouTube search results and tutoring sites referencing “Marketplace Simulation Quarter …” (e.g. third-party walkthroughs; **not** official ILS documentation).

---

*Internal research memo. Not affiliated with Marketplace Simulations / ILS. Last synthesized: April 14, 2026.*
