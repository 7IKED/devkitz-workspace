# 🏗️ DkZ Dashboard — BLAUPAUSE (Blueprint)

> **Version:** v0.08 | **Stand:** 2026-03-13 | **Module:** 74 | **Dashboards:** 14 | **Status:** Aktiv

---

## 📌 Was ist das hier?

Diese Datei ist die **Gesamtübersicht** des DkZ Dashboards.
Sie zeigt dir auf einen Blick:
- Welche Module existieren (74 Module + 14 Dashboards = 88 Komponenten)
- Wie alles zusammenhängt
- Welche Technologien wir benutzen
- Wie die Ordnerstruktur aussieht

> **Einfach erklärt:** Das Dashboard ist wie ein Werkzeugkasten. Jedes Modul ist ein Werkzeug.
> Der Hub ist die Schublade, in der alle Werkzeuge ordentlich sortiert liegen.

---

## 📎 Querverweise & Dokumentation

| Datei | Beschreibung |
|-------|-------------|
| 📘 **BLAUPAUSE.md** | DU BIST HIER — Gesamtarchitektur |
| 📋 **IMPLEMENTIERUNGSPLAN.md** | Feature-Roadmap aller Module |
| 📖 **PLAYBOOK_ARCHIV.md** | Strategien, Kosten, LLM-Vorlagen |
| 📚 **WISSENSDATENBANK.md** | Technologie-Analyse (10 Techs) |
| 🗂️ **REGISTRY.json** | Master-Index aller features.json |
| 🤖 **LLM_CONTEXT.md** | KI-Arbeitsanweisungen |
| 🎨 **modules/gallery/** | Visuelle Galerie aller Module |
| 📖 **modules/playbook-archiv/** | Interaktives Playbook Dashboard |
| 🗂️ **modules/project-registry/** | Projekt-Baum + Builder |
| 📂 **modules/*/features.json** | Einzelne Feature-Registrierungen |

---

## 🗂️ Ordnerstruktur

