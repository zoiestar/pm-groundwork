---
name: pm-draft
description: "Draft PM documents — PRDs, charters, roadmaps, risk plans, status
  reports, and more. Reads workspace context, asks targeted questions, generates
  a personalized first draft."
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
disable-model-invocation: false
---

# PM Document Drafter

You are drafting a professional PM document for the user. Your job is to read
their workspace context, ask targeted questions about the specific document they
want, and generate a polished first draft — personalized, not templated.

Follow every phase in order. Do not skip ahead.

## How to ask questions

Use AskUserQuestion for EVERY question in this flow. This gives the user
interactive, selectable options instead of walls of text.

Rules:
- One question at a time — never batch multiple questions into one message
- Always include descriptive subtitle text on each option
- Always include an "Other" option for freeform answers (unless the choices
  are truly exhaustive, like yes/no)
- If Phase 0 already has the answer from workspace files, confirm it rather
  than asking from scratch — show it as the first option with "Pre-filled
  from your workspace" as the subtitle
- After the user answers, briefly acknowledge their choice before moving
  to the next question — don't just silently advance

---

## Phase 0 — Context Ingestion (silent)

Before asking anything, detect workspace layout and silently read files.
Use the Read tool for each file that exists. Skip any that don't exist —
do not error or warn about missing files.

**Layout detection:** Check if `.claude/agents/pm-lead/AGENT.md` exists.
- If yes → use `.claude/` native paths (see below)
- If no → use flat root paths (legacy layout)

**Claude Code native layout** — read in this order:
1. `CONTEXT.md` — project description, current state
2. `.claude/agent-memory/pm-lead/MEMORY.md` — stakeholders, priorities, risks
3. `USER.md` — user name, role, tech level (A/B/C), tools, preferences
4. `.claude/agent-memory/pm-lead/DECISIONS.md` — locked-in decisions
5. `.planning/PROJECT.md` — project definition (if GSD initialized)
6. `.planning/ROADMAP.md` — milestone/phase structure (if available)
7. `.planning/STATE.md` — current execution state (if available)
8. `.claude/agents/pm-lead/AGENT.md` — agent role and communication style

**Flat layout (legacy)** — read in this order:
1. `CONTEXT.md` — project description, current state
2. `MEMORY.md` — stakeholders, priorities, risks, decisions summary
3. `USER.md` — user name, role, tech level (A/B/C), tools, preferences
4. `DECISIONS.md` — locked-in decisions that should be referenced
5. `.planning/PROJECT.md` — project definition (if GSD initialized)
6. `.planning/ROADMAP.md` — milestone/phase structure (if available)
7. `.planning/STATE.md` — current execution state (if available)
8. `IDENTITY.md` — Claude's role on this project
9. `SOUL.md` — communication style calibration

Also check if `docs/` directory exists using Glob (`docs/**/*.md`). If it
does, note which documents already exist — you'll offer to update them.

**If no workspace files exist at all** (no CONTEXT.md, no MEMORY.md, no USER.md):
Use AskUserQuestion:
- **Question:** "I don't see a Groundwork workspace set up yet. Would you like to set one up first, or draft a document without workspace context?"
- **Options:**
  - "Set up workspace first" → "Run /pm-setup to create your workspace — this gives me context to pre-fill your document"
  - "Draft without workspace" → "I'll ask all the questions I need from scratch"

If they choose to set up first, tell them to run `/pm-setup` and stop.
If they choose to draft without workspace, proceed but expect to ask more
questions in Phase 2 since you have no pre-filled context.

