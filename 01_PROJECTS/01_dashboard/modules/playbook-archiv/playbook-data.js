// DkZ Playbook Archiv v2 — Knowledge Base Data
// © DEVKiTZ™ 2026 — Stand: 2026-03-15

const KB = {
    overview: {
        group:'🎯 Strategien', icon:'📊', label:'Übersicht', title:'DkZ Playbook — Strategische Übersicht',
        content:`<div class="stats-bar">
<div class="stat-chip"><div class="stat-num">81+</div><div>Module</div></div>
<div class="stat-chip"><div class="stat-num">25</div><div>Runbooks</div></div>
<div class="stat-chip"><div class="stat-num">18</div><div>Technologien</div></div>
<div class="stat-chip"><div class="stat-num">344</div><div>Prompt Templates</div></div>
<div class="stat-chip"><div class="stat-num">8</div><div>LLM Modelle</div></div>
</div>
<div class="card"><h2>🎯 Mission Statement</h2><p>Das DkZ Playbook v2 ist das zentrale Strategiedokument für alle Technologie-Entscheidungen im DEVKiTZ™ Ökosystem. Es vereint bewährte Methoden, Kostenstrategien, LLM-Zuweisungen, Architektur-Empfehlungen und das Second Brain Konzept — basierend auf der Analyse von 10 Kerntechnologien und 81+ Dashboard-Modulen.</p>
<h3>Aktueller DkZ Stack</h3><ul><li><span class="tag stack">Vanilla HTML/CSS/JS</span> — Bewusste Wahl für Zero Dependencies</li><li><span class="tag stack">Node.js + Express</span> — API Gateway + ONTHERUN™ MCP Server</li><li><span class="tag stack">DkZ Glassmorphism v2</span> — Eigenes Design System mit CSS Custom Properties</li><li><span class="tag stack">localStorage + JSON</span> — Offline-First, kein Server-DB nötig</li><li><span class="tag stack">DuckDB + Apache Iceberg</span> — DataLakeHouse™ Analytics</li></ul>
<h3>Neue Module in v2</h3><ul><li><span class="tag new">🧠 Second Brain</span> — Knowledge Graph + Quick Capture (MOD-082)</li><li><span class="tag new">💰 Cost Calculator</span> — LLM & Infrastruktur Kosten-Rechner (MOD-083)</li><li><span class="tag new">⚠️ Missing Components</span> — Roadmap fehlender Komponenten</li></ul>
<h3>Querverweise</h3><ul><li>→ BLAUPAUSE.md — Architektur (81+ Module)</li><li>→ REGISTRY.json — Master-Index</li><li>→ REGELWERK.md — 25 Eiserne Regeln</li><li>→ WissenHub — Immutable Knowledge Database (R26)</li><li>→ BMAD™ — 7-Agenten Methodik</li></ul></div>`
    },

    stacks: {
        group:'🎯 Strategien', icon:'🏗️', label:'Tech Stacks', title:'Tech Stack Strategien 2026',
        content:`<div class="card"><h2>🚀 Startup Stack (High Velocity)</h2>
<div class="compare-grid"><div class="compare-cell"><div class="cl">Frontend</div><div class="cv">Next.js 15 + React</div></div><div class="compare-cell"><div class="cl">Styling</div><div class="cv">Tailwind CSS v4</div></div><div class="compare-cell"><div class="cl">Backend</div><div class="cv">Supabase BaaS</div></div><div class="compare-cell"><div class="cl">DB</div><div class="cv">PostgreSQL + pgvector</div></div><div class="compare-cell"><div class="cl">Auth</div><div class="cv">GoTrue (Supabase)</div></div><div class="compare-cell"><div class="cl">Deploy</div><div class="cv">Vercel Edge</div></div></div>
<div class="prompt-box" onclick="cp(this)">PROMPT: Erstelle eine Next.js 15 App mit Supabase Auth, Tailwind CSS v4, und PostgreSQL mit pgvector für AI/RAG. Nutze App Router, Server Components, und Supabase RLS für Sicherheit. Kosten: ~$0-25/mo.</div></div>
<div class="card"><h2>🏢 Enterprise Stack (High Scale)</h2>
<div class="compare-grid"><div class="compare-cell"><div class="cl">Core</div><div class="cv">Java Spring Boot 3</div></div><div class="compare-cell"><div class="cl">Microservices</div><div class="cv">Go + gRPC</div></div><div class="compare-cell"><div class="cl">Bottlenecks</div><div class="cv">Rust → WebAssembly</div></div><div class="compare-cell"><div class="cl">Frontend</div><div class="cv">React SPA</div></div><div class="compare-cell"><div class="cl">Messaging</div><div class="cv">Apache Kafka</div></div><div class="compare-cell"><div class="cl">Cache</div><div class="cv">Redis / Dragonfly</div></div></div></div>
<div class="card"><h2>🤖 AI-Driven Stack</h2>
<div class="compare-grid"><div class="compare-cell"><div class="cl">Backend</div><div class="cv">Python FastAPI</div></div><div class="compare-cell"><div class="cl">AI/ML</div><div class="cv">PyTorch + LangChain</div></div><div class="compare-cell"><div class="cl">Vector DB</div><div class="cv">pgvector / Qdrant</div></div><div class="compare-cell"><div class="cl">Orchestration</div><div class="cv">AutoGen / CrewAI</div></div><div class="compare-cell"><div class="cl">RAG</div><div class="cv">Embeddings + Reranking</div></div><div class="compare-cell"><div class="cl">MCP</div><div class="cv">Model Context Protocol</div></div></div></div>
<div class="card"><h2>🎯 DkZ Stack (Aktuell — v2)</h2>
<div class="compare-grid"><div class="compare-cell"><div class="cl">Frontend</div><div class="cv">Vanilla HTML/CSS/JS</div></div><div class="compare-cell"><div class="cl">Backend</div><div class="cv">Node.js Express</div></div><div class="compare-cell"><div class="cl">Design</div><div class="cv">DkZ Glassmorphism v2</div></div><div class="compare-cell"><div class="cl">Daten</div><div class="cv">localStorage + DuckDB</div></div><div class="compare-cell"><div class="cl">Module</div><div class="cv">81+ Module</div></div><div class="compare-cell"><div class="cl">MCP</div><div class="cv">ONTHERUN™ 34+ Tools</div></div></div></div>`
    },

    cost: {
        group:'🎯 Strategien', icon:'💰', label:'Kostenstrategien', title:'Kostenstrategien & Optimierung 2026',
        content:`<div class="card"><h2>💰 LLM API Kosten-Matrix 2026</h2>
<div class="compare-grid"><div class="compare-cell"><div class="cl">Gemini 2.5 Pro</div><div class="cv">$1.25/$5 per 1M</div></div><div class="compare-cell"><div class="cl">Gemini 2.0 Flash</div><div class="cv" style="color:var(--green)">Free Tier!</div></div><div class="compare-cell"><div class="cl">Claude 4 Sonnet</div><div class="cv">$3/$15 per 1M</div></div><div class="compare-cell"><div class="cl">Claude 4 Opus</div><div class="cv">$15/$75 per 1M</div></div><div class="compare-cell"><div class="cl">GPT-5</div><div class="cv">$5/$15 per 1M</div></div><div class="compare-cell"><div class="cl">GPT-4o-mini</div><div class="cv">$0.15/$0.60 per 1M</div></div><div class="compare-cell"><div class="cl">DeepSeek V3</div><div class="cv">$0.27/$1.10 per 1M</div></div><div class="compare-cell"><div class="cl">Mistral Large</div><div class="cv">$2/$6 per 1M (EU)</div></div></div></div>
<div class="card"><h2>🎯 Tiered Model Routing</h2>
<ul><li><span class="tag cost">Tier 1 — 70% der Tasks:</span> Gemini Flash / DeepSeek V3 → Formatting, Summaries, Übersetzungen</li>
<li><span class="tag cost">Tier 2 — 20% der Tasks:</span> Claude Haiku / GPT-4o-mini → Standard-Coding, Reviews</li>
<li><span class="tag cost">Tier 3 — 8% der Tasks:</span> Claude Sonnet / Gemini Pro → Komplexe Architektur, Debugging</li>
<li><span class="tag cost">Tier 4 — 2% der Tasks:</span> Claude Opus / GPT-5 → Research, Strategie, schwierigste Bugs</li></ul>
<div class="prompt-box" onclick="cp(this)">STRATEGIE: Route Tasks automatisch zum günstigsten Modell.
Tier 1 (70%): Gemini Flash = $0/mo (Free Tier)
Tier 2 (20%): Claude Haiku = ~$5/mo
Tier 3 (8%): Claude Sonnet = ~$15/mo
Tier 4 (2%): Claude Opus = ~$10/mo
→ Erwartete Gesamtkosten: ~$30/mo statt ~$150/mo = 80% Ersparnis</div></div>
<div class="card"><h2>🏗️ Infrastruktur-Kosten</h2>
<div class="compare-grid"><div class="compare-cell"><div class="cl">Cloudflare Pages</div><div class="cv" style="color:var(--green)">€0/mo Free</div></div><div class="compare-cell"><div class="cl">Supabase Free</div><div class="cv" style="color:var(--green)">500MB + 1GB</div></div><div class="compare-cell"><div class="cl">Hetzner VPS</div><div class="cv">€3.79/mo 🇩🇪</div></div><div class="compare-cell"><div class="cl">Vercel Free</div><div class="cv" style="color:var(--green)">100GB BW</div></div><div class="compare-cell"><div class="cl">Fly.io</div><div class="cv">€0-5/mo Edge</div></div><div class="compare-cell"><div class="cl">OVHcloud</div><div class="cv">€5/mo 🇫🇷</div></div></div>
<div class="prompt-box" onclick="cp(this)">DkZ KOSTEN-PHASENPLAN:
Phase 1 (jetzt):  €0/mo — Lokale Entwicklung + Cloudflare Pages
Phase 2 (Launch): €0/mo — Supabase Free + Cloudflare
Phase 3 (Scale):  €4/mo — Hetzner VPS für Node.js Backend
Phase 4 (Grow):   €29/mo — Supabase Pro + Hetzner + CDN</div></div>
<div class="card"><h2>📊 EU-DSGVO Alternativen</h2>
<ul><li><span class="tag stack">🇩🇪 Hetzner</span> — VPS ab €3.79/mo, exzellent für Node.js</li>
<li><span class="tag stack">🇫🇷 Scaleway</span> — Object Storage + Serverless Functions</li>
<li><span class="tag stack">🇫🇷 OVHcloud</span> — Bare Metal ab €5/mo</li>
<li><span class="tag stack">🇩🇪 Ionos</span> — Cloud Server + Managed DB</li>
<li><span class="tag stack">🇩🇪 Uberspace</span> — Hosting ab €1/mo (pay-what-you-want)</li>
<li><span class="tag stack">🇫🇷 Mistral AI</span> — EU-LLM Mistral Large, DSGVO-konform</li></ul></div>`
    },

    llm: {
        group:'🎯 Strategien', icon:'🤖', label:'LLM Zuweisungen', title:'LLM Zuweisungen & Kontext-Strategien',
        content:`<div class="card"><h2>🎯 LLM Task-Zuweisung Matrix 2026</h2>
<div class="compare-grid"><div class="compare-cell"><div class="cl">Code Generation</div><div class="cv">Claude 4 Sonnet</div></div><div class="compare-cell"><div class="cl">Code Review</div><div class="cv">Gemini 2.5 Pro</div></div><div class="compare-cell"><div class="cl">Debugging</div><div class="cv">Claude 4 Sonnet</div></div><div class="compare-cell"><div class="cl">Architektur</div><div class="cv">Claude 4 Opus / o3</div></div><div class="compare-cell"><div class="cl">Dokumentation</div><div class="cv">Gemini 2.0 Flash</div></div><div class="compare-cell"><div class="cl">Refactoring</div><div class="cv">Claude Haiku</div></div><div class="compare-cell"><div class="cl">Testing</div><div class="cv">GPT-4o-mini</div></div><div class="compare-cell"><div class="cl">Research</div><div class="cv">Perplexity / Gemini</div></div></div></div>
<div class="card"><h2>📝 Kontext-Strategie für LLMs</h2>
<div class="prompt-box" onclick="cp(this)">DkZ KONTEXT-LADEN (Optimiert für Token-Effizienz):
1. Lade CLAUDE.md / GEMINI.md (Agent-Gedächtnis)
2. Lade REGELWERK.md (Eiserne Regeln)
3. Lade REGISTRY.json (Modul-Index)
4. Lade NUR die features.json des betroffenen Moduls
5. NIEMALS alles hochladen → nur relevantes Wissen
6. Erstelle _logs/ im Modul und logge Änderungen
7. Update features.json nach getaner Arbeit
8. Git commit mit feat(bereich): beschreibung</div></div>
<div class="card"><h2>🧠 BMAD™ 7-Agenten Methodik</h2>
<div class="compare-grid"><div class="compare-cell"><div class="cl">🎯 James™</div><div class="cv">Guardian</div></div><div class="compare-cell"><div class="cl">📋 DkZ PM™</div><div class="cv">Product Manager</div></div><div class="compare-cell"><div class="cl">🏗️ Architekt™</div><div class="cv">Architecture</div></div><div class="compare-cell"><div class="cl">👨‍💻 Developer™</div><div class="cv">Code Executor</div></div><div class="compare-cell"><div class="cl">🔍 Reviewer™</div><div class="cv">CodeRabbit QA</div></div><div class="compare-cell"><div class="cl">🧪 Tester™</div><div class="cv">Validation</div></div><div class="compare-cell"><div class="cl">📚 Dokumentar™</div><div class="cv">Wiki & Docs</div></div></div></div>`
    },

    secondbrain: {
        group:'🧠 Wissensmanagement', icon:'🧠', label:'Second Brain', title:'Second Brain — Knowledge Management',
        content:`<div class="card"><h2>🧠 DkZ Second Brain Konzept</h2><p>Das Second Brain ist die persönliche Wissensdatenbank im DEVKiTZ™ Ökosystem. Inspiriert von Tiago Forte's PARA-Methode und Anytype, kombiniert es strukturiertes Wissensmanagement mit AI-gestützter Suche.</p>
<h3>PARA Framework</h3><ul><li><span class="tag new">P</span> Projects — Aktive Projekte mit Deadlines</li><li><span class="tag new">A</span> Areas — Verantwortungsbereiche ohne Deadline</li><li><span class="tag new">R</span> Resources — Themen-Sammlungen für Referenz</li><li><span class="tag new">A</span> Archives — Abgeschlossenes / Inaktives</li></ul>
<h3>DkZ Integration</h3><ul><li>→ <span class="tag stack">WissenHub</span> — Immutable Knowledge Database (R26)</li><li>→ <span class="tag stack">Iceberg</span> — DataLakeHouse™ mit Apache Iceberg</li><li>→ <span class="tag stack">Copilot</span> — KI-gestützte Suche über alle Artefakte</li><li>→ <span class="tag stack">Anytype</span> — Objekt-basierte Wissensstruktur</li></ul>
<h3>Knowledge Graph</h3><p>Visualisierung aller Verbindungen zwischen Modulen, Dokumenten und Artefakten. Knoten = Wissensobjekte, Kanten = Referenzen und Abhängigkeiten.</p>
<div class="prompt-box" onclick="cp(this)">→ Neues Dashboard-Modul: modules/second-brain/ (MOD-082)
   Quick Capture, Knowledge Graph, Volltextsuche, Tags, Export
   Ähnlich Obsidian/Notion aber im DkZ Design System</div></div>`
    },

    missing: {
        group:'🧠 Wissensmanagement', icon:'⚠️', label:'Missing Components', title:'Missing Components — Roadmap',
        content:`<div class="card"><h2>⚠️ Fehlende Komponenten im DkZ Ökosystem</h2>
<h3>Priorität HOCH</h3><ul>
<li><span class="tag con">PWA Service Worker</span> — Offline-Support für alle Module</li>
<li><span class="tag con">Auth System</span> — Multi-User Authentifizierung</li>
<li><span class="tag con">Realtime Sync</span> — Cross-Device Synchronisation</li>
<li><span class="tag con">Backup Automation</span> — Automatische Sicherung nach Cloud</li></ul>
<h3>Priorität MITTEL</h3><ul>
<li><span class="tag cost">Testing Framework</span> — Automatisierte E2E Tests</li>
<li><span class="tag cost">CI/CD Pipeline</span> — GitHub Actions für Deploy</li>
<li><span class="tag cost">Performance Monitoring</span> — Lighthouse + Custom Metrics</li>
<li><span class="tag cost">Accessibility Audit</span> — WCAG 2.1 Compliance</li></ul>
<h3>Priorität NIEDRIG</h3><ul>
<li><span class="tag stack">i18n</span> — Mehrsprachigkeit (DE/EN/FR)</li>
<li><span class="tag stack">Dark/Light Toggle</span> — Theme-Wechsel</li>
<li><span class="tag stack">Plugin System</span> — Community Module</li></ul></div>`
    },

    agents: {
        group:'🧠 Wissensmanagement', icon:'📋', label:'Playbook Agents', title:'Playbook Agents — 25 Runbooks',
        content:`<div class="card"><h2>📋 Registrierte Playbook Agents</h2><p>25 automatisierte Runbooks im <code>_agents/playbook/</code> System. Jeder Agent hat eine spezifische Aufgabe und kann von LLMs oder manuell ausgeführt werden.</p>
<h3>Kosten & Budget</h3><ul>
<li><span class="tag cost">ex10_query_costs</span> — Kosten abfragen (SQL/DuckDB)</li>
<li><span class="tag cost">top_costs</span> — Top-Kostentreiber identifizieren</li>
<li><span class="tag cost">aggregate_costs</span> — Kosten aggregieren nach Zeitraum</li>
<li><span class="tag cost">budget_status</span> — Budget-Ampel prüfen</li></ul>
<h3>Module & Features</h3><ul>
<li><span class="tag stack">create_module</span> — Neues Modul scaffolden</li>
<li><span class="tag stack">update_features</span> — features.json aktualisieren</li>
<li><span class="tag stack">registry_sync</span> — REGISTRY.json synchronisieren</li></ul>
<h3>Dokumentation</h3><ul>
<li><span class="tag pro">generate_readme</span> — README.md generieren</li>
<li><span class="tag pro">update_blaupause</span> — BLAUPAUSE.md aktualisieren</li>
<li><span class="tag pro">create_walkthrough</span> — Walkthrough erstellen</li></ul>
<div class="prompt-box" onclick="cp(this)">KOSTEN ABFRAGEN (ex10_query_costs):
SELECT SUM(cost_eur) AS total, COUNT(*) AS entries
FROM cost_log WHERE DATE(timestamp) = CURRENT_DATE

TOP-KOSTENTREIBER:
SELECT category, sub_category, actor, SUM(cost_eur) AS kosten
FROM cost_log GROUP BY category, sub_category, actor
ORDER BY kosten DESC LIMIT 10</div></div>`
    },

    // TECHNOLOGIEN
    supabase: {group:'📚 Technologien',icon:'🟢',label:'Supabase',title:'Supabase — Open-Source PostgreSQL BaaS',
        content:`<div class="card"><h2>🟢 Supabase Architektur</h2><ul><li>PostgreSQL + PostgREST + pg_graphql</li><li>GoTrue Auth (Email, Social, Magic Links, SSO)</li><li>Row-Level Security (RLS) — Auth in der DB</li><li>Realtime Server (WebSockets) — Changes, Broadcast, Presence</li><li>Edge Functions (Deno Runtime)</li><li>pgvector — Vektor-DB für AI/RAG</li><li>Storage — S3-kompatibel + CDN</li></ul><p><span class="tag pro">Kein Vendor Lock-in</span><span class="tag pro">SQL Macht</span><span class="tag pro">RLS Security</span><span class="tag pro">KI-ready</span></p><p><span class="tag con">Self-Hosting komplex</span><span class="tag con">Beta Features</span></p></div>`},
    rust: {group:'📚 Technologien',icon:'🦀',label:'Rust',title:'Rust — Speichersicherheit & Zero-Cost',
        content:`<div class="card"><h2>🦀 Rust 2026</h2><ul><li>Ownership + Borrowing + Lifetimes → Borrow Checker</li><li>Kein GC — deterministisches Memory Management</li><li>Zero-Cost Abstractions — C/C++ Performance</li><li>Fearless Concurrency — Data Races = Compile-Error</li><li>83% Admiration Score (SO 2024)</li></ul><p><span class="tag pro">C/C++ Performance</span><span class="tag pro">Memory Safety</span><span class="tag pro">WebAssembly</span></p><p><span class="tag con">Extreme Lernkurve</span><span class="tag con">Langsame Kompilierung</span></p></div>`},
    go: {group:'📚 Technologien',icon:'🐹',label:'Go',title:'Go — Cloud-Native Concurrency',
        content:`<div class="card"><h2>🐹 Go 2026</h2><ul><li>Goroutinen (2KB/Stück) + Channels (CSP)</li><li>Statische Binaries — ein File, keine Dependencies</li><li>GC optimiert auf Sub-ms Pausen</li><li>Docker/K8s/Terraform = in Go geschrieben</li></ul><p><span class="tag pro">Horizontale Skalierung</span><span class="tag pro">Einfaches Onboarding</span><span class="tag pro">Schnelle CI/CD</span></p><p><span class="tag con">if err!=nil Boilerplate</span><span class="tag con">Limitierte Generics</span></p></div>`},
    java: {group:'📚 Technologien',icon:'☕',label:'Java',title:'Java — Enterprise Evolution',
        content:`<div class="card"><h2>☕ Java 2026</h2><ul><li>JVM + JIT Compiler — plattformunabhängig</li><li>Project Loom: Virtual Threads</li><li>92% Fortune 100 nutzen Java</li><li>Spring Boot 3+ für Microservices</li></ul><p><span class="tag pro">Enterprise-Sicherheit</span><span class="tag pro">Ökosystem-Tiefe</span><span class="tag pro">Abwärtskompatibel</span></p><p><span class="tag con">JVM Overhead</span><span class="tag con">Cold Starts</span></p></div>`},
    nodejs: {group:'📚 Technologien',icon:'💚',label:'Node.js',title:'Node.js — Full-Stack JavaScript',
        content:`<div class="card"><h2>💚 Node.js 2026</h2><ul><li>V8 Engine + Event Loop + libuv</li><li>40.8% Nutzung — #1 Web-Technologie</li><li>NPM = weltgrößte Registry</li><li>TypeScript = De-facto Standard</li></ul><p><span class="tag pro">Full-Stack JS/TS</span><span class="tag pro">Echtzeit I/O</span><span class="tag pro">NPM Ökosystem</span><span class="tag pro">DkZ Backend</span></p><p><span class="tag con">CPU blockiert Event Loop</span><span class="tag con">Memory bei Last</span></p></div>`},
    python: {group:'📚 Technologien',icon:'🐍',label:'Python',title:'Python — AI/ML Lingua Franca',
        content:`<div class="card"><h2>🐍 Python 2026</h2><ul><li>51%+ Nutzung — #1 bei Lernenden</li><li>AI Monopol: PyTorch, TensorFlow, LangChain</li><li>FastAPI = Modern async Framework</li><li>Free-threaded Python (PEP 703) kommt</li></ul><p><span class="tag pro">AI/ML Monopol</span><span class="tag pro">Produktivität</span><span class="tag pro">Talentpool</span></p><p><span class="tag con">Langsam (Rohleistung)</span><span class="tag con">GIL</span></p></div>`},
    vanilla: {group:'📚 Technologien',icon:'🌐',label:'Vanilla HTML/CSS',title:'Vanilla HTML/CSS — DkZ Wahl',
        content:`<div class="card"><h2>🌐 Vanilla = DkZ Stack</h2><ul><li>Direkte Browser-Interpretation — kein Build</li><li>Zero Dependencies — keine node_modules</li><li>Zukunftssicher: HTML2016 = HTML2026</li><li>Pixelgenaue Kontrolle über alles</li></ul><h3>Warum DkZ Vanilla nutzt</h3><p>Bewusste Architektur-Entscheidung: Keine Build-Tools, keine Framework-Abhängigkeit, maximale Kontrolle. Jedes Modul = eine index.html. Der Browser ist unsere Runtime.</p>
<div class="prompt-box" onclick="cp(this)">DkZ CSS v2 Design System:
:root{--bg:#060608;--card:rgba(18,18,24,.85);--border:rgba(255,255,255,.06);
--text:#e8e8ec;--muted:#8a8a9a;--accent:#fa1e4e;--green:#00ff88;
--yellow:#ffb800;--blue:#3b82f6;--font:'Inter';--mono:'JetBrains Mono'}</div></div>`},
    tailwind: {group:'📚 Technologien',icon:'🎨',label:'Tailwind CSS',title:'Tailwind CSS — Utility-First CSS',
        content:`<div class="card"><h2>🎨 Tailwind CSS v4 (2026)</h2><ul><li>Utility-First — Styling direkt im Markup</li><li>Lightning CSS Engine (v4) — 10x schneller</li><li>JIT Compiler — nur verwendete Klassen</li><li>v4: CSS-basierte Config statt tailwind.config.js</li><li>Frictionless Design-to-Code Workflow</li></ul>
<h3>DkZ Einsatz</h3><p>Tailwind wird <strong>nur</strong> in der DkZ™ Hub Chrome Extension genutzt (React + Tailwind). Das Haupt-Dashboard bleibt Vanilla CSS (Design-Entscheidung).</p>
<p><span class="tag pro">Rapid Prototyping</span><span class="tag pro">Consistency</span><span class="tag pro">Tree-Shaking</span></p>
<p><span class="tag con">Class-Soup im HTML</span><span class="tag con">Design-System Lock-in</span></p>
<div class="prompt-box" onclick="cp(this)">TAILWIND v4 Setup (Chrome Extension):
npm install tailwindcss @tailwindcss/vite
// vite.config.js: import tailwindcss from "@tailwindcss/vite"
// CSS: @import "tailwindcss"
// Config: @theme { --color-accent: #fa1e4e; }</div></div>`},
    gas: {group:'📚 Technologien',icon:'📜',label:'Google Apps Script',title:'Google Apps Script — CLOUDIA² Engine',
        content:`<div class="card"><h2>📜 Google Apps Script (GAS)</h2><ul><li>JavaScript V8 Runtime in Google Cloud</li><li>Zugriff auf: DriveApp, SpreadsheetApp, GmailApp, DocsApp</li><li>Web Apps + Trigger + HTTP-Endpoints</li><li>PropertiesService — persistenter Key-Value Store</li><li>Zero-Cost Hosting — läuft auf Google-Infrastruktur</li></ul>
<h3>DkZ Einsatz: CLOUDIA²</h3><ul><li><span class="tag stack">Auto-Sorter v2.1</span> — 25 Regeln, 22 Metadaten pro Datei</li><li><span class="tag stack">Drive Indexer</span> — [00-99] Ordner-System</li><li><span class="tag stack">4-Ordner Notes</span> — P-/I-/R- Präfix-System</li><li><span class="tag stack">Sheets Log</span> — Sortier-Protokoll</li></ul>
<p><span class="tag pro">Kostenlos</span><span class="tag pro">Drive Integration</span><span class="tag pro">Trigger</span><span class="tag pro">Web Apps</span></p>
<p><span class="tag con">6 Min Zeitlimit</span><span class="tag con">Quota-Limits</span><span class="tag con">Kein NPM</span></p>
<div class="prompt-box" onclick="cp(this)">CLOUDIA² GAS Architektur:
1. tagAllFiles()    → 22 Metadaten pro Datei
2. sortInbox()      → Tag + Sort in einem Durchgang
3. installTrigger() → Auto-Sort alle 15 Min
4. testRules()      → Simulation ohne Verschieben
5. showConfig()     → Diagnose Ordner-IDs</div></div>`},
    dkzcss: {group:'📚 Technologien',icon:'🎭',label:'DkZ CSS System',title:'DkZ™ CSS Design System v2',
        content:`<div class="card"><h2>🎭 DkZ™ Design System v2</h2><ul><li>CSS Custom Properties — Theming ohne JS</li><li>Glassmorphism: backdrop-filter + blur</li><li>Animated Mesh Blobs — Organische Hintergründe</li><li>Inter (UI) + JetBrains Mono (Code) Typography</li><li>Ampel-System: 🟢 Grün, 🟡 Gelb, 🔴 Rot</li><li>In 86+ Dateien eingebunden (dkz-theme.css)</li></ul>
<h3>Kernfarben</h3>
<div class="compare-grid"><div class="compare-cell"><div class="cl">Accent</div><div class="cv" style="color:#fa1e4e">#fa1e4e</div></div><div class="compare-cell"><div class="cl">Background</div><div class="cv">#060608</div></div><div class="compare-cell"><div class="cl">Green</div><div class="cv" style="color:#00ff88">#00ff88</div></div><div class="compare-cell"><div class="cl">Yellow</div><div class="cv" style="color:#ffb800">#ffb800</div></div><div class="compare-cell"><div class="cl">Red</div><div class="cv" style="color:#ff3b5c">#ff3b5c</div></div><div class="compare-cell"><div class="cl">Blue</div><div class="cv" style="color:#3b82f6">#3b82f6</div></div></div>
<h3>Effekte</h3><ul><li>Glassmorphism: <code>rgba(14,14,22,.78) + blur(24px)</code></li><li>Radius: 8px (sm), 12px (md), 16px (lg)</li><li>Shadow: <code>0 8px 32px rgba(0,0,0,.4)</code></li><li>Transitions: 0.15s–0.25s ease</li></ul></div>`},

    // DATENBANKEN
    duckdb: {group:'🗄️ Datenbanken',icon:'🦆',label:'DuckDB',title:'DuckDB — In-Process Analytics (Immer am Start)',
        content:`<div class="card"><h2>🦆 DuckDB — Analytische Power</h2><ul><li>In-Process OLAP Datenbank — kein Server nötig</li><li>Columnar Storage — Blitzschnelle Aggregationen</li><li>SQL:2016 vollständig + Window Functions</li><li>DuckDB-WASM — läuft direkt im Browser!</li><li>Parquet, CSV, JSON direkt lesen/schreiben</li></ul>
<h3>DkZ Einsatz: Oberflächen-Management</h3><ul><li><span class="tag stack">DataLakeHouse™</span> — Analytics Engine</li><li><span class="tag stack">Cost Calculator</span> — LLM-Kosten Aggregation</li><li><span class="tag stack">Chrome Extension</span> — DuckDB-WASM für lokale Analytics</li><li><span class="tag stack">Playbook Agents</span> — ex10_query_costs, aggregate_costs</li><li><span class="tag stack">Dashboard Widgets</span> — Live-Metriken, Charts</li></ul>
<p><span class="tag pro">Zero Config</span><span class="tag pro">Browser-WASM</span><span class="tag pro">SQL Power</span><span class="tag pro">Parquet Native</span></p>
<p><span class="tag con">Nicht für OLTP</span><span class="tag con">Single-Writer</span></p>
<div class="prompt-box" onclick="cp(this)">DkZ DUCKDB EINSATZ:
-- Kosten aggregieren
SELECT category, SUM(cost_eur) FROM cost_log GROUP BY category ORDER BY 2 DESC;
-- Dashboard Modul-Stats
SELECT module, COUNT(*) as features, SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as done FROM features GROUP BY module;
-- Immer am Start für UI Management + Analytics</div></div>`},
    sqlite: {group:'🗄️ Datenbanken',icon:'💎',label:'RAG-SQLite',title:'SQLite + RAG — Embedded AI Database',
        content:`<div class="card"><h2>💎 SQLite + RAG (Retrieval-Augmented Generation)</h2><ul><li>Weltweit meistgenutzte DB — 1 Trillion+ Instanzen</li><li>Zero-Config — eine Datei, kein Server</li><li>sqlite-vec Extension — Vektor-Suche für RAG</li><li>FTS5 — Volltextsuche mit BM25 Ranking</li><li>WAL Mode — Concurrent Reads</li></ul>
<h3>RAG Pipeline mit SQLite</h3>
<div class="compare-grid"><div class="compare-cell"><div class="cl">Schritt 1</div><div class="cv">Dokumente laden</div></div><div class="compare-cell"><div class="cl">Schritt 2</div><div class="cv">Chunks erstellen</div></div><div class="compare-cell"><div class="cl">Schritt 3</div><div class="cv">Embeddings generieren</div></div><div class="compare-cell"><div class="cl">Schritt 4</div><div class="cv">In sqlite-vec speichern</div></div><div class="compare-cell"><div class="cl">Schritt 5</div><div class="cv">Similarity Search</div></div><div class="compare-cell"><div class="cl">Schritt 6</div><div class="cv">LLM Prompt + Context</div></div></div>
<p><span class="tag pro">Zero Setup</span><span class="tag pro">Portabel</span><span class="tag pro">RAG-fähig</span><span class="tag pro">Offline</span></p>
<p><span class="tag con">Single Writer</span><span class="tag con">Kein Real-time</span></p></div>`},
    mongodb: {group:'🗄️ Datenbanken',icon:'🍃',label:'MongoDB (NoSQL)',title:'MongoDB — Document-Oriented NoSQL',
        content:`<div class="card"><h2>🍃 MongoDB — Flexible Documents</h2><ul><li>Document Store — JSON/BSON native</li><li>Schema-free — Flexible Datenmodelle</li><li>Atlas — Managed Cloud (Free Tier: 512MB)</li><li>Aggregation Pipeline — Komplexe Queries</li><li>Change Streams — Real-time Subscriptions</li><li>Atlas Vector Search — AI/RAG Integration</li></ul>
<h3>Wann MongoDB statt SQL?</h3>
<div class="compare-grid"><div class="compare-cell"><div class="cl">Flexible Schemas</div><div class="cv">✅ MongoDB</div></div><div class="compare-cell"><div class="cl">Nested Objects</div><div class="cv">✅ MongoDB</div></div><div class="compare-cell"><div class="cl">Joins/Relations</div><div class="cv">❌ → PostgreSQL</div></div><div class="compare-cell"><div class="cl">Analytics</div><div class="cv">❌ → DuckDB</div></div><div class="compare-cell"><div class="cl">Full-Stack JS</div><div class="cv">✅ Mongoose</div></div><div class="compare-cell"><div class="cl">Free Tier</div><div class="cv">512MB Atlas</div></div></div>
<p><span class="tag pro">Schema-Free</span><span class="tag pro">JSON Native</span><span class="tag pro">Horizontal Scale</span></p>
<p><span class="tag con">Kein JOIN</span><span class="tag con">Memory Heavy</span><span class="tag con">Kosten bei Scale</span></p></div>`},
    iceberg: {group:'🗄️ Datenbanken',icon:'🧊',label:'Apache Iceberg',title:'Apache Iceberg + James™ — Immutable Data Lake',
        content:`<div class="card"><h2>🧊 Apache Iceberg + James™ Guardian</h2><ul><li>Open Table Format für Data Lakes</li><li>Time Travel — Jeder Snapshot ist abrufbar</li><li>Schema Evolution — Spalten ändern ohne Downtime</li><li>Partition Evolution — Repartitionierung ohne Rewrite</li><li>ACID Transactions auf Data Lake Ebene</li></ul>
<h3>DkZ DataLakeHouse™ Architektur</h3>
<div class="compare-grid"><div class="compare-cell"><div class="cl">Storage</div><div class="cv">Iceberg Tables</div></div><div class="compare-cell"><div class="cl">Query Engine</div><div class="cv">DuckDB</div></div><div class="compare-cell"><div class="cl">Guardian</div><div class="cv">James™ (R24)</div></div><div class="compare-cell"><div class="cl">Manifest</div><div class="cv">catalog.json</div></div><div class="compare-cell"><div class="cl">Archive</div><div class="cv">WissenHub (R26)</div></div><div class="compare-cell"><div class="cl">Regel</div><div class="cv">NIEMALS löschen (R1)</div></div></div>
<h3>James™ Integration</h3><p>James™ überwacht die Iceberg-Archivierung (R24 ALARM). Jede Datenlöschung muss von 777 genehmigt werden. James™ kodiert NICHT — er bewacht die Datenintegrität und steuert die Context Pipeline im Ralph-Loop.</p>
<p><span class="tag pro">Time Travel</span><span class="tag pro">Schema Evolution</span><span class="tag pro">ACID</span><span class="tag pro">James™ geschützt</span></p>
<p><span class="tag con">Setup-Aufwand</span><span class="tag con">Metadaten-Overhead</span></p>
<div class="prompt-box" onclick="cp(this)">DkZ ICEBERG + JAMES™:
catalog.json → Snapshots → Manifests → Data Files
James™ R24: ARCHIV-ALARM bei Löschversuch → 777 Genehmigung
WissenHub (R26): Immutable Knowledge → modules/wissen-hub/archive/
DuckDB liest Iceberg Tables direkt → Analytics ohne ETL</div></div>`},
    gsheets: {group:'🗄️ Datenbanken',icon:'📗',label:'Google Sheets',title:'Google Sheets — Cloud-Tabellen als Datenbank',
        content:`<div class="card"><h2>📗 Google Sheets als Datenbank</h2><ul><li>SpreadsheetApp API — Full CRUD via GAS</li><li>Realtime Collaboration + Versionierung</li><li>AppSheet — No-Code Apps aus Sheets</li><li>Structured Data — Tabs = Tabellen, Rows = Records</li><li>Syncs mit CLOUDIA² alle 15 Minuten</li></ul>
<h3>DkZ Einsatz</h3>
<div class="compare-grid"><div class="compare-cell"><div class="cl">FILES-INDEX</div><div class="cv">Datei-Metadaten</div></div><div class="compare-cell"><div class="cl">USAGE-LOG</div><div class="cv">Nutzungs-Protokoll</div></div><div class="compare-cell"><div class="cl">TAGS</div><div class="cv">Tag-Verwaltung</div></div><div class="compare-cell"><div class="cl">SORT-LOG</div><div class="cv">Auto-Sorter Log</div></div><div class="compare-cell"><div class="cl">COST-LOG</div><div class="cv">LLM Kosten</div></div><div class="compare-cell"><div class="cl">NOTES-SYNC</div><div class="cv">4-Ordner Backup</div></div></div>
<h3>Sync-Pipeline</h3><p>CLOUDIA² → Google Sheets (15 Min) → DuckDB Import → Dashboard Analytics. Die Sheets dienen als Cloud-Spiegel des lokalen DkZ Systems.</p>
<p><span class="tag pro">Kostenlos</span><span class="tag pro">Kollaborativ</span><span class="tag pro">GAS Integration</span><span class="tag pro">AppSheet</span></p>
<p><span class="tag con">400K Zellen Limit</span><span class="tag con">Langsam bei Masse</span><span class="tag con">Nicht ACID</span></p></div>`},

    // VORLAGEN
    prompts: {
        group:'🔧 Vorlagen', icon:'📝', label:'Prompt Templates', title:'Prompt Templates — OpenClaw & DkZ',
        content:`<div class="card"><h2>📝 DkZ Prompt-Archiv (8 Vorlagen)</h2>
<h3>1. System-Prompt: DkZ Agent</h3><div class="prompt-box" onclick="cp(this)">Du bist ein DEVKiTZ™ Ökosystem Entwickler. Du arbeitest mit Vanilla HTML/CSS/JS.
Dein Design System: bg=#060608, accent=#fa1e4e, green=#00ff88.
Lies IMMER zuerst: CLAUDE.md/GEMINI.md → REGELWERK.md → REGISTRY.json → features.json.
Erstelle _logs/ und logge jede Änderung. Keine Frameworks. Keine Build-Tools.
XSS-Schutz: IMMER esc() bei User-Input vor innerHTML.</div>
<h3>2. Modul-Erstellung</h3><div class="prompt-box" onclick="cp(this)">Erstelle ein DkZ Dashboard Modul (modules/NAME/index.html).
Lies ERST: BLAUPAUSE.md + features.json.
REGELN: Vanilla HTML/CSS/JS, Single-File, DkZ Design v2.
Glassmorphism Header sticky, animated Blobs, Toast System.
features.json + README.md erstellen. In REGISTRY.json eintragen.</div>
<h3>3. Feature-Implementierung</h3><div class="prompt-box" onclick="cp(this)">Implementiere Feature [FT-XXX] im Modul [modules/NAME/index.html].
Lies features.json für Status. Ändere Status: "planned" → "done".
Teste im Browser. Logge in _logs/. Commit: "feat(NAME): implement FT-XXX"</div>
<h3>4. Cost Optimizer</h3><div class="prompt-box" onclick="cp(this)">Analysiere die aktuelle Architektur auf Kosten-Optimierung:
1. Welche Services kosten Geld? (APIs, Hosting, LLM-Calls)
2. Welche Free Tiers sind verfügbar?
3. Kann Self-Hosting günstiger sein?
4. EU-DSGVO kompatible Alternativen?
5. Erstelle 3-Phasen Migrationsplan (Free → Paid → Scale)</div>
<h3>5. Chain-of-Thought Analyse</h3><div class="prompt-box" onclick="cp(this)">Analysiere [MODUL] systematisch:
1. Lies features.json — welche Features sind done/wip/planned?
2. Prüfe issues[] — welche Bugs existieren?
3. Prüfe debug[] — welche bekannten Probleme?
4. Erstelle Aktionsplan: Priorität nach Severity
5. Implementiere Top-3 Fixes
6. Update features.json + logge in _logs/</div></div>`
    },

    usecases: {
        group:'🔧 Vorlagen', icon:'💡', label:'Use Cases', title:'Use Cases & Szenarien',
        content:`<div class="card"><h2>💡 DkZ Use Cases</h2>
<h3>UC-001: Solo Developer Dashboard</h3><p>Ein Entwickler nutzt DkZ täglich für: JSON formatieren, Regex testen, Passwörter generieren, API testen, Code vergleichen. Alle 81+ Tools offline, keine Cloud nötig.</p>
<h3>UC-002: Team Onboarding</h3><p>Neues Teammitglied öffnet Hub → sieht Module → öffnet BLAUPAUSE.md → versteht Architektur → öffnet features.json → sieht Status → beginnt Arbeit.</p>
<h3>UC-003: AI-Assisted Development</h3><p>LLM lädt CLAUDE.md → REGELWERK → REGISTRY.json → features.json → implementiert Feature → loggt in _logs/ → committed mit Prefix.</p>
<h3>UC-004: Cost Optimization</h3><p>Tiered Model Routing: 70% Gemini Flash (kostenlos), 20% Haiku, 10% Sonnet. Kostensenkung: 80%. Budget-Ampel warnt bei Überschreitung.</p>
<h3>UC-005: Knowledge Management</h3><p>Second Brain: Quick Capture → Tags → Knowledge Graph → Suche → Export. Alles in localStorage, kein Cloud nötig. WissenHub archiviert immutable.</p></div>`
    },

    innovation: {
        group:'🔧 Vorlagen', icon:'🚀', label:'Innovationen', title:'Innovations-Wiki 2026',
        content:`<div class="card"><h2>🚀 Zukunfts-Innovationen</h2>
<h3>WebAssembly (Wasm)</h3><p>Rust → Wasm für Performance-kritische Browser-Module. Hash Generator, Code Differ, Image Processing mit nativer Geschwindigkeit.</p>
<h3>MCP Integration</h3><p>Model Context Protocol Server (ONTHERUN™) bereits mit 34+ Tools. Nächster Schritt: Alle Module als MCP Tools exponieren.</p>
<h3>AI-Native Modules</h3><p>Module die LLMs direkt integrieren: Code Review Bot, Auto-Documentation, Smart Search, Prompt Optimization. Copilot mit Provider-Auswahl.</p>
<h3>Progressive Web App</h3><p>DkZ Dashboard als installierbare PWA mit Service Worker + Offline-Support. Manifest bereits vorhanden.</p>
<h3>Edge Computing</h3><p>Supabase Edge Functions + Cloudflare Workers. Module als Edge-deployed SPAs für globale Latenzoptimierung.</p>
<h3>DataLakeHouse™</h3><p>Apache Iceberg + DuckDB für Analytics. Immutable Data Lake mit Time-Travel Queries. Schema Evolution ohne Downtime.</p></div>`
    },

    github: {
        group:'🔗 GitHub', icon:'🐙', label:'GitHub Ökosystem', title:'GitHub Repos — Originale vs DkZ™ Versionen',
        content:`<div class="card"><h2>🐙 Open-Source Ökosystem mit DkZ™ Gegenstücken</h2>
<p>Wichtige GitHub-Repos die das DkZ™ Ökosystem inspiriert oder integriert hat. In <span class="tag new">Klammern</span> unsere eigenen DkZ™ Versionen.</p>

<h3>🤖 AI Agents & Automation</h3><ul>
<li>⁰²⁰ <a href="https://github.com/PleasePrompto/notebooklm-mcp" target="_blank" style="color:var(--blue)">PleasePrompto/notebooklm-mcp</a> — MCP Server für NotebookLM<br><span class="tag new">→ DkZ: dkz-copilot.js + NLM Integration (§19)</span></li>
<li>⁰²⁴ <a href="https://github.com/jacob-bd/notebooklm-mcp-cli" target="_blank" style="color:var(--blue)">jacob-bd/notebooklm-mcp-cli</a> — CLI für NotebookLM MCP<br><span class="tag new">→ DkZ: ONTHERUN™ MCP Server 34+ Tools (CLI-native)</span></li>
<li>⁰²³ <a href="https://github.com/browser-use/browser-use" target="_blank" style="color:var(--blue)">browser-use/browser-use</a> — 🌐 Websites für AI Agents zugänglich machen<br><span class="tag new">→ DkZ: DkZ Hub Chrome Extension (9 Module, Browser-Agent)</span></li>
<li>⁰²⁷ <a href="https://github.com/nanobot-ai/nanobot" target="_blank" style="color:var(--blue)">nanobot-ai/nanobot</a> — Build MCP Agents<br><span class="tag new">→ DkZ: BotNet™ Marketplace + BMAD™ 7 Agenten</span></li>
<li>⁰²⁸ <a href="https://github.com/sipeed/picoclaw" target="_blank" style="color:var(--blue)">sipeed/picoclaw</a> — Tiny, Fast, Deployable Automation<br><span class="tag new">→ DkZ: Ralph-Loop™ (6-Phasen, frischer Kontext)</span></li>
<li>⁰³¹ <a href="https://github.com/microsoft/agent-framework" target="_blank" style="color:var(--blue)">microsoft/agent-framework</a> — Microsoft Agent Framework<br><span class="tag new">→ DkZ: BMAD™ 7-Agenten Methodik (§23) + James™ Guardian</span></li>
</ul>

<h3>🔄 Loops & Workflows</h3><ul>
<li>⁰²⁹ <a href="https://github.com/snarktank/ralph" target="_blank" style="color:var(--blue)">snarktank/ralph</a> — Autonomer AI Agent Loop bis alle PRD Tasks fertig<br><span class="tag new">→ DkZ: Ralph-Loop™ v2 (§24) — LESEN→SPAWN→EXECUTE→VERIFY→COMMIT→LOOP</span></li>
<li>⁰²² <a href="https://github.com/bmad-code-org/BMAD-METHOD" target="_blank" style="color:var(--blue)">bmad-code-org/BMAD-METHOD</a> — Breakthrough Method for Agile AI Development<br><span class="tag new">→ DkZ: BMAD™ (§23) — Blueprint→Mapping→Analyse→Design, 7 Agenten</span></li>
<li>⁰²⁶ <a href="https://github.com/n8n-io/n8n" target="_blank" style="color:var(--blue)">n8n-io/n8n</a> — Fair-code Workflow Automation + native AI<br><span class="tag new">→ DkZ: 8 Loops (Ralph, Copilot, Auto-Save, Backup, Health, Update, Triage, Dual-Agent)</span></li>
<li>⁰²⁵ <a href="https://github.com/jconorgrogan/JamesGPT" target="_blank" style="color:var(--blue)">jconorgrogan/JamesGPT</a> — Jailbreak / Predict / Opine<br><span class="tag new">→ DkZ: James™ Guardian (R24) — Überwacht, coded NICHT, Context Pipeline</span></li>
</ul>

<h3>📊 Data & Trading</h3><ul>
<li>⁰²¹ <a href="https://github.com/apache/iceberg-python" target="_blank" style="color:var(--blue)">apache/iceberg-python</a> — PyIceberg<br><span class="tag new">→ DkZ: DataLakeHouse™ — Apache Iceberg + DuckDB + James™ (dkz-iceberg.js)</span></li>
<li>⁰³⁰ <a href="https://github.com/tensortrade-org/tensortrade" target="_blank" style="color:var(--blue)">tensortrade-org/tensortrade</a> — Reinforcement Learning Trading<br><span class="tag new">→ DkZ: TradingAgents-DE (Wettmanager, Übersetzt + DkZ angepasst)</span></li>
<li>⁰³¹ <a href="https://github.com/Polymarket/agents" target="_blank" style="color:var(--blue)">Polymarket/agents</a> — Prediction Market Agents<br><span class="tag new">→ DkZ: Wettmanager™ + Tipico Live-Integration (MOD-070+)</span></li>
</ul>

<div class="prompt-box" onclick="cp(this)">DkZ™ EIGENE VERSIONEN (Fußnoten):

[20] notebooklm-mcp        → dkz-copilot.js + NLM (§19)
[21] apache-iceberg-python  → DataLakeHouse™ (dkz-iceberg.js + James™)
[22] BMAD-METHOD            → BMAD™ 7-Agenten Methodik (§23)
[23] browser-use            → DkZ Hub Chrome Extension (9 Module)
[24] notebooklm-mcp-cli     → ONTHERUN™ MCP Server (34+ Tools)
[25] JamesGPT               → James™ Guardian (R24, Context Pipeline)
[26] n8n                    → 8 DkZ Loops (Ralph, Copilot, Auto-Save...)
[27] nanobot                → BotNet™ Marketplace + DAC-Protokoll
[28] picoclaw               → Ralph-Loop™ (6-Phasen, frischer Kontext)
[29] ralph                  → Ralph-Loop™ v2 (§24, VSM System 2)
[30] tensortrade            → TradingAgents-DE (DkZ Standards)
[31] polymarket/agents      → Wettmanager™ (Tipico Live, MOD-070+)
[32] ms/agent-framework     → BMAD™ + James™ (7 Agenten, R24)</div></div>`
    },

    walkthrough: {
        group:'🔧 Vorlagen', icon:'📋', label:'Walkthrough v3', title:'Walkthrough v3 — Autonome Session-Dokumentation',
        content:`<div class="card"><h2>📋 Walkthrough v3 — Command Center</h2><p>Das Walkthrough-System dokumentiert jede Session automatisch und konfiguriert die optimale Skill-Kombination basierend auf dem gewählten Profil.</p>
<h3>Smart/Full Mode Toggle</h3>
<div class="compare-grid"><div class="compare-cell"><div class="cl">SMART</div><div class="cv" style="color:var(--green)">Nur 🟢 GO Skills</div></div><div class="compare-cell"><div class="cl">FULL</div><div class="cv" style="color:#ff3b5c">Alle inkl. 🔴 ADV</div></div><div class="compare-cell"><div class="cl">ANPASSEN</div><div class="cv" style="color:var(--yellow)">🟢 + 🟡 ohne 🔴</div></div></div>
<h3>Auto-Profile (5)</h3><ul><li><span class="tag new">🤖 Auto</span> — power, power+, vibe-coding, Ralph-Loop™, TestStraße, QA-Audit</li><li><span class="tag stack">🔧 Optimierung</span> — code-reviewer, simplify-code, TestStraße, architect-review</li><li><span class="tag stack">🔧 Pflege</span> — qa-audit, pre-commit, pr-writer, PDF-Handbuch</li><li><span class="tag new">🚀 Expansion</span> — senior-architect, api-patterns, BMAD™, deep-research</li><li><span class="tag cost">👤 UX</span> — frontend-design, gpt-taste, stitch-loop, design-spells</li></ul>
<h3>Trigger-Regeln</h3><ul><li><span class="tag con">EXCLUDE:</span> Echtzeit-Watcher ↔ Manuell</li><li><span class="tag con">EXCLUDE:</span> Echtzeit-Watcher ↔ Cron</li><li><span class="tag cost">WARN:</span> red-team-tactics ↔ vibe-coding</li><li><span class="tag pro">PREFER_B:</span> Kling/Luma ↔ Pollinations</li></ul>
<h3>QR-Code Sharing</h3><p>DocID: <code>DKZ-YYYY-MMDD-NNN</code></p>
<div class="compare-grid"><div class="compare-cell"><div class="cl">Primär</div><div class="cv">devkitz.sites/Walkthrough</div></div><div class="compare-cell"><div class="cl">Temporär</div><div class="cv">777.dkz.app/Walkthrough/DKZ-...</div></div><div class="compare-cell"><div class="cl">EU Mirror</div><div class="cv">devkitz.eu/Walkthrough</div></div></div>
<h3>MCP Persistenz-Pipeline</h3>
<div class="compare-grid"><div class="compare-cell"><div class="cl">otr_walkthrough_save</div><div class="cv">State → Drive + Sheets</div></div><div class="compare-cell"><div class="cl">otr_walkthrough_get</div><div class="cv">DocID → Walkthrough abrufen</div></div><div class="compare-cell"><div class="cl">otr_walkthrough_profile</div><div class="cv">Auto-Fill Profile abrufen</div></div></div>
<div class="prompt-box" onclick="cp(this)">WALKTHROUGH v3 PIPELINE:
LLM → otr_walkthrough_save (MCP)
  → n8n Webhook → Apps Script → Drive [06]/Walkthrough/ + Sheets
  → Local Fallback → SecondBrain/raw/ + 06_NOTEPAD/archive/master/log/
Screenshots: 777.dkz.app/screen/{bildname}
Blog: blog-hub/posts/walkthrough-v3-autonome-session.html
Research: 02_RESEARCH/Walkthrough/walkthrough-v3-research.md</div></div>`
    }
};

