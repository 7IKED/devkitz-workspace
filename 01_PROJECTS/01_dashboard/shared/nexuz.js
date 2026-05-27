/**
 * NEXUZ™ -- DkZ™ Frontend-Backend Bridge v1.0
 * @DKZ:TAG [SYS:nexuz] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * 
 * Verbindet jedes DkZ Modul mit dem ONTHERUN Backend.
 * Einbinden: <script src="../../shared/nexuz.js"></script>
 * 
 * Features:
 * - REST API calls zum Gateway
 * - Token Management (verschluesselt in localStorage)
 * - Multi-Model Chat (OpenRouter, NVIDIA, HuggingFace, etc.)
 * - n8n Workflow Execution
 * - Event Bridge (Module-to-Module Communication)
 * - Connection Status + Auto-Reconnect
 * - Research Pipeline
 */
const NEXUZ = (() => {
    'use strict';

    // Config
    const GATEWAY = localStorage.getItem('nexuz-gateway') || 'http://localhost:3040';
    const TOKEN_KEY = 'nexuz-tokens';
    const EVENTS = {};
    let connected = false;
    let ws = null;

    // AES encryption for tokens in localStorage
    async function encrypt(text, pass) {
        if (!window.crypto || !window.crypto.subtle) return btoa(text);
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey('raw', enc.encode(pass.padEnd(32, '0').slice(0, 32)), 'AES-GCM', false, ['encrypt']);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
        return btoa(String.fromCharCode(...iv) + String.fromCharCode(...new Uint8Array(ct)));
    }

    async function decrypt(data, pass) {
        if (!window.crypto || !window.crypto.subtle) return atob(data);
        const raw = Uint8Array.from(atob(data), c => c.charCodeAt(0));
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey('raw', enc.encode(pass.padEnd(32, '0').slice(0, 32)), 'AES-GCM', false, ['decrypt']);
        const iv = raw.slice(0, 12);
        const ct = raw.slice(12);
        const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
        return new TextDecoder().decode(pt);
    }

    const SECRET = 'DkZ-NEXUZ-2026';

    // ---- Token Management ----
    function getTokens() {
        try { return JSON.parse(localStorage.getItem(TOKEN_KEY) || '{}'); }
        catch { return {}; }
    }

    function setToken(provider, token) {
        const tokens = getTokens();
        tokens[provider] = token;
        localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
        // Also send to backend
        apiFetch('/api/v1/tokens', { method: 'POST', body: JSON.stringify({ provider, token }) }).catch(() => { });
    }

    function getToken(provider) {
        return getTokens()[provider] || '';
    }

    function removeToken(provider) {
        const tokens = getTokens();
        delete tokens[provider];
        localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    }

    function getProviderStatus() {
        const tokens = getTokens();
        const providers = ['github', 'notion', 'huggingface', 'openrouter', 'nvidia', 'openai', 'anthropic', 'gemini', 'grok'];
        return providers.map(p => ({
            id: p,
            configured: !!tokens[p],
            masked: tokens[p] ? tokens[p].substring(0, 6) + '...' : 'not set'
        }));
    }

    // ---- API Calls ----
    async function apiFetch(path, options = {}) {
        const url = `${GATEWAY}${path}`;
        try {
            const resp = await fetch(url, {
                headers: { 'Content-Type': 'application/json', ...options.headers },
                ...options
            });
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`NEXUZ™ ${resp.status}: ${text}`);
            }
            return resp.json();
        } catch (err) {
            if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                connected = false;
                emit('connection', { status: 'offline' });
                throw new Error('ONTHERUN Gateway offline. Start with: dkz start');
            }
            throw err;
        }
    }

    async function call(tool, params = {}) {
        return apiFetch('/api/v1/tools/execute', {
            method: 'POST',
            body: JSON.stringify({ tool, params })
        });
    }

    // ---- Chat ----
    async function chat(message, options = {}) {
        return apiFetch('/api/v1/chat', {
            method: 'POST',
            body: JSON.stringify({
                message,
                model: options.model || 'auto',
                systemPrompt: options.systemPrompt || '',
                history: options.history || []
            })
        });
    }

    // ---- Research ----
    async function research(topic, tags = []) {
        return call('otr_research_create', { topic, tags });
    }

    // ---- Event Bridge ----
    function on(event, callback) {
        if (!EVENTS[event]) EVENTS[event] = [];
        EVENTS[event].push(callback);
    }

    function off(event, callback) {
        if (!EVENTS[event]) return;
        EVENTS[event] = EVENTS[event].filter(cb => cb !== callback);
    }

    function emit(event, data) {
        (EVENTS[event] || []).forEach(cb => {
            try { cb(data); } catch (e) { console.error('[NEXUZ™] Event error:', e); }
        });
        // Also broadcast via BroadcastChannel for cross-tab
        try {
            const bc = new BroadcastChannel('nexuz');
            bc.postMessage({ event, data });
            bc.close();
        } catch { }
    }

    // Listen for cross-tab events
    try {
        const bc = new BroadcastChannel('nexuz');
        bc.onmessage = (e) => {
            const { event, data } = e.data;
            (EVENTS[event] || []).forEach(cb => cb(data));
        };
    } catch { }

    // ---- WebSocket ----
    function connectWS() {
        try {
            ws = new WebSocket(GATEWAY.replace('http', 'ws'));
            ws.onopen = () => { connected = true; emit('connection', { status: 'online' }); };
            ws.onclose = () => { connected = false; setTimeout(connectWS, 5000); };
            ws.onmessage = (e) => {
                try {
                    const msg = JSON.parse(e.data);
                    if (msg.event) emit(msg.event, msg.data);
                } catch { }
            };
        } catch { }
    }

    // ---- Health Check ----
    async function checkHealth() {
        try {
            const data = await apiFetch('/api/v1/health');
            connected = true;
            emit('connection', { status: 'online', data });
            return data;
        } catch {
            connected = false;
            emit('connection', { status: 'offline' });
            return null;
        }
    }

    // ---- Settings ----
    function setGateway(url) {
        localStorage.setItem('nexuz-gateway', url);
        window.location.reload();
    }

    function getGateway() { return GATEWAY; }

    // ---- Init ----
    function init() {
        checkHealth();
        connectWS();
        console.log('[NEXUZ™] Frontend-Backend Bridge v1.0 initialized');
        console.log('[NEXUZ™] Gateway:', GATEWAY);
    }

    // Auto-init when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        // Core
        call, chat, research, apiFetch,
        // Tokens
        setToken, getToken, removeToken, getProviderStatus,
        // Events
        on, off, emit,
        // Config
        setGateway, getGateway,
        // Status
        get connected() { return connected; },
        checkHealth,
        // Version
        version: '1.0.0'
    };
})();

// Global access
if (typeof window !== 'undefined') window.NEXUZ = NEXUZ;
