# Groundwork

**A Claude Code starter kit for program, project, and product managers.**

Groundwork gives Claude persistent memory, structured decision logging,
and a guided setup interview — so every session starts with full context
and ends with nothing lost.

Built for PMs who use Claude Code (in terminal or Cursor) and want an agent
that actually knows their project, remembers their stakeholders, tracks their
decisions, and gets smarter over time.

---

## What problem does this solve?

Claude Code has no memory between sessions by default. Every time you
start a new chat, you're starting from zero — re-explaining the project,
the stakeholders, the decisions already made, the things that matter.

Groundwork fixes that. Run `/pm-setup` once when you start a project.
From then on, Claude reads your workspace files at the start of every
session and picks up exactly where you left off.

It also gives you a decision log that captures *why* decisions were made,
not just *what* was decided — which is the thing that actually matters
six months later when someone asks "why did we do it this way?"

---

## Who this is for

- Program managers running cross-functional initiatives
- Product managers managing launches or roadmaps
- Project managers delivering client or internal work
- Operations leads managing process or tooling changes

You don't need to be a developer. Groundwork will ask about your
technical comfort level during setup and calibrate everything accordingly.

---

## Getting started

Three things to install, in order. Each one builds on the last.

---

### Step 1 — Install Claude Code

Claude Code is the AI coding agent that runs in your terminal (or inside
Cursor). Groundwork is built on top of it.

**macOS / Linux:**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://claude.ai/install.ps1 | iex
```

You'll need a Claude.ai account — Pro plan or higher is recommended.

Verify it's working:
```bash
claude --version
```

If you're using Cursor, Claude Code runs from the integrated terminal.
Open a terminal inside Cursor and the `claude` command works the same way.

> **New to Claude Code?** It's a command-line AI assistant that can read
> your files, run commands, and help you work. Think of it as a teammate
> in your terminal. You type instructions in plain English and it does the
> work. [Learn more](https://docs.anthropic.com/en/docs/claude-code)

---

### Step 2 — Install the GSD framework

GSD (Get Shit Done) is a structured planning and execution framework for
Claude Code. It powers all the `/gsd:*` commands that Groundwork uses for
project planning, phase execution, and progress tracking.

```bash
npx get-shit-done-cc@latest
```

This installs once per machine and works globally across all projects.
You don't need to run this inside any specific folder.

Verify it's working — start Claude Code and type `/gsd:help`. You should
see a list of available GSD commands.

> **What does GSD actually do?** It gives Claude a structured workflow:
> break work into milestones and phases, plan before executing, verify
> when done. Without GSD, Claude just does whatever you ask with no
> structure. With GSD, it plans, tracks, and validates. Groundwork
> connects your PM context (stakeholders, decisions, priorities) into
> that workflow.

---

### Step 3 — Install Groundwork

Now install the PM commands themselves. You have two options depending on
whether you want Groundwork available in one project or everywhere.

**Option A — Per-project install (recommended)**

Navigate to your project folder and clone:
```bash
cd /path/to/your/project
git clone https://github.com/zoiestar/pm-groundwork .pm-groundwork
```

Then register the commands with Claude Code. Open or create
`.claude/settings.json` in your project root and add:
```json
{
  "customSlashCommands": [
    { "name": "pm-setup", "file": ".pm-groundwork/commands/pm-setup.md" },
    { "name": "pm-end-session", "file": ".pm-groundwork/commands/pm-end-session.md" }
  ]
}
```

**Option B — Global install (all projects)**

Clone once to a central location:
```bash
git clone https://github.com/zoiestar/pm-groundwork ~/pm-groundwork
```

Then add to your global Claude Code settings at `~/.claude/settings.json`:
```json
{
  "customSlashCommands": [
    { "name": "pm-setup", "file": "~/pm-groundwork/commands/pm-setup.md" },
    { "name": "pm-end-session", "file": "~/pm-groundwork/commands/pm-end-session.md" }
  ]
}
```

**Verify:** Start Claude Code and type `/pm-` — both commands should
appear in autocomplete.

> **Git is optional.** You don't need a git repo for your project.
> Groundwork will ask during setup. If you say no, session backups write
> to local files only. You can add a repo later.

---

### Step 4 — Run setup

Navigate to your project folder and start Claude Code:
```bash
cd /path/to/your/project
claude
```

Then run the setup interview:
```
/pm-setup
```

This walks you through an interactive interview — one question at a time
with selectable options, not a wall of text. Takes about 5 minutes.

At the end, it creates your full workspace and offers to initialize GSD
(`/gsd:new-project`) using the context you already provided — no
repeating yourself.

### Step 5 — End every session

When you're done working, always run:
```
/pm-end-session
```

This updates your daily log, syncs GSD state, logs any decisions, and
backs up to git if configured. That's the entire workflow.

---

## What gets created

All files are automatically gitignored — private context for your Claude
session, not files meant to be committed.

| File | What it does |
|------|-------------|
| `CLAUDE.md` | Auto-loaded entrypoint — session protocol, GSD command routing, file reading order |
| `AGENTS.md` | Claude's behavior rules — what to read, when, and how to act |
| `USER.md` | Your context, role, tools, and working preferences |
| `MEMORY.md` | Persistent project knowledge — stakeholders, priorities, risks, decisions summary |
| `DECISIONS.md` | Full decision log with rationale, alternatives, and review dates |
| `CONTEXT.md` | Quick orientation summary Claude reads at the start of every session |
| `IDENTITY.md` | Claude's role and mission on this specific project |
| `SOUL.md` | Claude's communication style, calibrated to your project type |
| `HEARTBEAT.md` | Session maintenance routine |
| `memory/` | Daily session logs — one file per day, auto-created |
| `.planning/` | GSD planning artifacts — roadmap, state, phase plans |

### Optional MEMORY.md sections

| Section | Activated when |
|---------|---------------|
| `[CLIENT]` Client context | Client-facing deliverable |
| `[LAUNCH]` Launch tracker | Product launch / go-to-market |
| `[PROGRAM]` Dependencies map | Cross-functional program |
| `[OPS]` Process/tooling context | Internal ops or tooling project |

---

## The daily workflow
```
Start session
  → Claude auto-reads CLAUDE.md, which loads all workspace files
  → Claude flags any decisions due for review

