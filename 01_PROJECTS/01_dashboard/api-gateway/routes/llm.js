/**
 * ⚡ DkZ LLM Router — OpenAI-kompatibles Gateway
 * @DKZ:TAG → [SYS:llm-router] [CAT:api-gateway] [LANG:js]
 * @version v1.00.0
 *
 * Zentraler LLM Proxy mit Auto-Failover:
 *   1. VPS llama-swap (srv1298466:8080) — Primary
 *   2. Lokal Ollama (localhost:11434)   — Fallback
 *   3. OpenRouter Free (Cloud)          — Emergency
 *
 * OpenAI-kompatible Endpoints:
 *   POST /v1/chat/completions
 *   GET  /v1/models
 *   GET  /v1/health/llm
 */

import { Router } from 'express';

const router = Router();

// ═══════════════════════════════════════
// Backend Konfiguration
// ═══════════════════════════════════════
const BACKENDS = {
    'vps-llama-swap': {
        name: 'VPS llama-swap',
        baseUrl: 'http://srv1298466.hstgr.cloud:8080',
        timeout: 60000,         // 60s fuer Model-Loading
        connectTimeout: 5000,   // 5s Connect-Timeout
        auth: null,             // Kein Auth noetig
        defaultModel: 'qwen3-5-9b',
        priority: 1
    },
    'local-ollama': {
        name: 'Lokal Ollama',
        baseUrl: 'http://localhost:11434',
        timeout: 30000,
        connectTimeout: 2000,
        auth: null,
        defaultModel: 'gemma3:4b',
        priority: 2
    },
    'openrouter-free': {
        name: 'OpenRouter Free',
        baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
        timeout: 30000,
        connectTimeout: 3000,
        auth: process.env.OPENROUTER_API_KEY || null,
        defaultModel: 'deepseek/deepseek-r1:free',
        priority: 3,
        format: 'openai'
    },
    'freeapi': {
        name: 'FreeAPI',
        baseUrl: 'https://freeapi.example.com/v1/chat/completions',
        timeout: 30000,
        connectTimeout: 3000,
        auth: process.env.FREEAPI_KEY || null,
        defaultModel: 'free-gpt4o',
        priority: 4,
        format: 'openai'
    },
    'freellmapi': {
        name: 'FreeLLMAPI',
        baseUrl: 'https://freellmapi.example.com/v1/chat/completions',
        timeout: 30000,
        connectTimeout: 3000,
        auth: process.env.FREELLMAPI_KEY || null,
        defaultModel: 'free-claude',
        priority: 5,
        format: 'openai'
    }
};

// Model-Mapping: Alias → Backend-spezifischer Name
const MODEL_ALIASES = {
    // Convenience Aliases
    'auto':         { backend: null, model: null },  // Auto-Select
    'qwen-coder':   { backend: 'vps-llama-swap', model: 'qwen3-5-9b' },
    'qwen-big':     { backend: 'vps-llama-swap', model: 'qwen3-6-35b' },
    'gemma-small':  { backend: 'local-ollama', model: 'gemma3:4b' },
    // Direct llama-swap IDs
    'qwen3-5-9b':   { backend: 'vps-llama-swap', model: 'qwen3-5-9b' },
    'qwen3-6-35b':  { backend: 'vps-llama-swap', model: 'qwen3-6-35b' },
    'qwen3-6-27b':  { backend: 'vps-llama-swap', model: 'qwen3-6-27b' },
    'qwen3-14b':    { backend: 'vps-llama-swap', model: 'qwen3-14b' },
    'qwen3-4b':     { backend: 'vps-llama-swap', model: 'qwen3-4b' },
    'gemma4-e2b':   { backend: 'vps-llama-swap', model: 'gemma4-e2b' },
    'gemma4-e4b':   { backend: 'vps-llama-swap', model: 'gemma4-e4b' },
    'gemma4-26b':   { backend: 'vps-llama-swap', model: 'gemma4-26b' },
    // Direct Ollama IDs (lokal)
    'gemma3:4b':    { backend: 'local-ollama', model: 'gemma3:4b' },
    'gemma2:2b':    { backend: 'local-ollama', model: 'gemma2:2b' },
    // OpenRouter Cloud Models (kostenlos)
    'deepseek-r1':  { backend: 'openrouter-free', model: 'deepseek/deepseek-r1:free' },
    'llama-70b':    { backend: 'openrouter-free', model: 'meta-llama/llama-3.3-70b-instruct:free' },
    'gemma-27b':    { backend: 'openrouter-free', model: 'google/gemma-3-27b-it:free' },
    'qwen-72b':     { backend: 'openrouter-free', model: 'qwen/qwen-2.5-72b-instruct:free' },
    // FreeAPI & FreeLLMAPI
    'free-gpt4o':   { backend: 'freeapi', model: 'gpt-4o' },
    'free-claude':  { backend: 'freellmapi', model: 'claude-3-5-sonnet' }
};

