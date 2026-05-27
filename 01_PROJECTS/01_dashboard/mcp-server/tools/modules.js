/**
 * ⚡ DKZ MCP — Module Management Tools
 * ══════════════════════════════════════
 * Module auflisten, registrieren, Status prüfen
 */

import { z } from 'zod';

export function registerModuleTools(server, ctx) {

    // ─── TOOL 13: Module auflisten ───
    server.tool(
        'dkz_list_modules',
        'Listet alle registrierten DkZ-Module mit Status und Metadaten auf.',
        {
            status: z.enum(['all', 'active', 'dev', 'planned', 'archived']).optional().default('all')
                .describe('Filter nach Status'),
            category: z.string().optional()
                .describe('Filter nach Kategorie')
        },
        async ({ status, category }) => {
            try {
                let path = '/api/v1/modules';
                const params = [];
                if (status !== 'all') params.push(`status=${status}`);
                if (category) params.push(`category=${category}`);
                if (params.length) path += '?' + params.join('&');

                const result = await ctx.apiFetch(path);

                const lines = result.modules.map(m =>
                    `${m.icon} **${m.displayName}** (${m.version})\n` +
                    `   Status: ${m.status} | Kategorie: ${m.category}\n` +
                    `   ${m.description}`
                );
                return {
                    content: [{
                        type: 'text',
                        text: `📦 DkZ Module (${result.modules.length}):\n\n${lines.join('\n\n')}`
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Modules Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 14: Modul-Details ───
    server.tool(
        'dkz_module_info',
        'Zeigt detaillierte Informationen zu einem spezifischen DkZ-Modul.',
        {
            moduleId: z.string().describe('Module ID (z.B. "dkz-nexuz", "dkz-file-manager")')
        },
        async ({ moduleId }) => {
            try {
                const result = await ctx.apiFetch(`/api/v1/modules/${moduleId}`);
                const m = result.module;
                return {
                    content: [{
                        type: 'text',
                        text: `${m.icon} ${m.displayName}\n` +
                            `═══════════════════════\n` +
                            `Version: ${m.version}\n` +
                            `Status: ${m.status}\n` +
                            `Kategorie: ${m.category}\n` +
                            `Beschreibung: ${m.description}\n` +
                            `Lizenz: ${m.license}\n` +
                            `Tags: ${(m.tags || []).join(', ')}\n` +
                            `Permissions: ${(m.permissions || []).join(', ')}\n` +
                            `Entry: ${m.entry}\n` +
                            (m.endpoints ? `\nEndpoints:\n${m.endpoints.map(e => `  ${e.method} ${e.path} — ${e.description}`).join('\n')}` : '')
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Module Info Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 15: Modul registrieren ───
    server.tool(
        'dkz_register_module',
        'Registriert ein neues Modul im DkZ-Ökosystem.',
        {
            name: z.string().describe('Modulname (z.B. "dkz-my-tool")'),
            displayName: z.string().describe('Anzeigename'),
            description: z.string().describe('Beschreibung'),
            icon: z.string().optional().default('📦').describe('Emoji-Icon'),
            category: z.string().optional().default('D-System').describe('Kategorie'),
            entry: z.string().optional().default('index.html').describe('Entry Point')
        },
        async ({ name, displayName, description, icon, category, entry }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/modules/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, displayName, description, icon, category, entry })
                });
                return {
                    content: [{
                        type: 'text',
                        text: `✅ Modul "${displayName}" erfolgreich registriert!\n` +
                            `ID: ${result.moduleId}\n` +
                            `Pfad: ${result.path}`
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Register Error: ${err.message}` }] };
            }
        }
    );
}
