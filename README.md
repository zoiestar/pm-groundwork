# PM Groundwork

**A PM starter kit for AI coding tools — Claude Code, Cursor, Codex, and Gemini CLI.**

PM Groundwork gives your AI assistant persistent memory, structured decision
logging, and a guided setup interview — so every session starts with full
context and ends with nothing lost.

Built for PMs who use AI coding tools and want an agent that actually knows
their project, remembers their stakeholders, tracks their decisions, and
gets smarter over time.

---

## What problem does this solve?

AI coding tools have no memory between sessions by default. Every time you
start a new chat, you're starting from zero — re-explaining the project,
the stakeholders, the decisions already made, the things that matter.

PM Groundwork fixes that. Run the setup once when you start a project.
It asks about your project scope — documentation only, docs + prototype,
or docs + prototype + full build — and tailors everything to match.
From then on, your AI reads workspace files at the start of every session
and picks up exactly where you left off.

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

## Supported tools

| Tool | Installation method | Status |
|------|-------------------|--------|
| **Claude Code** (terminal) | Slash commands or MCP server | Full support |
| **Cursor** | MCP server | Full support |
| **Codex CLI** (OpenAI) | MCP server | Full support |
| **Gemini CLI** (Google) | MCP server | Full support |

---

## Getting started

Choose the installation path for your tool.

---

### Option A — Claude Code (slash commands)

This is the original installation method. It gives you `/pm-setup`,
`/pm-start-session`, `/pm-end-session`, and `/pm-draft` as slash commands.

#### Step 1 — Install Claude Code

