// ═══════════════════════════════════════════════════
//  V2 – PLAYBOOK · COSTS · CONTROL · LOGS
// ═══════════════════════════════════════════════════

// ── LLM DATABASE ──
const LLM_DB = [
  { name: 'GPT-4o', provider: 'OpenAI', input: 2.50, output: 10.00, context: '128K', speed: 'fast', quality: 'excellent', tier: 'expensive' },
  { name: 'GPT-4o-mini', provider: 'OpenAI', input: 0.15, output: 0.60, context: '128K', speed: 'fast', quality: 'good', tier: 'cheap' },
  { name: 'GPT-4.5', provider: 'OpenAI', input: 75.00, output: 150.00, context: '128K', speed: 'medium', quality: 'premium', tier: 'expensive' },
  { name: 'o1', provider: 'OpenAI', input: 15.00, output: 60.00, context: '200K', speed: 'slow', quality: 'excellent', tier: 'expensive' },
  { name: 'o3-mini', provider: 'OpenAI', input: 1.10, output: 4.40, context: '200K', speed: 'medium', quality: 'great', tier: 'mid' },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', input: 3.00, output: 15.00, context: '200K', speed: 'fast', quality: 'excellent', tier: 'mid' },
  { name: 'Claude 3 Haiku', provider: 'Anthropic', input: 0.25, output: 1.25, context: '200K', speed: 'fast', quality: 'good', tier: 'cheap' },
  { name: 'Claude 3 Opus', provider: 'Anthropic', input: 15.00, output: 75.00, context: '200K', speed: 'medium', quality: 'premium', tier: 'expensive' },
  { name: 'Gemini 2.0 Flash', provider: 'Google', input: 0.10, output: 0.40, context: '1M', speed: 'ultra', quality: 'good', tier: 'cheap' },
  { name: 'Gemini 1.5 Pro', provider: 'Google', input: 1.25, output: 5.00, context: '2M', speed: 'fast', quality: 'excellent', tier: 'mid' },
  { name: 'Gemini 2.0 Pro', provider: 'Google', input: 2.50, output: 10.00, context: '1M', speed: 'fast', quality: 'excellent', tier: 'mid' },
  { name: 'Mistral Large', provider: 'Mistral', input: 2.00, output: 6.00, context: '128K', speed: 'fast', quality: 'great', tier: 'mid' },
  { name: 'Mistral Small', provider: 'Mistral', input: 0.10, output: 0.30, context: '128K', speed: 'ultra', quality: 'good', tier: 'cheap' },
  { name: 'Codestral', provider: 'Mistral', input: 0.30, output: 0.90, context: '256K', speed: 'fast', quality: 'great', tier: 'cheap' },
  { name: 'DeepSeek V3', provider: 'DeepSeek', input: 0.27, output: 1.10, context: '128K', speed: 'fast', quality: 'great', tier: 'cheap' },
  { name: 'DeepSeek R1', provider: 'DeepSeek', input: 0.55, output: 2.19, context: '128K', speed: 'medium', quality: 'excellent', tier: 'cheap' },
  { name: 'Llama 3.3 70B', provider: 'Meta', input: 0.18, output: 0.18, context: '128K', speed: 'fast', quality: 'great', tier: 'cheap' },
  { name: 'Grok-2', provider: 'xAI', input: 2.00, output: 10.00, context: '128K', speed: 'fast', quality: 'great', tier: 'mid' },
  { name: 'Command R+', provider: 'Cohere', input: 2.50, output: 10.00, context: '128K', speed: 'fast', quality: 'great', tier: 'mid' },
  { name: 'Qwen 2.5 72B', provider: 'Alibaba', input: 0.35, output: 0.35, context: '128K', speed: 'fast', quality: 'great', tier: 'cheap' },
];

// ── COST TEMPLATES (Vorlage für jede Arbeit) ──
const COST_TEMPLATES = [
  { id: 'research', name: '🔬 Research & Analyse', desc: 'Web-Recherche, SEC-Filings, Marktanalyse', recommended: 'Claude 3.5 Sonnet', budget: 0.50, tasks: ['Web scraping', 'Data analysis', 'Report generation'] },
  { id: 'code', name: '💻 Code & Development', desc: 'Refactoring, neue Features, Tests', recommended: 'GPT-4o', budget: 1.00, tasks: ['Code writing', 'Debugging', 'Unit tests', 'Code review'] },
  { id: 'content', name: '✍️ Content Creation', desc: 'Newsletter, Blog, Social Media', recommended: 'Claude 3.5 Sonnet', budget: 0.30, tasks: ['Drafting', 'SEO optimization', 'Editing', 'Publishing'] },
  { id: 'creative', name: '🎨 Creative & Design', desc: 'Branding, Slides, Visual Assets', recommended: 'GPT-4o', budget: 0.40, tasks: ['Image generation', 'Layout design', 'Brand assets'] },
  { id: 'data', name: '📊 Data & Pipeline', desc: 'ETL, Datenbank, CRM-Enrichment', recommended: 'Gemini 2.0 Flash', budget: 0.20, tasks: ['Data enrichment', 'Pipeline jobs', 'CRM sync'] },
  { id: 'strategy', name: '🧠 Strategie & Planung', desc: 'Board Reports, Forecasts, KPI', recommended: 'Claude 3 Opus', budget: 0.80, tasks: ['Strategy synthesis', 'KPI tracking', 'Forecasting'] },
  { id: 'security', name: '🔐 Security & Audit', desc: 'Code Review, Compliance, Pen-Tests', recommended: 'o3-mini', budget: 0.60, tasks: ['Security audit', 'Vulnerability scan', 'Compliance check'] },
  { id: 'quick', name: '⚡ Quick Tasks', desc: 'Simple Fragen, Zusammenfassungen', recommended: 'Gemini 2.0 Flash', budget: 0.05, tasks: ['Summarization', 'Translation', 'Quick answers'] },
];

