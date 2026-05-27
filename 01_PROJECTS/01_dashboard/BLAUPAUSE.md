# DkZ Dashboard — BLAUPAUSE (Blueprint)

> **Version:** v2.00 | **Stand:** 2026-05-22 | **Module:** 89+ | **Status:** Aktiv
> Fuer Basis-Kontext: Lies zuerst `LLM_BOOTSTRAP.md`
> Fuer Regeln: Siehe `REGELWERK.md`

---

## Was ist das hier?

Architektur-Uebersicht des DkZ Dashboards:
- Welche Module existieren (89+ Module + 14 Dashboards)
- Design System und Konventionen
- Ordnerstruktur und Datenfluss

---

## Ordnerstruktur

```
01_dashboard/
├── hub/                          ← Startseite (zeigt alle Module)
│   └── index.html
├── modules/                      ← Alle Werkzeuge (89+)
├── shared/                       ← Geteilte Scripts (34+)
├── BLAUPAUSE.md                  ← DU BIST HIER
├── REGISTRY.json                 ← Master-Index
└── features.json                 ← Root features.json
```

---

## Design System (DkZ Theme)

### Farben

| Name | Hex | Zweck |
|:-----|:----|:------|
| Background | `#0e0e10` | Dunkler Hintergrund |
| Card | `#1a1a1c` | Karten-Hintergrund |
| Card2 | `#222226` | Sekundaere Karten |
| Border | `#333338` | Raender/Linien |
| Text | `#f6f6f7` | Haupttext |
| Muted | `#a1a1aa` | Gedaempfter Text |
| Accent | `#fa1e4e` | Hauptakzent, Buttons |
| Green | `#00ff88` | Erfolg |
| Blue | `#55ACEE` | Info, Links |
| Yellow | `#FFB800` | Warnungen |

### Schriften
- `Inter` — UI-Text, Buttons, Labels
- `JetBrains Mono` — Code, Daten, Zahlen

### Design-Elemente
- **Glassmorphism:** `backdrop-filter: blur(24px)` + transparenter Hintergrund
- **Background Blobs:** Farbige Kreise mit `blur(120px)`, `pointer-events: none`
- **Cards:** Abgerundete Ecken (`14px`), Rahmen, Schatten
- **Buttons:** Akzentfarbe, Hover-Glow
- **Toast:** Gruene Benachrichtigung unten rechts

---

## Module nach Kategorie

### Developer Tools (15)
`json-formatter` · `regex-tester` · `css-generator` · `base64-tools` · `cron-builder` · `hash-generator` · `api-tester` · `snippet-manager` · `code-differ` · `html_viewer` · `markdown_converter` · `meta-tag-gen` · `ascii-tool` · `converter` · `lorem-generator`

### Design & UI (7)
`color-picker` · `favicon-gen` · `blog-designer` · `emoji-picker` · `seo-toolkit` · `image-forge` · `dkz-design-studio`

### Content & Text (8)
`markdown-gen` · `noter` · `devnotes` · `changelog-builder` · `text_summary` · `text_to_speech` · `speech_to_text` · `link-generator`

### KI & Prompts (5)
`ai_chat` · `prompt-generator` · `prompt-viewer` · `prompter` · `ki-lernplattform`

### Analyse & Daten (7)
`analyser` · `ip-tools` · `ttl-visualizer` · `research` · `doc-engine` · `domain-control` · `llm-cost-board`

### Produktivitaet (6)
`timer-tools` · `tasker` · `clipboard` · `password-gen` · `unit-converter` · `split-browser`

### Spezial (6)
`qr-generator` · `rating-system` · `social-dashboard` · `sportwetten` · `cs2-config` · `suno-ai`

### Meta & Archiv (3)
`gallery` · `playbook-archiv` · `project-registry`

### Backend & System (7)
`iceberg` · `system-check` · `loop-dashboard` · `botnet-admin` · `ecosystem-analyzer` · `settings` · `source-registry`

### Builder Suite (5)
`action-builder` · `agent-builder` · `app-builder` · `skill-builder` · `workflow-builder`

### Agent & Team (3)
`team-builder` · `icon-creator` · `swarm-mission-control`