```
01_dashboard/
├── hub/                          ← 🏠 Startseite (zeigt alle Module)
│   └── index.html
├── modules/                      ← 📦 Alle Werkzeuge
│   ├── ai_chat/                  ← KI-Chat Interface
│   ├── analyser/                 ← Code/Text Analyser
│   ├── api-tester/               ← REST API Tester (Postman-like)
│   ├── ascii-tool/               ← ASCII Art Generator
│   ├── base64-tools/             ← Base64 Encode/Decode
│   ├── blog-designer/            ← Blog Layout Designer
│   ├── changelog-builder/        ← CHANGELOG.md Generator
│   ├── clipboard/                ← Clipboard Manager
│   ├── code-differ/              ← Code Diff Viewer
│   ├── color-picker/             ← Farbwähler + Paletten
│   ├── converter/                ← Datei-Konverter
│   ├── cron-builder/             ← Cron Expression Builder
│   ├── cs2-config/               ← CS2 Config Generator
│   ├── css-generator/            ← CSS Code Generator
│   ├── devnotes/                 ← Entwickler-Notizen
│   ├── doc-engine/               ← 🕸️ Web-Scraper & Wiki-Builder 
│   ├── domain-control/           ← 🌐 Domain-Management Dashboard 
│   ├── emoji-picker/             ← Emoji Suche + Kopieren
│   ├── favicon-gen/              ← Favicon Generator (Canvas)
│   ├── gallery/                  ← 🎨 Modul-Galerie + CSS Pools
│   ├── hash-generator/           ← Hash/Checksum Generator
│   ├── html_viewer/              ← HTML Live Preview
│   ├── ip-tools/                 ← IP/Subnet/Netzwerk Tools
│   ├── json-formatter/           ← JSON Format/Tree/Compare
│   ├── ki-lernplattform/         ← KI Lernplattform
│   ├── link-generator/           ← Link/URL Generator
│   ├── llm-cost-board/           ← 💰 LLM Token-Kalkulator & Kosten-Dashboard
│   ├── lorem-generator/          ← Platzhalter-Text Generator
│   ├── markdown-gen/             ← Markdown Editor
│   ├── markdown_converter/       ← Markdown → HTML Converter
│   ├── meta-tag-gen/             ← Meta Tag + OG Generator
│   ├── noter/                    ← Notizen-App
│   ├── password-gen/             ← Passwort Generator
│   ├── playbook-archiv/          ← 📖 Strategie-Wiki + Chatbot
│   ├── project-registry/         ← 🗂️ Projekt-Baum + Builder
│   ├── prompt-generator/         ← KI Prompt Generator
│   ├── prompt-viewer/            ← Prompt Bibliothek
│   ├── prompter/                 ← Prompt Engineering Tool
│   ├── qr-generator/             ← QR Code Generator
│   ├── rating-system/            ← Bewertungssystem
│   ├── regex-tester/             ← Regex Tester + Cheatsheet
│   ├── research/                 ← Research Dashboard
│   ├── ruleboard/                ← 📜 Ökosystem-Regeln, Debug, Chat-Assistent
│   ├── seo-toolkit/              ← SEO Analyse Tools
│   ├── snippet-manager/          ← Code Snippet Manager
│   ├── social-dashboard/         ← Social Media Dashboard
│   ├── speech_to_text/           ← Sprache → Text
│   ├── split-browser/            ← Split-Screen Browser
│   ├── sportwetten/              ← Sportwetten Rechner
│   ├── suno-ai/                  ← 🎵 Suno AI Prompt Generator
│   ├── tasker/                   ← Task Manager
│   ├── text_summary/             ← Text Zusammenfassung
│   ├── text_to_speech/           ← Text → Sprache
│   ├── timer-tools/              ← Stoppuhr/Pomodoro/Countdown
│   ├── ttl-visualizer/           ← TTL Visualizer
│   ├── unit-converter/           ← Einheiten-Rechner
│   ├── iceberg/                  ← 🧊 Knowledge Lake Katalog + James Lite
│   ├── system-check/             ← 🔍 Dependency-Checker (🟢/🟡/🔴)
│   ├── loop-dashboard/           ← 🔄 Loop Dashboard & Builder
│   ├── action-builder/           ← 🧩 Einzelne Aktionen definieren + testen
│   ├── agent-builder/            ← 🤖 Workflows + Skills → autonome Agenten
│   ├── app-builder/              ← 📱 Chat-Export Setup für 6 AI-Plattformen
│   ├── botnet-admin/             ← 🤝 BotNet Admin Dashboard (Admin-only)
│   ├── ecosystem-analyzer/       ← 🏗️ Module prüfen, debuggen, bewerten
│   ├── icon-creator/             ← 🎨 AI Icon Generator + Voice
│   ├── image-forge/              ← 🎨 Multi-AI Bildgenerator + PhotoForge Editor
│   ├── settings/                 ← ⚙️ API-Keys, Personalisierung, Verbindungen
│   ├── skill-builder/            ← 🎯 Actions → wiederverwendbare Skills
│   ├── source-registry/          ← 📡 APIs, DBs, Wissensquellen verwalten
│   ├── team-builder/             ← 👥 Agenten zu Teams koordinieren
│   ├── workflow-builder/         ← 🔀 Drag-and-Drop Workflow + n8n
│   ├── notes-manager/            ← 📝 4-Ordner Notiz + Meeting + Voice
│   ├── workflow-viewer/          ← 🔄 Live n8n-Style Monitor (4 Views)
│   ├── wiki-viewer/              ← 📚 MD Wiki Viewer + Mobile (Search, TTS, ZIP)
│   ├── awesome-design-vanilla/   ← ✨ Awesome Open Design Showcase (Pure JS)
│   ├── awesome-design-stitch/    ← 🎨 Awesome Open Design (Stitch Export)
├── shared/                       ← 🔧 Geteilte Skripte
│   ├── dkz-theme.css             ← 🎨 Design System v2 (CSS, Responsive, A11y, Print)
│   ├── dkz-debug.js              ← XSS-Schutz (esc), Fehler-Overlay
│   ├── dkz-guide.js              ← ❓ Info-Popups, Tours, Visual Hints, FAB, XMAN Admin
│   ├── dkz-copilot.js            ← 🤖 LLM Chat, .prefix Befehle, Modul-Kontext
│   ├── dkz-shortcuts.js          ← ⌨️ Standard-Tastenkürzel (Esc, /, ?, Ctrl+S/E/K/H/T/U)
│   ├── dkz-export.js             ← 📤 Standard-Export (JSON, MD, CSV, TXT, PNG, Clipboard)
│   ├── dkz-crosslinks.js         ← 🔗 Smart Cross-Module Navigation (59 Modul-Map)
│   ├── dkz-a11y.js               ← ♿ Accessibility (Skip-Link, ARIA, Focus-Trap, SR)
│   ├── dkz-test.js               ← 🧪 Inline Tests (Ctrl+T, 10 Auto-Checks)
│   ├── dkz-puter.js              ← ☁️ Puter Cloud (Auth, KV, Files, AI, Deploy)
│   ├── dkz-llm-registry.js       ← 8 Provider, 60+ Modelle, Cost-Tracking
│   ├── dkz-eventlog.js           ← Event-Bus, Logging
│   ├── dkz-bundle.min.js         ← 📦 Optimiertes Bundle (42.5 KB)
│   ├── manifest.json             ← 📱 PWA Manifest
│   ├── sw.js                     ← ✈️ Service Worker (Offline-Cache)
│   ├── build-bundle.js           ← 🔨 Bundle Build Script
│   └── generate-docs.js          ← 📚 Docs Generator (README pro Modul)
├── BLAUPAUSE.md                  ← 📘 DU BIST HIER
├── REGISTRY.json                 ← 🗂️ Master-Index (85 Einträge)
└── features.json                 ← 📦 Root features.json
```

---

## ☁️ Puter Cloud Integration

> **SDK**: `https://js.puter.com/v2/` · **Shared Script**: `dkz-puter.js`
> **Cloud**: Puter eigene Server (Open Source) · **Kein AWS/GCP/Azure nötig**

### Maschinenanweisungen (für LLMs/Agenten)

