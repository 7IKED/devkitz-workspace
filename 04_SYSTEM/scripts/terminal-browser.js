#!/usr/bin/env node
const https = require('https');
const http = require('http');
const url = require('url');

const args = process.argv.slice(2);
const targetUrl = args[0];

if (!targetUrl) {
    console.error("\x1b[31m[TerminalBrowser]\x1b[0m Usage: node terminal-browser.js <url>");
    process.exit(1);
}

const parsedUrl = url.parse(targetUrl);
const client = parsedUrl.protocol === 'https:' ? https : http;

client.get(targetUrl, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        // Very basic strip HTML tags to give text content
        const text = data.replace(/<[^>]+>/g, ' ')
                         .replace(/\s+/g, ' ')
                         .trim();
        console.log(`\x1b[36m[TerminalBrowser]\x1b[0m Fetched content from ${targetUrl}:`);
        console.log(text.substring(0, 1000) + (text.length > 1000 ? '...' : ''));
        
        // Notify nanobot
        const payload = JSON.stringify({
            agent: 'TerminalBrowser',
            status: `Scraped ${targetUrl}`,
            progress: 100
        });
        const req = http.request({
            hostname: 'localhost',
            port: process.env.NANOCHAT_PORT || 3050,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        });
        req.on('error', () => {});
        req.write(payload);
        req.end();
    });
}).on('error', (err) => {
    console.error(`\x1b[31m[TerminalBrowser]\x1b[0m Error fetching URL: ${err.message}`);
});
