---
name: plan-archiver
description: Sichert alle Implementierungsplaene aus Agent-Sessions in den User/Documents-Ordner und verlinkt sie im WissenHub.
---

# Plan Archiver

> Dreifach-Verankerung aller Implementierungsplaene

## Ablauf

### Schritt 1: Plaene sammeln
Scanne alle bekannten Artefakt-Pfade:
- `C:\Users\BAZE²\.gemini\antigravity\brain\*\artifacts\implementation_plan.md`
- `C:\Users\BAZE²\.gemini\antigravity\brain\*\artifacts\walkthrough.md`
- `C:\Users\BAZE²\.gemini\antigravity\brain\*\artifacts\task.md`

### Schritt 2: Kopieren
Kopiere mit Zeitstempel nach:
`C:\Users\BAZE²\Documents\DEVKiTZ_Plaene\`
Namensformat: `XX_<beschreibung>.md` (fortlaufend nummeriert)

### Schritt 3: WissenHub Eintrag
Erstelle Eintrag in `modules/wissen-hub/archive/plaene/catalog.json`

## Output
- Kopien in Documents/DEVKiTZ_Plaene
- WissenHub Katalog-Eintrag
