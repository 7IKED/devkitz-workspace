/**
 * DkZ AutoBug v1 — Zentrales Error-Reporting fuer ALLE Module
 * Faengt Fehler in Console, Window, Promise, Network ab.
 * Sendet an REDNOTE.json + Webhook Hub + NanoBot.
 *
 * @DKZ:RULES → R21 Shared Scripts, R15 esc(), R8 keine Umlaute
 * @DKZ:TAG → [SYS:autobug] [CAT:shared] [LANG:js]
 * @version v1.00.0_01
 *
 * Einbinden (MUSS als ERSTES Script geladen werden):
 *   <script src="../../shared/dkz-autobug.js"></script>
 */
const DkzAutoBug = (() => {
    'use strict';
    const VERSION = 'v1.0.0';
    const STORAGE_KEY = 'dkz-autobug-log';
    const MAX_ERRORS = 100;
    const WEBHOOK_HUB = 'http://localhost:9090';
    const REDNOTE_KEY = 'dkz-rednote-errors';

    let _errors = [];
    let _module = 'unknown';
    let _started = Date.now();
    let _errorCount = 0;
    let _warnCount = 0;
    let _suppressDuplicates = {};

    // ═══ Modul-Erkennung ═══
    function _detectModule() {
        const tag = document.querySelector('script[src*="dkz-autobug"]');
        if (tag && tag.dataset.module) return tag.dataset.module;
        const path = location.pathname;
        const parts = path.split('/').filter(Boolean);
        return parts[parts.length - 2] || parts[parts.length - 1] || 'unknown';
    }

    // ═══ Error Entry erstellen ═══
    function _createEntry(level, message, source, line, col, stack) {
        return {
            id: `BUG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            ts: new Date().toISOString(),
            level: level, // 'error' | 'warn' | 'unhandled' | 'network' | 'promise'
            module: _module,
            message: String(message || '').substring(0, 500),
            source: String(source || '').substring(0, 200),
            line: line || 0,
            col: col || 0,
            stack: String(stack || '').substring(0, 1000),
            url: location.href,
            userAgent: navigator.userAgent.substring(0, 100),
            uptime: Math.round((Date.now() - _started) / 1000)
        };
    }

    // ═══ Duplikat-Pruefung ═══
    function _isDuplicate(key) {
        if (_suppressDuplicates[key]) {
            if (Date.now() - _suppressDuplicates[key] < 5000) return true; // 5s Cooldown
        }
        _suppressDuplicates[key] = Date.now();
        // Alte Keys aufraemen
        const now = Date.now();
        Object.keys(_suppressDuplicates).forEach(k => {
            if (now - _suppressDuplicates[k] > 30000) delete _suppressDuplicates[k];
        });
        return false;
    }

    // ═══ Error speichern ═══
    function _store(entry) {
        _errors.push(entry);
        if (_errors.length > MAX_ERRORS) _errors = _errors.slice(-MAX_ERRORS);

        // localStorage
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_errors));
        } catch { /* voll */ }

        // REDNOTE (zentrale Fehlerdatenbank)
        try {
            const rednote = JSON.parse(localStorage.getItem(REDNOTE_KEY) || '[]');
            rednote.push({
                id: entry.id,
                ts: entry.ts,
                level: entry.level,
                module: entry.module,
                message: entry.message,
                status: 'open'
            });
            if (rednote.length > 200) rednote.splice(0, rednote.length - 200);
            localStorage.setItem(REDNOTE_KEY, JSON.stringify(rednote));
        } catch { /* voll */ }

        // Counter
        if (entry.level === 'error' || entry.level === 'unhandled' || entry.level === 'promise') _errorCount++;
        else _warnCount++;

        // Badge aktualisieren
        _updateBadge();

        // An Webhook Hub senden (async, fire-and-forget)
        _sendToWebhook(entry);

        // NanoBot benachrichtigen
        _notifyNanoBot(entry);
    }

    // ═══ Webhook Hub ═══
    async function _sendToWebhook(entry) {
        try {
            await fetch(`${WEBHOOK_HUB}/hook/autobug-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-DKZ-Source': 'autobug' },
                body: JSON.stringify(entry),
                signal: AbortSignal.timeout(3000)
            });
        } catch { /* Hub offline — kein Problem */ }
    }

    // ═══ NanoBot Benachrichtigung ═══
    function _notifyNanoBot(entry) {
        if (typeof window.DkzNanoBot !== 'undefined' && entry.level !== 'warn') {
            // NanoBot hat _addMessage nicht exposed — nutze CustomEvent
            window.dispatchEvent(new CustomEvent('dkz-autobug', { detail: entry }));
        }
    }

    // ═══ UI: Error Badge ═══
    function _createBadge() {
        const badge = document.createElement('div');
        badge.id = 'dkz-autobug-badge';
        badge.style.cssText = 'position:fixed;bottom:16px;left:16px;z-index:9990;display:none;align-items:center;gap:4px;padding:5px 10px;background:rgba(250,30,78,.15);border:1px solid rgba(250,30,78,.3);border-radius:20px;font-family:"Inter",sans-serif;font-size:10px;font-weight:700;color:#fa1e4e;cursor:pointer;backdrop-filter:blur(12px);transition:all .3s;';
        badge.innerHTML = '🐛 <span id="ab-count">0</span>';
        badge.title = 'AutoBug — Klicken fuer Details';
        badge.addEventListener('click', showPanel);
        badge.addEventListener('mouseenter', () => { badge.style.transform = 'scale(1.05)'; badge.style.boxShadow = '0 2px 12px rgba(250,30,78,.2)'; });
        badge.addEventListener('mouseleave', () => { badge.style.transform = ''; badge.style.boxShadow = ''; });
        document.body.appendChild(badge);
    }

    function _updateBadge() {
        const badge = document.getElementById('dkz-autobug-badge');
        const count = document.getElementById('ab-count');
        if (!badge) return;
        const total = _errorCount + _warnCount;
        if (total > 0) {
            badge.style.display = 'flex';
            if (count) count.textContent = total;
            if (_errorCount > 0) {
                badge.style.borderColor = 'rgba(250,30,78,.4)';
                badge.style.background = 'rgba(250,30,78,.15)';
                badge.style.color = '#fa1e4e';
            } else {
                badge.style.borderColor = 'rgba(255,184,0,.3)';
                badge.style.background = 'rgba(255,184,0,.1)';
                badge.style.color = '#ffb800';
            }
        }
    }

    // ═══ UI: Detail Panel ═══
    function showPanel() {
        let panel = document.getElementById('dkz-autobug-panel');
        if (panel) { panel.remove(); return; }

        panel = document.createElement('div');
        panel.id = 'dkz-autobug-panel';
        panel.style.cssText = 'position:fixed;bottom:50px;left:16px;z-index:9991;width:500px;max-height:400px;background:rgba(8,8,12,.98);border:1px solid rgba(250,30,78,.15);border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,.5);backdrop-filter:blur(20px);font-family:"Inter",sans-serif;overflow:hidden;';

        const header = `<div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);display:flex;justify-content:space-between;align-items:center">
            <div style="font-size:12px;font-weight:800;color:#f0f0f2">🐛 AutoBug — ${_module}</div>
            <div style="display:flex;gap:8px;align-items:center">
                <span style="font-size:9px;color:#fa1e4e;font-weight:700">${_errorCount} errors</span>
                <span style="font-size:9px;color:#ffb800;font-weight:700">${_warnCount} warns</span>
                <button onclick="DkzAutoBug.clearAll()" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.06);border-radius:4px;color:#71717a;font-size:9px;padding:2px 8px;cursor:pointer;font-family:inherit">Clear</button>
                <button onclick="document.getElementById('dkz-autobug-panel').remove()" style="background:none;border:none;color:#71717a;font-size:14px;cursor:pointer">✕</button>
            </div>
        </div>`;

        const recent = _errors.slice(-20).reverse();
        const rows = recent.map(e => {
            const levelIcon = e.level === 'error' ? '🔴' : e.level === 'warn' ? '🟡' : e.level === 'promise' ? '🟣' : e.level === 'network' ? '🔵' : '⚪';
            const levelColor = e.level === 'error' || e.level === 'unhandled' ? '#fa1e4e' : e.level === 'warn' ? '#ffb800' : '#a855f7';
            const time = new Date(e.ts).toLocaleTimeString('de-DE', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
            const msg = _escHtml(e.message.substring(0, 120));
            const src = e.source ? _escHtml(e.source.split('/').pop()) : '';
            return `<div style="padding:6px 14px;border-bottom:1px solid rgba(255,255,255,.02);font-size:10px" title="${_escHtml(e.stack || '')}">
                <div style="display:flex;gap:6px;align-items:center">
                    <span>${levelIcon}</span>
                    <span style="color:${levelColor};font-weight:700;min-width:55px">${e.level}</span>
                    <span style="color:#a1a1aa;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${msg}</span>
                    <span style="color:#52525b;font-size:8px">${time}</span>
                </div>
                ${src ? `<div style="color:#52525b;font-size:8px;margin-left:22px">${src}:${e.line}</div>` : ''}
            </div>`;
        }).join('');

        panel.innerHTML = header + `<div style="overflow-y:auto;max-height:330px">${rows || '<div style="padding:20px;text-align:center;color:#52525b;font-size:11px">Keine Fehler 🎉</div>'}</div>`;
        document.body.appendChild(panel);
    }

    function _escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    // ═══ Console Override ═══
    function _interceptConsole() {
        const origError = console.error;
        const origWarn = console.warn;

        console.error = function(...args) {
            const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a).substring(0, 200) : String(a)).join(' ');
            const key = 'console-error-' + msg.substring(0, 50);
            if (!_isDuplicate(key)) {
                _store(_createEntry('error', msg, 'console.error'));
            }
            origError.apply(console, args);
        };

        console.warn = function(...args) {
            const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a).substring(0, 200) : String(a)).join(' ');
            const key = 'console-warn-' + msg.substring(0, 50);
            if (!_isDuplicate(key)) {
                _store(_createEntry('warn', msg, 'console.warn'));
            }
            origWarn.apply(console, args);
        };
    }

    // ═══ Window Error Handler ═══
    function _interceptWindowErrors() {
        window.addEventListener('error', (event) => {
            const key = `window-${event.message}-${event.lineno}`;
            if (_isDuplicate(key)) return;
            _store(_createEntry(
                'unhandled', event.message, event.filename,
                event.lineno, event.colno,
                event.error ? event.error.stack : ''
            ));
        });
    }

    // ═══ Unhandled Promise Rejection ═══
    function _interceptPromises() {
        window.addEventListener('unhandledrejection', (event) => {
            const reason = event.reason;
            const msg = reason instanceof Error ? reason.message : String(reason);
            const key = 'promise-' + msg.substring(0, 50);
            if (_isDuplicate(key)) return;
            _store(_createEntry(
                'promise', msg, 'Promise',
                0, 0, reason instanceof Error ? reason.stack : ''
            ));
        });
    }

    // ═══ Network Error Tracking ═══
    function _interceptNetwork() {
        const origFetch = window.fetch;
        window.fetch = function(...args) {
            return origFetch.apply(this, args).then(response => {
                if (!response.ok && response.status >= 400) {
                    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
                    // Nur kritische Fehler loggen (nicht 404 auf Health-Checks)
                    if (response.status >= 500) {
                        const key = `net-${response.status}-${url.substring(0, 50)}`;
                        if (!_isDuplicate(key)) {
                            _store(_createEntry('network', `HTTP ${response.status} — ${url}`, url));
                        }
                    }
                }
                return response;
            }).catch(err => {
                const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
                // Nur echte Netzwerkfehler (nicht AbortError/Timeout)
                if (err.name !== 'AbortError' && err.name !== 'TimeoutError') {
                    const key = `net-fail-${url.substring(0, 50)}`;
                    if (!_isDuplicate(key)) {
                        _store(_createEntry('network', `FETCH FAILED — ${url}: ${err.message}`, url));
                    }
                }
                throw err;
            });
        };
    }

    // ═══ Export + Report ═══
    function getReport() {
        return {
            module: _module,
            version: VERSION,
            uptime: Math.round((Date.now() - _started) / 1000),
            errors: _errorCount,
            warnings: _warnCount,
            total: _errors.length,
            recent: _errors.slice(-20),
            rednote: JSON.parse(localStorage.getItem(REDNOTE_KEY) || '[]')
        };
    }

    function exportJSON() {
        const report = getReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `autobug-${_module}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function clearAll() {
        _errors = [];
        _errorCount = 0;
        _warnCount = 0;
        _suppressDuplicates = {};
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ok */ }
        _updateBadge();
        const panel = document.getElementById('dkz-autobug-panel');
        if (panel) panel.remove();
    }

    // ═══ INIT ═══
    function init() {
        _module = _detectModule();
        _started = Date.now();

        // Gespeicherte Fehler laden
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            _errors = stored;
            _errorCount = stored.filter(e => e.level === 'error' || e.level === 'unhandled' || e.level === 'promise').length;
            _warnCount = stored.filter(e => e.level === 'warn').length;
        } catch { _errors = []; }

        // Alle Interceptors aktivieren
        _interceptConsole();
        _interceptWindowErrors();
        _interceptPromises();
        _interceptNetwork();

        // UI erstellen
        const setup = () => {
            _createBadge();
            _updateBadge();
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
        else setup();

        // NanoBot Event-Listener (wenn NanoBot spaeter laedt)
        window.addEventListener('dkz-autobug', (e) => {
            // NanoBot kann auf AutoBug Events reagieren
        });
    }

    init();

    return {
        version: VERSION,
        getReport, exportJSON, clearAll, showPanel,
        getErrors: () => _errors,
        getErrorCount: () => _errorCount,
        getWarnCount: () => _warnCount,
    };
})();

if (typeof window !== 'undefined') window.DkzAutoBug = DkzAutoBug;
