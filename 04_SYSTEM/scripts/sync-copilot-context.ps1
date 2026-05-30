#!/usr/bin/env pwsh
# sync-copilot-context.ps1
# Liest Copilot-Aktivitaet aus D-VKITZ und aktualisiert CONTEXT_BRIDGE.md
# Aufruf: .\sync-copilot-context.ps1

$ErrorActionPreference = "SilentlyContinue"
Remove-Item Env:GITHUB_TOKEN -ErrorAction SilentlyContinue
Remove-Item Env:GH_TOKEN -ErrorAction SilentlyContinue

Write-Host "=== DEVKiTZ Context Sync ===" -ForegroundColor Cyan

# 1. Copilot PRs lesen
Write-Host "`n--- Copilot PRs (D-VKITZ/KERN) ---" -ForegroundColor Yellow
$prs = gh pr list --repo D-VKITZ/KERN --state all --limit 10 --json number,title,state,author,createdAt 2>$null | ConvertFrom-Json
foreach ($pr in $prs) {
    $status = if ($pr.state -eq "MERGED") { "[MERGED]" } elseif ($pr.state -eq "OPEN") { "[OPEN]" } else { "[CLOSED]" }
    Write-Host "  $status PR #$($pr.number): $($pr.title) (by $($pr.author.login))"
    
    # PR Kommentare lesen
    $comments = gh pr view $pr.number --repo D-VKITZ/KERN --json comments --jq ".comments[].body" 2>$null
    if ($comments) {
        Write-Host "    Kommentare:" -ForegroundColor Gray
        foreach ($c in ($comments -split "`n" | Select-Object -First 3)) {
            if ($c.Length -gt 80) { $c = $c.Substring(0, 80) + "..." }
            Write-Host "    > $c" -ForegroundColor Gray
        }
    }
}

# 2. Letzte Issues lesen
Write-Host "`n--- Letzte Issues (D-VKITZ/KERN) ---" -ForegroundColor Yellow
$issues = gh issue list --repo D-VKITZ/KERN --state open --limit 10 --json number,title,labels,assignees 2>$null | ConvertFrom-Json
foreach ($issue in $issues) {
    $labelNames = ($issue.labels | ForEach-Object { $_.name }) -join ", "
    Write-Host "  #$($issue.number): $($issue.title)"
    if ($labelNames) { Write-Host "    Labels: $labelNames" -ForegroundColor DarkGray }
}

# 3. Repo Events (letzte Copilot-Aktivitaet)
Write-Host "`n--- Letzte Events ---" -ForegroundColor Yellow
$events = gh api repos/D-VKITZ/KERN/events --jq ".[0:5] | .[].type" 2>$null
foreach ($e in ($events -split "`n")) {
    Write-Host "  Event: $e"
}

# 4. Modul-Repos Issues checken
Write-Host "`n--- Modul-Repos Issues ---" -ForegroundColor Yellow
$moduleRepos = @("copilot-dashboard", "agent-swarm", "graphify", "mirofish-sim", "gitnexus-explorer")
foreach ($repo in $moduleRepos) {
    $count = gh issue list --repo "D-VKITZ/$repo" --state open --json number --jq length 2>$null
    if ($count -gt 0) {
        Write-Host "  D-VKITZ/$repo : $count offene Issues"
    }
}

Write-Host "`n=== Sync Complete ===" -ForegroundColor Green
