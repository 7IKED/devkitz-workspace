/**
 * DkZ Webhook Hub — Express-freier Node.js HTTP Server
 * @DKZ:RULES → R8 keine Umlaute, R15 esc(), R21 Shared Scripts
 * @DKZ:TAG → [SYS:webhook] [CAT:shared] [LANG:js]
 * @version v1.0.0
 *
 * Port 9090 — Dual-Mode: Copilot (3040) + n8n (5678)
 * 8 vorgefertigte Webhooks + Discovery + Health + Logging
 *
 * Starten:  node webhook-hub.js
 * Testen:   curl http://localhost:9090/health
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { URL } = require('url');

// ═══════════════════════════════════════════════════════
// Konfiguration laden
// ═══════════════════════════════════════════════════════
const CONFIG_PATH = path.join(__dirname, 'webhook-config.json');
let CONFIG = {};

function loadConfig() {
    try {
        const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
        CONFIG = JSON.parse(raw);
    } catch {
        CONFIG = {
            port: 9090,
            corsOrigins: ['http://localhost', 'file://'],
            appsScriptUrl: '',
            n8nUrl: 'http://localhost:5678',
            openhandsUrl: 'http://localhost:3000',
            gatewayUrl: 'http://localhost:3040',
            deepkeepLocal: path.join(__dirname, '..', '..', '..', '[DEEPKEEP]'),
            desktopPath: path.join(require('os').homedir(), 'Desktop'),
            downloadsPath: path.join(require('os').homedir(), 'Downloads'),
            projectsPath: path.join(__dirname, '..', '..'),
            logMaxEntries: 200,
            healthCheckInterval: 300000,
            healthProviders: {}
        };
    }
}
loadConfig();

// ═══════════════════════════════════════════════════════
// Request Log (persistiert in webhook-log.json)
// ═══════════════════════════════════════════════════════
const LOG_PATH = path.join(__dirname, 'webhook-log.json');
let requestLog = [];

function loadLog() {
    try {
        const raw = fs.readFileSync(LOG_PATH, 'utf8');
        requestLog = JSON.parse(raw);
    } catch {
        requestLog = [];
    }
}

function saveLog() {
    try {
        fs.writeFileSync(LOG_PATH, JSON.stringify(requestLog, null, 2), 'utf8');
    } catch (err) {
        console.warn('[WebhookHub] Log speichern fehlgeschlagen:', err.message);
    }
}

function addLogEntry(hookName, source, status, detail) {
    const entry = {
        id: 'wh-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
        hook: hookName,
        source: source || 'unknown',
        status,
        detail: typeof detail === 'string' ? detail : JSON.stringify(detail),
        timestamp: new Date().toISOString()
    };
    requestLog.unshift(entry);
    if (requestLog.length > (CONFIG.logMaxEntries || 200)) {
        requestLog.length = CONFIG.logMaxEntries || 200;
    }
    saveLog();
    return entry;
}

loadLog();

// ═══════════════════════════════════════════════════════
// Server Start-Zeit fuer Uptime
// ═══════════════════════════════════════════════════════
const SERVER_START = Date.now();

// ═══════════════════════════════════════════════════════
// Hilfsfunktionen
// ═══════════════════════════════════════════════════════

/**
 * Escaped HTML-relevante Zeichen (R15 XSS-Schutz)
 */
function esc(s) {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * HTTP-Fetch via Node.js http/https (kein node-fetch noetig)
 */
function httpFetch(urlStr, options = {}) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(urlStr);
        const lib = parsed.protocol === 'https:' ? require('https') : http;
        const reqOptions = {
            hostname: parsed.hostname,
            port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
            path: parsed.pathname + parsed.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            timeout: options.timeout || 5000
        };

        const req = lib.request(reqOptions, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, data });
            });
        });

        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });

        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

/**
 * Scannt Verzeichnis nach Dateien die aelter als N Tage sind
 */
