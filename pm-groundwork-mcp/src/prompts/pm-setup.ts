/**
 * MCP prompt generator for pm-setup — the interactive workspace setup wizard.
 * Converts the original pm-setup.md command into an MCP prompt with client-aware formatting.
 */

import { formatQuestion, questionPreamble, getEntrypointFilename } from './prompt-utils.js';
import type { ClientCapabilities } from './prompt-utils.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

function generateSetupPrompt(caps: ClientCapabilities): string {
  const entrypoint = getEntrypointFilename(caps);
  const qPreamble = questionPreamble(caps);

  const q = (question: string, options: Array<{ label: string; description: string }>, multi = false) =>
    formatQuestion(question, options, caps, multi);

  return `# PM Project Setup

You are bootstrapping a new PM workspace for a project.
Your job is to run a short interview, then generate a complete, personalized
workspace in one pass. Do not generate files before the interview is complete.

Follow every phase in order. Do not skip ahead.

${qPreamble}

---

## Phase 0 — Check for existing files

Before asking anything, use the \`pm_scan_project_files\` tool to scan for existing
files (markdown, text, specs, briefs, README, docs/).

If you find existing files (README, docs, briefs, specs, etc.), ask:

${q('I found some existing files in this directory. Should I read these to help pre-fill your project setup?', [
  { label: 'Yes, scan them', description: 'This will make the workspace files more accurate from day one' },
  { label: 'No, start fresh', description: "I'll ask everything from scratch" },
])}

If yes — use \`pm_read_workspace\` or the client's file-reading capability to read
every relevant file before starting the interview. Extract: project name, description,
stakeholders, decisions already made, tools mentioned, status, any constraints.
Hold this context and use it to pre-fill answers throughout the interview.

If no — proceed to Phase 1 with a blank slate.

---

## Phase 1 — Tech-savvy calibration

Ask this question first. The answer changes how you write every instruction,
explanation, and checklist for the rest of setup AND how workspace files are
written for this user.

${q('Before we dive in — how comfortable are you with tools like the terminal, git, and markdown files?', [
  { label: 'Pretty comfortable', description: 'I use the terminal regularly, I know git basics, and I\'m fine reading raw markdown' },
  { label: 'Somewhere in the middle', description: 'I can follow technical instructions when they\'re explained clearly, but I\'m not a developer' },
  { label: "I'm new to this", description: "I'll need plain-English explanations and step-by-step instructions for anything technical" },
])}

Store this as TECH_LEVEL (A / B / C). Apply it everywhere:

- **A** (Pretty comfortable): terse instructions, assume git/terminal fluency, no hand-holding
- **B** (Somewhere in the middle): explain commands before running them, brief context on why each
         step matters, avoid jargon without definition
- **C** (I'm new to this): plain English throughout, every terminal command explained,
         analogies for new concepts, extra reassurance at each step

---

## Phase 1b — Project scope

This question determines the overall shape of the workspace. Store the
answer as PROJECT_SCOPE (A / B / C) and use it to branch questions,
file content, and GSD initialization for the rest of setup.

${q('What are you planning to do with this project?', [
  { label: 'Documentation only', description: 'PRDs, roadmaps, charters, status reports — no code' },
  { label: 'Documentation + prototype', description: 'PM docs plus a working proof-of-concept or MVP' },
  { label: 'Documentation + prototype + full build', description: 'End-to-end: plan it, prototype it, build it, ship it' },
])}

Store as:
- **A** (Docs only)
- **B** (Docs + prototype)
- **C** (Docs + prototype + full build)

What changes per scope:

| Area | A (Docs only) | B (Docs + prototype) | C (Full build) |
|------|---------------|---------------------|----------------|
| GSD framework | Skip | Light — prototype phases only | Full initialization |
| Git repo question | Optional, framed as backup | Recommended | Expected |
| Phase 2b questions | Audience, deliverables, review cycle | + Prototype scope, tech stack, success criteria | + Team structure, milestone targets, release plan |
| MEMORY.md weight | Decisions + stakeholders focused | + Technical context section | Full sections |
| GSD section in entrypoint | Minimal — mention it exists | Standard routing table | Full routing + milestone tracking |
| pm-draft emphasis | PRDs, charters, roadmaps, stakeholder comms | + Technical specs, architecture docs | + Launch plans, status reports, retrospectives |

---

## Phase 2 — Core project interview

Ask each question one at a time so the user can focus. If Phase 0 pre-filled
any answers, show the pre-filled value as the default option and let the user
confirm or change it.

### Q1 — Project name
${q('What do you call this project?', [
  { label: 'Other', description: 'Type your project name' },
])}

### Q2 — What is it?
${q('In a sentence or two — what are you building or managing, and who is it for?', [
  { label: 'Other', description: 'Type your description' },
])}
This one is always freeform.

### Q3 — Your role
${q("What's your role on this project?", [
  { label: 'Program manager', description: 'Cross-functional coordination, dependencies, timelines' },
  { label: 'Product manager', description: 'Roadmap, features, stakeholders, launches' },
  { label: 'Project manager', description: 'Delivery, milestones, status tracking' },
  { label: 'Operations lead', description: 'Process, tooling, internal systems' },
])}

### Q4 — Current status
${q('Where are you right now with this project?', [
  { label: 'Just starting', description: 'Early stages — planning, scoping, or kicking off' },
  { label: 'Mid-execution', description: 'Actively in progress — things are moving' },
  { label: 'Inherited this project', description: "Picking up someone else's work" },
  { label: 'Wrapping up', description: 'Final stretch — closing out, launching, or handing off' },
])}

### Q5 — What the AI should help with
${q('What do you want your AI assistant to help with most?', [
  { label: 'Planning and thinking through problems', description: 'Strategy, scoping, trade-offs' },
  { label: 'Tracking decisions and status', description: 'Decision log, progress tracking, memory' },
  { label: 'Drafting comms and documents', description: 'Status updates, emails, stakeholder comms' },
  { label: 'All of the above', description: 'Full PM support across the board' },
])}

### Q6 — Key stakeholders
${q('Who are the 2-4 people you work with most on this? (Name, role, and preferred contact if you know)', [
  { label: 'Other', description: 'List your key stakeholders' },
])}
Freeform — this one is hard to structure as multiple choice.

### Q7 — Tools
${q('What tools are you using for this project?', [
  { label: 'Jira + Confluence + Slack', description: 'Atlassian stack' },
  { label: 'Linear + Notion + Slack', description: 'Modern PM stack' },
  { label: 'GitHub + Slack', description: 'Developer-oriented' },
  { label: 'Google Docs + email', description: 'Lightweight / doc-based' },
])}

### Q8 — Git repo
${q('Does this project need a git repo for backups?', [
  { label: 'Yes, I already have one', description: "I'll paste the repo URL" },
  { label: 'Yes, I need one created', description: 'Set up a new repo for me' },
  { label: 'No', description: 'This project lives in docs, Notion, Jira, etc.' },
])}

If "Yes, I already have one" — follow up asking for the repo URL.
If "Yes, I need one created" — follow up asking: public or private,
GitHub username or org, and whether to pre-populate the README.

### Q9 — Project type
${q('What type of project is this? (Pick all that apply)', [
  { label: 'Client-facing deliverable', description: 'External client, SOW, deliverables' },
  { label: 'Product launch / go-to-market', description: 'Launch, GTM, release coordination' },
  { label: 'Cross-functional program', description: 'Multiple teams, dependencies, coordination' },
  { label: 'Internal ops or tooling', description: 'Process changes, internal tools, systems' },
], true)}

### Q10 — Existing decisions
${q('Any key decisions already locked in that the AI should know about from day one?', [
  { label: 'Yes, I have some', description: "I'll list them out" },
  { label: 'None yet', description: "We'll log them as they come up" },
])}

If "Yes" — follow up with freeform for the user to list them.

---

## Phase 2b — Scope-specific questions

Ask these questions based on PROJECT_SCOPE from Phase 1b.
Skip sections that don't apply.

### Scope A (Docs only) — ask all of these:

#### Q-A1 — Target audience
${q('Who will read the documents you create?', [
  { label: 'Executive leadership', description: 'C-suite, VPs — they want summaries and decisions' },
  { label: 'Cross-functional partners', description: 'Engineering, design, marketing — they want clarity and next steps' },
  { label: 'External stakeholders', description: 'Clients, vendors, partners — they want professionalism and specifics' },
  { label: 'Mixed audience', description: 'Different docs for different people' },
])}

#### Q-A2 — Key deliverables
${q('What are the main documents you need to produce?', [
  { label: 'PRD / requirements', description: 'Product requirements or feature specs' },
  { label: 'Project charter', description: 'Scope, goals, success criteria, governance' },
  { label: 'Roadmap', description: 'Timeline, milestones, dependencies' },
  { label: 'Status reports', description: 'Recurring updates for stakeholders' },
], true)}

#### Q-A3 — Review cycle
${q('How often do you review and update project docs?', [
  { label: 'Weekly', description: 'Regular cadence — status reports, priority updates' },
  { label: 'Biweekly', description: 'Every two weeks — sprint-aligned or check-in based' },
  { label: 'Ad hoc', description: 'When things change — no fixed schedule' },
  { label: 'Monthly', description: 'Monthly reviews or steering committee cadence' },
])}

### Scope B (Docs + prototype) — ask Scope A questions, then add:

#### Q-B1 — Prototype goal
${q("What's the prototype meant to prove?", [
  { label: 'Technical feasibility', description: 'Can we actually build this? Prove the architecture works' },
  { label: 'User experience', description: 'Does the flow make sense? Get feedback before committing' },
  { label: 'Stakeholder buy-in', description: 'Show something tangible to get approval or funding' },
  { label: 'All of the above', description: 'Feasibility + UX + buy-in' },
])}

#### Q-B2 — Prototype tech stack
${q('Do you know what tech stack the prototype will use?', [
  { label: 'Yes, I know', description: "I'll describe it" },
  { label: 'Team decides', description: "Engineering will pick — I just need to track the decision" },
  { label: 'Need help choosing', description: "I'd like the AI to help evaluate options" },
])}

If "Yes, I know" — follow up with freeform for the tech stack.

#### Q-B3 — Prototype success criteria
${q('How will you know the prototype succeeded?', [
  { label: 'Other', description: "Describe what 'done' looks like for the prototype" },
])}
Freeform — let the user describe success criteria in their own words.

#### Q-B4 — Prototype timeline
${q("What's the timeline pressure for the prototype?", [
  { label: 'Tight — days to a week', description: 'Fast and scrappy, cut scope aggressively' },
  { label: 'Moderate — 2-4 weeks', description: 'Enough time to do it right but not over-engineer' },
  { label: 'Flexible', description: 'No hard deadline — quality over speed' },
  { label: 'Fixed date', description: 'I have a specific deadline' },
])}

If "Fixed date" — follow up with freeform for the date.

### Scope C (Full build) — ask Scope A + B questions, then add:

#### Q-C1 — Team structure
${q('What does the build team look like?', [
  { label: 'Solo — just me and AI', description: "I'm wearing all the hats" },
  { label: 'Small team (2-5)', description: 'Tight group, informal coordination' },
  { label: 'Medium team (6-15)', description: 'Multiple roles, need structured coordination' },
  { label: 'Large / cross-functional', description: 'Multiple teams, formal processes' },
])}

#### Q-C2 — Release strategy
${q('How do you plan to release?', [
  { label: 'Single launch', description: 'Build it all, ship it once' },
  { label: 'Phased rollout', description: 'Release in stages — beta, GA, etc.' },
  { label: 'Continuous delivery', description: 'Ship as features are ready' },
  { label: 'Not sure yet', description: "We'll figure this out as we go" },
])}

#### Q-C3 — Milestone targets
${q('Do you have key milestones or deadlines already?', [
  { label: 'Yes, I have dates', description: "I'll list them out" },
  { label: 'Rough timeline', description: 'I have a general sense but nothing locked in' },
  { label: 'No dates yet', description: "We'll define milestones during planning" },
])}

If "Yes, I have dates" — follow up with freeform for milestone list.

#### Q-C4 — Risk appetite
${q("What's the biggest risk you're watching on this project?", [
  { label: 'Timeline', description: 'We might not ship on time' },
  { label: 'Scope creep', description: 'Requirements keep growing' },
  { label: 'Technical unknowns', description: "We're not sure we can build what's needed" },
  { label: 'Team / resources', description: 'Not enough people or the wrong skills' },
])}

---

## Phase 3 — Derive and confirm

Before generating any files, present a confirmation block showing:
- Project name, scope, role, status, focus areas
- List of workspace files to create
- Optional MEMORY.md sections to activate based on project type and scope
- Version control setup
- Then ask for confirmation before proceeding.

${q('Does this look right?', [
  { label: "Looks good, build it", description: "Let's move forward" },
  { label: 'I need to change something', description: "I'll tell you what to fix" },
  { label: 'Start over', description: 'Let me redo the interview' },
])}

Wait for confirmation before proceeding. If they want changes, ask what
to fix, apply it, re-show the summary, and ask again.

---

## Phase 4 — Generate all files

Use the \`pm_write_workspace_file\` tool to create each file. Generate files in
this order. Personalize every file using the interview answers — never leave
template placeholder text in any file.

### Files to generate:

1. **.gitignore** — Add PM workspace entries (CLAUDE.md, AGENTS.md, USER.md, MEMORY.md, DECISIONS.md, IDENTITY.md, SOUL.md, HEARTBEAT.md, CONTEXT.md, memory/, .planning/, .secrets/, .env, *.key, *.pem)

2. **${entrypoint}** — Auto-loaded entrypoint. Contains:
   - Read order: CONTEXT.md → MEMORY.md → USER.md → AGENTS.md
   - Decision review check instruction
   - GSD framework section adapted to PROJECT_SCOPE:
     - Scope A: Minimal — mention GSD exists, link to quick commands
     - Scope B: Standard routing table focused on prototype phases
     - Scope C: Full routing table with milestone tracking
   - Session protocol: start with pm-start-session, end with pm-end-session

3. **IDENTITY.md** — Agent name, role, focus areas, mission

4. **SOUL.md** — Communication style calibrated to project type and TECH_LEVEL

5. **USER.md** — User name, role, communication style, tech level, tools, version control, preferences

6. **AGENTS.md** — Behavior rules: session start/during/end protocol, GSD workflow (adapted to scope), security rules

7. **MEMORY.md** — Full template with project snapshot, priorities, stakeholders, key decisions, risks, next actions, preferences. Activate optional sections based on project type AND scope:
   - Always: [CLIENT], [LAUNCH], [PROGRAM], [OPS] (based on project type)
   - Scope B, C: [PROTOTYPE] — goal, tech stack, success criteria, timeline, assumptions
   - Scope C only: [BUILD] — team structure, release strategy, milestones, risk

8. **DECISIONS.md** — Decision log template with agent instructions, index table, and entry template. Pre-populate any decisions from Q10.

9. **HEARTBEAT.md** — Memory maintenance, decision review, priority check, GSD sync routine

10. **CONTEXT.md** — 3 paragraphs: what the project is, most important things right now, tools and AI focus

11. **memory/[today's date].md** — First daily log via \`pm_write_daily_log\` tool

---

## Phase 5 — Closing output

### 5a — "Here's what I know" recap
Present a summary of everything gathered. Ask for confirmation:

${q('Anything I got wrong?', [
  { label: 'Nope, all good', description: "Let's see the summary" },
  { label: 'Fix something', description: "I'll tell you what's off" },
])}

### 5b — Summary card
Show a formatted summary of all files created, project scope, active sections, version control status.

### 5c — GSD initialization

Adapt based on PROJECT_SCOPE:

- **Scope A (Docs only):** Skip GSD. Show: "GSD is available if you need structured planning later. Run the project planning command any time to set it up." Proceed to 5d.

- **Scope B or C:** Present the GSD context handoff. Show everything collected during setup that maps to GSD needs:
  - "What you're building" (Q2), status (Q4), project type (Q9)
  - Prototype context (Q-B1 through Q-B4) for Scope B, C
  - Build context (Q-C1 through Q-C4) for Scope C
  - Stakeholders (Q6), tools (Q7), decisions (Q10), git config (Q8)

Then confirm the handoff:

${q('Does this look right to hand off to GSD?', [
  { label: 'Yes, looks good', description: "GSD will use all of this — you'll only answer new questions" },
  { label: 'I need to fix something', description: "I'll tell you what's off" },
  { label: 'Add more context', description: 'I have more details GSD should know' },
])}

Then offer GSD initialization:

${q('Ready to initialize GSD? This sets up the planning framework so all project planning commands work.', [
  { label: "Yes, let's do it", description: "You'll only see questions GSD needs that we didn't already cover" },
  { label: 'Skip for now', description: 'You can initialize the planning framework any time later' },
])}

If yes: invoke GSD new-project. Pre-fill all overlapping answers from setup context.
Never re-ask: project description, git tracking, codebase detection, or deep context questions.
Only let through: workflow config (mode, granularity, execution model), agent config (research, verification, model profile), requirements scoping, and roadmap review.

### 5d — Manual steps checklist
Show next steps: daily workflow commands, git verification, any pending setup.

---

## Guardrails

- Never generate files before Phase 2 is complete
- Never leave template placeholder text in any generated file
- If a question wasn't answered and can't be inferred, write "(AI will populate)"
- TECH_LEVEL C: never use unexplained acronyms
- Always wait for Phase 3 confirmation before generating files
- Always wait for Phase 5a confirmation before showing the summary card`;
}

export function registerPmSetupPrompt(server: McpServer, getClientInfo: () => ClientCapabilities): void {
  server.prompt(
    'pm-setup',
    'Bootstrap a new PM project workspace with an interactive interview. Creates all management files, initializes decision logging, and tailors everything to your project and working style.',
    {},
    async () => {
      const caps = getClientInfo();
      return {
        messages: [{
          role: 'user',
          content: { type: 'text', text: generateSetupPrompt(caps) },
        }],
      };
    }
  );
}
