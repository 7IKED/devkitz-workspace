/**
 * DkZ ONTHERUN Gateway v2.0 — API Gateway + Free LLM Hub
 * @DKZ:RULES → R21, R8 keine Umlaute in Code
 * @DKZ:TAG → [SYS:gateway] [CAT:ontherun] [LANG:node]
 *
 * Endpoints:
 *   GET  /api/v1/health          — System Health
 *   POST /api/v1/chat            — Chat (Multi-Provider Routing)
 *   POST /api/v1/free-hub/cascade — Free LLM Cascade (4 Provider)
 *
 * Start: node gateway.js
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const o2 = require('./dkz-openobserve.js');

// OpenObserve Log Shipper initialisieren (wenn Token gesetzt)
if (process.env.OPENOBSERVE_TOKEN) {
    o2.init();
}

const app = express();
const PORT = process.env.DKZ_API_PORT || 3040;
const VERSION = '2.0.0';

// ═══════════════════════════════════════
// Middleware
// ═══════════════════════════════════════
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Request-Logging (kein console.log in Produktion — nutze strukturiertes Log)
app.use((req, _res, next) => {
    req._startTime = Date.now();
    next();
});

// ═══════════════════════════════════════
// OpenAI-Compatible Proxy (fuer Pi Agent, OpenCode, etc.)
// /v1/chat/completions → VPS Ollama mit lokalem Failover
// /v1/models → Zusammengefuehrte Modells-Liste (Local + VPS)
// ═══════════════════════════════════════
const VPS_OLLAMA = process.env.OLLAMA_VPS_URL || 'http://72.61.93.129:8811';
const VPS_TOKEN = process.env.OLLAMA_VPS_TOKEN || 'DKZ-OLLAMA-2026-SECURE';

app.post(['/v1/chat/completions', '/api/v1/chat/completions'], async (req, res) => {
    const requestedModel = req.body.model;
    let targetUrl = `${VPS_OLLAMA}/v1/chat/completions`;
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VPS_TOKEN}`
    };
    let isLocal = false;

    // 1. Pruefen ob das Modell lokal installiert ist
    try {
        const localRes = await fetch('http://localhost:11434/v1/models', { signal: AbortSignal.timeout(1500) });
        if (localRes.ok) {
            const localData = await localRes.json();
            const localModels = localData.data || [];
            if (localModels.find(m => m.id === requestedModel)) {
                targetUrl = 'http://localhost:11434/v1/chat/completions';
                headers = { 'Content-Type': 'application/json' };
                isLocal = true;
            }
        }
    } catch (err) {
        // Lokaler Ollama offline, standardmaessig VPS nutzen
    }

    // 2. Request ausfuehren
    try {
        let r = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(req.body)
        });

        if (!r.ok && !isLocal) {
            throw new Error(`VPS meldet Status ${r.status}`);
        }

        // Streaming-Unterstuetzung
        if (req.body.stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            const reader = r.body.getReader();
            const pump = async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) { res.end(); break; }
                    res.write(value);
                }
            };
            pump().catch(() => res.end());
        } else {
            const data = await r.json();
            res.status(r.status).json(data);
        }
    } catch (err) {
        if (isLocal) {
            return res.status(502).json({ error: { message: `Lokaler Ollama Fehler: ${err.message}`, type: 'local_error' }});
        }

        // VPS fehlgeschlagen/offline -> Failover zu lokalem Ollama!
        try {
            const localRes = await fetch('http://localhost:11434/v1/models', { signal: AbortSignal.timeout(1500) });
            if (!localRes.ok) throw new Error('Lokaler Ollama offline');
            const localData = await localRes.json();
            const localModels = localData.data || [];

            if (localModels.length === 0) throw new Error('Keine lokalen Modelle installiert');

            // Bestes Fallback-Modell waehlen
            let fallbackModel = 'gemma2:2b'; // Standard Fallback
            if (requestedModel && (requestedModel.toLowerCase().includes('coder') || requestedModel.toLowerCase().includes('qwen'))) {
                if (localModels.find(m => m.id === 'qwen2.5-coder:7b')) {
                    fallbackModel = 'qwen2.5-coder:7b';
                } else if (localModels.find(m => m.id === 'qwen2.5:0.5b')) {
                    fallbackModel = 'qwen2.5:0.5b';
                }
            } else {
                if (localModels.find(m => m.id === 'gemma3n:e4b')) {
                    fallbackModel = 'gemma3n:e4b';
                } else if (localModels.find(m => m.id === 'gemma2:2b')) {
                    fallbackModel = 'gemma2:2b';
                } else if (localModels.length > 0) {
                    fallbackModel = localModels[0].id;
                }
            }

            const fallbackBody = { ...req.body, model: fallbackModel };

            const rLocal = await fetch('http://localhost:11434/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fallbackBody)
            });

            if (req.body.stream) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
                const reader = rLocal.body.getReader();
                const pump = async () => {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) { res.end(); break; }
                        res.write(value);
                    }
                };
                pump().catch(() => res.end());
            } else {
                const data = await rLocal.json();
                res.status(rLocal.status).json(data);
            }
        } catch (fallbackErr) {
            res.status(502).json({ error: { message: `VPS Ollama nicht erreichbar und lokaler Fallback fehlgeschlagen: ${fallbackErr.message}`, type: 'failover_error' }});
        }
    }
});

app.get(['/v1/models', '/api/v1/models'], async (req, res) => {
    let vpsModels = [];
    let localModels = [];

    // 1. VPS Modelle abfragen
    try {
        const r = await fetch(`${VPS_OLLAMA}/v1/models`, {
            headers: { 'Authorization': `Bearer ${VPS_TOKEN}` },
            signal: AbortSignal.timeout(3000)
        });
        if (r.ok) {
            const data = await r.json();
            vpsModels = data.data || [];
        }
    } catch (err) {
        // VPS offline
    }

    // 2. Lokale Modelle abfragen
    try {
        const r = await fetch(`http://localhost:11434/v1/models`, {
            signal: AbortSignal.timeout(2000)
        });
        if (r.ok) {
            const data = await r.json();
            localModels = data.data || [];
        }
    } catch (err) {
        // Lokaler Ollama offline
    }

    // 3. Zusammenfuehren (keine Duplikate)
    const merged = [...localModels];
    for (const vm of vpsModels) {
        if (!merged.find(m => m.id === vm.id)) {
            merged.push(vm);
        }
    }

    res.json({ object: 'list', data: merged });
});

// ═══════════════════════════════════════
// Helpers
// ═══════════════════════════════════════

/**
 * Generischer OpenAI-kompatibler API Call
 * @param {string} url — Endpoint URL
 * @param {object} body — Request Body
 * @param {object} [headers] — Extra Headers
 * @param {number} [timeoutMs] — Timeout in ms (default: 20000)
 * @returns {Promise<string|null>} — AI Antwort oder null
 */
