/**
 * ⚡ DKZ API — File Routes
 * ══════════════════════════
 * Dateien lesen, schreiben, suchen, verschieben
 */

import { Router } from 'express';
import { readdir, readFile, writeFile, mkdir, rename, stat } from 'fs/promises';
import { join, resolve, extname, relative, basename } from 'path';
import { existsSync } from 'fs';

const router = Router();
const BASE_DIR = resolve('C:/DEVKiTZ');

// Security: Pfad darf nicht aus BASE_DIR raus
function safePath(userPath) {
    const resolved = resolve(BASE_DIR, userPath.replace(/^\/+/, ''));
    if (!resolved.startsWith(BASE_DIR)) {
        throw new Error('Pfad außerhalb von C:/DEVKiTZ nicht erlaubt');
    }
    return resolved;
}

// ─── POST /files/list ───
router.post('/files/list', async (req, res) => {
    try {
        const { path: userPath = '/', recursive = false, filter } = req.body;
        const dirPath = safePath(userPath);

        if (!existsSync(dirPath)) {
            return res.status(404).json({ error: `Pfad nicht gefunden: ${userPath}` });
        }

        const entries = await readdir(dirPath, { withFileTypes: true });
        let files = [];

        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

            const fullPath = join(dirPath, entry.name);
            const relPath = relative(BASE_DIR, fullPath).replace(/\\/g, '/');

            if (filter && entry.isFile()) {
                const glob = filter.replace('*', '');
                if (!entry.name.endsWith(glob)) continue;
            }

            try {
                const stats = await stat(fullPath);
                files.push({
                    name: entry.name,
                    path: '/' + relPath,
                    isDirectory: entry.isDirectory(),
                    size: entry.isFile() ? stats.size : null,
                    modified: stats.mtime.toISOString(),
                    extension: entry.isFile() ? extname(entry.name) : null
                });
            } catch {
                files.push({
                    name: entry.name,
                    path: '/' + relPath,
                    isDirectory: entry.isDirectory(),
                    size: null,
                    modified: null,
                    extension: entry.isFile() ? extname(entry.name) : null
                });
            }
        }

        // Sort: directories first, then alphabetical
        files.sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        res.json({ files, path: userPath, count: files.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /files/read ───
router.post('/files/read', async (req, res) => {
    try {
        const { path: userPath, encoding = 'utf-8' } = req.body;
        if (!userPath) return res.status(400).json({ error: 'path erforderlich' });

        const filePath = safePath(userPath);
        if (!existsSync(filePath)) {
            return res.status(404).json({ error: `Datei nicht gefunden: ${userPath}` });
        }

        const stats = await stat(filePath);
        if (stats.isDirectory()) {
            return res.status(400).json({ error: 'Pfad ist ein Verzeichnis, keine Datei' });
        }

        // Limit file size to 5MB
        if (stats.size > 5 * 1024 * 1024) {
            return res.status(413).json({ error: 'Datei zu groß (max 5MB)' });
        }

        const content = await readFile(filePath, encoding === 'base64' ? 'base64' : 'utf-8');
        res.json({
            content,
            path: userPath,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            encoding
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /files/write ───
router.post('/files/write', async (req, res) => {
    try {
        const { path: userPath, content, createDirs = true } = req.body;
        if (!userPath || content === undefined) {
            return res.status(400).json({ error: 'path und content erforderlich' });
        }

        const filePath = safePath(userPath);

        if (createDirs) {
            const dir = join(filePath, '..');
            await mkdir(dir, { recursive: true });
        }

        await writeFile(filePath, content, 'utf-8');
        const stats = await stat(filePath);

        // Broadcast event
        if (globalThis.__dkzBroadcast) {
            globalThis.__dkzBroadcast('file:written', { path: userPath, size: stats.size });
        }

        res.json({
            success: true,
            path: userPath,
            size: stats.size,
            modified: stats.mtime.toISOString()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /files/search ───
router.post('/files/search', async (req, res) => {
    try {
        const { query, searchIn = 'name', path: userPath = '/', extensions } = req.body;
        if (!query) return res.status(400).json({ error: 'query erforderlich' });

        const searchDir = safePath(userPath);
        const results = [];
        const maxResults = 50;

        async function searchRecursive(dir, depth = 0) {
            if (depth > 8 || results.length >= maxResults) return;

            try {
                const entries = await readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    if (results.length >= maxResults) break;
                    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

                    const fullPath = join(dir, entry.name);
                    const relPath = '/' + relative(BASE_DIR, fullPath).replace(/\\/g, '/');

                    if (entry.isDirectory()) {
                        await searchRecursive(fullPath, depth + 1);
                        continue;
                    }

                    // Extension filter
                    if (extensions && extensions.length > 0) {
                        const ext = extname(entry.name);
                        if (!extensions.includes(ext)) continue;
                    }

                    // Name search
                    if (searchIn === 'name' || searchIn === 'both') {
                        if (entry.name.toLowerCase().includes(query.toLowerCase())) {
                            results.push({ path: relPath, name: entry.name, matchType: 'name' });
                            continue;
                        }
                    }

                    // Content search (only for text files < 1MB)
                    if (searchIn === 'content' || searchIn === 'both') {
                        const textExts = ['.js', '.html', '.css', '.json', '.md', '.txt', '.py', '.ts', '.yaml', '.yml', '.xml'];
                        if (textExts.includes(extname(entry.name))) {
                            try {
                                const stats2 = await stat(fullPath);
                                if (stats2.size > 1024 * 1024) continue;
                                const fileContent = await readFile(fullPath, 'utf-8');
                                const lines = fileContent.split('\n');
                                for (let i = 0; i < lines.length; i++) {
                                    if (lines[i].toLowerCase().includes(query.toLowerCase())) {
                                        results.push({
                                            path: relPath,
                                            name: entry.name,
                                            matchType: 'content',
                                            line: i + 1,
                                            lineContent: lines[i].trim().substring(0, 200)
                                        });
                                        break; // One match per file
                                    }
                                }
                            } catch { /* skip unreadable files */ }
                        }
                    }
                }
            } catch { /* skip inaccessible dirs */ }
        }

        await searchRecursive(searchDir);
        res.json({ results, query, count: results.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /files/move ───
router.post('/files/move', async (req, res) => {
    try {
        const { source, destination, overwrite = false } = req.body;
        if (!source || !destination) {
            return res.status(400).json({ error: 'source und destination erforderlich' });
        }

        const srcPath = safePath(source);
        const dstPath = safePath(destination);

        if (!existsSync(srcPath)) {
            return res.status(404).json({ error: `Quelle nicht gefunden: ${source}` });
        }

        if (existsSync(dstPath) && !overwrite) {
            return res.status(409).json({ error: `Ziel existiert bereits: ${destination}. overwrite=true setzen.` });
        }

        // Create destination directory if needed
        await mkdir(join(dstPath, '..'), { recursive: true });
        await rename(srcPath, dstPath);

        res.json({ success: true, source, destination });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export { router as fileRoutes };
