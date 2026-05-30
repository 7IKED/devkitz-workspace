---
description: Batch fix all modules for DkZ compliance
---

# Batch Module Fix

Scanne ALLE Module in `01_PROJECTS/01_dashboard/modules/` und fixe sie.

## Fuer JEDES Modul:

1. **Pruefe** ob index.html existiert → wenn nicht, ueberspringe
2. **XSS Check**: `innerHTML` ohne `esc()` → Fix mit esc()
3. **CSS Variables**: Hardcoded HEX → `var(--accent)` etc.
4. **Shared Scripts**: Fehlende Scripts am Body-Ende → hinzufuegen
5. **Meta Tags**: `dkz-version` fehlt → hinzufuegen
6. **Hub Button**: Fehlt → hinzufuegen

## Batch-Strategie

- Maximal 10 Module pro PR
- Commit pro Modul: `fix({moduleName}): DkZ Compliance`
- PR Titel: `fix: DkZ Compliance Batch {N} ({count} Module)`
- PR Body: Tabelle mit allen Modulen und gefundenen Problemen
- Label: `🤖 copilot`, `🔧 fix`, `📱 handy`
- Reviewer: @7IKED

## Prioritaet

1. Module mit XSS-Luecken zuerst (🔴)
2. Module ohne Shared Scripts (🟡)
3. Module ohne Meta Tags (🟢)
