/**
 * MCP prompt generator for pm-end-session — session wrap-up and memory sync.
 */

import { formatQuestion, questionPreamble } from './prompt-utils.js';
import type { ClientCapabilities } from './prompt-utils.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

function generateEndSessionPrompt(caps: ClientCapabilities): string {
  const qPreamble = questionPreamble(caps);
  const q = (question: string, options: Array<{ label: string; description: string }>) =>
    formatQuestion(question, options, caps);

  return `# PM End-of-Session Wrap-Up

Run this at the end of every working session. Follow the steps in order.
Be thorough but concise — this is a wrap-up, not a deep dive.

${qPreamble}

---

## Step 0 — Gather context

Use \`pm_read_workspace\` to read CONTEXT.md and USER.md to orient yourself.
Check USER.md "Version control" field.

If a git repo is configured, check recent git activity (git diff, git status,
git log for the last 8 hours).

Use \`pm_scan_workspace\` to check workspace state.
Read \`.planning/STATE.md\` and \`.planning/ROADMAP.md\` if they exist.

Present a brief summary of detected changes, then ask:

${q('Anything to add before I wrap up?', [
  { label: 'Nope, wrap it up', description: 'Everything looks right' },
  { label: 'Yes, I have notes', description: 'Decisions, blockers, stakeholder updates, or corrections' },
  { label: 'Let me review first', description: 'Show me more detail before closing out' },
])}

**Wait for the user's response before proceeding.**
If they have notes, let them type freely, then proceed.

---

## Step 1 — Daily log

Use the \`pm_write_daily_log\` tool to create or append to today's daily log.
The tool handles session numbering automatically.

Provide:
- **title**: Brief session title
- **what_happened**: Bullet points of work done
- **decisions_made**: Any decisions, or "None"
- **stakeholder_updates**: Communications, approvals, feedback
- **blockers_risks**: New blockers or risks
- **files_changed**: Files created or updated
- **next_actions**: What comes next

---

## Step 2 — GSD state

Check if \`.planning/STATE.md\` and \`.planning/ROADMAP.md\` exist.

If anything changed during the session:
- Update STATE.md with current progress
- Mark completed items in ROADMAP.md

If nothing changed: "No GSD state changes this session."

---

## Step 3 — Decisions log

If decisions were made this session, use the \`pm_log_decision\` tool to log each one.
The tool automatically:
- Assigns the next sequential ID
- Formats the entry in DECISIONS.md
- Adds a cross-reference to MEMORY.md

If no decisions: "No new decisions this session."

---

## Step 4 — Session memory

Review what was captured in the daily log. Use \`pm_update_workspace_file\` to
promote any durable facts (new stakeholders, constraints, preferences) to
MEMORY.md in the appropriate section.

---

## Step 5 — Workspace docs sync

Use \`pm_update_workspace_file\` to update workspace files only if meaningful
new facts emerged:

- **MEMORY.md**: New stakeholder, constraint, completed milestone, changed status
- **CONTEXT.md**: Project's current state meaningfully shifted
- **Entrypoint file**: GSD state section needs updating

If nothing meaningful changed: "Project root docs unchanged."

---

## Step 6 — Git backup

Check USER.md "Version control" field.

**If "none":**
> Git backup: skipped — no repo configured for this project.

**If repo configured:**
1. Security scan first — check for passwords, secrets, tokens, .env files, key files
2. If ANY matches found: stop, show the user, do NOT commit until confirmed safe
3. If clean: stage tracked files, commit with "chore: end-of-session backup [date]", push

**Important:** Never commit API keys, tokens, passwords, or .env files.

---

## Wrap-up summary

Present this summary:
\`\`\`
--- Session wrapped up ---
Daily log:      [created/updated/skipped]
GSD state:      [updated/skipped]
Decisions log:  [updated — #XXX added / skipped]
Session memory: [updated/skipped]
Workspace docs: [MEMORY.md / CONTEXT.md updated / skipped]
Git backup:     [committed + pushed / nothing to commit / skipped — no repo]
\`\`\`

---

## Guardrails

1. Never commit API keys, tokens, passwords, or .env files. Scan first, always.
2. Ask before doing anything that can't be undone.
3. Skip steps cleanly when nothing changed — don't force updates.
4. If something looks wrong, stop and ask.
5. Never update MEMORY.md or CONTEXT.md just to change timestamps.`;
}

export function registerPmEndSessionPrompt(server: McpServer, getClientInfo: () => ClientCapabilities): void {
  server.prompt(
    'pm-end-session',
    "End-of-session wrap-up. Updates memory, logs decisions, syncs state, and backs up to git if configured.",
    {},
    async () => {
      const caps = getClientInfo();
      return {
        messages: [{
          role: 'user',
          content: { type: 'text', text: generateEndSessionPrompt(caps) },
        }],
      };
    }
  );
}
