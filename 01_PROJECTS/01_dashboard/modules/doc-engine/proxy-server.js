// ============================================================
// DEVKiTZ DocEngine — Node.js CORS Proxy Server
// Fallback engine for scraping when CORS blocks direct fetch
// ============================================================

const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const app = express();
const PORT = 3847;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({
        service: 'DEVKiTZ DocEngine Proxy',
        status: 'online',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Proxy endpoint
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing ?url= parameter' });
    }

    try {
        const parsedUrl = new URL(targetUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
            },
            timeout: 15000,
        };

        const proxyReq = client.request(options, (proxyRes) => {
            let data = '';
            proxyRes.setEncoding('utf8');

            // Handle redirects
            if ([301, 302, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
                return res.redirect(`/proxy?url=${encodeURIComponent(proxyRes.headers.location)}`);
            }

            proxyRes.on('data', chunk => { data += chunk; });
            proxyRes.on('end', () => {
                res.set('Content-Type', proxyRes.headers['content-type'] || 'text/html');
                res.set('X-Proxy-Source', targetUrl);
                res.set('X-Proxy-Status', proxyRes.statusCode.toString());
                res.send(data);
            });
        });

        proxyReq.on('error', (err) => {
            res.status(502).json({
                error: 'Proxy request failed',
                message: err.message,
                url: targetUrl
            });
        });

        proxyReq.on('timeout', () => {
            proxyReq.destroy();
            res.status(504).json({
                error: 'Proxy request timed out',
                url: targetUrl
            });
        });

        proxyReq.end();

    } catch (err) {
        res.status(400).json({
            error: 'Invalid URL',
            message: err.message,
            url: targetUrl
        });
    }
});

app.listen(PORT, () => {
    console.log(`\n  ┌──────────────────────────────────────────┐`);
    console.log(`  │  🔧 DEVKiTZ DocEngine Proxy Server      │`);
    console.log(`  │  → http://localhost:${PORT}               │`);
    console.log(`  │  → Proxy: /proxy?url=<target>             │`);
    console.log(`  └──────────────────────────────────────────┘\n`);
});
