---
name: checkpoint
description: Save progress mid-session in a PM workspace — ticks items on the delivery plan, logs a decision, and appends to today's log. No commit, no wrap-up. Use when the user asks to checkpoint or save progress, and offer it when the context window is filling or something worth remembering just happened.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
model: haiku
---

# Checkpoint

A small, safe save. Run it as often as you like — five times a day is fine.

Read first: `${CLAUDE_PLUGIN_ROOT}/skills/_shared/layout.md`, `plan-format.md`, `decision-format.md`, `tone.md`.

---

## Two ways this starts

**The user asked.** Proceed directly to step 1.

**You are offering it.** Offer when the context window is getting long, when a real decision just got made, or when something surfaced that belongs in memory. Ask in one line and wait:

> Worth checkpointing this? I'd log [the specific thing] and update the plan.

Yes or no. If no, drop it and don't ask again about the same thing. **Never write unprompted.**

---

## Step 1 — What changed

Look at the conversation since the last checkpoint or session start. Identify:

- Plan items that got finished
- Items that became blocked, or unblocked
- New work that surfaced and isn't on the plan
- Decisions made
- Facts worth keeping — a stakeholder's position, a constraint, a date

If nothing meaningful changed, say so in one line and stop. An empty checkpoint is a valid outcome.

## Step 2 — Update PLAN.md

Following `plan-format.md`:

- Tick finished items and append the file path if one was produced
- Add `· blocked — <reason>, since <MM-DD>` to items that stalled; remove it when they clear
- Add newly discovered items to the current phase
- Bump `updated:` in the frontmatter

**Never advance `current_phase` here.** If the phase looks complete, say so and leave it — `end-session` handles the advance, and only after asking.

If there's no `PLAN.md`, skip this step silently.

## Step 3 — Log a decision

Only if a real decision was made — see the bar in `decision-format.md`. Write the full entry, then add the one-line row to the MEMORY.md decisions table.

If it's a tactical call rather than a decision with stakes, put it in the daily log instead.

## Step 4 — Append to the daily log

Get the real date and time — never guess them:

```bash
date +"%Y-%m-%d %H:%M"
```

Add to `memory/YYYY-MM-DD.md`, creating it if today's file doesn't exist yet:

```markdown
### Checkpoint — HH:MM
- [What happened, in the user's terms]
- [Decision logged: #ID, if any]
- [Blocked: item and why, if any]
```

Facts that matter beyond today go into MEMORY.md as well. Facts that only matter today stay in the log.

## Step 5 — Confirm

Three lines, maximum:

```
Checkpointed.
  Plan:      [what changed, or "no change"]
  Decision:  [#ID, or "none"]
  Log:       memory/YYYY-MM-DD.md
```

---

## Guardrails

- No git. No commit, no push, no staging — that's `end-session`.
- No phase advance.
- No summary card, no session recap.
- Never write without a yes when you were the one who proposed it.