// Backend Health State
const healthState = {
    'vps-llama-swap': { ok: null, lastCheck: 0, lastError: null, latency: null },
    'local-ollama':   { ok: null, lastCheck: 0, lastError: null, latency: null },
    'openrouter-free': { ok: null, lastCheck: 0, lastError: null, latency: null },
    'freeapi':        { ok: null, lastCheck: 0, lastError: null, latency: null },
    'freellmapi':     { ok: null, lastCheck: 0, lastError: null, latency: null }
};

// ═══════════════════════════════════════
// Helper: Fetch mit Timeout
// ═══════════════════════════════════════
async function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timer);
        return res;
    } catch (err) {
        clearTimeout(timer);
        throw err;
    }
}

// ═══════════════════════════════════════
// Helper: Backend Health pruefen
// ═══════════════════════════════════════
async function checkBackend(backendId) {
    const backend = BACKENDS[backendId];
    if (!backend) return false;

    const start = Date.now();
    try {
        // llama-swap und Ollama haben unterschiedliche Model-Endpoints
        const modelsUrl = backendId === 'local-ollama'
            ? `${backend.baseUrl}/api/tags`
            : backendId === 'openrouter-free'
            ? 'https://openrouter.ai/api/v1/models'
            : `${backend.baseUrl}/v1/models`;

        const res = await fetchWithTimeout(modelsUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }, backend.connectTimeout);

        const ok = res.ok;
        healthState[backendId] = {
            ok,
            lastCheck: Date.now(),
            lastError: ok ? null : `HTTP ${res.status}`,
            latency: Date.now() - start
        };
        return ok;
    } catch (err) {
        healthState[backendId] = {
            ok: false,
            lastCheck: Date.now(),
            lastError: err.message,
            latency: Date.now() - start
        };
        return false;
    }
}

