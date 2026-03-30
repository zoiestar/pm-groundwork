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

## Step 0 — Gather context

Run these commands to understand what happened this session:
```bash
git diff
git diff --cached
git status
git log --oneline --since="8 hours ago"
```

If no git repo is configured (check USER.md "Version control" field),
skip git commands entirely.

Read `.planning/STATE.md` and `.planning/ROADMAP.md` if they exist.

Present a brief summary of detected changes, then ask:

> Any session notes to add? Decisions made, blockers hit, stakeholder
> updates, things to remember, or corrections to the above?

**Wait for the user's response before proceeding.**

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

If decisions were made this session, append to DECISIONS.md:
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

Then add a one-liner to MEMORY.md Key decisions table:
```
| YYYY-MM-DD | [One sentence summary] | [#00X] |
```

If no decisions: "No new decisions this session."

---

## Step 4 — Claude memory

Detect the Claude memory path:
```bash
ls ~/.claude/projects/
```

Find the folder matching this project. Update the main project memory
file with current status, new decisions or key facts, updated next
actions, today's date as last-updated.

If path can't be detected, ask the user to run `ls ~/.claude/projects/`
and share the matching folder name.

---

## Step 5 — MEMORY.md / CONTEXT.md sync

Update MEMORY.md only if meaningful new facts emerged (new stakeholder,
new constraint, completed milestone, changed status).

Update CONTEXT.md only if the project's current state meaningfully shifted.

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
git add .
git commit -m "chore: end-of-session backup YYYY-MM-DD"
git push origin $(git branch --show-current)
```

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
Project docs:   [updated/skipped]
Git backup:     [committed + pushed / nothing to commit / skipped — no repo]
```

---

## Guardrails

1. Never commit API keys, tokens, passwords, or .env files. Scan first, always.
2. Ask before doing anything that can't be undone.
3. Skip steps cleanly when nothing changed — don't force updates.
4. If something looks wrong, stop and ask.
5. Never update MEMORY.md or CONTEXT.md just to change timestamps.