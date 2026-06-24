const { Mistral } = require('@mistralai/mistralai');

class FiveSplitter {
  constructor() {
    this.providers = new Map();
    this.healthStatus = new Map();
    this.healthInterval = null;
    this._lastRaceResult = null;
  }

  registerProvider(name, handler, timeoutMs) {
    this.providers.set(name, { handler, timeoutMs });
    this.healthStatus.set(name, { online: false, latency: 0, lastCheck: 0, error: null });
  }

  formatMessages(messages) {
    if (messages && Array.isArray(messages) && messages.length > 0) return messages;
    return [{ role: 'system', content: 'You are a helpful AI assistant.' }, { role: 'user', content: 'Hello' }];
  }

  async race(messages) {
    const formatted = this.formatMessages(messages);
    const results = await Promise.allSettled(
      Array.from(this.providers.entries()).map(([name, { handler, timeoutMs }]) =>
        this._raceOne(name, handler, formatted, timeoutMs)
      )
    );
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        this._lastRaceResult = result.value;
        return result.value;
      }
    }
    const errors = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value.error)
      .filter(Boolean);
    this._lastRaceResult = { success: false, error: errors.length > 0 ? errors.join('; ') : 'All providers failed' };
    return { success: false, error: errors.length > 0 ? errors.join('; ') : 'All providers failed' };
  }

  async _raceOne(name, handler, messages, timeoutMs) {
    const start = Date.now();
    try {
      const result = await Promise.race([
        handler(messages, name),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))
      ]);
      const latency = Date.now() - start;
      this.healthStatus.set(name, { online: true, latency, lastCheck: Date.now(), error: null });
      return { success: true, provider: name, latency, data: result };
    } catch (err) {
      const latency = Date.now() - start;
      const errorMsg = err.message === 'timeout' ? `timeout after ${timeoutMs}ms` : err.message;
      this.healthStatus.set(name, { online: false, latency, lastCheck: Date.now(), error: errorMsg });
      return { success: false, provider: name, error: errorMsg };
    }
  }

  async routeChat(name, messages) {
    if (!this.providers.has(name)) return { success: false, error: `Provider ${name} not found` };
    const { handler, timeoutMs } = this.providers.get(name);
    return await this._raceOne(name, handler, this.formatMessages(messages), timeoutMs);
  }

  startHealthCheck(intervalMs = 30000) {
    if (this.healthInterval) clearInterval(this.healthInterval);
    this.healthInterval = setInterval(() => {
      for (const name of this.providers.keys()) {
        this._pingProvider(name);
      }
    }, intervalMs);
  }

  async _pingProvider(name) {
    const { handler, timeoutMs } = this.providers.get(name);
    const start = Date.now();
    try {
      await Promise.race([
        handler([{ role: 'user', content: 'ping' }], name),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), Math.min(timeoutMs, 5000)))
      ]);
      this.healthStatus.set(name, { online: true, latency: Date.now() - start, lastCheck: Date.now(), error: null });
    } catch (err) {
      this.healthStatus.set(name, { online: false, latency: Date.now() - start, lastCheck: Date.now(), error: err.message });
    }
  }

  getLastRaceResult() {
    return this._lastRaceResult;
  }

  getHealthSummary() {
    const providers = Array.from(this.healthStatus.entries()).map(([name, status]) => ({
      name, ...status
    }));
    const online = providers.filter(p => p.online).length;
    return { providers, online, total: providers.length, timestamp: Date.now() };
  }

  createRouter() {
    const express = require('express');
    const router = express.Router();

    router.get('/status', (req, res) => {
      res.json({ success: true, ...this.getHealthSummary() });
    });

    router.post('/chat', async (req, res) => {
      const messages = req.body.messages || req.body.message ? [{ role: 'user', content: req.body.message }] : null;
      if (!messages) return res.status(400).json({ success: false, error: 'No messages or message provided' });
      const logEntry = { event: 'ROUTER_REQUEST', timestamp: new Date().toISOString(), messageCount: messages.length };
      console.log(JSON.stringify(logEntry));
      const result = await this.race(messages);
      if (result.success) {
        console.log(JSON.stringify({ event: 'ROUTER_SUCCESS', provider: result.provider, latency: result.latency }));
        return res.json({
          success: true,
          provider: result.provider,
          latency: result.latency,
          choices: [{ message: { role: 'assistant', content: result.data } }]
        });
      }
      console.log(JSON.stringify({ event: 'ROUTER_FAILURE', error: result.error }));
      res.status(503).json({ success: false, error: result.error });
    });

    return router;
  }
}

function createMistralHandler(apiKey) {
  const client = new Mistral({ apiKey: apiKey || '' });
  const modelName = 'open-mistral-nemo';
  return async (messages) => {
    if (!apiKey) throw new Error('MISTRAL_API_KEY not set');
    const resp = await client.chat.complete({ model: modelName, messages, temperature: 0.7 });
    return resp.choices[0].message.content;
  };
}

function createVpsHandler() {
  const url = process.env.NEXUZ_VPS_URL || 'http://72.61.93.129:8080';
  const token = process.env.NEXUZ_VPS_TOKEN || 'DKZ-VLLM-2026-SECURE';
  return async (messages) => {
    const reqModel = process.env.NEXUZ_VPS_MODEL || (messages[messages.length-1]?.content?.includes('test') ? 'gpt-oss-20b' : 'qwen3-6-35b');
    const resp = await fetch(`${url}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ model: reqModel, messages, temperature: 0.7 })
    });
    if (!resp.ok) throw new Error(`VPS returned ${resp.status}`);
    const data = await resp.json();
    return data.choices[0].message.content;
  };
}

function createOllamaHandler() {
  const baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  return async (messages) => {
    const resp = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3.2', messages, stream: false })
    });
    if (!resp.ok) throw new Error(`Ollama returned ${resp.status}`);
    const data = await resp.json();
    return data.message.content;
  };
}

function createOpenRouterHandler() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const configured = !!apiKey;
  return async (messages) => {
    if (!configured) throw new Error('OPENROUTER_API_KEY not set');
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': 'http://localhost:3040' },
      body: JSON.stringify({ model: 'openai/gpt-4o-mini', messages, temperature: 0.7 })
    });
    if (!resp.ok) throw new Error(`OpenRouter returned ${resp.status}`);
    const data = await resp.json();
    return data.choices[0].message.content;
  };
}

async function createFiveSplitter() {
  const splitter = new FiveSplitter();

  splitter.registerProvider('mistral', createMistralHandler(process.env.MISTRAL_API_KEY), 10000);
  splitter.registerProvider('vps', createVpsHandler(), 20000);
  splitter.registerProvider('ollama', createOllamaHandler(), 30000);
  splitter.registerProvider('openrouter', createOpenRouterHandler(), 15000);

  splitter.startHealthCheck(30000);
  return splitter;
}

module.exports = { FiveSplitter, createFiveSplitter, createMistralHandler, createVpsHandler, createOllamaHandler, createOpenRouterHandler };
