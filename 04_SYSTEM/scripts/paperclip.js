#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const http = require('http');

const args = process.argv.slice(2);
const ipcDir = path.join(process.cwd(), '06_NOTEPAD', 'ipc');
const outputFile = path.join(ipcDir, 'paperclip.json');

if (args.length === 0) {
    console.error("\x1b[31m[Paperclip]\x1b[0m Usage: node paperclip.js <file1> <file2> ...");
    process.exit(1);
}

if (!fs.existsSync(ipcDir)) {
    fs.mkdirSync(ipcDir, { recursive: true });
}

let existingData = [];
if (fs.existsSync(outputFile)) {
    try {
        existingData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    } catch (e) {
        existingData = [];
    }
}

const newEntries = args.map(filePath => ({
    path: path.resolve(filePath),
    addedAt: new Date().toISOString()
}));

existingData = existingData.concat(newEntries);

fs.writeFileSync(outputFile, JSON.stringify(existingData, null, 2));
console.log(`\x1b[32m[Paperclip]\x1b[0m Added ${newEntries.length} files to context.`);

const notifyNanobot = () => {
    const payload = JSON.stringify({
        agent: 'Paperclip',
        status: `Attached ${newEntries.length} file(s)`,
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
};
notifyNanobot();
