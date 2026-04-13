# PM Groundwork v2.0 — Claude Code Native Architecture Update

## Context

PM Groundwork is Jackie's Claude Code plugin + MCP server that provides persistent memory, decision logging, session management, and document generation for PMs using AI tools. It currently generates flat workspace files at the project root (IDENTITY.md, SOUL.md, HEARTBEAT.md, AGENTS.md, MEMORY.md, DECISIONS.md, CONTEXT.md, USER.md, CLAUDE.md).

Jackie just built a **two-layer Claude Code architecture** across her setup:
- **Global layer** (`~/.claude/`): CLAUDE.md, rules/ (security, conventions, git-safety, autonomous), hooks (secret-scan, audit-log), skills (server-health, secret-audit, docker-troubleshoot, humanizer), MCP (Context7)
- **Project layer** (`.claude/` per project): settings.json, rules/, agents/, skills/, agent-memory/

PM Groundwork needs to be updated to generate `.claude/`-native structure for Claude Code users while keeping flat file support for Cursor, Gemini CLI, and Codex users via MCP.

## What PM Groundwork Is (current state)

**4 slash commands** (in `.claude/commands/`):
- `/pm-setup` (~1223 lines) — Interactive 5-phase setup wizard. Scans existing files, asks about tech level (A/B/C), project scope (Docs only / Docs+prototype / Full build), runs 10+ interview questions, generates 11 workspace files.
- `/pm-start-session` (~179 lines) — Read-only session briefing. Reads all workspace files, presents status, priorities, decisions due, suggests focus.
- `/pm-end-session` (~227 lines) — Session wrap-up. Creates/appends daily log in memory/, updates MEMORY.md/DECISIONS.md/CONTEXT.md, optionally commits+pushes.
- `/pm-draft` (~861 lines) — PM document generator. Supports 14 document types (PRDs, roadmaps, charters, risk plans, etc.). Interview → confirmation → generation → review loop.

**MCP server** (`pm-groundwork-mcp/src/`):
- 8 tools: pm_read_workspace, pm_write_workspace_file, pm_update_workspace_file, pm_log_decision, pm_write_daily_log, pm_scan_workspace, pm_scan_project_files, pm_check_decisions_due
- 5 resources: pm://workspace/context, memory, decisions, user, status
- 4 prompts: mirrors of the 4 slash commands
- Client detection: detectClient() in prompts/prompt-utils.ts
- File management: workspace/file-manager.ts, workspace/config.ts

**Plugin manifest**: `.claude-plugin/plugin.json` (v1.0.0, 4 commands)

## The Update — File Layout Mapping

When Claude Code is detected, `/pm-setup` generates `.claude/`-native structure instead of flat files:

| Current (flat) | Claude Code (.claude/ native) | Other tools (unchanged) |
|---|---|---|
| `IDENTITY.md` | `.claude/agents/pm-lead/AGENT.md` — proper agent definition with `memory: project`, YAML frontmatter | `IDENTITY.md` |
| `SOUL.md` | `.claude/rules/communication.md` — auto-loading rule | `SOUL.md` |
| `HEARTBEAT.md` | `.claude/rules/session-protocol.md` — auto-loading rule | `HEARTBEAT.md` |
| `AGENTS.md` | Split → `.claude/rules/behavior.md` (workflow/tool access) + `.claude/rules/security.md` (security guardrails) | `AGENTS.md` |
| `MEMORY.md` | `.claude/agent-memory/pm-lead/MEMORY.md` — persistent agent memory | `MEMORY.md` |
| `DECISIONS.md` | `.claude/agent-memory/pm-lead/DECISIONS.md` — agent-owned | `DECISIONS.md` |
| `CONTEXT.md` | `CONTEXT.md` — stays at root (still useful for orientation) | `CONTEXT.md` |
| `USER.md` | `USER.md` — stays at root (referenced by global ~/.claude/CLAUDE.md) | `USER.md` |
| `CLAUDE.md` | `CLAUDE.md` — lightweight project overview pointing to .claude/ | N/A (tool-specific) |
| (new) | `.claude/settings.json` — project permissions adapted to PROJECT_SCOPE | N/A |
| (new) | `.claude/skills/pm-draft/SKILL.md` — document generator as isolated skill | N/A |
| (new) | `.mcp.json` — pm-groundwork MCP server for the project | N/A |

