#!/usr/bin/env node
/**
 * Fail the build when the generated MCP prompts are stale.
 *
 * This exists because PM Groundwork v2 shipped a rewritten set of commands and
 * an MCP server that never caught up, leaving three drifted copies of every
 * workflow and stalling the project for four months. Parity enforced by
 * discipline already failed once. This makes it a build error.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const SKILLS = join(REPO, 'skills');
const GENERATED = join(REPO, 'pm-groundwork-mcp', 'src', 'generated', 'skill-bodies.ts');

function fail(msg) {
  console.error(`\nPARITY CHECK FAILED\n\n${msg}\n`);
  console.error('Fix: npm run build:prompts   (or just npm run build)\n');
  process.exit(1);
}

if (!existsSync(GENERATED)) {
  fail('src/generated/skill-bodies.ts does not exist.\nThe MCP server has no prompts, so Cursor, Codex, and Gemini users get nothing.');
}

function hashSources() {
  const h = createHash('sha256');
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.md')) h.update(entry.name).update(readFileSync(p));
    }
  };
  walk(SKILLS);
  return h.digest('hex');
}

const current = hashSources();
const generated = readFileSync(GENERATED, 'utf8');
const match = generated.match(/SOURCE_HASH = '([a-f0-9]+)'/);

if (!match) fail('Could not find SOURCE_HASH in the generated file. It may have been hand-edited.');

if (match[1] !== current) {
  fail(
    `skills/ has changed since the MCP prompts were generated.\n\n` +
      `  skills/ hash:    ${current.slice(0, 16)}\n` +
      `  generated from:  ${match[1].slice(0, 16)}\n\n` +
      `Claude Code users would get the new behavior; Cursor, Codex, and Gemini users would get the old.`
  );
}

console.log(`Parity OK — MCP prompts match skills/ (${current.slice(0, 12)})`);
