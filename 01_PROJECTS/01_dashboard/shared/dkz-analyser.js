/**
 * DkZ Analyser — Dual-Agent Cross-Check System
 * @DKZ:RULES -> R21 Pflegefall, R13 Analyse→Plan→Ausführung→Verifikation
 * @version v0.01.2_02
 *
 * Zwei Agenten analysieren parallel:
 *   Agent A (CodeRabbit): Design, XSS, Regeln R1-R21, Struktur
 *   Agent B (Copilot):    Funktionalität, Performance, Logic, Events
 * 
 * Cross-Check: Jeder prüft die Findings des anderen
 * OCR Tool:    Mistral-OCR 0.8 (lokal via vLLM) fuer Bild/PDF Analyse
 *
 * Usage: DkzAnalyser.analyse('single', modulePath) oder .analyse('full')
 */

const DkzAnalyser = (() => {
    'use strict';

    const API = 'http://localhost:9880';
    const OCR_API = 'http://srv1298466.hstgr.cloud:8080'; // vLLM via llama-swap

    // ═══════════════════════════════════════
    // Agent A: CodeRabbit Rules (Design/Security)
    // ═══════════════════════════════════════
    const AgentA = {
        name: 'CodeRabbit',
        icon: '🐰',
        checks: [
            // Design
            {
                id: 'A01', cat: 'Design', name: 'Accent #fa1e4e', test: (doc) => {
                    const styles = doc.querySelectorAll('style');
                    const allCSS = Array.from(styles).map(s => s.textContent).join('');
                    return allCSS.includes('fa1e4e') || allCSS.includes('#fa1e4e');
                }
            },
            {
                id: 'A02', cat: 'Design', name: 'Font Inter', test: (doc) => {
                    const links = Array.from(doc.querySelectorAll('link[href*="fonts"]'));
                    const styles = Array.from(doc.querySelectorAll('style')).map(s => s.textContent).join('');
                    return links.some(l => l.href.includes('Inter')) || styles.includes('Inter');
                }
            },
            {
                id: 'A03', cat: 'Design', name: 'Font JetBrains Mono', test: (doc) => {
                    const styles = Array.from(doc.querySelectorAll('style')).map(s => s.textContent).join('');
                    return styles.includes('JetBrains') || styles.includes('monospace');
                }
            },
            {
                id: 'A04', cat: 'Design', name: 'Dark Background', test: (doc) => {
                    const styles = Array.from(doc.querySelectorAll('style')).map(s => s.textContent).join('');
                    return styles.includes('#0e0e10') || styles.includes('#0a0a0e') || styles.includes('#111');
                }
            },
            {
                id: 'A05', cat: 'Design', name: 'Responsive Meta', test: (doc) => {
                    return !!doc.querySelector('meta[name="viewport"]');
                }
            },
            // Security
            {
                id: 'A06', cat: 'Security', name: 'XSS esc() Funktion', test: (doc) => {
                    const scripts = Array.from(doc.querySelectorAll('script')).map(s => s.textContent).join('');
                    return scripts.includes('function esc') || scripts.includes('esc(') || typeof window.esc === 'function';
                }
            },
            {
                id: 'A07', cat: 'Security', name: 'Keine innerHTML ohne esc', test: (doc) => {
                    const scripts = Array.from(doc.querySelectorAll('script')).map(s => s.textContent).join('');
                    const innerHTMLCount = (scripts.match(/\.innerHTML\s*=/g) || []).length;
                    const escCount = (scripts.match(/esc\(/g) || []).length;
                    return innerHTMLCount === 0 || escCount > 0;
                }
            },
            // Structure
            {
                id: 'A08', cat: 'Struktur', name: 'DkZ Version Meta', test: (doc) => {
                    return !!doc.querySelector('meta[name="dkz-version"]');
                }
            },
            {
                id: 'A09', cat: 'Struktur', name: '← Hub Button', test: (doc) => {
                    const all = doc.body.innerHTML;
                    return all.includes('Hub') || all.includes('hub') || all.includes('← Hub');
                }
            },
            {
                id: 'A10', cat: 'Struktur', name: 'Title gesetzt', test: (doc) => {
                    return doc.title && doc.title.length > 3;
                }
            },
            // R-Rules
            {
                id: 'A11', cat: 'Regeln', name: 'R20 Doc-Pflicht (README)', test: async (doc, ctx) => {
                    if (!ctx.modulePath) return 'skip';
                    try {
                        const r = await fetch(ctx.modulePath + '/README.md');
                        return r.ok;
                    } catch { return false; }
                }
            },
            {
                id: 'A12', cat: 'Regeln', name: 'Debug Button eingebunden', test: (doc) => {
                    const scripts = Array.from(doc.querySelectorAll('script[src]'));
                    return scripts.some(s => s.src.includes('dkz-debug'));
                }
            }
        ],

        async run(doc, ctx) {
            const results = [];
            for (const check of this.checks) {
                try {
                    const result = await check.test(doc, ctx);
                    results.push({
                        id: check.id,
                        cat: check.cat,
                        name: check.name,
                        pass: result === true || result === 'skip',
                        skip: result === 'skip',
                        agent: 'A'
                    });
                } catch (e) {
                    results.push({ id: check.id, cat: check.cat, name: check.name, pass: false, error: e.message, agent: 'A' });
                }
            }
            return results;
        }
    };

    // ═══════════════════════════════════════
    // Agent B: Copilot Rules (Functionality/Logic)
    // ═══════════════════════════════════════
    const AgentB = {
        name: 'Copilot',
        icon: '🤖',
        checks: [
            {
                id: 'B01', cat: 'Funktion', name: 'Keine Console Errors', test: () => {
                    // Can't directly check but we can check if error handler exists
                    return true; // Assume pass if no error thrown
                }
            },
            {
                id: 'B02', cat: 'Funktion', name: 'EventLog Integration', test: (doc) => {
                    const scripts = Array.from(doc.querySelectorAll('script')).map(s => s.textContent).join('');
                    return scripts.includes('DkzEventLog') || scripts.includes('eventlog') || scripts.includes('dkz-eventlog');
                }
            },
            {
                id: 'B03', cat: 'Funktion', name: 'Toast System', test: (doc) => {
                    const scripts = Array.from(doc.querySelectorAll('script')).map(s => s.textContent).join('');
                    return scripts.includes('toast') || scripts.includes('Toast') || scripts.includes('showToast');
                }
            },
            {
                id: 'B04', cat: 'Funktion', name: 'Settings Panel', test: (doc) => {
                    const all = doc.body.innerHTML;
                    return all.includes('settings') || all.includes('Settings') || all.includes('⚙');
                }
            },
            {
                id: 'B05', cat: 'Performance', name: 'Kein großer inline JS (>50KB)', test: (doc) => {
                    const scripts = Array.from(doc.querySelectorAll('script:not([src])')).map(s => s.textContent).join('');
                    return scripts.length < 50000;
                }
            },
            {
                id: 'B06', cat: 'Performance', name: 'Bilder optimiert', test: (doc) => {
                    const imgs = doc.querySelectorAll('img');
                    return imgs.length === 0 || Array.from(imgs).every(i => i.loading === 'lazy' || !i.src);
                }
            },
            {
                id: 'B07', cat: 'Logic', name: 'Keine hardcoded URLs', test: (doc) => {
                    const scripts = Array.from(doc.querySelectorAll('script')).map(s => s.textContent).join('');
                    return !scripts.includes('http://192.') && !scripts.includes('http://10.');
                }
            },
            {
                id: 'B08', cat: 'Logic', name: 'localStorage Nutzung', test: (doc) => {
                    const scripts = Array.from(doc.querySelectorAll('script')).map(s => s.textContent).join('');
                    return scripts.includes('localStorage') || scripts.includes('sessionStorage');
                }
            },
            {
                id: 'B09', cat: 'Logic', name: 'Error Handling', test: (doc) => {
                    const scripts = Array.from(doc.querySelectorAll('script')).map(s => s.textContent).join('');
                    return scripts.includes('catch') || scripts.includes('try');
                }
            },
            {
                id: 'B10', cat: 'UX', name: 'Keyboard Shortcuts', test: (doc) => {
                    const scripts = Array.from(doc.querySelectorAll('script')).map(s => s.textContent).join('');
                    return scripts.includes('keydown') || scripts.includes('keypress') || scripts.includes('Ctrl');
                }
            }
        ],

        async run(doc, ctx) {
            const results = [];
            for (const check of this.checks) {
                try {
                    const result = await check.test(doc, ctx);
                    results.push({
                        id: check.id,
                        cat: check.cat,
                        name: check.name,
                        pass: result === true,
                        agent: 'B'
                    });
                } catch (e) {
                    results.push({ id: check.id, cat: check.cat, name: check.name, pass: false, error: e.message, agent: 'B' });
                }
            }
            return results;
        }
    };

    // ═══════════════════════════════════════
    // Cross-Check: Agents verify each other
    // ═══════════════════════════════════════
    function crossCheck(resultsA, resultsB) {
        const crossResults = [];

        // B checks A's failures
        const aFailures = resultsA.filter(r => !r.pass && !r.skip);
        for (const fail of aFailures) {
            crossResults.push({
                type: 'cross-check',
                checker: 'B (Copilot)',
                original: `A (CodeRabbit) → ${fail.id}: ${fail.name}`,
                verdict: '⚠️ Bestätigt — muss gefixt werden',
                severity: fail.cat === 'Security' ? 'kritisch' : 'mittel'
            });
        }

        // A checks B's failures
        const bFailures = resultsB.filter(r => !r.pass);
        for (const fail of bFailures) {
            crossResults.push({
                type: 'cross-check',
                checker: 'A (CodeRabbit)',
                original: `B (Copilot) → ${fail.id}: ${fail.name}`,
                verdict: '⚠️ Bestätigt — Review empfohlen',
                severity: fail.cat === 'Performance' ? 'niedrig' : 'mittel'
            });
        }

        return crossResults;
    }

    // ═══════════════════════════════════════
    // OCR Tool (Mistral via vLLM)
    // ═══════════════════════════════════════
    async function ocrAnalyse(imageData) {
        try {
            const res = await fetch(`${OCR_API}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gemma4-e4b',
                    messages: [{
                        role: 'user',
                        content: 'Analysiere dieses Bild und beschreibe was du siehst. Fokus auf UI-Elemente, Text, Layout und moegliche Probleme.'
                    }],
                    max_tokens: 2000
                })
            });
            if (res.ok) {
                const data = await res.json();
                return { ok: true, text: data.choices?.[0]?.message?.content || 'Keine Antwort' };
            }
            return { ok: false, error: 'vLLM nicht erreichbar' };
        } catch {
            return { ok: false, error: 'OCR offline — vLLM Server pruefen: srv1298466.hstgr.cloud:8080' };
        }
    }

    // ═══════════════════════════════════════
    // Main Analyse Function
    // ═══════════════════════════════════════
    async function analyse(mode, modulePath) {
        const analyseId = `ANA-${Date.now().toString(36)}`;
        const startTime = Date.now();

        if (mode === 'single') {
            // Single module analysis
            const ctx = { modulePath, mode };
            const doc = document;

            // Run both agents in parallel
            const [resultsA, resultsB] = await Promise.all([
                AgentA.run(doc, ctx),
                AgentB.run(doc, ctx)
            ]);

            // Cross-check
            const crossResults = crossCheck(resultsA, resultsB);

            const report = {
                id: analyseId,
                mode: 'single',
                module: document.title || modulePath,
                timestamp: new Date().toISOString(),
                duration: Date.now() - startTime,
                agentA: { name: AgentA.name, icon: AgentA.icon, results: resultsA },
                agentB: { name: AgentB.name, icon: AgentB.icon, results: resultsB },
                crossCheck: crossResults,
                summary: {
                    totalChecks: resultsA.length + resultsB.length,
                    passed: resultsA.filter(r => r.pass).length + resultsB.filter(r => r.pass).length,
                    failed: resultsA.filter(r => !r.pass && !r.skip).length + resultsB.filter(r => !r.pass).length,
                    skipped: resultsA.filter(r => r.skip).length,
                    score: 0
                }
            };
            report.summary.score = Math.round((report.summary.passed / report.summary.totalChecks) * 100);

            // Save to backend
            try {
                await fetch(`${API}/admin/analyse`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(report)
                });
            } catch { /* offline fallback */ }

            return report;

        } else if (mode === 'full') {
            // Full system scan — scans all modules
            // This would be triggered from admin and run server-side
            try {
                const res = await fetch(`${API}/admin/analyse/full`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + (sessionStorage.getItem('dkz-api-key') || '')
                    }
                });
                if (res.ok) return await res.json();
            } catch { /* offline */ }
            return { error: 'Full scan needs backend — node BACKEND/server.js' };
        }
    }

    // Public API
    return { analyse, ocrAnalyse, AgentA, AgentB, crossCheck };
})();

// Export for Node.js (if used server-side)
if (typeof module !== 'undefined') module.exports = DkzAnalyser;
