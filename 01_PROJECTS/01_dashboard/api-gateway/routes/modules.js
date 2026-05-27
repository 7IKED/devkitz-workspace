/**
 * ⚡ DKZ API — Module Routes v2.0
 * ════════════════════════════════
 * Module auflisten, Details, registrieren, Auto-Discovery
 * 
 * Nutzt den NEXUZ² Core Scanner für 3-Pass-Discovery:
 * 1. Dashboard-Root Verzeichnisse (module.json)
 * 2. modules/ Unterverzeichnisse
 * 3. Bekannte Infrastruktur-Module (Fallback)
 */

import { Router } from 'express';
import { readdir, readFile, writeFile, mkdir, stat } from 'fs/promises';
import { join, resolve, relative } from 'path';
import { existsSync } from 'fs';

const router = Router();
const DASHBOARD_ROOT = process.env.DKZ_DASHBOARD_ROOT || resolve('C:/DEVKiTZ/01_PROJECTS/01_dashboard');
const MODULES_DIR = join(DASHBOARD_ROOT, 'modules');

// Directories to skip during scan
const SKIP_DIRS = new Set([
    'node_modules', '.git', '.vscode', '.idea', 'dist', 'build',
    'api-gateway', 'mcp-server'  // infrastructure, not user modules
]);

// Module cache (refreshed every scan)
let moduleCache = { modules: [], lastScan: null, scanDuration: 0 };

// ═══ SCANNER v2.0 ═══
async function scanAllModules(forceRefresh = false) {
    // Return cache if fresh (< 10s old)
    if (!forceRefresh && moduleCache.lastScan &&
        (Date.now() - new Date(moduleCache.lastScan).getTime()) < 10000) {
        return moduleCache.modules;
    }

    const startTime = performance.now();
    const modules = [];
    const seen = new Set();

    // ── Pass 1: Top-level dashboard directories ──
    try {
        const entries = await readdir(DASHBOARD_ROOT, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;
            const dir = join(DASHBOARD_ROOT, entry.name);
            const manifest = await tryReadManifest(dir);
            if (manifest && !seen.has(manifest.name)) {
                seen.add(manifest.name);
                modules.push({
                    ...manifest,
                    _path: entry.name,
                    _source: 'discovery',
                    _scannedAt: new Date().toISOString()
                });
            }
        }
    } catch { /* root scan failed */ }

    // ── Pass 2: modules/ subdirectories ──
    try {
        const entries = await readdir(MODULES_DIR, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            const dir = join(MODULES_DIR, entry.name);
            const manifest = await tryReadManifest(dir);
            if (manifest && !seen.has(manifest.name)) {
                seen.add(manifest.name);
                modules.push({
                    ...manifest,
                    _path: `modules/${entry.name}`,
                    _source: 'discovery',
                    _scannedAt: new Date().toISOString()
                });
            }
        }
    } catch { /* modules dir failed */ }

    // ── Pass 3: Infrastructure modules (always present) ──
    const infraModules = [
        { name: 'dkz-nexuz', displayName: 'NEXUZ² Command Center', version: 'v2.02.0_01', status: 'active', category: 'D-System', icon: '⚡', color: '#fa1e4e', description: 'Zentrales Nervensystem: 6 Backends, 7 Frontends, MCP', _path: 'nexuz' },
        { name: 'dkz-mcp-server', displayName: 'MCP Server', version: 'v1.01.1_01', status: 'active', category: 'D-System', icon: '🔌', color: '#00e5ff', description: 'Model Context Protocol — 22 Tools für AI-Clients', _path: 'mcp-server' },
        { name: 'dkz-api-gateway', displayName: 'API Gateway', version: 'v1.01.1_01', status: 'active', category: 'D-System', icon: '🌐', color: '#22C55E', description: 'REST API + WebSocket auf Port 3040', _path: 'api-gateway' }
    ];
    for (const im of infraModules) {
        if (!seen.has(im.name)) {
            seen.add(im.name);
            modules.push({ ...im, _source: 'infrastructure', _scannedAt: new Date().toISOString() });
        }
    }

    // Update cache
    moduleCache = {
        modules,
        lastScan: new Date().toISOString(),
        scanDuration: Math.round(performance.now() - startTime)
    };

    // Broadcast to WebSocket clients
    if (globalThis.__dkzBroadcast) {
        globalThis.__dkzBroadcast('modules:scanned', {
            count: modules.length,
            active: modules.filter(m => m.status === 'active').length,
            duration: moduleCache.scanDuration
        });
    }

    return modules;
}

async function tryReadManifest(dir) {
    const manifestPath = join(dir, 'module.json');
    if (!existsSync(manifestPath)) return null;
    try {
        const raw = await readFile(manifestPath, 'utf-8');
        const data = JSON.parse(raw);
        if (!data.name || !data.displayName) return null;
        return data;
    } catch { return null; }
}