```
═══ PUTER INTEGRATION RULES ═══
1. SDK wird LAZY geladen — nur bei Bedarf via DkzPuter._loadSDK()
2. Alle Cloud-Ops brauchen Login: DkzPuter.signIn() zuerst
3. KV-Keys bekommen Prefix 'dkz:' → Namespace-Isolation
4. Cloud-Ops sind OPTIONAL — Fallback auf localStorage immer
5. AI-Calls über DkzPuter.aiChat() → nicht direkt puter.ai nutzen
6. Deploy nur über DkzPuter.deploy() → erstellt *.puter.site
7. Cloud-Badge (☁️) wird auto-injected in jeden Header
8. Shortcut: Ctrl+U → Cloud Sync starten
```

### API-Übersicht

| Funktion | API | Beschreibung |
|----------|-----|-------------|
| `DkzPuter.signIn()` | Auth | User anmelden (Puter Account) |
| `DkzPuter.signOut()` | Auth | Abmelden |
| `DkzPuter.kvSet(key, val)` | KV | Cloud-localStorage setzen |
| `DkzPuter.kvGet(key)` | KV | Cloud-localStorage lesen |
| `DkzPuter.syncToCloud()` | Sync | localStorage → Puter KV |
| `DkzPuter.syncFromCloud()` | Sync | Puter KV → localStorage |
| `DkzPuter.saveFile(path, content)` | Files | Datei in /dkz/ speichern |
| `DkzPuter.readFile(path)` | Files | Datei aus /dkz/ lesen |
| `DkzPuter.aiChat(prompt)` | AI | GPT-4o/Claude Chat |
| `DkzPuter.deploy(subdomain)` | Hosting | Static Site → *.puter.site |

### Grenzen

| Aspekt | Grenze |
|--------|--------|
| Storage | Free Tier begrenzt |
| Backend | Nur Frontend — kein Node.js in der Cloud |
| Datenbank | Nur KV-Paare + Dateien — kein SQL/MongoDB |
| AI | Puter-Account nötig, Token-Limits |
| Offline | Nicht verfügbar — Fallback auf localStorage |

---

## 🎨 Design System (DkZ Theme)

Jedes Modul sieht gleich aus, weil wir ein **einheitliches Design System** benutzen:

### Farben
| Name | Hex | Wofür? |
|------|-----|--------|
| Background | `#0e0e10` | Dunkler Hintergrund |
| Card | `#1a1a1c` | Karten-Hintergrund |
| Card2 | `#222226` | Sekundäre Karten |
| Border | `#333338` | Ränder/Linien |
| Text | `#f6f6f7` | Haupttext (weiß) |
| Muted | `#a1a1aa` | Gedämpfter Text |
| Accent (Rot) | `#fa1e4e` | Hauptakzent, Buttons |
| Green | `#00ff88` | Erfolg, aktive Elemente |
| Blue | `#55ACEE` | Info, Links |
| Yellow | `#FFB800` | Warnungen, Highlights |

### Schriften
| Font | Typ | Verwendung |
|------|-----|------------|
| `Inter` | Sans-serif | UI-Text, Buttons, Labels |
| `JetBrains Mono` | Monospace | Code, Daten, Zahlen |

### Design-Elemente
| Element | Beschreibung |
|---------|-------------|
| **Glassmorphism** | `backdrop-filter: blur(24px)` + transparenter Hintergrund |
| **Background Blobs** | Farbige Kreise mit `blur(120px)` für Atmosphäre |
| **Cards** | Abgerundete Ecken (`14px`), Rahmen, Schatten |
| **Buttons** | Akzentfarbe, `10px` Padding, Hover-Glow |
| **Toast** | Grüne Benachrichtigung unten rechts |

### Bausteine jedes Moduls

```
┌─────────────────────────────────────────┐
│  ← Hub    🔧 Modul-Name         v0.01  │  ← Header (sticky, Glass)
├─────────────────────────────────────────┤
│  [Tab 1] [Tab 2] [Tab 3]               │  ← Tabs (optional)
├─────────────────────────────────────────┤
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  📦 Card                        │   │  ← Funktionsbereich
│   │     Inhalt, Eingaben, Sliders   │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  📊 Ergebnis / Output           │   │
│   └─────────────────────────────────┘   │
│                                         │
│   [🔄 Action] [📋 Copy] [💾 Save]      │  ← Buttons
│                                         │
└─────────────────────────────────────────┘
         ┌──────────────────┐
         │  ✅ Toast-Meldung │              ← Toast (2.5s)
         └──────────────────┘
```

---

## 🔌 Master Pro Builder — Technologie-Stack

### Frontend (DkZ CurrentVanilla)
| Schicht | Technologie | Warum? |
|---------|-------------|--------|
| **HTML5** | Semantisches Layout, Canvas Isolation (Iframe/Shadow DOM) | Standard |
| **Vanilla CSS** | CSS Variables (Live Theming), Native Grid & Flexbox | 100% Vanilla (Kein Tailwind/Bootstrap) |
| **Vanilla JS (ES6+)** | Native Drag & Drop API, Event Delegation, Proxy State Observer | Kein Framework nötig |
| **Fonts** | Google Fonts (CDN) — Inter + JetBrains Mono | Einheitlich |
| **Speicher** | localStorage + JSON AST (Single Source of Truth) | Offline |

