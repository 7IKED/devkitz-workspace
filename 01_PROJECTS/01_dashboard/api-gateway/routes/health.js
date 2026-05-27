/**
 * ⚡ DKZ API — Health Routes
 * ════════════════════════════
 * Backend Health Checks, Incidents, Uptime
 */

import { Router } from 'express';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

const router = Router();

// In-memory incident store
const incidents = [];
const healthHistory = {};
const MAX_INCIDENTS = 100;

// Backend definitions (loaded from registry or defaults)
let backends = [
    { id: 'vps-kvm8', name: 'KVM8 VPS', icon: '🖥️', endpoint: '', online: false, latency: null, lastCheck: null, uptime: null },
    { id: 'llm-dedicated', name: 'Linux Dedicated (LLM)', icon: '🧠', endpoint: '', online: false, latency: null, lastCheck: null, uptime: null },
    { id: 'gas-drive', name: 'Google Apps Script + Drive', icon: '📊', endpoint: '', online: false, latency: null, lastCheck: null, uptime: null },
    { id: 'apache', name: 'Apache Server', icon: '🌐', endpoint: '', online: false, latency: null, lastCheck: null, uptime: null },
    { id: 'cf-worker', name: 'Cloudflare Worker', icon: '⚡', endpoint: '', online: false, latency: null, lastCheck: null, uptime: null },
    { id: 'nextcloud-agent', name: 'Nextcloud + PicoClaw', icon: '🐙', endpoint: '', online: false, latency: null, lastCheck: null, uptime: null },
    { id: 'api-gateway', name: 'API Gateway (self)', icon: '🔌', endpoint: 'http://localhost:3040', online: true, latency: 1, lastCheck: new Date().toISOString(), uptime: 100 }
];

// Load registry endpoints
async function loadRegistry() {
    try {
        const regPath = resolve('C:/DEVKiTZ/01_PROJECTS/01_dashboard/nexuz/core/registry.json');
        const data = JSON.parse(await readFile(regPath, 'utf-8'));
        data.backends.forEach(rb => {
            const existing = backends.find(b => b.id === rb.id);
            if (existing && rb.endpoint) {
                existing.endpoint = rb.endpoint;
            }
        });
    } catch { /* registry not available */ }
}
loadRegistry();

// Health check a single backend
async function checkBackend(backend) {
    if (!backend.endpoint) {
        return { ...backend, online: false, latency: null, lastCheck: new Date().toISOString() };
    }

    const start = performance.now();
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        let healthUrl = backend.endpoint;
        if (backend.id === 'llm-dedicated') healthUrl += '/v1/models';
        else if (backend.id === 'gas-drive') healthUrl += '?action=health';
        else if (backend.id === 'nextcloud-agent') healthUrl += '/status.php';
        else healthUrl += '/health';

        const resp = await fetch(healthUrl, { signal: controller.signal });
        clearTimeout(timeout);

        const latency = Math.round(performance.now() - start);
        const online = resp.ok;

        // Track state change
        if (backend.online !== online) {
            incidents.push({
                backendId: backend.id,
                type: online ? 'recovered' : 'down',
                message: online ? `${backend.name} ist wieder online (${latency}ms)` : `${backend.name} ist offline`,
                timestamp: new Date().toISOString()
            });
            if (incidents.length > MAX_INCIDENTS) incidents.shift();

            // WebSocket broadcast
            if (globalThis.__dkzBroadcast) {
                globalThis.__dkzBroadcast('health:changed', { id: backend.id, online, latency });
            }
        }

        return { ...backend, online, latency, lastCheck: new Date().toISOString() };
    } catch {
        const latency = Math.round(performance.now() - start);
        return { ...backend, online: false, latency, lastCheck: new Date().toISOString() };
    }
}

// Self-check always online
function selfCheck() {
    const self = backends.find(b => b.id === 'api-gateway');
    if (self) {
        self.online = true;
        self.latency = 1;
        self.lastCheck = new Date().toISOString();
        self.uptime = 100;
    }
}

// ─── GET /health ───
router.get('/health', async (req, res) => {
    selfCheck();

    // Check all backends in parallel
    const results = await Promise.allSettled(
        backends.filter(b => b.id !== 'api-gateway').map(async b => {
            const result = await checkBackend(b);
            // Update in-place
            Object.assign(b, result);
            return result;
        })
    );

    const online = backends.filter(b => b.online).length;
    const avgLatency = backends.filter(b => b.latency).reduce((sum, b) => sum + b.latency, 0) /
        (backends.filter(b => b.latency).length || 1);

    res.json({
        backends: backends.map(b => ({
            id: b.id, name: b.name, icon: b.icon,
            online: b.online, latency: b.latency,
            lastCheck: b.lastCheck, uptime: b.uptime
        })),
        summary: {
            total: backends.length,
            online,
            offline: backends.length - online,
            avgLatency: Math.round(avgLatency)
        },
        timestamp: new Date().toISOString()
    });
});

// ─── GET /health/:backendId ───
router.get('/health/:backendId', async (req, res) => {
    const backend = backends.find(b => b.id === req.params.backendId);
    if (!backend) {
        return res.status(404).json({ error: `Backend "${req.params.backendId}" nicht gefunden` });
    }

    const result = await checkBackend(backend);
    Object.assign(backend, result);

    res.json({ backend: result });
});

// ─── GET /health/incidents ───
router.get('/health/incidents', (req, res) => {
    const { limit = 10, severity = 'all' } = req.query;
    let filtered = [...incidents];

    if (severity !== 'all') {
        filtered = filtered.filter(i => i.type === severity);
    }

    res.json({
        incidents: filtered.slice(-parseInt(limit)).reverse(),
        total: filtered.length
    });
});

export { router as healthRoutes };
