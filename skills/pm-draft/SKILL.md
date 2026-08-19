---
name: pm-draft
description: Draft a PM document in a PM workspace — PRD, project charter, product roadmap, risk management plan, status report, stakeholder register, WBS, competitive analysis, and more. Reads project context first and asks only what it doesn't already know. Use when the user wants to write, draft, or update a project or product management document.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion, Skill
model: sonnet
---

# Draft a document

Reads the workspace, asks only what's missing, writes to `docs/`.

Read `${CLAUDE_PLUGIN_ROOT}/skills/pm-draft/references/engine.md` before writing anything — it holds the format, filename convention, writing rules, and the slop gate. Also read `${CLAUDE_PLUGIN_ROOT}/skills/_shared/tone.md` and `${CLAUDE_PLUGIN_ROOT}/skills/_shared/layout.md`.

Load **only** the one type file you need, from `${CLAUDE_PLUGIN_ROOT}/skills/pm-draft/references/types/<slug>.md`. Never load all of them.

---

## Step 1 — Read the workspace, silently

Detect the layout, then read: `CONTEXT.md`, `MEMORY.md`, `USER.md`, `DECISIONS.md`, `PLAN.md` if present, and glob `docs/**/*.md` to see what already exists.

Extract and hold: project name, description, user name, role, tech level, stakeholders, current priorities, open risks, logged decisions, tools, project type, current phase.

No commentary while reading.

**If there's no workspace**, ask once whether to continue without project context or run `/pm-groundwork:setup` first. Drafting without context works — it just means more questions.

## Step 2 — Pick the document type

If the user already named one, skip to step 3.

Otherwise ask, grouped:

**Product** — Product Roadmap · PRD · Product Strategy / Vision · Competitive Analysis · User Stories / Journey Map

**Project** — Project Charter · Scope Management Plan · Work Breakdown Structure · Risk Management Plan · Project Schedule · Communication Plan · Lessons Learned · Status Report · Stakeholder Register

**Other** — Update an existing document (offer only if `docs/` has files) · Something else

Map to the type file:

| Choice | File |
|---|---|
| Product Roadmap | `product-roadmap.md` |
| PRD | `prd.md` |
| Product Strategy / Vision | `product-strategy.md` |
| Competitive Analysis | `competitive-analysis.md` |
| User Stories / Journey Map | `user-stories.md` |
| Project Charter | `project-charter.md` |
| Scope Management Plan | `scope-management-plan.md` |
| Work Breakdown Structure | `wbs.md` |
| Risk Management Plan | `risk-management-plan.md` |
| Project Schedule | `project-schedule.md` |
| Communication Plan | `communication-plan.md` |
| Lessons Learned | `lessons-learned.md` |
| Status Report | `status-report.md` |
| Stakeholder Register | `stakeholder-register.md` |
| Something else | `custom.md` |

**Update an existing document** — list what's in `docs/`, let them pick, then follow the revision rules in `engine.md`.

## Step 3 — Ask

**Check `MEMORY.md` for a "Document defaults" section first.** If `pm-project-start` recorded an audience and cadence, confirm them in one line rather than asking again:

> Same audience as the rest of the set — leadership? (yes / different for this one)

Otherwise ask these two:

**Audience** — Leadership / executives · Project team · Client / external stakeholders · Cross-functional partners · Other

**Timeframe** — Current sprint · This quarter · This half or year · Full project lifecycle · Other

Then the questions from the type file.

**Before every question, check whether you already know the answer.** If you do, confirm instead of asking:

> Your workspace says the sponsor is Dana Whitfield. Use that?

A user who has to retype what they already told setup will not use this twice.

## Step 4 — Confirm

Short. What you're about to write, in five or six lines:

```
[Document type] — [subject]
Audience:  [audience]
Period:    [timeframe]
Sections:  [count] — [first three, then "…"]
Writing to: docs/[filename]
```

Then: generate it / change something.

## Step 5 — Write

Follow `engine.md`. `mkdir -p docs` if needed. One pass — write the whole document, don't build it section by section in the conversation.

## Step 6 — Slop gate

Run the `no-ai-slop` skill in detect mode against the draft, per `engine.md`. Show the findings and offer to fix.

## Step 7 — Close

```
Written: docs/[filename]
Gate:    [N findings / clean]
Plan:    [ticked "item name" / no matching item]
```

Then ask if they want changes. Iterate with Edit on the same file — never write a second copy.

---

## Guardrails

- Never invent a fact to fill a section. Mark the gap.
- Never write code. This skill produces documents.
- Never skip the slop gate.
- Never load more than one type file.
- Never create a phase or item in `PLAN.md` — only tick an existing match.
- If a document would contradict a logged decision, stop and say so before writing.
