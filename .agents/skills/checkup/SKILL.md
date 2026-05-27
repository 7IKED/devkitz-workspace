---
name: checkup
description: Tiefe Fehlersuche fuer das DkZ Oekosystem. Ausfuehren wenn etwas nicht stimmt oder Startup ROT meldet.
---

# Checkup — DkZ Deep Diagnostik

> Gruendliche Systemanalyse (~2 Minuten). Geht tiefer als `startup` und scannt alle Subsysteme.

## Wann ausfuehren

- Wenn `startup` ROT meldet
- Wenn der User `/checkup` eingibt
- Bei unerwartetem Verhalten irgendeines Systems
- Mittendrin wenn etwas nicht funktioniert

## Ablauf-Strategie: NanoBot-First

**Wichtig:** Checkup versucht ZUERST ueber die NanoBot-Kommunikation zu pruefen. Nur wenn ein NanoBot einen Fehler meldet, wird das betroffene System im Detail gescannt. Das spart Zeit und Context.

```
1. NanoBot Ping → Alle Systeme schnell pruefen
2. Fehler-Systeme → Deep Scan nur dort wo noetig
3. REDNOTE Update → Ergebnisse speichern
4. Dashboard Refresh → Visueller Bericht
```

## Check-Module

### 1. SSH/VPS Deep Check

```powershell
# Verbindung + System-Health
ssh -o ConnectTimeout=5 kvm8 @"
echo '=== SYSTEM ==='
uptime
echo '=== DISK ==='
df -h / | tail -1
echo '=== MEMORY ==='
free -h | head -2
echo '=== DOCKER ==='
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null
echo '=== N8N HEALTH ==='
curl -s http://localhost:5678/healthz 2>/dev/null || echo 'n8n nicht erreichbar'
echo '=== OLLAMA ==='
curl -s http://localhost:11434/api/version 2>/dev/null || echo 'Ollama nicht erreichbar'
"@
```

Prueft: Uptime, Disk Space (>80% = Warnung), RAM, Docker Container, n8n Worker, Ollama

### 2. GitHub Deep Check

```powershell
# Alle Repos: Letzter Push vs lokaler Stand
$repos = gh repo list 7IKED --limit 30 --json name,updatedAt,pushedAt 2>$null | ConvertFrom-Json
foreach ($r in $repos) {
    $age = [math]::Round(((Get-Date) - [datetime]$r.pushedAt).TotalDays, 1)
    $icon = if ($age -gt 30) { '🔴' } elseif ($age -gt 7) { '🟡' } else { '🟢' }
    Write-Host "$icon $($r.name): $age Tage seit letztem Push"
}
```

Prueft: Repo-Aktualitaet, Branch Sync, Auth-Token Gueltigkeit

### 3. MCP Server Check

```powershell
# ONTHERUN Config lesen und Endpoints testen
$mcpConfig = Get-Content -LiteralPath "C:\DEVKiTZ\04_SYSTEM\ONTHERUN\mcp-config\mcp_config.json" -Raw | ConvertFrom-Json
Write-Host "MCP Config: $($mcpConfig | ConvertTo-Json -Compress)"

# Health Endpoint
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3040/api/v1/health" -TimeoutSec 3
    Write-Host "ONTHERUN Health: $($health | ConvertTo-Json -Compress)"
} catch { Write-Host "ONTHERUN: OFFLINE" }
```

### 4. NanoChat Deep Check

```powershell
# Bridge Status
try {
    $status = Invoke-RestMethod -Uri "http://localhost:3040/api/status" -TimeoutSec 3
    Write-Host "Bridge: $($status | ConvertTo-Json -Compress)"
} catch { Write-Host "Bridge: OFFLINE" }

# NanoBot Clients pruefen
$bots = @("nanobot-antigravity.js", "nanobot-opencode.js")
foreach ($bot in $bots) {
    $path = "C:\DEVKiTZ\04_SYSTEM\scripts\$bot"
    if (Test-Path -LiteralPath $path) { Write-Host "✅ $bot vorhanden" }
    else { Write-Host "❌ $bot FEHLT" }
}
```

### 5. SecondBrain Deep Check

```powershell
$sbPath = "$env:USERPROFILE\Documents\SecondBrain"
git -C $sbPath log --oneline -3 2>$null
git -C $sbPath status --short 2>$null
git -C $sbPath diff --stat 2>$null | Select-Object -Last 1
```

### 6. Drive Sync Check

```powershell
$syncReport = "C:\DEVKiTZ\sync-report.json"
if (Test-Path -LiteralPath $syncReport) {
    $sr = Get-Content -LiteralPath $syncReport -Raw | ConvertFrom-Json
    $age = [math]::Round(((Get-Date) - [datetime]$sr.lastSync).TotalHours, 1)
    Write-Host "Drive Sync: vor $age Stunden"
} else { Write-Host "Drive Sync: sync-report.json FEHLT" }
```

### 7. Free API / ONTHERUN Check

```powershell
try {
    $cascade = Invoke-RestMethod -Uri "http://localhost:3040/api/v1/free-hub/cascade" -Method POST -Body '{"message":"health-check-ping"}' -ContentType "application/json" -TimeoutSec 5
    Write-Host "Free API Cascade: OK"
} catch { Write-Host "Free API Cascade: OFFLINE" }
```

### 8. Modul-Integritaet (122 Module)