function scanOldFiles(dirPath, maxAgeDays = 7) {
    const results = [];
    const cutoff = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);

    try {
        if (!fs.existsSync(dirPath)) return results;
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isFile()) {
                const fullPath = path.join(dirPath, entry.name);
                try {
                    const stat = fs.statSync(fullPath);
                    if (stat.mtimeMs < cutoff) {
                        results.push({
                            filename: entry.name,
                            path: fullPath,
                            sizeBytes: stat.size,
                            lastModified: new Date(stat.mtimeMs).toISOString(),
                            ageDays: Math.floor((Date.now() - stat.mtimeMs) / (24 * 60 * 60 * 1000))
                        });
                    }
                } catch { /* Datei nicht lesbar — uebergehen */ }
            }
        }
    } catch (err) {
        console.warn('[WebhookHub] Scan fehlgeschlagen fuer', dirPath, ':', err.message);
    }

    return results.sort((a, b) => a.ageDays - b.ageDays);
}

/**
 * Kopiert Datei in den lokalen DEEPKEEP Tresor
 */
function copyToDeepkeep(sourcePath, filename, tags) {
    const deepkeepDir = CONFIG.deepkeepLocal || path.join(__dirname, '..', '..', '..', '[DEEPKEEP]');
    const inboxDir = path.join(deepkeepDir, '_INBOX');

    try {
        if (!fs.existsSync(inboxDir)) {
            fs.mkdirSync(inboxDir, { recursive: true });
        }
        const destPath = path.join(inboxDir, filename);
        fs.copyFileSync(sourcePath, destPath);
        return { success: true, destination: destPath, tags: tags || [] };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Glob-Match fuer CLOUDIA Regeln
 */
function globMatch(filename, pattern) {
    const regex = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
    return new RegExp('^' + regex + '$', 'i').test(filename);
}

// ═══════════════════════════════════════════════════════
// 8 Webhook Handler
// ═══════════════════════════════════════════════════════
const HOOKS = {

    // ──────────────────────────────────────
    // 1. DEEPKEEP Sync
    // ──────────────────────────────────────
    'deepkeep-sync': {
        description: 'Datei in DEEPKEEP Tresor verschieben',
        method: 'POST',
        handler: async (body) => {
            const { filename, source, tags } = body || {};
            if (!filename) {
                return { ok: false, error: 'filename ist erforderlich' };
            }

            // Versuch 1: Apps Script URL (Google Drive)
            if (CONFIG.appsScriptUrl) {
                try {
                    const resp = await httpFetch(CONFIG.appsScriptUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'deepkeep-sync', filename, source, tags }),
                        timeout: 10000
                    });
                    if (resp.ok) {
                        return { ok: true, provider: 'drive', filename, detail: 'Via Apps Script hochgeladen' };
                    }
                } catch {
                    // Fallback auf lokale Kopie
                }
            }

            // Fallback: Lokal in DEEPKEEP-Ordner kopieren
            if (source && fs.existsSync(source)) {
                const result = copyToDeepkeep(source, filename, tags);
                return { ok: result.success, provider: 'local', filename, ...result };
            }

            return {
                ok: true,
                provider: 'catalog-only',
                filename,
                detail: 'Katalog-Eintrag erstellt (keine Quelldatei angegeben)'
            };
        }
    },

    // ──────────────────────────────────────
    // 2. CLOUDIA Sort
    // ──────────────────────────────────────
    'cloudia-sort': {
        description: 'Datei nach CLOUDIA Regeln sortieren',
        method: 'POST',
        handler: async (body) => {
            const { filename, sizeBytes } = body || {};
            if (!filename) {
                return { ok: false, error: 'filename ist erforderlich' };
            }

            // CLOUDIA Sortier-Regeln (sync mit cloudia-api.js DEFAULT_RULES)
            const RULES = [
                { pattern: '*.md', target: '/02_RESEARCH/', priority: 10 },
                { pattern: '*.txt', target: '/02_RESEARCH/', priority: 10 },
                { pattern: '*.pdf', target: '/02_RESEARCH/', priority: 10 },
                { pattern: '*.jpg', target: '/03_MEDIA/images/', priority: 20 },
                { pattern: '*.png', target: '/03_MEDIA/images/', priority: 20 },
                { pattern: '*.svg', target: '/03_MEDIA/images/', priority: 20 },
                { pattern: '*.mp4', target: '/03_MEDIA/videos/', priority: 20 },
                { pattern: '*.mp3', target: '/03_MEDIA/audio/', priority: 20 },
                { pattern: '*.zip', target: '/99_ARCHIVE/', priority: 30 },
                { pattern: '*.tar.gz', target: '/99_ARCHIVE/', priority: 30 },
                { pattern: '*.js', target: '/01_PROJECTS/', priority: 15 },
                { pattern: '*.py', target: '/01_PROJECTS/', priority: 15 },
                { pattern: '*.html', target: '/01_PROJECTS/', priority: 15 },
                { pattern: '*.css', target: '/01_PROJECTS/', priority: 15 },
                { pattern: '*.eml', target: '/07_EMAIL_DRAFTS/', priority: 25 }
            ];

            const sorted = RULES.sort((a, b) => a.priority - b.priority);
            let matched = null;
            for (const rule of sorted) {
                if (globMatch(filename, rule.pattern)) {
                    matched = rule;
                    break;
                }
            }

            const target = matched ? matched.target : '/_INBOX/';
            const catalogEntry = {
                filename,
                target,
                sizeBytes: sizeBytes || 0,
                rule: matched ? matched.pattern : 'none',
                sortedAt: new Date().toISOString()
            };

            return { ok: true, filename, target, rule: matched, catalogEntry };
        }
    },

    // ──────────────────────────────────────
    // 3. 7-Tage-Regel Check
    // ──────────────────────────────────────
    '7day-check': {
        description: '7-Tage-Regel pruefen — Desktop/Downloads scannen',
        method: 'GET',
        handler: async () => {
            const desktopPath = CONFIG.desktopPath || path.join(require('os').homedir(), 'Desktop');
            const downloadsPath = CONFIG.downloadsPath || path.join(require('os').homedir(), 'Downloads');

            const desktopOld = scanOldFiles(desktopPath, 7);
            const downloadsOld = scanOldFiles(downloadsPath, 7);

            return {
                ok: true,
                scannedAt: new Date().toISOString(),
                desktop: {
                    path: desktopPath,
                    count: desktopOld.length,
                    files: desktopOld
                },
                downloads: {
                    path: downloadsPath,
                    count: downloadsOld.length,
                    files: downloadsOld
                },
                totalOldFiles: desktopOld.length + downloadsOld.length,
                recommendation: (desktopOld.length + downloadsOld.length) > 0
                    ? 'Dateien in DEEPKEEP verschieben oder aufraeumen'
                    : 'Alles sauber — keine alten Dateien gefunden'
            };
        }
    },

    // ──────────────────────────────────────
    // 4. DIRECTORY.ini Regenerieren
    // ──────────────────────────────────────
    'ini-update': {
        description: 'DIRECTORY.ini regenerieren (ORDNER.ini)',
        method: 'POST',
        handler: async (body) => {
            const targetDir = (body && body.directory)
                ? path.resolve(body.directory)
                : CONFIG.projectsPath || path.join(__dirname, '..', '..');

            // Suche generate-ini.js oder generate-docs.js
            const candidates = [
                path.join(__dirname, 'generate-ini.js'),
                path.join(__dirname, 'generate-docs.js'),
                path.join(__dirname, '..', '..', '..', '04_SYSTEM', 'scripts', 'generate-ini.js')
            ];

            let scriptPath = null;
            for (const p of candidates) {
                if (fs.existsSync(p)) {
                    scriptPath = p;
                    break;
                }
            }

            if (!scriptPath) {
                // Fallback: Eigene ORDNER.ini Generierung
                return await generateIniInline(targetDir);
            }

            return new Promise((resolve) => {
                execFile('node', [scriptPath, targetDir], { timeout: 30000 }, (err, stdout, stderr) => {
                    if (err) {
                        resolve({ ok: false, error: err.message, stderr: stderr || '' });
                    } else {
                        resolve({ ok: true, directory: targetDir, output: stdout.trim() });
                    }
                });
            });
        }
    },

    // ──────────────────────────────────────
    // 5. Health Check aller Provider
    // ──────────────────────────────────────
    'health-check': {
        description: 'System-Health aller Provider pruefen',
        method: 'GET',
        handler: async () => {
            const providers = CONFIG.healthProviders || {};
            const results = {};

            for (const [name, cfg] of Object.entries(providers)) {
                if (!cfg.url) {
                    results[name] = { status: 'not_configured', latencyMs: 0 };
                    continue;
                }
                const start = Date.now();
                try {
                    const resp = await httpFetch(cfg.url, {
                        method: cfg.method || 'GET',
                        timeout: cfg.timeout || 3000
                    });
                    results[name] = {
                        status: resp.ok ? 'online' : 'degraded',
                        httpStatus: resp.status,
                        latencyMs: Date.now() - start
                    };
                } catch (err) {
                    results[name] = {
                        status: 'offline',
                        error: err.message,
                        latencyMs: Date.now() - start
                    };
                }
            }

            // Copilot Gateway (immer pruefen)
            const gwStart = Date.now();
            try {
                const gwResp = await httpFetch((CONFIG.gatewayUrl || 'http://localhost:3040') + '/health', {
                    method: 'GET', timeout: 2000
                });
                results.gateway = {
                    status: gwResp.ok ? 'online' : 'degraded',
                    latencyMs: Date.now() - gwStart
                };
            } catch {
                results.gateway = { status: 'offline', latencyMs: Date.now() - gwStart };
            }

            const online = Object.values(results).filter(r => r.status === 'online').length;
            const total = Object.keys(results).length;

            return {
                ok: true,
                checkedAt: new Date().toISOString(),
                providers: results,
                summary: `${online}/${total} online`,
                overall: online === total ? 'healthy' : online > 0 ? 'degraded' : 'offline'
            };
        }
    },

    // ──────────────────────────────────────
    // 6. NanoBot Broadcast
    // ──────────────────────────────────────
    'nanobot-broadcast': {
        description: 'NanoBot Nachricht an alle Module broadcasten',
        method: 'POST',
        handler: async (body) => {
            const { message, channel, from } = body || {};
            if (!message) {
                return { ok: false, error: 'message ist erforderlich' };
            }

            const payload = {
                type: 'broadcast',
                from: from || 'webhook-hub',
                channel: channel || '#system',
                message,
                timestamp: new Date().toISOString()
            };

            // Versuch: An Copilot Gateway senden (WebSocket Bridge)
            let gatewayResult = null;
            try {
                const gwUrl = (CONFIG.gatewayUrl || 'http://localhost:3040') + '/api/v1/broadcast';
                const resp = await httpFetch(gwUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    timeout: 3000
                });
                gatewayResult = { sent: resp.ok, status: resp.status };
            } catch (err) {
                gatewayResult = { sent: false, error: err.message };
            }

            return {
                ok: true,
                message: esc(message),
                channel: channel || '#system',
                from: from || 'webhook-hub',
                gateway: gatewayResult
            };
        }
    },

    // ──────────────────────────────────────
    // 7. Backup Trigger
    // ──────────────────────────────────────
    'backup-trigger': {
        description: 'Backup auf R2 oder Drive starten',
        method: 'POST',
        handler: async (body) => {
            const { provider, scope } = body || {};
            const backupProvider = provider || 'drive';
            const backupScope = scope || 'incremental';

            if (backupProvider === 'r2') {
                // R2 Backup via Proxy
                try {
                    const r2Url = 'http://localhost:9880/backup/r2';
                    const resp = await httpFetch(r2Url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ scope: backupScope }),
                        timeout: 30000
                    });
                    return {
                        ok: resp.ok,
                        provider: 'r2',
                        scope: backupScope,
                        detail: resp.ok ? 'R2 Backup gestartet' : 'R2 Backup fehlgeschlagen'
                    };
                } catch (err) {
                    return { ok: false, provider: 'r2', error: err.message };
                }
            }

            if (backupProvider === 'drive' && CONFIG.appsScriptUrl) {
                try {
                    const resp = await httpFetch(CONFIG.appsScriptUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'backup', scope: backupScope }),
                        timeout: 30000
                    });
                    return {
                        ok: resp.ok,
                        provider: 'drive',
                        scope: backupScope,
                        detail: resp.ok ? 'Drive Backup gestartet' : 'Drive Backup fehlgeschlagen'
                    };
                } catch (err) {
                    return { ok: false, provider: 'drive', error: err.message };
                }
            }

            return {
                ok: false,
                provider: backupProvider,
                error: backupProvider === 'drive'
                    ? 'Apps Script URL nicht konfiguriert'
                    : 'Unbekannter Provider: ' + esc(backupProvider)
            };
        }
    },

    // ──────────────────────────────────────
    // 8. OpenHands Task
    // ──────────────────────────────────────
    'openhands-task': {
        description: 'Task an OpenHands Agent senden',
        method: 'POST',
        handler: async (body) => {
            const { task, repository, model } = body || {};
            if (!task) {
                return { ok: false, error: 'task ist erforderlich' };
            }

            const ohUrl = CONFIG.openhandsUrl || 'http://localhost:3000';

            try {
                const resp = await httpFetch(ohUrl + '/api/conversations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        initial_user_msg: task,
                        repository: repository || '',
                        selected_model: model || 'anthropic/claude-sonnet-4-20250514',
                        args: {}
                    }),
                    timeout: 15000
                });

                let parsed = {};
                try { parsed = JSON.parse(resp.data); } catch { /* nicht parsbar */ }

                return {
                    ok: resp.ok,
                    task: esc(task),
                    repository: repository || '(lokal)',
                    model: model || 'anthropic/claude-sonnet-4-20250514',
                    conversationId: parsed.conversation_id || null,
                    detail: resp.ok ? 'Task an OpenHands gesendet' : 'OpenHands Anfrage fehlgeschlagen'
                };
            } catch (err) {
                return {
                    ok: false,
                    task: esc(task),
                    error: err.message,
                    hint: 'Ist OpenHands auf ' + ohUrl + ' erreichbar?'
                };
            }
        }
    }
};