// Chat Knowledge Base (38+ Themen)
const CHAT_KB = {
    'supabase': 'Supabase = Open-Source PostgreSQL BaaS mit PostgREST, Auth, Realtime, Edge Functions, pgvector für AI/RAG. Empfohlen für DkZ Backend-Upgrade. Free Tier: 500MB DB + 1GB Storage.',
    'rust': 'Rust = Speichersicherheit ohne GC. Ownership + Borrowing → Fearless Concurrency. Ideal für Wasm, Performance-Bottlenecks. 83% Admiration Score.',
    'go': 'Go = Cloud-Native. Goroutinen + Channels. Docker/K8s nativ. Ideal für API Gateway und Microservices.',
    'java': 'Java = Enterprise. JVM + Virtual Threads (Loom). 92% Fortune 100. Spring Boot für Microservices.',
    'node': 'Node.js = DkZ Backend. V8 + Event Loop. Full-Stack JS/TS. NPM Ökosystem. ONTHERUN™ MCP Server.',
    'python': 'Python = AI/ML Monopol. PyTorch, LangChain, FastAPI. 51% Nutzung. Ideal für AI-Module.',
    'vanilla': 'Vanilla HTML/CSS = DkZ Kern-Stack! Zero Dependencies, Zukunftssicher. Jedes Modul = eine index.html.',
    'tailwind': 'Tailwind CSS v4: Utility-First, Lightning CSS Engine, JIT Compiler. Im DkZ nur für Chrome Extension (React). Dashboard = Vanilla CSS.',
    'google script': 'Google Apps Script (GAS): CLOUDIA² Engine. Auto-Sorter v2.1 mit 22 Metadaten, Drive Indexer, 4-Ordner Notes. Kostenlos auf Google Cloud.',
    'apps script': 'GAS = JavaScript V8 in Google Cloud. DriveApp, SpreadsheetApp, GmailApp. CLOUDIA² Drive Automation. Trigger alle 15 Min.',
    'css': 'DkZ CSS v2: Custom Properties, Glassmorphism, Animated Blobs. Accent=#fa1e4e, Bg=#060608, Green=#00ff88. In 86+ Dateien.',
    'duckdb': 'DuckDB = In-Process OLAP. IMMER am Start für Oberflächen-Management! DuckDB-WASM im Browser, Parquet native, SQL:2016. DataLakeHouse™ Engine.',
    'sqlite': 'SQLite + RAG: sqlite-vec für Vektor-Suche, FTS5 Volltext. Zero-Config, 1 Datei. Ideal für offline RAG Pipelines.',
    'rag': 'RAG Pipeline: Dokumente → Chunks → Embeddings → sqlite-vec → Similarity Search → LLM Prompt. Offline-fähig mit SQLite.',
    'mongo': 'MongoDB: NoSQL Document Store. JSON/BSON nativ, Atlas Free Tier 512MB, Change Streams. Gut für flexible Schemas.',
    'iceberg': 'Apache Iceberg + James™: Immutable Data Lake, Time Travel, Schema Evolution. James™ bewacht via R24 ALARM. catalog.json = Manifest.',
    'james': 'James™ = Guardian Agent. Überwacht Constitution, löst R24 Alarm aus, coded NICHT. Bewacht Iceberg-Datenintegrität + Context Pipeline.',
    'sheets': 'Google Sheets als DB: FILES-INDEX, USAGE-LOG, TAGS, SORT-LOG. CLOUDIA² synct alle 15 Min. Cloud-Spiegel des DkZ Systems.',
    'kosten': 'Tiered Model Routing: 70% Gemini Flash ($0), 20% Haiku, 10% Sonnet. Infra: Cloudflare Free + Hetzner €3.79/mo.',
    'stack': 'DkZ Stack: Vanilla + Node.js Express + DuckDB/Iceberg. 81+ Module. Startup-Alt: Next.js + Supabase.',
    'llm': 'LLM Matrix: Code Gen → Claude Sonnet, Debug → Claude, Docs → Gemini Flash, Architektur → Opus/o3.',
    'prompt': '344 Prompt Templates in 35 Kategorien. System-Prompt, Modul-Erstellung, CoT, Cost Optimizer. Alle kopierbar.',
    'design': 'DkZ v2: bg=#060608, accent=#fa1e4e, green=#00ff88. Inter + JetBrains Mono. Glassmorphism + animated Blobs.',
    'second brain': 'Second Brain: PARA-Framework + Anytype-inspiriert. Quick Capture, Knowledge Graph, Tags. Neues Modul MOD-082.',
    'brain': 'Second Brain Dashboard: Knowledge Graph Visualisierung, Quick Capture, Volltextsuche, localStorage Persistenz.',
    'missing': 'Missing Components: PWA Service Worker, Auth System, Realtime Sync, CI/CD Pipeline, Testing Framework, i18n.',
    'budget': 'Budget-System: Tages-/Monatslimit setzen, Ampel (Grün/Gelb/Rot), Export als CSV. Neues Modul MOD-083.',
    'agents': '25 Playbook Agents: cost queries, module creation, feature updates, README generation, registry sync.',
    'bmad': 'BMAD™ = 7 Agenten: James™ (Guardian), PM™, Architekt™, Developer™, Reviewer™, Tester™, Dokumentar™.',
    'ralph': 'Ralph-Loop™: LESEN → SPAWN → EXECUTE → VERIFY → COMMIT → LOOP. Frischer Kontext pro Task.',
    'cloudia': 'CLOUDIA²: Google Drive Cloud-Arm. 10 Ordner ([00-99] + Spezial), Auto-Sorter v2.1, 4-Ordner Notes, GAS Trigger.',
    'wissen': 'WissenHub: Immutable Knowledge Database (R26). 7 Rubriken, JSON Sidecar, Iceberg Manifest.',
    'dsgvo': 'EU-DSGVO: Hetzner (DE), Scaleway (FR), OVHcloud (FR), Ionos (DE), Uberspace (DE), Mistral (FR).',
    'mcp': 'MCP = Model Context Protocol. ONTHERUN™ Server mit 34+ Tools. Module als MCP Tools exponierbar.',
    'pwa': 'PWA: Service Worker + Manifest vorhanden. Offline-Support für alle Module geplant.',
    'datenbank': 'DkZ Datenbanken: DuckDB (IMMER am Start, WASM), SQLite+RAG, MongoDB NoSQL, Apache Iceberg+James™, Google Sheets. Alles verzahnt.',
    'github': '13 GitHub-Repos mit DkZ™ Gegenstücken: ralph→Ralph-Loop™, BMAD-METHOD→BMAD™, JamesGPT→James™, iceberg→DataLakeHouse™, n8n→8 Loops, browser-use→Chrome Extension, tensortrade→TradingAgents-DE, polymarket→Wettmanager™.',
    'repos': 'Open-Source Inspirationen: notebooklm-mcp, picoclaw, nanobot→BotNet™, ms/agent-framework→BMAD™+James™. Alle mit DkZ™ Eigenversionen.',
    'walkthrough': 'Walkthrough v3: Smart/Full Mode Toggle (3 Modi), 5 Auto-Profile (Auto/Optimierung/Pflege/Expansion/UX), Trigger-Regeln (EXCLUDE/WARN/PREFER_B), QR-Code Sharing (DKZ-YYYY-MMDD-NNN, 4 Domains), MCP Pipeline (3 Tools: save/get/profile), LLM Auto-Fill Guide. Screenshots: 777.dkz.app/screen/{bildname}.',
    'hilfe': 'Frag mich nach: supabase, rust, go, java, node, python, vanilla, tailwind, google script, css, duckdb, sqlite, rag, mongo, iceberg, james, sheets, github, repos, kosten, stack, llm, prompt, design, second brain, budget, missing, agents, bmad, ralph, cloudia, datenbank, walkthrough'
};

