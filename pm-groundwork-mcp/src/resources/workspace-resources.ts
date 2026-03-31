import { readWorkspaceFile, scanWorkspace } from '../workspace/file-manager.js';
import { checkDecisionsDue } from '../workspace/decision-manager.js';
import { getRecentLogs } from '../workspace/daily-log-manager.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerWorkspaceResources(server: McpServer): void {
  // pm://workspace/context
  server.resource(
    'workspace-context',
    'pm://workspace/context',
    { description: 'Project orientation and current state (CONTEXT.md)' },
    async () => {
      const content = await readWorkspaceFile('CONTEXT.md');
      return {
        contents: [{
          uri: 'pm://workspace/context',
          mimeType: 'text/markdown',
          text: content || 'CONTEXT.md not found. Run pm-setup to initialize.',
        }],
      };
    }
  );

  // pm://workspace/memory
  server.resource(
    'workspace-memory',
    'pm://workspace/memory',
    { description: 'Persistent project knowledge — stakeholders, priorities, risks, decisions (MEMORY.md)' },
    async () => {
      const content = await readWorkspaceFile('MEMORY.md');
      return {
        contents: [{
          uri: 'pm://workspace/memory',
          mimeType: 'text/markdown',
          text: content || 'MEMORY.md not found. Run pm-setup to initialize.',
        }],
      };
    }
  );

  // pm://workspace/decisions
  server.resource(
    'workspace-decisions',
    'pm://workspace/decisions',
    { description: 'Full decision log with alternatives and rationale (DECISIONS.md)' },
    async () => {
      const content = await readWorkspaceFile('DECISIONS.md');
      return {
        contents: [{
          uri: 'pm://workspace/decisions',
          mimeType: 'text/markdown',
          text: content || 'DECISIONS.md not found. Run pm-setup to initialize.',
        }],
      };
    }
  );

  // pm://workspace/user
  server.resource(
    'workspace-user',
    'pm://workspace/user',
    { description: 'User context — name, role, tech level, tools, preferences (USER.md)' },
    async () => {
      const content = await readWorkspaceFile('USER.md');
      return {
        contents: [{
          uri: 'pm://workspace/user',
          mimeType: 'text/markdown',
          text: content || 'USER.md not found. Run pm-setup to initialize.',
        }],
      };
    }
  );

  // pm://workspace/status — computed summary
  server.resource(
    'workspace-status',
    'pm://workspace/status',
    { description: 'Computed workspace status: which files exist, decisions due, latest log date' },
    async () => {
      const files = await scanWorkspace();
      const decisionsDue = await checkDecisionsDue();
      const recentLogs = await getRecentLogs(1);

      const existingFiles = files.filter(f => f.exists).map(f => f.name);
      const missingFiles = files.filter(f => !f.exists).map(f => f.name);
      const planningExists = files.some(f => f.name === '.planning' && f.exists);

      const lines = [
        '# PM Workspace Status\n',
        `**Files present:** ${existingFiles.length > 0 ? existingFiles.join(', ') : 'None'}`,
        `**Files missing:** ${missingFiles.length > 0 ? missingFiles.join(', ') : 'None'}`,
        `**GSD initialized:** ${planningExists ? 'Yes (.planning/ exists)' : 'No'}`,
        `**Decisions due for review:** ${decisionsDue.length > 0 ? decisionsDue.map(d => `${d.id} — ${d.title}`).join(', ') : 'None'}`,
        `**Latest daily log:** ${recentLogs.length > 0 ? recentLogs[0].date : 'None'}`,
      ];

      return {
        contents: [{
          uri: 'pm://workspace/status',
          mimeType: 'text/markdown',
          text: lines.join('\n'),
        }],
      };
    }
  );
}
