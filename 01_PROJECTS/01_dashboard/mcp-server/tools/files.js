/**
 * ⚡ DKZ MCP — File System Tools
 * ════════════════════════════════
 * Dateien lesen, schreiben, suchen, verschieben, analysieren
 */

import { z } from 'zod';

export function registerFileTools(server, ctx) {

    // ─── TOOL 5: Dateien auflisten ───
    server.tool(
        'dkz_list_files',
        'Listet Dateien und Ordner in einem Verzeichnis des DkZ-Ökosystems auf.',
        {
            path: z.string().optional().default('/')
                .describe('Pfad relativ zu C:/DEVKiTZ (z.B. "/01_PROJECTS")'),
            recursive: z.boolean().optional().default(false)
                .describe('Unterordner einbeziehen'),
            filter: z.string().optional()
                .describe('Filter nach Dateityp (z.B. "*.html", "*.js")')
        },
        async ({ path, recursive, filter }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/files/list', {
                    method: 'POST',
                    body: JSON.stringify({ path, recursive, filter })
                });
                return { content: [{ type: 'text', text: JSON.stringify(result.files, null, 2) }] };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Files Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 6: Datei lesen ───
    server.tool(
        'dkz_read_file',
        'Liest den Inhalt einer Datei aus dem DkZ-Ökosystem.',
        {
            path: z.string().describe('Dateipfad relativ zu C:/DEVKiTZ'),
            encoding: z.enum(['utf-8', 'base64']).optional().default('utf-8')
                .describe('Encoding der Ausgabe')
        },
        async ({ path, encoding }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/files/read', {
                    method: 'POST',
                    body: JSON.stringify({ path, encoding })
                });
                return { content: [{ type: 'text', text: result.content }] };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Read Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 7: Datei schreiben ───
    server.tool(
        'dkz_write_file',
        'Schreibt Inhalt in eine Datei im DkZ-Ökosystem. Erstellt Ordner automatisch.',
        {
            path: z.string().describe('Dateipfad relativ zu C:/DEVKiTZ'),
            content: z.string().describe('Dateiinhalt'),
            createDirs: z.boolean().optional().default(true)
                .describe('Fehlende Ordner automatisch erstellen')
        },
        async ({ path, content, createDirs }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/files/write', {
                    method: 'POST',
                    body: JSON.stringify({ path, content, createDirs })
                });
                return { content: [{ type: 'text', text: `✅ Datei geschrieben: ${result.path} (${result.size} bytes)` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Write Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 8: Datei suchen ───
    server.tool(
        'dkz_search_files',
        'Durchsucht das DkZ-Dateisystem nach Dateien oder Inhalten.',
        {
            query: z.string().describe('Suchbegriff (Dateiname oder Inhalt)'),
            searchIn: z.enum(['name', 'content', 'both']).optional().default('name')
                .describe('Wo suchen: name, content, both'),
            path: z.string().optional().default('/')
                .describe('Startverzeichnis für Suche'),
            extensions: z.array(z.string()).optional()
                .describe('Dateierweiterungen filtern (z.B. [".js", ".html"])')
        },
        async ({ query, searchIn, path, extensions }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/files/search', {
                    method: 'POST',
                    body: JSON.stringify({ query, searchIn, path, extensions })
                });
                return {
                    content: [{
                        type: 'text',
                        text: `🔍 ${result.results.length} Treffer gefunden:\n\n${result.results.map(r =>
                            `• ${r.path}${r.line ? ` (Zeile ${r.line})` : ''}`
                        ).join('\n')}`
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Search Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 9: Datei verschieben/umbenennen ───
    server.tool(
        'dkz_move_file',
        'Verschiebt oder benennt eine Datei/Ordner im DkZ-Ökosystem um.',
        {
            source: z.string().describe('Quellpfad'),
            destination: z.string().describe('Zielpfad'),
            overwrite: z.boolean().optional().default(false)
                .describe('Existierende Datei überschreiben')
        },
        async ({ source, destination, overwrite }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/files/move', {
                    method: 'POST',
                    body: JSON.stringify({ source, destination, overwrite })
                });
                return { content: [{ type: 'text', text: `✅ Verschoben: ${source} → ${destination}` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Move Error: ${err.message}` }] };
            }
        }
    );
}
