/**
 * DkZ Copilot — LLM Chat + Iceberg Prompt Block Builder
 * @DKZ:RULES → R12 Kein Wissensverlust, R20 Dok-Pflicht, R21 Pflegefall
 * @DKZ:TAG → [SYS:copilot] [CAT:shared] [LANG:js]
 * @version v0.03.0_01
 *
 * Features:
 * 1. Google Technik 6-Part Prompt (context/task/rules/examples/tools/output)
 * 2. Iceberg block builder — sucht Bausteine, baut Prompt, zeigt Animation
 * 3. 5 LLM Provider (OpenAI, Anthropic, Gemini, Grok, vLLM)
 * 4. English prompts → German output
 * 5. ≤23 Zeichen Regel (XML/EN ausgenommen)
 * 6. Auto-registers new prompts in Iceberg catalog
 * 7. Admin/User role-aware context (integrates with DkzGuide)
 * 8. .prefix commands (.help, .guide, .costs, .role, .links, .mcp)
 * 9. Module-context detection for targeted assistance
 * 10. Gateway-first Dual-Mode: API Gateway (:3040) → Client-side Fallback
 * 11. WebSocket MCP-Bridge für Echtzeit-Events und Tool-Calls
 * 12. Multi-Provider Gateway-Proxy (16 Provider serverseitig)
 */