### Neue Module (MOD-081+)
`whisper-tts` · `cloud-control` · `claudia-cloud` · `nanobot-center` · `coderabbit-panel` · `qr-launcher` · `obs-fx-overlay` · `awesome-design-vanilla` · `awesome-design-stitch` · `notes-manager` · `workflow-viewer` · `wiki-viewer`

---

## Shared Scripts (PFLICHT)

| Script | Zweck |
|:-------|:------|
| `dkz-theme.css` | Design System v2, CSS Vars, Responsive |
| `dkz-debug.js` | XSS-Schutz (esc()), Fehler-Overlay (**PFLICHT**) |
| `dkz-navbar.js` | Hamburger-Menu, Navigation, Notes, Review |
| `dkz-guide.js` | Info-Popups, Tours, Visual Hints |
| `dkz-copilot.js` | LLM Chat, Modul-Kontext |
| `dkz-prompt-hub.js` | Unified Prompt Storage, Source Tags |
| `dkz-shortcuts.js` | Standard-Tastenkuerzel |
| `dkz-export.js` | Export (JSON, MD, CSV, TXT, PNG) |
| `dkz-crosslinks.js` | Cross-Module Navigation |
| `dkz-a11y.js` | Accessibility |
| `dkz-test.js` | Inline Tests (Ctrl+T) |
| `dkz-llm-registry.js` | 8 Provider, 60+ Modelle |
| `dkz-eventlog.js` | Event-Bus, Logging |
| `dkz-console.js` | ESC-Console (8 Tabs) |
| `dkz-headbar.js` | Corp/Solo Header |
| `dkz-self-learn.js` | Bewertungssystem |
| `dkz-tts.js` | Text-to-Speech |

---

## Qualitaetsstandards (Checkliste)

- [ ] DkZ Design System (Farben, Fonts, Cards)
- [ ] Responsive Design (Desktop + Tablet)
- [ ] `← Hub` Button zurueck zur Startseite
- [ ] Version `v0.01` im Header
- [ ] Toast-Benachrichtigungen bei Aktionen
- [ ] Glassmorphism Header (sticky)
- [ ] Background Blobs
- [ ] `esc()` bei jedem User-Input (XSS-Schutz)
- [ ] localStorage fuer Daten-Persistenz
- [ ] Funktioniert offline

---

## Tech-Stack

### Frontend (Vanilla — KEIN Framework)
- HTML5, CSS3 (Custom Properties), JavaScript ES6+
- Google Fonts (Inter + JetBrains Mono)
- localStorage + JSON (Offline-First)
- Kein npm install, kein Build-Prozess

### Backend (Hybrid)
- **Node.js** — WebSockets, JSON I/O
- **Python** — Export Compiler, Fallback (R23)
- **Go** — Apache Iceberg, High-Performance
- **DuckDB** — Analytik

### Datenbank-Hierarchie
1. JSON (bevorzugt, Single Source of Truth)
2. Google Sheets (Cloud-Daten)
3. DuckDB (Analytik)
4. Apache Iceberg (Knowledge Lake)

---

## Konventionen

- **Ordner:** `kebab-case` (z.B. `json-formatter`)
- **Hauptdatei:** immer `index.html`
- **Alles in einer Datei** (HTML + CSS + JS)
- **CSS-Variablen** ueber `:root`, gleiche Namen
- **localStorage Keys:** starten mit `dkz-`
- **Git:** Commit nach jeder Aenderung: `feat(modul): beschreibung`

---

## Datenfluss

```
Benutzer (Input) → Modul (Logik) → localStorage (Speicher)
                                  → Output/Export (Copy/Download)
```

---

## Layer-Architektur (DkZ 7-Ebenen)

| Layer | Name | Zustaendig |
|:------|:-----|:-----------|
| L00 | Admin & System | James™ (Guardian) |
| L0 | Logs & REDNOTE | dkz-eventlog.js |
| L1 | Orchestrator | James™ + Ralph-Loop™ |
| L2 | Routine | Developer™ + Tester™ |
| L3 | Project | PM™ + Architekt™ |
| L4 | Interface | Browser/Voice/Mobile |
| L5 | Console | ESC-Konsole |

---

*Erstellt von DkZ Framework · Aktualisiert 2026-05-22*
