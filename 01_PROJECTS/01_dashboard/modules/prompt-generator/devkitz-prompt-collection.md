# DEVKiTZ™ Prompt Collection — V2 Design

> 10 Detaillierte Prompts für das DEVKiTZ™ Ökosystem
> Stand: 2026-03-24 · Sprachen: TypeScript, Python, Go, JavaScript
> Protokolle: MCP, ADK, A2A, REST, WebSocket, OAuth2

---

## 📋 LLM-Auswahl (Vollständig — für alle Prompts)

| Provider | Modelle | Kosten | Typ |
|:---------|:--------|:-------|:----|
| **OpenAI** | GPT-4.1, GPT-4.1 mini, GPT-4.1 nano, o3, o4-mini | $$-$$$$ | Chat, Reasoning |
| **Anthropic** | Claude 4 Opus, Claude 3.7 Sonnet, Claude Haiku 3.5 | $$-$$$$ | Chat, Analysis |
| **Google** | Gemini 2.5 Pro, Gemini 2.0 Flash, Flash Lite | $-$$ | Chat, Multimodal |
| **Mistral** | Large, Medium, Codestral, Pixtral, OCR | $-$$ | Code, Vision |
| **DeepSeek** | DeepSeek-V3, DeepSeek-R1, Chat | $ | Reasoning |
| **Meta** | Llama 4 Scout, Llama 4 Maverick, Llama 3.3 70B | Free-$ | Open Source |
| **Groq** | Llama 3.3 70B (fast), Mixtral 8x7B | $ | Speed |
| **xAI** | Grok 3, Grok 3 mini | $$ | Chat |
| **Cohere** | Command R+, Command R | $$ | RAG |
| **NanoChat** | Gemini Flash Lite, GPT-4.1 nano, Haiku 3.5 | ¢ | Ultra-Low-Cost |

## 📐 Design v2 Referenz

```css
:root {
    --accent: #fa1e4e;
    --bg: #060608;
    --bg-card: rgba(18, 18, 24, 0.85);
    --text: #e8e8ec;
    --muted: #8a8a9a;
    --green: #00ff88;
    --yellow: #ffb800;
    --red: #ff3b5c;
    --blue: #3b82f6;
    --font: 'Inter', sans-serif;
    --mono: 'JetBrains Mono', monospace;
    --radius: 12px;
    --shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(20px);  /* Glassmorphism */
}
```

---




---

## Prompt 1: MCP Server Setup (ONTHERUN™)

**Ziel:** ONTHERUN™ MCP Server aufsetzen mit Tool-Registry, Health-Check und Multi-Provider Chat.

**Sprachen:** TypeScript (Hauptserver), Python (Tools)
**Protokolle:** MCP (Model Context Protocol), REST, WebSocket
**LLM-Empfehlung:** Codestral (Code), GPT-4.1 (Architektur), Gemini 2.5 Pro (Planung)

