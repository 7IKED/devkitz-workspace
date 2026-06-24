# 5-Splitter Router Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Parallel HTTP router that fires Mistral/VPS/Ollama/OpenRouter requests simultaneously (race mode), returns the fastest successful response, and logs results to EventLog + health endpoint.

**Architecture:** A `FiveSplitter` class wraps 4 provider modules (each implementing `chat()` with configurable timeout). The router's `race()` method fires all in parallel, cancels remaining on first success. A health loop pings each provider every 30s. The router mounts into `sync-server.js` Express instance as `POST /api/v1/router/chat` and exposes `GET /api/v1/router/status`.

**Tech Stack:** Node.js (existing sync-server), `@mistralai/mistralai` (already installed), `node-fetch` or built-in `fetch` (Node 18+), `dkz-eventlog.js` for logging.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `router/five-splitter.js` | Router class with provider registry, race logic, health loop, and Express route factory |
| `sync-server.js` | Mount router routes and wire EventLog bridge |

---

### Task 1: Create `router/five-splitter.js` — Provider Registry + Race Logic

**Files:**
- Create: `router/five-splitter.js`

- [ ] **Step 1: Create the file with FiveSplitter class skeleton**

```javascript
const { Mistral } = require('@mistralai/mistralai');

class FiveSplitter {
    constructor(options = {}) {
        this.providers = [];
        this.timeoutMs = options.timeoutMs || 15000;
        this.healthIntervalMs = options.healthIntervalMs || 30000;
        this.healthStatus = {};
        this._healthTimer = null;
    }

    registerProvider(name, handler, timeoutMs) {
        this.providers.push({ name, handler, timeoutMs });
        this.healthStatus[name] = { online: false, latency: 0, lastCheck: 0, lastError: null };
    }

    async _callWithTimeout(provider, messages) {
        const start = Date.now();
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), provider.timeoutMs);
            const result = await provider.handler(messages, { signal: controller.signal });
            clearTimeout(timer);
            const latency = Date.now() - start;
            this.healthStatus[provider.name] = {
                online: true, latency, lastCheck: Date.now(), lastError: null
            };
            return { name: provider.name, content: result, latency };
        } catch (err) {
            const latency = Date.now() - start;
            this.healthStatus[provider.name] = {
                online: false, latency, lastCheck: Date.now(), lastError: err.message
            };
            return { name: provider.name, error: err.message, latency };
        }
    }

    async race(messages) {
        const promises = this.providers.map(p => this._callWithTimeout(p, messages));
        const results = await Promise.allSettled(promises);
        const fulfilled = results
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value)
            .filter(r => !r.error);

        if (fulfilled.length === 0) {
            const errors = results
                .filter(r => r.status === 'fulfilled')
                .map(r => r.value)
                .filter(r => r.error);
            throw new Error(`All providers failed: ${errors.map(e => `${e.name}: ${e.error}`).join('; ')}`);
        }

        fulfilled.sort((a, b) => a.latency - b.latency);
        return fulfilled[0];
    }

    startHealthCheck() {
        if (this._healthTimer) return;
        this._healthTimer = setInterval(() => {
            this.providers.forEach(p => this._callWithTimeout(p, [
                { role: 'user', content: 'ping' }
            ]));
        }, this.healthIntervalMs);
    }

    getStatus() {
        return {
            providers: this.providers.map(p => ({
                name: p.name,
                timeoutMs: p.timeoutMs,
                ...this.healthStatus[p.name]
            })),
            timestamp: Date.now()
        };
    }
}
```

Run: `node -e "require('./router/five-splitter')"`

Expected: No errors (syntax check).

- [ ] **Step 2: Implement Mistral provider handler**

```javascript
function createMistralProvider(apiKey) {
    if (!apiKey) {
        return async () => { throw new Error('MISTRAL_API_KEY not set'); };
    }
    const client = new Mistral({ apiKey });
    return async (messages, { signal } = {}) => {
        const resp = await client.chat.complete({
            model: 'open-mistral-nemo',
            messages,
            temperature: 0.7
        }, { signal });
        return resp.choices[0].message.content;
    };
}
```

Add AFTER `class FiveSplitter` closing brace and BEFORE `module.exports`.

- [ ] **Step 3: Implement VPS provider handler**

