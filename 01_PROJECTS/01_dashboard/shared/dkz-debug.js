/**
 * DkZ Debug + Analyse Toolbar
 * @DKZ:RULES -> R21 Pflegefall-System
 * @version v0.01.2_02
 *
 * 🐛 Debug: Vorsorge (Diagnose) / Problem (→ Auto GitHub Issue)
 * 🔬 Analyse (Admin only): Einzeln (Modul) / Full (System)
 *   → Dual-Agent Cross-Check: CodeRabbit + Copilot parallel
 *   → Mistral OCR als Werkzeug bei Unklarheiten
 *
 * Usage: <script src="../../shared/dkz-debug.js"></script>
 *        <script src="../../shared/dkz-analyser.js"></script>
 */

(function () {
    'use strict';

    const GITHUB_OWNER = 'BAZE2';
    const GITHUB_REPO = 'devkitz-ecosystem';
    const API_BASE = 'http://localhost:9880';

    // Inject debug button into header
    function init() {
        const header = document.querySelector('header, .header, nav, [class*="header"]');
        if (!header) {
            // Create floating button
            injectFloatingButton();
            return;
        }

        const btn = document.createElement('button');
        btn.id = 'dkz-debug-btn';
        btn.innerHTML = '🐛 Debug';
        btn.title = 'DkZ Debug Panel — Vorsorge oder Problem melden';
        Object.assign(btn.style, {
            background: 'rgba(250,30,78,0.1)',
            color: '#fa1e4e',
            border: '1px solid rgba(250,30,78,0.3)',
            padding: '4px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem',
            fontWeight: '600',
            transition: 'all 0.2s',
            marginLeft: '8px'
        });
        btn.addEventListener('click', openDebugPanel);
        btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(250,30,78,0.2)');
        btn.addEventListener('mouseleave', () => btn.style.background = 'rgba(250,30,78,0.1)');
        header.appendChild(btn);

        // Admin-only Analyse button
        if (isAdmin()) {
            const analyseBtn = document.createElement('button');
            analyseBtn.id = 'dkz-analyse-btn';
            analyseBtn.innerHTML = '🔬 Analyse';
            analyseBtn.title = 'DkZ Dual-Agent Analyse — Einzeln oder Full System';
            Object.assign(analyseBtn.style, {
                background: 'rgba(0,255,136,0.08)',
                color: '#00ff88',
                border: '1px solid rgba(0,255,136,0.2)',
                padding: '4px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                marginLeft: '6px'
            });
            analyseBtn.addEventListener('click', openAnalysePanel);
            analyseBtn.addEventListener('mouseenter', () => analyseBtn.style.background = 'rgba(0,255,136,0.15)');
            analyseBtn.addEventListener('mouseleave', () => analyseBtn.style.background = 'rgba(0,255,136,0.08)');
            header.appendChild(analyseBtn);
        }
    }

    function injectFloatingButton() {
        const btn = document.createElement('button');
        btn.id = 'dkz-debug-btn';
        btn.innerHTML = '🐛';
        btn.title = 'DkZ Debug Panel';
        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '44px',
            height: '44px',
            background: '#1a1a20',
            color: '#fa1e4e',
            border: '1px solid rgba(250,30,78,0.3)',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1.2rem',
            zIndex: '99999',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            transition: 'all 0.2s'
        });
        btn.addEventListener('click', openDebugPanel);
        document.body.appendChild(btn);
    }

    function openDebugPanel() {
        // Remove existing panel
        const existing = document.getElementById('dkz-debug-panel');
        if (existing) { existing.remove(); return; }

        const moduleName = document.title || window.location.pathname.split('/').pop();
        const panel = document.createElement('div');
        panel.id = 'dkz-debug-panel';
        panel.innerHTML = `
            <div style="background:#111116;border:1px solid rgba(250,30,78,0.3);border-radius:12px;padding:24px;max-width:440px;width:90%;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:100000;box-shadow:0 20px 60px rgba(0,0,0,0.6);font-family:'Inter',sans-serif">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                    <h3 style="font-size:1rem;font-weight:700;color:#f0f0f2">🐛 Debug Panel</h3>
                    <button onclick="document.getElementById('dkz-debug-panel').remove()" style="background:none;border:none;color:#71717a;cursor:pointer;font-size:1.2rem">✕</button>
                </div>
                <p style="font-size:.8rem;color:#a1a1aa;margin-bottom:16px">Modul: <strong style="color:#fa1e4e">${esc(moduleName)}</strong></p>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
                    <button id="dkz-dbg-vorsorge" style="padding:16px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);border-radius:10px;cursor:pointer;text-align:center;transition:all 0.2s">
                        <div style="font-size:1.5rem;margin-bottom:4px">🛡️</div>
                        <div style="font-size:.8rem;font-weight:600;color:#00ff88">Vorsorge</div>
                        <div style="font-size:.65rem;color:#71717a;margin-top:2px">Diagnose & Check</div>
                    </button>
                    <button id="dkz-dbg-problem" style="padding:16px;background:rgba(250,30,78,0.08);border:1px solid rgba(250,30,78,0.2);border-radius:10px;cursor:pointer;text-align:center;transition:all 0.2s">
                        <div style="font-size:1.5rem;margin-bottom:4px">🚨</div>
                        <div style="font-size:.8rem;font-weight:600;color:#fa1e4e">Problem</div>
                        <div style="font-size:.65rem;color:#71717a;margin-top:2px">Issue erstellen</div>
                    </button>
                </div>
                <div id="dkz-dbg-form" style="display:none"></div>
            </div>
            <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:99999" onclick="document.getElementById('dkz-debug-panel').remove()"></div>
        `;
        document.body.appendChild(panel);

        document.getElementById('dkz-dbg-vorsorge').addEventListener('click', () => showVorsorge(moduleName));
        document.getElementById('dkz-dbg-problem').addEventListener('click', () => showProblem(moduleName));
    }

    function showVorsorge(moduleName) {
        const form = document.getElementById('dkz-dbg-form');
        form.style.display = 'block';
        form.innerHTML = `
            <div style="background:#0a0a0e;border-radius:8px;padding:16px;border:1px solid rgba(255,255,255,0.06)">
                <h4 style="font-size:.8rem;font-weight:600;color:#00ff88;margin-bottom:12px">🛡️ Vorsorge-Diagnose</h4>
                <div id="dkz-diag-results" style="font-family:'JetBrains Mono',monospace;font-size:.7rem;color:#a1a1aa"></div>
            </div>
        `;
        runDiagnostics(moduleName);
    }

    function runDiagnostics(moduleName) {
        const results = [];
        // Check XSS
        results.push(typeof window.esc === 'function' ? '✅ XSS-Schutz (esc) vorhanden' : '⚠️ XSS-Schutz (esc) fehlt');
        // Check EventLog
        results.push(typeof window.DkzEventLog !== 'undefined' ? '✅ EventLog eingebunden' : '⚠️ EventLog fehlt');
        // Check Design
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
        results.push(accent.includes('fa1e4e') ? '✅ DkZ Accent #fa1e4e' : `⚠️ Accent: ${accent || 'nicht gesetzt'}`);
        // Check Hub Button
        const hubBtn = document.querySelector('[href*="hub"], [onclick*="hub"], .hub-btn');
        results.push(hubBtn ? '✅ ← Hub Button vorhanden' : '⚠️ ← Hub Button fehlt');
        // Check version meta
        const vMeta = document.querySelector('meta[name="dkz-version"]');
        results.push(vMeta ? `✅ Version: ${vMeta.content}` : '⚠️ Version-Meta fehlt');
        // Console errors
        results.push('✅ Modul: ' + moduleName);
        results.push('✅ Timestamp: ' + new Date().toISOString());

        document.getElementById('dkz-diag-results').innerHTML = results.map(r => `<div style="padding:3px 0">${r}</div>`).join('');
    }

    function showProblem(moduleName) {
        const form = document.getElementById('dkz-dbg-form');
        form.style.display = 'block';
        form.innerHTML = `
            <div style="background:#0a0a0e;border-radius:8px;padding:16px;border:1px solid rgba(250,30,78,0.15)">
                <h4 style="font-size:.8rem;font-weight:600;color:#fa1e4e;margin-bottom:12px">🚨 Problem melden → GitHub Issue</h4>
                <input id="dkz-issue-title" type="text" placeholder="Kurzbeschreibung..." style="width:100%;padding:8px 12px;background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#f0f0f2;font-family:'Inter',sans-serif;font-size:.8rem;margin-bottom:8px;outline:none">
                <textarea id="dkz-issue-body" placeholder="Details zum Problem..." rows="4" style="width:100%;padding:8px 12px;background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#f0f0f2;font-family:'Inter',sans-serif;font-size:.8rem;margin-bottom:8px;outline:none;resize:vertical"></textarea>
                <select id="dkz-issue-prio" style="width:100%;padding:8px 12px;background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#f0f0f2;font-family:'Inter',sans-serif;font-size:.8rem;margin-bottom:12px;outline:none">
                    <option value="pf:kritisch">🔴 Kritisch</option>
                    <option value="pf:hoch">🟠 Hoch</option>
                    <option value="pf:mittel" selected>🟡 Mittel</option>
                    <option value="pf:niedrig">🟢 Niedrig</option>
                </select>
                <button id="dkz-issue-submit" style="width:100%;padding:10px;background:linear-gradient(135deg,#fa1e4e,#ec4899);color:white;border:none;border-radius:8px;cursor:pointer;font-family:'Inter',sans-serif;font-weight:600;font-size:.8rem">🚀 Issue erstellen</button>
                <div id="dkz-issue-status" style="margin-top:8px;font-size:.7rem;color:#71717a;text-align:center"></div>
            </div>
        `;
        document.getElementById('dkz-issue-submit').addEventListener('click', () => createIssue(moduleName));
    }

    async function createIssue(moduleName) {
        const title = document.getElementById('dkz-issue-title').value;
        const body = document.getElementById('dkz-issue-body').value;
        const prio = document.getElementById('dkz-issue-prio').value;
        const status = document.getElementById('dkz-issue-status');

        if (!title) { status.textContent = '❌ Titel eingeben'; status.style.color = '#fa1e4e'; return; }

        status.textContent = '⏳ Erstelle Issue...';
        status.style.color = '#71717a';

        const pfId = `PF-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}`;
        const issueBody = `## 🐛 Bug Report — ${pfId}\n\n` +
            `| Feld | Wert |\n|:---|:---|\n` +
            `| **Pflegefall-ID** | \`${pfId}\` |\n` +
            `| **Modul** | ${moduleName} |\n` +
            `| **Priorität** | ${prio} |\n` +
            `| **URL** | ${window.location.href} |\n` +
            `| **User-Agent** | ${navigator.userAgent.slice(0, 80)} |\n` +
            `| **Timestamp** | ${new Date().toISOString()} |\n\n` +
            `### Beschreibung\n${body || '_Keine Details_'}\n\n` +
            `### System-Info\n` +
            `- XSS: ${typeof window.esc === 'function' ? '✅' : '❌'}\n` +
            `- EventLog: ${typeof window.DkzEventLog !== 'undefined' ? '✅' : '❌'}\n` +
            `- Version: ${document.querySelector('meta[name="dkz-version"]')?.content || 'unknown'}\n\n` +
            `---\n> 🤖 _Auto-created by DkZ Debug Panel (R21)_`;

        try {
            // Try backend endpoint first
            const res = await fetch(`${API_BASE}/debug/issue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `[${prio}] ${title} — ${moduleName}`,
                    body: issueBody,
                    labels: [prio, 'debug-panel', 'auto-created'],
                    pfId: pfId
                })
            });

            if (res.ok) {
                const data = await res.json();
                status.innerHTML = `✅ Issue erstellt: <a href="${data.url || '#'}" target="_blank" style="color:#fa1e4e">#${data.number || pfId}</a>`;
                status.style.color = '#00ff88';
            } else {
                // Fallback: save locally
                saveFallback(pfId, title, issueBody, prio);
                status.textContent = `📋 Lokal gespeichert als ${pfId} (Backend offline)`;
                status.style.color = '#ffab40';
            }
        } catch (e) {
            saveFallback(pfId, title, issueBody, prio);
            status.textContent = `📋 Lokal gespeichert als ${pfId} (Backend offline)`;
            status.style.color = '#ffab40';
        }
    }

    function saveFallback(pfId, title, body, prio) {
        const issues = JSON.parse(localStorage.getItem('dkz-pending-issues') || '[]');
        issues.push({ pfId, title, body, prio, created: new Date().toISOString() });
        localStorage.setItem('dkz-pending-issues', JSON.stringify(issues));
    }

    function esc(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ═══════════════════════════════════════
    // Admin Check
    // ═══════════════════════════════════════
    function isAdmin() {
        const role = sessionStorage.getItem('dkz-role');
        // Admin always visible in local dev (file:// protocol)
        return role === 'admin' || window.location.protocol === 'file:';
    }

    // ═══════════════════════════════════════
    // Analyse Panel (Admin only)
    // ═══════════════════════════════════════
    function openAnalysePanel() {
        const existing = document.getElementById('dkz-analyse-panel');
        if (existing) { existing.remove(); return; }

        const moduleName = document.title || 'Unknown';
        const panel = document.createElement('div');
        panel.id = 'dkz-analyse-panel';
        panel.innerHTML = `
            <div style="background:#111116;border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:24px;max-width:560px;width:90%;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:100000;box-shadow:0 20px 60px rgba(0,0,0,0.6);font-family:'Inter',sans-serif;max-height:80vh;overflow-y:auto">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                    <h3 style="font-size:1rem;font-weight:700;color:#f0f0f2">🔬 Dual-Agent Analyse</h3>
                    <button onclick="document.getElementById('dkz-analyse-panel').remove()" style="background:none;border:none;color:#71717a;cursor:pointer;font-size:1.2rem">✕</button>
                </div>
                <p style="font-size:.75rem;color:#71717a;margin-bottom:4px">🐰 CodeRabbit + 🤖 Copilot analysieren parallel, prüfen gegenseitig</p>
                <p style="font-size:.7rem;color:#52525b;margin-bottom:16px">🔍 Mistral OCR als Werkzeug bei Unklarheiten verfügbar</p>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
                    <button id="dkz-ana-single" style="padding:20px 16px;background:rgba(0,255,136,0.06);border:1px solid rgba(0,255,136,0.15);border-radius:10px;cursor:pointer;text-align:center;transition:all 0.2s">
                        <div style="font-size:1.8rem;margin-bottom:6px">🔍</div>
                        <div style="font-size:.85rem;font-weight:600;color:#00ff88">Einzeln</div>
                        <div style="font-size:.6rem;color:#71717a;margin-top:4px">Dieses Modul analysieren</div>
                        <div style="font-size:.55rem;color:#52525b;margin-top:2px">${esc(moduleName)}</div>
                    </button>
                    <button id="dkz-ana-full" style="padding:20px 16px;background:rgba(250,30,78,0.06);border:1px solid rgba(250,30,78,0.15);border-radius:10px;cursor:pointer;text-align:center;transition:all 0.2s">
                        <div style="font-size:1.8rem;margin-bottom:6px">🌐</div>
                        <div style="font-size:.85rem;font-weight:600;color:#fa1e4e">Full System</div>
                        <div style="font-size:.6rem;color:#71717a;margin-top:4px">Ganzes Ökosystem prüfen</div>
                        <div style="font-size:.55rem;color:#52525b;margin-top:2px">56 Module + Backend</div>
                    </button>
                </div>
                <div id="dkz-ana-output" style="display:none"></div>
            </div>
            <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:99999" onclick="document.getElementById('dkz-analyse-panel').remove()"></div>
        `;
        document.body.appendChild(panel);

        document.getElementById('dkz-ana-single').addEventListener('click', () => runAnalyse('single'));
        document.getElementById('dkz-ana-full').addEventListener('click', () => runAnalyse('full'));
    }

    async function runAnalyse(mode) {
        const output = document.getElementById('dkz-ana-output');
        output.style.display = 'block';
        output.innerHTML = `
            <div style="background:#0a0a0e;border-radius:8px;padding:16px;border:1px solid rgba(0,255,136,0.1)">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
                    <div class="dkz-spinner" style="width:16px;height:16px;border:2px solid #00ff88;border-top-color:transparent;border-radius:50%;animation:dkz-spin 0.6s linear infinite"></div>
                    <span style="font-size:.8rem;color:#00ff88">Agenten analysieren parallel...</span>
                </div>
                <div style="font-size:.7rem;color:#71717a">
                    <div>🐰 CodeRabbit: Design, Security, Regeln R1-R21...</div>
                    <div>🤖 Copilot: Funktion, Performance, Logic, UX...</div>
                </div>
            </div>
            <style>@keyframes dkz-spin{to{transform:rotate(360deg)}}</style>
        `;

        // Check if DkzAnalyser is loaded
        if (typeof DkzAnalyser === 'undefined') {
            output.innerHTML = `<div style="background:#0a0a0e;border-radius:8px;padding:16px;border:1px solid rgba(250,30,78,0.2)">
                <p style="color:#fa1e4e;font-size:.8rem">❌ dkz-analyser.js nicht geladen</p>
                <p style="color:#71717a;font-size:.7rem;margin-top:4px">Füge hinzu: &lt;script src="../../shared/dkz-analyser.js"&gt;&lt;/script&gt;</p>
            </div>`;
            return;
        }

        try {
            const report = await DkzAnalyser.analyse(mode, window.location.pathname);
            if (report.error) {
                output.innerHTML = `<div style="background:#0a0a0e;border-radius:8px;padding:16px;border:1px solid rgba(250,30,78,0.2)">
                    <p style="color:#fa1e4e;font-size:.8rem">⚠️ ${report.error}</p></div>`;
                return;
            }
            renderReport(output, report);
        } catch (e) {
            output.innerHTML = `<div style="padding:12px;color:#fa1e4e;font-size:.8rem">❌ ${e.message}</div>`;
        }
    }

    function renderReport(container, report) {
        const scoreColor = report.summary.score >= 80 ? '#00ff88' : report.summary.score >= 60 ? '#ffab40' : '#fa1e4e';
        let html = `
            <div style="background:#0a0a0e;border-radius:8px;padding:16px;border:1px solid rgba(0,255,136,0.1)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                    <span style="font-size:.9rem;font-weight:700;color:#f0f0f2">Analyse-Report</span>
                    <span style="font-size:1.5rem;font-weight:700;color:${scoreColor}">${report.summary.score}%</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
                    <div style="text-align:center;padding:8px;background:rgba(0,255,136,0.06);border-radius:6px">
                        <div style="font-size:1.1rem;font-weight:700;color:#00ff88">${report.summary.passed}</div>
                        <div style="font-size:.6rem;color:#71717a">Bestanden</div>
                    </div>
                    <div style="text-align:center;padding:8px;background:rgba(250,30,78,0.06);border-radius:6px">
                        <div style="font-size:1.1rem;font-weight:700;color:#fa1e4e">${report.summary.failed}</div>
                        <div style="font-size:.6rem;color:#71717a">Fehler</div>
                    </div>
                    <div style="text-align:center;padding:8px;background:rgba(255,255,255,0.03);border-radius:6px">
                        <div style="font-size:1.1rem;font-weight:700;color:#71717a">${report.summary.totalChecks}</div>
                        <div style="font-size:.6rem;color:#71717a">Checks</div>
                    </div>
                </div>
                <div style="font-size:.65rem;color:#52525b;margin-bottom:8px">
                    ID: ${report.id} | ${report.duration}ms | ${report.timestamp}
                </div>`;

        // Agent A results
        html += renderAgentResults('🐰 CodeRabbit', report.agentA.results);
        html += renderAgentResults('🤖 Copilot', report.agentB.results);

        // Cross-check results
        if (report.crossCheck.length > 0) {
            html += `<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)">
                <div style="font-size:.75rem;font-weight:600;color:#ffab40;margin-bottom:6px">🔄 Cross-Check Ergebnisse</div>`;
            for (const xc of report.crossCheck) {
                html += `<div style="font-size:.65rem;color:#a1a1aa;padding:3px 0">
                    ${xc.checker} prüft ${xc.original}: <span style="color:${xc.severity === 'kritisch' ? '#fa1e4e' : '#ffab40'}">${xc.verdict}</span>
                </div>`;
            }
            html += '</div>';
        }

        html += '</div>';
        container.innerHTML = html;
    }

    function renderAgentResults(agentName, results) {
        let html = `<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.04)">
            <div style="font-size:.7rem;font-weight:600;color:#a1a1aa;margin-bottom:4px">${agentName}</div>`;
        for (const r of results) {
            const icon = r.skip ? '⏭️' : r.pass ? '✅' : '❌';
            const color = r.skip ? '#52525b' : r.pass ? '#71717a' : '#fa1e4e';
            html += `<div style="font-size:.65rem;color:${color};padding:2px 0">${icon} ${r.id} ${r.name}</div>`;
        }
        html += '</div>';
        return html;
    }

    // Auto-init when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
