import { checkDecisionsDue } from '../workspace/decision-manager.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerCheckDecisionsDue(server: McpServer): void {
  server.tool(
    'pm_check_decisions_due',
    'Scan DECISIONS.md for active decisions with review date on or before today. Returns decisions that need attention.',
    {},
    async () => {
      const due = await checkDecisionsDue();

      if (due.length === 0) {
        return { content: [{ type: 'text', text: 'No decisions due for review.' }] };
      }

      const lines = [`${due.length} decision(s) due for review:\n`];
      for (const d of due) {
        lines.push(`- **${d.id} — ${d.title}** (review date: ${d.reviewDate}, owner: ${d.owner})`);
      }

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );
}
