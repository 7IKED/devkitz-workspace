// Test Script for Antigravity to Copilot Bridge
const http = require('http');

const payload = JSON.stringify({
    model: "gpt-oss:20b",
    messages: [
        { role: "system", content: "You are a bridge testing assistant. Be extremely brief." },
        { role: "user", content: "Ping! Bist du online?" }
    ],
    stream: false,
    agent: "Antigravity",
    timestamp: Date.now()
});

const options = {
    hostname: '127.0.0.1',
    port: 3044, // Bridge Port
    path: '/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log("\x1b[32m[OK]\x1b[0m Bridge Test erfolgreich! Antwort:", data);
        } else {
            console.error("\x1b[31m[ERROR]\x1b[0m Bridge antwortete mit Status:", res.statusCode, data);
        }
    });
});

req.on('error', (e) => {
    console.error(`\x1b[31m[ERROR]\x1b[0m Konnte Bridge auf Port 3044 nicht erreichen: ${e.message}`);
    console.log("Stelle sicher, dass 'start-alle-services.ps1' läuft!");
});

req.write(payload);
req.end();
