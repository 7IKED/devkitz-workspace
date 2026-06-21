const http = require('http');

/**
 * Nanobot Helper - Sends progress updates to the Nanochat Webhook.
 */
class Nanobot {
    constructor(agentName, port = 3050) {
        this.agentName = agentName;
        this.port = port;
    }

    notify(status, progress = null) {
        const payload = JSON.stringify({
            agent: this.agentName,
            status: status,
            progress: progress
        });

        const options = {
            hostname: '127.0.0.1',
            port: this.port,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload.length
            }
        };

        const req = http.request(options, (res) => {
            // Ignore response to keep it quiet
        });

        req.on('error', (error) => {
            // Silent fail if nanochat is not running
        });

        req.write(payload);
        req.end();
    }
}

module.exports = Nanobot;
