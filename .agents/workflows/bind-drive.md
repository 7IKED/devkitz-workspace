---
description: Startet den Drive-Sync, DriveOrganizer und SecondBrain Backup in Reihenfolge.
---

# /bind-drive — Google Drive anbinden

> **Wann:** Taeglicher Sync oder nach Datei-Aenderungen
> **Ziel:** Lokale Dateien → Drive 00-99 synchronisiert
> **Regeln:** R1 (nicht loeschen), R2 (07_NOTEPAD unantastbar), R3 (DEEPKEEP nur kopieren)

---

## Phase 1: Dry-Run (Vorschau)

// turbo
```powershell
cd C:\DEVKiTZ\google-drive-automation
node drive-sync.js --dry-run -v
```
Pruefe Output: Keine geschuetzten Pfade betroffen?

## Phase 2: Live-Sync

```powershell
node drive-sync.js -v
```

## Phase 3: SecondBrain Backup

```powershell
node second-brain-backup.js
```

## Phase 4: Report pruefen

Oeffne `sync-report.json` und validiere Ergebnisse.

## Checkliste (ALLES muss ✅ sein)
- [ ] Dry-Run ohne Fehler
- [ ] Live-Sync ohne geschuetzte Pfade
- [ ] SecondBrain Backup erstellt
- [ ] sync-report.json validiert
