---
description: DEVKiTZ 1-Klick Setup — Neues System einrichten, Dependencies prüfen, alles konfigurieren
---

# /setup — DEVKiTZ System Setup

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

// turbo-all

## 1. Verzeichnisstruktur prüfen
```powershell
# Pflicht-Ordner
$dirs = @(
    "01_PROJECTS/01_dashboard/hub",
    "01_PROJECTS/01_dashboard/modules",
    "01_PROJECTS/01_dashboard/shared",
    "02_RESEARCH", "04_SYSTEM", "05_INTERN",
    "99_ARCHIVE", "ONTHERUN", "BACKEND",
    ".agents/workflows", ".agents/skills"
)
foreach ($d in $dirs) {
    if (!(Test-Path $d)) { Write-Host "❌ FEHLT: $d" -ForegroundColor Red }
    else { Write-Host "✅ $d" -ForegroundColor Green }
}
```

## 2. Pflicht-Dateien prüfen
```powershell
$files = @("CLAUDE.md", "GEMINI.md", "REGELWERK.md",
    "01_PROJECTS/01_dashboard/BLAUPAUSE.md",
    "01_PROJECTS/01_dashboard/REGISTRY.json")
foreach ($f in $files) {
    if (!(Test-Path $f)) { Write-Host "❌ FEHLT: $f" -ForegroundColor Red }
    else { Write-Host "✅ $f" -ForegroundColor Green }
}
```

## 3. Node.js prüfen
```powershell
node --version  # Soll 18+
npm --version
```

## 4. Git prüfen
```powershell
git status
git log --oneline -5
```

## 5. Shared Scripts zählen
```powershell
$count = (Get-ChildItem "01_PROJECTS/01_dashboard/shared/*.js").Count
Write-Host "Shared Scripts: $count"
```

## 6. Module zählen
```powershell
$mods = (Get-ChildItem "01_PROJECTS/01_dashboard/modules" -Directory).Count
Write-Host "Dashboard Module: $mods"
```
