/**
 * DkZ JAMEZ™ -- GPT Evaluation Agent + Mistral OCR v2.0
 * @DKZ:TAG [AGENT:james] [CAT:shared] [LANG:js]
 * @DKZ:RULES R12 Kein Wissensverlust, R20 Dok-Pflicht
 * @version v0.01.1_01
 * 
 * JAMEZ™ LIEST und BEWERTET -- aendert NIE Code.
 * Portiert aus james_playbook.go + Mistral OCR Integration
 * 
 * Einbinden: <script src="../../shared/dkz-james.js"></script>
 * 
 * Features v2.0:
 * - Bewertung in 6 Kategorien (quality, security, design, prompt, structure, logic)
 * - 22 Rubric-Regeln mit Pass/Fail + Fix-Hints
 * - Mistral OCR: Bilder/PDFs lesen und analysieren
 * - LLM Evaluation: Tiefe Code-Analyse via NEXUZ.chat()
 * - Ecosystem Score: 0-100 Gesamtbewertung
 * - Fix-Vorschlaege: suggestFix() via LLM
 * - Live-Feedback-Panel in allen Modulen
 * - NEXUZ Integration (Prompt Archive Bewertung)
 */
const DkzJames = (() => {
    'use strict';

    const VERSION = '3.0.0';

    // ========================================
    // KNOWLEDGE BASE (Playbook + Blueprint + OpenClaw)
    // Alles was James wissen muss um DkZ Module zu bewerten
    // ========================================
    const KNOWLEDGE = {
        // --- DKZ PLAYBOOK (14 Sektionen, v1.01.2_01) ---
        playbook: {
            version: 'v1.01.2_01',
            outputFormat: {
                blocks: 7, // 7-Block-Standard Pflicht
                blockNames: ['Metadaten-Header', 'Einfuehrung/Problem', 'Ziel/Nutzen', 'Strukturierte Erklaerung', 'Visuelle Darstellung', 'Anwendung/Beispiel', 'Fazit+NextSteps'],
                minChars: { title: 30, section: 15, paragraph: 120, listItem: 40, tableCell: 10, tag: 3, codeComment: 20, fazit: 60 },
                metaHeader: ['Projekt', 'Kategorie', 'Version', 'Datum', 'Autor', 'Status', 'Tags(min10)']
            },
            statusSystem: { green: 'AKTIV/OK/LIVE', yellow: 'IN ARBEIT/DEV', red: 'FEHLER/STOP/ARCHIV', blue: 'INFO/GEPLANT', white: 'NEUTRAL/NA' },
            tagRules: {
                minTags: 10, researchMinTags: 15,
                requiredGroups: ['CONTENT-TYP', 'TECHNOLOGIE', 'PROJEKT', 'KLASSIFIKATION', 'STATUS'],
                format: '#kleinbuchstaben, Bindestrich erlaubt'
            },
            colorSchemes: {
                dark: { bg: '#0e0e10', surface: '#1a1a1c', text: '#f6f6f7', accent: '#fa1e4e', success: '#00FF88', warning: '#FFB800', error: '#FF3366' },
                crimson: { bg: '#000000', surface: '#1a0008', text: '#fa1e4e', accent: '#ff2d5e' },
                neon: { bg: '#050505', surface: '#0a0a0c', text: '#ffffff', accent: '#ff0040', accentAlt: '#00FFD5' }
            },
            fonts: { sans: 'Inter', mono: 'JetBrains Mono', heading: 'Space Grotesk' },
            headerHierarchy: 'H1(1x,emoji) > H2(===Sektionen) > H3(nummeriert) > H4(selten)',
            tables: { minCols: 3, maxCols: 7, maxRows: 20, statusLastCol: true, noEmptyCells: true },
            promptBlueprints: 20, // BP-01 bis BP-20
            eventLog: { idFormat: 'EVT-{timestamp}-{hex4}', types: ['creation', 'action', 'error', 'system', 'output', 'command'], sessionFormat: 'SES-{timestamp}' },
            gitArchives: ['prompts', 'snippets', 'workflows', 'agents', 'blueprints'],
            backendFrontend: { backend: 'Auth,Admin,Archive,Logs', frontend: 'Landing,App,Module,Profil', apiAuth: 'Bearer dkz_xxx' },
            roles: { admin: 100, developer: 50, viewer: 20, guest: 10 },
            versionFormat: 'v{major}.{minor}.{session}_{step}'
        },

        // --- BLAUPAUSE (73 Module, Tech Stack) ---
        blueprint: {
            version: 'v0.05',
            totalModules: 73, // 59 Module + 14 Dashboards
            moduleCategories: {
                devTools: 15, designUI: 5, contentText: 8, kiPrompts: 5,
                analyseDaten: 7, produktivitaet: 6, spezial: 6, metaArchiv: 3, backendSystem: 3
            },
            techStack: {
                frontend: ['HTML5', 'Vanilla CSS', 'Vanilla JS (ES6+)', 'Google Fonts CDN'],
                backend: ['Node.js', 'Python', 'Go', 'PHP'],
                databases: ['JSON(Prio1)', 'Google Sheets', 'DuckDB', 'Apache Iceberg', 'pgvector', 'MongoDB Atlas', 'ChromaDB'],
                tools: ['GitHub Copilot', 'CodeRabbit', 'GitHub Actions']
            },
            qualityStandards: [
                'DkZ Design System (Farben, Fonts, Cards)',
                'Responsive Design (Desktop + Tablet)',
                'Hub-Link zurueck zur Startseite',
                'Version v0.01 im Header',
                'Toast-Benachrichtigungen bei Aktionen',
                'Glassmorphism Header (sticky)',
                'Background Blobs fuer Atmosphaere',
                'Copy Button wo sinnvoll',
                'localStorage fuer Daten-Persistenz',
                'Offline-faehig (ausser API-Module)'
            ],
            conventions: {
                folders: 'kebab-case',
                mainFile: 'index.html',
                singleFile: 'HTML+CSS+JS in einer Datei',
                cssVars: ':root definiert, gleiche Namen',
                jsKeys: 'localStorage Keys starten mit dkz-',
                xss: 'esc() fuer HTML-Output',
                toast: 'showToast() fuer Benachrichtigungen',
                noFramework: 'Kein npm install, kein Build-Prozess, kein Framework',
                r23: 'Jede .go hat .py Fallback (Go=gruen, Python=gelb)'
            },
            sharedScripts: {
                pflicht: ['dkz-theme.css', 'dkz-debug.js', 'dkz-guide.js', 'dkz-copilot.js'],
                optional: ['dkz-shortcuts.js', 'dkz-export.js', 'dkz-crosslinks.js', 'dkz-a11y.js', 'dkz-test.js', 'dkz-puter.js', 'nexuz.js', 'dkz-james.js', 'dkz-llm-registry.js', 'dkz-eventlog.js']
            },
            dataFlow: 'Benutzer(Input) → Modul(Logik) → localStorage(Speicher) → Output/Export(Copy/Down)',
            puterIntegration: { sdk: 'https://js.puter.com/v2/', lazyLoad: true, prefix: 'dkz:', fallback: 'localStorage' }
        },

        // --- OPENCLAW (Orchestrator + 5-Layer Arch) ---
        openclaw: {
            type: 'central_orchestrator',
            language: 'python',
            framework: 'FastAPI',
            entryPoint: 'OpenClaw/core_orchestrator.py',
            config: {
                maxConcurrentTasks: 10,
                taskTimeoutMs: 60000,
                dispatchStrategy: 'priority_queue',
                fallbackStrategy: 'round_robin'
            },
            aiProvider: {
                gateway: 'litellm',
                defaultModel: 'open-mistral-nemo',
                provider: 'mistral',
                fallbackModels: ['gemma-2', 'llama-3.1-8b'],
                maxTokens: 4096,
                temperature: 0.7,
                retryOnFailure: true,
                maxRetries: 3
            },
            architecture: {
                layers: ['Frontend', 'Orchestration', 'Storage', 'Infrastructure', 'Governance'],
                selfRepair: ['Watchdog', 'Diagnose', 'Auto-Fix', 'Verify'],
                loops: {
                    micro: 'Sekunden — Health Checks',
                    meso: 'Minuten — Sync, Cache',
                    macro: 'Stunden — Backup, Cleanup',
                    meta: 'Tage — Versionierung, Audit'
                }
            },
            modules: {
                coreOrchestrator: 'Registriert Module, dispatcht Tasks',
                picoclaw: 'FAISS-basierte Wissens-Suche ueber DEVKiTZ Wiki',
                knowledge: 'Vektordatenbank fuer semantische Suche'
            },
            apiEndpoints: ['/api/sync', '/api/chat', '/api/chat-multimodel', '/api/analyze', '/api/convert', '/api/speech-to-text', '/api/text-to-speech', '/api/summarize']
        },

        // --- ONTHERUN MCP (34+ Tools) ---
        ontherun: {
            server: 'Node.js MCP Server',
            port: 3040,
            start: 'node cli/dkz.js start oder DKZ_START.bat',
            tools: ['tokens', 'integrations', 'research', 'prompts', 'chat', 'files', 'health', 'modules', 'seo', 'workflow', 'system'],
            rule: 'R31: Alle Backend-Aufrufe NUR ueber NEXUZ',
            gateway: { type: 'Express.js REST + WebSocket', endpoints: ['/api/v1/chat', '/api/v1/modules', '/api/v1/tools/execute', '/api/v1/health'], middleware: ['CORS', 'Helmet', 'Rate-Limiting', 'Logging'] }
        },

        // --- 20 LLM PROMPT BLUEPRINTS ---
        promptBlueprints: [
            { id: 'BP-01', name: 'Reasoning Effort', cat: 'Performance', desc: 'Rechenpower pro Task steuern' },
            { id: 'BP-02', name: 'XML-Container', cat: 'Struktur', desc: 'Prompts mit XML-Tags strukturieren' },
            { id: 'BP-03', name: 'Output-Klammer', cat: 'Kontrolle', desc: 'Exakte Laengen erzwingen' },
            { id: 'BP-04', name: 'Token-Sparen', cat: 'Effizienz', desc: 'Floskeln/Wiederholungen stoppen' },
            { id: 'BP-05', name: 'Kompakte Bullets', cat: 'Format', desc: 'Infodichte maximieren' },
            { id: 'BP-06', name: 'Scope-Disziplin', cat: 'Sicherheit', desc: 'Unerwuenschte Extras verbieten' },
            { id: 'BP-07', name: 'Rueckfragen-Modus', cat: 'Workflow', desc: 'Erst fragen dann arbeiten' },
            { id: 'BP-08', name: 'Plausible Interpretationen', cat: 'Strategie', desc: 'Top-3 bei Unklarheit' },
            { id: 'BP-09', name: 'Conservative Grounding', cat: 'Qualitaet', desc: 'Fakten nur mit Quelle' },
            { id: 'BP-10', name: 'Werkzeug vor Wissen', cat: 'Tools', desc: 'Tools statt Trainingsdaten' },
            { id: 'BP-11', name: 'Modell-Migration', cat: 'Infrastruktur', desc: 'Sauberer LLM-Wechsel' },
            { id: 'BP-12', name: 'Outline-Hack', cat: 'Dokumente', desc: 'Outline vor Verarbeitung' },
            { id: 'BP-13', name: 'Sektions-Anker', cat: 'Belegpflicht', desc: 'Antworten an Quellen binden' },
            { id: 'BP-14', name: 'JSON-Extraktion', cat: 'Daten', desc: 'Strukturierte Daten extrahieren' },
            { id: 'BP-15', name: 'High-Risk Self-Check', cat: 'Sicherheit', desc: 'Pflicht-Selbstpruefung' },
            { id: 'BP-16', name: 'Parallel-Suche', cat: 'Recherche', desc: 'Multi-Stream-Research' },
            { id: 'BP-17', name: 'Compaction', cat: 'Kontext', desc: 'Lange Chats komprimieren' },
            { id: 'BP-18', name: 'Second Order Research', cat: 'Tiefenforschung', desc: 'Zweistufige Recherche' },
            { id: 'BP-19', name: 'Objektivitaet', cat: 'Qualitaet', desc: 'Schmeichelei unterdruecken' },
            { id: 'BP-20', name: 'xhigh-Geheimnis', cat: 'Logik', desc: 'Maximale Reasoning-Stufe' }
        ],

        // --- BUILDER CHAIN ---
        builderChain: {
            order: ['Actions', 'Skills', 'Workflows', 'Agents', 'Teams'],
            modules: ['action-builder', 'skill-builder', 'workflow-builder', 'agent-builder', 'team-builder', 'source-registry', 'ecosystem-analyzer'],
            bridge: 'localStorage',
            pattern: '3-Spalten Grid: 280px Sidebar | Dot-Grid Canvas | 350px Properties'
        },

        // --- DkZ REGELN (Kernregeln) ---
        rules: {
            R12: 'Kein Wissensverlust — Alles dokumentieren',
            R20: 'Dokumentations-Pflicht — Git nach jeder Aenderung',
            R23: 'Go-Python-Fallback — Jede .go hat .py',
            R31: 'Backend-Calls nur ueber NEXUZ',
            R42: 'Keine Frameworks — Vanilla HTML/CSS/JS',
            R50: 'DkZ Theme Pflicht — dkz-theme.css in jedem Modul',
            R60: 'Shared Scripts Pflicht — dkz-debug.js, dkz-guide.js',
            R70: 'Offline-First — localStorage Fallback immer',
            R80: 'XSS-Schutz — esc() fuer alle User-Inputs',
            R90: 'Event-Logging — Jedes Modul loggt creation/action/error',
            R95: 'Externe LLM Prompt-Archivpflicht — Wenn LLMs ausserhalb (Gemini, GPT, Claude, Copilot) Prompts nutzen, MUESSEN diese trotzdem im DkZ Prompt-Archiv (Iceberg-Bridge) hinterlegt werden. Kein Prompt geht undokumentiert.',
            R96: 'Playbook-Bindungspflicht — Wenn ein LLM das Playbook liest, ist der GESAMTE Output bindend an Playbook-Standards (Format, Farben, Struktur, Konventionen). Das Playbook ist kein Vorschlag sondern das bindende Regelwerk. Jede Antwort MUSS Playbook-konform sein — kein Bauchgefuehl, nur Regelwerk.'
        },

        // --- GM-RULES: Gedaechtnis-Management (GM-01 bis GM-08) ---
        gmRules: [
            { id: 'GM-01', name: 'Kontext-Inventur', severity: 'pflicht', desc: 'Vor jeder Session: Hot-Memory pruefen, Warm-Eintraege validieren, Cold-Referenzen aktualisieren. Kein blindes Weitermachen.' },
            { id: 'GM-02', name: 'Fuellstand-Wache', severity: 'pflicht', desc: 'Fuellstand darf nie 85% ueberschreiten ohne Compaction. Auto-Compaction ab konfiguriertem Schwellwert triggern.' },
            { id: 'GM-03', name: 'Backup-vor-Vergessen', severity: 'pflicht', desc: 'Vor JEDER Compaction: Snapshot erstellen (dkz-compaction-backup). Kein Datenverlust ohne Rollback-Moeglichkeit.' },
            { id: 'GM-04', name: 'Relevanz-Ranking', severity: 'empfohlen', desc: 'Eintraege nach Zugriffshaeufigkeit + Alter + Kategorie-Gewicht sortieren. Selten-Genutzes zuerst compacten.' },
            { id: 'GM-05', name: 'Kontext-Bruecke', severity: 'pflicht', desc: 'Bei Compaction: Zusammenfassung + Key-Facts + Referenz-IDs behalten. Nie komplett loeschen — immer Bruecke zum Cold-Storage.' },
            { id: 'GM-06', name: 'Playbook-Pinning', severity: 'pflicht', desc: 'Playbook-Kern (Regeln R12-R90, Farbschema, Font-Stack, Builder-Chain-Order) ist IMMER gepinnt. Ueberlebt jede Compaction.' },
            { id: 'GM-07', name: 'Score-Tracking', severity: 'empfohlen', desc: 'Jeder Prompt-Score wird versioniert gespeichert. Trend-Analyse: Verbesserung/Verschlechterung ueber Zeit sichtbar.' },
            { id: 'GM-08', name: 'Human-in-the-Loop', severity: 'optional', desc: 'Bei confirmCompact=true: User muss Compaction bestaetigen. Zeigt was geloescht wird und warum. Override nur mit Admin-Rolle.' }
        ],

        // --- EXTERNAL CATALOG (aus importierten ZIPs) ---
        externalCatalog: {
            sources: ['claude-octopus', 'auto-claude', 'cookbook'],
            agentPersonas: 29,
            skills: 3,
            principles: 4,
            docs: 17,
            phases: ['probe(Discover)', 'grasp(Define)', 'tangle(Develop)', 'ink(Deliver)'],
            cookbookTopics: ['prompting', 'langchain', 'chromadb', 'google-adk', 'json_capabilities', 'qdrant', 'weaviate'],
            bridge: 'dkz-builder-bridge.js',
            note: 'R95: Alle externen Prompts werden automatisch im Iceberg archiviert'
        }
    };

    // ========================================
    // CATEGORIES
    // ========================================
    const CATEGORIES = {
        quality: { name: 'Qualitaet', icon: 'Q', color: '#00ff88', weight: 10 },
        security: { name: 'Sicherheit', icon: 'S', color: '#55ACEE', weight: 10 },
        design: { name: 'Design', icon: 'D', color: '#ec4899', weight: 8 },
        prompt: { name: 'Prompt', icon: 'P', color: '#FFB800', weight: 9 },
        structure: { name: 'Struktur', icon: 'T', color: '#6366f1', weight: 7 },
        logic: { name: 'Logik', icon: 'L', color: '#f97316', weight: 8 }
    };

    // ========================================
    // RUBRIC RULES (22 Regeln, 6 Kategorien)
    // ========================================
    const RULES = [
        // --- QUALITY ---
        {
            id: 'Q-ESCAPE', cat: 'quality', name: 'XSS Escaping', weight: 10,
            check: (html) => !html.match(/innerHTML\s*=(?!.*esc\(|.*sanitize|.*DOMPurify)/),
            hint: 'innerHTML ohne Escaping gefunden. Nutze esc() oder textContent.',
            fix: 'Ersetze .innerHTML = x mit .textContent = x oder nutze DOMPurify.sanitize(x)'
        },
        {
            id: 'Q-NOEVAL', cat: 'quality', name: 'Kein eval()', weight: 10,
            check: (html) => !html.match(/\beval\s*\(/),
            hint: 'eval() ist ein Sicherheitsrisiko. Nutze JSON.parse() oder Function().',
            fix: 'Ersetze eval(x) mit JSON.parse(x) oder new Function(x)()'
        },
        {
            id: 'Q-ERRHDL', cat: 'quality', name: 'Error Handling', weight: 7,
            check: (html) => html.match(/try\s*\{|\.catch\s*\(|onerror/) !== null,
            hint: 'Kein Error-Handling gefunden. try/catch oder .catch() nutzen.',
            fix: 'Wrappe kritische async Calls in try/catch oder fuege .catch() an Promises'
        },
        {
            id: 'Q-CONST', cat: 'quality', name: 'const/let statt var', weight: 5,
            check: (html) => { const vars = (html.match(/\bvar\s+/g) || []).length; return vars < 3; },
            hint: 'Zu viele var-Deklarationen. const/let bevorzugen.',
            fix: 'Ersetze var mit const (oder let wenn mutable)'
        },

        // --- SECURITY ---
        {
            id: 'S-NOKEY', cat: 'security', name: 'Keine Hardcoded Keys', weight: 10,
            check: (html) => !html.match(/['"]sk-[a-zA-Z0-9]{20,}['"]|['"]ghp_[a-zA-Z0-9]{20,}['"]/),
            hint: 'API-Key im Code gefunden! Nutze NEXUZ.getToken() oder .env.',
            fix: 'Verschiebe Keys in NEXUZ.getToken("provider") oder .env Datei'
        },
        {
            id: 'S-HTTPS', cat: 'security', name: 'HTTPS URLs', weight: 6,
            check: (html) => !html.match(/http:\/\/(?!localhost|127\.0\.0\.1)/),
            hint: 'HTTP-URL gefunden. HTTPS verwenden (ausser localhost).',
            fix: 'Aendere http:// zu https:// in allen externen URLs'
        },
        {
            id: 'S-CSP', cat: 'security', name: 'Content Security', weight: 4,
            check: (html) => html.match(/meta.*content-security|helmet|nonce/) !== null || html.length < 5000,
            hint: 'Keine Content-Security-Policy. Meta-Tag oder Helmet hinzufuegen.',
            fix: 'Fuege <meta http-equiv="Content-Security-Policy" content="default-src self"> hinzu'
        },

        // --- DESIGN ---
        {
            id: 'D-THEME', cat: 'design', name: 'DkZ Theme eingebunden', weight: 8,
            check: (html) => html.includes('dkz-theme.css'),
            hint: 'dkz-theme.css nicht eingebunden.',
            fix: 'Fuege <link rel="stylesheet" href="../../shared/dkz-theme.css"> in den <head> ein'
        },
        {
            id: 'D-RESPONSIVE', cat: 'design', name: 'Responsive Design', weight: 6,
            check: (html) => html.match(/@media|min-width|max-width/) !== null,
            hint: 'Kein responsive Design. @media Queries hinzufuegen.',
            fix: 'Fuege @media (max-width: 768px) { ... } CSS Breakpoints hinzu'
        },
        {
            id: 'D-ACCENT', cat: 'design', name: 'DkZ Akzentfarbe', weight: 4,
            check: (html) => html.includes('#fa1e4e') || html.includes('--accent') || html.includes('--neon-red'),
            hint: 'DkZ Akzentfarbe #fa1e4e / var(--neon-red) nicht genutzt.',
            fix: 'Nutze var(--neon-red) oder #fa1e4e als Primaerfarbe'
        },
        {
            id: 'D-FONT', cat: 'design', name: 'Inter Font', weight: 3,
            check: (html) => html.includes('Inter') || html.includes('var(--font)'),
            hint: 'Inter Font nicht eingebunden.',
            fix: 'Fuege Google Fonts Inter hinzu: <link href="https://fonts.googleapis.com/css2?family=Inter">'
        },

        // --- PROMPT ---
        {
            id: 'P-STRUCT', cat: 'prompt', name: 'Strukturierter Prompt', weight: 9,
            check: (text) => { const lines = text.split('\n').length; return lines >= 3; },
            hint: 'Prompt zu kurz/unstrukturiert. Min. 3 Zeilen mit klarer Aufgabe.',
            fix: 'Strukturiere mit: 1) Rolle 2) Aufgabe 3) Kontext 4) Output-Format'
        },
        {
            id: 'P-CONTEXT', cat: 'prompt', name: 'Kontext vorhanden', weight: 7,
            check: (text) => text.match(/kontext|context|rolle|role|bist|sind|act as/i) !== null,
            hint: 'Kein Kontext/Rolle definiert.',
            fix: 'Beginne mit: "Du bist ein..." oder "<context>...</context>"'
        },
        {
            id: 'P-OUTPUT', cat: 'prompt', name: 'Output-Format definiert', weight: 6,
            check: (text) => text.match(/format|ausgabe|output|json|markdown|tabelle|liste/i) !== null,
            hint: 'Kein Output-Format spezifiziert.',
            fix: 'Fuege hinzu: "Gib die Antwort als [JSON/Markdown/Tabelle] zurueck"'
        },

        // --- STRUCTURE ---
        {
            id: 'T-META', cat: 'structure', name: 'Meta-Tags vorhanden', weight: 5,
            check: (html) => html.match(/<meta.*charset|<meta.*viewport/) !== null,
            hint: 'Meta-Tags fehlen (charset, viewport).',
            fix: 'Fuege <meta charset="UTF-8"> und <meta name="viewport" content="width=device-width"> hinzu'
        },
        {
            id: 'T-SHARED', cat: 'structure', name: 'Shared Scripts', weight: 7,
            check: (html) => html.includes('dkz-debug.js') || html.includes('dkz-test.js'),
            hint: 'DkZ Shared Scripts nicht eingebunden.',
            fix: 'Fuege <script src="../../shared/dkz-debug.js"></script> vor </body> ein'
        },
        {
            id: 'T-HUBLINK', cat: 'structure', name: 'Hub-Link vorhanden', weight: 4,
            check: (html) => html.includes('hub/index.html') || html.includes('Hub'),
            hint: 'Kein Zurueck-zum-Hub Link.',
            fix: 'Fuege <a href="../../hub/index.html">← Hub</a> hinzu'
        },
        {
            id: 'T-TITLE', cat: 'structure', name: 'Title Tag', weight: 3,
            check: (html) => html.match(/<title>.+<\/title>/) !== null,
            hint: 'Kein <title> Tag.',
            fix: 'Fuege <title>Modulname — DkZ</title> hinzu'
        },

        // --- LOGIC ---
        {
            id: 'L-SAVE', cat: 'logic', name: 'Daten persistiert', weight: 8,
            check: (html) => html.match(/localStorage|sessionStorage|indexedDB|puter/) !== null,
            hint: 'Keine Datenpersistierung.',
            fix: 'Nutze localStorage.setItem("key", JSON.stringify(data)) oder Puter Cloud'
        },
        {
            id: 'L-INIT', cat: 'logic', name: 'Init-Funktion', weight: 5,
            check: (html) => html.match(/function\s+init|DOMContentLoaded|window\.onload/) !== null,
            hint: 'Keine init()-Funktion oder DOMContentLoaded Handler.',
            fix: 'Fuege document.addEventListener("DOMContentLoaded", init) hinzu'
        },
        {
            id: 'L-TOAST', cat: 'logic', name: 'User Feedback', weight: 4,
            check: (html) => html.match(/toast|showToast|alert\(|confirm\(|\.toast/) !== null,
            hint: 'Kein User-Feedback (Toast/Alert).',
            fix: 'Fuege eine showToast(msg) Funktion hinzu fuer Benutzer-Feedback'
        },
        {
            id: 'L-EXPORT', cat: 'logic', name: 'Export-Funktion', weight: 3,
            check: (html) => html.match(/export|download|Blob|saveAs/) !== null,
            hint: 'Keine Export-Funktion.',
            fix: 'Fuege Daten-Export via Blob + download hinzu'
        }
    ];

    // ========================================
    // CORE: EVALUATE CONTENT
    // ========================================
    function evaluate(content, type) {
        type = type || 'html';
        var results = [];
        var totalScore = 0;
        var totalWeight = 0;
        var catScores = {};

        RULES.forEach(function (rule) {
            if (rule.cat === 'prompt' && type !== 'prompt') return;
            if (type === 'prompt' && ['design', 'structure', 'security'].indexOf(rule.cat) !== -1) return;

            var passed = false;
            try { passed = rule.check(content); } catch (e) { passed = true; }

            if (!catScores[rule.cat]) catScores[rule.cat] = { pass: 0, fail: 0, total: 0 };
            catScores[rule.cat].total++;

            if (passed) {
                catScores[rule.cat].pass++;
                totalScore += rule.weight;
            } else {
                catScores[rule.cat].fail++;
                results.push({ rule: rule, passed: false });
            }
            totalWeight += rule.weight;
        });

        var score = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 100;

        return {
            score: score,
            grade: score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F',
            color: score >= 90 ? '#00ff88' : score >= 75 ? '#55ACEE' : score >= 60 ? '#FFB800' : '#fa1e4e',
            issues: results,
            categories: catScores,
            totalRules: RULES.filter(function (r) { return type === 'prompt' ? r.cat === 'prompt' || r.cat === 'quality' || r.cat === 'logic' : true; }).length
        };
    }

    // ========================================
    // ECOSYSTEM SCORE (erweiterter Score fuer Module)
    // ========================================
    function ecosystemScore(html) {
        var base = evaluate(html, 'html');
        var bonus = 0;
        var maxBonus = 30;

        // Bonus: features.json Reference
        if (html.includes('features.json')) bonus += 5;
        // Bonus: README Reference
        if (html.includes('README')) bonus += 3;
        // Bonus: Chain Navigation (Builder-Chain)
        if (html.includes('chain-btn') || html.includes('chain-nav')) bonus += 5;
        // Bonus: NEXUZ integration
        if (html.includes('nexuz.js') || html.includes('NEXUZ')) bonus += 5;
        // Bonus: JAMEZ™ integration
        if (html.includes('dkz-james.js') || html.includes('DkzJames')) bonus += 4;
        // Bonus: Module version meta tag
        if (html.match(/dkz-version|v\d+\.\d+/)) bonus += 3;
        // Bonus: Service Worker
        if (html.includes('serviceWorker') || html.includes('sw.js')) bonus += 3;
        // Bonus: Accessibility
        if (html.includes('dkz-a11y.js') || html.match(/aria-|role=/)) bonus += 2;

        var bonusPct = Math.round((Math.min(bonus, maxBonus) / maxBonus) * 20);
        var finalScore = Math.min(100, base.score + bonusPct);

        return {
            baseScore: base.score,
            bonusScore: bonusPct,
            finalScore: finalScore,
            grade: finalScore >= 90 ? 'A+' : finalScore >= 80 ? 'A' : finalScore >= 70 ? 'B' : finalScore >= 55 ? 'C' : 'D',
            color: finalScore >= 90 ? '#00ff88' : finalScore >= 75 ? '#55ACEE' : finalScore >= 60 ? '#FFB800' : '#fa1e4e',
            issues: base.issues,
            categories: base.categories,
            compatibility: {
                theme: html.includes('dkz-theme.css'),
                nexuz: html.includes('nexuz.js') || html.includes('NEXUZ'),
                jamez: html.includes('dkz-james.js'),
                chain: html.includes('chain-btn') || html.includes('chain-nav'),
                exports: html.match(/dkz-export\.js|export/) !== null,
                version: html.match(/dkz-version/) !== null
            }
        };
    }

    // ========================================
    // MISTRAL OCR: Bilder/PDFs lesen
    // ========================================
    async function ocr(input, options) {
        options = options || {};
        var apiKey = '';

        // Get Mistral API key from NEXUZ or localStorage
        if (typeof NEXUZ !== 'undefined' && NEXUZ.getToken) {
            apiKey = NEXUZ.getToken('mistral');
        }
        if (!apiKey) {
            apiKey = localStorage.getItem('mistral-api-key') || '';
        }

        if (!apiKey) {
            // Fallback: try to use NEXUZ chat to describe the image
            if (typeof NEXUZ !== 'undefined' && NEXUZ.chat) {
                try {
                    var result = await NEXUZ.chat('Beschreibe dieses Dokument/Bild: ' + (typeof input === 'string' ? input : '[Binary Data]'), {
                        model: options.model || 'auto',
                        systemPrompt: 'Du bist ein OCR-Agent. Lese und beschreibe den Inhalt so genau wie moeglich.'
                    });
                    return { text: result.response || result.message || '', source: 'llm-fallback', pages: 1 };
                } catch (e) {
                    return { text: '', error: 'Kein Mistral API Key und LLM-Fallback fehlgeschlagen: ' + e.message, source: 'error' };
                }
            }
            return { text: '', error: 'Kein Mistral API Key konfiguriert. Setze in Einstellungen oder NEXUZ.setToken("mistral", "key")', source: 'error' };
        }

        // Call Mistral OCR API
        try {
            var body = {
                model: 'mistral-ocr-latest',
                document: typeof input === 'string' && input.startsWith('http')
                    ? { type: 'document_url', document_url: input }
                    : { type: 'image_url', image_url: input }
            };

            if (options.pages) body.pages = options.pages;
            if (options.includeImages) body.include_image_base64 = true;

            var response = await fetch('https://api.mistral.ai/v1/ocr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                var errText = await response.text();
                throw new Error('Mistral OCR ' + response.status + ': ' + errText);
            }

            var data = await response.json();
            var text = '';
            var pages = 0;

            if (data.pages) {
                pages = data.pages.length;
                text = data.pages.map(function (p) { return p.markdown || p.text || ''; }).join('\n\n---\n\n');
            } else if (data.text) {
                text = data.text;
                pages = 1;
            }

            return { text: text, pages: pages, source: 'mistral-ocr', raw: data };
        } catch (e) {
            // Fallback to NEXUZ LLM
            if (typeof NEXUZ !== 'undefined' && NEXUZ.chat) {
                try {
                    var fallback = await NEXUZ.chat('OCR fehlgeschlagen. Beschreibe: ' + input, { model: 'auto' });
                    return { text: fallback.response || '', source: 'llm-fallback', error: e.message };
                } catch (e2) {
                    return { text: '', error: 'OCR + Fallback fehlgeschlagen: ' + e.message, source: 'error' };
                }
            }
            return { text: '', error: e.message, source: 'error' };
        }
    }

    // ========================================
    // MISTRAL OCR 0.8: Object Detection
    // ========================================
    async function detectObjects(imageInput, options) {
        options = options || {};
        var apiKey = '';
        if (typeof NEXUZ !== 'undefined' && NEXUZ.getToken) {
            apiKey = NEXUZ.getToken('mistral');
        }
        if (!apiKey) apiKey = localStorage.getItem('mistral-api-key') || '';

        if (!apiKey) {
            // LLM fallback for object detection
            if (typeof NEXUZ !== 'undefined' && NEXUZ.chat) {
                try {
                    var result = await NEXUZ.chat('Identifiziere alle Objekte in diesem Bild. Liste sie mit Position (oben/unten/links/rechts/mitte), Typ und Konfidenz. Bild: ' + (typeof imageInput === 'string' ? imageInput : '[Binary]'), {
                        model: options.model || 'auto',
                        systemPrompt: 'Du bist JAMEZ™ Vision, ein Objekterkennungs-Agent. Gib JSON zurueck: {"objects":[{"label":"...","confidence":0.95,"position":"center","bbox":[x,y,w,h]}]}'
                    });
                    try {
                        var parsed = JSON.parse((result.response || '').match(/\{[\s\S]*\}/)?.[0] || '{}');
                        return { objects: parsed.objects || [], source: 'llm-vision', model: 'mistral-ocr-0.8' };
                    } catch(pe) {
                        return { objects: [], raw: result.response, source: 'llm-raw' };
                    }
                } catch(e) {
                    return { objects: [], error: e.message, source: 'error' };
                }
            }
            return { objects: [], error: 'Kein Mistral API Key', source: 'error' };
        }

        try {
            var body = {
                model: 'mistral-ocr-0.8',
                document: typeof imageInput === 'string' && imageInput.startsWith('http')
                    ? { type: 'image_url', image_url: imageInput }
                    : { type: 'image_url', image_url: imageInput },
                include_image_base64: false,
                object_detection: true
            };

            var response = await fetch('https://api.mistral.ai/v1/ocr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error('Mistral OCR 0.8: ' + response.status);
            var data = await response.json();

            return {
                objects: data.objects || data.detections || [],
                text: data.pages ? data.pages.map(function(p) { return p.markdown || ''; }).join('\n') : '',
                source: 'mistral-ocr-0.8',
                raw: data
            };
        } catch(e) {
            return { objects: [], error: e.message, source: 'error' };
        }
    }

    // ========================================
    // BATCH OCR: Mehrere Bilder gleichzeitig
    // ========================================
    async function batchOCR(inputs, options) {
        options = options || {};
        var results = [];
        var batchSize = options.batchSize || 5;

        for (var i = 0; i < inputs.length; i += batchSize) {
            var batch = inputs.slice(i, i + batchSize);
            var promises = batch.map(function(input) {
                return ocr(input, options);
            });
            var batchResults = await Promise.allSettled(promises);
            batchResults.forEach(function(r, idx) {
                results.push({
                    input: batch[idx],
                    index: i + idx,
                    status: r.status,
                    result: r.status === 'fulfilled' ? r.value : { error: r.reason?.message || 'Failed' }
                });
            });
        }

        return {
            total: inputs.length,
            success: results.filter(function(r) { return r.status === 'fulfilled'; }).length,
            failed: results.filter(function(r) { return r.status === 'rejected'; }).length,
            results: results,
            source: 'batch-ocr'
        };
    }

    // ========================================
    // STRUCTURED EXTRACT: JSON aus Dokumenten
    // ========================================
    async function structuredExtract(input, schema, options) {
        options = options || {};
        // First: OCR the document
        var ocrResult = await ocr(input, options);
        if (ocrResult.error && !ocrResult.text) return { data: null, error: ocrResult.error, source: 'error' };

        // Then: Extract structured data via LLM
        if (typeof NEXUZ !== 'undefined' && NEXUZ.chat) {
            try {
                var schemaStr = typeof schema === 'string' ? schema : JSON.stringify(schema, null, 2);
                var result = await NEXUZ.chat(
                    'Extrahiere strukturierte Daten aus diesem Text nach folgendem Schema:\n\nSchema:\n```json\n' + schemaStr + '\n```\n\nText:\n' + ocrResult.text.substring(0, 6000),
                    { model: 'auto', systemPrompt: 'Du bist JAMEZ™ Extraktor. Gib NUR valides JSON zurueck, passend zum Schema.' }
                );
                try {
                    var jsonMatch = (result.response || '').match(/\{[\s\S]*\}/);
                    if (jsonMatch) return { data: JSON.parse(jsonMatch[0]), ocrText: ocrResult.text, source: 'structured-extract' };
                } catch(pe) { /* raw fallback */ }
                return { data: null, raw: result.response, ocrText: ocrResult.text, source: 'extract-raw' };
            } catch(e) {
                return { data: null, error: e.message, ocrText: ocrResult.text, source: 'error' };
            }
        }
        return { data: null, ocrText: ocrResult.text, error: 'NEXUZ nicht verfuegbar', source: 'ocr-only' };
    }

    // ========================================
    // LLM EVALUATION: Tiefe Code-Analyse
    // ========================================
    async function evaluateWithLLM(code, context) {
        context = context || 'DkZ Modul';
        if (typeof NEXUZ === 'undefined' || !NEXUZ.chat) {
            return { rating: null, feedback: 'NEXUZ nicht verfuegbar. Starte ONTHERUN Gateway.', source: 'error' };
        }

        try {
            var knowledgeCtx = 'WISSENSBASIS: ' +
                'DkZ Playbook v' + KNOWLEDGE.playbook.version + ': ' +
                '7-Block-Standard Pflicht, Min.Tags=' + KNOWLEDGE.playbook.tagRules.minTags + ', ' +
                'Farben: Accent=#fa1e4e Success=#00FF88 Warning=#FFB800, ' +
                'Fonts: ' + KNOWLEDGE.playbook.fonts.sans + '+' + KNOWLEDGE.playbook.fonts.mono + ', ' +
                'Version: ' + KNOWLEDGE.playbook.versionFormat + '. ' +
                'BLAUPAUSE: ' + KNOWLEDGE.blueprint.totalModules + ' Module, ' +
                'Pflicht: ' + KNOWLEDGE.blueprint.sharedScripts.pflicht.join('+') + ', ' +
                'Quality: ' + KNOWLEDGE.blueprint.qualityStandards.slice(0, 5).join('; ') + '. ' +
                'OpenClaw: ' + KNOWLEDGE.openclaw.framework + ' Orchestrator, ' +
                'LiteLLM Gateway, ' + KNOWLEDGE.openclaw.architecture.layers.join('→') + ', ' +
                'Self-Repair: ' + KNOWLEDGE.openclaw.architecture.selfRepair.join('→') + '. ' +
                'Regeln: ' + Object.entries(KNOWLEDGE.rules).map(function (e) { return e[0] + ':' + e[1] }).slice(0, 5).join('; ') + '. ' +
                'Konventionen: Vanilla HTML/CSS/JS, kein Framework, kebab-case, esc() XSS, showToast(), localStorage dkz-*.';

            var systemPrompt = 'Du bist JAMEZ™, der DkZ Code-Evaluator (v' + VERSION + '). ' +
                knowledgeCtx + ' ' +
                'Bewerte den Code nach DkZ-Standards: 1) Qualitaet 2) Sicherheit 3) Design(DkZ Theme) 4) Struktur(Shared Scripts) 5) Logik. ' +
                'Pruefe insbesondere: DkZ Theme CSS, Shared Scripts Pflicht (debug+guide+copilot), Hub-Link, Toast, localStorage, XSS-Schutz, Responsive. ' +
                'Gib eine Bewertung 0-100, maximal 5 Issues mit Severity und DkZ-konformen Fix-Vorschlaegen. ' +
                'Antworte als JSON: {"score":N,"issues":[{"id":"X","severity":"error|warning|info","message":"...","fix":"..."}],"summary":"..."}';

            var result = await NEXUZ.chat(
                'Evaluiere diesen ' + context + ' Code:\n\n```\n' + code.substring(0, 8000) + '\n```',
                { model: 'auto', systemPrompt: systemPrompt }
            );

            var response = result.response || result.message || '';
            // Try to parse JSON from response
            try {
                var jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    var parsed = JSON.parse(jsonMatch[0]);
                    return { rating: parsed.score, issues: parsed.issues || [], summary: parsed.summary || '', source: 'llm', raw: response };
                }
            } catch (pe) { /* not valid JSON, use raw */ }

            return { rating: null, feedback: response, source: 'llm-raw' };
        } catch (e) {
            return { rating: null, feedback: 'LLM-Evaluation fehlgeschlagen: ' + e.message, source: 'error' };
        }
    }

    // ========================================
    // SUGGEST FIX: Fix-Vorschlag via LLM
    // ========================================
    async function suggestFix(issue, code) {
        if (typeof NEXUZ === 'undefined' || !NEXUZ.chat) {
            return { fix: issue.rule ? issue.rule.fix || issue.rule.hint : 'Kein Fix verfuegbar', source: 'local' };
        }

        try {
            var result = await NEXUZ.chat(
                'Fix dieses Issue:\nRule: ' + (issue.rule ? issue.rule.id + ' - ' + issue.rule.name : 'unbekannt') +
                '\nHint: ' + (issue.rule ? issue.rule.hint : '') +
                '\nCode-Ausschnitt:\n```\n' + (code || '').substring(0, 3000) + '\n```\n\nGib NUR den korrigierten Code-Ausschnitt zurueck.',
                { model: 'auto', systemPrompt: 'Du bist ein Code-Fix-Agent. Gib nur den minimalen Fix zurueck.' }
            );
            return { fix: result.response || result.message || '', source: 'llm' };
        } catch (e) {
            return { fix: issue.rule ? issue.rule.fix || issue.rule.hint : 'Fix fehlgeschlagen', source: 'local-fallback' };
        }
    }

    // ========================================
    // COMPARE VERSIONS: Diff-Bewertung
    // ========================================
    function compareVersions(oldCode, newCode) {
        var oldResult = evaluate(oldCode, 'html');
        var newResult = evaluate(newCode, 'html');
        var diff = newResult.score - oldResult.score;

        // Count fixed and new issues
        var oldIds = oldResult.issues.map(function (i) { return i.rule.id; });
        var newIds = newResult.issues.map(function (i) { return i.rule.id; });
        var fixed = oldIds.filter(function (id) { return newIds.indexOf(id) === -1; });
        var introduced = newIds.filter(function (id) { return oldIds.indexOf(id) === -1; });

        return {
            oldScore: oldResult.score,
            newScore: newResult.score,
            diff: diff,
            improved: diff > 0,
            fixedIssues: fixed,
            newIssues: introduced,
            summary: diff > 0 ? 'Score verbessert um ' + diff + ' Punkte' :
                diff < 0 ? 'Score verschlechtert um ' + Math.abs(diff) + ' Punkte' :
                    'Score unveraendert'
        };
    }

    // ========================================
    // READ DOCUMENT: URL/File lesen via OCR oder Fetch
    // ========================================
    async function readDocument(url) {
        // If it's an image or PDF, use OCR
        if (url.match(/\.(png|jpg|jpeg|gif|webp|pdf|tiff?)$/i)) {
            return ocr(url);
        }

        // Otherwise try fetch
        try {
            var response = await fetch(url);
            var text = await response.text();
            return { text: text, source: 'fetch', pages: 1 };
        } catch (e) {
            // Fallback to OCR
            return ocr(url);
        }
    }

    // ========================================
    // RENDER PANEL (UI Component)
    // ========================================
    function renderPanel(containerId, content, type) {
        var el = document.getElementById(containerId);
        if (!el) return;
        var result = evaluate(content, type);

        var html = '<div style="background:var(--card,#1a1a1c);border:1px solid var(--border,#333);border-radius:12px;padding:12px;font-family:var(--font,Inter,sans-serif)">';
        html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
        html += '<div style="width:36px;height:36px;border-radius:50%;background:' + result.color + ';display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;color:#000">' + result.grade + '</div>';
        html += '<div><div style="font-weight:800;font-size:13px">JAMEZ™ Score: ' + result.score + '/100</div>';
        html += '<div style="font-size:10px;color:var(--muted,#a1a1aa)">' + result.issues.length + ' Issues | v' + VERSION + '</div></div></div>';

        // Category bars
        Object.keys(CATEGORIES).forEach(function (cat) {
            var cs = result.categories[cat];
            if (!cs) return;
            var pct = cs.total > 0 ? Math.round((cs.pass / cs.total) * 100) : 100;
            html += '<div style="margin-bottom:4px;display:flex;align-items:center;gap:6px">';
            html += '<span style="font-size:9px;width:60px;color:' + CATEGORIES[cat].color + ';font-weight:700">' + CATEGORIES[cat].name + '</span>';
            html += '<div style="flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:2px">';
            html += '<div style="width:' + pct + '%;height:100%;background:' + CATEGORIES[cat].color + ';border-radius:2px;transition:width .5s"></div></div>';
            html += '<span style="font-size:9px;color:var(--muted,#999)">' + pct + '%</span></div>';
        });

        // Issues
        if (result.issues.length > 0) {
            html += '<div style="margin-top:8px;border-top:1px solid rgba(255,255,255,.05);padding-top:8px">';
            html += '<div style="font-size:9px;font-weight:700;color:var(--muted,#999);margin-bottom:4px">ISSUES (' + result.issues.length + ')</div>';
            result.issues.forEach(function (issue) {
                html += '<div style="font-size:10px;padding:4px 6px;margin-bottom:2px;background:rgba(250,30,78,.06);border-radius:4px;color:#fa6b8a">';
                html += '<b>' + issue.rule.id + '</b> ' + issue.rule.hint;
                if (issue.rule.fix) {
                    html += '<div style="font-size:9px;color:#55ACEE;margin-top:2px">💡 ' + issue.rule.fix + '</div>';
                }
                html += '</div>';
            });
            html += '</div>';
        }

        html += '</div>';
        el.innerHTML = html;
        return result;
    }

    // ========================================
    // AUTO-INJECT PANEL (bottom-left badge)
    // ========================================
    function injectPanel() {
        if (document.getElementById('jamez-panel')) return;

        var panel = document.createElement('div');
        panel.id = 'jamez-panel';
        panel.style.cssText = 'position:fixed;bottom:12px;left:12px;width:280px;z-index:9999;transition:transform .3s;';

        var content = document.documentElement.outerHTML;
        var result = evaluate(content, 'html');

        panel.innerHTML = '<div id="jamez-badge" onclick="DkzJames.togglePanel()" style="cursor:pointer;padding:6px 12px;background:var(--card,#1a1a1c);border:1px solid var(--border,#333);border-radius:20px;display:inline-flex;align-items:center;gap:6px;font-family:var(--font,Inter,sans-serif);font-size:11px;font-weight:700;color:var(--text,#f6f6f7)">' +
            '<span style="width:20px;height:20px;border-radius:50%;background:' + result.color + ';display:flex;align-items:center;justify-content:center;font-size:9px;color:#000;font-weight:900">' + result.grade + '</span>' +
            'JAMEZ\u2122 ' + result.score + ' | v' + VERSION + ' KB\u2713</div>' +
            '<div id="jamez-detail" style="display:none;margin-top:6px"></div>';

        document.body.appendChild(panel);
        renderPanel('jamez-detail', content, 'html');

        // Inject Quick-Help button (bottom-right ?)
        injectHelpButton(result);
    }

    function togglePanel() {
        var d = document.getElementById('jamez-detail');
        if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none';
    }

    // ========================================
    // QUICK-HELP BUTTON (bottom-right ❓)
    // ========================================
    var _helpOverlay = null;

    function injectHelpButton(result) {
        if (document.getElementById('jamez-help-btn')) return;

        var btn = document.createElement('button');
        btn.id = 'jamez-help-btn';
        btn.innerHTML = '❓';
        btn.title = 'JAMEZ\u2122 Quick-Help';
        btn.style.cssText = 'position:fixed;bottom:20px;right:140px;width:40px;height:40px;border-radius:50%;' +
            'background:linear-gradient(135deg,#f59e0b,#f97316);border:none;color:#000;font-size:1.1rem;' +
            'cursor:pointer;box-shadow:0 4px 20px rgba(245,158,11,0.4);z-index:99989;transition:all .3s;' +
            'display:flex;align-items:center;justify-content:center;';
        btn.onmouseenter = function() { btn.style.transform = 'scale(1.1)'; };
        btn.onmouseleave = function() { btn.style.transform = 'scale(1)'; };
        btn.onclick = function() { toggleHelp(); };
        document.body.appendChild(btn);
    }

    function toggleHelp() {
        if (_helpOverlay) {
            _helpOverlay.style.display = _helpOverlay.style.display === 'none' ? 'flex' : 'none';
            return;
        }

        // Bewerte aktuelle Seite
        var content = document.documentElement.outerHTML;
        var result = evaluate(content, 'html');
        var eco = ecosystemScore(content);
        var topIssues = result.issues.slice(0, 5);

        _helpOverlay = document.createElement('div');
        _helpOverlay.id = 'jamez-help-overlay';
        _helpOverlay.style.cssText = 'position:fixed;bottom:70px;right:20px;width:380px;max-height:480px;' +
            'background:rgba(14,14,18,0.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);' +
            'border:1px solid rgba(245,158,11,0.3);border-radius:16px;z-index:99990;font-family:Inter,sans-serif;' +
            'display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.6);';

        // Header
        var headerHtml = '<div style="padding:14px 16px;background:rgba(245,158,11,0.06);border-bottom:1px solid rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:space-between">' +
            '<div style="display:flex;align-items:center;gap:8px">' +
            '<span style="width:28px;height:28px;border-radius:50%;background:' + result.color + ';display:flex;align-items:center;justify-content:center;font-size:12px;color:#000;font-weight:900">' + result.grade + '</span>' +
            '<div><div style="font-weight:800;font-size:.85rem;color:#f0f0f2">JAMEZ\u2122 Quick-Help</div>' +
            '<div style="font-size:.6rem;color:#8a8a9a">Score: ' + result.score + '/100 \u00b7 Eco: ' + eco.finalScore + '/100 \u00b7 v' + VERSION + '</div></div></div>' +
            '<button onclick="DkzJames.toggleHelp()" style="background:none;border:none;color:#8a8a9a;cursor:pointer;font-size:1.1rem">\u2715</button></div>';

        // Kategorien
        var catsHtml = '<div style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.04)">' +
            '<div style="font-size:.65rem;font-weight:700;color:#8a8a9a;margin-bottom:6px;text-transform:uppercase">Kategorie-Score</div>';
        Object.keys(CATEGORIES).forEach(function(cat) {
            var cs = result.categories[cat];
            if (!cs) return;
            var pct = cs.total > 0 ? Math.round((cs.pass / cs.total) * 100) : 100;
            catsHtml += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">' +
                '<span style="font-size:.6rem;width:56px;color:' + CATEGORIES[cat].color + ';font-weight:700">' + CATEGORIES[cat].name + '</span>' +
                '<div style="flex:1;height:3px;background:rgba(255,255,255,.06);border-radius:2px">' +
                '<div style="width:' + pct + '%;height:100%;background:' + CATEGORIES[cat].color + ';border-radius:2px;transition:width .5s"></div></div>' +
                '<span style="font-size:.55rem;color:#6a6a7a">' + pct + '%</span></div>';
        });
        catsHtml += '</div>';

        // Issues
        var issuesHtml = '<div style="flex:1;overflow-y:auto;padding:10px 16px">';
        if (topIssues.length === 0) {
            issuesHtml += '<div style="text-align:center;padding:20px;color:#00ff88;font-size:.8rem;font-weight:700">\u2705 Keine Issues gefunden!</div>';
        } else {
            issuesHtml += '<div style="font-size:.65rem;font-weight:700;color:#8a8a9a;margin-bottom:6px;text-transform:uppercase">Top Issues (' + topIssues.length + ')</div>';
            topIssues.forEach(function(issue) {
                issuesHtml += '<div style="padding:8px 10px;margin-bottom:6px;background:rgba(250,30,78,0.06);border:1px solid rgba(250,30,78,0.12);border-radius:8px">' +
                    '<div style="font-size:.7rem;font-weight:700;color:#fa6b8a">' + issue.rule.id + ' \u2014 ' + issue.rule.name + '</div>' +
                    '<div style="font-size:.6rem;color:#8a8a9a;margin-top:2px">' + issue.rule.hint + '</div>';
                if (issue.rule.fix) {
                    issuesHtml += '<div style="font-size:.58rem;color:#55ACEE;margin-top:4px;padding:4px 6px;background:rgba(85,172,238,0.06);border-radius:4px">\ud83d\udca1 ' + issue.rule.fix + '</div>';
                }
                issuesHtml += '</div>';
            });
        }
        issuesHtml += '</div>';

        // Footer Links
        var footerHtml = '<div style="padding:10px 16px;border-top:1px solid rgba(255,255,255,0.04);display:flex;gap:6px">' +
            '<button onclick="DkzJames.togglePanel()" style="flex:1;padding:6px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);border-radius:6px;color:#00ff88;font-size:.65rem;font-weight:700;cursor:pointer;font-family:inherit">\ud83d\udcca Detail-Panel</button>' +
            '<button onclick="DkzJames.toggleHelp();if(typeof DkzGuide!==\'undefined\')DkzGuide.start()" style="flex:1;padding:6px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:6px;color:#818cf8;font-size:.65rem;font-weight:700;cursor:pointer;font-family:inherit">\ud83d\udcd6 Guide starten</button>' +
            '</div>';

        _helpOverlay.innerHTML = headerHtml + catsHtml + issuesHtml + footerHtml;
        document.body.appendChild(_helpOverlay);
    }

    function toggleHelp() {
        if (_helpOverlay) {
            _helpOverlay.style.display = _helpOverlay.style.display === 'none' ? 'flex' : 'none';
        } else {
            toggleHelp._init = true;
            // Lazy-create
            var content = document.documentElement.outerHTML;
            var result = evaluate(content, 'html');
            injectHelpButton(result);
            toggleHelp();
        }
    }

    // Auto-inject on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(injectPanel, 500); });
    } else {
        setTimeout(injectPanel, 500);
    }

    // ========================================
    // PUBLIC API
    // ========================================
    return {
        version: VERSION,
        // Core Evaluation
        evaluate: evaluate,
        ecosystemScore: ecosystemScore,
        compareVersions: compareVersions,
        // LLM Integration
        evaluateWithLLM: evaluateWithLLM,
        suggestFix: suggestFix,
        // Mistral OCR + Vision
        ocr: ocr,
        detectObjects: detectObjects,
        batchOCR: batchOCR,
        structuredExtract: structuredExtract,
        readDocument: readDocument,
        // UI
        renderPanel: renderPanel,
        injectPanel: injectPanel,
        togglePanel: togglePanel,
        injectHelpButton: injectHelpButton,
        toggleHelp: toggleHelp,
        // Data
        RULES: RULES,
        CATEGORIES: CATEGORIES,
        // Knowledge Base
        KNOWLEDGE: KNOWLEDGE,
        getKnowledge: function (key) { return key ? KNOWLEDGE[key] : KNOWLEDGE; },
        getPlaybook: function () { return KNOWLEDGE.playbook; },
        getBlueprint: function () { return KNOWLEDGE.blueprint; },
        getOpenClaw: function () { return KNOWLEDGE.openclaw; },
        getRules: function () { return KNOWLEDGE.rules; },
        getPromptBlueprints: function () { return KNOWLEDGE.promptBlueprints; }
    };
})();

if (typeof window !== 'undefined') window.DkzJames = DkzJames;
if (typeof window !== 'undefined') window.JAMES = DkzJames; // Alias
if (typeof window !== 'undefined') window.JAMEZ = DkzJames; // JAMEZ\u2122 Alias
