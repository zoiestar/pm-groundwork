---
name: pm-end-session
description: "End-of-session wrap-up for PM projects: summarize work, update memory,
  sync GSD state, back up to git if configured."
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

# PM End-of-Session Wrap-Up

Run this at the end of every working session. Follow the steps in order.
Be thorough but concise — this is a wrap-up, not a deep dive.

---

## Step 0 — Detect layout and gather context

First, detect which workspace layout is in use:
- Check if `.claude/agents/pm-lead/AGENT.md` exists
  - If yes → use `.claude/` native paths (MEMORY.md at `.claude/agent-memory/pm-lead/MEMORY.md`, DECISIONS.md at `.claude/agent-memory/pm-lead/DECISIONS.md`)
  - If no → use flat root paths (legacy layout)

Read CLAUDE.md to orient yourself, then check USER.md "Version control" field.

If a git repo is configured, run:
```bash
git diff
git diff --cached
git status
git log --oneline --since="8 hours ago"
```

If no git repo is configured, skip git commands entirely.

Read `.planning/STATE.md` and `.planning/ROADMAP.md` if they exist.

Present a brief summary of detected changes, then use AskUserQuestion:

**Question:** "Anything to add before I wrap up?"
**Options:**
- "Nope, wrap it up" → "Everything looks right"
- "Yes, I have notes" → "Decisions, blockers, stakeholder updates, or corrections"
- "Let me review first" → "Show me more detail before closing out"

**Wait for the user's response before proceeding.**
If they have notes, let them type freely, then proceed.

---

## Step 1 — Daily log

Create or append to `memory/YYYY-MM-DD.md` (today's date).

**If the file doesn't exist**, create it:
```markdown
# Daily Log — YYYY-MM-DD

## Session summary
[2-3 sentence overview]

---

## Session 1 — [Brief Title]

### What happened
[Bullet points — work done, conversations had, documents reviewed]

### Decisions made
[Decisions or "None"]

### Stakeholder updates
[Any comms, approvals, feedback received — or "None"]

### Blockers / risks identified
[New blockers or risks — or "None"]

### Files created/updated
[List of files touched]

### Next actions
[What comes next, with owners if known]
```

**If the file already exists**, append a new session section.
Read the existing file first to determine the next session number.

---

## Step 2 — GSD state

Read `.planning/STATE.md` and `.planning/ROADMAP.md` if they exist.

Update STATE.md if anything changed: last_updated, current milestone,
progress markers, key decisions, next action.

Mark completed items in ROADMAP.md with `[x]`.

If nothing changed: "No GSD state changes this session."

---

## Step 3 — Decisions log

If decisions were made this session, append to DECISIONS.md (at the resolved
path from Step 0 — `.claude/agent-memory/pm-lead/DECISIONS.md` for native
layout, or root `DECISIONS.md` for flat layout):
```markdown
### #[NEXT ID] — [Short decision title]

**Date:** YYYY-MM-DD
**Owner:** [who owns this]
**Deciders:** [who was in the room]
**Status:** Active

**Decision:**
[One clear sentence]

**Context:**
[2-4 sentences]

**Rationale:**
[Why this option]

**Alternatives considered:**
| Option | Why rejected |
|--------|-------------|
| | |

**Confidence:** High / Medium / Low
[One sentence]

**Implications:**
[What this affects]

**Supporting docs:** [Link or "None"]

**Review date:** YYYY-MM-DD
```

Then add a one-liner to MEMORY.md (at the resolved path) Key decisions table:
```
| YYYY-MM-DD | [One sentence summary] | [#00X] |
```

If no decisions: "No new decisions this session."

---

## Step 4 — Session memory

Update the project's persistent memory by writing key session facts to
`memory/YYYY-MM-DD.md` (already created in Step 1).

Review what was captured in the daily log and ensure any durable facts
(new stakeholders, constraints, preferences, or context that should
persist beyond today) are promoted to MEMORY.md in the appropriate
section. This is the project's primary memory system — the daily logs
plus MEMORY.md are what Claude reads at the start of every session.

---

## Step 5 — Workspace docs sync

Update MEMORY.md (at resolved path) only if meaningful new facts emerged
(new stakeholder, new constraint, completed milestone, changed status).

Update CONTEXT.md only if the project's current state meaningfully shifted.

Update CLAUDE.md only if the GSD state section needs updating (e.g., new
`.planning/` files were created, project was initialized, milestone changed).

If nothing meaningful changed: "Project root docs unchanged."

---

## Step 6 — Git backup

Check USER.md "Version control" field first.

**If "none":**
> Git backup: skipped — no repo configured for this project.

**If repo configured — security scan first:**
```bash
git diff --cached --name-only | xargs grep -in "password\|secret\|token\|api.key\|api_key" 2>/dev/null || true
git status | grep "\.env" || true
git status | grep -E "\.(pem|key|cert|crt)$" || true
```

If ANY matches found: stop, show the user, do NOT commit until confirmed safe.

If clean:
```bash
git add -u
git commit -m "chore: end-of-session backup YYYY-MM-DD"
git push origin $(git branch --show-current)
```

Note: `git add -u` stages only tracked files. If new files were created
that should be committed, list them explicitly with `git add <file>`
rather than using `git add .` which could stage unintended files.

If nothing committable:
> No public files changed — skipping git backup. Normal if all changes
> were to gitignored workspace files.

---

## Wrap-up summary
```
--- Session wrapped up ---
Daily log:      [created/updated/skipped]
GSD state:      [updated/skipped]
Decisions log:  [updated — #XXX added / skipped]
Claude memory:  [updated/skipped]
Workspace docs: [CLAUDE.md / MEMORY.md / CONTEXT.md updated / skipped]
Git backup:     [committed + pushed / nothing to commit / skipped — no repo]
```

---

## Guardrails

1. Never commit API keys, tokens, passwords, or .env files. Scan first, always.
2. Ask before doing anything that can't be undone.
3. Skip steps cleanly when nothing changed — don't force updates.
4. If something looks wrong, stop and ask.
5. Never update MEMORY.md or CONTEXT.md just to change timestamps.