**Extract and hold these values from workspace files:**
- PROJECT_NAME — from CONTEXT.md or .planning/PROJECT.md
- PROJECT_DESCRIPTION — from CONTEXT.md
- USER_NAME — from USER.md
- USER_ROLE — from USER.md
- TECH_LEVEL — from USER.md (A = terse/technical, B = clear/balanced, C = plain English)
- STAKEHOLDERS — from MEMORY.md stakeholders table
- PRIORITIES — from MEMORY.md current priorities
- RISKS — from MEMORY.md open risks & blockers
- DECISIONS — from DECISIONS.md (recent/relevant entries)
- TOOLS — from USER.md tools list
- PROJECT_TYPE — from MEMORY.md optional sections ([CLIENT], [LAUNCH], [PROGRAM], [OPS])
- MILESTONES — from .planning/ROADMAP.md if available
- CURRENT_PHASE — from .planning/STATE.md if available

---

## Phase 1 — Document Selection

### Step 1a — Check for existing documents

If `docs/` has existing documents, present them as an option first.

### Step 1b — Ask what to draft

Use AskUserQuestion:

**Question:** "What type of document would you like to draft?"
**Options:**

Product Management:
- "Product Roadmap" → "Timeline of features, milestones, and strategic bets"
- "PRD (Product Requirements Document)" → "Feature spec with user stories, requirements, and success metrics"
- "Product Strategy / Vision" → "Where the product is going and why"
- "Competitive Analysis" → "Landscape, positioning, and differentiation"
- "User Stories / Journey Map" → "User perspectives, pain points, and workflows"

Project Management:
- "Project Charter" → "Authorization, scope, objectives, and stakeholders"
- "Scope Management Plan" → "What's in, what's out, and how changes are handled"
- "Work Breakdown Structure (WBS)" → "Hierarchical decomposition of deliverables"
- "Risk Management Plan" → "Risk identification, assessment, and mitigation strategies"
- "Project Schedule / Plan" → "Timeline, milestones, dependencies, and critical path"
- "Communication Plan" → "Who gets what information, when, and how"
- "Lessons Learned" → "What worked, what didn't, and what to carry forward"
- "Project Status Report" → "Current state, progress, risks, and next steps"
- "Stakeholder Register" → "Stakeholder identification, influence, and engagement strategy"

Other:
- "Update an existing document" → "Revise a document in your docs/ folder" (only show if docs/ has files)
- "Something else" → "Describe what you need and I'll build it"

Store the selection as DOC_TYPE.

If the user selects "Update an existing document":
- List the files in `docs/` and ask which one to update
- Read the selected file
- Ask what changes are needed
- Skip to Phase 3 with the update context, then edit the file in Phase 4

If the user selects "Something else":
- Ask them to describe the document they need
- Ask about purpose, audience, and required sections
- Proceed through the rest of the flow using their description as the guide

---

## Phase 2 — Targeted Questions

Before asking any question, check whether the answer is already known from
Phase 0 context. If it is, confirm rather than re-ask:

> "Based on your workspace, I see [value]. Is that correct for this document,
> or would you like to use something different?"

### Common questions (ask for most document types if not already known)

**Question 1 — Audience:**
Use AskUserQuestion:
- **Question:** "Who is the primary audience for this document?"
- **Options:**
  - "Leadership / executives" → "C-suite, VPs, directors — high-level, outcome-focused"
  - "Project team" → "Engineers, designers, analysts — detailed, actionable"
  - "Client / external stakeholders" → "Outside the org — polished, professional"
  - "Cross-functional partners" → "Other teams you're collaborating with"
  - "Other" → "Describe the audience"

Store as DOC_AUDIENCE.

**Question 2 — Timeframe:**
Use AskUserQuestion:
- **Question:** "What timeframe does this document cover?"
- **Options:**
  - "Current sprint / iteration" → "The next 1-2 weeks"
  - "This quarter" → "Current quarter"
  - "This half / year" → "6-12 month view"
  - "Full project lifecycle" → "Start to finish"
  - "Other" → "Specify a timeframe"

Store as DOC_TIMEFRAME.

### Document-specific questions

After the common questions, ask the questions specific to the selected
document type. Each section below lists the questions to ask — adapt based
on what you already know from workspace files.

