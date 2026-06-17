# DkZ OpenCode Starter — GPT OSS 20B Default
# Doppelklick oder: .\start-opencode.ps1

$model = "ollama-cloud/gpt-oss:20b"
$port  = 4096
$url   = "http://127.0.0.1:$port"

Write-Host ""
Write-Host "  *** DkZ OpenCode Starter ***" -ForegroundColor Cyan
Write-Host "  Modell : $model" -ForegroundColor Green
Write-Host "  URL    : $url" -ForegroundColor Yellow
Write-Host ""

# Stoppe alten Server falls noch laeuft
$old = Get-Process -Name "opencode" -ErrorAction SilentlyContinue
if ($old) {
    Write-Host "  Stoppe alten opencode Prozess..." -ForegroundColor Gray
    $old | Stop-Process -Force
    Start-Sleep 1
}

# Starte Web-Server und setze Default-Modell via localStorage-Init
Write-Host "  Starte opencode web auf Port $port..." -ForegroundColor Cyan
$proc = Start-Process -FilePath "opencode" -ArgumentList "web", "--port", $port -WorkingDirectory "C:\DEVKiTZ" -PassThru -WindowStyle Normal

Start-Sleep 3

# Oeffne Browser
Write-Host "  Oeffne Browser: $url" -ForegroundColor Green
Start-Process $url

Write-Host ""
Write-Host "  *** OpenCode laeuft! ***" -ForegroundColor Green
Write-Host ""
Write-Host "  Im Browser oben rechts Modell-Selector pruefen:" -ForegroundColor White
Write-Host "  -> Waehle: ollama-cloud / gpt-oss:20b" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Chat direkt im Terminal starten (neues Fenster):" -ForegroundColor White
Write-Host "  opencode run -m $model --attach $url `"Deine Frage`"" -ForegroundColor Gray
Write-Host ""

# Halte Fenster offen
$proc.WaitForExit()
