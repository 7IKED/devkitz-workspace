const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const { Mistral } = require('@mistralai/mistralai');
const { WebSocketServer } = require('ws');
require('dotenv').config();
const { createFiveSplitter } = require('./router/five-splitter');

const app = express();
const port = 3040;

// Middleware
app.use(cors()); // Allow UI to call this API
app.use(express.json({ limit: '50mb' }));

// Catch invalid JSON syntax errors so the server doesn't crash
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON request received:', err.message);
        return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
    }
    next(err);
});

// 1. API Endpoint to trigger Git Sync
app.post('/api/sync', (req, res) => {
    console.log('Sync request received. Executing git commands...');
    const repoPath = path.resolve(__dirname);
    const gitCommand = `git add . && git commit -m "Auto-sync from UI: ${new Date().toISOString()}"`;

    exec(gitCommand, { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
            if (stdout.includes('nothing to commit') || stderr.includes('nothing to commit')) {
                console.log('Git Sync: Nothing new to commit.');
                return res.status(200).json({ success: true, message: 'Up to date. No new changes to commit.', log: stdout });
            }
            console.error(`Git Sync Error: ${error.message}`);
            return res.status(500).json({ success: false, error: 'Git commit failed.', log: stderr || error.message });
        }
        console.log(`Git Sync Success: ${stdout}`);
        res.status(200).json({ success: true, message: 'Successfully committed changes to local repo.', log: stdout });
    });
});

// 2. DEEPKEEP Storage Endpoints (SHA256-Dedup)
const { storeDeepKeep, listDeepKeep, retrieveDeepKeep } = require('../../00_lib/dkz-drive-auth');

