---
name: anal
description: "Wochen-Analyse Skill — Analysiert Git-History, offene Tasks, REDNOTE, Module, Gateway Health, EventLog und erstellt priorisierten Aktionsplan."
---

# /anal — DEVKiTZ Wochen-Analyse v2

> **Wann:** Am Ende/Anfang einer Woche oder wenn 777 fragt "was steht an?"
> **Was:** Automatische Analyse ALLER Systeme inkl. Gateway Health, EventLog, Tickets.
> **Output:** Priorisierter Aktionsplan in Bloecken.

---

## Ablauf

### Phase 1: Daten sammeln (automatisch)

```
1. git log --since="48 hours ago" --oneline        # Commits 48h
2. git log --since="7 days ago" --oneline           # Commits Woche
3. git status --short                               # Uncommitted
4. git diff --stat HEAD~20                          # Delta-Umfang
5. REDNOTE.json → offene Eintraege                  # Fehlerdatenbank
6. features.json → Module ohne index/README         # Unfertige Module
7. Brain Artefakte → walkthroughs + tasks           # Session-Historie
8. Gateway Health → /health Endpoint                # System-Status
9. EventLog Stats → /events/stats                   # Event-Metriken
10. Tickets → /tickets?status=pending               # Offene Tickets
11. Playbook-Compliance → REGELWERK.md Checks       # Regel-Einhaltung
```

### Phase 2: Health-Check Kette (48h Rueckblick)

| Check | Quelle | Was |
|:------|:-------|:----|
| Gateway Health | `localhost:3060/health` | Alle Downstream-Services |
| EventLog Stats | `localhost:3060/events/stats` | Event-Verteilung |
| Tickets | `localhost:3060/tickets?status=pending` | Offene Anfragen |
| Git Status | `git status --porcelain` | Uncommitted Files |
| Git Push | `git log origin/main..HEAD` | Ungepushte Commits |
| REDNOTE | `04_SYSTEM/REDNOTE.json` | Critical/High Fehler |
| dkz-eventlog.js | `shared/dkz-eventlog.js` geladen? | EventLog aktiv? |
| Shared Scripts | `dkz-debug/guide/navbar.js` | Eingebunden? |
| VPS Status | `ssh vps 'systemctl status'` | Services laufen? |
| Drive Sync | `rclone check` | Sync aktuell? |
| OpenHands | `localhost:3000/health` | Agent laeuft? |
| OpenSpec | `.agents/skills/power-openspec/` | Spec vorhanden? |
| James GPT | Ticket-Zuweisung funktioniert? | Assignee check |
| AutoSync | Gateway FileWatcher aktiv? | Watcher laufen? |

### Phase 3: Superpowers-Pflicht-Checks

Bei JEDEM /anal Lauf werden folgende Superpowers geprueft:

```
1. BRAINSTORMING    → Wurde vor Code nachgedacht?
2. WRITING-PLANS    → Gibt es Task-Listen?
3. TDD              → Tests vorhanden?
4. CODE-REVIEW      → Reviews durchgefuehrt?
5. VERIFICATION     → Ergebnisse verifiziert?
6. COMMIT           → Alles committed?
```

Pflicht-Skill-Checks:
- `superpowers-dkz` → Methodik eingehalten?
- `grill-with-docs` → Architektur-Entscheidungen dokumentiert?
- `power-openspec` → Spec-Driven Development genutzt?
- `health-agent` → Health-Chain ausgefuehrt?

### Phase 4: Kategorisieren

| Kategorie | Emoji | Beschreibung |
|:----------|:------|:-------------|
| BLOCKERS | 🔴 | Verhindert andere Arbeit |
| PRIO-HIGH | 🟠 | Wichtig, zeitkritisch |
| PRIO-MED | 🟡 | Sollte erledigt werden |
| PRIO-LOW | 🟢 | Nice-to-have |
| DONE | ✅ | Erledigt (48h/Woche) |
| PARKED | ⏸️ | Bewusst pausiert |

### Phase 5: Bloecke bilden

```
BLOCK 1: "Name" (geschaetzte Dauer)
  - Task A [Kategorie] {Pattern: anfrage/bug/idee}
  - Task B [Kategorie] {Ticket: dkz-BG-001}
  → Abhaengigkeit: Block X
  → Walkthrough: session-start v2

BLOCK 2: "Name" (geschaetzte Dauer)
  ...
```

### Phase 6: Output

Erstelle Artefakt `implementation_plan.md` mit:
1. **48h-Statistik** (Commits, Files, Events, Tickets)
2. **Wochen-Statistik** (Commits, neue Features, Fixes)
3. **Health-Ampel** (Gateway + Downstream + VPS)
4. **REDNOTE Status** (offene Fehler)
5. **EventLog Analyse** (Top Sources, Error-Rate)
6. **Ticket-Queue** (Offene dkz-XX-NNN Tickets)
7. **Bloecke** (priorisiert)
8. **Empfehlung** (was zuerst angehen)
9. **Superpowers-Compliance** (welche Skills genutzt?)

---

## Datenquellen

| Quelle | Pfad/Endpoint | Was |
|:-------|:-------------|:----|
| Git Log | `git log --since="48h/7d"` | Aktivitaet |
| Git Status | `git status --short` | Uncommitted |
| REDNOTE | `04_SYSTEM/REDNOTE.json` | Fehler |
| Features | `01_PROJECTS/01_dashboard/features.json` | Module |
| Gateway Health | `localhost:3060/health` | System-Health |
| EventLog | `localhost:3060/events/stats` | Event-Metriken |
| Tickets | `localhost:3060/tickets` | Offene Anfragen |
| Git Log (Gateway) | `localhost:3060/git/log` | Commits via API |
| Walkthroughs | Brain Artefakte | Session-Kontext |
| Sync Log | `logs/sync.jsonl` | AutoSync-History |
| GitHub Log | `logs/github-events.jsonl` | GitHub-Events |

---

## Regeln

- **Blocker zuerst** — alles was andere Arbeit verhindert
- **Max 5 Bloecke** — nicht ueberfordern
- **Jeder Block < 2h** — wenn groesser, aufteilen
- **REDNOTE critical** = automatisch BLOCKER
- **Git Push ausstehend** = automatisch PRIO-HIGH
- **Gateway offline** = automatisch BLOCKER
- **Tickets pending > 5** = automatisch PRIO-HIGH
- **EventLog errors > 10%** = automatisch PRIO-HIGH
- **Module ohne index** = PRIO-MED
- **Module ohne README** = PRIO-LOW
- **Superpowers nicht genutzt** = WARNUNG im Report
- **Grill-With-Docs nicht gemacht** = WARNUNG bei Architektur-Changes

---

## Integration mit anderen Skills

| Skill | Wann einbinden |
|:------|:---------------|
| `/superpowers` | IMMER — Methodik pruefen |
| `/grill-with-docs` | Bei Architektur-Entscheidungen |
| `/power-openspec` | Bei neuen Features/Modulen |
| `/health-agent` | Bei Health-Problemen |
| `/checkup` | Bei ROT-Ampel |
| `/startup` | Am Session-Anfang |
| `/byebye` | Am Session-Ende |

---

## Automatische Trigger

Dieser Skill wird automatisch getriggert bei:
- `/anal` (manuell)
- Session-Start wenn letzte Analyse > 3 Tage
- Wenn REDNOTE neue critical Eintraege hat
- Wenn Gateway Health ROT meldet
- Wenn > 5 Tickets pending
- Wenn EventLog error-Rate > 10%
