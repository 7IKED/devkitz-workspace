/* ═══════════════════════════════════════════════ */
/* WISPE™ — Console Bar (ESC)                     */
/* ═══════════════════════════════════════════════ */

const ConsoleBar = (() => {
    let isOpen = false;
    const COMMANDS = {
        help: () => [
            { type: 'accent', text: '── Wispe™ Befehle ──' },
            { type: 'system', text: 'help          — Diese Hilfe anzeigen' },
            { type: 'system', text: 'status        — System-Status' },
            { type: 'system', text: 'clear         — Terminal leeren' },
            { type: 'system', text: 'record        — Aufnahme starten/stoppen' },
            { type: 'system', text: 'devices       — Audio-Geräte anzeigen' },
            { type: 'system', text: 'sync          — Mobile QR-Code anzeigen' },
            { type: 'system', text: 'setup         — Setup Panel öffnen' },
            { type: 'system', text: 'rules         — Wispe-Regeln anzeigen' },
            { type: 'system', text: 'nanobot       — Nanobot Status' },
            { type: 'system', text: 'version       — Version anzeigen' },
        ],
        status: () => [
            { type: 'accent', text: '── System Status ──' },
            { type: 'success', text: `Mic: ${MicEngine.isRecording ? 'Recording' : 'Standby'}` },
            { type: 'system', text: `Nanobot: ${document.getElementById('nanobotToggle')?.checked ? 'Aktiv' : 'Standby'}` },
            { type: 'system', text: `Ralph-Loop: ${document.getElementById('ralphToggle')?.checked ? 'Aktiv' : 'Standby'}` },
            { type: 'system', text: `James™: ${document.getElementById('jamesToggle')?.checked ? 'Aktiv' : 'Standby'}` },
            { type: 'system', text: `Storage: Cloudflare / Oracle DB` },
        ],
        clear: () => {
            const output = document.getElementById('terminalOutput');
            if (output) output.innerHTML = '';
            return [];
        },
        record: () => {
            document.getElementById('micBtn')?.click();
            return [{ type: 'success', text: 'Toggle Recording...' }];
        },
        devices: () => {
            DeviceManager.show();
            return [{ type: 'system', text: 'Geräte-Dialog geöffnet.' }];
        },
        sync: () => {
            QRSync.show();
            return [{ type: 'system', text: 'QR-Code Modal geöffnet.' }];
        },
        setup: () => {
            SetupPanel.show();
            return [{ type: 'system', text: 'Setup Panel geöffnet.' }];
        },
        rules: () => {
            document.getElementById('rulesPanel')?.classList.remove('hidden');
            return [{ type: 'system', text: 'Wispe-Regeln geöffnet.' }];
        },
        nanobot: () => [
            { type: 'accent', text: '── Nanobot™ ──' },
            { type: 'system', text: 'Kategorien: Notiz, Idee, Meeting, Lead, Archiv' },
            { type: 'system', text: 'Klassifikation: Keyword-basiert + Längenanalyse' },
            { type: 'system', text: 'Meeting-Modus: Kein 5-Sek-Split, bleibt ein Block' },
        ],
        version: () => [
            { type: 'accent', text: 'Wispe™ Agent Framework v1.0.0' },
            { type: 'system', text: 'DkZ™ Design System v2' },
            { type: 'system', text: 'Build: 2026-03-17' },
        ],
    };

    function init() {
        const closeBtn = document.getElementById('consoleClose');
        if (closeBtn) closeBtn.addEventListener('click', hide);

        // Tab switching
        document.querySelectorAll('.console-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const panel = tab.dataset.panel;
                switchTab(panel);
            });
        });

        // Terminal input
        const input = document.getElementById('terminalInput');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const cmd = input.value.trim().toLowerCase();
                    input.value = '';
                    executeCommand(cmd);
                }
            });
        }

        // ESC key global
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                toggle();
            }
        });
    }

    function show() {
        const bar = document.getElementById('consoleBar');
        if (bar) {
            bar.classList.remove('hidden');
            bar.style.animation = 'none';
            bar.offsetHeight;
            bar.style.animation = '';
            isOpen = true;
            // Focus terminal input
            setTimeout(() => {
                document.getElementById('terminalInput')?.focus();
            }, 100);
        }
    }

    function hide() {
        const bar = document.getElementById('consoleBar');
        if (bar) {
            bar.classList.add('hidden');
            isOpen = false;
        }
    }

    function toggle() {
        if (isOpen) hide();
        else show();
    }

    function switchTab(panelName) {
        document.querySelectorAll('.console-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.panel === panelName);
        });
        document.querySelectorAll('.console-panel').forEach(p => {
            p.classList.toggle('active', p.id === `panel${capitalize(panelName)}`);
        });
        // Focus terminal input if terminal tab
        if (panelName === 'terminal') {
            setTimeout(() => document.getElementById('terminalInput')?.focus(), 50);
        }
    }

    function executeCommand(cmd) {
        const output = document.getElementById('terminalOutput');
        if (!output) return;

        // Echo the command
        appendLine(output, 'system', `<span class="term-prompt">❯</span> ${escapeHTML(cmd)}`);

        const handler = COMMANDS[cmd];
        if (handler) {
            const lines = handler();
            lines.forEach(line => appendLine(output, line.type, line.text));
        } else if (cmd) {
            appendLine(output, 'error', `Unbekannter Befehl: '${escapeHTML(cmd)}'. Tippe 'help'.`);
        }

        output.scrollTop = output.scrollHeight;
    }

    function appendLine(container, type, text) {
        const div = document.createElement('div');
        div.className = `term-line ${type}`;
        div.innerHTML = `<span class="term-prompt">wispe™</span> ${text}`;
        container.appendChild(div);
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { init, show, hide, toggle, get isOpen() { return isOpen; } };
})();
