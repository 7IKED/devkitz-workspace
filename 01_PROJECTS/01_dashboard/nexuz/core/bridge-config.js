/**
 * NEXUZ² Bridge Configuration v2.02.0_01
 * ════════════════════════════════════════
 * Zentrale Konfiguration für alle 6 Backend-Bridges.
 * 
 * SECURITY: Keine echten Keys hier — diese werden via
 * Environment Variables oder .env injected.
 * 
 * Dieses File wird vom Router, der API Gateway und dem
 * MCP Server gemeinsam genutzt.
 */

const BridgeConfig = {
    // Globale Defaults
    defaults: {
        timeout: 15000,
        retries: 2,
        retryDelay: 1000,
        healthInterval: 30000,
        maxConcurrent: 10
    },

    // ═══ BACKEND 1: KVM8 VPS ═══
    'vps-kvm8': {
        name: 'KVM8 VPS',
        type: 'primary',
        icon: '🖥️',
        color: '#00e5ff',
        // Endpoint: Set via ENV or hardcode for dev
        endpoint: typeof process !== 'undefined'
            ? (process.env?.NEXUZ_VPS_URL || '')
            : '',
        healthPath: '/health',
        authType: 'bearer',         // Authorization: Bearer <token>
        authEnv: 'NEXUZ_VPS_TOKEN',
        capabilities: ['api', 'auth', 'sessions', 'db', 'websocket'],
        routes: {
            'chat': { method: 'POST', path: '/api/v1/chat' },
            'files': { method: 'POST', path: '/api/v1/files' },
            'sync': { method: 'POST', path: '/api/v1/sync' },
            'users': { method: 'GET', path: '/api/v1/users' },
            'modules': { method: 'GET', path: '/api/v1/modules' }
        },
        fallbackTo: ['cf-worker', 'apache'],
        priority: 1,
        region: 'eu-de',
        cost: '12€/mo'
    },

    // ═══ BACKEND 2: LLM DEDICATED ═══
    'llm-dedicated': {
        name: 'Linux Dedicated (LLM)',
        type: 'compute',
        icon: '🧠',
        color: '#a855f7',
        endpoint: typeof process !== 'undefined'
            ? (process.env?.NEXUZ_LLM_URL || '')
            : '',
        healthPath: '/v1/models',
        authType: 'bearer',
        authEnv: 'NEXUZ_LLM_TOKEN',
        capabilities: ['inference', 'rag', 'embedding', 'chat', 'completions'],
        routes: {
            'chat': { method: 'POST', path: '/v1/chat/completions' },
            'completions': { method: 'POST', path: '/v1/completions' },
            'embedding': { method: 'POST', path: '/v1/embeddings' },
            'models': { method: 'GET', path: '/v1/models' }
        },
        models: [
            { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B', vram: '4.7GB', speed: '45 t/s' },
            { id: 'deepseek-r1:8b', name: 'DeepSeek R1 8B', vram: '5.2GB', speed: '38 t/s' },
            { id: 'mistral:7b', name: 'Mistral 7B v0.3', vram: '4.1GB', speed: '52 t/s' }
        ],
        gpu: { model: 'RTX 4070', vram: '12GB' },
        fallbackTo: ['vps-kvm8'],
        priority: 2,
        region: 'eu-de',
        cost: 'dedicated'
    },

    // ═══ BACKEND 3: GOOGLE APPS SCRIPT ═══
    'gas-drive': {
        name: 'Google Apps Script + Drive',
        type: 'bridge',
        icon: '📊',
        color: '#22C55E',
        endpoint: typeof process !== 'undefined'
            ? (process.env?.NEXUZ_GAS_URL || '')
            : '',
        healthPath: '?action=health',
        authType: 'none',           // GAS uses deployment key in URL
        capabilities: ['drive', 'sheets', 'docs', 'blogger', 'gmail'],
        routes: {
            'listFiles': { method: 'GET', path: '?action=listFiles' },
            'readFile': { method: 'POST', path: '?action=readFile' },
            'writeSheet': { method: 'POST', path: '?action=writeSheet' },
            'readSheet': { method: 'GET', path: '?action=readSheet' },
            'postBlog': { method: 'POST', path: '?action=postBlog' },
            'sortDrive': { method: 'POST', path: '?action=sortDrive' },
            'health': { method: 'GET', path: '?action=health' }
        },
        quotas: {
            dailyCalls: 20000,
            scriptRuntime: '6min',
            urlFetchCalls: 20000
        },
        fallbackTo: ['nextcloud-agent'],
        priority: 4,
        region: 'google-eu',
        cost: 'free'
    },

    // ═══ BACKEND 4: APACHE ═══
    'apache': {
        name: 'Apache Server',
        type: 'hosting',
        icon: '🌐',
        color: '#EF4444',
        endpoint: typeof process !== 'undefined'
            ? (process.env?.NEXUZ_APACHE_URL || '')
            : '',
        healthPath: '/health',
        authType: 'api-key',        // X-API-Key header
        authEnv: 'NEXUZ_APACHE_KEY',
        capabilities: ['hosting', 'routing', 'domains', 'php-api', 'ssl'],
        routes: {
            'status': { method: 'GET', path: '/api.php?action=status' },
            'deploy': { method: 'POST', path: '/api.php?action=deploy' },
            'domains': { method: 'GET', path: '/api.php?action=domains' },
            'logs': { method: 'GET', path: '/api.php?action=logs' }
        },
        vhosts: [],                 // Will be populated from server
        fallbackTo: ['cf-worker'],
        priority: 5,
        region: 'eu-de',
        cost: 'shared'
    },

    // ═══ BACKEND 5: CLOUDFLARE WORKER ═══
    'cf-worker': {
        name: 'Cloudflare Worker',
        type: 'edge',
        icon: '⚡',
        color: '#F59E0B',
        endpoint: typeof process !== 'undefined'
            ? (process.env?.NEXUZ_CF_URL || '')
            : '',
        healthPath: '/health',
        authType: 'bearer',
        authEnv: 'NEXUZ_CF_TOKEN',
        capabilities: ['cache', 'proxy', 'cors', 'geo-routing', 'rate-limit', 'kv', 'r2'],
        routes: {
            'proxy': { method: 'POST', path: '/proxy' },
            'cache': { method: 'POST', path: '/cache' },
            'kv-get': { method: 'GET', path: '/kv' },
            'kv-set': { method: 'PUT', path: '/kv' },
            'r2-upload': { method: 'PUT', path: '/r2' },
            'r2-get': { method: 'GET', path: '/r2' },
            'geo': { method: 'GET', path: '/geo' }
        },
        limits: {
            requestsPerDay: 100000,
            cpuTimeMs: 50,
            memoryMB: 128
        },
        fallbackTo: ['vps-kvm8', 'apache'],
        priority: 3,
        region: 'edge-global',
        cost: 'free-tier'
    },

    // ═══ BACKEND 6: NEXTCLOUD + AGENTS ═══
    'nextcloud-agent': {
        name: 'Nextcloud + PicoClaw',
        type: 'agent',
        icon: '🐙',
        color: '#fa1e4e',
        endpoint: typeof process !== 'undefined'
            ? (process.env?.NEXUZ_NC_URL || '')
            : '',
        healthPath: '/status.php',
        authType: 'basic',          // Nextcloud app password
        authEnv: 'NEXUZ_NC_CREDS', // user:password format
        capabilities: ['filesync', 'agent-dispatch', 'automation', 'devkitz-access', 'webdav'],
        routes: {
            'files': { method: 'PROPFIND', path: '/remote.php/dav/files/' },
            'upload': { method: 'PUT', path: '/remote.php/dav/files/' },
            'download': { method: 'GET', path: '/remote.php/dav/files/' },
            'agents': { method: 'POST', path: '/apps/picoclaw/api/run' },
            'agent-list': { method: 'GET', path: '/apps/picoclaw/api/agents' },
            'status': { method: 'GET', path: '/status.php' }
        },
        agents: [
            { id: 'picoclaw', name: 'PicoClaw', type: 'browser', status: 'active' },
            { id: 'nanobot', name: 'NanoBot', type: 'task', status: 'active' },
            { id: 'tinyclaw', name: 'TinyClaw', type: 'micro', status: 'dev' }
        ],
        fallbackTo: ['vps-kvm8'],
        priority: 6,
        region: 'eu-nl',
        cost: 'self-hosted'
    }
};

// ═══ HELPER FUNCTIONS ═══

/**
 * Get auth headers for a specific backend
 */
function getAuthHeaders(backendId) {
    const cfg = BridgeConfig[backendId];
    if (!cfg) return {};

    const getEnv = (key) => {
        if (typeof process !== 'undefined' && process.env) return process.env[key] || '';
        if (typeof localStorage !== 'undefined') return localStorage.getItem(key) || '';
        return '';
    };

    switch (cfg.authType) {
        case 'bearer':
            const token = getEnv(cfg.authEnv);
            return token ? { 'Authorization': `Bearer ${token}` } : {};
        case 'api-key':
            const key = getEnv(cfg.authEnv);
            return key ? { 'X-API-Key': key } : {};
        case 'basic':
            const creds = getEnv(cfg.authEnv);
            if (creds) {
                const encoded = typeof btoa !== 'undefined' ? btoa(creds) : Buffer.from(creds).toString('base64');
                return { 'Authorization': `Basic ${encoded}` };
            }
            return {};
        default:
            return {};
    }
}

/**
 * Build full URL for a backend route
 */
function buildRouteUrl(backendId, action) {
    const cfg = BridgeConfig[backendId];
    if (!cfg || !cfg.endpoint) return null;
    const route = cfg.routes[action];
    if (!route) return cfg.endpoint + '/' + action;
    return cfg.endpoint + route.path;
}

/**
 * Get all backends sorted by priority
 */
function getBackendsByPriority() {
    return Object.entries(BridgeConfig)
        .filter(([key]) => key !== 'defaults')
        .sort(([, a], [, b]) => (a.priority || 99) - (b.priority || 99))
        .map(([id, cfg]) => ({ id, ...cfg }));
}

/**
 * Find backends with a specific capability
 */
function findByCapability(capability) {
    return getBackendsByPriority()
        .filter(b => b.capabilities.includes(capability));
}

// ═══ EXPORTS ═══
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BridgeConfig, getAuthHeaders, buildRouteUrl, getBackendsByPriority, findByCapability };
}
if (typeof window !== 'undefined') {
    window.BridgeConfig = BridgeConfig;
    window.getAuthHeaders = getAuthHeaders;
    window.buildRouteUrl = buildRouteUrl;
}
export { BridgeConfig, getAuthHeaders, buildRouteUrl, getBackendsByPriority, findByCapability };
export default BridgeConfig;