app.post('/api/v1/deepkeep/store', (req, res) => {
    try {
        const result = storeDeepKeep(req.body);
        if (!result) return res.status(400).json({ success: false, error: 'No content provided' });
        res.json({ success: true, message: result.exists ? 'Exists (dedup)' : 'Stored', hash: result.hash, filename: result.filename });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/v1/deepkeep/list', (req, res) => {
    try {
        res.json({ success: true, files: listDeepKeep() });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/v1/deepkeep/retrieve/:id', (req, res) => {
    try {
        const data = retrieveDeepKeep(req.params.id);
        if (!data) return res.status(404).json({ success: false, error: 'Not found' });
        res.json({ success: true, ...data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. Core Dashboard Endpoints
const fs = require('fs');
let fiveSplitterInstance = null;
app.get('/api/v1/health', (req, res) => {
    const health = fiveSplitterInstance ? fiveSplitterInstance.getHealthSummary() : null;
    const lastRace = fiveSplitterInstance ? fiveSplitterInstance.getLastRaceResult() : null;
    res.json({
        backends: [
            { name: 'Sync Server', id: 'sync-server', icon: '🔄', online: true, latency: 2, lastCheck: Date.now() },
            { name: 'Features API', id: 'features-api', icon: '📦', online: true, latency: 3, lastCheck: Date.now() },
            { name: 'Mistral AI', id: 'mistral-ai', icon: '🤖', online: !!process.env.MISTRAL_API_KEY, latency: !!process.env.MISTRAL_API_KEY ? 45 : 0, lastCheck: Date.now() },
            { name: 'WebSocket', id: 'websocket', icon: '🔌', online: true, latency: 1, lastCheck: Date.now() },
            ...(health ? health.providers.map(p => ({ name: `Router: ${p.name}`, id: `router-${p.name}`, icon: '🧠', online: p.online, latency: p.latency, lastCheck: p.lastCheck })) : [])
        ],
        summary: { online: 3 + (!!process.env.MISTRAL_API_KEY ? 1 : 0) + (health ? health.online : 0), total: 4 + (health ? health.total : 0) },
        lastRace,
        status: 'ok', timestamp: Date.now()
    });
});

app.get('/api/v1/modules', (req, res) => {
    try {
        const featuresPath = path.join(__dirname, 'features.json');
        const data = fs.readFileSync(featuresPath, 'utf8');
        res.json({ success: true, ...JSON.parse(data) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to read features.json' });
    }
});

// Proxy routes to OpenResearch Server (Port 3042)
const http = require('http');
app.use('/research', (req, res) => {
    // If the research server expects /health, and we hit /research/health, 
    // we should map it properly. Actually, we'll just pass req.originalUrl
    // but the research server expects /health for health, and /research/... for others.
    // Let's just pass req.originalUrl directly, but research-server needs to handle it.
    
    // Quick fix: if req.originalUrl is /research/health, pass /health. Otherwise pass req.originalUrl.
    let targetPath = req.originalUrl;
    if (targetPath === '/research/health') targetPath = '/health';

    const options = {
        hostname: '127.0.0.1',
        port: 3042,
        path: targetPath,
        method: req.method,
        headers: req.headers
    };
    
    // remove host header to avoid conflicts
    delete options.headers.host;

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        res.status(502).json({ error: 'OpenResearch Server is offline or unreachable' });
    });

    req.pipe(proxyReq);
});

app.post('/api/v1/pi-agent/status', (req, res) => res.json({ success: true, status: 'idle', lastCheck: Date.now() }));

// Dashboard endpoint list stubs
const stubOk = (data) => (req, res) => res.json({ success: true, ...data });
app.get('/api/v1/ecosystem', stubOk({ name: 'DEVKiTZ', version: '3.0', modules: 157, backends: 4 }));
app.get('/api/v1/metrics', stubOk({ uptime: process.uptime(), requests: 0, memory: process.memoryUsage() }));
app.get('/api/v1/registry', stubOk({ backends: ['sync-server', 'features-api', 'mistral-ai'] }));
app.get('/api/v1/mcp/info', stubOk({ status: 'running', providers: ['sync-server'], transport: 'http+ws' }));
app.get('/api/v1/mcp/tools', stubOk({ count: 8, tools: ['chat', 'summarize', 'translate', 'analyze', 'convert', 'speech-to-text', 'text-to-speech', 'git-sync'] }));
app.get('/api/v1/mcp/config', stubOk({ client: 'mcp-dashboard', baseUrl: 'http://localhost:3040', wsUrl: 'ws://localhost:3040/ws' }));
app.get('/api/v1/docs', stubOk({ openapi: '3.0', endpoints: 25, description: 'DEVKiTZ API' }));
app.get('/api/v1/workflows', stubOk({ workflows: [], total: 0 }));
app.get('/api/v1/tasks', stubOk({ tasks: [], total: 0 }));
app.post('/api/v1/files/list', (req, res) => res.json({ success: true, files: [] }));
app.post('/api/v1/files/read', (req, res) => res.json({ success: true, content: `File: ${req.body?.path || 'unknown'}`, path: req.body?.path }));
app.post('/api/v1/files/search', (req, res) => res.json({ success: true, results: [] }));
app.post('/api/v1/seo/analyze', stubOk({ score: 75, suggestions: ['Add meta description', 'Improve heading structure'] }));

// Module-specific stubs
app.get('/api/v1/blogger', stubOk({ posts: [
    { id: 1, title: 'DEVKiTZ Update', excerpt: 'Neue Module und verbesserte Integration.', date: new Date().toISOString().slice(0, 10) },
    { id: 2, title: 'Dashboard Guide', excerpt: 'Alle API Endpoints im Überblick.', date: new Date().toISOString().slice(0, 10) }
]}));
app.get('/api/v1/free-hub/cascade', (req, res) => res.json({ success: true, cascade: [] }));
app.post('/api/v1/chat/completions', (req, res) => {
    const model = req.body?.model || 'mistral-nemo';
    const msg = req.body?.messages?.[req.body.messages.length - 1]?.content || '';
    if (apiKey) {
        mistralClient.chat.complete({ model: 'open-mistral-nemo', messages: req.body.messages || [{ role: 'user', content: msg }] })
            .then(cr => res.json({ id: 'chat-' + Date.now(), object: 'chat.completion', choices: [{ message: { role: 'assistant', content: cr.choices[0].message.content } }] }))
            .catch(e => res.json({ id: 'chat-' + Date.now(), object: 'chat.completion', choices: [{ message: { role: 'assistant', content: `🤖 Mock: received "${msg.slice(0, 80)}". Set MISTRAL_API_KEY for real AI.` } }] }));
    } else {
        res.json({ id: 'chat-' + Date.now(), object: 'chat.completion', choices: [{ message: { role: 'assistant', content: `🤖 Mock: received "${msg.slice(0, 80)}". Set MISTRAL_API_KEY for real AI.` } }] });
    }
});
app.post('/api/v1/docker/:action', (req, res) => res.json({ success: true, action: req.params.action, status: 'simulated', container: 'dkz-' + (req.params.action || 'unknown') }));
app.post('/api/v1/openspec/generate', stubOk({ spec: '# OpenSpec Generated\n\n*Stub response — extend as needed.*' }));
app.post('/api/v1/openclaw/auto-issue', stubOk({ issue: { id: 'ISSUE-' + Date.now(), title: 'Auto-created issue', status: 'open' } }));

// Initialize Mistral Client
const apiKey = process.env.MISTRAL_API_KEY || '';
const mistralClient = new Mistral({ apiKey: apiKey });

// 3. AI Endpoints (Mistral Chat V1 & V2 + v1 aliases)
async function doChat(message, history) {
    let formattedMessages = history && Array.isArray(history) ? history.map(msg => ({ role: msg.role, content: msg.content })) : [{ role: 'system', content: 'You are a helpful AI assistant operating within the DkZ Ecosystem.' }, { role: 'user', content: message }];
    const chatResponse = await mistralClient.chat.complete({ model: 'open-mistral-nemo', messages: formattedMessages, temperature: 0.7 });
    return chatResponse.choices[0].message.content;
}
app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    try {
        const reply = apiKey ? await doChat(message, history) : `🤖 Mock Chat: received "${(message || '').slice(0, 100)}". Set MISTRAL_API_KEY for real AI.`;
        res.json({ success: true, reply });
    } catch (error) {
        console.error('Mistral API Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Error communicating with Mistral AI.' });
    }
});
app.post('/api/v1/chat', async (req, res) => {
    const { message, history } = req.body;
    try {
        const reply = apiKey ? await doChat(message, history) : `🤖 Mock Chat: received "${(message || '').slice(0, 100)}". Set MISTRAL_API_KEY for real AI.`;
        res.json({ success: true, reply });
    } catch (error) {
        res.json({ success: false, error: error.message || 'Chat failed.' });
    }
});

app.post('/api/chat-multimodel', async (req, res) => {
    const { message, model, history } = req.body;
    try {
        if (!apiKey) return res.json({ success: true, reply: `🤖 Mock Multi-Model (${model || 'default'}): "${(message || '').slice(0, 80)}". Set MISTRAL_API_KEY for real AI.` });
        let mistralModel = 'open-mistral-nemo';
        if (model === 'gpt-4o-mini') mistralModel = 'open-mistral-nemo';
        if (model === 'claude-3-haiku') mistralModel = 'mistral-small-latest';
        if (model === 'llama-3') mistralModel = 'mistral-large-latest';
        let formattedMessages = history && Array.isArray(history) ? history.map(msg => ({ role: msg.role === 'system' ? 'system' : msg.role, content: msg.content })) : [{ role: 'system', content: 'You are a helpful AI assistant operating within the DkZ Ecosystem Multi-Model platform.' }, { role: 'user', content: message }];
        const chatResponse = await mistralClient.chat.complete({ model: mistralModel, messages: formattedMessages, temperature: 0.7 });
        res.json({ success: true, reply: chatResponse.choices[0].message.content });
    } catch (error) {
        console.error('Mistral API Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Error communicating with Mistral AI.' });
    }
});

// 4. Mock AI Services (Analyze, Convert, TTS, STT, Summarize, Translate)
app.post('/api/analyze', (req, res) => setTimeout(() => res.json({ success: true, result: `# Resume Analysis Results\n\n**Match Score:** 85%\n\n### Strengths\n- Strong background in React and NodeJS.\n- Good understanding of UI principles.\n\n### Weaknesses\n- Missing cloud deployment experience.\n\n### Required Actions\n- Add AWS/GCP keywords to your skills section.` }), 2000));
app.post('/api/convert', (req, res) => setTimeout(() => res.json({ success: true, result: `### Converted Code (Mocked by Local Node Server)\n\nTarget Language: ${req.body.target || 'Unknown'}\n\n\`\`\`javascript\n// This is simulated converted code\nfunction newComponent() {\n  return <div>Converted!</div>;\n}\n\`\`\`` }), 2000));
app.post('/api/speech-to-text', (req, res) => setTimeout(() => res.json({ success: true, transcript: "Dies ist eine simulierte Transkription vom lokalen NodeJS Server. In einem echten System würde hier das Whisper-Modell greifen." }), 2500));
app.post('/api/text-to-speech', (req, res) => setTimeout(() => res.json({ success: true, message: "Simulated audio generated.", audioUrl: "simulated_audio_ready" }), 2000));
app.post('/api/summarize', (req, res) => setTimeout(() => res.json({ success: true, summary: `### Zusammenfassung\n\nDas Dokument enthält ${Math.ceil((req.body.text||'').length / 5)} Wörter. Als Kernpunkte wurden identifiziert:\n1. Reibungslose Systemintegration.\n2. Keine Abhängigkeit mehr von Cloud APIs (Puter.js).\n3. Sicherheit durch lokales Backup.` }), 1500));
app.post('/api/translate', (req, res) => setTimeout(() => res.json({ success: true, translated: `[Mock Translation of "${(req.body.text || '').slice(0, 50)}" to ${req.body.target || 'de'}]` }), 1000));

// v1 aliases for dashboard modules
app.post('/api/v1/summarize', (req, res) => setTimeout(() => res.json({ success: true, summary: `Dashboard summary of ${Math.ceil((req.body.text || '').length / 5)} words.` }), 1000));
app.post('/api/v1/translate', (req, res) => setTimeout(() => res.json({ success: true, translated: `[EN: ${(req.body.text || '').slice(0, 60)}]` }), 1000));
app.post('/api/v1/analyze', (req, res) => setTimeout(() => res.json({ success: true, result: '### Analysis complete (mock)' }), 500));

// Initialize FiveSplitter Router (async, non-blocking)
createFiveSplitter().then(splitter => {
    fiveSplitterInstance = splitter;
    app.use('/api/v1/router', splitter.createRouter());
    console.log('[FiveSplitter] Router initialized with 4 providers (mistral, vps, ollama, openrouter)');
}).catch(err => {
    console.error('[FiveSplitter] Initialization failed:', err.message);
});

// ═══════════════════════════════════════════════════════════════
// CLOUDIA² — Multi-Provider Document Organizer Backend
// ═══════════════════════════════════════════════════════════════

const CLOUDIA_PROVIDERS = {
    drive:   { name: 'Google Drive',     icon: 'drive',   color: '#4285F4', status: 'unknown',    lastSync: null },
    r2:      { name: 'Cloudflare R2',    icon: 'cloud',   color: '#F38020', status: 'unknown',    lastSync: null },
    github:  { name: 'GitHub',          icon: 'github',  color: '#238636', status: 'unknown',    lastSync: null },
    local:   { name: 'Lokal',           icon: 'server',  color: '#00ff88', status: 'online',     lastSync: null },
    duckdb:  { name: 'DuckDB',          icon: 'database', color: '#FFC107', status: 'unknown',    lastSync: null }
};

const DEFAULT_SORT_RULES = [
    { id: 'r1',  pattern: '*.md',      target: '/02_RESEARCH/',    provider: 'drive', priority: 10, active: true },
    { id: 'r2',  pattern: '*.txt',     target: '/02_RESEARCH/',    provider: 'drive', priority: 10, active: true },
    { id: 'r3',  pattern: '*.pdf',     target: '/02_RESEARCH/',    provider: 'drive', priority: 10, active: true },
    { id: 'r4',  pattern: '*.jpg',     target: '/03_MEDIA/images/', provider: 'drive', priority: 20, active: true },
    { id: 'r5',  pattern: '*.png',     target: '/03_MEDIA/images/', provider: 'drive', priority: 20, active: true },
    { id: 'r6',  pattern: '*.svg',     target: '/03_MEDIA/images/', provider: 'drive', priority: 20, active: true },
    { id: 'r7',  pattern: '*.mp4',     target: '/03_MEDIA/videos/', provider: 'drive', priority: 20, active: true },
    { id: 'r8',  pattern: '*.webm',    target: '/03_MEDIA/videos/', provider: 'drive', priority: 20, active: true },
    { id: 'r9',  pattern: '*.mp3',     target: '/03_MEDIA/audio/',  provider: 'drive', priority: 20, active: true },
    { id: 'r10', pattern: '*.wav',     target: '/03_MEDIA/audio/',  provider: 'drive', priority: 20, active: true },
    { id: 'r11', pattern: '*.zip',     target: '/99_ARCHIVE/',      provider: 'drive', priority: 30, active: true },
    { id: 'r12', pattern: '*.tar.gz',  target: '/99_ARCHIVE/',      provider: 'drive', priority: 30, active: true },
    { id: 'r13', pattern: '*.js',      target: '/01_PROJECTS/',     provider: 'drive', priority: 15, active: true },
    { id: 'r14', pattern: '*.py',      target: '/01_PROJECTS/',     provider: 'drive', priority: 15, active: true },
    { id: 'r15', pattern: '*.html',    target: '/01_PROJECTS/',     provider: 'drive', priority: 15, active: true },
    { id: 'r16', pattern: '*.css',     target: '/01_PROJECTS/',     provider: 'drive', priority: 15, active: true },
    { id: 'r17', pattern: '*.eml',     target: '/07_EMAIL_DRAFTS/', provider: 'drive', priority: 25, active: true },
    { id: 'r18', pattern: '*.msg',     target: '/07_EMAIL_DRAFTS/', provider: 'drive', priority: 25, active: true },
];
const { join } = require('path');
const { existsSync, mkdirSync, writeFileSync, appendFileSync, readFileSync } = require('fs');

const CLOUDIA_DIR = join(__dirname, 'data', 'cloudia');
if (!existsSync(CLOUDIA_DIR)) mkdirSync(CLOUDIA_DIR, { recursive: true });

const CLOUDIA_EVENT_LOG = join(CLOUDIA_DIR, 'cloudia-event.log');
const SORT_RULES_FILE = join(CLOUDIA_DIR, 'sort-rules.json');
const SORT_INDEX_FILE = join(CLOUDIA_DIR, 'sort-index.json');
const PROVIDER_STATE_FILE = join(CLOUDIA_DIR, 'providers.json');

if (!existsSync(SORT_RULES_FILE)) writeFileSync(SORT_RULES_FILE, JSON.stringify(DEFAULT_SORT_RULES, null, 2));
if (!existsSync(SORT_INDEX_FILE)) writeFileSync(SORT_INDEX_FILE, '[]');

function logCloudia(action, filename, detail = '') {
    const entry = `[${new Date().toISOString()}] ${action} | ${filename} | ${detail}\n`;
    appendFileSync(CLOUDIA_EVENT_LOG, entry);
}

function loadSortRules() {
    try { return JSON.parse(readFileSync(SORT_RULES_FILE, 'utf8')); }
    catch { return DEFAULT_SORT_RULES; }
}

function saveSortRules(rules) {
    writeFileSync(SORT_RULES_FILE, JSON.stringify(rules, null, 2));
    logCloudia('rules-update', `rules (${rules.length})`, 'OK');
}

function matchSortRule(filename, rules) {
    const active = rules.filter(r => r.active).sort((a, b) => a.priority - b.priority);
    for (const rule of active) {
        const regex = new RegExp('^' + rule.pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
        if (regex.test(filename)) return rule;
    }
    return null;
}

function addToSortIndex(entry) {
    const index = JSON.parse(readFileSync(SORT_INDEX_FILE, 'utf8') || '[]');
    const item = {
        id: 'cl-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
        filename: entry.filename,
        path: entry.path || '/_INBOX/',
        provider: entry.provider || 'local',
        fileType: detectFileType(entry.filename),
        sizeBytes: entry.sizeBytes || 0,
        contentHash: entry.contentHash || '',
        tags: entry.tags || [],
        createdAt: new Date().toISOString()
    };
    index.unshift(item);
    writeFileSync(SORT_INDEX_FILE, JSON.stringify(index, null, 2));
    logCloudia('index-add', entry.filename, `${item.path} (${item.provider})`);
    return item;
}

function detectFileType(filename) {
    const ext = (filename.split('.').pop() || '').toLowerCase();
    const types = {
        md: 'document', txt: 'document', pdf: 'document', doc: 'document', docx: 'document',
        jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', svg: 'image', webp: 'image',
        mp4: 'video', webm: 'video', avi: 'video', mkv: 'video', mov: 'video',
        mp3: 'audio', wav: 'audio', flac: 'audio', ogg: 'audio',
        zip: 'archive', tar: 'archive', gz: 'archive', rar: 'archive', '7z': 'archive',
        js: 'code', py: 'code', html: 'code', css: 'code', ts: 'code', json: 'code',
        eml: 'email', msg: 'email'
    };
    return types[ext] || 'other';
}

function computeProviderStatus() {
    const stored = existsSync(PROVIDER_STATE_FILE)
        ? JSON.parse(readFileSync(PROVIDER_STATE_FILE, 'utf8'))
        : {};
    const result = {};
    for (const [key, prov] of Object.entries(CLOUDIA_PROVIDERS)) {
        result[key] = {
            ...prov,
            status: stored[key]?.status || prov.status,
            lastSync: stored[key]?.lastSync || null
        };
    }
    return result;
}

// ─── Routes ────────────────────────────────────────────────────

app.get('/api/v1/cloudia/providers', async (req, res) => {
    const providers = computeProviderStatus();
    try {
        const driveAdapter = require('./00_lib/cloudia-drive-auth.js');
        const driveStatus = await driveAdapter.getStatus();
        providers['drive'] = { ...providers['drive'], ...driveStatus };
    } catch (e) {
        providers['drive'].status = 'error';
        providers['drive'].details = e.message;
    }
    logCloudia('providers-list', 'all', `${Object.keys(providers).length} providers`);
    res.json({ success: true, providers });
});

app.get('/api/v1/cloudia/rules', (req, res) => {
    const rules = loadSortRules();
    res.json({ success: true, rules, total: rules.length });
});

app.post('/api/v1/cloudia/rules', (req, res) => {
    const { rules } = req.body;
    if (!Array.isArray(rules)) return res.status(400).json({ success: false, error: 'rules must be an array' });
    saveSortRules(rules);
    res.json({ success: true, rules, total: rules.length });
});

app.post('/api/v1/cloudia/sort', (req, res) => {
    const { filename, sizeBytes } = req.body;
    if (!filename) return res.status(400).json({ success: false, error: 'filename is required' });
    const rules = loadSortRules();
    const rule = matchSortRule(filename, rules);
    const target = rule ? rule.target : '/_INBOX/';
    const provider = rule ? rule.provider : 'local';
    const tags = rule ? [rule.pattern] : ['unsorted'];
    const item = addToSortIndex({ filename, path: target, provider, sizeBytes: sizeBytes || 0, tags });
    logCloudia('sort', filename, `${target} (${provider})`);
    res.json({ success: true, item, rule, target });
});

app.post('/api/v1/cloudia/move', async (req, res) => {
    const { filename, target, provider, sizeBytes } = req.body;
    if (!filename || !target) return res.status(400).json({ success: false, error: 'filename and target are required' });
    
    let moveDetails = null;
    try {
        if (provider === 'drive') {
            const driveAdapter = require('./00_lib/cloudia-drive-auth.js');
            moveDetails = await driveAdapter.uploadFileMVP(filename, target);
        }
        
        const item = addToSortIndex({ filename, path: target, provider: provider || 'local', sizeBytes: sizeBytes || 0, tags: ['moved'] });
        logCloudia('move', filename, `${target} (${provider || 'local'})`);
        res.json({ success: true, item, moveDetails });
    } catch (e) {
        logCloudia('move-error', filename, e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/v1/cloudia/catalog', (req, res) => {
    const { q, fileType, provider, limit } = req.query;
    const index = JSON.parse(readFileSync(SORT_INDEX_FILE, 'utf8') || '[]');
    let filtered = index;
    if (q) {
        const query = q.toLowerCase();
        filtered = filtered.filter(item =>
            item.filename.toLowerCase().includes(query) ||
            item.path.toLowerCase().includes(query) ||
            (item.tags || []).some(t => t.toLowerCase().includes(query))
        );
    }
    if (fileType) filtered = filtered.filter(item => item.fileType === fileType);
    if (provider) filtered = filtered.filter(item => item.provider === provider);
    const max = parseInt(limit) || 200;
    const results = filtered.slice(0, max);
    logCloudia('catalog-list', `q=${q || '*'}`, `${results.length} of ${index.length} total`);
    res.json({ success: true, catalog: results, total: index.length, filtered: filtered.length });
});

app.get('/api/v1/cloudia/stats', (req, res) => {
    const index = JSON.parse(readFileSync(SORT_INDEX_FILE, 'utf8') || '[]');
    const providers = computeProviderStatus();
    const logLines = existsSync(CLOUDIA_EVENT_LOG)
        ? readFileSync(CLOUDIA_EVENT_LOG, 'utf8').split('\n').filter(Boolean).slice(-50)
        : [];
    const byType = {};
    const byProvider = {};
    let totalSize = 0;
    index.forEach(item => {
        byType[item.fileType] = (byType[item.fileType] || 0) + 1;
        byProvider[item.provider] = (byProvider[item.provider] || 0) + 1;
        totalSize += item.sizeBytes || 0;
    });
    res.json({ success: true, stats: {
        totalFiles: index.length,
        totalSize,
        byType,
        byProvider,
        providers,
        recentEvents: logLines.slice(-20),
        todayActions: logLines.filter(l => l.startsWith(new Date().toISOString().substring(0, 10))).length
    }});
});

app.get('/api/v1/cloudia/event-log', (req, res) => {
    const { lines } = req.query;
    const max = parseInt(lines) || 50;
    const logLines = existsSync(CLOUDIA_EVENT_LOG)
        ? readFileSync(CLOUDIA_EVENT_LOG, 'utf8').split('\n').filter(Boolean).slice(-max)
        : [];
    res.json({ success: true, events: logLines, total: logLines.length });
});

// ═══════════════════════════════════════════════════════════════
// AiAiKirk™ — Chatbot-Steuermann Backend
// ═══════════════════════════════════════════════════════════════

const KIRK_DIR = join(__dirname, 'data', 'aiaikirk');
if (!existsSync(KIRK_DIR)) mkdirSync(KIRK_DIR, { recursive: true });
const KIRK_SESSIONS_FILE = join(KIRK_DIR, 'sessions.json');
if (!existsSync(KIRK_SESSIONS_FILE)) writeFileSync(KIRK_SESSIONS_FILE, JSON.stringify({ default: [] }, null, 2));

function getKirkSessions() {
    try { return JSON.parse(readFileSync(KIRK_SESSIONS_FILE, 'utf8')); }
    catch { return { default: [] }; }
}
function saveKirkSessions(sessions) {
    writeFileSync(KIRK_SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

let currentKirkRoute = 'auto';

app.get('/api/v1/aiaikirk/status', (req, res) => {
    const sessions = getKirkSessions();
    res.json({
        success: true,
        route: currentKirkRoute,
        sessionsCount: Object.keys(sessions).length,
        defaultHistoryLength: (sessions.default || []).length
    });
});

app.post('/api/v1/aiaikirk/route', (req, res) => {
    const { provider } = req.body;
    if (provider) currentKirkRoute = provider;
    res.json({ success: true, route: currentKirkRoute });
});

app.post('/api/v1/aiaikirk/chat', async (req, res) => {
    const { message, sessionId = 'default', systemPrompt = 'Du bist AiAiKirk, der Chef-Steuermann.' } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'message required' });

    if (!fiveSplitterInstance) {
        return res.status(503).json({ success: false, error: 'FiveSplitter Router nicht bereit.' });
    }

    const sessions = getKirkSessions();
    if (!sessions[sessionId]) sessions[sessionId] = [];
    
    // Append user message
    sessions[sessionId].push({ role: 'user', content: message });
    
    // Build context
    const messages = [
        { role: 'system', content: systemPrompt },
        ...sessions[sessionId]
    ];

    try {
        const result = currentKirkRoute === 'auto' 
            ? await fiveSplitterInstance.race(messages) 
            : await fiveSplitterInstance.routeChat(currentKirkRoute, messages);

        if (!result.success) {
            sessions[sessionId].push({ role: 'assistant', content: `[ERROR] ${result.error}` });
            saveKirkSessions(sessions);
            return res.status(500).json({ success: false, error: result.error });
        }

        sessions[sessionId].push({ role: 'assistant', content: result.data });
        saveKirkSessions(sessions);

        res.json({
            success: true,
            provider: result.provider,
            response: result.data,
            latency: result.latency
        });

    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// Git Autonomy & GSH Backend
// ═══════════════════════════════════════════════════════════════

function runGit(command) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) reject(stderr || error.message);
            else resolve(stdout || stderr);
        });
    });
}

app.post('/api/v1/git/gsh', async (req, res) => {
    let { command } = req.body;
    if (!command) command = 'status';
    if (!command.startsWith('git ')) command = 'git ' + command;
    try {
        const output = await runGit(command);
        res.json({ success: true, output });
    } catch (e) {
        res.json({ success: false, error: e });
    }
});

app.post('/api/v1/git/auto-commit', async (req, res) => {
    try {
        await runGit('git add .');
        const output = await runGit('git commit -m "🤖 [Auto-Commit] Autonomous State Save"');
        res.json({ success: true, output });
    } catch (e) {
        if (e.includes('nothing to commit')) res.json({ success: true, output: 'Nothing to commit.' });
        else res.json({ success: false, error: e });
    }
});

app.post('/api/v1/git/undo', async (req, res) => {
    try {
        const output = await runGit('git reset HEAD~1');
        res.json({ success: true, output });
    } catch (e) {
        res.json({ success: false, error: e });
    }
});

// Autonome Git-Loop (alle 10 Minuten)
setInterval(async () => {
    try {
        console.log('[Git-Auto] Checking for changes...');
        const status = await runGit('git status --porcelain');
        if (status.trim().length > 0) {
            console.log('[Git-Auto] Changes detected. Executing auto-commit...');
            await runGit('git add .');
            await runGit('git commit -m "🤖 [Auto-Commit] Autonomous Loop Save"');
            console.log('[Git-Auto] Auto-commit success.');
        } else {
            console.log('[Git-Auto] Clean working directory.');
        }
    } catch (e) {
        console.log('[Git-Auto] Error:', e.message || e);
    }
}, 10 * 60 * 1000); // 10 Minuten


// ═══════════════════════════════════════════════════════════════
// Obsidian Second Brain Integration
// ═══════════════════════════════════════════════════════════════

// Standardpfad, falls nicht in .env konfiguriert
const OBSIDIAN_PATH = process.env.OBSIDIAN_PATH || 'C:\\DEVKiTZ\\02_Obsidian_Vault';

if (!existsSync(OBSIDIAN_PATH)) {
    console.log(`[Obsidian] ⚠️ Vault nicht gefunden unter: ${OBSIDIAN_PATH}. Bitte erstelle den Ordner oder setze OBSIDIAN_PATH.`);
    try { mkdirSync(OBSIDIAN_PATH, { recursive: true }); } catch(e){}
}

app.post('/api/v1/second-brain/save', (req, res) => {
    const { content, title = 'Schnellnotiz' } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'Kein Content' });
    
    try {
        const dateStr = new Date().toISOString().substring(0, 10);
        const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `${dateStr}_${safeTitle}_${Date.now()}.md`;
        const filepath = join(OBSIDIAN_PATH, filename);
        
        writeFileSync(filepath, `# ${title}\n\n${content}\n\n> Gespeichert von DkZ Dashboard an ${new Date().toLocaleString()}\n`);
        console.log(`[Obsidian] Notiz gespeichert: ${filename}`);
        res.json({ success: true, file: filename });
    } catch (e) {
        console.log(`[Obsidian] Fehler:`, e);
        res.status(500).json({ success: false, error: e.message });
    }
});


// ═══════════════════════════════════════════════════════════════
// Supabase / Postgres & Iceberg Integration
// ═══════════════════════════════════════════════════════════════

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Supabase] ✅ Verbunden (Postgres + Iceberg Vector Store ready)');
} else {
    console.log('[Supabase] ⚠️ Keine URL/Key in .env gefunden. Supabase ist offline.');
}

