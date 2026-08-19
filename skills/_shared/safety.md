# Safety — disclaimers and secret scanning

## The setup disclaimer

`setup` shows this **before** it scans files, asks a question, or reads anything in the project. Nothing happens until the user explicitly agrees.

Show, in this order:

You may check whether paths **exist** — the disclaimer has to name them — but you may not open or read any file to build this list. Existence checks are not scanning.

1. The absolute path of the folder that will be modified.
2. Every file and directory setup may create (the list in `setup/SKILL.md`).
3. Which of those **already exist**, listed separately under a clear heading. Do **not** say they will be replaced — existing files get their own keep / add to / replace question, per file, in `setup/SKILL.md`.
4. A note that memory, decisions, and project documents are stored as plain files in this folder.

Then ask:

> Create and overwrite these files in `<absolute path>`?
>
> - **Yes, proceed** — create the workspace
> - **Show me what already exists first** — show a name-only listing of what's there, then ask this question again
> - **No, stop** — change nothing

Only an explicit yes continues to setup. **"No, stop" ends the skill** without writing, reading, or scanning — do not argue or re-ask. "Show me what already exists first" is not a refusal: list file and directory **names only** (never contents), then ask the same question again.

An ambiguous or missing answer is a no. A user saying "just do it" or "skip the list" is not consent — show the list and ask.

If existing PM Groundwork files are found, prefer the migration path in `layout.md` over overwriting — migration copies rather than replaces.

**Overwriting is never a default.** Any file that already exists gets an explicit per-file choice: keep it as is, add to it, or replace it. Replacing requires showing what's there first. This applies to files PM Groundwork didn't create — a hand-written `CONTEXT.md` or an existing `CLAUDE.md` from another tool is someone's work, not a slot to fill.

## Privacy note

`PLAN.md` is committed to git by default and its blocker notes name people ("blocked — waiting on Priya"). Say this once during setup and again when `pm-project-start` writes the first plan, so nobody is surprised when a repo gets shared.

## Secret scan — before any commit

Run this before every commit. A hit **blocks the commit**; it is not a warning.

```bash
git diff --cached --name-only
git diff --cached | grep -inE "password|passwd|secret|token|api[_-]?key|bearer |client[_-]?secret|private[_-]?key"
git diff --cached --name-only | grep -iE "\.env$|\.pem$|\.key$|\.p12$|id_rsa"
```

**A grep that finds nothing exits with status 1. That means clean, not failure** — do not report it as an error.

Also flag:

- Token prefixes: `sk-`, `sk-ant-`, `ghp_`, `gho_`, `sbp_`, `tskey-`, `xoxb-`
- Any random-looking string over 20 characters sitting next to an assignment
- Private IP addresses: `192.168.`, `10.`, `172.16.`–`172.31.`, and hostnames ending in `.ts.net`

On a hit: stop, name the file and line number, show the matching line, and ask the user what to do. Never commit "just this once." Never suggest `--no-verify` or force-adding the file.

## Irreversible actions

Confirm before: overwriting an existing file, `git push`, creating a remote repository, or deleting anything. Staging uses `git add -u` — never `git add -A` or `git add .`, so untracked files are never swept into a commit by accident.
