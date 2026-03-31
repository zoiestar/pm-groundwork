import { z } from 'zod';
import { writeDailyLog } from '../workspace/daily-log-manager.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerWriteDailyLog(server: McpServer): void {
  server.tool(
    'pm_write_daily_log',
    'Create or append a session entry to the daily log (memory/YYYY-MM-DD.md). Handles session numbering automatically.',
    {
      date: z.string().optional().describe('Date in YYYY-MM-DD format. Defaults to today.'),
      session_number: z.number().optional().describe('Session number override. Auto-detected if omitted.'),
      title: z.string().describe('Brief session title (e.g. "Setup", "Sprint planning review").'),
      what_happened: z.array(z.string()).describe('Bullet points of work done.'),
      decisions_made: z.string().describe('Decisions made this session, or "None".'),
      stakeholder_updates: z.string().optional().describe('Communications, approvals, feedback received.'),
      blockers_risks: z.string().optional().describe('New blockers or risks identified.'),
      files_changed: z.array(z.string()).optional().describe('List of files created or updated.'),
      next_actions: z.array(z.string()).describe('What comes next.'),
    },
    async (input) => {
      const result = await writeDailyLog(input.date, input.session_number, input.title, {
        title: input.title,
        what_happened: input.what_happened,
        decisions_made: input.decisions_made,
        stakeholder_updates: input.stakeholder_updates,
        blockers_risks: input.blockers_risks,
        files_changed: input.files_changed,
        next_actions: input.next_actions,
      });
      return { content: [{ type: 'text', text: result.message }] };
    }
  );
}