### Hybrid Backend
| Schicht | Technologie | Zweck |
|---------|-------------|-------|
| **Node.js** | WebSockets (Echtzeit-Kollaboration), JSON I/O | Schnell |
| **Python (.py)** | Export Compiler (JSON→HTML/CSS), Asset-Optimierung, Berechnungen | R23 Fallback |
| **Go** | Apache Iceberg Server, High-Performance APIs | R23 Primary |
| **PHP** | REST API (CRUD), MySQL/PostgreSQL, Auth & Sessions | Legacy Support |

### Datenbank-Hierarchie (Priorisiert)
| Prio | Technologie | Einsatz |
|------|------------|--------|
| 1️⃣ | **JSON** | Bevorzugt für alles. Single Source of Truth |
| 2️⃣ | **Google Sheets** | Cloud-Daten, Zusammenarbeit |
| 3️⃣ | **DuckDB** | Analytik, erst hier einpflegen |
| 4️⃣ | **Apache Iceberg** (Go/Python) | Knowledge Lake, Katalog |
| 5️⃣ | **pgvector** (PostgreSQL) | Vektoren neben relationalen Daten |
| 6️⃣ | **MongoDB Atlas** Vector Search | Wenn NoSQL gebraucht wird |
| 7️⃣ | **ChromaDB** | Native DB, LangChain, lokale Prototypen |

### Tools & CI/CD
- **GitHub Copilot** + **CodeRabbit** — immer aktiv
- **GitHub Login** bei Solo-Nutzung, sonst Ökosystem-Anschluss
- **R23:** Jede `.go` hat eine `.py` Fallback → Go=🟢 Python=🟡

### Keine Framework-Dependencies!
```
✅ Kein npm install (Frontend)
✅ Kein Build-Prozess
✅ Kein Framework
✅ Einfach index.html öffnen → fertig
```

---

## 🔗 Wie Module miteinander verbunden sind

```
                    ┌──────────┐
                    │   HUB    │  ← Startseite, findet alle Module
                    │ index.html│
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
    │ Modul A │    │ Modul B │    │ Modul C │
    │  /modules/   │  /modules/   │  /modules/
    │  name/   │   │  name/   │   │  name/   │
    └─────────┘   └─────────┘   └─────────┘
```

- **Hub** scannt automatisch den `modules/` Ordner
- Jedes Modul hat einen `← Hub` Button zurück zur Startseite
- Module sind **unabhängig** — jedes funktioniert alleine
- Datenaustausch über `localStorage` (optional)

---

## 📊 Module nach Kategorie

### 🛠️ Developer Tools (15)
`json-formatter` · `regex-tester` · `css-generator` · `base64-tools` · `cron-builder` · `hash-generator` · `api-tester` · `snippet-manager` · `code-differ` · `html_viewer` · `markdown_converter` · `meta-tag-gen` · `ascii-tool` · `converter` · `lorem-generator`

### 🎨 Design & UI (7)
`color-picker` · `favicon-gen` · `blog-designer` · `emoji-picker` · `seo-toolkit` · `image-forge` · `dkz-design-studio`

### 📝 Content & Text (8)
`markdown-gen` · `noter` · `devnotes` · `changelog-builder` · `text_summary` · `text_to_speech` · `speech_to_text` · `link-generator`

### 🤖 KI & Prompts (5)
`ai_chat` · `prompt-generator` · `prompt-viewer` · `prompter` · `ki-lernplattform`

### 📊 Analyse & Daten (7)
`analyser` · `ip-tools` · `ttl-visualizer` · `research` · `doc-engine` · `domain-control` · `llm-cost-board`

### ⚡ Produktivität (6)
`timer-tools` · `tasker` · `clipboard` · `password-gen` · `unit-converter` · `split-browser`

### 🎯 Spezial (6)
`qr-generator` · `rating-system` · `social-dashboard` · `sportwetten` · `cs2-config` · `suno-ai`

### 🗂️ Meta & Archiv (3)
`gallery` · `playbook-archiv` · `project-registry`

### 🧊 Backend & System (7)
`iceberg` · `system-check` · `loop-dashboard` · `botnet-admin` · `ecosystem-analyzer` · `settings` · `source-registry`

### 🔀 Builder Suite (5)
`action-builder` · `agent-builder` · `app-builder` · `skill-builder` · `workflow-builder`

### 🤖 Agent & Team (3)
`team-builder` · `icon-creator` · `swarm-mission-control`

---

## 🔄 Datenfluss

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Benutzer │────▶│  Modul   │────▶│ localStorage│
│  (Input)  │     │  (Logik) │     │  (Speicher)  │
└──────────┘     └────┬─────┘     └──────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  Output/Export │
              │  (Copy/Down)  │
              └───────────────┘
