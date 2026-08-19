# PM Groundwork

**Your AI assistant forgets your project every time you close it. PM Groundwork gives it a memory that persists.**

PM Groundwork is a starter kit for project and product managers using AI tools. It sets up a small set of plain markdown files holding your project's memory: status, stakeholders, decisions and why you made them, risks, and a delivery plan. Every session then starts with your assistant already knowing where things stand. From there it helps you run the actual work, whether that's documentation, a prototype, or a full delivery plan.

You don't need to write code to use it, or know what a terminal is.

---

## The problem it solves

You explain your project to an AI assistant, have a good session, and close it.

Next time, it knows nothing. Who the stakeholders are, what you decided last week and why, what's blocked. So you explain it again, and the assistant confidently suggests something you already ruled out for a reason it never learned.

PM Groundwork writes that context to files your assistant reads at the start of every session and updates at the end. That happens automatically in Claude Code, Desktop, and Cowork. In Cursor, Codex, and Gemini CLI you start a session by running the start-session prompt. The files are yours, in plain markdown, in your project folder. Nothing is locked in a service you can't leave.

---

## Who it's for

- Program, product, and project managers who want AI help without becoming developers
- Anyone inheriting a messy project who needs the context written down somewhere
- PMs who make decisions that need to stay explained six months later

Not for you if you want an issue tracker or a Jira replacement. This is context and documents, not ticket management.

---

## Where it runs

| Where | Skills | Documents & memory | GitHub backup |
|---|---|---|---|
| **Claude Code** | Yes | Yes | Yes |
| **Claude Desktop** | Yes | Yes | Not available |
| **Claude Cowork** | Yes | Yes | Not available |
| **Cursor, Codex CLI, Gemini CLI** | Through the MCP server | Yes | Yes |

GitHub backup has to run on your own machine with your own credentials, which Cowork and Claude Desktop don't allow, because they run in an isolated environment. Everything else works everywhere. Setup checks whether it can actually reach your GitHub account before offering backup, so you're not configured for something that fails later.

---

## Install

### Claude Code, Claude Desktop, or Claude Cowork

Two commands, typed into the assistant:

```
/plugin marketplace add zoiestar/pm-groundwork
/plugin install pm-groundwork
```

The first tells your assistant where to find PM Groundwork. The second installs it. No cloning, no copying files.

**Installed once, used per project.** The skills install for *you*, so they're available in every project you open, and you only do this once. The workspace files work the other way round. They live in one project folder and describe only that project. Run `setup` separately in each project you want PM Groundwork to remember. It confirms the folder before writing anything, so you can't scatter a workspace somewhere by accident.

### Cursor, Codex CLI, or Gemini CLI

These connect through an MCP server, a small program that gives your AI tool extra abilities. One command, typed into your terminal, in your project folder:

```bash
npx pm-groundwork-mcp init
```

`npx` runs a program without permanently installing it. `init` detects which AI tools you have and writes the configuration for them. Restart your tool afterward.

**How to use it once installed.** These tools don't have slash commands, so you reach PM Groundwork through *prompts*. Cursor lists them in the chat input's `/` menu, Codex and Gemini CLI expose them as MCP prompts you select by name. Start with `pm-setup`. If you can't find the menu, asking "run the pm-setup prompt" in plain language usually works too.

In Claude Code, Desktop, and Cowork your project context loads on its own. In these tools it loads when you run `pm-start-session`, so make that your first step each day.

<details>
<summary>Manual configuration, if you'd rather do it yourself</summary>

**Cursor** — `.cursor/mcp.json`
```json
{ "mcpServers": { "pm-groundwork": { "command": "npx", "args": ["-y", "pm-groundwork-mcp"] } } }
```

**Gemini CLI** — `.gemini/settings.json`
```json
{ "mcpServers": { "pm-groundwork": { "command": "npx", "args": ["-y", "pm-groundwork-mcp"] } } }
```

**Codex CLI** — `~/.codex/config.toml`
```toml
[mcp_servers.pm-groundwork]
command = "npx"
args = ["-y", "pm-groundwork-mcp"]
```
</details>

---

## How it works — two parts

### Part 1: set up the workspace

```
/pm-groundwork:setup
```

**Before it touches anything**, it shows you every file it wants to create, flags which ones already exist, and waits for you to say yes. Say no and nothing happens.

Then it interviews you, with about ten questions covering what the project is, your role, who the stakeholders are, what tools you use, and what you want help with. It also asks whether to back up to GitHub (and can create the repository for you), and which AI models to use for which kind of work, so you're not paying for the most expensive model to append a line to a log.

It writes your workspace and stops. Planning your project is part two.

### Part 2: run the project

```
/pm-groundwork:pm-project-start
```

Pick a track:

| Track | What you get |
|---|---|
| **Documentation only** | Plans, requirements, and reports. No code. |
| **Documentation and a prototype** | The documents, plus a plan for a prototype your assistant then helps you build. |
| **Full delivery** | All of the above, plus a plan through build, launch, and retrospective. |

Documents are drafted for you. Prototypes and build work happen as normal working sessions with your assistant, with the plan tracking them and you confirming when each is genuinely done.

It asks only the questions that track needs, proposes a delivery plan and a set of documents, lets you edit both, then writes `PLAN.md` and drafts the documents one at a time.

### Then, every day

```
/pm-groundwork:start-session     Where did we leave off?
   ... do the work ...
/pm-groundwork:checkpoint        Save progress. Run it as often as you like.
/pm-groundwork:end-session       Wrap up, back up, summarize.
```

