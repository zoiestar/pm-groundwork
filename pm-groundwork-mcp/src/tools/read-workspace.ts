import { z } from 'zod';
import { readWorkspaceFile } from '../workspace/file-manager.js';
import { WORKSPACE_FILES } from '../workspace/config.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerReadWorkspace(server: McpServer): void {
  server.tool(
    'pm_read_workspace',
    'Read one or all PM workspace files. Pass a specific filename (e.g. "MEMORY.md") or "all" to read everything.',
    { file: z.string().optional().describe('Filename like "MEMORY.md", "DECISIONS.md", or "all". Defaults to "all".') },
    async ({ file }) => {
      const target = file || 'all';

      if (target === 'all') {
        const results: string[] = [];
        for (const name of WORKSPACE_FILES) {
          const content = await readWorkspaceFile(name);
          if (content) {
            results.push(`--- ${name} ---\n${content}`);
          }
        }
        if (results.length === 0) {
          return { content: [{ type: 'text', text: 'No workspace files found. Run pm-setup to initialize.' }] };
        }
        return { content: [{ type: 'text', text: results.join('\n\n') }] };
      }

      const content = await readWorkspaceFile(target);
      if (content === null) {
        return { content: [{ type: 'text', text: `File "${target}" not found.` }] };
      }
      return { content: [{ type: 'text', text: content }] };
    }
  );
}
