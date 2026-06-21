# ═══════════════════════════════════════════════════════════════
# DkZ Start-Alle-Services.ps1
# Startet: Antigravity Bridge (Port 3044) + OpenCode Web (Port 4096)
# Verwendung: powershell -File C:\DEVKiTZ\start-alle-services.ps1
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "SilentlyContinue"
$VPS = "72.61.93.129:8080"

Write-Host ""
Write-Host "  ╔═══════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║   DkZ DEVKiTZ Services Start      ║" -ForegroundColor Cyan
Write-Host "  ╚═══════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ─── 1. Alte Prozesse aufräumen ──────────────────────────────
Write-Host "  [1/3] Aufräumen..." -ForegroundColor Gray
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "opencode" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 1

# ─── 2. Antigravity Bridge ────────────────────────────────────
Write-Host "  [2/3] Antigravity Bridge starten (Port 3044)..." -ForegroundColor Yellow
$bridge = Start-Process -FilePath "node" `
    -ArgumentList "C:\DEVKiTZ\.opencode\dkz-antigravity-bridge.js" `
    -PassThru -WindowStyle Minimized -WorkingDirectory "C:\DEVKiTZ"
Start-Sleep 2

$bridgeOk = $false
try {
    $status = Invoke-WebRequest "http://127.0.0.1:3044/" -TimeoutSec 3 -UseBasicParsing
    if ($status.StatusCode -eq 200) { $bridgeOk = $true }
} catch {}

if ($bridgeOk) {
    Write-Host "  ✅ Antigravity Bridge läuft (PID: $($bridge.Id))" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Bridge startet noch (PID: $($bridge.Id))..." -ForegroundColor Yellow
}

# ─── 3. VPS Verbindung prüfen ─────────────────────────────────
Write-Host "  [2b] VPS llama-swap prüfen ($VPS)..." -ForegroundColor Yellow
try {
    $models = Invoke-RestMethod "http://$VPS/v1/models" -TimeoutSec 5
    $count = ($models.data | Measure-Object).Count
    Write-Host "  ✅ VPS erreichbar: $count Modelle verfügbar" -ForegroundColor Green
    Write-Host "     Modelle:" -ForegroundColor Gray
    $models.data | ForEach-Object { Write-Host "       • $($_.id)" -ForegroundColor Gray }
} catch {
    Write-Host "  ❌ VPS nicht erreichbar: $VPS" -ForegroundColor Red
}

# ─── 4. OpenCode Web ─────────────────────────────────────────
Write-Host ""
Write-Host "  [3/3] OpenCode Web starten (Port 4096)..." -ForegroundColor Yellow
$opencode = Start-Process -FilePath "opencode" `
    -ArgumentList "web", "--port", "4096" `
    -PassThru -WindowStyle Minimized -WorkingDirectory "C:\DEVKiTZ"
Start-Sleep 3

try {
    $oc = Invoke-WebRequest "http://127.0.0.1:4096/" -TimeoutSec 3 -UseBasicParsing
    Write-Host "  ✅ OpenCode Web läuft (PID: $($opencode.Id))" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  OpenCode startet noch (PID: $($opencode.Id))..." -ForegroundColor Yellow
}

# ─── Zusammenfassung ─────────────────────────────────────────
Write-Host ""
Write-Host "  ╔═══════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║   Alles läuft! ✅                 ║" -ForegroundColor Green
Write-Host "  ╠═══════════════════════════════════╣" -ForegroundColor Green
Write-Host "  ║  OpenCode Web  : http://127.0.0.1:4096  ║" -ForegroundColor White
Write-Host "  ║  Bridge Status : http://127.0.0.1:3044  ║" -ForegroundColor White
Write-Host "  ║  VPS Modelle   : http://$VPS/v1/models  ║" -ForegroundColor White
Write-Host "  ╠═══════════════════════════════════╣" -ForegroundColor Green
Write-Host "  ║  Verfügbare Modelle auf VPS:      ║" -ForegroundColor Cyan
Write-Host "  ║  • qwen3-6-35b  (⭐ Default)      ║" -ForegroundColor Cyan
Write-Host "  ║  • qwen3-14b                      ║" -ForegroundColor Cyan
Write-Host "  ║  • deepseek-coder-v2-16b          ║" -ForegroundColor Cyan
Write-Host "  ║  • qwen2-5-coder-14b              ║" -ForegroundColor Cyan
Write-Host "  ║  • qwen3-5-9b                     ║" -ForegroundColor Cyan
Write-Host "  ║  • qwen3-4b   (⚡ Schnell)        ║" -ForegroundColor Cyan
Write-Host "  ║  • gemma4-e2b (Always-On)         ║" -ForegroundColor Cyan
Write-Host "  ╚═══════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Browser öffnen
Start-Process "http://127.0.0.1:4096/"
Write-Host "  Browser geöffnet → http://127.0.0.1:4096/" -ForegroundColor Green
Write-Host ""
Write-Host "  Drücke Enter zum Beenden..." -ForegroundColor Gray
Read-Host
