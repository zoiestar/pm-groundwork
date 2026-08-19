/**
 * CLI init command — detects installed AI tools and writes MCP server config for each.
 */

import { stat, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

interface ToolConfig {
  name: string;
  configDir: string;
  configFile: string;
  generate: () => string;
}

const TOOLS: ToolConfig[] = [
  {
    name: 'Cursor',
    configDir: '.cursor',
    configFile: '.cursor/mcp.json',
    generate: () => JSON.stringify({
      mcpServers: {
        'pm-groundwork': {
          command: 'npx',
          args: ['-y', 'pm-groundwork-mcp'],
        },
      },
    }, null, 2),
  },
  {
    name: 'Gemini CLI',
    configDir: '.gemini',
    configFile: '.gemini/settings.json',
    generate: () => JSON.stringify({
      mcpServers: {
        'pm-groundwork': {
          command: 'npx',
          args: ['-y', 'pm-groundwork-mcp'],
        },
      },
    }, null, 2),
  },
];

async function dirExists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function runInit(): Promise<void> {
  const cwd = process.cwd();
  console.log('PM Groundwork MCP — Initializing\n');
  console.log(`Working directory: ${cwd}\n`);

  const detected: string[] = [];
  const configured: string[] = [];
  const skipped: string[] = [];

  for (const tool of TOOLS) {
    const configDirPath = join(cwd, tool.configDir);
    const configFilePath = join(cwd, tool.configFile);

    if (await dirExists(configDirPath)) {
      detected.push(tool.name);

      // Check if config file already exists
      if (await fileExists(configFilePath)) {
        // Merge MCP server config into existing file
        try {
          const existing = JSON.parse(await readFile(configFilePath, 'utf-8'));
          if (existing.mcpServers?.['pm-groundwork']) {
            skipped.push(`${tool.name} — already configured`);
            continue;
          }
          // Merge
          existing.mcpServers = existing.mcpServers || {};
          existing.mcpServers['pm-groundwork'] = {
            command: 'npx',
            args: ['-y', 'pm-groundwork-mcp'],
          };
          await writeFile(configFilePath, JSON.stringify(existing, null, 2), 'utf-8');
          configured.push(tool.name);
        } catch {
          // Can't parse existing — write new
          await writeFile(configFilePath, tool.generate(), 'utf-8');
          configured.push(tool.name);
        }
      } else {
        // Create new config file
        await mkdir(dirname(configFilePath), { recursive: true });
        await writeFile(configFilePath, tool.generate(), 'utf-8');
        configured.push(tool.name);
      }
    }
  }

  // Claude Code, Desktop, and Cowork should install the plugin instead — it
  // ships the skills directly. Configuring this server there would add a second,
  // redundant path and spawn a Node process every session for no benefit.
  const claudeDir = join(cwd, '.claude');
  if (await dirExists(claudeDir)) {
    console.log('Claude Code detected. You do not need this server —');
    console.log('install the plugin instead, which includes everything:\n');
    console.log('  /plugin marketplace add zoiestar/pm-groundwork');
    console.log('  /plugin install pm-groundwork\n');
  }

  // Codex uses TOML in ~/.codex/ (global), not project-level, so print
  // instructions rather than editing a global config file.
  const codexDir = join(cwd, '.codex');
  if (await dirExists(codexDir)) {
    detected.push('Codex CLI');
    console.log('Codex CLI detected — add this to your ~/.codex/config.toml:\n');
    console.log('  [mcp_servers.pm-groundwork]');
    console.log('  command = "npx"');
    console.log('  args = ["-y", "pm-groundwork-mcp"]\n');
  }

  // Summary
  console.log('--- Summary ---\n');

  if (detected.length === 0) {
    console.log('No supported AI tool found in this folder (.cursor/, .gemini/, .codex/).');
    console.log('Open this folder in Cursor, Codex CLI, or Gemini CLI once, then re-run:');
    console.log('  npx pm-groundwork-mcp init\n');
    console.log('Or add the config manually:\n');
    console.log('  Cursor:       .cursor/mcp.json');
    console.log('  Gemini CLI:   .gemini/settings.json');
    console.log('  Codex CLI:    ~/.codex/config.toml');
    return;
  }

  if (configured.length > 0) {
    console.log(`Configured: ${configured.join(', ')}`);
  }
  if (skipped.length > 0) {
    console.log(`Skipped: ${skipped.join(', ')}`);
  }

  console.log('\nNext steps:');
  console.log('1. Restart your AI tool so it picks up the new config');
  console.log('2. Run the pm-setup prompt to build your PM workspace');
  console.log('3. Run pm-start-session at the start of each working session,');
  console.log('   and pm-end-session when you finish');
}
