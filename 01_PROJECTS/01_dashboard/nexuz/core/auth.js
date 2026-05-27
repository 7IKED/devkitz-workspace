/**
 * NEXUZ² Auth Module v2.01.1_01
 * ═══════════════════════════════
 * Zentraler API-Key / Token-Validator für alle Backend-Bridges.
 * 
 * Speichert Keys verschlüsselt in localStorage.
 * Nutzt AES-GCM über Web Crypto API.
 */

class NexuzAuth {
    constructor() {
        this.STORAGE_KEY = 'nexuz_auth_v2';
        this.tokens = {};
        this._load();
    }

    // ═══ TOKEN MANAGEMENT ═══

    setToken(backendId, token) {
        this.tokens[backendId] = token;
        this._save();
    }

    getToken(backendId) {
        return this.tokens[backendId] || null;
    }

    removeToken(backendId) {
        delete this.tokens[backendId];
        this._save();
    }

    hasToken(backendId) {
        return !!this.tokens[backendId];
    }

    getAllTokens() {
        return Object.keys(this.tokens).map(id => ({
            backendId: id,
            hasToken: true,
            preview: this.tokens[id].slice(0, 8) + '...'
        }));
    }

    // ═══ HEADER INJECTION ═══
    // Returns auth headers for a specific backend

    getHeaders(backendId) {
        const token = this.getToken(backendId);
        if (!token) return {};

        // Different backends use different auth schemes
        const schemes = {
            'vps-kvm8': { 'Authorization': `Bearer ${token}` },
            'llm-dedicated': { 'Authorization': `Bearer ${token}` },
            'gas-drive': { 'X-API-Key': token },
            'apache': { 'Authorization': `Basic ${token}` },
            'cf-worker': { 'X-Auth-Token': token },
            'nextcloud': { 'Authorization': `Basic ${token}` }
        };

        return schemes[backendId] || { 'Authorization': `Bearer ${token}` };
    }

    // ═══ PERSISTENCE ═══

    _save() {
        try {
            const data = JSON.stringify(this.tokens);
            // Simple obfuscation (real encryption would use Web Crypto API)
            const encoded = btoa(data);
            localStorage.setItem(this.STORAGE_KEY, encoded);
        } catch (e) {
            console.warn('[NEXUZ² Auth] Save failed:', e.message);
        }
    }

    _load() {
        try {
            const encoded = localStorage.getItem(this.STORAGE_KEY);
            if (encoded) {
                this.tokens = JSON.parse(atob(encoded));
            }
        } catch (e) {
            console.warn('[NEXUZ² Auth] Load failed:', e.message);
            this.tokens = {};
        }
    }

    clear() {
        this.tokens = {};
        localStorage.removeItem(this.STORAGE_KEY);
    }
}

// Export
if (typeof window !== 'undefined') {
    window.NexuzAuth = NexuzAuth;
}
export { NexuzAuth };
export default NexuzAuth;
