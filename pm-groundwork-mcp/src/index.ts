#!/usr/bin/env node

/**
 * PM Groundwork MCP Server
 *
 * Cross-tool PM workspace management for Claude Code, Codex, Cursor, and Gemini CLI.
 *
 * Usage:
 *   pm-groundwork-mcp          — Start the MCP server (stdio transport)
 *   pm-groundwork-mcp init     — Set up MCP config for detected AI tools
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { runInit } from './init.js';

const args = process.argv.slice(2);

if (args[0] === 'init') {
  runInit().catch((err) => {
    console.error('Init failed:', err);
    process.exit(1);
  });
} else {
  // Start MCP server with stdio transport
  const server = createServer();
  const transport = new StdioServerTransport();
  server.connect(transport).catch((err) => {
    console.error('Failed to start MCP server:', err);
    process.exit(1);
  });
}
