/**
 * DkZ NanoBot Swarm Spawner
 * @DKZ:TAG → [SYS:botnet] [CAT:swarm]
 * @version v1.0.0
 *
 * Spawnt, verwaltet und beendet NanoBot-Klone.
 * Jeder Klon: eigene ID, eigener Proxy, eigener Task.
 * REST API auf Port 3099.
 */

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { EventEmitter } = require('events');
const express = require('express');
const crypto = require('crypto');
const http = require('http');

const PORT = process.env.SWARM_PORT || 3099;
const MAX_CLONES = parseInt(process.env.MAX_CLONES || '10');
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3040';

// --- Clone Registry ---
const clones = new Map(); // id -> { id, status, task, startedAt, proxy, worker }
const bus = new EventEmitter();

function generateId() {
  return 'nb-' + crypto.randomBytes(4).toString('hex');
}

// --- Spawn Clone ---
function spawnClone(config = {}) {
  if (clones.size >= MAX_CLONES) {
    return { error: 'MAX_CLONES reached', max: MAX_CLONES, current: clones.size };
  }

  const id = generateId();
  const clone = {
    id,
    status: 'running',
    task: config.task || 'idle',
    startedAt: new Date().toISOString(),
    proxy: config.proxy || null,
    messages: [],
    result: null
  };

  // Simulate clone as async task (in production: Worker Thread or Child Process)
  clone._timer = setTimeout(async () => {
    clone.status = 'working';
    bus.emit('clone:working', id);

    try {
      // Execute task via Gateway
      if (config.task && config.message) {
        const result = await callGateway(config.message, clone.proxy);
        clone.result = result;
        clone.messages.push({ role: 'bot', text: result, ts: new Date().toISOString() });
      }
      clone.status = 'done';
      bus.emit('clone:done', id, clone.result);
    } catch (e) {
      clone.status = 'error';
      clone.result = e.message;
      bus.emit('clone:error', id, e.message);
    }
  }, 100);

  clones.set(id, clone);
  bus.emit('clone:spawned', id);
  return { id, status: 'spawned' };
}

// --- Kill Clone ---
function killClone(id) {
  const clone = clones.get(id);
  if (!clone) return { error: 'Clone not found', id };

  if (clone._timer) clearTimeout(clone._timer);
  clone.status = 'killed';
  bus.emit('clone:killed', id);

  // Send farewell via NanoChat
  sendNanoChat(id, `Clone ${id} aufgelöst. Task: ${clone.task}`);

  clones.delete(id);
  return { id, status: 'killed' };
}

// --- List Clones ---
function listClones() {
  const list = [];
  clones.forEach((c, id) => {
    list.push({
      id: c.id,
      status: c.status,
      task: c.task,
      startedAt: c.startedAt,
      proxy: c.proxy ? '***' : null,
      messages: c.messages.length,
      result: c.result ? String(c.result).substring(0, 100) : null
    });
  });
  return list;
}

// --- Gateway Call ---
function callGateway(message, proxy) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ message, max_tokens: 300 });
    const url = new URL(GATEWAY_URL + '/api/v1/free-hub/cascade');

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      timeout: 8000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.response || json.content || 'Keine Antwort');
        } catch (e) { resolve(data); }
      });
    });
    req.on('error', (e) => reject(e));
    req.on('timeout', () => { req.destroy(); reject(new Error('Gateway timeout')); });
    req.write(payload);
    req.end();
  });
}

// --- NanoChat Bridge ---
function sendNanoChat(cloneId, text) {
  const payload = JSON.stringify({ source: 'nanobot-swarm', cloneId, text, ts: new Date().toISOString() });
  try {
    const req = http.request({
      hostname: 'localhost', port: 3040, path: '/api/v1/nanochat/message',
      method: 'POST', headers: { 'Content-Type': 'application/json' }, timeout: 3000
    });
    req.on('error', () => {});
    req.write(payload);
    req.end();
  } catch(e) { /* silent */ }
}

// --- REST API ---
const app = express();
app.use(express.json());

app.get('/status', (req, res) => {
  res.json({
    service: 'nanobot-swarm',
    version: '1.0.0',
    uptime: process.uptime(),
    clones: clones.size,
    maxClones: MAX_CLONES,
    list: listClones()
  });
});

app.post('/spawn', (req, res) => {
  const result = spawnClone(req.body);
  res.status(result.error ? 400 : 201).json(result);
});

app.post('/kill/:id', (req, res) => {
  const result = killClone(req.params.id);
  res.status(result.error ? 404 : 200).json(result);
});

app.post('/broadcast', (req, res) => {
  const { message } = req.body;
  const results = [];
  clones.forEach((clone, id) => {
    clone.messages.push({ role: 'broadcast', text: message, ts: new Date().toISOString() });
    results.push(id);
  });
  res.json({ sent: results.length, ids: results });
});

app.post('/kill-all', (req, res) => {
  const killed = [];
  clones.forEach((_, id) => { killClone(id); killed.push(id); });
  res.json({ killed: killed.length, ids: killed });
});

// --- Start ---
app.listen(PORT, () => {
  const msg = `NanoBot Swarm Spawner running on port ${PORT} (max ${MAX_CLONES} clones)`;
  process.stdout.write(JSON.stringify({ event: 'started', port: PORT, maxClones: MAX_CLONES }) + '\n');
});

// --- Event Logging ---
bus.on('clone:spawned', id => process.stdout.write(JSON.stringify({ event: 'spawned', id, ts: new Date().toISOString() }) + '\n'));
bus.on('clone:done', (id, result) => process.stdout.write(JSON.stringify({ event: 'done', id, ts: new Date().toISOString() }) + '\n'));
bus.on('clone:killed', id => process.stdout.write(JSON.stringify({ event: 'killed', id, ts: new Date().toISOString() }) + '\n'));
bus.on('clone:error', (id, err) => process.stdout.write(JSON.stringify({ event: 'error', id, error: err, ts: new Date().toISOString() }) + '\n'));