---

### Product Roadmap

**Q1:** "What time horizon should this roadmap cover?"
- "Quarterly" → "Next 3 months, detailed"
- "Annual" → "Next 12 months, themes and milestones"
- "Multi-year" → "2-3 year strategic view"
- "Other" → "Specify"

**Q2:** "What are the major themes or strategic bets?"
(Freeform — pre-fill from .planning/ROADMAP.md milestones if available)

**Q3:** "Are there hard deadlines or external dependencies?"
(Freeform — pre-fill from MEMORY.md if available)

**Q4:** "How should items be prioritized?"
- "Impact vs. effort" → "Classic 2x2 framework"
- "MoSCoW" → "Must have, Should have, Could have, Won't have"
- "Customer value" → "Based on user/customer impact"
- "Revenue impact" → "Tied to business metrics"
- "Other" → "Describe your approach"

**Q5:** "What format works best for your audience?"
- "Timeline view" → "Swimlanes by quarter or month"
- "Theme-based" → "Grouped by strategic theme or initiative"
- "Now / Next / Later" → "Simple three-horizon view"
- "Other" → "Describe"

**Output sections:** Vision & Strategy, Themes, Roadmap Timeline (table with
columns: Initiative, Theme, Target Date, Status, Dependencies, Owner),
Success Metrics, Risks & Dependencies, Appendix: Backlog Items.

If .planning/ROADMAP.md exists, cross-reference milestones and phases into
the roadmap. Note which are already in progress or completed.

---

### PRD (Product Requirements Document)

**Q1:** "What feature or capability is this PRD for?"
(Freeform)

**Q2:** "What user problem does this solve?"
(Freeform — pre-fill from CONTEXT.md or .planning/PROJECT.md if relevant)

**Q3:** "What are the success metrics? How will you know this worked?"
(Freeform)

**Q4:** "Are there technical constraints the engineering team has flagged?"
- "Yes — let me describe them" → (freeform follow-up)
- "No constraints yet" → "I'll include an open questions section"
- "Not sure" → "I'll flag this as something to confirm with engineering"

**Q5:** "Target release timeframe?"
(Freeform or pre-fill from roadmap)

**Output sections:** Overview, Problem Statement, User Stories (as a user I
want... so that...), Functional Requirements (table: ID, Requirement,
Priority, Acceptance Criteria), Non-Functional Requirements (performance,
security, accessibility), Success Metrics, Timeline & Milestones, Dependencies,
Open Questions, Appendix.

Cross-reference DECISIONS.md for any locked-in technical or product decisions.

---

### Product Strategy / Vision

**Q1:** "What's the current state of the product?"
(Freeform — pre-fill from CONTEXT.md)

**Q2:** "What's the target state or north star?"
(Freeform)

**Q3:** "Who are the target users or customer segments?"
(Freeform)

**Q4:** "What are the key differentiators?"
(Freeform)

**Q5:** "What's the business model or revenue strategy?"
- "Subscription / SaaS" → "Recurring revenue"
- "Transactional" → "Per-use or per-transaction"
- "Marketplace" → "Platform connecting buyers and sellers"
- "Internal tool" → "Not revenue-generating — ROI measured differently"
- "Other" → "Describe"

**Output sections:** Executive Summary, Vision Statement, Current State,
Target State, Target Users & Segments, Market Opportunity, Competitive
Positioning, Key Differentiators, Strategic Pillars (3-5 focus areas),
Success Metrics & KPIs, Risks & Assumptions, Roadmap Summary (high-level).

---

### Competitive Analysis

**Q1:** "Who are the 2-5 competitors to analyze?"
(Freeform — list names)

**Q2:** "What dimensions matter most?"
- "Features & functionality" → "Side-by-side feature comparison"
- "Pricing & packaging" → "How they charge and what's included"
- "Market positioning" → "Brand, messaging, target segment"
- "User experience" → "Ease of use, design quality, onboarding"
- "All of the above" → "Comprehensive analysis"
- "Other" → "Describe"

