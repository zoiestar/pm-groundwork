/**
 * Decision ID sequencing, review date parsing, and cross-referencing.
 */

import { readWorkspaceFile, writeWorkspaceFile, updateWorkspaceFileSection } from './file-manager.js';

export interface Decision {
  id: string;
  title: string;
  date: string;
  owner: string;
  status: string;
  reviewDate?: string;
}

export interface NewDecision {
  title: string;
  decision: string;
  context: string;
  rationale: string;
  alternatives: Array<{ option: string; why_rejected: string }>;
  confidence: 'High' | 'Medium' | 'Low';
  owner: string;
  deciders: string;
  implications: string;
  date?: string;
  review_date: string;
  supporting_docs?: string;
}

/**
 * Parse DECISIONS.md to find the highest decision ID.
 */
export async function getNextDecisionId(): Promise<string> {
  const content = await readWorkspaceFile('DECISIONS.md');
  if (!content) return '#001';

  const matches = content.matchAll(/#(\d{3})/g);
  let maxId = 0;
  for (const match of matches) {
    const id = parseInt(match[1], 10);
    if (id > maxId) maxId = id;
  }

  return `#${String(maxId + 1).padStart(3, '0')}`;
}

/**
 * Add a new decision entry to DECISIONS.md and update MEMORY.md index.
 */
export async function logDecision(input: NewDecision): Promise<{ id: string; message: string }> {
  const id = await getNextDecisionId();
  const today = new Date().toISOString().split('T')[0];

  const alternativesTable = input.alternatives.length > 0
    ? input.alternatives.map(a => `| ${a.option} | ${a.why_rejected} |`).join('\n')
    : '| (none considered) | — |';

  const entry = `
### ${id} — ${input.title}

**Date:** ${input.date || today}
**Owner:** ${input.owner}
**Deciders:** ${input.deciders}
**Status:** Active

**Decision:**
${input.decision}

**Context:**
${input.context}

**Rationale:**
${input.rationale}

**Alternatives considered:**
| Option | Why rejected |
|--------|-------------|
${alternativesTable}

**Confidence:** ${input.confidence}

**Implications:**
${input.implications}

**Supporting docs:** ${input.supporting_docs || 'None'}

**Review date:** ${input.review_date}

---`;

  // Append to DECISIONS.md
  const decisions = await readWorkspaceFile('DECISIONS.md');
  if (decisions) {
    // Insert before the final comment marker, or at end
    const insertMarker = '<!-- Add new entries above this line';
    if (decisions.includes(insertMarker)) {
      const updated = decisions.replace(insertMarker, entry + '\n' + insertMarker);
      await writeWorkspaceFile('DECISIONS.md', updated);
    } else {
      // Just append
      await writeWorkspaceFile('DECISIONS.md', decisions.trimEnd() + '\n' + entry + '\n');
    }

    // Update the index table
    const indexRow = `| [${id}] | ${input.title} | ${input.date || today} | ${input.owner} | Active |`;
    const indexMarker = '| # | Decision | Date | Owner | Status |';
    if (decisions.includes(indexMarker)) {
      // Find the line after the table header separator
      const headerIdx = decisions.indexOf(indexMarker);
      const separatorIdx = decisions.indexOf('\n', headerIdx);
      const nextLineIdx = decisions.indexOf('\n', separatorIdx + 1);
      // Re-read to get updated content
      const updatedDecisions = await readWorkspaceFile('DECISIONS.md');
      if (updatedDecisions) {
        const hIdx = updatedDecisions.indexOf(indexMarker);
        const sepIdx = updatedDecisions.indexOf('\n', hIdx);
        const nextIdx = updatedDecisions.indexOf('\n', sepIdx + 1);
        const finalContent = updatedDecisions.slice(0, nextIdx + 1) + indexRow + '\n' + updatedDecisions.slice(nextIdx + 1);
        await writeWorkspaceFile('DECISIONS.md', finalContent);
      }
    }
  }

  // Add one-liner to MEMORY.md Key decisions table
  const memoryRow = `| ${input.date || today} | ${input.decision.split('\n')[0].slice(0, 80)} | [${id}] |`;
  await updateWorkspaceFileSection('MEMORY.md', 'Key decisions', memoryRow, 'append');

  return { id, message: `Decision ${id} — ${input.title} logged successfully.` };
}

/**
 * Find decisions with review date <= today.
 */
export async function checkDecisionsDue(): Promise<Decision[]> {
  const content = await readWorkspaceFile('DECISIONS.md');
  if (!content) return [];

  const today = new Date().toISOString().split('T')[0];
  const due: Decision[] = [];

  // Parse each decision entry
  const entryPattern = /### (#\d{3}) — (.+)\n[\s\S]*?(?=### #\d{3}|<!-- Add new entries|$)/g;
  let match;

  while ((match = entryPattern.exec(content)) !== null) {
    const block = match[0];
    const id = match[1];
    const title = match[2];

    const dateMatch = block.match(/\*\*Date:\*\*\s*(.+)/);
    const ownerMatch = block.match(/\*\*Owner:\*\*\s*(.+)/);
    const statusMatch = block.match(/\*\*Status:\*\*\s*(.+)/);
    const reviewMatch = block.match(/\*\*Review date:\*\*\s*(.+)/);

    if (reviewMatch) {
      const reviewDate = reviewMatch[1].trim();
      // Only flag if review date is a valid date and <= today, and status is Active
      const status = statusMatch?.[1]?.trim() || 'Active';
      if (status === 'Active' && reviewDate <= today && /^\d{4}-\d{2}-\d{2}$/.test(reviewDate)) {
        due.push({
          id,
          title: title.trim(),
          date: dateMatch?.[1]?.trim() || '',
          owner: ownerMatch?.[1]?.trim() || '',
          status,
          reviewDate,
        });
      }
    }
  }

  return due;
}
