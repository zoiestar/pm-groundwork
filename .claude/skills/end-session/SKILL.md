# End Session

End-of-session wrap-up for PM-Groundwork. Summarize work, update memory, commit and push. Use when finishing a working session.

## Step 0 — Gather Context

Run these commands to understand what happened this session:

```bash
git log --oneline --since="8 hours ago"
git status
git diff --stat
```

**Present a brief summary of detected changes to the user**, then ask:

> Any session notes to add? Decisions made, blockers hit, things to remember?

**Wait for the user's response before proceeding.** Their input shapes everything below.

---

## Step 1 — Claude Memory System

Update machine-local memory files at `~/.claude/projects/` for this project (find the correct path).

**If significant new context was learned** (command changes, MCP server updates, user feedback, architecture decisions), create or update memory files and update the local `MEMORY.md` index.

If nothing new to remember, skip: "No new memories to save."

---

## Step 2 — Security Scan + Git Backup

### Security Scan (MANDATORY before any commit)

```bash
git diff --cached --name-only | xargs grep -in "password\|secret\|token\|api.key\|bearer" 2>/dev/null || true
```

**If ANY credential matches are found:** Stop. Show the user. Do NOT commit until confirmed safe.

### Commit and Push

Stage changed files:

```bash
git add -A
git status  # Review what's staged before committing
git commit -m "End-of-session: [brief description of session work]

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push origin main
```

If nothing to commit: "All changes already committed and pushed."

---

## Wrap-Up

Print a brief summary:

```
--- Session wrapped up ---
Claude memory:   [updated/no new memories]
Git backup:      [committed + pushed / already up to date]
```

---

## Rules

1. **Always run security scan before committing.** No exceptions.
2. **Skip steps cleanly** when nothing changed — don't force updates.
3. **Ask the user before proceeding** if anything looks wrong or ambiguous.
