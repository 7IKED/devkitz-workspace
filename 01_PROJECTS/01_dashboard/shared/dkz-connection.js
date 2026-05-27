/**
 * DkZ Connection — Server-First mit Auto-Fallback
 * @DKZ:RULES → R21, R12
 * @DKZ:TAG → [SYS:connection] [CAT:shared] [LANG:js]
 * @version v0.01
 *
 * ═══════════════════════════════════════════════════════════════
 * ARCHITEKTUR:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  1. IMMER zuerst ONTHERUN™ Server kontaktieren             │
 * │  2. Server antwortet → Server-Modus (BEVORZUGT!)           │
 * │  3. Server offline → Auto-Fallback auf localStorage        │
 * │  4. Nahtloser Übergang — User merkt nichts                 │
 * │  5. Bei Server-Rückkehr → automatisch reconnecten          │
 * │  6. Arbeitet MIT dkz-auth.js zusammen (nicht ersetzen!)    │
 * │                                                             │
 * │  APIs: DkzConn.init(), .getKey(), .showKeyPopup()          │
 * │  Events: 'dkz-conn-mode-change', 'dkz-conn-ready'         │
 * └─────────────────────────────────────────────────────────────┘
 * ═══════════════════════════════════════════════════════════════
 */

const DkzConn = (() => {
    'use strict';

    const VERSION = '0.01';

    // ═══ KONFIGURATION ═══
    const CFG = {
        serverUrl: localStorage.getItem('dkz-server-url') || 'https://api.devkitz.eu',
        healthPath: '/health',
        keysPath: '/api/keys',
        healthTimeout: 3000,
        reconnectMs: 30000,
        LS_KEYS: 'dkz-api-keys',
        LS_MODE: 'dkz-conn-mode',
        LS_SERVER: 'dkz-server-url',

        providers: {
            openai:    { name: 'OpenAI',          icon: '🤖', url: 'https://platform.openai.com/api-keys',   ph: 'sk-...', c: '#10a37f' },
            gemini:    { name: 'Google Gemini',    icon: '💎', url: 'https://aistudio.google.com/apikey',     ph: 'AIza...', c: '#4285f4' },
            anthropic: { name: 'Anthropic Claude', icon: '🧠', url: 'https://console.anthropic.com',         ph: 'sk-ant-...', c: '#d4a574' },
            groq:      { name: 'Groq',             icon: '⚡', url: 'https://console.groq.com/keys',         ph: 'gsk_...', c: '#f55036' },
            mistral:   { name: 'Mistral',          icon: '🌊', url: 'https://console.mistral.ai/api-keys',   ph: '...', c: '#ff7000' },
            github:    { name: 'GitHub PAT',       icon: '🐱', url: 'https://github.com/settings/tokens',    ph: 'ghp_...', c: '#6e5494' }
        }
    };

    // ═══ STATE ═══
    let S = {
        mode: 'checking', // 'server' | 'local' | 'checking'
        connected: false,
        serverUrl: CFG.serverUrl,
        keys: {},
        timer: null,
        ready: false
    };

    // ═══ STYLES ═══
    function css() {
        if (document.getElementById('dkz-conn-css')) return;
        const el = document.createElement('style');
        el.id = 'dkz-conn-css';
        el.textContent = `
#dkz-conn-overlay{position:fixed;inset:0;z-index:11000;background:rgba(0,0,0,.7);
    backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .4s}
#dkz-conn-overlay.show{opacity:1;pointer-events:all}
#dkz-conn-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(.92);
    z-index:11001;background:rgba(10,10,14,.98);backdrop-filter:blur(32px);
    border:1px solid rgba(250,30,78,.15);border-radius:20px;padding:0;
    width:420px;max-width:92vw;max-height:90vh;overflow-y:auto;
    font-family:'Inter',sans-serif;opacity:0;pointer-events:none;
    transition:all .4s cubic-bezier(.4,0,.15,1);
    box-shadow:0 24px 80px rgba(0,0,0,.7),0 0 60px rgba(250,30,78,.04)}
#dkz-conn-modal.show{opacity:1;pointer-events:all;transform:translate(-50%,-50%) scale(1)}
.dkc-hdr{padding:28px 28px 16px;border-bottom:1px solid rgba(250,30,78,.06);
    display:flex;align-items:center;justify-content:space-between}
.dkc-hdr h2{font-size:16px;font-weight:700;color:#f6f6f7;margin:0;display:flex;align-items:center;gap:8px}
.dkc-badge{font-size:8px;letter-spacing:1.5px;padding:3px 8px;border-radius:4px;
    font-family:'JetBrains Mono',monospace;font-weight:600}
.dkc-badge.server{background:rgba(0,255,136,.08);color:#00ff88;border:1px solid rgba(0,255,136,.2)}
.dkc-badge.local{background:rgba(255,184,0,.08);color:#ffb800;border:1px solid rgba(255,184,0,.2)}
.dkc-badge.checking{background:rgba(59,130,246,.08);color:#3b82f6;border:1px solid rgba(59,130,246,.2);
    animation:dkcPulse 1.5s ease-in-out infinite}
@keyframes dkcPulse{0%,100%{opacity:1}50%{opacity:.4}}
.dkc-close{background:none;border:none;color:rgba(161,161,170,.4);font-size:18px;cursor:pointer;padding:4px;transition:.2s}
.dkc-close:hover{color:#fa1e4e}
.dkc-sbar{margin:12px 28px;padding:8px 12px;background:rgba(0,0,0,.3);border:1px solid rgba(51,51,56,.4);
    border-radius:10px;display:flex;align-items:center;gap:8px}
.dkc-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;transition:.4s}
.dkc-dot.g{background:#00ff88;box-shadow:0 0 8px rgba(0,255,136,.5)}
.dkc-dot.r{background:#ff3b5c;box-shadow:0 0 8px rgba(255,59,92,.5)}
.dkc-dot.y{background:#ffb800;box-shadow:0 0 8px rgba(255,184,0,.5);animation:dkcPulse 1s infinite}
.dkc-sbar input{flex:1;background:none;border:none;color:#e8e8ec;font-size:11px;
    font-family:'JetBrains Mono',monospace;outline:none}
.dkc-rbtn{background:rgba(250,30,78,.08);border:1px solid rgba(250,30,78,.2);color:rgba(250,30,78,.7);
    padding:3px 10px;border-radius:6px;font-size:9px;cursor:pointer;
    font-family:'JetBrains Mono',monospace;transition:.2s}
.dkc-rbtn:hover{background:rgba(250,30,78,.15);color:#fa1e4e}
.dkc-fallback{margin:0 28px 8px;padding:10px 14px;background:rgba(255,184,0,.04);
    border:1px solid rgba(255,184,0,.12);border-radius:8px;font-size:10px;
    color:rgba(255,184,0,.7);display:none;line-height:1.5}
.dkc-fallback.show{display:block}
.dkc-fallback strong{color:#ffb800}
.dkc-provs{padding:8px 28px 20px}
.dkc-pcard{display:flex;align-items:center;gap:12px;padding:10px 14px;margin-bottom:8px;
    background:rgba(0,0,0,.2);border:1px solid rgba(51,51,56,.3);border-radius:12px;transition:.25s}
.dkc-pcard:hover{border-color:rgba(250,30,78,.2);background:rgba(250,30,78,.02)}
.dkc-pcard.ok{border-color:rgba(0,255,136,.15);background:rgba(0,255,136,.02)}
.dkc-picon{font-size:20px;width:28px;text-align:center;flex-shrink:0}
.dkc-pinfo{flex:1;min-width:0}
.dkc-pname{font-size:12px;font-weight:600;color:#e8e8ec}
.dkc-plink{font-size:8px;letter-spacing:.5px;color:rgba(59,130,246,.6);
    text-decoration:none;font-family:'JetBrains Mono',monospace;transition:.2s}
.dkc-plink:hover{color:#3b82f6}
.dkc-pinput{width:100%;background:rgba(0,0,0,.3);border:1px solid rgba(51,51,56,.4);
    color:#e8e8ec;padding:6px 10px;font-size:11px;font-family:'JetBrains Mono',monospace;
    border-radius:6px;outline:none;margin-top:4px;transition:.2s}
.dkc-pinput:focus{border-color:rgba(250,30,78,.4)}
.dkc-pinput.saved{border-color:rgba(0,255,136,.3)}
.dkc-pstatus{font-size:14px;flex-shrink:0}
.dkc-foot{padding:16px 28px;border-top:1px solid rgba(51,51,56,.2);display:flex;gap:10px}
.dkc-btn{flex:1;padding:10px;border-radius:10px;font-size:12px;font-weight:600;
    cursor:pointer;transition:.25s;font-family:'Inter',sans-serif;border:none}
.dkc-btn.pri{background:linear-gradient(135deg,rgba(250,30,78,.15),rgba(250,30,78,.08));
    border:1px solid rgba(250,30,78,.3);color:#fa1e4e}
.dkc-btn.pri:hover{background:linear-gradient(135deg,rgba(250,30,78,.25),rgba(250,30,78,.15));
    box-shadow:0 4px 20px rgba(250,30,78,.15)}
.dkc-btn.gho{background:transparent;border:1px solid rgba(51,51,56,.4);color:rgba(161,161,170,.6)}
.dkc-btn.gho:hover{border-color:rgba(161,161,170,.3);color:#a1a1aa}
.dkc-toast{position:fixed;bottom:20px;right:20px;z-index:11010;padding:10px 18px;
    border-radius:10px;font-size:11px;font-weight:500;font-family:'Inter',sans-serif;
    opacity:0;transform:translateY(10px);transition:all .4s;pointer-events:none;
    display:flex;align-items:center;gap:8px}
.dkc-toast.show{opacity:1;transform:translateY(0)}
.dkc-toast.ok{background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.2);color:#00ff88}
.dkc-toast.warn{background:rgba(255,184,0,.1);border:1px solid rgba(255,184,0,.2);color:#ffb800}
.dkc-toast.err{background:rgba(255,59,92,.1);border:1px solid rgba(255,59,92,.2);color:#ff3b5c}
`;
        document.head.appendChild(el);
    }

    // ═══ SERVER CHECK ═══
    async function ping(url) {
        try {
            const ac = new AbortController();
            const t = setTimeout(() => ac.abort(), CFG.healthTimeout);
            const r = await fetch((url || S.serverUrl) + CFG.healthPath, {
                method: 'GET', signal: ac.signal, headers: { Accept: 'application/json' }
            });
            clearTimeout(t);
            return r.ok;
        } catch { return false; }
    }

    // ═══ MODE ═══
    function setMode(m) {
        const prev = S.mode;
        S.mode = m;
        S.connected = (m === 'server');
        localStorage.setItem(CFG.LS_MODE, m);
        if (prev !== m) {
            window.dispatchEvent(new CustomEvent('dkz-conn-mode-change', { detail: { mode: m, prev } }));
            toast(m === 'server' ? '🟢 Server verbunden — ONTHERUN™' : '🟡 Offline — Lokaler Modus', m === 'server' ? 'ok' : 'warn');
            if (typeof window.DkzLiveTicker !== 'undefined') {
                window.DkzLiveTicker.send({
                    type: m === 'server' ? 'success' : 'warning',
                    message: m === 'server' ? 'Connection: Server-Modus' : 'Connection: Lokal (Fallback)',
                    source: 'dkz-connection'
                });
            }
        }
    }

    function toast(msg, type) {
        let t = document.getElementById('dkc-toast');
        if (!t) { t = document.createElement('div'); t.id = 'dkc-toast'; t.className = 'dkc-toast'; document.body.appendChild(t); }
        t.textContent = msg;
        t.className = `dkc-toast ${type}`;
        requestAnimationFrame(() => t.classList.add('show'));
        setTimeout(() => t.classList.remove('show'), 4000);
    }

    // ═══ KEYS ═══
    function loadKeys() { try { S.keys = JSON.parse(localStorage.getItem(CFG.LS_KEYS) || '{}'); } catch { S.keys = {}; } return S.keys; }
    function saveKeys(k) { S.keys = { ...S.keys, ...k }; localStorage.setItem(CFG.LS_KEYS, JSON.stringify(S.keys)); if (S.connected) syncUp().catch(() => {}); }
    function getKey(p) { if (!S.keys || !Object.keys(S.keys).length) loadKeys(); return S.keys[p] || null; }
    function hasKeys() { loadKeys(); return Object.values(S.keys).some(k => k && k.length > 5); }

    // ═══ SERVER SYNC ═══
    async function syncUp() {
        if (!S.connected) return;
        try { await fetch(S.serverUrl + CFG.keysPath, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keys: S.keys }) }); } catch {}
    }
    async function syncDown() {
        if (!S.connected) return;
        try {
            const r = await fetch(S.serverUrl + CFG.keysPath);
            if (r.ok) { const d = await r.json(); if (d.keys) { S.keys = { ...S.keys, ...d.keys }; localStorage.setItem(CFG.LS_KEYS, JSON.stringify(S.keys)); } }
        } catch {}
    }

    // ═══ RECONNECT LOOP ═══
    function startLoop() {
        if (S.timer) return;
        S.timer = setInterval(async () => {
            if (S.connected) return;
            if (await ping()) { setMode('server'); await syncDown(); }
        }, CFG.reconnectMs);
    }

    // ═══ POPUP ═══
    function showKeyPopup() {
        css();
        if (document.getElementById('dkz-conn-modal')) {
            document.getElementById('dkz-conn-modal').classList.add('show');
            document.getElementById('dkz-conn-overlay').classList.add('show');
            return;
        }
        loadKeys();

        const ov = document.createElement('div'); ov.id = 'dkz-conn-overlay';
        ov.addEventListener('click', hideKeyPopup);
        const m = document.createElement('div'); m.id = 'dkz-conn-modal';

        const badge = S.mode === 'server' ? '<span class="dkc-badge server">SERVER</span>'
            : S.mode === 'local' ? '<span class="dkc-badge local">LOKAL</span>'
            : '<span class="dkc-badge checking">PRÜFE...</span>';
        const dot = S.connected ? 'g' : 'r';
        const fb = S.mode === 'local' ? ' show' : '';

        let cards = '';
        for (const [k, p] of Object.entries(CFG.providers)) {
            const has = S.keys[k] && S.keys[k].length > 5;
            const masked = has ? S.keys[k].substring(0, 6) + '•••' + S.keys[k].slice(-4) : '';
            cards += `<div class="dkc-pcard${has ? ' ok' : ''}" data-p="${k}">
                <span class="dkc-picon">${p.icon}</span>
                <div class="dkc-pinfo">
                    <div class="dkc-pname">${p.name}</div>
                    <a class="dkc-plink" href="${p.url}" target="_blank" rel="noopener">Key holen →</a>
                    <input type="password" class="dkc-pinput${has ? ' saved' : ''}" data-k="${k}" placeholder="${p.ph}" value="${has ? S.keys[k] : ''}">
                </div>
                <span class="dkc-pstatus">${has ? '✅' : '⬜'}</span>
            </div>`;
        }

        m.innerHTML = `
        <div class="dkc-hdr"><h2>🔑 API Keys ${badge}</h2><button class="dkc-close" onclick="DkzConn.hideKeyPopup()">✕</button></div>
        <div class="dkc-sbar">
            <span class="dkc-dot ${dot}" id="dkcDot"></span>
            <input type="text" id="dkcUrl" value="${S.serverUrl}" placeholder="https://api.devkitz.eu">
            <button class="dkc-rbtn" onclick="DkzConn.reconnect()">⟳ Verbinden</button>
        </div>
        <div class="dkc-fallback${fb}" id="dkcFb"><strong>⚠️ Offline-Modus:</strong> Server nicht erreichbar. Keys werden lokal gespeichert. Bei Verbindung automatische Sync.</div>
        <div class="dkc-provs">${cards}</div>
        <div class="dkc-foot">
            <button class="dkc-btn pri" onclick="DkzConn._save()">💾 Speichern</button>
            <button class="dkc-btn gho" onclick="DkzConn.hideKeyPopup()">Später</button>
        </div>`;

        document.body.appendChild(ov);
        document.body.appendChild(m);
        requestAnimationFrame(() => { ov.classList.add('show'); m.classList.add('show'); });
    }

    function hideKeyPopup() {
        const m = document.getElementById('dkz-conn-modal');
        const o = document.getElementById('dkz-conn-overlay');
        if (m) m.classList.remove('show');
        if (o) o.classList.remove('show');
        setTimeout(() => { if (m) m.remove(); if (o) o.remove(); }, 400);
    }

    function _save() {
        const inputs = document.querySelectorAll('.dkc-pinput');
        const nk = {};
        inputs.forEach(i => {
            const k = i.dataset.k, v = i.value.trim();
            if (v) {
                nk[k] = v; i.classList.add('saved');
                const c = i.closest('.dkc-pcard');
                if (c) { c.classList.add('ok'); c.querySelector('.dkc-pstatus').textContent = '✅'; }
            }
        });
        const u = document.getElementById('dkcUrl');
        if (u && u.value.trim()) { S.serverUrl = u.value.trim().replace(/\/$/, ''); localStorage.setItem(CFG.LS_SERVER, S.serverUrl); }
        saveKeys(nk);
        toast('💾 Keys gespeichert!', 'ok');
        setTimeout(hideKeyPopup, 1500);
    }

    // ═══ RECONNECT ═══
    async function reconnect() {
        const u = document.getElementById('dkcUrl');
        const d = document.getElementById('dkcDot');
        const fb = document.getElementById('dkcFb');
        if (u) { S.serverUrl = u.value.trim().replace(/\/$/, ''); localStorage.setItem(CFG.LS_SERVER, S.serverUrl); }
        if (d) d.className = 'dkc-dot y';
        const ok = await ping(S.serverUrl);
        if (ok) {
            setMode('server'); if (d) d.className = 'dkc-dot g'; if (fb) fb.classList.remove('show');
            await syncDown();
            const b = document.querySelector('.dkc-badge'); if (b) { b.className = 'dkc-badge server'; b.textContent = 'SERVER'; }
        } else {
            setMode('local'); if (d) d.className = 'dkc-dot r'; if (fb) fb.classList.add('show');
            const b = document.querySelector('.dkc-badge'); if (b) { b.className = 'dkc-badge local'; b.textContent = 'LOKAL'; }
        }
    }

    // ═══ INIT — SERVER FIRST! ═══
    async function init(opts = {}) {
        if (S.ready) return S;
        css(); loadKeys();
        if (opts.serverUrl) { S.serverUrl = opts.serverUrl; localStorage.setItem(CFG.LS_SERVER, opts.serverUrl); }

        // SCHRITT 1: Server zuerst!
        setMode('checking');
        const ok = await ping();
        if (ok) { setMode('server'); await syncDown(); } else { setMode('local'); }
        startLoop();

        // SCHRITT 2: Keys prüfen → Popup wenn leer
        if (!hasKeys() && !opts.silent) setTimeout(() => showKeyPopup(), 500);

        S.ready = true;
        window.dispatchEvent(new CustomEvent('dkz-conn-ready', {
            detail: { mode: S.mode, connected: S.connected, hasKeys: hasKeys() }
        }));
        return S;
    }

    // ═══ PUBLIC API ═══
    return {
        VERSION, init,
        getKey, hasKeys, saveKeys, loadKeys,
        showKeyPopup, hideKeyPopup, _save,
        reconnect, ping,
        getMode: () => S.mode,
        isConnected: () => S.connected,
        getState: () => ({ ...S }),
        setServerUrl: (u) => { S.serverUrl = u.replace(/\/$/, ''); localStorage.setItem(CFG.LS_SERVER, S.serverUrl); },

        async subscribeNewsletter(email, name) {
            try {
                const url = S.connected ? S.serverUrl + '/api/newsletter' : 'https://n8n.devkitz.eu/webhook/dkz-newsletter';
                await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, name, source: 'devkitz.eu', ts: new Date().toISOString() }) });
                return true;
            } catch {
                const q = JSON.parse(localStorage.getItem('dkz-nl-queue') || '[]');
                q.push({ email, name, ts: new Date().toISOString() });
                localStorage.setItem('dkz-nl-queue', JSON.stringify(q));
                return false;
            }
        },

        destroy: () => { if (S.timer) clearInterval(S.timer); S.timer = null; S.ready = false; }
    };
})();

// ═══ AUTO-INIT ═══
if (typeof window !== 'undefined') {
    window.DkzConn = DkzConn;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DkzConn.init());
    } else {
        setTimeout(() => DkzConn.init(), 300);
    }
}