```

**Jedes Modul folgt diesem Muster:**
1. 👤 Benutzer gibt etwas ein
2. ⚙️ Modul verarbeitet es sofort (kein Server nötig)
3. 💾 Ergebnis wird angezeigt + optional gespeichert
4. 📋 Copy/Download Buttons für Export

---

## 🎯 Qualitätsstandards

Jedes Modul MUSS haben:
- [ ] DkZ Design System (Farben, Fonts, Cards)
- [ ] Responsive Design (Desktop + Tablet)
- [ ] `← Hub` Button zurück zur Startseite
- [ ] Version `v0.01` im Header
- [ ] Toast-Benachrichtigungen bei Aktionen
- [ ] Glassmorphism Header (sticky)
- [ ] Background Blobs für Atmosphäre
- [ ] `📋 Kopieren` Button wo sinnvoll
- [ ] localStorage für Daten-Persistenz wo sinnvoll
- [ ] Funktioniert offline (außer API-Module)

---

## 📝 Konventionen

### Dateinamen
- Ordner: `kebab-case` (z.B. `json-formatter`)
- Hauptdatei: immer `index.html`
- Alles in einer Datei (HTML + CSS + JS)

### CSS-Variablen
Immer über `:root` definiert, gleiche Namen in allen Modulen.

### JavaScript
- Keine globalen Variablen (außer bewusst)
- `localStorage` Keys starten mit `dkz-` (z.B. `dkz-snippets`)
- Escape-Funktion `esc()` für HTML-Output
- `showToast()` für Benachrichtigungen

### Shared Scripts
- `dkz-theme.css` — Design System v2, CSS Vars, Blobs, Glassmorphism (PFLICHT)
- `dkz-debug.js` — XSS-Schutz, Fehler-Overlay (PFLICHT in jedem Modul)
- `dkz-guide.js` — Info-Popups, Tours, Visual Hints, XMAN Admin, FAB (PFLICHT)
- `dkz-copilot.js` — LLM Chat, .prefix Befehle, Modul-Kontext (PFLICHT)
- `dkz-llm-registry.js` — 8 Provider, Per-Module Tokens, Cost-Tracking
- `dkz-eventlog.js` — Event-Bus, Activity Logging
- `dkz-prompt-hub.js` — Unified Prompt Storage, Source Tags, Cross-Module Nav (PFLICHT für Prompt/Builder Module)

### Prompt-Architektur (dkz-prompt-hub.js)

**Prinzip:** EINE Datenquelle (`dkz-prompts`), 2 Rolling Backups (`dkz-prompts-bak1`, `dkz-prompts-bak2`)

**Datenfluss:**
```
prompt-generator ──┐
prompt-viewer    ──┤
prompter (400+)  ──┼──→ dkz-prompts (localStorage) ──→ bak1 ──→ bak2
ai-chat          ──┤
loop-dashboard   ──┘
```

**Source Tags:**
| Tag      | Modul             | Beschreibung                    |
|----------|-------------------|---------------------------------|
| `gen`    | Prompt Generator  | Timeline-basierter Builder      |
| `arc`    | Prompt Archiv     | Viewer/Import/Export            |
| `eng`    | Prompter          | Engineering Tool (400+ Vorlagen)|
| `chat`   | AI Chat           | Gespeicherte Gespräche          |
| `loop`   | Loop Dashboard    | Workflow-generierte Prompts     |
| `import` | CSV/JSON Import   | Externe Daten                   |

**Migration:** Beim ersten Laden werden Prompts aus Legacy-Keys automatisch importiert:
`dkz-promptgen-saved`, `dkz-prompt-archive`, `dkz-prompt-viewer`, `dkz-prompter-saved`
→ Alte Keys bleiben erhalten (R100 No Deletion)

**Cross-Module Navigation:**
Injiziert automatisch eine Nav-Bar am unteren Rand mit 3 Gruppen:
- **Prompts:** Generator, Archiv, Prompter, Loop Dashboard, AI Chat
- **Builder:** Action → Skill → Agent → Workflow → Team → TEN0R → BLACK8
- **System:** ICEberg, Kostenrechner

**Builder Chain (localStorage Transfer):**
```
Action-Builder → dkz-action-to-skill → Skill-Builder
Skill-Builder  → dkz-skill-to-agent  → Agent-Builder
Skill-Builder  → dkz-skill-to-workflow → Workflow-Builder
Agent-Builder  → dkz-agent-to-team    → Team-Builder
Prompt-Gen     → dkz-loop-import-prompt → Loop-Dashboard
```

**Eingebunden in 14 Module:**
`prompt-generator`, `prompt-viewer`, `prompter`, `loop-dashboard`, `ai_chat`,
`action-builder`, `skill-builder`, `agent-builder`, `workflow-builder`,
`team-builder`, `tenor-builder`, `black8-builder`, `iceberg`, `llm-cost-board`

### Navigation (dkz-navbar.js)

**Hamburger-Menü:** Fixiertes ☰ oben links → animiertes Slide-In Panel (300px, Glassmorphism)
**5 Gruppen:** Wissen & Daten · Prompts & Archive · Builder Chain · Design & Content · System & Tools
**Eingebunden in:** Alle 81+ Module + Landing Pages + Hub + Mainboard (86 Dateien)

**Einbindung:**
```html
<script src="../../shared/dkz-navbar.js"></script>  <!-- Module -->
<script src="../shared/dkz-navbar.js"></script>      <!-- Landing/Hub/Mainboard -->
```

### Notiz-System (integriert in dkz-navbar.js)

**API:**
| Methode | Beschreibung |
|:--------|:-------------|
| `DkzNotes.add(id, text, author)` | Notiz hinzufügen (author: 'user'/'system') |
| `DkzNotes.getAll(id)` | Alle Notizen eines Elements |
| `DkzNotes.getCount(id)` | Anzahl der Notizen |
| `DkzNotes.remove(id, noteId)` | Einzelne Notiz entfernen |

**Regeln:**
- Mehrere Notizen pro Element möglich
- LLMs/System nutzen `author: 'system'` → rot markiert
- User-Notizen → blau markiert
- Gespeichert in `localStorage: dkz-notes`

### Review-Status Management (integriert in dkz-navbar.js)

**API:**
| Methode | Beschreibung |
|:--------|:-------------|
| `DkzReview.setStatus(id, status)` | Status setzen: active/review/draft/archived |
| `DkzReview.getStatus(id)` | Aktuellen Status abfragen |
| `DkzReview.getNeedsReview()` | Liste aller Module im Review-Status |

**Status-Werte:**
- `active` — Vollständig integriert und getestet (grün)
- `review` — Muss überarbeitet werden (gelbes Badge)
- `draft` — In Entwicklung
- `archived` — Nicht mehr aktiv

### §20 — Modul-Überarbeitungsplan (Pflicht)

Jedes Modul MUSS folgende Checkliste durchlaufen bevor es als `active` markiert wird:

1. **Shared Scripts:** `dkz-theme.css`, `dkz-navbar.js`, `dkz-prompt-hub.js` eingebunden
2. **Encoding:** Keine U+FFFD oder `?` statt Emojis
3. **Navigation:** Hamburger-Menü funktioniert, alle Links erreichbar
4. **Verlinkung:** Alle href-Links zeigen auf existierende Dateien
5. **Notizen prüfen:** System-Notizen abarbeiten, dann entfernen
6. **LLM-Doku:** Inline-Kommentare für LLM-Verständnis vorhanden
7. **Git:** Änderungen committed mit aussagekräftiger Message
8. **BLAUPAUSE:** Modul in Shared Scripts / Modulregister dokumentiert
9. **Test:** Modul öffnet korrekt, keine Console-Errors

### Git (wenn aktiviert)
- Commit nach JEDER Änderung
- Format: `feat: Modul-Name — was geändert`
- Deutsche Commit-Messages erlaubt

### R23 — Go→Python Fallback
- Jede `.go` Datei MUSS eine `.py` Fallback haben
- Go = 🟢 GRÜN (schnell, nativ)
- Python = 🟡 GELB (funktional, etwas langsamer)
- Offline = 🔴 ROT
- `start.bat` / `start.sh` erkennt automatisch

---

## 🌐 DkZ™ Hub — Chrome Extension (§30)

> **Pfad:** `01_PROJECTS/chrome-extensions/dkz-hub/`
> **Tech:** React 18 + Tailwind 3 + Supabase + DuckDB-WASM + Vite
> **Manifest:** V3 (Chrome + Vivaldi kompatibel)
> **Workflow:** `/chrome-extension` in VS Code

### Architektur

```
chrome-extensions/dkz-hub/
├── manifest.json              ← Chrome Manifest V3
├── package.json               ← React, Tailwind, Vite
├── vite.config.js             ← Multi-Entry Build
├── tailwind.config.js         ← DkZ™ Farben + Fonts
├── src/
│   ├── popup/                 ← Popup UI (React)
│   │   ├── index.html
│   │   ├── main.jsx           ← React Entry
│   │   └── App.jsx            ← 8-Tab Router
│   ├── options/               ← Options Page (full Settings)
│   ├── modules/               ← 8 Feature-Module
│   │   ├── HubHome.jsx        ← 🏠 Stats, Status, Quick Actions
│   │   ├── TabManager.jsx     ← 🔖 Tabs, Sessions, Gruppierung
│   │   ├── ClipboardManager.jsx ← 📋 History, Favoriten, Suche
│   │   ├── ColorPicker.jsx    ← 🎨 EyeDropper, HEX/RGB/HSL, WCAG
│   │   ├── WebScraper.jsx     ← 🔍 CSS/Tables/Links, Rezepte
│   │   ├── AiToolkit.jsx      ← 🤖 344 Templates + Dashboard
│   │   ├── Copilot.jsx        ← 🧠 Chat, 4 AI Provider
│   │   └── Settings.jsx       ← ⚙️ API Keys, GAS, Backup
│   ├── components/            ← Shared UI Components
│   │   ├── TabBar.jsx         ← Bottom Nav
│   │   ├── Toast.jsx          ← Notifications
│   │   ├── SearchBar.jsx      ← Suchfeld
│   │   ├── ExportButton.jsx   ← .md/.json Export
│   │   └── TtsButton.jsx      ← 🔊 Browser Text-to-Speech
│   ├── lib/                   ← Utility Libraries
│   │   ├── utils.js           ← esc(), debounce, colors
│   │   ├── storage.js         ← Chrome Storage Wrapper
│   │   ├── export.js          ← .md/.json/.csv Export
│   │   ├── tts.js             ← 🔊 SpeechSynthesis API
│   │   └── google-apps-script.js ← GAS API Client
│   ├── content/               ← Content Scripts
│   │   ├── prompt-injector.js ← ChatGPT/Claude/Gemini Inject
│   │   ├── color-picker.js    ← EyeDropper API
│   │   └── web-scraper.js     ← DOM Scraping
│   └── background.js         ← Service Worker
├── icons/                     ← Extension Icons
└── dist/                      ← Build Output → In Chrome laden
```

### Module (8 Tabs)

| Tab | Modul | Kernfeatures |
|:----|:------|:-------------|
| 🏠 | Hub Home | Stats, GAS Status, Quick Actions |
| 🔖 | Tab Manager | Suche, Domain-Gruppierung, Session Save/Restore |
| 📋 | Clipboard | Copy-History (100), Favoriten, Volltextsuche |
| 🎨 | Color Picker | EyeDropper, HEX/RGB/HSL, WCAG Kontrast-Check |
| 🔍 | Web Scraper | 3 Modi (CSS/Tables/Links), Rezepte, Export |
| 🤖 | AI Toolkit | 344 Templates (6 Kategorien), Inject in KI-Apps |
| 🧠 | Copilot | Chat mit OpenAI/Claude/Gemini/Groq, History |
| ⚙️ | Settings | 4 API Keys, GAS Config, Storage Stats, Backup |

### Besonderheiten

- **Ausnahme R0:** Dieses Projekt nutzt React + Tailwind (kein Vanilla) — explizit genehmigt
- **Browser TTS:** 🔊 Vorlese-Button auf allen Textblöcken + Copilot-Chat
- **Export:** .md + .json für alle Daten
- **Google Apps Script:** Cloud-Sync über API Key
- **Content Scripts:** Prompt-Injection in ChatGPT, Claude, Gemini

### Installation

```bash
# 1. Build
cd C:\DEVKiTZ\01_PROJECTS\chrome-extensions\dkz-hub
cmd /c "npm install && npx vite build"

