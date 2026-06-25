---
description: Master-Workflow der alle Bindings in der richtigen Reihenfolge ausfuehrt (Repos → Drive → Docs → Brain).
---

# /bind-all — Alles anbinden (Master)

> **Wann:** Session-Start oder nach laengerer Pause
> **Ziel:** Alle externen Systeme synchronisiert und angebunden
> **Regeln:** R1, R2, R3, R7, R8

---

## Phase 1: GitHub Repos → /bind-repos
Alle 21 Repos klonen/pullen.

## Phase 2: Google Drive → /bind-drive
Drive-Sync + Backup ausfuehren.

## Phase 3: Dokumente → /bind-docs
User/Documents indexieren, Plaene sichern, NLM-Content verlinken.

## Phase 4: SecondBrain → /bind-brain
Obsidian Vault synchronisieren und backuppen.

## Phase 5: Report

Zusammenfassender Report aller 4 Phasen:
```
╔═══════════════════════════════════════╗
║  /bind-all Ergebnis                   ║
╠═══════════════════════════════════════╣
║  Repos:    21/21 synchronisiert       ║
║  Drive:    XXX Dateien synchronisiert  ║
║  Docs:     XXX Dateien indexiert       ║
║  Brain:    Git pushed + Backup         ║
╚═══════════════════════════════════════╝
```

## Checkliste (ALLES muss ✅ sein)
- [ ] /bind-repos ✅
- [ ] /bind-drive ✅
- [ ] /bind-docs ✅
- [ ] /bind-brain ✅
- [ ] Report erstellt
- [ ] Git commit: `chore(sync): /bind-all ausgefuehrt`
