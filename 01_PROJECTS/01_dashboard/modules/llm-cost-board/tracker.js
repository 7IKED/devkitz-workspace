/**
 * DkZ Cost Tracker v0.01.1_01
 * @DKZ:RULES → Siehe REGELWERK.md
 * 
 * Live Token-Tracking, Timeline-Analyse, Tag-Filter
 * Speichert in localStorage: dkz-cost-log
 */
(function () {
    'use strict';

    const COST_TAGS = [
        'debug', 'build', 'review', 'chat', 'generate', 'analyze',
        'hub', 'ruleboard', 'clipboard', 'ai_chat', 'markdown-gen',
        'cost-board', 'prompt-viewer', 'doc-engine', 'seo', 'design'
    ];

    const STORAGE_KEY = 'dkz-cost-log';
    const SESSION_KEY = 'dkz-cost-session';

    window.DkzCostTracker = {

        sessions: [],
        currentSession: null,

        init() {
            this.load();
            this.startSession();
            // Try to restore from Git (survives reinstalls)
            this.loadFromGit().catch(() => { });
            this.checkSyncServer().catch(() => { });
            console.log('[DkZ CostTracker] Active. Sessions:', this.sessions.length);
        },

        load() {
            try {
                const d = localStorage.getItem(STORAGE_KEY);
                if (d) this.sessions = JSON.parse(d);
            } catch (e) { this.sessions = []; }
        },

        save() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions));
            } catch (e) { console.warn('[CostTracker] Save error'); }
        },

        startSession() {
            this.currentSession = {
                id: 'S' + Date.now(),
                start: new Date().toISOString(),
                end: null,
                entries: [],
                totalCost: 0
            };
            this.sessions.push(this.currentSession);
            this.save();
        },

        endSession() {
            if (this.currentSession) {
                this.currentSession.end = new Date().toISOString();
                this.currentSession.totalCost = this.getSessionCost();
                this.save();
            }
        },

        /**
         * Log a token usage event
         */
        log(model, tokensIn, tokensOut, costPerMIn, costPerMOut, tags = []) {
            if (!this.currentSession) this.startSession();
            const costIn = (tokensIn / 1000000) * costPerMIn;
            const costOut = (tokensOut / 1000000) * costPerMOut;
            const entry = {
                ts: new Date().toISOString(),
                model,
                tokensIn,
                tokensOut,
                costIn: Math.round(costIn * 10000) / 10000,
                costOut: Math.round(costOut * 10000) / 10000,
                totalCost: Math.round((costIn + costOut) * 10000) / 10000,
                tags: tags.length ? tags : ['general']
            };
            this.currentSession.entries.push(entry);
            this.save();
            this.autoSync(); // Git sync every 5 entries
            return entry;
        },

        /**
         * Get cost of current session
         */
        getSessionCost() {
            if (!this.currentSession) return 0;
            return this.currentSession.entries.reduce((s, e) => s + e.totalCost, 0);
        },

        /**
         * Get all costs grouped by tag
         */
        getCostsByTag() {
            const map = {};
            for (const s of this.sessions) {
                for (const e of s.entries) {
                    for (const t of e.tags) {
                        if (!map[t]) map[t] = { cost: 0, tokens: 0, count: 0 };
                        map[t].cost += e.totalCost;
                        map[t].tokens += e.tokensIn + e.tokensOut;
                        map[t].count++;
                    }
                }
            }
            return map;
        },

        /**
         * Get costs per element/module
         */
        getElementCosts() {
            const map = {};
            for (const s of this.sessions) {
                for (const e of s.entries) {
                    const mod = e.tags.find(t => !['debug', 'build', 'review', 'chat', 'generate', 'analyze', 'general'].includes(t)) || 'other';
                    if (!map[mod]) map[mod] = { cost: 0, tokensIn: 0, tokensOut: 0, sessions: new Set(), lastUsed: null };
                    map[mod].cost += e.totalCost;
                    map[mod].tokensIn += e.tokensIn;
                    map[mod].tokensOut += e.tokensOut;
                    map[mod].sessions.add(s.id);
                    map[mod].lastUsed = e.ts;
                }
            }
            // Convert Sets to counts
            for (const k in map) map[k].sessions = map[k].sessions.size;
            return map;
        },

        /**
         * Get timeline data (costs per hour/day in date range)
         */
        getTimeline(from, to, granularity = 'hour') {
            const start = new Date(from);
            const end = new Date(to);
            const buckets = {};

            for (const s of this.sessions) {
                for (const e of s.entries) {
                    const d = new Date(e.ts);
                    if (d < start || d > end) continue;

                    let key;
                    if (granularity === 'hour') {
                        key = d.toISOString().slice(0, 13);
                    } else if (granularity === 'day') {
                        key = d.toISOString().slice(0, 10);
                    } else {
                        key = d.toISOString().slice(0, 7); // month
                    }

                    if (!buckets[key]) buckets[key] = { cost: 0, tokens: 0, entries: 0 };
                    buckets[key].cost += e.totalCost;
                    buckets[key].tokens += e.tokensIn + e.tokensOut;
                    buckets[key].entries++;
                }
            }
            return buckets;
        },

        /**
         * Filter entries by tags
         */
        filterByTags(tags) {
            const results = [];
            for (const s of this.sessions) {
                for (const e of s.entries) {
                    if (tags.some(t => e.tags.includes(t))) {
                        results.push({ ...e, sessionId: s.id });
                    }
                }
            }
            return results;
        },

        /**
         * Get total ecosystem cost
         */
        getTotalCost() {
            return this.sessions.reduce((sum, s) =>
                sum + s.entries.reduce((es, e) => es + e.totalCost, 0)
                , 0);
        },

        /**
         * Export for analysis
         */
        exportJSON() {
            return JSON.stringify(this.sessions, null, 2);
        },

        /**
         * Get available tags
         */
        getTags() { return COST_TAGS; },

        /**
         * Clear all data
         */
        clearAll() {
            this.sessions = [];
            this.currentSession = null;
            localStorage.removeItem(STORAGE_KEY);
        },

        // ==========================================
        // GIT SYNC — Infinite Memory via GitHub
        // ==========================================
        SYNC_URL: 'http://localhost:9877',
        syncCount: 0,
        lastSync: null,
        syncStatus: 'unknown', // 'synced', 'pending', 'offline', 'unknown'

        /**
         * Sync all cost data to Git (via local cost-sync server)
         * Saves to cost-data/cost-log.json + auto-commits
         */
        async syncToGit() {
            try {
                const res = await fetch(this.SYNC_URL + '/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessions: this.sessions })
                });
                const data = await res.json();
                if (data.ok) {
                    this.syncStatus = 'synced';
                    this.lastSync = new Date().toISOString();
                    localStorage.setItem('dkz-cost-last-sync', this.lastSync);
                    console.log('[CostTracker] ✅ Git sync:', data.msg);
                    this.updateSyncUI();
                    return { ok: true, msg: data.msg };
                } else {
                    this.syncStatus = 'error';
                    console.warn('[CostTracker] ❌ Sync error:', data.error);
                    return { ok: false, error: data.error };
                }
            } catch (e) {
                this.syncStatus = 'offline';
                console.warn('[CostTracker] ⚠️ Sync server offline. Start with: node cost-sync.js');
                this.updateSyncUI();
                return { ok: false, error: 'Sync server offline' };
            }
        },

        /**
         * Load cost data from Git (restores after reinstall)
         * Merges with local data to prevent loss
         */
        async loadFromGit() {
            try {
                const res = await fetch(this.SYNC_URL + '/load');
                const data = await res.json();
                if (data.sessions && data.sessions.length > 0) {
                    // Merge: keep unique sessions by ID
                    const existingIds = new Set(this.sessions.map(s => s.id));
                    let imported = 0;
                    for (const s of data.sessions) {
                        if (!existingIds.has(s.id)) {
                            this.sessions.push(s);
                            imported++;
                        }
                    }
                    if (imported > 0) {
                        this.save();
                        console.log(`[CostTracker] ✅ Imported ${imported} sessions from Git`);
                    }
                    this.syncStatus = 'synced';
                    this.updateSyncUI();
                    return { ok: true, imported };
                }
                return { ok: true, imported: 0 };
            } catch (e) {
                this.syncStatus = 'offline';
                this.updateSyncUI();
                return { ok: false, error: 'Sync server offline' };
            }
        },

        /**
         * Get Git commit history for cost data
         */
        async getGitHistory() {
            try {
                const res = await fetch(this.SYNC_URL + '/history');
                return await res.json();
            } catch (e) {
                return { commits: [] };
            }
        },

        /**
         * Check if sync server is running
         */
        async checkSyncServer() {
            try {
                const res = await fetch(this.SYNC_URL + '/status');
                const data = await res.json();
                this.syncStatus = data.ok ? 'online' : 'offline';
                this.updateSyncUI();
                return data;
            } catch (e) {
                this.syncStatus = 'offline';
                this.updateSyncUI();
                return { ok: false };
            }
        },

        /**
         * Auto-sync after every N log entries
         */
        autoSync() {
            this.syncCount++;
            if (this.syncCount >= 5) {
                this.syncCount = 0;
                this.syncToGit().catch(() => { });
            }
        },

        /**
         * Update sync status indicator in UI
         */
        updateSyncUI() {
            const el = document.getElementById('gitSyncStatus');
            if (!el) return;
            const colors = {
                synced: '#00ff88', online: '#00ff88',
                pending: '#ffd740', unknown: '#666',
                offline: '#ff4444', error: '#ff4444'
            };
            const labels = {
                synced: '✅ Synced', online: '🟢 Connected',
                pending: '🟡 Pending', unknown: '⚪ Unknown',
                offline: '🔴 Offline', error: '❌ Error'
            };
            el.style.color = colors[this.syncStatus] || '#666';
            el.textContent = labels[this.syncStatus] || this.syncStatus;
        }
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DkzCostTracker.init());
    } else {
        DkzCostTracker.init();
    }
})();
