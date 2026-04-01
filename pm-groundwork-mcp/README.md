# pm-groundwork-mcp

MCP server for PM Groundwork — cross-tool PM workspace management for Claude Code, Codex CLI, Cursor, and Gemini CLI.

## Quick start

```bash
cd your-project
npx pm-groundwork-mcp init
```

This detects your installed AI tools and writes the MCP config automatically.

Then start your AI tool and run the `pm-setup` prompt to initialize your PM workspace.

## Manual configuration

If `init` doesn't detect your tool, add the MCP server config manually:

**Claude Code** (`.claude/settings.local.json`):
```json
{ "mcpServers": { "pm-groundwork": { "command": "npx", "args": ["-y", "pm-groundwork-mcp"] } } }
```

**Cursor** (`.cursor/mcp.json`):
```json
{ "mcpServers": { "pm-groundwork": { "command": "npx", "args": ["-y", "pm-groundwork-mcp"] } } }
```

**Gemini CLI** (`.gemini/settings.json`):
```json
{ "mcpServers": { "pm-groundwork": { "command": "npx", "args": ["-y", "pm-groundwork-mcp"] } } }
```

**Codex CLI** (`~/.codex/config.toml`):
```toml
[mcp_servers.pm-groundwork]
command = "npx"
args = ["-y", "pm-groundwork-mcp"]
```

## What it provides

- **8 tools** — workspace file I/O, decision logging, daily session logs, project scanning
- **5 resources** — read-only access to workspace context, memory, decisions, user profile, status
- **4 prompts** — `pm-setup`, `pm-start-session`, `pm-end-session`, `pm-draft`

The server adapts question formatting based on which AI tool connects — interactive buttons for Claude Code, numbered lists for everything else.

## Documentation

Full docs in the project README.

## License

MIT