```
Du bist ein Senior Backend-Architekt für das DEVKiTZ™ Ökosystem.

AUFGABE:
Erstelle einen MCP Server "ONTHERUN™" mit folgender Architektur:

1. FRAMEWORK: Node.js 18+ mit Express.js
2. MCP SDK: @modelcontextprotocol/sdk (latest)
3. TOOLS (mindestens 10):
   - health: Server-Status, Uptime, Speicher
   - chat: Multi-Provider LLM Chat (OpenAI, Anthropic, Google, Mistral)
   - tokens: API-Key Verwaltung (verschlüsselt in .env)
   - modules: Dashboard-Module auflisten und testen
   - research: Web-Recherche mit Zusammenfassung
   - files: Dateisystem-Operationen (CRUD)
   - prompts: Prompt-Archiv (Iceberg-Bridge)
   - seo: Meta-Tag + Lighthouse Analyse
   - workflow: Ralph-Loop™ Task-Dispatcher
   - system: Git-Status, npm-Pakete, Disk-Info

4. ARCHITEKTUR:
   - Entry: cli/dkz.js (CLI) + server.js (HTTP)
   - Port: 3040 (konfigurierbar via .env)
   - CORS: Erlaubt für localhost + devkitz.eu
   - Rate-Limiting: 100 req/min pro IP
   - Logging: Winston mit File + Console Transport
   - WebSocket: Echtzeit-Events für Dashboard

5. SICHERHEIT:
   - Helmet.js Middleware
   - API-Key Rotation alle 90 Tage
   - .env für Secrets (NIEMALS in Code)
   - HTTPS in Produktion (Cloudflare Proxy)

6. TESTS:
   - Jest Unit Tests für jeden Tool-Handler
   - Integration Tests mit supertest
   - Health-Check Endpoint: GET /api/v1/health

KONVENTIONEN:
- DkZ™ Naming: dkz-[funktion].js
- Commits: feat(ontherun): beschreibung
- Keine Frameworks (Express ist erlaubt)
- Alles in TypeScript (mit JS Fallback möglich)

LLMs für diesen Task:
- Codestral für Code-Generierung
- GPT-4.1 für Architektur-Review
- Gemini 2.5 Pro für Dokumentation

Gib mir den vollständigen Code für:
1. package.json mit allen Dependencies
2. server.js (Express + MCP Bridge)
3. cli/dkz.js (CLI Entry)
4. tools/health.js (Beispiel-Tool)
5. .env.example
6. README.md
```

---




---

## Prompt 2: ADK Agent mit A2A Kommunikation

**Ziel:** Google ADK Agent erstellen der über A2A mit anderen Agenten kommuniziert.

**Sprachen:** Python (ADK), Go (A2A Bridge)
**Protokolle:** ADK (Agent Development Kit), A2A (Agent-to-Agent), gRPC
**LLM-Empfehlung:** Gemini 2.5 Pro (ADK-native), Claude 3.7 Sonnet (Code), Llama 4 Scout (Test)

```
Du bist ein Google ADK Spezialist und Agent-Architekt.

AUFGABE:
Erstelle einen ADK-Agent namens "DkZ-Scout™" mit A2A Kommunikation:

1. AGENT SETUP (Python):
   - google-cloud-adk SDK installieren
   - Agent-Card (JSON-LD) definieren:
     - name: "DkZ-Scout"
     - description: "DEVKiTZ™ Ecosystem Scout Agent"
     - capabilities: ["code-review", "research", "summarize", "translate"]
     - protocols: ["a2a", "mcp", "rest"]
   - AgentExecutor mit Tool-Registry
   - Memory: ConversationBufferMemory + Iceberg-Bridge

2. A2A PROTOKOLL:
   - Agent Discovery: /.well-known/agent.json
   - Message Format: JSON-RPC 2.0
   - Authentication: Bearer Token + mTLS
   - Capabilities Negotiation
   - Task Streaming (SSE)
   - Peer-zu-Peer ohne zentralen Server

3. TOOLS:
   - code_review: Analysiert Code gegen DkZ™ Standards
   - web_research: Recherchiert und fasst zusammen
   - file_manager: CRUD auf Workspace-Dateien
   - prompt_archiver: Speichert/Läd Prompts aus Iceberg
   - module_scanner: Prüft Dashboard-Module

4. A2A BRIDGE (Go):
   - gRPC Server für Agent-Kommunikation
   - Service Discovery via DNS-SD
   - Message Queue für async Tasks
   - Fallback: REST wenn gRPC nicht verfügbar

5. INTEGRATION mit ONTHERUN™:
   - ADK Agent als MCP Resource registrieren
   - Bidirektionaler Datenaustausch
   - Health-Check im Dashboard sichtbar
   - NanoChat als Fallback-LLM

LLMs:
- Primär: Gemini 2.5 Pro (native ADK Support)
- Code: Claude 3.7 Sonnet
- Fallback: Llama 4 Scout (70B, open source)
- NanoChat: Gemini Flash Lite ($0.01/1M)

DATEIEN:
1. agent.py (ADK Agent Hauptdatei)
2. agent_card.json (A2A Discovery)
3. tools/ (5 Tool-Module)
4. bridge/main.go (A2A gRPC Bridge)
5. docker-compose.yml
6. README.md
```