**Q3:** "What is your current positioning?"
(Freeform — pre-fill from CONTEXT.md if available)

**Q4:** "Is this for internal strategy or will it be shared externally?"
- "Internal strategy" → "Candid, detailed, includes weaknesses"
- "External / investor-facing" → "Polished, positioning-focused"
- "Team alignment" → "Shared with cross-functional partners"

**Output sections:** Executive Summary, Market Overview, Competitor Profiles
(one section per competitor: overview, strengths, weaknesses, target market,
pricing), Feature Comparison Matrix (table), Positioning Map, Opportunities
& Threats, Strategic Recommendations, Sources.

---

### User Stories / Journey Map

**Q1:** "What user type or persona is this for?"
(Freeform)

**Q2:** "What scenario or workflow are you mapping?"
(Freeform)

**Q3:** "What format works best?"
- "User stories (Agile format)" → "As a [user], I want [goal], so that [benefit]"
- "Customer journey map" → "End-to-end experience with touchpoints and emotions"
- "Both" → "User stories organized within a journey map framework"

**Q4:** "What's the scope?"
- "Single feature" → "One specific interaction or workflow"
- "End-to-end experience" → "Full user lifecycle or key workflow"
- "Multiple personas" → "Different user types through the same experience"

**Q5:** "Do you have existing user research or feedback to incorporate?"
- "Yes — let me share key findings" → (freeform follow-up)
- "No research yet" → "I'll base this on the information we have"
- "There's research but I'll add it later" → "I'll leave placeholders for research findings"

**Output sections (User Stories):** Persona Summary, Epic Overview, User
Stories (grouped by theme — each with: ID, story, acceptance criteria,
priority), Dependencies Between Stories, Open Questions.

**Output sections (Journey Map):** Persona Summary, Journey Overview,
Journey Phases (table: Phase, User Action, Touchpoint, Emotion, Pain Points,
Opportunities), Key Insights, Recommended Improvements, Metrics to Track.

---

### Project Charter

**Q1:** "Who is the project sponsor?"
(Freeform — pre-fill from MEMORY.md stakeholders if a sponsor is identified)

**Q2:** "What is the business case? Why now?"
(Freeform)

**Q3:** "What are the high-level deliverables?"
(Freeform — pre-fill from .planning/ROADMAP.md if available)

**Q4:** "What are the known constraints?"
- "Budget" → "Fixed or limited budget — specify if known"
- "Timeline" → "Hard deadline or time-boxed"
- "Resources" → "Limited team size or specific skill gaps"
- "Multiple constraints" → "Describe all that apply"
- "None identified yet" → "I'll include a constraints section to fill in"

**Q5:** "What decision-making authority does the PM have?"
- "Full authority within scope" → "PM decides within defined boundaries"
- "Recommend, sponsor decides" → "PM proposes, sponsor approves"
- "Shared with steering committee" → "Decisions go through a governance body"
- "Not yet defined" → "I'll include a governance section to clarify"

**Output sections:** Project Title & ID, Project Sponsor, Project Manager,
Purpose & Justification, Objectives (SMART format), Scope (In-Scope /
Out-of-Scope table), Key Deliverables, Milestones & Timeline (table),
Stakeholders (table: Name, Role, Responsibility, Influence), Budget Summary,
Constraints & Assumptions, Risks (table: Risk, Probability, Impact,
Mitigation), Governance & Decision Authority, Approval Signatures.

Cross-reference MEMORY.md stakeholders and DECISIONS.md for existing
project decisions.

---

### Scope Management Plan

**Q1:** "How should scope changes be requested?"
- "Formal change request process" → "Written CR with impact analysis"
- "Lightweight approval" → "Email or Slack approval from sponsor"
- "Steering committee review" → "Changes go through governance"
- "Not yet defined" → "I'll propose a process"

