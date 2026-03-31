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
    name: 'Claude Code',
    configDir: '.claude',
    configFile: '.claude/settings.local.json',
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

  // Special: Codex uses TOML in ~/.codex/ (global), not project-level
  // For now, print instructions rather than modifying global config
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
    console.log('No AI tool config directories found (.claude/, .cursor/, .gemini/, .codex/).');
    console.log('Create one first, then re-run: npx pm-groundwork-mcp init\n');
    console.log('Or manually add the MCP server config to your tool:\n');
    console.log('  Claude Code:  .claude/settings.local.json');
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
  console.log('1. Start your AI tool — it will auto-connect to pm-groundwork');
  console.log('2. Use the pm-setup prompt to initialize your PM workspace');
  console.log('3. Use pm-start-session at the start of each work session');
}
