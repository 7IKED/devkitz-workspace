---
name: github-repo-sync
description: Klont, pullt und pusht alle 21 DEVKiTZ GitHub Repos (7IKED) und erstellt einen Status-Report.
---

# GitHub Repo Sync

> Synchronisiert alle 21 privaten Repos unter github.com/7IKED

## Voraussetzungen
- `gh` CLI installiert und authentifiziert (`gh auth status`)
- Git konfiguriert mit SSH oder HTTPS Token

## Repos (21 Total)

### Hauptrepo
- devkitz-workspace

### Projekt-Repos (20)
dkz-dashboard, dkz-datalakehouse, dkz-flyer-pro, dkz-flyer-engine,
dkz-domain-control, dkz-doc-engine, dkz-core, dkz-aiaikirk,
dkz-autopilot, dkz-landing-eu, dkz-wiki-hub, dkz-wispe,
dkz-trading-agents, dkz-chrome-extensions, dkz-fishtts,
dkz-comfyui-bridge, dkz-passkeys, dkz-second-brain,
dkz-ontherun, dkz-graphify

## Ablauf

### Schritt 1: Status pruefen
```powershell
gh repo list 7IKED --limit 50 --json name,url,isPrivate
```

### Schritt 2: Alle Repos klonen (falls nicht lokal vorhanden)
```powershell
$repos = @("devkitz-workspace","dkz-dashboard","dkz-datalakehouse","dkz-flyer-pro","dkz-flyer-engine","dkz-domain-control","dkz-doc-engine","dkz-core","dkz-aiaikirk","dkz-autopilot","dkz-landing-eu","dkz-wiki-hub","dkz-wispe","dkz-trading-agents","dkz-chrome-extensions","dkz-fishtts","dkz-comfyui-bridge","dkz-passkeys","dkz-second-brain","dkz-ontherun","dkz-graphify")
$basePath = "C:\DEVKiTZ\[WORKSPACE]\repos"
New-Item -ItemType Directory -Force -Path $basePath
foreach ($repo in $repos) {
    $repoPath = Join-Path $basePath $repo
    if (Test-Path $repoPath) {
        Write-Host "PULL: $repo" -ForegroundColor Green
        Push-Location $repoPath; git pull; Pop-Location
    } else {
        Write-Host "CLONE: $repo" -ForegroundColor Yellow
        gh repo clone "7IKED/$repo" $repoPath
    }
}
```

### Schritt 3: Report erstellen
Erstelle `C:\DEVKiTZ\04_SYSTEM\repo-sync-report.json` mit Ergebnissen.

## Output
- Alle Repos lokal in `[WORKSPACE]/repos/`
- JSON Report in `04_SYSTEM/`
- Git commit: `chore(repos): github-repo-sync ausgefuehrt`
