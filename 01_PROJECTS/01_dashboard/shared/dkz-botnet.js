/**
 * DkZ BotNet Monitor -- Frontend Bridge v1.0
 * @DKZ:TAG → [FRONTEND:botnet] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 *
 * Read-only Monitor fuer das interne Agent-Netzwerk.
 * Zeigt Live-Feed, Channels, Agent-Status, Training-Dashboard.
 *
 * Einbinden: <script src="../../shared/dkz-botnet.js"></script>
 */
const DkzBotNet = (() => {
    'use strict';

    const VERSION = '1.0.0';
    var _ws = null;
    var _feed = [];
    var _agents = [];
    var _channels = [];
    var _courses = [];
    var _connected = false;
    var _maxFeed = 200;

    // ========================================
    // CONNECT: WebSocket zum BotNet
    // ========================================
    function connect(url) {
        url = url || 'ws://localhost:3040/botnet';
        try {
            _ws = new WebSocket(url);
            _ws.onopen = function () {
                _connected = true;
                console.log('[BotNet Monitor] Connected');
                // Request initial state
                _ws.send(JSON.stringify({ type: 'monitor:init' }));
            };
            _ws.onmessage = function (e) {
                try {
                    var msg = JSON.parse(e.data);
                    if (msg.type === 'state') {
                        _agents = msg.agents || [];
                        _channels = msg.channels || [];
                        _courses = msg.courses || [];
                    }
                    if (msg.type === 'message' || msg.type === 'msg') {
                        _feed.push(msg.data || msg);
                        if (_feed.length > _maxFeed) _feed = _feed.slice(-_maxFeed);
                        document.dispatchEvent(new CustomEvent('botnet:message', { detail: msg.data || msg }));
                    }
                    if (msg.type === 'training') {
                        document.dispatchEvent(new CustomEvent('botnet:training', { detail: msg.data }));
                    }
                } catch (err) { /* parse error */ }
            };
            _ws.onerror = function () { _connected = false; };
            _ws.onclose = function () { _connected = false; _ws = null; };
        } catch (e) {
            console.log('[BotNet Monitor] Connection failed');
        }
    }

    // ========================================
    // READ API (Monitor)
    // ========================================
    function getFeed(options) {
        options = options || {};
        var feed = _feed;
        if (options.channel) feed = feed.filter(function (m) { return m.channel === options.channel; });
        if (options.from) feed = feed.filter(function (m) { return m.from === options.from; });
        if (options.performative) feed = feed.filter(function (m) { return m.performative === options.performative; });
        if (options.limit) feed = feed.slice(-options.limit);
        return feed;
    }

    function getAgents() { return _agents; }
    function getChannels() { return _channels; }
    function getCourses() { return _courses; }
    function isConnected() { return _connected; }

    // ========================================
    // PERFORMATIVE ICONS (for display)
    // ========================================
    var PERF_ICONS = {
        REQUEST: '📨', INFORM: '📢', QUERY: '❓',
        PROPOSE: '💡', DISCUSS: '💬', REPORT: '📋', TRADE: '🤝'
    };

    // ========================================
    // RENDER: Message formatter
    // ========================================
    function formatMessage(msg) {
        var icon = PERF_ICONS[msg.performative] || '📩';
        var time = new Date(msg.timestamp).toLocaleTimeString('de-DE');
        return icon + ' [' + time + '] ' + msg.from + ' → ' +
            (msg.to || msg.channel || '?') + ': ' +
            (typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content).substring(0, 120));
    }

    // ========================================
    // ADMIN: Befehle senden (nur BAZE²)
    // ========================================
    function sendCommand(cmd) {
        if (!_ws || !_connected) return { error: 'Nicht verbunden' };
        _ws.send(JSON.stringify({ type: 'admin:command', command: cmd }));
        return { ok: true };
    }

    // ========================================
    // INJECTABLE MINI-PANEL (optional)
    // ========================================
    function injectMonitor() {
        if (document.getElementById('botnet-monitor')) return;

        var panel = document.createElement('div');
        panel.id = 'botnet-monitor';
        panel.style.cssText = 'position:fixed;bottom:50px;right:12px;z-index:9997;';

        panel.innerHTML =
            '<div id="botnet-badge" onclick="DkzBotNet.toggleMonitor()" style="cursor:pointer;padding:5px 10px;background:var(--card,#1a1a1c);border:1px solid var(--border,#333);border-radius:16px;display:inline-flex;align-items:center;gap:5px;font-family:var(--font,Inter,sans-serif);font-size:10px;font-weight:700;color:var(--text,#f6f6f7)">' +
            '<span style="width:6px;height:6px;border-radius:50%;background:' + (_connected ? '#00ff88' : '#fa1e4e') + '"></span>' +
            '🌐 BotNet</div>' +
            '<div id="botnet-detail" style="display:none;margin-top:4px;width:320px;max-height:300px;overflow:auto;background:var(--card,#1a1a1c);border:1px solid var(--border,#333);border-radius:10px;padding:10px;font-family:\'JetBrains Mono\',monospace;font-size:9px">' +
            '<div style="font-weight:800;margin-bottom:6px;color:var(--text,#f6f6f7)">🌐 BotNet Live Feed</div>' +
            '<div id="botnet-feed" style="color:var(--muted,#808080)">Verbinde...</div>' +
            '</div>';

        document.body.appendChild(panel);

        // Auto-update feed
        setInterval(function () {
            var el = document.getElementById('botnet-feed');
            if (!el) return;
            var recent = _feed.slice(-8);
            if (recent.length === 0) {
                el.innerHTML = '<div style="color:#808080">Keine Nachrichten</div>';
                return;
            }
            el.innerHTML = recent.map(function (m) {
                var icon = PERF_ICONS[m.performative] || '·';
                return '<div style="padding:1px 0;border-bottom:1px solid rgba(255,255,255,.03)">' +
                    icon + ' <span style="color:#55ACEE">' + (m.from || '?') + '</span> → ' +
                    '<span style="color:#a1a1aa">' + (m.to || m.channel || '') + '</span></div>';
            }).join('');
        }, 2000);
    }

    function toggleMonitor() {
        var d = document.getElementById('botnet-detail');
        if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none';
    }

    // ========================================
    // INIT
    // ========================================
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () { setTimeout(injectMonitor, 800); });
        } else {
            setTimeout(injectMonitor, 800);
        }
        // Auto-connect if NEXUZ is available
        setTimeout(function () { connect(); }, 1000);
    }

    init();

    // ========================================
    // PUBLIC API
    // ========================================
    return {
        version: VERSION,
        connect: connect,
        isConnected: isConnected,
        // Monitor
        getFeed: getFeed,
        getAgents: getAgents,
        getChannels: getChannels,
        getCourses: getCourses,
        formatMessage: formatMessage,
        // UI
        injectMonitor: injectMonitor,
        toggleMonitor: toggleMonitor,
        // Admin
        sendCommand: sendCommand,
        // Data
        PERF_ICONS: PERF_ICONS
    };
})();

if (typeof window !== 'undefined') window.DkzBotNet = DkzBotNet;
if (typeof window !== 'undefined') window.BOTNET = DkzBotNet;
