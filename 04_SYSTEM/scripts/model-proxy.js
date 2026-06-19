const http = require('http');

const PROXY_PORT = 8080;
const OLLAMA_PORT = 11434;
const API_KEY = 'DKZ-VLLM-2026-SECURE';

const ts = () => new Date().toISOString().slice(11, 19);
const log = (m) => console.log(`[${ts()}] ${m}`);
const err = (m) => console.log(`[${ts()}] ❌ ${m}`);

// Mapping OpenCode Models to Ollama Models
const MODEL_MAPPING = {
    'gpt-oss-20b': 'qwen2.5:32b',
    'qwen3-6-35b': 'qwen3.5:27b',
    'deepseek-coder-v2-16b': 'qwen3:14b', // Fallback as Deepseek isn't in ollama
    'qwen2-5-coder-14b': 'qwen3:14b',
    'qwen-7b': 'qwen2.5-coder:7b'
};

function handleRequest(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

    // Status Endpoint for Bridge
    if (req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'ok', proxyType: 'ollama' }));
    }

    // Models List
    if (req.url === '/v1/models' && req.method === 'GET') {
        const list = Object.keys(MODEL_MAPPING).map(id => ({
            id, object: 'model', owned_by: 'DkZ', active: true
        }));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ object: 'list', data: list }));
    }

    // Auth
    const auth = req.headers['authorization'] || '';
    if (auth !== `Bearer ${API_KEY}`) {
        res.writeHead(401); return res.end(JSON.stringify({ error: 'unauthorized' }));
    }

    // Proxy body and rewrite model name
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
        let parsedBody = null;
        if (body) {
            try {
                parsedBody = JSON.parse(body);
                if (parsedBody.model && MODEL_MAPPING[parsedBody.model]) {
                    const oldModel = parsedBody.model;
                    parsedBody.model = MODEL_MAPPING[parsedBody.model];
                    log(`Translating request: ${oldModel} -> ${parsedBody.model}`);
                    body = JSON.stringify(parsedBody);
                }
            } catch (e) {
                err(`Failed to parse body: ${e.message}`);
            }
        }

        const opts = {
            hostname: '127.0.0.1', 
            port: OLLAMA_PORT,
            path: req.url, 
            method: req.method,
            headers: { ...req.headers, 'host': `127.0.0.1:${OLLAMA_PORT}` }
        };
        
        if (body) {
            opts.headers['content-length'] = Buffer.byteLength(body);
        }

        const pr = http.request(opts, br => {
            res.writeHead(br.statusCode, br.headers);
            br.pipe(res);
        });
        
        pr.on('error', e => { 
            err(`Ollama Error: ${e.message}`);
            res.writeHead(502); res.end(JSON.stringify({ error: 'ollama unavailable' })); 
        });
        
        if (body) pr.write(body);
        pr.end();
    });
}

const server = http.createServer(handleRequest);
server.listen(PROXY_PORT, '0.0.0.0', () => {
    log(`DkZ Ollama Proxy bereit auf Port ${PROXY_PORT}`);
    Object.entries(MODEL_MAPPING).forEach(([k, v]) => log(`  • ${k} → ${v}`));
});
