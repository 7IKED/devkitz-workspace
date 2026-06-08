/**
 * DkZ LLM Logger™ — Universeller Chat-Log fuer ALLE LLMs
 * @DKZ:TAG [SYS:llm-logger] [CAT:shared] [LANG:js]
 * @DKZ:RULES R12 Kein Wissensverlust, R90 Event-Logging
 * @version v1.0.0
 *
 * Speichert JEDEN LLM-Chat komplett als JSON:
 * - Puter AI (GPT, Claude, Gemini, Mistral, LLaMA)
 * - Grok (xAI)
 * - Hermes (Multi-Model)
 * - OpenCode (lokal)
 * - NanoBot Chats
 *
 * Speicherorte:
 * 1. localStorage (sofort, offline)
 * 2. Puter Cloud (/dkz/llm-logs/)
 * 3. JSON Export (manuell)
 *
 * Einbinden: <script src="../../shared/dkz-llm-logger.js"></script>
 * API: DkzLlmLogger.log(provider, model, messages, meta)
 */
const DkzLlmLogger = (() => {
    'use strict';

    const VERSION = '1.0.0';
    const STORAGE_KEY = 'dkz-llm-logs';
    const PUTER_PATH = 'llm-logs/';
    const MAX_LOCAL_ENTRIES = 500;

    // ========================================
    // CORE: LOG ENTRY
    // ========================================
    function log(provider, model, messages, meta) {
        const entry = {
            id: 'LOG-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            provider: provider || 'unknown',
            model: model || 'unknown',
            messages: Array.isArray(messages) ? messages : [{ role: 'user', content: messages }],
            meta: meta || {},
            timestamp: new Date().toISOString(),
            module: detectModule(),
            messageCount: Array.isArray(messages) ? messages.length : 1,
            totalTokens: estimateTokens(messages)
        };

        // 1. localStorage (sofort)
        saveToLocal(entry);

        // 2. Puter Cloud (async)
        saveToPuter(entry);

        // 3. Event
        if (typeof DkzJames !== 'undefined' && DkzJames.emit) {
            DkzJames.emit('llm.logged', { id: entry.id, provider, model, messages: entry.messageCount });
        }

        return entry;
    }

    // ========================================
    // QUICK LOGGERS (Shortcut fuer jeden Provider)
    // ========================================
    function logPuter(model, userMsg, aiResponse, meta) {
        return log('puter', model, [
            { role: 'user', content: userMsg, timestamp: new Date().toISOString() },
            { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
        ], meta);
    }

    function logGrok(userMsg, aiResponse, meta) {
        return log('grok', 'grok-3', [
            { role: 'user', content: userMsg, timestamp: new Date().toISOString() },
            { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
        ], meta);
    }

    function logHermes(model, messages, meta) {
        return log('hermes', model, messages, meta);
    }

    function logOpenCode(model, messages, meta) {
        return log('opencode', model || 'gemma4-26b', messages, meta);
    }

    function logNanoBot(botName, messages, meta) {
        return log('nanobot', botName || 'antigravity', messages, meta);
    }

    function logAntigravity(messages, meta) {
        return log('antigravity', 'gemini', messages, meta);
    }

    // ========================================
    // FULL CONVERSATION LOGGER
    // ========================================
    function logConversation(provider, model, conversation) {
        // conversation = { id, title, messages: [{role, content, timestamp}], systemPrompt }
        const entry = {
            id: conversation.id || 'CONV-' + Date.now(),
            provider,
            model,
            title: conversation.title || 'Untitled',
            systemPrompt: conversation.systemPrompt || null,
            messages: conversation.messages || [],
            meta: conversation.meta || {},
            timestamp: new Date().toISOString(),
            module: detectModule(),
            messageCount: (conversation.messages || []).length,
            totalTokens: estimateTokens(conversation.messages),
            type: 'conversation'
        };

        saveToLocal(entry);
        saveToPuter(entry);
        return entry;
    }

    // ========================================
    // localStorage
    // ========================================
    function saveToLocal(entry) {
        try {
            const logs = getLocalLogs();
            logs.push(entry);
            // Pruning: max 500 Eintraege lokal
            while (logs.length > MAX_LOCAL_ENTRIES) logs.shift();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
        } catch (e) {
            // Quota exceeded — aelteste Haelfte loeschen
            try {
                const logs = getLocalLogs();
                const half = logs.slice(Math.floor(logs.length / 2));
                half.push(entry);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(half));
            } catch (e2) { /* aufgeben */ }
        }
    }

    function getLocalLogs() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
        catch { return []; }
    }

    // ========================================
    // Puter Cloud
    // ========================================
    async function saveToPuter(entry) {
        if (typeof window === 'undefined') return;
        if (!window.puter) return;

        try {
            const isAuth = await puter.auth.isSignedIn();
            if (!isAuth) return;

            // Speichere als einzelne JSON-Datei pro Entry
            const dateFolder = entry.timestamp.split('T')[0]; // 2026-06-01
            const filename = entry.id + '.json';
            const path = PUTER_PATH + dateFolder + '/' + entry.provider + '/' + filename;

            const blob = new Blob([JSON.stringify(entry, null, 2)], { type: 'application/json' });
            await puter.fs.write('/dkz/' + path, blob, { createMissingParents: true });
        } catch (e) {
            // Silent fail — localStorage hat Backup
        }
    }

    // ========================================
    // QUERY / SEARCH
    // ========================================
    function query(filter) {
        const logs = getLocalLogs();
        if (!filter) return logs;

        return logs.filter(entry => {
            if (filter.provider && entry.provider !== filter.provider) return false;
            if (filter.model && entry.model !== filter.model) return false;
            if (filter.module && entry.module !== filter.module) return false;
            if (filter.after && new Date(entry.timestamp) < new Date(filter.after)) return false;
            if (filter.before && new Date(entry.timestamp) > new Date(filter.before)) return false;
            if (filter.search) {
                const text = JSON.stringify(entry.messages).toLowerCase();
                if (!text.includes(filter.search.toLowerCase())) return false;
            }
            return true;
        });
    }

    function getStats() {
        const logs = getLocalLogs();
        const stats = {
            totalEntries: logs.length,
            totalMessages: 0,
            totalTokens: 0,
            providers: {},
            models: {},
            modules: {},
            firstEntry: logs[0]?.timestamp || null,
            lastEntry: logs[logs.length - 1]?.timestamp || null
        };

        logs.forEach(entry => {
            stats.totalMessages += entry.messageCount || 0;
            stats.totalTokens += entry.totalTokens || 0;

            stats.providers[entry.provider] = (stats.providers[entry.provider] || 0) + 1;
            stats.models[entry.model] = (stats.models[entry.model] || 0) + 1;
            if (entry.module) stats.modules[entry.module] = (stats.modules[entry.module] || 0) + 1;
        });

        return stats;
    }

    // ========================================
    // EXPORT
    // ========================================
    function exportAll() {
        const data = {
            version: VERSION,
            exported: new Date().toISOString(),
            stats: getStats(),
            logs: getLocalLogs()
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dkz-llm-logs-' + new Date().toISOString().split('T')[0] + '.json';
        a.click();
        URL.revokeObjectURL(url);
        return data;
    }

    function exportByProvider(provider) {
        const logs = query({ provider });
        const json = JSON.stringify({ provider, exported: new Date().toISOString(), count: logs.length, logs }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dkz-llm-' + provider + '-' + new Date().toISOString().split('T')[0] + '.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    // ========================================
    // BULK SYNC to Puter
    // ========================================
    async function syncAllToPuter() {
        if (!window.puter) return { synced: 0, error: 'Puter nicht verfuegbar' };
        try {
            const isAuth = await puter.auth.isSignedIn();
            if (!isAuth) return { synced: 0, error: 'Nicht angemeldet' };
        } catch { return { synced: 0, error: 'Auth Fehler' }; }

        const logs = getLocalLogs();
        let synced = 0;
        for (const entry of logs) {
            await saveToPuter(entry);
            synced++;
        }
        return { synced, total: logs.length };
    }

    // ========================================
    // HELPERS
    // ========================================
    function detectModule() {
        try {
            const path = window.location.pathname;
            const match = path.match(/modules\/([^/]+)/);
            return match ? match[1] : 'copilot';
        } catch { return 'unknown'; }
    }

    function estimateTokens(messages) {
        if (!messages) return 0;
        const text = Array.isArray(messages)
            ? messages.map(m => m.content || '').join(' ')
            : String(messages);
        return Math.ceil(text.length / 4); // ~4 chars per token
    }

    // ========================================
    // AUTO-INTERCEPT: Puter AI calls
    // ========================================
    function interceptPuterAI() {
        if (!window.puter || !puter.ai) return;

        const originalChat = puter.ai.chat.bind(puter.ai);
        puter.ai.chat = async function (messages, options) {
            const model = options?.model || 'gpt-4o-mini';
            const result = await originalChat(messages, options);

            // Log the call
            const userMsg = Array.isArray(messages)
                ? messages.filter(m => m.role === 'user').pop()?.content || ''
                : String(messages);
            const aiMsg = typeof result === 'string' ? result : (result?.message?.content || result?.text || '');

            logPuter(model, userMsg, aiMsg, { intercepted: true, options });
            return result;
        };
    }

    // Auto-intercept nach SDK load
    if (typeof window !== 'undefined') {
        const checkPuter = setInterval(() => {
            if (window.puter && puter.ai) {
                interceptPuterAI();
                clearInterval(checkPuter);
            }
        }, 1000);
        setTimeout(() => clearInterval(checkPuter), 30000); // Stop nach 30s
    }

    // ========================================
    // PUBLIC API
    // ========================================
    return {
        version: VERSION,
        // Core
        log,
        logConversation,
        // Provider Shortcuts
        logPuter,
        logGrok,
        logHermes,
        logOpenCode,
        logNanoBot,
        logAntigravity,
        // Query
        query,
        getStats,
        getLocalLogs,
        // Export
        exportAll,
        exportByProvider,
        // Sync
        syncAllToPuter,
        // Intercept
        interceptPuterAI
    };
})();

if (typeof window !== 'undefined') window.DkzLlmLogger = DkzLlmLogger;