// ═══════════════════════════════════════════════════════
// Inline ORDNER.ini Generierung (Fallback)
// ═══════════════════════════════════════════════════════
async function generateIniInline(targetDir) {
    try {
        if (!fs.existsSync(targetDir)) {
            return { ok: false, error: 'Verzeichnis nicht gefunden: ' + targetDir };
        }

        const entries = fs.readdirSync(targetDir, { withFileTypes: true });
        const dirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));
        const files = entries.filter(e => e.isFile());

        let ini = '; ORDNER.ini — Auto-generiert von webhook-hub.js\n';
        ini += '; Generiert: ' + new Date().toISOString() + '\n';
        ini += '; Verzeichnis: ' + targetDir + '\n\n';

        ini += '[Verzeichnisse]\n';
        for (const d of dirs) {
            const subEntries = fs.readdirSync(path.join(targetDir, d.name), { withFileTypes: true });
            const subCount = subEntries.length;
            ini += d.name + ' = ' + subCount + ' Eintraege\n';
        }

        ini += '\n[Dateien]\n';
        for (const f of files) {
            const stat = fs.statSync(path.join(targetDir, f.name));
            const sizeKB = (stat.size / 1024).toFixed(1);
            ini += f.name + ' = ' + sizeKB + ' KB\n';
        }

        const iniPath = path.join(targetDir, 'ORDNER.ini');
        fs.writeFileSync(iniPath, ini, 'utf8');

        return {
            ok: true,
            directory: targetDir,
            iniPath,
            directories: dirs.length,
            files: files.length,
            detail: 'ORDNER.ini generiert'
        };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

