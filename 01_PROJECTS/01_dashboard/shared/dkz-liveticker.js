/**
 * DkZ™ LiveTicker v1.0
 * @DKZ:TAG → [SHARED:liveticker] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * ================================
 * Systemweiter Ökosystem Status-Ticker
 * Zeigt Live-Events als animierten Fußfließtext in JEDEM Modul.
 *
 * Features:
 *   - Cross-Tab Synchronisation via localStorage + StorageEvent
 *   - Glassmorphism Footer mit scrollendem Marquee
 *   - Jedes Modul kann Events publishen
 *   - NanoBot, Q-Loop, CodeRabbit Events werden automatisch geloggt
 *
 * API:
 *   DkzTicker.publish(msg, agent)    → Event veröffentlichen
 *   DkzTicker.getHistory(n)          → Letzte n Events
 *   DkzTicker.toggle()               → Footer ein/ausblenden
 *   DkzTicker.clear()                → Historie leeren
 *
 * Speicher: localStorage (dkz-ticker-feed)
 * Einbindung: <script src="shared/dkz-liveticker.js"></script>
 */

(function() {
    'use strict';

    var STORAGE_KEY = 'dkz-ticker-feed';
    var MAX_ITEMS = 30;
    var VERSION = '1.0.0';

    // === XSS-Schutz ===
    function esc(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // === Daten laden / speichern ===
    function loadFeed() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch(e) {
            return [];
        }
    }

    function saveFeed(feed) {
        try {
            if (feed.length > MAX_ITEMS) feed = feed.slice(-MAX_ITEMS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(feed));
        } catch(e) {
            // Silenter Fehler — Offline-First
        }
    }

    // === Zeitformat ===
    function timeStr() {
        var d = new Date();
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    // === Agent Icons ===
    var agentIcons = {
        system: '⚙️',
        nanobot: '🤖',
        coderabbit: '🐰',
        autoresearch: '🔬',
        james: '🎯',
        stitch: '🪡',
        nanobanna: '🍌',
        picoclaw: '🐾',
        qloop: '♾️',
        user: '👤'
    };

    // === Agent Colors ===
    var agentColors = {
        system: '#00ff88',
        nanobot: '#fa1e4e',
        coderabbit: '#ff3b5c',
        autoresearch: '#3b82f6',
        james: '#ffb800',
        stitch: '#a855f7',
        nanobanna: '#d4a843',
        picoclaw: '#00ff88',
        qloop: '#00ff88',
        user: '#e8e8ec'
    };

    // === Footer UI rendern ===
    var footerEl = null;
    var tickerEl = null;
    var visible = true;

    function injectStyles() {
        if (document.getElementById('dkz-ticker-styles')) return;
        var style = document.createElement('style');
        style.id = 'dkz-ticker-styles';
        style.textContent = [
            '#dkz-ticker-footer{position:fixed;bottom:0;left:0;right:0;z-index:9980;height:32px;background:rgba(6,6,8,.92);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,.04);display:flex;align-items:center;overflow:hidden;transition:transform .3s ease,opacity .3s ease;font-family:"Inter",sans-serif;}',
            '#dkz-ticker-footer.hidden{transform:translateY(100%);opacity:0;pointer-events:none;}',
            '#dkz-ticker-label{padding:0 12px;font-size:9px;font-weight:800;letter-spacing:1.5px;color:rgba(250,30,78,.7);font-family:"JetBrains Mono",monospace;white-space:nowrap;flex-shrink:0;border-right:1px solid rgba(255,255,255,.06);}',
            '#dkz-ticker-content{flex:1;overflow:hidden;white-space:nowrap;position:relative;mask-image:linear-gradient(90deg,transparent 0%,#000 5%,#000 95%,transparent 100%);-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 5%,#000 95%,transparent 100%);}',
            '#dkz-ticker-marquee{display:inline-flex;gap:32px;animation:dkz-ticker-scroll 40s linear infinite;padding-left:100%;}',
            '#dkz-ticker-marquee:hover{animation-play-state:paused;}',
            '.dkz-ticker-item{display:inline-flex;align-items:center;gap:6px;font-size:11px;white-space:nowrap;cursor:default;}',
            '.dkz-ticker-time{font-size:9px;color:rgba(255,255,255,.25);font-family:"JetBrains Mono",monospace;}',
            '.dkz-ticker-agent{font-weight:700;font-size:10px;}',
            '.dkz-ticker-msg{color:rgba(255,255,255,.55);}',
            '.dkz-ticker-dot{width:4px;height:4px;border-radius:50%;background:#00ff88;flex-shrink:0;box-shadow:0 0 4px rgba(0,255,136,.4);animation:dkz-ticker-pulse 2s ease infinite;}',
            '#dkz-ticker-toggle{position:fixed;bottom:36px;right:12px;z-index:9981;width:24px;height:24px;border-radius:6px;background:rgba(6,6,8,.85);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.06);color:rgba(255,255,255,.3);font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;font-family:"Inter",sans-serif;}',
            '#dkz-ticker-toggle:hover{color:#fa1e4e;border-color:rgba(250,30,78,.3);background:rgba(250,30,78,.05);}',
            '#dkz-ticker-toggle.collapsed{bottom:8px;}',
            '@keyframes dkz-ticker-scroll{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}',
            '@keyframes dkz-ticker-pulse{0%,100%{opacity:1;}50%{opacity:.3;}}',
            'body.dkz-has-ticker{padding-bottom:32px;}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function renderFooter() {
        if (document.getElementById('dkz-ticker-footer')) return;

        // Footer
        footerEl = document.createElement('div');
        footerEl.id = 'dkz-ticker-footer';

        var label = document.createElement('div');
        label.id = 'dkz-ticker-label';
        label.innerHTML = '<span class="dkz-ticker-dot"></span> LIVE';
        footerEl.appendChild(label);

        var content = document.createElement('div');
        content.id = 'dkz-ticker-content';
        tickerEl = document.createElement('div');
        tickerEl.id = 'dkz-ticker-marquee';
        content.appendChild(tickerEl);
        footerEl.appendChild(content);

        document.body.appendChild(footerEl);
        document.body.classList.add('dkz-has-ticker');

        // Toggle Button
        var toggle = document.createElement('button');
        toggle.id = 'dkz-ticker-toggle';
        toggle.innerHTML = '▼';
        toggle.title = 'Ticker ein/ausblenden';
        toggle.onclick = function() {
            DkzTicker.toggle();
        };
        document.body.appendChild(toggle);

        // Initial füllen
        refreshMarquee();
    }

    function refreshMarquee() {
        if (!tickerEl) return;
        var feed = loadFeed();
        if (feed.length === 0) {
            tickerEl.innerHTML = '<span class="dkz-ticker-item"><span class="dkz-ticker-msg">Noch keine Events. Starte einen Q-Loop oder interagiere mit einem Modul...</span></span>';
            return;
        }

        // Doppelt für nahtloses Looping
        var html = '';
        var items = feed.slice(-10); // Letzte 10 Events
        for (var r = 0; r < 2; r++) {
            for (var i = 0; i < items.length; i++) {
                var ev = items[i];
                var icon = agentIcons[ev.agent] || '📡';
                var color = agentColors[ev.agent] || '#8a8a9a';
                html += '<span class="dkz-ticker-item">';
                html += '<span class="dkz-ticker-time">' + esc(ev.time || '') + '</span>';
                html += '<span class="dkz-ticker-agent" style="color:' + color + '">' + icon + ' ' + esc(ev.agent || 'system') + '</span>';
                html += '<span class="dkz-ticker-msg">' + esc(ev.msg || '') + '</span>';
                html += '</span>';
            }
        }
        tickerEl.innerHTML = html;

        // Dynamische Scroll-Geschwindigkeit
        var dur = Math.max(20, items.length * 6);
        tickerEl.style.animationDuration = dur + 's';
    }

    // === Cross-Tab Listener ===
    window.addEventListener('storage', function(e) {
        if (e.key === STORAGE_KEY) {
            refreshMarquee();
        }
    });

    // === Q-Loop Auto-Integration ===
    document.addEventListener('dkz:qloop:update', function(e) {
        if (e.detail && e.detail.newMsg) {
            DkzTicker.publish(e.detail.newMsg, e.detail.agent || 'qloop');
        }
    });

    // === Self-Learn Auto-Integration ===
    document.addEventListener('dkz:learn:rated', function(e) {
        if (e.detail) {
            DkzTicker.publish(e.detail.category + ': ' + e.detail.itemId + ' → ' + e.detail.score + '/5 bewertet', 'system');
        }
    });

    // === PUBLIC API ===
    var DkzTicker = {

        publish: function(msg, agent) {
            agent = agent || 'system';
            var feed = loadFeed();
            feed.push({
                msg: msg,
                agent: agent,
                time: timeStr(),
                timestamp: new Date().toISOString(),
                module: document.title.split('—')[0].trim()
            });
            saveFeed(feed);
            refreshMarquee();

            // Custom Event für lokale Listener
            document.dispatchEvent(new CustomEvent('dkz:ticker:new', {
                detail: { msg: msg, agent: agent }
            }));
        },

        getHistory: function(n) {
            var feed = loadFeed();
            return feed.slice(-(n || 10));
        },

        toggle: function() {
            visible = !visible;
            if (footerEl) {
                footerEl.classList.toggle('hidden', !visible);
            }
            var btn = document.getElementById('dkz-ticker-toggle');
            if (btn) {
                btn.innerHTML = visible ? '▼' : '▲';
                btn.classList.toggle('collapsed', !visible);
            }
            if (!visible) {
                document.body.classList.remove('dkz-has-ticker');
            } else {
                document.body.classList.add('dkz-has-ticker');
            }
        },

        clear: function() {
            saveFeed([]);
            refreshMarquee();
        },

        isVisible: function() {
            return visible;
        }
    };

    // === Global API ===
    window.DkzTicker = DkzTicker;

    // === Auto-Init ===
    function init() {
        injectStyles();
        renderFooter();

        // Startup-Event publishen
        var moduleName = document.title.split('—')[0].split('–')[0].trim();
        DkzTicker.publish(moduleName + ' geladen', 'system');

        console.log('[DkzTicker] v' + VERSION + ' geladen — ' + loadFeed().length + ' Events im Feed');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
