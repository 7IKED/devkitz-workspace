---
name: nlm-content-sync
description: Synchronisiert alle NotebookLM Content-Ordner (AgentGedaechtnis, Content, NanoBot-Center, Ordnerstruktur) mit dem DEVKiTZ WissenHub.
---

# NLM Content Sync

> Bindet NotebookLM-Exporte ins DEVKiTZ-Oekosystem ein

## Quellen (4 Ordner in User/Documents)
- `DkZ-NLM-AgentGedaechtnis/` — Agent Memory Exports
- `DkZ-NLM-Content/` — NLM Inhalte
- `DkZ-NLM-NanoBot-Center/` — NanoBot Doku
- `DkZ-NLM-Ordnerstruktur/` — Ordner-Blueprints

## Ablauf

### Schritt 1: Scan
```powershell
$nlmDirs = @("DkZ-NLM-AgentGedaechtnis","DkZ-NLM-Content","DkZ-NLM-NanoBot-Center","DkZ-NLM-Ordnerstruktur")
foreach ($dir in $nlmDirs) {
    $path = Join-Path $env:USERPROFILE "Documents\$dir"
    if (Test-Path $path) {
        $count = (Get-ChildItem $path -Recurse -File).Count
        Write-Host "$dir : $count Dateien"
    }
}
```

### Schritt 2: Index erstellen
Erstelle `C:\DEVKiTZ\04_SYSTEM\nlm-content-index.json`

### Schritt 3: WissenHub Anbindung
Erstelle Symlinks oder Verweise im WissenHub Modul:
```powershell
$target = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\wissen-hub\nlm-sources.json"
```

## Output
- Index aller NLM-Inhalte
- WissenHub-Anbindung konfiguriert
