/**
 * DkZ Cost Sync Server v0.01.1_01
 * @DKZ:RULES → Siehe REGELWERK.md
 * 
 * Tiny local server that receives cost data from the browser
 * and auto-commits it to Git for persistent storage.
 * 
 * Usage: node cost-sync.js
 * Runs on http://localhost:9877
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 9877;
const DATA_DIR = path.join(__dirname, 'cost-data');
const LOG_FILE = path.join(DATA_DIR, 'cost-log.json');
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const server = http.createServer((req, res) => {
    // CORS headers for file:// protocol
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // POST /save — Save cost data + git commit
    if (req.method === 'POST' && req.url === '/save') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);

                // Write cost log
                fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2), 'utf8');

                // Write summary
                const summary = generateSummary(data);
                fs.writeFileSync(path.join(DATA_DIR, 'cost-summary.md'), summary, 'utf8');

                // Git commit
                const commitMsg = `data(cost): auto-sync ${new Date().toISOString().slice(0, 16)} — ${data.sessions?.length || 0} sessions`;
                try {
                    execSync(`git add "${path.relative(REPO_ROOT, DATA_DIR)}"`, { cwd: REPO_ROOT });
                    execSync(`git commit -m "${commitMsg}"`, { cwd: REPO_ROOT });
                    console.log(`✅ Committed: ${commitMsg}`);
                } catch (gitErr) {
                    // May fail if nothing changed — that's OK
                    console.log('ℹ️ Git: No changes to commit');
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, file: LOG_FILE, msg: commitMsg }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: e.message }));
            }
        });
        return;
    }

    // GET /load — Load saved cost data
    if (req.method === 'GET' && req.url === '/load') {
        try {
            if (fs.existsSync(LOG_FILE)) {
                const data = fs.readFileSync(LOG_FILE, 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('[]');
            }
        } catch (e) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    // GET /status — Health check
    if (req.method === 'GET' && req.url === '/status') {
        const hasData = fs.existsSync(LOG_FILE);
        let gitStatus = 'unknown';
        try {
            gitStatus = execSync('git log --oneline -1', { cwd: REPO_ROOT }).toString().trim();
        } catch (e) { }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, hasData, lastCommit: gitStatus, port: PORT }));
        return;
    }

    // GET /history — Git log of cost commits
    if (req.method === 'GET' && req.url === '/history') {
        try {
            const log = execSync('git log --oneline -20 --grep="data(cost)"', { cwd: REPO_ROOT }).toString().trim();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ commits: log.split('\n').filter(Boolean) }));
        } catch (e) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ commits: [] }));
        }
        return;
    }

    // POST /save-events — Save event log + git commit
    if (req.method === 'POST' && req.url === '/save-events') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const evtFile = path.join(DATA_DIR, 'event-log.json');
                fs.writeFileSync(evtFile, JSON.stringify(data.entries || data, null, 2), 'utf8');
                const count = (data.entries || data).length;
                const commitMsg = `data(events): auto-sync ${new Date().toISOString().slice(0, 16)} — ${count} events`;
                try {
                    execSync(`git add "${path.relative(REPO_ROOT, DATA_DIR)}"`, { cwd: REPO_ROOT });
                    execSync(`git commit -m "${commitMsg}"`, { cwd: REPO_ROOT });
                    console.log(`✅ Events committed: ${count} entries`);
                } catch (e) { console.log('ℹ️ Git: No event changes'); }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, count }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: e.message }));
            }
        });
        return;
    }

    // GET /load-events — Load saved events
    if (req.method === 'GET' && req.url === '/load-events') {
        const evtFile = path.join(DATA_DIR, 'event-log.json');
        try {
            if (fs.existsSync(evtFile)) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(fs.readFileSync(evtFile, 'utf8'));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('[]');
            }
        } catch (e) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

function generateSummary(data) {
    const sessions = data.sessions || data;
    let totalCost = 0, totalTokens = 0, totalEntries = 0;
    const modelMap = {};
    const tagMap = {};

    for (const s of sessions) {
        for (const e of (s.entries || [])) {
            totalCost += e.totalCost || 0;
            totalTokens += (e.tokensIn || 0) + (e.tokensOut || 0);
            totalEntries++;
            modelMap[e.model] = (modelMap[e.model] || 0) + (e.totalCost || 0);
            for (const t of (e.tags || [])) {
                tagMap[t] = (tagMap[t] || 0) + (e.totalCost || 0);
            }
        }
    }

    return `# DkZ Cost Summary\n` +
        `> Auto-generated ${new Date().toISOString()}\n\n` +
        `| Metrik | Wert |\n|:---|:---|\n` +
        `| Sessions | ${sessions.length} |\n` +
        `| Einträge | ${totalEntries} |\n` +
        `| Gesamtkosten | €${totalCost.toFixed(4)} |\n` +
        `| Total Tokens | ${totalTokens.toLocaleString()} |\n\n` +
        `## Kosten pro Model\n` +
        Object.entries(modelMap).sort((a, b) => b[1] - a[1])
            .map(([m, c]) => `- **${m}**: €${c.toFixed(4)}`).join('\n') +
        `\n\n## Kosten pro Tag\n` +
        Object.entries(tagMap).sort((a, b) => b[1] - a[1])
            .map(([t, c]) => `- ${t}: €${c.toFixed(4)}`).join('\n');
}

server.listen(PORT, () => {
    console.log(`\n⚡ DkZ Cost Sync Server`);
    console.log(`  Port: ${PORT}`);
    console.log(`  Data: ${DATA_DIR}`);
    console.log(`  Repo: ${REPO_ROOT}`);
    console.log(`  Endpoints:`);
    console.log(`    POST /save   — Save + Git commit`);
    console.log(`    GET  /load   — Load saved data`);
    console.log(`    GET  /status — Health check`);
    console.log(`    GET  /history — Git commit history\n`);
});