Files that stay at root for both paths: `CONTEXT.md`, `USER.md`, `CLAUDE.md`, `memory/`

## Implementation Steps

### Step 1: Update `workspace/config.ts`

Add Claude Code path mappings alongside existing flat paths:

```typescript
// Existing flat paths (for Cursor, Gemini, Codex)
export const WORKSPACE_FILES = [
  'CLAUDE.md', 'CONTEXT.md', 'MEMORY.md', 'USER.md', 
  'DECISIONS.md', 'IDENTITY.md', 'SOUL.md', 'HEARTBEAT.md', 'AGENTS.md'
];

// New: Claude Code native paths
export const CLAUDE_CODE_PATHS: Record<string, string> = {
  'IDENTITY.md': '.claude/agents/pm-lead/AGENT.md',
  'SOUL.md': '.claude/rules/communication.md',
  'HEARTBEAT.md': '.claude/rules/session-protocol.md',
  'AGENTS.md': '.claude/rules/behavior.md',  // behavior portion
  'MEMORY.md': '.claude/agent-memory/pm-lead/MEMORY.md',
  'DECISIONS.md': '.claude/agent-memory/pm-lead/DECISIONS.md',
  // These stay at root:
  'CONTEXT.md': 'CONTEXT.md',
  'USER.md': 'USER.md',
  'CLAUDE.md': 'CLAUDE.md',
};

// New: additional files only generated for Claude Code
export const CLAUDE_CODE_EXTRA_FILES = [
  '.claude/settings.json',
  '.claude/rules/security.md',
  '.claude/skills/pm-draft/SKILL.md',
  '.mcp.json',
];
```

### Step 2: Update `workspace/file-manager.ts`

Add path resolution that branches on client type:

```typescript
export function resolveFilePath(logicalName: string, clientType: string): string {
  if (clientType === 'claude-code' && CLAUDE_CODE_PATHS[logicalName]) {
    return path.join(getWorkspaceDir(), CLAUDE_CODE_PATHS[logicalName]);
  }
  return path.join(getWorkspaceDir(), logicalName);
}
```

Update `readWorkspaceFile()`, `writeWorkspaceFile()`, `updateWorkspaceFileSection()` to accept an optional `clientType` parameter and use `resolveFilePath()`.

Update `scanWorkspace()` to check both flat and .claude/ locations and report which layout is in use.

### Step 3: Update all 8 MCP tools

Each tool that reads/writes workspace files needs to:
1. Detect client type (already available from server connection context)
2. Pass client type to file manager functions
3. No logic changes — just path resolution

Key files:
- `tools/read-workspace.ts`
- `tools/write-workspace-file.ts`
- `tools/update-workspace-file.ts`
- `tools/log-decision.ts`
- `tools/write-daily-log.ts`
- `tools/scan-workspace.ts`
- `tools/scan-project-files.ts`
- `tools/check-decisions-due.ts`

### Step 4: Update `/pm-setup` Phase 4 (file generation)

This is the biggest change. After the interview (Phases 0-3 unchanged), Phase 4 branches:

**Claude Code path:**
1. Create `.claude/` directory structure (agents/, rules/, agent-memory/pm-lead/, skills/pm-draft/)
2. Generate `.claude/agents/pm-lead/AGENT.md` with YAML frontmatter:
   ```yaml
   ---
   name: pm-lead
   description: [from interview — role description]
   tools: Read, Write, Edit, Grep, Glob, Bash
   model: sonnet
   memory: project
   color: green
   skills: [pm-draft]
   ---
   [Body: mission + communication style from interview — merges what was IDENTITY.md + SOUL.md]
   ```
