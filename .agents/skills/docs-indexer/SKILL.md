---
name: docs-indexer
description: Durchsucht und indexiert alle Dateien in User/Documents und erstellt einen strukturierten Katalog mit Querverweisen zum DEVKiTZ-Oekosystem.
---

# Documents Indexer

> Erstellt einen vollstaendigen Index aller Dateien in `C:\Users\BAZE²\Documents\`

## Ablauf

### Schritt 1: Scan
```powershell
$docs = Get-ChildItem -Path "$env:USERPROFILE\Documents" -Recurse -File -ErrorAction SilentlyContinue |
    Select-Object Name, FullName, Length, LastWriteTime, Extension |
    Sort-Object LastWriteTime -Descending
$docs | ConvertTo-Json -Depth 3 | Out-File "C:\DEVKiTZ\04_SYSTEM\docs-index.json" -Encoding utf8
Write-Host "Indexiert: $($docs.Count) Dateien"
```

### Schritt 2: Kategorisieren
Ordne jede Datei einer DEVKiTZ-Kategorie zu:
- `DEVKiTZ_Plaene/` → Implementierungsplaene
- `DkZ-NLM-*` → NotebookLM Content
- `SecondBrain/` → Obsidian Vault
- `playbooks/` → Playbook-Archiv
- `prompts/` + `prompt/` → Prompt-Bibliothek
- `*.zip` / `*.rar` → Backups → `99_ARCHIVE`

### Schritt 3: Report
Erstelle `C:\DEVKiTZ\04_SYSTEM\docs-index-report.md` mit:
- Gesamtzahl Dateien und Groesse
- Kategorisierung
- Verwaiste Dateien (keiner Kategorie zugeordnet)
- Duplikat-Kandidaten

## Output
- `docs-index.json` — Maschinenlesbarer Index
- `docs-index-report.md` — Menschenlesbarer Report
