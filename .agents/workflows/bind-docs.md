---
description: Indexiert alle User/Documents Dateien, sichert Plaene und synchronisiert NLM-Content mit dem WissenHub.
---

# /bind-docs — Dokumente anbinden

> **Wann:** Neue Dokumente erstellt oder Session-Start
> **Ziel:** Alle User-Dokumente indexiert und ans Oekosystem angebunden
> **Regeln:** R1 (nicht loeschen), R7 (Desktop nur ablegen)

---

## Phase 1: Documents indexieren

// turbo
```powershell
$docs = Get-ChildItem -Path "$env:USERPROFILE\Documents" -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne "desktop.ini" } |
    Select-Object Name, FullName, @{N='SizeKB';E={[math]::Round($_.Length/1KB,1)}}, LastWriteTime, Extension |
    Sort-Object LastWriteTime -Descending
$docs | ConvertTo-Json -Depth 3 | Out-File "C:\DEVKiTZ\04_SYSTEM\docs-index.json" -Encoding utf8
Write-Host "Indexiert: $($docs.Count) Dateien"
```

## Phase 2: Plaene sichern

// turbo
```powershell
$plaene = Get-ChildItem "$env:USERPROFILE\Documents\DEVKiTZ_Plaene" -File
Write-Host "DEVKiTZ_Plaene: $($plaene.Count) Dateien"
$plaene | ForEach-Object { Write-Host "  $($_.Name) ($([math]::Round($_.Length/1KB,1)) KB)" }
```

## Phase 3: NLM Content verlinken

```powershell
$nlmDirs = @("DkZ-NLM-AgentGedaechtnis","DkZ-NLM-Content","DkZ-NLM-NanoBot-Center","DkZ-NLM-Ordnerstruktur")
$nlmIndex = @()
foreach ($dir in $nlmDirs) {
    $path = Join-Path $env:USERPROFILE "Documents\$dir"
    if (Test-Path $path) {
        $files = (Get-ChildItem $path -Recurse -File).Count
        $nlmIndex += @{name=$dir; files=$files; path=$path}
        Write-Host "$dir : $files Dateien"
    }
}
$nlmIndex | ConvertTo-Json | Out-File "C:\DEVKiTZ\04_SYSTEM\nlm-content-index.json"
```

## Checkliste (ALLES muss ✅ sein)
- [ ] docs-index.json erstellt
- [ ] DEVKiTZ_Plaene aufgelistet
- [ ] NLM-Content indexiert
- [ ] nlm-content-index.json erstellt
