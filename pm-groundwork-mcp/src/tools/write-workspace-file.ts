import { z } from 'zod';
import { writeWorkspaceFile } from '../workspace/file-manager.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerWriteWorkspaceFile(server: McpServer): void {
  server.tool(
    'pm_write_workspace_file',
    'Create or overwrite a PM workspace file (e.g. MEMORY.md, CONTEXT.md, USER.md).',
    {
      filename: z.string().describe('The filename to write (e.g. "MEMORY.md", "CONTEXT.md").'),
      content: z.string().describe('The full file content to write.'),
    },
    async ({ filename, content }) => {
      await writeWorkspaceFile(filename, content);
      return { content: [{ type: 'text', text: `File "${filename}" written successfully.` }] };
    }
  );
}
