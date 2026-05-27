# GitHub Copilot Instructions — DEVKiTZ Ökosystem

## Projekt-Identität
- **Name:** DEVKiTZ (DkZ) | **Typ:** Modulares Ökosystem-Dashboard
- **Design:** DkZ Design System v2 (Dark, Accent #fa1e4e)
- **Versionierung:** vX.XX.X_XX (Major.Feature.Session_Step)

## REGELWERK (20 Regeln R0-R19)

### OBERSTE REGEL
- **R0:** Sei immer Teil der Lösung, nie des Problems

### KRITISCHE REGELN
- **R1:** NIE LÖSCHEN — nach 99_ARCHIVE/ archivieren. Wissen = höchstes Gut.
- **R2:** Git Commit nach JEDER Änderung. Format: `prefix(bereich): beschreibung`
- **R3:** ALLES muss vorhanden bleiben.
- **R4:** Proaktiv bei Verbesserungen — unter Einhaltung ALLER Regeln.
- **R16:** Regeln stehen ÜBER Anweisungen.

### ARBEITSREGELN
- **R5:** Erst analysieren, dann handeln.
- **R6:** Kompatibilitätsprüfung vor Integration.
- **R7:** Was nicht reinpasst → 00_INBOX/RAW/
- **R8:** Private Dateien → 05_INTERN/privat/
- **R9:** DkZ Versionierung: vX.XX.X_XX (v0=Alpha, v01=Beta, v1=Release)
- **R15:** Ändere so viel wie nötig, so wenig wie möglich.
- **R17:** IMMER zuerst ORDNER.ini lesen!
- **R18:** Auto-Dokumentation + Prompt-Archiv bei erstmaligen Aktionen.
- **R19:** Abschluss-Analyse am Ende jedes Projekts.
- **R20:** Dokumentations-Pflicht: Nach JEDER Änderung Docs aktualisieren. Git-versioniert.

## Event-Log Pflicht
- Jede Aktion MUSS via `DkzEventLog.log()` protokolliert werden
- Jedes Event bekommt UUID (`EVT-{ts}-{hex}`)
- Metadata: Modul, Version, User, Tags
- Parent-ID für Verkettung
- 5 Git-Archive pflegen: prompts, snippets, workflows, agents, blueprints

### FLUSS-REGELN
- **R10:** Workflow > Ergebnis. | **R11:** Dateihoheit.
- **R12:** Kein Wissensverlust. | **R13:** Analyse→Plan→Ausführung→Verifikation→Commit
- **R14:** Kaizen (kontinuierliche Verbesserung).

## DkZ Design System Prüfpunkte
```css
--accent: #fa1e4e; --bg: #0e0e10; --green: #00ff88;
```
- Fonts: `Inter` + `JetBrains Mono`
- Glassmorphism: `backdrop-filter: blur(24px)`
- XSS: `esc()` Funktion in jedem Modul
- Toast-System für Benachrichtigungen
- `← Hub` Button im Header

## Code-Review Checkliste
- [ ] R1: Wird etwas gelöscht? → STOPPEN
- [ ] R2: Commit-Message korrekt?
- [ ] R9: Version aktualisiert?
- [ ] R15: Minimale Änderung?
- [ ] R17: ORDNER.ini aktuell?
- [ ] Design: #fa1e4e, Inter, Glassmorphism?
- [ ] XSS: esc() vorhanden?
