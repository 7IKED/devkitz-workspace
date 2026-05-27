/* ═══════════════════════════════════════════════ */
/* WISPE™ — Setup Panel Logic                     */
/* ═══════════════════════════════════════════════ */

const SetupPanel = (() => {
    const STORAGE_KEY = 'wispe_config';

    function init() {
        const btnSetup = document.getElementById('btnSetup');
        const setupClose = document.getElementById('setupClose');
        const btnOpenFull = document.getElementById('btnOpenFullSetup');

        if (btnSetup) btnSetup.addEventListener('click', show);
        if (setupClose) setupClose.addEventListener('click', hide);
        if (btnOpenFull) btnOpenFull.addEventListener('click', () => {
            show();
            ConsoleBar.hide();
        });

        // Accordion toggles
        document.querySelectorAll('.section-head[data-toggle]').forEach(head => {
            head.addEventListener('click', () => {
                const key = head.dataset.toggle;
                const body = head.nextElementSibling;
                if (!body) return;
                const isOpen = !body.classList.contains('collapsed');
                // Close all
                document.querySelectorAll('.section-body').forEach(b => b.classList.add('collapsed'));
                document.querySelectorAll('.section-head').forEach(h => h.classList.remove('open'));
                // Toggle current
                if (!isOpen) {
                    body.classList.remove('collapsed');
                    head.classList.add('open');
                }
            });
        });

        // Connect buttons
        bindConnect('btnSupaConnect', 'supabaseStatus', ['supaUrl', 'supaKey'], 'Supabase');
        bindConnect('btnManusConnect', 'manusStatus', ['manusApi', 'manusModel'], 'OpenManus');
        bindConnect('btnAssistConnect', 'assistantStatus', ['assistApi', 'assistModel'], 'Assistant');
        bindConnect('btnOntherunConnect', 'ontherunStatus', ['ontherunApi'], 'ONTHERUN™');

        // Google Login
        const btnGoogle = document.getElementById('btnGoogleLogin');
        if (btnGoogle) btnGoogle.addEventListener('click', simulateGoogleLogin);

        // Load saved config
        loadConfig();
    }

    function show() {
        const panel = document.getElementById('setupPanel');
        if (panel) {
            panel.classList.remove('hidden');
            panel.style.animation = 'none';
            panel.offsetHeight; // reflow
            panel.style.animation = '';
        }
    }

    function hide() {
        const panel = document.getElementById('setupPanel');
        if (panel) panel.classList.add('hidden');
    }

    function toggle() {
        const panel = document.getElementById('setupPanel');
        if (panel) {
            if (panel.classList.contains('hidden')) show();
            else hide();
        }
    }

    function bindConnect(btnId, statusId, fieldIds, serviceName) {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        btn.addEventListener('click', () => {
            const values = {};
            let allFilled = true;
            fieldIds.forEach(id => {
                const input = document.getElementById(id);
                values[id] = input ? input.value.trim() : '';
                if (!values[id]) allFilled = false;
            });

            const statusEl = document.getElementById(statusId);
            if (!allFilled) {
                if (statusEl) {
                    statusEl.textContent = 'Felder ausfüllen!';
                    statusEl.className = 'sec-status';
                }
                return;
            }

            // Simulate connection
            btn.disabled = true;
            btn.textContent = 'Verbinde...';

            setTimeout(() => {
                if (statusEl) {
                    statusEl.textContent = 'Verbunden ✓';
                    statusEl.classList.add('connected');
                }
                btn.textContent = 'Verbunden';
                btn.disabled = false;

                // Save config
                saveField(serviceName, values);

                // Update quick setup
                updateQuickSetup(serviceName, true);
            }, 800);
        });
    }

    function simulateGoogleLogin() {
        const btn = document.getElementById('btnGoogleLogin');
        const tokenInfo = document.getElementById('googleTokenInfo');
        const statusEl = document.getElementById('googleStatus');
        const tokenEl = document.getElementById('googleToken');
        const appscriptGroup = document.getElementById('appscriptUrlGroup');

        if (btn) btn.textContent = 'Anmeldung läuft...';

        setTimeout(() => {
            const fakeToken = 'ya29.' + Array.from({ length: 20 }, () =>
                'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                    [Math.floor(Math.random() * 62)]
            ).join('');

            if (btn) {
                btn.innerHTML = '✓ Angemeldet als user@gmail.com';
                btn.style.borderColor = 'var(--green)';
                btn.style.color = 'var(--green)';
            }
            if (tokenInfo) tokenInfo.classList.remove('hidden');
            if (tokenEl) tokenEl.textContent = fakeToken.substring(0, 30) + '...';
            if (statusEl) {
                statusEl.textContent = 'Verbunden ✓';
                statusEl.classList.add('connected');
            }
            if (appscriptGroup) appscriptGroup.style.display = 'flex';

            updateQuickSetup('Google', true);

            // Auto-populate ONTHERUN token
            const otrApi = document.getElementById('ontherunApi');
            if (otrApi && !otrApi.value) {
                otrApi.value = 'http://localhost:3100/mcp';
            }

            // Simulate 24h refresh cycle
            startTokenRefresh();
        }, 1500);
    }

    function startTokenRefresh() {
        const refreshEl = document.getElementById('googleRefresh');
        if (!refreshEl) return;
        let hours = 24;
        setInterval(() => {
            hours--;
            if (hours <= 0) hours = 24;
            refreshEl.textContent = `Nächster Refresh: ${hours}h`;
        }, 60000); // Update every minute (simulated)
    }

    function saveField(key, values) {
        const config = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        config[key] = values;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }

    function loadConfig() {
        const config = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        Object.entries(config).forEach(([key, values]) => {
            if (typeof values === 'object') {
                Object.entries(values).forEach(([fieldId, val]) => {
                    const input = document.getElementById(fieldId);
                    if (input) input.value = val;
                });
                updateQuickSetup(key, true);
            }
        });
    }

    function updateQuickSetup(service, connected) {
        const map = {
            'Supabase': 'qsSupabase',
            'OpenManus': 'qsManus',
            'Assistant': 'qsAssist',
            'ONTHERUN™': 'qsOtr',
            'Google': 'qsGoogle'
        };
        const id = map[service];
        if (id) {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = connected ? '✓' : '—';
                el.style.color = connected ? 'var(--green)' : '';
            }
        }
    }

    return { init, show, hide, toggle };
})();
