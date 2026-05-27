/**
 * DkZ NanoBot v2 — Universelles Chat-Widget fuer alle Module
 * @DKZ:RULES → R21 Shared Scripts
 * @DKZ:TAG → [SYS:nanobot] [CAT:shared] [LANG:js]
 * @version v2.0.0
 *
 * Einbinden (1 Zeile pro Seite):
 *   <script src="../../shared/dkz-nanobot.js" data-module="modul-name"></script>
 *
 * Features:
 * - Multi-Channel: #general, #modul-name, #direct-777
 * - Routing: Chat mit Copilot, James™, einzelnem Modul
 * - Offline-First: Messages queuen in localStorage
 * - Kontext-Aware: Weiss auf welcher Seite der User ist
 * - Mini/Full Modi: Badge → Slide-up Chat Panel
 * - Befehle: .help, .status, .goto, .test, .qa, .clear
 */
const DkzNanoBot = (() => {
    'use strict';
    const VERSION = 'v2.0.0';
    const STORAGE_KEY = 'dkz-nanobot-history';
    const MAX_HISTORY = 200;

    let _open = false;
    let _channel = '#general';
    let _module = '';
    let _ws = null;
    let _connected = false;
    let _history = [];
    let _panelEl = null;
    let _badgeEl = null;
    let _unread = 0;

    function _esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    // ═══ Detect Module from Script Tag ═══
    function _detectModule() {
        const tag = document.querySelector('script[src*="dkz-nanobot"]');
        if (tag && tag.dataset.module) return tag.dataset.module;
        const path = location.pathname;
        const parts = path.split('/').filter(Boolean);
        return parts[parts.length - 2] || parts[parts.length - 1] || 'unknown';
    }

    // ═══ History (localStorage) ═══
    function _loadHistory() {
        try { _history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { _history = []; }
    }

    function _saveHistory() {
        if (_history.length > MAX_HISTORY) _history = _history.slice(-MAX_HISTORY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_history));
    }

    function _addMessage(from, text, channel, type) {
        const msg = { from, text, channel: channel || _channel, type: type || 'text', ts: Date.now(), module: _module };
        _history.push(msg);
        _saveHistory();
        if (_open) _renderMessages();
        if (!_open && from !== 'Du') { _unread++; _updateBadge(); }
        return msg;
    }

    // ═══ Commands ═══
    const _commands = {
        '.help': () => _addMessage('🤖 NanoBot', '📖 Befehle:\n.help — Hilfe\n.status — System-Status\n.goto [modul] — Modul oeffnen\n.test — Tests starten\n.qa — QA Checklist\n.stress — Stress-Tests\n.clear — Chat leeren\n.channel [name] — Kanal wechseln\n.analyze [fehler] — Fehler analysieren', '#system', 'info'),
        '.status': () => {
            const info = `🖥️ Modul: ${_module}\n📡 WebSocket: ${_connected ? '✅ verbunden' : '❌ offline'}\n💬 Channel: ${_channel}\n📝 History: ${_history.length} Nachrichten\n🧪 DOM: ${document.querySelectorAll('*').length} Nodes\n📦 localStorage: ${(JSON.stringify(localStorage).length / 1024).toFixed(1)}KB`;
            _addMessage('🤖 NanoBot', info, '#system', 'info');
        },
        '.goto': (args) => {
            if (!args) { _addMessage('🤖 NanoBot', '⚠️ Benutzung: .goto modul-name', '#system', 'error'); return; }
            _addMessage('🤖 NanoBot', '🚀 Oeffne ' + args + '...', '#system', 'info');
            setTimeout(() => { window.location.href = '../' + args + '/index.html'; }, 500);
        },
        '.test': () => {
            _addMessage('🤖 NanoBot', '🧪 Starte DkzTest...', '#system', 'info');
            if (typeof DkzTest !== 'undefined') { DkzTest.run(); _addMessage('🤖 NanoBot', '✅ Tests abgeschlossen', '#system', 'success'); }
            else _addMessage('🤖 NanoBot', '⚠️ DkzTest nicht geladen', '#system', 'error');
        },
        '.qa': () => {
            _addMessage('🤖 NanoBot', '📋 Starte QA Checklist...', '#system', 'info');
            if (typeof DkzQA !== 'undefined') { DkzQA.run(); _addMessage('🤖 NanoBot', '✅ QA Check abgeschlossen', '#system', 'success'); }
            else _addMessage('🤖 NanoBot', '⚠️ DkzQA nicht geladen', '#system', 'error');
        },
        '.stress': () => {
            _addMessage('🤖 NanoBot', '🔥 Starte Stress-Tests...', '#system', 'info');
            if (typeof DkzStress !== 'undefined') { DkzStress.run().then(() => _addMessage('🤖 NanoBot', '✅ Stress-Tests abgeschlossen', '#system', 'success')); }
            else _addMessage('🤖 NanoBot', '⚠️ DkzStress nicht geladen', '#system', 'error');
        },
        '.clear': () => { _history = []; _saveHistory(); if (_open) _renderMessages(); _addMessage('🤖 NanoBot', '🗑️ Chat geleert', '#system', 'info'); },
        '.channel': (args) => {
            if (!args) { _addMessage('🤖 NanoBot', 'Kanaele: #general, #' + _module + ', #direct-777, #system', '#system', 'info'); return; }
            _channel = args.startsWith('#') ? args : '#' + args;
            _addMessage('🤖 NanoBot', '📡 Kanal gewechselt: ' + _channel, _channel, 'info');
        },
        '.analyze': (args) => {
            if (!args) { _addMessage('🤖 NanoBot', '⚠️ Benutzung: .analyze [Fehlermeldung]', '#system', 'error'); return; }
            _runErrorAnalysis(args);
        }
    };

    async function _callAI(sys, usr, model) {
        // 1. Try local gateway
        try {
            const resp = await fetch('http://localhost:3040/api/v1/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: usr,
                    provider: 'vps-ollama',
                    model: model,
                    systemPrompt: sys
                })
            });
            if (resp.ok) {
                const d = await resp.json();
                if (d.reply) return d.reply;
            }
        } catch (e) {
            console.log('[NanoBot] Local gateway failed, trying VPS directly...');
        }

        // 2. Try direct VPS Ollama
        try {
            const resp = await fetch('http://72.61.93.129:8811/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer DKZ-OLLAMA-2026-SECURE'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: sys },
                        { role: 'user', content: usr }
                    ],
                    temperature: 0.7
                })
            });
            if (resp.ok) {
                const d = await resp.json();
                if (d.choices?.[0]?.message?.content) {
                    return d.choices[0].message.content;
                }
            }
        } catch (e) {
            console.log('[NanoBot] Direct VPS Ollama call failed...');
        }

        // 3. Try FreeAPI Project fallback (if VPS direct failed)
        try {
            const resp = await fetch('http://localhost:3040/api/v1/free-hub/cascade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: usr })
            });
            if (resp.ok) {
                const d = await resp.json();
                if (d.response) return d.response;
            }
        } catch (e) {
            console.log('[NanoBot] Cascade fallback failed...');
        }

        throw new Error('Kein LLM Provider erreichbar.');
    }

    async function _runErrorAnalysis(errorMsg) {
        _addMessage('🤖 NanoBot', '🔍 Fehler-Analyse-Schleife gestartet...', _channel, 'info');

        const sysPrompt = `Du bist der DkZ NanoBot Fehler-Analysator.
Analysiere die Fehlermeldung und gib die Antwort exakt in diesen 4 Abschnitten aus:

### 1. Root Cause (Ursache)
[Detaillierte Analyse der Ursache]

### 2. Pattern (Muster)
[Erkanntes Fehlermuster im DkZ-Oekosystem, z.B. Port-Kollision, XSS-Fehler, R21 Shared Scripts, etc.]

### 3. Hypothese
[Hypothese, warum der Fehler auftritt]

### 4. Fix (Loesung)
[Konkreter Vorschlag zur Behebung, inklusive Code oder Terminal-Befehlen]

Antworte auf Deutsch und verwende keine Umlaute (R8: ae, oe, ue, ss ueberall).`;

        const model = document.getElementById('nb-model') ? document.getElementById('nb-model').value : 'qwen2.5:32b';
        
        try {
            const reply = await _callAI(sysPrompt, errorMsg, model);
            _addMessage('🤖 NanoBot', reply, _channel, 'success');
        } catch (err) {
            _addMessage('🤖 NanoBot', '❌ Fehler bei der Analyse: ' + err.message, _channel, 'error');
        }
    }

    async function _chatWithAI(userMsg) {
        const sysPrompt = `Du bist NanoBot, der freundliche KI-Assistent im DkZ-Oekosystem.
Antworte auf Deutsch und verwende keine Umlaute (R8: ae, oe, ue, ss ueberall).`;
        
        const model = document.getElementById('nb-model') ? document.getElementById('nb-model').value : 'google/gemma-4-26b-a4b-it';
        
        try {
            const reply = await _callAI(sysPrompt, userMsg, model);
            _addMessage('🤖 NanoBot', reply, _channel, 'text');
        } catch (err) {
            _addMessage('🤖 NanoBot', '❌ Fehler: ' + err.message + '\n\nFallback-Antwort: Ich bin aktuell offline. Bitte starte den Gateway oder den Ollama Server auf dem VPS.', _channel, 'error');
        }
    }

    function _processInput(text) {
        if (!text.trim()) return;
        _addMessage('Du', text, _channel, 'user');

        if (text.startsWith('.')) {
            const parts = text.split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1).join(' ');
            if (_commands[cmd]) { _commands[cmd](args); return; }
        }

        // Automatische Fehler-Erkennung
        const errorKeywords = ['error', 'failed', 'crash', 'port', 'conn', 'exception', 'failure', 'reject'];
        const hasErrorKeyword = errorKeywords.some(kw => text.toLowerCase().includes(kw));

        if (hasErrorKeyword) {
            _runErrorAnalysis(text);
        } else {
            _chatWithAI(text);
        }
    }

    // ═══ WebSocket Connection ═══
    function connect(url) {
        url = url || 'ws://localhost:3040/nanobot';
        try {
            _ws = new WebSocket(url);
            _ws.onopen = () => { _connected = true; _updateBadge(); _addMessage('🤖 NanoBot', '✅ Gateway verbunden', '#system', 'success'); };
            _ws.onmessage = (e) => {
                try {
                    const msg = JSON.parse(e.data);
                    _addMessage(msg.from || '🤖', msg.text || msg.content, msg.channel || _channel, msg.type || 'text');
                } catch (err) { /* parse error */ }
            };
            _ws.onerror = () => { _connected = false; _updateBadge(); };
            _ws.onclose = () => { _connected = false; _ws = null; _updateBadge(); };
        } catch (e) { console.log('[NanoBot] Connection failed'); }
    }

    function send(text) {
        if (_ws && _connected) {
            _ws.send(JSON.stringify({ type: 'message', text, channel: _channel, module: _module }));
        }
    }

    // ═══ UI: Badge ═══
    function _createBadge() {
        if (_badgeEl) return;
        _badgeEl = document.createElement('div');
        _badgeEl.id = 'dkz-nanobot-badge';
        _badgeEl.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:9990;cursor:pointer;display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(10,10,10,.9);border:1px solid rgba(255,255,255,.08);border-radius:24px;font-family:Inter,sans-serif;font-size:11px;font-weight:700;color:#f6f6f7;backdrop-filter:blur(16px);box-shadow:0 4px 20px rgba(0,0,0,.4);transition:all .3s;';
        _badgeEl.innerHTML = '<span id="nb-dot" style="width:7px;height:7px;border-radius:50%;background:#fa1e4e"></span> 🤖 NanoBot <span id="nb-unread" style="display:none;background:#fa1e4e;color:#fff;font-size:9px;padding:1px 6px;border-radius:10px;font-weight:800"></span>';
        _badgeEl.addEventListener('click', togglePanel);
        _badgeEl.addEventListener('mouseenter', () => { _badgeEl.style.borderColor = 'rgba(0,255,136,.3)'; _badgeEl.style.boxShadow = '0 4px 20px rgba(0,255,136,.15)'; });
        _badgeEl.addEventListener('mouseleave', () => { _badgeEl.style.borderColor = 'rgba(255,255,255,.08)'; _badgeEl.style.boxShadow = '0 4px 20px rgba(0,0,0,.4)'; });
        document.body.appendChild(_badgeEl);
    }

    function _updateBadge() {
        const dot = document.getElementById('nb-dot');
        const badge = document.getElementById('nb-unread');
        if (dot) dot.style.background = _connected ? '#00ff88' : '#fa1e4e';
        if (badge) {
            if (_unread > 0) { badge.style.display = 'inline'; badge.textContent = _unread; }
            else badge.style.display = 'none';
        }
    }

    // ═══ UI: Chat Panel ═══
    function _createPanel() {
        if (_panelEl) return;
        _panelEl = document.createElement('div');
        _panelEl.id = 'dkz-nanobot-panel';
        _panelEl.style.cssText = 'position:fixed;bottom:60px;right:16px;z-index:9991;width:380px;max-height:500px;background:rgba(8,8,12,.97);border:1px solid rgba(255,255,255,.08);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);backdrop-filter:blur(24px);font-family:Inter,sans-serif;display:none;flex-direction:column;overflow:hidden;';

        _panelEl.innerHTML = `
            <div style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between">
                <div style="display:flex;align-items:center;gap:8px">
                    <span style="font-size:16px">🤖</span>
                    <div>
                        <div style="font-size:12px;font-weight:800;color:#f6f6f7">NanoBot</div>
                        <div style="font-size:9px;color:rgba(255,255,255,.3)">Modul: ${_esc(_module)} · ${_channel}</div>
                    </div>
                </div>
                <div style="display:flex;gap:6px">
                    <select id="nb-model" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:6px;color:#a1a1aa;font-size:9px;padding:3px 6px;font-family:inherit">
                        <option value="google/gemma-4-26b-a4b-it">Gemma 26B</option>
                        <option value="qwen2.5:32b" selected>Qwen 32B</option>
                        <option value="qwen2.5-coder:7b">Qwen Coder 7B</option>
                        <option value="gemma2:2b">Gemma 2B</option>
                        <option value="qwen2.5:3b">Qwen 3B</option>
                        <option value="qwen2.5:7b">Qwen 7B</option>
                    </select>
                    <select id="nb-channel" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:6px;color:#a1a1aa;font-size:9px;padding:3px 6px;font-family:inherit" onchange="DkzNanoBot._setChannel(this.value)">
                        <option value="#general">#general</option>
                        <option value="#${_esc(_module)}">#${_esc(_module)}</option>
                        <option value="#direct-777">#direct-777</option>
                        <option value="#system">#system</option>
                    </select>
                    <button onclick="DkzNanoBot.togglePanel()" style="background:none;border:none;color:#a1a1aa;font-size:16px;cursor:pointer">✕</button>
                </div>
            </div>
            <div id="nb-messages" style="flex:1;overflow-y:auto;padding:12px;max-height:350px;min-height:200px"></div>
            <div style="padding:8px 12px;border-top:1px solid rgba(255,255,255,.06);display:flex;gap:6px">
                <input id="nb-input" type="text" placeholder="Nachricht oder .befehl..." style="flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px 12px;color:#f6f6f7;font-size:12px;font-family:inherit;outline:none" />
                <button id="nb-send" style="background:linear-gradient(135deg,#00ff88,#06b6d4);border:none;border-radius:8px;padding:8px 14px;color:#000;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:.2s">→</button>
            </div>
        `;

        document.body.appendChild(_panelEl);

        // Event handlers
        document.getElementById('nb-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { _processInput(e.target.value); e.target.value = ''; }
        });
        document.getElementById('nb-send').addEventListener('click', () => {
            const input = document.getElementById('nb-input');
            _processInput(input.value); input.value = ''; input.focus();
        });
    }

    function _setChannel(ch) {
        _channel = ch;
        _renderMessages();
    }

    function _renderMessages() {
        const el = document.getElementById('nb-messages');
        if (!el) return;

        const filtered = _history.filter(m => m.channel === _channel || _channel === '#general');
        const recent = filtered.slice(-50);

        if (recent.length === 0) {
            el.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,.2);padding:2rem;font-size:12px">💬 Keine Nachrichten in ' + _esc(_channel) + '<br><span style="font-size:10px">Tippe .help fuer Befehle</span></div>';
            return;
        }

        el.innerHTML = recent.map(m => {
            const isUser = m.from === 'Du';
            const bgColor = isUser ? 'rgba(0,255,136,.08)' : m.type === 'error' ? 'rgba(250,30,78,.08)' : m.type === 'success' ? 'rgba(0,255,136,.05)' : 'rgba(255,255,255,.03)';
            const textColor = m.type === 'error' ? '#fa1e4e' : m.type === 'success' ? '#00ff88' : '#a1a1aa';
            const time = new Date(m.ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

            return `<div style="margin-bottom:6px;padding:8px 10px;border-radius:10px;background:${bgColor};${isUser ? 'margin-left:40px' : 'margin-right:40px'}">
                <div style="display:flex;justify-content:space-between;margin-bottom:2px">
                    <span style="font-size:10px;font-weight:700;color:${isUser ? '#00ff88' : '#55ACEE'}">${_esc(m.from)}</span>
                    <span style="font-size:8px;color:rgba(255,255,255,.15)">${time}</span>
                </div>
                <div style="font-size:11px;color:${textColor};line-height:1.5;white-space:pre-wrap">${_esc(m.text)}</div>
            </div>`;
        }).join('');

        el.scrollTop = el.scrollHeight;
    }

    function togglePanel() {
        _open = !_open;
        if (_open) {
            _createPanel();
            _panelEl.style.display = 'flex';
            _panelEl.style.animation = 'none';
            _panelEl.offsetHeight; // reflow
            _panelEl.style.animation = 'nbSlideUp .3s ease';
            _unread = 0;
            _updateBadge();
            _renderMessages();
            setTimeout(() => { const input = document.getElementById('nb-input'); if (input) input.focus(); }, 100);
        } else {
            if (_panelEl) _panelEl.style.display = 'none';
        }
    }

    // ═══ Animation ═══
    const animStyle = document.createElement('style');
    animStyle.textContent = '@keyframes nbSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(animStyle);

    // ═══ INIT ═══
    function init() {
        _module = _detectModule();
        _channel = '#' + _module;
        _loadHistory();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => { _createBadge(); });
        } else {
            _createBadge();
        }

        // Auto-connect after 2s
        setTimeout(() => { connect(); }, 2000);

        // Welcome message (once per session)
        if (!sessionStorage.getItem('nb-welcomed-' + _module)) {
            sessionStorage.setItem('nb-welcomed-' + _module, '1');
            setTimeout(() => {
                _addMessage('🤖 NanoBot', '👋 Willkommen im ' + _module + ' Modul!\nTippe .help fuer Befehle oder stelle eine Frage.', '#' + _module, 'info');
            }, 1500);
        }

        console.log(`[NanoBot v${VERSION}] Initialisiert fuer Modul: ${_module}`);
    }

    init();

    return {
        version: VERSION,
        connect, send, togglePanel,
        getHistory: () => _history,
        getModule: () => _module,
        isConnected: () => _connected,
        _setChannel, // for UI
    };
})();

if (typeof window !== 'undefined') window.DkzNanoBot = DkzNanoBot;
if (typeof window !== 'undefined') window.NANOBOT = DkzNanoBot;
