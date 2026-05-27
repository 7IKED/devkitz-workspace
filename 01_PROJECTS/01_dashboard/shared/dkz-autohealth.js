/**
 * DkZ AutoHealth — Automatischer Health-Check im Debug-Modus
 * @DKZ:RULES -> R21 Shared Scripts, R19 Analyse
 * @version v0.01.1_01
 *
 * Prueft alle 60 Sekunden im Hintergrund:
 * - Shared Scripts geladen? (navbar, debug, copilot, etc.)
 * - CSS Variables korrekt? (--accent, --bg)
 * - XSS-Schutz (esc()) verfuegbar?
 * - localStorage funktional?
 * - Offline-Status?
 * - Memory Usage (performance.memory)
 * - EventLog aktiv?
 * - Version-Meta vorhanden?
 *
 * Status-Badge: Gruen/Gelb/Rot Puls (unten links)
 * Health-Report: Glassmorphism Modal mit Score 0-100
 *
 * Usage: <script src="../../shared/dkz-autohealth.js"></script>
 */
(function () {
    'use strict';

    /* ═══════════════════════════════════════════════════
     * Guard: einmalige Initialisierung
     * ═══════════════════════════════════════════════════ */
    if (window.DkzAutoHealth) return;

    /* ═══════════════════════════════════════════════════
     * XSS Helper — eigene Kopie fuer Unabhaengigkeit
     * ═══════════════════════════════════════════════════ */
    function esc(str) {
        if (str == null) return '';
        var d = document.createElement('div');
        d.textContent = String(str);
        return d.innerHTML;
    }

    /* ═══════════════════════════════════════════════════
     * Konstanten
     * ═══════════════════════════════════════════════════ */
    var CHECK_INTERVAL_MS = 60000;
    var BADGE_SIZE = 24;
    var PANEL_MAX_W = 400;
    var Z_INDEX_BADGE = 99990;
    var Z_INDEX_PANEL = 99995;
    var Z_INDEX_OVERLAY = 99994;

    /* ═══════════════════════════════════════════════════
     * State
     * ═══════════════════════════════════════════════════ */
    var _timer = null;
    var _lastReport = null;
    var _badgeEl = null;
    var _panelEl = null;
    var _overlayEl = null;
    var _styleInjected = false;

    /* ═══════════════════════════════════════════════════
     * Health Checks Definition
     * ═══════════════════════════════════════════════════ */
    var CHECKS = [
        {
            id: 'shared-navbar',
            name: 'dkz-navbar.js',
            category: 'scripts',
            critical: false,
            fn: function () {
                return typeof window.DkzNavbar !== 'undefined' ||
                       typeof window.DkZ !== 'undefined' && window.DkZ.Navbar ||
                       !!document.getElementById('dkz-navbar') ||
                       !!document.querySelector('[data-dkz-navbar]');
            },
            fix: 'Lade dkz-navbar.js via <script src="../../shared/dkz-navbar.js"></script>'
        },
        {
            id: 'shared-debug',
            name: 'dkz-debug.js',
            category: 'scripts',
            critical: false,
            fn: function () {
                return !!document.getElementById('dkz-debug-btn') ||
                       typeof window.DkZ !== 'undefined' && window.DkZ.Health;
            },
            fix: 'Lade dkz-debug.js via <script src="../../shared/dkz-debug.js"></script>'
        },
        {
            id: 'shared-copilot',
            name: 'dkz-copilot.js',
            category: 'scripts',
            critical: false,
            fn: function () {
                return typeof window.DkzCopilot !== 'undefined' ||
                       typeof window.DkZ !== 'undefined' && window.DkZ.Copilot ||
                       !!document.getElementById('dkz-copilot');
            },
            fix: 'Lade dkz-copilot.js via <script src="../../shared/dkz-copilot.js"></script>'
        },
        {
            id: 'shared-eventlog',
            name: 'dkz-eventlog.js',
            category: 'scripts',
            critical: false,
            fn: function () {
                return typeof window.DkzEventLog !== 'undefined';
            },
            fix: 'Lade dkz-eventlog.js via <script src="../../shared/dkz-eventlog.js"></script>'
        },
        {
            id: 'shared-guide',
            name: 'dkz-guide.js',
            category: 'scripts',
            critical: false,
            fn: function () {
                return typeof window.DkzGuide !== 'undefined' ||
                       typeof window.DkZ !== 'undefined' && window.DkZ.Guide;
            },
            fix: 'Lade dkz-guide.js via <script src="../../shared/dkz-guide.js"></script>'
        },
        {
            id: 'css-accent',
            name: 'CSS --accent',
            category: 'design',
            critical: true,
            fn: function () {
                var v = getComputedStyle(document.documentElement)
                        .getPropertyValue('--accent').trim();
                return v && v.indexOf('fa1e4e') !== -1;
            },
            fix: 'Setze :root { --accent: #fa1e4e; } in deinem CSS'
        },
        {
            id: 'css-bg',
            name: 'CSS --bg',
            category: 'design',
            critical: true,
            fn: function () {
                var v = getComputedStyle(document.documentElement)
                        .getPropertyValue('--bg').trim();
                return v && v.indexOf('060608') !== -1;
            },
            fix: 'Setze :root { --bg: #060608; } in deinem CSS'
        },
        {
            id: 'xss-esc',
            name: 'XSS-Schutz esc()',
            category: 'security',
            critical: true,
            fn: function () {
                return typeof window.esc === 'function';
            },
            fix: 'Definiere window.esc = function(s){ var d=document.createElement("div"); d.textContent=s; return d.innerHTML; }'
        },
        {
            id: 'localstorage',
            name: 'localStorage',
            category: 'runtime',
            critical: true,
            fn: function () {
                try {
                    var k = '__dkz_ah_test__';
                    localStorage.setItem(k, '1');
                    localStorage.removeItem(k);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            fix: 'localStorage ist blockiert — pruefe Browser-Einstellungen oder Private Mode'
        },
        {
            id: 'offline',
            name: 'Online-Status',
            category: 'runtime',
            critical: false,
            fn: function () {
                return navigator.onLine;
            },
            fix: 'Netzwerkverbindung pruefen — Offline-Modus aktiv'
        },
        {
            id: 'memory',
            name: 'Memory Usage',
            category: 'performance',
            critical: false,
            fn: function () {
                if (!performance || !performance.memory) return true;
                var used = performance.memory.usedJSHeapSize;
                var limit = performance.memory.jsHeapSizeLimit;
                return used / limit < 0.85;
            },
            detail: function () {
                if (!performance || !performance.memory) return 'N/A (API nicht verfuegbar)';
                var mb = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
                var maxMb = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(0);
                return mb + ' MB / ' + maxMb + ' MB';
            },
            fix: 'Memory-Verbrauch ueber 85% — pruefe auf Memory Leaks'
        },
        {
            id: 'eventlog-active',
            name: 'EventLog aktiv',
            category: 'system',
            critical: false,
            fn: function () {
                return typeof window.DkzEventLog !== 'undefined' &&
                       window.DkzEventLog._loaded === true;
            },
            fix: 'EventLog ist geladen aber nicht initialisiert — rufe DkzEventLog.init() auf'
        },
        {
            id: 'version-meta',
            name: 'Version-Meta',
            category: 'system',
            critical: false,
            fn: function () {
                return !!document.querySelector('meta[name="dkz-version"]');
            },
            detail: function () {
                var m = document.querySelector('meta[name="dkz-version"]');
                return m ? m.content : 'fehlt';
            },
            fix: 'Fuege <meta name="dkz-version" content="v0.01.x_xx"> im <head> ein'
        }
    ];

    /* ═══════════════════════════════════════════════════
     * Run All Checks
     * ═══════════════════════════════════════════════════ */
    function runChecks() {
        var results = [];
        var passed = 0;
        var failed = 0;
        var warnings = 0;

        for (var i = 0; i < CHECKS.length; i++) {
            var c = CHECKS[i];
            var ok = false;
            var detail = '';

            try {
                ok = !!c.fn();
            } catch (e) {
                ok = false;
                detail = 'Error: ' + e.message;
            }

            if (!detail && typeof c.detail === 'function') {
                try { detail = c.detail(); } catch (e) { detail = ''; }
            }

            if (ok) {
                passed++;
            } else if (c.critical) {
                failed++;
            } else {
                warnings++;
            }

            results.push({
                id: c.id,
                name: c.name,
                category: c.category,
                critical: c.critical,
                ok: ok,
                detail: detail,
                fix: c.fix || ''
            });
        }

        var total = CHECKS.length;
        var score = Math.round((passed / total) * 100);
        var issueCount = failed + warnings;

        var status;
        if (issueCount === 0) {
            status = 'green';
        } else if (issueCount <= 2) {
            status = 'yellow';
        } else {
            status = 'red';
        }

        _lastReport = {
            score: score,
            status: status,
            passed: passed,
            failed: failed,
            warnings: warnings,
            total: total,
            results: results,
            timestamp: new Date().toISOString(),
            timestampLocal: new Date().toLocaleTimeString('de-DE', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            })
        };

        updateBadge();

        try {
            document.dispatchEvent(new CustomEvent('dkz:health-update', {
                detail: _lastReport
            }));
        } catch (e) { /* IE fallback — ignore */ }

        /* Watchdog Integration — Alerts bei Problemen */
        if (window.DkzWatchdog && issueCount > 0) {
            for (var w = 0; w < results.length; w++) {
                var chk = results[w];
                if (!chk.ok) {
                    var sev = chk.critical ? 'error' : 'warn';
                    window.DkzWatchdog.alert(
                        sev,
                        chk.name + (chk.fix ? ' — ' + chk.fix : ''),
                        'autohealth',
                        { checkId: chk.id, category: chk.category }
                    );
                }
            }
        }

        /* EventLog Integration — Health-Check protokollieren */
        if (window.DkzEventLog && typeof window.DkzEventLog.log === 'function') {
            window.DkzEventLog.log({
                type: 'system',
                source: 'autohealth',
                action: 'health-check',
                severity: status === 'red' ? 'error' : status === 'yellow' ? 'warn' : 'info',
                metadata: {
                    score: score,
                    passed: passed,
                    failed: failed,
                    warnings: warnings,
                    status: status
                },
                tags: ['autohealth', 'health-check', status]
            });
        }

        return _lastReport;
    }

    /* ═══════════════════════════════════════════════════
     * Inject Styles (einmalig)
     * ═══════════════════════════════════════════════════ */
    function injectStyles() {
        if (_styleInjected) return;
        _styleInjected = true;

        var style = document.createElement('style');
        style.setAttribute('data-dkz', 'autohealth');
        style.textContent = [
            '/* DkZ AutoHealth Styles */',

            '@keyframes dkzAhPulseGreen {',
            '  0%, 100% { box-shadow: 0 0 0 0 rgba(0,255,136,0.5); }',
            '  50% { box-shadow: 0 0 8px 3px rgba(0,255,136,0.3); }',
            '}',

            '@keyframes dkzAhPulseYellow {',
            '  0%, 100% { box-shadow: 0 0 0 0 rgba(255,184,0,0.5); }',
            '  50% { box-shadow: 0 0 8px 3px rgba(255,184,0,0.3); }',
            '}',

            '@keyframes dkzAhPulseRed {',
            '  0%, 100% { box-shadow: 0 0 0 0 rgba(255,59,92,0.5); }',
            '  50% { box-shadow: 0 0 8px 3px rgba(255,59,92,0.3); }',
            '}',

            '@keyframes dkzAhSlideUp {',
            '  from { opacity:0; transform:translateY(16px); }',
            '  to { opacity:1; transform:translateY(0); }',
            '}',

            '#dkz-ah-badge {',
            '  position:fixed;',
            '  bottom:70px;',
            '  left:12px;',
            '  width:' + BADGE_SIZE + 'px;',
            '  height:' + BADGE_SIZE + 'px;',
            '  border-radius:50%;',
            '  border:none;',
            '  cursor:pointer;',
            '  z-index:' + Z_INDEX_BADGE + ';',
            '  transition:transform 0.2s ease, opacity 0.2s ease;',
            '  padding:0;',
            '  outline:none;',
            '}',

            '#dkz-ah-badge:hover {',
            '  transform:scale(1.25);',
            '}',

            '#dkz-ah-badge.dkz-ah-green {',
            '  background:#00ff88;',
            '  animation:dkzAhPulseGreen 2.5s ease-in-out infinite;',
            '}',

            '#dkz-ah-badge.dkz-ah-yellow {',
            '  background:#ffb800;',
            '  animation:dkzAhPulseYellow 1.8s ease-in-out infinite;',
            '}',

            '#dkz-ah-badge.dkz-ah-red {',
            '  background:#ff3b5c;',
            '  animation:dkzAhPulseRed 1.2s ease-in-out infinite;',
            '}',

            '#dkz-ah-overlay {',
            '  position:fixed;',
            '  top:0; left:0; right:0; bottom:0;',
            '  background:rgba(6,6,8,0.65);',
            '  z-index:' + Z_INDEX_OVERLAY + ';',
            '  backdrop-filter:blur(4px);',
            '  -webkit-backdrop-filter:blur(4px);',
            '}',

            '#dkz-ah-panel {',
            '  position:fixed;',
            '  bottom:100px;',
            '  left:12px;',
            '  z-index:' + Z_INDEX_PANEL + ';',
            '  width:90%;',
            '  max-width:' + PANEL_MAX_W + 'px;',
            '  max-height:70vh;',
            '  overflow-y:auto;',
            '  background:rgba(17,17,22,0.88);',
            '  backdrop-filter:blur(24px) saturate(160%);',
            '  -webkit-backdrop-filter:blur(24px) saturate(160%);',
            '  border:1px solid rgba(255,255,255,0.08);',
            '  border-radius:16px;',
            '  padding:20px;',
            '  box-shadow:0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset;',
            '  font-family:"Inter",system-ui,-apple-system,sans-serif;',
            '  color:#f0f0f2;',
            '  animation:dkzAhSlideUp 0.25s ease-out;',
            '}',

            '#dkz-ah-panel::-webkit-scrollbar { width:4px; }',
            '#dkz-ah-panel::-webkit-scrollbar-track { background:transparent; }',
            '#dkz-ah-panel::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }',

            '.dkz-ah-header {',
            '  display:flex; justify-content:space-between; align-items:center;',
            '  margin-bottom:16px;',
            '}',

            '.dkz-ah-title {',
            '  font-size:0.85rem; font-weight:700; color:#f0f0f2; margin:0;',
            '}',

            '.dkz-ah-close {',
            '  background:none; border:none; color:#71717a; cursor:pointer;',
            '  font-size:1.1rem; padding:2px 6px; border-radius:4px;',
            '  transition:color 0.15s, background 0.15s;',
            '}',
            '.dkz-ah-close:hover { color:#fa1e4e; background:rgba(250,30,78,0.1); }',

            '.dkz-ah-score-bar {',
            '  width:100%; height:6px; border-radius:3px;',
            '  background:rgba(255,255,255,0.06);',
            '  margin-bottom:12px; overflow:hidden;',
            '}',

            '.dkz-ah-score-fill {',
            '  height:100%; border-radius:3px;',
            '  transition:width 0.5s ease, background 0.5s ease;',
            '}',

            '.dkz-ah-score-label {',
            '  display:flex; justify-content:space-between; align-items:baseline;',
            '  margin-bottom:6px;',
            '}',

            '.dkz-ah-score-num {',
            '  font-family:"JetBrains Mono",monospace;',
            '  font-size:1.6rem; font-weight:700;',
            '}',

            '.dkz-ah-score-text {',
            '  font-size:0.65rem; color:#71717a;',
            '}',

            '.dkz-ah-stats {',
            '  display:grid; grid-template-columns:repeat(3,1fr); gap:8px;',
            '  margin-bottom:16px;',
            '}',

            '.dkz-ah-stat {',
            '  text-align:center; padding:8px 4px;',
            '  background:rgba(255,255,255,0.03); border-radius:8px;',
            '}',

            '.dkz-ah-stat-num {',
            '  font-family:"JetBrains Mono",monospace;',
            '  font-size:1rem; font-weight:700;',
            '}',

            '.dkz-ah-stat-label {',
            '  font-size:0.55rem; color:#71717a; margin-top:2px;',
            '}',

            '.dkz-ah-section {',
            '  font-size:0.65rem; font-weight:600; color:#71717a;',
            '  text-transform:uppercase; letter-spacing:0.08em;',
            '  margin:12px 0 6px; padding-top:8px;',
            '  border-top:1px solid rgba(255,255,255,0.04);',
            '}',

            '.dkz-ah-check {',
            '  display:flex; align-items:center; gap:8px;',
            '  padding:5px 0;',
            '  font-family:"JetBrains Mono",monospace;',
            '  font-size:0.7rem;',
            '}',

            '.dkz-ah-dot {',
            '  width:7px; height:7px; border-radius:50%; flex-shrink:0;',
            '}',
            '.dkz-ah-dot.pass { background:#00ff88; }',
            '.dkz-ah-dot.fail { background:#ff3b5c; }',
            '.dkz-ah-dot.warn { background:#ffb800; }',

            '.dkz-ah-check-name { flex:1; color:#d4d4d8; }',
            '.dkz-ah-check-detail { color:#52525b; font-size:0.6rem; }',

            '.dkz-ah-fix {',
            '  font-size:0.6rem; color:#ffb800; padding:2px 0 2px 15px;',
            '  font-family:"JetBrains Mono",monospace;',
            '}',

            '.dkz-ah-timestamp {',
            '  font-size:0.6rem; color:#3f3f46; text-align:right;',
            '  margin-top:12px; padding-top:8px;',
            '  border-top:1px solid rgba(255,255,255,0.04);',
            '  font-family:"JetBrains Mono",monospace;',
            '}'
        ].join('\n');

        document.head.appendChild(style);
    }

    /* ═══════════════════════════════════════════════════
     * Badge
     * ═══════════════════════════════════════════════════ */
    function createBadge() {
        if (_badgeEl) return;

        _badgeEl = document.createElement('button');
        _badgeEl.id = 'dkz-ah-badge';
        _badgeEl.className = 'dkz-ah-green';
        _badgeEl.title = 'AutoHealth — Klick fuer Health-Report';
        _badgeEl.setAttribute('aria-label', 'AutoHealth Status');
        _badgeEl.addEventListener('click', togglePanel);
        document.body.appendChild(_badgeEl);
    }

    function updateBadge() {
        if (!_badgeEl || !_lastReport) return;

        _badgeEl.className = '';
        var cls = 'dkz-ah-' + _lastReport.status;
        _badgeEl.classList.add(cls);

        var titles = {
            green: 'AutoHealth — Alle Checks OK (' + _lastReport.score + '/100)',
            yellow: 'AutoHealth — ' + (_lastReport.failed + _lastReport.warnings) + ' Issues (' + _lastReport.score + '/100)',
            red: 'AutoHealth — KRITISCH: ' + _lastReport.failed + ' Fehler (' + _lastReport.score + '/100)'
        };
        _badgeEl.title = titles[_lastReport.status] || '';
    }

    /* ═══════════════════════════════════════════════════
     * Panel
     * ═══════════════════════════════════════════════════ */
    function togglePanel() {
        if (_panelEl) {
            closePanel();
        } else {
            openPanel();
        }
    }

    function openPanel() {
        if (_panelEl) return;
        if (!_lastReport) runChecks();

        // Overlay
        _overlayEl = document.createElement('div');
        _overlayEl.id = 'dkz-ah-overlay';
        _overlayEl.addEventListener('click', closePanel);
        document.body.appendChild(_overlayEl);

        // Panel
        _panelEl = document.createElement('div');
        _panelEl.id = 'dkz-ah-panel';
        renderPanel();
        document.body.appendChild(_panelEl);
    }

    function closePanel() {
        if (_panelEl) { _panelEl.remove(); _panelEl = null; }
        if (_overlayEl) { _overlayEl.remove(); _overlayEl = null; }
    }

    function renderPanel() {
        if (!_panelEl || !_lastReport) return;

        var r = _lastReport;
        var scoreColor;
        if (r.score >= 80) { scoreColor = '#00ff88'; }
        else if (r.score >= 50) { scoreColor = '#ffb800'; }
        else { scoreColor = '#ff3b5c'; }

        var html = [];

        /* Header */
        html.push('<div class="dkz-ah-header">');
        html.push('  <h3 class="dkz-ah-title">&#x1F3E5; AutoHealth Report</h3>');
        html.push('  <button class="dkz-ah-close" id="dkz-ah-close-btn" title="Schliessen">&times;</button>');
        html.push('</div>');

        /* Score */
        html.push('<div class="dkz-ah-score-label">');
        html.push('  <span class="dkz-ah-score-num" style="color:' + esc(scoreColor) + '">' + esc(String(r.score)) + '</span>');
        html.push('  <span class="dkz-ah-score-text">' + esc(String(r.passed)) + '/' + esc(String(r.total)) + ' Checks bestanden</span>');
        html.push('</div>');

        html.push('<div class="dkz-ah-score-bar">');
        html.push('  <div class="dkz-ah-score-fill" style="width:' + r.score + '%;background:' + esc(scoreColor) + '"></div>');
        html.push('</div>');

        /* Stats Grid */
        html.push('<div class="dkz-ah-stats">');
        html.push('  <div class="dkz-ah-stat">');
        html.push('    <div class="dkz-ah-stat-num" style="color:#00ff88">' + esc(String(r.passed)) + '</div>');
        html.push('    <div class="dkz-ah-stat-label">Bestanden</div>');
        html.push('  </div>');
        html.push('  <div class="dkz-ah-stat">');
        html.push('    <div class="dkz-ah-stat-num" style="color:#ffb800">' + esc(String(r.warnings)) + '</div>');
        html.push('    <div class="dkz-ah-stat-label">Warnungen</div>');
        html.push('  </div>');
        html.push('  <div class="dkz-ah-stat">');
        html.push('    <div class="dkz-ah-stat-num" style="color:#ff3b5c">' + esc(String(r.failed)) + '</div>');
        html.push('    <div class="dkz-ah-stat-label">Fehler</div>');
        html.push('  </div>');
        html.push('</div>');

        /* Group checks by category */
        var categories = {};
        var categoryOrder = ['security', 'design', 'scripts', 'runtime', 'performance', 'system'];

        for (var i = 0; i < r.results.length; i++) {
            var check = r.results[i];
            var cat = check.category || 'other';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(check);
        }

        var categoryLabels = {
            security: 'Sicherheit',
            design: 'Design System',
            scripts: 'Shared Scripts',
            runtime: 'Laufzeit',
            performance: 'Performance',
            system: 'System'
        };

        for (var ci = 0; ci < categoryOrder.length; ci++) {
            var catKey = categoryOrder[ci];
            var items = categories[catKey];
            if (!items || items.length === 0) continue;

            html.push('<div class="dkz-ah-section">' + esc(categoryLabels[catKey] || catKey) + '</div>');

            for (var j = 0; j < items.length; j++) {
                var item = items[j];
                var dotClass = item.ok ? 'pass' : (item.critical ? 'fail' : 'warn');

                html.push('<div class="dkz-ah-check">');
                html.push('  <span class="dkz-ah-dot ' + dotClass + '"></span>');
                html.push('  <span class="dkz-ah-check-name">' + esc(item.name) + '</span>');
                if (item.detail) {
                    html.push('  <span class="dkz-ah-check-detail">' + esc(item.detail) + '</span>');
                }
                html.push('</div>');

                if (!item.ok && item.fix) {
                    html.push('<div class="dkz-ah-fix">&#x1F527; ' + esc(item.fix) + '</div>');
                }
            }
        }

        /* Timestamp */
        html.push('<div class="dkz-ah-timestamp">');
        html.push('  Letzte Pruefung: ' + esc(r.timestampLocal) + ' &middot; Intervall: 60s');
        html.push('</div>');

        _panelEl.innerHTML = html.join('\n');

        /* Attach close handler */
        var closeBtn = document.getElementById('dkz-ah-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closePanel);
        }
    }

    /* ═══════════════════════════════════════════════════
     * Timer Start / Stop
     * ═══════════════════════════════════════════════════ */
    function startAutoCheck() {
        if (_timer) return;
        runChecks();
        _timer = setInterval(runChecks, CHECK_INTERVAL_MS);
    }

    function stopAutoCheck() {
        if (_timer) {
            clearInterval(_timer);
            _timer = null;
        }
    }

    /* ═══════════════════════════════════════════════════
     * Init
     * ═══════════════════════════════════════════════════ */
    function init() {
        injectStyles();
        createBadge();
        startAutoCheck();
    }

    /* ═══════════════════════════════════════════════════
     * Public API
     * ═══════════════════════════════════════════════════ */
    window.DkzAutoHealth = {
        /** Manuell alle Checks ausfuehren */
        runChecks: runChecks,

        /** Letzten Report abrufen */
        getReport: function () { return _lastReport ? JSON.parse(JSON.stringify(_lastReport)) : null; },

        /** Panel oeffnen/schliessen */
        togglePanel: togglePanel,

        /** Timer starten */
        start: startAutoCheck,

        /** Timer stoppen */
        stop: stopAutoCheck,

        /** Check-Intervall aendern (ms) */
        setInterval: function (ms) {
            CHECK_INTERVAL_MS = ms > 5000 ? ms : 5000;
            if (_timer) {
                stopAutoCheck();
                startAutoCheck();
            }
        },

        /** Eigenen Check registrieren */
        addCheck: function (opts) {
            if (!opts || !opts.id || typeof opts.fn !== 'function') return;
            CHECKS.push({
                id: opts.id,
                name: opts.name || opts.id,
                category: opts.category || 'custom',
                critical: !!opts.critical,
                fn: opts.fn,
                detail: opts.detail || null,
                fix: opts.fix || ''
            });
        },

        /** Version */
        version: 'v0.01.1_01'
    };

    /* ═══════════════════════════════════════════════════
     * Auto-Init
     * ═══════════════════════════════════════════════════ */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