---




---

## Prompt 3: NanoBot + PicoClaw Orchestrator

**Ziel:** NanoBot und PicoClaw als leichtgewichtige Agenten über MCP orchestrieren.

**Sprachen:** TypeScript (Orchestrator), Python (PicoClaw FAISS)
**Protokolle:** MCP, WebSocket, REST
**LLM-Empfehlung:** GPT-4.1 nano (NanoBot), Gemini Flash Lite (PicoClaw), DeepSeek Chat (Fallback)

```
Du bist ein MCP Agent-Orchestrator Entwickler.

AUFGABE:
Erstelle ein Dual-Agent-System: NanoBot™ + PicoClaw™

1. NANOBOT™ (TypeScript):
   - Ultra-leichtgewichtiger Chat-Agent
   - Nutzt NUR Flash/Nano-Modelle ($0.01/1M)
   - Primär: Gemini 2.0 Flash Lite
   - Fallback: GPT-4.1 nano, Claude Haiku 3.5
   - Features:
     - Quick-Answer (max 200 Tokens)
     - Code-Snippet Generator
     - Translation (DE/EN/FR/ES)
     - Zusammenfassung (max 100 Wörter)
   - Console-Command: /nanobot [frage]
   - API: POST /api/v1/nanobot/chat

2. PICOCLAW™ (Python + FAISS):
   - Wissens-Agent mit Vektordatenbank
   - FAISS für semantische Suche über DEVKiTZ™ Wiki
   - Features:
     - Semantische Suche: "Wo ist X?"
     - Kontext-Retrieval für andere Agenten
     - Modul-Empfehlungen basierend auf Frage
     - Wiki-Zusammenfassungen
   - Console-Command: /picoclaw [suche]
   - API: POST /api/v1/picoclaw/search

3. ORCHESTRATOR (TypeScript):
   - MCP Tool Registry für beide Agenten
   - Router: Erkennt ob NanoBot oder PicoClaw zuständig
   - Chaining: PicoClaw holt Kontext → NanoBot antwortet
   - Task Queue: Bull/BullMQ für async Jobs
   - ONTHERUN™ Integration als MCP Resource

4. CONSOLE INTEGRATION (dkz-console.js):
   - /nanobot → Quick-Chat
   - /picoclaw → Wissenssuche
   - /syntex → Beide kombiniert
   - /agents → Status aller Agenten
   - Tab-Completion für Commands

5. JAMEZ™ TASK-LISTE:
   - NanoBot und PicoClaw Tasks werden bei JAMEZ™ gelistet
   - Score-Tracking pro Agent
   - Performance-Metriken (Latenz, Token-Kosten)

LLMs:
- NanoBot: GPT-4.1 nano, Gemini Flash Lite, Haiku 3.5
- PicoClaw: Mistral Medium (Embedding), DeepSeek Chat
- Orchestrator: GPT-4.1 mini (Routing)

DATEIEN:
1. nanobot/index.ts
2. picoclaw/agent.py + faiss_index.py
3. orchestrator/router.ts
4. shared/dkz-nanobot.js (Console-Bridge)
5. README.md
```

---




---

## Prompt 4: LLM API Gateway (Multi-Provider)

**Ziel:** Zentrales API-Gateway das alle LLM-Provider über eine einheitliche Schnittstelle anbietet.

**Sprachen:** TypeScript (Gateway), Python (Provider-Adapter)
**Protokolle:** REST (OpenAI-kompatibel), WebSocket, SSE
**LLM-Empfehlung:** Alle Provider gleichzeitig (Multi-Model)

