/**
 * ⚡ DKZ MCP — Chat Tools
 * ════════════════════════
 * AI-Chat, Multi-Model, Summarize, Translate, Code-Gen
 */

import { z } from 'zod';

export function registerChatTools(server, ctx) {

    // ─── TOOL 1: AI Chat ───
    server.tool(
        'dkz_chat',
        'Sende eine Nachricht an den DkZ AI Chat. Unterstützt Kontext-History und System-Prompts.',
        {
            message: z.string().describe('Die Chat-Nachricht'),
            model: z.enum(['auto', 'fast', 'smart', 'large']).optional().default('auto')
                .describe('Modell-Auswahl: auto (Standard), fast, smart, large'),
            systemPrompt: z.string().optional()
                .describe('Optionaler System-Prompt für Kontext'),
            history: z.array(z.object({
                role: z.enum(['user', 'assistant', 'system']),
                content: z.string()
            })).optional().describe('Chat-Verlauf für Kontext')
        },
        async ({ message, model, systemPrompt, history }) => {
            try {
                const payload = { message, model: model || 'auto' };
                if (systemPrompt) payload.systemPrompt = systemPrompt;
                if (history) payload.history = history;

                const result = await ctx.apiFetch('/api/v1/chat', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                return {
                    content: [{
                        type: 'text',
                        text: result.reply || result.data || 'Keine Antwort erhalten.'
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Chat Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 2: Text zusammenfassen ───
    server.tool(
        'dkz_summarize',
        'Fasst einen Text zusammen. Unterstützt verschiedene Zusammenfassungstiefen.',
        {
            text: z.string().describe('Der zu zusammenfassende Text'),
            depth: z.enum(['kurz', 'mittel', 'detailliert']).optional().default('mittel')
                .describe('Tiefe der Zusammenfassung'),
            language: z.enum(['de', 'en', 'auto']).optional().default('auto')
                .describe('Ausgabe-Sprache')
        },
        async ({ text, depth, language }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/summarize', {
                    method: 'POST',
                    body: JSON.stringify({ text, depth, language })
                });
                return { content: [{ type: 'text', text: result.summary }] };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Summarize Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 3: Übersetzen ───
    server.tool(
        'dkz_translate',
        'Übersetzt Text zwischen Sprachen.',
        {
            text: z.string().describe('Zu übersetzender Text'),
            targetLang: z.string().describe('Zielsprache (z.B. "en", "de", "fr", "es")'),
            sourceLang: z.string().optional().default('auto')
                .describe('Quellsprache (auto = automatisch erkennen)')
        },
        async ({ text, targetLang, sourceLang }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/translate', {
                    method: 'POST',
                    body: JSON.stringify({ text, targetLang, sourceLang })
                });
                return { content: [{ type: 'text', text: result.translation }] };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Translate Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 4: Code generieren ───
    server.tool(
        'dkz_codegen',
        'Generiert Code basierend auf einer Beschreibung. Kann auch Code konvertieren.',
        {
            prompt: z.string().describe('Beschreibung des gewünschten Codes'),
            language: z.string().optional().default('javascript')
                .describe('Ziel-Programmiersprache'),
            sourceCode: z.string().optional()
                .describe('Quellcode für Konvertierung/Verbesserung'),
            mode: z.enum(['generate', 'convert', 'improve', 'explain']).optional().default('generate')
                .describe('Modus: generate, convert, improve, explain')
        },
        async ({ prompt, language, sourceCode, mode }) => {
            try {
                const result = await ctx.apiFetch('/api/v1/codegen', {
                    method: 'POST',
                    body: JSON.stringify({ prompt, language, sourceCode, mode })
                });
                return { content: [{ type: 'text', text: result.code || result.explanation }] };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ CodeGen Error: ${err.message}` }] };
            }
        }
    );
}
