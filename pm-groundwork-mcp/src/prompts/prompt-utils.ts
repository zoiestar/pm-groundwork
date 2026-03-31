/**
 * Shared prompt utilities — question formatting, client capability detection.
 */

export interface QuestionOption {
  label: string;
  description: string;
}

export interface ClientCapabilities {
  hasAskUserQuestion: boolean;
  toolName: string; // 'claude-code' | 'codex' | 'cursor' | 'gemini' | 'unknown'
}

/**
 * Detect client capabilities from MCP client info.
 */
export function detectClient(clientInfo?: { name?: string }): ClientCapabilities {
  const name = (clientInfo?.name || '').toLowerCase();

  if (name.includes('claude') || name.includes('anthropic')) {
    return { hasAskUserQuestion: true, toolName: 'claude-code' };
  }
  if (name.includes('codex') || name.includes('openai')) {
    return { hasAskUserQuestion: false, toolName: 'codex' };
  }
  if (name.includes('cursor')) {
    return { hasAskUserQuestion: false, toolName: 'cursor' };
  }
  if (name.includes('gemini') || name.includes('google')) {
    return { hasAskUserQuestion: false, toolName: 'gemini' };
  }

  return { hasAskUserQuestion: false, toolName: 'unknown' };
}

/**
 * Format a question for the AI to present to the user.
 * Claude Code gets AskUserQuestion syntax; others get numbered lists.
 */
export function formatQuestion(
  question: string,
  options: QuestionOption[],
  capabilities: ClientCapabilities,
  multiSelect: boolean = false,
): string {
  if (capabilities.hasAskUserQuestion) {
    const optionLines = options
      .map(o => `- "${o.label}" \u2192 "${o.description}"`)
      .join('\n');
    return `Use AskUserQuestion${multiSelect ? ' with multiSelect: true' : ''}:
**Question:** "${question}"
**Options:**
${optionLines}`;
  }

  // Numbered list for all other tools
  const optionLines = options
    .map((o, i) => `${i + 1}. **${o.label}** \u2014 ${o.description}`)
    .join('\n');
  const selectNote = multiSelect ? ' (select all that apply)' : '';
  return `Ask the user the following question${selectNote}. Present it exactly as shown and wait for their response before proceeding.

**${question}**

${optionLines}

Or they can type a custom answer.`;
}

/**
 * Format the "how to ask questions" preamble for prompts.
 */
export function questionPreamble(capabilities: ClientCapabilities): string {
  if (capabilities.hasAskUserQuestion) {
    return `## How to ask questions

Use AskUserQuestion for EVERY question in this flow. This gives the
user interactive, selectable options instead of walls of text.

Rules:
- One question at a time \u2014 never batch multiple questions into one message
- Always include descriptive subtitle text on each option
- Always include an "Other" option for freeform answers (unless the choices
  are truly exhaustive, like yes/no)
- After the user answers, briefly acknowledge their choice before moving
  to the next question \u2014 don't just silently advance`;
  }

  return `## How to ask questions

Present questions one at a time as numbered lists. This keeps the
conversation focused and easy to follow.

Rules:
- One question at a time \u2014 never batch multiple questions into one message
- Include a brief description for each option
- Always offer the option to type a custom answer
- After the user answers, briefly acknowledge their choice before moving
  to the next question \u2014 don't just silently advance`;
}

/**
 * Get the tool-appropriate entrypoint file name.
 */
export function getEntrypointFilename(capabilities: ClientCapabilities): string {
  switch (capabilities.toolName) {
    case 'claude-code': return 'CLAUDE.md';
    case 'codex': return 'AGENTS.md';
    case 'cursor': return '.cursor/rules/pm-groundwork.mdc';
    case 'gemini': return 'GEMINI.md';
    default: return 'CLAUDE.md';
  }
}

/**
 * Replace tool references in prompt text based on client.
 * Maps Claude Code tool names to MCP tool names.
 */
export function adaptToolReferences(text: string): string {
  return text
    .replace(/\bthe Read tool\b/g, 'the pm_read_workspace tool')
    .replace(/\bthe Write tool\b/g, 'the pm_write_workspace_file tool')
    .replace(/\bthe Edit tool\b/g, 'the pm_update_workspace_file tool')
    .replace(/\bthe Glob tool\b/g, 'the pm_scan_project_files tool')
    .replace(/\bthe Grep tool\b/g, 'the pm_read_workspace tool');
}
