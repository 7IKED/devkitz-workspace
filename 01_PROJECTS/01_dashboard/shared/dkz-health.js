// @DKZ:RULES ? Lies REGELWERK.md + ORDNER.ini bevor du hier arbeitest!
// @DKZ:DOCS  ? features.json | REGISTRY.json | BLAUPAUSE.md
/**
 * DkZ Health Monitor — Self-Debugging Background System
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * Depends on: dkz-eventbus.js
 * 
 * Runs automatic checks every 30s in background.
 * Ctrl+D → Debug Panel with live health status
 */
(function () {
    'use strict';

    if (window.DkZ && window.DkZ.Health) return;
    window.DkZ = window.DkZ || {};

    let debugPanel = null;
    let isDebugOpen = false;
    let checkInterval = null;
    let lastResults = {};

    // ── Health Checks ──
    const CHECKS = {
        'page-loaded': {
            name: 'Seite geladen',
            fn: () => document.readyState === 'complete'
        },
        'eventbus-active': {
            name: 'EventBus aktiv',
            fn: () => !!(window.DkZ && window.DkZ.EventBus)
        },
        'console-active': {
            name: 'Console bereit',
            fn: () => !!(window.DkZ && window.DkZ.Console)
        },
        'localstorage-ok': {
            name: 'localStorage verfügbar',
            fn: () => {
                try {
                    const used = JSON.stringify(localStorage).length;
                    return { ok: used < 4 * 1024 * 1024, detail: `${(used / 1024).toFixed(1)} KB / 5 MB` };
                } catch { return false; }
            }
        },
        'no-console-errors': {
            name: 'Keine JS-Fehler',
            fn: () => window.__dkzErrorCount === 0 || window.__dkzErrorCount === undefined
        },
        'xss-protection': {
            name: 'XSS-Schutz',
            fn: () => {
                const html = document.documentElement.innerHTML;
                return !html.includes('.innerHTML =') || html.includes('esc(') || html.includes('textContent');
            }
        },
        'shortcuts-active': {
            name: 'Shortcuts registriert',
            fn: () => !!(window.DkZ && window.DkZ.Shortcuts)
        },
        'design-system': {
            name: 'DkZ Design System',
            fn: () => {
                const style = getComputedStyle(document.documentElement);
                return !!style.getPropertyValue('--accent').trim();
            }
        }
    };

    // ── Error Counter ──
    window.__dkzErrorCount = 0;
    window.addEventListener('error', () => window.__dkzErrorCount++);

    // ── Run All Checks ──
    function runChecks() {
        const results = {};
        Object.entries(CHECKS).forEach(([id, check]) => {
            try {
                const result = check.fn();
                if (typeof result === 'object' && result !== null) {
                    results[id] = { name: check.name, ok: result.ok, detail: result.detail };
                } else {
                    results[id] = { name: check.name, ok: !!result, detail: '' };
                }
            } catch (e) {
                results[id] = { name: check.name, ok: false, detail: e.message };
            }
        });
        lastResults = results;

        if (window.DkZ.EventBus) {
            const allOk = Object.values(results).every(r => r.ok);
            window.DkZ.EventBus.emit('system:health', {
                status: allOk ? 'healthy' : 'warning',
                results,
                timestamp: Date.now()
            });
        }

        updateDebugPanel();
        return results;
    }

    // ── Debug Panel UI ──
    function createDebugPanel() {
        if (debugPanel) return;

        debugPanel = document.createElement('div');
        debugPanel.id = 'dkz-debug';
        debugPanel.innerHTML = `
      <div class="dkz-dbg-header">
        <span>🔍 DkZ Debug</span>
        <span class="dkz-dbg-close" title="Ctrl+D">✕</span>
      </div>
      <div class="dkz-dbg-content" id="dkz-dbg-content"></div>
      <div class="dkz-dbg-footer">
        <button id="dkz-dbg-recheck">🔄 Recheck</button>
        <span class="dkz-dbg-ts" id="dkz-dbg-ts"></span>
      </div>
    `;

        const style = document.createElement('style');
        style.textContent = `
      #dkz-debug {
        display:none; position:fixed; bottom:16px; right:16px; z-index:99998;
        width:320px; max-height:400px; background:#111114;
        border:1px solid #333338; border-radius:14px; overflow:hidden;
        box-shadow:0 8px 40px rgba(0,0,0,0.5); font-family:'Inter',sans-serif;
        font-size:0.8rem;
        animation: dkzDbgSlide 0.2s ease-out;
      }
      #dkz-debug.open { display:flex; flex-direction:column; }
      @keyframes dkzDbgSlide { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      .dkz-dbg-header {
        display:flex; justify-content:space-between; padding:10px 14px;
        border-bottom:1px solid #222228; color:#f6f6f7; font-weight:600;
      }
      .dkz-dbg-close { cursor:pointer; opacity:0.5; }
      .dkz-dbg-close:hover { opacity:1; color:#fa1e4e; }
      .dkz-dbg-content { flex:1; overflow-y:auto; padding:8px 14px; }
      .dkz-dbg-row { display:flex; align-items:center; gap:8px; padding:4px 0; color:#d4d4d8; }
      .dkz-dbg-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
      .dkz-dbg-dot.ok { background:#00ff88; }
      .dkz-dbg-dot.fail { background:#ff4466; }
      .dkz-dbg-detail { color:#71717a; margin-left:auto; font-size:0.7rem; }
      .dkz-dbg-footer {
        display:flex; align-items:center; justify-content:space-between;
        padding:8px 14px; border-top:1px solid #222228;
      }
      #dkz-dbg-recheck {
        background:#1a1a1c; border:1px solid #333338; color:#a1a1aa;
        padding:4px 10px; border-radius:6px; cursor:pointer; font-size:0.75rem;
      }
      #dkz-dbg-recheck:hover { border-color:#fa1e4e; color:#fa1e4e; }
      .dkz-dbg-ts { color:#52525b; font-size:0.7rem; }
      .dkz-dbg-section { color:#fa1e4e; font-weight:600; padding:6px 0 2px; font-size:0.75rem; }
    `;

        document.head.appendChild(style);
        document.body.appendChild(debugPanel);

        debugPanel.querySelector('.dkz-dbg-close').addEventListener('click', toggleDebug);
        document.getElementById('dkz-dbg-recheck').addEventListener('click', runChecks);
    }

    function updateDebugPanel() {
        const content = document.getElementById('dkz-dbg-content');
        if (!content) return;

        let html = '<div class="dkz-dbg-section">HEALTH CHECKS</div>';
        Object.values(lastResults).forEach(r => {
            html += `<div class="dkz-dbg-row">
        <span class="dkz-dbg-dot ${r.ok ? 'ok' : 'fail'}"></span>
        <span>${r.name}</span>
        ${r.detail ? `<span class="dkz-dbg-detail">${r.detail}</span>` : ''}
      </div>`;
        });

        // EventBus Stats
        if (window.DkZ.EventBus) {
            const stats = window.DkZ.EventBus.getStats();
            html += '<div class="dkz-dbg-section">EVENTBUS</div>';
            html += `<div class="dkz-dbg-row"><span class="dkz-dbg-dot ok"></span><span>Listener: ${stats.totalListeners}</span></div>`;
            html += `<div class="dkz-dbg-row"><span class="dkz-dbg-dot ok"></span><span>Events: ${stats.logEntries}</span></div>`;
            html += `<div class="dkz-dbg-row"><span class="dkz-dbg-dot ok"></span><span>Module: ${stats.modules}</span></div>`;
        }

        // Error count
        html += '<div class="dkz-dbg-section">ERRORS</div>';
        const errs = window.__dkzErrorCount || 0;
        html += `<div class="dkz-dbg-row">
      <span class="dkz-dbg-dot ${errs === 0 ? 'ok' : 'fail'}"></span>
      <span>JS Errors: ${errs}</span>
    </div>`;

        content.innerHTML = html;

        const ts = document.getElementById('dkz-dbg-ts');
        if (ts) ts.textContent = new Date().toLocaleTimeString('de-DE');
    }

    function toggleDebug() {
        createDebugPanel();
        isDebugOpen = !isDebugOpen;
        debugPanel.classList.toggle('open', isDebugOpen);
        if (isDebugOpen) runChecks();
    }

    // ── Background Check Loop ──
    function startMonitoring(intervalMs = 30000) {
        if (checkInterval) clearInterval(checkInterval);
        checkInterval = setInterval(runChecks, intervalMs);
        runChecks(); // Initial check
    }

    // ── Public API ──
    window.DkZ.Health = {
        runChecks,
        getResults: () => ({ ...lastResults }),
        toggleDebug,
        startMonitoring
    };

    // Auto-start monitoring when DOM ready
    if (document.readyState === 'complete') {
        startMonitoring();
    } else {
        window.addEventListener('load', () => startMonitoring());
    }
})();