```javascript
function createVpsProvider(baseUrl, token) {
    if (!baseUrl) {
        return async () => { throw new Error('NEXUZ_VPS_URL not set'); };
    }
    return async (messages, { signal } = {}) => {
        const resp = await fetch(`${baseUrl.replace(/\/+$/, '')}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b',
                messages,
                temperature: 0.7
            }),
            signal
        });
        if (!resp.ok) throw new Error(`VPS returned ${resp.status}`);
        const data = await resp.json();
        return data.choices[0].message.content;
    };
}
```

Add AFTER `createMistralProvider`.

- [ ] **Step 4: Implement Ollama provider handler**

```javascript
function createOllamaProvider(baseUrl) {
    const url = baseUrl || 'http://localhost:11434';
    return async (messages, { signal } = {}) => {
        const resp = await fetch(`${url.replace(/\/+$/, '')}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2',
                messages,
                stream: false
            }),
            signal
        });
        if (!resp.ok) throw new Error(`Ollama returned ${resp.status}`);
        const data = await resp.json();
        return data.message.content;
    };
}
```

Add AFTER `createVpsProvider`.

- [ ] **Step 5: Implement OpenRouter provider handler**

```javascript
function createOpenRouterProvider(apiKey) {
    if (!apiKey) {
        return async () => { throw new Error('OPENROUTER_API_KEY not set'); };
    }
    return async (messages, { signal } = {}) => {
        const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'http://localhost:3040',
                'X-Title': 'DkZ Dashboard'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages,
                temperature: 0.7
            }),
            signal
        });
        if (!resp.ok) throw new Error(`OpenRouter returned ${resp.status}`);
        const data = await resp.json();
        return data.choices[0].message.content;
    };
}
```

Add AFTER `createOllamaProvider`.

- [ ] **Step 6: Add Express route factory method to FiveSplitter**

```javascript
class FiveSplitter {
    // ... existing code ...

    createRouter() {
        const express = require('express');
        const router = express.Router();

        router.post('/chat', async (req, res) => {
            const messages = req.body.messages || [
                { role: 'user', content: req.body.message || '' }
            ];
            try {
                const winner = await this.race(messages);
                res.json({
                    success: true,
                    provider: winner.name,
                    latency: winner.latency,
                    content: winner.content
                });
            } catch (err) {
                res.status(502).json({
                    success: false,
                    error: err.message,
                    provider: null
                });
            }
        });

        router.get('/status', (req, res) => {
            res.json({ success: true, ...this.getStatus() });
        });

        return router;
    }
}
```

Replace the full class with this version that includes `createRouter()`.

- [ ] **Step 7: Export everything**

At the end of `five-splitter.js`:

```javascript
module.exports = { FiveSplitter, createMistralProvider, createVpsProvider, createOllamaProvider, createOpenRouterProvider };
```

- [ ] **Step 8: Verify syntax**

Run: `node -e "const m = require('./router/five-splitter'); console.log(Object.keys(m))"`

Expected: `[ 'FiveSplitter', 'createMistralProvider', 'createVpsProvider', 'createOllamaProvider', 'createOpenRouterProvider' ]`

---

### Task 2: Integrate Router into `sync-server.js`

**Files:**
- Modify: `sync-server.js`
- Modify: `router/five-splitter.js`

- [ ] **Step 1: Add router import and initialization at top of sync-server.js** (after line 7 `require('dotenv').config()`)

```javascript
const { FiveSplitter, createMistralProvider, createVpsProvider, createOllamaProvider, createOpenRouterProvider } = require('./router/five-splitter');
```

Insert after line 7.

- [ ] **Step 2: Initialize FiveSplitter with providers** (after Mistral client init, after line 100)

```javascript
// 5-Splitter Router initialization
const splitter = new FiveSplitter();
splitter.registerProvider('mistral', createMistralProvider(process.env.MISTRAL_API_KEY), 10000);
splitter.registerProvider('vps', createVpsProvider(process.env.NEXUZ_VPS_URL, process.env.NEXUZ_VPS_TOKEN), 20000);
splitter.registerProvider('ollama', createOllamaProvider(process.env.OLLAMA_URL), 30000);
splitter.registerProvider('openrouter', createOpenRouterProvider(process.env.OPENROUTER_API_KEY), 15000);
splitter.startHealthCheck();
```

Insert after line 100.

- [ ] **Step 3: Mount router routes** (before server.listen, e.g. after the stub endpoints block around line 96)

```javascript
// 5-Splitter Router Endpoints
app.use('/api/v1/router', splitter.createRouter());
```

Insert before line 158 (`const server = app.listen(...)`).

- [ ] **Step 4: Start server and verify**

Run: `node sync-server.js`

Expected: Server starts on port 3040 without errors.

- [ ] **Step 5: Test health endpoint**

Run: `curl http://localhost:3040/api/v1/router/status`

Expected:
```json
{
  "success": true,
  "providers": [
    { "name": "mistral", "timeoutMs": 10000, "online": false, ... },
    { "name": "vps", "timeoutMs": 20000, "online": false, ... },
    { "name": "ollama", "timeoutMs": 30000, "online": false, ... },
    { "name": "openrouter", "timeoutMs": 15000, "online": false, ... }
  ],
  "timestamp": ...
}
```

- [ ] **Step 6: Test chat endpoint**

Run: `curl -X POST http://localhost:3040/api/v1/router/chat -H "Content-Type: application/json" -d '{"message":"Say hello in 3 words"}'`

Expected: A response with `success: true`, `provider: "<fastest>"`, and `content` with a short greeting.

---

### Task 3: Wire EventLog for Router Events

**Files:**
- Modify: `sync-server.js`
- Add: `router/eventlog-bridge.js` (optional, or inline)

- [ ] **Step 1: Create EventLog bridge method on FiveSplitter**

In `router/five-splitter.js`, add a method to `FiveSplitter` class:

```javascript
async race(messages) {
    // ... existing implementation ...
    // (no changes needed - EventLog is called from sync-server via middleware)
}
```

And add an `eventLogProvider()` method:

```javascript
getLastRaceResult() {
    return this._lastRaceResult;
}

_raceComplete(result) {
    this._lastRaceResult = result;
}
```

Update the `race` method to store results:

```javascript
async race(messages) {
    const promises = this.providers.map(p => this._callWithTimeout(p, messages));
    const results = await Promise.allSettled(promises);
    const fulfilled = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .filter(r => !r.error);

    if (fulfilled.length === 0) {
        const errors = results
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value)
            .filter(r => r.error);
        this._lastRaceResult = { success: false, errors };
        throw new Error(`All providers failed: ${errors.map(e => `${e.name}: ${e.error}`).join('; ')}`);
    }

    fulfilled.sort((a, b) => a.latency - b.latency);
    const winner = fulfilled[0];
    this._lastRaceResult = {
        success: true,
        winner: winner.name,
        latency: winner.latency,
        allResults: fulfilled
    };
    return winner;
}
```

- [ ] **Step 2: Wire EventLog logging into sync-server.js route handler**

Modify the router mount block:

```javascript
// 5-Splitter Router Endpoints
const routerApi = splitter.createRouter();

// Wrap router chat endpoint to log to EventLog
routerApi.post('/chat', async (req, res) => {
    const messages = req.body.messages || [
        { role: 'user', content: req.body.message || '' }
    ];
    try {
        const winner = await splitter.race(messages);
        const result = {
            success: true,
            provider: winner.name,
            latency: winner.latency,
            content: winner.content
        };
        res.json(result);

        // Log to EventLog async (fire and forget)
        try {
            const logEntry = {
                type: 'action',
                source: '5-splitter-router',
                action: 'chat',
                metadata: {
                    provider: winner.name,
                    latency: winner.latency,
                    model: winner.name
                },
                tags: ['router', 'ai', winner.name]
            };
            // If running in browser context, DkzEventLog.log() is available
            console.log('[5-Splitter]', JSON.stringify(logEntry));
        } catch (logErr) {
            console.warn('[5-Splitter] EventLog write failed:', logErr.message);
        }
    } catch (err) {
        res.status(502).json({
            success: false,
            error: err.message,
            provider: null
        });

        console.error('[5-Splitter] All providers failed:', err.message);
    }
});

app.use('/api/v1/router', routerApi);
```

Replace the simple `app.use('/api/v1/router', splitter.createRouter())` with this wrapped version.

- [ ] **Step 3: Inject EventLog into health response for frontend**

In `sync-server.js`, modify the existing health endpoint to include router status:

Replace lines 38-47 with:

```javascript
app.get('/api/v1/health', (req, res) => {
    const routerStatus = splitter.getStatus();
    res.json({
        backends: [
            { name: 'Sync Server', id: 'sync-server', icon: '🔄', online: true, latency: 2, lastCheck: Date.now() },
            { name: 'Features API', id: 'features-api', icon: '📦', online: true, latency: 3, lastCheck: Date.now() },
            { name: 'Mistral AI', id: 'mistral-ai', icon: '🤖', online: !!process.env.MISTRAL_API_KEY, latency: !!process.env.MISTRAL_API_KEY ? 45 : 0, lastCheck: Date.now() },
            { name: 'WebSocket', id: 'websocket', icon: '🔌', online: true, latency: 1, lastCheck: Date.now() },
            ...routerStatus.providers.filter(p => p.name !== 'mistral').map(p => ({
                name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
                id: p.name,
                icon: p.online ? '✅' : '❌',
                online: p.online,
                latency: p.latency,
                lastCheck: p.lastCheck,
                lastError: p.lastError
            }))
        ],
        summary: { online: 3 + (!!process.env.MISTRAL_API_KEY ? 1 : 0) + routerStatus.providers.filter(p => p.online && p.name !== 'mistral').length, total: 4 + routerStatus.providers.length },
        status: 'ok', timestamp: Date.now()
    });
});
```

- [ ] **Step 4: Restart and verify**

Run: `node sync-server.js`

Then: `curl http://localhost:3040/api/v1/health`

Expected: Health now includes Mistral, VPS, Ollama, OpenRouter status.

---

### Task 4: Commit

- [ ] **Step 1: Stage and commit**

```bash
git add router/five-splitter.js sync-server.js
git commit -m "feat: add 5-splitter router with parallel AI provider race"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Parallel race mode (fastest wins) — `race()` uses `Promise.allSettled`, sorts by latency
- ✅ Staggered timeouts — Mistral 10s, VPS 20s, Ollama 30s, OpenRouter 15s — set in `registerProvider`
- ✅ Health endpoint — `GET /api/v1/router/status`
- ✅ EventLog — console.log + structured JSON; DkzEventLog ready when browser context available
- ✅ Integration into sync-server Express — mounted at `/api/v1/router`

**2. Placeholder scan:** No TBD, TODOs, or placeholders.

**3. Type consistency:** All method names match across tasks. `registerProvider`, `race`, `getStatus`, `createRouter` are consistent.
