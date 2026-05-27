/**
 * DkZ LLM Registry — Universal Provider + Model + Token + Cost System
 * @DKZ:TAG → [SYS:llm-registry] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R12 Kein Wissensverlust
 * @version v0.01.2_03
 *
 * Features:
 * - OpenRouter, NVIDIA, HuggingFace, OpenAI, Anthropic, Gemini, Grok, vLLM
 * - Per-Module / Per-Dashboard / Per-Worker API Token Zuweisung
 * - Kosten-Abrechnungssystem (Token-Tracking + Cost pro Provider)
 * - Kostenlose Modelle farbig markiert (🟢)
 * - Custom Model hinzufügen via + Button
 * - Display-Name vs. technischer Name in Listen
 */
const DkzLLM = (() => {
    'use strict';

    // ═══════════════════════════════════════
    // Provider Definitionen — @DKZ:TAG [SYS:providers]
    // ═══════════════════════════════════════
    const PROVIDERS = {
        openrouter: {
            name: 'OpenRouter', icon: '🌐', color: '#6366f1',
            baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
            authHeader: k => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://devkitz.local' }),
            format: 'openai',
            models: [
                { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', cost: 0, free: true },
                { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', cost: 0, free: true },
                { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1', cost: 0, free: true },
                { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B', cost: 0, free: true },
                { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1', cost: 0, free: true },
                { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', cost: 0, free: true },
                { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 405B', cost: 0, free: true },
                { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', cost: 0.15, free: false },
                { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', cost: 3.0, free: false },
                { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', cost: 0.8, free: false },
                { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', cost: 0.15, free: false },
                { id: 'openai/gpt-4o', name: 'GPT-4o', cost: 2.5, free: false },
                { id: 'openai/o3-mini', name: 'o3-mini', cost: 1.1, free: false },
            ]
        },
        openai: {
            name: 'OpenAI', icon: '🟢', color: '#10a37f',
            baseUrl: 'https://api.openai.com/v1/chat/completions',
            authHeader: k => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }),
            format: 'openai',
            models: [
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini', cost: 0.15, free: false },
                { id: 'gpt-4o', name: 'GPT-4o', cost: 2.5, free: false },
                { id: 'gpt-4.1', name: 'GPT-4.1', cost: 2.0, free: false },
                { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', cost: 0.4, free: false },
                { id: 'o3-mini', name: 'o3-mini', cost: 1.1, free: false },
            ]
        },
        anthropic: {
            name: 'Anthropic', icon: '🟤', color: '#d4a574',
            baseUrl: 'https://api.anthropic.com/v1/messages',
            authHeader: k => ({ 'x-api-key': k, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' }),
            format: 'anthropic',
            models: [
                { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', cost: 3.0, free: false },
                { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', cost: 0.8, free: false },
            ]
        },
        gemini: {
            name: 'Gemini', icon: '💎', color: '#4285f4',
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta/',
            authHeader: () => ({ 'Content-Type': 'application/json' }),
            format: 'gemini',
            models: [
                { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', cost: 0.15, free: false },
                { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', cost: 1.25, free: false },
                { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', cost: 0.1, free: false },
            ]
        },
        grok: {
            name: 'Grok', icon: '⚡', color: '#1da1f2',
            baseUrl: 'https://api.x.ai/v1/chat/completions',
            authHeader: k => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }),
            format: 'openai',
            models: [
                { id: 'grok-3-mini', name: 'Grok 3 Mini', cost: 0.3, free: false },
                { id: 'grok-3', name: 'Grok 3', cost: 3.0, free: false },
            ]
        },
        nvidia: {
            name: 'NVIDIA', icon: '🟩', color: '#76b900',
            baseUrl: 'https://integrate.api.nvidia.com/v1/chat/completions',
            authHeader: k => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }),
            format: 'openai',
            models: [
                { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', cost: 0, free: true },
                { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'Nemotron 70B', cost: 0, free: true },
                { id: 'mistralai/mistral-large-2-instruct', name: 'Mistral Large 2', cost: 0, free: true },
                { id: 'google/gemma-2-27b-it', name: 'Gemma 2 27B', cost: 0, free: true },
                { id: 'deepseek-ai/deepseek-r1', name: 'DeepSeek R1', cost: 0, free: true },
                { id: 'microsoft/phi-4', name: 'Phi-4', cost: 0, free: true },
                { id: 'qwen/qwen2.5-72b-instruct', name: 'Qwen 2.5 72B', cost: 0, free: true },
            ]
        },
        huggingface: {
            name: 'HuggingFace', icon: '🤗', color: '#ffbd45',
            baseUrl: 'https://api-inference.huggingface.co/models/',
            authHeader: k => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }),
            format: 'huggingface',
            models: [
                { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', cost: 0, free: true },
                { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B', cost: 0, free: true },
                { id: 'mistralai/Mistral-Small-24B-Instruct-2501', name: 'Mistral Small 24B', cost: 0, free: true },
                { id: 'google/gemma-2-27b-it', name: 'Gemma 2 27B', cost: 0, free: true },
                { id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B', name: 'DeepSeek R1 32B', cost: 0, free: true },
                { id: 'microsoft/phi-4', name: 'Phi-4', cost: 0, free: true },
                { id: 'NousResearch/Hermes-3-Llama-3.1-8B', name: 'Hermes 3 8B', cost: 0, free: true },
            ]
        },
        vllm: {
            name: 'vLLM + llama-swap', icon: '⚡', color: '#fa1e4e',
            baseUrl: 'http://srv1298466.hstgr.cloud:8080/v1/chat/completions',
            authHeader: () => ({ 'Content-Type': 'application/json' }),
            format: 'openai',
            models: [
                { id: 'gemma4-e2b', name: 'Gemma4 E2B ❤️ Heartbeat', cost: 0, free: true, tier: 'quick', role: 'heartbeat', alwaysOn: true },
                { id: 'gemma4-e4b', name: 'Gemma4 E4B', cost: 0, free: true, tier: 'quick', role: 'balance' },
                { id: 'qwen3-4b', name: 'Qwen3 4B', cost: 0, free: true, tier: 'quick', role: 'quick' },
                { id: 'qwen3-5-9b', name: 'Qwen3.5 9B Coder', cost: 0, free: true, tier: 'medium', role: 'coder' },
                { id: 'qwen3-14b', name: 'Qwen3 14B', cost: 0, free: true, tier: 'medium', role: 'standard' },
                { id: 'gemma4-26b', name: 'Gemma4 26B MoE ⚡ Frontend', cost: 0, free: true, tier: 'large', role: 'frontend-hermes' },
                { id: 'qwen3-6-27b', name: 'Qwen3.6 27B Dense', cost: 0, free: true, tier: 'large', role: 'dense-test' },
                { id: 'qwen3-6-35b', name: 'Qwen3.6 35B MoE ⚡ Backend', cost: 0, free: true, tier: 'large', role: 'backend-hermes' },
            ],
            ampel: {
                'gemma4-e2b':   { builder: 'red',    plan: 'red',    note: 'Nur System-Heartbeat + Trivia' },
                'gemma4-e4b':   { builder: 'yellow', plan: 'yellow', note: 'Balance, schnell' },
                'qwen3-4b':    { builder: 'yellow', plan: 'red',    note: 'Nur Quick-Tasks' },
                'qwen3-5-9b':  { builder: 'green',  plan: 'yellow', note: 'Coding-fokussiert' },
                'qwen3-14b':   { builder: 'green',  plan: 'yellow', note: 'Solider Coder' },
                'gemma4-26b':  { builder: 'yellow', plan: 'green',  note: 'Gut fuer Reasoning' },
                'qwen3-6-27b': { builder: 'green',  plan: 'green',  note: 'Dense, zuverlaessig' },
                'qwen3-6-35b': { builder: 'green',  plan: 'green',  note: 'Beste Allround MoE' },
            }
        },
        'vps-ollama': {
            name: 'VPS Ollama', icon: '🐳', color: '#fa1e4e',
            baseUrl: 'http://72.61.93.129:8811/v1/chat/completions',
            authHeader: () => ({ 'Authorization': 'Bearer DKZ-OLLAMA-2026-SECURE', 'Content-Type': 'application/json' }),
            format: 'openai',
            models: [
                { id: 'google/gemma-4-26b-a4b-it', name: 'Gemma 4 26B (Frontend/Build)', cost: 0, free: true },
                { id: 'qwen2.5:32b', name: 'Qwen 2.5 32B (Backend/Plan)', cost: 0, free: true },
                { id: 'qwen2.5-coder:7b', name: 'Qwen 2.5 Coder 7B (Qwen 3.5)', cost: 0, free: true },
                { id: 'gemma2:2b', name: 'Gemma 2 2B', cost: 0, free: true },
                { id: 'qwen2.5:3b', name: 'Qwen 2.5 3B', cost: 0, free: true },
                { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B', cost: 0, free: true }
            ]
        },
        puter: {
            name: 'Puter AI', icon: '☁️', color: '#007fff',
            baseUrl: '',
            authHeader: () => ({}),
            format: 'puter',
            models: [
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini', cost: 0, free: true },
                { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', cost: 0, free: true },
                { id: 'meta-llama-3-1-8b-instruct', name: 'Llama 3.1 8B', cost: 0, free: true }
            ]
        }
    };

    // ═══════════════════════════════════════
    // Per-Module Token — @DKZ:TAG [SYS:tokens]
    // ═══════════════════════════════════════
    function getToken(providerId, moduleId) {
        return localStorage.getItem(`dkz-llm-token-${providerId}-${moduleId}`) ||
            localStorage.getItem(`dkz-llm-token-${providerId}`) ||
            localStorage.getItem(`dkz-copilot-key-${providerId}`) || '';
    }
    function setToken(providerId, moduleId, token) {
        const key = moduleId ? `dkz-llm-token-${providerId}-${moduleId}` : `dkz-llm-token-${providerId}`;
        localStorage.setItem(key, token);
    }
    function getProvider(moduleId) {
        return localStorage.getItem(`dkz-llm-provider-${moduleId}`) ||
            localStorage.getItem('dkz-copilot-provider') || 'openrouter';
    }
    function getModel(moduleId) {
        const pId = getProvider(moduleId);
        return localStorage.getItem(`dkz-llm-model-${pId}-${moduleId}`) ||
            localStorage.getItem(`dkz-llm-model-${pId}`) ||
            (PROVIDERS[pId]?.models[0]?.id || 'gpt-4o-mini');
    }

    // ═══════════════════════════════════════
    // Custom Models — @DKZ:TAG [SYS:custom]
    // ═══════════════════════════════════════
    function getCustomModels(pId) {
        return JSON.parse(localStorage.getItem(`dkz-llm-custom-${pId}`) || '[]');
    }
    function addCustomModel(pId, techId, displayName) {
        const c = getCustomModels(pId);
        c.push({ id: techId, name: displayName, cost: 0, free: false, custom: true });
        localStorage.setItem(`dkz-llm-custom-${pId}`, JSON.stringify(c));
        return c;
    }
    function getAllModels(pId) {
        return [...(PROVIDERS[pId]?.models || []), ...getCustomModels(pId)];
    }

    // ═══════════════════════════════════════
    // Cost Tracking — @DKZ:TAG [SYS:costs]
    // ═══════════════════════════════════════
    function trackUsage(pId, modelId, tokens, moduleId) {
        const d = JSON.parse(localStorage.getItem('dkz-llm-costs') || '{"total":0,"by_provider":{},"by_module":{},"history":[]}');
        const model = getAllModels(pId).find(m => m.id === modelId);
        const cost = ((tokens || 0) / 1000) * (model?.cost || 0);
        d.total += cost;
        if (!d.by_provider[pId]) d.by_provider[pId] = { tokens: 0, cost: 0, calls: 0 };
        d.by_provider[pId].tokens += tokens; d.by_provider[pId].cost += cost; d.by_provider[pId].calls++;
        if (moduleId) {
            if (!d.by_module[moduleId]) d.by_module[moduleId] = { tokens: 0, cost: 0, calls: 0 };
            d.by_module[moduleId].tokens += tokens; d.by_module[moduleId].cost += cost; d.by_module[moduleId].calls++;
        }
        d.history.push({ t: Date.now(), p: pId, m: modelId, tok: tokens, cost, mod: moduleId || '' });
        if (d.history.length > 1000) d.history = d.history.slice(-1000);
        localStorage.setItem('dkz-llm-costs', JSON.stringify(d));
        return { cost, totalCost: d.total };
    }
    function getCostStats() {
        return JSON.parse(localStorage.getItem('dkz-llm-costs') || '{"total":0,"by_provider":{},"by_module":{},"history":[]}');
    }

    // ═══════════════════════════════════════
    // API Call — Unified — @DKZ:TAG [SYS:api]
    // ═══════════════════════════════════════
    async function call(pId, modelId, systemPrompt, userMsg, moduleId) {
        const p = PROVIDERS[pId];
        if (!p) throw new Error(`Provider "${pId}" unbekannt`);
        const token = getToken(pId, moduleId);
        if (!token && pId !== 'vllm' && pId !== 'puter') throw new Error(`Kein Token: ${p.name}`);
        let result;
        switch (p.format) {
            case 'openai': result = await _openai(p, token, modelId, systemPrompt, userMsg); break;
            case 'anthropic': result = await _anthropic(p, token, modelId, systemPrompt, userMsg); break;
            case 'gemini': result = await _gemini(p, token, modelId, systemPrompt, userMsg); break;
            case 'huggingface': result = await _hf(p, token, modelId, systemPrompt, userMsg); break;
            case 'ollama': case 'vllm': result = await _openai(p, '', modelId, systemPrompt, userMsg); break;
            case 'puter': result = await _puter(p, modelId, systemPrompt, userMsg); break;
            default: throw new Error(`Format "${p.format}" unbekannt`);
        }
        if (result.ok && result.tokens) { const ci = trackUsage(pId, modelId, result.tokens, moduleId); result.cost = ci.cost; }
        return result;
    }

    async function _openai(p, tk, m, sys, usr) {
        const r = await fetch(p.baseUrl, { method: 'POST', headers: p.authHeader(tk), body: JSON.stringify({ model: m, messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }], temperature: 0.7, max_tokens: 2000 }) });
        const d = await r.json();
        return d.choices?.[0] ? { ok: true, text: d.choices[0].message.content, provider: p.name, tokens: d.usage?.total_tokens || 0 } : { ok: false, text: d.error?.message || JSON.stringify(d), provider: p.name };
    }
    async function _anthropic(p, tk, m, sys, usr) {
        const r = await fetch(p.baseUrl, { method: 'POST', headers: p.authHeader(tk), body: JSON.stringify({ model: m, system: sys, messages: [{ role: 'user', content: usr }], max_tokens: 2000 }) });
        const d = await r.json();
        return d.content?.[0] ? { ok: true, text: d.content[0].text, provider: p.name, tokens: (d.usage?.input_tokens || 0) + (d.usage?.output_tokens || 0) } : { ok: false, text: d.error?.message || 'Fehler', provider: p.name };
    }
    async function _gemini(p, tk, m, sys, usr) {
        const r = await fetch(`${p.baseUrl}models/${m}:generateContent?key=${tk}`, { method: 'POST', headers: p.authHeader(tk), body: JSON.stringify({ system_instruction: { parts: [{ text: sys }] }, contents: [{ parts: [{ text: usr }] }] }) });
        const d = await r.json();
        return d.candidates?.[0] ? { ok: true, text: d.candidates[0].content.parts[0].text, provider: p.name, tokens: d.usageMetadata?.totalTokenCount || 0 } : { ok: false, text: d.error?.message || 'Fehler', provider: p.name };
    }
    async function _hf(p, tk, m, sys, usr) {
        const r = await fetch(`${p.baseUrl}${m}`, { method: 'POST', headers: p.authHeader(tk), body: JSON.stringify({ inputs: `[INST] ${sys}\n\n${usr} [/INST]`, parameters: { max_new_tokens: 2000, temperature: 0.7 } }) });
        const d = await r.json();
        if (Array.isArray(d) && d[0]?.generated_text) return { ok: true, text: d[0].generated_text, provider: p.name, tokens: 0 };
        return { ok: false, text: d.error || JSON.stringify(d), provider: p.name };
    }
    async function _puter(p, m, sys, usr) {
        if (typeof DkzPuter === 'undefined') throw new Error('DkzPuter shared script nicht geladen');
        const prompt = `[SYSTEM: ${sys}]\nUser: ${usr}`;
        const reply = await DkzPuter.aiChat(prompt, m);
        if (reply) return { ok: true, text: reply, provider: p.name, tokens: 0 };
        return { ok: false, text: 'Puter AI gab keine Antwort zurueck', provider: p.name };
    }
    // vLLM (OpenAI-kompatibel via llama-swap — Legacy Alias)
    async function _ollama(p, m, sys, usr) {
        return await _openai(p, '', m, sys, usr);
    }

    // ═══════════════════════════════════════
    // UI: Model Selector Widget
    // @DKZ:TAG [UI:model-select]
    // Einbettbar in jedes Modul/Dashboard
    // ═══════════════════════════════════════
    function renderModelSelector(containerId, moduleId) {
        const c = document.getElementById(containerId);
        if (!c) return;
        const curP = getProvider(moduleId);
        const curM = getModel(moduleId);
        const hasToken = !!getToken(curP, moduleId);

        c.innerHTML = `
        <div style="background:#111116;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px;font-family:'Inter',sans-serif">
            <div style="font-size:.65rem;color:#71717a;font-weight:600;margin-bottom:6px">🤖 LLM Konfiguration <span style="font-size:.55rem;color:#52525b">(${moduleId || 'global'})</span></div>
            <!-- Provider -->
            <select id="llm-prov-${moduleId}" onchange="DkzLLM._onProviderChange('${moduleId}')" style="width:100%;padding:6px 10px;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#f0f0f2;font-size:.75rem;margin-bottom:6px;outline:none">
                ${Object.entries(PROVIDERS).map(([id, p]) => `<option value="${id}" ${id === curP ? 'selected' : ''}>${p.icon} ${p.name} (${p.models.filter(m => m.free).length} kostenlos)</option>`).join('')}
            </select>
            <!-- Model -->
            <div style="display:flex;gap:4px">
                <select id="llm-model-${moduleId}" style="flex:1;padding:6px 10px;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#f0f0f2;font-size:.7rem;outline:none;font-family:'JetBrains Mono',monospace">
                    ${_renderModelOptions(curP, curM)}
                </select>
                <button onclick="DkzLLM._addModel('${moduleId}')" style="background:rgba(250,30,78,0.08);color:#fa1e4e;border:1px solid rgba(250,30,78,0.2);border-radius:6px;padding:4px 10px;cursor:pointer;font-weight:700;font-size:.8rem">+</button>
            </div>
            <!-- Token -->
            <div style="display:flex;gap:4px;margin-top:6px">
                <input id="llm-token-${moduleId}" type="password" value="${getToken(curP, moduleId)}" placeholder="API Token..." style="flex:1;padding:6px 10px;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#f0f0f2;font-family:monospace;font-size:.65rem;outline:none">
                <button onclick="DkzLLM._saveConfig('${moduleId}')" style="background:linear-gradient(135deg,#6366f1,#818cf8);color:white;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-weight:600;font-size:.7rem">💾</button>
            </div>
            <div style="font-size:.55rem;color:#52525b;margin-top:4px">${hasToken ? '🟢 Token gesetzt' : '⚪ Kein Token'} · Kosten: $${getCostStats().by_module?.[moduleId]?.cost?.toFixed(4) || '0.0000'}</div>
        </div>`;
    }

    function _renderModelOptions(pId, selected) {
        return getAllModels(pId).map(m => {
            const freeTag = m.free ? '🟢' : `$${m.cost}/1K`;
            const customTag = m.custom ? ' 🔧' : '';
            return `<option value="${m.id}" ${m.id === selected ? 'selected' : ''}>${m.free ? '🟢' : '💰'} ${m.name} (${freeTag})${customTag}</option>`;
        }).join('');
    }

    function _onProviderChange(moduleId) {
        const pId = document.getElementById(`llm-prov-${moduleId}`).value;
        localStorage.setItem(`dkz-llm-provider-${moduleId}`, pId);
        const sel = document.getElementById(`llm-model-${moduleId}`);
        sel.innerHTML = _renderModelOptions(pId, '');
        document.getElementById(`llm-token-${moduleId}`).value = getToken(pId, moduleId);
    }

    function _saveConfig(moduleId) {
        const pId = document.getElementById(`llm-prov-${moduleId}`).value;
        const mId = document.getElementById(`llm-model-${moduleId}`).value;
        const token = document.getElementById(`llm-token-${moduleId}`).value;
        localStorage.setItem(`dkz-llm-provider-${moduleId}`, pId);
        localStorage.setItem(`dkz-llm-model-${pId}-${moduleId}`, mId);
        if (token) setToken(pId, moduleId, token);
        // Auch als globaler Copilot-Provider setzen falls der erste Eintrag
        localStorage.setItem('dkz-copilot-provider', pId);
        if (token) localStorage.setItem(`dkz-copilot-key-${pId}`, token);
        renderModelSelector(document.getElementById(`llm-prov-${moduleId}`).closest('[id]')?.id || '', moduleId);
    }

    function _addModel(moduleId) {
        const pId = document.getElementById(`llm-prov-${moduleId}`).value;
        const techName = prompt('Technischer Model-Name (API-ID):\nz.B. "meta/llama-3.3-70b-instruct"');
        if (!techName) return;
        const displayName = prompt('Anzeige-Name:\nz.B. "Llama 3.3 70B"') || techName;
        addCustomModel(pId, techName, displayName);
        const sel = document.getElementById(`llm-model-${moduleId}`);
        sel.innerHTML = _renderModelOptions(pId, techName);
        sel.value = techName;
    }

    // ═══════════════════════════════════════
    // UI: Cost Dashboard Widget
    // @DKZ:TAG [UI:cost-widget]
    // ═══════════════════════════════════════
    function renderCostWidget(containerId) {
        const c = document.getElementById(containerId);
        if (!c) return;
        const stats = getCostStats();
        c.innerHTML = `
        <div style="background:#111116;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px;font-family:'Inter',sans-serif">
            <div style="font-size:.65rem;color:#71717a;font-weight:600;margin-bottom:8px">💰 LLM Kosten</div>
            <div style="font-size:1.2rem;font-weight:800;color:#fa1e4e;margin-bottom:8px">$${stats.total.toFixed(4)}</div>
            ${Object.entries(stats.by_provider).map(([pId, d]) => {
            const p = PROVIDERS[pId];
            return `<div style="display:flex;justify-content:space-between;padding:2px 0;font-size:.65rem">
                    <span style="color:${p?.color || '#71717a'}">${p?.icon || '?'} ${p?.name || pId}</span>
                    <span style="color:#a1a1aa">${d.calls} calls · ${d.tokens} tok · $${d.cost.toFixed(4)}</span></div>`;
        }).join('')}
            ${Object.keys(stats.by_module).length > 0 ? '<div style="border-top:1px solid rgba(255,255,255,0.04);margin-top:6px;padding-top:6px;font-size:.6rem;color:#52525b">' +
                Object.entries(stats.by_module).map(([mId, d]) => `${mId}: $${d.cost.toFixed(4)} (${d.calls}×)`).join(' · ') + '</div>' : ''}
        </div>`;
    }

    // Public API
    return {
        PROVIDERS, call, getToken, setToken, getProvider, getModel, getAllModels, addCustomModel,
        getCostStats, trackUsage, renderModelSelector, renderCostWidget,
        _onProviderChange, _saveConfig, _addModel
    };
})();
if (typeof module !== 'undefined') module.exports = DkzLLM;
