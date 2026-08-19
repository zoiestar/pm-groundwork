# pm-groundwork-mcp

The MCP server for [PM Groundwork](https://github.com/zoiestar/pm-groundwork), a starter kit that gives project and product managers an AI assistant that remembers their project between sessions.

This package is for **Cursor, Codex CLI, and Gemini CLI**. If you use Claude Code, Claude Desktop, or Claude Cowork, install the plugin instead — you don't need this package.

**Claude Code:**
```
/plugin marketplace add zoiestar/pm-groundwork
/plugin install pm-groundwork
```

**Claude Desktop or Cowork:** Customize → Plugins → Personal plugins → + → Add marketplace → Add from a repository → `https://github.com/zoiestar/pm-groundwork`. In Cowork, open the Cowork tab first.

## Quick start

In your project folder:

```bash
npx pm-groundwork-mcp init
```

This detects which AI tools you have installed and writes their configuration. Restart your tool afterward, then run the `pm-setup` prompt.

## Manual configuration

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

## What you get

**21 prompts**, generated from the same source as the Claude Code skills so behavior matches across tools:

| Prompt | What it does |
|---|---|
| `pm-setup` | Builds the workspace. Shows what it will create and waits for your yes. |
| `pm-project-start` | Pick documentation, prototype, or full delivery. Builds the plan and the document set. |
| `pm-start-session` | Briefs you on status, blockers, decisions due, and what changed in git. |
| `pm-checkpoint` | Mid-session save. No commit. |
| `pm-end-session` | Daily log, plan update, memory, secret scan, commit, push. |
| `pm-draft` | Choose from 14 document types. |
| `pm-draft-prd`, `pm-draft-project-charter`, and 13 more | Skip the chooser and draft one type directly. |

**8 tools** for reading and writing the workspace: `pm_read_workspace`, `pm_write_workspace_file`, `pm_update_workspace_file`, `pm_log_decision`, `pm_write_daily_log`, `pm_scan_workspace`, `pm_scan_project_files`, `pm_check_decisions_due`.

**5 resources**: `pm://workspace/context`, `memory`, `decisions`, `user`, and a computed `status`.

## Notes

**Workspace layout is detected automatically.** Projects set up by v1, v2, or v3 of PM Groundwork all work; files are read from wherever they actually are and written back to the same place.

**Questions adapt to your client.** Tools without a structured question interface get numbered lists and an instruction to wait for your answer.

**Where your data goes: nowhere.** Everything is plain markdown files in your project folder. There is no service behind this.

## Development

```bash
npm install
npm test     # builds, then runs 20 protocol conformance checks
```

Prompts are generated from the `skills/` directory at the repository root. Never edit `src/generated/` — `npm run check:parity` fails the build when generated prompts drift from their source.

Full documentation: [github.com/zoiestar/pm-groundwork](https://github.com/zoiestar/pm-groundwork)

## License

MIT
