---
description: Features.json erstellen und Feature-Status pflegen
---

# Feature Registry — features.json Workflow

## Was ist features.json?
Jedes Modul und Dashboard im DkZ System hat eine `features.json` Datei.
Diese Datei beschreibt:
- Welche Features das Modul hat
- Welchen Status jedes Feature hat (geplant, in Arbeit, fertig)
- Welche Bugs bekannt sind
- Was sich geändert hat (Versions-Log)
- Wie ein LLM mit dem Modul arbeiten soll

## Wo liegt features.json?
IMMER im selben Ordner wie die index.html des Moduls.
```
c:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\MODUL-NAME\features.json
```

## ID-System — Nummern und Prefixe

### Modul-IDs
- Module: `MOD-001` bis `MOD-052` (vergeben)
- Nächste freie Modul-ID: `MOD-053`
- Dashboards: `DSH-001` bis `DSH-013` (vergeben)
- Nächste freie Dashboard-ID: `DSH-014`

### Feature-IDs
- Features: `FT-001` bis `FT-541` (vergeben)
- Nächste freie Feature-ID: `FT-542`

### Issue-IDs
- Issues: `ISS-001` bis `ISS-052` (vergeben)
- Nächste freie Issue-ID: `ISS-053`

### Debug-IDs
- Debug: `DBG-001` bis `DBG-052` (vergeben)
- Nächste freie Debug-ID: `DBG-053`

## Feature-Status Werte (nur diese 3 sind erlaubt)
| Status | Bedeutung | Wann verwenden |
|--------|-----------|---------------|
| `"planned"` | Feature ist geplant, aber noch nicht gebaut | Neue Features die nicht existieren |
| `"wip"` | Feature wird gerade gebaut | Aktuell in Arbeit |
| `"done"` | Feature ist fertig und funktioniert | Nach erfolgreichem Test |

## VOLLSTÄNDIGES Template

Kopiere dieses Template für ein neues Modul.
ERSETZE alle Werte in GROSSBUCHSTABEN.

```json
{
  "id": "MOD-NUMMER",
  "name": "MENSCHENLESBARER NAME",
  "folder": "modules/ORDNER-NAME",
  "version": "v0.01",
  "description": "WAS MACHT DAS MODUL - EIN SATZ",
  "specs": {
    "ui": "HTML5 + DkZ CSS v2 + Vanilla JS",
    "code": "Single-File index.html",
    "lines": 0,
    "rating": 0,
    "frequency": "mittel"
  },
  "features": [
    {
      "id": "FT-NUMMER",
      "name": "FEATURE NAME",
      "status": "done",
      "desc": "WAS DAS FEATURE MACHT"
    }
  ],
  "issues": [],
  "debug": [],
  "updateLog": [
    {
      "version": "v0.01",
      "date": "JJJJ-MM-TT",
      "changes": [
        "Initial: KURZE BESCHREIBUNG DER ERSTEN VERSION"
      ]
    }
  ],
  "_llm": {
    "contextFile": "modules/ORDNER-NAME/features.json",
    "noFullUpload": true,
    "logTo": "modules/ORDNER-NAME/_logs/",
    "readFirst": [
      "BLAUPAUSE.md",
      "DKZ_CSS_V2_PRIMARY.css"
    ]
  },
  "prompt": "Erstelle/aktualisiere das DkZ Modul 'NAME' (modules/ORDNER/index.html): BESCHREIBUNG. DkZ v2 Design (#FF3131, schwarz). Footer: © 2024-2026 DEVKiTZ™."
}
```

## _llm Objekt — Erklärung für KI-Modelle

Das `_llm` Objekt sagt dir als KI-Modell:
- `contextFile`: Wo bin ich? Diese Datei.
- `noFullUpload`: true = Lade NICHT das ganze Projekt hoch!
- `logTo`: Schreibe Änderungs-Logs in diesen Ordner.
- `readFirst`: Lies DIESE Dateien BEVOR du anfängst zu arbeiten.

## Workflow: Neues Feature hinzufügen

1. Öffne `modules/MODUL/features.json`
2. Gehe zum `features` Array
3. Füge neues Objekt hinzu:
```json
{
  "id": "FT-NAECHSTE-NUMMER",
  "name": "Feature Name",
  "status": "planned",
  "desc": "Beschreibung"
}
```
4. Speichere die Datei
5. Status ändern wenn implementiert: `"planned"` → `"wip"` → `"done"`

## Workflow: Bug melden

1. Öffne `modules/MODUL/features.json`
2. Gehe zum `issues` Array
3. Füge hinzu:
```json
{
  "id": "ISS-NAECHSTE-NUMMER",
  "severity": "high",
  "desc": "Was ist der Fehler"
}
```
4. `severity` Werte: `"critical"`, `"high"`, `"medium"`, `"low"`
