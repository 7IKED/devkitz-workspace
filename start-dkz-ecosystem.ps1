# ============================================================
# DEVKiTZ Ecosystem - Start-Script
# Startet alle Hintergrunddienste & LLM-Komponenten (Die 11 Tasks)
# ============================================================
$ErrorActionPreference = "SilentlyContinue"
Write-Host "Starte DEVKiTZ Ecosystem Services..." -ForegroundColor Cyan

# Funktion zum Starten eines Hintergrund-Prozesses in einem eigenen Fenster
function Start-ServiceWindow {
    param([string]$Title, [string]$Command, [string]$Dir)
    Write-Host "Starte: $Title" -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit -Command `"title $Title; cd '$Dir'; $Command`""
}

# 1. Sync Server
if (Test-Path "C:\DEVKiTZ\sync-server.js") {
    Start-ServiceWindow -Title "DkZ Sync Server" -Command "node sync-server.js" -Dir "C:\DEVKiTZ"
}

# 2. API Gateway
if (Test-Path "C:\DEVKiTZ\api_gateway.py") {
    Start-ServiceWindow -Title "DkZ API Gateway" -Command "python api_gateway.py" -Dir "C:\DEVKiTZ"
}

# 3. OpenMemory Server
$openMemoryPath = Get-ChildItem -Path "C:\DEVKiTZ\ONTHERUN" -Filter "*memory*.js" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if ($openMemoryPath) {
    Start-ServiceWindow -Title "DkZ OpenMemory Server (Port 3041)" -Command "node $($openMemoryPath.Name)" -Dir $openMemoryPath.DirectoryName
} else {
    Write-Host "OpenMemory Server nicht gefunden, wird übersprungen." -ForegroundColor Yellow
}

# 4. OpenManus (Falls lokal statt Docker gewünscht)
if (Test-Path "C:\DEVKiTZ\ONTHERUN\openmanus\main.py") {
    Start-ServiceWindow -Title "OpenManus QA" -Command "python main.py" -Dir "C:\DEVKiTZ\ONTHERUN\openmanus"
}

Write-Host "Alle Dienste wurden in separaten Fenstern gestartet." -ForegroundColor Cyan
Write-Host "Du kannst diese Fenster minimieren." -ForegroundColor White
