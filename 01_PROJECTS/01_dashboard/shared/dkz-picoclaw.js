/**
 * DkZ PicoClaw -- OpenClaws verlaengerter Arm v1.1
 * @DKZ:TAG [AGENT:picoclaw] [CAT:shared] [LANG:js]
 * @DKZ:RULES R12 Kein Wissensverlust, R31 Backend nur via NEXUZ
 * @version v0.01.1_01
 *
 * PicoClaw = OpenClaws Werkzeugkoffer im Frontend.
 * Mit Befehlen dirigierbar: einfache Aufgaben automatisiert abgeben.
 * Passt sich auf JEDE Arbeitsumgebung an.
 *
 * Einbinden: <script src="../../shared/dkz-picoclaw.js"></script>
 *
 * Features:
 * - OpenClaw Bridge: Verlaengerter Arm des Orchestrators im Frontend
 * - Command Interface: Befehle dirigieren → Aufgaben automatisiert abgeben
 * - Auto-Detect: Erkennt aktuelles Modul und passt Werkzeuge an
 * - 8 Micro-Agents: Knowledge, FileManager, CodeAnalyzer, SEO,
 *   Observer, PatternLearner, AutoPilot, WorkflowBoard
 * - Builder Tool: In Workflow/Agent/Loop/Team Builder verfuegbar
 * - James Bridge: Verbindet James-Bewertungen mit PicoClaw-Werkzeugen
 */
