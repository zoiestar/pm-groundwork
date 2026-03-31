import { z } from 'zod';
import { updateWorkspaceFileSection } from '../workspace/file-manager.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerUpdateWorkspaceFile(server: McpServer): void {
  server.tool(
    'pm_update_workspace_file',
    'Append to or replace a specific section within a workspace file.',
    {
      filename: z.string().describe('The workspace file to update (e.g. "MEMORY.md").'),
      section: z.string().describe('The section heading to target (e.g. "Current priorities", "Open risks & blockers").'),
      content: z.string().describe('The content to insert.'),
      mode: z.enum(['append', 'replace']).describe('"append" adds content to the section, "replace" replaces the section body.'),
    },
    async ({ filename, section, content, mode }) => {
      const result = await updateWorkspaceFileSection(filename, section, content, mode);
      return { content: [{ type: 'text', text: result.message }] };
    }
  );
}
