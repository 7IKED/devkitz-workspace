/**
 * DkZ NanoBot v3 — Multi-Source ChatPilot + ASCII Mindmap Engine
 * @DKZ:RULES → R21 Shared Scripts, R15 esc(), R8 keine Umlaute
 * @DKZ:TAG → [SYS:nanobot] [CAT:shared] [LANG:js]
 * @version v3.0.0
 *
 * Quellen: SecondBrain, GitHub, Drive, DEEPKEEP Katalog, Web (Google/Reddit/YouTube)
 * Output: Immer Info + Quelle + ASCII Mindmap
 *
 * Einbinden:
 *   <script src="../../shared/dkz-nanobot.js" data-module="modul-name"></script>
 *   <script src="../../shared/dkz-nanobot.js" data-module="cloudia" data-mode="chatpilot"></script>
 */
const DkzNanoBot = (() => {
    'use strict';
    const VERSION = 'v3.0.0';
    const STORAGE_KEY = 'dkz-nanobot-history';
    const MAX_HISTORY = 300;
    const GATEWAY = 'http://localhost:3040';
    const WEBHOOK_HUB = 'http://localhost:9090';
    const OPENHANDS_URL = 'http://localhost:3000';

    let _open = false;
    let _channel = '#general';
    let _module = '';
    let _mode = 'badge'; // 'badge' oder 'chatpilot'
    let _ws = null;
    let _connected = false;
    let _history = [];
    let _panelEl = null;
    let _badgeEl = null;
    let _unread = 0;
    let _sources = {}; // gecachte Quellen-Daten

    function _esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    function _ts() { return new Date().toLocaleTimeString('de-DE', {hour:'2-digit',minute:'2-digit'}); }

    // ═══════════════════════════════════════
    // Detect Module + Mode from Script Tag
    // ═══════════════════════════════════════
    function _detectModule() {
        const tag = document.querySelector('script[src*="dkz-nanobot"]');
        if (tag) {
            if (tag.dataset.module) _module = tag.dataset.module;
            if (tag.dataset.mode === 'chatpilot') _mode = 'chatpilot';
        }
        if (!_module) {
            const path = location.pathname;
            const parts = path.split('/').filter(Boolean);
            _module = parts[parts.length - 2] || parts[parts.length - 1] || 'unknown';
        }
    }

    // ═══════════════════════════════════════
    // History (localStorage)
    // ═══════════════════════════════════════
    function _loadHistory() {
        try { _history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { _history = []; }
    }
    function _saveHistory() {
        if (_history.length > MAX_HISTORY) _history = _history.slice(-MAX_HISTORY);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_history)); } catch { /* full */ }
    }
    function _addMessage(from, text, channel, type, sources) {
        const msg = { from, text, channel: channel || _channel, type: type || 'text',
                      ts: Date.now(), module: _module, sources: sources || [] };
        _history.push(msg);
        _saveHistory();
        if (_open || _mode === 'chatpilot') _renderMessages();
        if (!_open && _mode !== 'chatpilot' && from !== 'Du') { _unread++; _updateBadge(); }
        return msg;
    }

    // ═══════════════════════════════════════
    // ASCII MINDMAP Generator
    // ═══════════════════════════════════════
    function _mindmap(title, items) {
        let map = `\n${title}\n`;
        items.forEach((item, i) => {
            const last = i === items.length - 1;
            const prefix = last ? '└── ' : '├── ';
            map += `${prefix}${item.label}`;
            if (item.detail) map += ` → ${item.detail}`;
            map += '\n';
            if (item.children) {
                item.children.forEach((child, j) => {
                    const cLast = j === item.children.length - 1;
                    const cPrefix = last ? '    ' : '│   ';
                    map += `${cPrefix}${cLast ? '└── ' : '├── '}${child}\n`;
                });
            }
        });
        return map;
    }

    function _formatWithSources(text, sources) {
        let out = text;
        if (sources && sources.length > 0) {
            out += '\n\n📎 Quellen:';
            sources.forEach((s, i) => {
                out += `\n  ${i+1}. [${s.type}] ${s.name}`;
                if (s.url) out += ` — ${s.url}`;
            });
        }
        return out;
    }

    // ═══════════════════════════════════════
    // MULTI-SOURCE SEARCH ENGINE
    // ═══════════════════════════════════════

    // 1. SecondBrain (Obsidian Vault)
    async function _searchSecondBrain(query) {
        const results = [];
        // SecondBrain ist lokal — suche ueber Webhook-Hub
        try {
            const r = await fetch(`${WEBHOOK_HUB}/hook/search-secondbrain`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ query, limit: 5 })
            });
            if (r.ok) {
                const data = await r.json();
                if (data.results) return data.results.map(f => ({
                    type: '🧠 SecondBrain', name: f.filename, path: f.path,
                    snippet: f.snippet || '', url: `file:///${f.path}`
                }));
            }
        } catch { /* Hub offline */ }
        // Fallback: Suche im DEEPKEEP Katalog
        if (typeof CloudiaAPI !== 'undefined') {
            const catalog = CloudiaAPI.searchCatalog(query);
            catalog.slice(0, 3).forEach(item => {
                results.push({
                    type: '📁 DEEPKEEP', name: item.filename, path: item.path,
                    snippet: `${item.fileType} · ${CloudiaAPI.formatBytes(item.sizeBytes)}`,
                    url: ''
                });
            });
        }
        return results;
    }

    // 2. GitHub Repos
    async function _searchGitHub(query) {
        const results = [];
        const token = localStorage.getItem('dkz-github-token');
        const org = localStorage.getItem('dkz-github-org') || '7IKED';
        if (!token) return [{type: '🐙 GitHub', name: 'Token fehlt', snippet: 'Setze dkz-github-token in localStorage', url: ''}];
        try {
            const r = await fetch(`https://api.github.com/search/code?q=${encodeURIComponent(query)}+org:${org}&per_page=5`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' },
                signal: AbortSignal.timeout(5000)
            });
            if (r.ok) {
                const data = await r.json();
                (data.items || []).forEach(item => {
                    results.push({
                        type: '🐙 GitHub', name: item.name,
                        path: item.repository.full_name + '/' + item.path,
                        snippet: item.repository.description || '',
                        url: item.html_url
                    });
                });
            }
        } catch { /* API offline */ }
        return results;
    }

    // 3. Google Drive (via Apps Script)
    async function _searchDrive(query) {
        const appsScriptUrl = localStorage.getItem('dkz-apps-script-url');
        if (!appsScriptUrl) return [{type: '📁 Drive', name: 'Apps Script URL fehlt', snippet: 'Konfiguriere in Einstellungen', url: ''}];
        try {
            const r = await fetch(`${appsScriptUrl}?action=search&q=${encodeURIComponent(query)}`, {
                signal: AbortSignal.timeout(5000)
            });
            if (r.ok) {
                const data = await r.json();
                return (data.files || []).slice(0, 5).map(f => ({
                    type: '📁 Drive', name: f.name, path: f.path || '',
                    snippet: `${f.mimeType} · ${f.size || '?'}`, url: f.url || ''
                }));
            }
        } catch { /* offline */ }
        return [];
    }

    // 4. Web Search (Google, Reddit, YouTube) — via Gateway Proxy
    async function _searchWeb(query, platform) {
        try {
            const r = await fetch(`${GATEWAY}/api/v1/search`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ query, platform: platform || 'all', limit: 5 }),
                signal: AbortSignal.timeout(8000)
            });
            if (r.ok) {
                const data = await r.json();
                return (data.results || []).map(item => ({
                    type: platform === 'reddit' ? '🟠 Reddit' :
                          platform === 'youtube' ? '🎬 YouTube' : '🔍 Google',
                    name: item.title, snippet: item.snippet || '',
                    url: item.url
                }));
            }
        } catch { /* offline */ }
        return [];
    }

    // 5. OpenHands Knowledge
    async function _searchOpenHands(query) {
        try {
            const r = await fetch(`${OPENHANDS_URL}/api/v1/search`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ query }),
                signal: AbortSignal.timeout(5000)
            });
            if (r.ok) {
                const data = await r.json();
                return (data.results || []).map(item => ({
                    type: '🤚 OpenHands', name: item.title || item.file,
                    snippet: item.content || '', url: ''
                }));
            }
        } catch { /* offline */ }
        return [];
    }

    // UNIFIED SEARCH — alle Quellen parallel
    async function _unifiedSearch(query) {
        _addMessage('🤖 NanoBot', `🔍 Suche "${_esc(query)}" in allen Quellen...`, _channel, 'info');

        const [sb, gh, drive, web, oh] = await Promise.allSettled([
            _searchSecondBrain(query),
            _searchGitHub(query),
            _searchDrive(query),
            _searchWeb(query, 'all'),
            _searchOpenHands(query)
        ]);

        const allResults = [];
        const sources = [];

        [sb, gh, drive, web, oh].forEach(result => {
            if (result.status === 'fulfilled' && result.value.length > 0) {
                result.value.forEach(r => {
                    allResults.push(r);
                    sources.push({ type: r.type, name: r.name, url: r.url || '' });
                });
            }
        });

        if (allResults.length === 0) {
            _addMessage('🤖 NanoBot', `❌ Keine Treffer fuer "${_esc(query)}".\nVersuche: /search-web, /search-github, oder /search-drive`, _channel, 'info');
            return;
        }

        // Mindmap generieren
        const byType = {};
        allResults.forEach(r => {
            if (!byType[r.type]) byType[r.type] = [];
            byType[r.type].push(r);
        });

        const mindmapItems = Object.entries(byType).map(([type, items]) => ({
            label: `${type} (${items.length})`,
            children: items.map(i => `${i.name}${i.snippet ? ' — ' + i.snippet.substring(0, 60) : ''}`)
        }));

        const map = _mindmap(`🔍 Suchergebnis: "${query}"`, mindmapItems);
        _addMessage('🤖 NanoBot', map, _channel, 'success', sources.slice(0, 10));
    }

    // ═══════════════════════════════════════
    // COMMANDS (erweitert)
    // ═══════════════════════════════════════
    const _commands = {
        '/help': () => {
            const helpMap = _mindmap('🤖 NanoBot v3 Commands', [
                { label: '🔍 Suche', children: [
                    '/search <query> — Alle Quellen durchsuchen',
                    '/search-brain <q> — Nur SecondBrain',
                    '/search-github <q> — Nur GitHub Repos',
                    '/search-drive <q> — Nur Google Drive',
                    '/search-web <q> — Google/Reddit/YouTube',
                    '/search-reddit <q> — Nur Reddit',
                    '/search-youtube <q> — Nur YouTube'
                ]},
                { label: '📁 DEEPKEEP + CLOUDIA', children: [
                    '/keep <datei> — In Tresor verschieben',
                    '/sort — Inbox sortieren',
                    '/catalog — Katalog oeffnen',
                    '/7day — 7-Tage-Check',
                    '/rules — Sortier-Regeln'
                ]},
                { label: '🔗 Webhooks', children: [
                    '/webhook <name> — Webhook triggern',
                    '/hooks — Alle Hooks anzeigen',
                    '/health — System Health Check'
                ]},
                { label: '🤖 System', children: [
                    '/providers — Provider Status',
                    '/status — NanoBot Status',
                    '/mindmap <thema> — ASCII Mindmap',
                    '/clear — Chat leeren',
                    '/openhands <task> — OpenHands Task'
                ]}
            ]);
            _addMessage('🤖 NanoBot', helpMap, _channel, 'info');
        },

        '/search': (args) => { if (args) _unifiedSearch(args); else _addMessage('🤖 NanoBot', '⚠️ /search <query>', _channel, 'error'); },
        '/search-brain': (args) => _searchAndShow(args, _searchSecondBrain, '🧠 SecondBrain'),
        '/search-github': (args) => _searchAndShow(args, _searchGitHub, '🐙 GitHub'),
        '/search-drive': (args) => _searchAndShow(args, _searchDrive, '📁 Drive'),
        '/search-web': (args) => _searchAndShow(args, q => _searchWeb(q, 'all'), '🔍 Web'),
        '/search-reddit': (args) => _searchAndShow(args, q => _searchWeb(q, 'reddit'), '🟠 Reddit'),
        '/search-youtube': (args) => _searchAndShow(args, q => _searchWeb(q, 'youtube'), '🎬 YouTube'),

        '/keep': (args) => {
            if (!args) { _addMessage('🤖 NanoBot', '⚠️ /keep <dateiname>', _channel, 'error'); return; }
            if (typeof CloudiaAPI !== 'undefined') {
                const item = CloudiaAPI.addToCatalog({ filename: args, path: '/_INBOX/', provider: 'local', tags: ['manual-keep'] });
                _addMessage('🤖 NanoBot', `✅ "${_esc(args)}" in Tresor verschoben\n📎 Pfad: ${item.path}\n🔒 ID: ${item.id}`, _channel, 'success',
                    [{ type: '🔒 DEEPKEEP', name: args }]);
            } else {
                _triggerWebhook('deepkeep-sync', { filename: args });
            }
        },
        '/sort': () => {
            if (typeof CloudiaAPI !== 'undefined') {
                const catalog = CloudiaAPI.getCatalog().filter(i => i.path === '/_INBOX/');
                if (catalog.length === 0) { _addMessage('🤖 NanoBot', '✅ Inbox ist leer!', _channel, 'success'); return; }
                let sorted = 0;
                catalog.forEach(item => {
                    const result = CloudiaAPI.sortFile(item.filename, item.sizeBytes);
                    if (result.rule) sorted++;
                });
                _addMessage('🤖 NanoBot', `📂 ${sorted}/${catalog.length} Dateien sortiert`, _channel, 'success');
            }
        },
        '/catalog': () => {
            if (typeof CloudiaAPI !== 'undefined') {
                const stats = CloudiaAPI.getStats();
                const map = _mindmap('📊 DEEPKEEP Katalog', [
                    { label: `Dateien: ${stats.totalFiles}`, detail: CloudiaAPI.formatBytes(stats.totalSize) },
                    { label: `Geschuetzt: ${stats.protectedFiles}` },
                    { label: 'Nach Typ:', children: Object.entries(stats.byType).map(([k,v]) => `${k}: ${v}`) },
                    { label: 'Nach Provider:', children: Object.entries(stats.byProvider).map(([k,v]) => `${k}: ${v}`) },
                    { label: `7-Tage Pending: ${stats.sevenDayPending}` },
                    { label: `Heute: ${stats.todayActions} Aktionen` }
                ]);
                _addMessage('🤖 NanoBot', map, _channel, 'info');
            }
        },
        '/7day': () => {
            if (typeof CloudiaAPI !== 'undefined') {
                const items = CloudiaAPI.get7DayItems();
                if (items.length === 0) { _addMessage('🤖 NanoBot', '✅ Keine Dateien aelter als 7 Tage!', _channel, 'success'); return; }
                const map = _mindmap('⏰ 7-Tage-Regel', items.map(i => ({
                    label: i.filename, detail: `${i.source} · seit ${new Date(i.addedAt).toLocaleDateString('de-DE')}`
                })));
                _addMessage('🤖 NanoBot', map, _channel, 'info');
            }
        },
        '/rules': () => {
            if (typeof CloudiaAPI !== 'undefined') {
                const rules = CloudiaAPI.getRules();
                const map = _mindmap('📐 Sortier-Regeln', rules.filter(r => r.active).map(r => ({
                    label: r.pattern, detail: `→ ${r.target} [${r.provider}]`
                })));
                _addMessage('🤖 NanoBot', map, _channel, 'info');
            }
        },
        '/webhook': (args) => { if (args) _triggerWebhook(args); else _commands['/hooks'](); },
        '/hooks': async () => {
            try {
                const r = await fetch(`${WEBHOOK_HUB}/hooks`);
                if (r.ok) {
                    const hooks = await r.json();
                    const map = _mindmap('🔗 Webhook Hub', Object.entries(hooks).map(([name, h]) => ({
                        label: name, detail: h.description || h.method
                    })));
                    _addMessage('🤖 NanoBot', map, _channel, 'info');
                }
            } catch { _addMessage('🤖 NanoBot', '❌ Webhook Hub offline (Port 9090)', _channel, 'error'); }
        },
        '/health': async () => {
            _addMessage('🤖 NanoBot', '🏥 Health-Check laeuft...', _channel, 'info');
            const checks = [
                { name: 'Gateway', url: `${GATEWAY}/api/v1/health`, icon: '🔌' },
                { name: 'Webhook Hub', url: `${WEBHOOK_HUB}/health`, icon: '🔗' },
                { name: 'OpenHands', url: `${OPENHANDS_URL}/api/health`, icon: '🤚' },
            ];
            const results = [];
            for (const c of checks) {
                try {
                    const r = await fetch(c.url, { signal: AbortSignal.timeout(3000) });
                    results.push({ label: `${c.icon} ${c.name}`, detail: r.ok ? '🟢 Online' : `🟡 HTTP ${r.status}` });
                } catch { results.push({ label: `${c.icon} ${c.name}`, detail: '🔴 Offline' }); }
            }
            // Provider Health
            if (typeof CloudiaAPI !== 'undefined') {
                const ph = await CloudiaAPI.checkHealth();
                Object.entries(ph).forEach(([k, v]) => {
                    const icon = v === 'online' ? '🟢' : v === 'not_configured' ? '⚪' : '🔴';
                    results.push({ label: `☁️ ${k}`, detail: `${icon} ${v}` });
                });
            }
            const map = _mindmap('🏥 System Health', results);
            _addMessage('🤖 NanoBot', map, _channel, 'success');
        },
        '/providers': () => {
            if (typeof CloudiaAPI !== 'undefined') {
                const map = _mindmap('☁️ Provider Status', Object.entries(CloudiaAPI.PROVIDERS).map(([k, p]) => ({
                    label: `${p.icon} ${p.name}`, detail: p.status || 'unknown'
                })));
                _addMessage('🤖 NanoBot', map, _channel, 'info');
            }
        },
        '/status': () => {
            const map = _mindmap('🤖 NanoBot v3 Status', [
                { label: `Version: ${VERSION}` },
                { label: `Modul: ${_module}` },
                { label: `Modus: ${_mode}` },
                { label: `WebSocket: ${_connected ? '🟢' : '🔴'}` },
                { label: `Channel: ${_channel}` },
                { label: `History: ${_history.length}/${MAX_HISTORY}` },
                { label: `DOM Nodes: ${document.querySelectorAll('*').length}` },
                { label: `localStorage: ${(JSON.stringify(localStorage).length / 1024).toFixed(1)}KB` }
            ]);
            _addMessage('🤖 NanoBot', map, _channel, 'info');
        },
        '/mindmap': (args) => {
            if (!args) { _addMessage('🤖 NanoBot', '⚠️ /mindmap <thema>', _channel, 'error'); return; }
            _generateMindmapAI(args);
        },
        '/clear': () => { _history = []; _saveHistory(); if (_open || _mode === 'chatpilot') _renderMessages(); },
        '/openhands': (args) => {
            if (!args) { _addMessage('🤖 NanoBot', '⚠️ /openhands <task beschreibung>', _channel, 'error'); return; }
            _triggerWebhook('openhands-task', { task: args });
            _addMessage('🤖 NanoBot', `🤚 Task an OpenHands gesendet: "${_esc(args)}"`, _channel, 'info');
        },
    };

    // Helfer: Einzelne Quelle suchen + anzeigen
    async function _searchAndShow(query, searchFn, label) {
        if (!query) { _addMessage('🤖 NanoBot', `⚠️ Query fehlt`, _channel, 'error'); return; }
        _addMessage('🤖 NanoBot', `🔍 Suche in ${label}...`, _channel, 'info');
        const results = await searchFn(query);
        if (results.length === 0) {
            _addMessage('🤖 NanoBot', `❌ Keine Treffer in ${label}`, _channel, 'info');
            return;
        }
        const map = _mindmap(`${label} — "${query}"`, results.map(r => ({
            label: r.name, detail: r.snippet ? r.snippet.substring(0, 80) : ''
        })));
        const sources = results.map(r => ({ type: r.type, name: r.name, url: r.url || '' }));
        _addMessage('🤖 NanoBot', map, _channel, 'success', sources);
    }

    // Webhook triggern
    async function _triggerWebhook(name, body) {
        try {
            const r = await fetch(`${WEBHOOK_HUB}/hook/${name}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-DKZ-Source': 'nanobot' },
                body: JSON.stringify(body || {})
            });
            if (r.ok) {
                const data = await r.json();
                _addMessage('🤖 NanoBot', `✅ Webhook "${name}" ausgefuehrt\n${JSON.stringify(data, null, 2).substring(0, 200)}`, _channel, 'success');
            } else {
                _addMessage('🤖 NanoBot', `⚠️ Webhook "${name}" fehlgeschlagen: HTTP ${r.status}`, _channel, 'error');
            }
        } catch {
            _addMessage('🤖 NanoBot', `❌ Webhook Hub nicht erreichbar (Port 9090)`, _channel, 'error');
        }
    }

    // AI Mindmap Generator
    async function _generateMindmapAI(topic) {
        _addMessage('🤖 NanoBot', `🧠 Generiere Mindmap fuer "${_esc(topic)}"...`, _channel, 'info');
        try {
            const reply = await _callAI(
                'Du bist ein Mindmap-Generator. Erstelle eine ASCII-Mindmap zum Thema. Format: Hauptthema als Titel, dann Kategorien mit ├── und Unterpunkte mit │   ├──. Max 4 Ebenen, max 20 Eintraege. Antworte NUR mit der Mindmap, kein Fliesstext. Keine Umlaute (ae, oe, ue, ss).',
                topic, 'google/gemma-4-26b-a4b-it'
            );
            _addMessage('🤖 NanoBot', reply, _channel, 'success', [{ type: '🤖 AI', name: 'Mindmap generiert' }]);
        } catch {
            // Fallback: Statische Mindmap
            const map = _mindmap(`🧠 ${topic}`, [
                { label: 'Definition', detail: 'Was ist es?' },
                { label: 'Komponenten', children: ['Teil A', 'Teil B', 'Teil C'] },
                { label: 'Vorteile', children: ['Pro 1', 'Pro 2'] },
                { label: 'Nachteile', children: ['Con 1', 'Con 2'] },
                { label: 'Quellen', detail: 'Weitere Recherche noetig' }
            ]);
            _addMessage('🤖 NanoBot', map + '\n⚠️ AI offline — statische Vorlage', _channel, 'info');
        }
    }

    // ═══════════════════════════════════════
    // AI CALL (3-Tier Fallback)
    // ═══════════════════════════════════════
    async function _callAI(sys, usr, model) {
        // 1. Local Gateway
        try {
            const r = await fetch(`${GATEWAY}/api/v1/chat`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ message: usr, provider: 'vps-ollama', model, systemPrompt: sys }),
                signal: AbortSignal.timeout(15000)
            });
            if (r.ok) { const d = await r.json(); if (d.reply) return d.reply; }
        } catch { /* offline */ }

        // 2. Direct VPS Ollama
        try {
            const r = await fetch('http://72.61.93.129:8811/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer DKZ-OLLAMA-2026-SECURE' },
                body: JSON.stringify({ model, messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }], temperature: 0.7 }),
                signal: AbortSignal.timeout(15000)
            });
            if (r.ok) { const d = await r.json(); if (d.choices?.[0]?.message?.content) return d.choices[0].message.content; }
        } catch { /* offline */ }

        // 3. FreeAPI Cascade
        try {
            const r = await fetch(`${GATEWAY}/api/v1/free-hub/cascade`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ message: usr }), signal: AbortSignal.timeout(10000)
            });
            if (r.ok) { const d = await r.json(); if (d.response) return d.response; }
        } catch { /* offline */ }

        throw new Error('Kein LLM Provider erreichbar.');
    }

    // ═══════════════════════════════════════
    // INPUT PROCESSING
    // ═══════════════════════════════════════
    function _processInput(text) {
        if (!text.trim()) return;
        _addMessage('Du', text, _channel, 'user');

        // Slash-Commands
        if (text.startsWith('/')) {
            const parts = text.split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1).join(' ');
            if (_commands[cmd]) { _commands[cmd](args); return; }
        }

        // Dot-Commands (legacy)
        if (text.startsWith('.')) {
            const parts = text.split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const slashCmd = '/' + cmd.substring(1);
            if (_commands[slashCmd]) { _commands[slashCmd](parts.slice(1).join(' ')); return; }
        }

        // Auto-Search: Wenn es eine Frage ist
        const isQuestion = text.endsWith('?') || text.toLowerCase().startsWith('wo ') ||
                          text.toLowerCase().startsWith('was ') || text.toLowerCase().startsWith('wie ') ||
                          text.toLowerCase().startsWith('suche ') || text.toLowerCase().startsWith('finde ');
        if (isQuestion) {
            _unifiedSearch(text.replace(/^(suche|finde)\s+/i, '').replace(/\?$/, ''));
            return;
        }

        // Error-Detection
        const errorKw = ['error', 'failed', 'crash', 'exception', 'reject', 'fehler'];
        if (errorKw.some(kw => text.toLowerCase().includes(kw))) {
            _runErrorAnalysis(text);
            return;
        }

        // Normal AI Chat
        _chatWithAI(text);
    }

    async function _runErrorAnalysis(msg) {
        _addMessage('🤖 NanoBot', '🔍 Fehler-Analyse...', _channel, 'info');
        try {
            const reply = await _callAI(
                'Du bist der DkZ NanoBot Fehler-Analysator. Gib die Antwort als ASCII-Mindmap:\n\nFehler-Analyse\n├── Root Cause\n│   └── [Ursache]\n├── Pattern\n│   └── [Erkanntes Muster]\n├── Hypothese\n│   └── [Warum?]\n└── Fix\n    └── [Konkreter Vorschlag]\n\nKeine Umlaute (R8).',
                msg, 'qwen2.5:32b'
            );
            _addMessage('🤖 NanoBot', reply, _channel, 'success', [{ type: '🤖 AI', name: 'Fehler-Analyse' }]);
        } catch (e) {
            _addMessage('🤖 NanoBot', `❌ AI offline: ${e.message}`, _channel, 'error');
        }
    }

    async function _chatWithAI(msg) {
        _addMessage('🤖 NanoBot', '💭 Denke...', _channel, 'info');
        try {
            const reply = await _callAI(
                'Du bist NanoBot v3, der ChatPilot im DkZ-Oekosystem. Antworte IMMER mit:\n1. Kurze, informative Antwort (max 3 Saetze)\n2. ASCII-Mindmap wenn sinnvoll\n3. Quelle(n) am Ende\nKeine Umlaute (R8). Antworte auf Deutsch.',
                msg, 'google/gemma-4-26b-a4b-it'
            );
            _addMessage('🤖 NanoBot', reply, _channel, 'text', [{ type: '🤖 AI', name: 'NanoBot v3' }]);
        } catch (e) {
            _addMessage('🤖 NanoBot', `❌ AI offline. Versuche /search "${_esc(msg)}" stattdessen.`, _channel, 'error');
        }
    }

    // ═══════════════════════════════════════
    // WebSocket
    // ═══════════════════════════════════════
    function connect(url) {
        url = url || 'ws://localhost:3040/nanobot';
        try {
            _ws = new WebSocket(url);
            _ws.onopen = () => { _connected = true; _updateBadge(); };
            _ws.onmessage = (e) => {
                try { const m = JSON.parse(e.data); _addMessage(m.from || '🤖', m.text, m.channel, m.type); } catch { /* parse */ }
            };
            _ws.onerror = () => { _connected = false; _updateBadge(); };
            _ws.onclose = () => { _connected = false; _ws = null; _updateBadge(); setTimeout(() => connect(url), 5000); };
        } catch { /* offline */ }
    }

    // ═══════════════════════════════════════
    // UI: CHATPILOT MODE (Embedded Search Bar)
    // ═══════════════════════════════════════
    function _createChatPilot() {
        const wrapper = document.createElement('div');
        wrapper.id = 'dkz-chatpilot';
        wrapper.style.cssText = 'position:sticky;top:0;z-index:1000;padding:8px 16px;background:rgba(6,6,8,.95);border-bottom:1px solid rgba(255,255,255,.04);backdrop-filter:blur(20px);';

        wrapper.innerHTML = `
            <div style="display:flex;gap:8px;align-items:center;max-width:900px;margin:0 auto">
                <span style="font-size:16px">🤖</span>
                <div style="flex:1;position:relative">
                    <input id="cp-input" type="text" placeholder="🔍 Suche in Akten, SecondBrain, GitHub... oder /command"
                        style="width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:10px 16px;color:#f0f0f2;font-size:13px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s" />
                    <div id="cp-autocomplete" style="display:none;position:absolute;top:100%;left:0;right:0;background:rgba(10,10,14,.98);border:1px solid rgba(255,255,255,.06);border-radius:0 0 10px 10px;max-height:200px;overflow-y:auto;z-index:1001"></div>
                </div>
                <div id="cp-status" style="font-size:9px;color:#71717a;font-family:'JetBrains Mono',monospace;white-space:nowrap">
                    v3 · <span id="cp-conn" style="color:#fa1e4e">⬤</span>
                </div>
            </div>
            <div id="cp-results" style="max-width:900px;margin:8px auto 0;display:none;max-height:400px;overflow-y:auto;font-family:'Inter',sans-serif"></div>
        `;

        // Insert at top of main content or body
        const main = document.querySelector('main') || document.querySelector('.app') || document.body;
        main.insertBefore(wrapper, main.firstChild);

        // Events
        const input = document.getElementById('cp-input');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                _processInput(input.value);
                input.value = '';
                document.getElementById('cp-results').style.display = 'block';
            }
            if (e.key === 'Escape') {
                document.getElementById('cp-results').style.display = 'none';
                document.getElementById('cp-autocomplete').style.display = 'none';
            }
        });
        input.addEventListener('input', (e) => {
            const v = e.target.value;
            if (v.startsWith('/')) _showAutocomplete(v);
            else document.getElementById('cp-autocomplete').style.display = 'none';
        });
        input.addEventListener('focus', () => { input.style.borderColor = 'rgba(250,30,78,.3)'; });
        input.addEventListener('blur', () => { input.style.borderColor = 'rgba(255,255,255,.06)'; });

        // Ctrl+K global shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); input.focus(); }
        });
    }

    function _showAutocomplete(text) {
        const ac = document.getElementById('cp-autocomplete');
        if (!ac) return;
        const cmds = Object.keys(_commands).filter(c => c.startsWith(text.toLowerCase()));
        if (cmds.length === 0) { ac.style.display = 'none'; return; }
        ac.style.display = 'block';
        ac.innerHTML = cmds.map(c => `<div style="padding:6px 12px;cursor:pointer;font-size:12px;color:#a1a1aa;transition:background .15s"
            onmouseenter="this.style.background='rgba(250,30,78,.08)'"
            onmouseleave="this.style.background=''"
            onclick="document.getElementById('cp-input').value='${c} ';document.getElementById('cp-input').focus();document.getElementById('cp-autocomplete').style.display='none'">${c}</div>`).join('');
    }

    // ═══════════════════════════════════════
    // UI: BADGE MODE (Floating)
    // ═══════════════════════════════════════
    function _createBadge() {
        if (_badgeEl) return;
        _badgeEl = document.createElement('div');
        _badgeEl.id = 'dkz-nanobot-badge';
        _badgeEl.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:9990;cursor:pointer;display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(10,10,10,.9);border:1px solid rgba(255,255,255,.08);border-radius:24px;font-family:Inter,sans-serif;font-size:11px;font-weight:700;color:#f6f6f7;backdrop-filter:blur(16px);box-shadow:0 4px 20px rgba(0,0,0,.4);transition:all .3s;';
        _badgeEl.innerHTML = '<span id="nb-dot" style="width:7px;height:7px;border-radius:50%;background:#fa1e4e"></span> 🤖 NanoBot v3 <span id="nb-unread" style="display:none;background:#fa1e4e;color:#fff;font-size:9px;padding:1px 6px;border-radius:10px;font-weight:800"></span>';
        _badgeEl.addEventListener('click', togglePanel);
        document.body.appendChild(_badgeEl);
    }

    function _updateBadge() {
        const dot = document.getElementById('nb-dot') || document.getElementById('cp-conn');
        const badge = document.getElementById('nb-unread');
        if (dot) dot.style.color = _connected ? '#00ff88' : '#fa1e4e';
        if (badge) {
            badge.style.display = _unread > 0 ? 'inline' : 'none';
            badge.textContent = _unread;
        }
    }

    // ═══════════════════════════════════════
    // UI: Chat Panel (Badge Mode)
    // ═══════════════════════════════════════
    function _createPanel() {
        if (_panelEl) return;
        _panelEl = document.createElement('div');
        _panelEl.id = 'dkz-nanobot-panel';
        _panelEl.style.cssText = 'position:fixed;bottom:60px;right:16px;z-index:9991;width:420px;max-height:550px;background:rgba(8,8,12,.97);border:1px solid rgba(255,255,255,.08);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);backdrop-filter:blur(24px);font-family:Inter,sans-serif;display:none;flex-direction:column;overflow:hidden;';
        _panelEl.innerHTML = `
            <div style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between">
                <div style="display:flex;align-items:center;gap:8px">
                    <span style="font-size:16px">🤖</span>
                    <div>
                        <div style="font-size:12px;font-weight:800;color:#f6f6f7">NanoBot v3 ChatPilot</div>
                        <div style="font-size:9px;color:rgba(255,255,255,.3)">${_esc(_module)} · Multi-Source · ASCII Maps</div>
                    </div>
                </div>
                <button onclick="DkzNanoBot.togglePanel()" style="background:none;border:none;color:#a1a1aa;font-size:16px;cursor:pointer">✕</button>
            </div>
            <div id="nb-messages" style="flex:1;overflow-y:auto;padding:12px;max-height:400px;min-height:200px;font-size:11px"></div>
            <div style="padding:8px 12px;border-top:1px solid rgba(255,255,255,.06);display:flex;gap:6px">
                <input id="nb-input" type="text" placeholder="🔍 Suche oder /command..." style="flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px 12px;color:#f6f6f7;font-size:12px;font-family:inherit;outline:none" />
                <button id="nb-send" style="background:linear-gradient(135deg,#00ff88,#06b6d4);border:none;border-radius:8px;padding:8px 14px;color:#000;font-size:11px;font-weight:700;cursor:pointer">→</button>
            </div>`;
        document.body.appendChild(_panelEl);

        document.getElementById('nb-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { _processInput(e.target.value); e.target.value = ''; }
        });
        document.getElementById('nb-send').addEventListener('click', () => {
            const i = document.getElementById('nb-input');
            _processInput(i.value); i.value = ''; i.focus();
        });
    }

    function _renderMessages() {
        const el = _mode === 'chatpilot' ? document.getElementById('cp-results') : document.getElementById('nb-messages');
        if (!el) return;

        const recent = _history.filter(m => m.channel === _channel || _channel === '#general').slice(-30);
        if (recent.length === 0) {
            el.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,.2);padding:1.5rem;font-size:12px">🤖 NanoBot v3 bereit<br><span style="font-size:10px">Tippe /help oder stelle eine Frage</span></div>';
            return;
        }

        el.innerHTML = recent.map(m => {
            const isUser = m.from === 'Du';
            const bg = isUser ? 'rgba(0,255,136,.06)' : m.type === 'error' ? 'rgba(250,30,78,.06)' : m.type === 'success' ? 'rgba(0,255,136,.04)' : 'rgba(255,255,255,.02)';
            const col = m.type === 'error' ? '#fa1e4e' : m.type === 'success' ? '#00ff88' : '#a1a1aa';
            const time = new Date(m.ts).toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});

            let content = _esc(m.text);
            // Preserve ASCII art formatting
            content = content.replace(/\n/g, '<br>');

            // Source badges
            let srcHtml = '';
            if (m.sources && m.sources.length > 0) {
                srcHtml = '<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:3px">' +
                    m.sources.slice(0, 5).map(s =>
                        `<span style="font-size:8px;padding:1px 5px;border-radius:4px;background:rgba(250,30,78,.08);color:#fa1e4e;font-family:'JetBrains Mono',monospace">${_esc(s.type)}</span>`
                    ).join('') + '</div>';
            }

            return `<div style="margin-bottom:4px;padding:6px 10px;border-radius:8px;background:${bg};${isUser ? 'margin-left:40px' : ''}">
                <div style="display:flex;justify-content:space-between;margin-bottom:2px">
                    <span style="font-size:9px;font-weight:700;color:${isUser ? '#00ff88' : '#55ACEE'}">${_esc(m.from)}</span>
                    <span style="font-size:7px;color:rgba(255,255,255,.12)">${time}</span>
                </div>
                <div style="font-size:10.5px;color:${col};line-height:1.5;white-space:pre-wrap;font-family:${m.text.includes('├') || m.text.includes('└') ? "'JetBrains Mono',monospace" : 'inherit'}">${content}</div>
                ${srcHtml}
            </div>`;
        }).join('');
        el.scrollTop = el.scrollHeight;
    }

    function togglePanel() {
        _open = !_open;
        if (_open) {
            _createPanel();
            _panelEl.style.display = 'flex';
            _unread = 0; _updateBadge(); _renderMessages();
            setTimeout(() => { const i = document.getElementById('nb-input'); if (i) i.focus(); }, 100);
        } else { if (_panelEl) _panelEl.style.display = 'none'; }
    }

    // ═══════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════
    function init() {
        _detectModule();
        _channel = '#' + _module;
        _loadHistory();

        const setup = () => {
            if (_mode === 'chatpilot') _createChatPilot();
            else _createBadge();
        };

        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
        else setup();

        // Auto-connect WebSocket
        setTimeout(() => { try { connect(); } catch { /* offline */ } }, 2000);

        // Welcome (once per session)
        if (!sessionStorage.getItem('nb3-' + _module)) {
            sessionStorage.setItem('nb3-' + _module, '1');
            setTimeout(() => {
                const map = _mindmap('🤖 NanoBot v3 — Multi-Source ChatPilot', [
                    { label: '🔍 Quellen', children: ['SecondBrain (1.269 Dateien)', 'GitHub Repos', 'Google Drive', 'Web (Google/Reddit/YouTube)', 'OpenHands'] },
                    { label: '📁 Akten', children: ['DEEPKEEP Katalog', 'CLOUDIA Sortierung', '7-Tage-Regel'] },
                    { label: '🔗 Hooks', children: ['8 Webhooks', 'Dual: Copilot + n8n'] },
                    { label: '💡 Hilfe', detail: '/help fuer alle Commands' }
                ]);
                _addMessage('🤖 NanoBot', map, '#' + _module, 'info');
            }, 1500);
        }
    }

    init();

    return {
        version: VERSION, connect, togglePanel,
        getHistory: () => _history,
        getModule: () => _module,
        isConnected: () => _connected,
        search: _unifiedSearch,
        mindmap: _mindmap,
        _setChannel: (ch) => { _channel = ch; _renderMessages(); },
        triggerWebhook: _triggerWebhook,
    };
})();

if (typeof window !== 'undefined') window.DkzNanoBot = DkzNanoBot;
if (typeof window !== 'undefined') window.NANOBOT = DkzNanoBot;
