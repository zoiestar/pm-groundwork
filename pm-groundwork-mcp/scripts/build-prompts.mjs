#!/usr/bin/env node
/**
 * Generate MCP prompt bodies from the skills/ directory.
 *
 * skills/ is the single source of truth for every workflow. MCP prompts are
 * derived from it, never hand-written. The v2 rewrite died because parity
 * between the two was a manual TODO nobody did — so this is wired into
 * `prebuild`, and `check-parity.mjs` fails the build when the output is stale.
 *
 * MCP has no progressive disclosure: a prompt cannot ask for another file
 * mid-run. So every ${CLAUDE_PLUGIN_ROOT}/... reference in a SKILL.md is
 * inlined here. pm-draft is the exception — inlining all 15 doc types would
 * make one enormous prompt, so it is emitted as a chooser plus one prompt
 * per type, each carrying only its own type file.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const SKILLS = join(REPO, 'skills');
const OUT_DIR = join(REPO, 'pm-groundwork-mcp', 'src', 'generated');
const OUT_FILE = join(OUT_DIR, 'skill-bodies.ts');

/** Skills that become MCP prompts. no-ai-slop ships as a skill only. */
const EXPORTED = ['setup', 'start-session', 'checkpoint', 'end-session', 'pm-project-start', 'pm-draft'];

const stripFrontmatter = (t) => t.replace(/^---\n[\s\S]*?\n---\n/, '');

/** Read a path referenced as ${CLAUDE_PLUGIN_ROOT}/<rel>. */
function readPluginPath(rel) {
  const p = join(REPO, rel);
  if (!existsSync(p)) throw new Error(`referenced file does not exist: ${rel}`);
  return stripFrontmatter(readFileSync(p, 'utf8')).trim();
}

/**
 * Replace every ${CLAUDE_PLUGIN_ROOT}/... reference with the file's contents,
 * appended as a titled section. Placeholder paths containing <angle brackets>
 * are prose, not references — they are left alone.
 */
function inlineReferences(body, skipRels = []) {
  const refs = [...new Set([...body.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([^\s`,)]+)/g)].map((m) => m[1]))]
    .filter((r) => !r.includes('<') && !skipRels.includes(r));

  let out = body.replace(/`?\$\{CLAUDE_PLUGIN_ROOT\}\/([^\s`,)]+)`?/g, (full, rel) =>
    rel.includes('<') ? full : `\`${rel}\` (inlined below)`
  );

  for (const rel of refs) {
    out += `\n\n---\n\n# Reference: ${rel}\n\n${readPluginPath(rel)}\n`;
  }
  return out;
}

const prompts = {};

for (const name of EXPORTED) {
  const skillPath = join(SKILLS, name, 'SKILL.md');
  if (!existsSync(skillPath)) throw new Error(`missing skill: ${name}`);
  const body = stripFrontmatter(readFileSync(skillPath, 'utf8')).trim();

  if (name === 'pm-draft') {
    // Chooser: everything except the per-type files.
    const typesDir = join(SKILLS, 'pm-draft', 'references', 'types');
    const types = readdirSync(typesDir).filter((f) => f.endsWith('.md')).sort();
    prompts['pm-draft'] = inlineReferences(
      body,
      types.map((f) => `skills/pm-draft/references/types/${f}`)
    );
    // One prompt per document type, carrying only its own type file.
    for (const file of types) {
      const slug = file.replace(/\.md$/, '');
      prompts[`pm-draft-${slug}`] =
        inlineReferences(body, types.map((f) => `skills/pm-draft/references/types/${f}`)) +
        `\n\n---\n\n# Document type: ${slug}\n\n` +
        readPluginPath(`skills/pm-draft/references/types/${file}`) +
        `\n\nThe document type is already chosen — do not ask the user to pick one. Skip step 2.\n`;
    }
  } else {
    prompts[name] = inlineReferences(body);
  }
}

/** Hash of every source file, so staleness is detectable without re-running. */
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

const hash = hashSources();
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

const out = `/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Produced by scripts/build-prompts.mjs from the skills/ directory.
 * Edit the SKILL.md files instead, then run \`npm run build\`.
 */

export const SOURCE_HASH = '${hash}';

export const SKILL_BODIES: Record<string, string> = {
${Object.entries(prompts).map(([k, v]) => `  ${JSON.stringify(k)}: \`${esc(v)}\`,`).join('\n')}
};
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, out);

const sizes = Object.entries(prompts).map(([k, v]) => `${k} (${(v.length / 1024).toFixed(1)}kb)`);
console.log(`Generated ${Object.keys(prompts).length} prompts from skills/`);
console.log(`  ${sizes.join('\n  ')}`);
console.log(`  source hash ${hash.slice(0, 12)}`);
