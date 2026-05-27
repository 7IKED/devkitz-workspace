---
description: Automatische Archiv-Pflege und WissenHub/Research-Archive Synchronisation
---

# Archive Maintenance Workflow

> **Wann:** Nach jeder Session, bei Artefakt-Erstellung, wöchentlich
> **Ziel:** Dreifach-Verankerung (Iceberg + Hub + Copilot) sicherstellen
> **Regeln:** R1, R2, R26, R27, R30

---

## Phase 1: ARTEFAKTE SAMMELN

// turbo
1. Prüfe ob neue Artefakte in der aktuellen Session erstellt wurden:
```powershell
$brainDir = "$env:USERPROFILE\.gemini\antigravity\brain"
$today = (Get-Date).ToString("yyyy-MM-dd")
$recent = Get-ChildItem $brainDir -Recurse -File | Where-Object { $_.LastWriteTime -ge (Get-Date).Date }
Write-Output "Neue Artefakte heute: $($recent.Count)"
$recent | ForEach-Object { Write-Output "  → $($_.Name) ($($_.Length) bytes)" }
```

## Phase 2: WISSENHUB SYNC (Iceberg)

2. Neue Artefakte in WissenHub ablegen:
   - **Pfad:** `01_PROJECTS/01_dashboard/modules/wissen-hub/archive/[rubrik]/`
   - **Rubriken:** task, walkthrough, impl-plan, blueprint, scratch, research, report
   - **Dateiname:** `[typ]_[datum]_[titel].md`

// turbo
3. `catalog.json` aktualisieren:
```powershell
$catalogPath = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\wissen-hub\archive\catalog.json"
if (Test-Path $catalogPath) {
    $catalog = Get-Content $catalogPath -Raw | ConvertFrom-Json
    Write-Output "WissenHub Einträge: $($catalog.entries.Count)"
} else {
    Write-Output "WARN: catalog.json nicht gefunden — erstellen!"
}
```

## Phase 3: RESEARCH ARCHIVE SYNC (R30 Dual-Pflicht)

// turbo
4. Research Archive Master-Index prüfen:
```powershell
$masterIndex = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\research-archive\master-index.json"
if (Test-Path $masterIndex) {
    $idx = Get-Content $masterIndex -Raw | ConvertFrom-Json
    Write-Output "Research Archive Einträge: $($idx.entries.Count)"
} else {
    Write-Output "WARN: master-index.json nicht gefunden"
}
```

5. Sicherstellen: **Kein Dokument nur in EINER Datenbank** (R30):
   - Jedes neue Artefakt → WissenHub UND Research Archive
   - catalog.json UND master-index.json aktualisieren

## Phase 4: BRAIN BACKUP

// turbo
6. Brain-Daten nach Research sichern:
```powershell
$brainBackup = "C:\DEVKiTZ\02_RESEARCH\brain-archive"
if (!(Test-Path $brainBackup)) { New-Item -Path $brainBackup -ItemType Directory -Force }
$brainDirs = Get-ChildItem "$env:USERPROFILE\.gemini\antigravity\brain" -Directory | Measure-Object
Write-Output "Brain Conversations: $($brainDirs.Count)"
```

## Phase 5: INTEGRITÄTS-CHECK

// turbo
7. Validierung:
```powershell
# Prüfe ob 99_ARCHIVE nicht leer gelöscht wurde (R1)
$archiveCount = (Get-ChildItem "C:\DEVKiTZ\99_ARCHIVE" -Recurse -File | Measure-Object).Count
Write-Output "99_ARCHIVE Dateien: $archiveCount"

# Prüfe ob Gedächtnis-Dateien existieren
@("CLAUDE.md", "GEMINI.md", "REGELWERK.md") | ForEach-Object {
    $exists = Test-Path "C:\DEVKiTZ\$_"
    Write-Output "$_`: $(if($exists){'✅'}else{'❌ FEHLT!'})"
}
```

## Phase 6: GIT COMMIT

// turbo
8. Alle Archive-Änderungen committen:
```powershell
cd C:\DEVKiTZ
git add -A ; git commit -m "chore(archive): sync WissenHub + Research Archive"
```

## Checkliste

- [ ] Neue Artefakte identifiziert
- [ ] WissenHub catalog.json aktualisiert
- [ ] Research Archive master-index.json aktualisiert
- [ ] Brain Backup vorhanden
- [ ] 99_ARCHIVE intakt (R1)
- [ ] Gedächtnis-Dateien vorhanden
- [ ] Git Commit gemacht
