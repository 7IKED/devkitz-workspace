/**
 * ⚡ DKZ MCP — Resources
 * ═══════════════════════
 * MCP Resources — Daten die AI-Clients lesen können
 */

export function registerResources(server, ctx) {

    // ─── Registry Resource ───
    server.resource(
        'dkz-registry',
        'dkz://registry',
        async (uri) => {
            try {
                const result = await ctx.apiFetch('/api/v1/registry');
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(result, null, 2)
                    }]
                };
            } catch {
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'text/plain',
                        text: 'Registry nicht verfügbar — API Gateway offline.'
                    }]
                };
            }
        }
    );

    // ─── Health Status Resource ───
    server.resource(
        'dkz-health',
        'dkz://health',
        async (uri) => {
            try {
                const result = await ctx.apiFetch('/api/v1/health');
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(result, null, 2)
                    }]
                };
            } catch {
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'text/plain',
                        text: 'Health-Daten nicht verfügbar.'
                    }]
                };
            }
        }
    );

    // ─── Ecosystem Blueprint Resource ───
    server.resource(
        'dkz-blueprint',
        'dkz://blueprint',
        async (uri) => {
            try {
                const result = await ctx.apiFetch('/api/v1/ecosystem');
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(result, null, 2)
                    }]
                };
            } catch {
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'text/plain',
                        text: 'Blueprint nicht verfügbar.'
                    }]
                };
            }
        }
    );

    // ─── Module List Resource ───
    server.resource(
        'dkz-modules',
        'dkz://modules',
        async (uri) => {
            try {
                const result = await ctx.apiFetch('/api/v1/modules');
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(result, null, 2)
                    }]
                };
            } catch {
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: 'text/plain',
                        text: 'Module nicht verfügbar.'
                    }]
                };
            }
        }
    );
}