async function callOpenAICompatible(url, body, headers = {}, timeoutMs = 20000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const r = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });

        clearTimeout(timer);

        if (!r.ok) return null;
        const data = await r.json();
        return data.choices?.[0]?.message?.content || null;
    } catch {
        clearTimeout(timer);
        return null;
    }
}

/**
 * HuggingFace Inference API Call (anderes Response-Format)
 * @param {string} model — Modell-ID
 * @param {string} message — User-Nachricht
 * @param {string} systemPrompt — System-Prompt
 * @param {string} apiKey — HF API Key
 * @returns {Promise<string|null>}
 */
async function callHuggingFace(model, message, systemPrompt, apiKey) {
    if (!apiKey) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    try {
        const r = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                inputs: `<|system|>${systemPrompt}<|end|><|user|>${message}<|end|><|assistant|>`,
                parameters: { max_new_tokens: 1024, temperature: 0.7 }
            }),
            signal: controller.signal
        });

        clearTimeout(timer);

        if (!r.ok) return null;
        const data = await r.json();

        // HF gibt Array oder Objekt zurueck
        if (Array.isArray(data) && data[0]?.generated_text) {
            return data[0].generated_text;
        }
        if (data.generated_text) return data.generated_text;
        // Manche HF Modelle nutzen OpenAI-Format
        if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
        return null;
    } catch {
        clearTimeout(timer);
        return null;
    }
}