```
Du bist ein API-Gateway Architekt für KI-Systeme.

AUFGABE:
Erstelle ein LLM API Gateway "NEXUZ™ Gateway" für DEVKiTZ™:

1. EINHEITLICHE API (OpenAI-kompatibel):
   - POST /v1/chat/completions
   - POST /v1/embeddings
   - POST /v1/images/generations
   - GET /v1/models (alle Provider-Modelle)
   - Streaming: SSE (text/event-stream)
   - WebSocket: /ws/chat (Echtzeit)

2. PROVIDER REGISTRY:
   | Provider | Endpoint | Auth |
   |----------|----------|------|
   | OpenAI | api.openai.com | Bearer |
   | Anthropic | api.anthropic.com | x-api-key |
   | Google | generativelanguage.googleapis.com | API Key |
   | Mistral | api.mistral.ai | Bearer |
   | Groq | api.groq.com | Bearer |
   | DeepSeek | api.deepseek.com | Bearer |
   | xAI | api.x.ai | Bearer |
   | Cohere | api.cohere.ai | Bearer |
   | OpenRouter | openrouter.ai/api | Bearer |
   | Ollama | localhost:11434 | None |

3. FEATURES:
   - Model Router: Automatische Provider-Wahl nach Modellname
   - Fallback Chain: Provider A → B → C
   - Cost Tracking: Token-Verbrauch + Kosten pro Request
   - Rate Limiter: Per-Provider + Global
   - Cache: Redis/localStorage für identische Prompts
   - A/B Testing: Gleicher Prompt an 2 Modelle
   - Prompt Templates: Vordefinierte System-Prompts

4. MONITORING:
   - Dashboard-Widget für Latenz/Kosten
   - Health-Checks pro Provider (30s Interval)
   - Alert bei Provider-Ausfall (REDNOTE)
   - Usage-Statistiken in localStorage

5. SICHERHEIT:
   - API-Keys verschlüsselt in .env
   - Token Rotation Schedule
   - PII-Filter vor Request (optional)
   - Request/Response Logging (opt-in)

LLMs für diesen Task:
- GPT-4.1 für Gateway-Architektur
- Codestral für TypeScript-Code
- Gemini 2.5 Pro für Dokumentation
- DeepSeek-R1 für Algorithmen (Routing-Logik)

DATEIEN:
1. gateway/server.ts
2. gateway/providers/ (10 Provider-Adapter)
3. gateway/router.ts (Model → Provider Mapping)
4. gateway/middleware/ (Auth, RateLimit, Cache)
5. dashboard/widget.js (DkZ™ Dashboard Integration)
```

---




---

## Prompt 5: Console Command System (SYNTEX™)

**Ziel:** Erweiterbares Console-Command-System für alle DkZ™ Module.

**Sprachen:** JavaScript (ES6+)
**Protokolle:** Browser API, localStorage, ONTHERUN™ MCP
**LLM-Empfehlung:** GPT-4.1 mini (Commands), Codestral (Code-Gen), NanoChat (Quick-Help)

