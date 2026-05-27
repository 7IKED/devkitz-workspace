---
name: dkz-power-openspec
description: "DkZ™ /+ Mode — Power+ Fusion mit OpenSpec Spec-Driven Development. Vollständiger Workflow: Grill → OpenSpec Propose → Design → Tasks → Build → Test → Commit"
risk: safe
source: "DEVKiTZ™ Fusion Skill v2"
date_added: "2026-05-17"
trigger: "/+"
aliases: ["/power+", "/plus"]
---

# ⚡ DkZ™ /+ Mode — Power+ × OpenSpec Fusion

> `/+` = Power+ (Grill + DDD + Agent Harness) × OpenSpec (Spec-Driven Development)
> Ein Befehl — voller Workflow von Idee bis Commit

---

## When to Use

Nutze `/+` wenn du die **maximale KI-gestützte Entwicklung** brauchst:
- Neues Feature oder Modul planen + bauen
- Architektur-Entscheidungen mit OpenSpec festhalten
- Spec-Driven statt Code-First arbeiten
- Vollständigen Audit-Trail mit Proposal → Design → Tasks

---

## ═══ DER /+ WORKFLOW (10 Schritte) ═══

```
/+ activated!

┌─────────────────────────────────────────────────────┐
│  1. 🎯 GRILL     → Interview + Requirements        │
│  2. 📖 LANGUAGE  → UBIQUITOUS_LANGUAGE.md           │
│  3. 📋 PROPOSE   → openspec new change "name"      │
│  4. 📐 DESIGN    → design.md (Architektur)          │
│  5. ✅ TASKS     → tasks.md (Atomare Schritte)      │
│  6. 🧠 CONTEXT   → ADRs + GSD Checkpoint           │
│  7. ⚡ BUILD     → Code nach tasks.md               │
│  8. 🧪 TEST      → TestStraße + Playwright          │
│  9. 📝 DOC       → README + llms.txt                │
│ 10. 🔄 COMMIT    → Git + openspec archive           │
└─────────────────────────────────────────────────────┘
```

---

## ═══ PHASE 1: Grill-With-Docs (von Power+) ═══

### Schritt 1: Ubiquitous Language
Erstelle `UBIQUITOUS_LANGUAGE.md` im Projekt-Root:

```markdown
# Ubiquitous Language

## Terms
- **[Begriff]**: [Präzise Definition wie in DIESEM Projekt verwendet]

## Anti-Terms (NICHT verwenden)
- **[Verwirrender Begriff]** → Nutze **[korrekter Begriff]**

## Scope
- [Was ist IN scope]
- [Was ist OUT of scope]
```

### Schritt 2: Grill-Session
1. **5+ Runden probing questions** über die Domain
2. **Annahmen hinterfragen** — "Warum nicht X statt Y?"
3. **Entscheidungen dokumentieren** als ADRs
4. **Stoppen wenn** die KI deine Design-Entscheidungen vorhersagen kann

---

## ═══ PHASE 2: OpenSpec Spec-Driven (NEU) ═══

### Schritt 3: Change Proposal erstellen
```bash
openspec new change "<kebab-case-name>"
```

### Schritt 4: Artifacts generieren
```bash
# Build-Reihenfolge holen
openspec status --change "<name>" --json

# Für jedes Artifact:
openspec instructions <artifact-id> --change "<name>" --json
```

**Artifact-Reihenfolge:**
1. `proposal.md` — Was & Warum
2. `design.md` — Wie (Architektur, Tech-Stack)
3. `tasks.md` — Atomare Implementierungs-Schritte

### Schritt 5: Validierung
```bash
openspec validate "<name>"
openspec status --change "<name>"
```

---

## ═══ PHASE 3: Build + Test (von Power+) ═══

### Schritt 6: Code nach Tasks
- Arbeite tasks.md ab — ein Task nach dem anderen
- **Ralph-Loop™**: Task → Spawn → Execute → Verify → Commit → Loop
- **DkZ Design System v2** ist Standard
- `esc()` bei jedem User-Input — XSS-Schutz

### Schritt 7: Tests
- **TestStraße v3.0.0**: Playwright E2E Smoke Tests
- Browser-Test mit Aufnahme (`/browser-test`)
- Feature-Test pro Modul

### Schritt 8: Dokumentation
- `README.md` im Modul-Ordner
- `features.json` aktualisieren
- `llms.txt` für neue Endpoints
- `REGISTRY.json` + `BLAUPAUSE.md` updaten

### Schritt 9: Commit + Archive
```bash
# Git Commit
git add -A
git commit -m "feat(bereich): was wurde gemacht"

# OpenSpec Change archivieren
openspec archive "<name>"
```

---

## ═══ REGELN ═══

1. **NIEMALS** die Grill-Phase überspringen — Context Alignment ist Pflicht
2. **IMMER** `openspec new change` BEVOR Code geschrieben wird
3. **ADRs** sind Pflicht für jede Architektur-Entscheidung
4. **GSD Checkpoints** nach jeder signifikanten Arbeitseinheit
5. **Design Tokens** aus DkZ Design System v2 — keine hardcoded Werte
6. **TestStraße** muss bestehen vor Commit
7. **Dateien sind heilig** — nie löschen, immer erst kopieren → verifizieren
8. **OpenSpec archive** nach Abschluss jedes Changes

---

## ═══ OPENSPEC CLI QUICK REFERENCE ═══

| Befehl | Aktion |
|:-------|:-------|
| `openspec new change "name"` | Neuen Change erstellen |
| `openspec status` | Dashboard anzeigen |
| `openspec instructions <artifact>` | Artifact-Anleitung |
| `openspec validate "name"` | Change validieren |
| `openspec archive "name"` | Change abschließen |
| `openspec list --changes` | Alle Changes listen |
| `openspec list --specs` | Alle Specs listen |
| `openspec view` | Interaktives Dashboard |

---

## ═══ TRIGGER VERGLEICH ═══

| Trigger | Was es macht |
|:--------|:-------------|
| `/power` | Basic Superpowers Lab |
| `/power+` | Grill + DDD + ADR + Agent Harness + Superpowers |
| **`/+`** | **ALLES von /power+ PLUS OpenSpec Spec-Driven Development** |

---

## Sources
- Matt Pocock: /grill-with-docs (aihero.dev)
- Fission-AI: OpenSpec v1.3.1 (github.com/Fission-AI/OpenSpec)
- DkZ™: Ralph-Loop, TestStraße, BMAD, Free AI Hub
