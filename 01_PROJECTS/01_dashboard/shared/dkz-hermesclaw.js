/**
 * DkZ HermesClaw v1.0 — Memory Bridge fuer Hermes-Module
 * @DKZ:RULES → R21 Shared Scripts, R15 esc(), R8 keine Umlaute
 * @DKZ:TAG → [SYS:hermesclaw] [CAT:shared] [LANG:js]
 *
 * Verbindet Hermes-3D + Hermes-Overlay mit OpenMemory (Mem0)
 * Persistente Erinnerungen ueber Sessions hinweg
 *
 * Einbinden:
 *   <script src="../../shared/dkz-hermesclaw.js"></script>
 */
const DkzHermesClaw = (() => {
    'use strict';
    const VERSION = 'v1.0.0';
    const GATEWAY = 'http://localhost:3040';
    const STORAGE_KEY = 'dkz-hermesclaw-local';

    let _userId = 'hermes-user';
    let _agentId = 'hermes';
    let _initialized = false;

    // ═══════════════════════════════════════
    // Memory API Calls
    // ═══════════════════════════════════════

    /**
     * Erinnerung speichern
     * @param {string} text — Was soll gespeichert werden
     * @param {object} [metadata] — Zusaetzliche Metadaten
     * @returns {Promise<object>}
     */
    async function remember(text, metadata = {}) {
        if (!text || !text.trim()) return null;

        // Remote speichern via Gateway
        try {
            const r = await fetch(`${GATEWAY}/api/v1/memory/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    user_id: _userId,
                    agent_id: _agentId,
                    metadata: {
                        source: 'hermesclaw',
                        module: metadata.module || 'hermes',
                        timestamp: new Date().toISOString(),
                        ...metadata
                    }
                }),
                signal: AbortSignal.timeout(10000)
            });
            if (r.ok) {
                const data = await r.json();
                _saveLocal(text, metadata);
                return data;
            }
        } catch { /* Gateway offline */ }

        // Fallback: Nur lokal speichern
        _saveLocal(text, metadata);
        return { success: true, source: 'local' };
    }

    /**
     * Erinnerungen suchen
     * @param {string} query — Suchbegriff
     * @param {number} [limit=10] — Max Ergebnisse
     * @returns {Promise<Array>}
     */
    async function recall(query, limit = 10) {
        // Remote suchen
        try {
            const r = await fetch(`${GATEWAY}/api/v1/memory/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query,
                    user_id: _userId,
                    limit: limit
                }),
                signal: AbortSignal.timeout(10000)
            });
            if (r.ok) {
                const data = await r.json();
                return data.results || [];
            }
        } catch { /* Gateway offline */ }

        // Fallback: Lokal suchen
        return _searchLocal(query, limit);
    }

    /**
     * Alle Erinnerungen abrufen
     * @returns {Promise<Array>}
     */
    async function recallAll() {
        try {
            const r = await fetch(`${GATEWAY}/api/v1/memory/all?user_id=${_userId}&agent_id=${_agentId}`, {
                signal: AbortSignal.timeout(10000)
            });
            if (r.ok) {
                const data = await r.json();
                return data.results || [];
            }
        } catch { /* offline */ }

        return _getLocalAll();
    }

    /**
     * Erinnerung loeschen
     * @param {string} id — Memory ID
     */
    async function forget(id) {
        try {
            await fetch(`${GATEWAY}/api/v1/memory/${id}`, {
                method: 'DELETE',
                signal: AbortSignal.timeout(5000)
            });
        } catch { /* offline */ }

        // Auch lokal loeschen
        const local = _getLocalAll();
        const filtered = local.filter(m => m.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    // ═══════════════════════════════════════
    // Kontext-Builder (fuer AI Prompts)
    // ═══════════════════════════════════════

    /**
     * Baut Kontext aus relevanten Erinnerungen
     * @param {string} currentMessage — Aktuelle User-Nachricht
     * @returns {Promise<string>} — Kontext-String fuer System-Prompt
     */
    async function buildContext(currentMessage) {
        const memories = await recall(currentMessage, 5);
        if (!memories.length) return '';

        let ctx = '\n--- ERINNERUNGEN (HermesClaw) ---\n';
        memories.forEach((m, i) => {
            const text = m.memory || m.text || '';
            ctx += `[${i + 1}] ${text}\n`;
        });
        ctx += '--- ENDE ERINNERUNGEN ---\n';
        return ctx;
    }

    /**
     * Auto-Remember: Speichert wichtige Infos aus Konversationen
     * @param {string} userMsg — User-Nachricht
     * @param {string} aiReply — AI-Antwort
     */
    async function autoRemember(userMsg, aiReply) {
        // Nur speichern wenn die Nachricht substantiell ist
        if (userMsg.length < 20) return;

        // Wichtige Patterns erkennen
        const patterns = [
            /mein name ist/i, /ich bin/i, /ich arbeite/i,
            /vergiss nicht/i, /merke dir/i, /wichtig/i,
            /passwort|token|key|api/i,
            /projekt|modul|feature/i,
        ];

        const isImportant = patterns.some(p => p.test(userMsg));
        if (isImportant) {
            await remember(userMsg, {
                type: 'auto-capture',
                context: aiReply ? aiReply.substring(0, 200) : '',
            });
        }
    }

    // ═══════════════════════════════════════
    // Local Storage Fallback
    // ═══════════════════════════════════════

    function _saveLocal(text, metadata) {
        const local = _getLocalAll();
        local.push({
            id: 'local-' + Date.now(),
            memory: text,
            metadata: metadata,
            created_at: new Date().toISOString(),
        });
        // Max 500 lokal
        if (local.length > 500) local.splice(0, local.length - 500);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
        } catch { /* Storage voll */ }
    }

    function _getLocalAll() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch { return []; }
    }

    function _searchLocal(query, limit) {
        const q = query.toLowerCase();
        return _getLocalAll()
            .filter(m => (m.memory || '').toLowerCase().includes(q))
            .slice(0, limit);
    }

    // ═══════════════════════════════════════
    // Init + Config
    // ═══════════════════════════════════════

    function init(options = {}) {
        _userId = options.userId || _userId;
        _agentId = options.agentId || _agentId;
        _initialized = true;
    }

    function getStatus() {
        return {
            version: VERSION,
            userId: _userId,
            agentId: _agentId,
            initialized: _initialized,
            localMemories: _getLocalAll().length,
            gateway: GATEWAY,
        };
    }

    // ═══════════════════════════════════════
    // Public API
    // ═══════════════════════════════════════
    return {
        init,
        remember,
        recall,
        recallAll,
        forget,
        buildContext,
        autoRemember,
        getStatus,
        VERSION,
    };
})();

// Auto-Init wenn als Script eingebunden
if (typeof window !== 'undefined') {
    window.DkzHermesClaw = DkzHermesClaw;
}
