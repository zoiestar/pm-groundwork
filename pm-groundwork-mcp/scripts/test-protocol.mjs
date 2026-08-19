#!/usr/bin/env node
/**
 * Protocol conformance test — a stand-in for a live Cursor / Codex / Gemini run: speak MCP over stdio
 * directly, impersonating each client, and check what the server actually
 * serves back.
 */
import { spawn } from 'node:child_process';

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const SERVER = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'index.js');

function client(clientName, workspaceDir) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [SERVER], {
      env: { ...process.env, PM_WORKSPACE_DIR: workspaceDir },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let buf = '';
    const pending = new Map();
    let id = 0;
    const stderr = [];

    proc.stderr.on('data', (d) => stderr.push(d.toString()));
    proc.stdout.on('data', (d) => {
      buf += d.toString();
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.id != null && pending.has(msg.id)) {
            pending.get(msg.id)(msg);
            pending.delete(msg.id);
          }
        } catch {}
      }
    });

    const send = (method, params) =>
      new Promise((res) => {
        const myId = ++id;
        pending.set(myId, res);
        proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: myId, method, params }) + '\n');
      });
    const notify = (method, params) =>
      proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');

    (async () => {
      try {
        await send('initialize', {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: clientName, version: '1.0.0' },
        });
        notify('notifications/initialized');
        await new Promise((r) => setTimeout(r, 150));
        const api = { send, stderr, close: () => proc.kill() };
        resolve(api);
      } catch (e) {
        proc.kill();
        reject(e);
      }
    })();
  });
}

// Fixtures are built fresh so the test is self-contained.
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const B = mkdtempSync(join(tmpdir(), 'pmg-test-'));
process.on('exit', () => rmSync(B, { recursive: true, force: true }));
for (const d of ['v3', 'v2', 'v1', 'fresh']) mkdirSync(join(B, d), { recursive: true });
mkdirSync(join(B, 'v3/.claude/agent-memory/pm-lead'), { recursive: true });
writeFileSync(join(B, 'v3/PLAN.md'), ['---', 'track: c', 'current_phase: 1', '---', ''].join('\n'));
writeFileSync(join(B, 'v3/.claude/agent-memory/pm-lead/MEMORY.md'), 'v3 memory');
mkdirSync(join(B, 'v2/.claude/agents/pm-lead'), { recursive: true });
mkdirSync(join(B, 'v2/.claude/agent-memory/pm-lead'), { recursive: true });
writeFileSync(join(B, 'v2/.claude/agents/pm-lead/AGENT.md'), '');
writeFileSync(join(B, 'v2/.claude/agent-memory/pm-lead/MEMORY.md'), 'v2 memory');
writeFileSync(join(B, 'v1/MEMORY.md'), 'v1 memory');
let failures = 0;
const check = (label, cond, detail = '') => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${label}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
};

// 1. Prompt inventory
console.log('\n=== prompt inventory (as Cursor) ===');
let c = await client('Cursor', `${B}/v3`);
const list = await c.send('prompts/list', {});
const names = (list.result?.prompts ?? []).map((p) => p.name);
console.log(`  ${names.length} prompts served`);
check('core workflows present', ['pm-setup', 'pm-start-session', 'pm-checkpoint', 'pm-end-session', 'pm-project-start', 'pm-draft'].every((n) => names.includes(n)));
check('per-type draft prompts present', names.filter((n) => n.startsWith('pm-draft-')).length === 15, `${names.filter((n) => n.startsWith('pm-draft-')).length} found`);
check('every prompt has a description', (list.result?.prompts ?? []).every((p) => p.description?.length > 5));

// 2. Client adaptation
console.log('\n=== client adaptation ===');
const cursorSetup = (await c.send('prompts/get', { name: 'pm-setup', arguments: {} })).result.messages[0].content.text;
c.close();

let cc = await client('claude-code', `${B}/v3`);
const claudeSetup = (await cc.send('prompts/get', { name: 'pm-setup', arguments: {} })).result.messages[0].content.text;

check('Cursor gets numbered-list instructions', cursorSetup.includes('numbered list'));
check('Cursor does NOT get raw AskUserQuestion', !/\bAskUserQuestion\b/.test(cursorSetup));
check('Claude Code keeps AskUserQuestion', /AskUserQuestion/.test(claudeSetup));
check('adaptations actually differ', cursorSetup !== claudeSetup, `${Math.abs(cursorSetup.length - claudeSetup.length)} chars apart`);

// 3. Self-containment — no unresolved plugin-root refs
console.log('\n=== self-containment (MCP has no progressive disclosure) ===');
check('no unresolved ${CLAUDE_PLUGIN_ROOT} in setup', !claudeSetup.includes('${CLAUDE_PLUGIN_ROOT}'));
check('shared references inlined', claudeSetup.includes('Reference: skills/_shared/safety.md'));
check('the disclaimer text made it through', claudeSetup.includes('No, stop'));

const prd = (await cc.send('prompts/get', { name: 'pm-draft-prd', arguments: {} })).result.messages[0].content.text;
check('per-type prompt carries only its own type', prd.includes('Document type: prd') && !prd.includes('Document type: wbs'));
check('per-type prompt skips the chooser', prd.includes('do not ask the user to pick one'));

// 4. Layout reporting + tools
console.log('\n=== layout awareness ===');
check('v3 layout reported in prompt', claudeSetup.includes('v3 — .claude/ native'));
cc.close();

for (const [layout, expect] of [['v1', 'v1 — flat files'], ['v2', 'v2 — .claude/ native'], ['fresh', 'no workspace yet']]) {
  const cl = await client('Cursor', `${B}/${layout}`);
  const txt = (await cl.send('prompts/get', { name: 'pm-start-session', arguments: {} })).result.messages[0].content.text;
  check(`${layout} layout detected`, txt.includes(expect));
  cl.close();
}

// 5. Tools read the right file per layout
console.log('\n=== tools honor layout ===');
for (const [layout, expect] of [['v3', 'v3 memory'], ['v2', 'v2 memory'], ['v1', 'v1 memory']]) {
  const cl = await client('Cursor', `${B}/${layout}`);
  const r = await cl.send('tools/call', { name: 'pm_read_workspace', arguments: { file: 'memory' } });
  const text = r.result?.content?.[0]?.text ?? '';
  check(`pm_read_workspace in ${layout}`, text.includes(expect), text.slice(0, 40).replace(/\n/g, ' '));
  cl.close();
}

// 6. Client detection is visible, not silent
console.log('\n=== client detection reporting ===');
const cg = await client('gemini-cli', `${B}/v3`);
// Detection is lazy — it resolves on first prompt use, since clientInfo does
// not exist until after the initialize handshake.
await cg.send('prompts/get', { name: 'pm-setup', arguments: {} });
await new Promise((r) => setTimeout(r, 150));
const err = cg.stderr.join('');
check('server logs the resolved client', /\[pm-groundwork\] client:/.test(err), err.trim().split('\n')[0] ?? '');
check('gemini identified, not "unknown"', /client: gemini/.test(err));
cg.close();

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' FAILURES'}\n`);
process.exit(failures === 0 ? 0 : 1);
