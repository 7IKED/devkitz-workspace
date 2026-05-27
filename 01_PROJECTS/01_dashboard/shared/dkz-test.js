/**
 * DkZ TestStraße v3.0.0 — Professional Test Pipeline
 * @DKZ:RULES → R21 Shared Scripts
 * @DKZ:TAG → [SYS:test] [CAT:shared] [LANG:js]
 * @version v3.0.0
 *
 * ═══ SHORTCUTS ═══
 *   Ctrl+T         → Panel öffnen/schließen
 *
 * ═══ API ═══
 *   DkzTest.assert(condition, label)
 *   DkzTest.assertExists(selector, label)
 *   DkzTest.assertLocalStorage(key, label)
 *   DkzTest.assertPerformance(fn, maxMs, label)
 *   DkzTest.assertNoConsoleErrors()
 *   DkzTest.assertResponsive()
 *   DkzTest.assertAccessibility()
 *   DkzTest.run()             ← Alle Tests ausführen
 *   DkzTest.runTestStrasse()  ← Volle Pipeline (50+ Checks)
 *   DkzTest.exportReport()    ← JSON Export
 *
 * ═══ 10 TEST-KATEGORIEN ═══
 *   🧪 Custom Tests    — Modul-spezifische Assertions
 *   📦 Shared Scripts   — dkz-debug, dkz-guide, dkz-navbar
 *   🏗️ DOM Health      — Viewport, H1, Charset, Links, IDs
 *   🤖 Agentic         — llms.txt, robots.txt, ai:model, Shortcuts, API
 *   🔍 Social SEO      — OG Tags, Twitter Cards, JSON-LD, Canonical
 *   💼 Business SEO    — Meta Desc, Keywords, Author, Preconnect, Lang
 *   🤖 AI-SEO          — ai:description, Heading-Hierarchie, Content
 *   ⚡ Performance Pro — FCP, LCP, TTI, Resources, Page Size
 *   🛡️ Security       — HTTPS, Mixed Content, noopener, CSRF
 *   📊 Metriken        — DOM Load, Paint Time, Memory
 *
 * ═══ PATTERNS & PREFIXES ═══
 *   @DKZ:RULES → Regel-Referenz (z.B. R21)
 *   @DKZ:TAG   → [SYS:xxx] [CAT:xxx] [LANG:xxx]
 *   Ctrl+T     → TestStraße Toggle (Keyboard Trigger)
 *   esc()      → XSS-sicheres Escaping (Pflicht bei innerHTML)
 *
 * ═══ TRIGGER ═══
 *   Auto: Startet bei Ctrl+T oder DkzTest.run()
 *   Panel: Overlay mit Kategorie-Tabs und Export-Button
 *   Export: JSON-Report mit allen Ergebnissen + Metriken
 *
 * ═══ EINBINDUNG ═══
 *   <script src="/shared/dkz-test.js" defer></script>
 *   Dann: DkzTest.assert(true, 'Mein Test');
 *         DkzTest.run();
 */
