const http = require('http');

async function validateStartup() {
    console.log('[Startup Validation] Checking Environment Variables...');
    
    const requiredKeys = ['MISTRAL_API_KEY', 'OPENROUTER_API_KEY', 'NEXUZ_VPS_URL', 'NEXUZ_VPS_TOKEN'];
    const missingKeys = requiredKeys.filter(key => !process.env[key]);
    
    if (missingKeys.length > 0) {
        console.warn(`[Startup Validation] ⚠️ WARNING: Missing API Keys: ${missingKeys.join(', ')}`);
        console.warn('[Startup Validation] FiveSplitter router may degrade to 503 errors for these providers.');
    } else {
        console.log('[Startup Validation] ✅ All external API keys present.');
    }

    console.log('[Startup Validation] Checking local Ollama daemon on port 11434...');
    return new Promise((resolve) => {
        const req = http.get('http://127.0.0.1:11434', (res) => {
            if (res.statusCode === 200) {
                console.log('[Startup Validation] ✅ Local Ollama daemon is ONLINE.');
            } else {
                console.warn(`[Startup Validation] ⚠️ WARNING: Ollama returned status ${res.statusCode}.`);
            }
            resolve();
        }).on('error', (err) => {
            console.warn('[Startup Validation] ⚠️ WARNING: Local Ollama daemon is OFFLINE (Connection Refused). Local fallback will fail.');
            resolve();
        });
        req.setTimeout(2000, () => {
            console.warn('[Startup Validation] ⚠️ WARNING: Local Ollama daemon timed out.');
            req.abort();
            resolve();
        });
    });
}

module.exports = { validateStartup };