3. Generate `.claude/rules/communication.md` — communication style from interview
4. Generate `.claude/rules/session-protocol.md` — from HEARTBEAT.md content
5. Generate `.claude/rules/behavior.md` — workflow rules, tool access from AGENTS.md content
6. Generate `.claude/rules/security.md` — security guardrails (check if global ~/.claude/rules/security.md exists first — if so, make project rules minimal and note global coverage)
7. Generate `.claude/agent-memory/pm-lead/MEMORY.md` — same content as current MEMORY.md
8. Generate `.claude/agent-memory/pm-lead/DECISIONS.md` — same format
9. Generate `.claude/settings.json` — project permissions adapted to PROJECT_SCOPE:
   - Scope A (Docs): minimal permissions
   - Scope B (Docs+prototype): add dev tool permissions
   - Scope C (Full build): add build/deploy/test permissions
10. Generate `.claude/skills/pm-draft/SKILL.md` — document generator skill
11. Generate `.mcp.json` — pm-groundwork MCP server config for this project
12. Generate lightweight `CLAUDE.md` — project overview + "rules, agents, and memory are in .claude/"
13. Generate `CONTEXT.md` — same as current (stays at root)
14. Generate `USER.md` — same as current (stays at root)
15. Create `memory/` directory
16. Update `.gitignore`

**Other tools path:** Unchanged — generates flat files as before.

**Global layer awareness:**
- Check for `~/.claude/CLAUDE.md` existence
- If found, read `~/.claude/rules/` to see which global rules exist
- Skip generating project-level duplicates of global rules
- Note in output: "Global security rules detected — project inherits them automatically"

### Step 5: Create pm-draft skill template

What `/pm-setup` generates at `.claude/skills/pm-draft/SKILL.md`:

```yaml
---
name: pm-draft
description: Draft PM documents — PRDs, roadmaps, project charters, risk plans, 
  status reports, competitive analysis, and 8 more document types. Reads project 
  context and runs an interview before generating. Use when you need to create or 
  update any PM document.
allowed-tools: Read Write Edit Grep Glob Bash
model: sonnet
context: fork
---

[The body is the current pm-draft.md command content, adapted to read from 
.claude/agent-memory/pm-lead/ paths instead of root paths]
```

This means `/pm-draft` runs in an isolated subagent — no context pollution.

### Step 6: Update `/pm-start-session`

Add path resolution at the top:

```markdown
## Step 0 — Detect layout

Check if `.claude/agents/pm-lead/AGENT.md` exists:
- If yes: use .claude/ paths for all reads
- If no: use flat root paths (legacy layout)
```

Then update all file read references to use the resolved paths. Logic stays the same — just different file locations.

### Step 7: Update `/pm-end-session`

Same approach as pm-start-session:
- Detect layout (.claude/ vs flat)
- Write daily log to `memory/` (unchanged)
- Update agent memory at `.claude/agent-memory/pm-lead/MEMORY.md` (instead of root MEMORY.md)
- Update decisions at `.claude/agent-memory/pm-lead/DECISIONS.md` (instead of root DECISIONS.md)
- Git backup logic unchanged

### Step 8: Update `init.ts`

When initializing for Claude Code:
- Create `.claude/` directory structure
- Write `.mcp.json` at project root (not inside .claude/)
- Create placeholder directories: `.claude/agents/`, `.claude/rules/`, `.claude/agent-memory/`, `.claude/skills/`

### Step 9: Update plugin manifest + README

**`.claude-plugin/plugin.json`:**
- Version: "2.0.0"
- Add skills declaration
- Update description: "PM starter kit with Claude Code native .claude/ support"

**README.md:**
- Add "v2.0 — Claude Code Native" section
- Document the dual-layout approach
- Show .claude/ directory structure
- Explain global layer inheritance
- Update installation instructions
- Keep existing MCP/cross-tool documentation

### Step 10: Testing

