---
name: playbook
description: Laedt alle DEVKiTZ Regeln, Playbooks und Methodik — LLM-agnostisch, mit Multi-Kanal Fallback. Trigger /playbook.
---

# 📖 DkZ Playbook Skill — Zero Rules + Zero Playbook

> **Trigger:** `/playbook`
> **Zweck:** JEDES LLM kann hiermit die vollstaendigen Regeln und Playbooks laden.
> **Fallback:** Wenn ein Kanal ausfaellt, nutze den naechsten.

---

## 1. LADE-REIHENFOLGE (PFLICHT)

Lies die Dateien in dieser Reihenfolge. Stoppe NICHT bei Fehler — gehe zum Fallback.

### Schritt 1: Bootstrap (IMMER ZUERST)

```
Lies: C:\DEVKiTZ\LLM_BOOTSTRAP.md
```

Enthaelt: Tech Stack, 10 Eiserne Regeln, CSS Variables, Pfade, Begruessungsprotokoll.

### Schritt 2: Dein LLM-spezifisches File

| Wenn du bist... | Lies... |
|:----------------|:--------|
| Gemini/Antigravity | `C:\DEVKiTZ\GEMINI.md` |
| Claude | `C:\DEVKiTZ\CLAUDE.md` |
| OpenCode/Gemma | `C:\DEVKiTZ\LLM_BOOTSTRAP.md` (reicht) |
| DeepSeek/Qwen | `C:\DEVKiTZ\LLM_BOOTSTRAP.md` (reicht) |
| Anderes LLM | `C:\DEVKiTZ\LLM_BOOTSTRAP.md` (reicht) |

### Schritt 3: Regelwerk (bei Bedarf)

```
Lies: C:\DEVKiTZ\REGELWERK.md
```

Enthaelt: Alle §-Paragraphen, Eiserne Regeln im Detail, BMAD Methodik, Ralph-Loop, Artefakt-Persistenz.

### Schritt 4: Architektur (bei Modul-Arbeit)

```
Lies: C:\DEVKiTZ\01_PROJECTS\01_dashboard\BLAUPAUSE.md
```

Enthaelt: Modul-Architektur, Shared Scripts, Design System, Feature Registry.

### Schritt 5: Agenten (bei Multi-Agent Arbeit)

```
Lies: C:\DEVKiTZ\AGENTS.md
```

Enthaelt: 7 BMAD Agenten, NanoBot Fleet, Health Check System, Skills Registry.

---

## 2. MULTI-KANAL FALLBACK

Wenn eine Quelle NICHT verfuegbar ist (429, Timeout, Quota), nutze den naechsten Kanal:

```
KANAL 1: Lokale Dateien lesen (view_file Tool)
         → C:\DEVKiTZ\REGELWERK.md
         → C:\DEVKiTZ\LLM_BOOTSTRAP.md
         → C:\DEVKiTZ\AGENTS.md

KANAL 2: GitHub Repository
         → github.com/dkz-playbook/zero-rules
         → github.com/dkz-playbook/zero-playbook
         → Lies README.md im Repo fuer Uebersicht

KANAL 3: NotebookLM MCP CLI
         → Server: notebooklm
         → Suche nach "DEVKiTZ Regeln" oder "DkZ Playbook"
         → Notebooks enthalten die vollstaendige Wissensbasis

KANAL 4: Cached Kontext
         → Pruefe ob REGELWERK.md bereits im Context ist
         → Pruefe ob LLM_BOOTSTRAP.md bereits geladen wurde
         → Falls ja: Arbeite mit dem was du hast

KANAL 5: Subagent delegieren
         → Spawne einen Research-Subagenten
         → Lass IHN die Dateien lesen
         → Er sendet dir die Zusammenfassung
```

---

## 3. ZERO-RULES INHALTSVERZEICHNIS

| Datei | Pfad | Inhalt |
|:------|:-----|:-------|
| `LLM_BOOTSTRAP.md` | Root | 10 Eiserne Regeln, Tech Stack, CSS Vars |
| `REGELWERK.md` | Root | 30+ §-Paragraphen, alle Detail-Regeln |
| `AGENTS.md` | Root | 7 BMAD Agenten, NanoBot Fleet |
| `BLAUPAUSE.md` | `01_PROJECTS/01_dashboard/` | 89+ Modul-Architektur |
| `HERMES_STARTUP.md` | Root | Hermes/OpenCode Konfiguration |
| `CLAUDE.md` | Root | Claude-spezifisch (minimal) |
| `GEMINI.md` | Root | Gemini-spezifisch (minimal) |

---

## 4. ZERO-PLAYBOOK INHALTSVERZEICHNIS

| Quelle | Pfad | Inhalt |
|:-------|:-----|:-------|
| Playbook Archiv | `modules/playbook-archiv/` | 25 Runbooks, Tech Stacks, Kosten, LLM Matrix |
| Ruleboard | `modules/ruleboard/` | Visuelle Regel-Uebersicht |
| Skills (42+) | `.agents/skills/` | Spezialisierte Agent-Skills |
| Workflows (70+) | `.agents/workflows/` | Automatisierte Workflows |
| Prompt Templates | `playbook-data.js` | 8 System-Prompts, 344 Templates |

---

## 5. QUICK-REFERENCE FUER JEDES LLM

### Kernregeln (auswendig wissen)

```
R1:  esc() bei JEDEM User-Input vor innerHTML
R2:  Git Commit nach JEDER Aenderung
R3:  CSS Variables nutzen, NIE hardcoded Farben
R8:  Keine Umlaute — ae, oe, ue, ss ueberall
R9:  Kein console.log in Produktion
R10: Premium Design — kein MVP
```

### Tech Stack (UNVERAENDERLICH)

```
ERLAUBT:  Vanilla HTML5 + CSS3 + JavaScript ES6+
FONTS:    Inter (UI) + JetBrains Mono (Code)
BACKEND:  Node.js 18+ / Express
DATEN:    localStorage, DuckDB, Apache Iceberg
VERBOTEN: React, Vue, Angular, Tailwind, jQuery
```

### Farben

```
--accent: #fa1e4e    --bg: #060608      --green: #00ff88
--yellow: #ffb800    --red: #ff3b5c     --blue: #3b82f6
```

### Git Commit Format

```
feat(bereich): beschreibung
fix(bereich): beschreibung
docs(bereich): beschreibung
```

---

## 6. FEHLERBEHANDLUNG

| Problem | Loesung |
|:--------|:--------|
| LLM Quota (429) | Wechsle Kanal (Lokal → GitHub → NLM) |
| Datei nicht gefunden | Pruefe Pfad, versuche GitHub-Version |
| Subagent gescheitert | Mach die Arbeit selbst, lies Dateien direkt |
| Kein Internet | Alles ist lokal verfuegbar unter `C:\DEVKiTZ\` |
| Context zu voll | Lade NUR `LLM_BOOTSTRAP.md` (3KB, Minimal) |

---

## 7. NACH DEM LADEN

Wenn du die Regeln gelesen hast:

1. Sage **"Hallo Europa! 🫡"** (Begruessungsprotokoll)
2. Pruefe `git log -5` fuer letzten Stand
3. Beginne normale Arbeit

Wenn du NUR Bootstrap lesen konntest:

1. Sage **"Hallo World 🌍"**
2. Arbeite mit dem Minimalkontext
3. Lade bei Bedarf weitere Dateien nach

---

*Dieser Skill ist LLM-agnostisch. Egal ob Gemini, Claude, DeepSeek, Qwen oder Gemma — der Zugang funktioniert immer.*