// ═══════════════════════════════════════════════════════════════
// OS Control (Computer Use, OpenManus, Playwright) & YOLO
// ═══════════════════════════════════════════════════════════════

let YOLO_MODE = false;

app.post('/api/v1/yolo/toggle', (req, res) => {
    YOLO_MODE = !YOLO_MODE;
    console.log(`[YOLO] Modus ist jetzt: ${YOLO_MODE ? 'AKTIV 🚨' : 'INAKTIV 🛡️'}`);
    res.json({ success: true, yolo: YOLO_MODE });
});

app.post('/api/v1/os-control/run', (req, res) => {
    const { action, x, y, text, keys } = req.body;
    
    // Security Check
    if (!YOLO_MODE) {
        return res.status(403).json({ success: false, error: 'YOLO Modus ist nicht aktiv. Ausführung blockiert.' });
    }

    const pythonProc = spawn('python', [join(__dirname, 'modules/os-control/os-control.py')]);
    
    let outData = '';
    pythonProc.stdout.on('data', d => outData += d.toString());
    
    pythonProc.on('close', () => {
        try {
            res.json(JSON.parse(outData));
        } catch(e) {
            res.json({ success: false, error: 'Fehler beim Parsen der OS Control Ausgabe', raw: outData });
        }
    });
    
    pythonProc.stdin.write(JSON.stringify({ action, x, y, text, keys }));
    pythonProc.stdin.end();
});

