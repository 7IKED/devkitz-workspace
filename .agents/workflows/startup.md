---
description: DEVKiTZ Startup — IMMER als erstes ausführen bei jedem Session-Start
---

# DEVKiTZ Startup Workflow — Pflicht bei jedem Session-Start

> **Wann:** JEDES MAL wenn ein LLM/Agent/CLI eine neue Session startet.
> **Warum:** Damit kein Wissen verloren geht und alle Regeln beachtet werden.
> **Trigger:** User sagt "lese playbook", "/startup" oder "Session Start"

---

## Schritt 1: Playbook & Regeln laden (PFLICHT)

// turbo
1. Lies `C:\DEVKiTZ\04_SYSTEM\DKZ_PLAYBOOK.md` — **Komplettes Playbook** (alle §§ inkl. §19 Prompt-Hub)
2. Lies `C:\DEVKiTZ\REGELWERK.md` — **Alle Regeln R0–R23**
3. Lies `C:\DEVKiTZ\ORDNER.ini` — Root-Anweisungen

## Schritt 2: Architektur verstehen

// turbo
4. Lies `C:\DEVKiTZ\01_PROJECTS\01_dashboard\BLAUPAUSE.md` — **Ökosystem-Architektur** (Module, Shared Scripts, Prompt-Hub)
5. Lies `C:\DEVKiTZ\04_SYSTEM\claude.md` — Projekt-Identität + System-Architektur
6. Lies `C:\DEVKiTZ\01_PROJECTS\01_dashboard\IMPLEMENTIERUNGSPLAN.md` — **Feature-Status** (was ist live, was fehlt)

## Schritt 3: Git-Status prüfen

// turbo
7. `cd C:\DEVKiTZ && git status` — Uncommitted changes?
8. `git log -n 5 --oneline` — Letzte Commits prüfen

## Schritt 4: Modul-Status laden (bei Dashboard-Arbeit)

// turbo
9. Lies `01_PROJECTS/01_dashboard/LLM_CONTEXT.md`
10. Lies `01_PROJECTS/01_dashboard/REGISTRY.json` → Modulzahl prüfen
11. Lies die `ORDNER.ini` des Zielordners

## Schritt 5: Arbeitsregeln (bei jeder Änderung beachten)

- **R0:** Sei Teil der Lösung, nie des Problems
- **R1:** Nichts löschen → nach `99_ARCHIVE/` verschieben
- **R2:** Git Commit nach JEDER Änderung: `prefix(bereich): beschreibung`
- **R5:** Erst analysieren, dann handeln
- **R6:** Kompatibilitätsprüfung vor Integration
- **R12:** Kein Datenverlust — Backup vor Änderungen
- **R13:** Workflow: Analyse → Plan → Ausführung → Verifikation → Commit
- **R15:** Ändere so viel wie nötig, so wenig wie möglich
- **R17:** ORDNER.ini aktualisieren bei Ordner-Änderungen
- **R18:** Dokumentation aktualisieren bei erstmaligen Aktionen
- **R21:** Shared Scripts nutzen (dkz-theme.css, dkz-prompt-hub.js, etc.)
- **R100:** Keine Deletion Rule — Legacy Keys nie löschen

## Schritt 6: Prompt-System (§19)

Bei Arbeit mit Prompts/Builders:
- **EINE Quelle:** `dkz-prompts` (localStorage) + 2 Rolling Backups
- **Source Tags:** gen | arc | eng | chat | loop | import
- **API:** `DkzPromptHub.addPrompt(obj, source)`, `.getAll()`, `.getStats()`
- **14 vernetzte Module** mit Cross-Module Nav-Bar
- **Builder Chain:** Action → Skill → Agent → Team → Workflow

## Schritt 7: NIEMALS

- ❌ Dateien löschen → nach `99_ARCHIVE/` verschieben (**R1**)
- ❌ Regeln eigenständig brechen → nachfragen (**R16**)
- ❌ Dateien ohne Bestätigung überschreiben (**R11**)
- ❌ Private Dateien in Projektordner (**R8**)
- ❌ ANTICRAV schreiben → DEVKiTZ (**Erledigt**)
- ❌ Legacy localStorage Keys löschen → Backup! (**R100**)
- ❌ Encoding kaputt machen → UTF-8 BOM verwenden