const DkzPicoClaw = (() => {
    'use strict';

    const VERSION = '2.0.0';

    // ========================================
    // TOKEN + CONNECTION CONFIG
    // ========================================
    const TOKEN_KEY = 'dkz-openclaw-token';
    const GATEWAY_KEY = 'dkz-openclaw-gateway';
    const DEFAULT_GATEWAY = 'http://localhost:3000';
    const DEFAULT_WS = 'ws://localhost:8000/ws/agent';
    var _reconnectTimer = null;
    var _connectionStatus = 'offline'; // online | rest-only | offline

    function setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
        document.dispatchEvent(new CustomEvent('picoclaw:token-set', { detail: { masked: token.substring(0,4) + '...' } }));
    }

    function getToken() {
        return localStorage.getItem(TOKEN_KEY) || '';
    }

    function setGateway(url) {
        localStorage.setItem(GATEWAY_KEY, url);
    }

    function getGateway() {
        return localStorage.getItem(GATEWAY_KEY) || DEFAULT_GATEWAY;
    }

    function getConnectionStatus() {
        return _connectionStatus;
    }

    // ========================================
    // REST API — OpenClaw REST Endpoints
    // ========================================

    /**
     * _restFetch() — Interner REST-Aufruf mit Token Auth
     */
    async function _restFetch(endpoint, body, method) {
        method = method || 'POST';
        var token = getToken();
        if (!token) return { error: 'Kein OpenClaw Token gesetzt. Nutze PICOCLAW.setToken("...")' };
        var gateway = getGateway();
        try {
            var resp = await fetch(gateway + endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: body ? JSON.stringify(body) : undefined
            });
            if (!resp.ok) {
                var errText = await resp.text().catch(function() { return resp.statusText; });
                return { error: 'REST ' + resp.status + ': ' + errText };
            }
            var data = await resp.json();
            _connectionStatus = 'rest-only';
            return { result: data, source: 'openclaw-rest' };
        } catch (e) {
            return { error: 'REST nicht erreichbar: ' + e.message };
        }
    }

    /**
     * restChat(prompt, options) — Chat Completion via OpenClaw REST
     * POST /chat/completions
     */
    async function restChat(prompt, options) {
        options = options || {};
        return _restFetch('/chat/completions', {
            messages: [{ role: 'user', content: prompt }],
            model: options.model || 'default',
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2048
        });
    }

    /**
     * restInvoke(toolName, params) — Tool direkt ausfuehren
     * POST /tools/invoke
     */
    async function restInvoke(toolName, params) {
        return _restFetch('/tools/invoke', {
            tool: toolName,
            params: params || {}
        });
    }

    /**
     * webhook(agentId, message) — Nachricht an Agent senden
     * POST /hooks/agent
     */
    async function webhook(agentId, message) {
        return _restFetch('/hooks/agent', {
            agent: agentId,
            message: message,
            source: 'dkz-picoclaw',
            module: _currentModule || 'global'
        });
    }

    /**
     * wake(agentId) — Agent-Session aufwecken / Heartbeat
     * POST /hooks/wake
     */
    async function wake(agentId) {
        return _restFetch('/hooks/wake', {
            agent: agentId || 'default',
            trigger: 'heartbeat',
            timestamp: Date.now()
        });
    }

    /**
     * testConnection() — Verbindung testen (REST + WebSocket)
     * Gibt { rest: bool, ws: bool, status: string } zurueck
     */
    async function testConnection() {
        var restOk = false;
        var wsOk = isConnected();

        // REST Test
        var token = getToken();
        if (token) {
            try {
                var gateway = getGateway();
                var resp = await fetch(gateway + '/hooks/wake', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify({ agent: 'ping', trigger: 'connection-test' })
                });
                restOk = resp.ok;
            } catch (e) { /* offline */ }
        }

        if (wsOk) _connectionStatus = 'online';
        else if (restOk) _connectionStatus = 'rest-only';
        else _connectionStatus = 'offline';

        document.dispatchEvent(new CustomEvent('picoclaw:connection-status', {
            detail: { rest: restOk, ws: wsOk, status: _connectionStatus }
        }));

        return { rest: restOk, ws: wsOk, status: _connectionStatus };
    }

    /**
     * autoReconnect() — Automatischer WebSocket Reconnect alle 30s
     */
    function autoReconnect() {
        if (_reconnectTimer) return;
        _reconnectTimer = setInterval(function() {
            if (!isConnected()) {
                var wsUrl = localStorage.getItem('dkz-openclaw-ws') || DEFAULT_WS;
                connectToOpenClaw(wsUrl);
            }
        }, 30000);
    }

    // ========================================
    // REGISTRY: Alle PicoClaw Micro-Agents
    // ========================================
    const REGISTRY = [
        {
            id: 'pc-knowledge', name: 'Knowledge', icon: '🧠',
            desc: 'Wissenssuche ueber FAISS Vector Store',
            capabilities: ['vector_search', 'semantic_search', 'fulltext_search'],
            tags: ['#knowledge', '#faiss', '#search', '#rag'],
            color: '#55ACEE'
        },
        {
            id: 'pc-code-analyzer', name: 'CodeAnalyzer', icon: '🔍',
            desc: 'Code-Analyse, Linting, Refactoring',
            capabilities: ['lint', 'analyze', 'refactor', 'security_scan'],
            tags: ['#code', '#analyze', '#lint', '#refactor'],
            color: '#00ff88'
        },
        {
            id: 'pc-filemanager', name: 'FileManager', icon: '📁',
            desc: 'Datei-Operationen: Sortieren, Verschieben, Duplikate',
            capabilities: ['file_sort', 'file_move', 'dedup', 'auto_tag'],
            tags: ['#files', '#sort', '#dedup'],
            color: '#f97316'
        },
        {
            id: 'pc-seo', name: 'SEO', icon: '📊',
            desc: 'SEO-Analyse, Meta-Tags, Keywords',
            capabilities: ['seo_scan', 'meta_audit', 'keyword_analysis', 'lighthouse'],
            tags: ['#seo', '#meta', '#keywords'],
            color: '#FFB800'
        },
        {
            id: 'pc-observer', name: 'Observer', icon: '👁️',
            desc: 'Browser-Beobachter: DOM, Screenshots, Aktionen',
            capabilities: ['browser_record', 'dom_capture', 'screenshot', 'action_log'],
            tags: ['#browser', '#observer', '#record'],
            color: '#ec4899'
        },
        {
            id: 'pc-pattern', name: 'PatternLearner', icon: '🔄',
            desc: 'Muster-Erkennung aus Aktionssequenzen',
            capabilities: ['pattern_detect', 'sequence_match', 'fingerprint', 'live_match'],
            tags: ['#pattern', '#learning', '#sequence'],
            color: '#6366f1'
        },
        {
            id: 'pc-autopilot', name: 'AutoPilot', icon: '🤖',
            desc: 'Gelernte Muster automatisch ausfuehren',
            capabilities: ['pattern_execute', 'mouse_tracking', 'pause_resume', 'visual_feedback'],
            tags: ['#autopilot', '#execute', '#rpa'],
            color: '#ff0040'
        },
        {
            id: 'pc-workflow-board', name: 'WorkflowBoard', icon: '📋',
            desc: 'Kanban, Mindmaps, Progress-Reports',
            capabilities: ['process_tracking', 'kanban_board', 'mindmap_render', 'progress_report', 'multi_target_download'],
            tags: ['#workflow', '#kanban', '#tracking'],
            color: '#00FFD5'
        }
    ];

    // ========================================
    // MODULE CONTEXT MAP (Auto-Detect)
    // ========================================
    const MODULE_CONTEXT = {
        'ai_chat': { claws: ['pc-knowledge'], hints: ['Wissenssuche fuer Chat-Antworten', 'Kontext aus DkZ Wiki laden'] },
        'analyser': { claws: ['pc-code-analyzer', 'pc-knowledge'], hints: ['Code analysieren', 'Refactoring-Tipps'] },
        'api-tester': { claws: ['pc-knowledge'], hints: ['API-Dokumentation suchen', 'Endpoint-Vorschlaege'] },
        'action-builder': { claws: ['pc-pattern', 'pc-knowledge'], hints: ['Muster erkennen', 'Action-Templates'] },
        'agent-builder': { claws: ['pc-knowledge', 'pc-autopilot', 'pc-pattern'], hints: ['Agent-Patterns', 'Skill-Bibliothek'] },
        'blog-designer': { claws: ['pc-seo', 'pc-knowledge'], hints: ['SEO optimieren', 'Content-Ideen'] },
        'changelog-builder': { claws: ['pc-filemanager', 'pc-knowledge'], hints: ['Git-Logs analysieren', 'Changelog-Format'] },
        'code-differ': { claws: ['pc-code-analyzer'], hints: ['Diff-Bewertung', 'Merge-Empfehlungen'] },
        'css-generator': { claws: ['pc-code-analyzer', 'pc-knowledge'], hints: ['DkZ Theme Regeln', 'CSS-Muster'] },
        'doc-engine': { claws: ['pc-knowledge', 'pc-seo'], hints: ['Wiki-Inhalte suchen', 'Doku-Standards'] },
        'ecosystem-analyzer': { claws: ['pc-code-analyzer', 'pc-knowledge', 'pc-seo'], hints: ['Modul-Kompatibilitaet', 'Standards-Check'] },
        'json-formatter': { claws: ['pc-code-analyzer'], hints: ['JSON-Schema validieren', 'Struktur-Empfehlungen'] },
        'ki-lernplattform': { claws: ['pc-knowledge', 'pc-pattern'], hints: ['Lernmaterial suchen', 'Fortschritt tracken'] },
        'loop-dashboard': { claws: ['pc-pattern', 'pc-autopilot', 'pc-knowledge'], hints: ['Loop-Patterns', 'Auto-Fix-Regeln'] },
        'markdown-gen': { claws: ['pc-knowledge', 'pc-seo'], hints: ['Markdown-Vorlagen', 'SEO-Meta generieren'] },
        'noter': { claws: ['pc-knowledge', 'pc-filemanager'], hints: ['Notizen durchsuchen', 'Auto-Tag'] },
        'prompt-generator': { claws: ['pc-knowledge'], hints: ['Prompt-Blueprints (BP-01 bis BP-20)', 'Best Practices'] },
        'research': { claws: ['pc-knowledge', 'pc-seo'], hints: ['Quellen suchen', 'Fakten pruefen'] },
        'seo-toolkit': { claws: ['pc-seo', 'pc-knowledge'], hints: ['Meta-Audit', 'Keyword-Dichte'] },
        'skill-builder': { claws: ['pc-pattern', 'pc-knowledge'], hints: ['Skill-Patterns', 'Capability-Map'] },
        'snippet-manager': { claws: ['pc-code-analyzer', 'pc-knowledge'], hints: ['Snippet-Suche', 'Duplikat-Erkennung'] },
        'system-check': { claws: ['pc-code-analyzer', 'pc-filemanager'], hints: ['Dependency-Check', 'Datei-Integritaet'] },
        'tasker': { claws: ['pc-workflow-board'], hints: ['Task-Tracking', 'Fortschritt-Reports'] },
        'workflow-builder': { claws: ['pc-pattern', 'pc-autopilot', 'pc-workflow-board', 'pc-knowledge'], hints: ['Workflow-Templates', 'n8n-Patterns'] },
        'team-builder': { claws: ['pc-knowledge', 'pc-autopilot', 'pc-pattern'], hints: ['Team-Strategien', 'BMAD-Patterns'] }
    };

    // ========================================
    // AUTO-DETECT: Aktuelles Modul erkennen
    // ========================================
    var _currentModule = null;
    var _currentContext = null;

    function detectModule() {
        // Try meta tag first
        var meta = document.querySelector('meta[name="dkz-module"]');
        if (meta) {
            _currentModule = meta.content;
        } else {
            // Detect from URL
            var path = window.location.pathname;
            var match = path.match(/modules\/([^/]+)\//);
            if (match) _currentModule = match[1];
        }
        _currentContext = MODULE_CONTEXT[_currentModule] || {
            claws: ['pc-knowledge'],
            hints: ['Wissenssuche', 'Kontext laden']
        };
        return _currentModule;
    }

    // ========================================
    // SEARCH: Semantische Wissenssuche
    // ========================================
    async function search(query, options) {
        options = options || {};
        var clawId = options.claw || 'pc-knowledge';

        // Try NEXUZ backend first
        if (typeof NEXUZ !== 'undefined' && NEXUZ.call) {
            try {
                var result = await NEXUZ.call('otr_research', {
                    query: query,
                    sources: options.sources || ['wiki', 'docs', 'modules'],
                    limit: options.limit || 5
                });
                return { results: result.data || result, source: 'nexuz', claw: clawId };
            } catch (e) {
                // Fallback
            }
        }

        // Try James Knowledge Base
        if (typeof DkzJames !== 'undefined' && DkzJames.KNOWLEDGE) {
            var kb = DkzJames.KNOWLEDGE;
            var results = searchKnowledgeBase(query, kb);
            return { results: results, source: 'james-kb', claw: clawId };
        }

        // Local search in registry
        var localResults = REGISTRY.filter(function (pc) {
            return pc.desc.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
                pc.tags.some(function (t) { return t.indexOf(query.toLowerCase()) !== -1; });
        });
        return { results: localResults, source: 'local', claw: clawId };
    }

    // Simple knowledge base text search
    function searchKnowledgeBase(query, kb) {
        var results = [];
        var q = query.toLowerCase();

        // Search playbook rules
        if (kb.rules) {
            Object.entries(kb.rules).forEach(function (e) {
                if (e[1].toLowerCase().indexOf(q) !== -1) {
                    results.push({ type: 'rule', id: e[0], text: e[1], source: 'playbook' });
                }
            });
        }
        // Search quality standards
        if (kb.blueprint && kb.blueprint.qualityStandards) {
            kb.blueprint.qualityStandards.forEach(function (std) {
                if (std.toLowerCase().indexOf(q) !== -1) {
                    results.push({ type: 'standard', text: std, source: 'blueprint' });
                }
            });
        }
        // Search prompt blueprints
        if (kb.promptBlueprints) {
            kb.promptBlueprints.forEach(function (bp) {
                if (bp.name.toLowerCase().indexOf(q) !== -1 || bp.desc.toLowerCase().indexOf(q) !== -1) {
                    results.push({ type: 'blueprint', id: bp.id, name: bp.name, desc: bp.desc, source: 'prompts' });
                }
            });
        }
        // Search OpenClaw
        if (kb.openclaw) {
            var oc = JSON.stringify(kb.openclaw).toLowerCase();
            if (oc.indexOf(q) !== -1) {
                results.push({ type: 'openclaw', text: 'OpenClaw: ' + kb.openclaw.framework + ' Orchestrator', source: 'openclaw' });
            }
        }
        return results;
    }

    // ========================================
    // CONTEXT HELP: Kontextbezogene Hilfe
    // ========================================
    function getContextHelp() {
        detectModule();
        if (!_currentContext) return { module: 'unknown', claws: [], hints: [] };

        var availableClaws = REGISTRY.filter(function (pc) {
            return _currentContext.claws.indexOf(pc.id) !== -1;
        });

        return {
            module: _currentModule,
            claws: availableClaws,
            hints: _currentContext.hints,
            allClaws: REGISTRY
        };
    }

    // ========================================
    // EXECUTE: PicoClaw-Aktion ausfuehren
    // ========================================
    async function execute(clawId, action, params) {
        params = params || {};
        var claw = REGISTRY.find(function (pc) { return pc.id === clawId; });
        if (!claw) return { error: 'PicoClaw "' + clawId + '" nicht gefunden', available: REGISTRY.map(function (r) { return r.id; }) };

        // Check if action is in capabilities
        if (claw.capabilities.indexOf(action) === -1) {
            return { error: 'Action "' + action + '" nicht verfuegbar fuer ' + claw.name, available: claw.capabilities };
        }

        // Try via NEXUZ backend
        if (typeof NEXUZ !== 'undefined' && NEXUZ.call) {
            try {
                var result = await NEXUZ.call('otr_tool_execute', {
                    tool: clawId,
                    action: action,
                    params: params
                });
                return { result: result.data || result, source: 'nexuz', claw: claw };
            } catch (e) {
                // Fallback
            }
        }

        // Simulate locally
        return {
            result: 'PicoClaw ' + claw.name + ' → ' + action + ' ausgefuehrt (Simulation)',
            source: 'local-sim',
            claw: claw,
            note: 'Starte ONTHERUN Gateway fuer echte Ausfuehrung'
        };
    }

    // ========================================
    // COMMANDS: Befehle dirigieren
    // Einfache Kurzkommandos fuer Automatisierung
    // ========================================
    const COMMANDS = {
        // Wissenssuche
        'search': { claw: 'pc-knowledge', action: 'semantic_search', desc: 'Wissen suchen' },
        'find': { claw: 'pc-knowledge', action: 'fulltext_search', desc: 'Volltext-Suche' },
        'wiki': { claw: 'pc-knowledge', action: 'vector_search', desc: 'Wiki durchsuchen' },
        // Code
        'lint': { claw: 'pc-code-analyzer', action: 'lint', desc: 'Code pruefen' },
        'analyze': { claw: 'pc-code-analyzer', action: 'analyze', desc: 'Code analysieren' },
        'refactor': { claw: 'pc-code-analyzer', action: 'refactor', desc: 'Refactoring-Tipps' },
        'security': { claw: 'pc-code-analyzer', action: 'security_scan', desc: 'Sicherheits-Scan' },
        // Dateien
        'sort': { claw: 'pc-filemanager', action: 'file_sort', desc: 'Dateien sortieren' },
        'dedup': { claw: 'pc-filemanager', action: 'dedup', desc: 'Duplikate finden' },
        'tag': { claw: 'pc-filemanager', action: 'auto_tag', desc: 'Auto-Tagging' },
        // SEO
        'seo': { claw: 'pc-seo', action: 'seo_scan', desc: 'SEO-Analyse starten' },
        'meta': { claw: 'pc-seo', action: 'meta_audit', desc: 'Meta-Tags pruefen' },
        'keywords': { claw: 'pc-seo', action: 'keyword_analysis', desc: 'Keyword-Analyse' },
        // Observer/Automation
        'record': { claw: 'pc-observer', action: 'browser_record', desc: 'Aktionen aufzeichnen' },
        'screenshot': { claw: 'pc-observer', action: 'screenshot', desc: 'Screenshot' },
        'pattern': { claw: 'pc-pattern', action: 'pattern_detect', desc: 'Muster erkennen' },
        'automate': { claw: 'pc-autopilot', action: 'pattern_execute', desc: 'Automatisierung starten' },
        // Workflow
        'kanban': { claw: 'pc-workflow-board', action: 'kanban_board', desc: 'Kanban oeffnen' },
        'report': { claw: 'pc-workflow-board', action: 'progress_report', desc: 'Report generieren' },
        // Meta
        'help': { special: 'help', desc: 'Alle Befehle anzeigen' },
        'status': { special: 'status', desc: 'PicoClaw Status' },
        'claws': { special: 'claws', desc: 'Verfuegbare Claws anzeigen' }
    };

    var _commandHistory = [];

    /**
     * run() — Befehle an PicoClaw dirigieren
     * Beispiele:
     *   PICOCLAW.run('search XSS protection')
     *   PICOCLAW.run('lint')
     *   PICOCLAW.run('seo')
     *   PICOCLAW.run('analyze this code')
     *   PICOCLAW.run('help')
     */
    async function run(commandStr) {
        if (!commandStr) return { error: 'Kein Befehl angegeben. Nutze: PICOCLAW.run("help")' };
        commandStr = commandStr.trim();
        var parts = commandStr.split(/\s+/);
        var cmd = parts[0].toLowerCase();
        var args = parts.slice(1).join(' ');

        _commandHistory.push({ cmd: commandStr, time: Date.now() });

        // Special commands
        if (cmd === 'help') {
            return { commands: Object.entries(COMMANDS).map(function (e) { return e[0] + ' — ' + e[1].desc; }), source: 'help' };
        }
        if (cmd === 'status') {
            detectModule();
            return { module: _currentModule, claws: _currentContext ? _currentContext.claws.length : 0, history: _commandHistory.length, version: VERSION };
        }
        if (cmd === 'claws') {
            return { claws: REGISTRY.map(function (r) { return r.icon + ' ' + r.name + ': ' + r.capabilities.join(', '); }) };
        }

        // Lookup command
        var cmdDef = COMMANDS[cmd];
        if (!cmdDef) {
            // Try fuzzy match
            var keys = Object.keys(COMMANDS);
            var match = keys.find(function (k) { return k.startsWith(cmd); });
            if (match) cmdDef = COMMANDS[match];
        }
        if (!cmdDef || cmdDef.special) {
            return { error: 'Unbekannter Befehl: "' + cmd + '". Nutze PICOCLAW.run("help")', available: Object.keys(COMMANDS) };
        }

        // Execute
        return execute(cmdDef.claw, cmdDef.action, { query: args || _currentModule || 'auto' });
    }

    // ========================================
    // OPENCLAW BRIDGE: Aufgaben an Backend delegieren
    // ========================================
    var _wsConnection = null;

    /**
     * delegate() — Aufgabe an OpenClaw Orchestrator delegieren
     * PicoClaw reicht die Aufgabe an OpenClaw weiter
     */
    async function delegate(task, options) {
        options = options || {};
        var payload = {
            source: 'picoclaw',
            module: _currentModule || 'global',
            task: task,
            priority: options.priority || 'normal',
            timeout: options.timeout || 60000
        };

        // Try NEXUZ first (REST)
        if (typeof NEXUZ !== 'undefined' && NEXUZ.call) {
            try {
                var result = await NEXUZ.call('otr_tool_execute', {
                    tool: 'openclaw_dispatch',
                    action: 'dispatch_task',
                    params: payload
                });
                return { result: result.data || result, source: 'openclaw-nexuz', delegated: true };
            } catch (e) {
                // Try WebSocket fallback
            }
        }

        // Try WebSocket direct
        if (_wsConnection && _wsConnection.readyState === 1) {
            _wsConnection.send(JSON.stringify({ type: 'task', data: payload }));
            return { result: 'Task delegiert via WebSocket', source: 'openclaw-ws', delegated: true };
        }

        // Queue for later
        var queue = JSON.parse(localStorage.getItem('dkz-picoclaw-queue') || '[]');
        queue.push(payload);
        localStorage.setItem('dkz-picoclaw-queue', JSON.stringify(queue));
        return { result: 'Task in Queue (OpenClaw offline)', source: 'queue', delegated: false, queueSize: queue.length };
    }

    /**
     * connectToOpenClaw() — WebSocket Verbindung zum Orchestrator
     */
    function connectToOpenClaw(url) {
        url = url || 'ws://localhost:8000/ws/agent';
        try {
            _wsConnection = new WebSocket(url);
            _wsConnection.onopen = function () {
                console.log('[PicoClaw] Connected to OpenClaw at ' + url);
                // Register as picoclaw-frontend agent
                _wsConnection.send(JSON.stringify({
                    type: 'register',
                    agent: 'picoclaw-frontend',
                    module: _currentModule || 'global',
                    claws: REGISTRY.map(function (r) { return r.id; }),
                    version: VERSION
                }));
                // Flush queued tasks
                var queue = JSON.parse(localStorage.getItem('dkz-picoclaw-queue') || '[]');
                queue.forEach(function (task) { _wsConnection.send(JSON.stringify({ type: 'task', data: task })); });
                localStorage.setItem('dkz-picoclaw-queue', '[]');
            };
            _wsConnection.onmessage = function (e) {
                try {
                    var msg = JSON.parse(e.data);

                    // OpenClaw sendet Ergebnis zurueck
                    if (msg.type === 'result') {
                        console.log('[PicoClaw] Result:', msg.data);
                        document.dispatchEvent(new CustomEvent('picoclaw:result', { detail: msg.data }));
                    }

                    // OpenClaw gibt Anweisung an PicoClaw(s)
                    // target: 'pc-knowledge' (einzeln) oder 'all' (alle)
                    if (msg.type === 'instruct') {
                        console.log('[PicoClaw] Instruction from OpenClaw:', msg.target, msg.action);
                        handleInstruction(msg);
                    }

                } catch (err) { /* ignore parse errors */ }
            };
            _wsConnection.onerror = function () { console.log('[PicoClaw] OpenClaw WebSocket error'); };
            _wsConnection.onclose = function () {
                _wsConnection = null;
                console.log('[PicoClaw] Disconnected from OpenClaw');
            };
        } catch (e) {
            console.log('[PicoClaw] WebSocket not available: ' + e.message);
        }
    }

    /**
     * handleInstruction() — OpenClaw-Anweisung empfangen und ausfuehren
     * OpenClaw erreicht PicoClaws einzeln oder gemeinsam:
     *   { type:'instruct', target:'pc-knowledge', action:'semantic_search', params:{query:'XSS'} }
     *   { type:'instruct', target:'all', action:'status' }
     *   { type:'instruct', target:['pc-seo','pc-code-analyzer'], action:'analyze', params:{} }
     */
    async function handleInstruction(msg) {
        var targets = msg.target;
        var action = msg.action;
        var params = msg.params || {};
        var results = {};

        // Bestimme Ziel-Claws
        var targetClaws;
        if (targets === 'all') {
            targetClaws = REGISTRY;
        } else if (Array.isArray(targets)) {
            targetClaws = REGISTRY.filter(function (r) { return targets.indexOf(r.id) !== -1; });
        } else {
            targetClaws = REGISTRY.filter(function (r) { return r.id === targets; });
        }

        // Fuehre Aktion auf jedem Ziel-Claw aus
        for (var i = 0; i < targetClaws.length; i++) {
            var claw = targetClaws[i];
            try {
                if (action === 'status') {
                    results[claw.id] = { name: claw.name, capabilities: claw.capabilities, status: 'active' };
                } else if (claw.capabilities.indexOf(action) !== -1) {
                    var r = await execute(claw.id, action, params);
                    results[claw.id] = { status: 'ok', result: r };
                } else {
                    results[claw.id] = { status: 'skip', reason: action + ' not in capabilities' };
                }
            } catch (err) {
                results[claw.id] = { status: 'error', error: err.message };
            }
        }

        // Ergebnis an OpenClaw zurueck melden
        if (_wsConnection && _wsConnection.readyState === 1) {
            _wsConnection.send(JSON.stringify({
                type: 'instruction_result',
                instructionId: msg.id || null,
                results: results,
                module: _currentModule,
                timestamp: Date.now()
            }));
        }

        // Auch als Event im Frontend
        document.dispatchEvent(new CustomEvent('picoclaw:instruction', { detail: { instruction: msg, results: results } }));
        return results;
    }

    /**
     * dispatch() — Programmatisch einen oder mehrere Claws anweisen
     * Beispiele:
     *   PICOCLAW.dispatch('pc-seo', 'seo_scan', {url: '...'})      // Einzeln
     *   PICOCLAW.dispatch('all', 'status')                          // Alle
     *   PICOCLAW.dispatch(['pc-seo','pc-code-analyzer'], 'analyze') // Mehrere
     */
    async function dispatch(target, action, params) {
        return handleInstruction({ target: target, action: action, params: params || {} });
    }

    /**
     * getQueue() — Ausstehende Tasks anzeigen
     */
    function getQueue() {
        return JSON.parse(localStorage.getItem('dkz-picoclaw-queue') || '[]');
    }

    /**
     * isConnected() — Ist PicoClaw mit OpenClaw verbunden?
     */
    function isConnected() {
        return _wsConnection !== null && _wsConnection.readyState === 1;
    }

    // ========================================
    // BUILDER TOOL DEFINITION
    // Fuer Workflow/Agent/Loop/Team Builder
    // ========================================
    const BUILDER_TOOL = {
        id: 'picoclaw',
        name: 'PicoClaw',
        icon: '🐾',
        category: 'ai-tools',
        desc: 'Kontextbezogenes Wissens- und Automatisierungs-Werkzeug',
        inputs: [
            { name: 'claw', type: 'select', options: REGISTRY.map(function (r) { return { value: r.id, label: r.icon + ' ' + r.name }; }), desc: 'PicoClaw Micro-Agent' },
            { name: 'action', type: 'text', desc: 'Aktion (z.B. semantic_search, lint, seo_scan)' },
            { name: 'query', type: 'text', desc: 'Suchanfrage oder Parameter' }
        ],
        outputs: ['result', 'source', 'claw'],
        execute: function (inputs) { return execute(inputs.claw, inputs.action, { query: inputs.query }); }
    };

    // Register as available tool for builders
    function registerInBuilder() {
        // Workflow Builder
        var wfTools = JSON.parse(localStorage.getItem('dkz-workflow-tools') || '[]');
        if (!wfTools.find(function (t) { return t.id === 'picoclaw'; })) {
            wfTools.push({ id: 'picoclaw', name: '🐾 PicoClaw', category: 'ai', capabilities: REGISTRY.map(function (r) { return r.id; }) });
            localStorage.setItem('dkz-workflow-tools', JSON.stringify(wfTools));
        }

        // Agent Builder
        var agentTools = JSON.parse(localStorage.getItem('dkz-agent-tools') || '[]');
        if (!agentTools.find(function (t) { return t.id === 'picoclaw'; })) {
            agentTools.push({
                id: 'picoclaw', name: '🐾 PicoClaw', type: 'knowledge-agent',
                claws: REGISTRY.map(function (r) { return { id: r.id, name: r.name, icon: r.icon }; })
            });
            localStorage.setItem('dkz-agent-tools', JSON.stringify(agentTools));
        }

        // Loop Dashboard
        var loopTools = JSON.parse(localStorage.getItem('dkz-loop-tools') || '[]');
        if (!loopTools.find(function (t) { return t.id === 'picoclaw'; })) {
            loopTools.push({ id: 'picoclaw', name: '🐾 PicoClaw', actions: ['search', 'analyze', 'lint', 'seo_scan'] });
            localStorage.setItem('dkz-loop-tools', JSON.stringify(loopTools));
        }

        // Team Builder (BMAD)
        var teamTools = JSON.parse(localStorage.getItem('dkz-team-tools') || '[]');
        if (!teamTools.find(function (t) { return t.id === 'picoclaw'; })) {
            teamTools.push({ id: 'picoclaw', name: '🐾 PicoClaw', role: 'knowledge-specialist', claws: 8 });
            localStorage.setItem('dkz-team-tools', JSON.stringify(teamTools));
        }
    }

    // ========================================
    // INJECT: Mini-Panel in jedes Modul
    // ========================================
    function injectPanel() {
        if (document.getElementById('picoclaw-panel')) return;

        detectModule();
        var ctx = getContextHelp();

        var panel = document.createElement('div');
        panel.id = 'picoclaw-panel';
        panel.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:9998;';

        // Badge
        var clawCount = ctx.claws.length;
        var clawIcons = ctx.claws.map(function (c) { return c.icon; }).join('');
        panel.innerHTML =
            '<div id="picoclaw-badge" onclick="DkzPicoClaw.togglePanel()" style="cursor:pointer;padding:6px 12px;background:var(--card,#1a1a1c);border:1px solid var(--border,#333);border-radius:20px;display:inline-flex;align-items:center;gap:6px;font-family:var(--font,Inter,sans-serif);font-size:11px;font-weight:700;color:var(--text,#f6f6f7)">' +
            '<span style="font-size:13px">🐾</span>PicoClaw ' + clawCount + '</div>' +
            '<div id="picoclaw-detail" style="display:none;margin-top:6px;width:280px;background:var(--card,#1a1a1c);border:1px solid var(--border,#333);border-radius:12px;padding:12px;font-family:var(--font,Inter,sans-serif)">' +
            '<div style="font-size:11px;font-weight:800;margin-bottom:8px">🐾 PicoClaw — ' + (_currentModule || 'Global') + '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">' +
            ctx.claws.map(function (c) {
                return '<div style="padding:3px 8px;border:1px solid var(--border,#333);border-radius:6px;font-size:9px;font-weight:600;background:rgba(255,255,255,.03);color:' + c.color + '">' + c.icon + ' ' + c.name + '</div>';
            }).join('') +
            '</div>' +
            '<div style="font-size:9px;color:var(--muted,#808080);margin-bottom:6px">Verfuegbare Aktionen:</div>' +
            ctx.hints.map(function (h) {
                return '<div style="font-size:10px;padding:3px 6px;margin-bottom:2px;color:var(--muted,#a0a0a5)">→ ' + h + '</div>';
            }).join('') +
            '<div style="margin-top:8px"><input type="text" id="picoclaw-cmd" placeholder="🐾 Befehl eingeben... (help fuer Liste)" style="width:100%;padding:6px 8px;background:rgba(0,0,0,.4);border:1px solid var(--border,#333);border-radius:6px;color:var(--text,#f6f6f7);font-size:11px;font-family:\'JetBrains Mono\',monospace" onkeyup="if(event.key===\'Enter\')DkzPicoClaw.runFromPanel(this.value,this)"></div>' +
            '<div id="picoclaw-results" style="margin-top:6px;max-height:150px;overflow:auto"></div>' +
            '</div>';

        document.body.appendChild(panel);
    }

    function togglePanel() {
        var d = document.getElementById('picoclaw-detail');
        if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none';
    }

    async function runFromPanel(input, inputEl) {
        var el = document.getElementById('picoclaw-results');
        if (!el || !input) return;
        el.innerHTML = '<div style="font-size:10px;color:#808080">🐾 Ausfuehren...</div>';

        var result = await run(input);
        var html = '';
        if (result.error) {
            html = '<div style="font-size:10px;color:#fa6b8a;padding:4px 6px">❌ ' + result.error + '</div>';
        } else if (result.commands) {
            result.commands.forEach(function (c) {
                html += '<div style="font-size:10px;padding:2px 6px;color:var(--text,#f6f6f7)"><span style="color:#55ACEE;font-weight:700">' + c.split(' — ')[0] + '</span> — ' + (c.split(' — ')[1] || '') + '</div>';
            });
        } else if (result.claws) {
            result.claws.forEach(function (c) {
                html += '<div style="font-size:9px;padding:2px 6px;color:var(--muted,#a0a0a5)">' + c + '</div>';
            });
        } else {
            html = '<div style="font-size:10px;padding:4px 6px;background:rgba(0,208,132,.08);border-radius:4px;color:#00ff88">✅ ' + (result.result || JSON.stringify(result).substring(0, 120)) + '</div>';
            if (result.source) html += '<div style="font-size:8px;color:#808080;padding:2px 6px">via ' + result.source + '</div>';
        }
        el.innerHTML = html;
        if (inputEl) inputEl.value = '';
    }

    // Keep quickSearch for backwards compatibility
    async function quickSearch(query) { return runFromPanel('search ' + query); }

    // ========================================
    // INIT
    // ========================================
    function init() {
        detectModule();
        registerInBuilder();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () { setTimeout(injectPanel, 600); });
        } else {
            setTimeout(injectPanel, 600);
        }
    }

    init();

    // ========================================
    // PUBLIC API
    // ========================================
    return {
        version: VERSION,
        // Token + Connection
        setToken: setToken,
        getToken: getToken,
        setGateway: setGateway,
        getGateway: getGateway,
        getConnectionStatus: getConnectionStatus,
        testConnection: testConnection,
        autoReconnect: autoReconnect,
        // REST API (OpenClaw Endpoints)
        restChat: restChat,
        restInvoke: restInvoke,
        webhook: webhook,
        wake: wake,
        // Command Interface (OpenClaws verlaengerter Arm)
        run: run,
        delegate: delegate,
        dispatch: dispatch,
        connectToOpenClaw: connectToOpenClaw,
        isConnected: isConnected,
        getQueue: getQueue,
        COMMANDS: COMMANDS,
        // Core
        search: search,
        execute: execute,
        getContextHelp: getContextHelp,
        detectModule: detectModule,
        // UI
        injectPanel: injectPanel,
        togglePanel: togglePanel,
        quickSearch: quickSearch,
        runFromPanel: runFromPanel,
        // Builder
        BUILDER_TOOL: BUILDER_TOOL,
        registerInBuilder: registerInBuilder,
        // Data
        REGISTRY: REGISTRY,
        MODULE_CONTEXT: MODULE_CONTEXT
    };
})();

if (typeof window !== 'undefined') window.DkzPicoClaw = DkzPicoClaw;
if (typeof window !== 'undefined') window.PICOCLAW = DkzPicoClaw; // Alias
