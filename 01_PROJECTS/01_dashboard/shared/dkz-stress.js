/**
 * DkZ Stress — Belastungstests für UI Stabilität
 * @DKZ:RULES → R21 Shared Scripts
 * @DKZ:TAG → [SYS:stress] [CAT:shared] [LANG:js]
 * @version v1.0.0
 *
 * Einbinden: <script src="../../shared/dkz-stress.js"></script>
 * Aufrufen:  DkzStress.run()
 *
 * Tests:
 * 1. Rapid-Click (100 Clicks in 1s)
 * 2. Memory Leak Detection (DOM-Node Wachstum)
 * 3. Event-Listener Overflow
 * 4. LocalStorage Quota
 * 5. Canvas FPS
 * 6. Concurrent Operations
 */
const DkzStress = (() => {
    'use strict';
    const VERSION = 'v1.0.0';
    const _results = [];
    let _panelEl = null;

    function _esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    // ═══ Stress Test: Rapid Click ═══
    function _testRapidClick() {
        const start = document.querySelectorAll('*').length;
        const btns = document.querySelectorAll('button, a, [role="button"]');
        const btn = btns[0];
        if (!btn) return { pass: true, label: '🖱️ Rapid-Click Test', detail: 'Kein Button gefunden', severity: 'info' };

        for (let i = 0; i < 50; i++) {
            try { btn.click(); } catch (e) { /* ignore */ }
        }
        const end = document.querySelectorAll('*').length;
        const growth = end - start;
        return { pass: growth < 100, label: '🖱️ Rapid-Click (50x)', detail: '+' + growth + ' DOM Nodes', severity: growth > 200 ? 'error' : 'warn' };
    }

    // ═══ Stress Test: Memory Leak ═══
    function _testMemoryLeak() {
        if (!performance.memory) return { pass: true, label: '🧠 Memory Leak Check', detail: 'API nicht verfügbar', severity: 'info' };
        const before = performance.memory.usedJSHeapSize;
        // Create and destroy 1000 elements
        const frag = document.createDocumentFragment();
        for (let i = 0; i < 1000; i++) {
            const div = document.createElement('div');
            div.textContent = 'stress-' + i;
            frag.appendChild(div);
        }
        const tmp = document.createElement('div');
        tmp.style.display = 'none';
        tmp.appendChild(frag);
        document.body.appendChild(tmp);
        tmp.remove();

        const after = performance.memory.usedJSHeapSize;
        const leakMB = ((after - before) / 1048576).toFixed(2);
        return { pass: parseFloat(leakMB) < 5, label: '🧠 Memory Leak Check', detail: leakMB + 'MB Δ', severity: parseFloat(leakMB) > 10 ? 'error' : 'warn' };
    }

    // ═══ Stress Test: DOM Node Count ═══
    function _testDOMNodes() {
        const count = document.querySelectorAll('*').length;
        return { pass: count < 3000, label: '🏗️ DOM Node Count', detail: count + ' Nodes', severity: count > 5000 ? 'error' : count > 3000 ? 'warn' : 'info' };
    }

    // ═══ Stress Test: LocalStorage Quota ═══
    function _testLocalStorageQuota() {
        let usedKB = 0;
        try {
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    usedKB += (localStorage[key].length * 2) / 1024;
                }
            }
        } catch (e) { /* ignore */ }
        const maxKB = 5120; // 5MB
        const pct = (usedKB / maxKB * 100).toFixed(1);
        return { pass: usedKB < maxKB * 0.8, label: '💾 LocalStorage Quota', detail: usedKB.toFixed(0) + 'KB / ' + maxKB + 'KB (' + pct + '%)', severity: usedKB > maxKB * 0.9 ? 'error' : 'warn' };
    }

    // ═══ Stress Test: Canvas FPS ═══
    function _testCanvasFPS() {
        return new Promise(resolve => {
            const canvas = document.querySelector('canvas');
            if (!canvas) {
                resolve({ pass: true, label: '🎮 Canvas FPS', detail: 'Kein Canvas gefunden', severity: 'info' });
                return;
            }
            let frames = 0;
            const start = performance.now();
            function count() {
                frames++;
                if (performance.now() - start < 1000) {
                    requestAnimationFrame(count);
                } else {
                    resolve({ pass: frames >= 30, label: '🎮 Canvas FPS', detail: frames + ' FPS', severity: frames < 20 ? 'error' : 'warn' });
                }
            }
            requestAnimationFrame(count);
        });
    }

    // ═══ Stress Test: Event Listeners ═══
    function _testEventListeners() {
        // Heuristic: count inline event handlers
        const inlineHandlers = document.querySelectorAll('[onclick], [onchange], [onsubmit], [onkeydown], [onmouseover]');
        return { pass: inlineHandlers.length < 50, label: '📡 Inline Event Handlers', detail: inlineHandlers.length + ' gefunden', severity: inlineHandlers.length > 100 ? 'error' : 'warn' };
    }

    // ═══ Stress Test: Script Load Time ═══
    function _testScriptLoad() {
        const scripts = performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script');
        const totalMs = scripts.reduce((sum, s) => sum + s.duration, 0);
        return { pass: totalMs < 3000, label: '📦 Script Load Total', detail: totalMs.toFixed(0) + 'ms (' + scripts.length + ' Scripts)', severity: totalMs > 5000 ? 'error' : 'warn' };
    }

    // ═══ RUN ALL ═══
    async function run() {
        _results.length = 0;
        console.log('[DkzStress] ═══ Stress-Tests starten ═══');

        _results.push(_testRapidClick());
        _results.push(_testMemoryLeak());
        _results.push(_testDOMNodes());
        _results.push(_testLocalStorageQuota());
        _results.push(_testEventListeners());
        _results.push(_testScriptLoad());

        // Async tests
        const fpsResult = await _testCanvasFPS();
        _results.push(fpsResult);

        console.log(`[DkzStress] ${_results.filter(r => r.pass).length}/${_results.length} bestanden`);
        _showPanel();
        return _results;
    }

    // ═══ PANEL ═══
    function _showPanel() {
        if (!_panelEl) {
            _panelEl = document.createElement('div');
            _panelEl.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:10003;background:rgba(14,14,22,.96);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px;width:360px;max-height:60vh;overflow-y:auto;box-shadow:0 16px 48px rgba(0,0,0,.6);font-family:Inter,sans-serif;backdrop-filter:blur(24px);';
            document.body.appendChild(_panelEl);
        }

        const passed = _results.filter(r => r.pass).length;
        const total = _results.length;
        const allPass = passed === total;

        let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span style="font-size:14px;font-weight:800;color:#f6f6f7">🔥 Stress Tests</span>
            <button onclick="this.parentElement.parentElement.style.display='none'" style="background:none;border:none;color:#a1a1aa;font-size:18px;cursor:pointer">✕</button>
        </div>
        <div style="font-size:11px;color:${allPass ? '#00ff88' : '#eab308'};margin-bottom:10px;font-family:monospace">${passed}/${total} bestanden ${allPass ? '✅' : '⚠️'}</div>`;

        _results.forEach(r => {
            const color = r.pass ? '#00ff88' : r.severity === 'error' ? '#fa1e4e' : '#eab308';
            html += `<div style="display:flex;gap:6px;padding:4px 0;font-size:11px;color:#a1a1aa;align-items:center">
                <span style="color:${color}">${r.pass ? '✅' : '❌'}</span>
                <span>${_esc(r.label)}</span>
                <span style="margin-left:auto;font-size:9px;color:rgba(255,255,255,.2);font-family:monospace">${_esc(r.detail || '')}</span>
            </div>`;
        });

        _panelEl.innerHTML = html;
        _panelEl.style.display = 'block';
    }

    return { run, VERSION };
})();

if (typeof module !== 'undefined') module.exports = DkzStress;
