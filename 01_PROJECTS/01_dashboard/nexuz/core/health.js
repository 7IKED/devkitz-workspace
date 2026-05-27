/**
 * NEXUZ² Health Monitor v2.01.1_01
 * ═══════════════════════════════════
 * Überwacht alle 6 Backends, zeigt Status-Changes,
 * und liefert Daten für das NEXUZ² Dashboard.
 * 
 * Hängt am NexuzRouter über Events:
 *   nexuz.on('health:updated', data => ...)
 */

class NexuzHealthMonitor {
    constructor(router) {
        this.router = router;
        this.history = {};      // { backendId: [{ online, latency, timestamp }] }
        this.incidents = [];     // { backendId, type, message, timestamp }
        this.maxHistory = 60;    // Last 60 checks (= 30min at 30s interval)

        // Subscribe to router events
        if (router) {
            router.on('health:updated', (data) => this._onHealthUpdate(data));
            router.on('request:error', (data) => this._onRequestError(data));
        }
    }

    _onHealthUpdate(data) {
        Object.entries(data).forEach(([id, status]) => {
            if (!this.history[id]) this.history[id] = [];

            // Detect state change
            const prev = this.history[id][this.history[id].length - 1];
            if (prev && prev.online !== status.online) {
                this.incidents.push({
                    backendId: id,
                    type: status.online ? 'recovered' : 'down',
                    message: status.online
                        ? `${id} ist wieder online (Latenz: ${status.latency}ms)`
                        : `${id} ist offline`,
                    timestamp: new Date().toISOString()
                });

                // Keep last 50 incidents
                if (this.incidents.length > 50) this.incidents.shift();
            }

            this.history[id].push({
                online: status.online,
                latency: status.latency,
                timestamp: status.lastCheck
            });

            // Trim history  
            if (this.history[id].length > this.maxHistory) {
                this.history[id] = this.history[id].slice(-this.maxHistory);
            }
        });
    }

    _onRequestError(data) {
        this.incidents.push({
            backendId: data.backendId,
            type: 'error',
            message: `Request "${data.action}" fehlgeschlagen: ${data.error}`,
            timestamp: new Date().toISOString()
        });
    }

    // ═══ PUBLIC API ═══

    getUptime(backendId) {
        const hist = this.history[backendId] || [];
        if (hist.length === 0) return null;
        const online = hist.filter(h => h.online).length;
        return Math.round((online / hist.length) * 100);
    }

    getAllUptimes() {
        const result = {};
        Object.keys(this.history).forEach(id => {
            result[id] = this.getUptime(id);
        });
        return result;
    }

    getAverageLatency(backendId) {
        const hist = this.history[backendId] || [];
        const latencies = hist.map(h => h.latency).filter(Boolean);
        if (latencies.length === 0) return null;
        return Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
    }

    getIncidents(limit = 10) {
        return this.incidents.slice(-limit).reverse();
    }

    getDashboardData() {
        const health = this.router ? this.router.getHealthStatus() : { backends: [], summary: {} };
        return {
            ...health,
            uptimes: this.getAllUptimes(),
            incidents: this.getIncidents(5),
            requestLog: this.router ? this.router.getRequestLog().slice(-10) : []
        };
    }
}

// Export
if (typeof window !== 'undefined') {
    window.NexuzHealthMonitor = NexuzHealthMonitor;
}
export { NexuzHealthMonitor };
export default NexuzHealthMonitor;