// ── PLAYBOOK TEMPLATES ──
const PLAYBOOK_DATA = [
  {
    id: 'mission', name: '🎯 Mission Control Setup', desc: 'Dashboard & Metriken konfigurieren',
    content: `<div class="pb-section"><div class="pb-section-title">Dashboard Konfiguration</div><div class="pb-text">Konfiguriere dein zentrales Command Center mit Live-Metriken, Agenten-Status und Activity Feed.</div></div>
   <div class="pb-section"><div class="pb-section-title">Key Metrics</div><ul class="pb-list"><li>Active Tasks Count</li><li>Content Pipeline (Items pro Stage)</li><li>Credits / Kosten live</li><li>Upcoming Events (48h)</li><li>Agent Activity Feed mit Timestamps</li></ul></div>
   <div class="pb-section"><div class="pb-section-title">Status Indikatoren</div><ul class="pb-list"><li>🟢 Grün = Aktiv / Working</li><li>🟡 Gelb = Pending / Wartend</li><li>🔴 Rot = Error / Fehler</li><li>⚫ Grau = Idle / Standby</li></ul></div>`},
  {
    id: 'tasks', name: '✅ Task Board Vorlage', desc: 'Kanban-Board mit Drag & Drop',
    content: `<div class="pb-section"><div class="pb-section-title">Kanban Spalten</div><ul class="pb-list"><li>📥 BACKLOG</li><li>📋 TODO</li><li>🔨 IN PROGRESS</li><li>✅ DONE</li></ul></div>
   <div class="pb-section"><div class="pb-section-title">Task Card Felder</div><ul class="pb-list"><li>Titel & Beschreibung</li><li>Assignee (Du oder Agent)</li><li>Priorität (Low / Medium / High / Urgent)</li><li>Due Date / Deadline</li><li>Status & Projekt-Zuordnung</li></ul></div>
   <div class="pb-section"><div class="pb-section-title">Projekte</div><div style="display:flex;flex-wrap:wrap;gap:4px"><span class="template-tag">Research</span><span class="template-tag">Development</span><span class="template-tag">Content</span><span class="template-tag">Brand</span><span class="template-tag">Sales</span><span class="template-tag">Security</span></div></div>`},
  {
    id: 'content', name: '📝 Content Pipeline', desc: '7-Stufen Content-Workflow',
    content: `<div class="pb-section"><div class="pb-section-title">Pipeline Stages</div><ul class="pb-list"><li>💡 IDEATION – Themen & Recherche</li><li>📝 DRAFT – Erster Entwurf</li><li>✏️ EDITING – Überarbeitung & SEO</li><li>🎨 DESIGN – Visuals & Thumbnails</li><li>🔍 REVIEW – Finale Prüfung</li><li>📅 SCHEDULED – Geplant zur Veröffentlichung</li><li>🚀 PUBLISHED – Live & Tracking</li></ul></div>
   <div class="pb-section"><div class="pb-section-title">Wochenplan</div><ul class="pb-list"><li>Mo: 📹 YouTube Long-Form</li><li>Di: 🐦 Twitter/X Thread</li><li>Mi: 💼 LinkedIn Artikel</li><li>Do: 📧 Newsletter</li><li>Fr: 📱 Short-Form / Reels</li></ul></div>`},
  {
    id: 'calendar', name: '📅 Kalender Setup', desc: 'Events, Content & Automations',
    content: `<div class="pb-section"><div class="pb-section-title">Kalender Kategorien</div><ul class="pb-list"><li>🔵 Tasks & Aufgaben</li><li>🟢 Content Publishing</li><li>🟣 Meetings & Calls</li><li>⚫ Automations / Cron Jobs</li></ul></div>
   <div class="pb-section"><div class="pb-section-title">Ansichten</div><ul class="pb-list"><li>Monats-Ansicht (Übersicht)</li><li>Wochen-Ansicht (Detailliert)</li><li>Tages-Ansicht (Planung)</li></ul></div>`},
  {
    id: 'team', name: '👥 AI Team Setup', desc: 'Org-Chart & Rollen definieren',
    content: `<div class="pb-section"><div class="pb-section-title">Team Struktur</div><ul class="pb-list"><li>👔 CEO / Orchestrator – JARVIS</li><li>🔬 Research Team – ATLAS, SAGE</li><li>💻 Dev Team – NEXUS, CIPHER, FORGE</li><li>✍️ Content Team – SCRIBE, ECHO</li><li>🎨 Creative Team – NOVA, LYRA</li><li>📊 Sales – AXIOM</li><li>🛰️ Data – ORBIT</li></ul></div>
   <div class="pb-section"><div class="pb-section-title">Pro Agent definieren</div><ul class="pb-list"><li>Name & Avatar</li><li>Role & Verantwortung</li><li>System Prompt / Identity</li><li>Operating Rules</li><li>Erlaubte Tools & APIs</li><li>Internet-Zugang (Ampel)</li><li>Budget-Limit pro Tag</li></ul></div>`},
  {
    id: 'crm', name: '📇 CRM / Contacts', desc: 'Kontakte & Clients verwalten',
    content: `<div class="pb-section"><div class="pb-section-title">Kontakt-Felder</div><ul class="pb-list"><li>Name & Rolle</li><li>Kommunikation (Email, Slack, Discord)</li><li>Timezone</li><li>Compensation (optional)</li><li>Notizen & History</li></ul></div>
   <div class="pb-section"><div class="pb-section-title">Kategorien</div><div style="display:flex;flex-wrap:wrap;gap:4px"><span class="template-tag">Internal Team</span><span class="template-tag">Content Team</span><span class="template-tag">External</span><span class="template-tag">Clients</span><span class="template-tag">Partners</span></div></div>`},
  {
    id: 'settings', name: '⚙️ Settings & Integrations', desc: 'Cron Jobs, APIs, Agent Config',
    content: `<div class="pb-section"><div class="pb-section-title">Integrations</div><ul class="pb-list"><li>🟢 OpenClaw – Verbunden</li><li>🟢 Slack – Verbunden</li><li>🟡 Notion – Konfiguration nötig</li><li>🟢 GitHub – Verbunden</li><li>🔴 Supabase – Nicht verbunden</li></ul></div>
   <div class="pb-section"><div class="pb-section-title">Cron Jobs</div><ul class="pb-list"><li>Daily: Morning Briefing (08:00)</li><li>Daily: Cost Report (18:00)</li><li>Weekly: Strategy Sync (Mo 09:00)</li><li>Weekly: Content Review (Fr 14:00)</li></ul></div>`},
  {
    id: 'architecture', name: '🏗️ System-Architektur', desc: 'Modularer Aufbauplan – alles greift ineinander',
    content: `
    <div class="pb-section"><div class="pb-section-title">🏗️ Gesamtarchitektur – So greift alles ineinander</div>
    <div class="pb-text" style="margin-bottom:16px">Das System wird modular aufgebaut: Jedes Modul ist eigenständig funktionsfähig, kommuniziert aber über den zentralen Event-Bus und den Shared State mit allen anderen Modulen. Der Orchestrator (JARVIS) koordiniert alles.</div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:16px;font-family:var(--font-mono);font-size:11px;line-height:2;color:var(--muted);margin-bottom:16px">
┌─────────────────────────────────────────────────┐<br>
│              🧠 SECOND BRAIN CORE               │<br>
│         (Event Bus · Shared State · Auth)        │<br>
├────────┬────────┬────────┬────────┬─────────────┤<br>
│ 🎯     │ ✅     │ 💬     │ 🏢    │ 📖          │<br>
│Mission │ Tasks  │ Chat   │ Org   │ Playbook    │<br>
│Control │ Board  │ Agent  │ Chart │ Templates   │<br>
├────────┼────────┼────────┼────────┼─────────────┤<br>
│ 🏠     │ 🧠     │ 💰     │ 🚦    │ 📋          │<br>
│Office  │ Memory │ Costs  │Control│ Logs        │<br>
│ View   │ Store  │ Track  │ Panel │ Analytics   │<br>
├────────┴────────┴────────┴────────┴─────────────┤<br>
│          🔌 Integration Layer                    │<br>
│  OpenClaw · Supabase · GitHub · Slack · APIs     │<br>
└─────────────────────────────────────────────────┘<br>
    </div></div>

    <div class="pb-section"><div class="pb-section-title">📦 Module & Abhängigkeiten</div>
    <ul class="pb-list">
      <li><strong>Layer 0 – Core:</strong> Event Bus, Shared State, Auth, Config</li>
      <li><strong>Layer 1 – Data:</strong> Memory Store, Log Engine, Cost Tracker</li>
      <li><strong>Layer 2 – Agents:</strong> Agent Registry, Prompt Engine, Tool Router</li>
      <li><strong>Layer 3 – UI:</strong> Dashboard, Tabs, Widgets, Themes</li>
      <li><strong>Layer 4 – Integration:</strong> OpenClaw API, LLM Router, Webhooks</li>
      <li><strong>Layer 5 – Control:</strong> Ampel System, YOLO/Plan Engine, Budget Manager</li>
    </ul></div>

    <div class="pb-section"><div class="pb-section-title">🔄 Datenfluss zwischen Modulen</div>
    <ul class="pb-list">
      <li>Agent startet Task → <strong>Task Board</strong> updated → <strong>Log</strong> schreibt Event</li>
      <li>LLM Call geht raus → <strong>Cost Tracker</strong> loggt → <strong>Budget Manager</strong> prüft Limit</li>
      <li>Internet-Anfrage → <strong>Ampel prüft</strong> → Rot: Block · Gelb: User-Prompt · Grün: Go</li>
      <li>YOLO Modus aktiv → Alle Genehmigungen übersprungen → <strong>Log</strong> markiert als YOLO</li>
      <li>PLAN Modus aktiv → Plan generiert → User approved → Sequenziell abgearbeitet</li>
      <li>Jede Aktion → <strong>Activity Feed</strong> live + <strong>Logs</strong> persistent + <strong>CSV Export</strong></li>
    </ul></div>`},
  {
    id: 'buildplan', name: '📐 Aufbauplan (Phasen)', desc: 'Schritt-für-Schritt modularer Aufbau',
    content: `
    <div class="pb-section"><div class="pb-section-title">Phase 1 – Foundation (Woche 1-2)</div>
    <ul class="pb-list">
      <li>🔧 Core Event Bus implementieren (pub/sub zwischen Modulen)</li>
      <li>🗄️ Shared State Manager (localStorage + Memory)</li>
      <li>🔐 Auth & Config Modul (API Keys, User Settings)</li>
      <li>📋 Log Engine aufsetzen (alle Events zentral speichern)</li>
      <li>💰 Cost Tracker Basis (LLM Calls tracken + Budget)</li>
    </ul></div>

    <div class="pb-section"><div class="pb-section-title">Phase 2 – Agent Layer (Woche 3-4)</div>
    <ul class="pb-list">
      <li>🤖 Agent Registry (alle Agenten + Rollen + Prompts)</li>
      <li>🧠 Prompt Engine (System Prompts pro Agent laden)</li>
      <li>🔀 LLM Router (Model-Auswahl pro Aufgabentyp)</li>
      <li>🌐 OpenClaw Integration (API Anbindung)</li>
      <li>🚦 Ampel System (Internet-Kontrolle pro Agent)</li>
      <li>⚡ YOLO/Plan Mode Engine</li>
    </ul></div>

    <div class="pb-section"><div class="pb-section-title">Phase 3 – UI & Dashboard (Woche 5-6)</div>
    <ul class="pb-list">
      <li>🎯 Mission Control View (Live-Metriken + Agent Status)</li>
      <li>✅ Task Board mit Kanban (Drag & Drop)</li>
      <li>💬 Chat Interface (pro Agent + Routing)</li>
      <li>🏢 Org Chart (dynamisch aus Agent Registry)</li>
      <li>🏠 Office View (Pixel Art + Live Positions)</li>
      <li>📖 Playbook (Templates + Workflows)</li>
    </ul></div>

    <div class="pb-section"><div class="pb-section-title">Phase 4 – Optimierung (Woche 7-8)</div>
    <ul class="pb-list">
      <li>📊 Analytics Dashboard (Schwächen identifizieren)</li>
      <li>🔁 Workflow Automation (Ketten von Agent-Actions)</li>
      <li>📱 Mobile Responsive Optimierung</li>
      <li>🗃️ Supabase Persistenz (State in DB speichern)</li>
      <li>📈 Performance Monitoring + Alerts</li>
      <li>🧪 A/B-Testing für LLM-Auswahl</li>
    </ul></div>`},
  {
    id: 'integration', name: '🔌 Modul-Integration', desc: 'Wie Module fließend ineinander greifen',
    content: `
    <div class="pb-section"><div class="pb-section-title">🔌 Event Bus – Zentrale Kommunikation</div>
    <div class="pb-text" style="margin-bottom:12px">Jedes Modul sendet und empfängt Events über den zentralen Bus. Kein Modul ruft ein anderes direkt auf – alles läuft über Events. So kann jedes Modul unabhängig entwickelt und getestet werden.</div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;font-family:var(--font-mono);font-size:11px;color:var(--muted);margin-bottom:16px">
// Event Bus Pattern<br>
EventBus.emit('task:created', { agent:'ATLAS', task:'Research Q4' });<br>
EventBus.emit('cost:incurred', { model:'GPT-4o', amount:0.003 });<br>
EventBus.emit('control:internet', { agent:'NEXUS', access:'green' });<br>
EventBus.emit('mode:changed', { agent:'ALL', mode:'yolo' });<br><br>
// Jedes Modul abonniert relevante Events<br>
EventBus.on('task:created', (data) => LogEngine.log(data));<br>
EventBus.on('cost:incurred', (data) => BudgetManager.check(data));<br>
EventBus.on('mode:changed', (data) => ControlPanel.update(data));<br>
    </div></div>

    <div class="pb-section"><div class="pb-section-title">🔗 Modul-zu-Modul Verbindungen</div>
    <ul class="pb-list">
      <li><strong>Tasks ↔ Agents:</strong> Task erstellt → Agent auswählen → Prompt laden → LLM Call</li>
      <li><strong>Costs ↔ Control:</strong> Budget-Limit erreicht → Ampel auf Rot → Agent pausiert</li>
      <li><strong>Chat ↔ Memory:</strong> Chat-Nachricht → Memory durchsuchen → Kontext anreichern</li>
      <li><strong>Control ↔ Logs:</strong> Jede Ampel-Änderung → sofort geloggt + Activity Feed</li>
      <li><strong>Playbook ↔ Tasks:</strong> Template wählen → Task automatisch erstellen + Agent zuweisen</li>
      <li><strong>Office ↔ Agents:</strong> Agent-Status ändert → Pixel-Avatar bewegt sich im Büro</li>
      <li><strong>Org ↔ Agents:</strong> Neue Rolle → Org Chart rebuilt + Team-Zuordnung aktualisiert</li>
    </ul></div>

    <div class="pb-section"><div class="pb-section-title">🔥 YOLO vs 📋 PLAN – Wie es fließt</div>
    <ul class="pb-list">
      <li><strong>PLAN Modus:</strong> Agent erstellt Plan → Wird im Dashboard angezeigt → User klickt "Genehmigen" → Plan wird Schritt für Schritt ausgeführt → Jeder Schritt wird geloggt</li>
      <li><strong>YOLO Modus:</strong> Agent erhält Aufgabe → Führt ALLES sofort aus, egal was → Kein Stopp, keine Rückfrage → Alle Aktionen werden rot markiert im Log → Am Ende: Zusammenfassung</li>
      <li><strong>Parallel-Buttons:</strong> Jeder Agent hat beide Buttons nebeneinander → Man kann pro Agent oder global umschalten → Die Ampel steuert das Internet unabhängig davon</li>
    </ul></div>`},
  {
    id: 'skills', name: '🧩 Skills-Katalog (KERN²)', desc: 'Standardisierte Aktionen für alle LLMs',
    content: `
    <div class="pb-section"><div class="pb-section-title">🧩 KERN² – Skill Hierarchie</div>
    <div class="pb-text">Im DkZ Ökosystem gilt: <strong>Skills</strong> (atomare Aktionen) → mehrere Skills = <strong>Workflow</strong> → mehrere Workflow-Ausgänge = <strong>Agent</strong>. Jeder Skill ist LLM-unabhängig und funktioniert mit jedem Provider.</div></div>

    <div class="pb-section"><div class="pb-section-title">📥 Input Skills</div>
    <ul class="pb-list">
      <li><strong>text:read</strong> – Text aus Datei/URL/Clipboard lesen</li>
      <li><strong>text:parse</strong> – Text in strukturierte Daten parsen</li>
      <li><strong>web:scrape</strong> – Webseite scrapen und Inhalt extrahieren</li>
      <li><strong>web:search</strong> – Suchmaschine abfagen (DuckDuckGo, Google)</li>
      <li><strong>file:read</strong> – Datei lesen (txt, csv, json, md)</li>
      <li><strong>api:get</strong> – HTTP GET Request an API</li>
      <li><strong>voice:listen</strong> – Spracheingabe via Web Speech API</li>
      <li><strong>image:capture</strong> – Screenshot oder Kamera-Bild</li>
    </ul></div>

    <div class="pb-section"><div class="pb-section-title">🧠 Processing Skills</div>
    <ul class="pb-list">
      <li><strong>llm:chat</strong> – Chat Completion an beliebigen LLM senden</li>
      <li><strong>llm:summarize</strong> – Text zusammenfassen</li>
      <li><strong>llm:translate</strong> – Übersetzen (Qwen Multilingual)</li>
      <li><strong>llm:analyze</strong> – Sentiment, Entities, Kategorien extrahieren</li>
      <li><strong>llm:code</strong> – Code generieren/refactoren</li>
      <li><strong>llm:reason</strong> – Chain-of-Thought Reasoning (o1, R1)</li>
      <li><strong>data:transform</strong> – Daten transformieren (map, filter, reduce)</li>
      <li><strong>data:merge</strong> – Mehrere Quellen zusammenführen</li>
      <li><strong>data:validate</strong> – Daten gegen Schema prüfen</li>
    </ul></div>

    <div class="pb-section"><div class="pb-section-title">📤 Output Skills</div>
    <ul class="pb-list">
      <li><strong>file:write</strong> – Datei schreiben (txt, csv, json, md)</li>
      <li><strong>api:post</strong> – HTTP POST/PUT an API</li>
      <li><strong>email:send</strong> – E-Mail senden</li>
      <li><strong>slack:send</strong> – Slack Nachricht senden</li>
      <li><strong>git:commit</strong> – Git add + commit</li>
      <li><strong>voice:speak</strong> – TTS Sprachausgabe (Fish Speech)</li>
      <li><strong>notify:toast</strong> – Dashboard Toast-Benachrichtigung</li>
      <li><strong>log:event</strong> – Event in Log schreiben</li>
    </ul></div>

    <div class="pb-section"><div class="pb-section-title">🛡️ Control Skills</div>
    <ul class="pb-list">
      <li><strong>ctrl:ampel</strong> – Internet-Zugang setzen (rot/gelb/grün)</li>
      <li><strong>ctrl:mode</strong> – YOLO/PLAN Modus umschalten</li>
      <li><strong>ctrl:budget</strong> – Budget prüfen/setzen</li>
      <li><strong>ctrl:approve</strong> – User-Genehmigung einholen</li>
      <li><strong>ctrl:loop</strong> – Ralph Loop starten (Iteration)</li>
      <li><strong>ctrl:stop</strong> – Agent/Workflow stoppen</li>
    </ul></div>`},
  {
    id: 'workflows', name: '🔄 Workflow-Builder', desc: 'Skills verketten → standardisierte Workflows',
    content: `
    <div class="pb-section"><div class="pb-section-title">🔄 Workflow = Skill-Kette</div>
    <div class="pb-text">Ein Workflow ist eine geordnete Kette von Skills. Jeder Skill-Output wird Input des nächsten. Egal welches LLM – der Workflow bleibt gleich.</div></div>

    <div class="pb-section"><div class="pb-section-title">📝 Content-Woche Workflow</div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;font-family:var(--font-mono);font-size:11px;color:var(--muted);line-height:2">
web:search("trending topics") → llm:analyze → llm:chat("Draft erstellen")<br>
→ llm:code("SEO optimieren") → file:write("draft.md")<br>
→ ctrl:approve → email:send → log:event("content:published")
    </div></div>

    <div class="pb-section"><div class="pb-section-title">🔍 Deep Research Workflow</div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;font-family:var(--font-mono);font-size:11px;color:var(--muted);line-height:2">
web:search(query) → web:scrape(urls) → data:merge<br>
→ llm:analyze → llm:summarize → file:write("report.md")<br>
→ notify:toast → log:event("research:complete")
    </div></div>

    <div class="pb-section"><div class="pb-section-title">🛡️ Security Audit Workflow</div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;font-family:var(--font-mono);font-size:11px;color:var(--muted);line-height:2">
file:read("codebase") → llm:analyze("vulnerabilities")<br>
→ llm:reason("fix suggestions") → ctrl:approve<br>
→ llm:code("apply fixes") → git:commit → log:event("audit:done")
    </div></div>

    <div class="pb-section"><div class="pb-section-title">💰 Kosten-Optimierung Workflow</div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;font-family:var(--font-mono);font-size:11px;color:var(--muted);line-height:2">
api:get("/logs?type=cost") → data:transform("group by model")<br>
→ llm:analyze("cheapest alternative") → ctrl:budget("update")<br>
→ notify:toast → log:event("cost:optimized")
    </div></div>

    <div class="pb-section"><div class="pb-section-title">🔄 System-Update Workflow</div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;font-family:var(--font-mono);font-size:11px;color:var(--muted);line-height:2">
git:commit("backup") → llm:code("implement changes")<br>
→ data:validate("tests pass") → ctrl:approve<br>
→ git:commit("deploy") → notify:toast("deployed") → log:event
    </div></div>`},
  {
    id: 'agentfactory', name: '🤖 Agent-Fabrik (J.A.V.I.Z²)', desc: 'Workflows → fertige Agenten konfigurieren',
    content: `
    <div class="pb-section"><div class="pb-section-title">🤖 Agent = Workflows + Identität + Regeln</div>
    <div class="pb-text">Ein Agent ist eine Sammlung von Workflows, kombiniert mit einer Identität (System Prompt), Operating Rules und Budget-Limits. <strong>777</strong> macht gar nichts – <strong>J.A.V.I.Z²</strong> übernimmt alles als Sprachassistent mit PicoClaw, direkte Verbindung zum <strong>OpenClaw Imperator</strong>. <strong>NEXUZ</strong> ist der zentrale Knoten/Rezeption.</div></div>

    <div class="pb-section"><div class="pb-section-title">👑 J.A.V.I.Z² – Sprachassistent & Imperator-Link</div>
    <ul class="pb-list">
      <li><strong>Rolle:</strong> Sprachassistent mit PicoClaw – direkte Verbindung zum OpenClaw Imperator</li>
      <li><strong>Workflows:</strong> ALLE – führt aus, delegiert, kontrolliert</li>
      <li><strong>Skills:</strong> voice:listen, voice:speak, web:scrape, llm:reason, llm:code, ctrl:mode, ctrl:budget</li>
      <li><strong>Browser-Use:</strong> Aktiv – beobachtet erst, übernimmt wenn sicher</li>
      <li><strong>PicoClaw:</strong> Lokale Windows-Steuerung + sichere Verbindung zu OpenClaw</li>
      <li><strong>Internet:</strong> 🟢 OPEN NET (via OpenClaw Imperator)</li>
      <li><strong>Budget:</strong> Unbegrenzt</li>
      <li><strong>Modus:</strong> PLAN (mit YOLO-Override Berechtigung)</li>
    </ul></div>

    <div class="pb-section"><div class="pb-section-title">🔗 NEXUZ – Hub & Rezeption</div>
    <ul class="pb-list">
      <li><strong>Rolle:</strong> Zentraler Knoten – Routing & Delegation</li>
      <li><strong>Workflows:</strong> Task-Routing, Agent-Matching, Load-Balancing</li>
      <li><strong>Skills:</strong> data:validate, ctrl:approve, api:post, log:event</li>
      <li><strong>Internet:</strong> 🟡 NACHFRAGEN</li>
      <li><strong>Budget:</strong> $5/Tag</li>
    </ul></div>

    <div class="pb-section"><div class="pb-section-title">🎙️ AiAi Kirk – Sprachbot</div>
    <ul class="pb-list">
      <li><strong>Rolle:</strong> Voice Interface & Sprach-Kommunikation</li>
      <li><strong>Workflows:</strong> Voice Input → LLM → TTS Output</li>
      <li><strong>Skills:</strong> voice:listen, llm:chat, voice:speak, llm:translate</li>
      <li><strong>Internet:</strong> 🟡 NACHFRAGEN</li>
      <li><strong>Budget:</strong> $3/Tag</li>
    </ul></div>

    <div class="pb-section"><div class="pb-section-title">🗣️ Neo – Systemsprache</div>
    <ul class="pb-list">
      <li><strong>Rolle:</strong> System-Kommunikation & Protokoll</li>
      <li><strong>Workflows:</strong> Systemmeldungen, Fehlermeldungen, Status-Updates</li>
      <li><strong>Skills:</strong> notify:toast, log:event, llm:summarize, email:send</li>
      <li><strong>Internet:</strong> 🔴 AUS</li>
      <li><strong>Budget:</strong> $1/Tag</li>
    </ul></div>

    <div class="pb-section"><div class="pb-section-title">🏗️ Agent erstellen – Formel</div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;font-family:var(--font-mono);font-size:11px;color:var(--muted);line-height:2">
Agent = {<br>
&nbsp;&nbsp;name: "ATLAS",<br>
&nbsp;&nbsp;role: "Senior Research Analyst",<br>
&nbsp;&nbsp;workflows: ["deep-research", "content-week", "cost-optimize"],<br>
&nbsp;&nbsp;skills: ["web:search", "web:scrape", "llm:analyze", "llm:summarize"],<br>
&nbsp;&nbsp;internet: "green",<br>
&nbsp;&nbsp;mode: "plan",<br>
&nbsp;&nbsp;budget: 5.00,<br>
&nbsp;&nbsp;llm: "claude-3-5-sonnet",<br>
&nbsp;&nbsp;systemPrompt: "Du bist ATLAS, ein..."<br>
}
    </div></div>`},
];

