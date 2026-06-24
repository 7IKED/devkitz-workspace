import { Router } from 'express';
import { createHash } from 'crypto';
import { readFile, writeFile, appendFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

const router = Router();

const DEEPKEEP_DIR = 'C:/DEVKiTZ/[DEEPKEEP]';
const DATA_DIR = join(DEEPKEEP_DIR, 'data');
const INDEX_FILE = join(DEEPKEEP_DIR, 'index.json');
const EVENT_LOG = join(DEEPKEEP_DIR, 'event.log');

let index = {};

async function ensureStorage() {
    if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
    try {
        const data = await readFile(INDEX_FILE, 'utf-8');
        index = JSON.parse(data);
    } catch {
        index = {};
        await writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
    }
}

async function logEvent(type, data) {
    const entry = JSON.stringify({ type, ...data, timestamp: new Date().toISOString() });
    await appendFile(EVENT_LOG, entry + '\n', 'utf-8');
}

router.post('/deepkeep/store', async (req, res) => {
    try {
        const { content, filename = 'unnamed' } = req.body;
        if (!content) return res.status(400).json({ error: 'content is required' });

        const contentStr = typeof content === 'object' ? JSON.stringify(content) : String(content);
        const hash = createHash('sha256').update(contentStr, 'utf-8').digest('hex');

        if (index[hash]) {
            return res.json({
                id: hash, filename: index[hash].filename,
                size: index[hash].size, existing: true,
                timestamp: index[hash].timestamp
            });
        }

        const ext = extname(filename) || '.json';
        const dataFile = join(DATA_DIR, `${hash}${ext}`);
        const size = Buffer.byteLength(contentStr, 'utf-8');

        await writeFile(dataFile, contentStr, 'utf-8');
        index[hash] = { filename, size, ext, timestamp: new Date().toISOString() };
        await writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
        await logEvent('store', { hash, filename, size });

        res.json({ id: hash, filename, size, existing: false, timestamp: index[hash].timestamp });
    } catch (err) {
        res.status(500).json({ error: 'Store failed', details: err.message });
    }
});

router.get('/deepkeep/retrieve/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const entry = index[id];
        if (!entry) return res.status(404).json({ error: 'Entry not found', id });

        const dataFile = join(DATA_DIR, `${id}${entry.ext || '.json'}`);
        const content = await readFile(dataFile, 'utf-8');
        await logEvent('retrieve', { hash: id, filename: entry.filename });

        res.json({ id, filename: entry.filename, size: entry.size, content, timestamp: entry.timestamp });
    } catch (err) {
        res.status(500).json({ error: 'Retrieve failed', details: err.message });
    }
});

router.get('/deepkeep/list', (req, res) => {
    const entries = Object.entries(index).map(([hash, data]) => ({ id: hash, ...data }));
    res.json({ entries, total: entries.length });
});

ensureStorage().catch(console.error);

export { router as deepkeepRoutes };
