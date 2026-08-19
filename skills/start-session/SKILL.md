---
name: start-session
description: Open a working session in a PM workspace — reads project memory, the decision log, the delivery plan, and what changed in git since last time, then briefs you on where things stand and what to work on. Read-only. Use at the start of a session, or when the user asks where things left off.
allowed-tools: Read, Glob, Grep, Bash, AskUserQuestion
model: sonnet
---

# Start session

Read-only. **Never modify any file during this skill**, including the daily log.

Read first: `${CLAUDE_PLUGIN_ROOT}/skills/_shared/layout.md` and `${CLAUDE_PLUGIN_ROOT}/skills/_shared/tone.md`.

---

## Step 1 — Read the workspace

Detect the layout, then read silently — no commentary while reading:

- `CONTEXT.md`
- `USER.md` — tech level, tools, backup setting, model preference
- `MEMORY.md` — status, priorities, stakeholders, risks
- `DECISIONS.md` — recent entries and review dates
- `PLAN.md` — if it exists
- The two most recent `memory/YYYY-MM-DD.md` logs

If no workspace exists, say so in one line and point at `/pm-groundwork:setup`. Stop there.

## Step 2 — Read what actually changed

Memory files record what someone wrote down. Git records what actually happened. Check both.

```bash
git log --oneline -15
git diff --stat HEAD~1
git status --short
```

Any of these can fail legitimately — `HEAD~1` on a repo with one commit, `@{u}` when no upstream is set. If one fails, skip it silently and use what worked. Never report a git error as a project problem.

If a remote is configured (see `USER.md`):

```bash
git fetch --quiet
git log --oneline @{u}..HEAD
git log --oneline HEAD..@{u}
```

Report anything committed elsewhere and not pulled, and anything local that was never pushed.

If there's no git repo, skip silently. If backup is local-only and the last session log is several days old with no commits, mention once that nothing is backed up off this machine.

## Step 3 — Decisions due

Flag every Active decision whose review date is on or before today:

> Decision #007 is due for review (review date: 2026-08-15)

## Step 4 — Brief

One block. Short lines. No preamble.

```
[PROJECT NAME] — [status]

Where we left off
  [Two lines from the last daily log and recent commits.]

Plan
  Phase [N] of [M] — [name] · [X] of [Y] done
  Next up: [first unchecked item]

Blocked
  [item] — [reason], [N] days

Decisions due
  [#ID — title, review date]

Risks
  [Top open risk, one line]
```

Drop any section with nothing in it. No "Plan" section if there's no `PLAN.md` — instead, one line: *No delivery plan yet — `/pm-groundwork:pm-project-start` builds one.*

## Step 5 — Pick the focus

Ask one question:

> What do you want to work on?

Options built from what you just read — the next unchecked plan item, a blocked item that needs a nudge, a decision due for review, drafting a document, or something else. Then hand off: continue the work, or invoke `pm-draft` or `pm-project-start` as appropriate.

---

## Guardrails

- Read-only. No writes, no commits, no daily-log entry. `checkpoint` and `end-session` do the writing.
- Don't dump file contents back at the user. They wrote them.
- If something is stale — a plan untouched for weeks, a risk with no owner — say it once, plainly.
- Keep the whole briefing under roughly twenty lines. It's an orientation, not a report.