```
Du bist ein DkZ™ Console-Experte und UI-Entwickler.

AUFGABE:
Erweitere dkz-console.js um das SYNTEX™ Command System:

1. BESTEHENDE COMMANDS (behalten):
   - /help, /guide, /features, /shortcuts
   - /system, /console, /clear

2. NEUE AGENT-COMMANDS:
   - /nanobot [frage] → NanoBot Quick-Chat
   - /picoclaw [suche] → PicoClaw Wissenssuche
   - /syntex [prompt] → NanoBot + PicoClaw kombiniert
   - /jamez [modul] → JAMEZ™ Score + Tasks
   - /coderabbit [datei] → CodeRabbit Review
   - /openspec [api] → OpenSpec Docs generieren
   - /copilot [befehl] → GitHub Copilot Aktion

3. CLOUD-COMMANDS:
   - /drive [aktion] → Google Drive Quick-Access
   - /cloudflare [domain] → DNS/SSL Status
   - /claudia [pfad] → CL0UDiA Nextcloud Dateien

4. UTILITY-COMMANDS:
   - /tts [text] → Text vorlesen (Browser TTS)
   - /whisper → Spracheingabe starten
   - /qr [url] → QR-Code generieren
   - /theme [dark|light|accent] → Theme wechseln

5. FEATURES:
   - Tab-Completion für alle Commands
   - Command-History (↑/↓ Pfeiltasten)
   - Pipe-Operator: /picoclaw suche | /nanobot zusammenfassen
   - Alias: /nb = /nanobot, /pc = /picoclaw
   - Autocorrect: "nanbot" → "nanobot"
   - Markdown-Rendering in Output
   - Syntax-Highlighting für Code-Output

6. MCP BRIDGE:
   - Jeder Command kann an ONTHERUN™ delegieren
   - Fallback: Lokale Ausführung wenn Server offline
   - Agent-Status in Console-Header anzeigen

LLMs:
- GPT-4.1 mini für Command-Routing
- Codestral für Code-Snippet-Generierung
- NanoChat (Gemini Flash Lite) für Quick-Help
- PicoClaw (FAISS) für Wissenssuche

KONVENTIONEN:
- Vanilla JavaScript (ES6+), kein Framework
- DkZ™ Design v2 (Glassmorphism, #fa1e4e Accent)
- localStorage für Command-History + Preferences
- Shared Script: dkz-console.js erweitern
```

---




---

## Prompt 6: Cloud Panel (Drive + Cloudflare + Oracle)

**Ziel:** Einheitliches Cloud-Management-Panel für alle Cloud-Dienste.

**Sprachen:** TypeScript (Backend API), JavaScript (Frontend Panel)
**Protokolle:** OAuth2, REST, Google API, Cloudflare API v4
**LLM-Empfehlung:** GPT-4.1 (API-Integration), Claude 3.7 Sonnet (Security), Gemini 2.5 Pro (Docs)

```
Du bist ein Cloud-Infrastruktur-Experte und DkZ™ UI-Entwickler.

AUFGABE:
Erstelle das "Cloud Control" Panel für DEVKiTZ™:

1. GOOGLE DRIVE INTEGRATION:
   - OAuth2 Login (Google-Konto)
   - Dateien auflisten, suchen, teilen
   - Ordner-Baum Navigation
   - Freigabe-Management (User, Rollen)
   - Bulk User Backup (alle Dateien eines Users exportieren)
   - Google Admin SDK: Benutzer verwalten (Bulk)
   - Quota-Anzeige (Speicherplatz)

2. CLOUDFLARE INTEGRATION:
   - API v4 mit Auth Token
   - DNS Records verwalten (A, CNAME, MX, TXT)
   - SSL/TLS Status + Zertifikat-Info
   - DDoS Protection Status
   - Firewall Rules anzeigen/bearbeiten
   - Cache Purge Button
   - Analytics (Requests, Bandwidth)

3. ORACLE CLOUD:
   - OCI SDK Integration
   - Compute Instances auflisten
   - Object Storage Browser
   - Netzwerk-Übersicht (VCN, Subnets)
   - Cost Dashboard (aktuelle Kosten)

4. UI DESIGN (DkZ™ v2):
   - 3-Tab Layout: Drive | Cloudflare | Oracle
   - Status-Ampel pro Service (🟢🟡🔴)
   - Dark Theme, Glassmorphism Cards
   - Responsive (Desktop + Tablet + Mobile)
   - Rechte-Matrix: Wer darf was
   - Bulk-Aktionen: Multi-Select + Execute

5. SICHERHEIT:
   - OAuth2 Tokens in Secure Storage
   - Token Refresh automatisch
   - Audit-Log aller Aktionen
   - 2FA-Check vor kritischen Aktionen

LLMs:
- GPT-4.1 für API-Integration
- Claude 3.7 Sonnet für Security-Review
- Gemini 2.5 Pro für Dokumentation
- Codestral für Code-Generierung

DATEIEN:
1. index.html (DkZ™ v2 Panel)
2. drive-api.js (Google Drive Helper)
3. cloudflare-api.js (CF API v4)
4. oracle-api.js (OCI SDK)
5. features.json
```

