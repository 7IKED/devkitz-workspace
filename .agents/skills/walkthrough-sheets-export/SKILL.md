---
name: walkthrough-sheets-export
description: Exportiert Walkthroughs nach Google Sheets via WalkthroughSheets.gs Apps Script.
---

# Walkthrough Sheets Export

> Walkthroughs → Google Sheets

## Voraussetzungen
- Google Apps Script Projekt mit `WalkthroughSheets.gs` deployed
- Apps Script Trigger konfiguriert

## Ablauf

### Schritt 1: Walkthroughs sammeln
Scanne Artefakt-Verzeichnisse:
```powershell
Get-ChildItem -Path "C:\Users\BAZE²\.gemini\antigravity\brain" -Recurse -Filter "walkthrough.md" |
    Select-Object FullName, LastWriteTime
```

### Schritt 2: Format vorbereiten
Konvertiere jedes Walkthrough in Sheets-kompatibles JSON:
```json
{
  "date": "2026-06-25",
  "title": "Walkthrough Titel",
  "content": "Markdown Inhalt",
  "conversation_id": "uuid",
  "tags": ["module", "fix"]
}
```

### Schritt 3: Apps Script triggern
Das `WalkthroughSheets.gs` Script wird ueber den Google Apps Script Trigger ausgefuehrt.
Alternativ: REST API Call via Google Apps Script Execution API.

## Output
- Google Sheets mit allen Walkthroughs
- Durchsuchbar, filterbar, teilbar