`start-session` reads your memory files *and* what actually changed in git since last time, so the briefing reflects reality rather than only what someone wrote down.

`checkpoint` is a small safe save. It updates the plan and the log, and never commits. Your assistant will also offer one when the conversation is getting long or a real decision just got made.

`end-session` does the full sweep, scans for accidentally exposed passwords or keys before committing, and pushes.

---

## The skills

| Skill | What it does |
|---|---|
| `setup` | Builds the workspace. Asks permission first. |
| `pm-project-start` | Picks a track, builds the delivery plan, produces the documents. |
| `start-session` | Briefs you on status, blockers, decisions due, and what changed in git. |
| `checkpoint` | Mid-session save. No commit. |
| `end-session` | Daily log, plan update, memory, secret scan, commit, push. |
| `pm-draft` | Drafts any of 14 document types. |
| `no-ai-slop` | Checks generated documents for writing that reads as machine-written. |

If you already have a skill named `end-session` or `no-ai-slop`, use the full name, `/pm-groundwork:end-session`, to be unambiguous.

---

## Documents it can draft

**Product** — Product Roadmap · PRD · Product Strategy & Vision · Competitive Analysis · User Stories & Journey Maps

**Project** — Project Charter · Scope Management Plan · Work Breakdown Structure · Risk Management Plan · Project Schedule · Communication Plan · Lessons Learned · Status Report · Stakeholder Register

Plus anything else you describe.

Every document is pre-filled from what your workspace already knows, so a status report doesn't ask you to retype your stakeholders. Nothing is invented. If a section needs information nobody supplied, it's marked as needing input rather than filled with plausible-sounding fiction. Every draft is then checked for AI-writing patterns before it's called finished.

---

## What gets created

```
your-project/
├── CLAUDE.md          short pointer to everything else
├── CONTEXT.md         what this project is, right now
├── USER.md            you, and how you like to work
├── PLAN.md            the delivery plan — phases, deliverables, blockers
├── .claude/
│   ├── agents/pm-lead/AGENT.md          your PM assistant
│   ├── agent-memory/pm-lead/
│   │   ├── MEMORY.md                    status, priorities, stakeholders, risks
│   │   └── DECISIONS.md                 what you decided and why
│   ├── rules/                           how it talks to you and behaves
│   └── settings.json                    what the assistant is allowed to do
├── memory/            a log per working day
└── docs/              the documents you create
```

All plain markdown. Open them in any editor, edit them by hand, or delete the whole thing. Nothing breaks.

`PLAN.md` and `docs/` are committed to git so your team can see them. Your memory files and personal notes are gitignored by default. Note that `PLAN.md` records blockers by name ("waiting on Priya"), which matters if the repository is shared widely.

---

## Upgrading from an older version

Run `setup` in your existing project. It detects what you have and offers to migrate.

**Files you wrote yourself are never overwritten silently.** If `CONTEXT.md`, `CLAUDE.md`, or anything else already exists, setup asks per file whether to keep it as is, add to it, or replace it, and shows you what's there before replacing anything.

Migration copies and never moves. Your original files stay exactly where they are until you delete them yourself, and the memory and decision files are verified byte-for-byte identical before it reports success.

If you have a `.planning/` folder from the GSD framework that older versions integrated with, it's left alone. Version 3 no longer uses it, but GSD still works independently if you want it. You'll be offered a one-time import of its roadmap into `PLAN.md`.

If you installed an older version by copying files into `.claude/commands/`, delete those. They still work, and they still reference things that no longer exist.

---

## FAQ

**Do I need to know how to code?**
No. If you can answer questions about your own project, you can use this.

**Where does my data go?**
Nowhere. Everything is files in your project folder. If you turn on GitHub backup, it goes to your repository. There is no PM Groundwork service.

**Can I edit the files by hand?**
Yes. They're markdown. Your assistant reads whatever is there.

**What if I don't want GitHub?**
Setup will say plainly what you're giving up, meaning no off-machine backup and no version history, then let you decline.

**Does model routing control my costs?**
It sets sensible defaults and suggests switching models when it matters. It cannot force a model or cap your spending. Anyone telling you a config file controls your AI bill is overselling.

**Something's wrong.**
Open an issue at [github.com/zoiestar/pm-groundwork/issues](https://github.com/zoiestar/pm-groundwork/issues).

---

## Credits

**[no-ai-slop](https://github.com/petergyang/no-ai-slop)** by Peter Yang, MIT licensed, is bundled as the writing-quality gate. See `skills/no-ai-slop/ATTRIBUTION.md`.

Versions 1 and 2 integrated with **GSD (Get Shit Done)** by Lex Christopherson ([@glittercowboy](https://github.com/glittercowboy)) for planning. Version 3 replaced that with its own lightweight `PLAN.md`. GSD is good software and worth a look if you want deeper planning structure.

Built on Anthropic's [Model Context Protocol](https://modelcontextprotocol.io).

---

## Contributing

Issues and pull requests welcome. **Workflow instructions live only in `skills/`.** The MCP prompts are generated from those files by `npm run build`, and `npm run check:parity` fails the build if they drift. Never hand-edit anything in `src/generated/`.

```bash
cd pm-groundwork-mcp
npm install
npm test          # builds, then runs 20 protocol conformance checks
```

## License

MIT. Use it, fork it, build on it.

---

*Built by [Jackie Romero](https://github.com/zoiestar) — a senior technical program manager, not a developer. Every line of this was built by directing Claude Code in plain English, which is also the argument for the tool itself.*
