/**
 * Session-numbered daily log management.
 */

import { readWorkspaceFile, writeWorkspaceFile } from './file-manager.js';
import { MEMORY_DIR } from './config.js';

export interface DailyLogContent {
  title: string;
  what_happened: string[];
  decisions_made: string;
  stakeholder_updates?: string;
  blockers_risks?: string;
  files_changed?: string[];
  next_actions: string[];
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getLogFilename(date?: string): string {
  return `${MEMORY_DIR}/${date || getTodayDate()}.md`;
}

/**
 * Get the next session number for a given date's log file.
 */
async function getNextSessionNumber(date?: string): Promise<number> {
  const content = await readWorkspaceFile(getLogFilename(date));
  if (!content) return 1;

  const sessionMatches = content.matchAll(/## Session (\d+)/g);
  let maxSession = 0;
  for (const match of sessionMatches) {
    const num = parseInt(match[1], 10);
    if (num > maxSession) maxSession = num;
  }

  return maxSession + 1;
}

/**
 * Create or append to a daily log file.
 */
export async function writeDailyLog(
  date: string | undefined,
  sessionNumber: number | undefined,
  title: string,
  content: DailyLogContent
): Promise<{ filename: string; sessionNumber: number; message: string }> {
  const logDate = date || getTodayDate();
  const filename = getLogFilename(logDate);
  const existing = await readWorkspaceFile(filename);
  const sessNum = sessionNumber || await getNextSessionNumber(logDate);

  const nextActionsFormatted = content.next_actions
    .map(a => `- ${a}`)
    .join('\n');

  const whatHappenedFormatted = content.what_happened
    .map(a => `- ${a}`)
    .join('\n');

  const filesFormatted = content.files_changed
    ? content.files_changed.map(f => `- ${f}`).join('\n')
    : '- (none)';

  const sessionBlock = `
## Session ${sessNum} — ${title}

### What happened
${whatHappenedFormatted}

### Decisions made
${content.decisions_made || 'None'}

### Stakeholder updates
${content.stakeholder_updates || 'None'}

### Blockers / risks identified
${content.blockers_risks || 'None'}

### Files created/updated
${filesFormatted}

### Next actions
${nextActionsFormatted}
`;

  if (!existing) {
    // Create new file
    const newFile = `# Daily Log — ${logDate}

## Session summary
(Updated at end of day)

---
${sessionBlock}
---
`;
    await writeWorkspaceFile(filename, newFile);
  } else {
    // Append new session
    await writeWorkspaceFile(filename, existing.trimEnd() + '\n\n---\n' + sessionBlock + '---\n');
  }

  return {
    filename,
    sessionNumber: sessNum,
    message: `Daily log ${logDate} updated — Session ${sessNum}: ${title}`,
  };
}

/**
 * Read the most recent daily log(s).
 */
export async function getRecentLogs(count: number = 2): Promise<Array<{ date: string; content: string }>> {
  const { readdir } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const { getWorkspaceDir } = await import('./config.js');

  const memDir = join(getWorkspaceDir(), MEMORY_DIR);
  const logs: Array<{ date: string; content: string }> = [];

  try {
    const files = await readdir(memDir);
    const mdFiles = files
      .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .sort()
      .reverse()
      .slice(0, count);

    for (const f of mdFiles) {
      const content = await readWorkspaceFile(`${MEMORY_DIR}/${f}`);
      if (content) {
        logs.push({ date: f.replace('.md', ''), content });
      }
    }
  } catch {
    // memory/ doesn't exist
  }

  return logs;
}
