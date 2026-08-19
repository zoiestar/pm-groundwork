/**
 * Workspace layout detection and path resolution.
 *
 * PM Groundwork has shipped three workspace layouts. Files must be read from
 * wherever they actually are, and written back to the same place — a v1 user
 * who never migrates keeps working.
 *
 * This mirrors skills/_shared/layout.md. If you change one, change both.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getWorkspaceDir } from './config.js';

export type Layout = 'v3' | 'v2' | 'v1' | 'fresh';

/**
 * Logical file names, independent of where a given layout puts them.
 * Tools and resources refer to these, never to raw paths.
 */
export const LOGICAL_FILES = [
  'entrypoint',
  'context',
  'user',
  'memory',
  'decisions',
  'agent',
  'behavior',
  'session-protocol',
  'plan',
] as const;

export type LogicalFile = (typeof LOGICAL_FILES)[number];

const V3_PATHS: Record<LogicalFile, string> = {
  entrypoint: 'CLAUDE.md',
  context: 'CONTEXT.md',
  user: 'USER.md',
  memory: '.claude/agent-memory/pm-lead/MEMORY.md',
  decisions: '.claude/agent-memory/pm-lead/DECISIONS.md',
  agent: '.claude/agents/pm-lead/AGENT.md',
  behavior: '.claude/rules/behavior.md',
  'session-protocol': '.claude/rules/session-protocol.md',
  plan: 'PLAN.md',
};

/** v2 is identical to v3 except it has no PLAN.md. */
const V2_PATHS: Record<LogicalFile, string> = { ...V3_PATHS };

const V1_PATHS: Record<LogicalFile, string> = {
  entrypoint: 'CLAUDE.md',
  context: 'CONTEXT.md',
  user: 'USER.md',
  memory: 'MEMORY.md',
  decisions: 'DECISIONS.md',
  agent: 'IDENTITY.md',
  behavior: 'AGENTS.md',
  'session-protocol': 'HEARTBEAT.md',
  plan: 'PLAN.md',
};

/**
 * Detect which layout a workspace uses. Checked in order, first match wins —
 * the same order as skills/_shared/layout.md.
 */
export function detectLayout(dir: string = getWorkspaceDir()): Layout {
  const has = (p: string) => existsSync(join(dir, p));

  if (has('PLAN.md')) {
    // v3 only if it's actually our plan file, not some unrelated PLAN.md.
    try {
      const head = readFileSync(join(dir, 'PLAN.md'), 'utf8').slice(0, 400);
      if (/^track:\s*[abc]/im.test(head)) return 'v3';
    } catch {
      // fall through — an unreadable PLAN.md doesn't decide the layout
    }
  }
  if (has('.claude/agents/pm-lead/AGENT.md')) return 'v2';
  if (has('MEMORY.md') || has('IDENTITY.md') || has('SOUL.md') || has('HEARTBEAT.md')) return 'v1';
  return 'fresh';
}

/**
 * Resolve a logical file name to an absolute path for the detected layout.
 * A fresh workspace resolves to v3 paths, since that's what setup will create.
 */
export function resolvePath(
  logical: LogicalFile,
  dir: string = getWorkspaceDir(),
  layout: Layout = detectLayout(dir)
): string {
  const table = layout === 'v1' ? V1_PATHS : layout === 'v2' ? V2_PATHS : V3_PATHS;
  return join(dir, table[logical]);
}

/**
 * Resolve a path that may be either a logical name or a literal relative path.
 * Tools accept both so callers can say 'memory' or 'docs/prd-2026-08-19.md'.
 *
 * Literal paths are confined to the workspace directory — a path that escapes
 * it throws rather than reading or writing outside the project.
 */
export function resolveAny(nameOrPath: string, dir: string = getWorkspaceDir()): string {
  if ((LOGICAL_FILES as readonly string[]).includes(nameOrPath)) {
    return resolvePath(nameOrPath as LogicalFile, dir);
  }
  const resolved = join(dir, nameOrPath);
  const normalizedDir = join(dir, '.');
  if (!resolved.startsWith(normalizedDir)) {
    throw new Error(`Path escapes the workspace directory: ${nameOrPath}`);
  }
  return resolved;
}

/** Human-readable summary, used by scan and status reporting. */
export function describeLayout(layout: Layout): string {
  switch (layout) {
    case 'v3':
      return 'v3 — .claude/ native with PLAN.md';
    case 'v2':
      return 'v2 — .claude/ native, no delivery plan yet';
    case 'v1':
      return 'v1 — flat files at the project root';
    case 'fresh':
      return 'no workspace yet — run pm-setup';
  }
}
