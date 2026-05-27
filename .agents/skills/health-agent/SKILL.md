---
name: health-agent
description: Universeller Health-Check Agent — orchestriert skill, workflow, pattern, agent und llms.txt Pruefungen. Einzeln oder als Kette ausfuehrbar.
---

# Health Agent — DkZ Universeller Pruefer

> Meta-Agent der verschiedene Check-Typen orchestriert. Aufruf ueber Befehle.

## Befehle

| Befehl | Prueft | Dauer |
|:-------|:-------|:------|
| `/health skill` | Alle Skills auf SKILL.md, Syntax, Abhaengigkeiten | ~10s |
| `/health workflow` | `.agents/workflows/` Aktualitaet + Validitaet | ~5s |
| `/health pattern` | CSS Variables, esc(), console.log, R31 Umlaute | ~15s |
| `/health agent` | BMAD Agenten-Registry, James Config, NanoBots | ~10s |
| `/health llms` | llms.txt Aktualitaet, Port-Referenzen, Endpoints | ~10s |
| `/health module [name]` | Einzelnes Modul tief pruefen | ~5s |
| `/health full` | Alles (startup + checkup + alle obigen) | ~3min |

## Ablauf pro Befehl

### `/health skill`

```powershell
$skillsPath = "C:\DEVKiTZ\.agents\skills"
Get-ChildItem -LiteralPath $skillsPath -Directory | ForEach-Object {
    $skillMd = "$($_.FullName)\SKILL.md"
    $checks = @()
    
    # 1. SKILL.md existiert?
    if (!(Test-Path -LiteralPath $skillMd)) { $checks += "SKILL.md FEHLT"; return }
    
    # 2. Frontmatter vorhanden? (name + description)
    $content = Get-Content -LiteralPath $skillMd -Raw
    if ($content -notmatch '^---') { $checks += "Kein Frontmatter" }
    if ($content -notmatch 'name:') { $checks += "Kein name: im Frontmatter" }
    if ($content -notmatch 'description:') { $checks += "Keine description:" }
    
    # 3. Mindestlaenge
    if ($content.Length -lt 200) { $checks += "Zu kurz (<200 Zeichen)" }
    
    if ($checks.Count -eq 0) { Write-Host "  ✅ $($_.Name)" }
    else { Write-Host "  ⚠️ $($_.Name): $($checks -join ', ')" }
}
```

### `/health workflow`

```powershell
$wfPath = "C:\DEVKiTZ\.agents\workflows"
Get-ChildItem -LiteralPath $wfPath -File -ErrorAction SilentlyContinue | ForEach-Object {
    $age = [math]::Round(((Get-Date) - $_.LastWriteTime).TotalDays, 1)
    if ($age -gt 60) { Write-Host "  🔴 $($_.Name): $age Tage alt (VERALTET)" }
    elseif ($age -gt 30) { Write-Host "  🟡 $($_.Name): $age Tage alt" }
    else { Write-Host "  ✅ $($_.Name): $age Tage alt" }
}
```

### `/health pattern`

```powershell
# CSS Hardcoded Check (alle Module)
$modulesPath = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules"
$hardcoded = @(); $noEsc = @(); $umlauts = @(); $consoleLogs = 0

Get-ChildItem -LiteralPath $modulesPath -Recurse -Filter "index.html" | ForEach-Object {
    $html = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($html -match '#fa1e4e' -and $html -notmatch 'var\(--') { $hardcoded += $_.Directory.Name }
    if ($html -match 'innerHTML' -and $html -notmatch 'function\s+esc') { $noEsc += $_.Directory.Name }
    if ($html -match '[aeoeueAeOeUess]') { $umlauts += $_.Directory.Name }
}

$sharedPath = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\shared"
Get-ChildItem -LiteralPath $sharedPath -Filter "*.js" | ForEach-Object {
    $consoleLogs += ([regex]::Matches((Get-Content $_.FullName -Raw), 'console\.log\(')).Count
}

Write-Host "  Hardcoded Farben: $($hardcoded.Count) Module"
Write-Host "  Ohne esc() (XSS): $($noEsc.Count) Module"
Write-Host "  R31 Umlaute: $($umlauts.Count) Module"
Write-Host "  console.log: $consoleLogs Aufrufe in Shared"
```

### `/health agent`