// ═══════════════════════════════════════
// Provider Definitionen
// ═══════════════════════════════════════
const PROVIDERS = {
    'pollinations': {
        name: 'Pollinations AI',
        url: 'https://text.pollinations.ai/openai',
        free: true,
        defaultModel: 'openai',
        call: async (msg, sys) => callOpenAICompatible(
            'https://text.pollinations.ai/openai',
            {
                model: 'openai',
                messages: [
                    { role: 'system', content: sys || 'Du bist ein hilfreicher Assistent.' },
                    { role: 'user', content: msg }
                ],
                stream: false
            },
            {},
            20000
        )
    },

    'openrouter': {
        name: 'OpenRouter',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        free: false,
        defaultModel: 'qwen/qwen3-coder:free',
        call: async (msg, sys, model) => {
            const key = process.env.OPENROUTER_API_KEY;
            return callOpenAICompatible(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: model || 'qwen/qwen3-coder:free',
                    messages: [
                        { role: 'system', content: sys || 'Du bist ein hilfreicher Assistent.' },
                        { role: 'user', content: msg }
                    ]
                },
                {
                    'Authorization': `Bearer ${key || ''}`,
                    'HTTP-Referer': 'https://devkitz.io',
                    'X-Title': 'DkZ NanoBot'
                },
                20000
            );
        }
    },

    'huggingface': {
        name: 'HuggingFace',
        url: 'https://api-inference.huggingface.co',
        free: false,
        defaultModel: 'Qwen/Qwen2.5-72B-Instruct',
        call: async (msg, sys) => callHuggingFace(
            'Qwen/Qwen2.5-72B-Instruct',
            msg,
            sys || 'Du bist ein hilfreicher Assistent.',
            process.env.HUGGINGFACE_API_KEY
        )
    },

    'groq': {
        name: 'Groq',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        free: false,
        defaultModel: 'llama-3.3-70b-versatile',
        call: async (msg, sys, model) => {
            const key = process.env.GROQ_API_KEY;
            if (!key) return null;
            return callOpenAICompatible(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: model || 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: sys || 'Du bist ein hilfreicher Assistent.' },
                        { role: 'user', content: msg }
                    ],
                    temperature: 0.7
                },
                { 'Authorization': `Bearer ${key}` },
                15000
            );
        }
    },

    'vps-ollama': {
        name: 'VPS Ollama',
        url: process.env.VPS_OLLAMA_URL || 'http://72.61.93.129:8811',
        free: true,
        defaultModel: 'qwen2.5:32b',
        call: async (msg, sys, model) => {
            const url = process.env.VPS_OLLAMA_URL || 'http://72.61.93.129:8811';
            const key = process.env.VPS_OLLAMA_KEY || 'DKZ-OLLAMA-2026-SECURE';
            return callOpenAICompatible(
                `${url}/v1/chat/completions`,
                {
                    model: model || 'qwen2.5:32b',
                    messages: [
                        { role: 'system', content: sys || 'Du bist ein hilfreicher Assistent.' },
                        { role: 'user', content: msg }
                    ],
                    temperature: 0.7
                },
                { 'Authorization': `Bearer ${key}` },
                15000
            );
        }
    }
};

