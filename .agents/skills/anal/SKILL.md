---
name: anal
description: "Wochen-Analyse Skill — Analysiert Git-History, offene Tasks, REDNOTE, Module und erstellt einen priorisierten Aktionsplan in Bloecken."
---

# /anal — DEVKiTZ Wochen-Analyse

> **Wann:** Am Ende/Anfang einer Woche oder wenn 777 fragt "was steht an?"
> **Was:** Automatische Analyse aller offenen Baustellen, Git-History, REDNOTE, Module.
> **Output:** Priorisierter Aktionsplan in Bloecken.

---

## Ablauf

### Phase 1: Daten sammeln (automatisch)

```
1. git log --since="7 days ago" --oneline     # Commits der Woche
2. git status --short                          # Uncommitted
3. REDNOTE.json → offene Eintraege             # Fehlerdatenbank
4. features.json → Module ohne index/README    # Unfertige Module
5. Brain Artefakte → walkthroughs + tasks      # Session-Historie
6. Webhook-Log → Aktivitaet                    # System-Health
```

### Phase 2: Kategorisieren

Jedes Item wird einer Kategorie zugeordnet:

| Kategorie | Emoji | Beschreibung |
|:----------|:------|:-------------|
| BLOCKERS | 🔴 | Verhindert andere Arbeit |
| PRIO-HIGH | 🟠 | Wichtig, zeitkritisch |
| PRIO-MED | 🟡 | Sollte erledigt werden |
| PRIO-LOW | 🟢 | Nice-to-have |
| DONE | ✅ | Diese Woche erledigt |
| PARKED | ⏸️ | Bewusst pausiert |

### Phase 3: Bloecke bilden

Items werden in ausfuehrbare Bloecke gruppiert:

```
BLOCK 1: "Name" (geschaetzte Dauer)
  - Task A [Kategorie]
  - Task B [Kategorie]
  → Abhaengigkeit: Block X muss vorher fertig sein

BLOCK 2: "Name" (geschaetzte Dauer)
  ...
```

### Phase 4: Output

Erstelle Artefakt `implementation_plan.md` mit:
1. **Wochen-Statistik** (Commits, neue Features, Fixes)
2. **REDNOTE Status** (offene Fehler)
3. **Module Status** (unfertige Module)
4. **Bloecke** (priorisiert)
5. **Empfehlung** (was zuerst angehen)

---

## Datenquellen

| Quelle | Pfad | Was |
|:-------|:-----|:----|
| Git Log | `git log --since="7 days ago"` | Aktivitaet |
| Git Status | `git status --short` | Uncommitted |
| REDNOTE | `04_SYSTEM/REDNOTE.json` | Fehler |
| Features | `01_PROJECTS/01_dashboard/features.json` | Module |
| Walkthroughs | Brain Artefakte | Session-Kontext |
| Health | `.agents/scripts/health-status.json` | Provider |

---

## Regeln

- **Blocker zuerst** — alles was andere Arbeit verhindert
- **Max 5 Bloecke** — nicht ueberfordern
- **Jeder Block < 2h** — wenn groesser, aufteilen
- **REDNOTE critical** = automatisch BLOCKER
- **Git Push ausstehend** = automatisch PRIO-HIGH
- **Module ohne index** = PRIO-MED
- **Module ohne README** = PRIO-LOW

---

## Automatische Trigger

Dieser Skill wird automatisch getriggert bei:
- `/anal` (manuell)
- Session-Start wenn letzte Analyse > 3 Tage
- Wenn REDNOTE neue critical Eintraege hat
