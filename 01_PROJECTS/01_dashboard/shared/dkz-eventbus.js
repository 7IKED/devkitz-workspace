// @DKZ:RULES ? Lies REGELWERK.md + ORDNER.ini bevor du hier arbeitest!
// @DKZ:DOCS  ? features.json | REGISTRY.json | BLAUPAUSE.md
/**
 * DkZ EventBus — Cross-Module Communication System
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * 
 * MUSS VOR allen anderen dkz-*.js geladen werden!
 * Jedes Modul registriert sich hier und kann Events senden/empfangen.
 */
(function () {
    'use strict';

    if (window.DkZ && window.DkZ.EventBus) return; // Already loaded

    window.DkZ = window.DkZ || {};

    const listeners = {};
    const moduleRegistry = {};
    const eventLog = [];
    const MAX_LOG = 100;

    window.DkZ.EventBus = {
        /**
         * Subscribe to an event
         * @param {string} event - Event name (e.g. 'modul:converter:result')
         * @param {Function} callback - Handler function
         * @param {string} [source] - Source module name
         */
        on(event, callback, source) {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push({ callback, source: source || 'unknown' });
        },

        /**
         * Unsubscribe from an event
         */
        off(event, callback) {
            if (!listeners[event]) return;
            listeners[event] = listeners[event].filter(l => l.callback !== callback);
        },

        /**
         * Emit an event to all subscribers
         * @param {string} event - Event name
         * @param {*} data - Event data
         * @param {string} [source] - Source module
         */
        emit(event, data, source) {
            const entry = {
                event,
                data,
                source: source || 'system',
                timestamp: new Date().toISOString()
            };
            eventLog.unshift(entry);
            if (eventLog.length > MAX_LOG) eventLog.pop();

            if (listeners[event]) {
                listeners[event].forEach(l => {
                    try { l.callback(data, entry); }
                    catch (e) { console.error(`[DkZ EventBus] Error in ${event}:`, e); }
                });
            }
            // Wildcard listeners (e.g. 'modul:*')
            Object.keys(listeners).forEach(pattern => {
                if (pattern.includes('*')) {
                    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
                    if (regex.test(event) && pattern !== event) {
                        listeners[pattern].forEach(l => {
                            try { l.callback(data, entry); }
                            catch (e) { console.error(`[DkZ EventBus] Wildcard error:`, e); }
                        });
                    }
                }
            });
        },

        /**
         * Register a module in the ecosystem
         * @param {string} name - Module name (kebab-case)
         * @param {Object} meta - Module metadata
         */
        registerModule(name, meta = {}) {
            moduleRegistry[name] = {
                name,
                registered: new Date().toISOString(),
                status: 'active',
                ...meta
            };
            this.emit('system:module:registered', { name, meta }, name);
        },

        /** Get all registered modules */
        getModules() { return { ...moduleRegistry }; },

        /** Get event log */
        getLog(count = 50) { return eventLog.slice(0, count); },

        /** Get listener count for debugging */
        getStats() {
            return {
                totalListeners: Object.values(listeners).reduce((a, b) => a + b.length, 0),
                events: Object.keys(listeners).length,
                modules: Object.keys(moduleRegistry).length,
                logEntries: eventLog.length
            };
        }
    };

    // Auto-emit ready
    window.DkZ.EventBus.emit('system:ready', { timestamp: Date.now() });
})();
