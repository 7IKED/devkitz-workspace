/**
 * ⚡ DKZ MCP — Workflow Tools
 * ════════════════════════════
 * Kanban-Board, Prozesse, Tasks, Workflow-Steuerung
 */

import { z } from 'zod';

export function registerWorkflowTools(server, ctx) {

    // ─── TOOL 19: Workflows auflisten ───
    server.tool(
        'dkz_list_workflows',
        'Listet alle aktiven Workflows und deren Status auf.',
        {
            status: z.enum(['all', 'running', 'pending', 'completed', 'failed']).optional().default('all')
                .describe('Filtern nach Status')
        },
        async ({ status }) => {
            try {
                const result = await ctx.apiFetch(`/api/v1/workflows?status=${status}`);
                const lines = result.workflows.map(w =>
                    `${w.status === 'running' ? '🔄' : w.status === 'completed' ? '✅' : w.status === 'failed' ? '❌' : '⏳'} ` +
                    `**${w.name}** (${w.id})\n   Status: ${w.status} | Schritte: ${w.currentStep}/${w.totalSteps} | ${w.updated}`
                );
                return {
                    content: [{
                        type: 'text',
                        text: `📋 Workflows (${result.workflows.length}):\n\n${lines.join('\n\n')}`
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Workflows Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 20: Workflow starten ───
    server.tool(
        'dkz_start_workflow',
        'Startet einen neuen Workflow aus einem Template.',
        {
            template: z.string().describe('Workflow-Template ID oder Name'),
            params: z.record(z.string()).optional()
                .describe('Parameter für den Workflow (Key-Value)'),
            priority: z.enum(['low', 'normal', 'high', 'critical']).optional().default('normal')
                .describe('Priorität')
        },
        async ({ template, params, priority }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/workflows/start', {
                    method: 'POST',
                    body: JSON.stringify({ template, params, priority })
                });
                return {
                    content: [{
                        type: 'text',
                        text: `🚀 Workflow gestartet!\n` +
                            `ID: ${result.workflowId}\n` +
                            `Template: ${template}\n` +
                            `Priorität: ${priority}\n` +
                            `Status: running`
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Start Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 21: Task erstellen ───
    server.tool(
        'dkz_create_task',
        'Erstellt einen neuen Task auf dem Kanban-Board.',
        {
            title: z.string().describe('Task-Titel'),
            description: z.string().optional().describe('Beschreibung'),
            column: z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']).optional().default('backlog')
                .describe('Kanban-Spalte'),
            priority: z.enum(['low', 'normal', 'high', 'critical']).optional().default('normal')
                .describe('Priorität'),
            tags: z.array(z.string()).optional()
                .describe('Tags für den Task'),
            assignee: z.string().optional()
                .describe('Zugewiesen an')
        },
        async ({ title, description, column, priority, tags, assignee }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/tasks', {
                    method: 'POST',
                    body: JSON.stringify({ title, description, column, priority, tags, assignee })
                });
                return {
                    content: [{
                        type: 'text',
                        text: `✅ Task erstellt!\n` +
                            `ID: ${result.taskId}\n` +
                            `Titel: ${title}\n` +
                            `Spalte: ${column}\n` +
                            `Priorität: ${priority}`
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Task Error: ${err.message}` }] };
            }
        }
    );
}