// ═══════════════════════════════════════
// GET /api/v1/health
// ═══════════════════════════════════════
app.get('/api/v1/health', (_req, res) => {
    const uptime = process.uptime();

    // Provider-Status pruefen
    const providerStatus = {};
    for (const [id, p] of Object.entries(PROVIDERS)) {
        if (p.free) {
            providerStatus[id] = 'available';
        } else {
            // Pruefen ob Key konfiguriert
            const keyMap = {
                'openrouter': 'OPENROUTER_API_KEY',
                'huggingface': 'HUGGINGFACE_API_KEY',
                'groq': 'GROQ_API_KEY'
            };
            const envKey = keyMap[id];
            providerStatus[id] = envKey && process.env[envKey] ? 'configured' : 'no_key';
        }
    }

    res.json({
        status: 'online',
        version: VERSION,
        uptime: Math.floor(uptime),
        uptimeHuman: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        providers: providerStatus,
        timestamp: new Date().toISOString()
    });
});

// ═══════════════════════════════════════
// POST /api/v1/chat
// ═══════════════════════════════════════
app.post('/api/v1/chat', async (req, res) => {
    const { message, provider, model, systemPrompt } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'message ist erforderlich' });
    }

    // Provider bestimmen
    const provId = provider || 'pollinations';
    const prov = PROVIDERS[provId];

    if (!prov) {
        return res.status(400).json({
            error: `Unbekannter Provider: ${provId}`,
            available: Object.keys(PROVIDERS)
        });
    }

    try {
        const reply = await prov.call(message, systemPrompt, model);

        if (!reply) {
            return res.status(502).json({
                error: `Provider ${provId} hat keine Antwort geliefert`,
                provider: provId
            });
        }

        res.json({
            reply,
            provider: provId,
            model: model || prov.defaultModel,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            error: `Provider ${provId} Fehler`,
            details: err.message,
            provider: provId
        });
    }
});

// ═══════════════════════════════════════
// OpenMemory Proxy (→ Port 3041)
// ═══════════════════════════════════════
const MEMORY_URL = process.env.OPENMEMORY_URL || 'http://localhost:3041';

