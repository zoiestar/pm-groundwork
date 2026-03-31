import { z } from 'zod';
import { scanProjectFiles } from '../workspace/file-manager.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerScanProjectFiles(server: McpServer): void {
  server.tool(
    'pm_scan_project_files',
    'Scan for existing project files (README, docs, specs, briefs) to gather context. Useful during setup to pre-fill workspace files.',
    {
      patterns: z.array(z.string()).optional().describe('File patterns to scan for. Defaults to ["*.md", "*.txt", "*.rst"].'),
    },
    async ({ patterns }) => {
      const files = await scanProjectFiles(patterns);

      if (files.length === 0) {
        return { content: [{ type: 'text', text: 'No project files found.' }] };
      }

      return {
        content: [{
          type: 'text',
          text: `Found ${files.length} project file(s):\n${files.map(f => `- ${f}`).join('\n')}`,
        }],
      };
    }
  );
}
