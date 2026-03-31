# PM Groundwork

**A Claude Code starter kit for program, project, and product managers.**

PM Groundwork gives Claude persistent memory, structured decision logging,
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

PM Groundwork fixes that. Run `/pm-setup` once when you start a project.
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

You don't need to be a developer. PM Groundwork will ask about your
technical comfort level during setup and calibrate everything accordingly.

---

## Getting started

Three things to install, in order. Each one builds on the last.

---

### Step 1 — Install Claude Code

Claude Code is the AI coding agent that runs in your terminal (or inside
Cursor). PM Groundwork is built on top of it.

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

[GSD (Get Shit Done)](https://github.com/gsd-build/get-shit-done) is a
structured planning and execution framework for Claude Code, created by
[Lex Christopherson](https://github.com/glittercowboy). It powers all
the `/gsd:*` commands that PM Groundwork uses for project planning, phase
execution, and progress tracking.

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
> structure. With GSD, it plans, tracks, and validates. PM Groundwork
> connects your PM context (stakeholders, decisions, priorities) into
> that workflow.

---

### Step 3 — Install PM Groundwork

Clone PM Groundwork into your project directory:

```bash
cd /path/to/your/project
git clone https://github.com/zoiestar/pm-groundwork .groundwork
```

Then copy the slash commands into your project so Claude Code can
discover them automatically:

```bash
mkdir -p .claude/commands
cp .groundwork/.claude/commands/*.md .claude/commands/
```

No settings file changes needed — Claude Code auto-discovers commands
in `.claude/commands/`.

**Verify:** Start Claude Code in your project directory and type `/pm-` —
all four commands should appear in autocomplete:
- `/pm-setup`
- `/pm-start-session`
- `/pm-end-session`
- `/pm-draft`

> **Git is optional.** You don't need a git repo for your project.
> PM Groundwork will ask during setup. If you say no, session backups write
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

### Step 5 — The daily workflow

From now on, every session follows this pattern:

**Start of session:**
```
/pm-start-session
```
Claude reads all your workspace files, checks GSD state, reviews recent
history, and gives you a structured briefing: what was done, what's next,
any risks or decisions due. Then it helps you pick what to work on.

**End of session:**
```
/pm-end-session
```
Claude updates your daily log, syncs GSD state, logs any decisions made,
and backs up to git if configured.

**Drafting a document:**
```
/pm-draft
```
Claude reads your workspace context, asks what type of document you need,
gathers targeted details, and generates a polished first draft. Supports
14 document types across product, project, and program management.

That's it — four commands total: setup once, start and end every session,
draft when you need a document.

---

## What gets created

All workspace files are local to your machine. `/pm-setup` will offer to
add them to `.gitignore` so they aren't committed to your repo.

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

## Documents you can draft

Run `/pm-draft` to generate any of these. Claude reads your workspace
context, asks targeted questions, and produces a personalized first draft
saved to `docs/` in your project.

**Product Management:**

| Document | What it covers |
|----------|---------------|
| Product Roadmap | Timeline of features, milestones, and strategic bets |
| PRD | Feature spec with user stories, requirements, and success metrics |
| Product Strategy / Vision | Where the product is going and why |
| Competitive Analysis | Landscape, positioning, and differentiation |
| User Stories / Journey Map | User perspectives, pain points, and workflows |

**Project Management:**

| Document | What it covers |
|----------|---------------|
| Project Charter | Authorization, scope, objectives, and stakeholders |
| Scope Management Plan | What's in, what's out, and how changes are handled |
| Work Breakdown Structure | Hierarchical decomposition of deliverables |
| Risk Management Plan | Risk identification, assessment, and mitigation |
| Project Schedule / Plan | Timeline, milestones, dependencies, and critical path |
| Communication Plan | Who gets what information, when, and how |
| Lessons Learned | What worked, what didn't, and what to carry forward |
| Project Status Report | Current state, progress, risks, and next steps |
| Stakeholder Register | Stakeholder identification, influence, and engagement |

You can also select "Something else" to draft a custom document type.

---

## The daily workflow
```
/pm-start-session
  → Reads all workspace files and GSD state
  → Briefing: progress, what's next, risks, decisions due
  → Helps you pick what to focus on

Do your work
  → Claude logs decisions to DECISIONS.md as they happen
  → Claude updates risks and priorities in MEMORY.md
  → Claude suggests the right GSD command for structured work
  → Run /pm-draft when you need a document (PRD, charter, status report, etc.)

/pm-end-session
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
PM Groundwork will scan for existing files and offer to read them. If you
say yes, it pre-fills interview answers from what it finds — you just
confirm or change each one instead of typing from scratch.

**Do I have to use GSD for everything?**
No. GSD powers structured work (milestones, phases, execution plans),
but you don't have to use the full workflow for every task. `/gsd:quick`
and `/gsd:fast` handle ad-hoc work without the full planning loop.
Claude will suggest the right command based on what you're doing.

**Will my workspace files be committed to git?**
Not by default. `/pm-setup` offers to add all workspace files to
`.gitignore` during the setup interview.

**Can multiple people on the same team use this?**
Yes, but each person runs their own `/pm-setup` in their own local
environment. Workspace files are per-person, not shared.

**How do I update PM Groundwork?**
```bash
cd .groundwork
git pull
cp .groundwork/.claude/commands/*.md .claude/commands/
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