---




---

## Prompt 7: CL0UDiA™ Nextcloud (EU AI Act konform)

**Ziel:** Nextcloud-Panel konform mit EU AI Act, gehostet in Deutschland/Europa.

**Sprachen:** PHP (Nextcloud API), TypeScript (Frontend Bridge)
**Protokolle:** WebDAV, REST, LDAP, OAuth2
**LLM-Empfehlung:** Claude 3.7 Sonnet (Security/Compliance), Mistral Large (EU-fokussiert), GPT-4.1 (Integration)

```
Du bist ein Datenschutz-Experte und Nextcloud-Spezialist.

AUFGABE:
Erstelle das "CL0UDiA™" Panel — Nextcloud EU AI Act konform:

1. NEXTCLOUD VERBINDUNG:
   - WebDAV Client für Dateizugriff
   - REST API v2 (OCS) für Metadaten
   - Server Discovery: URL + User + App-Password
   - Automatische Reconnection

2. FEATURES:
   - 📁 Datei-Explorer (Tree + Grid View)
   - 📤 Upload (Drag & Drop, Multi-File)
   - 📥 Download (Single + ZIP)
   - 🔗 Sharing (Link, User, Group, Password, Ablauf)
   - 👥 User-Management (LDAP/Local)
   - 🔐 Rechte-Matrix (Read/Write/Share/Admin)
   - 📊 Quota-Anzeige pro User
   - 🔍 Volltextsuche (Nextcloud Search API)

3. EU AI ACT COMPLIANCE:
   - ⚖️ Daten-Residenz: Nur DE/EU Server
   - 🔒 Verschlüsselung: Ende-zu-Ende (E2EE)
   - 📋 DSGVO-konform: Datenlöschung auf Anfrage
   - 📝 Audit-Log: Alle Zugriffe protokolliert
   - 🏷️ AI-Transparenz: Welche KI verarbeitet Daten
   - 🚫 Keine Datenexporte außerhalb EU
   - ✅ Compliance-Dashboard mit Status

4. UI DESIGN (DkZ™ v2):
   - Dark Theme, Glassmorphism
   - Breadcrumb Navigation
   - Context-Menu (Rechtsklick)
   - Preview: Bilder, PDFs, Markdown
   - Responsive für Tablet/Mobile

5. INTEGRATION:
   - ONTHERUN™ MCP: Dateien als Resource
   - Iceberg™ Bridge: Archiv-Sync
   - PicoClaw: Wissensindex über NC-Dateien

LLMs:
- Claude 3.7 Sonnet für Datenschutz/Compliance
- Mistral Large für EU-spezifische Regeln
- GPT-4.1 für Integration
- DeepSeek Chat für Backend-Logik

DATEIEN:
1. index.html (DkZ™ v2 Panel)
2. nextcloud-api.js (WebDAV + REST Bridge)
3. compliance.js (EU AI Act Checks)
4. features.json
```

---




---

## Prompt 8: Whisper + Browser TTS Offline

**Ziel:** Offline Text-to-Speech + Speech-to-Text für alle DkZ™ Module.

**Sprachen:** Python (Whisper STT), JavaScript (Browser TTS)
**Protokolle:** Web Speech API, WebSocket, ONTHERUN™ MCP
**LLM-Empfehlung:** GPT-4.1 mini (TTS-Routing), Whisper Large v3 (STT), NanoChat (Zusammenfassung)

