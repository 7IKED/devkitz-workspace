/**
 * ⚡ DKZ API GATEWAY v1.01.1_01
 * ══════════════════════════════
 * Zentraler REST-API-Server für das DkZ-Ökosystem.
 * 
 * Features:
 * - 18+ REST Endpoints (versioniert /api/v1/...)
 * - WebSocket für Echtzeit-Events
 * - Rate Limiting & Security Headers
 * - Swagger/OpenAPI Dokumentation
 * - Multi-Model AI Chat (Mistral, OpenRouter)
 * - File System Zugriff
 * - Health Monitoring aller Backends
 * - Modul-Registry & Auto-Discovery
 * 
 * Port: 3040 (Standard)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';

import { chatRoutes } from './routes/chat.js';
import { fileRoutes } from './routes/files.js';
import { healthRoutes } from './routes/health.js';
import { moduleRoutes } from './routes/modules.js';
import { mcpRoutes } from './routes/mcp.js';
import { seoRoutes } from './routes/seo.js';
import { syncRoutes } from './routes/sync.js';
import { toolRoutes } from './routes/tools.js';
import { authMiddleware } from './middleware/auth.js';
import { requestLogger } from './middleware/logger.js';

dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.DKZ_API_PORT || 3040;
const VERSION = 'v1.01.1_01';

// ═══ MIDDLEWARE ═══
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Auth-Token']
}));

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Rate Limiter
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 Minute
    max: 120,
    message: { error: 'Rate limit exceeded. Max 120 requests/minute.', code: 429 },
    standardHeaders: true
});
app.use('/api/', limiter);

// ═══ API INFO ═══
app.get('/', (req, res) => {
    res.json({
        name: 'DkZ API Gateway',
        version: VERSION,
        status: 'online',
        timestamp: new Date().toISOString(),
        endpoints: {
            chat: '/api/v1/chat',
            files: '/api/v1/files/*',
            health: '/api/v1/health',
            modules: '/api/v1/modules',
            mcp: '/api/v1/mcp/*',
            seo: '/api/v1/seo/*',
            sync: '/api/v1/sync',
            tools: '/api/v1/tools',
            ecosystem: '/api/v1/ecosystem',
            registry: '/api/v1/registry',
            metrics: '/api/v1/metrics',
            docs: '/api/v1/docs'
        },
        docs: `http://localhost:${port}/api/v1/docs`
    });
});

// ═══ LEGACY ENDPOINTS (backward compat) ═══
// Keep old /api/sync etc. working
app.post('/api/sync', (req, res, next) => { req.url = '/api/v1/sync'; next(); });
app.post('/api/chat', (req, res, next) => { req.url = '/api/v1/chat'; next(); });
app.post('/api/analyze', (req, res, next) => { req.url = '/api/v1/seo/analyze'; next(); });
app.post('/api/summarize', (req, res, next) => { req.url = '/api/v1/summarize'; next(); });
app.post('/api/convert', (req, res, next) => { req.url = '/api/v1/codegen'; next(); });

// ═══ V1 ROUTES ═══
app.use('/api/v1', chatRoutes);
app.use('/api/v1', fileRoutes);
app.use('/api/v1', healthRoutes);
app.use('/api/v1', moduleRoutes);
app.use('/api/v1', mcpRoutes);
app.use('/api/v1', seoRoutes);
app.use('/api/v1', syncRoutes);
app.use('/api/v1', toolRoutes);

// ═══ ECOSYSTEM INFO ═══
app.get('/api/v1/ecosystem', (req, res) => {
    res.json({
        name: 'DkZ Ökosystem',
        version: VERSION,
        codename: 'NEW EUROP ORDER',
        moduleCount: 12,
        backendCount: 6,
        backendsOnline: 0, // Will be filled by health checker
        mcpToolCount: 24,
        apiEndpointCount: 18,
        frontendCount: 7,
        lastActivity: new Date().toISOString(),
        architecture: '5-Layer (Frontend → Orchestration → Storage → Infra → Governance)',
        compliance: ['EU AI Act', 'DSGVO', 'ISO 27001'],
        stack: {
            runtime: 'Node.js',
            framework: 'Express',
            database: 'PostgreSQL (planned)',
            analytics: 'DuckDB-Wasm',
            search: 'FAISS / Meilisearch (planned)',
            auth: 'SimpleWebAuthn / Passkeys (planned)',
            ai: 'Mistral / OpenRouter / Ollama',
            monitoring: 'Built-in Health Monitor'
        }
    });
});

// ═══ REGISTRY ═══
app.get('/api/v1/registry', async (req, res) => {
    try {
        const { readFile } = await import('fs/promises');
        const registryPath = new URL('../nexuz/core/registry.json', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
        const data = await readFile(registryPath, 'utf-8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Registry nicht gefunden', details: err.message });
    }
});

// ═══ METRICS ═══
app.get('/api/v1/metrics', (req, res) => {
    const mem = process.memoryUsage();
    const uptime = process.uptime();
    res.json({
        cpu: Math.round(Math.random() * 30 + 5), // placeholder until real monitoring
        ram: {
            used: Math.round(mem.heapUsed / 1024 / 1024),
            total: Math.round(mem.heapTotal / 1024 / 1024),
            percent: Math.round((mem.heapUsed / mem.heapTotal) * 100)
        },
        disk: {
            used: 45,
            total: 256
        },
        requests: globalThis.__dkzRequestCount || { total: 0, errors: 0 },
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        nodeVersion: process.version,
        platform: process.platform
    });
});

// ═══ API DOCS ═══
app.get('/api/v1/docs', (req, res) => {
    res.json({
        openapi: '3.0.3',
        info: {
            title: 'DkZ API Gateway',
            version: VERSION,
            description: 'Vollständige REST-API für das DkZ-Ökosystem'
        },
        servers: [{ url: `http://localhost:${port}`, description: 'Local Dev' }],
        paths: {
            '/api/v1/chat': {
                post: { summary: 'AI Chat', tags: ['Chat'], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, model: { type: 'string' } } } } } } }
            },
            '/api/v1/summarize': {
                post: { summary: 'Text zusammenfassen', tags: ['Chat'] }
            },
            '/api/v1/translate': {
                post: { summary: 'Text übersetzen', tags: ['Chat'] }
            },
            '/api/v1/codegen': {
                post: { summary: 'Code generieren', tags: ['Chat'] }
            },
            '/api/v1/files/list': {
                post: { summary: 'Dateien auflisten', tags: ['Files'] }
            },
            '/api/v1/files/read': {
                post: { summary: 'Datei lesen', tags: ['Files'] }
            },
            '/api/v1/files/write': {
                post: { summary: 'Datei schreiben', tags: ['Files'] }
            },
            '/api/v1/files/search': {
                post: { summary: 'Dateien suchen', tags: ['Files'] }
            },
            '/api/v1/files/move': {
                post: { summary: 'Datei verschieben', tags: ['Files'] }
            },
            '/api/v1/health': {
                get: { summary: 'System Health Check', tags: ['Health'] }
            },
            '/api/v1/health/incidents': {
                get: { summary: 'Incident Log', tags: ['Health'] }
            },
            '/api/v1/modules': {
                get: { summary: 'Module auflisten', tags: ['Modules'] }
            },
            '/api/v1/seo/analyze': {
                post: { summary: 'SEO Analyse', tags: ['SEO'] }
            },
            '/api/v1/seo/keywords': {
                post: { summary: 'Keyword Recherche', tags: ['SEO'] }
            },
            '/api/v1/sync': {
                post: { summary: 'Git Sync', tags: ['System'] }
            },
            '/api/v1/ecosystem': {
                get: { summary: 'Ökosystem Info', tags: ['System'] }
            },
            '/api/v1/metrics': {
                get: { summary: 'System Metriken', tags: ['System'] }
            }
        }
    });
});

// ═══ 404 HANDLER ═══
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint nicht gefunden',
        path: req.path,
        hint: `Verfügbare Endpoints: GET / für die API-Übersicht`
    });
});

// ═══ ERROR HANDLER ═══
app.use((err, req, res, next) => {
    console.error('[DKZ API] Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// ═══ HTTP + WEBSOCKET SERVER ═══
const httpServer = createServer(app);

const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (ws) => {
    console.log('[DKZ WS] Client connected');
    ws.send(JSON.stringify({
        type: 'connected',
        message: 'DkZ WebSocket verbunden',
        version: VERSION,
        timestamp: new Date().toISOString()
    }));

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            // Broadcast to all clients
            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify({
                        type: 'broadcast',
                        from: 'api-gateway',
                        data: msg,
                        timestamp: new Date().toISOString()
                    }));
                }
            });
        } catch (e) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
        }
    });

    ws.on('close', () => console.log('[DKZ WS] Client disconnected'));
});

// Global broadcast function
globalThis.__dkzBroadcast = (type, data) => {
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify({ type, data, timestamp: new Date().toISOString() }));
        }
    });
};

// ═══ START ═══
httpServer.listen(port, () => {
    console.log(`\n⚡ DkZ API Gateway ${VERSION}`);
    console.log(`═══════════════════════════════`);
    console.log(`🌐 REST API:    http://localhost:${port}`);
    console.log(`🔌 WebSocket:   ws://localhost:${port}/ws`);
    console.log(`📋 API Docs:    http://localhost:${port}/api/v1/docs`);
    console.log(`💚 Health:      http://localhost:${port}/api/v1/health`);
    console.log(`═══════════════════════════════\n`);
});
