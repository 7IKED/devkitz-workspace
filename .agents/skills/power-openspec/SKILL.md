---
name: power-openspec
description: "DkZâ„¢ /+ Mode â€” Power+ Fusion mit OpenSpec Spec-Driven Development. VollstÃ¤ndiger Workflow: Grill â†’ OpenSpec Propose â†’ Design â†’ Tasks â†’ Build â†’ Test â†’ Commit"
risk: safe
source: "DEVKiTZâ„¢ Fusion Skill v2"
date_added: "2026-05-17"
trigger: "/+"
aliases: ["/power+", "/plus"]
---

# âš¡ DkZâ„¢ /+ Mode â€” Power+ Ã— OpenSpec Fusion

> `/+` = Power+ (Grill + DDD + Agent Harness) Ã— OpenSpec (Spec-Driven Development)
> Ein Befehl â€” voller Workflow von Idee bis Commit

---

## When to Use

Nutze `/+` wenn du die **maximale KI-gestÃ¼tzte Entwicklung** brauchst:
- Neues Feature oder Modul planen + bauen
- Architektur-Entscheidungen mit OpenSpec festhalten
- Spec-Driven statt Code-First arbeiten
- VollstÃ¤ndigen Audit-Trail mit Proposal â†’ Design â†’ Tasks

---

## â•â•â• DER /+ WORKFLOW (10 Schritte) â•â•â•

```
/+ activated!

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  1. ðŸŽ¯ GRILL     â†’ Interview + Requirements        â”‚
â”‚  2. ðŸ“– LANGUAGE  â†’ UBIQUITOUS_LANGUAGE.md           â”‚
â”‚  3. ðŸ“‹ PROPOSE   â†’ openspec new change "name"      â”‚
â”‚  4. ðŸ“ DESIGN    â†’ design.md (Architektur)          â”‚
â”‚  5. âœ… TASKS     â†’ tasks.md (Atomare Schritte)      â”‚
â”‚  6. ðŸ§  CONTEXT   â†’ ADRs + GSD Checkpoint           â”‚
â”‚  7. âš¡ BUILD     â†’ Code nach tasks.md               â”‚
â”‚  8. ðŸ§ª TEST      â†’ TestStraÃŸe + Playwright          â”‚
â”‚  9. ðŸ“ DOC       â†’ README + llms.txt                â”‚
â”‚ 10. ðŸ”„ COMMIT    â†’ Git + openspec archive           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## â•â•â• PHASE 1: Grill-With-Docs (von Power+) â•â•â•

### Schritt 1: Ubiquitous Language
Erstelle `UBIQUITOUS_LANGUAGE.md` im Projekt-Root:

```markdown
# Ubiquitous Language

## Terms
- **[Begriff]**: [PrÃ¤zise Definition wie in DIESEM Projekt verwendet]

## Anti-Terms (NICHT verwenden)
- **[Verwirrender Begriff]** â†’ Nutze **[korrekter Begriff]**

## Scope
- [Was ist IN scope]
- [Was ist OUT of scope]
```

### Schritt 2: Grill-Session
1. **5+ Runden probing questions** Ã¼ber die Domain
2. **Annahmen hinterfragen** â€” "Warum nicht X statt Y?"
3. **Entscheidungen dokumentieren** als ADRs
4. **Stoppen wenn** die KI deine Design-Entscheidungen vorhersagen kann

---

## â•â•â• PHASE 2: OpenSpec Spec-Driven (NEU) â•â•â•

### Schritt 3: Change Proposal erstellen
```bash
openspec new change "<kebab-case-name>"
```

### Schritt 4: Artifacts generieren
```bash
# Build-Reihenfolge holen
openspec status --change "<name>" --json

# FÃ¼r jedes Artifact:
openspec instructions <artifact-id> --change "<name>" --json
```

**Artifact-Reihenfolge:**
1. `proposal.md` â€” Was & Warum
2. `design.md` â€” Wie (Architektur, Tech-Stack)
3. `tasks.md` â€” Atomare Implementierungs-Schritte

### Schritt 5: Validierung
```bash
openspec validate "<name>"
openspec status --change "<name>"
```

---

## â•â•â• PHASE 3: Build + Test (von Power+) â•â•â•

### Schritt 6: Code nach Tasks
- Arbeite tasks.md ab â€” ein Task nach dem anderen
- **Ralph-Loopâ„¢**: Task â†’ Spawn â†’ Execute â†’ Verify â†’ Commit â†’ Loop
- **DkZ Design System v2** ist Standard
- `esc()` bei jedem User-Input â€” XSS-Schutz

### Schritt 7: Tests
- **TestStraÃŸe v3.0.0**: Playwright E2E Smoke Tests
- Browser-Test mit Aufnahme (`/browser-test`)
- Feature-Test pro Modul

### Schritt 8: Dokumentation
- `README.md` im Modul-Ordner
- `features.json` aktualisieren
- `llms.txt` fÃ¼r neue Endpoints
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

## â•â•â• REGELN â•â•â•

1. **NIEMALS** die Grill-Phase Ã¼berspringen â€” Context Alignment ist Pflicht
2. **IMMER** `openspec new change` BEVOR Code geschrieben wird
3. **ADRs** sind Pflicht fÃ¼r jede Architektur-Entscheidung
4. **GSD Checkpoints** nach jeder signifikanten Arbeitseinheit
5. **Design Tokens** aus DkZ Design System v2 â€” keine hardcoded Werte
6. **TestStraÃŸe** muss bestehen vor Commit
7. **Dateien sind heilig** â€” nie lÃ¶schen, immer erst kopieren â†’ verifizieren
8. **OpenSpec archive** nach Abschluss jedes Changes

---

## â•â•â• OPENSPEC CLI QUICK REFERENCE â•â•â•

| Befehl | Aktion |
|:-------|:-------|
| `openspec new change "name"` | Neuen Change erstellen |
| `openspec status` | Dashboard anzeigen |
| `openspec instructions <artifact>` | Artifact-Anleitung |
| `openspec validate "name"` | Change validieren |
| `openspec archive "name"` | Change abschlieÃŸen |
| `openspec list --changes` | Alle Changes listen |
| `openspec list --specs` | Alle Specs listen |
| `openspec view` | Interaktives Dashboard |

---

## â•â•â• TRIGGER VERGLEICH â•â•â•

| Trigger | Was es macht |
|:--------|:-------------|
| `/power` | Basic Superpowers Lab |
| `/power+` | Grill + DDD + ADR + Agent Harness + Superpowers |
| **`/+`** | **ALLES von /power+ PLUS OpenSpec Spec-Driven Development** |

---

## Sources
- Matt Pocock: /grill-with-docs (aihero.dev)
- Fission-AI: OpenSpec v1.3.1 (github.com/Fission-AI/OpenSpec)
- DkZâ„¢: Ralph-Loop, TestStraÃŸe, BMAD, Free AI Hub