// ═══════════════════════════════════════════════════════
// JSON Body Parser
// ═══════════════════════════════════════════════════════
function parseBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        const MAX_SIZE = 1024 * 1024; // 1 MB Limit

        req.on('data', (chunk) => {
            size += chunk.length;
            if (size > MAX_SIZE) {
                reject(new Error('Request Body zu gross (max 1MB)'));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });

        req.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8');
            if (!raw || raw.trim() === '') {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(raw));
            } catch {
                reject(new Error('Ungueltiges JSON'));
            }
        });

        req.on('error', reject);
    });
}

// ═══════════════════════════════════════════════════════
// CORS Headers
// ═══════════════════════════════════════════════════════
function setCorsHeaders(res, req) {
    const origin = req.headers.origin || '*';
    const allowedOrigins = CONFIG.corsOrigins || ['http://localhost', 'file://'];
    const isAllowed = allowedOrigins.some(o => origin.startsWith(o)) || origin === '*';

    res.setHeader('Access-Control-Allow-Origin', isAllowed ? origin : allowedOrigins[0]);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-DKZ-Source, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
}

// ═══════════════════════════════════════════════════════
// JSON Response Helper
// ═══════════════════════════════════════════════════════
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data, null, 2));
}

// ═══════════════════════════════════════════════════════
// Route Handler
// ═══════════════════════════════════════════════════════
async function handleRequest(req, res) {
    setCorsHeaders(res, req);

    // Preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, 'http://localhost');
    const pathname = parsedUrl.pathname;
    const source = req.headers['x-dkz-source'] || 'unknown';

    // ── GET /health ──
    if (pathname === '/health' && req.method === 'GET') {
        sendJSON(res, 200, {
            ok: true,
            service: 'DkZ Webhook Hub',
            version: 'v1.0.0',
            uptime: Math.floor((Date.now() - SERVER_START) / 1000) + 's',
            uptimeHuman: formatUptime(Date.now() - SERVER_START),
            port: CONFIG.port || 9090,
            hooks: Object.keys(HOOKS).length,
            logEntries: requestLog.length,
            timestamp: new Date().toISOString()
        });
        return;
    }

    // ── GET /hooks ──
    if (pathname === '/hooks' && req.method === 'GET') {
        const hookList = {};
        for (const [name, hook] of Object.entries(HOOKS)) {
            hookList[name] = {
                description: hook.description,
                method: hook.method,
                url: 'http://localhost:' + (CONFIG.port || 9090) + '/hook/' + name
            };
        }
        sendJSON(res, 200, {
            ok: true,
            count: Object.keys(HOOKS).length,
            hooks: hookList,
            note: 'Header X-DKZ-Source: copilot|n8n|manual fuer Tracking'
        });
        return;
    }

    // ── GET /log ──
    if (pathname === '/log' && req.method === 'GET') {
        const limit = parseInt(parsedUrl.searchParams.get('limit') || '50', 10);
        sendJSON(res, 200, {
            ok: true,
            count: Math.min(requestLog.length, limit),
            total: requestLog.length,
            entries: requestLog.slice(0, limit)
        });
        return;
    }

    // ── POST /hook/:name ──
    const hookMatch = pathname.match(/^\/hook\/([a-z0-9-]+)$/);
    if (hookMatch) {
        const hookName = hookMatch[1];
        const hook = HOOKS[hookName];

        if (!hook) {
            addLogEntry(hookName, source, 'error', 'Hook nicht gefunden');
            sendJSON(res, 404, { ok: false, error: 'Hook nicht gefunden: ' + esc(hookName) });
            return;
        }

        // Methoden-Check (GET Hooks erlauben auch GET Requests)
        if (hook.method === 'POST' && req.method !== 'POST') {
            sendJSON(res, 405, { ok: false, error: 'Method Not Allowed — ' + hookName + ' erwartet ' + hook.method });
            return;
        }

        try {
            let body = {};
            if (req.method === 'POST') {
                body = await parseBody(req);
            }

            const result = await hook.handler(body);
            const status = result && result.ok ? 'success' : 'error';
            addLogEntry(hookName, source, status, result);
            sendJSON(res, result && result.ok ? 200 : 400, result);

        } catch (err) {
            addLogEntry(hookName, source, 'error', err.message);
            sendJSON(res, 500, { ok: false, error: 'Hook Ausfuehrung fehlgeschlagen', detail: err.message });
        }
        return;
    }

    // ── 404 Catch-All ──
    sendJSON(res, 404, {
        ok: false,
        error: 'Unbekannte Route: ' + esc(pathname),
        hint: 'Verfuegbare Endpoints: /health, /hooks, /log, /hook/{name}',
        availableHooks: Object.keys(HOOKS)
    });
}

