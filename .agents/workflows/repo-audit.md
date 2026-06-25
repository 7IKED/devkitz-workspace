---
description: Prueft alle 21 GitHub Repos auf Vollstaendigkeit und erstellt einen Ampel-Report.
---

# /repo-audit — Repository Audit

> **Wann:** Nach /bind-repos oder bei Qualitaetspruefung
> **Ziel:** Ampel-Status aller Repos (GRUEN/GELB/ROT)
> **Regeln:** R8

---

## Phase 1: Repo-Liste laden

// turbo
```powershell
$repos = @("devkitz-workspace","dkz-dashboard","dkz-datalakehouse","dkz-flyer-pro","dkz-flyer-engine","dkz-domain-control","dkz-doc-engine","dkz-core","dkz-aiaikirk","dkz-autopilot","dkz-landing-eu","dkz-wiki-hub","dkz-wispe","dkz-trading-agents","dkz-chrome-extensions","dkz-fishtts","dkz-comfyui-bridge","dkz-passkeys","dkz-second-brain","dkz-ontherun","dkz-graphify")
```

## Phase 2: Health-Check pro Repo

```powershell
$report = @()
foreach ($repo in $repos) {
    try {
        $contents = gh api "repos/7IKED/$repo/contents" --jq '.[].name' 2>$null
        $hasReadme = $contents -contains "README.md"
        $hasLlms = $contents -contains "llms.txt"
        $hasGitignore = $contents -contains ".gitignore"
        $hasPkg = ($contents -contains "package.json") -or ($contents -contains "pyproject.toml")
        $score = @($hasReadme, $hasLlms, $hasGitignore, $hasPkg) | Where-Object { $_ } | Measure-Object | Select-Object -Expand Count
        $status = if ($score -ge 3) { "GRUEN" } elseif ($score -ge 2) { "GELB" } else { "ROT" }
        $report += @{repo=$repo; status=$status; score="$score/4"; readme=$hasReadme; llms=$hasLlms}
    } catch {
        $report += @{repo=$repo; status="ROT"; score="ERR"; readme=$false; llms=$false}
    }
}
```

## Phase 3: Report

Erstelle `C:\DEVKiTZ\04_SYSTEM\repo-health-report.md`

## Checkliste
- [ ] Alle 21 Repos geprueft
- [ ] Ampel-Report erstellt
- [ ] Empfehlungen dokumentiert
