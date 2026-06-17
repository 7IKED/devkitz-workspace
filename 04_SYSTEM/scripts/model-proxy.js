#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
// DkZ Model-Switch Proxy
// Laeuft auf VPS Port 8900 — ein Endpunkt fuer alle Modelle
// Startet llama-server oder vllm mit dem gewaehlten GGUF neu
// ═══════════════════════════════════════════════════════════
// Deploy: scp this file to /opt/devkitz/model-proxy.js
//         node /opt/devkitz/model-proxy.js
// ═══════════════════════════════════════════════════════════

const http  = require('http');
const https = require('https');
const { spawn, execSync } = require('child_process');
const fs    = require('fs');

// ─── Konfiguration ───────────────────────────────────────────
const PROXY_PORT = 8900;
const BACKEND_PORT = 8000;          // llama-server / vllm Port
const API_KEY = 'DKZ-VLLM-2026-SECURE';
const MODEL_DIR = '/opt/devkitz/models';

// Modell-Map: OpenCode Model-Name → GGUF Datei + Backend
const MODELS = {
    'qwen3:30b-a3b':          { file: 'qwen3-30b-a3b-q4_k_m.gguf',              backend: 'llamacpp', ctx: 8192, threads: 8  },
    'gpt-oss:20b':             { file: 'gpt-oss-20b-q4_k_m.gguf',                backend: 'llamacpp', ctx: 8192, threads: 8  },
    'deepseek-coder-v2:16b':  { file: 'deepseek-coder-v2-lite-instruct-q4_k_m.gguf', backend: 'llamacpp', ctx: 16384, threads: 8 },
    'qwen2.5-coder:14b':      { file: 'qwen2.5-coder-14b-instruct-q4_k_m.gguf', backend: 'llamacpp', ctx: 8192, threads: 8  },
    'qwen2.5-coder:7b':       { file: 'qwen2.5-coder-7b-instruct-q4_k_m.gguf',  backend: 'llamacpp', ctx: 8192, threads: 4  },
};
const DEFAULT_MODEL = 'qwen2.5-coder:7b';

// ─── State ───────────────────────────────────────────────────
let currentModel   = null;
let backendProc    = null;
let backendReady   = false;
let switchQueue    = [];

// ─── Logging ─────────────────────────────────────────────────
const ts  = () => new Date().toISOString().slice(11, 19);
const log = (m) => console.log(`[${ts()}] ✅ ${m}`);
const wrn = (m) => console.log(`[${ts()}] ⚠️  ${m}`);
const err = (m) => console.log(`[${ts()}] ❌ ${m}`);

// ─── Backend starten ─────────────────────────────────────────
function startBackend(modelKey, cb) {
    const cfg = MODELS[modelKey];
    if (!cfg) { err(`Unbekanntes Modell: ${modelKey}`); return cb(new Error('unknown model')); }

    const modelPath = `${MODEL_DIR}/${cfg.file}`;
    if (!fs.existsSync(modelPath)) {
        err(`GGUF nicht gefunden: ${modelPath}`);
        err(`Download: huggingface-cli download <repo> ${cfg.file} --local-dir ${MODEL_DIR}`);
        return cb(new Error(`model file missing: ${cfg.file}`));
    }

    // Alten Prozess stoppen
    if (backendProc) {
        wrn(`Stoppe ${currentModel}...`);
        try { execSync(`pkill -f "llama-server.*${BACKEND_PORT}"`, { timeout: 5000 }); } catch {}
        try { execSync(`pkill -f "vllm.*${BACKEND_PORT}"`,          { timeout: 5000 }); } catch {}
        backendProc = null;
        backendReady = false;
    }

    log(`Lade ${modelKey} (${cfg.file})...`);
    currentModel = modelKey;

    const args = [
        '--model', modelPath,
        '--host', '0.0.0.0',
        '--port', String(BACKEND_PORT),
        '--ctx-size', String(cfg.ctx),
        '--threads', String(cfg.threads),
        '--api-key', API_KEY,
        '--log-disable',
    ];

    backendProc = spawn('llama-server', args, { detached: false });

    backendProc.stdout.on('data', d => {
        const line = d.toString().trim();
        if (line.includes('listening') || line.includes('HTTP server listening')) {
            backendReady = true;
            log(`${modelKey} bereit auf Port ${BACKEND_PORT}`);
            cb(null);
        }
    });
    backendProc.stderr.on('data', d => {
        const line = d.toString().trim();
        if (line.includes('listening') || line.includes('server listening')) {
            backendReady = true;
            log(`${modelKey} bereit (via stderr)`);
            cb(null);
        }
    });
    backendProc.on('error', e => { err(`llama-server Fehler: ${e.message}`); cb(e); });
    backendProc.on('close', code => {
        if (code !== 0) wrn(`Backend beendet (code ${code})`);
        backendReady = false; backendProc = null;
    });

    // Timeout nach 120s
    setTimeout(() => { if (!backendReady) { backendReady = true; cb(null); } }, 120000);
}