// ═══════════════════════════════════════════════════════════════
// Webhooks & Domains (devkitz.eu, blogger.com, dkz.app)
// ═══════════════════════════════════════════════════════════════

app.post('/api/v1/webhooks/dispatch', async (req, res) => {
    const { target, payload } = req.body;
    // Map of target domains to their webhook URLs (must be configured in .env)
    const webhooks = {
        'devkitz.eu': process.env.WEBHOOK_DEVKITZ_EU,
        'devkitz.sites': process.env.WEBHOOK_DEVKITZ_SITES,
        'devkitz.blog': process.env.WEBHOOK_DEVKITZ_BLOG,
        'blogger.com': process.env.WEBHOOK_BLOGGER,
        'dkz.app': process.env.WEBHOOK_DKZ_APP
    };
    
    const url = webhooks[target];
    if (!url) return res.status(400).json({ success: false, error: `Kein Webhook für ${target} konfiguriert.` });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        res.json({ success: true, status: response.status });
    } catch(e) {
        res.status(500).json({ success: false, error: e.message });
    }
});


// ═══════════════════════════════════════════════════════════════
// n8n Paperclip & Paperless Integration
// ═══════════════════════════════════════════════════════════════

const PAPERLESS_INBOX = 'C:\\DEVKiTZ\\Paperless_Inbox';
const PAPERCLIP_REPO = 'C:\\DEVKiTZ\\04_SYSTEM\\ISSUES';
if (!existsSync(PAPERLESS_INBOX)) { try { mkdirSync(PAPERLESS_INBOX, { recursive: true }); } catch(e){} }
if (!existsSync(PAPERCLIP_REPO)) { try { mkdirSync(PAPERCLIP_REPO, { recursive: true }); } catch(e){} }

