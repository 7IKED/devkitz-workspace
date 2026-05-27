/**
 * ⚡ DKZ MODULE SCANNER v2.0
 * ═══════════════════════════
 * Scannt ALLE Dashboard-Verzeichnisse nach module.json.
 * Liefert die einheitliche Modul-Registry für:
 * - API Gateway /api/v1/modules
 * - Hub Dashboard Auto-Discovery
 * - MCP Server dkz_list_modules
 * 
 * Scanreihenfolge:
 * 1. Direkte Kinder von DASHBOARD_ROOT (action-deck/, auth-center/, etc.)
 * 2. modules/ Unterverzeichnisse (ai_chat/, analyser/, etc.) 
 * 3. Bekannte Module ohne module.json (Fallback)
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';
import { existsSync } from 'fs';

const DASHBOARD_ROOT = process.env.DKZ_DASHBOARD_ROOT || 'C:/DEVKiTZ/01_PROJECTS/01_dashboard';

// Directories to skip during scan
const SKIP_DIRS = new Set([
    'node_modules', '.git', '.vscode', '.idea', 'dist', 'build',
    'api-gateway', 'mcp-server', 'nexuz'  // these are infrastructure, not modules
]);

/**
 * Full recursive module scan
 * @returns {Promise<Array>} Array of module objects
 */
export async function scanAllModules() {
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
                    _path: relative(DASHBOARD_ROOT, dir).replace(/\\/g, '/'),
                    _source: 'discovery',
                    _scannedAt: new Date().toISOString()
                });
            }
        }
    } catch { /* root scan failed */ }

    // ── Pass 2: modules/ subdirectories ──
    const modulesDir = join(DASHBOARD_ROOT, 'modules');
    try {
        const entries = await readdir(modulesDir, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            const dir = join(modulesDir, entry.name);
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

    // ── Pass 3: Hardcoded known modules (fallback) ──
    const knownModules = [
        { name: 'dkz-nexuz', displayName: 'NEXUZ² Command Center', version: 'v2.02.0_01', status: 'active', category: 'D-System', icon: '⚡', color: '#fa1e4e', description: 'Zentrales Nervensystem: 6 Backends, 7 Frontends, MCP', entry: 'index.html', _path: 'nexuz' },
        { name: 'dkz-mcp-server', displayName: 'MCP Server', version: 'v1.01.1_01', status: 'active', category: 'D-System', icon: '🔌', color: '#00e5ff', description: 'Model Context Protocol Server — 22 Tools für AI-Clients', entry: null, _path: 'mcp-server' },
        { name: 'dkz-api-gateway', displayName: 'API Gateway', version: 'v1.01.1_01', status: 'active', category: 'D-System', icon: '🌐', color: '#22C55E', description: 'REST API + WebSocket Server auf Port 3040', entry: null, _path: 'api-gateway' }
    ];

    for (const km of knownModules) {
        if (!seen.has(km.name)) {
            seen.add(km.name);
            modules.push({ ...km, _source: 'fallback', _scannedAt: new Date().toISOString() });
        }
    }

    return modules;
}

/**
 * Try to read module.json from a directory
 */
async function tryReadManifest(dir) {
    const manifestPath = join(dir, 'module.json');
    if (!existsSync(manifestPath)) return null;
    try {
        const raw = await readFile(manifestPath, 'utf-8');
        const data = JSON.parse(raw);
        // Validate minimum fields
        if (!data.name || !data.displayName) return null;
        return data;
    } catch {
        return null;
    }
}

/**
 * Get module by name
 */
export async function getModuleByName(name) {
    const all = await scanAllModules();
    return all.find(m => m.name === name) || null;
}

/**
 * Get module stats
 */
export async function getModuleStats() {
    const all = await scanAllModules();
    return {
        total: all.length,
        active: all.filter(m => m.status === 'active').length,
        dev: all.filter(m => m.status === 'dev').length,
        planned: all.filter(m => m.status === 'planned').length,
        categories: [...new Set(all.map(m => m.category))],
        sources: {
            discovery: all.filter(m => m._source === 'discovery').length,
            fallback: all.filter(m => m._source === 'fallback').length
        }
    };
}

export default { scanAllModules, getModuleByName, getModuleStats };
