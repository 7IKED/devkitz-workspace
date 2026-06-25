---
name: repo-health-check
description: Prueft alle 21 GitHub Repos auf Vollstaendigkeit (README, llms.txt, Issues, .gitignore) und erstellt einen Ampel-Report.
---

# Repo Health Check

> Ampel-Pruefung aller DEVKiTZ GitHub Repositories

## Ablauf

### Schritt 1: Repo-Liste laden
Lade die offizielle Liste aus `C:\DEVKiTZ\docs\REPOS.md` (21 Repos).

### Schritt 2: Pro Repo pruefen
Fuer jedes Repo via `gh api`:
```powershell
$repos = @("devkitz-workspace","dkz-dashboard","dkz-datalakehouse","dkz-flyer-pro","dkz-flyer-engine","dkz-domain-control","dkz-doc-engine","dkz-core","dkz-aiaikirk","dkz-autopilot","dkz-landing-eu","dkz-wiki-hub","dkz-wispe","dkz-trading-agents","dkz-chrome-extensions","dkz-fishtts","dkz-comfyui-bridge","dkz-passkeys","dkz-second-brain","dkz-ontherun","dkz-graphify")
foreach ($repo in $repos) {
    $info = gh repo view "7IKED/$repo" --json name,description,hasIssuesEnabled,defaultBranchRef 2>$null
    # Pruefe: README.md, llms.txt, .gitignore, package.json/pyproject.toml
    $contents = gh api "repos/7IKED/$repo/contents" --jq '.[].name' 2>$null
    # Bewertung: GRUEN (alles da), GELB (teilweise), ROT (fehlt viel)
}
```

### Schritt 3: Ampel-Report
| Status | Bedeutung |
|:-------|:----------|
| 🟢 GRUEN | README + llms.txt + .gitignore vorhanden |
| 🟡 GELB | Teilweise vorhanden |
| 🔴 ROT | Fehlende Kern-Dateien |

### Schritt 4: Report speichern
`C:\DEVKiTZ\04_SYSTEM\repo-health-report.md`

## Output
- Ampel-Report mit Status pro Repo
- Liste fehlender Dateien pro Repo
- Empfehlungen