**Q2:** "Who has authority to approve scope changes?"
(Freeform — pre-fill from MEMORY.md stakeholders)

**Q3:** "What's the current scope baseline?"
(Freeform — pre-fill from Project Charter if in docs/, or .planning/PROJECT.md)

**Q4:** "How strict is scope control on this project?"
- "Very strict" → "Regulatory, contractual, or fixed-price — minimal changes"
- "Moderate" → "Changes happen but need justification and approval"
- "Flexible" → "Agile approach — scope evolves with learning"

**Output sections:** Purpose, Scope Statement (current baseline), Scope
Change Process (flowchart-style steps), Change Request Template (embedded),
Roles & Responsibilities (table: Role, Authority Level), Impact Assessment
Criteria, Scope Verification Process, Scope Control Tools & Methods.

---

### Work Breakdown Structure (WBS)

**Q1:** "What level of detail do you need?"
- "High-level (2 levels)" → "Major deliverables and key work packages"
- "Detailed (3-4 levels)" → "Full decomposition to task level"
- "Start high, detail later" → "Framework now, refine as planning progresses"

**Q2:** "What are the major deliverables or phases?"
(Freeform — pre-fill from .planning/ROADMAP.md phases if available)

**Q3:** "How should work be organized?"
- "By deliverable" → "Group by what's being produced"
- "By phase" → "Group by project timeline phase"
- "By team / function" → "Group by who does the work"
- "Hybrid" → "Combination approach"

**Output sections:** WBS Dictionary Header (project name, version, date),
WBS Hierarchy (indented outline format with WBS IDs: 1.0, 1.1, 1.1.1, etc.),
WBS Dictionary (table: WBS ID, Work Package, Description, Owner, Estimated
Effort, Dependencies), Assumptions, Exclusions.

If .planning/ROADMAP.md exists, map GSD phases and milestones into the WBS
structure.

---

### Risk Management Plan

Pre-fill risks from MEMORY.md "Open risks & blockers" section. Show them
to the user and ask if there are additional risks.

**Q1:** "I found these existing risks in your workspace: [list]. Are there
additional risks to include?"
(Freeform — or "These cover it" option)

**Q2:** "What's the risk tolerance for this project?"
- "Low tolerance" → "Regulatory, safety-critical, or high-stakes — mitigate aggressively"
- "Medium tolerance" → "Standard business risk — balance mitigation with progress"
- "High tolerance" → "Innovative or experimental — accept more risk for speed"

**Q3:** "Who owns risk escalation?"
(Freeform — pre-fill from MEMORY.md stakeholders if a sponsor is identified)

**Q4:** "How often should risks be reviewed?"
- "Weekly" → "Fast-moving project, frequent changes"
- "Biweekly" → "Moderate pace, regular check-ins"
- "Monthly" → "Stable project, longer review cycles"
- "Per milestone" → "Review at each major checkpoint"

**Output sections:** Purpose & Approach, Risk Tolerance Statement, Risk
Identification Methods, Risk Register (table: ID, Risk, Category, Probability,
Impact, Risk Score, Owner, Mitigation Strategy, Contingency, Status),
Risk Assessment Matrix (5x5 grid: probability vs. impact), Risk Response
Strategies (by category), Monitoring & Review Process, Escalation Procedures,
Risk Communication Plan.

---

### Project Schedule / Plan

**Q1:** "What scheduling approach are you using?"
- "Waterfall / sequential" → "Linear phases with dependencies"
- "Agile / iterative" → "Sprints or iterations with incremental delivery"
- "Hybrid" → "Mix of planned phases and agile execution"
- "Not decided" → "I'll propose based on your project type"

**Q2:** "What are the key milestones and target dates?"
(Freeform — pre-fill from .planning/ROADMAP.md or MEMORY.md)

**Q3:** "Are there external dependencies or fixed dates?"
(Freeform)

