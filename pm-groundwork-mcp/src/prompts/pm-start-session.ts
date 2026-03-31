/**
 * MCP prompt generator for pm-start-session — session briefing and focus selection.
 */

import { formatQuestion, questionPreamble } from './prompt-utils.js';
import type { ClientCapabilities } from './prompt-utils.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

function generateStartSessionPrompt(caps: ClientCapabilities): string {
  const qPreamble = questionPreamble(caps);
  const q = (question: string, options: Array<{ label: string; description: string }>) =>
    formatQuestion(question, options, caps);

  return `# PM Start-of-Session Recap

Run this at the beginning of every working session. This gives you a
full briefing so you can hit the ground running.

${qPreamble}

---

## Step 0 — Read workspace files

Use \`pm_read_workspace\` with file: "all" to read all workspace files silently
(do not dump contents to the user). This reads: CLAUDE.md, CONTEXT.md, MEMORY.md,
USER.md, DECISIONS.md, IDENTITY.md.

---

## Step 1 — Read GSD state

Use \`pm_read_workspace\` to check for GSD planning artifacts:
- \`.planning/PROJECT.md\`
- \`.planning/ROADMAP.md\`
- \`.planning/STATE.md\`

If no \`.planning/\` directory exists (check via \`pm_scan_workspace\`), note that
GSD hasn't been initialized yet and suggest initializing it later in the briefing.

---

## Step 2 — Read recent history

Read the most recent daily log(s) from \`memory/\` to understand what was done
last, what next actions were identified, and any unresolved blockers.

---

## Step 3 — Check decisions due for review

Use the \`pm_check_decisions_due\` tool to find any decisions with review date <= today.

---

## Step 4 — Present the briefing

Present a structured recap. Adapt length to how much context exists —
a brand new project gets a short briefing, a mature project gets more.

Format:

> **[PROJECT NAME] — Session Briefing**
>
> **Where we are:**
> [1-2 sentences on project status from CONTEXT.md / MEMORY.md]
>
> **Last session:**
> [2-3 bullets from the most recent daily log — what was done]
>
> **What's next:**
> [Numbered list from MEMORY.md "Next actions" + GSD state.
> If a GSD phase is in progress, show which phase and its status.
> If a phase was just completed, note what the next phase is.]
>
> **Current priorities:**
> [From MEMORY.md "Current priorities" section]
>
> **Risks & blockers:**
> [From MEMORY.md "Open risks & blockers" — or "None active" if clear]
>
> **Decisions due for review:**
> [List any from Step 3, or "None due" if clear.
> Format: "Decision #XXX — [title] (review date: YYYY-MM-DD)"]
>
> **Milestones & deadlines:**
> [From GSD ROADMAP.md if available — show current milestone,
> completion percentage, and any upcoming deadlines.
> If no GSD state, show "Planning framework not initialized"]

---

## Step 5 — What to work on

After the briefing, help the user decide what to focus on.

${q('What do you want to focus on today?', [
  { label: 'Continue where I left off', description: 'Pick up from the most logical next action' },
  { label: 'Work on something specific', description: "I'll tell you what I need" },
  { label: 'Review and plan', description: "Let's look at priorities, risks, or upcoming milestones" },
  { label: 'Quick task', description: "Something small that doesn't need full planning" },
])}

Based on their answer:

- **Continue where I left off** → Surface the top item from MEMORY.md "Next actions"
  or GSD state (current phase).

- **Work on something specific** → Let them describe it, then suggest the
  appropriate approach based on complexity.

- **Review and plan** → Ask what they want to review:
${q('What do you want to review?', [
  { label: 'Project priorities', description: 'Review and update current priorities in MEMORY.md' },
  { label: 'Risks and blockers', description: 'Review open risks and discuss mitigation' },
  { label: 'Upcoming milestones', description: 'Check roadmap and timeline' },
  { label: 'Decision reviews', description: 'Walk through decisions due for review' },
])}

- **Quick task** → Let them describe the task.

---

## Step 6 — Flag anything urgent

Before handing off to the user's chosen work, proactively flag anything
that needs immediate attention:

- Decisions overdue for review (Review date < today, not just ≤)
- Risks marked as "High" impact in MEMORY.md
- Phases that appear stalled (last updated > 7 days ago)
- Blockers that were unresolved from the previous session

If nothing urgent: skip this step silently — don't say "nothing urgent"
unless the user specifically asks.

---

## Guardrails

1. Never modify any files during this command — it's read-only
2. Keep the briefing scannable — bullets and short sentences, not paragraphs
3. If workspace files don't exist, suggest running pm-setup first
4. If GSD isn't initialized, mention it once — don't repeat it in every section
5. Adapt tone and detail level to USER.md tech level (A/B/C) if available
6. Don't overwhelm a new project with empty sections — only show sections
   that have real content`;
}

export function registerPmStartSessionPrompt(server: McpServer, getClientInfo: () => ClientCapabilities): void {
  server.prompt(
    'pm-start-session',
    'Start-of-session project recap. Summarizes progress, surfaces what\'s next, flags risks and decisions due for review.',
    {},
    async () => {
      const caps = getClientInfo();
      return {
        messages: [{
          role: 'user',
          content: { type: 'text', text: generateStartSessionPrompt(caps) },
        }],
      };
    }
  );
}
