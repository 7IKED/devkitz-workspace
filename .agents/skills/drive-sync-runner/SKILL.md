---
name: drive-sync-runner
description: Startet den DkZ Drive Sync v2.0 (drive-sync.js) fuer Desktop-to-Drive Synchronisation mit Sicherheits-Checks.
---

# Drive Sync Runner

> Fuehrt `google-drive-automation/drive-sync.js` aus

## Voraussetzungen
- Node.js 18+ installiert
- `DRIVE_PARENT_ID` in `.env` gesetzt
- `npm install googleapis` in `google-drive-automation/`

## Ablauf

### Schritt 1: Dry-Run (Vorschau)
```powershell
cd C:\DEVKiTZ\google-drive-automation
node drive-sync.js --dry-run -v
```
Pruefe den Report — keine geschuetzten Ordner betroffen?

### Schritt 2: Live-Ausfuehrung
```powershell
node drive-sync.js -v
```

### Schritt 3: Report pruefen
Oeffne `sync-report.json` und validiere:
- Keine Dateien aus 07_NOTEPAD verschoben
- Keine DEEPKEEP-Dateien geloescht (nur kopiert)
- Keine raw-Ordner angefasst

## Geschuetzte Pfade
- `07_NOTEPAD` — ABSOLUT UNANTASTBAR
- `[DEEPKEEP]` — NUR KOPIEREN
- `raw` — IMMER unangetastet
- Desktop — NUR scannen, NIE aendern

## Output
- sync-report.json mit Ergebnissen
- Dateien in Drive 00-99 Struktur sortiert
