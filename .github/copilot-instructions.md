# GitHub Copilot Instructions — DEVKiTZ Ökosystem (Root)
# @DKZ:RULES -> Siehe REGELWERK.md + docs/Regelwerk.md
# Version: v0.01.2_02

## Projekt-Identität
- **Name:** DEVKiTZ (DkZ) | **Typ:** Modulares AI-Ökosystem
- **Design:** DkZ Design System v2 (Dark, Accent #fa1e4e)
- **Versionierung:** vX.XX.X_XX (Major.Feature.Session_Step)
- **Owner:** BAZE² (Admin, alle Rechte)
- **Wiki:** `docs/Home.md` → DkZ™ SYSTEM MASTER PLAN

## REGELWERK (22 Regeln R0-R22)

> 📋 Vollständig: [docs/Regelwerk.md](docs/Regelwerk.md)

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
- **R9:** DkZ Versionierung: vX.XX.X_XX
- **R15:** Ändere so viel wie nötig, so wenig wie möglich.
- **R17:** IMMER zuerst ORDNER.ini lesen!
- **R18:** Auto-Dokumentation + Prompt-Archiv bei erstmaligen Aktionen.
- **R19:** Abschluss-Analyse am Ende jedes Projekts.
- **R20:** Dokumentations-Pflicht: Docs nach JEDER Änderung. Git-versioniert.

### FLUSS-REGELN
- **R10:** Workflow > Ergebnis. | **R11:** Dateihoheit.
- **R12:** Kein Wissensverlust. | **R13:** Analyse→Plan→Ausführung→Verifikation→Commit
- **R14:** Kaizen (kontinuierliche Verbesserung).

---

## R21: Pflegefall-System

> 📋 Vollständig: [docs/Pflegefall-System.md](docs/Pflegefall-System.md)

### Issue-Triage
Jede neue Issue erhält eine **Pflegefall-ID**: `PF-{YYYY-MM-DD}-{NNN}`

| Label | Priorität | SLA |
|:---|:---|:---|
| `pf:kritisch` | 🔴 SOFORT | 1h |
| `pf:hoch` | 🟠 Schnell | 4h |
| `pf:mittel` | 🟡 Normal | 24h |
| `pf:niedrig` | 🟢 Backlog | 1 Woche |
| `pf:unwichtig` | ⚪ Skip | - |

### Auto-Fix Pipeline
1. **Issue erstellt** → Copilot analysiert Code
2. **Fix möglich?** → PR mit `fix(scope):` Commit
3. **Fix nicht möglich?** → Label `pf:escalation` + Admin-Dashboard Meldung
4. **Nach Fix** → Trigger CodeRabbit Review
5. **CodeRabbit OK** → Issue schließen, Pflegefall gelöst
6. **CodeRabbit NOK** → Neue Issue mit Referenz, Pflegefall bleibt offen

### Escalation Rules
- Bugs die >3 Fix-Versuche hatten → `pf:escalation` + Admin-Alert
- Security Issues → IMMER `pf:kritisch` + sofortige Admin-Benachrichtigung
- Breaking Changes → Branch Protection, nie direkt auf `master`

---

## R22: Blaupause-Pflicht ⚠️

> **NIE DIE BLAUPAUSE VERGESSEN!**

Jede Session, jedes Feature, jede Analyse produziert eine Blaupause:

1. Blaupause als Artifact erstellen
2. In `04_SYSTEM/SYSTEM/_archives/blueprints/implementations/` speichern
3. Ins Wiki (`docs/Sessions/`) kopieren
4. Git Commit: `docs(wiki): add blaupause — [beschreibung]`

---

## Shared Scripts (Layer 3)

> 📋 Vollständig: [docs/Modules.md](docs/Modules.md)

Jedes Modul MUSS einbinden:
```html
<script src="../../shared/dkz-debug.js"></script>     <!-- 🐛 Debug + 🔬 Analyse -->
<script src="../../shared/dkz-analyser.js"></script>   <!-- 22-Check Dual-Agent -->
<script src="../../shared/dkz-eventlog.js"></script>   <!-- Event-Log -->
<script src="../../shared/dkz-persist.js"></script>    <!-- 💬 Support + ☁️ Backup -->
```

### Debug Button (🐛)
- Vorsorge: lokale Diagnose (XSS, Design, EventLog, Version)
- Problem: → POST `/debug/issue` → Pflegefall-ID

### Analyse Button (🔬 Admin-only)
- Einzeln (Modul) oder Full (56 Module + Backend)
- Agent A (🐰 CodeRabbit): 12 Checks — Design, Security, R1-R22
- Agent B (🤖 Copilot): 10 Checks — Funktion, Performance, Logic
- Cross-Check: Gegenseitige Verifikation
- Mistral OCR via Ollama als Werkzeug

### Support Button (💬)
- Feedback-Form: Anregung oder Verbesserung
- Email + Nachricht + Modul-Kontext

### Backup Button (☁️)
- Manual: Jetzt → Google Drive
- Auto: alle 5 Min → Drive via Apps Script
- Import: bei Login von neuem Gerät

---

## GitHub Pflege-Regeln

### Branch-Strategie
```
master          ← Stable, protected
├── develop     ← Integration
├── feature/*   ← Neue Features
├── fix/*       ← Bug Fixes
└── hotfix/*    ← Kritische Fixes
```

### Commit-Format
```
prefix(scope): description

Prefixes: feat, fix, docs, style, refactor, test, chore, perf
Scope: module-name, system, admin, auth, hub, wiki, etc.
```

### PR-Regeln
- Jeder PR braucht: Description, Tests, Screenshots (bei UI)
- CodeRabbit Review MUSS passed sein
- Min. 1 Approval (Copilot oder Admin)

### README/INSTALL Auto-Generator
Copilot erstellt bei jedem neuen Modul automatisch:
1. `README.md` — Demo-Badge, Beschreibung, Tech Stack, Lizenz
2. `INSTALL.md` — Clone, Install, Run
3. `LICENSE` — Private-Use Lizenz

---

## DkZ Design System

> 📋 Vollständig: [docs/Design-System.md](docs/Design-System.md)

```css
--accent: #fa1e4e; --bg: #0e0e10; --green: #00ff88;
```
- Fonts: `Inter` + `JetBrains Mono` + `Space Grotesk`
- Glassmorphism: `backdrop-filter: blur(24px)`
- XSS: `esc()` Funktion in jedem Modul
- Toast-System für Benachrichtigungen
- `← Hub` Button im Header

## Event-Log Pflicht
- Jede Aktion via `DkzEventLog.log()` protokollieren
- UUID: `EVT-{ts}-{hex}`, Metadata, Tags, Parent-ID
- 5 Git-Archive: prompts, snippets, workflows, agents, blueprints

## Markdown Rendering

> 📋 Blaupause: [docs/Markdown-Blaupause.md](docs/Markdown-Blaupause.md)

10 Darstellungsarten mit je 3 Beispielen:
1. Tabellen (Status, Vergleich, API)
2. Mermaid (Flowchart, Mindmap, Sequenz)
3. Regelwerk (Block, Tabelle, Prioritäten)
4. Code + Download Button
5. Alerts (Important, Warning, Tip)
6. Checklisten (Modul, Release, Session)
7. ASCII Architektur (Layer, Baum, Fluss)
8. Badges (Status, Priorität, Inline)
9. Querverweise (Wiki, Datei, Session)
10. Zusammenfassungen (Feature-Box, Commits, Quick-Ref)

## API Reference

> 📋 Vollständig: [docs/API-Reference.md](docs/API-Reference.md)

Server: `http://localhost:9880` (16 Endpoints)

## DkZ™ SYSTEM MASTER PLAN (Wiki)

> 📋 [docs/Home.md](docs/Home.md) — 15 Seiten, PRIVAT bis umfassend

| Seite | Inhalt |
|:---|:---|
| Architecture | 5-Layer Modell |
| Regelwerk | R1-R22 |
| Modules | 56 Module + 5 Shared Scripts |
| API Reference | 16 Endpoints |
| Pflegefall | R21 komplett |
| Design System | Farben, Fonts, Buttons |
| Markdown Blaupause | 10 Typen × 3 Beispiele |
| Installation | Quick Start |
| Backup | Google Drive Setup |
| Sessions/* | 5 Blaupausen |

## Code-Review Checkliste
- [ ] R1: Wird etwas gelöscht? → STOPPEN
- [ ] R2: Commit-Message korrekt?
- [ ] R9: Version aktualisiert?
- [ ] R15: Minimale Änderung?
- [ ] R20: Dokumentation aktualisiert?
- [ ] R21: Pflegefall-ID bei Issues?
- [ ] R22: Blaupause geschrieben? → Wiki!
- [ ] Design: #fa1e4e, Inter, Glassmorphism?
- [ ] XSS: esc() vorhanden?
- [ ] Shared Scripts: debug, analyser, eventlog, persist?

