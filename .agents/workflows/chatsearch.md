---
name: chatsearch
description: Chat-Sessions durchsuchen, Temp-Daten archivieren, Wissen retten — alles in C:\Users\BAZE²\Documents\DkZ
---

# /chatsearch — Session-Wissen retten

> Skill laden und ausführen: `.agents/skills/chatsearch/SKILL.md`

## Schritte

// turbo-all

### 1. Skill laden
```
Lies `.agents/skills/chatsearch/SKILL.md` und führe den Ablauf aus.
```

### 2. Zeitfenster festlegen
Frage den User nach dem Zeitfenster (Standard: 9 Stunden).

### 3. Temp-Dateien scannen
```powershell
$h = 9
Get-ChildItem $env:TEMP -File | Where-Object { $_.LastWriteTime -gt (Get-Date).AddHours(-$h) -and $_.Extension -match '\.(csv|json|xml|txt|md|html|log)$' -and $_.Length -gt 1KB } | Sort-Object Length -Descending | Format-Table Name, @{L='KB';E={[math]::Round($_.Length/1KB,1)}}, LastWriteTime
```

### 4. Dateien kopieren + konvertieren
- Rohdaten nach `temp-antworten/`
- CSVs als HTML-Tabellen in `csv-als-pdf/`
- Screenshots der Tabellen erstellen

### 5. Session-Artefakte sammeln
- task.md, walkthrough.md, scratchpads aus dem Brain kopieren
- overview.txt als Session-Log

### 6. INDEX.md generieren
```powershell
# Siehe SKILL.md Phase 7
```

### 7. Ergebnis melden
Zeige die Zusammenfassung mit Dateianzahl und Gesamtgröße.
