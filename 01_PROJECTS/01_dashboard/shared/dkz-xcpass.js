/**
 * DkZ™ XCPass Tool v1.0
 * @DKZ:TAG → [SHARED:xcpass] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * Frontend Credential-Interface fuer Agenten
 * NanoBot Command: .pass [service]
 */
const DkzXCPass = (() => {
    'use strict';
    const API = 'http://localhost:3040/api';
    
    async function request(service, agent = 'default') {
        try {
            const r = await fetch(`${API}/creds/${agent}/${service}`);
            return await r.json();
        } catch(e) {
            console.warn('[XCPass] API offline, using ENV fallback');
            return { error: 'Gateway offline', fallback: true };
        }
    }
    
    async function showAuditLog(limit = 20) {
        try {
            const r = await fetch(`${API}/creds/audit?limit=${limit}`);
            return await r.json();
        } catch(e) {
            return [];
        }
    }
    
    function injectUI() {
        // NanoBot integration: .pass command
        if (typeof DkzNanoBot !== 'undefined') {
            DkzNanoBot.registerCommand('.pass', async (args) => {
                if (!args[0]) return '⚠️ Usage: .pass [service] [agent]';
                const result = await request(args[0], args[1] || 'default');
                if (result.error) return `❌ ${result.error}`;
                return `🔑 Token: ${result.tokenId}\n⏰ Expires: ${result.expires}`;
            });
            DkzNanoBot.registerCommand('.audit', async () => {
                const log = await showAuditLog(10);
                if (!log.length) return 'Keine Audit-Einträge.';
                return log.map(e => `[${e.timestamp}] ${e.agent}→${e.service}: ${e.action}`).join('\n');
            });
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectUI);
    } else {
        setTimeout(injectUI, 500);
    }
    
    return { request, showAuditLog, VERSION: 'v1.0.0' };
})();
