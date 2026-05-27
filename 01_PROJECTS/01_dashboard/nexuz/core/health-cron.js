/**
 * ⚡ DKZ HEALTH CRON v1.0
 * ════════════════════════
 * Periodischer Health-Check aller 6 Backends.
 * Läuft als Background-Task im API Gateway.
 * 
 * Features:
 * - Alle 30s Health-Check aller Backends
 * - WebSocket-Broadcast bei State-Changes
 * - Incident-Tracking mit History
 * - Uptime-Berechnung (rollend 24h)
 * - Auto-Retry bei Flapping (3x in 5min)
 */

const BACKENDS = [
    { id: 'vps-kvm8', name: 'KVM8 VPS', icon: '🖥️', healthPath: '/health' },
    { id: 'llm-dedicated', name: 'LLM Server', icon: '🧠', healthPath: '/v1/models' },
    { id: 'gas-drive', name: 'Google Apps Script', icon: '📊', healthPath: '?action=health' },
    { id: 'apache', name: 'Apache Server', icon: '🌐', healthPath: '/health' },
    { id: 'cf-worker', name: 'Cloudflare Worker', icon: '⚡', healthPath: '/health' },
    { id: 'nextcloud-agent', name: 'Nextcloud + PicoClaw', icon: '🐙', healthPath: '/status.php' },
    { id: 'api-gateway', name: 'API Gateway (self)', icon: '🔌', healthPath: null, selfCheck: true }
];

// State
const state = {
    backends: {},
    incidents: [],
    uptimeHistory: {},    // { [backendId]: [{ time, online }] }
    lastFullCheck: null,
    checkCount: 0
};

const MAX_INCIDENTS = 200;
const MAX_HISTORY = 2880;  // 24h @ 30s intervals
const CHECK_INTERVAL = parseInt(process.env.DKZ_SCAN_INTERVAL || '30000');
const CHECK_TIMEOUT = 5000;

/**
 * Initialize the health cron
 */
export function initHealthCron() {
    // Initialize state
    BACKENDS.forEach(b => {
        state.backends[b.id] = {
            ...b,
            endpoint: getEndpoint(b.id),
            online: b.selfCheck || false,
            latency: b.selfCheck ? 1 : null,
            lastCheck: null,
            uptime: b.selfCheck ? 100 : null,
            errorCount: 0,
            lastSeen: null,
            flapping: false
        };
        state.uptimeHistory[b.id] = [];
    });

    // Run first check immediately
    runHealthCheck();

    // Start periodic checks
    const interval = setInterval(runHealthCheck, CHECK_INTERVAL);

    console.log(`[DKZ HEALTH] Cron gestartet — ${BACKENDS.length} Backends, alle ${CHECK_INTERVAL / 1000}s`);

    return {
        getState: () => state,
        getBackends: () => state.backends,
        getIncidents: (limit = 20) => state.incidents.slice(0, limit),
        stop: () => clearInterval(interval),
        forceCheck: runHealthCheck
    };
}

/**
 * Run a full health check
 */
async function runHealthCheck() {
    state.checkCount++;
    const results = {};

    // Check all non-self backends in parallel
    const checks = BACKENDS.filter(b => !b.selfCheck).map(async b => {
        const backend = state.backends[b.id];
        const endpoint = backend.endpoint;

        if (!endpoint) {
            updateBackend(b.id, {
                online: false,
                latency: null,
                lastCheck: new Date().toISOString(),
                _reason: 'no-endpoint'
            });
            return;
        }

        const start = performance.now();
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT);

            const healthUrl = endpoint + b.healthPath;
            const resp = await fetch(healthUrl, {
                signal: controller.signal,
                headers: { 'User-Agent': 'DkZ-HealthCron/1.0' }
            });
            clearTimeout(timeout);

            const latency = Math.round(performance.now() - start);
            const wasOnline = backend.online;
            const isOnline = resp.ok;

            updateBackend(b.id, {
                online: isOnline,
                latency,
                lastCheck: new Date().toISOString(),
                errorCount: isOnline ? 0 : backend.errorCount + 1,
                lastSeen: isOnline ? new Date().toISOString() : backend.lastSeen
            });

            // State change → incident
            if (wasOnline !== isOnline) {
                addIncident(b.id, isOnline ? 'recovered' : 'down', latency);
            }
        } catch (err) {
            const latency = Math.round(performance.now() - start);
            const wasOnline = backend.online;

            updateBackend(b.id, {
                online: false,
                latency,
                lastCheck: new Date().toISOString(),
                errorCount: backend.errorCount + 1,
                _reason: err.name === 'AbortError' ? 'timeout' : 'fetch-failed'
            });

            if (wasOnline) {
                addIncident(b.id, 'down', latency, err.message);
            }
        }
    });

    await Promise.allSettled(checks);

    // Self-check always online
    updateBackend('api-gateway', {
        online: true,
        latency: 1,
        lastCheck: new Date().toISOString(),
        uptime: 100,
        lastSeen: new Date().toISOString()
    });

    // Calculate uptimes
    Object.keys(state.backends).forEach(id => calculateUptime(id));

    state.lastFullCheck = new Date().toISOString();

    // Broadcast full status
    if (globalThis.__dkzBroadcast) {
        const summary = getHealthSummary();
        globalThis.__dkzBroadcast('health:update', summary);
    }
}

