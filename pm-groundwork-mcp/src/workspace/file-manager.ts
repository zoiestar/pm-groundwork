/**
 * Core file read/write/scan logic for PM workspace files.
 */

import { readFile, writeFile, mkdir, stat, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { WORKSPACE_FILES, MEMORY_DIR, PLANNING_DIR, getWorkspaceDir } from './config.js';
import type { WorkspaceFileName } from './config.js';

export interface FileInfo {
  name: string;
  exists: boolean;
  modifiedAt?: string;
  size?: number;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function readWorkspaceFile(filename: string): Promise<string | null> {
  const filePath = join(getWorkspaceDir(), filename);
  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export async function writeWorkspaceFile(filename: string, content: string): Promise<void> {
  const filePath = join(getWorkspaceDir(), filename);
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, content, 'utf-8');
}

export async function updateWorkspaceFileSection(
  filename: string,
  section: string,
  content: string,
  mode: 'append' | 'replace'
): Promise<{ success: boolean; message: string }> {
  const existing = await readWorkspaceFile(filename);
  if (existing === null) {
    return { success: false, message: `File ${filename} does not exist.` };
  }

  // Find the section header (## Section Name)
  const sectionPattern = new RegExp(`(## ${escapeRegex(section)}[^\n]*\n)`, 'i');
  const match = existing.match(sectionPattern);

  if (!match || match.index === undefined) {
    // Section not found — append at end
    if (mode === 'append') {
      const updated = existing.trimEnd() + `\n\n## ${section}\n\n${content}\n`;
      await writeWorkspaceFile(filename, updated);
      return { success: true, message: `Section "${section}" appended to ${filename}.` };
    }
    return { success: false, message: `Section "${section}" not found in ${filename}.` };
  }

  const sectionStart = match.index + match[0].length;

  // Find next section (## at start of line) or end of file
  const nextSectionMatch = existing.slice(sectionStart).match(/\n## /);
  const sectionEnd = nextSectionMatch && nextSectionMatch.index !== undefined
    ? sectionStart + nextSectionMatch.index
    : existing.length;

  if (mode === 'replace') {
    const updated =
      existing.slice(0, sectionStart) + '\n' + content + '\n' + existing.slice(sectionEnd);
    await writeWorkspaceFile(filename, updated);
    return { success: true, message: `Section "${section}" replaced in ${filename}.` };
  }

  // Append within section
  const updated =
    existing.slice(0, sectionEnd) + '\n' + content + existing.slice(sectionEnd);
  await writeWorkspaceFile(filename, updated);
  return { success: true, message: `Content appended to section "${section}" in ${filename}.` };
}

export async function scanWorkspace(): Promise<FileInfo[]> {
  const dir = getWorkspaceDir();
  const results: FileInfo[] = [];

  for (const name of WORKSPACE_FILES) {
    const filePath = join(dir, name);
    try {
      const s = await stat(filePath);
      results.push({
        name,
        exists: true,
        modifiedAt: s.mtime.toISOString(),
        size: s.size,
      });
    } catch {
      results.push({ name, exists: false });
    }
  }

  // Check memory/ directory
  const memDir = join(dir, MEMORY_DIR);
  try {
    const files = await readdir(memDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    for (const f of mdFiles) {
      const s = await stat(join(memDir, f));
      results.push({
        name: `${MEMORY_DIR}/${f}`,
        exists: true,
        modifiedAt: s.mtime.toISOString(),
        size: s.size,
      });
    }
  } catch {
    // memory/ doesn't exist yet
  }

  // Check .planning/ directory
  const planDir = join(dir, PLANNING_DIR);
  const planningExists = await fileExists(planDir);
  results.push({
    name: PLANNING_DIR,
    exists: planningExists,
  });

  return results;
}

export async function scanProjectFiles(patterns?: string[]): Promise<string[]> {
  const dir = getWorkspaceDir();
  const found: string[] = [];

  // Simple recursive scan for common project files
  const targetPatterns = patterns || ['*.md', '*.txt', '*.rst'];

  async function scanDir(currentDir: string, depth: number): Promise<void> {
    if (depth > 2) return; // Limit depth
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

        const fullPath = join(currentDir, entry.name);
        if (entry.isDirectory() && depth < 2) {
          await scanDir(fullPath, depth + 1);
        } else if (entry.isFile()) {
          const matchesPattern = targetPatterns.some(p => {
            if (p.startsWith('*')) {
              return entry.name.endsWith(p.slice(1));
            }
            return entry.name === p || entry.name.startsWith(p.replace('*', ''));
          });
          if (matchesPattern) {
            // Return relative path
            found.push(fullPath.slice(dir.length + 1).replace(/\\/g, '/'));
          }
        }
      }
    } catch {
      // Skip unreadable directories
    }
  }

  await scanDir(dir, 0);
  return found;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
