/**
 * DkZ Auto-Update System v0.01.1_01
 * @DKZ:RULES → Siehe REGELWERK.md (R9 Versionierung, R14 Kaizen)
 * @version v0.01.1_01
 * 
 * Features:
 * - Update-Lampe (🟢 aktuell / 🟡 Update / 🔴 offline)
 * - Toggle: Auto-Update an/aus (localStorage)
 * - Version-Check gegen GitHub API
 * - UI-Injection: Lampe + Toggle in jeden Modul-Header
 */

(function () {
    'use strict';

    const DKZ_UPDATE = {
        // Config
        GITHUB_USER: 'BAZE2',
        CHECK_INTERVAL: 300000, // 5 min
        STORAGE_KEY: 'dkz-autoupdate',

        // State
        state: {
            enabled: true,
            lastCheck: null,
            modules: {},
            status: 'unknown' // 'current', 'update', 'offline'
        },

        /**
         * Initialize auto-update system
         */
        init() {
            this.loadState();
            this.injectUI();
            this.checkForUpdates();

            if (this.state.enabled) {
                setInterval(() => this.checkForUpdates(), this.CHECK_INTERVAL);
            }

            console.log('[DkZ AutoUpdate] Initialized', this.state.enabled ? '(AN)' : '(AUS)');
        },

        /**
         * Load state from localStorage
         */
        loadState() {
            try {
                const saved = localStorage.getItem(this.STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    this.state = { ...this.state, ...parsed };
                }
            } catch (e) {
                console.warn('[DkZ AutoUpdate] State load error:', e);
            }
        },

        /**
         * Save state to localStorage
         */
        saveState() {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
            } catch (e) {
                console.warn('[DkZ AutoUpdate] State save error:', e);
            }
        },

        /**
         * Inject Update Lamp + Toggle into page header
         */
        injectUI() {
            // Find header
            const header = document.querySelector('.header, header, .app-header, [class*="header"]');
            if (!header) return;

            // Create update bar
            const bar = document.createElement('div');
            bar.id = 'dkz-update-bar';
            bar.innerHTML = `
                <style>
                    #dkz-update-bar {
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        padding: 6px 14px;
                        background: rgba(255,255,255,.03);
                        border: 1px solid rgba(255,255,255,.06);
                        border-radius: 10px;
                        font-family: 'Inter', sans-serif;
                        font-size: .72rem;
                    }
                    .update-lamp {
                        width: 10px; height: 10px;
                        border-radius: 50%;
                        display: inline-block;
                        transition: all .3s;
                    }
                    .update-lamp.current { background: #00ff88; box-shadow: 0 0 8px rgba(0,255,136,.4); }
                    .update-lamp.update { background: #ffd740; box-shadow: 0 0 8px rgba(255,215,64,.4); animation: pulse-lamp 1.5s infinite; }
                    .update-lamp.offline { background: #ff4444; box-shadow: 0 0 8px rgba(255,68,68,.4); }
                    .update-lamp.unknown { background: #666; }
                    @keyframes pulse-lamp { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
                    .update-toggle {
                        cursor: pointer;
                        padding: 3px 10px;
                        border-radius: 12px;
                        border: 1px solid rgba(255,255,255,.1);
                        background: rgba(255,255,255,.05);
                        color: #a1a1aa;
                        font-size: .65rem;
                        font-family: inherit;
                        transition: all .2s;
                    }
                    .update-toggle:hover { border-color: #fa1e4e; color: #fff; }
                    .update-toggle.on { background: rgba(0,255,136,.1); border-color: rgba(0,255,136,.3); color: #00ff88; }
                    .update-status { color: #a1a1aa; }
                    .update-version { color: #fa1e4e; font-weight: 600; }
                </style>
                <span class="update-lamp unknown" id="updateLamp" title="Update Status"></span>
                <span class="update-status" id="updateStatus">Prüfe...</span>
                <span class="update-version" id="updateVersion"></span>
                <button class="update-toggle ${this.state.enabled ? 'on' : ''}" id="updateToggle" title="Auto-Update An/Aus">
                    Auto-Update: ${this.state.enabled ? 'AN' : 'AUS'}
                </button>
            `;

            header.appendChild(bar);

            // Toggle handler
            document.getElementById('updateToggle').addEventListener('click', () => this.toggleAutoUpdate());
        },

        /**
         * Toggle auto-update on/off
         */
        toggleAutoUpdate() {
            this.state.enabled = !this.state.enabled;
            this.saveState();

            const btn = document.getElementById('updateToggle');
            btn.textContent = `Auto-Update: ${this.state.enabled ? 'AN' : 'AUS'}`;
            btn.classList.toggle('on', this.state.enabled);

            this.showToast(`Auto-Update ${this.state.enabled ? 'aktiviert ✅' : 'deaktiviert ⚠️'}`);

            if (this.state.enabled) {
                this.checkForUpdates();
            }
        },

        /**
         * Check for updates (GitHub API or local version compare)
         */
        async checkForUpdates() {
            const lamp = document.getElementById('updateLamp');
            const status = document.getElementById('updateStatus');

            try {
                const localVersion = this.getLocalVersion();
                const repo = this.detectRepo() || 'devkitz-ecosystem';

                // GitHub API check — funktioniert auch von file://
                const res = await fetch(`https://api.github.com/repos/${this.GITHUB_USER}/${repo}/commits?per_page=1`, {
                    headers: { 'Accept': 'application/vnd.github.v3+json' }
                });

                if (res.ok) {
                    const data = await res.json();
                    const remoteSha = data[0]?.sha || '';
                    const remoteMsg = data[0]?.commit?.message?.split('\n')[0] || '';
                    const lastSha = this.state.lastSha || '';

                    if (remoteSha && remoteSha !== lastSha) {
                        // Erster Check oder neuer Commit
                        if (lastSha) {
                            this.setStatus('update', `Update: ${remoteMsg.substring(0, 40)}`, localVersion);
                            this.showToast(`🔄 Neuer Commit: ${remoteMsg.substring(0, 50)}`);
                        } else {
                            this.setStatus('current', `Aktuell v${localVersion || '?'}`, localVersion);
                        }
                        this.state.lastSha = remoteSha;
                    } else {
                        this.setStatus('current', `Aktuell v${localVersion || '?'}`, localVersion);
                    }

                    this.state.lastCheck = new Date().toISOString();
                    this.saveState();
                } else if (res.status === 403) {
                    // Rate limit — zeige lokale Version
                    this.setStatus('current', `Lokal v${localVersion || '?'}`, localVersion);
                } else {
                    this.setStatus('offline', 'API Error', localVersion);
                }
            } catch (e) {
                // Netzwerk-Fehler (offline) — graceful degradation
                this.setStatus('current', `Lokal v${this.getLocalVersion() || '?'}`, this.getLocalVersion());
            }
        },

        /**
         * Set update status UI
         */
        setStatus(type, text, version) {
            const lamp = document.getElementById('updateLamp');
            const status = document.getElementById('updateStatus');
            const ver = document.getElementById('updateVersion');

            if (lamp) {
                lamp.className = `update-lamp ${type}`;
                lamp.title = text;
            }
            if (status) status.textContent = text;
            if (ver && version) ver.textContent = `v${version}`;

            this.state.status = type;
        },

        /**
         * Get local version from page or features.json
         */
        getLocalVersion() {
            // From meta tag
            const meta = document.querySelector('meta[name="dkz-version"]');
            if (meta) return meta.content;

            // From title
            const title = document.title;
            const match = title.match(/v(\d+\.\d+[\.\d_]*)/);
            if (match) return match[1];

            return '0.01.1_01';
        },

        /**
         * Detect which repo this module belongs to
         */
        detectRepo() {
            const path = location.pathname.toLowerCase();
            if (path.includes('dashboard') || path.includes('modules')) return 'devkitz-dashboard';
            if (path.includes('domain')) return 'devkitz-domain-control';
            if (path.includes('doc_engine')) return 'devkitz-doc-engine';
            if (path.includes('aiaikirk')) return 'devkitz-aiaikirk';
            if (path.includes('autopilot')) return 'devkitz-autopilot';
            if (path.includes('prompt')) return 'devkitz-prompt-builder';
            return null;
        },

        /**
         * Show toast notification
         */
        showToast(msg) {
            // Use DkZ toast if available
            if (window.DkzToast) {
                window.DkzToast.show(msg);
                return;
            }
            const t = document.createElement('div');
            t.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:12px 20px;background:#1a1a1c;border:1px solid #333;border-radius:10px;color:#f6f6f7;font-family:Inter,sans-serif;font-size:.8rem;z-index:99999;animation:fadeIn .3s ease;box-shadow:0 8px 30px rgba(0,0,0,.4)';
            t.textContent = msg;
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 3000);
        },

        /**
         * Get module update status for Hub integration
         */
        getModuleStatuses() {
            return this.state.modules;
        }
    };

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DKZ_UPDATE.init());
    } else {
        DKZ_UPDATE.init();
    }

    // Expose globally for Hub integration
    window.DkzAutoUpdate = DKZ_UPDATE;
})();