// ─── Proxy Request ───────────────────────────────────────────
function proxyRequest(req, res) {
    const opts = {
        hostname: '127.0.0.1', port: BACKEND_PORT,
        path: req.url, method: req.method, headers: req.headers
    };
    const pr = http.request(opts, (br) => {
        res.writeHead(br.statusCode, br.headers);
        br.pipe(res);
    });
    pr.on('error', e => {
        err(`Proxy Fehler: ${e.message}`);
        res.writeHead(502); res.end(JSON.stringify({ error: 'backend unavailable' }));
    });
    req.pipe(pr);
}

// ─── Anfrage verarbeiten ──────────────────────────────────────
function handleRequest(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

    // Auth
    const auth = req.headers['authorization'] || '';
    if (auth !== `Bearer ${API_KEY}`) {
        res.writeHead(401); return res.end(JSON.stringify({ error: 'unauthorized' }));
    }

    // Models-Liste ohne Body lesen
    if (req.url === '/v1/models' && req.method === 'GET') {
        const list = Object.keys(MODELS).map(id => ({
            id, object: 'model', owned_by: 'DkZ',
            active: id === currentModel,
        }));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ object: 'list', data: list }));
    }

    // Status Endpoint
    if (req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ currentModel, backendReady, available: Object.keys(MODELS) }));
    }

    // Body lesen um Modell zu erkennen
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
        let parsed = {};
        try { parsed = JSON.parse(body); } catch {}

        const requestedModel = parsed.model || DEFAULT_MODEL;
        const modelKey = Object.keys(MODELS).find(k => k === requestedModel || requestedModel.includes(k.split(':')[0])) || DEFAULT_MODEL;

        // Modell schon geladen?
        if (modelKey === currentModel && backendReady) {
            const fakeReq = Object.assign(req, { _body: body });
            return proxyWithBody(req, res, body);
        }

        // Modell wechseln
        wrn(`Modell-Wechsel: ${currentModel || 'keins'} → ${modelKey}`);
        startBackend(modelKey, (e) => {
            if (e) { res.writeHead(503); return res.end(JSON.stringify({ error: e.message })); }
            setTimeout(() => proxyWithBody(req, res, body), 500);
        });
    });
}

function proxyWithBody(req, res, body) {
    const opts = {
        hostname: '127.0.0.1', port: BACKEND_PORT,
        path: req.url, method: req.method,
        headers: { ...req.headers, 'content-length': Buffer.byteLength(body) }
    };
    const pr = http.request(opts, br => {
        res.writeHead(br.statusCode, br.headers);
        br.pipe(res);
    });
    pr.on('error', e => { res.writeHead(502); res.end(JSON.stringify({ error: e.message })); });
    pr.write(body);
    pr.end();
}

// ─── Server starten ───────────────────────────────────────────
const server = http.createServer(handleRequest);
server.listen(PROXY_PORT, '0.0.0.0', () => {
    log(`DkZ Model-Proxy bereit auf Port ${PROXY_PORT}`);
    log(`Verfuegbare Modelle:`);
    Object.entries(MODELS).forEach(([k, v]) => log(`  • ${k} → ${v.file}`));
    log(`Status: http://localhost:${PROXY_PORT}/status`);
    // Default-Modell vorladen
    startBackend(DEFAULT_MODEL, () => log(`Default-Modell geladen: ${DEFAULT_MODEL}`));
});
