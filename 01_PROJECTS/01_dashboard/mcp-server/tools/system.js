/**
 * ⚡ DKZ MCP — System Tools
 * ══════════════════════════
 * Git Sync, Config, Ecosystem Info, MCP Self-Info
 */

import { z } from 'zod';

export function registerSystemTools(server, ctx) {

    // ─── TOOL 22: Git Sync ───
    server.tool(
        'dkz_git_sync',
        'Committed und synced den aktuellen Stand des DkZ-Projekts via Git.',
        {
            message: z.string().optional()
                .describe('Commit-Nachricht (Standard: Auto-Sync mit Timestamp)'),
            push: z.boolean().optional().default(false)
                .describe('Nach Commit auch pushen')
        },
        async ({ message, push }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/sync', {
                    method: 'POST',
                    body: JSON.stringify({ message, push })
                });
                return {
                    content: [{
                        type: 'text',
                        text: `${result.success ? '✅' : '⚠️'} Git Sync: ${result.message}\n` +
                            (result.log ? `\nLog:\n${result.log}` : '')
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Sync Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL: Ecosystem Info ───
    server.tool(
        'dkz_ecosystem_info',
        'Zeigt eine vollständige Übersicht des DkZ-Ökosystems: Module, Backends, Status.',
        {},
        async () => {
            try {
                const result = await ctx.apiFetch('/api/v1/ecosystem');
                return {
                    content: [{
                        type: 'text',
                        text: `⚡ DkZ Ökosystem\n` +
                            `═══════════════════\n` +
                            `Version: ${result.version}\n` +
                            `Module: ${result.moduleCount} registriert\n` +
                            `Backends: ${result.backendCount} konfiguriert\n` +
                            `Online: ${result.backendsOnline}/${result.backendCount}\n` +
                            `MCP Tools: ${result.mcpToolCount}\n` +
                            `API Endpoints: ${result.apiEndpointCount}\n\n` +
                            `Letzte Aktivität: ${result.lastActivity || '—'}`
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Ecosystem Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL: MCP Server Info ───
    server.tool(
        'dkz_mcp_info',
        'Zeigt Informationen über den DkZ MCP Server selbst.',
        {},
        async () => {
            return {
                content: [{
                    type: 'text',
                    text: `⚡ DkZ MCP Server\n` +
                        `═══════════════════\n` +
                        `Version: ${ctx.version}\n` +
                        `API Gateway: ${ctx.apiBase}\n` +
                        `Protocol: MCP v1.0 (JSON-RPC 2.0)\n` +
                        `Transport: stdio\n\n` +
                        `Registrierte Tools:\n` +
                        `  • dkz_chat — AI Chat\n` +
                        `  • dkz_summarize — Zusammenfassen\n` +
                        `  • dkz_translate — Übersetzen\n` +
                        `  • dkz_codegen — Code-Generierung\n` +
                        `  • dkz_list_files — Dateien auflisten\n` +
                        `  • dkz_read_file — Datei lesen\n` +
                        `  • dkz_write_file — Datei schreiben\n` +
                        `  • dkz_search_files — Dateien suchen\n` +
                        `  • dkz_move_file — Datei verschieben\n` +
                        `  • dkz_health_check — Health Check\n` +
                        `  • dkz_incidents — Incident Log\n` +
                        `  • dkz_metrics — System Metriken\n` +
                        `  • dkz_list_modules — Module auflisten\n` +
                        `  • dkz_module_info — Modul-Details\n` +
                        `  • dkz_register_module — Modul registrieren\n` +
                        `  • dkz_seo_analyze — SEO Analyse\n` +
                        `  • dkz_keyword_research — Keyword-Recherche\n` +
                        `  • dkz_generate_meta — Meta-Tags generieren\n` +
                        `  • dkz_list_workflows — Workflows auflisten\n` +
                        `  • dkz_start_workflow — Workflow starten\n` +
                        `  • dkz_create_task — Task erstellen\n` +
                        `  • dkz_git_sync — Git Sync\n` +
                        `  • dkz_ecosystem_info — Ökosystem-Info\n` +
                        `  • dkz_mcp_info — MCP Server Info`
                }]
            };
        }
    );
}
