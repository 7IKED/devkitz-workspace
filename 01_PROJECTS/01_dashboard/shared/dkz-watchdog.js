/**
 * DkZ™ Watchdog v1.0 — Zentraler Orchestrator + Alert Engine
 * @DKZ:RULES → R21 Shared Scripts, R19 Analyse, R1 XSS-Schutz
 * @version v0.01.1_01
 *
 * Verbindet alle 5 Observability-Systeme:
 *   EventBus ──▸ Watchdog ──▸ EventLog
 *   AutoHealth ──▸ Watchdog ──▸ LiveTicker
 *   Health ──▸ Watchdog ──▸ Toast + Sound + Push
 *
 * Features:
 *   - Kontrollschleife alle 30s
 *   - Severity-Filter (info/warn/error/critical)
 *   - Deduplizierung (5min Cooldown pro Alert)
 *   - Alert-History in localStorage
 *   - Browser Notification bei Out-of-Focus
 *
 * MUSS ALS LETZTES Script geladen werden!
 *
 * API:
 *   DkzWatchdog.alert(severity, message, source, metadata)
 *   DkzWatchdog.getAlerts(count)
 *   DkzWatchdog.setLevel(level)
 *   DkzWatchdog.start() / .stop()
 *   DkzWatchdog.getStatus()
 *   DkzWatchdog.addCheck(id, name, fn, severity)
 *
 * Einbindung: <script src="../../shared/dkz-watchdog.js"></script>
 */
