/**
 * NEXUZ² Core Router v2.01.1_01
 * ═══════════════════════════════
 * Zentraler Message Router — verbindet alle 6 Backends.
 * Wird sowohl vom Dashboard als auch von der MCP Extension genutzt.
 * 
 * Architektur:
 *   Frontend → NexuzRouter → Bridge → Backend
 *                   ↓
 *             Health Monitor
 * 
 * Nutzung:
 *   import { nexuz } from './router.js';
 *   const result = await nexuz.route('llm', 'chat', { prompt: '...' });
 */

class NexuzRouter {
    constructor() {
        this.backends = {};
        this.bridges = {};
        this.healthCache = {};
        this.eventListeners = {};
        this.requestLog = [];
        this.config = {
            healthCheckInterval: 30000,  // 30s
            requestTimeout: 15000,       // 15s
            maxRetries: 2,
            fallbackOrder: ['vps-kvm8', 'cf-worker', 'apache', 'gas-drive']
        };
        this._init();
    }

    // ═══ INIT ═══
    async _init() {
        try {
            const resp = await fetch('./registry.json');
            const reg = await resp.json();

            // Register all backends from registry
            reg.backends.forEach(b => {
                this.backends[b.id] = {
                    ...b,
                    online: false,
                    lastCheck: null,
                    latency: null,
                    errorCount: 0
                };
            });

            // Initialize bridges
            this._initBridges();

            // Start health monitoring
            this._startHealthMonitor();

            this.emit('initialized', { backends: Object.keys(this.backends).length });
            console.log(`[NEXUZ²] Router initialized — ${Object.keys(this.backends).length} backends registered`);
        } catch (e) {
            console.warn('[NEXUZ²] Registry load failed, using defaults:', e.message);
            this._loadDefaults();
        }
    }

    // ═══ BRIDGE SYSTEM ═══
    _initBridges() {
        // Each bridge knows how to talk to its backend
        this.bridges = {
            'vps-kvm8': new VPSBridge(this.backends['vps-kvm8']),
            'llm-dedicated': new LLMBridge(this.backends['llm-dedicated']),
            'gas-drive': new GASBridge(this.backends['gas-drive']),
            'apache': new ApacheBridge(this.backends['apache']),
            'cf-worker': new CloudflareBridge(this.backends['cf-worker']),
            'nextcloud': new NextcloudBridge(this.backends['nextcloud'])
        };
    }

    // ═══ ROUTING ═══
    async route(backendId, action, payload = {}, options = {}) {
        const startTime = performance.now();
        const requestId = this._generateId();

        // Log entry
        this.requestLog.push({
            id: requestId,
            backend: backendId,
            action,
            timestamp: new Date().toISOString(),
            status: 'pending'
        });

        // Trim log to last 100 entries
        if (this.requestLog.length > 100) this.requestLog.shift();

        try {
            // Resolve backend
            const bridge = this.bridges[backendId];
            if (!bridge) {
                // Try fallback
                const fallback = this._findFallback(backendId);
                if (!fallback) throw new Error(`Backend "${backendId}" nicht verfügbar und kein Fallback gefunden`);
                console.log(`[NEXUZ²] Fallback: ${backendId} → ${fallback.id}`);
                return this.route(fallback.id, action, payload, { ...options, _retried: true });
            }

            // Execute with timeout
            const timeout = options.timeout || this.config.requestTimeout;
            const result = await this._withTimeout(
                bridge.execute(action, payload),
                timeout
            );

            // Update metrics
            const latency = Math.round(performance.now() - startTime);
            this._updateRequestLog(requestId, 'success', latency);
            this.backends[backendId].latency = latency;
            this.backends[backendId].errorCount = 0;

            this.emit('request:success', { requestId, backendId, action, latency });
            return { success: true, data: result, meta: { requestId, backendId, latency } };

        } catch (error) {
            const latency = Math.round(performance.now() - startTime);
            this._updateRequestLog(requestId, 'error', latency);

            if (this.backends[backendId]) {
                this.backends[backendId].errorCount++;
            }

            // Auto-retry with fallback
            if (!options._retried && this.config.maxRetries > 0) {
                const fallback = this._findFallback(backendId);
                if (fallback) {
                    console.log(`[NEXUZ²] Retry mit Fallback: ${backendId} → ${fallback.id}`);
                    return this.route(fallback.id, action, payload, { ...options, _retried: true });
                }
            }

            this.emit('request:error', { requestId, backendId, action, error: error.message });
            return { success: false, error: error.message, meta: { requestId, backendId, latency } };
        }
    }

