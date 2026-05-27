/**
 * ⚡ DKZ MCP — SEO Tools
 * ═══════════════════════
 * SEO-Analyse, Keyword-Recherche, Meta-Check, SERP-Analyse
 */

import { z } from 'zod';

export function registerSeoTools(server, ctx) {

    // ─── TOOL 16: SEO Analyse ───
    server.tool(
        'dkz_seo_analyze',
        'Analysiert eine URL oder HTML-Inhalt auf SEO-Faktoren.',
        {
            url: z.string().optional().describe('URL zum Analysieren'),
            html: z.string().optional().describe('HTML-Inhalt zum Analysieren'),
            checks: z.array(z.enum(['meta', 'headings', 'images', 'links', 'performance', 'all']))
                .optional().default(['all'])
                .describe('Welche Checks durchführen')
        },
        async ({ url, html, checks }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/seo/analyze', {
                    method: 'POST',
                    body: JSON.stringify({ url, html, checks })
                });
                return {
                    content: [{
                        type: 'text',
                        text: `📊 SEO Analyse\n═══════════════\n` +
                            `Score: ${result.score}/100\n\n` +
                            `✅ Bestanden: ${result.passed.length}\n` +
                            `⚠️ Warnungen: ${result.warnings.length}\n` +
                            `❌ Fehler: ${result.errors.length}\n\n` +
                            `Details:\n${result.details || 'Keine Details verfügbar.'}`
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ SEO Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 17: Keyword Recherche ───
    server.tool(
        'dkz_keyword_research',
        'Führt eine Keyword-Recherche durch und liefert Vorschläge mit Suchvolumen.',
        {
            keyword: z.string().describe('Haupt-Keyword'),
            language: z.enum(['de', 'en', 'fr', 'es', 'it']).optional().default('de')
                .describe('Sprache'),
            country: z.enum(['DE', 'AT', 'CH', 'US', 'UK']).optional().default('DE')
                .describe('Zielmarkt')
        },
        async ({ keyword, language, country }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/seo/keywords', {
                    method: 'POST',
                    body: JSON.stringify({ keyword, language, country })
                });
                const lines = result.keywords.map(k =>
                    `• ${k.keyword} — Vol: ${k.volume} | Diff: ${k.difficulty} | CPC: ${k.cpc}`
                );
                return {
                    content: [{
                        type: 'text',
                        text: `🔑 Keyword-Recherche: "${keyword}"\n\n${lines.join('\n')}`
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Keyword Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 18: Meta-Tags generieren ───
    server.tool(
        'dkz_generate_meta',
        'Generiert optimierte Meta-Tags (Title, Description, OG) für eine Seite.',
        {
            content: z.string().describe('Seiteninhalt oder Beschreibung'),
            url: z.string().optional().describe('URL der Seite'),
            keywords: z.array(z.string()).optional()
                .describe('Ziel-Keywords')
        },
        async ({ content, url, keywords }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/seo/generate-meta', {
                    method: 'POST',
                    body: JSON.stringify({ content, url, keywords })
                });
                return {
                    content: [{
                        type: 'text',
                        text: `🏷️ Generierte Meta-Tags:\n\n` +
                            `Title: ${result.title}\n` +
                            `Description: ${result.description}\n\n` +
                            `HTML:\n\`\`\`html\n${result.html}\n\`\`\``
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Meta Error: ${err.message}` }] };
            }
        }
    );
}
