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

// Prompts
import { registerPmSetupPrompt } from './prompts/pm-setup.js';
import { registerPmStartSessionPrompt } from './prompts/pm-start-session.js';
import { registerPmEndSessionPrompt } from './prompts/pm-end-session.js';
import { registerPmDraftPrompt } from './prompts/pm-draft.js';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'pm-groundwork',
    version: '1.0.0',
  });

  // Client capabilities — updated when a client connects
  let clientCaps: ClientCapabilities = { hasAskUserQuestion: false, toolName: 'unknown' };
  const getClientInfo = () => clientCaps;

  // Store a reference so we can detect client on connection
  // The MCP SDK provides client info during initialization
  const originalConnect = server.connect.bind(server);
  server.connect = async (transport) => {
    const result = await originalConnect(transport);
    // Try to detect client from transport or server state
    // The SDK exposes client info after connection
    try {
      const serverAny = server as any;
      if (serverAny._clientInfo) {
        clientCaps = detectClient(serverAny._clientInfo);
      }
    } catch {
      // Fall back to unknown
    }
    return result;
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

  // Register all 4 prompts
  registerPmSetupPrompt(server, getClientInfo);
  registerPmStartSessionPrompt(server, getClientInfo);
  registerPmEndSessionPrompt(server, getClientInfo);
  registerPmDraftPrompt(server, getClientInfo);

  return server;
}
