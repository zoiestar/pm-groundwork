import { scanWorkspace } from '../workspace/file-manager.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerScanWorkspace(server: McpServer): void {
  server.tool(
    'pm_scan_workspace',
    'Check which PM workspace files exist and their modification dates. Returns status of all workspace files, memory logs, and .planning/ directory.',
    {},
    async () => {
      const files = await scanWorkspace();

      const existing = files.filter(f => f.exists);
      const missing = files.filter(f => !f.exists);

      const lines: string[] = ['## Workspace Status\n'];

      if (existing.length > 0) {
        lines.push('**Present:**');
        for (const f of existing) {
          const mod = f.modifiedAt ? ` (modified: ${f.modifiedAt.split('T')[0]})` : '';
          const size = f.size ? ` — ${f.size} bytes` : '';
          lines.push(`- ${f.name}${mod}${size}`);
        }
      }

      if (missing.length > 0) {
        lines.push('\n**Missing:**');
        for (const f of missing) {
          lines.push(`- ${f.name}`);
        }
      }

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );
}