(function () {
    'use strict';

    if (window.DkzWatchdog) return;

    /* ═══════════════════════════════════════════════════
     * Konstanten
     * ═══════════════════════════════════════════════════ */
    var CHECK_INTERVAL_MS = 30000;
    var ALERT_STORAGE_KEY = 'dkz-watchdog-alerts';
    var CONFIG_STORAGE_KEY = 'dkz-watchdog-config';
    var MAX_ALERTS = 200;
    var DEDUP_COOLDOWN_MS = 300000; // 5 min
    var SEVERITY_LEVELS = { info: 0, warn: 1, error: 2, critical: 3 };

    /* ═══════════════════════════════════════════════════
     * State
     * ═══════════════════════════════════════════════════ */
    var _timer = null;
    var _running = false;
    var _minLevel = 'warn'; // Minimum severity fuer Toast/Sound
    var _lastAlerts = [];
    var _dedupMap = {}; // { key: timestamp } fuer Cooldown
    var _customChecks = [];
    var _lastStatus = { health: 'unknown', lastCheck: null, score: 0, alerts: 0 };
    var _checkCount = 0;

    /* ═══════════════════════════════════════════════════
     * Persistence
     * ═══════════════════════════════════════════════════ */
    function loadAlerts() {
        try {
            var d = localStorage.getItem(ALERT_STORAGE_KEY);
            _lastAlerts = d ? JSON.parse(d) : [];
        } catch (e) { _lastAlerts = []; }
    }

    function saveAlerts() {
        try {
            if (_lastAlerts.length > MAX_ALERTS) {
                _lastAlerts = _lastAlerts.slice(-MAX_ALERTS);
            }
            localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(_lastAlerts));
        } catch (e) { /* localStorage voll — still ignorieren */ }
    }

    function loadConfig() {
        try {
            var d = localStorage.getItem(CONFIG_STORAGE_KEY);
            if (d) {
                var cfg = JSON.parse(d);
                if (cfg.minLevel && SEVERITY_LEVELS[cfg.minLevel] !== undefined) {
                    _minLevel = cfg.minLevel;
                }
            }
        } catch (e) { /* defaults */ }
    }

    function saveConfig() {
        try {
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({
                minLevel: _minLevel
            }));
        } catch (e) { /* still */ }
    }

    /* ═══════════════════════════════════════════════════
     * Deduplizierung
     * ═══════════════════════════════════════════════════ */
    function getDedupKey(severity, source, message) {
        return severity + ':' + source + ':' + message.slice(0, 80);
    }

    function isDuplicate(key) {
        var now = Date.now();
        if (_dedupMap[key] && (now - _dedupMap[key]) < DEDUP_COOLDOWN_MS) {
            return true;
        }
        _dedupMap[key] = now;

        // Alte Eintraege aus dedupMap raeumen (> 10min)
        var keys = Object.keys(_dedupMap);
        for (var i = 0; i < keys.length; i++) {
            if (now - _dedupMap[keys[i]] > DEDUP_COOLDOWN_MS * 2) {
                delete _dedupMap[keys[i]];
            }
        }
        return false;
    }

    /* ═══════════════════════════════════════════════════
     * Alert Pipeline
     * ═══════════════════════════════════════════════════ */
    function processAlert(severity, message, source, metadata) {
        severity = severity || 'info';
        source = source || 'system';
        metadata = metadata || {};

        // Dedup Check
        var dedupKey = getDedupKey(severity, source, message);
        var isDedup = isDuplicate(dedupKey);

        // Immer ins EventLog schreiben (auch Duplikate)
        var logEntry = null;
        if (window.DkzEventLog && typeof window.DkzEventLog.log === 'function') {
            logEntry = window.DkzEventLog.log({
                type: 'alert',
                source: source,
                action: message,
                metadata: Object.assign({}, metadata, {
                    severity: severity,
                    deduplicated: isDedup,
                    watchdogCheck: _checkCount
                }),
                tags: ['alert', severity, source]
            });
        }

        // Alert-Eintrag erstellen
        var alert = {
            id: 'WD-' + Date.now() + '-' + Math.random().toString(16).slice(2, 6),
            severity: severity,
            message: message,
            source: source,
            metadata: metadata,
            timestamp: new Date().toISOString(),
            timestampLocal: new Date().toLocaleTimeString('de-DE', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }),
            deduplicated: isDedup,
            logId: logEntry ? logEntry.id : null
        };

        _lastAlerts.push(alert);
        saveAlerts();

        // Bei Duplikat: kein Toast/Sound/Push
        if (isDedup) return alert;

        // Severity-Check: nur ab minLevel benachrichtigen
        var sevLevel = SEVERITY_LEVELS[severity] || 0;
        var minLevel = SEVERITY_LEVELS[_minLevel] || 1;

        if (sevLevel >= minLevel) {
            // Toast
            if (window.DkzToast) {
                var toastType = severity === 'critical' ? 'error' : severity;
                window.DkzToast.show(message, toastType, {
                    source: source,
                    notify: true
                });
            }
        }

        // LiveTicker (immer, unabhaengig von Level)
        if (window.DkzTicker && typeof window.DkzTicker.publish === 'function') {
            var tickerAgent = source.toLowerCase().replace(/[^a-z0-9]/g, '');
            window.DkzTicker.publish(
                '[' + severity.toUpperCase() + '] ' + message,
                tickerAgent || 'system'
            );
        }

        // EventBus Event
        if (window.DkZ && window.DkZ.EventBus) {
            window.DkZ.EventBus.emit('watchdog:alert', alert, 'watchdog');
        }

        // Custom Event fuer Module
        try {
            document.dispatchEvent(new CustomEvent('dkz:watchdog:alert', {
                detail: alert
            }));
        } catch (e) { /* IE fallback */ }

        return alert;
    }

    /* ═══════════════════════════════════════════════════
     * Kontrollschleife
     * ═══════════════════════════════════════════════════ */
    function runControlLoop() {
        _checkCount++;
        var issues = [];

        // 1. AutoHealth Ergebnisse einsammeln
        if (window.DkzAutoHealth) {
            var report = null;
            if (typeof window.DkzAutoHealth.getReport === 'function') {
                report = window.DkzAutoHealth.getReport();
            }
            if (!report && typeof window.DkzAutoHealth.runChecks === 'function') {
                report = window.DkzAutoHealth.runChecks();
            }

            if (report) {
                _lastStatus.score = report.score;

                if (report.status === 'red') {
                    _lastStatus.health = 'red';
                    // Nur fehlgeschlagene kritische Checks melden
                    if (report.results) {
                        for (var i = 0; i < report.results.length; i++) {
                            var r = report.results[i];
                            if (!r.ok && r.critical) {
                                issues.push({
                                    severity: 'error',
                                    message: r.name + ' fehlgeschlagen' + (r.fix ? ' — ' + r.fix : ''),
                                    source: 'autohealth'
                                });
                            }
                        }
                    }
                } else if (report.status === 'yellow') {
                    _lastStatus.health = 'yellow';
                    if (report.results) {
                        for (var j = 0; j < report.results.length; j++) {
                            var w = report.results[j];
                            if (!w.ok && !w.critical) {
                                issues.push({
                                    severity: 'warn',
                                    message: w.name + ' nicht verfuegbar',
                                    source: 'autohealth'
                                });
                            }
                        }
                    }
                } else {
                    _lastStatus.health = 'green';
                }
            }
        }

        // 2. DkZ Health Ergebnisse einsammeln
        if (window.DkZ && window.DkZ.Health) {
            var healthResults = null;
            if (typeof window.DkZ.Health.getResults === 'function') {
                healthResults = window.DkZ.Health.getResults();
            }
            if (healthResults) {
                var healthKeys = Object.keys(healthResults);
                for (var k = 0; k < healthKeys.length; k++) {
                    var hr = healthResults[healthKeys[k]];
                    if (hr && !hr.ok) {
                        issues.push({
                            severity: 'warn',
                            message: hr.name + ' — Check fehlgeschlagen' + (hr.detail ? ' (' + hr.detail + ')' : ''),
                            source: 'health-monitor'
                        });
                    }
                }
            }
        }

        // 3. Custom Checks ausfuehren
        for (var c = 0; c < _customChecks.length; c++) {
            var check = _customChecks[c];
            try {
                var result = check.fn();
                if (!result) {
                    issues.push({
                        severity: check.severity || 'warn',
                        message: check.name + ' fehlgeschlagen',
                        source: 'custom-check'
                    });
                }
            } catch (e) {
                issues.push({
                    severity: 'error',
                    message: check.name + ' — Exception: ' + e.message,
                    source: 'custom-check'
                });
            }
        }

        // 4. JS Error Count pruefen
        if (typeof window.__dkzErrorCount === 'number' && window.__dkzErrorCount > 0) {
            issues.push({
                severity: 'error',
                message: window.__dkzErrorCount + ' JavaScript-Fehler aufgetreten',
                source: 'js-runtime'
            });
        }

        // 5. localStorage Kapazitaet pruefen
        try {
            var storageUsed = JSON.stringify(localStorage).length;
            var storagePct = (storageUsed / (5 * 1024 * 1024)) * 100;
            if (storagePct > 85) {
                issues.push({
                    severity: 'warn',
                    message: 'localStorage bei ' + storagePct.toFixed(1) + '% — Aufraeumen empfohlen',
                    source: 'storage'
                });
            }
        } catch (e) { /* nicht verfuegbar */ }

        // 6. Issues verarbeiten
        for (var m = 0; m < issues.length; m++) {
            processAlert(issues[m].severity, issues[m].message, issues[m].source, issues[m].metadata || {});
        }

        // Status aktualisieren
        _lastStatus.lastCheck = new Date().toISOString();
        _lastStatus.alerts = _lastAlerts.length;
        _lastStatus.checkNumber = _checkCount;
        _lastStatus.issuesFound = issues.length;

        // Wenn keine Issues und vorher nicht green → Recovery melden
        if (issues.length === 0 && _lastStatus.health !== 'green' && _lastStatus.health !== 'unknown') {
            _lastStatus.health = 'green';
            if (window.DkzToast) {
                window.DkzToast.success('Alle Systeme wieder OK', 'watchdog');
            }
        } else if (issues.length === 0) {
            _lastStatus.health = 'green';
        }

        // EventBus: Status-Update
        if (window.DkZ && window.DkZ.EventBus) {
            window.DkZ.EventBus.emit('watchdog:status', {
                status: _lastStatus,
                issues: issues.length,
                check: _checkCount
            }, 'watchdog');
        }

        // EventLog: System-Check loggen (nur bei Problemen oder jeden 10. Check)
        if (window.DkzEventLog && (issues.length > 0 || _checkCount % 10 === 0)) {
            window.DkzEventLog.log({
                type: 'system',
                source: 'watchdog',
                action: 'control-loop',
                metadata: {
                    check: _checkCount,
                    health: _lastStatus.health,
                    score: _lastStatus.score,
                    issues: issues.length
                },
                tags: ['watchdog', 'control-loop', _lastStatus.health]
            });
        }

        return { issues: issues, status: _lastStatus };
    }

    /* ═══════════════════════════════════════════════════
     * EventBus Subscriptions
     * ═══════════════════════════════════════════════════ */
    function setupEventListeners() {
        // AutoHealth Custom Events
        document.addEventListener('dkz:health-update', function (e) {
            if (e.detail && e.detail.status === 'red') {
                processAlert('error', 'AutoHealth Status: ROT (' + e.detail.score + '/100)', 'autohealth', {
                    score: e.detail.score,
                    failed: e.detail.failed
                });
            }
        });

        // Global Error Handler
        window.addEventListener('error', function (e) {
            processAlert('error', 'JS Error: ' + (e.message || 'Unknown') + ' in ' + (e.filename || '?') + ':' + (e.lineno || '?'), 'js-runtime', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        // Unhandled Promise Rejections
        window.addEventListener('unhandledrejection', function (e) {
            var reason = e.reason ? (e.reason.message || String(e.reason)) : 'Unknown';
            processAlert('error', 'Unhandled Promise: ' + reason.slice(0, 200), 'js-runtime', {
                reason: reason
            });
        });

        // Offline/Online Events
        window.addEventListener('offline', function () {
            processAlert('warn', 'Netzwerk offline — Offline-Modus aktiv', 'network');
        });

        window.addEventListener('online', function () {
            processAlert('info', 'Netzwerk wieder online', 'network');
            if (window.DkzToast) {
                window.DkzToast.success('Netzwerk wieder online', 'network');
            }
        });

        // EventBus: auf system:* Events hoeren
        if (window.DkZ && window.DkZ.EventBus) {
            window.DkZ.EventBus.on('system:*', function (data, entry) {
                // Nur bei Health-Events reagieren
                if (entry && entry.event === 'system:health') {
                    if (data && data.status === 'warning') {
                        processAlert('warn', 'Health Monitor: Warnungen erkannt', 'health-monitor', data);
                    }
                }
            }, 'watchdog');
        }
    }

    /* ═══════════════════════════════════════════════════
     * Timer
     * ═══════════════════════════════════════════════════ */
    function start() {
        if (_running) return;
        _running = true;
        loadAlerts();
        loadConfig();
        setupEventListeners();

        // Initial Check nach 3s (damit andere Scripts laden koennen)
        setTimeout(function () {
            runControlLoop();
            _timer = setInterval(runControlLoop, CHECK_INTERVAL_MS);
        }, 3000);
    }

    function stop() {
        _running = false;
        if (_timer) {
            clearInterval(_timer);
            _timer = null;
        }
    }

    /* ═══════════════════════════════════════════════════
     * Public API
     * ═══════════════════════════════════════════════════ */
    window.DkzWatchdog = {

        /**
         * Manuell Alert ausloesen
         * @param {string} severity - info|warn|error|critical
         * @param {string} message - Alert-Nachricht
         * @param {string} source - Quelle (modul-name, system, etc.)
         * @param {Object} metadata - Beliebige Zusatzinfos
         */
        alert: function (severity, message, source, metadata) {
            return processAlert(severity, message, source, metadata);
        },

        /**
         * Letzte N Alerts abrufen
         * @param {number} count - Anzahl (default: 50)
         */
        getAlerts: function (count) {
            count = count || 50;
            return _lastAlerts.slice(-count);
        },

        /**
         * Alerts nach Severity filtern
         * @param {string} severity - info|warn|error|critical
         */
        getAlertsBySeverity: function (severity) {
            return _lastAlerts.filter(function (a) { return a.severity === severity; });
        },

        /**
         * Minimum Severity Level setzen
         * @param {string} level - info|warn|error|critical
         */
        setLevel: function (level) {
            if (SEVERITY_LEVELS[level] !== undefined) {
                _minLevel = level;
                saveConfig();
            }
        },

        /** Aktuellen Level abrufen */
        getLevel: function () {
            return _minLevel;
        },

        /** Kontrollschleife starten */
        start: start,

        /** Kontrollschleife stoppen */
        stop: stop,

        /** Manuellen Check ausfuehren */
        check: function () {
            return runControlLoop();
        },

        /**
         * Aktuellen System-Status abrufen
         * @returns {{ health, lastCheck, score, alerts, checkNumber }}
         */
        getStatus: function () {
            return JSON.parse(JSON.stringify(_lastStatus));
        },

        /**
         * Custom Check hinzufuegen
         * @param {string} id - Eindeutige Check-ID
         * @param {string} name - Anzeigename
         * @param {Function} fn - Check-Funktion (return true = OK)
         * @param {string} severity - warn|error
         */
        addCheck: function (id, name, fn, severity) {
            if (!id || typeof fn !== 'function') return;
            // Existierenden Check ersetzen
            _customChecks = _customChecks.filter(function (c) { return c.id !== id; });
            _customChecks.push({
                id: id,
                name: name || id,
                fn: fn,
                severity: severity || 'warn'
            });
        },

        /** Custom Check entfernen */
        removeCheck: function (id) {
            _customChecks = _customChecks.filter(function (c) { return c.id !== id; });
        },

        /** Alert-History leeren */
        clearAlerts: function () {
            _lastAlerts = [];
            saveAlerts();
            _dedupMap = {};
        },

        /** Check-Intervall aendern (ms, min 10s) */
        setInterval: function (ms) {
            CHECK_INTERVAL_MS = ms > 10000 ? ms : 10000;
            if (_running) {
                stop();
                start();
            }
        },

        /** Stats fuer Dashboard */
        getStats: function () {
            var bySeverity = { info: 0, warn: 0, error: 0, critical: 0 };
            var bySource = {};
            for (var i = 0; i < _lastAlerts.length; i++) {
                var a = _lastAlerts[i];
                bySeverity[a.severity] = (bySeverity[a.severity] || 0) + 1;
                bySource[a.source] = (bySource[a.source] || 0) + 1;
            }
            return {
                total: _lastAlerts.length,
                bySeverity: bySeverity,
                bySource: bySource,
                checksRun: _checkCount,
                customChecks: _customChecks.length,
                running: _running,
                interval: CHECK_INTERVAL_MS,
                level: _minLevel
            };
        },

        /** Version */
        version: 'v1.0.0'
    };

    /* ═══════════════════════════════════════════════════
     * Auto-Start
     * ═══════════════════════════════════════════════════ */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

})();
