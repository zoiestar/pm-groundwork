/**
 * Workspace file configuration — names, paths, and defaults for PM workspace files.
 */

export const WORKSPACE_FILES = [
  'CLAUDE.md',
  'CONTEXT.md',
  'MEMORY.md',
  'USER.md',
  'DECISIONS.md',
  'IDENTITY.md',
  'SOUL.md',
  'HEARTBEAT.md',
  'AGENTS.md',
] as const;

export type WorkspaceFileName = (typeof WORKSPACE_FILES)[number];

export const MEMORY_DIR = 'memory';
export const DOCS_DIR = 'docs';
export const PLANNING_DIR = '.planning';

/** Tool-specific auto-load entrypoint files */
export const TOOL_ENTRYPOINTS: Record<string, string> = {
  'claude-code': 'CLAUDE.md',
  codex: 'AGENTS.md',
  cursor: '.cursor/rules/pm-groundwork.mdc',
  gemini: 'GEMINI.md',
};

/** Tool-specific config directories to detect which tools are installed */
export const TOOL_CONFIG_DIRS: Record<string, string> = {
  'claude-code': '.claude',
  codex: '.codex',
  cursor: '.cursor',
  gemini: '.gemini',
};

/** Project file patterns to scan for existing context */
export const PROJECT_FILE_PATTERNS = [
  '*.md',
  '**/*.md',
  '*.txt',
  '*.rst',
  'README*',
  'docs/**/*',
  '*.brief',
  '*.spec',
];

export function getWorkspaceDir(): string {
  return process.env['PM_WORKSPACE_DIR'] || process.cwd();
}