1. **Fresh Claude Code setup**: Run `/pm-setup` in a new directory → verify .claude/ structure created correctly
2. **Fresh MCP setup (non-Claude)**: Verify flat files still generated
3. **Session flow**: `/pm-start-session` → work → `/pm-end-session` → verify files updated in correct locations
4. **Document generation**: `/pm-draft` → verify runs in isolated subagent (context: fork)
5. **Legacy compatibility**: Open existing flat-layout project → verify pm-start-session detects and works with legacy layout
6. **Global layer**: Set up with ~/.claude/rules/ present → verify no duplicate rules generated
7. **MCP tools**: Test all 8 tools with both layouts

## What Stays the Same

- Interview questions and logic (Phases 0-3 of /pm-setup)
- 14 document types in /pm-draft
- Daily log format (memory/YYYY-MM-DD.md)
- Decision log format and auto-incrementing IDs
- Cross-tool MCP support (Cursor, Gemini, Codex)
- GSD integration bridging
- The content of generated files — only the locations change for Claude Code

## Key Files to Modify

| File | Change scope |
|------|-------------|
| `pm-groundwork-mcp/src/workspace/config.ts` | Add CLAUDE_CODE_PATHS, CLAUDE_CODE_EXTRA_FILES |
| `pm-groundwork-mcp/src/workspace/file-manager.ts` | Add resolveFilePath(), update read/write/scan |
| `pm-groundwork-mcp/src/tools/*.ts` (all 8) | Pass client type to file manager |
| `.claude/commands/pm-setup.md` | Branch Phase 4 for Claude Code layout |
| `.claude/commands/pm-start-session.md` | Add layout detection, update paths |
| `.claude/commands/pm-end-session.md` | Add layout detection, update paths |
| `.claude/commands/pm-draft.md` | Update to also work as skill source |
| `pm-groundwork-mcp/src/init.ts` | Create .claude/ structure for Claude Code |
| `pm-groundwork-mcp/src/prompts/*.ts` | Update path references |
| `.claude-plugin/plugin.json` | Version bump, skills declaration |
| `README.md` | Document v2.0 changes |

## Architecture Diagram

```
~/.claude/ (GLOBAL — already built)
├── CLAUDE.md                    ← Jackie's profile, conventions
├── rules/                       ← security, git-safety, conventions, autonomous
├── hooks/                       ← secret-scan, audit-log, GSD hooks
├── skills/                      ← server-health, secret-audit, docker-troubleshoot
└── .mcp.json                    ← Context7

any-project/ (PROJECT — generated by pm-setup v2.0)
├── CLAUDE.md                    ← lightweight project overview
├── CONTEXT.md                   ← quick orientation
├── USER.md                      ← user context
├── .claude/
│   ├── settings.json            ← project permissions (scope-aware)
│   ├── agents/
│   │   └── pm-lead/AGENT.md     ← PM agent with persistent memory
│   ├── agent-memory/
│   │   └── pm-lead/
│   │       ├── MEMORY.md        ← stakeholders, priorities, risks
│   │       └── DECISIONS.md     ← decision log
│   ├── rules/
│   │   ├── communication.md     ← from SOUL.md interview
│   │   ├── session-protocol.md  ← from HEARTBEAT.md
│   │   ├── behavior.md          ← workflow rules
│   │   └── security.md          ← project security (if not covered by global)
│   └── skills/
│       └── pm-draft/SKILL.md    ← document generator (context: fork)
├── .mcp.json                    ← pm-groundwork MCP server
├── memory/                      ← daily session logs
└── docs/                        ← generated PM documents
```

Session flow:
```
/pm-setup (one-time)
  → Interview → generates full .claude/ structure
  → Project inherits global rules, hooks, skills automatically

/pm-start-session (each session)
  → Reads agent memory + rules + context
  → Briefing + focus selection

Work happens (Claude uses pm-lead agent, global skills, project rules)

/pm-draft (when needed)
  → Runs in isolated subagent (context: fork)
  → Reads agent memory for project context
  → Generates document to docs/

/pm-end-session (each session)
  → Updates agent memory (MEMORY.md, DECISIONS.md)
  → Writes daily log to memory/
  → Optional git backup
```