```
Du bist ein Audio-AI-Spezialist und Accessibility-Experte.

AUFGABE:
Erstelle ein universelles TTS/STT System für DEVKiTZ™:

1. BROWSER TTS (Offline — Web Speech API):
   - SpeechSynthesis API (alle Browser)
   - Stimmen-Auswahl (DE, EN, FR, ES)
   - Geschwindigkeit einstellbar (0.5x - 2.0x)
   - Pitch einstellbar
   - Pause/Resume/Stop Controls
   - Text-Highlighting während des Vorlesens
   - 🎧 Kopfhörer-Button in JEDEM Modul
   - Klick auf 🎧 → Markierten Text vorlesen
   - Kein markierter Text → Komplette Seite vorlesen

2. SHARED SCRIPT: dkz-tts.js
   - Auto-Inject: 🎧 Button unten links
   - API: DkzTTS.speak(text, lang, speed)
   - API: DkzTTS.stop()
   - API: DkzTTS.pause() / .resume()
   - API: DkzTTS.getVoices() → Liste aller Stimmen
   - Console: /tts [text] → Vorlesen
   - Console: /tts:stop → Stoppen
   - Console: /tts:voices → Stimmen auflisten
   - Einstellungen in localStorage gespeichert

3. WHISPER STT (über ONTHERUN™):
   - OpenAI Whisper API oder lokales Whisper
   - Mikrofon-Aufnahme im Browser
   - Real-time Transkription (WebSocket)
   - Sprach-Erkennung: DE, EN, FR, ES, IT, PT
   - Console: /whisper → Aufnahme starten
   - Transkript → direkt in Input-Felder einfügen

4. TTS PANEL (Standalone):
   - Texteingabe-Feld (Paste oder Tippen)
   - Voice-Auswahl mit Preview
   - Speed/Pitch Slider
   - Export: Audio als MP3/WAV (wenn möglich)
   - Verlauf: Letzte 20 TTS-Anfragen
   - Favoriten: Oft genutzte Texte pinnen

5. INTEGRATION:
   - dkz-tts.js in alle 90+ Module
   - Tastenkürzel: Alt+T → Markierung vorlesen
   - Mobile: Kopfhörer-Button in Bottom-Bar
   - ONTHERUN™: /api/v1/tts + /api/v1/stt

LLMs:
- Whisper Large v3 für STT
- GPT-4.1 mini für Zusammenfassung vor TTS
- NanoChat für Quick-Translate vor TTS
- Edge TTS (Microsoft) als Server-Fallback

DATEIEN:
1. shared/dkz-tts.js (Shared Script — 🎧 Button überall)
2. modules/whisper-tts/index.html (TTS Panel)
3. features.json
```

---




---

## Prompt 9: CodeRabbit + OpenSpec CI/CD

**Ziel:** Code-Review und API-Dokumentation automatisieren.

**Sprachen:** YAML (GitHub Actions), TypeScript (Dashboard)
**Protokolle:** GitHub API v4 (GraphQL), REST, Webhooks
**LLM-Empfehlung:** GPT-4.1 (Code-Review), Claude 3.7 Sonnet (Security), Codestral (Suggestions)