// ── ACTIVITY LOG STORAGE ──
const LOG_STORE = [];

function logEvent(type, agent, msg, cost = 0) {
  const ts = new Date();
  LOG_STORE.unshift({
    time: ts.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: ts.toLocaleDateString('de-DE'),
    type, agent, msg, cost: cost.toFixed(4),
    id: Date.now()
  });
  if (LOG_STORE.length > 500) LOG_STORE.pop();
}

// ── AGENT CONTROL STATE ──
const CTRL_STATE = {};
AGENTS.forEach(a => {
  CTRL_STATE[a.id] = {
    internet: 'yellow',  // red=off, yellow=ask, green=open
    mode: 'plan',        // plan or yolo
    budgetLimit: 5.00,
    totalSpent: +(Math.random() * 3).toFixed(2),
  };
});
// Main system (OpenClaw)
CTRL_STATE['openclaw'] = { internet: 'yellow', mode: 'plan', budgetLimit: 50.00, totalSpent: 12.47 };

// Seed some logs
['JARVIS', 'ATLAS', 'SCRIBE', 'NEXUS', 'NOVA', 'AXIOM', 'ECHO'].forEach(name => {
  logEvent('task', name, 'Agent gestartet und bereit', 0);
  logEvent('cost', name, `LLM Anfrage an ${LLM_DB[Math.floor(Math.random() * LLM_DB.length)].name}`, +(Math.random() * .05).toFixed(4));
});
logEvent('ctrl', 'SYSTEM', 'Internet-Zugang: NACHFRAGEN-Modus aktiviert für alle Agenten', 0);

