---
name: end-session
description: Close a working session in a PM workspace — writes the daily log, rolls the delivery plan forward, logs decisions, promotes durable facts into project memory, runs a secret scan, then commits and pushes. Use when finishing work in a PM Groundwork project — "wrap up", "end session", "save and close".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
model: sonnet
---

# End session

The full sweep. Run it even if `checkpoint` ran an hour ago — checkpoint is partial by design.

Read first: `${CLAUDE_PLUGIN_ROOT}/skills/_shared/layout.md`, `plan-format.md`, `decision-format.md`, `backup.md`, `safety.md`, `tone.md`.

---

## Step 1 — Gather

Detect the layout. Read `USER.md` for the backup setting and surface. Then:

```bash
git status --short
git diff --stat
git log --oneline --since="12 hours ago"
```

Show a two-line summary of what changed, then ask:

> Anything to add before I wrap up? Decisions, blockers, things to remember.

**Wait for the answer.** It shapes everything below.

## Step 2 — Daily log

Create or append `memory/YYYY-MM-DD.md`. If today's file exists, add a numbered session block rather than overwriting.

```markdown
# YYYY-MM-DD

## Session [N] — HH:MM

**Worked on:** [one or two lines]
**Finished:** [items completed]
**Decisions:** [#IDs, or none]
**Blocked:** [what and why, or none]
**Next:** [where to pick up]
```

## Step 3 — Roll the plan forward

Per `plan-format.md`: tick items, attach paths, update blockers, bump `updated:`.

If every item in the current phase is checked, **ask**:

> Phase [N] — [name] looks complete. Advance to Phase [N+1]?

Only then update `current_phase`. Never advance without the yes.

## Step 4 — Decisions

Write full entries for any decision made this session, per `decision-format.md`, and add each one-line row to the MEMORY.md table.

## Step 5 — Promote to memory

Move what has lasting value from the daily log into `MEMORY.md`: changed priorities, new or resolved risks, stakeholder shifts, new next actions, preferences the user revealed about how they want to work.

Update `CONTEXT.md` only if the project's basic situation actually changed. Update `CLAUDE.md` almost never.

## Step 6 — Secret scan

Run the scan from `safety.md`. **A hit blocks the commit.** Name the file and line, show the matching line, and ask what to do. Never commit past a hit. Never suggest `--no-verify`.

## Step 7 — Commit and push

Three cases, per `_shared/backup.md`:

- **Backup unavailable on this surface** (Cowork, Desktop) — skip this step entirely.
- **Local-only** (user declined GitHub) — commit, do **not** push. Never skip the commit; it is their only version history.
- **Repository configured** — commit and push.

Stage per `_shared/backup.md`: `git add -u` for tracked changes, then add new files **by explicit path** — `PLAN.md` and anything under `docs/`. New documents are the whole point of the backup, and `git add -u` alone would silently skip every one of them.

List any other untracked files for the user rather than staging them.

Show the scan result and what will be committed, then ask once:

> Scan clean. [N] changed, [M] new documents. Commit and push?

On yes:

```bash
git commit -m "chore: session backup YYYY-MM-DD"
git push origin $(git branch --show-current)
```

Never `git add -A` or `git add .`. If the push fails, say why and leave the commit in place; don't retry blindly.

## Step 8 — Summary

Six lines. This is the last thing the user reads.

```
Session closed — [PROJECT NAME]

Done:      [what got finished]
Plan:      Phase [N] — [X] of [Y] done[, advanced to Phase N+1]
Decisions: [#IDs, or none]
Next:      [where to pick up]
Backup:    [pushed to <repo> / committed locally — not backed up off this machine / not available here]
```

Stop there. No closing paragraph.

---

## Guardrails

- Never commit without a passing secret scan and an explicit yes.
- Never `git add -A`.
- Never advance a phase without asking.
- Never invent session content — if the user gave no notes and the diff is empty, write a short log and say the session was quiet.
- If any step fails, finish the rest and say plainly what didn't happen.