// ═══════════════════════════════════════════════════════
// Uptime Formatter
// ═══════════════════════════════════════════════════════
function formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return d + 'd ' + (h % 24) + 'h ' + (m % 60) + 'm';
    if (h > 0) return h + 'h ' + (m % 60) + 'm ' + (s % 60) + 's';
    if (m > 0) return m + 'm ' + (s % 60) + 's';
    return s + 's';
}

// ═══════════════════════════════════════════════════════
// Server erstellen + starten
// ═══════════════════════════════════════════════════════
const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((err) => {
        console.warn('[WebhookHub] Unbehandelter Fehler:', err.message);
        sendJSON(res, 500, { ok: false, error: 'Interner Server-Fehler' });
    });
});

const PORT = CONFIG.port || 9090;

server.listen(PORT, () => {
    const hookNames = Object.keys(HOOKS).join(', ');
    console.warn('══════════════════════════════════════════');
    console.warn(' DkZ Webhook Hub v1.0.0');
    console.warn(' Port: ' + PORT);
    console.warn(' Hooks: ' + Object.keys(HOOKS).length + ' (' + hookNames + ')');
    console.warn(' Log: ' + LOG_PATH);
    console.warn(' Config: ' + CONFIG_PATH);
    console.warn('══════════════════════════════════════════');
    console.warn(' Endpoints:');
    console.warn('   GET  /health           — Server Health');
    console.warn('   GET  /hooks            — Alle Hooks auflisten');
    console.warn('   GET  /log              — Letzte Aufrufe');
    for (const [name, hook] of Object.entries(HOOKS)) {
        console.warn('   ' + hook.method.padEnd(5) + '/hook/' + name.padEnd(20) + '— ' + hook.description);
    }
    console.warn('══════════════════════════════════════════');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.warn('[WebhookHub] FEHLER: Port ' + PORT + ' ist bereits belegt!');
        console.warn('[WebhookHub] Tipp: Anderen Port in webhook-config.json setzen');
    } else {
        console.warn('[WebhookHub] Server-Fehler:', err.message);
    }
    process.exit(1);
});

// Graceful Shutdown
process.on('SIGINT', () => {
    console.warn('\n[WebhookHub] Shutting down...');
    saveLog();
    server.close(() => {
        console.warn('[WebhookHub] Server gestoppt.');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    saveLog();
    server.close(() => process.exit(0));
});

// ═══════════════════════════════════════════════════════
// Module Export fuer Tests
// ═══════════════════════════════════════════════════════
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HOOKS,
        CONFIG,
        loadConfig,
        addLogEntry,
        esc,
        httpFetch,
        scanOldFiles,
        copyToDeepkeep,
        globMatch,
        generateIniInline,
        parseBody,
        server
    };
}