    // ═══ SMART ROUTING ═══
    // Automatically pick the best backend for a capability
    async smartRoute(capability, payload = {}) {
        const capabilityMap = {
            'chat': ['llm-dedicated', 'vps-kvm8', 'cf-worker'],
            'inference': ['llm-dedicated'],
            'embedding': ['llm-dedicated', 'vps-kvm8'],
            'storage': ['gas-drive', 'nextcloud', 'vps-kvm8'],
            'files': ['nextcloud', 'gas-drive'],
            'web': ['cf-worker', 'apache', 'vps-kvm8'],
            'automation': ['nextcloud', 'vps-kvm8'],
            'proxy': ['cf-worker', 'apache'],
            'blog': ['gas-drive', 'apache'],
            'agents': ['nextcloud', 'vps-kvm8']
        };

        const candidates = capabilityMap[capability] || this.config.fallbackOrder;

        // Pick first healthy backend
        for (const id of candidates) {
            if (this.backends[id] && this.healthCache[id]?.online) {
                return this.route(id, capability, payload);
            }
        }

        // All offline — try first anyway
        return this.route(candidates[0], capability, payload);
    }

    // ═══ HEALTH MONITOR ═══
    _startHealthMonitor() {
        this.checkAllHealth();
        this._healthInterval = setInterval(() => this.checkAllHealth(), this.config.healthCheckInterval);
    }

    async checkAllHealth() {
        const results = {};
        const checks = Object.keys(this.bridges).map(async id => {
            try {
                const start = performance.now();
                const online = await this._withTimeout(this.bridges[id].healthCheck(), 5000);
                const latency = Math.round(performance.now() - start);

                results[id] = { online: !!online, latency, lastCheck: new Date().toISOString() };
                this.backends[id].online = !!online;
                this.backends[id].latency = latency;
                this.backends[id].lastCheck = results[id].lastCheck;
            } catch {
                results[id] = { online: false, latency: null, lastCheck: new Date().toISOString() };
                this.backends[id].online = false;
            }
        });

        await Promise.allSettled(checks);
        this.healthCache = results;
        this.emit('health:updated', results);
        return results;
    }

    getHealthStatus() {
        return {
            backends: Object.entries(this.backends).map(([id, b]) => ({
                id,
                name: b.name,
                online: b.online,
                latency: b.latency,
                lastCheck: b.lastCheck,
                errorCount: b.errorCount,
                icon: b.icon
            })),
            summary: {
                total: Object.keys(this.backends).length,
                online: Object.values(this.backends).filter(b => b.online).length,
                avgLatency: this._avgLatency()
            }
        };
    }

    // ═══ EVENT SYSTEM ═══
    on(event, callback) {
        if (!this.eventListeners[event]) this.eventListeners[event] = [];
        this.eventListeners[event].push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        (this.eventListeners[event] || []).forEach(cb => {
            try { cb(data); } catch (e) { console.error(`[NEXUZ²] Event error (${event}):`, e); }
        });
    }

    // ═══ HELPERS ═══
    _findFallback(excludeId) {
        return this.config.fallbackOrder
            .filter(id => id !== excludeId && this.backends[id])
            .map(id => this.backends[id])
            .find(b => b.online || b.errorCount < 3);
    }