/**
 * Update a backend's state
 */
function updateBackend(id, updates) {
    if (!state.backends[id]) return;
    Object.assign(state.backends[id], updates);

    // Track history for uptime calculation
    state.uptimeHistory[id].push({
        time: Date.now(),
        online: updates.online
    });
    if (state.uptimeHistory[id].length > MAX_HISTORY) {
        state.uptimeHistory[id].shift();
    }

    // Detect flapping (>3 state changes in 5 minutes)
    const fiveMin = Date.now() - 5 * 60 * 1000;
    const recent = state.uptimeHistory[id].filter(h => h.time > fiveMin);
    let changes = 0;
    for (let i = 1; i < recent.length; i++) {
        if (recent[i].online !== recent[i - 1].online) changes++;
    }
    state.backends[id].flapping = changes >= 3;

    if (state.backends[id].flapping && globalThis.__dkzBroadcast) {
        globalThis.__dkzBroadcast('health:flapping', { id, name: state.backends[id].name, changes });
    }
}

/**
 * Calculate rolling uptime percentage
 */
function calculateUptime(id) {
    const history = state.uptimeHistory[id];
    if (history.length === 0) return;

    const onlineCount = history.filter(h => h.online).length;
    state.backends[id].uptime = Math.round((onlineCount / history.length) * 100);
}

/**
 * Add an incident
 */
function addIncident(backendId, type, latency, detail = '') {
    const backend = state.backends[backendId];
    const incident = {
        id: `inc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        backendId,
        backendName: backend?.name || backendId,
        type,
        message: type === 'recovered'
            ? `${backend?.name} ist wieder online (${latency}ms)`
            : `${backend?.name} ist offline${detail ? ': ' + detail : ''}`,
        latency,
        timestamp: new Date().toISOString(),
        severity: type === 'down' ? 'critical' : 'info'
    };

    state.incidents.unshift(incident);
    if (state.incidents.length > MAX_INCIDENTS) state.incidents.pop();

    // WebSocket broadcast
    if (globalThis.__dkzBroadcast) {
        globalThis.__dkzBroadcast(`health:${type}`, incident);
    }

    console.log(`[DKZ HEALTH] ${type === 'down' ? '🔴' : '🟢'} ${incident.message}`);
}

/**
 * Get health summary
 */
function getHealthSummary() {
    const backends = Object.values(state.backends);
    const online = backends.filter(b => b.online);
    const avgLatency = online.length > 0
        ? Math.round(online.reduce((sum, b) => sum + (b.latency || 0), 0) / online.length)
        : 0;

    return {
        backends: backends.map(b => ({
            id: b.id,
            name: b.name,
            icon: b.icon,
            online: b.online,
            latency: b.latency,
            uptime: b.uptime,
            lastCheck: b.lastCheck,
            lastSeen: b.lastSeen,
            errorCount: b.errorCount,
            flapping: b.flapping
        })),
        summary: {
            total: backends.length,
            online: online.length,
            offline: backends.length - online.length,
            avgLatency,
            healthScore: Math.round((online.length / backends.length) * 100),
            checkCount: state.checkCount,
            lastFullCheck: state.lastFullCheck
        },
        recentIncidents: state.incidents.slice(0, 5)
    };
}

/**
 * Get endpoint from environment
 */
function getEndpoint(id) {
    const envMap = {
        'vps-kvm8': 'NEXUZ_VPS_URL',
        'llm-dedicated': 'NEXUZ_LLM_URL',
        'gas-drive': 'NEXUZ_GAS_URL',
        'apache': 'NEXUZ_APACHE_URL',
        'cf-worker': 'NEXUZ_CF_URL',
        'nextcloud-agent': 'NEXUZ_NC_URL'
    };
    return process.env[envMap[id]] || '';
}

export { getHealthSummary, state };
export default initHealthCron;
