import { z } from 'zod';
import { logDecision } from '../workspace/decision-manager.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerLogDecision(server: McpServer): void {
  server.tool(
    'pm_log_decision',
    'Log a structured decision to DECISIONS.md with automatic ID sequencing and MEMORY.md cross-reference.',
    {
      title: z.string().describe('Short decision title (e.g. "Use PostgreSQL for primary database").'),
      decision: z.string().describe('One clear sentence stating what was decided.'),
      context: z.string().describe('2-4 sentences on what situation forced this decision.'),
      rationale: z.string().describe('Why this option was chosen over others.'),
      alternatives: z.array(z.object({
        option: z.string(),
        why_rejected: z.string(),
      })).describe('Alternatives that were considered.'),
      confidence: z.enum(['High', 'Medium', 'Low']).describe('Confidence level in this decision.'),
      owner: z.string().describe('Who owns this decision.'),
      deciders: z.string().describe('Who was involved in making this decision.'),
      implications: z.string().describe('What this decision affects, constrains, or enables.'),
      review_date: z.string().describe('When to review this decision (YYYY-MM-DD format).'),
      supporting_docs: z.string().optional().describe('Links to supporting documentation.'),
    },
    async (input) => {
      const result = await logDecision(input);
      return { content: [{ type: 'text', text: result.message }] };
    }
  );
}
