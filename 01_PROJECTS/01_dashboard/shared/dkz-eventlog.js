/**
 * DkZ Universal Event Log v0.01.1_01
 * @DKZ:RULES → Siehe REGELWERK.md (R19 Analyse, R20 Dok-Pflicht)
 * @version v0.01.1_01
 * 
 * Zentrale Logging-Komponente für ALLE Module.
 * Jedes Event bekommt eine UUID, Metadata, Tags und Parent-ID.
 * Speichert in localStorage + optional Git-Sync.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'dkz-event-log';
    const MAX_ENTRIES = 10000;

    window.DkzEventLog = {

        entries: [],
        _loaded: false,

        /**
         * Initialize event log
         */
        init() {
            if (this._loaded) return;
            this._loaded = true;
            this.load();
            // Log system start
            this.log({
                type: 'system',
                source: this._detectModule(),
                action: 'init',
                metadata: { userAgent: navigator.userAgent },
                tags: ['system', 'init']
            });
        },

        /**
         * Generate unique event ID
         * Format: EVT-{timestamp}-{random4hex}
         */
        generateId() {
            const ts = Date.now();
            const rnd = Math.random().toString(16).slice(2, 6);
            return `EVT-${ts}-${rnd}`;
        },

        /**
         * Log an event
         * @param {Object} opts
         * @param {string} opts.type - creation|action|error|system|output|command|alert
         * @param {string} opts.source - module name or 'cmd'
         * @param {string} opts.action - what happened
         * @param {string} opts.severity - info|warn|error|critical (optional)
         * @param {Object} opts.metadata - arbitrary metadata
         * @param {string[]} opts.tags - filter tags
         * @param {string} opts.parentId - parent event ID for chaining
         * @returns {Object} the logged entry with its ID
         */
        log(opts = {}) {
            const entry = {
                id: opts.id || this.generateId(),
                type: opts.type || 'action',
                severity: opts.severity || null,
                source: opts.source || this._detectModule(),
                action: opts.action || 'unknown',
                metadata: {
                    module: opts.source || this._detectModule(),
                    version: this._detectVersion(),
                    user: 'BAZE2',
                    ...(opts.metadata || {})
                },
                tags: opts.tags || [],
                parentId: opts.parentId || null,
                timestamp: new Date().toISOString(),
                sessionId: this._getSessionId()
            };

            this.entries.push(entry);

            // Trim if too many
            if (this.entries.length > MAX_ENTRIES) {
                this.entries = this.entries.slice(-MAX_ENTRIES);
            }

            this.save();

            // EventBus Bridge — jedes Event an Subscriber verteilen
            if (window.DkZ && window.DkZ.EventBus) {
                try {
                    window.DkZ.EventBus.emit('eventlog:new', entry, 'eventlog');
                } catch (e) { /* EventBus nicht bereit */ }
            }

            return entry;
        },

        /**
         * Log a creation event (button click, generate, build)
         */
        logCreation(source, action, metadata = {}, tags = []) {
            return this.log({
                type: 'creation',
                source, action, metadata,
                tags: ['creation', ...tags]
            });
        },

        /**
         * Log an output event (download, copy, export)
         */
        logOutput(source, action, metadata = {}, tags = []) {
            return this.log({
                type: 'output',
                source, action, metadata,
                tags: ['output', ...tags]
            });
        },

        /**
         * Log an error event
         */
        logError(source, error, metadata = {}) {
            return this.log({
                type: 'error',
                source,
                action: 'error',
                metadata: {
                    error: typeof error === 'string' ? error : error.message,
                    stack: error.stack || null,
                    ...metadata
                },
                tags: ['error', source]
            });
        },

        /**
         * Log an alert event (with severity routing)
         * @param {string} severity - info|warn|error|critical
         * @param {string} source - module or system name
         * @param {string} message - alert message
         * @param {Object} metadata - extra data
         */
        logAlert(severity, source, message, metadata = {}) {
            return this.log({
                type: 'alert',
                severity: severity,
                source: source,
                action: message,
                metadata: {
                    severity: severity,
                    ...metadata
                },
                tags: ['alert', severity, source]
            });
        },

        /**
         * Log a command (OS command line)
         */
        logCommand(command, output, exitCode, metadata = {}) {
            return this.log({
                type: 'command',
                source: 'cmd',
                action: command.slice(0, 200),
                metadata: {
                    command,
                    output: (output || '').slice(0, 2000),
                    exitCode,
                    ...metadata
                },
                tags: ['command', 'system']
            });
        },

        /**
         * Log a documentation change
         */
        logDocChange(docFile, changeDescription, metadata = {}) {
            return this.log({
                type: 'doc-change',
                source: 'docs',
                action: `Updated: ${docFile}`,
                metadata: {
                    file: docFile,
                    change: changeDescription,
                    ...metadata
                },
                tags: ['docs', 'r20']
            });
        },

        /**
         * Find events by severity
         */
        findBySeverity(severity) {
            return this.entries.filter(e => e.severity === severity);
        },

        // =====================
        // Query & Filter
        // =====================

        /**
         * Find events by source module
         */
        findBySource(source) {
            return this.entries.filter(e => e.source === source);
        },

        /**
         * Find events by tag
         */
        findByTag(tag) {
            return this.entries.filter(e => e.tags.includes(tag));
        },

        /**
         * Find events by type
         */
        findByType(type) {
            return this.entries.filter(e => e.type === type);
        },

        /**
         * Find event by ID
         */
        findById(id) {
            return this.entries.find(e => e.id === id);
        },

        /**
         * Get event chain (parent → child)
         */
        getChain(id) {
            const chain = [];
            let current = this.findById(id);
            while (current) {
                chain.unshift(current);
                current = current.parentId ? this.findById(current.parentId) : null;
            }
            // Also find children
            let children = this.entries.filter(e => e.parentId === id);
            chain.push(...children);
            return chain;
        },

        /**
         * Get events in time range
         */
        findInRange(from, to) {
            const start = new Date(from);
            const end = new Date(to);
            return this.entries.filter(e => {
                const d = new Date(e.timestamp);
                return d >= start && d <= end;
            });
        },

        /**
         * Get last N events for a module (tool recognition after pause)
         */
        getModuleHistory(source, limit = 50) {
            return this.entries
                .filter(e => e.source === source)
                .slice(-limit);
        },

        /**
         * Get summary stats
         */
        getStats() {
            const sources = {};
            const types = {};
            const tags = {};
            for (const e of this.entries) {
                sources[e.source] = (sources[e.source] || 0) + 1;
                types[e.type] = (types[e.type] || 0) + 1;
                for (const t of e.tags) {
                    tags[t] = (tags[t] || 0) + 1;
                }
            }
            return {
                total: this.entries.length,
                sources, types, tags,
                first: this.entries[0]?.timestamp,
                last: this.entries[this.entries.length - 1]?.timestamp
            };
        },

        // =====================
        // Persistence
        // =====================

        load() {
            try {
                const d = localStorage.getItem(STORAGE_KEY);
                if (d) this.entries = JSON.parse(d);
            } catch (e) { this.entries = []; }
        },

        save() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
            } catch (e) {
                console.warn('[EventLog] Save error');
            }
        },

        /**
         * Sync to Git via cost-sync server (same port 9877)
         */
        async syncToGit() {
            try {
                const res = await fetch('http://localhost:9877/save-events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entries: this.entries })
                });
                return await res.json();
            } catch (e) {
                return { ok: false, error: 'Sync server offline' };
            }
        },

        /**
         * Load from Git (restore after reinstall)
         */
        async loadFromGit() {
            try {
                const res = await fetch('http://localhost:9877/load-events');
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const existingIds = new Set(this.entries.map(e => e.id));
                    let imported = 0;
                    for (const e of data) {
                        if (!existingIds.has(e.id)) {
                            this.entries.push(e);
                            imported++;
                        }
                    }
                    if (imported > 0) this.save();
                    return { ok: true, imported };
                }
                return { ok: true, imported: 0 };
            } catch (e) {
                return { ok: false, error: 'offline' };
            }
        },

        exportJSON() {
            return JSON.stringify(this.entries, null, 2);
        },

        // =====================
        // Helpers
        // =====================

        _detectModule() {
            const path = location.pathname.toLowerCase();
            const match = path.match(/modules\/([^\/]+)/);
            if (match) return match[1];
            if (path.includes('hub')) return 'hub';
            return 'unknown';
        },

        _detectVersion() {
            const meta = document.querySelector('meta[name="dkz-version"]');
            if (meta) return meta.content;
            const title = document.title;
            const m = title.match(/v(\d+[\.\d_]*)/);
            return m ? m[1] : '0.01.1_01';
        },

        _getSessionId() {
            let sid = sessionStorage.getItem('dkz-session-id');
            if (!sid) {
                sid = 'SES-' + Date.now();
                sessionStorage.setItem('dkz-session-id', sid);
            }
            return sid;
        }
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DkzEventLog.init());
    } else {
        DkzEventLog.init();
    }
})();