```powershell
# BMAD Agenten Check
$agentsMd = "C:\DEVKiTZ\.agents\AGENTS.md"
if (Test-Path -LiteralPath $agentsMd) { Write-Host "  ✅ AGENTS.md vorhanden" }
else { Write-Host "  ❌ AGENTS.md FEHLT" }

# NanoBots
Get-ChildItem -LiteralPath "C:\DEVKiTZ\04_SYSTEM\scripts" -Filter "nanobot-*" | ForEach-Object {
    Write-Host "  ✅ $($_.Name)"
}

# James Config
$jamesJs = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\shared\dkz-james.js"
if (Test-Path -LiteralPath $jamesJs) { Write-Host "  ✅ James Guardian: $([math]::Round((Get-Item $jamesJs).Length/1KB,1)) KB" }
```

### `/health llms`

```powershell
$llmsPath = "C:\DEVKiTZ\llms.txt"
if (Test-Path -LiteralPath $llmsPath) {
    $content = Get-Content $llmsPath -Raw
    $age = [math]::Round(((Get-Date) - (Get-Item $llmsPath).LastWriteTime).TotalDays, 1)
    Write-Host "  Alter: $age Tage"
    
    # Port-Checks aus llms.txt extrahieren
    $ports = [regex]::Matches($content, 'localhost:(\d+)') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
    foreach ($port in $ports) {
        try {
            $tcp = New-Object System.Net.Sockets.TcpClient
            $tcp.Connect("localhost", [int]$port)
            $tcp.Close()
            Write-Host "  ✅ Port $port: Erreichbar"
        } catch {
            Write-Host "  ❌ Port $port: Nicht erreichbar"
        }
    }
}
```

### `/health module [name]`

```powershell
param($moduleName)
$modPath = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\$moduleName"
if (!(Test-Path -LiteralPath $modPath)) { Write-Host "Modul '$moduleName' nicht gefunden"; return }

Write-Host "=== Modul: $moduleName ==="
$files = Get-ChildItem -LiteralPath $modPath -File
foreach ($f in $files) { Write-Host "  $($f.Name) ($([math]::Round($f.Length/1KB,1)) KB)" }

$idx = "$modPath\index.html"
if (Test-Path $idx) {
    $html = Get-Content $idx -Raw
    Write-Host "  Data-Attributes:"
    if ($html -match 'data-dkz-title="([^"]+)"') { Write-Host "    Title: $($Matches[1])" }
    if ($html -match 'data-dkz-version="([^"]+)"') { Write-Host "    Version: $($Matches[1])" }
    if ($html -match 'data-dkz-appid="([^"]+)"') { Write-Host "    AppID: $($Matches[1])" }
    
    # Quality Checks
    if ($html -match 'function\s+esc') { Write-Host "  ✅ esc() vorhanden" } else { Write-Host "  ❌ esc() FEHLT" }
    if ($html -match 'dkz-navbar\.js') { Write-Host "  ✅ Navbar eingebunden" } else { Write-Host "  ⚠️ Navbar fehlt" }
    if ($html -match 'dkz-debug\.js') { Write-Host "  ✅ Debug eingebunden" } else { Write-Host "  ⚠️ Debug fehlt" }
    if ($html -match 'dkz-guide\.js') { Write-Host "  ✅ Guide eingebunden" } else { Write-Host "  ⚠️ Guide fehlt" }
}
```

## Python Chain Integration

Fuer automatische Checks den Python Chain Runner nutzen:

```powershell
# Einzelne Checks
python C:\DEVKiTZ\04_SYSTEM\scripts\health-check-chain.py ssh git

# Alles + REDNOTE Update  
python C:\DEVKiTZ\04_SYSTEM\scripts\health-check-chain.py --rednote

# JSON Output (fuer Dashboard)
python C:\DEVKiTZ\04_SYSTEM\scripts\health-check-chain.py --json
```

## NanoChat Integration

Der Health Agent kann ueber NanoChat angesprochen werden:
```
/health:ping    → Schneller Alive-Check aller NanoBots
/health:report  → Letzten REDNOTE Bericht anzeigen
/health:fix     → Automatisch behebbare Fehler fixen (mit Bestaetigung)
```

## LLM-Unabhaengigkeit

Alle Checks basieren auf:
- PowerShell / Shell Befehle
- Python Script (health-check-chain.py)
- Node.js (rednote-collector.js)

Kein LLM-spezifischer Code. Funktioniert identisch in Antigravity, OpenCode, Hermes, und auf dem VPS.
