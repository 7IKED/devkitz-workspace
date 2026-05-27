/**
 * DkZ™ Console Panel v2.0
 * @DKZ:TAG → [SHARED:console] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * ========================
 * ESC-Taste öffnet/schließt eine Slide-Up Console am unteren Rand
 * Verfügbar in JEDEM Modul des DEVKiTZ™ Ökosystems
 *
 * v2.0 Änderungen:
 *   - ™ bei allen Produktnamen (ONTHERUN™, DEVKiTZ™, OpenClaw™, etc.)
 *   - Info-Popups an jedem Tab-Button (Hover-Tooltip)
 *   - Guide-System mit vollständigen Workflows pro Tab
 *   - Erweiterte Hilfe-Befehle
 *
 * Tabs:
 *   Terminal      → Shell/PowerShell Emulator
 *   Gemini CLI    → gemini-cli Anbindung
 *   Claude Code   → claude-code CLI
 *   GPT Codex     → codex CLI
 *   OpenCode      → opencode TUI
 *   OpenClaw™     → OpenClaw Agent Interface
 *   NLM CLI       → NotebookLM CLI
 *   ONTHERUN™     → MCP Dashboard mit Chat
 *
 * Shortcut: ESC = Toggle | Ctrl+` = Toggle
 */

(function() {
    'use strict';

    var CONSOLE_ID = 'dkz-esc-console';
    var STORAGE_KEY = 'dkz-console-state';
    var VERSION = '2.0.0';

    // Bereits initialisiert?
    if (document.getElementById(CONSOLE_ID)) return;

    // === XSS-Schutz ===
    function esc(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // === State ===
    function getState() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { open: false, activeTab: 'terminal', height: 280 }; }
        catch(e) { return { open: false, activeTab: 'terminal', height: 280 }; }
    }
    function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

    // === Tab Definitionen mit ™ + Info ===
    var TABS = [
        {
            id: 'terminal', icon: '\u2588', label: 'Terminal', color: '#00ff88', cmd: 'powershell',
            info: 'Shell-Emulation im Browser. Befehle werden lokal simuliert oder über ONTHERUN™ MCP geroutet.',
            guide: [
                '📋 Terminal — Workflow Guide',
                '═══════════════════════════════',
                '',
                '🔧 Verfügbare Befehle:',
                '  help          — Diese Hilfe anzeigen',
                '  clear / cls   — Ausgabe leeren',
                '  status        — Alle Verbindungen prüfen',
                '  version       — Console-Version anzeigen',
                '  tabs          — Alle Tabs auflisten',
                '  switch <tab>  — Zu anderem Tab wechseln',
                '  learn         — Self-Learning Statistiken',
                '  guide         — Diesen Guide anzeigen',
                '  exit / close  — Console schließen',
                '',
                '💡 Tipps:',
                '  • Für echte Shell-Befehle → switch ontherun',
                '  • Pfeiltasten ↑↓ für Command History',
                '  • ESC schließt die Console jederzeit',
                '  • Ctrl+` öffnet/schließt alternativ',
                '  • Oberkante ziehen = Größe ändern'
            ]
        },
        {
            id: 'gemini', icon: '\u2728', label: 'Gemini CLI', color: '#4285F4', cmd: 'gemini',
            info: 'Google Gemini 2.5 Chat via PicoClaw™ Bridge. Ideal für Code-Analyse, Recherche und Textgenerierung.',
            guide: [
                '🔮 Gemini CLI — Workflow Guide',
                '═══════════════════════════════',
                '',
                '🔧 Befehle:',
                '  <frage>         — Direkte Frage an Gemini 2.5 Flash',
                '  help            — Befehls-Übersicht',
                '  guide           — Diesen Guide anzeigen',
                '  status          — Verbindungsstatus prüfen',
                '',
                '📋 Workflows:',
                '  1. Code-Review:  Füge Code ein → Gemini analysiert',
                '  2. Recherche:    Stelle Fragen → Gemini recherchiert',
                '  3. Übersetzung:  "Übersetze: <text>" → DE/EN/etc.',
                '  4. Refactoring:  "Refactore: <code>" → Verbessert',
                '  5. Erklärung:    "Erkläre: <konzept>" → Verständlich',
                '',
                '⚙️ Voraussetzungen:',
                '  • PicoClaw™ Bridge muss geladen sein (dkz-picoclaw.js)',
                '  • API-Key in Settings → AI Stack konfiguriert',
                '  • Gateway: Standard localhost:3040',
                '',
                '💡 Tipps:',
                '  • Mehrzeilige Eingabe: Shift+Enter (geplant)',
                '  • Antworten bleiben im Tab-Verlauf erhalten',
                '  • "clear" leert den Verlauf'
            ]
        },
        {
            id: 'claude', icon: '\ud83e\udde0', label: 'Claude Code', color: '#D97706', cmd: 'claude',
            info: 'Anthropic Claude Sonnet 4 für Code-Generierung und Analyse. Über PicoClaw™ Bridge verbunden.',
            guide: [
                '🧠 Claude Code — Workflow Guide',
                '════════════════════════════════',
                '',
                '🔧 Befehle:',
                '  <aufgabe>       — Direkte Aufgabe an Claude Sonnet 4',
                '  help            — Befehls-Übersicht',
                '  guide           — Diesen Guide anzeigen',
                '',
                '📋 Workflows:',
                '  1. Code schreiben:  "Erstelle eine Funktion die..."',
                '  2. Bug finden:      "Finde den Bug in: <code>"',
                '  3. Tests:           "Schreibe Tests für: <funktion>"',
                '  4. Dokumentation:   "Dokumentiere: <code>"',
                '  5. Architektur:     "Plane Architektur für: <feature>"',
                '',
                '⚙️ Voraussetzungen:',
                '  • PicoClaw™ Bridge aktiv',
                '  • Anthropic API-Key konfiguriert',
                '',
                '💡 Tipps:',
                '  • Claude ist stark bei komplexem Reasoning',
                '  • Ideal für mehrstufige Code-Aufgaben',
                '  • Kontext bleibt pro Session erhalten'
            ]
        },
        {
            id: 'codex', icon: '\u26a1', label: 'GPT Codex', color: '#00A67E', cmd: 'codex',
            info: 'OpenAI GPT-4.1 Interface für Code-Tasks, Completion und Debugging. Via PicoClaw™ Bridge.',
            guide: [
                '⚡ GPT Codex — Workflow Guide',
                '══════════════════════════════',
                '',
                '🔧 Befehle:',
                '  <prompt>        — Direkte Eingabe an GPT-4.1',
                '  help            — Befehls-Übersicht',
                '  guide           — Diesen Guide anzeigen',
                '',
                '📋 Workflows:',
                '  1. Code-Completion:  Gib Anfang ein → GPT vervollständigt',
                '  2. Debugging:        "Debug: <fehlermeldung>"',
                '  3. Konvertierung:    "Konvertiere <code> von X nach Y"',
                '  4. Optimierung:      "Optimiere: <code>"',
                '  5. API-Design:       "Designe REST API für: <feature>"',
                '',
                '⚙️ Voraussetzungen:',
                '  • PicoClaw™ Bridge aktiv',
                '  • OpenAI API-Key konfiguriert',
                '',
                '💡 Tipps:',
                '  • GPT-4.1 ist ideal für schnelle Code-Completion',
                '  • Gut für Einzeiler und kurze Snippets',
                '  • Kombination mit Claude für komplexe Tasks'
            ]
        },
        {
            id: 'opencode', icon: '\ud83d\udcbb', label: 'OpenCode', color: '#6366f1', cmd: 'opencode',
            info: 'AI Coding TUI — Terminal-UI für lokale Code-Bearbeitung. Starte mit "npx opencode" im echten Terminal.',
            guide: [
                '💻 OpenCode — Workflow Guide',
                '═════════════════════════════',
                '',
                '🔧 Befehle:',
                '  help            — Befehls-Übersicht',
                '  guide           — Diesen Guide anzeigen',
                '',
                '📋 Workflows:',
                '  1. Start:         npx opencode (im echten Terminal)',
                '  2. Datei öffnen:  opencode open <datei>',
                '  3. Projekt:       opencode init (neues Projekt)',
                '  4. Chat:          Inline-Chat im Editor',
                '',
                '⚙️ Hinweis:',
                '  • OpenCode läuft als TUI im echten Terminal',
                '  • Dieser Tab bietet Statusübersicht',
                '  • Für echte Nutzung: Terminal öffnen',
                '',
                '💡 Tipps:',
                '  • "switch terminal" für Shell-Zugriff',
                '  • Oder "switch ontherun" für Remote-Befehle'
            ]
        },
        {
            id: 'openclaw', icon: '\ud83d\udc3e', label: 'OpenClaw\u2122', color: '#00e5ff', cmd: 'openclaw',
            info: 'OpenClaw™ Agent Gateway — Zentraler Einstiegspunkt für alle KI-Agenten im DEVKiTZ™ Ökosystem.',
            guide: [
                '🐾 OpenClaw™ — Workflow Guide',
                '══════════════════════════════',
                '',
                '🔧 Befehle:',
                '  <befehl>        — Agent-Befehl über PicoClaw™ senden',
                '  help            — Befehls-Übersicht',
                '  guide           — Diesen Guide anzeigen',
                '  status          — Gateway-Verbindung prüfen',
                '',
                '📋 Workflows:',
                '  1. Agent starten:    "agent start <name>"',
                '  2. Task erstellen:   "task create <beschreibung>"',
                '  3. Status prüfen:    "agent status"',
                '  4. Logs abrufen:     "logs <agent>"',
                '  5. Gateway-Sync:     "sync"',
                '',
                '🔗 Gateway-Architektur:',
                '  • OpenClaw™ ist NUR Gateway — keine eigene Logik',
                '  • Routed an: Gemini, Claude, GPT, ONTHERUN™',
                '  • Self-Learning Feedback via Event: dkz:learn:rated',
                '  • Token in Settings → AI Stack konfigurieren',
                '',
                '⚙️ Voraussetzungen:',
                '  • PicoClaw™ Bridge aktiv (dkz-picoclaw.js)',
                '  • OpenClaw Token gesetzt',
                '',
                '💡 Tipps:',
                '  • OpenClaw™ merkt sich keine Daten selbst (R41)',
                '  • Alles wird an das DEVKiTZ™ Ökosystem delegiert',
                '  • Ideal für Multi-Agent Orchestrierung'
            ]
        },
        {
            id: 'nlm', icon: '\ud83d\udcd3', label: 'NLM CLI', color: '#ec4899', cmd: 'notebooklm',
            info: 'NotebookLM CLI — Notebooks erstellen, Podcasts generieren, Mind Maps bauen. Batch-Generierung möglich.',
            guide: [
                '📓 NLM CLI — Workflow Guide',
                '════════════════════════════',
                '',
                '🔧 Befehle:',
                '  help            — Befehls-Übersicht',
                '  guide           — Diesen Guide anzeigen',
                '',
                '📋 Workflows:',
                '  1. Notebook erstellen:  /nlm-batch <thema>',
                '  2. Podcast:             nlm podcast <thema>',
                '  3. Mind Map:            nlm mindmap <thema>',
                '  4. Zusammenfassung:     nlm summary <quelle>',
                '  5. Batch-Generierung:   Alle Content-Typen auf einmal',
                '',
                '📦 Content-Typen:',
                '  • 📝 Study Guide    — Lernmaterial',
                '  • 🎙️ Podcast       — Audio Deep Dive',
                '  • 💡 FAQ            — Häufige Fragen',
                '  • 🗺️ Mind Map      — Visuelle Übersicht',
                '  • 📋 Briefing Doc   — Executive Summary',
                '  • ⏱️ Timeline       — Chronologisch',
                '',
                '⚙️ Workflow: /nlm-batch',
                '  Nutze den /nlm-batch Workflow für Batch-Generierung',
                '  → Erstellt alle Content-Typen automatisch',
                '  → Download als ZIP auf Desktop',
                '',
                '💡 Tipps:',
                '  • NLM Cheatsheet: .gemini/antigravity/NLM-CHEATSHEET.md',
                '  • Ideal für Wissensaufbereitung',
                '  • Podcasts sind besonders beliebt'
            ]
        },
        {
            id: 'ontherun', icon: '\ud83d\ude80', label: 'ONTHERUN\u2122', color: '#fa1e4e', cmd: 'mcp-chat',
            info: 'ONTHERUN™ MCP Dashboard — 34+ Tools über Model Context Protocol. Chat + API-Zugriff.',
            guide: [
                '🚀 ONTHERUN™ MCP — Workflow Guide',
                '═══════════════════════════════════',
                '',
                '🔧 Befehle:',
                '  <befehl>        — MCP Tool aufrufen',
                '  help            — Befehls-Übersicht',
                '  guide           — Diesen Guide anzeigen',
                '  status          — Server-Status prüfen',
                '',
                '📋 Verfügbare Tool-Kategorien:',
                '  1. 📁 Dateisystem:  read, write, list, search',
                '  2. 🔍 Suche:        web-search, code-search',
                '  3. 🤖 KI:           chat, analyze, summarize',
                '  4. 🔧 System:       shell, env, process',
                '  5. 📊 Daten:        duckdb, iceberg, query',
                '  6. 🌐 Web:          fetch, screenshot, scrape',
                '  7. 📝 Docs:         markdown, pdf, convert',
                '  8. 🔄 Git:          status, commit, diff, log',
                '',
                '🔗 Server-Konfiguration:',
                '  • Gateway URL: Settings → Verbindungen → NEXUZ',
                '  • Standard: http://localhost:3040',
                '  • API Endpunkt: /api/tools',
                '',
                '📋 Beispiel-Workflows:',
                '  1. Datei lesen:     "read ./README.md"',
                '  2. Web-Suche:       "search DEVKiTZ tutorials"',
                '  3. Code-Analyse:    "analyze ./shared/dkz-console.js"',
                '  4. Git Status:      "git status"',
                '  5. Datenbank:       "query SELECT * FROM modules"',
                '',
                '⚙️ Voraussetzungen:',
                '  • ONTHERUN™ Server muss laufen (Node.js)',
                '  • Start: cd ONTHERUN && npm start',
                '  • Gateway URL in Settings konfiguriert',
                '',
                '💡 Tipps:',
                '  • ONTHERUN™ ist der mächtigste Tab',
                '  • Zugriff auf alle 34+ MCP Tools',
                '  • Kombiniere mit Self-Learning (R41)'
            ]
        },
        {
            id: 'apicontrol', icon: '\ud83d\udd11', label: 'API Control', color: '#ffb800', cmd: 'api',
            info: 'ONTHERUN\u2122 API Control \u2014 API-Keys, Model-Auswahl, Ampel-System, Cost-Viewer f\u00fcr alle 18+ LLM Provider.',
            guide: [
                '\ud83d\udd11 API Control \u2014 Workflow Guide',
                '\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550',
                '',
                '\ud83d\udd27 Befehle:',
                '  keys            \u2014 Alle gespeicherten API-Keys anzeigen',
                '  set <provider>  \u2014 API-Key f\u00fcr Provider setzen',
                '  test <provider> \u2014 Provider-Verbindung testen',
                '  costs           \u2014 Session-Kosten anzeigen',
                '  models          \u2014 Verf\u00fcgbare Modelle auflisten',
                '  ampel           \u2014 Ampel-Matrix anzeigen',
                '  pricing         \u2014 Preisvergleich sortiert',
                '  help            \u2014 Befehls-\u00dcbersicht',
                '  guide           \u2014 Diesen Guide anzeigen',
                '',
                '\ud83d\udea6 Ampel-System:',
                '  \ud83d\udfe2 Gr\u00fcn  = Ideal f\u00fcr diesen Anwendungsbereich',
                '  \ud83d\udfe1 Gelb  = Geht, nicht optimal',
                '  \ud83d\udd34 Rot   = Nicht empfohlen',
                '',
                '  Bereiche: Code | Chat | Research | Vision | Speed',
                '',
                '\ud83d\udcb0 Cost-Viewer:',
                '  \u2022 Echtzeit-Preise pro Provider ($/1M Tokens)',
                '  \u2022 Session-Tracker z\u00e4hlt genutzte Tokens',
                '  \u2022 KOSTENLOS: HuggingFace, NVIDIA, vLLM Local, GitHub Copilot',
                '',
                '\ud83d\udca1 Tipps:',
                '  \u2022 Keys werden als Cookies gespeichert (1 Jahr)',
                '  \u2022 \u00c4nderungen gelten sofort im Copilot',
                '  \u2022 OpenRouter + HuggingFace sind Multi-Model Gateways',
                '  \u2022 "pricing" zeigt Preisvergleich sortiert'
            ]
        }
    ];

    // === Console Histories ===
    var histories = {};
    var cmdHistories = {};
    TABS.forEach(function(t) {
        histories[t.id] = [];
        cmdHistories[t.id] = { cmds: [], idx: -1 };
    });

    // === CSS injizieren ===
    var style = document.createElement('style');
    style.textContent = [
        '#' + CONSOLE_ID + '{position:fixed;bottom:0;left:0;right:0;z-index:99999;transform:translateY(100%);transition:transform .25s cubic-bezier(.4,0,.2,1);font-family:"JetBrains Mono","Fira Code",monospace}',
        '#' + CONSOLE_ID + '.open{transform:translateY(0)}',
        '.dkz-con-header{display:flex;align-items:center;background:#0d0d12;border-top:2px solid #fa1e4e;padding:0 8px;height:32px;cursor:ns-resize;user-select:none}',
        '.dkz-con-tabs{display:flex;gap:1px;flex:1;overflow-x:auto}',
        '.dkz-con-tab{padding:4px 10px;font-size:11px;font-weight:600;color:#8a8a9a;background:transparent;border:none;cursor:pointer;font-family:inherit;white-space:nowrap;border-bottom:2px solid transparent;transition:all .15s;display:flex;align-items:center;gap:4px;position:relative}',
        '.dkz-con-tab:hover{color:#e8e8ec;background:rgba(255,255,255,.04)}',
        '.dkz-con-tab.active{color:#fff;border-bottom-color:var(--tab-color,#fa1e4e)}',
        '.dkz-con-tab .tab-dot{width:6px;height:6px;border-radius:50%;background:var(--tab-color,#8a8a9a)}',
        /* Info-Popup Tooltip */
        '.dkz-con-tab .tab-info{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:rgba(13,13,18,0.96);border:1px solid rgba(250,30,78,0.3);border-radius:8px;padding:10px 14px;min-width:240px;max-width:320px;font-size:11px;font-weight:400;color:#c8c8d0;line-height:1.5;pointer-events:none;opacity:0;transition:opacity .2s,transform .2s;transform:translateX(-50%) translateY(4px);z-index:100000;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,0.5)}',
        '.dkz-con-tab:hover .tab-info{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto}',
        '.dkz-con-tab .tab-info::after{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);border:6px solid transparent;border-top-color:rgba(250,30,78,0.3)}',
        '.tab-info-title{font-weight:700;color:#fff;font-size:12px;margin-bottom:4px;display:flex;align-items:center;gap:6px}',
        '.tab-info-title .ti-dot{width:8px;height:8px;border-radius:50%;display:inline-block}',
        '.tab-info-desc{color:#a0a0b0;font-size:10px;line-height:1.5}',
        '.tab-info-hint{color:#6a6a7a;font-size:9px;margin-top:6px;border-top:1px solid rgba(255,255,255,0.06);padding-top:6px}',
        '.dkz-con-close{background:none;border:none;color:#8a8a9a;font-size:16px;cursor:pointer;padding:4px 8px;transition:color .15s}',
        '.dkz-con-close:hover{color:#ff3b5c}',
        '.dkz-con-body{background:#0a0a0f;height:248px;overflow:hidden;position:relative}',
        '.dkz-con-panel{position:absolute;inset:0;display:none;flex-direction:column}',
        '.dkz-con-panel.active{display:flex}',
        '.dkz-con-output{flex:1;overflow-y:auto;padding:8px 12px;font-size:12px;line-height:1.6;color:#c8c8d0;scrollbar-width:thin;scrollbar-color:#2a2a2e transparent}',
        '.dkz-con-output::-webkit-scrollbar{width:6px}',
        '.dkz-con-output::-webkit-scrollbar-thumb{background:#2a2a2e;border-radius:3px}',
        '.dkz-con-input-row{display:flex;align-items:center;border-top:1px solid #1a1a20;background:#08080d;padding:2px 8px}',
        '.dkz-con-prompt{font-size:11px;color:#00ff88;padding:4px;white-space:nowrap}',
        '.dkz-con-input{flex:1;background:transparent;border:none;outline:none;color:#e8e8ec;font-family:inherit;font-size:12px;padding:6px 4px;caret-color:#fa1e4e}',
        '.dkz-con-line{margin:0;white-space:pre-wrap;word-break:break-all}',
        '.dkz-con-line.cmd{color:#00ff88}',
        '.dkz-con-line.error{color:#ff3b5c}',
        '.dkz-con-line.info{color:#55ACEE}',
        '.dkz-con-line.system{color:#8a8a9a;font-style:italic}',
        '.dkz-con-line.accent{color:#fa1e4e;font-weight:700}',
        '.dkz-con-line.guide{color:#c8c8d0}',
        '.dkz-con-hint{position:absolute;bottom:36px;right:12px;font-size:9px;color:#4a4a5a;pointer-events:none}',
        '.dkz-con-resize{position:absolute;top:-3px;left:0;right:0;height:6px;cursor:ns-resize;z-index:1}'
    ].join('\n');
    document.head.appendChild(style);

    // === HTML bauen ===
    var console_el = document.createElement('div');
    console_el.id = CONSOLE_ID;

    var tabsHtml = TABS.map(function(t) {
        var infoPopup = '<div class="tab-info">' +
            '<div class="tab-info-title"><span class="ti-dot" style="background:' + t.color + '"></span>' + esc(t.label) + '</div>' +
            '<div class="tab-info-desc">' + esc(t.info) + '</div>' +
            '<div class="tab-info-hint">\ud83d\udca1 Tippe "guide" f\u00fcr den vollst\u00e4ndigen Workflow-Guide</div>' +
            '</div>';
        return '<button class="dkz-con-tab" data-tab="' + t.id + '" style="--tab-color:' + t.color + '">' +
               '<span class="tab-dot"></span>' + esc(t.label) + infoPopup + '</button>';
    }).join('');

    var panelsHtml = TABS.map(function(t) {
        var welcomeMsg = getWelcomeMessage(t);
        return '<div class="dkz-con-panel" id="dkz-con-panel-' + t.id + '">' +
               '<div class="dkz-con-output" id="dkz-con-out-' + t.id + '">' +
               '<p class="dkz-con-line system">' + esc(welcomeMsg) + '</p>' +
               '</div>' +
               '<div class="dkz-con-input-row">' +
               '<span class="dkz-con-prompt" id="dkz-con-prompt-' + t.id + '">' + getPromptLabel(t) + '</span>' +
               '<input class="dkz-con-input" id="dkz-con-input-' + t.id + '" placeholder="Befehl eingeben... (help / guide)" autocomplete="off" spellcheck="false">' +
               '</div>' +
               '<div class="dkz-con-hint">ESC schlie\u00dfen \u00b7 \u2191\u2193 History \u00b7 Tab wechseln \u00b7 "guide" f\u00fcr Hilfe</div>' +
               '</div>';
    }).join('');

    console_el.innerHTML =
        '<div class="dkz-con-resize" id="dkz-con-resize"></div>' +
        '<div class="dkz-con-header">' +
            '<div class="dkz-con-tabs">' + tabsHtml + '</div>' +
            '<button class="dkz-con-close" id="dkz-con-close" title="Schlie\u00dfen (ESC)">\u00d7</button>' +
        '</div>' +
        '<div class="dkz-con-body" id="dkz-con-body">' + panelsHtml + '</div>';

    document.body.appendChild(console_el);

    // === State wiederherstellen ===
    var state = getState();
    var activeTab = state.activeTab || 'terminal';

    function switchTab(tabId) {
        activeTab = tabId;
        console_el.querySelectorAll('.dkz-con-tab').forEach(function(t) {
            t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
        });
        console_el.querySelectorAll('.dkz-con-panel').forEach(function(p) {
            p.classList.toggle('active', p.id === 'dkz-con-panel-' + tabId);
        });
        var input = document.getElementById('dkz-con-input-' + tabId);
        if (input) setTimeout(function() { input.focus(); }, 50);
        state.activeTab = tabId;
        saveState(state);
    }

    function toggleConsole() {
        state.open = !console_el.classList.contains('open');
        console_el.classList.toggle('open', state.open);
        if (state.open) {
            var input = document.getElementById('dkz-con-input-' + activeTab);
            if (input) setTimeout(function() { input.focus(); }, 100);
        }
        saveState(state);
    }

    // === Tab Clicks ===
    console_el.querySelectorAll('.dkz-con-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            switchTab(this.getAttribute('data-tab'));
        });
    });

    // === Close Button ===
    document.getElementById('dkz-con-close').addEventListener('click', function() {
        toggleConsole();
    });

    // === ESC + Ctrl+` Global Shortcut ===
    document.addEventListener('keydown', function(e) {
        var tag = (e.target.tagName || '').toLowerCase();
        var isConsoleInput = e.target.classList.contains('dkz-con-input');

        if (e.key === 'Escape') {
            if (console_el.classList.contains('open')) {
                toggleConsole();
                e.preventDefault();
                return;
            }
            if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
                toggleConsole();
                e.preventDefault();
            }
        }
        if (e.ctrlKey && e.key === '`') {
            toggleConsole();
            e.preventDefault();
        }
    });

    // === Command Execution ===
    function addLine(tabId, text, cls) {
        var out = document.getElementById('dkz-con-out-' + tabId);
        if (!out) return;
        var p = document.createElement('p');
        p.className = 'dkz-con-line' + (cls ? ' ' + cls : '');
        p.textContent = text;
        out.appendChild(p);
        out.scrollTop = out.scrollHeight;
        histories[tabId].push({ text: text, cls: cls });
    }

    function showGuide(tabId) {
        var tabDef = TABS.find(function(t) { return t.id === tabId; });
        if (!tabDef || !tabDef.guide) return;
        tabDef.guide.forEach(function(line) {
            addLine(tabId, line, line.startsWith('═') || line.startsWith('─') ? 'accent' : 'guide');
        });
    }

    function processCommand(tabId, cmd) {
        var tabDef = TABS.find(function(t) { return t.id === tabId; });
        if (!tabDef) return;

        cmdHistories[tabId].cmds.push(cmd);
        cmdHistories[tabId].idx = cmdHistories[tabId].cmds.length;

        addLine(tabId, getPromptLabel(tabDef) + ' ' + cmd, 'cmd');

        var lower = cmd.toLowerCase().trim();

        // === Guide Befehl ===
        if (lower === 'guide' || lower === 'workflow' || lower === 'workflows') {
            showGuide(tabId);
            return;
        }

        if (lower === 'help' || lower === '?') {
            addLine(tabId, 'Verf\u00fcgbare Befehle:', 'info');
            addLine(tabId, '  help / ?        \u2014 Diese Hilfe', 'info');
            addLine(tabId, '  guide           \u2014 Vollst\u00e4ndiger Workflow-Guide f\u00fcr diesen Tab', 'info');
            addLine(tabId, '  clear / cls     \u2014 Ausgabe leeren', 'info');
            addLine(tabId, '  status          \u2014 Verbindungsstatus', 'info');
            addLine(tabId, '  version         \u2014 Version anzeigen', 'info');
            addLine(tabId, '  tabs            \u2014 Alle Tabs auflisten', 'info');
            addLine(tabId, '  switch <tab>    \u2014 Tab wechseln', 'info');
            addLine(tabId, '  learn           \u2014 Self-Learning Stats (R41)', 'info');
            addLine(tabId, '  shortcuts       \u2014 Alle Tastenkombinationen', 'info');
            addLine(tabId, '  features        \u2014 Alle Console-Features', 'info');
            addLine(tabId, '  exit / close    \u2014 Console schlie\u00dfen', 'info');
            return;
        }

        if (lower === 'shortcuts' || lower === 'keys' || lower === 'keybindings') {
            addLine(tabId, '\u2328\ufe0f  Tastenkombinationen:', 'accent');
            addLine(tabId, '  ESC             \u2014 Console \u00f6ffnen/schlie\u00dfen', 'info');
            addLine(tabId, '  Ctrl + `        \u2014 Console \u00f6ffnen/schlie\u00dfen (alternativ)', 'info');
            addLine(tabId, '  \u2191 Pfeiltaste    \u2014 Vorheriger Befehl (History)', 'info');
            addLine(tabId, '  \u2193 Pfeiltaste    \u2014 N\u00e4chster Befehl (History)', 'info');
            addLine(tabId, '  Enter           \u2014 Befehl ausf\u00fchren', 'info');
            addLine(tabId, '  Tab-Klick       \u2014 Zwischen Tabs wechseln', 'info');
            addLine(tabId, '  Hover auf Tab   \u2014 Info-Popup anzeigen', 'info');
            addLine(tabId, '  Oberkante ziehen\u2014 Console-H\u00f6he \u00e4ndern', 'info');
            return;
        }

        if (lower === 'features') {
            addLine(tabId, '\ud83d\udcca DEVKiTZ\u2122 Console v' + VERSION + ' \u2014 Features:', 'accent');
            addLine(tabId, '', '');
            addLine(tabId, '  \ud83d\udccc 8 CLI-Tabs  \u2014 Terminal, Gemini, Claude, GPT, OpenCode, OpenClaw\u2122, NLM, ONTHERUN\u2122', 'info');
            addLine(tabId, '  \ud83d\udca1 Info-Popups \u2014 Hover \u00fcber jeden Tab f\u00fcr Beschreibung', 'info');
            addLine(tabId, '  \ud83d\udcd6 Guide-System\u2014 "guide" zeigt vollst\u00e4ndigen Workflow-Guide', 'info');
            addLine(tabId, '  \u2b06\ufe0f  Resize     \u2014 Oberkante ziehen (Min 100px, Max 70%)', 'info');
            addLine(tabId, '  \ud83d\udccb History    \u2014 Pfeiltasten \u2191\u2193 pro Tab gespeichert', 'info');
            addLine(tabId, '  \ud83d\udcbe Persistenz \u2014 Offener Tab + H\u00f6he in localStorage', 'info');
            addLine(tabId, '  \ud83d\udc3e PicoClaw\u2122  \u2014 Bridge f\u00fcr Gemini/Claude/Codex', 'info');
            addLine(tabId, '  \ud83e\udde0 R41         \u2014 Self-Learning Integration via "learn"', 'info');
            addLine(tabId, '  \ud83d\ude80 ONTHERUN\u2122  \u2014 34+ MCP Tools via Gateway', 'info');
            addLine(tabId, '  \ud83d\udd12 XSS-Schutz \u2014 esc() f\u00fcr alle Ausgaben', 'info');
            return;
        }

        if (lower === 'clear' || lower === 'cls') {
            var out = document.getElementById('dkz-con-out-' + tabId);
            if (out) out.innerHTML = '';
            histories[tabId] = [];
            return;
        }

        if (lower === 'exit' || lower === 'close') {
            toggleConsole();
            return;
        }

        if (lower === 'version') {
            addLine(tabId, 'DEVKiTZ\u2122 Console v' + VERSION + ' | Tab: ' + tabDef.label + ' | CLI: ' + tabDef.cmd, 'info');
            return;
        }

        if (lower === 'status') {
            addLine(tabId, '\u250c\u2500\u2500 DEVKiTZ\u2122 Console Status \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', 'info');
            TABS.forEach(function(t) {
                addLine(tabId, '\u2502 \ud83d\udfe2 ' + t.label + ' (' + t.cmd + ')', 'info');
            });
            addLine(tabId, '\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', 'info');
            if (typeof PICOCLAW !== 'undefined') {
                addLine(tabId, '\ud83d\udc3e OpenClaw\u2122: Token = ' + (PICOCLAW.getToken ? (PICOCLAW.getToken() ? 'Ja' : 'Nein') : 'unbekannt'), 'info');
            }
            if (typeof DkzLearn !== 'undefined') {
                var stats = DkzLearn.dashboard();
                addLine(tabId, '\ud83e\udde0 Self-Learning: ' + stats.totalRatings + ' Bewertungen in ' + stats.totalCategories + ' Kategorien', 'info');
            }
            return;
        }

        if (lower === 'tabs') {
            TABS.forEach(function(t) {
                addLine(tabId, '  ' + t.icon + ' ' + t.id.padEnd(12) + t.label + ' (' + t.cmd + ')', 'info');
            });
            return;
        }

        if (lower.startsWith('switch ')) {
            var target = lower.replace('switch ', '').trim();
            var found = TABS.find(function(t) { return t.id === target; });
            if (found) {
                switchTab(found.id);
                addLine(found.id, '\u2192 Gewechselt zu ' + found.label, 'system');
            } else {
                addLine(tabId, 'Tab nicht gefunden: ' + target, 'error');
                addLine(tabId, 'Verf\u00fcgbar: ' + TABS.map(function(t){return t.id;}).join(', '), 'system');
            }
            return;
        }

        if (lower === 'learn' || lower === 'learn stats') {
            if (typeof DkzLearn !== 'undefined') {
                var d = DkzLearn.dashboard();
                addLine(tabId, '\ud83e\udde0 Self-Learning Dashboard (R41)', 'accent');
                addLine(tabId, '  Kategorien: ' + d.totalCategories, 'info');
                addLine(tabId, '  Bewertungen: ' + d.totalRatings, 'info');
                addLine(tabId, '  Items: ' + d.totalItems, 'info');
                Object.keys(d.categories).forEach(function(cat) {
                    var c = d.categories[cat];
                    addLine(tabId, '  \u2502 ' + cat + ': ' + c.ratings + ' Ratings, \u00d8 ' + c.avgScore + '/5', 'info');
                });
                if (d.topModels.length) {
                    addLine(tabId, '  Top Models:', 'info');
                    d.topModels.forEach(function(m) {
                        addLine(tabId, '    \u2b50 ' + m.model + ' (' + m.score.toFixed(1) + '/5, ' + m.uses + 'x)', 'info');
                    });
                }
            } else {
                addLine(tabId, '\u26a0\ufe0f DkzLearn\u2122 nicht geladen \u2014 dkz-self-learn.js fehlt', 'error');
            }
            return;
        }

        // === Tab-spezifische Kommandos ===
        switch(tabId) {
            case 'terminal':
                addLine(tabId, '\u26a0\ufe0f Shell nicht direkt verf\u00fcgbar im Browser. Nutze ONTHERUN\u2122 MCP f\u00fcr Remote-Befehle.', 'system');
                addLine(tabId, '\ud83d\udca1 Tipp: "switch ontherun" f\u00fcr das MCP Dashboard', 'system');
                addLine(tabId, '\ud83d\udca1 Tipp: "guide" f\u00fcr den vollst\u00e4ndigen Workflow-Guide', 'system');
                break;

            case 'gemini':
                addLine(tabId, '\ud83d\udd2e Sende an Gemini CLI: ' + cmd, 'system');
                if (typeof PICOCLAW !== 'undefined' && PICOCLAW.restChat) {
                    PICOCLAW.restChat(cmd, { model: 'gemini-2.5-flash' }).then(function(r) {
                        addLine(tabId, r.response || r.text || JSON.stringify(r), '');
                    }).catch(function(e) {
                        addLine(tabId, '\u274c Fehler: ' + e.message, 'error');
                    });
                } else {
                    addLine(tabId, '\u26a0\ufe0f PicoClaw\u2122 nicht geladen \u2014 Gemini CLI ben\u00f6tigt die Bridge', 'error');
                    addLine(tabId, '\ud83d\udca1 Tipp: "guide" f\u00fcr Einrichtungsanleitung', 'system');
                }
                break;

            case 'claude':
                addLine(tabId, '\ud83e\udde0 Sende an Claude Code: ' + cmd, 'system');
                if (typeof PICOCLAW !== 'undefined' && PICOCLAW.restChat) {
                    PICOCLAW.restChat(cmd, { model: 'claude-sonnet-4' }).then(function(r) {
                        addLine(tabId, r.response || r.text || JSON.stringify(r), '');
                    }).catch(function(e) {
                        addLine(tabId, '\u274c Fehler: ' + e.message, 'error');
                    });
                } else {
                    addLine(tabId, '\u26a0\ufe0f PicoClaw\u2122 nicht geladen', 'error');
                    addLine(tabId, '\ud83d\udca1 Tipp: "guide" f\u00fcr Einrichtungsanleitung', 'system');
                }
                break;

            case 'codex':
                addLine(tabId, '\u26a1 Sende an GPT Codex: ' + cmd, 'system');
                if (typeof PICOCLAW !== 'undefined' && PICOCLAW.restChat) {
                    PICOCLAW.restChat(cmd, { model: 'gpt-4.1' }).then(function(r) {
                        addLine(tabId, r.response || r.text || JSON.stringify(r), '');
                    }).catch(function(e) {
                        addLine(tabId, '\u274c Fehler: ' + e.message, 'error');
                    });
                } else {
                    addLine(tabId, '\u26a0\ufe0f PicoClaw\u2122 nicht geladen', 'error');
                    addLine(tabId, '\ud83d\udca1 Tipp: "guide" f\u00fcr Einrichtungsanleitung', 'system');
                }
                break;

            case 'opencode':
                addLine(tabId, '\ud83d\udcbb OpenCode Interface \u2014 Befehle werden via MCP geroutet', 'system');
                addLine(tabId, '\ud83d\udca1 Starte OpenCode im Terminal: npx opencode', 'system');
                addLine(tabId, '\ud83d\udca1 Tipp: "guide" f\u00fcr den vollst\u00e4ndigen Workflow-Guide', 'system');
                break;

            case 'openclaw':
                addLine(tabId, '\ud83d\udc3e OpenClaw\u2122 Agent: ' + cmd, 'system');
                if (typeof PICOCLAW !== 'undefined' && PICOCLAW.restInvoke) {
                    PICOCLAW.restInvoke('console-cmd', { command: cmd }).then(function(r) {
                        addLine(tabId, JSON.stringify(r, null, 2), '');
                    }).catch(function(e) {
                        addLine(tabId, '\u274c ' + e.message, 'error');
                    });
                } else {
                    addLine(tabId, '\u26a0\ufe0f PicoClaw\u2122 Bridge nicht verf\u00fcgbar', 'error');
                    addLine(tabId, '\ud83d\udca1 Tipp: "guide" f\u00fcr Einrichtungsanleitung', 'system');
                }
                break;

            case 'nlm':
                addLine(tabId, '\ud83d\udcd3 NotebookLM CLI: ' + cmd, 'system');
                addLine(tabId, '\ud83d\udca1 Verwende /nlm-batch Workflow f\u00fcr Batch-Generierung', 'system');
                addLine(tabId, '\ud83d\udca1 Tipp: "guide" f\u00fcr alle Content-Typen und Workflows', 'system');
                break;

            case 'ontherun':
                addLine(tabId, '\ud83d\ude80 ONTHERUN\u2122 MCP: ' + cmd, 'system');
                var gw = localStorage.getItem('dkz-gateway-url') || 'http://localhost:3040';
                fetch(gw + '/api/tools', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tool: 'chat', input: cmd })
                })
                .then(function(r) { return r.json(); })
                .then(function(d) {
                    addLine(tabId, d.output || d.result || JSON.stringify(d), '');
                })
                .catch(function(e) {
                    addLine(tabId, '\u26a0\ufe0f ONTHERUN\u2122 Server nicht erreichbar (' + gw + '): ' + e.message, 'error');
                    addLine(tabId, '\ud83d\udca1 Gateway setzen: Settings \u2192 Verbindungen \u2192 NEXUZ Gateway', 'system');
                    addLine(tabId, '\ud83d\udca1 Tipp: "guide" f\u00fcr Einrichtungsanleitung', 'system');
                });
                break;

            case 'apicontrol':
                handleApiControlCmd(tabId, cmd, lower);
                break;
        }
    }

    // ═══════════════════════════════════════════
    // API CONTROL — Provider/Key/Model Management
    // ═══════════════════════════════════════════
    var API_PROVIDERS = {
        openai:        { name: 'OpenAI',       model: 'gpt-4o-mini',       icon: '\u2b50',  link: 'https://platform.openai.com/api-keys',       cost: { input: 0.15, output: 0.60 } },
        anthropic:     { name: 'Anthropic',    model: 'claude-sonnet-4-20250514', icon: '\ud83e\udde0', link: 'https://console.anthropic.com/settings/keys', cost: { input: 3.00, output: 15.00 } },
        'gemini-flash':{ name: 'Gemini Flash', model: 'gemini-2.5-flash',  icon: '\u2728',  link: 'https://aistudio.google.com/apikey',          cost: { input: 0.075, output: 0.30 } },
        'gemini-pro':  { name: 'Gemini Pro',   model: 'gemini-2.5-pro',    icon: '\ud83d\udc8e', link: 'https://aistudio.google.com/apikey',          cost: { input: 1.25, output: 10.00 } },
        grok:          { name: 'Grok',         model: 'grok-3',            icon: '\ud83e\udd16', link: 'https://console.x.ai/',                       cost: { input: 3.00, output: 15.00 } },
        'grok-fast':   { name: 'Grok Fast',    model: 'grok-3-fast',       icon: '\u26a1',  link: 'https://console.x.ai/',                       cost: { input: 0.60, output: 3.00 } },
        mistral:       { name: 'Mistral',      model: 'mistral-medium',    icon: '\ud83c\udf2c\ufe0f', link: 'https://console.mistral.ai/api-keys/',        cost: { input: 2.00, output: 6.00 } },
        deepseek:      { name: 'DeepSeek',     model: 'deepseek-chat',     icon: '\ud83c\udf0a', link: 'https://platform.deepseek.com/api_keys',      cost: { input: 0.14, output: 0.28 } },
        groq:          { name: 'Groq',         model: 'llama-3.3-70b',     icon: '\ud83d\ude80', link: 'https://console.groq.com/keys',               cost: { input: 0.59, output: 0.79 } },
        perplexity:    { name: 'Perplexity',   model: 'sonar-pro',         icon: '\ud83d\udd0d', link: 'https://www.perplexity.ai/settings/api',       cost: { input: 3.00, output: 15.00 } },
        cohere:        { name: 'Cohere',       model: 'command-r-plus',    icon: '\ud83d\udc1a', link: 'https://dashboard.cohere.com/api-keys',       cost: { input: 2.50, output: 10.00 } },
        together:      { name: 'Together AI',  model: 'llama-3.3-70b',     icon: '\ud83e\udd1d', link: 'https://api.together.xyz/settings/api-keys',  cost: { input: 0.88, output: 0.88 } },
        openrouter:    { name: 'OpenRouter',   model: 'openai/gpt-4o-mini',icon: '\ud83c\udf10', link: 'https://openrouter.ai/keys',                  cost: { input: 0.15, output: 0.60 } },
        huggingface:   { name: 'HuggingFace',  model: 'llama-3.3-70b',     icon: '\ud83e\udd17', link: 'https://huggingface.co/settings/tokens',      cost: { input: 0.00, output: 0.00 } },
        nvidia:        { name: 'NVIDIA NIM',   model: 'llama-3.1-70b',     icon: '\ud83d\udfe2', link: 'https://build.nvidia.com/',                   cost: { input: 0.00, output: 0.00 } },
        'github-copilot': { name: 'GitHub Copilot', model: 'gpt-4o',      icon: '\ud83d\udc19', link: 'https://github.com/settings/copilot',         cost: { input: 0.00, output: 0.00 } },
        vllm:          { name: 'vLLM Local',  model: 'gemma4-e2b',        icon: '\ud83c\udfe0', link: '',                                            cost: { input: 0.00, output: 0.00 } }
    };

    // Ampel-Matrix: Provider x Anwendungsbereich (g=gr\u00fcn, y=gelb, r=rot)
    var AMPEL_MATRIX = {
        openai:        { code: 'g', chat: 'g', research: 'g', vision: 'g', speed: 'g' },
        anthropic:     { code: 'g', chat: 'g', research: 'g', vision: 'y', speed: 'y' },
        'gemini-flash':{ code: 'g', chat: 'g', research: 'g', vision: 'g', speed: 'g' },
        'gemini-pro':  { code: 'g', chat: 'g', research: 'g', vision: 'g', speed: 'y' },
        grok:          { code: 'g', chat: 'g', research: 'g', vision: 'r', speed: 'y' },
        'grok-fast':   { code: 'y', chat: 'g', research: 'y', vision: 'r', speed: 'g' },
        mistral:       { code: 'y', chat: 'g', research: 'g', vision: 'y', speed: 'y' },
        deepseek:      { code: 'g', chat: 'y', research: 'y', vision: 'r', speed: 'g' },
        groq:          { code: 'y', chat: 'g', research: 'y', vision: 'r', speed: 'g' },
        perplexity:    { code: 'r', chat: 'g', research: 'g', vision: 'r', speed: 'y' },
        cohere:        { code: 'y', chat: 'g', research: 'g', vision: 'r', speed: 'y' },
        together:      { code: 'y', chat: 'g', research: 'y', vision: 'r', speed: 'g' },
        openrouter:    { code: 'g', chat: 'g', research: 'g', vision: 'g', speed: 'y' },
        huggingface:   { code: 'y', chat: 'y', research: 'y', vision: 'y', speed: 'y' },
        nvidia:        { code: 'y', chat: 'y', research: 'y', vision: 'y', speed: 'g' },
        'github-copilot': { code: 'g', chat: 'g', research: 'y', vision: 'y', speed: 'g' },
        vllm:          { code: 'y', chat: 'y', research: 'r', vision: 'r', speed: 'g' }
    };

    var _sessionCosts = { tokens: 0, usd: 0.0 };

    function _getCookieApi(name) {
        var n = encodeURIComponent(name) + '=';
        var parts = document.cookie.split(';');
        for (var i = 0; i < parts.length; i++) {
            var c = parts[i].trim();
            if (c.startsWith(n)) return decodeURIComponent(c.substring(n.length));
        }
        return '';
    }
    function _setCookieApi(name, value) {
        var d = new Date(); d.setTime(d.getTime() + 365 * 86400000);
        document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
    }

    function _ampelDot(val) {
        var colors = { g: '#00ff88', y: '#ffb800', r: '#ff3b5c' };
        return colors[val] || '#4a4a5a';
    }

    function handleApiControlCmd(tabId, cmd, lower) {
        if (lower === 'help' || lower === '?') {
            addLine(tabId, '\ud83d\udd11 API Control Befehle:', 'info');
            addLine(tabId, '  keys           \u2014 Gespeicherte API-Keys anzeigen', 'info');
            addLine(tabId, '  set <provider> \u2014 Interaktiv Key setzen', 'info');
            addLine(tabId, '  costs          \u2014 Session-Kosten anzeigen', 'info');
            addLine(tabId, '  models         \u2014 Modelle pro Provider', 'info');
            addLine(tabId, '  ampel          \u2014 Eignungs-Matrix (Code/Chat/Research/Vision/Speed)', 'info');
            addLine(tabId, '  pricing        \u2014 Preis-\u00dcbersicht $/1M Tokens', 'info');
            addLine(tabId, '  guide          \u2014 Vollst\u00e4ndiger Guide', 'info');
            return;
        }

        if (lower === 'keys') {
            addLine(tabId, '\ud83d\udd11 Gespeicherte API-Keys:', 'accent');
            Object.keys(API_PROVIDERS).forEach(function(id) {
                var p = API_PROVIDERS[id];
                var key = _getCookieApi('dkz-cop-key-' + id) || localStorage.getItem('dkz-copilot-key-' + id) || '';
                var status = key ? '\u2705' : '\u274c';
                var masked = key ? key.substring(0, 6) + '...' + key.substring(key.length - 4) : '(nicht gesetzt)';
                addLine(tabId, '  ' + p.icon + ' ' + p.name.padEnd(16) + status + ' ' + masked, key ? 'info' : 'system');
            });
            return;
        }

        if (lower.startsWith('set ')) {
            var target = lower.replace('set ', '').trim();
            if (!API_PROVIDERS[target]) {
                addLine(tabId, '\u274c Provider nicht gefunden: ' + target, 'error');
                addLine(tabId, '  Verf\u00fcgbar: ' + Object.keys(API_PROVIDERS).join(', '), 'system');
                return;
            }
            addLine(tabId, '\ud83d\udd11 Gib den API-Key f\u00fcr ' + API_PROVIDERS[target].name + ' ein:', 'info');
            addLine(tabId, '  \ud83d\udd17 Key holen: ' + (API_PROVIDERS[target].link || 'N/A'), 'system');
            addLine(tabId, '  Tippe: key <dein-api-key>', 'system');
            // Speichere temp target
            localStorage.setItem('dkz-api-set-target', target);
            return;
        }

        if (lower.startsWith('key ')) {
            var apiKey = cmd.replace(/^key\s+/i, '').trim();
            var setTarget = localStorage.getItem('dkz-api-set-target');
            if (!setTarget || !API_PROVIDERS[setTarget]) {
                addLine(tabId, '\u26a0\ufe0f Erst "set <provider>" aufrufen', 'error');
                return;
            }
            _setCookieApi('dkz-cop-key-' + setTarget, apiKey);
            localStorage.setItem('dkz-copilot-key-' + setTarget, apiKey);
            localStorage.removeItem('dkz-api-set-target');
            addLine(tabId, '\u2705 API-Key f\u00fcr ' + API_PROVIDERS[setTarget].name + ' gespeichert!', 'info');
            return;
        }

        if (lower === 'models') {
            addLine(tabId, '\ud83e\udd16 Modelle pro Provider:', 'accent');
            Object.keys(API_PROVIDERS).forEach(function(id) {
                var p = API_PROVIDERS[id];
                var custom = localStorage.getItem('dkz-copilot-model-' + id);
                addLine(tabId, '  ' + p.icon + ' ' + p.name.padEnd(16) + (custom || p.model) + (custom ? ' (custom)' : ''), 'info');
            });
            return;
        }

        if (lower === 'ampel') {
            var header = '  Provider         Code  Chat  Rsrch Visn  Speed';
            addLine(tabId, '\ud83d\udea6 Ampel-Matrix (Eignung pro Bereich):', 'accent');
            addLine(tabId, header, 'info');
            addLine(tabId, '  ' + '\u2500'.repeat(48), 'system');
            var ampelIcon = { g: '\ud83d\udfe2', y: '\ud83d\udfe1', r: '\ud83d\udd34' };
            Object.keys(API_PROVIDERS).forEach(function(id) {
                var p = API_PROVIDERS[id];
                var a = AMPEL_MATRIX[id] || {};
                addLine(tabId, '  ' + p.icon + ' ' + p.name.padEnd(16) +
                    (ampelIcon[a.code] || '\u26aa') + '     ' +
                    (ampelIcon[a.chat] || '\u26aa') + '     ' +
                    (ampelIcon[a.research] || '\u26aa') + '     ' +
                    (ampelIcon[a.vision] || '\u26aa') + '     ' +
                    (ampelIcon[a.speed] || '\u26aa'), 'info');
            });
            return;
        }

        if (lower === 'costs') {
            addLine(tabId, '\ud83d\udcb0 Session-Kosten:', 'accent');
            addLine(tabId, '  Tokens verbraucht: ' + _sessionCosts.tokens.toLocaleString(), 'info');
            addLine(tabId, '  Gesch\u00e4tzte Kosten: $' + _sessionCosts.usd.toFixed(4), 'info');
            addLine(tabId, '', '');
            addLine(tabId, '\ud83d\udcb0 Preise pro 1M Tokens (Input/Output):', 'accent');
            Object.keys(API_PROVIDERS).forEach(function(id) {
                var p = API_PROVIDERS[id];
                var costStr = p.cost.input === 0 && p.cost.output === 0 ? 'KOSTENLOS' :
                    '$' + p.cost.input.toFixed(2) + ' / $' + p.cost.output.toFixed(2);
                addLine(tabId, '  ' + p.icon + ' ' + p.name.padEnd(16) + costStr, 'info');
            });
            return;
        }

        if (lower === 'pricing') {
            addLine(tabId, '\ud83d\udcb0 Preisvergleich $/1M Tokens (sortiert nach Input-Preis):', 'accent');
            var sorted = Object.keys(API_PROVIDERS).sort(function(a, b) {
                return API_PROVIDERS[a].cost.input - API_PROVIDERS[b].cost.input;
            });
            sorted.forEach(function(id) {
                var p = API_PROVIDERS[id];
                var bar = '';
                var barLen = Math.min(30, Math.round(p.cost.input * 5));
                for (var i = 0; i < barLen; i++) bar += '\u2588';
                var color = p.cost.input === 0 ? '#00ff88' : p.cost.input < 1 ? '#00ff88' : p.cost.input < 3 ? '#ffb800' : '#ff3b5c';
                addLine(tabId, '  ' + p.icon + ' ' + p.name.padEnd(14) + '$' + p.cost.input.toFixed(2).padStart(6) + ' IN | $' + p.cost.output.toFixed(2).padStart(6) + ' OUT', p.cost.input === 0 ? 'cmd' : p.cost.input < 1 ? 'info' : 'error');
            });
            return;
        }

        addLine(tabId, '\ud83d\udd11 API Control \u2014 Tippe "help" oder "guide" f\u00fcr Befehle', 'system');
    }

    // === Input Handler ===
    TABS.forEach(function(t) {
        var input = document.getElementById('dkz-con-input-' + t.id);
        if (!input) return;

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                var cmd = this.value.trim();
                if (cmd) {
                    processCommand(t.id, cmd);
                    this.value = '';
                }
                e.preventDefault();
            }
            if (e.key === 'ArrowUp') {
                var h = cmdHistories[t.id];
                if (h.idx > 0) {
                    h.idx--;
                    this.value = h.cmds[h.idx] || '';
                }
                e.preventDefault();
            }
            if (e.key === 'ArrowDown') {
                var h2 = cmdHistories[t.id];
                if (h2.idx < h2.cmds.length - 1) {
                    h2.idx++;
                    this.value = h2.cmds[h2.idx] || '';
                } else {
                    h2.idx = h2.cmds.length;
                    this.value = '';
                }
                e.preventDefault();
            }
            if (e.key === 'Escape') {
                toggleConsole();
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });

    // === Resize Handler ===
    var resizeHandle = document.getElementById('dkz-con-resize');
    var isResizing = false;
    var startY, startHeight;

    resizeHandle.addEventListener('mousedown', function(e) {
        isResizing = true;
        startY = e.clientY;
        startHeight = document.getElementById('dkz-con-body').offsetHeight;
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        var newHeight = startHeight + (startY - e.clientY);
        newHeight = Math.max(100, Math.min(newHeight, window.innerHeight * 0.7));
        document.getElementById('dkz-con-body').style.height = newHeight + 'px';
        state.height = newHeight;
    });

    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            saveState(state);
        }
    });

    // === Init ===
    switchTab(activeTab);
    if (state.height) {
        document.getElementById('dkz-con-body').style.height = state.height + 'px';
    }

    // === Hilfsfunktionen ===
    function getPromptLabel(tab) {
        switch(tab.id) {
            case 'terminal': return 'PS>';
            case 'gemini': return 'gemini>';
            case 'claude': return 'claude>';
            case 'codex': return 'codex>';
            case 'opencode': return 'oc>';
            case 'openclaw': return '\ud83d\udc3e>';
            case 'nlm': return 'nlm>';
            case 'ontherun': return 'mcp>';
            case 'apicontrol': return '\ud83d\udd11>';
            default: return '$>';
        }
    }

    function getWelcomeMessage(tab) {
        switch(tab.id) {
            case 'terminal': return 'DEVKiTZ\u2122 Terminal \u2014 Lokale Shell Emulation. Tippe "help" oder "guide" f\u00fcr Befehle.';
            case 'gemini': return 'Gemini CLI \u2014 Chat mit Google Gemini. Verbunden \u00fcber PicoClaw\u2122 Bridge. Tippe "guide".';
            case 'claude': return 'Claude Code \u2014 Anthropic Claude Anbindung. Code-Analyse + Generierung. Tippe "guide".';
            case 'codex': return 'GPT Codex \u2014 OpenAI GPT-4.1 Interface f\u00fcr Code-Tasks. Tippe "guide".';
            case 'opencode': return 'OpenCode \u2014 AI Coding CLI. Starte mit "npx opencode" im Terminal. Tippe "guide".';
            case 'openclaw': return 'OpenClaw\u2122 Agent \u2014 Gateway f\u00fcr das DEVKiTZ\u2122 \u00d6kosystem. Tippe "guide".';
            case 'nlm': return 'NotebookLM CLI \u2014 Notebooks, Podcasts, Mind Maps generieren. Tippe "guide".';
            case 'ontherun': return 'ONTHERUN\u2122 MCP \u2014 Dashboard mit Chat. 34+ Tools verf\u00fcgbar. Tippe "guide".';
            case 'apicontrol': return '\ud83d\udd11 API Control \u2014 Keys, Modelle, Ampel, Costs. Tippe "help" oder "guide".';
            default: return 'Bereit. Tippe "guide" f\u00fcr den Workflow-Guide.';
        }
    }

    // === Global API ===
    window.DkzConsole = {
        toggle: toggleConsole,
        open: function() { if (!console_el.classList.contains('open')) toggleConsole(); },
        close: function() { if (console_el.classList.contains('open')) toggleConsole(); },
        switchTab: switchTab,
        addLine: addLine,
        exec: processCommand,
        showGuide: showGuide,
        version: VERSION
    };

    console.log('[DkzConsole] v' + VERSION + ' geladen \u2014 ESC zum \u00d6ffnen | Hover f\u00fcr Info-Popups | "guide" f\u00fcr Workflows');

})();