// ─── GET /modules ───
router.get('/modules', async (req, res) => {
    try {
        let modules = await scanAllModules();
        const { status, category, search } = req.query;

        if (status) modules = modules.filter(m => m.status === status);
        if (category) modules = modules.filter(m => m.category === category);
        if (search) {
            const q = search.toLowerCase();
            modules = modules.filter(m =>
                m.displayName.toLowerCase().includes(q) ||
                m.description?.toLowerCase().includes(q) ||
                m.tags?.some(t => t.toLowerCase().includes(q))
            );
        }

        res.json({
            modules,
            count: modules.length,
            scan: { lastScan: moduleCache.lastScan, duration: moduleCache.scanDuration }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /modules/:id ───
router.get('/modules/:id', async (req, res) => {
    try {
        const modules = await scanAllModules();
        const mod = modules.find(m => m.name === req.params.id);
        if (!mod) {
            return res.status(404).json({ error: `Modul "${req.params.id}" nicht gefunden` });
        }
        res.json({ module: mod });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /modules/register ───
router.post('/modules/register', async (req, res) => {
    try {
        const { name, displayName, description, icon, category, entry } = req.body;
        if (!name || !displayName) {
            return res.status(400).json({ error: 'name und displayName erforderlich' });
        }

        const modulePath = join(MODULES_DIR, name);
        await mkdir(modulePath, { recursive: true });

        const manifest = {
            name,
            displayName,
            version: 'v1.01.1_01',
            description: description || '',
            author: 'DkZ devkitz',
            license: 'AGPL-3.0',
            category: category || 'D-System',
            tags: [`#${name.replace('dkz-', '')}`],
            entry: entry || 'index.html',
            icon: icon || '📦',
            color: '#fa1e4e',
            dependencies: [],
            permissions: [],
            ui: { panel: true, sidebar: false, toolbar: false, theme: 'inherit' },
            status: 'dev'
        };

        await writeFile(join(modulePath, 'module.json'), JSON.stringify(manifest, null, 4), 'utf-8');

        // Create basic index.html
        const html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${displayName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0f; color: #e0e0e0; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(250,30,78,0.2); border-radius: 16px; padding: 3rem; text-align: center; }
        h1 { font-size: 2rem; margin-bottom: 1rem; }
        .icon { font-size: 4rem; margin-bottom: 1.5rem; }
        .badge { background: rgba(250,30,78,0.15); color: #fa1e4e; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">${icon || '📦'}</div>
        <h1>${displayName}</h1>
        <p>${description || 'Neues DkZ-Modul'}</p>
        <br>
        <span class="badge">v1.01.1_01 · dev</span>
    </div>
</body>
</html>`;
        await writeFile(join(modulePath, 'index.html'), html, 'utf-8');

        res.json({
            success: true,
            moduleId: name,
            path: `modules/${name}`,
            manifest
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /modules/scan ───
// Force a rescan of all directories
router.post('/modules/scan', async (req, res) => {
    try {
        const modules = await scanAllModules(true); // force refresh
        res.json({
            success: true,
            count: modules.length,
            active: modules.filter(m => m.status === 'active').length,
            dev: modules.filter(m => m.status === 'dev').length,
            planned: modules.filter(m => m.status === 'planned').length,
            sources: {
                discovery: modules.filter(m => m._source === 'discovery').length,
                infrastructure: modules.filter(m => m._source === 'infrastructure').length,
                fallback: modules.filter(m => m._source === 'fallback').length
            },
            scan: {
                lastScan: moduleCache.lastScan,
                duration: moduleCache.scanDuration,
                root: DASHBOARD_ROOT
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /modules/stats ───
// Aggregate module statistics
router.get('/modules/stats', async (req, res) => {
    try {
        const modules = await scanAllModules();
        const categories = {};
        const statuses = { active: 0, dev: 0, planned: 0 };

        modules.forEach(m => {
            const cat = m.category || 'Uncategorized';
            categories[cat] = (categories[cat] || 0) + 1;
            if (statuses[m.status] !== undefined) statuses[m.status]++;
        });

        res.json({
            total: modules.length,
            statuses,
            categories,
            withManifest: modules.filter(m => m._source === 'discovery').length,
            withoutManifest: modules.filter(m => m._source !== 'discovery').length,
            tags: [...new Set(modules.flatMap(m => m.tags || []))],
            scan: {
                lastScan: moduleCache.lastScan,
                duration: moduleCache.scanDuration
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══ INITIAL SCAN ON LOAD ═══
scanAllModules(true).then(mods => {
    console.log(`[DKZ MODULES] Initial scan: ${mods.length} Module gefunden (${mods.filter(m => m.status === 'active').length} aktiv)`);
}).catch(() => { });

export { router as moduleRoutes };