Do your work
  → Claude logs decisions to DECISIONS.md as they happen
  → Claude updates risks and priorities in MEMORY.md
  → Claude suggests the right GSD command for structured work

End session → /pm-end-session
  → Daily log created in memory/
  → GSD state updated
  → MEMORY.md and CONTEXT.md synced
  → Git backup (if repo configured)
```

---

## GSD commands

After setup, these commands are available for structured work. Claude will
suggest the right one based on what you're doing — you don't need to
memorize them.

| Command | What it does |
|---------|-------------|
| `/gsd:new-project` | Initialize the planning framework (run once during setup) |
| `/gsd:new-milestone` | Start a new milestone cycle with updated goals |
| `/gsd:discuss-phase` | Gather context before planning a phase of work |
| `/gsd:plan-phase` | Create a detailed execution plan |
| `/gsd:execute-phase` | Execute a planned phase |
| `/gsd:verify-work` | Validate deliverables against success criteria |
| `/gsd:quick` | Structured but fast — for tasks that need tracking but not full planning |
| `/gsd:fast` | Inline execution — no subagents, no overhead |
| `/gsd:progress` | See where things stand |
| `/gsd:next` | Advance to the next logical step |
| `/gsd:resume-work` | Pick up after a break with full context restoration |
| `/gsd:debug` | Systematic debugging with persistent state |
| `/gsd:note` | Capture an idea quickly |
| `/gsd:add-backlog` | Park an idea for later |
| `/gsd:stats` | Project metrics and timeline |

For the full list: `/gsd:help`

---

## FAQ

**What if I run /pm-setup on a project that already has files?**
Groundwork will scan for existing files and offer to read them. If you
say yes, it pre-fills interview answers from what it finds — you just
confirm or change each one instead of typing from scratch.

**Do I have to use GSD for everything?**
No. GSD powers structured work (milestones, phases, execution plans),
but you don't have to use the full workflow for every task. `/gsd:quick`
and `/gsd:fast` handle ad-hoc work without the full planning loop.
Claude will suggest the right command based on what you're doing.

**Will my workspace files be committed to git?**
No. `/pm-setup` adds all workspace files to `.gitignore` automatically.

**Can multiple people on the same team use this?**
Yes, but each person runs their own `/pm-setup` in their own local
environment. Workspace files are per-person, not shared.

**How do I update Groundwork?**
```bash
cd .pm-groundwork   # or wherever you cloned it
git pull
```

**Something broke. What do I do?**
Open an issue at github.com/zoiestar/pm-groundwork/issues with the
command you ran, the error you got, your Claude Code version
(`claude --version`), and your OS.

---

## Contributing

Most useful additions:
- New optional MEMORY.md sections for project types not covered
- Improvements to the `/pm-setup` interview flow based on real use
- Additional FAQ entries from issues
- Translations of the README

**To contribute:**
1. Fork the repo
2. Create a branch: `git checkout -b your-feature-name`
3. Make your changes
4. Open a pull request with a clear description

For significant changes, open an issue first.

**Code of conduct:** Be direct, be kind, assume good intent.

---

## License

MIT — use it, fork it, build on it.

---

*Built by [Jackie Romero](https://github.com/zoiestar) —
sr. program manager and AI-powered PM tooling nerd.*