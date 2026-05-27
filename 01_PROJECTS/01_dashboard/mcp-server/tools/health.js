/**
 * ⚡ DKZ MCP — Health & Monitoring Tools
 * ════════════════════════════════════════
 * Backend-Health, Systemstatus, Metriken, Incidents
 */

import { z } from 'zod';

export function registerHealthTools(server, ctx) {

    // ─── TOOL 10: System Health Check ───
    server.tool(
        'dkz_health_check',
        'Führt einen Health Check aller DkZ-Backends durch und zeigt den Status.',
        {
            backend: z.string().optional()
                .describe('Spezifisches Backend prüfen (z.B. "vps-kvm8"). Leer = alle prüfen.')
        },
        async ({ backend }) => {
            try {
                const path = backend ? `/api/v1/health/${backend}` : '/api/v1/health';
                const result = await ctx.apiFetch(path);

                if (backend) {
                    const b = result.backend;
                    return {
                        content: [{
                            type: 'text',
                            text: `${b.online ? '🟢' : '🔴'} **${b.name}**\n` +
                                `Status: ${b.online ? 'Online' : 'Offline'}\n` +
                                `Latenz: ${b.latency || '—'}ms\n` +
                                `Uptime: ${b.uptime || '—'}%\n` +
                                `Letzte Prüfung: ${b.lastCheck || '—'}`
                        }]
                    };
                }

                const lines = result.backends.map(b =>
                    `${b.online ? '🟢' : '🔴'} ${b.name} — ${b.latency ? b.latency + 'ms' : 'N/A'}`
                );
                return {
                    content: [{
                        type: 'text',
                        text: `⚡ DkZ System Health\n` +
                            `═══════════════════\n` +
                            `Online: ${result.summary.online}/${result.summary.total}\n` +
                            `Avg Latenz: ${result.summary.avgLatency || '—'}ms\n\n` +
                            lines.join('\n')
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Health Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 11: Incident Log ───
    server.tool(
        'dkz_incidents',
        'Zeigt die letzten Incidents und Statusänderungen der DkZ-Backends.',
        {
            limit: z.number().optional().default(10)
                .describe('Maximale Anzahl Incidents'),
            severity: z.enum(['all', 'down', 'error', 'recovered']).optional().default('all')
                .describe('Filtern nach Schweregrad')
        },
        async ({ limit, severity }) => {
            try {
                const result = await ctx.apiFetch(`/api/v1/health/incidents?limit=${limit}&severity=${severity}`);

                if (result.incidents.length === 0) {
                    return { content: [{ type: 'text', text: '✅ Keine Incidents. Alles läuft stabil.' }] };
                }

                const lines = result.incidents.map(i =>
                    `${i.type === 'down' ? '🔴' : i.type === 'error' ? '🟡' : '🟢'} ` +
                    `[${i.timestamp}] ${i.backendId}: ${i.message}`
                );
                return { content: [{ type: 'text', text: `📋 Letzte ${limit} Incidents:\n\n${lines.join('\n')}` }] };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Incidents Error: ${err.message}` }] };
            }
        }
    );

    // ─── TOOL 12: System Metriken ───
    server.tool(
        'dkz_metrics',
        'Zeigt Systemmetriken: CPU, RAM, Disk, Request-Statistiken.',
        {
            timeframe: z.enum(['1h', '24h', '7d', '30d']).optional().default('24h')
                .describe('Zeitraum für Metriken')
        },
        async ({ timeframe }) => {
            try {
                const result = await ctx.apiFetch(`/api/v1/metrics?timeframe=${timeframe}`);
                return {
                    content: [{
                        type: 'text',
                        text: `📊 DkZ System Metriken (${timeframe})\n` +
                            `═══════════════════════════════\n` +
                            `CPU: ${result.cpu}%\n` +
                            `RAM: ${result.ram.used}/${result.ram.total} MB (${result.ram.percent}%)\n` +
                            `Disk: ${result.disk.used}/${result.disk.total} GB\n` +
                            `Requests: ${result.requests.total} (${result.requests.errors} Fehler)\n` +
                            `Uptime: ${result.uptime}`
                    }]
                };
            } catch (err) {
                return { content: [{ type: 'text', text: `❌ Metrics Error: ${err.message}` }] };
            }
        }
    );
}