const DkzCopilot = (() => {
    'use strict';

    const VERSION = 'v2.007';
    const GATEWAY_URL = 'http://localhost:3040';
    const BACKEND = GATEWAY_URL;
    const ICEBERG_URL = 'http://localhost:9881';
    const WS_URL = 'ws://localhost:3040/ws';
    let _gatewayOnline = false;
    let _wsClient = null;
    const GT_BLOCKS = ['context', 'task', 'rules', 'examples', 'tools', 'output'];

    // Module context detection
    function _detectModule() {
        const path = window.location.pathname;
        const m = path.match(/modules\/([^/]+)/);
        if (m) return m[1];
        const d = path.match(/(hub|landing-pages|mainboard|action-deck|agenten_dashboard|auth-center)\//);
        if (d) return d[1];
        return document.title.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 30) || 'unknown';
    }

    function _isAdmin() {
        return (typeof DkzGuide !== 'undefined' && DkzGuide.isAdmin()) || (localStorage.getItem('dkz-role') || 'user') === 'admin';
    }

    // ═══════════════════════════════════════
    // LLM Provider Registry — 14 Provider
    // OpenAI-kompatibel = reuse callOpenAI
    // ═══════════════════════════════════════
    const _bearer = k => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' });
    const _geminiH = () => ({ 'Content-Type': 'application/json' });
    const _anthropicH = k => ({ 'x-api-key': k, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' });
    const API_LINKS = {
        openai: 'https://platform.openai.com/api-keys',
        anthropic: 'https://console.anthropic.com/settings/keys',
        'gemini-flash': 'https://aistudio.google.com/apikey',
        'gemini-pro': 'https://aistudio.google.com/apikey',
        grok: 'https://console.x.ai/',
        'grok-fast': 'https://console.x.ai/',
        mistral: 'https://console.mistral.ai/api-keys/',
        deepseek: 'https://platform.deepseek.com/api_keys',
        groq: 'https://console.groq.com/keys',
        perplexity: 'https://www.perplexity.ai/settings/api',
        cohere: 'https://dashboard.cohere.com/api-keys',
        together: 'https://api.together.xyz/settings/api-keys',
        openrouter: 'https://openrouter.ai/keys',
        huggingface: 'https://huggingface.co/settings/tokens',
        nvidia: 'https://build.nvidia.com/',
        'github-copilot': 'https://github.com/settings/copilot',
    };
    const PROVIDERS = {
        // ─── Tier 1: Direkte APIs ───
        openai:        { name: 'OpenAI',            url: 'https://api.openai.com/v1/chat/completions',         model: 'gpt-4o-mini',                                  apiFormat: 'openai',    header: _bearer },
        anthropic:     { name: 'Anthropic',         url: 'https://api.anthropic.com/v1/messages',              model: 'claude-sonnet-4-20250514',                     apiFormat: 'anthropic', header: _anthropicH },
        // ─── Gemini (Flash + Pro) ───
        'gemini-flash':{ name: 'Gemini Flash',      url: 'https://generativelanguage.googleapis.com/v1beta/',  model: 'gemini-2.5-flash',                             apiFormat: 'gemini',    header: _geminiH },
        'gemini-pro':  { name: 'Gemini Pro',        url: 'https://generativelanguage.googleapis.com/v1beta/',  model: 'gemini-2.5-pro',                               apiFormat: 'gemini',    header: _geminiH },
        // ─── Grok (Reasoning + Fast) ───
        grok:          { name: 'Grok Reasoning',    url: 'https://api.x.ai/v1/chat/completions',              model: 'grok-3',                                       apiFormat: 'openai',    header: _bearer },
        'grok-fast':   { name: 'Grok Fast',         url: 'https://api.x.ai/v1/chat/completions',              model: 'grok-3-fast',                                  apiFormat: 'openai',    header: _bearer },
        // ─── Weitere Direkte APIs ───
        mistral:       { name: 'Mistral AI',        url: 'https://api.mistral.ai/v1/chat/completions',        model: 'mistral-medium-latest',                        apiFormat: 'openai',    header: _bearer },
        deepseek:      { name: 'DeepSeek',          url: 'https://api.deepseek.com/chat/completions',         model: 'deepseek-chat',                                apiFormat: 'openai',    header: _bearer },
        groq:          { name: 'Groq',              url: 'https://api.groq.com/openai/v1/chat/completions',   model: 'llama-3.3-70b-versatile',                      apiFormat: 'openai',    header: _bearer },
        perplexity:    { name: 'Perplexity',        url: 'https://api.perplexity.ai/chat/completions',        model: 'sonar-pro',                                    apiFormat: 'openai',    header: _bearer },
        cohere:        { name: 'Cohere',            url: 'https://api.cohere.com/v2/chat',                    model: 'command-r-plus',                               apiFormat: 'cohere',    header: _bearer },
        together:      { name: 'Together AI',       url: 'https://api.together.xyz/v1/chat/completions',      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',      apiFormat: 'openai',    header: _bearer },
        // ─── Tier 2: Aggregatoren / Multi-Hub ───
        openrouter:    { name: 'OpenRouter',        url: 'https://openrouter.ai/api/v1/chat/completions',     model: 'openai/gpt-4o-mini',                           apiFormat: 'openai',    header: _bearer },
        huggingface:   { name: 'HuggingFace',       url: 'https://router.huggingface.co/v1/chat/completions', model: 'meta-llama/Llama-3.3-70B-Instruct',            apiFormat: 'openai',    header: _bearer },
        nvidia:        { name: 'NVIDIA NIM',        url: 'https://integrate.api.nvidia.com/v1/chat/completions', model: 'meta/llama-3.1-70b-instruct',               apiFormat: 'openai',    header: _bearer },
        // ─── GitHub Copilot ───
        'github-copilot': { name: 'GitHub Copilot', url: 'https://api.githubcopilot.com/chat/completions',    model: 'gpt-4o',                                       apiFormat: 'openai',    header: _bearer },
        // ─── Lokal (vLLM + llama-swap) ───
        vllm:          { name: 'vLLM Local',        url: 'http://srv1298466.hstgr.cloud:8080/v1/chat/completions', model: 'gemma4-26b',                               apiFormat: 'openai',    header: () => ({ 'Content-Type': 'application/json' }) },
        puter:         { name: 'Puter AI',          url: '',                                                   model: 'gpt-4o-mini',                                  apiFormat: 'puter',     header: () => ({}) }
    };

    // ═══════════════════════════════════════
    // Cookie-Persistenz — überlebt Cache-Clear
    // Keys + Provider als Cookies (1 Jahr, SameSite=Lax)
    // localStorage für nicht-kritische Daten (Model, Chat)
    // ═══════════════════════════════════════
    function _setCookie(name, value, days = 365) {
        const d = new Date();
        d.setTime(d.getTime() + days * 86400000);
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
    }
    function _getCookie(name) {
        const n = encodeURIComponent(name) + '=';
        const parts = document.cookie.split(';');
        for (const p of parts) {
            const c = p.trim();
            if (c.startsWith(n)) return decodeURIComponent(c.substring(n.length));
        }
        return '';
    }
    function _deleteCookie(name) {
        document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
    }

    // Auto-Migration: localStorage → Cookies (einmalig)
    function _migrateKeysToCookies() {
        // Provider migrieren
        const lsProv = localStorage.getItem('dkz-copilot-provider');
        if (lsProv && !_getCookie('dkz-cop-prov')) {
            _setCookie('dkz-cop-prov', lsProv);
        }
        // API-Keys migrieren
        for (const id of Object.keys(PROVIDERS)) {
            const lsKey = localStorage.getItem(`dkz-copilot-key-${id}`);
            if (lsKey && !_getCookie(`dkz-cop-key-${id}`)) {
                _setCookie(`dkz-cop-key-${id}`, lsKey);
            }
        }
    }

    function getProvider() {
        const id = _getCookie('dkz-cop-prov') || localStorage.getItem('dkz-copilot-provider') || 'vllm';
        return { id, ...PROVIDERS[id] };
    }
    function getApiKey() {
        const pid = getProvider().id;
        return _getCookie(`dkz-cop-key-${pid}`) || localStorage.getItem(`dkz-copilot-key-${pid}`) || '';
    }

    // ═══════════════════════════════════════
    // Iceberg Block Builder — @DKZ:TAG [SYS:blocks]
    // Sucht Bausteine, baut Prompt, Animation
    // ═══════════════════════════════════════
    async function searchIcebergBlocks(task) {
        try {
            const r = await fetch(`${ICEBERG_URL}/james/select`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task, category: 'prompt' })
            });
            return (await r.json()).selected || [];
        } catch { return []; }
    }

    async function addMissingBlock(name, content, tags) {
        try {
            await fetch(`${ICEBERG_URL}/prompts/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description: `Auto: ${name}`, tags: tags || ['auto', 'google-technik'], prompt: content, score: 50 })
            });
        } catch { /* Iceberg offline */ }
    }

    // Baustein-Montage-Animation im Chat
    function showBuildAnimation(msgs) {
        const id = 'cop-build-' + Date.now();
        msgs.innerHTML += `
            <div id="${id}" style="background:rgba(250,200,50,0.04);border:1px solid rgba(250,200,50,0.15);border-radius:8px;padding:10px 12px;margin-bottom:8px;font-family:'JetBrains Mono',monospace;font-size:.6rem;color:#71717a">
                <div style="font-size:.65rem;font-weight:600;color:#fac832;margin-bottom:6px">🧊 Prompt-Baustein-Montage</div>
                <div id="${id}-blocks"></div>
            </div>`;
        msgs.scrollTop = msgs.scrollHeight;
        return id;
    }

    async function animateBlock(animId, block, status) {
        const c = document.getElementById(`${animId}-blocks`);
        if (!c) return;
        const cols = { context: '#818cf8', task: '#fa1e4e', rules: '#00ff88', examples: '#fac832', tools: '#a78bfa', output: '#ffab40' };
        const icon = status === 'done' ? '✅' : status === 'building' ? '⏳' : '🔍';
        const old = c.querySelector(`[data-b="${block}"]`);
        if (old) old.remove();
        c.innerHTML += `<div data-b="${block}" style="display:flex;align-items:center;gap:6px;padding:2px 0">
            <span>${icon}</span><span style="color:${cols[block] || '#71717a'};font-weight:600">&lt;${block}&gt;</span>
            <span style="color:#52525b">${status === 'done' ? 'Montiert' : status === 'building' ? 'Baue...' : 'Suche...'}</span></div>`;
        await new Promise(r => setTimeout(r, 120));
    }

    // ═══════════════════════════════════════
    // Google Technik 6-Part Prompt Builder
    // ═══════════════════════════════════════
    function buildGTPrompt(msg, ctx = {}, iceBlocks = []) {
        const mod = ctx.name || document.title || 'DkZ Module';
        const modId = _detectModule();
        const role = _isAdmin() ? 'ADMIN' : 'USER';
        const ice = iceBlocks.length > 0 ? '\nIceberg context:\n' + iceBlocks.map(b => `- ${b.name}: ${b.description}`).join('\n') : '';
        const adminCtx = _isAdmin() ? '\nAdmin access: REGELWERK, BLAUPAUSE, REGISTRY, IMPLEMENTIERUNGSPLAN accessible. Can explain system architecture, rules, and workflows.' : '';
        return `<context>
You are the DkZ Copilot in "${mod}" (module: ${modId}). Role: ${role}. Stack: HTML/CSS/JS, Node.js :9880, Go Iceberg :9881.
Design: Cyberclean dark #0e0e10, accent #fa1e4e, Inter + JetBrains Mono. Version: ${VERSION}${adminCtx}
Scripts: dkz-debug, dkz-eventlog, dkz-persist, dkz-analyser, dkz-health, dkz-copilot${ice}
</context>
<task>${msg}</task>
<rules>
- DkZ R1-R22: R3 design, R6 hub+version+debug, R12 persist, R15 esc(), R20 docs, R21 PF-ID
- Labels/tags max 23 chars (except XML blocks and EN prompts with DE output)
- Do NOT add undeclared deps. Do NOT modify unrelated files. Minimal intervention.
</rules>
<examples>
1. Module: "Health Monitor" → Complete index.html with DkZ design, Hub, debug, version
2. Bug: "Button kaputt" → Diagnose → Fix → Verify
3. Code: "Export-Button" → Minimal JS/HTML following module patterns
</examples>
<tools>
Backend :9880, Iceberg :9881, EventLog, Debug, Persist, Health, Analyser, James /james/evaluate
</tools>
<output>
ALWAYS respond in GERMAN. Code comments German. Variables English camelCase.
Markdown + emoji. Concise bullets (BP-05). Complete copy-paste snippets.
</output>`;
    }

    // ═══════════════════════════════════════
    // LLM API Calls — Format-basiert
    // ═══════════════════════════════════════

    // OpenAI-kompatibel (auch: Grok, Mistral, DeepSeek, Groq, Perplexity,
    //                    Together, OpenRouter, HuggingFace, NVIDIA NIM)
    async function callOpenAI(sys, usr, key, p) {
        const model = localStorage.getItem(`dkz-copilot-model-${p.id}`) || p.model;
        const body = { model, messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }], temperature: 0.7, max_tokens: 2000 };
        // OpenRouter braucht HTTP-Referer
        const headers = p.header(key);
        if (p.id === 'openrouter') { headers['HTTP-Referer'] = 'https://devkitz.dev'; headers['X-Title'] = 'DkZ Copilot'; }
        const r = await fetch(p.url, { method: 'POST', headers, body: JSON.stringify(body) });
        const d = await r.json();
        return d.choices?.[0] ? { ok: true, text: d.choices[0].message.content, provider: p.name, tokens: d.usage?.total_tokens } : { ok: false, text: d.error?.message || JSON.stringify(d.error || d) || 'Fehler', provider: p.name };
    }

    // Anthropic (eigenes Format: system + messages)
    async function callAnthropic(sys, usr, key, p) {
        const model = localStorage.getItem(`dkz-copilot-model-${p.id}`) || p.model;
        const r = await fetch(p.url, { method: 'POST', headers: p.header(key), body: JSON.stringify({ model, system: sys, messages: [{ role: 'user', content: usr }], max_tokens: 2000 }) });
        const d = await r.json();
        return d.content?.[0] ? { ok: true, text: d.content[0].text, provider: p.name, tokens: (d.usage?.input_tokens || 0) + (d.usage?.output_tokens || 0) } : { ok: false, text: d.error?.message || 'Fehler', provider: p.name };
    }

    // Gemini (eigenes Format: system_instruction + contents)
    async function callGemini(sys, usr, key, p) {
        const model = localStorage.getItem(`dkz-copilot-model-${p.id}`) || p.model;
        const r = await fetch(`${p.url}models/${model}:generateContent?key=${key}`, { method: 'POST', headers: p.header(key), body: JSON.stringify({ system_instruction: { parts: [{ text: sys }] }, contents: [{ parts: [{ text: usr }] }] }) });
        const d = await r.json();
        return d.candidates?.[0] ? { ok: true, text: d.candidates[0].content.parts[0].text, provider: p.name } : { ok: false, text: d.error?.message || 'Fehler', provider: p.name };
    }

    // Cohere v2 (eigenes Format: model + messages + preamble)
    async function callCohere(sys, usr, key, p) {
        const model = localStorage.getItem(`dkz-copilot-model-${p.id}`) || p.model;
        const r = await fetch(p.url, { method: 'POST', headers: p.header(key), body: JSON.stringify({ model, messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }] }) });
        const d = await r.json();
        return d.message?.content?.[0]?.text ? { ok: true, text: d.message.content[0].text, provider: p.name, tokens: (d.usage?.tokens?.input_tokens || 0) + (d.usage?.tokens?.output_tokens || 0) } : { ok: false, text: d.message || 'Fehler', provider: p.name };
    }

    // vLLM Local (OpenAI-kompatibel via llama-swap)
    // Legacy callOllama bleibt als Alias fuer Kompatibilitaet
    async function callOllama(sys, usr, p) {
        return await callOpenAI(sys, usr, '', p);
    }

    async function callPuter(sys, usr, p) {
        if (typeof DkzPuter === 'undefined') throw new Error('DkzPuter shared script nicht geladen');
        const model = localStorage.getItem(`dkz-copilot-model-${p.id}`) || p.model;
        const prompt = `[SYSTEM: ${sys}]\nUser: ${usr}`;
        const reply = await DkzPuter.aiChat(prompt, model);
        if (reply) return { ok: true, text: reply, provider: p.name };
        throw new Error('Puter AI gab keine Antwort zurueck');
    }

    // ─── Gateway Proxy Call ───
    async function callGateway(msg, sys, provider, key, model) {
        const resp = await fetch(`${GATEWAY_URL}/api/v1/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg, provider, apiKey: key, model, systemPrompt: sys })
        });
        const d = await resp.json();
        if (d.error) return { ok: false, text: d.error, provider: d.provider || provider };
        return { ok: true, text: d.reply, provider: d.provider || provider, tokens: d.usage?.total_tokens };
    }

    // ─── Gateway Health Check ───
    async function checkGateway() {
        try {
            const r = await fetch(`${GATEWAY_URL}/api/v1/health`, { signal: AbortSignal.timeout(2000) });
            _gatewayOnline = r.ok;
        } catch { _gatewayOnline = false; }
        return _gatewayOnline;
    }

    // ─── WebSocket MCP-Bridge ───
    function connectWebSocket() {
        if (_wsClient && _wsClient.readyState <= 1) return;
        try {
            _wsClient = new WebSocket(WS_URL);
            _wsClient.onopen = () => console.log('[DkZ Copilot] WebSocket verbunden');
            _wsClient.onmessage = (ev) => {
                try {
                    const msg = JSON.parse(ev.data);
                    if (msg.type === 'chat-response' || msg.type === 'mcp-result') {
                        const msgs = document.getElementById('dkz-cop-msgs');
                        if (msgs) {
                            msgs.innerHTML += `<div style="background:rgba(0,255,136,0.04);border-left:3px solid #00ff88;padding:6px 12px;border-radius:0 8px 8px 0;margin-bottom:6px;font-size:.65rem;color:#52525b;font-family:'JetBrains Mono',monospace">\u26a1 WS: ${esc(msg.type)} \u00b7 ${esc(JSON.stringify(msg.data || {}).substring(0, 80))}</div>`;
                            msgs.scrollTop = msgs.scrollHeight;
                        }
                    }
                } catch { /* ignore non-JSON */ }
            };
            _wsClient.onclose = () => { _wsClient = null; setTimeout(connectWebSocket, 5000); };
            _wsClient.onerror = () => { _wsClient = null; };
        } catch { /* WebSocket not available */ }
    }

    // ─── MCP Tool Call via WebSocket ───
    function mcpCall(tool, args = {}) {
        if (!_wsClient || _wsClient.readyState !== 1) return false;
        _wsClient.send(JSON.stringify({ type: 'mcp', tool, args, timestamp: new Date().toISOString() }));
        return true;
    }

    // ─── Router: Gateway-first → Client-side Fallback ───
    async function chat(msg, ctx = {}) {
        const p = getProvider(), key = getApiKey(), sys = buildGTPrompt(msg, ctx);

        // Modus 1: Gateway Proxy (bevorzugt)
        if (_gatewayOnline) {
            try {
                const result = await callGateway(msg, sys, p.id, key, localStorage.getItem(`dkz-copilot-model-${p.id}`) || p.model);
                if (result.ok) return result;
            } catch { /* Gateway-Timeout → Fallback */ }
        }

        // Modus 2: Direkte API (Client-side Fallback)
        try {
            switch (p.apiFormat || p.id) {
                case 'ollama': case 'vllm': return await callOpenAI(sys, msg, '', p);
                case 'anthropic': return await callAnthropic(sys, msg, key, p);
                case 'gemini':    return await callGemini(sys, msg, key, p);
                case 'cohere':    return await callCohere(sys, msg, key, p);
                case 'puter':     return await callPuter(sys, msg, p);
                default:          return await callOpenAI(sys, msg, key, p);
            }
        } catch (e) { return { ok: false, text: `\u274c ${p.name}: ${e.message}`, provider: p.name }; }
    }

    // ═══════════════════════════════════════
    // Send — mit Baustein-Animation
    // ═══════════════════════════════════════
    async function send() {
        const input = document.getElementById('dkz-cop-input');
        const msg = input.value.trim();
        if (!msg) return;
        input.value = '';

        // .prefix command handling
        if (msg.startsWith('.')) {
            const msgs = document.getElementById('dkz-cop-msgs');
            // Try DkzGuide commands first
            if (typeof DkzGuide !== 'undefined' && DkzGuide.handleCommand(msg)) {
                msgs.innerHTML += `<div style="background:rgba(0,255,136,0.06);border-left:3px solid #00ff88;padding:8px 12px;border-radius:0 8px 8px 0;margin-bottom:8px;font-size:.75rem;color:#a1a1aa"><strong style="color:#00ff88">⚡</strong> Befehl ausgeführt: <code style="background:#1a1a20;padding:1px 4px;border-radius:3px;font-size:.7rem">${esc(msg)}</code></div>`;
                msgs.scrollTop = msgs.scrollHeight;
                return;
            }
            // Built-in copilot commands
            const cmds = {
                '.costs': () => { window.location.href = _resolveModulePath('llm-cost-board'); return '💰 Öffne LLM Cost Board...'; },
                '.prompts': () => { window.location.href = _resolveModulePath('prompt-generator'); return '🎯 Öffne Prompt Generator...'; },
                '.loops': () => { window.location.href = _resolveModulePath('loop-dashboard'); return '🔄 Öffne Loop Dashboard...'; },
                '.iceberg': () => { window.location.href = _resolveModulePath('iceberg'); return '🚀 Öffne Iceberg...'; },
                '.gitops': () => { window.location.href = _resolveModulePath('wissen-hub') + '#gitops'; return '🤖 Öffne GitOps & DeepKeep Doku...'; },
                '.hub': () => { window.location.href = _resolveHubPath(); return '🎯 Öffne Hub...'; },
                '.settings': () => { openSettings(); return '⚙️ Einstellungen geöffnet'; },
                '.providers': () => {
                    const list = Object.entries(PROVIDERS).map(([id, p]) => `• ${p.name} (${p.model})`).join('\n');
                    const msgs2 = document.getElementById('dkz-cop-msgs');
                    msgs2.innerHTML += `<div style="background:rgba(129,140,248,0.06);border-left:3px solid #818cf8;padding:8px 12px;border-radius:0 8px 8px 0;margin-bottom:8px;font-size:.7rem;color:#a1a1aa;font-family:'JetBrains Mono',monospace;white-space:pre-line;line-height:1.6"><strong style="color:#818cf8">📋 ${Object.keys(PROVIDERS).length} LLM Provider:</strong>\n${esc(list)}</div>`;
                    msgs2.scrollTop = msgs2.scrollHeight;
                    return null;
                },
                '.notebooklm': () => {
                    const msgs2 = document.getElementById('dkz-cop-msgs');
                    msgs2.innerHTML += `<div style="background:rgba(250,200,50,0.06);border-left:3px solid #fac832;padding:10px 12px;border-radius:0 8px 8px 0;margin-bottom:8px;font-size:.72rem;color:#a1a1aa;line-height:1.7">
                        <strong style="color:#fac832">📓 NotebookLM MCP Integration</strong><br>
                        NotebookLM läuft als <strong>MCP-Server</strong> (nicht REST-API).<br><br>
                        <strong style="color:#00ff88">Option 1:</strong> <code style="background:#1a1a20;padding:1px 4px;border-radius:3px;font-size:.65rem">alfredang/notebooklm-mcp</code><br>
                        → Notizbücher, Quellen, Podcasts, Mindmaps, Karteikarten<br>
                        → <a href="https://github.com/alfredang/notebooklm-mcp/" target="_blank" style="color:#818cf8">github.com/alfredang/notebooklm-mcp</a><br><br>
                        <strong style="color:#00ff88">Option 2:</strong> <code style="background:#1a1a20;padding:1px 4px;border-radius:3px;font-size:.65rem">jacob-bd/notebooklm-mcp-cli</code><br>
                        → CLI-basiert, leichtgewichtig<br>
                        → <a href="https://github.com/jacob-bd/notebooklm-mcp-cli" target="_blank" style="color:#818cf8">github.com/jacob-bd/notebooklm-mcp-cli</a><br><br>
                        <strong style="color:#ffab40">Setup:</strong><br>
                        <code style="background:#1a1a20;padding:2px 6px;border-radius:3px;font-size:.65rem;display:block;margin:4px 0">npx -y notebooklm-mcp</code>
                        In Claude Desktop → Settings → MCP Server hinzufügen.<br>
                        <span style="font-size:.6rem;color:#52525b">Benötigt: Google Cloud OAuth + NotebookLM Zugang</span></div>`;
                    msgs2.scrollTop = msgs2.scrollHeight;
                    return null;
                },
                '.mcp': () => {
                    const msgs2 = document.getElementById('dkz-cop-msgs');
                    const wsStatus = _wsClient && _wsClient.readyState === 1 ? '\ud83d\udfe2 Verbunden' : '\ud83d\udd34 Offline';
                    const gwStatus = _gatewayOnline ? '\ud83d\udfe2 Online' : '\ud83d\udd34 Offline';
                    msgs2.innerHTML += `<div style="background:rgba(0,255,136,0.06);border-left:3px solid #00ff88;padding:10px 12px;border-radius:0 8px 8px 0;margin-bottom:8px;font-size:.7rem;color:#a1a1aa;font-family:'JetBrains Mono',monospace;line-height:1.6"><strong style="color:#00ff88">\ud83d\udd0c MCP Status</strong><br>Gateway: ${gwStatus} (${esc(GATEWAY_URL)})<br>WebSocket: ${wsStatus} (${esc(WS_URL)})<br>Iceberg: ${esc(ICEBERG_URL)}<br><br><strong style="color:#818cf8">MCP Tools:</strong><br>\u2022 dkz_chat \u2014 AI Chat (Multi-Provider)<br>\u2022 dkz_summarize \u2014 Text zusammenfassen<br>\u2022 dkz_translate \u2014 \u00dcbersetzen<br>\u2022 dkz_codegen \u2014 Code generieren<br><br><strong style="color:#ffb800">REST Endpoints:</strong><br>\u2022 POST /api/v1/chat<br>\u2022 POST /api/v1/summarize<br>\u2022 POST /api/v1/translate<br>\u2022 POST /api/v1/codegen<br>\u2022 GET /api/v1/providers</div>`;
                    msgs2.scrollTop = msgs2.scrollHeight;
                    return null;
                },
            };
            const cmd = msg.split(/\s+/)[0].toLowerCase();
            if (cmds[cmd]) {
                const result = cmds[cmd]();
                if (result) {
                    msgs.innerHTML += `<div style="background:rgba(0,255,136,0.06);border-left:3px solid #00ff88;padding:8px 12px;border-radius:0 8px 8px 0;margin-bottom:8px;font-size:.75rem;color:#a1a1aa"><strong style="color:#00ff88">⚡</strong> ${esc(result)}</div>`;
                }
                msgs.scrollTop = msgs.scrollHeight;
                return;
            }
        }

        const msgs = document.getElementById('dkz-cop-msgs');

        // Benutzer-Nachricht
        msgs.innerHTML += `<div style="background:rgba(250,30,78,0.06);border-left:3px solid #fa1e4e;padding:8px 12px;border-radius:0 8px 8px 0;margin-bottom:8px;font-size:.75rem;color:#f0f0f2"><strong style="color:#fa1e4e">Du:</strong> ${esc(msg)}</div>`;

        // Baustein-Montage Animation
        const animId = showBuildAnimation(msgs);
        for (const b of GT_BLOCKS) await animateBlock(animId, b, 'search');
        const iceBlocks = await searchIcebergBlocks(msg);
        for (const b of GT_BLOCKS) { await animateBlock(animId, b, 'building'); await animateBlock(animId, b, 'done'); }
        const info = document.getElementById(animId);
        if (info) info.innerHTML += `<div style="margin-top:4px;font-size:.55rem;color:#52525b">🧊 ${iceBlocks.length} aus Iceberg · 6/6 Google Technik montiert</div>`;

        // LLM Call
        const loadId = 'cop-ld-' + Date.now();
        msgs.innerHTML += `<div id="${loadId}" style="padding:6px 12px;font-size:.7rem;color:#71717a">⏳ ${getProvider().name}...</div>`;
        msgs.scrollTop = msgs.scrollHeight;

        const sys = buildGTPrompt(msg, { name: document.title }, iceBlocks);
        const p = getProvider(), key = getApiKey();
        let result;
        try {
            switch (p.apiFormat || 'openai') {
                case 'ollama': case 'vllm': result = await callOpenAI(sys, msg, '', p); break;
                case 'anthropic': result = await callAnthropic(sys, msg, key, p); break;
                case 'gemini':    result = await callGemini(sys, msg, key, p); break;
                case 'cohere':    result = await callCohere(sys, msg, key, p); break;
                case 'puter':     result = await callPuter(sys, msg, p); break;
                default:          result = await callOpenAI(sys, msg, key, p);
            }
        } catch (e) { result = { ok: false, text: `❌ ${e.message}`, provider: p.name }; }

        document.getElementById(loadId)?.remove();
        const html = result.ok ? result.text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code style="background:#1a1a20;padding:1px 4px;border-radius:3px;font-size:.7rem">$1</code>') : `❌ ${esc(result.text)}`;
        msgs.innerHTML += `<div style="background:rgba(129,140,248,0.06);border-left:3px solid #818cf8;padding:8px 12px;border-radius:0 8px 8px 0;margin-bottom:8px;font-size:.75rem;color:#a1a1aa;line-height:1.5">
            <strong style="color:#818cf8">🤖 Copilot</strong> <span style="font-size:.55rem;color:#52525b">${result.provider || ''}${result.tokens ? ' · ' + result.tokens + 't' : ''}</span><br>${html}</div>`;
        msgs.scrollTop = msgs.scrollHeight;

        // Neuen Prompt in Iceberg registrieren
        if (result.ok) addMissingBlock(`chat-${Date.now().toString(36)}`, sys, ['auto', 'chat']);
        if (typeof DkzEventLog !== 'undefined') DkzEventLog.log(document.title || 'copilot', 'copilot-chat', { msg, provider: result.provider, ok: result.ok, iceBlocks: iceBlocks.length });
    }

    // ═══════════════════════════════════════
    // UI: Floating Chat Widget
    // ═══════════════════════════════════════
    function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    // Matrix state
    let _matrixConfig = null;
    let _matrixRooms = [];
    let _matrixMessages = {};
    let _activeMatrixRoom = 'dkz-agent';
    let _matrixSyncInterval = null;
    let _matrixSyncToken = '';
    let _ctxMenuEl = null;

    function _ts() {
        return new Date().toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
    }

    function loadMatrixData() {
        try {
            _matrixConfig = JSON.parse(localStorage.getItem('dkz-matrix-config') || 'null') || {
                homeserver: 'https://matrix.org',
                token: '',
                room: '',
                botName: 'DkZ Agent',
                hermesUrl: '',
                connected: false
            };
            _matrixRooms = JSON.parse(localStorage.getItem('dkz-matrix-rooms') || 'null') || [
                {id:'dkz-agent', name:'#dkz-agent', icon:'🤖', color:'var(--accent)', desc:'Haupt-Channel', unread:0, members:['777','DkZ Agent','Hermes']},
                {id:'dkz-dev', name:'#dkz-dev', icon:'💻', color:'var(--green)', desc:'Development', unread:0, members:['777','DkZ Agent']},
                {id:'dkz-hermes', name:'#dkz-hermes', icon:'🏛️', color:'var(--purple)', desc:'Hermes Tickets', unread:0, members:['777','Hermes','James']},
                {id:'dkz-alerts', name:'#dkz-alerts', icon:'🚨', color:'var(--red)', desc:'System Alerts', unread:0, members:['System','James']},
            ];
            _matrixMessages = JSON.parse(localStorage.getItem('dkz-matrix-messages') || 'null') || {};
            if (!_matrixMessages['dkz-agent'] || !_matrixMessages['dkz-agent'].length) {
                _matrixMessages['dkz-agent'] = [
                    {sender:'system', text:'Matrix Bridge v2.0 gestartet — E2E verschluesselt', time:_ts(), type:'system'},
                    {sender:'Hermes', text:'Ich bin online. Ticket-Queue ist leer. Warte auf Befehle.', time:_ts(), type:'hermes'},
                    {sender:'DkZ Agent', text:'Skills geladen: 1.493. Module aktiv: 89+. Alle Systeme GRUEN.', time:_ts(), type:'bot'},
                ];
                _matrixMessages['dkz-hermes'] = [
                    {sender:'system', text:'Hermes Ticket-Kanal — VPS, Docker, Deployments', time:_ts(), type:'system'},
                    {sender:'Hermes', text:'Letztes Deployment: devkitz.eu — vor 12 Min. Kein Fehler.', time:_ts(), type:'hermes'},
                ];
                _matrixMessages['dkz-dev'] = [
                    {sender:'system', text:'Development Channel — Code Reviews, PRs, Tasks', time:_ts(), type:'system'},
                ];
                _matrixMessages['dkz-alerts'] = [
                    {sender:'system', text:'Alert Channel — Automatische System-Benachrichtigungen', time:_ts(), type:'system'},
                    {sender:'James', text:'⚠️ R24 ALARM: Archivierung angefordert fuer 99_ARCHIVE/legacy-v1/', time:_ts(), type:'hermes'},
                ];
            }
            _matrixSyncToken = localStorage.getItem('dkz-matrix-sync') || '';
            if (_matrixRooms.length > 0) {
                _activeMatrixRoom = _matrixRooms[0].id;
            }
        } catch (e) {
            console.error('Error loading Matrix data:', e);
        }
    }

    function saveMatrixData() {
        try {
            localStorage.setItem('dkz-matrix-config', JSON.stringify(_matrixConfig));
            localStorage.setItem('dkz-matrix-messages', JSON.stringify(_matrixMessages));
            localStorage.setItem('dkz-matrix-rooms', JSON.stringify(_matrixRooms));
            localStorage.setItem('dkz-matrix-sync', _matrixSyncToken);
        } catch (e) {
            console.error('Error saving Matrix data:', e);
        }
    }

    function injectChatWidget() {
        if (document.getElementById('dkz-copilot-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'dkz-copilot-btn'; btn.innerHTML = '🤖'; btn.title = 'DkZ Copilot';
        Object.assign(btn.style, { position: 'fixed', bottom: '20px', right: '80px', width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.4)', zIndex: '99990', transition: 'all .3s', display: 'flex', alignItems: 'center', justifyContent: 'center' });
        btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
        btn.onmouseleave = () => btn.style.transform = 'scale(1)';
        btn.onclick = togglePanel;
        
        btn.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleContextMenu(e);
        };
        
        document.body.appendChild(btn);
        injectContextMenu();
        updateMatrixUnreadBadge();
    }

    function injectContextMenu() {
        if (document.getElementById('dkz-copilot-ctx-menu')) return;
        _ctxMenuEl = document.createElement('div');
        _ctxMenuEl.id = 'dkz-copilot-ctx-menu';
        
        _ctxMenuEl.innerHTML = `
            <div class="dkz-ctx-item" onclick="DkzCopilot.toggle(); DkzCopilot._hideContextMenu();">🤖 Copilot Chat</div>
            <div class="dkz-ctx-item" id="dkz-ctx-matrix">🔮 Matrix Chat & Config</div>
            <div class="dkz-ctx-item" onclick="DkzCopilot._toggleNlmContextMenu(); DkzCopilot._hideContextMenu();">📓 NotebookLM Quick</div>
            <div class="dkz-ctx-item" id="dkz-ctx-walkthroughs">📖 Walkthroughs</div>
            <div class="dkz-ctx-divider"></div>
            <div class="dkz-ctx-item accent" onclick="DkzCopilot.openSettings(); DkzCopilot._hideContextMenu();">⚙️ Copilot Settings</div>
        `;
        
        Object.assign(_ctxMenuEl.style, {
            position: 'fixed',
            bottom: '74px',
            right: '80px',
            background: 'rgba(17, 17, 24, 0.95)',
            backdropFilter: 'blur(20px)',
            webkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            zIndex: '100002',
            fontFamily: "'Inter', sans-serif",
            padding: '6px',
            display: 'none',
            flexDirection: 'column',
            minWidth: '180px',
            boxSizing: 'border-box'
        });
        
        if (!document.getElementById('dkz-ctx-menu-styles')) {
            const style = document.createElement('style');
            style.id = 'dkz-ctx-menu-styles';
            style.textContent = `
                .dkz-ctx-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 12px;
                    color: #8a8a9a;
                    font-size: 11.5px;
                    font-weight: 500;
                    text-decoration: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .dkz-ctx-item:hover {
                    background: rgba(250, 30, 78, 0.08);
                    color: #e8e8ec;
                }
                .dkz-ctx-item.accent:hover {
                    background: rgba(250, 30, 78, 0.12);
                    color: #fa1e4e;
                }
                .dkz-ctx-divider {
                    height: 1px;
                    background: rgba(255, 255, 255, 0.04);
                    margin: 4px 6px;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(_ctxMenuEl);
        
        const matrixItem = document.getElementById('dkz-ctx-matrix');
        if (matrixItem) {
            matrixItem.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                _hideContextMenu();
                toggleMatrixChat();
            };
            matrixItem.oncontextmenu = (e) => {
                e.preventDefault();
                e.stopPropagation();
                _hideContextMenu();
                toggleMatrixSettings();
            };
        }
        
        const walkItem = document.getElementById('dkz-ctx-walkthroughs');
        if (walkItem) {
            walkItem.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                _hideContextMenu();
                window.open(_resolveModulePath('wissen-hub') + '?tab=walk', '_blank');
            };
        }
        
        document.addEventListener('click', (e) => {
            if (_ctxMenuEl && !e.target.closest('#dkz-copilot-ctx-menu') && e.target.id !== 'dkz-copilot-btn') {
                _hideContextMenu();
            }
        });
    }

    function toggleContextMenu(e) {
        if (!_ctxMenuEl) injectContextMenu();
        if (_ctxMenuEl.style.display === 'none') {
            _ctxMenuEl.style.display = 'flex';
        } else {
            _ctxMenuEl.style.display = 'none';
        }
    }

    function _hideContextMenu() {
        if (_ctxMenuEl) _ctxMenuEl.style.display = 'none';
    }

    function _toggleNlmContextMenu() {
        if (!_panelEl) togglePanel();
        else _panelEl.style.display = 'block';
        _switchTab('chat');
        _toggleNlm();
    }

    function toggleMatrixChat() {
        _hidePanel();
        _hideMatrixSettings();
        
        const panel = document.getElementById('dkz-matrix-chat-overlay');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
            if (panel.style.display === 'flex') {
                renderMatrixMessages();
                if (!_matrixSyncInterval) startMatrixSyncLoop();
            }
        } else {
            injectMatrixChatOverlay();
            if (!_matrixSyncInterval) startMatrixSyncLoop();
        }
    }

    function toggleMatrixSettings() {
        _hidePanel();
        _hideMatrixChat();
        
        const panel = document.getElementById('dkz-matrix-settings-overlay');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        } else {
            injectMatrixSettingsOverlay();
        }
    }

    function injectMatrixChatOverlay() {
        if (document.getElementById('dkz-matrix-chat-overlay')) return;
        const panel = document.createElement('div');
        panel.id = 'dkz-matrix-chat-overlay';
        panel.style.display = 'none';
        
        panel.innerHTML = `<div style="position:fixed;bottom:74px;right:20px;width:420px;height:550px;background:#111116;border:1px solid rgba(250,30,78,0.25);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.5);z-index:99991;font-family:'Inter',sans-serif;display:flex;flex-direction:column;overflow:hidden">
            <!-- Header -->
            <div style="background:#0e0e10;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.04)">
                <div style="display:flex;align-items:center;gap:8px">
                    <span style="font-weight:700;font-size:.82rem;color:#f0f0f2">🔮 Matrix Chat</span>
                    <select id="dkz-mat-room-select" onchange="DkzCopilot._switchMatrixRoom(this.value)" style="background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:3px 6px;color:#a1a1aa;font-size:.65rem;font-family:inherit;outline:none"></select>
                    <span id="dkz-mat-conn-dot" style="width:6px;height:6px;border-radius:50%;background:#71717a"></span>
                </div>
                <div style="display:flex;gap:6px">
                    <button onclick="DkzCopilot._openMatrixSettings()" title="Settings" style="background:none;border:none;color:#8a8a9a;cursor:pointer;font-size:.8rem">⚙️</button>
                    <button onclick="DkzCopilot._hideMatrixChat()" style="background:none;border:none;color:#71717a;cursor:pointer;font-size:.95rem">✕</button>
                </div>
            </div>
            <!-- Messages Container -->
            <div id="dkz-mat-msgs" style="flex:1;overflow-y:auto;padding:12px;background:#09090d"></div>
            <!-- Typing indicator -->
            <div id="dkz-mat-typing" style="padding:6px 12px;font-size:.65rem;color:#555568;display:none;background:#09090d">
                <span style="animation:blink 1.2s infinite">Hermes tippt...</span>
            </div>
            <!-- Input area -->
            <div style="padding:8px 12px;border-top:1px solid rgba(255,255,255,0.04);background:#0e0e10;display:flex;gap:6px;align-items:flex-end">
                <textarea id="dkz-mat-input" placeholder="Nachricht schreiben..." rows="1" style="flex:1;background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:8px;color:#f0f0f2;font-size:.78rem;font-family:inherit;resize:none;outline:none;line-height:1.4;box-sizing:border-box" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();DkzCopilot._sendMatrixMsg();}"></textarea>
                <button onclick="DkzCopilot._sendMatrixMsg()" style="background:linear-gradient(135deg,#fa1e4e,#a855f7);color:white;border:none;width:34px;height:34px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.9rem">➤</button>
            </div>
        </div>`;
        document.body.appendChild(panel);
        
        const ta = document.getElementById('dkz-mat-input');
        if (ta) {
            ta.addEventListener('input', () => {
                ta.style.height = 'auto';
                ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
            });
        }
        
        panel.style.display = 'flex';
        renderMatrixRooms();
        renderMatrixMessages();
        
        const dot = document.getElementById('dkz-mat-conn-dot');
        if (dot && _matrixConfig.connected) {
            dot.style.background = '#00ff88';
        }
    }

    function injectMatrixSettingsOverlay() {
        if (document.getElementById('dkz-matrix-settings-overlay')) return;
        const panel = document.createElement('div');
        panel.id = 'dkz-matrix-settings-overlay';
        panel.style.display = 'none';
        
        panel.innerHTML = `<div style="position:fixed;bottom:74px;right:20px;width:420px;background:#111116;border:1px solid rgba(250,30,78,0.25);border-radius:16px;padding:20px;z-index:99992;box-shadow:0 20px 60px rgba(0,0,0,0.6);font-family:'Inter',sans-serif;box-sizing:border-box">
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;align-items:center">
                <h3 style="font-size:.85rem;font-weight:700;color:#f0f0f2;margin:0">⚙️ Matrix Konfiguration</h3>
                <button onclick="DkzCopilot._hideMatrixSettings()" style="background:none;border:none;color:#71717a;cursor:pointer;font-size:1.1rem">✕</button>
            </div>
            
            <label style="font-size:.65rem;color:#8a8a9a;font-weight:600;display:block;margin-bottom:3px;text-transform:uppercase">Homeserver URL</label>
            <input id="dkz-mat-cfg-homeserver" value="${esc(_matrixConfig.homeserver)}" placeholder="https://matrix.org" style="width:100%;padding:6px 10px;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#f0f0f2;font-size:.72rem;margin-bottom:8px;outline:none;box-sizing:border-box">
            
            <label style="font-size:.65rem;color:#8a8a9a;font-weight:600;display:block;margin-bottom:3px;text-transform:uppercase">Access Token</label>
            <input id="dkz-mat-cfg-token" type="password" value="${esc(_matrixConfig.token)}" placeholder="syt_xxx..." style="width:100%;padding:6px 10px;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#f0f0f2;font-family:monospace;font-size:.7rem;margin-bottom:8px;outline:none;box-sizing:border-box">
            
            <label style="font-size:.65rem;color:#8a8a9a;font-weight:600;display:block;margin-bottom:3px;text-transform:uppercase">Raum-ID (#dkz-agent)</label>
            <input id="dkz-mat-cfg-room" value="${esc(_matrixConfig.room)}" placeholder="!abc123:matrix.org" style="width:100%;padding:6px 10px;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#f0f0f2;font-size:.72rem;margin-bottom:8px;outline:none;box-sizing:border-box">
            
            <label style="font-size:.65rem;color:#8a8a9a;font-weight:600;display:block;margin-bottom:3px;text-transform:uppercase">Bot-Anzeigename</label>
            <input id="dkz-mat-cfg-botname" value="${esc(_matrixConfig.botName)}" placeholder="DkZ Agent" style="width:100%;padding:6px 10px;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#f0f0f2;font-size:.72rem;margin-bottom:8px;outline:none;box-sizing:border-box">
            
            <label style="font-size:.65rem;color:#8a8a9a;font-weight:600;display:block;margin-bottom:3px;text-transform:uppercase">Hermes Webhook URL (optional)</label>
            <input id="dkz-mat-cfg-hermes" value="${esc(_matrixConfig.hermesUrl || '')}" placeholder="http://localhost:3040/api/matrix" style="width:100%;padding:6px 10px;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#f0f0f2;font-size:.72rem;margin-bottom:10px;outline:none;box-sizing:border-box">
            
            <div style="display:flex;gap:6px">
                <button onclick="DkzCopilot._saveMatrixSettings()" style="flex:1;padding:8px;background:linear-gradient(135deg,#fa1e4e,#a855f7);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:.75rem">💾 Speichern</button>
                <button onclick="DkzCopilot._connectMatrix()" style="padding:8px 14px;background:rgba(0,255,136,0.08);color:#00ff88;border:1px solid rgba(0,255,136,0.2);border-radius:8px;cursor:pointer;font-weight:600;font-size:.7rem">🔗 Connect</button>
            </div>
            <div id="dkz-mat-cfg-status" style="margin-top:6px;font-size:.6rem;text-align:center;color:#8a8a9a"></div>
        </div>`;
        document.body.appendChild(panel);
        panel.style.display = 'block';
    }

    function _saveMatrixSettings() {
        _matrixConfig.homeserver = document.getElementById('dkz-mat-cfg-homeserver').value.trim();
        _matrixConfig.token = document.getElementById('dkz-mat-cfg-token').value.trim();
        _matrixConfig.room = document.getElementById('dkz-mat-cfg-room').value.trim();
        _matrixConfig.botName = document.getElementById('dkz-mat-cfg-botname').value.trim();
        _matrixConfig.hermesUrl = document.getElementById('dkz-mat-cfg-hermes').value.trim();
        saveMatrixData();
        
        const statusEl = document.getElementById('dkz-mat-cfg-status');
        if (statusEl) {
            statusEl.textContent = '💾 Konfiguration gespeichert!';
            statusEl.style.color = '#00ff88';
            setTimeout(() => {
                _hideMatrixSettings();
                if (_matrixConfig.token) {
                    _connectMatrix();
                }
            }, 800);
        }
    }

    function _hideMatrixChat() {
        const panel = document.getElementById('dkz-matrix-chat-overlay');
        if (panel) panel.style.display = 'none';
    }

    function _hideMatrixSettings() {
        const panel = document.getElementById('dkz-matrix-settings-overlay');
        if (panel) panel.style.display = 'none';
    }

    function _openMatrixSettings() {
        _hideMatrixChat();
        toggleMatrixSettings();
    }

    function _switchMatrixRoom(roomId) {
        _activeMatrixRoom = roomId;
        const room = _matrixRooms.find(r => r.id === roomId);
        if (room) room.unread = 0;
        saveMatrixData();
        renderMatrixRooms();
        renderMatrixMessages();
        updateMatrixUnreadBadge();
    }

    function renderMatrixRooms() {
        const select = document.getElementById('dkz-mat-room-select');
        if (!select) return;
        select.innerHTML = _matrixRooms.map(r => {
            const unreadTxt = r.unread ? ` (${r.unread})` : '';
            return `<option value="${r.id}" ${r.id === _activeMatrixRoom ? 'selected' : ''}>${r.icon} ${r.name}${unreadTxt}</option>`;
        }).join('');
    }

    function renderMatrixMessages() {
        const container = document.getElementById('dkz-mat-msgs');
        if (!container) return;
        const msgs = _matrixMessages[_activeMatrixRoom] || [];
        
        let html = '';
        let lastSender = '';
        msgs.forEach(m => {
            const isNew = m.sender !== lastSender;
            lastSender = m.sender;
            const avatarColors = {
                '777': 'background:var(--accent)',
                'DkZ Agent': 'background:var(--green)',
                'Hermes': 'background:var(--purple)',
                'James': 'background:var(--yellow)',
                'system': 'background:var(--blue)',
            };
            const avatarStyle = avatarColors[m.sender] || 'background:#555568';
            const initial = m.sender === 'system' ? '⚡' : m.sender.charAt(0).toUpperCase();
            const bubbleClass = m.type || (m.sender === '777' ? 'self' : 'bot');
            
            if (m.type === 'system') {
                html += `<div style="padding:4px 8px;border-radius:10px;font-size:10px;font-style:italic;color:#8a8a9a;text-align:center;margin:4px auto;max-width:100%;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.1)">${_formatMatrixMsg(m.text)}</div>`;
            } else {
                if (isNew) {
                    html += `<div style="margin-top:8px;margin-bottom:4px"><div style="display:flex;align-items:center;gap:8px">
                        <div style="width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;${avatarStyle}">${initial}</div>
                        <span style="font-size:11px;font-weight:600;color:#e8e8ec">${esc(m.sender)}</span>
                        <span style="font-size:8.5px;color:#555568;font-family:'JetBrains Mono',monospace">${esc(m.time)}</span>
                    </div></div>`;
                }
                const bubbleStyle = m.sender === '777' 
                    ? 'background:rgba(250,30,78,0.1);border:1px solid rgba(250,30,78,0.15);margin-left:auto;margin-right:0' 
                    : (m.sender === 'Hermes' 
                        ? 'background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.12);margin-left:28px' 
                        : 'background:rgba(0,255,136,0.06);border:1px solid rgba(0,255,136,0.1);margin-left:28px');
                html += `<div style="padding:6px 12px;border-radius:10px;font-size:11.5px;line-height:1.45;max-width:85%;word-wrap:break-word;${bubbleStyle}">${_formatMatrixMsg(m.text)}</div>`;
            }
        });
        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    }

    function _formatMatrixMsg(text) {
        let s = esc(text);
        s = s.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.3);padding:1px 4px;border-radius:4px;font-family:\'JetBrains Mono\',monospace;font-size:10.5px">$1</code>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/\n/g, '<br>');
        return s;
    }

    async function _connectMatrix() {
        if (!_matrixConfig.token) {
            _addMatrixMsg('system', 'Kein Token konfiguriert. Bitte trage deinen Matrix Access Token in den Einstellungen ein.');
            return;
        }
        const badge = document.getElementById('dkz-mat-conn-dot');
        const statusEl = document.getElementById('dkz-mat-cfg-status');
        if (badge) {
            badge.style.background = '#ffb800';
        }
        if (statusEl) {
            statusEl.textContent = '⏳ Verbinde...';
            statusEl.style.color = '#ffb800';
        }
        try {
            const res = await fetch(_matrixConfig.homeserver + '/_matrix/client/v3/account/whoami', {
                headers: {'Authorization': 'Bearer ' + _matrixConfig.token}
            });
            if (!res.ok) throw new Error('Token ungueltig (HTTP ' + res.status + ')');
            const data = await res.json();
            _matrixConfig.userId = data.user_id;
            _matrixConfig.connected = true;
            saveMatrixData();
            if (badge) {
                badge.style.background = '#00ff88';
                badge.title = 'Verbunden: ' + data.user_id;
            }
            if (statusEl) {
                statusEl.textContent = '🟢 Verbunden als: ' + data.user_id;
                statusEl.style.color = '#00ff88';
            }
            _addMatrixMsg('system', 'Verbunden als **' + data.user_id + '** mit ' + _matrixConfig.homeserver);
            startMatrixSyncLoop();
        } catch(e) {
            if (badge) {
                badge.style.background = '#ff3b5c';
            }
            if (statusEl) {
                statusEl.textContent = '🔴 Fehler: ' + e.message;
                statusEl.style.color = '#ff3b5c';
            }
            _addMatrixMsg('system', 'Verbindung fehlgeschlagen: ' + e.message);
        }
    }

    async function syncMatrix() {
        if (!_matrixConfig || !_matrixConfig.token) return;
        try {
            let url = _matrixConfig.homeserver + '/_matrix/client/v3/sync?timeout=10000';
            if (_matrixSyncToken) url += '&since=' + _matrixSyncToken;
            else url += '&filter={"room":{"timeline":{"limit":20}}}';
            
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 12000);
            const res = await fetch(url, {
                headers: {'Authorization': 'Bearer ' + _matrixConfig.token},
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (!res.ok) throw new Error('Sync Status: ' + res.status);
            const data = await res.json();
            _matrixSyncToken = data.next_batch || _matrixSyncToken;
            localStorage.setItem('dkz-matrix-sync', _matrixSyncToken);
            
            const joinedRooms = data.rooms?.join || {};
            let hasNew = false;
            for (const [roomId, roomData] of Object.entries(joinedRooms)) {
                const events = roomData.timeline?.events || [];
                events.forEach(ev => {
                    if (ev.type !== 'm.room.message') return;
                    if (ev.sender === _matrixConfig.userId) return;
                    const body = ev.content?.body || '';
                    const sender = ev.sender?.split(':')[0]?.replace('@','') || 'Unbekannt';
                    
                    const target = _matrixRooms.find(r => r.matrixId === roomId) || _matrixRooms[0];
                    if (!_matrixMessages[target.id]) _matrixMessages[target.id] = [];
                    
                    const eventId = ev.event_id;
                    if (!_matrixMessages[target.id].find(m => m.eventId === eventId)) {
                        _matrixMessages[target.id].push({
                            sender,
                            text: body,
                            time: _ts(),
                            type: 'hermes',
                            eventId
                        });
                        if (target.id !== _activeMatrixRoom) {
                            target.unread = (target.unread || 0) + 1;
                        }
                        hasNew = true;
                    }
                });
            }
            if (hasNew) {
                saveMatrixData();
                renderMatrixRooms();
                renderMatrixMessages();
                updateMatrixUnreadBadge();
            }
        } catch(e) {
            if (e.name !== 'AbortError') {
                console.warn('[Matrix Sync Error]', e.message);
            }
        }
    }

    function startMatrixSyncLoop() {
        if (_matrixSyncInterval) clearInterval(_matrixSyncInterval);
        syncMatrix();
        _matrixSyncInterval = setInterval(syncMatrix, 12000);
    }

    async function _sendMatrixMsg() {
        const input = document.getElementById('dkz-mat-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        input.style.height = 'auto';
        
        if (!_matrixMessages[_activeMatrixRoom]) _matrixMessages[_activeMatrixRoom] = [];
        _matrixMessages[_activeMatrixRoom].push({sender:'777', text, time:_ts(), type:'self'});
        saveMatrixData();
        renderMatrixMessages();
        renderMatrixRooms();
        
        if (_matrixConfig.token && _matrixConfig.room) {
            _sendToMatrixAPI(text);
        }
        
        if (_matrixConfig.hermesUrl || _activeMatrixRoom === 'dkz-hermes') {
            _sendToHermesMatrix(text);
            return;
        }
        
        if (text.startsWith('!') || text.startsWith('/')) {
            _processMatrixCommand(text);
            return;
        }
        
        _simulateMatrixBotReply(text);
    }

    async function _sendToMatrixAPI(text) {
        if (!_matrixConfig.token || !_matrixConfig.room) return;
        try {
            const txnId = 'm' + Date.now();
            const url = _matrixConfig.homeserver + '/_matrix/client/v3/rooms/' +
                encodeURIComponent(_matrixConfig.room) + '/send/m.room.message/' + txnId;
            await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + _matrixConfig.token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({msgtype: 'm.text', body: text})
            });
        } catch(e) {
            _addMatrixMsg('system', 'Matrix API Fehler: ' + e.message);
        }
    }

    async function _sendToHermesMatrix(text) {
        const url = _matrixConfig.hermesUrl || 'http://localhost:3040/api/v1/free-hub/cascade';
        const typing = document.getElementById('dkz-mat-typing');
        if (typing) typing.style.display = 'block';
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);
            const res = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({message: text, sender: '777', room: _activeMatrixRoom}),
                signal: controller.signal
            });
            clearTimeout(timeout);
            const data = await res.json();
            const reply = data.response || data.content || JSON.stringify(data);
            _addMatrixMsg('Hermes', reply, 'hermes');
        } catch(e) {
            if (e.name === 'AbortError') {
                _addMatrixMsg('system', 'Hermes Timeout (15s) — NanoChat Bridge nicht erreichbar');
            } else {
                _addMatrixMsg('system', 'Hermes offline — Bridge unter localhost:3040 starten');
            }
        }
        if (typing) typing.style.display = 'none';
    }

    function _processMatrixCommand(text) {
        const cmd = text.replace(/^[!/]/, '').trim().toLowerCase();
        const parts = cmd.split(/\s+/);
        const action = parts[0];
        
        switch(action) {
            case 'help':
                _addMatrixMsg('DkZ Agent', '**Befehle:**\n`!status` — System-Status\n`!skills` — Skill-Liste\n`!rooms` — Raum-Uebersicht\n`!hermes [msg]` — An Hermes senden\n`!ticket [titel]` — Neues Hermes-Ticket\n`!clear` — Chat leeren\n`/help` — Diese Hilfe', 'bot');
                break;
            case 'status':
                _addMatrixMsg('DkZ Agent', '**System Status:**\n`Matrix:` ' + (_matrixConfig.token ? '🟢 Verbunden' : '🔴 Kein Token') +
                    '\n`Bridge:` 🟢 v2.0\n`Module:` 89+\n`Skills:` 1.493', 'bot');
                break;
            case 'skills':
                _addMatrixMsg('DkZ Agent', '**Top Skills:** superpowers-dkz, power-plus, grill-with-docs, startup, checkup, health-agent, mod-builder, handoff, stitch-design', 'bot');
                break;
            case 'rooms':
                _addMatrixMsg('DkZ Agent', _matrixRooms.map(r => r.icon + ' **' + r.name + '** — ' + r.desc).join('\n'), 'bot');
                break;
            case 'hermes':
                const hermesMsg = parts.slice(1).join(' ');
                if (hermesMsg) _sendToHermesMatrix(hermesMsg);
                else _addMatrixMsg('system', 'Verwendung: `!hermes [nachricht]`');
                break;
            case 'ticket':
                const ticketTitle = parts.slice(1).join(' ') || 'Neues Ticket';
                const ticketId = 'HRM-' + String(Date.now()).slice(-4);
                _addMatrixMsg('Hermes', '📋 **Ticket erstellt:** `' + ticketId + '`\n' + esc(ticketTitle) + '\nStatus: OFFEN | Prioritaet: NORMAL', 'hermes');
                if (!_matrixMessages['dkz-hermes']) _matrixMessages['dkz-hermes'] = [];
                _matrixMessages['dkz-hermes'].push({sender:'Hermes', text:'📋 Ticket ' + ticketId + ': ' + ticketTitle, time:_ts(), type:'hermes'});
                const hermesRoom = _matrixRooms.find(r => r.id === 'dkz-hermes');
                if (hermesRoom && _activeMatrixRoom !== 'dkz-hermes') hermesRoom.unread = (hermesRoom.unread||0) + 1;
                saveMatrixData();
                renderMatrixRooms();
                break;
            case 'clear':
                _matrixMessages[_activeMatrixRoom] = [{sender:'system', text:'Chat geleert — ' + _ts(), time:_ts(), type:'system'}];
                saveMatrixData(); renderMatrixMessages();
                break;
            default:
                _addMatrixMsg('DkZ Agent', 'Unbekannter Befehl: `' + esc(action) + '`. Nutze `!help` fuer Hilfe.', 'bot');
        }
    }

    function _simulateMatrixBotReply(text) {
        const typing = document.getElementById('dkz-mat-typing');
        if (typing) typing.style.display = 'block';
        setTimeout(() => {
            if (typing) typing.style.display = 'none';
            const lower = text.toLowerCase();
            if (lower.includes('hermes') || lower.includes('ticket') || lower.includes('deploy')) {
                _addMatrixMsg('Hermes', _getHermesReply(lower), 'hermes');
            } else {
                _addMatrixMsg('DkZ Agent', _getAgentReply(lower), 'bot');
            }
        }, 800 + Math.random() * 1000);
    }

    function _getAgentReply(text) {
        if (text.includes('hallo') || text.includes('hi') || text.includes('hey')) return 'Hallo Europa! 🫡 Wie kann ich helfen?';
        if (text.includes('status')) return '🟢 Alle Systeme laufen. 89 Module aktiv. Git: feat/second-brain-v2-dashy-nexus';
        if (text.includes('skill')) return 'Aktuell 42+ Skills in `.agents/skills/`. Meistgenutzt: superpowers-dkz, power-plus, grill-with-docs';
        if (text.includes('modul')) return '89+ Module unter `01_PROJECTS/01_dashboard/modules/`. Zuletzt: Hermes 3D, Webhook Dashboard, Paperclip v2';
        return 'Verstanden. Nutze `!help` fuer Befehle oder schreibe direkt an Hermes.';
    }

    function _getHermesReply(text) {
        if (text.includes('deploy')) return '🚀 Deployment-Check:\n`devkitz.eu` — 🟢 Online\nLetzter Deploy: vor 14 Min';
        if (text.includes('ticket')) return '📋 Aktuelle Tickets:\n`HRM-001` — Dashboard Hub CSS Fix — OFFEN\n`HRM-002` — VPS SSL Erneuerung — ERLEDIGT\nNutze `!ticket [titel]` fuer neue Tickets.';
        return 'Hermes hier. Ich verarbeite deine Anfrage: **' + esc(text) + '**';
    }

    function _addMatrixMsg(sender, text, type) {
        if (!_matrixMessages[_activeMatrixRoom]) _matrixMessages[_activeMatrixRoom] = [];
        _matrixMessages[_activeMatrixRoom].push({sender, text, time:_ts(), type: type || 'bot'});
        saveMatrixData();
        renderMatrixMessages();
        renderMatrixRooms();
    }

    function updateMatrixUnreadBadge() {
        const totalUnread = _matrixRooms.reduce((sum, r) => sum + (r.unread || 0), 0);
        let badge = document.getElementById('dkz-copilot-unread-badge');
        if (totalUnread > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.id = 'dkz-copilot-unread-badge';
                Object.assign(badge.style, {
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#fa1e4e',
                    color: 'white',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    boxShadow: '0 2px 8px rgba(250, 30, 78, 0.4)',
                    border: '1px solid #111116',
                    pointerEvents: 'none'
                });
                const btn = document.getElementById('dkz-copilot-btn');
                if (btn) {
                    btn.style.position = 'relative';
                    btn.appendChild(badge);
                }
            }
            badge.textContent = totalUnread;
        } else if (badge) {
            badge.remove();
        }
    }

    // ─── Persistent Panel: hide/show statt create/remove ───
    let _panelEl = null;
    let _activeTab = 'chat';
    function togglePanel() {
        _hideMatrixChat();
        _hideMatrixSettings();
        if (_panelEl) { _panelEl.style.display = _panelEl.style.display === 'none' ? 'block' : 'none'; return; }
        const p = getProvider(), hasKey = !!getApiKey();
        _panelEl = document.createElement('div'); _panelEl.id = 'dkz-copilot-panel';
        const provOpts = Object.entries(PROVIDERS).map(([id, pr]) => `<option value="${id}" ${id===p.id?'selected':''}>${pr.name}</option>`).join('');
        const showCosts = localStorage.getItem('dkz-show-costs') !== 'false';
        const useDkzLogo = localStorage.getItem('dkz-use-logo') !== 'false';
        const customBrand = localStorage.getItem('dkz-custom-brand') || '';
        const apiLink = API_LINKS[p.id] || '';
        const apiLinkHtml = apiLink ? `<a href="${apiLink}" target="_blank" style="font-size:.6rem;color:#818cf8;text-decoration:none;margin-left:4px">🔗 Key holen</a>` : '';
        _panelEl.innerHTML = `<div style="position:fixed;bottom:74px;right:20px;width:420px;max-height:600px;background:#111116;border:1px solid rgba(129,140,248,0.3);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.5);z-index:99991;font-family:'Inter',sans-serif;display:flex;flex-direction:column;overflow:hidden">
            <div style="background:#0e0e10;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.04)">
                <div style="display:flex;align-items:center;gap:6px"><span style="font-weight:700;font-size:.82rem;color:#f0f0f2">🤖 Copilot</span>
                    <select id="dkz-cop-quick-prov" onchange="DkzCopilot._quickSwitch(this.value)" style="background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:3px 6px;color:#a1a1aa;font-size:.6rem;font-family:monospace;outline:none;max-width:120px">${provOpts}</select>
                    <span id="dkz-cop-status-dot" style="width:6px;height:6px;border-radius:50%;background:${hasKey?'#00ff88':'#71717a'}"></span>
                </div>
                <div style="display:flex;gap:4px">
                    <button onclick="DkzCopilot._toggleNlm()" title="NotebookLM" style="background:none;border:none;color:#fac832;cursor:pointer;font-size:.85rem">📓</button>
                    <button onclick="DkzCopilot._hidePanel()" style="background:none;border:none;color:#71717a;cursor:pointer;font-size:.95rem">✕</button>
                </div>
            </div>
            <!-- TAB BAR (v2.007 — 6 Tabs) -->
            <div style="display:flex;border-bottom:1px solid rgba(255,255,255,0.04);flex-wrap:wrap">
                <button id="dkz-cop-tab-chat" onclick="DkzCopilot._switchTab('chat')" style="flex:1;padding:7px;background:rgba(99,102,241,0.08);border:none;border-bottom:2px solid #6366f1;color:#818cf8;font-size:.6rem;font-weight:700;cursor:pointer;font-family:inherit">💬 Chat</button>
                <button id="dkz-cop-tab-promptr" onclick="DkzCopilot._switchTab('promptr')" style="flex:1;padding:7px;background:transparent;border:none;border-bottom:2px solid transparent;color:#71717a;font-size:.6rem;font-weight:700;cursor:pointer;font-family:inherit">🎯 Promptr</button>
                <button id="dkz-cop-tab-schwarm" onclick="DkzCopilot._switchTab('schwarm')" style="flex:1;padding:7px;background:transparent;border:none;border-bottom:2px solid transparent;color:#71717a;font-size:.6rem;font-weight:700;cursor:pointer;font-family:inherit">🐝 Schwarm</button>
                <button id="dkz-cop-tab-modules" onclick="DkzCopilot._switchTab('modules')" style="flex:1;padding:7px;background:transparent;border:none;border-bottom:2px solid transparent;color:#71717a;font-size:.6rem;font-weight:700;cursor:pointer;font-family:inherit">📦 Module</button>
                <button id="dkz-cop-tab-monitor" onclick="DkzCopilot._switchTab('monitor')" style="flex:1;padding:7px;background:transparent;border:none;border-bottom:2px solid transparent;color:#71717a;font-size:.6rem;font-weight:700;cursor:pointer;font-family:inherit">📊 Monitor</button>
                <button id="dkz-cop-tab-settings" onclick="DkzCopilot._switchTab('settings')" style="flex:1;padding:7px;background:transparent;border:none;border-bottom:2px solid transparent;color:#71717a;font-size:.6rem;font-weight:700;cursor:pointer;font-family:inherit">🔧 Werkzeuge</button>
            </div>
            <!-- NLM POPUP -->
            <div id="dkz-cop-nlm-popup" style="display:none;padding:10px 14px;background:rgba(250,200,50,0.04);border-bottom:1px solid rgba(250,200,50,0.15)">
                <div style="font-size:.7rem;font-weight:700;color:#fac832;margin-bottom:6px">📓 NotebookLM Schnellanfrage</div>
                <textarea id="dkz-cop-nlm-input" placeholder="Beschreibe was dein Notebook tun soll..." style="width:100%;min-height:50px;background:#1a1a20;border:1px solid rgba(250,200,50,0.15);border-radius:8px;padding:8px;color:#f0f0f2;font-size:.75rem;font-family:monospace;resize:vertical;outline:none;box-sizing:border-box"></textarea>
                <div style="display:flex;gap:4px;margin-top:6px">
                    <button onclick="DkzCopilot._nlmGenerate()" style="flex:1;padding:6px;background:rgba(250,200,50,0.1);border:1px solid rgba(250,200,50,0.2);border-radius:6px;color:#fac832;font-size:.7rem;font-weight:700;cursor:pointer">🤖 Prompt</button>
                    <button onclick="DkzCopilot._nlmMcp()" style="flex:1;padding:6px;background:rgba(129,140,248,0.08);border:1px solid rgba(129,140,248,0.2);border-radius:6px;color:#818cf8;font-size:.7rem;font-weight:700;cursor:pointer">📓 MCP</button>
                    <a href="${_resolveModulePath('nlm-builder')}" style="padding:6px 10px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);border-radius:6px;color:#00ff88;font-size:.7rem;font-weight:700;text-decoration:none;text-align:center">🏗️ Builder</a>
                </div>
            </div>
            <!-- TAB: CHAT -->
            <div id="dkz-cop-panel-chat" style="display:flex;flex-direction:column;flex:1;overflow:hidden">
                <div id="dkz-cop-msgs" style="flex:1;overflow-y:auto;padding:12px;max-height:340px">
                    <div style="background:rgba(129,140,248,0.06);border-left:3px solid #818cf8;padding:8px 12px;border-radius:0 8px 8px 0;font-size:.72rem;color:#a1a1aa;line-height:1.5">
                        <strong style="color:#818cf8">🤖 Copilot:</strong> 18 LLMs + 🧊 Iceberg + 📓 NLM + 🔌 MCP<br>
                        Provider: <strong>${p.name}</strong> ${hasKey ? '✅' : '— ⚙️ Key setzen'} · <strong>${_detectModule()}</strong><br>
                        Gateway: <span id="dkz-cop-gw-status" style="color:${_gatewayOnline ? '#00ff88' : '#71717a'}">${_gatewayOnline ? '🟢 Online' : '⚫ Offline'}</span> · WS: <span id="dkz-cop-ws-status" style="color:${_wsClient ? '#00ff88' : '#71717a'}">${_wsClient ? '🟢' : '⚫'}</span><br>
                        <span style="font-size:.58rem;color:#52525b">.help .providers .mcp .notebooklm .costs .prompts .settings</span></div>
                </div>
                <div style="padding:8px 12px;border-top:1px solid rgba(255,255,255,0.04);display:flex;gap:6px">
                    <input id="dkz-cop-input" type="text" placeholder="Frag mich..." style="flex:1;background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:8px 12px;color:#f0f0f2;font-size:.8rem;outline:none" onkeydown="if(event.key==='Enter')DkzCopilot.send()">
                    <button onclick="DkzCopilot.send()" style="background:linear-gradient(135deg,#6366f1,#818cf8);color:white;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;font-weight:600">📨</button>
                </div>
            </div>
            <!-- TAB: PROMPTR (ex Builder) -->
            <div id="dkz-cop-panel-promptr" style="display:none;overflow-y:auto;padding:12px;max-height:460px">
                <div style="font-size:.72rem;font-weight:800;color:#f0f0f2;margin-bottom:10px;display:flex;align-items:center;gap:6px">🏗️ Prompt Builder
                    <span title="Interaktiver Builder zum Erstellen von Projekten, Prompts und Code-Generierung" style="cursor:help;color:#818cf8;font-size:.65rem">❓</span>
                </div>
                <!-- Dokumente Hochladen -->
                <div style="margin-bottom:12px">
                    <div style="font-size:.62rem;font-weight:700;color:#8a8a9a;text-transform:uppercase;margin-bottom:6px;display:flex;align-items:center;gap:4px">📄 Dokumente hochladen
                        <span title="Drive-Dokumente, PDFs, Text-Dateien oder Code hochladen" style="cursor:help;color:#ffb800;font-size:.55rem">❓</span>
                    </div>
                    <div style="display:flex;gap:6px;margin-bottom:6px">
                        <label style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:10px;background:rgba(99,102,241,0.06);border:1px dashed rgba(99,102,241,0.25);border-radius:8px;cursor:pointer;color:#818cf8;font-size:.7rem;font-weight:600;transition:all .2s">
                            <input type="file" id="dkz-cop-file-upload" multiple accept=".txt,.md,.json,.html,.css,.js,.pdf,.csv" style="display:none" onchange="DkzCopilot._onFileUpload(this)">
                            📁 Datei wählen
                        </label>
                        <label style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:10px;background:rgba(0,255,136,0.06);border:1px dashed rgba(0,255,136,0.2);border-radius:8px;cursor:pointer;color:#00ff88;font-size:.7rem;font-weight:600;transition:all .2s">
                            <input type="file" id="dkz-cop-folder-upload" webkitdirectory directory style="display:none" onchange="DkzCopilot._onFolderUpload(this)">
                            📂 Ordner wählen
                        </label>
                    </div>
                    <div id="dkz-cop-upload-status" style="font-size:.6rem;color:#52525b;min-height:16px"></div>
                </div>
                <!-- Lokaler Pfad -->
                <div style="margin-bottom:12px">
                    <div style="font-size:.62rem;font-weight:700;color:#8a8a9a;text-transform:uppercase;margin-bottom:6px;display:flex;align-items:center;gap:4px">📌 Lokaler Ordner-Pfad
                        <span title="Gib einen lokalen Pfad an (z.B. C:\\DEVKiTZ\\modules\\)" style="cursor:help;color:#ffb800;font-size:.55rem">❓</span>
                    </div>
                    <input id="dkz-cop-local-path" type="text" value="${localStorage.getItem('dkz-builder-path') || ''}" placeholder="C:\\DEVKiTZ\\01_PROJECTS\\" style="width:100%;padding:8px;background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#f0f0f2;font-family:monospace;font-size:.7rem;outline:none;box-sizing:border-box" onchange="localStorage.setItem('dkz-builder-path',this.value)">
                </div>
                <!-- Builder Optionen -->
                <div style="margin-bottom:12px">
                    <div style="font-size:.62rem;font-weight:700;color:#8a8a9a;text-transform:uppercase;margin-bottom:6px">🔧 Builder-Optionen</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
                        <label style="display:flex;align-items:center;gap:5px;padding:6px 8px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:6px;font-size:.62rem;color:#a1a1aa;cursor:pointer">
                            <input type="checkbox" checked style="accent-color:#fa1e4e"> DkZ™ Design
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;padding:6px 8px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:6px;font-size:.62rem;color:#a1a1aa;cursor:pointer">
                            <input type="checkbox" checked style="accent-color:#fa1e4e"> Shared Scripts
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;padding:6px 8px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:6px;font-size:.62rem;color:#a1a1aa;cursor:pointer">
                            <input type="checkbox" checked style="accent-color:#fa1e4e"> Glassmorphism
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;padding:6px 8px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:6px;font-size:.62rem;color:#a1a1aa;cursor:pointer">
                            <input type="checkbox" checked style="accent-color:#fa1e4e"> Responsive
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;padding:6px 8px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:6px;font-size:.62rem;color:#a1a1aa;cursor:pointer">
                            <input type="checkbox" style="accent-color:#fa1e4e"> Dark + Light
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;padding:6px 8px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:6px;font-size:.62rem;color:#a1a1aa;cursor:pointer">
                            <input type="checkbox" style="accent-color:#fa1e4e"> Offline-First
                        </label>
                    </div>
                </div>
                <!-- Logo / Branding -->
                <div style="margin-bottom:12px;padding:10px;background:rgba(250,30,78,0.04);border:1px solid rgba(250,30,78,0.1);border-radius:10px">
                    <div style="font-size:.62rem;font-weight:700;color:#fa6b8a;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:4px">🎨 Branding
                        <span title="Standard: DEVKiTZ™ Branding. Deaktiviere den Haken oder lade eigenes Logo hoch." style="cursor:help;color:#ffb800;font-size:.55rem">❓</span>
                    </div>
                    <label style="display:flex;align-items:center;gap:6px;margin-bottom:8px;cursor:pointer">
                        <input type="checkbox" id="dkz-cop-use-logo" ${useDkzLogo?'checked':''} onchange="localStorage.setItem('dkz-use-logo',this.checked)" style="accent-color:#fa1e4e">
                        <span style="font-size:.68rem;color:#e8e8ec;font-weight:600">DEVKiTZ™ Logo einbetten</span>
                    </label>
                    <div style="display:flex;gap:6px;align-items:center">
                        <label style="padding:6px 10px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:6px;cursor:pointer;color:#818cf8;font-size:.62rem;font-weight:600">
                            <input type="file" accept="image/*" style="display:none" onchange="DkzCopilot._onBrandUpload(this)">
                            📤 Eigenes Logo
                        </label>
                        <span id="dkz-cop-brand-name" style="font-size:.58rem;color:#52525b">${customBrand ? '✅ Custom Brand geladen' : 'Kein Custom Brand'}</span>
                    </div>
                </div>
                <!-- Build Button -->
                <button onclick="DkzCopilot._startBuild()" style="width:100%;padding:10px;background:linear-gradient(135deg,#fa1e4e,#f97316);color:white;border:none;border-radius:10px;cursor:pointer;font-weight:800;font-size:.8rem;font-family:inherit;transition:all .2s;margin-top:4px">🚀 Build starten</button>
            </div>
            <!-- TAB: SCHWARM -->
            <div id="dkz-cop-panel-schwarm" style="display:none;overflow-y:auto;padding:12px;max-height:460px">
                <div style="font-size:.72rem;font-weight:800;color:#f0f0f2;margin-bottom:10px">🐝 Schwarm — Agent-Orchestrierung</div>
                <div style="display:grid;gap:8px">
                    <div style="background:rgba(0,255,136,.04);border:1px solid rgba(0,255,136,.12);border-radius:8px;padding:8px 10px;font-size:.65rem;display:flex;align-items:center;gap:8px">
                        <span style="font-size:1rem">🤖</span>
                        <div><strong style="color:#00ff88">James™</strong> <span style="color:#52525b">— Guardian, überwacht</span><br><span style="color:#3f3f46;font-size:.55rem">Status: 🟢 Aktiv · Letzter Check: gerade</span></div>
                    </div>
                    <div style="background:rgba(250,30,78,.04);border:1px solid rgba(250,30,78,.12);border-radius:8px;padding:8px 10px;font-size:.65rem;display:flex;align-items:center;gap:8px">
                        <span style="font-size:1rem">👨‍💻</span>
                        <div><strong style="color:#fa1e4e">Developer™</strong> <span style="color:#52525b">— Ralph-Loop Executor</span><br><span style="color:#3f3f46;font-size:.55rem">Status: 🟢 Bereit · Tasks: 0 pending</span></div>
                    </div>
                    <div style="background:rgba(129,140,248,.04);border:1px solid rgba(129,140,248,.12);border-radius:8px;padding:8px 10px;font-size:.65rem;display:flex;align-items:center;gap:8px">
                        <span style="font-size:1rem">🔍</span>
                        <div><strong style="color:#818cf8">Reviewer™</strong> <span style="color:#52525b">— CodeRabbit QA</span><br><span style="color:#3f3f46;font-size:.55rem">Status: 🟢 Bereit · Offene Reviews: 0</span></div>
                    </div>
                    <div style="background:rgba(250,200,50,.04);border:1px solid rgba(250,200,50,.12);border-radius:8px;padding:8px 10px;font-size:.65rem;display:flex;align-items:center;gap:8px">
                        <span style="font-size:1rem">🧪</span>
                        <div><strong style="color:#fac832">Tester™</strong> <span style="color:#52525b">— Validierung</span><br><span style="color:#3f3f46;font-size:.55rem">Status: 🟡 Idle · Tests: 430 passed</span></div>
                    </div>
                </div>
                <div style="margin-top:10px;font-size:.55rem;color:#52525b">Ralph-Loop v6 · BMAD™ Methodik · 7 Agenten bereit</div>
            </div>
            <!-- TAB: MODULE -->
            <div id="dkz-cop-panel-modules" style="display:none;overflow-y:auto;padding:12px;max-height:460px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                    <div style="font-size:.72rem;font-weight:800;color:#f0f0f2">📦 Modul-Richter</div>
                    <span id="dkz-mod-count" style="background:rgba(250,30,78,.12);padding:1px 6px;border-radius:4px;font-size:.55rem;color:#fa1e4e;font-weight:700">130+ Module</span>
                </div>
                <input type="text" id="dkz-mod-search" placeholder="🔍 Modul suchen..." oninput="DkzCopilot._filterModules(this.value)" style="width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;color:#f0f0f2;font-size:.7rem;outline:none;margin-bottom:8px;box-sizing:border-box;font-family:inherit">
                <div style="display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap">
                    <span id="dkz-mod-active" style="display:flex;align-items:center;gap:3px;font-size:.55rem;padding:2px 6px;border-radius:4px;background:rgba(0,255,136,.06);border:1px solid rgba(0,255,136,.15);color:#00ff88;cursor:default">🟢 <span>--</span> Aktiv</span>
                    <span id="dkz-mod-review" style="display:flex;align-items:center;gap:3px;font-size:.55rem;padding:2px 6px;border-radius:4px;background:rgba(255,184,0,.06);border:1px solid rgba(255,184,0,.15);color:#ffb800;cursor:default">🟡 <span>--</span> Review</span>
                    <span id="dkz-mod-draft" style="display:flex;align-items:center;gap:3px;font-size:.55rem;padding:2px 6px;border-radius:4px;background:rgba(255,59,92,.06);border:1px solid rgba(255,59,92,.15);color:#ff3b5c;cursor:default">🔴 <span>--</span> Draft</span>
                </div>
                <div id="dkz-mod-grid" style="display:grid;grid-template-columns:1fr;gap:4px;max-height:300px;overflow-y:auto">
                    <div style="text-align:center;padding:20px;color:#52525b;font-size:.65rem">⏳ Module werden geladen...</div>
                </div>
                <button onclick="DkzCopilot._loadModulesTab()" style="width:100%;margin-top:8px;padding:6px;background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.15);border-radius:6px;color:#818cf8;font-size:.6rem;font-weight:600;cursor:pointer;font-family:inherit">🔄 Module laden</button>
            </div>
            <!-- TAB: MONITOR -->
            <div id="dkz-cop-panel-monitor" style="display:none;overflow-y:auto;padding:12px;max-height:460px">
                <div style="font-size:.72rem;font-weight:800;color:#f0f0f2;margin-bottom:10px">📊 System Monitor</div>
                <div id="dkz-mon-grid" style="display:grid;gap:6px">
                    <div style="text-align:center;padding:20px;color:#52525b;font-size:.65rem">⏳ Status laden...</div>
                </div>
            </div>
            <!-- TAB: SETTINGS -->
            <div id="dkz-cop-panel-settings" style="display:none;overflow-y:auto;padding:12px;max-height:460px">
                <div style="font-size:.72rem;font-weight:800;color:#f0f0f2;margin-bottom:10px">⚙️ Einstellungen</div>
                <!-- Provider -->
                <div style="margin-bottom:10px">
                    <label style="font-size:.62rem;color:#71717a;font-weight:600;display:block;margin-bottom:4px">Provider</label>
                    <select id="dkz-cop-provider" onchange="DkzCopilot._onProvChange()" style="width:100%;padding:8px;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#f0f0f2;font-size:.75rem;outline:none">${Object.entries(PROVIDERS).map(([id, pr]) => `<option value="${id}" ${id === p.id ? 'selected' : ''}>${pr.name} (${pr.model})</option>`).join('')}</select>
                    <div id="dkz-cop-api-link" style="margin-top:4px;font-size:.6rem">${apiLinkHtml}</div>
                </div>
                <!-- API Key -->
                <div style="margin-bottom:10px">
                    <label style="font-size:.62rem;color:#71717a;font-weight:600;display:block;margin-bottom:4px">API Key</label>
                    <input id="dkz-cop-key" type="password" value="${getApiKey()}" placeholder="sk-..." style="width:100%;padding:8px;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#f0f0f2;font-family:monospace;font-size:.68rem;outline:none;box-sizing:border-box">
                </div>
                <!-- Model -->
                <div style="margin-bottom:10px">
                    <label style="font-size:.62rem;color:#71717a;font-weight:600;display:block;margin-bottom:4px">Model</label>
                    <input id="dkz-cop-model" type="text" value="${localStorage.getItem(`dkz-copilot-model-${p.id}`) || p.model}" style="width:100%;padding:8px;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#f0f0f2;font-family:monospace;font-size:.68rem;outline:none;box-sizing:border-box">
                </div>
                <!-- Ecosystem Options -->
                <div style="margin-bottom:12px;padding:10px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:8px">
                    <div style="font-size:.62rem;font-weight:700;color:#8a8a9a;text-transform:uppercase;margin-bottom:6px">🌐 Ökosystem</div>
                    <label style="display:flex;align-items:center;gap:6px;margin-bottom:6px;cursor:pointer">
                        <input type="checkbox" id="dkz-cop-show-costs" ${showCosts?'checked':''} onchange="localStorage.setItem('dkz-show-costs',this.checked)" style="accent-color:#ffb800">
                        <span style="font-size:.65rem;color:#e8e8ec">💰 Costs anzeigen (global)</span>
                    </label>
                    <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
                        <input type="checkbox" id="dkz-cop-use-logo-s" ${useDkzLogo?'checked':''} onchange="localStorage.setItem('dkz-use-logo',this.checked);const o=document.getElementById('dkz-cop-use-logo');if(o)o.checked=this.checked;" style="accent-color:#fa1e4e">
                        <span style="font-size:.65rem;color:#e8e8ec">🎨 DEVKiTZ™ Logo einbetten</span>
                    </label>
                </div>
                <div style="display:flex;gap:8px">
                    <button onclick="DkzCopilot._save()" style="flex:1;padding:10px;background:linear-gradient(135deg,#6366f1,#818cf8);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:.75rem;font-family:inherit">💾 Speichern</button>
                    <button onclick="DkzCopilot._test()" style="padding:10px 16px;background:rgba(0,255,136,0.08);color:#00ff88;border:1px solid rgba(0,255,136,0.2);border-radius:8px;cursor:pointer;font-weight:600;font-size:.7rem;font-family:inherit">🔌 Test</button>
                </div>
                <div id="dkz-cop-status" style="margin-top:8px;font-size:.6rem;text-align:center;color:#71717a"></div>
            </div>
        </div>`;
        document.body.appendChild(_panelEl);
    }
    function _hidePanel() { if (_panelEl) _panelEl.style.display = 'none'; }
    function _quickSwitch(id) {
        _setCookie('dkz-cop-prov', id);
        localStorage.setItem('dkz-copilot-provider', id);
        const dot = document.getElementById('dkz-cop-status-dot');
        if (dot) dot.style.background = getApiKey() ? '#00ff88' : '#71717a';
    }
    function _toggleNlm() {
        const popup = document.getElementById('dkz-cop-nlm-popup');
        if (popup) popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
    }
    async function _nlmGenerate() {
        const input = document.getElementById('dkz-cop-nlm-input');
        const goal = input?.value?.trim(); if (!goal) return;
        const nlmPrompt = `Erstelle einen NotebookLM-Prompt für: ${goal}\nFormat: Notebook-Name, Quellen-Anweisungen, Ausgabetyp-Empfehlung, optimaler Prompt.`;
        const msgs = document.getElementById('dkz-cop-msgs');
        msgs.innerHTML += `<div style="background:rgba(250,200,50,0.06);border-left:3px solid #fac832;padding:8px 12px;border-radius:0 8px 8px 0;margin-bottom:8px;font-size:.72rem;color:#a1a1aa"><strong style="color:#fac832">📓 NLM:</strong> ${esc(goal)}</div>`;
        const result = await chat(nlmPrompt, { name: 'NLM Quick' });
        const html = result.ok ? result.text.replace(/\n/g, '<br>') : '❌ ' + esc(result.text);
        msgs.innerHTML += `<div style="background:rgba(250,200,50,0.04);border-left:3px solid #fac832;padding:8px 12px;border-radius:0 8px 8px 0;margin-bottom:8px;font-size:.72rem;color:#a1a1aa;line-height:1.5"><strong style="color:#fac832">📓 NLM Prompt:</strong><br>${html}</div>`;
        msgs.scrollTop = msgs.scrollHeight;
    }
    function _nlmMcp() {
        const input = document.getElementById('dkz-cop-nlm-input');
        const goal = input?.value?.trim(); if (!goal) return;
        const cmd = `# NotebookLM MCP\ncreate_notebook "${goal}"\n\n# Quellen hinzufügen\n# add_source_url "https://..."\n# add_source_text "..."\n\n# Generieren\ngenerate_summary_report`;
        const msgs = document.getElementById('dkz-cop-msgs');
        msgs.innerHTML += `<div style="background:rgba(129,140,248,0.06);border-left:3px solid #818cf8;padding:8px 12px;border-radius:0 8px 8px 0;margin-bottom:8px;font-size:.7rem;color:#00ff88;font-family:monospace;white-space:pre-line;line-height:1.5"><strong style="color:#818cf8">📓 MCP:</strong>\n${esc(cmd)}</div>`;
        msgs.scrollTop = msgs.scrollHeight;
    }

    // ═══════════════════════════════════════
    // Settings
    // ═══════════════════════════════════════
    function openSettings() {
        const ex = document.getElementById('dkz-copilot-settings');
        if (ex) { ex.remove(); return; }
        const c = getProvider();
        const s = document.createElement('div'); s.id = 'dkz-copilot-settings';
        const apiLink = API_LINKS[c.id] || '';
        const apiLinkHtml = apiLink ? `<a href="${apiLink}" target="_blank" style="font-size:.6rem;color:#818cf8;text-decoration:none;margin-left:4px">🔗 Key holen</a>` : '';
        s.innerHTML = `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:420px;background:#111116;border:1px solid rgba(129,140,248,0.3);border-radius:16px;padding:24px;z-index:100001;box-shadow:0 20px 60px rgba(0,0,0,0.6);font-family:'Inter',sans-serif">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px"><h3 style="font-size:1rem;font-weight:700;color:#f0f0f2">⚙️ Copilot · ${Object.keys(PROVIDERS).length} Provider</h3><button onclick="document.getElementById('dkz-copilot-settings').remove()" style="background:none;border:none;color:#71717a;cursor:pointer;font-size:1.2rem">✕</button></div>
            <label style="font-size:.7rem;color:#71717a;font-weight:600;display:block;margin-bottom:4px">Provider</label>
            <select id="dkz-cop-provider" onchange="DkzCopilot._onProvChange()" style="width:100%;padding:8px;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#f0f0f2;font-size:.8rem;margin-bottom:8px;outline:none">${Object.entries(PROVIDERS).map(([id, p]) => `<option value="${id}" ${id === c.id ? 'selected' : ''}>${p.name} (${p.model})</option>`).join('')}</select>
            <div id="dkz-cop-api-link" style="margin-bottom:12px;font-size:.65rem">${apiLinkHtml}</div>
            <label style="font-size:.7rem;color:#71717a;font-weight:600;display:block;margin-bottom:4px">API Key</label>
            <input id="dkz-cop-key" type="password" value="${getApiKey()}" placeholder="sk-..." style="width:100%;padding:8px;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#f0f0f2;font-family:monospace;font-size:.7rem;margin-bottom:12px;outline:none;box-sizing:border-box">
            <label style="font-size:.7rem;color:#71717a;font-weight:600;display:block;margin-bottom:4px">Model</label>
            <input id="dkz-cop-model" type="text" value="${localStorage.getItem(`dkz-copilot-model-${c.id}`) || c.model}" style="width:100%;padding:8px;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#f0f0f2;font-family:monospace;font-size:.7rem;margin-bottom:16px;outline:none;box-sizing:border-box">
            <div style="display:flex;gap:8px"><button onclick="DkzCopilot._save()" style="flex:1;padding:10px;background:linear-gradient(135deg,#6366f1,#818cf8);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:.8rem">💾 Speichern</button><button onclick="DkzCopilot._test()" style="padding:10px 16px;background:rgba(0,255,136,0.08);color:#00ff88;border:1px solid rgba(0,255,136,0.2);border-radius:8px;cursor:pointer;font-weight:600;font-size:.75rem">🔌 Test</button></div>
            <div id="dkz-cop-status" style="margin-top:8px;font-size:.65rem;text-align:center;color:#71717a"></div></div>
        <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:100000" onclick="document.getElementById('dkz-copilot-settings').remove()"></div>`;
        document.body.appendChild(s);
    }
    function _save() {
        const pv = document.getElementById('dkz-cop-provider').value;
        const key = document.getElementById('dkz-cop-key').value;
        const model = document.getElementById('dkz-cop-model').value;
        _setCookie('dkz-cop-prov', pv);
        if (key) _setCookie(`dkz-cop-key-${pv}`, key);
        if (model) localStorage.setItem(`dkz-copilot-model-${pv}`, model);
        localStorage.setItem('dkz-copilot-provider', pv);
        if (key) localStorage.setItem(`dkz-copilot-key-${pv}`, key);
        const st = document.getElementById('dkz-cop-status');
        st.textContent = '✅ Gespeichert! (Cookie + localStorage)'; st.style.color = '#00ff88';
        setTimeout(() => document.getElementById('dkz-copilot-settings')?.remove(), 800);
    }
    async function _test() {
        const st = document.getElementById('dkz-cop-status');
        st.textContent = '⏳ Teste...'; st.style.color = '#71717a'; _save();
        await new Promise(r => setTimeout(r, 200));
        const res = await chat('Say: 🟢 OK', { name: 'Test' });
        st.textContent = res.ok ? `✅ ${res.provider} OK` : `❌ ${res.text}`;
        st.style.color = res.ok ? '#00ff88' : '#fa1e4e';
    }

    // Init — mit Error-Boundary (kein roter Konsolen-Fehler)
    function init() {
        try {
            _migrateKeysToCookies();
            loadMatrixData();
            injectChatWidget();
            checkGateway().then(online => {
                if (online) connectWebSocket();
            }).catch(() => { /* Gateway offline — normal */ });
            if (_matrixConfig && _matrixConfig.token) {
                setTimeout(() => {
                    try { _connectMatrix(); } catch (e) {
                        console.warn('[DkZ Copilot] Matrix-Verbindung fehlgeschlagen:', e.message);
                    }
                }, 1000);
            }
        } catch (e) {
            console.warn('[DkZ Copilot] Init-Fehler (nicht kritisch):', e.message);
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    // Path helpers — unterstützt Seiten innerhalb UND außerhalb von 01_dashboard
    function _resolveModulePath(name) {
        const path = window.location.pathname;
        if (path.includes('/modules/')) return `../${name}/index.html`;
        if (path.includes('/landing-pages/') || path.includes('/hub/') || path.includes('/mainboard/')) return `../modules/${name}/index.html`;
        // Externe Seiten (außerhalb 01_dashboard)
        if (path.includes('/10_wiki-hub/')) return `../01_dashboard/modules/${name}/index.html`;
        if (path.includes('/04_flyer_engine/')) return `../01_dashboard/modules/${name}/index.html`;
        if (path.includes('/08_aiaikirk/wiki/dashboards/')) return `../../../../01_dashboard/modules/${name}/index.html`;
        if (path.includes('/08_aiaikirk/wiki/')) return `../../../01_dashboard/modules/${name}/index.html`;
        if (path.includes('/09_autopilot/dashboard/')) return `../../../01_dashboard/modules/${name}/index.html`;
        if (path.includes('/09_autopilot/')) return `../../01_dashboard/modules/${name}/index.html`;
        return `modules/${name}/index.html`;
    }
    function _resolveHubPath() {
        const path = window.location.pathname;
        if (path.includes('/modules/')) return '../../hub/index.html';
        if (path.includes('/landing-pages/') || path.includes('/mainboard/')) return '../hub/index.html';
        // Externe Seiten (außerhalb 01_dashboard)
        if (path.includes('/10_wiki-hub/')) return '../01_dashboard/hub/index.html';
        if (path.includes('/04_flyer_engine/')) return '../01_dashboard/hub/index.html';
        if (path.includes('/08_aiaikirk/wiki/dashboards/')) return '../../../../01_dashboard/hub/index.html';
        if (path.includes('/08_aiaikirk/wiki/')) return '../../../01_dashboard/hub/index.html';
        if (path.includes('/09_autopilot/dashboard/')) return '../../../01_dashboard/hub/index.html';
        if (path.includes('/09_autopilot/')) return '../../01_dashboard/hub/index.html';
        return 'hub/index.html';
    }

    function _onProvChange() {
        const sel = document.getElementById('dkz-cop-provider');
        const id = sel?.value; if (!id) return;
        const pr = PROVIDERS[id]; if (!pr) return;
        const keyEl = document.getElementById('dkz-cop-key');
        const modelEl = document.getElementById('dkz-cop-model');
        const linkEl = document.getElementById('dkz-cop-api-link');
        if (keyEl) keyEl.value = localStorage.getItem(`dkz-copilot-key-${id}`) || '';
        if (modelEl) modelEl.value = localStorage.getItem(`dkz-copilot-model-${id}`) || pr.model;
        const apiLink = API_LINKS[id] || '';
        if (linkEl) linkEl.innerHTML = apiLink ? `<a href="${apiLink}" target="_blank" style="font-size:.6rem;color:#818cf8;text-decoration:none">🔗 Key holen → ${new URL(apiLink).hostname}</a>` : '';
    }

    // ═══════════════════════════════════════
    // Builder Helpers
    // ═══════════════════════════════════════
    function _switchTab(tab) {
        _activeTab = tab;
        ['chat', 'promptr', 'schwarm', 'modules', 'monitor', 'settings'].forEach(t => {
            const panel = document.getElementById('dkz-cop-panel-' + t);
            const btn = document.getElementById('dkz-cop-tab-' + t);
            if (panel) panel.style.display = t === tab ? (t === 'chat' ? 'flex' : 'block') : 'none';
            if (btn) {
                btn.style.background = t === tab ? 'rgba(99,102,241,0.08)' : 'transparent';
                btn.style.borderBottomColor = t === tab ? '#6366f1' : 'transparent';
                btn.style.color = t === tab ? '#818cf8' : '#71717a';
            }
        });
        // Lazy-load modules tab
        if (tab === 'modules') _loadModulesTab();
        if (tab === 'monitor') _loadMonitorTab();
    }

    let _uploadedFiles = [];
    function _onFileUpload(input) {
        const files = Array.from(input.files);
        const status = document.getElementById('dkz-cop-upload-status');
        _uploadedFiles = files;
        if (status) status.innerHTML = `✅ ${files.length} Datei(en): ${files.map(f => '<strong>' + esc(f.name) + '</strong>').join(', ')}`;
    }
    function _onFolderUpload(input) {
        const files = Array.from(input.files);
        const status = document.getElementById('dkz-cop-upload-status');
        _uploadedFiles = files;
        if (status) status.innerHTML = `📂 ${files.length} Dateien aus Ordner geladen`;
    }
    function _onBrandUpload(input) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            localStorage.setItem('dkz-custom-brand', reader.result);
            const nameEl = document.getElementById('dkz-cop-brand-name');
            if (nameEl) nameEl.textContent = '✅ ' + file.name;
        };
        reader.readAsDataURL(file);
    }
    function _startBuild() {
        const opts = [];
        const checkboxes = document.querySelectorAll('#dkz-cop-panel-builder input[type="checkbox"]');
        checkboxes.forEach(cb => { if (cb.checked && cb.parentElement?.textContent) opts.push(cb.parentElement.textContent.trim()); });
        const localPath = document.getElementById('dkz-cop-local-path')?.value || '';
        const fileNames = _uploadedFiles.map(f => f.name);

        let prompt = '🏗️ BUILD REQUEST\n';
        if (opts.length) prompt += 'Optionen: ' + opts.join(', ') + '\n';
        if (localPath) prompt += 'Pfad: ' + localPath + '\n';
        if (fileNames.length) prompt += 'Dateien: ' + fileNames.join(', ') + '\n';
        prompt += '\nErstelle das Projekt mit den gewählten Optionen. DkZ™ Design System v2, Vanilla HTML/CSS/JS.';

        _switchTab('chat');
        const input = document.getElementById('dkz-cop-input');
        if (input) { input.value = prompt; send(); }
    }

    // ═══════════════════════════════════════
    // Module Tab — Modul-Richter
    // ═══════════════════════════════════════
    const _COP_MODULES = [
        {n:'Action Builder',p:'action-builder',c:'builder',i:'⚡'},{n:'Agent Builder',p:'agent-builder',c:'builder',i:'🤖'},
        {n:'Agent Control',p:'agent-control-panel',c:'ai',i:'🎛️'},{n:'AI Chat',p:'ai_chat',c:'ai',i:'💬'},
        {n:'Analyser',p:'analyser',c:'tools',i:'📊'},{n:'API Tester',p:'api-tester',c:'tools',i:'🔌'},
        {n:'App Builder',p:'app-builder',c:'builder',i:'📱'},{n:'AppScript',p:'appscript-builder',c:'builder',i:'📜'},
        {n:'ASCII Tool',p:'ascii-tool',c:'tools',i:'🔤'},{n:'Design Stitch',p:'awesome-design-stitch',c:'media',i:'🎨'},
        {n:'Design Vanilla',p:'awesome-design-vanilla',c:'media',i:'🖌️'},{n:'Base64',p:'base64-tools',c:'tools',i:'🔐'},
        {n:'Black8',p:'black8-builder',c:'builder',i:'🖤'},{n:'Blog Commander',p:'blog-commander',c:'media',i:'📝'},
        {n:'Blog Designer',p:'blog-designer',c:'media',i:'🎭'},{n:'Bookmarks',p:'bookmark-manager',c:'tools',i:'🔖'},
        {n:'BotNet Admin',p:'botnet-admin',c:'ai',i:'🕸️'},{n:'Builder Gallery',p:'builder-gallery',c:'builder',i:'🏛️'},
        {n:'Changelog',p:'changelog-builder',c:'builder',i:'📋'},{n:'Claudia Cloud',p:'claudia-cloud',c:'ai',i:'☁️'},
        {n:'Clipboard',p:'clipboard',c:'tools',i:'📎'},{n:'Cloud Control',p:'cloud-control',c:'system',i:'☁️'},
        {n:'Code Differ',p:'code-differ',c:'tools',i:'🔀'},{n:'CodeRabbit',p:'coderabbit-panel',c:'ai',i:'🐰'},
        {n:'Color Picker',p:'color-picker',c:'tools',i:'🎨'},{n:'Converter',p:'converter',c:'tools',i:'🔄'},
        {n:'Copilot',p:'copilot-presentation',c:'ai',i:'🤖'},{n:'Cost Calc',p:'cost-calculator',c:'data',i:'💰'},
        {n:'Cost Dashboard',p:'cost-dashboard',c:'data',i:'📊'},{n:'Cron Builder',p:'cron-builder',c:'builder',i:'⏰'},
        {n:'CS2 Config',p:'cs2-config',c:'tools',i:'🎮'},{n:'CSS Gen',p:'css-generator',c:'builder',i:'🎨'},
        {n:'DevNotes',p:'devnotes',c:'tools',i:'📝'},{n:'Display Config',p:'display-config',c:'system',i:'🖥️'},
        {n:'Design Studio',p:'dkz-design-studio',c:'media',i:'🎨'},{n:'DkZ Search',p:'dkz-search',c:'tools',i:'🔍'},
        {n:'Doc Engine',p:'doc-engine',c:'tools',i:'📄'},{n:'Docker Ops',p:'docker-ops',c:'system',i:'🐳'},
        {n:'Domain Control',p:'domain-control',c:'system',i:'🌐'},{n:'Drive Hub',p:'drive-hub',c:'data',i:'💾'},
        {n:'Ecosystem',p:'ecosystem-analyzer',c:'data',i:'🌍'},{n:'Emoji Picker',p:'emoji-picker',c:'tools',i:'😀'},
        {n:'Favicon Gen',p:'favicon-gen',c:'media',i:'🖼️'},{n:'Free AI Hub',p:'free-ai-hub',c:'ai',i:'🆓'},
        {n:'Gallery',p:'gallery',c:'media',i:'🖼️'},{n:'Graphify',p:'graphify',c:'data',i:'📈'},
        {n:'Hash Gen',p:'hash-generator',c:'security',i:'#️⃣'},{n:'Hermes 3D',p:'hermes-3d',c:'ai',i:'🧬'},
        {n:'Hood Builder',p:'hood-builder',c:'builder',i:'🏘️'},{n:'HTML Viewer',p:'html_viewer',c:'tools',i:'🌐'},
        {n:'Hyperreal Canvas',p:'hyperreal-canvas',c:'media',i:'✨'},{n:'Hyperreal Demo',p:'hyperreal-demo',c:'media',i:'🌟'},
        {n:'Iceberg',p:'iceberg',c:'data',i:'🧊'},{n:'Icon Creator',p:'icon-creator',c:'media',i:'🎯'},
        {n:'Image Forge',p:'image-forge',c:'media',i:'🖼️'},{n:'IP Tools',p:'ip-tools',c:'tools',i:'🌐'},
        {n:'JSON Format',p:'json-formatter',c:'tools',i:'{}'},{n:'Kanban',p:'kanban-board',c:'data',i:'📋'},
        {n:'KI Lernplattform',p:'ki-lernplattform',c:'ai',i:'🎓'},{n:'Leadership',p:'leadership-builder',c:'builder',i:'👑'},
        {n:'Link Gen',p:'link-generator',c:'tools',i:'🔗'},{n:'LLM Arena',p:'llm-arena',c:'ai',i:'⚔️'},
        {n:'LLM Costs',p:'llm-cost-board',c:'data',i:'💰'},{n:'Loop Dashboard',p:'loop-dashboard',c:'system',i:'🔄'},
        {n:'Lorem Gen',p:'lorem-generator',c:'tools',i:'📝'},{n:'MD Converter',p:'markdown_converter',c:'tools',i:'📄'},
        {n:'Matrix Center',p:'matrix-center',c:'system',i:'🔮'},{n:'Media Gallery',p:'media-gallery',c:'media',i:'📸'},
        {n:'Meta Tags',p:'meta-tag-gen',c:'tools',i:'🏷️'},{n:'n8n Viewer',p:'n8n-viewer',c:'system',i:'🔶'},
        {n:'NanoBot',p:'nanobot-center',c:'ai',i:'🤖'},{n:'Neural Swarm',p:'neural-swarm',c:'ai',i:'🧠'},
        {n:'NLM Builder',p:'nlm-builder',c:'ai',i:'📓'},{n:'Noter',p:'noter',c:'tools',i:'📝'},
        {n:'OBS FX',p:'obs-fx-overlay',c:'media',i:'🎬'},{n:'OpenClaw',p:'openclaw-vibe',c:'ai',i:'🦀'},
        {n:'Paperless',p:'paperless',c:'data',i:'📄'},{n:'Password Gen',p:'password-gen',c:'security',i:'🔑'},
        {n:'Playbook',p:'playbook-archiv',c:'data',i:'📚'},{n:'Project Registry',p:'project-registry',c:'data',i:'📋'},
        {n:'Prompter',p:'prompter',c:'ai',i:'💡'},{n:'Prompt Gen',p:'prompt-generator',c:'ai',i:'✍️'},
        {n:'QR Gen',p:'qr-generator',c:'tools',i:'📱'},{n:'QR Launcher',p:'qr-launcher',c:'tools',i:'🚀'},
        {n:'Rating',p:'rating-system',c:'data',i:'⭐'},{n:'Research',p:'research',c:'data',i:'🔬'},
        {n:'Ruleboard',p:'ruleboard',c:'system',i:'📏'},{n:'Second Brain',p:'second-brain',c:'data',i:'🧠'},
        {n:'Security',p:'security-scanner',c:'security',i:'🛡️'},{n:'SEO Toolkit',p:'seo-toolkit',c:'tools',i:'📈'},
        {n:'Settings',p:'settings',c:'system',i:'⚙️'},{n:'Skill Builder',p:'skill-builder',c:'builder',i:'🛠️'},
        {n:'Snippets',p:'snippet-manager',c:'tools',i:'✂️'},{n:'Social',p:'social-dashboard',c:'data',i:'📱'},
        {n:'Sportwetten',p:'sportwetten',c:'tools',i:'⚽'},{n:'Suno AI',p:'suno-ai',c:'ai',i:'🎵'},
        {n:'Supervisor',p:'supervisor-panel',c:'system',i:'👁️'},{n:'Swarm Control',p:'swarm-mission-control',c:'ai',i:'🐝'},
        {n:'System Check',p:'system-check',c:'system',i:'✅'},{n:'Tasker',p:'tasker',c:'tools',i:'✔️'},
        {n:'Team Builder',p:'team-builder',c:'builder',i:'👥'},{n:'Tenor',p:'tenor-builder',c:'builder',i:'🎵'},
        {n:'Timer',p:'timer-tools',c:'tools',i:'⏱️'},{n:'TTL Visual',p:'ttl-visualizer',c:'data',i:'📊'},
        {n:'Unit Convert',p:'unit-converter',c:'tools',i:'📏'},{n:'Video Gen',p:'video-generator',c:'media',i:'🎬'},
        {n:'VPS Monitor',p:'vps-monitor',c:'system',i:'🖥️'},{n:'Webhooks',p:'webhook-dashboard',c:'system',i:'🔔'},
        {n:'Whisper TTS',p:'whisper-tts',c:'ai',i:'🗣️'},{n:'Wiki Viewer',p:'wiki-viewer',c:'data',i:'📖'},
        {n:'WissenHub',p:'wissen-hub',c:'data',i:'🧠'},{n:'Workflow Builder',p:'workflow-builder',c:'builder',i:'🔧'},
        {n:'Workflow Viewer',p:'workflow-viewer',c:'system',i:'👁️'}
    ];
    let _modStatusCache = {};
    let _modItemsCache = null;

    function _getModuleBasePath() {
        const path = window.location.pathname;
        if (path.includes('/modules/')) return '../';
        if (path.includes('/hub/') || path.includes('/landing-pages/') || path.includes('/mainboard/')) return '../modules/';
        if (path.includes('/08_aiaikirk/')) return '../../../01_dashboard/modules/';
        if (path.includes('/09_autopilot/')) return '../../01_dashboard/modules/';
        return 'modules/';
    }

    async function _loadModulesTab() {
        const grid = document.getElementById('dkz-mod-grid');
        if (!grid) return;

        // SOFORT rendern — alle Module als "pending" anzeigen
        const items = _COP_MODULES.map(m => ({...m, status: _modStatusCache[m.p] || 'pending'}));
        _modItemsCache = items;
        _renderModGrid(items);

        // Status-Badges initial
        const total = items.length;
        const countEl = document.getElementById('dkz-mod-count');
        if (countEl) countEl.textContent = `${total} Module`;

        // Parallel Status-Check im Hintergrund
        const base = _getModuleBasePath();
        const unchecked = items.filter(m => !_modStatusCache[m.p]);
        if (unchecked.length === 0) { _updateModBadges(items); return; }

        // Batch in 20er-Gruppen um Browser nicht zu überlasten
        const batchSize = 20;
        for (let i = 0; i < unchecked.length; i += batchSize) {
            const batch = unchecked.slice(i, i + batchSize);
            const results = await Promise.allSettled(
                batch.map(async m => {
                    try {
                        const r = await fetch(`${base}${m.p}/index.html`, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
                        return { p: m.p, status: r.ok ? 'active' : 'draft' };
                    } catch { return { p: m.p, status: 'draft' }; }
                })
            );
            // Update cache + UI nach jeder Batch
            for (const r of results) {
                if (r.status === 'fulfilled') {
                    _modStatusCache[r.value.p] = r.value.status;
                    const item = items.find(m => m.p === r.value.p);
                    if (item) item.status = r.value.status;
                }
            }
            _renderModGrid(items, document.getElementById('dkz-mod-search')?.value || '');
            _updateModBadges(items);
        }
    }

    function _updateModBadges(items) {
        let active = 0, review = 0, draft = 0;
        for (const m of items) {
            if (m.status === 'active') active++;
            else if (m.status === 'review') review++;
            else if (m.status === 'draft') draft++;
        }
        const a = document.querySelector('#dkz-mod-active span'); if (a) a.textContent = active;
        const r2 = document.querySelector('#dkz-mod-review span'); if (r2) r2.textContent = review;
        const d = document.querySelector('#dkz-mod-draft span'); if (d) d.textContent = draft;
        const countEl = document.getElementById('dkz-mod-count');
        if (countEl) countEl.textContent = `${items.length} Module · ${active} aktiv`;
    }

    function _renderModGrid(items, filter = '') {
        const grid = document.getElementById('dkz-mod-grid');
        if (!grid) return;
        const f = (filter || '').toLowerCase();
        const filtered = items ? items.filter(m => !f || m.n.toLowerCase().includes(f) || m.p.includes(f) || m.c.includes(f)) : [];
        grid.innerHTML = filtered.map(m => {
            const dot = m.status === 'active' ? '🟢' : m.status === 'review' ? '🟡' : m.status === 'pending' ? '⏳' : '🔴';
            const modPath = _resolveModulePath(m.p);
            const onlineURL = `${m.p}.devkitz.sites`;
            return `<a href="${esc(modPath)}" style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04);border-radius:6px;text-decoration:none;transition:all .15s;font-size:.6rem" onmouseover="this.style.borderColor='rgba(250,30,78,.25)';this.style.background='rgba(250,30,78,.04)'" onmouseout="this.style.borderColor='rgba(255,255,255,.04)';this.style.background='rgba(255,255,255,.02)'">
                <span style="font-size:.85rem;width:20px;text-align:center">${m.i}</span>
                <div style="flex:1;min-width:0">
                    <div style="color:#e8e8ec;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.62rem">${esc(m.n)}</div>
                    <div style="color:#3f3f46;font-size:.48rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(onlineURL)} · ${esc(m.c)}</div>
                </div>
                <span style="font-size:.55rem">${dot}</span>
            </a>`;
        }).join('');
        if (!filtered.length) grid.innerHTML = '<div style="text-align:center;padding:12px;color:#52525b;font-size:.6rem">Keine Module gefunden</div>';
    }

    function _filterModules(val) {
        const items = _modItemsCache || _COP_MODULES.map(m => ({...m, status: _modStatusCache[m.p] || 'active'}));
        _renderModGrid(items, val);
    }

    // ═══════════════════════════════════════
    // Monitor Tab — System Status
    // ═══════════════════════════════════════
    async function _loadMonitorTab() {
        const grid = document.getElementById('dkz-mon-grid');
        if (!grid) return;
        const checks = [
            {name: 'API Gateway', url: GATEWAY_URL + '/api/v1/health', icon: '🔌'},
            {name: 'Iceberg Engine', url: ICEBERG_URL + '/health', icon: '🧊'},
            {name: 'vLLM Backend', url: 'http://srv1298466.hstgr.cloud:8080/health', icon: '🚀'},
            {name: 'devkitz.sites', url: 'https://devkitz.sites/health', icon: '🌐'},
            {name: 'web.dkz.app', url: 'https://web.dkz.app/health', icon: '🚀'},
        ];
        const wsStatus = _wsClient && _wsClient.readyState === 1;
        let html = `<div style="background:rgba(${wsStatus?'0,255,136':'255,59,92'},.04);border:1px solid rgba(${wsStatus?'0,255,136':'255,59,92'},.12);border-radius:8px;padding:8px 10px;font-size:.65rem;display:flex;align-items:center;gap:8px">
            <span style="font-size:.9rem">🔗</span>
            <div style="flex:1"><strong style="color:${wsStatus?'#00ff88':'#ff3b5c'}">WebSocket MCP</strong><br><span style="color:#3f3f46;font-size:.5rem">${WS_URL}</span></div>
            <span style="font-size:.6rem">${wsStatus?'🟢':'🔴'}</span>
        </div>`;
        for (const c of checks) {
            let st = '🔴', col = '#ff3b5c', label = 'Offline';
            try {
                const r = await fetch(c.url, { method: 'GET', signal: AbortSignal.timeout(2000) });
                if (r.ok) { st = '🟢'; col = '#00ff88'; label = 'Online'; }
                else { st = '🟡'; col = '#ffb800'; label = `HTTP ${r.status}`; }
            } catch { /* offline */ }
            html += `<div style="background:rgba(${col==='#00ff88'?'0,255,136':col==='#ffb800'?'255,184,0':'255,59,92'},.04);border:1px solid rgba(${col==='#00ff88'?'0,255,136':col==='#ffb800'?'255,184,0':'255,59,92'},.12);border-radius:8px;padding:8px 10px;font-size:.65rem;display:flex;align-items:center;gap:8px">
                <span style="font-size:.9rem">${c.icon}</span>
                <div style="flex:1"><strong style="color:${col}">${esc(c.name)}</strong><br><span style="color:#3f3f46;font-size:.5rem">${esc(c.url)}</span></div>
                <span style="font-size:.6rem">${st} ${label}</span>
            </div>`;
        }
        html += `<div style="margin-top:4px;font-size:.5rem;color:#3f3f46;text-align:center">v${VERSION} · ${new Date().toLocaleTimeString('de-DE')} · Provider: ${getProvider().name}</div>`;
        grid.innerHTML = html;
    }

    return { chat, send, openSettings, toggle: togglePanel, buildGTPrompt, injectChatWidget, searchIcebergBlocks, addMissingBlock,
        checkGateway, connectWebSocket, mcpCall,
        _save, _test, _quickSwitch, _toggleNlm, _nlmGenerate, _nlmMcp, _hidePanel, _onProvChange,
        _switchTab, _onFileUpload, _onFolderUpload, _onBrandUpload, _startBuild,
        _loadModulesTab, _filterModules, _loadMonitorTab,
        _hideMatrixChat, _hideMatrixSettings, _openMatrixSettings, _saveMatrixSettings, _connectMatrix,
        _switchMatrixRoom, _sendMatrixMsg, _hideContextMenu, _toggleNlmContextMenu,
        PROVIDERS, API_LINKS, VERSION, GATEWAY_URL, ICEBERG_URL, _detectModule, _isAdmin,
        get gatewayOnline() { return _gatewayOnline; },
        get wsConnected() { return _wsClient && _wsClient.readyState === 1; } };
})();
if (typeof module !== 'undefined') module.exports = DkzCopilot;
