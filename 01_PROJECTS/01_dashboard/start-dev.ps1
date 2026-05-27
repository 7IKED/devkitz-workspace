# ⚡ DkZ Ecosystem — Dev-Starter
# ════════════════════════════════
# Startet API Gateway + MCP Server in einem Schritt.
# Nutzung: .\start-dev.ps1

Write-Host ""
Write-Host "⚡ DkZ Ecosystem Dev-Start" -ForegroundColor Red
Write-Host "════════════════════════════" -ForegroundColor DarkGray

$root = "C:\DEVKiTZ\01_PROJECTS\01_dashboard"

# Check if .env exists
if (-Not (Test-Path "$root\.env")) {
    Write-Host "⚠ Keine .env gefunden — kopiere .env.example" -ForegroundColor Yellow
    if (Test-Path "$root\.env.example") {
        Copy-Item "$root\.env.example" "$root\.env"
        Write-Host "✅ .env erstellt (bitte Werte eintragen!)" -ForegroundColor Green
    }
}

# Start API Gateway
Write-Host ""
Write-Host "🌐 API Gateway starten (Port 3040)..." -ForegroundColor Cyan
$gateway = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "$root\api-gateway" -PassThru -NoNewWindow
Write-Host "   PID: $($gateway.Id)" -ForegroundColor DarkGray

# Wait for gateway to be ready
Start-Sleep -Seconds 2

# Check if running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3040" -TimeoutSec 3 -ErrorAction SilentlyContinue
    Write-Host "✅ API Gateway online" -ForegroundColor Green
} catch {
    Write-Host "⚠ API Gateway nicht erreichbar (noch am starten?)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════" -ForegroundColor DarkGray
Write-Host "🌐 REST API:  http://localhost:3040" -ForegroundColor White
Write-Host "🔌 WebSocket: ws://localhost:3040/ws" -ForegroundColor White
Write-Host "📋 API Docs:  http://localhost:3040/api/v1/docs" -ForegroundColor White
Write-Host "💚 Health:    http://localhost:3040/api/v1/health" -ForegroundColor White
Write-Host "📦 Modules:   http://localhost:3040/api/v1/modules" -ForegroundColor White
Write-Host "════════════════════════════" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Drücke Ctrl+C zum Stoppen" -ForegroundColor DarkGray
Write-Host ""

# Keep alive
try {
    Wait-Process -Id $gateway.Id
} catch {}