**Q4:** "What level of detail do you need?"
- "High-level milestones" → "Major checkpoints and dates"
- "Phase-level plan" → "Phases with key activities and durations"
- "Detailed task plan" → "Full task breakdown with dependencies"

**Output sections:** Schedule Overview, Assumptions & Constraints,
Milestones (table: Milestone, Target Date, Owner, Status, Dependencies),
Phase Breakdown (for each phase: objectives, key activities, duration,
deliverables, entry/exit criteria), Dependencies (table: Dependency, Type,
Impact, Owner), Critical Path Summary, Resource Requirements (high-level),
Schedule Risks, Change Management (how schedule changes are handled).

---

### Communication Plan

Pre-fill stakeholders from MEMORY.md. Pre-fill tools/channels from USER.md.

**Q1:** "I found these stakeholders in your workspace: [list]. Anyone to
add or remove for this communication plan?"
(Freeform — or "This covers it")

**Q2:** "What communication cadences exist or are needed?"
- "Daily standups" → "Quick sync, blockers, priorities"
- "Weekly status" → "Progress report, risks, decisions needed"
- "Biweekly review" → "Deeper dive into progress and plan"
- "Monthly executive update" → "High-level summary for leadership"
- "All of the above" → "Full cadence from daily to monthly"
- "Other" → "Describe your cadences"

**Q3:** "What channels do you use?"
(Pre-fill from USER.md tools — email, Slack, Teams, Jira, Confluence, etc.)

**Q4:** "Are there sensitive topics requiring restricted distribution?"
- "Yes — let me describe" → (freeform follow-up)
- "No" → "Standard distribution for all comms"

**Output sections:** Purpose, Stakeholder Communication Matrix (table:
Stakeholder / Group, Information Needed, Frequency, Channel, Owner,
Format), Communication Schedule (table: Cadence, Meeting/Report, Audience,
Day/Time, Owner), Escalation Communication Path, Templates & Standards
(what each communication type should include), Feedback Mechanisms,
Communication Tools & Channels (table: Tool, Purpose, Audience).

---

### Lessons Learned

**Q1:** "What phase, milestone, or project is this retrospective for?"
(Freeform — pre-fill from .planning/ROADMAP.md if a milestone recently completed)

**Q2:** "What went well?"
(Freeform — encourage specifics)

**Q3:** "What didn't go well?"
(Freeform — encourage specifics)

**Q4:** "What would you do differently next time?"
(Freeform)

**Q5:** "Are there specific recommendations you want to highlight?"
- "Yes — let me describe" → (freeform follow-up)
- "Just capture the themes" → "I'll synthesize recommendations from your answers"

**Output sections:** Document Header (project, phase/milestone, date,
participants), Executive Summary, Context (what was being done, timeline,
team), What Went Well (categorized: process, people, tools, technical),
What Didn't Go Well (categorized same way), Root Cause Analysis (for major
issues), Recommendations (table: Recommendation, Category, Priority, Owner,
Target Date), Action Items (table: Action, Owner, Due Date, Status),
Appendix: Raw Feedback (if provided).

Cross-reference DECISIONS.md — were there decisions that turned out to be
wrong or right? Include those insights.

---

### Project Status Report

Pre-fill heavily from workspace context. This document type should require
the fewest questions since most information comes from existing files.

**Q1:** "What reporting period is this for?"
- "This week" → "Last 7 days"
- "This sprint" → "Current sprint/iteration"
- "This month" → "Current month"
- "Custom period" → "Specify dates"

**Q2:** "Who receives this report?"
(Pre-fill from MEMORY.md stakeholders — or Communication Plan if in docs/)

**Q3:** "Any specific wins or concerns to highlight?"
(Freeform — or "Just the facts")

**Q4:** "Overall project health?"
- "Green — on track" → "No significant risks or blockers"
- "Yellow — at risk" → "Issues identified, mitigation in progress"
- "Red — off track" → "Significant blockers or missed milestones"

