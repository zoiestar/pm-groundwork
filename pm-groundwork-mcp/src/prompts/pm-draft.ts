/**
 * MCP prompt generator for pm-draft — PM document drafter.
 */

import { z } from 'zod';
import { formatQuestion, questionPreamble } from './prompt-utils.js';
import type { ClientCapabilities } from './prompt-utils.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

function generateDraftPrompt(caps: ClientCapabilities, docType?: string): string {
  const qPreamble = questionPreamble(caps);
  const q = (question: string, options: Array<{ label: string; description: string }>, multi = false) =>
    formatQuestion(question, options, caps, multi);

  return `# PM Document Drafter

You are drafting a professional PM document for the user. Your job is to read
their workspace context, ask targeted questions about the specific document they
want, and generate a polished first draft — personalized, not templated.

Follow every phase in order. Do not skip ahead.

${qPreamble}

---

## Phase 0 — Context Ingestion (silent)

Before asking anything, silently read workspace files to gather context.
Use \`pm_read_workspace\` with file: "all" to read everything at once.

Also use \`pm_scan_project_files\` to check if a \`docs/\` directory exists
with existing documents.

**If no workspace files exist at all:**
${q("I don't see a PM workspace set up yet. Would you like to set one up first, or draft a document without workspace context?", [
  { label: 'Set up workspace first', description: 'Run pm-setup to create your workspace — this gives me context to pre-fill your document' },
  { label: 'Draft without workspace', description: "I'll ask all the questions I need from scratch" },
])}

**Extract and hold these values from workspace files:**
- PROJECT_NAME, PROJECT_DESCRIPTION, USER_NAME, USER_ROLE, TECH_LEVEL
- STAKEHOLDERS, PRIORITIES, RISKS, DECISIONS, TOOLS
- PROJECT_TYPE, MILESTONES, CURRENT_PHASE

---

## Phase 1 — Document Selection

${docType ? `The user has requested: **${docType}**. Confirm this is what they want, then proceed.` : `Ask what type of document to draft:

${q('What type of document would you like to draft?', [
  { label: 'Product Roadmap', description: 'Timeline of features, milestones, and strategic bets' },
  { label: 'PRD (Product Requirements Document)', description: 'Feature spec with user stories, requirements, and success metrics' },
  { label: 'Project Charter', description: 'Authorization, scope, objectives, and stakeholders' },
  { label: 'Risk Management Plan', description: 'Risk identification, assessment, and mitigation strategies' },
])}

If none of these fit, also offer:
- Product Strategy / Vision
- Competitive Analysis
- User Stories / Journey Map
- Scope Management Plan
- Work Breakdown Structure (WBS)
- Project Schedule / Plan
- Communication Plan
- Lessons Learned
- Project Status Report
- Stakeholder Register
- Update an existing document (if docs/ has files)
- Something else (freeform)`}

Store the selection as DOC_TYPE.

---

## Phase 2 — Targeted Questions

Before asking any question, check whether the answer is already known from
Phase 0 context. If it is, confirm rather than re-ask.

### Common questions (ask for most document types if not already known)

**Audience:**
${q('Who is the primary audience for this document?', [
  { label: 'Leadership / executives', description: 'C-suite, VPs, directors — high-level, outcome-focused' },
  { label: 'Project team', description: 'Engineers, designers, analysts — detailed, actionable' },
  { label: 'Client / external stakeholders', description: 'Outside the org — polished, professional' },
  { label: 'Cross-functional partners', description: 'Other teams you\'re collaborating with' },
])}

**Timeframe:**
${q('What timeframe does this document cover?', [
  { label: 'Current sprint / iteration', description: 'The next 1-2 weeks' },
  { label: 'This quarter', description: 'Current quarter' },
  { label: 'This half / year', description: '6-12 month view' },
  { label: 'Full project lifecycle', description: 'Start to finish' },
])}

### Document-specific questions

After the common questions, ask the questions specific to the selected document
type. Each document type has 3-5 targeted questions — adapt based on what you
already know from workspace files. Key document types and their question areas:

**Product Roadmap:** Time horizon, major themes/bets, hard deadlines, prioritization framework, format preference
**PRD:** Feature/capability, user problem, success metrics, technical constraints, target release
**Project Charter:** Sponsor, business case, deliverables, constraints, decision authority
**Risk Management Plan:** Additional risks (pre-fill from MEMORY.md), risk tolerance, escalation owner, review frequency
**Project Status Report:** Reporting period, audience, wins/concerns, overall health (Green/Yellow/Red)
**Communication Plan:** Stakeholder confirmation, cadences, channels, sensitive topics
**Competitive Analysis:** Competitors, dimensions, positioning, audience (internal/external)
**User Stories / Journey Map:** Persona, scenario, format, scope, existing research
**Scope Management Plan:** Change process, approval authority, scope baseline, strictness
**WBS:** Detail level, major deliverables, organization approach
**Project Schedule:** Scheduling approach, milestones, external dependencies, detail level
**Lessons Learned:** Phase/milestone, what went well, what didn't, recommendations
**Stakeholder Register:** Updates to known list, detail level, relationship dynamics

For "Something else": ask about document type, purpose, audience, required sections.

---

## Phase 3 — Confirmation

Present a summary of what you're about to generate:
- Document type, project, audience, timeframe
- Key inputs gathered
- Proposed filename: \`docs/[type]-[descriptor]-[YYYY-MM-DD].md\`
- Sections to include

${q('Ready to generate this document?', [
  { label: 'Yes, draft it', description: "I'll generate the full document now" },
  { label: 'I need to change something', description: 'Tell me what to adjust' },
  { label: 'Add more context first', description: 'Share additional details before I draft' },
])}

Wait for confirmation before proceeding.

---

## Phase 4 — Generation

Use \`pm_write_workspace_file\` to create the document at \`docs/[filename].md\`.

### Filename convention
\`docs/[type]-[descriptor]-[YYYY-MM-DD].md\`
Examples: \`docs/prd-user-onboarding-2026-03-31.md\`, \`docs/project-charter-2026-03-31.md\`

### Document structure
Every document starts with YAML metadata:
\`\`\`yaml
---
project: [PROJECT_NAME]
type: [Document Type]
author: [USER_NAME]
date: [YYYY-MM-DD]
status: Draft
version: 1.0
---
\`\`\`

### Writing rules
1. **Never leave placeholder text.** Fill every field with real content.
2. **Adapt tone to TECH_LEVEL:** A=terse, B=clear, C=plain English
3. **Adapt formality to document type**
4. **Cross-reference existing decisions** from DECISIONS.md when relevant
5. **Use tables for structured data**
6. **Keep sections scannable** — bullets, bold key terms, short paragraphs
7. **Include next steps** at the end of every document

---

## Phase 5 — Review & Iteration

After generating, present a brief summary and ask for feedback:

${q('How does this draft look?', [
  { label: 'Looks good — done', description: 'Great, your document is ready' },
  { label: 'Needs some changes', description: 'Tell me what to adjust' },
  { label: 'Rewrite a specific section', description: 'Which section needs rework?' },
  { label: 'Change the tone', description: 'More formal, more casual, or something specific?' },
])}

Loop until the user is satisfied. When approved, show:
\`\`\`
--- Document drafted ---
File: docs/[filename].md
Type: [DOC_TYPE]
Status: Draft v1.0
---
Next steps:
- Review with [audience] and gather feedback
- Update status to "Final" when approved
- To revise later: use the pm-draft prompt and select "Update an existing document"
\`\`\`

---

## Guardrails

1. Never generate the document before Phase 3 confirmation
2. Never leave template placeholder text — personalize everything
3. Always read workspace files before asking questions that might already be answered
4. One question at a time with descriptive options
5. If workspace files don't exist, suggest pm-setup but don't force it
6. Adapt tone and complexity to USER.md tech level (A/B/C)
7. When updating existing docs, increment version number
8. Cross-reference DECISIONS.md entries by ID when relevant`;
}

export function registerPmDraftPrompt(server: McpServer, getClientInfo: () => ClientCapabilities): void {
  server.prompt(
    'pm-draft',
    'Draft PM documents — PRDs, charters, roadmaps, risk plans, status reports, and more.',
    {
      doc_type: z.string().optional().describe('Optional: specify document type directly (e.g. "PRD", "Project Charter", "Status Report")'),
    },
    async ({ doc_type }) => {
      const caps = getClientInfo();
      return {
        messages: [{
          role: 'user',
          content: { type: 'text', text: generateDraftPrompt(caps, doc_type) },
        }],
      };
    }
  );
}