```
Du bist ein DevOps-Ingenieur und Code-Quality-Experte.

AUFGABE:
Erstelle ein CodeRabbit + OpenSpec Dashboard für DEVKiTZ™:

1. CODERABBIT INTEGRATION:
   - GitHub App verbinden
   - PR-Reviews anzeigen (Score, Issues, Suggestions)
   - Auto-Review bei Push zu main/develop
   - Review-Verlauf mit Trend-Analyse
   - Issue-Kategorien: Security, Performance, Style, Bug
   - Fix-Suggestions mit 1-Click Apply
   - DkZ™ Custom Rules:
     - esc() Check (R80 XSS)
     - DkZ CSS Variables (kein Hardcoded #fa1e4e)
     - Shared Scripts Pflicht
     - localStorage Keys mit dkz- Prefix

2. OPENSPEC API DOCS:
   - Auto-generierte API-Docs aus Code
   - OpenAPI 3.1 Format
   - Swagger UI Integration
   - Endpoint-Tests direkt im Dashboard
   - Versionierte Docs (v1, v2, etc.)

3. GITHUB COPILOT BRIDGE:
   - Copilot Suggestions in Console anzeigen
   - /copilot suggest → Code-Vorschlag
   - /copilot explain → Code erklären
   - /copilot fix → Bug-Fix vorschlagen
   - /copilot test → Test generieren

4. CI/CD PIPELINE:
   - GitHub Actions Workflow
   - On Push: Lint → Test → CodeRabbit → Deploy
   - On PR: Auto-Review + Score im PR-Kommentar
   - Nightly: Full System Scan (alle 90 Module)

5. UI (DkZ™ v2):
   - Dashboard: Score-Trend, Open Issues, Last Reviews
   - PR-Liste mit Status-Ampel
   - Code-Diff Viewer mit Inline-Comments
   - Integration mit JAMEZ™ Score

LLMs:
- GPT-4.1 für Code-Review
- Claude 3.7 Sonnet für Security-Analyse
- Codestral für Fix-Suggestions
- DeepSeek-R1 für Logic-Bugs

DATEIEN:
1. modules/coderabbit-panel/index.html
2. .github/workflows/coderabbit-review.yml
3. openspec/config.yml
4. features.json
```

---




---

## Prompt 10: Mobile QR App Launcher

**Ziel:** Jedes DkZ™ Panel als Mobile Web App via QR-Code starten.

**Sprachen:** JavaScript (PWA), HTML5 (Manifest)
**Protokolle:** PWA (Manifest, Service Worker), QR-API
**LLM-Empfehlung:** GPT-4.1 mini (PWA), Gemini Flash (QR), NanoChat (Links)

```
Du bist ein PWA-Experte und Mobile-UI-Entwickler.

AUFGABE:
Erstelle einen "QR App Launcher" für DEVKiTZ™:

1. QR-CODE GENERATOR:
   - QR-Code für jedes der 90+ Module
   - QR-Code enthält URL + PWA-Parameter
   - Verschiedene Größen: S (128px), M (256px), L (512px)
   - Logo in der Mitte (DkZ™ Icon)
   - Farbe: Accent #fa1e4e auf Dark Background
   - Download als PNG/SVG
   - Batch-Export: Alle QR-Codes als ZIP

2. PWA MANIFEST:
   - Jedes Modul als installierbare Web App
   - Fullscreen Mode (standalone)
   - Splash Screen mit DkZ™ Branding
   - Icons: 192x192 + 512x512
   - Theme Color: #fa1e4e
   - Background Color: #060608

3. MOBILE OPTIMIERUNG:
   - Touch-optimierte UI
   - Swipe-Gesten für Navigation
   - Bottom-Bar mit Haupt-Aktionen
   - Pull-to-Refresh
   - Orientierung: Portrait + Landscape
   - Safe Area Insets (Notch)

4. VIVALDI SIDE PANEL:
   - Chrome Extension mit side_panel API
   - Panel-Selector: Dropdown mit allen Modulen
   - Quick-Switch zwischen Panels
   - Tastenkürzel: Ctrl+Shift+P

5. LAUNCHER UI:
   - Grid-Layout: alle Module als Cards
   - Suche + Filter (Kategorie, Favoriten)
   - QR anzeigen bei Hover/Touch
   - "Auf Handy öffnen" Button → QR anzeigen
   - Zuletzt geöffnet (Top 10)

6. SERVICE WORKER:
   - Offline-Cache für alle Module
   - Background Sync für Daten
   - Push Notifications (optional)

LLMs:
- GPT-4.1 mini für PWA-Setup
- Gemini Flash für QR-Generierung
- NanoChat für Link-Management
- Codestral für Service Worker

DATEIEN:
1. modules/qr-launcher/index.html
2. shared/manifest.json (PWA)
3. shared/sw.js (Service Worker)
4. chrome-extensions/dkz-panels/manifest.json
5. chrome-extensions/dkz-panels/sidepanel.html
6. features.json
```

---