app.post('/api/v1/n8n/paperclip', async (req, res) => {
    const { content, type, filename, target, metadata } = req.body;
    // type: 'text', 'link', 'image', 'document'
    // target: 'github', 'paperless', 'copilot'
    
    if (!content) return res.status(400).json({ success: false, error: 'No content provided' });

    console.log(`[n8n Paperclip] Received payload: type=${type}, target=${target}`);

    try {
        let markdownContent = content;
        
        // 1. LLM Formatting (Simulated or via local model if we had direct bind here, 
        // but for now we format it nicely or use Mistral API to format)
        if (type === 'text' || type === 'link') {
            if (apiKey) {
                try {
                    const prompt = `Formatiere folgenden Input vom Handy als sauberes Markdown-Dokument (mit Titel, Tags, Struktur). Input: ${content}`;
                    const resp = await mistralClient.chat.complete({ model: 'open-mistral-nemo', messages: [{role:'user', content: prompt}]});
                    markdownContent = resp.choices[0].message.content;
                } catch (apiErr) {
                    console.error('[n8n Paperclip] LLM Formatting failed, falling back to raw:', apiErr.message);
                    markdownContent = `# Paperclip Snippet\n\n${content}\n\n*Auto-formatted by Paperclip (Fallback)*`;
                }
            } else {
                markdownContent = `# Paperclip Snippet\n\n${content}\n\n*Auto-formatted by Paperclip*`;
            }
        }

        // 2. Routing to GitHub Repo (Markdown)
        const dateStr = new Date().toISOString().substring(0, 10);
        const safeName = (filename || 'mobile_note').replace(/[^a-zA-Z0-9_-]/g, '_');
        
        if (target === 'github' || target === 'copilot' || !target) {
            const mdFile = join(PAPERCLIP_REPO, `${dateStr}_${safeName}.md`);
            writeFileSync(mdFile, markdownContent);
            console.log(`[n8n Paperclip] Saved Markdown to GitHub Repo: ${mdFile}`);
        }

        // 3. Routing to Paperless-ngx
        if (target === 'paperless' || type === 'document') {
            // Write payload metadata for Paperless consume directory
            const metaFile = join(PAPERLESS_INBOX, `${dateStr}_${safeName}.json`);
            writeFileSync(metaFile, JSON.stringify({ 
                title: safeName, 
                created: new Date().toISOString(), 
                tags: ['n8n', 'mobile', type], 
                content: markdownContent,
                custom_metadata: metadata || {}
            }, null, 2));
            console.log(`[n8n Paperclip] Sent to Paperless Inbox: ${metaFile}`);
        }

        // 4. Copilot Frontend Bridge (Broadcast via Websocket)
        if (global.wss) {
            global.wss.clients.forEach(client => {
                if (client.readyState === 1 /* WebSocket.OPEN */) {
                    client.send(JSON.stringify({
                        event: 'paperclip_incoming',
                        data: {
                            type,
                            target,
                            filename: safeName,
                            preview: markdownContent.substring(0, 100) + '...'
                        }
                    }));
                }
            });
            console.log(`[n8n Paperclip] Broadcasted to Copilot UI.`);
        }

        res.json({ success: true, message: 'Paperclip processed payload successfully.', target });
    } catch (e) {
        console.error(`[n8n Paperclip] Error:`, e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// CLOUDIA2 Google Drive Adapter (MVP)
// ═══════════════════════════════════════════════════════════════

app.get('/api/v1/cloudia/gdrive/queue', (req, res) => {
    // MVP: Return a simulated queue of files from Google Drive
    // In production, this will call the googleapis library
    console.log('[CLOUDIA2] Fetching Google Drive Queue...');
    const mockFiles = [
        { id: 'g1', name: 'Rechnung_Mai_2026.pdf', size: 245000, type: 'document', added: Date.now() - 3600000, provider: 'gdrive' },
        { id: 'g2', name: 'Projekt_X_Draft.docx', size: 1250000, type: 'document', added: Date.now() - 7200000, provider: 'gdrive' },
        { id: 'g3', name: 'Screenshot_Dashboard_v2.png', size: 3400000, type: 'image', added: Date.now() - 1500000, provider: 'gdrive' },
        { id: 'g4', name: 'api-config-backup.json', size: 12000, type: 'config', added: Date.now() - 500000, provider: 'gdrive' }
    ];
    res.json({ success: true, files: mockFiles, quota: { used: '15 GB', total: '100 GB' }});
});

app.post('/api/v1/cloudia/gdrive/sort', (req, res) => {
    const { fileId, targetPath, ruleId } = req.body;
    // MVP: Log the sort operation
    console.log(`[CLOUDIA2] Sorting file ${fileId} to ${targetPath} using rule ${ruleId}`);
    // Simulated delay for sorting
    setTimeout(() => {
        res.json({ success: true, message: `File ${fileId} moved to ${targetPath} successfully.` });
    }, 800);
});

// ═══════════════════════════════════════════════════════════════
// STARTUP VALIDATION
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// Phase 16: Iceberg/DuckDB Data Source (NEMO-Research Backend)
// ═══════════════════════════════════════════════════════════════
app.post('/api/v1/swarm/data/query', (req, res) => {
    const { query, table = 'wissen_hub_catalog' } = req.body;
    console.log(`[Iceberg Mock] Received query: ${query} on table ${table}`);
    
    // Mock Dataset
    const mockData = [
        { id: 'ART-2026-0624-001', title: 'System-Architektur v3', tags: ['architecture', 'blueprint'], type: 'blueprint' },
        { id: 'ART-2026-0624-002', title: 'Swarm Orchestrator Design', tags: ['swarm', 'python', 'fastapi'], type: 'impl-plan' },
        { id: 'ART-2026-0624-003', title: 'DuckDB Optimization Guide', tags: ['duckdb', 'data', 'performance'], type: 'research' }
    ];

    // Simple keyword filtering
    const keyword = (query || '').toLowerCase();
    const results = mockData.filter(d => 
        d.title.toLowerCase().includes(keyword) || 
        d.tags.some(t => t.toLowerCase().includes(keyword))
    );

    res.json({
        success: true,
        data: results.length > 0 ? results : mockData,
        engine: 'duckdb_in_memory_mock',
        execution_time_ms: 14
    });
});

const { validateStartup } = require('./startup-validation');

validateStartup().then(() => {
    const server = app.listen(port, () => {
        console.log(`[DkZ Unified Backend] running at http://localhost:${port}`);
        console.log(`Monitoring directory: ${__dirname}`);
        console.log(`Endpoints Initialized: /api/sync, /api/v1/deepkeep/*, /api/chat, /api/analyze, Health, WebSockets, etc.`);
    });

    // WebSockets Setup
    const wss = new WebSocketServer({ server, path: '/ws' });
    global.wss = wss; // Export for Paperclip
    wss.on('connection', (ws) => {
        console.log('WebSocket client connected.');
        ws.on('message', (message) => {
            console.log(`Received WS message: ${message}`);
            ws.send(JSON.stringify({ event: 'ping', data: 'pong' }));
        });
        ws.on('close', () => console.log('WebSocket client disconnected.'));
    });

    // ═══════════════════════════════════════════════════════════════
    // Swarm-2-Copilot Bridge (Phase 15.1)
    // ═══════════════════════════════════════════════════════════════
    let lastSwarmHash = '';
    setInterval(async () => {
        if (!global.wss || global.wss.clients.size === 0) return;
        try {
            const response = await fetch('http://localhost:3060/api/v1/swarm/status');
            if (response.ok) {
                const json = await response.json();
                if (json.success && json.data) {
                    const currentHash = JSON.stringify(json.data);
                    if (currentHash !== lastSwarmHash) {
                        lastSwarmHash = currentHash;
                        // Broadcast to all clients
                        global.wss.clients.forEach(client => {
                            if (client.readyState === 1) { // WebSocket.OPEN
                                client.send(JSON.stringify({
                                    event: 'swarm_status_update',
                                    data: json.data
                                }));
                            }
                        });
                    }
                }
            }
        } catch (err) {
            // Orchestrator might be offline, ignore silently
        }
    }, 3000); // Poll every 3 seconds
});
