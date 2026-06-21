const http = require('http');

const PORT = process.env.NANOCHAT_PORT || 3050;

console.log(`\x1b[36m[Nanochat]\x1b[0m Starting on port ${PORT}...`);
console.log(`\x1b[90mWaiting for Nanobot Webhooks...\x1b[0m\n`);

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const agent = data.agent || 'Unknown Agent';
                const status = data.status || 'No status';
                const progress = data.progress ? ` [${data.progress}%]` : '';
                
                const time = new Date().toLocaleTimeString();
                
                console.log(`\x1b[90m[${time}]\x1b[0m \x1b[35m[${agent}]\x1b[0m${progress} \x1b[32m${status}\x1b[0m`);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                console.error(`\x1b[31m[Nanochat Error]\x1b[0m Invalid JSON payload received.`);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Nanochat Webhook Server Only Accepts POST.');
    }
});

server.listen(PORT, () => {
    console.log(`\x1b[36m[Nanochat]\x1b[0m Server listening. Ready to receive logs.\n`);
});