// ═══════════════════════════════
//  RENDER: PLAYBOOK TAB
// ═══════════════════════════════
let activePB = 'mission';
function renderPlaybook() {
  const sidebar = document.getElementById('pb-sidebar');
  sidebar.innerHTML = PLAYBOOK_DATA.map(p => `
    <div class="pb-item ${p.id === activePB ? 'active' : ''}" onclick="selectPB('${p.id}')">
      <div class="pb-item-title">${p.name}</div>
      <div class="pb-item-desc">${p.desc}</div>
    </div>`).join('');
  showPBDetail(activePB);
}
function selectPB(id) {
  activePB = id;
  document.querySelectorAll('#pb-sidebar .pb-item').forEach(i => i.classList.remove('active'));
  event.target.closest('.pb-item').classList.add('active');
  showPBDetail(id);
}
function showPBDetail(id) {
  const p = PLAYBOOK_DATA.find(x => x.id === id);
  if (!p) return;
  document.getElementById('pb-detail').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
      <div style="font-size:28px">${p.name.split(' ')[0]}</div>
      <div>
        <div style="font-size:18px;font-weight:700">${p.name.slice(p.name.indexOf(' ') + 1)}</div>
        <div style="font-size:12px;color:var(--muted)">${p.desc}</div>
      </div>
    </div>
    ${p.content}
    <div class="pb-section" style="margin-top:20px">
      <div class="pb-section-title">LLM Vorlage auswählen</div>
      <select class="select-llm" onchange="logEvent('ctrl','PLAYBOOK','Template LLM geändert: '+this.value)">
        ${COST_TEMPLATES.map(t => `<option value="${t.name}">${t.name} → empfohlen: ${t.recommended} (Budget: $${t.budget}/Task)</option>`).join('')}
      </select>
    </div>`;
}

// ═══════════════════════════════
//  RENDER: COSTS TAB
// ═══════════════════════════════
let costFilter = 'all';
function renderCosts() {
  // Summary cards
  const totalSpent = Object.values(CTRL_STATE).reduce((s, a) => s + a.totalSpent, 0).toFixed(2);
  const avgCost = (totalSpent / Object.keys(CTRL_STATE).length).toFixed(2);
  document.getElementById('cost-summary').innerHTML = `
    <div class="grid-4" style="margin-bottom:20px">
      <div class="card"><div class="card-title">Gesamtkosten Heute</div><div class="metric-val cost-mid">$${totalSpent}</div><div class="metric-sub">Alle Agenten zusammen</div></div>
      <div class="card"><div class="card-title">Ø Kosten / Agent</div><div class="metric-val cost-cheap">$${avgCost}</div><div class="metric-sub">Durchschnitt heute</div></div>
      <div class="card"><div class="card-title">API Aufrufe</div><div class="metric-val" style="color:var(--blue)">${LOG_STORE.filter(l => l.type === 'cost').length}</div><div class="metric-sub">Geloggte LLM Calls</div></div>
      <div class="card"><div class="card-title">Günstigstes Modell</div><div class="metric-val" style="font-size:16px;padding-top:8px">Gemini 2.0 Flash</div><div class="metric-sub">$0.10 / 1M Input</div></div>
    </div>`;

  // Templates
  document.getElementById('cost-templates').innerHTML = `
    <div class="section-header" style="margin-bottom:16px"><div><div style="font-size:14px;font-weight:700">📋 Kostenvorlagen – Wähle für jede Arbeit</div></div></div>
    <div class="cost-grid">${COST_TEMPLATES.map(t => `
      <div class="cost-card">
        <div class="cost-card-title">${t.name}</div>
        <div class="cost-card-provider">${t.desc}</div>
        <div class="cost-row"><span class="cost-label">Empfohlen</span><span class="cost-val">${t.recommended}</span></div>
        <div class="cost-row"><span class="cost-label">Budget/Task</span><span class="cost-val cost-cheap">$${t.budget}</span></div>
        <div class="cost-row"><span class="cost-label">Aufgaben</span><span class="cost-val">${t.tasks.length}</span></div>
        <select class="select-llm" onchange="logEvent('cost','VORLAGE','${t.id}: LLM gewechselt zu '+this.value)">
          ${LLM_DB.map(l => `<option ${l.name === t.recommended ? 'selected' : ''} value="${l.name}">${l.name} – $${l.input}/M in</option>`).join('')}
        </select>
      </div>`).join('')}
    </div>`;

  // LLM full list
  const filtered = costFilter === 'all' ? LLM_DB : LLM_DB.filter(l => l.tier === costFilter);
  document.getElementById('cost-llm-list').innerHTML = `
    <div class="section-header" style="margin:24px 0 16px"><div><div style="font-size:14px;font-weight:700">🤖 LLM Übersicht – Alle Modelle & Kosten</div></div>
      <div class="filter-row" style="margin:0">
        <button class="filter-pill ${costFilter === 'all' ? 'active' : ''}" onclick="costFilter='all';renderCosts()">Alle</button>
        <button class="filter-pill ${costFilter === 'cheap' ? 'active' : ''}" onclick="costFilter='cheap';renderCosts()">💚 Günstig</button>
        <button class="filter-pill ${costFilter === 'mid' ? 'active' : ''}" onclick="costFilter='mid';renderCosts()">🟡 Mittel</button>
        <button class="filter-pill ${costFilter === 'expensive' ? 'active' : ''}" onclick="costFilter='expensive';renderCosts()">🔴 Teuer</button>
      </div>
    </div>
    <div class="cost-grid">${filtered.map(l => {
    const tc = l.tier === 'cheap' ? 'cost-cheap' : l.tier === 'mid' ? 'cost-mid' : 'cost-expensive';
    return `<div class="cost-card">
        <div class="cost-card-title">${l.name}</div>
        <div class="cost-card-provider">${l.provider} · ${l.context} context</div>
        <div class="cost-row"><span class="cost-label">Input/1M</span><span class="cost-val ${tc}">$${l.input}</span></div>
        <div class="cost-row"><span class="cost-label">Output/1M</span><span class="cost-val ${tc}">$${l.output}</span></div>
        <div class="cost-row"><span class="cost-label">Speed</span><span class="cost-val">${l.speed}</span></div>
        <div class="cost-row"><span class="cost-label">Quality</span><span class="cost-val">${l.quality}</span></div>
      </div>`}).join('')}
    </div>`;
}

// ═══════════════════════════════
//  RENDER: CONTROL TAB
// ═══════════════════════════════
function renderControl() {
  const container = document.getElementById('ctrl-container');
  // OpenClaw main system
  const oc = CTRL_STATE['openclaw'];
  let html = `
    <div class="ctrl-card" style="grid-column:1/-1;border:2px solid var(--green);box-shadow:0 0 24px #3fb95015">
      <div class="ctrl-card-header">
        <div><div class="ctrl-card-name">🌐 OPENCLAW – Hauptsystem</div><div class="ctrl-card-role">Zentrales AI Management System</div></div>
        <div class="mode-btn-group">
          <button class="mode-btn yolo ${oc.mode === 'yolo' ? 'active' : ''}" onclick="setMode('openclaw','yolo')">🔥 YOLO</button>
          <button class="mode-btn plan ${oc.mode === 'plan' ? 'active' : ''}" onclick="setMode('openclaw','plan')">📋 PLAN</button>
        </div>
      </div>
      <div class="ctrl-row">
        <span class="ctrl-row-label">🌐 Internet-Zugang</span>
        <div class="ampel">
          <div class="ampel-light ${oc.internet === 'red' ? 'red' : 'off'}" onclick="setInternet('openclaw','red')" title="AUS"></div>
          <div class="ampel-light ${oc.internet === 'yellow' ? 'yellow' : 'off'}" onclick="setInternet('openclaw','yellow')" title="NACHFRAGEN"></div>
          <div class="ampel-light ${oc.internet === 'green' ? 'green' : 'off'}" onclick="setInternet('openclaw','green')" title="OPEN NET"></div>
          <span class="ampel-label">${oc.internet === 'red' ? '🔴 AUS' : oc.internet === 'yellow' ? '🟡 NACHFRAGEN' : '🟢 OPEN NET'}</span>
        </div>
      </div>
      <div class="ctrl-row">
        <span class="ctrl-row-label">💰 Budget: $${oc.totalSpent} / $${oc.budgetLimit}</span>
        <div style="width:120px;height:6px;background:var(--card2);border-radius:3px;overflow:hidden"><div style="height:100%;width:${Math.min((oc.totalSpent / oc.budgetLimit) * 100, 100)}%;background:${oc.totalSpent > oc.budgetLimit * 0.8 ? 'var(--red)' : 'var(--green)'};border-radius:3px;transition:width .3s"></div></div>
      </div>
    </div>`;

  // Per-agent cards
  AGENTS.forEach(a => {
    const s = CTRL_STATE[a.id];
    html += `
    <div class="ctrl-card">
      <div class="ctrl-card-header">
        <div>
          <div class="ctrl-card-name"><span style="font-size:16px">${a.emoji}</span> ${a.name}</div>
          <div class="ctrl-card-role">${a.role} · ${a.dept}</div>
        </div>
        <span class="dot ${a.status === 'working' ? 'dot-green' : 'dot-orange'}"></span>
      </div>
      <div class="ctrl-row">
        <span class="ctrl-row-label">🌐 Internet</span>
        <div class="ampel">
          <div class="ampel-light ${s.internet === 'red' ? 'red' : 'off'}" onclick="setInternet('${a.id}','red')"></div>
          <div class="ampel-light ${s.internet === 'yellow' ? 'yellow' : 'off'}" onclick="setInternet('${a.id}','yellow')"></div>
          <div class="ampel-light ${s.internet === 'green' ? 'green' : 'off'}" onclick="setInternet('${a.id}','green')"></div>
          <span class="ampel-label">${s.internet === 'red' ? 'AUS' : s.internet === 'yellow' ? 'FRAGEN' : 'OFFEN'}</span>
        </div>
      </div>
      <div class="ctrl-row">
        <span class="ctrl-row-label">⚡ Modus</span>
        <div class="mode-btn-group">
          <button class="mode-btn yolo ${s.mode === 'yolo' ? 'active' : ''}" onclick="setMode('${a.id}','yolo')" style="padding:4px 10px;font-size:10px">YOLO</button>
          <button class="mode-btn plan ${s.mode === 'plan' ? 'active' : ''}" onclick="setMode('${a.id}','plan')" style="padding:4px 10px;font-size:10px">PLAN</button>
        </div>
      </div>
      <div class="ctrl-row">
        <span class="ctrl-row-label">💰 $${s.totalSpent} / $${s.budgetLimit}</span>
        <div style="width:80px;height:5px;background:var(--card2);border-radius:3px;overflow:hidden"><div style="height:100%;width:${Math.min((s.totalSpent / s.budgetLimit) * 100, 100)}%;background:${s.totalSpent > s.budgetLimit * 0.8 ? 'var(--red)' : 'var(--green)'};border-radius:3px"></div></div>
      </div>
    </div>`;
  });

  // Bulk controls
  html += `
  <div class="ctrl-card" style="grid-column:1/-1;border:1px dashed var(--border2)">
    <div class="ctrl-card-header"><div><div class="ctrl-card-name">⚡ Bulk-Steuerung – Alle auf einmal</div></div></div>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <button class="mode-btn yolo" onclick="bulkMode('yolo')" style="font-size:12px">🔥 ALLE → YOLO</button>
      <button class="mode-btn plan" onclick="bulkMode('plan')" style="font-size:12px">📋 ALLE → PLAN</button>
      <button class="add-btn" style="background:var(--red)" onclick="bulkInternet('red')">🔴 ALLE → AUS</button>
      <button class="add-btn" style="background:var(--orange)" onclick="bulkInternet('yellow')">🟡 ALLE → NACHFRAGEN</button>
      <button class="add-btn" onclick="bulkInternet('green')">🟢 ALLE → OPEN NET</button>
    </div>
  </div>`;
  container.innerHTML = html;
}

function setInternet(id, state) {
  CTRL_STATE[id].internet = state;
  const name = id === 'openclaw' ? 'OPENCLAW' : AGENTS.find(a => a.id === id)?.name || id;
  const label = state === 'red' ? 'AUS' : state === 'yellow' ? 'NACHFRAGEN' : 'OPEN NET';
  logEvent('ctrl', name, `Internet → ${label}`);
  renderControl();
}
function setMode(id, mode) {
  CTRL_STATE[id].mode = mode;
  const name = id === 'openclaw' ? 'OPENCLAW' : AGENTS.find(a => a.id === id)?.name || id;
  logEvent('ctrl', name, `Modus → ${mode === 'yolo' ? '🔥 YOLO – Alles wird ausgeführt!' : '📋 PLAN – Genehmigung erforderlich'}`);
  renderControl();
  if (mode === 'yolo') {
    // Flash animation
    document.body.style.transition = 'background .15s';
    document.body.style.background = '#1a0a08';
    setTimeout(() => document.body.style.background = 'var(--bg)', 200);
  }
}
function bulkMode(mode) {
  Object.keys(CTRL_STATE).forEach(id => CTRL_STATE[id].mode = mode);
  logEvent('ctrl', 'SYSTEM', `BULK: Alle Agenten → ${mode === 'yolo' ? '🔥 YOLO' : '📋 PLAN'}`);
  renderControl();
}
function bulkInternet(state) {
  Object.keys(CTRL_STATE).forEach(id => CTRL_STATE[id].internet = state);
  const label = state === 'red' ? 'AUS' : state === 'yellow' ? 'NACHFRAGEN' : 'OPEN NET';
  logEvent('ctrl', 'SYSTEM', `BULK: Alle Internet → ${label}`);
  renderControl();
}

// ═══════════════════════════════
//  RENDER: LOGS TAB
// ═══════════════════════════════
let logFilter = 'all', logSearch = '';
function renderLogs() {
  let data = LOG_STORE;
  if (logFilter !== 'all') data = data.filter(l => l.type === logFilter);
  if (logSearch) data = data.filter(l => (l.agent + l.msg).toLowerCase().includes(logSearch.toLowerCase()));

  const totalCost = LOG_STORE.filter(l => l.type === 'cost').reduce((s, l) => s + parseFloat(l.cost), 0).toFixed(4);

  document.getElementById('log-container').innerHTML = `
    <div class="grid-4" style="margin-bottom:16px">
      <div class="card"><div class="card-title">Total Events</div><div class="metric-val" style="font-size:24px">${LOG_STORE.length}</div></div>
      <div class="card"><div class="card-title">API Kosten gesamt</div><div class="metric-val" style="font-size:24px;color:var(--blue)">$${totalCost}</div></div>
      <div class="card"><div class="card-title">Fehler</div><div class="metric-val" style="font-size:24px;color:var(--red)">${LOG_STORE.filter(l => l.type === 'error').length}</div></div>
      <div class="card"><div class="card-title">YOLO Aktionen</div><div class="metric-val" style="font-size:24px;color:var(--orange)">${LOG_STORE.filter(l => l.type === 'yolo').length}</div></div>
    </div>
    <div class="log-toolbar">
      <input class="log-search" placeholder="🔍 Logs durchsuchen..." value="${logSearch}" oninput="logSearch=this.value;renderLogs()"/>
      <button class="filter-pill ${logFilter === 'all' ? 'active' : ''}" onclick="logFilter='all';renderLogs()">Alle</button>
      <button class="filter-pill ${logFilter === 'task' ? 'active' : ''}" onclick="logFilter='task';renderLogs()">Tasks</button>
      <button class="filter-pill ${logFilter === 'cost' ? 'active' : ''}" onclick="logFilter='cost';renderLogs()">Kosten</button>
      <button class="filter-pill ${logFilter === 'ctrl' ? 'active' : ''}" onclick="logFilter='ctrl';renderLogs()">Control</button>
      <button class="filter-pill ${logFilter === 'error' ? 'active' : ''}" onclick="logFilter='error';renderLogs()">Fehler</button>
      <button class="add-btn" style="background:var(--red);margin-left:auto" onclick="LOG_STORE.length=0;renderLogs()">🗑 Clear</button>
      <button class="add-btn" onclick="exportLogs()">📥 Export CSV</button>
    </div>
    <div class="log-wrap">
      <table class="log-table">
        <thead><tr><th>Zeit</th><th>Typ</th><th>Agent</th><th>Nachricht</th><th>Kosten</th></tr></thead>
        <tbody>${data.slice(0, 100).map(l => `
          <tr>
            <td style="font-family:var(--font-mono);font-size:11px;color:var(--muted2);white-space:nowrap">${l.time}</td>
            <td><span class="log-type log-type-${l.type}">${l.type}</span></td>
            <td style="font-weight:600;font-size:12px">${l.agent}</td>
            <td style="color:var(--muted);font-size:12px">${l.msg}</td>
            <td style="font-family:var(--font-mono);font-size:11px;color:${parseFloat(l.cost) > 0 ? 'var(--blue)' : 'var(--muted2)'}">${parseFloat(l.cost) > 0 ? '$' + l.cost : '–'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function exportLogs() {
  const csv = 'Zeit,Datum,Typ,Agent,Nachricht,Kosten\n' +
    LOG_STORE.map(l => `"${l.time}","${l.date}","${l.type}","${l.agent}","${l.msg}","${l.cost}"`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mission_control_logs_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  logEvent('ctrl', 'SYSTEM', 'Logs als CSV exportiert');
}

// ── Auto-log from existing live feed ──
const origAddLog = window.addLogEntry;
if (origAddLog) {
  window.addLogEntry = function () {
    origAddLog();
    const src = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
    const msg = src.msgs[Math.floor(Math.random() * src.msgs.length)];
    const cost = +(Math.random() * 0.008).toFixed(4);
    logEvent('cost', src.agent, msg, cost);
    // Update agent spend
    const agent = AGENTS.find(a => a.name === src.agent);
    if (agent && CTRL_STATE[agent.id]) {
      CTRL_STATE[agent.id].totalSpent = +(CTRL_STATE[agent.id].totalSpent + cost).toFixed(4);
    }
  };
}

// ── INIT V2 ──
function initV2() {
  renderPlaybook();
  renderCosts();
  renderControl();
  renderLogs();
  // Refresh logs periodically
  setInterval(() => { if (document.getElementById('tab-logs').classList.contains('active')) renderLogs(); }, 5000);
}

// Run after DOM
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initV2); }
else { initV2(); }
