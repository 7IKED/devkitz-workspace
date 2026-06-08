/**
 * DkZ Ralph Loop™ v1.0 — Autonomer Feedback-Dispatcher
 * @DKZ:RULES → R13 Workflow-Fluss, R90 Event-Logging, R21 Shared Scripts
 * @DKZ:TAG → [SYS:ralph] [CAT:shared] [LANG:js]
 * @version v0.01.1_01
 *
 * Das fehlende Bindeglied:
 *   Watchdog Alert → EventBus → RALPH → NanoBot/NEXUZ → EventLog → Naechster Alert
 *
 * 6 Phasen (aus GEMINI.md / BMAD Methodik):
 *   1. LESEN    → Alert analysieren, relevante Artefakte laden
 *   2. SPAWN    → Frischer Kontext fuer diesen Task
 *   3. EXECUTE  → NanoBot/NEXUZ fuehren Fix aus
 *   4. VERIFY   → James bewertet das Ergebnis
 *   5. COMMIT   → EventLog schreiben, Status updaten
 *   6. LOOP     → Naechster Alert (oder Pause)
 *
 * Einbindung: <script src="../../shared/dkz-ralph.js"></script>
 * MUSS NACH dkz-eventbus.js, dkz-eventlog.js, dkz-watchdog.js, dkz-james.js geladen werden!
 */