```powershell
$modulesPath = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules"
$issues = @()
Get-ChildItem -LiteralPath $modulesPath -Directory | ForEach-Object {
    $checks = @()
    if (!(Test-Path "$($_.FullName)\index.html")) { $checks += "kein index.html" }
    $html = Get-Content "$($_.FullName)\index.html" -Raw -ErrorAction SilentlyContinue
    if ($html -match 'innerHTML' -and $html -notmatch 'function\s+esc') { $checks += "kein esc()" }
    if ($html -match '[aeoeueAeOeUess]') { $checks += "R31 Umlaute" }
    if ($checks.Count -gt 0) { $issues += "$($_.Name): $($checks -join ', ')" }
}
Write-Host "Modul-Probleme: $($issues.Count)"
$issues | ForEach-Object { Write-Host "  ⚠️ $_" }
```

### 9. Skills Check

```powershell
Get-ChildItem -LiteralPath "C:\DEVKiTZ\.agents\skills" -Directory | ForEach-Object {
    $skillMd = "$($_.FullName)\SKILL.md"
    if (!(Test-Path -LiteralPath $skillMd)) { Write-Host "❌ $($_.Name): kein SKILL.md" }
}
```

### 10. Workflows Check

```powershell
Get-ChildItem -LiteralPath "C:\DEVKiTZ\.agents\workflows" -File -ErrorAction SilentlyContinue | ForEach-Object {
    $age = [math]::Round(((Get-Date) - $_.LastWriteTime).TotalDays, 1)
    $icon = if ($age -gt 30) { '⚠️' } else { '✅' }
    Write-Host "$icon $($_.Name): $age Tage alt"
}
```

### 11. llms.txt Aktualitaet

```powershell
$llms = Get-Content -LiteralPath "C:\DEVKiTZ\llms.txt" -Raw
# Port-Referenzen pruefen
if ($llms -match 'localhost:3040') { Write-Host "✅ ONTHERUN Port korrekt" }
if ($llms -match 'localhost:8765') { Write-Host "✅ Pi Agent Port referenziert" }
```

### 12. Pattern Check (CSS/JS)

```powershell
$shared = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\shared"
$clCount = 0
Get-ChildItem -LiteralPath $shared -Filter "*.js" | ForEach-Object {
    $c = Get-Content $_.FullName -Raw
    $matches = [regex]::Matches($c, 'console\.log\(')
    $clCount += $matches.Count
}
Write-Host "Console.log in Shared: $clCount Aufrufe"
```

### 13. Agent Registry Check

```powershell
$agentsMd = "C:\DEVKiTZ\.agents\AGENTS.md"
if (Test-Path -LiteralPath $agentsMd) { Write-Host "✅ AGENTS.md vorhanden" }
else { Write-Host "❌ AGENTS.md FEHLT in .agents/" }
```

### 14. Graphify Context Check

```powershell
$graphify = "C:\DEVKiTZ\graphify"
if (Test-Path -LiteralPath "$graphify\pyproject.toml") {
    Write-Host "✅ Graphify Projekt intakt"
    python -c "import graphify" 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "✅ Graphify importierbar" }
    else { Write-Host "⚠️ Graphify nicht importierbar" }
}
```

## REDNOTE Integration

Nach jedem Check werden gefundene Fehler automatisch in REDNOTE.json geschrieben:

```powershell
# Beispiel: Fehler eintragen
node C:\DEVKiTZ\04_SYSTEM\scripts\rednote-collector.js add --severity warning --category ssh --system "KVM8" --message "Disk usage > 80%"
```

## Ketten-Befehle via NanoChat

```
/checkup:ssh     → Nur SSH/VPS pruefen
/checkup:git     → Nur GitHub pruefen
/checkup:modules → Nur Module pruefen
/checkup:api     → Nur API/MCP pruefen
/checkup:full    → Alles pruefen
/checkup:fix     → Automatisch behebbare Fehler fixen
```

## Output-Format

```
══════════════════════════════════════════════
  DkZ CHECKUP — Deep Diagnostik
  2026-05-18 18:45 · Dauer: 47s
══════════════════════════════════════════════

  🖥️ INFRASTRUKTUR
  ├─ ✅ SSH KVM8: Online (46d, 8 containers)
  ├─ ⚠️ SSH OpenClaw: Timeout
  └─ ✅ Docker: n8n + 3 worker + ollama

  🔗 VERBINDUNGEN
  ├─ ✅ GitHub: 7IKED auth OK, 20 repos
  ├─ ⚠️ MCP: Config OK, Gateway offline
  ├─ ❌ NanoChat: Bridge offline
  └─ ✅ Free API: Cascade OK

  📂 DATEN
  ├─ ✅ SecondBrain: 3 uncommitted
  ├─ ⚠️ Drive Sync: 48h alt
  └─ ✅ REDNOTE: 0 kritisch

  📦 MODULE (122)
  ├─ ⚠️ 14 ohne esc()
  ├─ ⚠️ 7 mit Umlauten
  └─ ✅ 117/122 mit index.html

  🛡️ SICHERHEIT
  └─ ⚠️ 21 console.log in shared

  🤖 AGENTEN
  ├─ ✅ 40 Skills in .agents
  ├─ ❌ AGENTS.md fehlt
  └─ ✅ 2 NanoBots registriert

══════════════════════════════════════════════
  ERGEBNIS: 🟡 GELB — 8 Warnungen, 2 Fehler
  REDNOTE: 2 neue Eintraege geschrieben
══════════════════════════════════════════════
```

## Wichtig

- Checkup aendert NICHTS am System — nur lesen und berichten
- Fixes nur mit `/checkup:fix` und expliziter Bestaetigung
- Ergebnisse werden IMMER in REDNOTE.json persistiert
- Funktioniert identisch in Antigravity / OpenCode / Hermes