// ═══════════════════════════════════════
// Helper: Chat Request an Backend senden
// ═══════════════════════════════════════
async function sendChatRequest(backendId, body) {
    const backend = BACKENDS[backendId];
    if (!backend) throw new Error(`Backend "${backendId}" unbekannt`);

    // Ollama braucht /api/chat, llama-swap nimmt /v1/chat/completions
    let url, requestBody, headers;

    if (backendId === 'local-ollama') {
        // Ollama native API → Konvertierung von OpenAI-Format
        url = `${backend.baseUrl}/api/chat`;
        headers = { 'Content-Type': 'application/json' };
        requestBody = {
            model: body.model || backend.defaultModel,
            messages: body.messages || [],
            stream: false,
            options: {}
        };
        if (body.temperature != null) requestBody.options.temperature = body.temperature;
        if (body.max_tokens) requestBody.options.num_predict = body.max_tokens;
    } else {
        // llama-swap / OpenRouter — OpenAI-kompatibel
        url = backendId === 'openrouter-free'
            ? backend.baseUrl
            : `${backend.baseUrl}/v1/chat/completions`;
        headers = { 'Content-Type': 'application/json' };
        if (backend.auth) headers['Authorization'] = `Bearer ${backend.auth}`;
        if (backendId === 'openrouter-free') headers['HTTP-Referer'] = 'https://devkitz.eu';
        requestBody = {
            model: body.model || backend.defaultModel,
            messages: body.messages || [],
            temperature: body.temperature ?? 0.7,
            max_tokens: body.max_tokens || 2000,
            stream: body.stream || false
        };
    }

    const start = Date.now();
    const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
    }, backend.timeout);

    const data = await res.json();
    const latency = Date.now() - start;

    // Antwort ins OpenAI-Format konvertieren (falls Ollama)
    if (backendId === 'local-ollama' && data.message) {
        return {
            id: `chatcmpl-dkz-${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: data.model || body.model,
            choices: [{
                index: 0,
                message: {
                    role: 'assistant',
                    content: data.message.content || ''
                },
                finish_reason: data.done ? 'stop' : 'length'
            }],
            usage: {
                prompt_tokens: data.prompt_eval_count || 0,
                completion_tokens: data.eval_count || 0,
                total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
            },
            _dkz: { backend: backendId, latency, fallback: false }
        };
    }

    // llama-swap gibt bereits OpenAI-Format zurueck
    if (data.choices) {
        data._dkz = { backend: backendId, latency, fallback: false };
        return data;
    }

    throw new Error(data.error?.message || JSON.stringify(data));
}

// ═══════════════════════════════════════
// POST /v1/chat/completions
// OpenAI-kompatibler Chat-Endpoint mit Auto-Failover
// ═══════════════════════════════════════
router.post('/v1/chat/completions', async (req, res) => {
    const body = req.body;
    const requestedModel = body.model || 'auto';

    // Resolve Model-Alias
    const alias = MODEL_ALIASES[requestedModel];
    let targetBackend = alias?.backend || null;
    let targetModel = alias?.model || requestedModel;

    // Auto-Select: Versuche Backends in Prioritaets-Reihenfolge
    const backendsToTry = targetBackend
        ? [targetBackend]
        : Object.keys(BACKENDS).sort((a, b) => BACKENDS[a].priority - BACKENDS[b].priority);

    let lastError = null;

    for (const backendId of backendsToTry) {
        try {
            // Model-Name fuer dieses Backend bestimmen
            const model = targetBackend
                ? targetModel
                : BACKENDS[backendId].defaultModel;

            const result = await sendChatRequest(backendId, {
                ...body,
                model
            });

            // Fallback markieren wenn nicht das erste Backend
            if (backendId !== backendsToTry[0]) {
                result._dkz = { ...result._dkz, fallback: true, originalBackend: backendsToTry[0] };
            }

            // Health State updaten
            healthState[backendId].ok = true;
            healthState[backendId].lastCheck = Date.now();
            healthState[backendId].lastError = null;

            return res.json(result);
        } catch (err) {
            lastError = err;
            healthState[backendId].ok = false;
            healthState[backendId].lastCheck = Date.now();
            healthState[backendId].lastError = err.message;

            // WebSocket Broadcast: Backend-Ausfall
            if (globalThis.__dkzBroadcast) {
                globalThis.__dkzBroadcast('llm:failover', {
                    from: backendId,
                    error: err.message,
                    trying: backendsToTry[backendsToTry.indexOf(backendId) + 1] || 'none'
                });
            }
        }
    }

    // Alle Backends fehlgeschlagen
    res.status(503).json({
        error: {
            message: 'Alle LLM Backends nicht erreichbar',
            type: 'service_unavailable',
            details: lastError?.message,
            backends: Object.entries(healthState).map(([id, s]) => ({
                id,
                name: BACKENDS[id]?.name,
                status: s.ok ? 'online' : 'offline',
                error: s.lastError
            }))
        }
    });
});

// ═══════════════════════════════════════
// GET /v1/models
// Alle verfuegbaren Modelle (VPS + Lokal)
// ═══════════════════════════════════════
router.get('/v1/models', async (req, res) => {
    const allModels = [];

    for (const [backendId, backend] of Object.entries(BACKENDS)) {
        try {
            let models = [];
            if (backendId === 'local-ollama') {
                const r = await fetchWithTimeout(
                    `${backend.baseUrl}/api/tags`,
                    { method: 'GET' },
                    backend.connectTimeout
                );
                const data = await r.json();
                models = (data.models || []).map(m => ({
                    id: m.name,
                    object: 'model',
                    created: Math.floor(new Date(m.modified_at).getTime() / 1000),
                    owned_by: `dkz-local-ollama`,
                    _dkz: { backend: backendId, size: m.size, family: m.details?.family }
                }));
            } else {
                const r = await fetchWithTimeout(
                    `${backend.baseUrl}/v1/models`,
                    { method: 'GET' },
                    backend.connectTimeout
                );
                const data = await r.json();
                models = (data.data || []).map(m => ({
                    ...m,
                    owned_by: `dkz-${backendId}`,
                    _dkz: { backend: backendId }
                }));
            }
            allModels.push(...models);
            healthState[backendId].ok = true;
            healthState[backendId].lastCheck = Date.now();
        } catch (err) {
            healthState[backendId].ok = false;
            healthState[backendId].lastCheck = Date.now();
            healthState[backendId].lastError = err.message;
        }
    }

    res.json({
        object: 'list',
        data: allModels,
        _dkz: {
            backends: Object.entries(healthState).map(([id, s]) => ({
                id, status: s.ok ? 'online' : 'offline'
            }))
        }
    });
});

// ═══════════════════════════════════════
// GET /v1/health/llm
// LLM-spezifischer Health Check
// ═══════════════════════════════════════
router.get('/v1/health/llm', async (req, res) => {
    // Alle Backends parallel pruefen
    await Promise.all(
        Object.keys(BACKENDS).map(id => checkBackend(id))
    );

    const activeBackend = Object.entries(healthState)
        .filter(([, s]) => s.ok)
        .sort(([a], [b]) => BACKENDS[a].priority - BACKENDS[b].priority)[0];

    res.json({
        status: activeBackend ? 'online' : 'offline',
        activeBackend: activeBackend ? {
            id: activeBackend[0],
            name: BACKENDS[activeBackend[0]].name,
            defaultModel: BACKENDS[activeBackend[0]].defaultModel,
            latency: activeBackend[1].latency
        } : null,
        backends: Object.entries(BACKENDS).map(([id, cfg]) => ({
            id,
            name: cfg.name,
            url: cfg.baseUrl,
            priority: cfg.priority,
            defaultModel: cfg.defaultModel,
            status: healthState[id].ok === null ? 'unknown'
                : healthState[id].ok ? 'online' : 'offline',
            latency: healthState[id].latency,
            lastCheck: healthState[id].lastCheck
                ? new Date(healthState[id].lastCheck).toISOString() : null,
            lastError: healthState[id].lastError
        })),
        aliases: Object.entries(MODEL_ALIASES).map(([alias, cfg]) => ({
            alias,
            backend: cfg.backend || 'auto',
            model: cfg.model || 'auto'
        }))
    });
});

export { router as llmRoutes };
