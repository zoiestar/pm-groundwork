# Backup — where the work is saved

Read by `setup` (to configure), `start-session` (to report), and `end-session` (to commit and push).

## Step 1 — Check the surface before offering anything

GitHub backup works in **Claude Code** and in **MCP clients** (Cursor, Codex CLI, Gemini CLI), where commands run on the user's own machine against their own credentials.

It does **not** work in **Claude Cowork** or **Claude Desktop**, where the agent runs in an isolated environment without access to the user's GitHub account.

There is no official way to ask which surface you are on, so infer it and **fail closed** — if you cannot confirm you are in Claude Code or an MCP client, treat backup as unavailable:

```bash
git --version
git rev-parse --is-inside-work-tree
```

If Bash is unavailable or git is missing, backup is unavailable — stop here.

These commands succeed inside Cowork's sandbox too, so they are not sufficient on their own. **The real gate is step 2's `gh auth status`**: an environment that cannot reach the user's own GitHub account cannot back anything up, whatever else it can run. If `gh auth status` fails and the user believes they are authenticated, treat the surface as backup-unavailable rather than walking them through a fix that cannot work there.

When backup is unavailable, say this once and move on — no question, no failing command:

> GitHub backup isn't available in Cowork or Claude Desktop right now. Your workspace files are still created and updated normally, but you'll need to save or sync them yourself.

Record the result in `USER.md` under **Version control** so the session skills don't re-check every time.

## Step 2 — Verify GitHub access before configuring it

Only when backup is available. Check before asking the user to commit to anything:

```bash
gh --version
gh auth status
```

If `gh` is missing or not authenticated, say exactly which one failed and what to do about it, then continue setup with backup unconfigured. Never leave the user with a repo setting that fails at their first `end-session`.

## Step 3 — Ask

| Answer | What to do |
|---|---|
| **I have a repo** | Take the URL. Run `git remote -v`; if it matches, done. If there's no remote, `git remote add origin <url>`. If a different remote exists, ask before changing it. |
| **Create one for me** | Confirm the name and public vs private — **default to private**, and say why. Then `gh repo create <name> --private --source=. --remote=origin`. Follow with an initial commit only after the secret scan in `safety.md` passes. |
| **No GitHub** | Show the local-only disclaimer below and require an acknowledgment. |

### Local-only disclaimer

> Everything PM Groundwork creates — your project memory, decision log, and documents — will live only in this folder on this machine. If the disk fails, the folder is deleted, or the laptop is replaced, the entire project history is gone. There's no version history to recover from either: you won't be able to see what changed or go back to an earlier version.
>
> You can add GitHub later by running setup again.

Require an explicit acknowledgment before continuing.

## Step 4 — What the session skills do with this

**`start-session`** — if a remote is configured, `git fetch` and report anything pushed from elsewhere and anything local that was never pushed. If local-only, stay quiet unless several sessions have passed without a backup, then mention it once.

**`end-session`** — run the secret scan from `safety.md`, show the result and a one-line diff summary, confirm once, then stage.

Staging has to do two things at once: pick up new documents, and never sweep in something unexpected. So stage tracked changes and new files **by explicit path**, never with a wildcard:

```bash
git add -u                      # tracked files that changed
git status --porcelain          # find untracked files
```

From the untracked list, offer only the paths that belong in the repo — `PLAN.md`, anything under `docs/`, and anything the user explicitly names. Show them and let the user drop any:

```bash
git add PLAN.md docs/prd-partner-portal-2026-08-19.md
git commit -m "chore: session backup YYYY-MM-DD"
git push origin $(git branch --show-current)
```

**Never `git add -A` or `git add .`.** `git add -u` alone is also wrong — it silently misses every new document, which is the work the user most wants backed up. Untracked files that are not `PLAN.md` or under `docs/` get listed for the user rather than staged; if something belongs in the repo and isn't being picked up, that's a `.gitignore` question, not a reason to widen the staging command.

If there's no remote, commit locally and note in the summary that nothing is backed up off this machine. If the scan finds something, the commit does not happen.