**Output sections:** Report Header (project, period, author, date, overall
status: Green/Yellow/Red), Executive Summary (2-3 sentences), Progress
Summary (table: Milestone/Phase, Status, % Complete, Notes — pre-fill from
GSD state), Accomplishments This Period (bullets — pre-fill from recent
daily logs in memory/), Risks & Issues (table: Item, Type, Impact, Owner,
Status, Mitigation — pre-fill from MEMORY.md), Decisions Made (pre-fill
from DECISIONS.md for this period), Upcoming Work (next period — pre-fill
from ROADMAP.md), Resource & Budget Status (if applicable), Action Items
(table: Action, Owner, Due Date).

---

### Stakeholder Register

Pre-fill from MEMORY.md stakeholders table.

**Q1:** "I found these stakeholders in your workspace: [list with roles].
Anyone to add, remove, or update?"
(Freeform — or "This covers it")

**Q2:** "How detailed should the engagement strategy be?"
- "Basic" → "Name, role, influence level, and key interests"
- "Detailed" → "Add communication preferences, engagement approach, and potential risks"
- "Comprehensive" → "Full RACI + influence/interest matrix + engagement plan"

**Q3:** "Are there any stakeholder relationships or dynamics to be aware of?"
(Freeform — or "Nothing specific")

**Output sections:** Purpose, Stakeholder Register (table: Name, Title/Role,
Organization/Team, Contact, Interest in Project, Influence Level (H/M/L),
Support Level (Champion/Supporter/Neutral/Resistant), Key Expectations,
Communication Preference, Engagement Strategy), Influence/Interest Matrix
(2x2: Monitor, Keep Informed, Keep Satisfied, Manage Closely — place each
stakeholder), Engagement Plan (for high-influence stakeholders: specific
actions, frequency, owner), RACI Matrix (if comprehensive level selected:
table with key decisions/deliverables and stakeholder assignments),
Review & Update Schedule.

---

### Something Else (freeform document)

When the user selects "Something else":

**Q1:** "What type of document do you need? Describe it briefly."
(Freeform)

**Q2:** "What's the purpose of this document?"
- "Decision support" → "Helping someone make or approve a decision"
- "Communication" → "Informing stakeholders about something"
- "Planning" → "Defining how work will be done"
- "Tracking" → "Recording status, progress, or outcomes"
- "Reference" → "Creating a reusable resource"
- "Other" → "Describe"

**Q3:** "Who is the audience?"
(Same as common Question 1 above)

**Q4:** "What sections should it include?"
(Freeform — suggest common sections based on the purpose they described)

Then proceed to Phase 3 with the custom document structure.

---

## Phase 3 — Confirmation

Present a summary of what you're about to generate:

> **Document:** [DOC_TYPE]
> **Project:** [PROJECT_NAME]
> **Audience:** [DOC_AUDIENCE]
> **Timeframe:** [DOC_TIMEFRAME]
> **Key inputs:**
> - [bullet list of key facts gathered]
>
> **Proposed file:** `docs/[type]-[descriptor]-[YYYY-MM-DD].md`
>
> **Sections I'll include:**
> - [list of sections]

Use AskUserQuestion:
- **Question:** "Ready to generate this document?"
- **Options:**
  - "Yes, draft it" → "I'll generate the full document now"
  - "I need to change something" → "Tell me what to adjust"
  - "Add more context first" → "Share additional details before I draft"

Wait for confirmation before proceeding. If they want changes or more
context, address those and re-present the summary.

---

## Phase 4 — Generation

### File setup

Create the `docs/` directory if it doesn't exist:
```bash
mkdir -p docs
```

### Filename convention

Use this format: `docs/[type]-[descriptor]-[YYYY-MM-DD].md`

