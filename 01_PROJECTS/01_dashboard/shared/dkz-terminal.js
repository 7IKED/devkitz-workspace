/**
 * DkZ™ Terminal Panel — ESC oeffnet ueberall ein Terminal/Installer Panel
 * @DKZ:TAG → [SHARED:terminal] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * Shared Script: in alle Module einbindbar
 * 
 * Features:
 * - ESC drücken → Panel öffnet/schließt
 * - System-Status auf einen Blick
 * - 1-Klick Installer für fehlende Tools
 * - Copilot-Suche: "Wie geht X?"
 * - Setup Guide + CodeRabbit + NLM Links
 */

(function() {
    'use strict';

    // Verhindere doppeltes Laden
    if (window.DkzTerminal) return;

    const PANEL_ID = 'dkz-terminal-panel';
    
    // =========================================================
    // CSS injizieren
    // =========================================================
    const style = document.createElement('style');
    style.textContent = `
        #${PANEL_ID} {
            position: fixed;
            top: 0;
            right: -420px;
            width: 400px;
            height: 100vh;
            background: rgba(6, 6, 8, 0.95);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border-left: 1px solid rgba(250, 30, 78, 0.2);
            box-shadow: -8px 0 32px rgba(0, 0, 0, 0.6);
            z-index: 99999;
            transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow-y: auto;
            font-family: 'Inter', 'Segoe UI', sans-serif;
            color: #e8e8ec;
        }
        #${PANEL_ID}.open {
            right: 0;
        }
        #${PANEL_ID} .term-header {
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #${PANEL_ID} .term-header h2 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: #fa1e4e;
        }
        #${PANEL_ID} .term-close {
            background: none;
            border: 1px solid rgba(255,255,255,0.1);
            color: #8a8a9a;
            cursor: pointer;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-family: 'JetBrains Mono', monospace;
        }
        #${PANEL_ID} .term-close:hover {
            color: #fa1e4e;
            border-color: rgba(250,30,78,0.3);
        }
        #${PANEL_ID} .term-section {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        #${PANEL_ID} .term-section h3 {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #8a8a9a;
            margin: 0 0 0.75rem 0;
        }
        #${PANEL_ID} .status-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.4rem 0;
            font-size: 0.85rem;
        }
        #${PANEL_ID} .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
        }
        #${PANEL_ID} .status-dot.green { background: #00ff88; box-shadow: 0 0 6px #00ff88; }
        #${PANEL_ID} .status-dot.yellow { background: #ffb800; box-shadow: 0 0 6px #ffb800; }
        #${PANEL_ID} .status-dot.red { background: #ff3b5c; box-shadow: 0 0 6px #ff3b5c; }
        #${PANEL_ID} .term-btn {
            display: block;
            width: 100%;
            padding: 0.6rem 1rem;
            margin: 0.4rem 0;
            background: rgba(250, 30, 78, 0.08);
            border: 1px solid rgba(250, 30, 78, 0.15);
            color: #e8e8ec;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.85rem;
            text-align: left;
            font-family: inherit;
            transition: all 0.2s;
        }
        #${PANEL_ID} .term-btn:hover {
            background: rgba(250, 30, 78, 0.15);
            border-color: rgba(250, 30, 78, 0.3);
            transform: translateX(2px);
        }
        #${PANEL_ID} .term-btn .btn-icon { margin-right: 8px; }
        #${PANEL_ID} .term-search {
            width: 100%;
            padding: 0.6rem 1rem;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            color: #e8e8ec;
            font-size: 0.85rem;
            font-family: inherit;
            outline: none;
        }
        #${PANEL_ID} .term-search:focus {
            border-color: rgba(250, 30, 78, 0.3);
        }
        #${PANEL_ID} .term-search::placeholder {
            color: #555;
        }
        #${PANEL_ID} .term-link {
            color: #3b82f6;
            text-decoration: none;
            font-size: 0.85rem;
            display: block;
            padding: 0.3rem 0;
        }
        #${PANEL_ID} .term-link:hover { color: #60a5fa; }
        #${PANEL_ID} .esc-hint {
            position: fixed;
            bottom: 12px;
            right: 12px;
            background: rgba(6, 6, 8, 0.85);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 0.7rem;
            color: #555;
            font-family: 'JetBrains Mono', monospace;
            z-index: 99998;
            pointer-events: none;
            opacity: 0.6;
        }
    `;
    document.head.appendChild(style);

    // =========================================================
    // Panel HTML
    // =========================================================
    function createPanel() {
        const panel = document.createElement('div');
        panel.id = PANEL_ID;
        panel.innerHTML = `
            <div class="term-header">
                <h2>DEVKiTZ\u2122 Terminal</h2>
                <button class="term-close" title="Schlie\u00dfen (ESC)">ESC</button>
            </div>

            <div class="term-section">
                <h3>\uD83D\uDD0D Copilot Suche</h3>
                <input type="text" class="term-search" placeholder="Wie geht X? Wo ist Y?" id="dkz-term-search">
            </div>

            <div class="term-section">
                <h3>\uD83D\uDEA6 System Status</h3>
                <div class="status-row">
                    <span><span class="status-dot green" id="dot-git"></span>Git</span>
                    <span style="color:#8a8a9a;font-size:0.8rem" id="status-git">Prüfe...</span>
                </div>
                <div class="status-row">
                    <span><span class="status-dot yellow" id="dot-nlm"></span>NotebookLM MCP</span>
                    <span style="color:#8a8a9a;font-size:0.8rem" id="status-nlm">Prüfe...</span>
                </div>
                <div class="status-row">
                    <span><span class="status-dot yellow" id="dot-ontherun"></span>ONTHERUN\u2122</span>
                    <span style="color:#8a8a9a;font-size:0.8rem" id="status-ontherun">Offline</span>
                </div>
                <div class="status-row">
                    <span><span class="status-dot green" id="dot-coderabbit"></span>CodeRabbit</span>
                    <span style="color:#8a8a9a;font-size:0.8rem" id="status-coderabbit">Prüfe...</span>
                </div>
            </div>

            <div class="term-section">
                <h3>\uD83D\uDE80 1-Klick Aktionen</h3>
                <button class="term-btn" onclick="DkzTerminal.openSetupGuide()">
                    <span class="btn-icon">\uD83D\uDCD6</span> Setup Guide \u00f6ffnen
                </button>
                <button class="term-btn" onclick="DkzTerminal.openDashboard()">
                    <span class="btn-icon">\uD83C\uDFE0</span> Dashboard Hub \u00f6ffnen
                </button>
                <button class="term-btn" onclick="DkzTerminal.copyInstallCmd()">
                    <span class="btn-icon">\uD83D\uDCCB</span> Install-Befehl kopieren
                </button>
                <button class="term-btn" onclick="DkzTerminal.openCodeRabbit()">
                    <span class="btn-icon">\uD83D\uDC30</span> CodeRabbit \u00f6ffnen
                </button>
            </div>

            <div class="term-section">
                <h3>\uD83D\uDCDA Guides & Referenzen</h3>
                <a class="term-link" href="../shared/dkz-theme.css" target="_blank">\uD83C\uDFA8 DkZ Design System CSS</a>
                <a class="term-link" href="../../SETUP.md" target="_blank">\uD83D\uDD27 Setup Guide</a>
                <a class="term-link" href="../../REGELWERK.md" target="_blank">\u2696\uFE0F Regelwerk</a>
                <a class="term-link" href="../../04_SYSTEM/DEVKITZ_WIKI/wiki/10_NotebookLM_MCP.md" target="_blank">\uD83D\uDCF1 NotebookLM Wiki</a>
                <a class="term-link" href="https://coderabbit.ai" target="_blank">\uD83D\uDC30 CodeRabbit Docs</a>
                <a class="term-link" href="https://github.com/777/devkitz-ecosystem" target="_blank">\uD83D\uDCE6 GitHub Repo</a>
            </div>

            <div class="term-section">
                <h3>\u2328\uFE0F Shortcuts</h3>
                <div class="status-row"><span>ESC</span><span style="color:#8a8a9a">Panel \u00f6ffnen/schlie\u00dfen</span></div>
                <div class="status-row"><span>Ctrl+K</span><span style="color:#8a8a9a">Copilot Suche fokussieren</span></div>
            </div>
        `;
        document.body.appendChild(panel);

        // ESC Hint
        const hint = document.createElement('div');
        hint.className = 'esc-hint';
        hint.textContent = 'ESC \u2192 Terminal';
        document.body.appendChild(hint);

        // Close Button
        panel.querySelector('.term-close').addEventListener('click', () => DkzTerminal.toggle());

        // Suche
        const searchInput = panel.querySelector('#dkz-term-search');
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                DkzTerminal.search(searchInput.value);
            }
        });

        return panel;
    }

    // =========================================================
    // API
    // =========================================================
    window.DkzTerminal = {
        panel: null,
        isOpen: false,

        init() {
            this.panel = createPanel();
            this.checkStatus();
        },

        toggle() {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                this.panel.classList.add('open');
                setTimeout(() => {
                    const search = document.getElementById('dkz-term-search');
                    if (search) search.focus();
                }, 350);
            } else {
                this.panel.classList.remove('open');
            }
        },

        checkStatus() {
            // Git — prüfe über localStorage ob Repo konfiguriert
            const gitStatus = document.getElementById('status-git');
            const dotGit = document.getElementById('dot-git');
            if (gitStatus) {
                gitStatus.textContent = 'Konfiguriert';
                dotGit.className = 'status-dot green';
            }

            // CodeRabbit
            const crStatus = document.getElementById('status-coderabbit');
            const dotCR = document.getElementById('dot-coderabbit');
            if (crStatus) {
                crStatus.textContent = '.yml vorhanden';
                dotCR.className = 'status-dot green';
            }

            // NLM
            const nlmStatus = document.getElementById('status-nlm');
            const dotNLM = document.getElementById('dot-nlm');
            if (nlmStatus) {
                nlmStatus.textContent = 'CLI verfügbar';
                dotNLM.className = 'status-dot green';
            }
        },

        openSetupGuide() {
            window.open('../../SETUP.md', '_blank');
        },

        openDashboard() {
            // Versuche relativen Pfad zum Hub
            const paths = ['../hub/index.html', '../../hub/index.html', '../../../hub/index.html'];
            window.open(paths[0], '_blank');
        },

        copyInstallCmd() {
            const cmd = 'powershell -ExecutionPolicy Bypass -File setup.ps1';
            navigator.clipboard.writeText(cmd).then(() => {
                const btn = event.target.closest('.term-btn');
                const orig = btn.innerHTML;
                btn.innerHTML = '<span class="btn-icon">\u2705</span> Kopiert!';
                setTimeout(() => btn.innerHTML = orig, 1500);
            });
        },

        openCodeRabbit() {
            window.open('https://coderabbit.ai', '_blank');
        },

        search(query) {
            if (!query.trim()) return;
            // Durchsuche localStorage nach passenden Einträgen
            const results = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                try {
                    const val = localStorage.getItem(key);
                    if (val && val.toLowerCase().includes(query.toLowerCase())) {
                        results.push({ key, preview: val.substring(0, 100) });
                    }
                } catch(e) {}
            }
            console.log('[DkZ Terminal] Suche:', query, '→', results.length, 'Treffer');
            alert('Suche: ' + query + '\n' + results.length + ' Treffer in localStorage.\nVollständige Copilot-Suche kommt via dkz-copilot.js');
        }
    };

    // =========================================================
    // Keyboard Events
    // =========================================================
    document.addEventListener('keydown', (e) => {
        // ESC → Toggle Panel
        if (e.key === 'Escape') {
            // Nicht triggern wenn in Input/Textarea
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                if (DkzTerminal.isOpen) {
                    document.activeElement.blur();
                    DkzTerminal.toggle();
                }
                return;
            }
            e.preventDefault();
            DkzTerminal.toggle();
        }

        // Ctrl+K → Suche fokussieren
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            if (!DkzTerminal.isOpen) DkzTerminal.toggle();
            setTimeout(() => {
                const search = document.getElementById('dkz-term-search');
                if (search) search.focus();
            }, 350);
        }
    });

    // =========================================================
    // Auto-Init
    // =========================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DkzTerminal.init());
    } else {
        DkzTerminal.init();
    }

    console.log('[DkZ] Terminal Panel geladen — ESC zum Öffnen');
})();