    _withTimeout(promise, ms) {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
        ]);
    }

    _updateRequestLog(id, status, latency) {
        const entry = this.requestLog.find(r => r.id === id);
        if (entry) { entry.status = status; entry.latency = latency; }
    }

    _avgLatency() {
        const latencies = Object.values(this.backends).map(b => b.latency).filter(Boolean);
        return latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;
    }

    _generateId() {
        return 'nx_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
    }

    _loadDefaults() {
        const defaults = [
            { id: 'vps-kvm8', name: 'KVM8 VPS', icon: '🖥️' },
            { id: 'llm-dedicated', name: 'LLM Server', icon: '🧠' },
            { id: 'gas-drive', name: 'Google Apps Script', icon: '📊' },
            { id: 'apache', name: 'Apache Server', icon: '🌐' },
            { id: 'cf-worker', name: 'Cloudflare Worker', icon: '⚡' },
            { id: 'nextcloud', name: 'Nextcloud', icon: '🐙' }
        ];
        defaults.forEach(d => {
            this.backends[d.id] = { ...d, online: false, lastCheck: null, latency: null, errorCount: 0 };
        });
    }

    // ═══ PUBLIC API ═══
    getRequestLog() { return [...this.requestLog]; }
    getBackends() { return { ...this.backends }; }
    destroy() { clearInterval(this._healthInterval); }
}

// ═══ BRIDGE BASE CLASS ═══
class BackendBridge {
    constructor(config) {
        this.config = config || {};
        this.endpoint = config?.endpoint || '';
    }

    async execute(action, payload) {
        throw new Error('Bridge.execute() must be implemented');
    }

    async healthCheck() {
        if (!this.endpoint) return false;
        try {
            const resp = await fetch(this.endpoint + '/health', { method: 'GET', mode: 'cors' });
            return resp.ok;
        } catch { return false; }
    }

    async _fetch(path, options = {}) {
        const url = this.endpoint + path;
        const resp = await fetch(url, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        return resp.json();
    }
}

// ═══ CONCRETE BRIDGES ═══

class VPSBridge extends BackendBridge {
    async execute(action, payload) {
        return this._fetch(`/api/${action}`, { method: 'POST', body: JSON.stringify(payload) });
    }
}

class LLMBridge extends BackendBridge {
    async execute(action, payload) {
        const actionMap = {
            'chat': '/v1/chat/completions',
            'embedding': '/v1/embeddings',
            'models': '/v1/models',
            'inference': '/v1/completions'
        };
        const path = actionMap[action] || `/api/${action}`;
        return this._fetch(path, { method: 'POST', body: JSON.stringify(payload) });
    }

    async healthCheck() {
        if (!this.endpoint) return false;
        try {
            const resp = await fetch(this.endpoint + '/v1/models', { method: 'GET' });
            return resp.ok;
        } catch { return false; }
    }
}

class GASBridge extends BackendBridge {
    async execute(action, payload) {
        // Google Apps Script uses GET with parameters or POST with payload
        const url = this.endpoint + '?action=' + encodeURIComponent(action);
        const resp = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain' } // GAS quirk
        });
        return resp.json();
    }

    async healthCheck() {
        if (!this.endpoint) return false;
        try {
            const resp = await fetch(this.endpoint + '?action=health');
            return resp.ok;
        } catch { return false; }
    }
}

class ApacheBridge extends BackendBridge {
    async execute(action, payload) {
        return this._fetch(`/api.php?action=${encodeURIComponent(action)}`, {
            method: 'POST', body: JSON.stringify(payload)
        });
    }
}

class CloudflareBridge extends BackendBridge {
    async execute(action, payload) {
        return this._fetch(`/${action}`, { method: 'POST', body: JSON.stringify(payload) });
    }
}

class NextcloudBridge extends BackendBridge {
    async execute(action, payload) {
        const actionMap = {
            'files': '/remote.php/dav/files/',
            'agents': '/apps/picoclaw/api/',
            'automation': '/apps/picoclaw/run/'
        };
        const basePath = actionMap[action] || `/api/${action}`;
        return this._fetch(basePath, { method: 'POST', body: JSON.stringify(payload) });
    }

    async healthCheck() {
        if (!this.endpoint) return false;
        try {
            const resp = await fetch(this.endpoint + '/status.php');
            return resp.ok;
        } catch { return false; }
    }
}

// ═══ EXPORT ═══
const nexuz = new NexuzRouter();

// Make globally available for dashboard/MCP
if (typeof window !== 'undefined') {
    window.NexuzRouter = NexuzRouter;
    window.nexuz = nexuz;
}

// ES Module export
export { NexuzRouter, nexuz };
export default nexuz;