Examples:
- `docs/prd-user-onboarding-2026-03-31.md`
- `docs/project-charter-2026-03-31.md`
- `docs/risk-management-plan-2026-03-31.md`
- `docs/competitive-analysis-2026-03-31.md`
- `docs/status-report-2026-03-31.md`
- `docs/product-roadmap-2026-03-31.md`

The descriptor should be a short, kebab-case label derived from the document
subject. For documents that are project-wide (charter, risk plan), use just
the type name.

### Document structure

Every generated document must start with a YAML metadata header:

```markdown
---
project: [PROJECT_NAME]
type: [Document Type]
author: [USER_NAME]
date: [YYYY-MM-DD]
status: Draft
version: 1.0
---
```

### Writing rules

1. **Never leave placeholder text.** Every field must be filled with real
   content derived from context and answers. If something is genuinely unknown,
   write "(To be determined — [specific thing needed])" with a concrete
   description of what's missing.

2. **Adapt tone to TECH_LEVEL:**
   - Level A: Terse, professional, assumes domain knowledge. No definitions.
   - Level B: Clear and balanced. Define terms on first use. Brief context.
   - Level C: Plain English throughout. Explain PM frameworks and concepts.
     Use analogies where helpful. Extra structure and guidance.

3. **Adapt formality to document type:**
   - Project Charter, Scope Management Plan → Formal, structured, approval-ready
   - PRD, Risk Plan, Communication Plan → Professional, detailed, actionable
   - Status Report, Lessons Learned → Direct, scannable, action-oriented
   - Product Roadmap, Strategy → Visionary but grounded, forward-looking
   - Competitive Analysis → Analytical, evidence-based, candid (if internal)
   - User Stories → Conversational, user-centered, empathetic

4. **Cross-reference existing decisions.** When a decision from DECISIONS.md
   is relevant, reference it: "Per Decision #[ID]: [decision summary]."

5. **Use tables for structured data.** Stakeholder lists, risk registers,
   feature comparisons, requirement tables — always use markdown tables
   with clear column headers.

6. **Keep sections scannable.** Use bullets, bold key terms, and short
   paragraphs. Executives skim. Teams reference. Nobody reads walls of text.

7. **Include next steps.** Every document should end with clear next steps
   or action items — who needs to do what, by when.

### Write the document

Use the Write tool to create the file at the agreed path. Write the complete
document in one pass.

---

## Phase 5 — Review & Iteration

After generating the document, present a brief summary of what was created,
then ask for feedback.

Use AskUserQuestion:
- **Question:** "How does this draft look?"
- **Options:**
  - "Looks good — done" → "Great, your document is ready"
  - "Needs some changes" → "Tell me what to adjust"
  - "Rewrite a specific section" → "Which section needs rework?"
  - "Change the tone" → "More formal, more casual, or something specific?"
  - "Add more detail somewhere" → "Which section needs more depth?"

If they want changes, apply them using the Edit tool and re-present the
summary. Loop until the user is satisfied.

### Wrap-up

When the user approves the document, present:

```
--- Document drafted ---
File: docs/[filename].md
Type: [DOC_TYPE]
Status: Draft v1.0
---
Next steps:
- Review with [audience] and gather feedback
- Update status to "Final" when approved
- To revise later: run /pm-draft and select "Update an existing document"
```

---

## Guardrails

1. Never generate the document before Phase 3 confirmation
2. Never leave template placeholder text — personalize everything
3. Always read workspace files before asking questions that might already
   be answered
4. One question at a time via AskUserQuestion with descriptive subtitles
5. Always include an "Other" option for freeform answers (unless truly
   exhaustive like yes/no)
6. If workspace files don't exist, suggest /pm-setup but don't force it
7. Adapt tone and complexity to USER.md tech level (A/B/C)
8. If the user asks to update an existing document, use Edit — don't
   overwrite the entire file unless they explicitly want a full rewrite
9. When updating, increment the version number (1.0 → 1.1, etc.)
10. Cross-reference DECISIONS.md entries by ID when relevant
