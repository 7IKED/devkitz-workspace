---
description: Klont oder pullt alle 21 DEVKiTZ GitHub Repos und erstellt einen Sync-Report.
---

# /bind-repos — GitHub Repos anbinden

> **Wann:** Neue Session, neuer Rechner, oder nach laengerer Pause
> **Ziel:** Alle 21 Repos lokal aktuell haben
> **Regeln:** R1 (nicht loeschen), R8 (keine Umlaute)

---

## Phase 1: Voraussetzungen pruefen

// turbo
```powershell
gh auth status
git --version
```

Falls `gh` nicht installiert:
```powershell
winget install GitHub.cli
gh auth login
```

## Phase 2: Repos synchronisieren

// turbo
```powershell
$repos = @("devkitz-workspace","dkz-dashboard","dkz-datalakehouse","dkz-flyer-pro","dkz-flyer-engine","dkz-domain-control","dkz-doc-engine","dkz-core","dkz-aiaikirk","dkz-autopilot","dkz-landing-eu","dkz-wiki-hub","dkz-wispe","dkz-trading-agents","dkz-chrome-extensions","dkz-fishtts","dkz-comfyui-bridge","dkz-passkeys","dkz-second-brain","dkz-ontherun","dkz-graphify")
$base = "C:\DEVKiTZ\[WORKSPACE]\repos"
New-Item -ItemType Directory -Force -Path $base | Out-Null
$results = @()
foreach ($repo in $repos) {
    $repoPath = Join-Path $base $repo
    if (Test-Path $repoPath) {
        Push-Location $repoPath
        git pull 2>&1
        Pop-Location
        $results += @{repo=$repo; action="PULL"; status="OK"}
    } else {
        gh repo clone "7IKED/$repo" $repoPath 2>&1
        $results += @{repo=$repo; action="CLONE"; status="OK"}
    }
}
$results | ConvertTo-Json | Out-File "C:\DEVKiTZ\04_SYSTEM\repo-sync-report.json"
```

## Phase 3: Report

Zeige Ergebnis als Tabelle: Repo | Aktion | Status

## Checkliste (ALLES muss ✅ sein)
- [ ] gh auth status = Authenticated
- [ ] Alle 21 Repos lokal vorhanden
- [ ] repo-sync-report.json erstellt
- [ ] Git commit: `chore(repos): /bind-repos ausgefuehrt`