**macOS / Linux:**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://claude.ai/install.ps1 | iex
```

You'll need a Claude.ai account — Pro plan or higher is recommended.

#### Step 2 — Install the GSD framework (optional)

[GSD (Get Shit Done)](https://github.com/gsd-build/get-shit-done) is a
structured planning and execution framework for Claude Code, created by
[Lex Christopherson](https://github.com/glittercowboy). It powers the
`/gsd:*` commands for project planning, phase execution, and progress tracking.

```bash
npx get-shit-done-cc@latest
```

GSD is optional — PM Groundwork works without it but offers deeper
planning capabilities when it's installed.

#### Step 3 — Install PM Groundwork

```bash
cd /path/to/your/project
git clone https://github.com/zoiestar/pm-groundwork .groundwork
mkdir -p .claude/commands
cp .groundwork/.claude/commands/*.md .claude/commands/
```

**Verify:** Start Claude Code and type `/pm-` — all four commands should
appear in autocomplete.

#### Step 4 — Run setup

```bash
cd /path/to/your/project
claude
```

Then type `/pm-setup` and follow the interactive interview. Setup will ask
about your project scope — docs only, docs + prototype, or full build — and
tailor every question, file, and GSD integration to match.

---

### Option B — MCP server (any tool)

The MCP server works with Claude Code, Cursor, Codex CLI, and Gemini CLI.
It exposes the same PM workflows as tools and prompts via the
[Model Context Protocol](https://modelcontextprotocol.io/).

#### Step 1 — Run the init command

Navigate to your project and run:

```bash
npx pm-groundwork-mcp init
```

This auto-detects which AI tools you have configured (`.claude/`, `.cursor/`,
`.gemini/`, `.codex/`) and writes the MCP server config for each one.

#### Step 2 — Manual config (if init doesn't detect your tool)

**Claude Code** — add to `.claude/settings.local.json`:
```json
{
  "mcpServers": {
    "pm-groundwork": {
      "command": "npx",
      "args": ["-y", "pm-groundwork-mcp"]
    }
  }
}
```

**Cursor** — add to `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "pm-groundwork": {
      "command": "npx",
      "args": ["-y", "pm-groundwork-mcp"]
    }
  }
}
```

**Gemini CLI** — add to `.gemini/settings.json`:
```json
{
  "mcpServers": {
    "pm-groundwork": {
      "command": "npx",
      "args": ["-y", "pm-groundwork-mcp"]
    }
  }
}
```

**Codex CLI** — add to `~/.codex/config.toml`:
```toml
[mcp_servers.pm-groundwork]
command = "npx"
args = ["-y", "pm-groundwork-mcp"]
```

#### Step 3 — Run setup

Start your AI tool and ask it to run the `pm-setup` prompt. The MCP server
provides the setup interview, workspace file management, and all PM workflows.

---

### After installation — the daily workflow

From now on, every session follows this pattern:

**Start of session:**
```
/pm-start-session
```
Your AI reads all workspace files, checks project state, reviews recent
history, and gives you a structured briefing: what was done, what's next,
any risks or decisions due. Then it helps you pick what to work on.

**End of session:**
```
/pm-end-session
```
Your AI updates your daily log, syncs project state, logs any decisions made,
and backs up to git if configured.

**Drafting a document:**
```
/pm-draft
```
Your AI reads your workspace context, asks what type of document you need,
gathers targeted details, and generates a polished first draft. Supports
14 document types across product, project, and program management.

That's it — four commands total: setup once, start and end every session,
draft when you need a document.

---

## What gets created

All workspace files are local to your machine. Setup will offer to add them
to `.gitignore` so they aren't committed to your repo.

| File | What it does |
|------|-------------|
| `CLAUDE.md` / `GEMINI.md` / `AGENTS.md` | Auto-loaded entrypoint (tool-specific) — session protocol, command routing, file reading order |
| `USER.md` | Your context, role, tools, and working preferences |
| `MEMORY.md` | Persistent project knowledge — stakeholders, priorities, risks, decisions summary |
| `DECISIONS.md` | Full decision log with rationale, alternatives, and review dates |
| `CONTEXT.md` | Quick orientation summary read at the start of every session |
| `IDENTITY.md` | AI agent's role and mission on this specific project |
| `SOUL.md` | Communication style, calibrated to your project type |
| `HEARTBEAT.md` | Session maintenance routine |
| `AGENTS.md` | Behavior rules — what to read, when, and how to act |
| `memory/` | Daily session logs — one file per day, auto-created |
| `.planning/` | GSD planning artifacts — roadmap, state, phase plans (if GSD installed) |

### Optional MEMORY.md sections

Activated based on project type and scope during setup:

| Section | Activated when |
|---------|---------------|
| `[PROTOTYPE]` Prototype context | Scope: docs + prototype, or full build |
| `[BUILD]` Build context | Scope: full build only |
| `[CLIENT]` Client context | Project type: client-facing deliverable |
| `[LAUNCH]` Launch tracker | Project type: product launch / go-to-market |
| `[PROGRAM]` Dependencies map | Project type: cross-functional program |
| `[OPS]` Process/tooling context | Project type: internal ops or tooling |

---

## MCP server details

The MCP server exposes these capabilities to any connected AI tool:

**Tools (8)** — workspace file operations the AI calls during workflows:

| Tool | What it does |
|------|-------------|
| `pm_read_workspace` | Read one or all workspace files |
| `pm_write_workspace_file` | Create or overwrite a workspace file |
| `pm_update_workspace_file` | Append to or replace a section within a file |
| `pm_log_decision` | Log a structured decision with auto ID sequencing |
| `pm_write_daily_log` | Create or append to a daily session log |
| `pm_scan_workspace` | Check which workspace files exist |
| `pm_scan_project_files` | Scan for existing project files (README, docs, specs) |
| `pm_check_decisions_due` | Find decisions with review date on or before today |

**Resources (5)** — read-only workspace state:

| Resource | What it provides |
|----------|-----------------|
| `pm://workspace/context` | Project orientation (CONTEXT.md) |
| `pm://workspace/memory` | Persistent project knowledge (MEMORY.md) |
| `pm://workspace/decisions` | Decision log (DECISIONS.md) |
| `pm://workspace/user` | User context and preferences (USER.md) |
| `pm://workspace/status` | Computed summary — files present, decisions due, latest log |

**Prompts (4)** — the PM workflows:

| Prompt | What it does |
|--------|-------------|
| `pm-setup` | Interactive workspace setup interview |
| `pm-start-session` | Session briefing — progress, risks, decisions due |
| `pm-end-session` | Session wrap-up — log, sync, backup |
| `pm-draft` | PM document drafter (14 document types) |

---

## Documents you can draft

Run `/pm-draft` (or the `pm-draft` MCP prompt) to generate any of these.
Your AI reads workspace context, asks targeted questions, and produces a
personalized first draft saved to `docs/` in your project.

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
/pm-start-session (or pm-start-session MCP prompt)
  → Reads all workspace files and project state
  → Briefing: progress, what's next, risks, decisions due
  → Helps you pick what to focus on

Do your work
  → AI logs decisions to DECISIONS.md as they happen
  → AI updates risks and priorities in MEMORY.md
  → AI suggests the right approach for structured work
  → Run /pm-draft when you need a document

/pm-end-session (or pm-end-session MCP prompt)
  → Daily log created in memory/
  → Project state updated
  → MEMORY.md and CONTEXT.md synced
  → Git backup (if repo configured)
```

---

## GSD commands (Claude Code only)

If you install the GSD framework, these commands are available for structured
work. Claude will suggest the right one based on what you're doing.

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

**What if I run setup on a project that already has files?**
PM Groundwork will scan for existing files and offer to read them. If you
say yes, it pre-fills interview answers from what it finds — you just
confirm or change each one instead of typing from scratch.

**Do I have to use GSD for everything?**
No. GSD is optional and only available in Claude Code. If you pick "docs only"
during setup, GSD is skipped entirely. For "docs + prototype" it's offered
with lighter defaults. For "full build" it's fully initialized. PM Groundwork
works fine without GSD regardless of scope.

**What's the difference between the three project scopes?**
- **Documentation only** — PM docs, decision tracking, stakeholder management. No code, no GSD.
- **Documentation + prototype** — Everything above, plus prototype planning with tech stack, success criteria, and timeline tracking. GSD is offered for prototype phase management.
- **Documentation + prototype + full build** — Full end-to-end: docs, prototype, team coordination, release planning, milestone tracking. Full GSD initialization with all features.

**Will my workspace files be committed to git?**
Not by default. Setup offers to add all workspace files to `.gitignore`
during the interview.

**Can multiple people on the same team use this?**
Yes, but each person runs their own setup in their own local environment.
Workspace files are per-person, not shared.

**What's the difference between the slash commands and the MCP server?**
Same workflows, different delivery. The slash commands work in Claude Code
only and use Claude Code's interactive buttons for questions. The MCP server
works in any tool that supports MCP and presents questions as numbered lists.
You only need one — pick whichever matches your tool.

**How do I update?**

Slash commands:
```bash
cd .groundwork && git pull
cp .groundwork/.claude/commands/*.md .claude/commands/
```

MCP server:
```bash
npx pm-groundwork-mcp@latest init
```

**Something broke. What do I do?**
Open an issue at github.com/zoiestar/pm-groundwork/issues with the
command you ran, the error you got, your tool and version, and your OS.

---

## Contributing

Most useful additions:
- New optional MEMORY.md sections for project types not covered
- Improvements to the setup interview flow based on real use
- Additional FAQ entries from issues
- Bug reports with reproduction steps

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