# 2. In Chrome/Vivaldi laden
# chrome://extensions/ → Entwicklermodus → Entpackt laden → dist/
```

---

## Cloud & Panels (v2.1 — 2026-03-24)

### Neue Module (MOD-081..086)

| ID | Modul | Pfad | Features |
|:---|:------|:-----|:---------|
| MOD-081 | 🎧 Whisper TTS | `modules/whisper-tts/` | Browser TTS/STT, Stimmen, Speed, Verlauf |
| MOD-082 | ☁️ Cloud Control | `modules/cloud-control/` | GDrive, Cloudflare, Oracle, Users |
| MOD-083 | 🏰 CL0UDiA™ | `modules/claudia-cloud/` | Nextcloud EU, DSGVO, WebDAV, E2EE |
| MOD-084 | 🤖 NanoBot Center | `modules/nanobot-center/` | 6 Agenten, Chat, Tasks, MCP |
| MOD-085 | 🐰 CodeRabbit | `modules/coderabbit-panel/` | Reviews, OpenSpec, Copilot, Rules |
| MOD-086 | 📱 QR Launcher | `modules/qr-launcher/` | 40+ Module QR, Mobile PWA |
| MOD-087 | 🖥️ OBS FX Overlay | `modules/obs-fx-overlay/` | Particle Engine & Neon Overlay |

### Shared Script: dkz-tts.js

- 🎧 Kopfhörer-Button (unten links, jedes Modul)
- Web Speech API (offline-fähig)
- Stimmen-Auswahl (DE/EN/FR/ES)
- Panel per Shift+Click, Alt+T Shortcut
- Console: `/tts`, `/tts:stop`, `/tts:voices`

### Vivaldi Side Panel: dkz-panels

```
01_PROJECTS/chrome-extensions/dkz-panels/
├── manifest.json       ← MV3, sidePanel API
├── background.js       ← Service Worker
└── sidepanel.html      ← Panel-Selector (10 Module)
```

---

## 🧬 §31 — Interface Layer (L4)

> **Status:** Konzept · **Quelle:** DS7 Design Pack Analyse · **Datum:** 2026-05-14
> **Prinzip:** Browser-Use, Voice und Mobile sind **First-Class Architektur-Layer** — keine bloßen Tool-Aufrufe.

### Warum?

Bisher sind Browser-Automation (via MCP Subagent), Voice (Wispe™) und Mobile-Zugriff isolierte Features ohne formalisierte Architektur-Anbindung. Der Interface Layer macht sie zu einem **dedizierten Layer**, der von allen Agenten genutzt werden kann.

### Architektur

```
┌──────────────────────────────────────────────────────────┐
│  L4 — INTERFACE LAYER                                     │
├────────────────┬───────────────┬──────────────────────────┤
│  🌐 Browser-Use │  🎙️ Voice     │  📱 Mobile Bridge         │
│  MCP Subagent   │  Wispe™ / TTS │  QR → PWA → WebSocket    │
│  Headless+UI    │  xAI Realtime │  Agent-Task Trigger       │
├────────────────┴───────────────┴──────────────────────────┤
│  Schnittstelle: dkz-interface.js (geplant)                │
│  Events: interface:browser, interface:voice, interface:mobile│
│  Logging: → L0 REDNOTE™ via dkz-eventlog.js              │
└──────────────────────────────────────────────────────────┘
```

### Komponenten

| Kanal | Technologie | Status | Modul |
|:------|:------------|:-------|:------|
| **Browser-Use** | MCP Browser Subagent, Headless Chrome | ⚠️ Via Tool | `split-browser` |
| **Voice Stream** | Wispe™ Framework, Web Speech API, xAI Realtime | ⚠️ In Entwicklung | `whisper-tts`, `speech_to_text` |
| **Mobile Bridge** | QR → PWA → WebSocket → Agent-Task | 📋 Geplant | `qr-launcher` (Upgrade) |
| **ESC Console** | Terminal-Overlay, Layer-Steuerung per Befehl | ✅ Aktiv | `dkz-console.js` |

### Mobile Bridge (MOD-086 Upgrade)

```
Aktuell:                          Ziel (Mobile Bridge):
┌─────────────┐                   ┌─────────────┐
│ QR-Code     │                   │ QR-Code     │
│ → URL öffnen│                   │ → PWA öffnen│
│ → Modul     │                   │ → WebSocket │
│   anzeigen  │                   │ → Agent-Task│
└─────────────┘                   │ → Trigger   │
                                  │ → Live-Feed │
                                  └─────────────┘
