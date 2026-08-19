/**
 * MCP server setup — registers all tools, resources, and prompts.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { detectClient } from './prompts/prompt-utils.js';
import type { ClientCapabilities } from './prompts/prompt-utils.js';

// Tools
import { registerReadWorkspace } from './tools/read-workspace.js';
import { registerWriteWorkspaceFile } from './tools/write-workspace-file.js';
import { registerUpdateWorkspaceFile } from './tools/update-workspace-file.js';
import { registerLogDecision } from './tools/log-decision.js';
import { registerWriteDailyLog } from './tools/write-daily-log.js';
import { registerScanWorkspace } from './tools/scan-workspace.js';
import { registerScanProjectFiles } from './tools/scan-project-files.js';
import { registerCheckDecisionsDue } from './tools/check-decisions-due.js';

// Resources
import { registerWorkspaceResources } from './resources/workspace-resources.js';

// Prompts — generated from skills/, registered by one loop
import { registerAllPrompts } from './prompts/register.js';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'pm-groundwork',
    version: '3.0.0',
  });

  // Client capabilities are resolved lazily.
  //
  // The MCP handshake means clientInfo does not exist until the client sends
  // `initialize`, which happens AFTER connect() resolves. Detecting at connect
  // time always produced 'unknown', which silently served every client —
  // including Claude Code — the degraded numbered-list prompts with no symptom.
  let clientCaps: ClientCapabilities | null = null;
  let reported = false;

  const getClientInfo = (): ClientCapabilities => {
    if (clientCaps) return clientCaps;
    let info: { name?: string } | undefined;
    try {
      info = server.server.getClientVersion();
    } catch {
      info = (server as any)._clientInfo;
    }
    if (!info) {
      // Not connected yet — don't cache a guess.
      return { hasAskUserQuestion: false, toolName: 'unknown' };
    }
    clientCaps = detectClient(info);
    if (!reported) {
      reported = true;
      console.error(
        `[pm-groundwork] client: ${clientCaps.toolName}` +
          (clientCaps.toolName === 'unknown'
            ? ` — could not identify "${info.name ?? ''}"; using numbered-list prompts`
            : '')
      );
    }
    return clientCaps;
  };

  // Register all 8 tools
  registerReadWorkspace(server);
  registerWriteWorkspaceFile(server);
  registerUpdateWorkspaceFile(server);
  registerLogDecision(server);
  registerWriteDailyLog(server);
  registerScanWorkspace(server);
  registerScanProjectFiles(server);
  registerCheckDecisionsDue(server);

  // Register all 5 resources
  registerWorkspaceResources(server);

  // Register every prompt generated from skills/
  registerAllPrompts(server, getClientInfo);

  return server;
}
