/**
 * Workspace file configuration — names, paths, and defaults for PM workspace files.
 */

/**
 * Legacy v1 flat-file names, kept only so migration can find them.
 * Live path resolution belongs to layout.ts — do not add to this list.
 */
export const V1_FLAT_FILES = [
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

export const MEMORY_DIR = 'memory';
export const DOCS_DIR = 'docs';
/**
 * Legacy GSD planning directory. PM Groundwork v3 never reads or writes it —
 * this exists only so scans can report it and offer a one-time import.
 */
export const LEGACY_PLANNING_DIR = '.planning';

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