(function () {
    'use strict';

    if (window.DkzRalph) return;

    // ═══════════════════════════════════════
    // Konstanten
    // ═══════════════════════════════════════
    var VERSION = 'v1.0.0';
    var STORAGE_KEY = 'dkz-ralph-state';
    var MAX_QUEUE = 50;
    var MAX_HISTORY = 200;
    var COOLDOWN_MS = 60000;       // 1 Minute zwischen gleichen Alerts
    var MAX_RETRIES = 2;           // Max Retries pro Alert
    var PHASE_TIMEOUT_MS = 30000;  // 30s Timeout pro Phase

    var PHASES = ['LESEN', 'SPAWN', 'EXECUTE', 'VERIFY', 'COMMIT', 'LOOP'];
    var SEVERITY_THRESHOLD = 2;    // 0=info, 1=warn, 2=error, 3=critical → ab error reagieren
    var SEVERITY_MAP = { info: 0, warn: 1, error: 2, critical: 3 };

    // ═══════════════════════════════════════
    // State
    // ═══════════════════════════════════════
    var _queue = [];       // Pending alerts
    var _history = [];     // Abgearbeitete Loops
    var _running = false;  // Gerade aktiv?
    var _paused = false;   // Vom User pausiert?
    var _current = null;   // Aktueller Loop-Durchlauf
    var _dedupMap = {};    // Cooldown-Tracking
    var _stats = { total: 0, success: 0, failed: 0, skipped: 0 };

    // ═══════════════════════════════════════
    // Helpers
    // ═══════════════════════════════════════
    function _ts() { return new Date().toISOString(); }
    function _id() { return 'RL-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6); }

    // Phase-Timeout Wrapper — verhindert ewig haengende Phasen (R97 Loop-Schutz)
    function _withTimeout(asyncFn, loop, phaseName) {
        return Promise.race([
            asyncFn,
            new Promise(function (_, reject) {
                setTimeout(function () {
                    reject(new Error('PHASE_TIMEOUT: ' + phaseName + ' ueberschritt ' + (PHASE_TIMEOUT_MS / 1000) + 's Limit (Loop ' + loop.id + ')'));
                }, PHASE_TIMEOUT_MS);
            })
        ]);
    }

    function _dedupKey(alert) {
        return (alert.source || 'unknown') + ':' + (alert.message || '').slice(0, 80);
    }

    function _isDuplicate(alert) {
        var key = _dedupKey(alert);
        var now = Date.now();
        if (_dedupMap[key] && (now - _dedupMap[key]) < COOLDOWN_MS) return true;
        _dedupMap[key] = now;
        // Alte Eintraege raeumen
        var keys = Object.keys(_dedupMap);
        for (var i = 0; i < keys.length; i++) {
            if (now - _dedupMap[keys[i]] > COOLDOWN_MS * 3) delete _dedupMap[keys[i]];
        }
        return false;
    }

    function _log(msg, type) {
        if (window.DkzEventLog && typeof window.DkzEventLog.log === 'function') {
            window.DkzEventLog.log({
                type: type || 'system',
                source: 'ralph-loop',
                action: msg,
                tags: ['ralph', 'loop']
            });
        }
    }

    function _emit(event, data) {
        if (window.DkZ && window.DkZ.EventBus) {
            window.DkZ.EventBus.emit(event, data, 'ralph-loop');
        }
    }

    // ═══════════════════════════════════════
    // Persistence
    // ═══════════════════════════════════════
    function _loadState() {
        try {
            var d = localStorage.getItem(STORAGE_KEY);
            if (d) {
                var state = JSON.parse(d);
                _history = state.history || [];
                _stats = state.stats || _stats;
            }
        } catch (e) { /* defaults */ }
    }

    function _saveState() {
        try {
            if (_history.length > MAX_HISTORY) _history = _history.slice(-MAX_HISTORY);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                history: _history,
                stats: _stats
            }));
        } catch (e) { /* localStorage voll */ }
    }

    // ═══════════════════════════════════════
    // RALPH LOOP — 6 Phasen
    // ═══════════════════════════════════════

    /**
     * Phase 1: LESEN — Alert analysieren, Kontext sammeln
     */
    function phaseLesen(loop) {
        loop.phase = 'LESEN';
        loop.phases.LESEN = { start: _ts(), status: 'running' };
        _emit('ralph:phase', { phase: 'LESEN', loop: loop.id });

        // Alert-Daten extrahieren
        var alert = loop.alert;
        loop.context = {
            severity: alert.severity || 'error',
            source: alert.source || 'unknown',
            message: alert.message || '',
            module: alert.metadata ? alert.metadata.module : _detectModule(),
            timestamp: alert.timestamp || _ts(),
            relatedEvents: []
        };

        // Letzte verwandte Events aus EventLog suchen
        if (window.DkzEventLog && typeof window.DkzEventLog.findBySource === 'function') {
            try {
                var related = window.DkzEventLog.findBySource(loop.context.source);
                loop.context.relatedEvents = (related || []).slice(-5);
            } catch (e) { /* kein EventLog */ }
        }

        // James Knowledge pruefen (optional API — fehlt: als getKnowledge() in dkz-james.js implementieren)
        if (window.DkzJames && typeof window.DkzJames.getKnowledge === 'function') {
            loop.context.knowledge = {
                rules: window.DkzJames.getKnowledge('rules'),
                version: window.DkzJames.version
            };
        } else if (window.DkzJames) {
            // Fallback: James existiert, aber getKnowledge() fehlt
            loop.context.knowledge = {
                rules: window.DkzJames.KNOWLEDGE ? window.DkzJames.KNOWLEDGE.rules : null,
                version: window.DkzJames.version || 'unknown'
            };
        }

        loop.phases.LESEN.end = _ts();
        loop.phases.LESEN.status = 'done';
        return true;
    }

    /**
     * Phase 2: SPAWN — Frischer Kontext (in Browser = isolierter Scope)
     */
    function phaseSpawn(loop) {
        loop.phase = 'SPAWN';
        loop.phases.SPAWN = { start: _ts(), status: 'running' };
        _emit('ralph:phase', { phase: 'SPAWN', loop: loop.id });

        // In Browser-Kontext: "Frischer Kontext" = isolierter Durchlauf
        // Keine Altlasten aus vorherigen Loops
        loop.execution = {
            id: _id(),
            startedAt: _ts(),
            retries: loop.retries || 0,
            strategy: _determineStrategy(loop.context)
        };

        loop.phases.SPAWN.end = _ts();
        loop.phases.SPAWN.status = 'done';
        return true;
    }

    /**
     * Phase 3: EXECUTE — NanoBot/NEXUZ fuehren Fix aus
     */
    async function phaseExecute(loop) {
        loop.phase = 'EXECUTE';
        loop.phases.EXECUTE = { start: _ts(), status: 'running' };
        _emit('ralph:phase', { phase: 'EXECUTE', loop: loop.id });

        var strategy = loop.execution.strategy;
        var result = { success: false, action: 'none', detail: '' };

        try {
            if (strategy === 'nanobot-search') {
                // NanoBot sucht nach Loesungen
                if (window.DkzNanoBot && typeof window.DkzNanoBot.search === 'function') {
                    await window.DkzNanoBot.search(loop.context.message);
                    result = { success: true, action: 'nanobot-search', detail: 'Suche gestartet fuer: ' + loop.context.message.slice(0, 80) };
                }
            } else if (strategy === 'nexuz-chat') {
                // NEXUZ fragt LLM nach Fix-Vorschlag
                if (window.NEXUZ && typeof window.NEXUZ.chat === 'function') {
                    var reply = await window.NEXUZ.chat(
                        'Fehler im DkZ-Modul "' + loop.context.module + '": ' + loop.context.message + '\nAnalysiere und schlage einen Fix vor. Antworte als ASCII-Mindmap. Keine Umlaute.',
                        { model: 'auto', systemPrompt: 'Du bist der DkZ Ralph Loop Auto-Fix Agent. Analysiere Fehler und schlage konkrete Fixes vor.' }
                    );
                    result = { success: true, action: 'nexuz-chat', detail: reply.reply || reply.response || 'LLM antwortete' };
                }
            } else if (strategy === 'james-evaluate') {
                // James bewertet die aktuelle Seite
                if (window.DkzJames && typeof window.DkzJames.evaluate === 'function') {
                    var evalResult = window.DkzJames.evaluate(document.documentElement.outerHTML, 'html');
                    result = { success: true, action: 'james-evaluate', detail: 'Score: ' + evalResult.score + '/100, Grade: ' + evalResult.grade + ', Issues: ' + evalResult.issues.length };
                }
            } else if (strategy === 'webhook-dispatch') {
                // Webhook an Hub senden
                if (window.DkzNanoBot && typeof window.DkzNanoBot.triggerWebhook === 'function') {
                    await window.DkzNanoBot.triggerWebhook('ralph-loop', {
                        loopId: loop.id,
                        alert: loop.context.message,
                        source: loop.context.source,
                        severity: loop.context.severity
                    });
                    result = { success: true, action: 'webhook-dispatch', detail: 'Webhook ralph-loop ausgeloest' };
                }
            } else if (strategy === 'james-suggest') {
                // James suggestFix via LLM (optional API — fehlt: als suggestFix() in dkz-james.js implementieren)
                if (window.DkzJames && typeof window.DkzJames.suggestFix === 'function') {
                    var fix = await window.DkzJames.suggestFix(loop.context.message);
                    result = { success: true, action: 'james-suggest', detail: fix || 'Fix vorgeschlagen' };
                } else {
                    // Fallback: suggestFix fehlt → nexuz-chat als Alternative
                    _log('james-suggest unavailable, fallback to nexuz-chat', 'system');
                    loop.execution.strategy = 'nexuz-chat';
                    return phaseExecute(loop);
                }
            } else {
                // Fallback: Nur loggen
                result = { success: true, action: 'log-only', detail: 'Kein aktiver Fix-Handler — Alert geloggt' };
            }
        } catch (e) {
            result = { success: false, action: strategy, detail: 'Execute-Fehler: ' + (e.message || String(e)).slice(0, 200) };
        }

        loop.result = result;
        loop.phases.EXECUTE.end = _ts();
        loop.phases.EXECUTE.status = result.success ? 'done' : 'failed';
        return result.success;
    }

    /**
     * Phase 4: VERIFY — James bewertet das Ergebnis
     */
    function phaseVerify(loop) {
        loop.phase = 'VERIFY';
        loop.phases.VERIFY = { start: _ts(), status: 'running' };
        _emit('ralph:phase', { phase: 'VERIFY', loop: loop.id });

        var verified = false;

        // Einfache Verifikation: Hat Execute funktioniert?
        if (loop.result && loop.result.success) {
            verified = true;

            // Bonus: James Score pruefen wenn verfuegbar
            if (window.DkzJames && typeof window.DkzJames.evaluate === 'function') {
                try {
                    var score = window.DkzJames.evaluate(document.documentElement.outerHTML, 'html');
                    loop.verification = {
                        jamesScore: score.score,
                        jamesGrade: score.grade,
                        issueCount: score.issues.length
                    };
                } catch (e) { /* James nicht verfuegbar */ }
            }
        }

        // Bei Fehlschlag: Retry moeglich?
        if (!verified && loop.retries < MAX_RETRIES) {
            loop.retries++;
            loop.phases.VERIFY.status = 'retry';
            loop.phases.VERIFY.end = _ts();
            return false; // → zurueck zu EXECUTE
        }

        loop.verified = verified;
        loop.phases.VERIFY.end = _ts();
        loop.phases.VERIFY.status = verified ? 'done' : 'failed';
        return true; // Weiter zu COMMIT (auch bei Fehlschlag)
    }

    /**
     * Phase 5: COMMIT — EventLog schreiben, Status updaten
     */
    function phaseCommit(loop) {
        loop.phase = 'COMMIT';
        loop.phases.COMMIT = { start: _ts(), status: 'running' };
        _emit('ralph:phase', { phase: 'COMMIT', loop: loop.id });

        // EventLog Eintrag
        if (window.DkzEventLog && typeof window.DkzEventLog.log === 'function') {
            window.DkzEventLog.log({
                type: loop.verified ? 'action' : 'error',
                source: 'ralph-loop',
                action: 'loop-complete',
                metadata: {
                    loopId: loop.id,
                    alert: loop.context.message.slice(0, 100),
                    strategy: loop.execution.strategy,
                    result: loop.result.action,
                    verified: loop.verified,
                    retries: loop.retries,
                    phases: Object.keys(loop.phases).map(function (p) {
                        return p + ':' + loop.phases[p].status;
                    }).join(', ')
                },
                tags: ['ralph', 'loop-complete', loop.verified ? 'success' : 'failed']
            });
        }

        // Stats updaten
        _stats.total++;
        if (loop.verified) _stats.success++;
        else _stats.failed++;

        // History
        loop.completedAt = _ts();
        loop.duration = Date.now() - new Date(loop.startedAt).getTime();
        _history.push({
            id: loop.id,
            alert: loop.context.message.slice(0, 100),
            source: loop.context.source,
            strategy: loop.execution.strategy,
            result: loop.result.action,
            verified: loop.verified,
            retries: loop.retries,
            duration: loop.duration,
            completedAt: loop.completedAt
        });

        _saveState();

        loop.phases.COMMIT.end = _ts();
        loop.phases.COMMIT.status = 'done';
        return true;
    }

    /**
     * Phase 6: LOOP — Naechster Alert oder Pause
     */
    function phaseLoop(loop) {
        loop.phase = 'LOOP';
        loop.phases.LOOP = { start: _ts(), status: 'running' };
        _emit('ralph:phase', { phase: 'LOOP', loop: loop.id });
        _emit('ralph:complete', {
            loopId: loop.id,
            verified: loop.verified,
            stats: _stats
        });

        // Toast bei Erfolg
        if (window.DkzToast && loop.verified) {
            window.DkzToast.success('Ralph Loop: Fix angewendet (' + loop.result.action + ')', 'ralph');
        } else if (window.DkzToast && !loop.verified) {
            window.DkzToast.show('Ralph Loop: Fix fehlgeschlagen — manuell pruefen', 'warn');
        }

        loop.phases.LOOP.end = _ts();
        loop.phases.LOOP.status = 'done';

        _current = null;
        _running = false;

        // Naechster Alert in Queue?
        if (_queue.length > 0 && !_paused) {
            setTimeout(function () { processNext(); }, 1000);
        }
    }

    // ═══════════════════════════════════════
    // Strategy Determination
    // ═══════════════════════════════════════
    function _determineStrategy(context) {
        var msg = (context.message || '').toLowerCase();
        var source = (context.source || '').toLowerCase();

        // JS Runtime Fehler → James evaluieren + LLM Vorschlag
        if (source === 'js-runtime' || msg.includes('typeerror') || msg.includes('referenceerror') || msg.includes('syntaxerror')) {
            return 'james-suggest';
        }
        // Health-Checks → Webhook an Hub
        if (source === 'autohealth' || source === 'health-monitor') {
            return 'webhook-dispatch';
        }
        // Netzwerk-Fehler → NanoBot sucht Alternative
        if (msg.includes('offline') || msg.includes('network') || msg.includes('fetch')) {
            return 'nanobot-search';
        }
        // localStorage voll → Log-only (kein Auto-Fix moeglich)
        if (source === 'storage' || msg.includes('localstorage')) {
            return 'log-only';
        }
        // Custom Check Fehler → James evaluate
        if (source === 'custom-check') {
            return 'james-evaluate';
        }
        // Default: LLM fragen
        return 'nexuz-chat';
    }

    function _detectModule() {
        var path = location.pathname.toLowerCase();
        var match = path.match(/modules\/([^/]+)/);
        return match ? match[1] : 'unknown';
    }

    // ═══════════════════════════════════════
    // Queue Management
    // ═══════════════════════════════════════
    function enqueue(alert) {
        if (!alert || !alert.message) return false;

        // Severity Check
        var sev = SEVERITY_MAP[alert.severity] || 0;
        if (sev < SEVERITY_THRESHOLD) {
            _stats.skipped++;
            return false;
        }

        // Dedup Check
        if (_isDuplicate(alert)) {
            _stats.skipped++;
            return false;
        }

        // Queue Limit
        if (_queue.length >= MAX_QUEUE) {
            _queue.shift(); // Aeltesten rauswerfen
        }

        _queue.push(alert);
        _log('Alert queued: ' + (alert.message || '').slice(0, 80), 'action');

        // Auto-Start wenn nicht am laufen
        if (!_running && !_paused) {
            setTimeout(function () { processNext(); }, 500);
        }

        return true;
    }

    async function processNext() {
        if (_running || _paused || _queue.length === 0) return;

        var alert = _queue.shift();
        _running = true;

        var loop = {
            id: _id(),
            alert: alert,
            startedAt: _ts(),
            phase: null,
            phases: {},
            context: null,
            execution: null,
            result: null,
            verified: false,
            retries: 0,
            completedAt: null,
            duration: 0
        };

        _current = loop;
        _emit('ralph:start', { loopId: loop.id, alert: alert.message });
        _log('Ralph Loop gestartet: ' + loop.id, 'action');

        try {
            // Phase 1: LESEN
            phaseLesen(loop);

            // Phase 2: SPAWN
            phaseSpawn(loop);

            // Phase 3+4: EXECUTE + VERIFY (mit Retry-Loop + PHASE_TIMEOUT)
            var executeSuccess = false;
            var LOOP_TIMEOUT = PHASE_TIMEOUT_MS * 4; // Max 2 Min pro komplettem Loop
            var loopStart = Date.now();
            do {
                // Guard: Gesamter Loop darf nicht laenger als 2 Min dauern
                if (Date.now() - loopStart > LOOP_TIMEOUT) {
                    _log('LOOP_TIMEOUT: Gesamtloop ' + loop.id + ' ueberschritt ' + (LOOP_TIMEOUT / 1000) + 's', 'error');
                    loop.result = { success: false, action: 'timeout', detail: 'Loop-Gesamttimeout nach ' + (LOOP_TIMEOUT / 1000) + 's' };
                    break;
                }
                executeSuccess = await _withTimeout(phaseExecute(loop), loop, 'EXECUTE');
                var verifyDone = phaseVerify(loop);
                if (!verifyDone) {
                    // Retry: zurueck zu EXECUTE
                    _log('Retry #' + loop.retries + ' fuer ' + loop.id, 'action');
                    continue;
                }
                break;
            } while (loop.retries <= MAX_RETRIES);

            // Phase 5: COMMIT
            phaseCommit(loop);

            // Phase 6: LOOP
            phaseLoop(loop);

        } catch (e) {
            // Fatal Error — Loop abbrechen
            loop.phase = 'FATAL';
            loop.result = { success: false, action: 'fatal', detail: e.message || String(e) };
            _log('Ralph Loop FATAL: ' + (e.message || String(e)).slice(0, 200), 'error');
            _stats.total++;
            _stats.failed++;
            _current = null;
            _running = false;
            _saveState();

            // Trotzdem naechsten Alert probieren
            if (_queue.length > 0 && !_paused) {
                setTimeout(function () { processNext(); }, 2000);
            }
        }
    }

    // ═══════════════════════════════════════
    // EventBus Integration
    // ═══════════════════════════════════════
    function setupListeners() {
        // Watchdog Alerts abfangen
        if (window.DkZ && window.DkZ.EventBus) {
            window.DkZ.EventBus.on('watchdog:alert', function (alert) {
                enqueue(alert);
            }, 'ralph-loop');

            // EventLog Error-Events abfangen
            window.DkZ.EventBus.on('eventlog:new', function (entry) {
                if (entry && (entry.type === 'error' || entry.type === 'alert')) {
                    enqueue({
                        severity: entry.severity || 'error',
                        message: entry.action || entry.message || 'Unknown error',
                        source: entry.source || 'eventlog',
                        metadata: entry.metadata || {},
                        timestamp: entry.timestamp
                    });
                }
            }, 'ralph-loop');
        }

        // Auch Custom DOM Events hoeren
        document.addEventListener('dkz:watchdog:alert', function (e) {
            if (e.detail) enqueue(e.detail);
        });
    }

    // ═══════════════════════════════════════
    // Public API
    // ═══════════════════════════════════════
    window.DkzRalph = {

        version: VERSION,

        /** Ralph Loop manuell starten mit einem Alert */
        trigger: function (message, severity, source) {
            return enqueue({
                severity: severity || 'error',
                message: message,
                source: source || 'manual',
                metadata: {},
                timestamp: _ts()
            });
        },

        /** Queue Status */
        getQueue: function () { return _queue.slice(); },

        /** Aktueller Loop */
        getCurrent: function () { return _current ? JSON.parse(JSON.stringify(_current)) : null; },

        /** History */
        getHistory: function (count) {
            count = count || 50;
            return _history.slice(-count);
        },

        /** Stats */
        getStats: function () {
            return Object.assign({}, _stats, {
                queueLength: _queue.length,
                running: _running,
                paused: _paused,
                currentPhase: _current ? _current.phase : null
            });
        },

        /** Pausieren / Fortsetzen */
        pause: function () { _paused = true; _emit('ralph:paused', {}); },
        resume: function () {
            _paused = false;
            _emit('ralph:resumed', {});
            if (_queue.length > 0 && !_running) processNext();
        },

        /** Queue leeren */
        clearQueue: function () { _queue = []; },

        /** History leeren */
        clearHistory: function () { _history = []; _stats = { total: 0, success: 0, failed: 0, skipped: 0 }; _saveState(); },

        /** Severity-Schwelle aendern (0=info, 1=warn, 2=error, 3=critical) */
        setThreshold: function (level) {
            if (typeof level === 'number' && level >= 0 && level <= 3) SEVERITY_THRESHOLD = level;
        },

        /** Cooldown aendern (ms) */
        setCooldown: function (ms) {
            if (typeof ms === 'number' && ms >= 10000) COOLDOWN_MS = ms;
        },

        /** Ist Ralph aktiv? */
        isRunning: function () { return _running; },
        isPaused: function () { return _paused; }
    };

    // ═══════════════════════════════════════
    // Init
    // ═══════════════════════════════════════
    function init() {
        _loadState();
        setupListeners();
        _log('Ralph Loop v' + VERSION + ' initialisiert — Threshold: ' + SEVERITY_THRESHOLD + ' (' + Object.keys(SEVERITY_MAP).find(function (k) { return SEVERITY_MAP[k] === SEVERITY_THRESHOLD; }) + '+)', 'system');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