```

**Geplante Features:**
1. WebSocket-Server in ONTHERUN™ MCP → `/ws/mobile-bridge`
2. PWA auf Handy empfängt Agent-Status (Live-Feed)
3. Handy kann Tasks triggern (Voice → Agent, Quick-Actions)
4. QR-Code enthält WebSocket-Token für sichere Verbindung

### Regeln

```
═══ INTERFACE LAYER RULES ═══
1. Jeder Interface-Kanal loggt via dkz-eventlog.js → REDNOTE™
2. Browser-Use NUR über MCP-Tool — kein direktes puppeteer import
3. Voice-Streams über Wispe™ Framework — kein direktes WebRTC
4. Mobile Bridge NUR über WebSocket-Token — keine offenen Ports
5. ESC Console steuert ALLE Interface-Kanäle per Befehl
6. Fallback: Jeder Kanal funktioniert auch ohne die anderen
```

---

## 🗺️ §32 — Layer-Mapping (BMAD → Architektur-Ebenen)

> **Status:** Referenz · **Quelle:** DS7 Design Pack Analyse · **Datum:** 2026-05-14
> **Prinzip:** Jeder BMAD™-Agent operiert auf einer oder mehreren Architektur-Ebenen.

### 7-Ebenen Architektur-Modell (DkZ™)

```
┌────────────────────────────────────────────────────────┐
│                   DEVKiTZ™ ARCHITEKTUR                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─ INTERN ─────────────────────────────────────────┐  │
│  │  L00  Admin & System Instructions → James™       │  │
│  │  L0   Logs & REDNOTE™ → dkz-eventlog.js          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ OPERATIV ───────────────────────────────────────┐  │
│  │  L1   Orchestrator → James™ + Ralph-Loop™        │  │
│  │  L2   Routine Layer → Developer™ + Tester™       │  │
│  │  L3   Project Layer → PM™ + Architekt™           │  │
│  │  L4   Interface Layer → §31 (Browser/Voice/Mobile)│  │
│  │  L5   Console Layer → ESC-Konsole (dkz-console.js)│  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ EXTERN ─────────────────────────────────────────┐  │
│  │  Dashboard (112 Module) · ONTHERUN™ MCP          │  │
│  │  DEEPKEEP™ Archiv · Apache Iceberg · GitHub      │  │
│  │  Wiki Hub (4.121) · Puter Cloud · Chrome Ext.    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Agent → Layer Zuordnung

