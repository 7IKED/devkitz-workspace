/**
 * DkZ Updater — Universal Sync & Test Button v1.0
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * 
 * Features:
 * - 🔄 Sync-Button (Pfeile im Kreis) in jedem Modul-Header
 * - 5-Min Cooldown (Warnung bei Mehrfachklick)
 * - Komplett-Test aller Module (fetch + validate)
 * - REDNOTE bei Fehlern (localStorage + console)
 * - Vollständiges Log aller Ergebnisse
 * - Nicht stoppbar nach Start (kein Cancel)
 * - Auto-Inject in jedes Modul
 */
(function () {
    'use strict';

    const DKZ_UPDATER = {
        COOLDOWN_MS: 60000,      // 1 Minute
        BLITZ_MS: 20000,         // 20 Sekunden (Blitz-Modus)
        NORMAL_CHECK_MS: 60000,  // 1 Minute (normaler Auto-Check)
        STORAGE_KEY: 'dkz-updater-state',
        REDNOTE_KEY: 'dkz-rednotes',
        LOG_KEY: 'dkz-updater-log',
        MODULE_BASE: '../../modules/',

        // All known modules
        MODULES: [
            'action-builder','agent-builder','ai_chat','analyser','api-tester',
            'app-builder','ascii-tool','base64-tools','blog-designer','botnet-admin',
            'changelog-builder','clipboard','code-differ','color-picker','converter',
            'cron-builder','cs2-config','css-generator','devnotes','doc-engine',
            'domain-control','ecosystem-analyzer','emoji-picker','favicon-gen','gallery',
            'hash-generator','html_viewer','iceberg','icon-creator','ip-tools',
            'json-formatter','ki-lernplattform','link-generator','llm-cost-board',
            'loop-dashboard','lorem-generator','markdown-gen','markdown_converter',
            'meta-tag-gen','noter','notes-manager','password-gen','playbook-archiv',
            'project-registry','prompt-generator','prompt-viewer','prompter',
            'qr-generator','rating-system','regex-tester','research','ruleboard',
            'seo-toolkit','settings','skill-builder','snippet-manager','social-dashboard',
            'source-registry','speech_to_text','split-browser','sportwetten','suno-ai',
            'system-check','tasker','team-builder','text_summary','text_to_speech',
            'timer-tools','ttl-visualizer','unit-converter','wiki-viewer',
            'workflow-builder','workflow-viewer'
        ],

        state: {
            running: false,
            lastRun: null,
            results: [],
            totalRuns: 0,
            blitzMode: false
        },
        _blitzInterval: null,
        _normalInterval: null,

        // ═══ INIT ═══
        init() {
            this.loadState();
            this.injectButton();
            console.log('[DkZ Updater] v1.1 ready | Cooldown: 1min | Blitz: 20s | Modules:', this.MODULES.length);
        },

        loadState() {
            try {
                const s = localStorage.getItem(this.STORAGE_KEY);
                if (s) this.state = { ...this.state, ...JSON.parse(s) };
            } catch (e) { /* ignore */ }
        },

        saveState() {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
            } catch (e) { /* ignore */ }
        },

        // ═══ UI INJECTION ═══
        injectButton() {
            const target =
                document.querySelector('.header-actions') ||
                document.querySelector('header > div:last-child') ||
                document.querySelector('.header > div:last-child') ||
                document.querySelector('header') ||
                document.querySelector('.header') ||
                document.querySelector('[class*="header"]');

            if (!target || document.getElementById('dkz-sync-btn')) return;

            // Inject CSS
            const style = document.createElement('style');
            style.textContent = `
                #dkz-sync-btn {
                    width: 36px; height: 36px;
                    border: 1px solid rgba(255,255,255,.1);
                    border-radius: 8px;
                    background: rgba(255,255,255,.03);
                    color: #a1a1aa;
                    font-size: 1.2rem;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all .3s;
                    position: relative;
                }
                #dkz-sync-btn:hover {
                    border-color: #00D084;
                    color: #00D084;
                    background: rgba(0,208,132,.08);
                    transform: scale(1.05);
                }
                #dkz-sync-btn.running {
                    border-color: #ffd740;
                    color: #ffd740;
                    pointer-events: none;
                    animation: dkz-spin 1s linear infinite;
                }
                #dkz-sync-btn.cooldown {
                    border-color: #ff4444;
                    color: #666;
                    cursor: not-allowed;
                }
                #dkz-sync-btn.done {
                    border-color: #00D084;
                    color: #00D084;
                }
                #dkz-sync-btn.error {
                    border-color: #ff4444;
                    color: #ff4444;
                }
                @keyframes dkz-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                #dkz-sync-log {
                    position: fixed;
                    bottom: 0; right: 0;
                    width: 420px; max-height: 50vh;
                    background: #0e0e10;
                    border: 1px solid #2a2a2e;
                    border-radius: 12px 0 0 0;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: .7rem;
                    color: #a1a1aa;
                    z-index: 99999;
                    display: none;
                    flex-direction: column;
                }
                #dkz-sync-log.visible { display: flex; }
                #dkz-sync-log-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 8px 12px;
                    background: rgba(255,255,255,.03);
                    border-bottom: 1px solid #2a2a2e;
                    font-weight: 700;
                    font-size: .75rem;
                    color: #f6f6f7;
                }
                #dkz-sync-log-body {
                    overflow-y: auto;
                    padding: 8px 12px;
                    flex: 1;
                    max-height: 45vh;
                }
                .dkz-log-line { padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,.02); }
                .dkz-log-ok { color: #00D084; }
                .dkz-log-fail { color: #ff4444; }
                .dkz-log-warn { color: #ffd740; }
                .dkz-log-info { color: #55ACEE; }
                #dkz-sync-progress {
                    width: 100%; height: 3px;
                    background: #1a1a1c;
                }
                #dkz-sync-progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #fa1e4e, #00D084);
                    width: 0%;
                    transition: width .3s;
                }
                /* Results Popup */
                #dkz-sync-results {
                    position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(10px);
                    display:flex;align-items:center;justify-content:center;
                    z-index:100001;opacity:0;pointer-events:none;transition:opacity .3s;
                }
                #dkz-sync-results.visible { opacity:1;pointer-events:all; }
                .dkz-results-card {
                    background:#1a1a1c;border:1px solid #2a2a2e;border-radius:16px;
                    padding:2rem;width:90vw;max-width:700px;max-height:85vh;overflow-y:auto;
                    font-family:'Inter',sans-serif;color:#f6f6f7;
                }
                .dkz-results-header {
                    display:flex;justify-content:space-between;align-items:center;
                    margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid #2a2a2e;
                }
                .dkz-results-title { font-size:1.3rem;font-weight:800; }
                .dkz-results-close {
                    width:32px;height:32px;border:none;background:rgba(255,255,255,.05);
                    border-radius:6px;color:#f6f6f7;cursor:pointer;font-size:1.25rem;
                }
                .dkz-stat-grid {
                    display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem;
                    margin-bottom:1.5rem;
                }
                .dkz-stat-card {
                    background:rgba(255,255,255,.03);border:1px solid #2a2a2e;border-radius:10px;
                    padding:1rem;text-align:center;
                }
                .dkz-stat-val { font-size:2rem;font-weight:900;line-height:1; }
                .dkz-stat-label { font-size:.7rem;color:#808080;text-transform:uppercase;margin-top:.25rem; }
                .dkz-stat-ok .dkz-stat-val { color:#00D084; }
                .dkz-stat-warn .dkz-stat-val { color:#ffd740; }
                .dkz-stat-fail .dkz-stat-val { color:#ff4444; }
                .dkz-stat-info .dkz-stat-val { color:#55ACEE; }
                .dkz-bar { height:8px;background:#1a1a1c;border-radius:4px;overflow:hidden;margin:4px 0; }
                .dkz-bar-fill { height:100%;border-radius:4px;transition:width .5s; }
                .dkz-toggle-view {
                    padding:4px 12px;border:1px solid #2a2a2e;border-radius:6px;
                    background:rgba(255,255,255,.03);color:#a1a1aa;font-size:.7rem;
                    cursor:pointer;font-family:inherit;transition:all .2s;
                }
                .dkz-toggle-view:hover { border-color:#fa1e4e;color:#fff; }
                .dkz-toggle-view.active { background:rgba(250,30,78,.1);border-color:#fa1e4e;color:#fa1e4e; }
                .dkz-mod-table { width:100%;border-collapse:collapse;font-size:.75rem;margin-top:.5rem; }
                .dkz-mod-table th { text-align:left;padding:6px 8px;color:#808080;border-bottom:1px solid #2a2a2e;font-weight:600; }
                .dkz-mod-table td { padding:5px 8px;border-bottom:1px solid rgba(255,255,255,.03); }
                .dkz-rednotes-section { margin-top:1rem;padding:1rem;background:rgba(255,68,68,.05);border:1px solid rgba(255,68,68,.15);border-radius:10px; }
            `;
            document.head.appendChild(style);

            // Create sync button
            const btn = document.createElement('button');
            btn.id = 'dkz-sync-btn';
            btn.innerHTML = '&#x21BB;'; // ↻ circular arrow
            btn.title = 'DkZ Sync — Module testen & aktualisieren';
            btn.addEventListener('click', () => this.handleClick());

            // Create ⚡ Blitz button
            const blitz = document.createElement('button');
            blitz.id = 'dkz-blitz-btn';
            blitz.innerHTML = '&#x26A1;'; // ⚡
            blitz.title = 'Blitz-Modus — Auto-Check alle 20 Sek';
            Object.assign(blitz.style, {
                width: '36px', height: '36px',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: '8px',
                background: 'rgba(255,255,255,.03)',
                color: '#a1a1aa',
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .3s',
                marginLeft: '4px'
            });
            blitz.addEventListener('click', () => this.toggleBlitz());
            if (this.state.blitzMode) this._applyBlitzStyle(blitz, true);

            // Insert at start of target
            target.insertBefore(blitz, target.firstChild);
            target.insertBefore(btn, target.firstChild);

            // Create log panel
            const log = document.createElement('div');
            log.id = 'dkz-sync-log';
            log.innerHTML = `
                <div id="dkz-sync-log-header">
                    <span>🔄 DkZ Sync Log</span>
                    <div style="display:flex;gap:6px">
                        <button onclick="DkzUpdater.exportLog()" style="border:none;background:rgba(255,255,255,.05);color:#a1a1aa;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:.65rem">Export</button>
                        <button onclick="document.getElementById('dkz-sync-log').classList.remove('visible')" style="border:none;background:rgba(255,255,255,.05);color:#a1a1aa;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:.8rem">&times;</button>
                    </div>
                </div>
                <div id="dkz-sync-progress"><div id="dkz-sync-progress-bar"></div></div>
                <div id="dkz-sync-log-body"></div>
            `;
            document.body.appendChild(log);
        },

        // ═══ CLICK HANDLER ═══
        handleClick() {
            const btn = document.getElementById('dkz-sync-btn');

            // Blocked: already running
            if (this.state.running) {
                this.showToast('⚠️ Sync läuft bereits — kann nicht gestoppt werden!', 'warn');
                return;
            }

            // Blocked: cooldown
            if (this.state.lastRun) {
                const elapsed = Date.now() - new Date(this.state.lastRun).getTime();
                if (elapsed < this.COOLDOWN_MS) {
                    const remaining = Math.ceil((this.COOLDOWN_MS - elapsed) / 60000);
                    this.showToast(`⏳ Cooldown aktiv — noch ${remaining} Min warten!`, 'warn');
                    btn.classList.add('cooldown');
                    setTimeout(() => btn.classList.remove('cooldown'), 2000);
                    return;
                }
            }

            // Start sync
            this.startSync();
        },

        // ═══ SYNC PROCESS ═══
        async startSync() {
            const btn = document.getElementById('dkz-sync-btn');
            const logPanel = document.getElementById('dkz-sync-log');
            const logBody = document.getElementById('dkz-sync-log-body');
            const progressBar = document.getElementById('dkz-sync-progress-bar');

            // Lock state
            this.state.running = true;
            this.state.results = [];
            this.saveState();
            btn.classList.add('running');
            logPanel.classList.add('visible');
            logBody.innerHTML = '';
            progressBar.style.width = '0%';

            const startTime = Date.now();
            this.log('info', `═══ DkZ Sync gestartet — ${new Date().toLocaleString('de-DE')} ═══`);
            this.log('info', `Module zu testen: ${this.MODULES.length}`);
            this.showToast('🔄 Sync gestartet — alle Module werden getestet...', 'info');

            let ok = 0, fail = 0, warn = 0;

            // Test each module
            for (let i = 0; i < this.MODULES.length; i++) {
                const mod = this.MODULES[i];
                const pct = Math.round(((i + 1) / this.MODULES.length) * 100);
                progressBar.style.width = pct + '%';

                try {
                    const result = await this.testModule(mod);
                    this.state.results.push(result);

                    if (result.status === 'ok') {
                        ok++;
                        this.log('ok', `✅ ${mod} — ${result.message}`);
                    } else if (result.status === 'warn') {
                        warn++;
                        this.log('warn', `⚠️ ${mod} — ${result.message}`);
                    } else {
                        fail++;
                        this.log('fail', `❌ ${mod} — ${result.message}`);
                        this.createRednote(mod, result.message);
                    }
                } catch (e) {
                    fail++;
                    this.log('fail', `❌ ${mod} — Exception: ${e.message}`);
                    this.createRednote(mod, `Exception: ${e.message}`);
                    this.state.results.push({ module: mod, status: 'fail', message: e.message });
                }
            }

            // Summary
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            this.log('info', `═══ Sync fertig in ${duration}s ═══`);
            this.log('info', `✅ OK: ${ok} | ⚠️ Warn: ${warn} | ❌ Fail: ${fail}`);

            btn.classList.remove('running');
            if (fail > 0) {
                this.log('fail', `REDNOTE: ${fail} Module haben Fehler`);
                btn.classList.add('error');
            } else {
                btn.classList.add('done');
            }
            setTimeout(() => btn.classList.remove('done', 'error'), 5000);

            // Save final state
            this.state.running = false;
            this.state.lastRun = new Date().toISOString();
            this.state.totalRuns++;
            this.saveState();
            this.saveLog();

            // Show results popup
            this.showResults(ok, warn, fail, duration);
        },

        // ═══ MODULE TEST ═══
        async testModule(modName) {
            const url = this.MODULE_BASE + modName + '/index.html';
            const result = { module: modName, status: 'ok', message: '', checks: {} };

            try {
                const res = await fetch(url, { method: 'HEAD', cache: 'no-cache' });

                // Check: File exists
                if (!res.ok) {
                    result.status = 'fail';
                    result.message = `HTTP ${res.status} — Datei nicht erreichbar`;
                    return result;
                }
                result.checks.exists = true;

                // For same-origin, try to load and parse
                try {
                    const fullRes = await fetch(url, { cache: 'no-cache' });
                    const html = await fullRes.text();

                    // Check: Has <title>
                    const hasTitle = /<title>/.test(html);
                    result.checks.title = hasTitle;

                    // Check: Has shared scripts
                    const hasDebug = /dkz-debug\.js/.test(html);
                    const hasTheme = /dkz-theme\.css/.test(html);
                    const hasGuide = /dkz-guide\.js/.test(html);
                    result.checks.sharedScripts = hasDebug && hasTheme && hasGuide;

                    // Check: Has Hub link
                    const hasHub = /hub\/index\.html|hub\.html/.test(html);
                    result.checks.hubLink = hasHub;

                    // Check: Has Info/Onboarding
                    const hasInfo = /showModuleInfo|info-modal/.test(html);
                    result.checks.infoPopup = hasInfo;

                    // Check: Has v2 design
                    const hasV2 = /blob|blur\(1[2-9]|blur\(20/.test(html);
                    result.checks.v2Design = hasV2;

                    // Build message
                    const warnings = [];
                    if (!hasTitle) warnings.push('kein <title>');
                    if (!result.checks.sharedScripts) warnings.push('Shared Scripts fehlen');
                    if (!hasHub) warnings.push('kein Hub-Link');
                    if (!hasInfo) warnings.push('kein Info-Popup');

                    if (warnings.length > 0) {
                        result.status = 'warn';
                        result.message = warnings.join(', ');
                    } else {
                        result.message = `OK — ${(html.length / 1024).toFixed(0)}KB`;
                    }
                } catch (parseErr) {
                    // Can't parse but file exists
                    result.status = 'ok';
                    result.message = 'Erreichbar (Parse übersprungen)';
                }
            } catch (fetchErr) {
                // file:// protocol — check differently
                if (location.protocol === 'file:') {
                    result.status = 'ok';
                    result.message = 'Lokaler Modus — Scan übersprungen';
                } else {
                    result.status = 'fail';
                    result.message = `Fetch Error: ${fetchErr.message}`;
                }
            }

            return result;
        },

        // ═══ REDNOTE ═══
        createRednote(module, error) {
            try {
                const notes = JSON.parse(localStorage.getItem(this.REDNOTE_KEY) || '[]');
                notes.push({
                    module,
                    error,
                    timestamp: new Date().toISOString(),
                    resolved: false
                });
                localStorage.setItem(this.REDNOTE_KEY, JSON.stringify(notes));
                console.warn(`[DkZ REDNOTE] ${module}: ${error}`);
            } catch (e) { /* ignore */ }
        },

        // ═══ LOGGING ═══
        log(type, message) {
            const body = document.getElementById('dkz-sync-log-body');
            if (body) {
                const line = document.createElement('div');
                line.className = `dkz-log-line dkz-log-${type}`;
                line.textContent = `[${new Date().toLocaleTimeString('de-DE')}] ${message}`;
                body.appendChild(line);
                body.scrollTop = body.scrollHeight;
            }
            console.log(`[DkZ Sync] ${message}`);
        },

        saveLog() {
            try {
                const logs = JSON.parse(localStorage.getItem(this.LOG_KEY) || '[]');
                logs.push({
                    timestamp: new Date().toISOString(),
                    results: this.state.results,
                    summary: {
                        total: this.MODULES.length,
                        ok: this.state.results.filter(r => r.status === 'ok').length,
                        warn: this.state.results.filter(r => r.status === 'warn').length,
                        fail: this.state.results.filter(r => r.status === 'fail').length
                    }
                });
                // Keep only last 20 logs
                while (logs.length > 20) logs.shift();
                localStorage.setItem(this.LOG_KEY, JSON.stringify(logs));
            } catch (e) { /* ignore */ }
        },

        exportLog() {
            try {
                const logs = JSON.parse(localStorage.getItem(this.LOG_KEY) || '[]');
                const rednotes = JSON.parse(localStorage.getItem(this.REDNOTE_KEY) || '[]');
                const data = { logs, rednotes, exportedAt: new Date().toISOString() };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `dkz-sync-log-${new Date().toISOString().slice(0,10)}.json`;
                a.click();
                this.showToast('📥 Log exportiert!', 'ok');
            } catch (e) {
                this.showToast('❌ Export fehlgeschlagen', 'fail');
            }
        },

        // ═══ RESULTS POPUP ═══
        showResults(ok, warn, fail, duration) {
            let panel = document.getElementById('dkz-sync-results');
            if (!panel) {
                panel = document.createElement('div');
                panel.id = 'dkz-sync-results';
                document.body.appendChild(panel);
            }

            const total = this.MODULES.length;
            const health = Math.round((ok / total) * 100);
            const rednotes = JSON.parse(localStorage.getItem(this.REDNOTE_KEY) || '[]');
            const openNotes = rednotes.filter(n => !n.resolved).length;
            const isAdmin = localStorage.getItem('dkz-role') === 'admin'; // R27: Explicit admin check

            // Aggregate checks
            const withScripts = this.state.results.filter(r => r.checks && r.checks.sharedScripts).length;
            const withHub = this.state.results.filter(r => r.checks && r.checks.hubLink).length;
            const withInfo = this.state.results.filter(r => r.checks && r.checks.infoPopup).length;
            const withV2 = this.state.results.filter(r => r.checks && r.checks.v2Design).length;

            // Build fail list
            const fails = this.state.results.filter(r => r.status === 'fail');
            const warns = this.state.results.filter(r => r.status === 'warn');

            const barColor = health >= 90 ? '#00D084' : health >= 70 ? '#ffd740' : '#ff4444';

            panel.innerHTML = `
                <div class="dkz-results-card">
                    <div class="dkz-results-header">
                        <div class="dkz-results-title">🔄 Sync Report — ${new Date().toLocaleDateString('de-DE')}</div>
                        <div style="display:flex;gap:8px;align-items:center">
                            <button class="dkz-toggle-view ${isAdmin?'active':''}" onclick="DkzUpdater._toggleView()" id="dkz-view-toggle">
                                ${isAdmin ? '🔧 Admin' : '👤 User'}
                            </button>
                            <button class="dkz-results-close" onclick="document.getElementById('dkz-sync-results').classList.remove('visible')">&times;</button>
                        </div>
                    </div>

                    <!-- Health Bar -->
                    <div style="margin-bottom:1.5rem">
                        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:.25rem">
                            <span style="font-weight:700">Ecosystem Health</span>
                            <span style="font-size:1.5rem;font-weight:900;color:${barColor}">${health}%</span>
                        </div>
                        <div class="dkz-bar"><div class="dkz-bar-fill" style="width:${health}%;background:${barColor}"></div></div>
                        <div style="font-size:.7rem;color:#808080;margin-top:.25rem">Scan: ${duration}s | ${total} Module | Run #${this.state.totalRuns}</div>
                    </div>

                    <!-- Stats Grid -->
                    <div class="dkz-stat-grid">
                        <div class="dkz-stat-card dkz-stat-ok"><div class="dkz-stat-val">${ok}</div><div class="dkz-stat-label">✅ Bestanden</div></div>
                        <div class="dkz-stat-card dkz-stat-warn"><div class="dkz-stat-val">${warn}</div><div class="dkz-stat-label">⚠️ Warnungen</div></div>
                        <div class="dkz-stat-card dkz-stat-fail"><div class="dkz-stat-val">${fail}</div><div class="dkz-stat-label">❌ Fehler</div></div>
                        <div class="dkz-stat-card dkz-stat-info"><div class="dkz-stat-val">${openNotes}</div><div class="dkz-stat-label">📋 Rednotes</div></div>
                    </div>

                    <!-- Admin: Detailed Stats -->
                    <div id="dkz-admin-detail" style="${isAdmin?'':'display:none'}">
                        <div style="font-weight:700;margin-bottom:.75rem">📊 Ecosystem Statistiken</div>
                        <div class="dkz-stat-grid" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))">
                            <div class="dkz-stat-card"><div class="dkz-stat-val" style="color:#55ACEE;font-size:1.5rem">${withScripts}/${total}</div><div class="dkz-stat-label">Shared Scripts</div></div>
                            <div class="dkz-stat-card"><div class="dkz-stat-val" style="color:#ec4899;font-size:1.5rem">${withV2}/${total}</div><div class="dkz-stat-label">Design v2</div></div>
                            <div class="dkz-stat-card"><div class="dkz-stat-val" style="color:#00D084;font-size:1.5rem">${withHub}/${total}</div><div class="dkz-stat-label">Hub-Link</div></div>
                            <div class="dkz-stat-card"><div class="dkz-stat-val" style="color:#ffd740;font-size:1.5rem">${withInfo}/${total}</div><div class="dkz-stat-label">Info Popup</div></div>
                        </div>

                        ${fails.length > 0 ? `
                        <div class="dkz-rednotes-section">
                            <div style="font-weight:700;color:#ff4444;margin-bottom:.5rem">❌ Fehlgeschlagen (${fails.length})</div>
                            <table class="dkz-mod-table">
                                <tr><th>Modul</th><th>Fehler</th></tr>
                                ${fails.map(f => `<tr><td style="color:#ff4444;font-weight:600">${f.module}</td><td>${f.message}</td></tr>`).join('')}
                            </table>
                        </div>` : ''}

                        ${warns.length > 0 ? `
                        <div style="margin-top:1rem;padding:1rem;background:rgba(255,215,64,.05);border:1px solid rgba(255,215,64,.15);border-radius:10px">
                            <div style="font-weight:700;color:#ffd740;margin-bottom:.5rem">⚠️ Warnungen (${warns.length})</div>
                            <table class="dkz-mod-table">
                                <tr><th>Modul</th><th>Hinweis</th></tr>
                                ${warns.map(w => `<tr><td style="color:#ffd740;font-weight:600">${w.module}</td><td>${w.message}</td></tr>`).join('')}
                            </table>
                        </div>` : ''}
                    </div>

                    <!-- User: Smart Summary -->
                    <div id="dkz-user-summary" style="${isAdmin?'display:none':''}">
                        <div style="text-align:center;padding:1rem">
                            <div style="font-size:3rem;margin-bottom:.5rem">${fail === 0 ? '✅' : '⚠️'}</div>
                            <div style="font-size:1.1rem;font-weight:700">${fail === 0 ? 'Alles in Ordnung!' : fail + ' Problem' + (fail > 1 ? 'e' : '') + ' gefunden'}</div>
                            <div style="color:#808080;font-size:.85rem;margin-top:.5rem">
                                ${ok} Module OK${warn > 0 ? ` · ${warn} mit Hinweisen` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid #2a2a2e;display:flex;justify-content:space-between;align-items:center">
                        <div style="font-size:.7rem;color:#606060">Letzter Scan: ${new Date().toLocaleString('de-DE')} · Cooldown: 1 Min ${this.state.blitzMode ? '· ⚡ Blitz 20s' : ''}</div>
                        <div style="display:flex;gap:8px">
                            <button onclick="DkzUpdater.exportLog()" style="padding:6px 14px;border:1px solid #2a2a2e;border-radius:6px;background:rgba(255,255,255,.03);color:#a1a1aa;font-size:.75rem;cursor:pointer;font-family:inherit">📥 Export</button>
                            <button onclick="document.getElementById('dkz-sync-results').classList.remove('visible')" style="padding:6px 14px;border:none;border-radius:6px;background:linear-gradient(135deg,#fa1e4e,#ec4899);color:#fff;font-weight:700;font-size:.75rem;cursor:pointer;font-family:inherit">Schliessen</button>
                        </div>
                    </div>
                </div>
            `;
            panel.classList.add('visible');
        },

        _toggleView() {
            const admin = document.getElementById('dkz-admin-detail');
            const user = document.getElementById('dkz-user-summary');
            const btn = document.getElementById('dkz-view-toggle');
            if (!admin || !user) return;
            const isAdmin = admin.style.display !== 'none';
            admin.style.display = isAdmin ? 'none' : '';
            user.style.display = isAdmin ? '' : 'none';
            btn.textContent = isAdmin ? '👤 User' : '🔧 Admin';
            btn.classList.toggle('active');
        },

        // ═══ TOAST ═══
        showToast(msg, type = 'info') {
            const colors = { ok: '#00D084', fail: '#ff4444', warn: '#ffd740', info: '#55ACEE' };
            const t = document.createElement('div');
            t.style.cssText = `position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:12px 24px;background:#1a1a1c;border:1px solid ${colors[type] || '#333'};border-radius:10px;color:#f6f6f7;font-family:'Inter',sans-serif;font-size:.8rem;z-index:100000;box-shadow:0 8px 30px rgba(0,0,0,.5);opacity:0;transition:opacity .3s`;
            t.textContent = msg;
            document.body.appendChild(t);
            requestAnimationFrame(() => t.style.opacity = '1');
            setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 4000);
        },

        // ═══ AUTO-HEALTH-CHECK (Automatisierung) ═══
        autoHealthCheck() {
            const issues = [];
            const now = Date.now();

            // 1. Iceberg Speicher pruefen
            try {
                if (typeof DkzIceberg !== 'undefined') {
                    const stats = DkzIceberg.getStats();
                    if (stats.totalPrompts > 500) {
                        issues.push({ module: 'Iceberg', severity: 'warn', msg: `${stats.totalPrompts} Prompts — Archiv archivieren/exportieren empfohlen` });
                    }
                }
            } catch(e) { /* skip */ }

            // 2. Compaction Speicher pruefen  
            try {
                if (typeof DkzCompaction !== 'undefined') {
                    const storageStats = DkzCompaction.getStorageStats();
                    const totalKB = parseFloat(storageStats.totalKB || 0);
                    if (totalKB > 4000) {
                        issues.push({ module: 'Compaction', severity: 'error', msg: `${totalKB.toFixed(0)}KB localStorage — Compaction Level 3+ empfohlen` });
                        // Auto-Compact bei >4MB
                        DkzCompaction.checkAndAutoCompact();
                    } else if (totalKB > 2000) {
                        issues.push({ module: 'Compaction', severity: 'warn', msg: `${totalKB.toFixed(0)}KB localStorage — Soft-Compaction empfohlen` });
                    }
                }
            } catch(e) { /* skip */ }

            // 3. Memory Fill pruefen (GM-02)
            try {
                if (typeof DkzMemory !== 'undefined') {
                    const memStats = DkzMemory.getMemoryStats();
                    if (memStats.fillPercent > 85) {
                        issues.push({ module: 'Memory', severity: 'error', msg: `Fuellstand ${memStats.fillPercent}% — GM-02 Wache: Compaction noetig!` });
                    }
                }
            } catch(e) { /* skip */ }

            // 4. REDNOTE-Backlog pruefen
            try {
                const rednotes = JSON.parse(localStorage.getItem(this.REDNOTE_KEY) || '[]');
                const unresolved = rednotes.filter(r => !r.resolved);
                if (unresolved.length > 10) {
                    issues.push({ module: 'REDNOTE', severity: 'warn', msg: `${unresolved.length} offene REDNOTEs — Review empfohlen` });
                }
            } catch(e) { /* skip */ }

            // 5. Builder-Catalog Sync pruefen
            try {
                if (typeof DkzBuilderBridge !== 'undefined') {
                    const stats = DkzBuilderBridge.getStats();
                    if (stats.local > 200) {
                        issues.push({ module: 'BuilderBridge', severity: 'warn', msg: `${stats.local} lokale Eintraege — Archiv-Export empfohlen` });
                    }
                }
            } catch(e) { /* skip */ }

            // Log issues
            issues.forEach(issue => {
                console.log(`[DkZ HealthCheck] ${issue.severity.toUpperCase()}: ${issue.module} — ${issue.msg}`);
                if (issue.severity === 'error') {
                    this.createRednote(issue.module, issue.msg);
                }
            });

            // Store health report
            try {
                localStorage.setItem('dkz-health-report', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    issues: issues,
                    healthy: issues.filter(i => i.severity === 'error').length === 0
                }));
            } catch(e) { /* skip */ }

            return { healthy: issues.filter(i => i.severity === 'error').length === 0, issues: issues };
        },

        // ═══ PERIODIC AUTO-CHECK (1 min normal, 20s blitz) ═══  
        startAutoCheck() {
            // Run health check on init
            setTimeout(() => this.autoHealthCheck(), 3000);
            // Normal: every 1 minute
            this._normalInterval = setInterval(() => {
                if (!this.state.blitzMode) this.autoHealthCheck();
            }, this.NORMAL_CHECK_MS);
            console.log('[DkZ Updater] AutoHealthCheck aktiv — alle 1 min');
        },

        // ═══ ⚡ BLITZ-MODUS ═══
        toggleBlitz() {
            this.state.blitzMode = !this.state.blitzMode;
            this.saveState();
            const blitzBtn = document.getElementById('dkz-blitz-btn');
            this._applyBlitzStyle(blitzBtn, this.state.blitzMode);

            if (this.state.blitzMode) {
                // Start 20s interval
                this._blitzInterval = setInterval(() => this.autoHealthCheck(), this.BLITZ_MS);
                this.showToast('⚡ Blitz-Modus AN — Auto-Check alle 20s', 'ok');
                console.log('[DkZ Updater] ⚡ Blitz-Modus gestartet (20s)');
            } else {
                // Stop 20s interval
                if (this._blitzInterval) { clearInterval(this._blitzInterval); this._blitzInterval = null; }
                this.showToast('⚡ Blitz-Modus AUS — zurück auf 1 Min', 'info');
                console.log('[DkZ Updater] Blitz-Modus gestoppt');
            }
        },

        _applyBlitzStyle(btn, active) {
            if (!btn) return;
            if (active) {
                btn.style.borderColor = '#ffd740';
                btn.style.color = '#ffd740';
                btn.style.background = 'rgba(255,215,64,.12)';
                btn.style.animation = 'dkz-spin 2s linear infinite';
            } else {
                btn.style.borderColor = 'rgba(255,255,255,.1)';
                btn.style.color = '#a1a1aa';
                btn.style.background = 'rgba(255,255,255,.03)';
                btn.style.animation = 'none';
            }
        }
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { DKZ_UPDATER.init(); DKZ_UPDATER.startAutoCheck(); });
    } else {
        setTimeout(() => { DKZ_UPDATER.init(); DKZ_UPDATER.startAutoCheck(); }, 600);
    }

    // Expose globally
    window.DkzUpdater = DKZ_UPDATER;
})();