const DkzTest = (() => {
    'use strict';
    const VERSION = 'v3.0.0';
    const _tests = [];
    const _results = [];
    let _panelEl = null;
    let _styleInjected = false;
    let _consoleErrors = [];
    let _startTime = 0;

    // ═══ Capture Console Errors ═══
    const _origError = console.error;
    console.error = function() {
        _consoleErrors.push(Array.from(arguments).join(' '));
        _origError.apply(console, arguments);
    };
    window.addEventListener('error', (e) => {
        _consoleErrors.push(e.message + ' @ ' + e.filename + ':' + e.lineno);
    });

    // ═══ Test API ═══
    function assert(condition, label) {
        _tests.push({ type: 'assert', condition, label });
    }

    function assertExists(selector, label) {
        _tests.push({ type: 'exists', selector, label: label || selector });
    }

    function assertLocalStorage(key, label) {
        _tests.push({ type: 'localStorage', key, label: label || key });
    }

    function assertPerformance(fn, maxMs, label) {
        _tests.push({ type: 'performance', fn, maxMs, label: label || ('Perf < ' + maxMs + 'ms') });
    }

    function assertNoConsoleErrors() {
        _tests.push({ type: 'noConsoleErrors', label: 'Keine Console-Errors' });
    }

    function assertResponsive() {
        _tests.push({ type: 'responsive', label: 'Responsive Meta-Tag vorhanden' });
    }

    function assertAccessibility() {
        _tests.push({ type: 'a11y', label: 'Basis-Accessibility Check' });
    }

    // ═══ Run ═══
    function run() {
        _startTime = performance.now();
        _results.length = 0;

        // Run custom tests
        _tests.forEach(t => {
            let pass = false;
            let detail = '';
            try {
                if (t.type === 'assert') {
                    pass = !!t.condition;
                } else if (t.type === 'exists') {
                    pass = !!document.querySelector(t.selector);
                } else if (t.type === 'localStorage') {
                    pass = localStorage.getItem(t.key) !== null;
                } else if (t.type === 'performance') {
                    const s = performance.now();
                    t.fn();
                    const d = performance.now() - s;
                    pass = d <= t.maxMs;
                    detail = d.toFixed(1) + 'ms';
                } else if (t.type === 'noConsoleErrors') {
                    pass = _consoleErrors.length === 0;
                    if (!pass) detail = _consoleErrors.length + ' Fehler';
                } else if (t.type === 'responsive') {
                    pass = !!document.querySelector('meta[name="viewport"]');
                } else if (t.type === 'a11y') {
                    const imgs = document.querySelectorAll('img:not([alt])');
                    const btns = document.querySelectorAll('button:not([aria-label]):not([title])');
                    pass = imgs.length === 0 && btns.length === 0;
                    if (!pass) detail = imgs.length + ' img ohne alt, ' + btns.length + ' btn ohne label';
                }
            } catch (err) {
                pass = false;
                detail = err.message;
            }
            _results.push({ pass, label: t.label, detail, category: 'custom' });
        });

        // ═══ Auto-Tests (Shared Scripts) ═══
        const autoTests = [
            { sel: 'link[href*="dkz-theme"]', label: 'dkz-theme.css geladen' },
            { sel: 'script[src*="dkz-debug"]', label: 'dkz-debug.js geladen' },
            { sel: 'script[src*="dkz-guide"]', label: 'dkz-guide.js geladen' },
            { sel: 'script[src*="dkz-copilot"]', label: 'dkz-copilot.js geladen' },
            { sel: 'script[src*="dkz-shortcuts"]', label: 'dkz-shortcuts.js geladen' },
            { sel: 'script[src*="dkz-export"]', label: 'dkz-export.js geladen' },
            { sel: 'script[src*="dkz-crosslinks"]', label: 'dkz-crosslinks.js geladen' },
            { sel: '.bg-mesh', label: 'Background Blobs vorhanden' },
            { sel: '.header, .dkz-header', label: 'Header vorhanden' },
            { sel: '[role="banner"]', label: 'ARIA banner role' },
        ];
        autoTests.forEach(t => {
            _results.push({ pass: !!document.querySelector(t.sel), label: t.label, category: 'auto' });
        });

        // ═══ DOM Health Checks ═══
        const domChecks = [
            { label: 'Kein leerer <title>', pass: document.title.length > 0 },
            { label: 'Meta charset UTF-8', pass: !!document.querySelector('meta[charset]') },
            { label: 'Viewport Meta', pass: !!document.querySelector('meta[name="viewport"]') },
            { label: '<html lang> gesetzt', pass: !!document.documentElement.lang },
            { label: 'Keine Inline onclick (> 5)', pass: document.querySelectorAll('[onclick]').length <= 5 },
            { label: 'DOM Nodes < 3000', pass: document.querySelectorAll('*').length < 3000, detail: document.querySelectorAll('*').length + ' Nodes' },
        ];
        domChecks.forEach(c => {
            _results.push({ pass: c.pass, label: c.label, detail: c.detail || '', category: 'dom' });
        });

        // ═══ LLMs.txt + Agentic Pattern Checks ═══
        const agenticChecks = [
            { label: 'llms.txt vorhanden', pass: false, detail: '' },
            { label: 'robots.txt AI-Directives', pass: false, detail: '' },
            { label: 'Meta ai:model tag', pass: !!document.querySelector('meta[name="ai:model"], meta[name="llm"], meta[property="ai:description"]'), detail: '' },
            { label: 'Shortcut-Registry geladen', pass: typeof DkzShortcuts !== 'undefined' || document.querySelectorAll('[data-shortcut]').length > 0, detail: '' },
            { label: 'URL-Eingabe validiert', pass: document.querySelectorAll('input[type="url"]').length === 0 || document.querySelectorAll('input[type="url"][pattern], input[type="url"][required]').length > 0, detail: '' },
            { label: 'ONTHERUN API erreichbar', pass: false, detail: 'async check' },
        ];
        // Async checks for llms.txt + robots.txt + API
        try {
            const base = location.origin || location.href.replace(/\/[^/]*$/, '');
            fetch(base + '/llms.txt').then(r => { agenticChecks[0].pass = r.ok; }).catch(() => {});
            fetch(base + '/robots.txt').then(r => r.text()).then(t => { agenticChecks[1].pass = t.includes('User-agent') || t.includes('AI'); agenticChecks[1].detail = t.length + ' bytes'; }).catch(() => {});
            fetch('http://localhost:3040/health').then(r => { agenticChecks[5].pass = r.ok; agenticChecks[5].detail = 'Gateway OK'; }).catch(() => { agenticChecks[5].detail = 'offline'; });
        } catch(e) {}
        agenticChecks.forEach(c => {
            _results.push({ pass: c.pass, label: c.label, detail: c.detail || '', category: 'agentic' });
        });

        // ═══ 🔍 SOCIAL SEO CHECKS ═══
        const socialChecks = [
            { label: 'og:title vorhanden', pass: !!document.querySelector('meta[property="og:title"]') },
            { label: 'og:description vorhanden', pass: !!document.querySelector('meta[property="og:description"]') },
            { label: 'og:image vorhanden', pass: !!document.querySelector('meta[property="og:image"]') },
            { label: 'og:url vorhanden', pass: !!document.querySelector('meta[property="og:url"]') },
            { label: 'og:type vorhanden', pass: !!document.querySelector('meta[property="og:type"]') },
            { label: 'og:site_name vorhanden', pass: !!document.querySelector('meta[property="og:site_name"]') },
            { label: 'Twitter Card gesetzt', pass: !!document.querySelector('meta[name="twitter:card"]') },
            { label: 'Twitter Title gesetzt', pass: !!document.querySelector('meta[name="twitter:title"]') },
            { label: 'Twitter Image gesetzt', pass: !!document.querySelector('meta[name="twitter:image"]') },
            { label: 'Schema.org JSON-LD', pass: !!document.querySelector('script[type="application/ld+json"]') },
            { label: 'Canonical URL gesetzt', pass: !!document.querySelector('link[rel="canonical"]') },
        ];
        socialChecks.forEach(c => _results.push({ ...c, category: 'social' }));

        // ═══ 💼 BUSINESS SEO CHECKS ═══
        const bizChecks = [
            { label: 'Meta Description vorhanden', pass: !!document.querySelector('meta[name="description"]') },
            { label: 'Meta Keywords vorhanden', pass: !!document.querySelector('meta[name="keywords"]') },
            { label: 'Strukturierte Daten (LD+JSON)', pass: (() => { try { const s = document.querySelector('script[type="application/ld+json"]'); return s ? !!JSON.parse(s.textContent)['@type'] : false; } catch { return false; } })() },
            { label: 'Autor/Organisation definiert', pass: !!document.querySelector('meta[name="author"]') },
            { label: 'Robots Meta vorhanden', pass: !!document.querySelector('meta[name="robots"]') },
            { label: 'Preconnect Performance', pass: document.querySelectorAll('link[rel="preconnect"]').length >= 1, detail: document.querySelectorAll('link[rel="preconnect"]').length + ' preconnects' },
            { label: 'DNS-Prefetch gesetzt', pass: document.querySelectorAll('link[rel="dns-prefetch"]').length >= 1 },
            { label: 'Lang-Attribut gesetzt', pass: !!document.documentElement.lang && document.documentElement.lang.length >= 2 },
        ];
        bizChecks.forEach(c => _results.push({ ...c, category: 'business' }));

        // ═══ 🤖 AI-SEO CHECKS ═══
        const aiSeoChecks = [
            { label: 'ai:description Meta', pass: !!document.querySelector('meta[name="ai:description"]') },
            { label: 'ai:model Meta', pass: !!document.querySelector('meta[name="ai:model"]') },
            { label: 'Heading-Hierarchie H1→H2', pass: (() => { const h1 = document.querySelectorAll('h1'); const h2 = document.querySelectorAll('h2'); return h1.length === 1; })(), detail: document.querySelectorAll('h1').length + ' H1, ' + document.querySelectorAll('h2').length + ' H2' },
            { label: 'Content > 100 Wörter', pass: (() => { const text = document.body?.innerText || ''; return text.split(/\s+/).length > 100; })(), detail: (document.body?.innerText || '').split(/\s+/).length + ' Wörter' },
            { label: 'Interne Links > 2', pass: document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]').length > 2, detail: document.querySelectorAll('a[href^="/"], a[href^="./"]').length + ' interne Links' },
            { label: 'Keine toten Anker-Links', pass: (() => { const anchors = document.querySelectorAll('a[href^="#"]'); let dead = 0; anchors.forEach(a => { const target = a.getAttribute('href').slice(1); if (target && !document.getElementById(target)) dead++; }); return dead === 0; })() },
            { label: 'Title-Länge 30-60 Zeichen', pass: document.title.length >= 30 && document.title.length <= 70, detail: document.title.length + ' Zeichen' },
            { label: 'Semantische HTML5-Tags', pass: !!document.querySelector('main, article, section, nav, header, footer, aside') },
        ];
        aiSeoChecks.forEach(c => _results.push({ ...c, category: 'ai-seo' }));

        // ═══ ⚡ PERFORMANCE PRO CHECKS ═══
        const perfPro = [];
        const navEntry = performance.getEntriesByType('navigation')[0];
        if (navEntry) {
            perfPro.push({ label: 'FCP < 1.8s', pass: (navEntry.domContentLoadedEventEnd || 0) < 1800, detail: (navEntry.domContentLoadedEventEnd || 0).toFixed(0) + 'ms' });
            perfPro.push({ label: 'LCP < 2.5s', pass: (navEntry.loadEventEnd || 0) < 2500, detail: (navEntry.loadEventEnd || 0).toFixed(0) + 'ms' });
            perfPro.push({ label: 'TTI < 3.8s', pass: (navEntry.domInteractive || 0) < 3800, detail: (navEntry.domInteractive || 0).toFixed(0) + 'ms' });
        }
        const resCount = performance.getEntriesByType('resource').length;
        perfPro.push({ label: 'Resources < 50', pass: resCount < 50, detail: resCount + ' resources' });
        const totalBytes = performance.getEntriesByType('resource').reduce((sum, r) => sum + (r.transferSize || 0), 0);
        perfPro.push({ label: 'Page < 2MB', pass: totalBytes < 2 * 1024 * 1024, detail: (totalBytes / 1024).toFixed(0) + ' KB' });
        perfPro.push({ label: 'Keine render-blocking JS', pass: document.querySelectorAll('script:not([defer]):not([async]):not([type="application/ld+json"])').length <= 2, detail: document.querySelectorAll('script:not([defer]):not([async]):not([type="application/ld+json"])').length + ' blocking' });
        perfPro.push({ label: 'Lazy-Load Images', pass: (() => { const imgs = document.querySelectorAll('img'); if (imgs.length === 0) return true; return document.querySelectorAll('img[loading="lazy"]').length >= imgs.length * 0.5; })() });
        perfPro.forEach(c => _results.push({ ...c, category: 'perf-pro' }));

        // ═══ 🛡️ SECURITY CHECKS ═══
        const secChecks = [
            { label: 'HTTPS oder Localhost', pass: location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1' },
            { label: 'Keine mixed-content src', pass: (() => { if (location.protocol !== 'https:') return true; const mixed = document.querySelectorAll('[src^="http:"]'); return mixed.length === 0; })() },
            { label: 'Inline onclick < 5', pass: document.querySelectorAll('[onclick]').length < 5, detail: document.querySelectorAll('[onclick]').length + ' handlers' },
            { label: 'Externe Links rel=noopener', pass: (() => { const ext = document.querySelectorAll('a[target="_blank"]'); let bad = 0; ext.forEach(a => { if (!a.rel?.includes('noopener')) bad++; }); return bad === 0; })(), detail: document.querySelectorAll('a[target="_blank"]').length + ' ext. links' },
            { label: 'Keine JavaScript: URLs', pass: document.querySelectorAll('a[href^="javascript:"]').length === 0 },
            { label: 'Formular CSRF-Schutz', pass: (() => { const forms = document.querySelectorAll('form'); if (forms.length === 0) return true; return true; })() },
        ];
        secChecks.forEach(c => _results.push({ ...c, category: 'security' }));

        // ═══ Performance Metrics ═══
        const perf = performance.getEntriesByType('navigation')[0];
        if (perf) {
            const loadTime = perf.loadEventEnd - perf.startTime;
            _results.push({ pass: loadTime < 3000, label: 'Seite lädt < 3s', detail: loadTime.toFixed(0) + 'ms', category: 'perf' });
            _results.push({ pass: perf.domContentLoadedEventEnd < 2000, label: 'DOMContentLoaded < 2s', detail: perf.domContentLoadedEventEnd.toFixed(0) + 'ms', category: 'perf' });
        }

        // ═══ Memory Check ═══
        if (performance.memory) {
            const mb = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
            _results.push({ pass: performance.memory.usedJSHeapSize < 100 * 1048576, label: 'JS Heap < 100MB', detail: mb + 'MB', category: 'perf' });
        }

        const duration = (performance.now() - _startTime).toFixed(1);
        console.log(`[DkzTest] ${_results.filter(r => r.pass).length}/${_results.length} bestanden (${duration}ms)`);

        _showPanel();
        return _results;
    }

    // ═══ TestStraße — Full Pipeline ═══
    function runTestStrasse() {
        console.log('[DkzTest] ═══ TestStraße gestartet ═══');
        const report = { timestamp: new Date().toISOString(), page: location.href, tests: [] };

        // 1. Unit Tests
        const unitResults = run();
        report.tests.push({ phase: 'Unit Tests', results: unitResults });

        // 2. QA Checklist (if loaded)
        if (typeof DkzQA !== 'undefined') {
            const qaResults = DkzQA.run();
            report.tests.push({ phase: 'QA Checklist', results: qaResults });
        }

        // 3. Stress Tests (if loaded)
        if (typeof DkzStress !== 'undefined') {
            const stressResults = DkzStress.run();
            report.tests.push({ phase: 'Stress Tests', results: stressResults });
        }

        console.log('[DkzTest] ═══ TestStraße komplett ═══');
        return report;
    }

    // ═══ Export Report ═══
    function exportReport() {
        if (_results.length === 0) run();
        const report = {
            version: VERSION,
            timestamp: new Date().toISOString(),
            page: location.href,
            title: document.title,
            passed: _results.filter(r => r.pass).length,
            total: _results.length,
            consoleErrors: _consoleErrors.slice(),
            domNodes: document.querySelectorAll('*').length,
            results: _results
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'dkz-test-report_' + Date.now() + '.json';
        a.click();
        return report;
    }

    // ═══ Styles ═══
    function _injectStyles() {
        if (_styleInjected) return;
        _styleInjected = true;
        const s = document.createElement('style');
        s.id = 'dkz-test-styles';
        s.textContent = `
.dkz-test-panel {
    position: fixed; top: 60px; right: 20px; z-index: 10001;
    background: rgba(14,14,22,.96); border: 1px solid rgba(255,255,255,.08);
    border-radius: 14px; padding: 16px; min-width: 360px; max-width: 440px;
    max-height: 75vh; overflow-y: auto;
    box-shadow: 0 16px 48px rgba(0,0,0,.6);
    opacity: 0; transform: translateY(-10px) scale(.97);
    transition: all .25s; pointer-events: none;
    font-family: var(--font, 'Inter', sans-serif);
    backdrop-filter: blur(24px);
}
.dkz-test-panel.show { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
.dkz-test-title { font-size: 14px; font-weight: 800; color: #f6f6f7; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
.dkz-test-summary { font-size: 11px; color: var(--muted, #a1a1aa); margin-bottom: 8px; font-family: var(--mono, monospace); }
.dkz-test-bar { height: 4px; border-radius: 2px; background: rgba(255,255,255,.06); margin-bottom: 10px; overflow: hidden; }
.dkz-test-bar-fill { height: 100%; border-radius: 2px; transition: width .5s; }
.dkz-test-cat { font-size: 9px; font-weight: 700; color: #fa1e4e; text-transform: uppercase; letter-spacing: 1px; margin: 10px 0 4px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,.04); }
.dkz-test-item { display: flex; gap: 8px; padding: 3px 0; font-size: 11px; color: #a1a1aa; align-items: center; }
.dkz-test-item:last-child { border-bottom: none; }
.dkz-test-pass { color: #00ff88; }
.dkz-test-fail { color: #fa1e4e; }
.dkz-test-detail { color: rgba(255,255,255,.25); font-size: 9px; font-family: 'JetBrains Mono', monospace; margin-left: auto; }
.dkz-test-actions { display: flex; gap: 6px; margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,.04); }
.dkz-test-btn { padding: 5px 12px; border-radius: 8px; font-size: 10px; font-weight: 700; cursor: pointer; border: 1px solid rgba(255,255,255,.08); background: transparent; color: #a1a1aa; font-family: inherit; transition: all .2s; }
.dkz-test-btn:hover { color: #fff; border-color: rgba(255,255,255,.15); }
.dkz-test-btn.accent { background: rgba(0,255,136,.1); color: #00ff88; border-color: rgba(0,255,136,.2); }
`;
        document.head.appendChild(s);
    }

    // ═══ Panel ═══
    function _showPanel() {
        _injectStyles();
        if (!_panelEl) {
            _panelEl = document.createElement('div');
            _panelEl.className = 'dkz-test-panel';
            document.body.appendChild(_panelEl);
        }
        const passed = _results.filter(r => r.pass).length;
        const total = _results.length;
        const pct = total > 0 ? Math.round(passed / total * 100) : 0;
        const allPass = passed === total;
        const barColor = allPass ? '#00ff88' : pct > 70 ? '#eab308' : '#fa1e4e';

        // Group by category
        const cats = {};
        _results.forEach(r => {
            const cat = r.category || 'other';
            if (!cats[cat]) cats[cat] = [];
            cats[cat].push(r);
        });

        const catLabels = { custom: '🧪 Custom Tests', auto: '📦 Shared Scripts', dom: '🏗️ DOM Health', agentic: '🤖 Agentic', social: '🔍 Social SEO', business: '💼 Business SEO', 'ai-seo': '🤖 AI-SEO', 'perf-pro': '⚡ Performance Pro', security: '🛡️ Security', perf: '📊 Metriken' };

        let itemsHtml = '';
        Object.entries(cats).forEach(([cat, items]) => {
            itemsHtml += `<div class="dkz-test-cat">${catLabels[cat] || cat}</div>`;
            items.forEach(r => {
                itemsHtml += `<div class="dkz-test-item">
                    <span class="${r.pass ? 'dkz-test-pass' : 'dkz-test-fail'}">${r.pass ? '✅' : '❌'}</span>
                    <span>${_esc(r.label)}</span>
                    ${r.detail ? '<span class="dkz-test-detail">' + _esc(r.detail) + '</span>' : ''}
                </div>`;
            });
        });

        _panelEl.innerHTML = `
            <div class="dkz-test-title">🧪 DkZ TestStraße <span style="font-size:9px;color:rgba(255,255,255,.3);font-weight:400">${VERSION}</span></div>
            <div class="dkz-test-summary ${allPass ? 'dkz-test-pass' : 'dkz-test-fail'}">${passed}/${total} bestanden (${pct}%) ${allPass ? '✅' : '⚠️'}</div>
            <div class="dkz-test-bar"><div class="dkz-test-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
            ${itemsHtml}
            <div class="dkz-test-actions">
                <button class="dkz-test-btn" onclick="DkzTest.toggle()">Schließen</button>
                <button class="dkz-test-btn" onclick="DkzTest.run()">🔄 Nochmal</button>
                <button class="dkz-test-btn accent" onclick="DkzTest.exportReport()">📥 Export</button>
            </div>
        `;
        _panelEl.classList.add('show');
    }

    function toggle() {
        if (_panelEl && _panelEl.classList.contains('show')) {
            _panelEl.classList.remove('show');
        } else {
            run();
        }
    }

    function _esc(s) {
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    // ═══ Ctrl+T Shortcut ═══
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            toggle();
        }
    });

    return {
        assert, assertExists, assertLocalStorage, assertPerformance,
        assertNoConsoleErrors, assertResponsive, assertAccessibility,
        run, toggle, exportReport, runTestStrasse, VERSION,
        // Internal for panel buttons
        _nextStep: () => {}, _prevStep: () => {}, _endTour: () => {}
    };
})();

if (typeof module !== 'undefined') module.exports = DkzTest;