app.post('/api/v1/memory/add', async (req, res) => {
    try {
        const r = await fetch(`${MEMORY_URL}/memory/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await r.json();
        res.status(r.status).json(data);
    } catch (err) {
        res.status(503).json({ error: 'OpenMemory nicht erreichbar', details: err.message });
    }
});

app.post('/api/v1/memory/search', async (req, res) => {
    try {
        const r = await fetch(`${MEMORY_URL}/memory/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await r.json();
        res.status(r.status).json(data);
    } catch (err) {
        res.status(503).json({ error: 'OpenMemory nicht erreichbar', details: err.message });
    }
});

app.get('/api/v1/memory/all', async (req, res) => {
    try {
        const qs = new URLSearchParams(req.query).toString();
        const r = await fetch(`${MEMORY_URL}/memory/all?${qs}`);
        const data = await r.json();
        res.status(r.status).json(data);
    } catch (err) {
        res.status(503).json({ error: 'OpenMemory nicht erreichbar', details: err.message });
    }
});

app.delete('/api/v1/memory/:id', async (req, res) => {
    try {
        const r = await fetch(`${MEMORY_URL}/memory/${req.params.id}`, { method: 'DELETE' });
        const data = await r.json();
        res.status(r.status).json(data);
    } catch (err) {
        res.status(503).json({ error: 'OpenMemory nicht erreichbar', details: err.message });
    }
});

// ═══════════════════════════════════════
// OpenResearch Proxy (→ Port 3042)
// ═══════════════════════════════════════
const RESEARCH_URL = process.env.OPENRESEARCH_URL || 'http://localhost:3042';

['search', 'scrape', 'summary', 'deep'].forEach(endpoint => {
    app.post(`/api/v1/research/${endpoint}`, async (req, res) => {
        try {
            const r = await fetch(`${RESEARCH_URL}/research/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body)
            });
            const data = await r.json();
            res.status(r.status).json(data);
        } catch (err) {
            res.status(503).json({ error: 'OpenResearch nicht erreichbar', details: err.message });
        }
    });
});

// ═══════════════════════════════════════
// POST /api/v1/free-hub/cascade
// 4-Provider Cascade: Pollinations → OpenRouter → HuggingFace → Groq
// ═══════════════════════════════════════
app.post('/api/v1/free-hub/cascade', async (req, res) => {
    const { message, systemPrompt } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'message ist erforderlich' });
    }

    const sys = systemPrompt || 'Du bist ein hilfreicher, praeziser Assistent. Antworte auf Deutsch. Keine Umlaute (ae, oe, ue, ss).';

    // Cascade-Reihenfolge: Free zuerst, dann Key-basierte
    const cascade = [
        { id: 'pollinations', name: 'Pollinations AI' },
        { id: 'openrouter', name: 'OpenRouter Free' },
        { id: 'huggingface', name: 'HuggingFace' },
        { id: 'groq', name: 'Groq' }
    ];

    const errors = [];

    for (const step of cascade) {
        const prov = PROVIDERS[step.id];
        if (!prov) continue;

        try {
            const reply = await prov.call(message, sys);
            if (reply) {
                return res.json({
                    response: reply,
                    provider: step.id,
                    providerName: step.name,
                    cascadePosition: cascade.indexOf(step) + 1,
                    timestamp: new Date().toISOString()
                });
            }
            errors.push({ provider: step.id, error: 'Leere Antwort' });
        } catch (err) {
            errors.push({ provider: step.id, error: err.message });
        }
    }

    // Alle Provider fehlgeschlagen
    res.status(503).json({
        error: 'Alle Cascade-Provider fehlgeschlagen',
        tried: errors,
        timestamp: new Date().toISOString()
    });
});

// ═══════════════════════════════════════
// Remote Control API — Pi-Agent steuert lokalen Rechner
// VPS → ONTHERUN Gateway → Lokale Ausfuehrung
// ═══════════════════════════════════════
const { exec: execCmd } = require('child_process');
const fs = require('fs');
const path = require('path');

const REMOTE_KEY = process.env.REMOTE_CONTROL_KEY || process.env.API_SERVER_KEY || 'dkz-remote-2026';
const WORKSPACE = process.env.DKZ_WORKSPACE || 'C:\\DEVKiTZ';

// Auth Middleware fuer Remote Control
function remoteAuth(req, res, next) {
    const key = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    if (key !== REMOTE_KEY) {
        return res.status(401).json({ error: 'Unauthorized — x-api-key required' });
    }
    next();
}

// POST /api/v1/remote/exec — Shell-Befehl ausfuehren
app.post('/api/v1/remote/exec', remoteAuth, (req, res) => {
    const { command, cwd, timeout } = req.body;
    if (!command) return res.status(400).json({ error: 'command required' });

    const safeCwd = cwd || WORKSPACE;
    const safeTimeout = Math.min(timeout || 30000, 120000); // Max 2 Minuten

    execCmd(command, { cwd: safeCwd, timeout: safeTimeout, maxBuffer: 1024 * 1024 * 5 }, (err, stdout, stderr) => {
        res.json({
            success: !err,
            stdout: stdout?.toString() || '',
            stderr: stderr?.toString() || '',
            exitCode: err?.code || 0,
            command,
            cwd: safeCwd,
            timestamp: new Date().toISOString()
        });
    });
});

// POST /api/v1/remote/file/read — Datei lesen
app.post('/api/v1/remote/file/read', remoteAuth, (req, res) => {
    const { path: filePath } = req.body;
    if (!filePath) return res.status(400).json({ error: 'path required' });

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        res.json({ success: true, content, path: filePath, size: content.length });
    } catch (err) {
        res.status(404).json({ success: false, error: err.message, path: filePath });
    }
});

// POST /api/v1/remote/file/write — Datei schreiben
app.post('/api/v1/remote/file/write', remoteAuth, (req, res) => {
    const { path: filePath, content } = req.body;
    if (!filePath || content === undefined) return res.status(400).json({ error: 'path and content required' });

    try {
        // Sicherstellen dass Verzeichnis existiert
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(filePath, content, 'utf-8');
        res.json({ success: true, path: filePath, size: content.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, path: filePath });
    }
});

// POST /api/v1/remote/file/list — Verzeichnis auflisten
app.post('/api/v1/remote/file/list', remoteAuth, (req, res) => {
    const { path: dirPath, recursive } = req.body;
    const safePath = dirPath || WORKSPACE;

    try {
        const entries = fs.readdirSync(safePath, { withFileTypes: true });
        const items = entries.map(e => ({
            name: e.name,
            type: e.isDirectory() ? 'directory' : 'file',
            path: path.join(safePath, e.name)
        }));
        res.json({ success: true, items, count: items.length, path: safePath });
    } catch (err) {
        res.status(404).json({ success: false, error: err.message, path: safePath });
    }
});

// POST /api/v1/remote/git — Git-Operationen
app.post('/api/v1/remote/git', remoteAuth, (req, res) => {
    const { operation, cwd, args } = req.body;
    if (!operation) return res.status(400).json({ error: 'operation required (status|log|add|commit|push|pull)' });

    const safeCwd = cwd || WORKSPACE;
    const safeArgs = args || '';
    const gitCmd = `git ${operation} ${safeArgs}`.trim();

    execCmd(gitCmd, { cwd: safeCwd, timeout: 30000 }, (err, stdout, stderr) => {
        res.json({
            success: !err,
            stdout: stdout?.toString() || '',
            stderr: stderr?.toString() || '',
            operation,
            cwd: safeCwd,
            timestamp: new Date().toISOString()
        });
    });
});

// GET /api/v1/remote/info — System-Info
app.get('/api/v1/remote/info', remoteAuth, (req, res) => {
    res.json({
        hostname: require('os').hostname(),
        platform: process.platform,
        workspace: WORKSPACE,
        uptime: Math.floor(require('os').uptime()),
        memory: {
            total: Math.round(require('os').totalmem() / 1024 / 1024 / 1024) + ' GB',
            free: Math.round(require('os').freemem() / 1024 / 1024 / 1024) + ' GB'
        },
        endpoints: [
            'POST /api/v1/remote/exec',
            'POST /api/v1/remote/file/read',
            'POST /api/v1/remote/file/write',
            'POST /api/v1/remote/file/list',
            'POST /api/v1/remote/git',
            'GET  /api/v1/remote/info'
        ],
        timestamp: new Date().toISOString()
    });
});

// ═══════════════════════════════════════
// 404 Handler
// ═══════════════════════════════════════
app.use((_req, res) => {
    res.status(404).json({
        error: 'Endpoint nicht gefunden',
        docs: {
            health: 'GET /api/v1/health',
            chat: 'POST /api/v1/chat',
            cascade: 'POST /api/v1/free-hub/cascade'
        }
    });
});

// ═══════════════════════════════════════
// Error Handler
// ═══════════════════════════════════════
app.use((err, _req, res, _next) => {
    res.status(500).json({
        error: 'Interner Server-Fehler',
        message: err.message
    });
});

// ═══════════════════════════════════════
// Server Start
// ═══════════════════════════════════════
app.listen(PORT, () => {
    const line = '═'.repeat(45);
    process.stdout.write(`\n${line}\n`);
    process.stdout.write(`  DkZ ONTHERUN Gateway v${VERSION}\n`);
    process.stdout.write(`  Port: ${PORT}\n`);
    process.stdout.write(`  Endpoints:\n`);
    process.stdout.write(`    GET  /api/v1/health\n`);
    process.stdout.write(`    POST /api/v1/chat\n`);
    process.stdout.write(`    POST /api/v1/free-hub/cascade\n`);
    process.stdout.write(`${line}\n\n`);

    // Provider Status ausgeben
    for (const [id, p] of Object.entries(PROVIDERS)) {
        const icon = p.free ? '🟢' : (
            (id === 'openrouter' && process.env.OPENROUTER_API_KEY) ||
            (id === 'huggingface' && process.env.HUGGINGFACE_API_KEY) ||
            (id === 'groq' && process.env.GROQ_API_KEY)
        ) ? '🟡' : '⚪';
        process.stdout.write(`  ${icon} ${p.name} (${id})\n`);
    }
    process.stdout.write('\n');
});

module.exports = app;