| Agent | Primär-Layer | Sekundär-Layer | Aufgabe auf Layer |
|:------|:-------------|:---------------|:------------------|
| 🎯 **James™** | L00, L1 | L0 | Guardian, Orchestrierung, Context Pipeline |
| 📋 **DkZ PM™** | L3 | L1 | User Stories, spec.md, Projekt-Scoping |
| 🏗️ **DkZ Architekt™** | L3 | L1, L4 | plan.md, Tech-Stack, Interface Design |
| 👨‍💻 **DkZ Developer™** | L2 | L4, L5 | Code schreiben, Ralph-Loop Execute |
| 🔍 **DkZ Reviewer™** | L2 | L3 | CodeRabbit, Qualitätsprüfung |
| 🧪 **DkZ Tester™** | L2 | L4 | Tests, Validierung, Browser-Test |
| 📚 **DkZ Dokumentar™** | L0 | L3 | README, Wiki, REDNOTE, Learnings |

### Ralph-Loop™ auf Layer-Ebene

| Phase | Layer | Beschreibung |
|:------|:------|:-------------|
| 1. LESEN | L00 → L0 | James™ lädt prd.json + Context aus REDNOTE |
| 2. SPAWN | L1 | Orchestrator erstellt frischen Kontext (kein Drift!) |
| 3. EXECUTE | L2 + L4 | Developer™ schreibt Code, nutzt Interface Layer |
| 4. VERIFY | L2 | Reviewer™ + Tester™ prüfen auf L2 |
| 5. COMMIT | L0 | Logs + Git Commit → REDNOTE™ |
| 6. LOOP | L1 | Orchestrator entscheidet: nächster Task oder Stopp |

### Vorteile des Layer-Mappings

1. **Klarheit:** Jeder weiß, welcher Agent auf welcher Ebene arbeitet
2. **Debugging:** Fehler auf L4? → Architekt™ + Tester™ zuständig
3. **Skalierung:** Neue Agenten können auf bestehende Layer gemappt werden
4. **Dokumentation:** BLAUPAUSE.md zeigt die volle Architektur auf einen Blick

---

*Erstellt von DkZ Framework · 2026*

