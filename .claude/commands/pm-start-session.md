---
name: pm-start-session
description: "Start-of-session project recap: summarize progress, surface what's next, flag risks and decisions due for review, and orient the user for today's work."
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

# PM Start-of-Session Recap

Run this at the beginning of every working session. This gives you a
full briefing so you can hit the ground running.

## How to present information

Use AskUserQuestion for every decision point. Keep the recap itself
concise — lead with what matters most, details on request.

---

## Step 0 — Detect layout and read workspace files

First, detect which workspace layout is in use:
- Check if `.claude/agents/pm-lead/AGENT.md` exists
  - If yes → use `.claude/` native paths
  - If no → use flat root paths (legacy layout)

Read all workspace files silently (do not dump contents to the user).
Skip any that don't exist.

**Claude Code native layout:**
1. CLAUDE.md
2. CONTEXT.md
3. `.claude/agent-memory/pm-lead/MEMORY.md`
4. USER.md
5. `.claude/agent-memory/pm-lead/DECISIONS.md`
6. `.claude/agents/pm-lead/AGENT.md`

**Flat layout (legacy):**
1. CLAUDE.md
2. CONTEXT.md
3. MEMORY.md
4. USER.md
5. DECISIONS.md
6. IDENTITY.md

---

## Step 1 — Read GSD state

Read GSD planning artifacts if they exist:
- `.planning/PROJECT.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`

Also check for any active phase plans:
- `.planning/phases/*/PLAN.md`
- `.planning/phases/*/VERIFICATION.md`

If no `.planning/` directory exists, note that GSD hasn't been
initialized yet and suggest `/gsd:new-project` later in the briefing.

---

## Step 2 — Read recent history

Read the most recent daily log(s) from `memory/`:
- Today's log (`memory/YYYY-MM-DD.md`) if it exists
- Yesterday's log (or the most recent one if yesterday doesn't exist)

Extract: what was done last, what next actions were identified, any
unresolved blockers or open threads.

Also check recent git activity if a repo is configured:
```bash
git log --oneline -10
```

---

## Step 3 — Check decisions due for review

Scan DECISIONS.md (at the resolved path from Step 0) for any entries
where Review date ≤ today. Collect them for the briefing.

---

## Step 4 — Present the briefing

Present a structured recap. Adapt length to how much context exists —
a brand new project gets a short briefing, a mature project gets more.

Format:

> **[PROJECT NAME] — Session Briefing**
>
> **Where we are:**
> [1-2 sentences on project status from CONTEXT.md / MEMORY.md]
>
> **Last session:**
> [2-3 bullets from the most recent daily log — what was done]
>
> **What's next:**
> [Numbered list from MEMORY.md "Next actions" + GSD state.
> If a GSD phase is in progress, show which phase and its status.
> If a phase was just completed, note what the next phase is.]
>
> **Current priorities:**
> [From MEMORY.md "Current priorities" section]
>
> **Risks & blockers:**
> [From MEMORY.md "Open risks & blockers" — or "None active" if clear]
>
> **Decisions due for review:**
> [List any with Review date ≤ today, or "None due" if clear.
> Format: "Decision #XXX — [title] (review date: YYYY-MM-DD)"]
>
> **Milestones & deadlines:**
> [From GSD ROADMAP.md if available — show current milestone,
> completion percentage, and any upcoming deadlines.
> If no GSD state, show "GSD not initialized — run /gsd:new-project
> to set up planning"]

---

## Step 5 — What to work on

After the briefing, help the user decide what to focus on.

Use AskUserQuestion:

**Question:** "What do you want to focus on today?"
**Options:**
- "Continue where I left off" → "[Show the most logical next action from GSD state or next actions list]"
- "Work on something specific" → "I'll tell you what I need"
- "Review and plan" → "Let's look at priorities, risks, or upcoming milestones"
- "Quick task" → "Something small that doesn't need full planning"

Based on their answer:

- **Continue where I left off** → Check GSD state. If a phase is in progress,
  suggest `/gsd:resume-work` or `/gsd:execute-phase`. If between phases,
  suggest `/gsd:next`. If no GSD state, surface the top item from
  MEMORY.md "Next actions."

- **Work on something specific** → Let them describe it, then suggest the
  appropriate GSD command based on complexity:
  - Simple/quick → `/gsd:fast` or `/gsd:quick`
  - Needs planning → `/gsd:discuss-phase`
  - Bug or issue → `/gsd:debug`

- **Review and plan** → Use AskUserQuestion to drill down:
  **Question:** "What do you want to review?"
  **Options:**
  - "Project priorities" → "Review and update current priorities in MEMORY.md"
  - "Risks and blockers" → "Review open risks and discuss mitigation"
  - "Upcoming milestones" → "Check GSD roadmap and timeline"
  - "Decision reviews" → "Walk through decisions due for review"

- **Quick task** → Suggest `/gsd:fast` and let them describe it.

---

## Step 6 — Flag anything urgent

Before handing off to the user's chosen work, proactively flag anything
that needs immediate attention:

- Decisions overdue for review (Review date < today, not just ≤)
- Risks marked as "High" impact in MEMORY.md
- GSD phases that appear stalled (last updated > 7 days ago)
- Blockers that were unresolved from the previous session

If nothing urgent: skip this step silently — don't say "nothing urgent"
unless the user specifically asks.

---

## Guardrails

1. Never modify any files during this command — it's read-only
2. Keep the briefing scannable — bullets and short sentences, not paragraphs
3. If workspace files don't exist, suggest running `/pm-setup` first
4. If GSD isn't initialized, mention it once — don't repeat it in every section
5. Adapt tone and detail level to USER.md tech level (A/B/C) if available
6. Don't overwhelm a new project with empty sections — only show sections
   that have real content
