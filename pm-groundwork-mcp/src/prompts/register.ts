/**
 * Registers every MCP prompt from the generated skill bodies.
 *
 * This replaces the four hand-written prompt generators that existed through
 * v2. Workflow prose now lives only in skills/*​/SKILL.md; anything written
 * here would be a fifth copy waiting to drift.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SKILL_BODIES } from '../generated/skill-bodies.js';
import type { ClientCapabilities } from './prompt-utils.js';
import { detectLayout, describeLayout } from '../workspace/layout.js';

/** Human-facing titles. Anything not listed falls back to its key. */
const TITLES: Record<string, string> = {
  setup: 'Set up a PM workspace',
  'start-session': 'Start a working session',
  checkpoint: 'Checkpoint progress',
  'end-session': 'End the session',
  'pm-project-start': 'Start the project — pick a track and build the plan',
  'pm-draft': 'Draft a PM document',
};

const DESCRIPTIONS: Record<string, string> = {
  setup: 'Bootstrap project memory, a decision log, and session rules. Asks permission before writing.',
  'start-session': 'Read the workspace and git history, then brief on where things stand.',
  checkpoint: 'Save progress mid-session — plan updates, decisions, daily log. No commit.',
  'end-session': 'Wrap up: daily log, plan roll-forward, memory, secret scan, commit.',
  'pm-project-start': 'Choose documentation, prototype, or full delivery, then build PLAN.md and the document set.',
  'pm-draft': 'Draft a PRD, charter, roadmap, risk plan, status report, and more.',
};

/**
 * Adapt a skill body for the connected client.
 *
 * Skills are authored for Claude Code, which has AskUserQuestion and its own
 * file tools. Every other client needs the questions rendered as numbered
 * lists and the tool names swapped for MCP equivalents.
 */
function adaptForClient(body: string, caps: ClientCapabilities): string {
  let out = body;

  if (!caps.hasAskUserQuestion) {
    out = out.replace(
      /Use `?AskUserQuestion`?/g,
      'Present the following as a numbered list and wait for a reply'
    );
    out = out.replace(/\bAskUserQuestion\b/g, 'a numbered list of options');
    out =
      `**How to ask questions in this client**\n\n` +
      `This client has no structured question tool. Present each question as a numbered list, ` +
      `note that the user can answer with a number or in their own words, and wait for a reply ` +
      `before continuing. Ask one question at a time.\n\n---\n\n` +
      out;
  }

  // Claude Code file tools -> MCP tools.
  out = out
    .replace(/\bRead, Write, Edit, Glob, Grep, Bash\b/g, 'the pm_* MCP tools')
    .replace(/\buse the Read tool\b/gi, 'use pm_read_workspace')
    .replace(/\buse the Write tool\b/gi, 'use pm_write_workspace_file');

  // Skill-to-skill invocation has no MCP equivalent; point at the sibling prompt.
  out = out.replace(
    /invoke the `?([a-z-]+)`? skill/gi,
    (_m, name) => `use the \`${name}\` prompt from this MCP server`
  );
  out = out.replace(
    /Run the `?no-ai-slop`? skill in detect mode/gi,
    'Review the draft for AI-writing patterns — named patterns with quoted lines, no rewrite'
  );

  const layout = detectLayout();
  out += `\n\n---\n\n**Detected workspace layout:** ${describeLayout(layout)}\n`;

  return out;
}

export function registerAllPrompts(server: McpServer, getClientInfo: () => ClientCapabilities): void {
  for (const [name, body] of Object.entries(SKILL_BODIES)) {
    const promptName = `pm-${name}`.replace(/^pm-pm-/, 'pm-');

    server.registerPrompt(
      promptName,
      {
        title: TITLES[name] ?? name,
        description:
          DESCRIPTIONS[name] ??
          (name.startsWith('pm-draft-')
            ? `Draft a ${name.replace('pm-draft-', '').replace(/-/g, ' ')}.`
            : name),
      },
      () => ({
        messages: [
          {
            role: 'user' as const,
            content: { type: 'text' as const, text: adaptForClient(body, getClientInfo()) },
          },
        ],
      })
    );
  }
}
