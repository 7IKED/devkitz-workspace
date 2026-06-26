# DEVKiTZ™ UI Launcher
# Oeffnet die neuen UIs (AnythingLLM, Dashy, Graphify, GitNexus)

$urls = @(
    "http://127.0.0.1:3000", # GitNexus (NextJS Standard)
    "http://127.0.0.1:3001", # AnythingLLM (Standard)
    "http://127.0.0.1:4000", # Dashy (Standard)
    "http://127.0.0.1:8050"  # Graphify (Dash Standard)
)

Write-Host "DEVKiTZ UI Auto-Launcher gestartet..." -ForegroundColor Cyan
Write-Host "Stelle sicher, dass die entsprechenden Docker-Container / Services laufen." -ForegroundColor Yellow

foreach ($url in $urls) {
    Write-Host "Oeffne: $url" -ForegroundColor Green
    Start-Process $url
}

Write-Host "Fertig!" -ForegroundColor Cyan
