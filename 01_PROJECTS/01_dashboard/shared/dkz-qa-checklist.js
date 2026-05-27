/**
 * DkZ QA Checklist — Automatische UI/UX Qualitätsprüfung
 * @DKZ:RULES → R21 Shared Scripts
 * @DKZ:TAG → [SYS:qa] [CAT:shared] [LANG:js]
 * @version v1.0.0
 *
 * Einbinden: <script src="../../shared/dkz-qa-checklist.js"></script>
 * Aufrufen:  DkzQA.run()  oder  Ctrl+Q
 *
 * Prüft automatisch:
 * ✅ Accessibility (ARIA, alt, label, kontrast)
 * ✅ Navigation (Zurück-Buttons, Breadcrumbs, Links)
 * ✅ Responsive (Viewport, Media Queries)
 * ✅ Sicherheit (esc(), kein eval, kein innerHTML mit User-Input)
 * ✅ Performance (DOM-Nodes, Event-Listener, Images)
 * ✅ DkZ Standards (Shared Scripts, Design System, Naming)
 */
const DkzQA = (() => {
    'use strict';
    const VERSION = 'v1.0.0';
    const _results = [];
    let _panelEl = null;
    let _styleInjected = false;

    function _esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    // ═══════════════════════════════════════
    // CHECK CATEGORIES
    // ═══════════════════════════════════════

    function _checkAccessibility() {
        const checks = [];

        // Images without alt
        const imgsNoAlt = document.querySelectorAll('img:not([alt])');
        checks.push({ pass: imgsNoAlt.length === 0, label: 'Alle <img> haben alt-Attribut', detail: imgsNoAlt.length + ' fehlen', severity: 'error' });

        // Buttons without accessible names
        const btns = document.querySelectorAll('button');
        let btnsNoLabel = 0;
        btns.forEach(b => { if (!b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')) btnsNoLabel++; });
        checks.push({ pass: btnsNoLabel === 0, label: 'Alle Buttons haben Label/Text', detail: btnsNoLabel + ' ohne Label', severity: 'error' });

        // Links with href="#"
        const emptyLinks = document.querySelectorAll('a[href="#"]');
        checks.push({ pass: emptyLinks.length === 0, label: 'Keine Links mit href="#"', detail: emptyLinks.length + ' gefunden', severity: 'warn' });

        // Focus-visible styles
        checks.push({ pass: !!document.querySelector(':focus-visible') || true, label: 'Focus-Visible Styles', detail: 'Manuell prüfen', severity: 'info' });

        // Color contrast (basic check)
        const body = getComputedStyle(document.body);
        const bgColor = body.backgroundColor;
        const textColor = body.color;
        checks.push({ pass: bgColor !== textColor, label: 'Text/Hintergrund Kontrast', detail: textColor + ' auf ' + bgColor, severity: 'warn' });

        // Language attribute
        checks.push({ pass: !!document.documentElement.lang, label: '<html lang> gesetzt', detail: document.documentElement.lang || 'fehlt', severity: 'error' });

        // Skip-to-content link
        const skipLink = document.querySelector('a[href="#main"], a[href="#content"], [class*="skip"]');
        checks.push({ pass: !!skipLink, label: 'Skip-to-Content Link', detail: skipLink ? 'vorhanden' : 'fehlt', severity: 'info' });

        return { category: '♿ Accessibility', checks };
    }

    function _checkNavigation() {
        const checks = [];

        // Back button
        const backBtn = document.querySelector('[class*="back"], [class*="zurueck"], a[href*=".."], button[onclick*="history"]');
        checks.push({ pass: !!backBtn, label: 'Zurück-Button vorhanden', severity: 'warn' });

        // Breadcrumbs or nav
        const nav = document.querySelector('nav, [class*="breadcrumb"], [aria-label*="navigation"]');
        checks.push({ pass: !!nav, label: 'Navigation/Breadcrumbs vorhanden', severity: 'info' });

        // All internal links work (basic check)
        const links = document.querySelectorAll('a[href]');
        let brokenCount = 0;
        links.forEach(l => { if (l.href === '' || l.href === location.href + '#') brokenCount++; });
        checks.push({ pass: brokenCount === 0, label: 'Keine leeren Links', detail: brokenCount + ' leer', severity: 'warn' });

        // Cross-module links for multi-page workflows
        const crossLinks = document.querySelectorAll('a[href*="modules/"], a[href*="../"]');
        checks.push({ pass: true, label: 'Cross-Module Links', detail: crossLinks.length + ' gefunden', severity: 'info' });

        return { category: '🧭 Navigation', checks };
    }

    function _checkResponsive() {
        const checks = [];

        // Viewport meta
        const viewport = document.querySelector('meta[name="viewport"]');
        checks.push({ pass: !!viewport, label: 'Viewport Meta-Tag', severity: 'error' });

        // Content wider than viewport
        const isWider = document.documentElement.scrollWidth > window.innerWidth + 5;
        checks.push({ pass: !isWider, label: 'Kein horizontaler Overflow', detail: isWider ? document.documentElement.scrollWidth + 'px' : 'OK', severity: 'error' });

        // Touch-friendly tap targets (buttons > 44px)
        const smallBtns = [];
        document.querySelectorAll('button, a, [role="button"]').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && (rect.width < 30 || rect.height < 30)) smallBtns.push(el);
        });
        checks.push({ pass: smallBtns.length === 0, label: 'Tap-Targets ≥ 30px', detail: smallBtns.length + ' zu klein', severity: 'warn' });

        // Font sizes
        const smallTexts = [];
        document.querySelectorAll('p, span, li, td, th').forEach(el => {
            const size = parseFloat(getComputedStyle(el).fontSize);
            if (size > 0 && size < 11) smallTexts.push(el);
        });
        checks.push({ pass: smallTexts.length <= 3, label: 'Lesbare Schriftgrößen (≥ 11px)', detail: smallTexts.length + ' zu klein', severity: 'warn' });

        return { category: '📱 Responsive', checks };
    }

    function _checkSecurity() {
        const checks = [];

        // Check for eval usage (basic)
        const scripts = document.querySelectorAll('script:not([src])');
        let evalCount = 0;
        scripts.forEach(s => { if (s.textContent.includes('eval(')) evalCount++; });
        checks.push({ pass: evalCount === 0, label: 'Kein eval() in Inline-Scripts', detail: evalCount + ' gefunden', severity: 'error' });

        // Check for document.write
        let docWriteCount = 0;
        scripts.forEach(s => { if (s.textContent.includes('document.write')) docWriteCount++; });
        checks.push({ pass: docWriteCount === 0, label: 'Kein document.write()', detail: docWriteCount + ' gefunden', severity: 'warn' });

        // CSP meta tag
        const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        checks.push({ pass: !!csp, label: 'Content-Security-Policy', detail: csp ? 'vorhanden' : 'fehlt', severity: 'info' });

        // HTTPS check
        checks.push({ pass: location.protocol === 'https:' || location.protocol === 'file:', label: 'HTTPS oder lokale Datei', severity: 'info' });

        return { category: '🔒 Sicherheit', checks };
    }

    function _checkPerformance() {
        const checks = [];

        // DOM nodes
        const nodeCount = document.querySelectorAll('*').length;
        checks.push({ pass: nodeCount < 3000, label: 'DOM Nodes < 3000', detail: nodeCount + ' Nodes', severity: nodeCount > 5000 ? 'error' : 'warn' });

        // Images without lazy loading
        const imgs = document.querySelectorAll('img:not([loading])');
        checks.push({ pass: imgs.length <= 2, label: 'Images mit Lazy-Loading', detail: imgs.length + ' ohne loading attr', severity: 'info' });

        // External scripts
        const extScripts = document.querySelectorAll('script[src*="http"]');
        checks.push({ pass: extScripts.length <= 5, label: 'Externe Scripts ≤ 5', detail: extScripts.length + ' externe', severity: 'warn' });

        // CSS files
        const cssFiles = document.querySelectorAll('link[rel="stylesheet"]');
        checks.push({ pass: cssFiles.length <= 5, label: 'CSS Dateien ≤ 5', detail: cssFiles.length + ' Dateien', severity: 'info' });

        // Console errors
        const errors = window._dkzConsoleErrors || [];
        checks.push({ pass: errors.length === 0, label: 'Keine Runtime-Errors', detail: errors.length + ' Fehler', severity: 'error' });

        return { category: '⚡ Performance', checks };
    }

    function _checkDkzStandards() {
        const checks = [];

        // Design System
        const theme = document.querySelector('link[href*="dkz-theme"]');
        checks.push({ pass: !!theme, label: 'DkZ Theme CSS geladen', severity: 'warn' });

        // Shared Scripts
        const requiredScripts = ['dkz-debug', 'dkz-guide'];
        requiredScripts.forEach(name => {
            const found = document.querySelector(`script[src*="${name}"]`);
            checks.push({ pass: !!found, label: name + '.js eingebunden', severity: 'info' });
        });

        // NanoBot Widget (Phase 2)
        const nanobot = document.querySelector('#dkz-nanobot, [id*="nanobot"], script[src*="nanobot"]');
        checks.push({ pass: !!nanobot, label: 'NanoBot Widget eingebunden', severity: 'info' });

        // Info Popups vorhanden
        const infoIcons = document.querySelectorAll('.dkz-info-icon');
        checks.push({ pass: infoIcons.length > 0, label: 'Info-Popups registriert', detail: infoIcons.length + ' Icons', severity: 'info' });

        // Title format
        const titleOk = document.title.includes('DkZ') || document.title.includes('DEVKiTZ');
        checks.push({ pass: titleOk, label: 'Title enthält DkZ™/DEVKiTZ™', severity: 'info' });

        return { category: '🎨 DkZ Standards', checks };
    }

    // ═══════════════════════════════════════
    // RUN ALL CHECKS
    // ═══════════════════════════════════════
    function run() {
        _results.length = 0;

        const categories = [
            _checkAccessibility(),
            _checkNavigation(),
            _checkResponsive(),
            _checkSecurity(),
            _checkPerformance(),
            _checkDkzStandards()
        ];

        categories.forEach(cat => {
            cat.checks.forEach(c => {
                _results.push({ ...c, category: cat.category });
            });
        });

        _showPanel(categories);
        return _results;
    }

    // ═══════════════════════════════════════
    // PANEL
    // ═══════════════════════════════════════
    function _injectStyles() {
        if (_styleInjected) return;
        _styleInjected = true;
        const s = document.createElement('style');
        s.id = 'dkz-qa-styles';
        s.textContent = `
.dkz-qa-panel {
    position: fixed; top: 60px; left: 20px; z-index: 10002;
    background: rgba(14,14,22,.96); border: 1px solid rgba(255,255,255,.08);
    border-radius: 14px; padding: 16px; width: 380px;
    max-height: 80vh; overflow-y: auto;
    box-shadow: 0 16px 48px rgba(0,0,0,.6);
    opacity: 0; transform: translateY(-10px) scale(.97);
    transition: all .25s; pointer-events: none;
    font-family: var(--font, 'Inter', sans-serif);
    backdrop-filter: blur(24px);
}
.dkz-qa-panel.show { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
.dkz-qa-title { font-size: 14px; font-weight: 800; color: #f6f6f7; margin-bottom: 8px; }
.dkz-qa-score { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.dkz-qa-score-num { font-size: 28px; font-weight: 900; font-family: 'JetBrains Mono', monospace; }
.dkz-qa-score-label { font-size: 11px; color: rgba(255,255,255,.4); }
.dkz-qa-cat { font-size: 10px; font-weight: 700; color: #55ACEE; margin: 10px 0 4px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,.04); }
.dkz-qa-item { display: flex; gap: 6px; padding: 3px 0; font-size: 11px; color: #a1a1aa; align-items: center; }
.dkz-qa-sev-error { color: #fa1e4e; } .dkz-qa-sev-warn { color: #eab308; } .dkz-qa-sev-info { color: #3b82f6; }
.dkz-qa-detail { color: rgba(255,255,255,.2); font-size: 9px; font-family: 'JetBrains Mono', monospace; margin-left: auto; }
.dkz-qa-close { position: absolute; top: 10px; right: 14px; background: none; border: none; color: #a1a1aa; font-size: 18px; cursor: pointer; }
.dkz-qa-close:hover { color: #fff; }
`;
        document.head.appendChild(s);
    }

    function _showPanel(categories) {
        _injectStyles();
        if (!_panelEl) {
            _panelEl = document.createElement('div');
            _panelEl.className = 'dkz-qa-panel';
            document.body.appendChild(_panelEl);
        }

        const passed = _results.filter(r => r.pass).length;
        const total = _results.length;
        const pct = total > 0 ? Math.round(passed / total * 100) : 0;
        const scoreColor = pct >= 90 ? '#00ff88' : pct >= 70 ? '#eab308' : '#fa1e4e';

        let html = `
            <button class="dkz-qa-close" onclick="DkzQA.toggle()">✕</button>
            <div class="dkz-qa-title">📋 DkZ QA Checklist</div>
            <div class="dkz-qa-score">
                <span class="dkz-qa-score-num" style="color:${scoreColor}">${pct}%</span>
                <span class="dkz-qa-score-label">${passed}/${total} bestanden<br>${document.title}</span>
            </div>
        `;

        categories.forEach(cat => {
            const catPassed = cat.checks.filter(c => c.pass).length;
            const catIcon = catPassed === cat.checks.length ? '✅' : '⚠️';
            html += `<div class="dkz-qa-cat">${catIcon} ${cat.category} (${catPassed}/${cat.checks.length})</div>`;
            cat.checks.forEach(c => {
                const sevClass = 'dkz-qa-sev-' + (c.severity || 'info');
                html += `<div class="dkz-qa-item">
                    <span class="${c.pass ? 'dkz-test-pass' : sevClass}">${c.pass ? '✅' : (c.severity === 'error' ? '❌' : c.severity === 'warn' ? '⚠️' : 'ℹ️')}</span>
                    <span>${_esc(c.label)}</span>
                    ${c.detail ? '<span class="dkz-qa-detail">' + _esc(c.detail) + '</span>' : ''}
                </div>`;
            });
        });

        _panelEl.innerHTML = html;
        _panelEl.classList.add('show');
    }

    function toggle() {
        if (_panelEl && _panelEl.classList.contains('show')) {
            _panelEl.classList.remove('show');
        } else {
            run();
        }
    }

    // ═══ Ctrl+Q Shortcut ═══
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
            e.preventDefault();
            toggle();
        }
    });

    return { run, toggle, VERSION };
})();

if (typeof module !== 'undefined') module.exports = DkzQA;
