# start-paperless-workers.ps1
# Starts paperless-consumer.py + git_nexus.py as parallel background jobs,
# then fires a test payload against the n8n webhook.
$ErrorActionPreference = 'Stop'
$DEVKITZ = "C:\DEVKiTZ"

Write-Host "=== DkZ Paperless Worker Fleet ===" -ForegroundColor Cyan

# Prepare directories
$null = New-Item -ItemType Directory -Path "$DEVKITZ\Paperless_Inbox\processed" -Force
$null = New-Item -ItemType Directory -Path "$DEVKITZ\Paperless_Inbox\error" -Force
$null = New-Item -ItemType Directory -Path "$DEVKITZ\04_SYSTEM\ISSUES" -Force

# Worker 1: paperless-consumer.py
Write-Host "[1/2] Starting paperless-consumer.py..." -ForegroundColor Yellow
$consumerJob = Start-Job -Name "paperless-consumer" -ScriptBlock {
    param($path)
    Set-Location $path
    python "02_COPILOT_NATIVE\agents\paperless-consumer.py"
} -ArgumentList $DEVKITZ

# Worker 2: git_nexus.py
Write-Host "[2/2] Starting git_nexus.py..." -ForegroundColor Yellow
$gitNexusJob = Start-Job -Name "git-nexus" -ScriptBlock {
    param($path)
    Set-Location $path
    python "02_COPILOT_NATIVE\agents\git_nexus.py"
} -ArgumentList $DEVKITZ

# Wait for init
Write-Host "Waiting 5s for initialization..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5

Write-Host "Both workers running as background jobs." -ForegroundColor Green
Write-Host "Consumer job ID: $($consumerJob.Id)" -ForegroundColor DarkGray
Write-Host "GitNexus job ID: $($gitNexusJob.Id)" -ForegroundColor DarkGray

# --- Option C: Test payload against n8n webhook ---
Write-Host "`n=== Option C: Test Payload -> sync-server:3040 ===" -ForegroundColor Cyan

$testHash = @{
    content   = "Kurz-URL fuer Klima-Studie: https://example.org/klima2026 - bitte als Lesezeichen ablegen."
    type      = "text"
    filename  = "paperless_test"
    target    = "paperless"
    metadata  = @{ source = "n8n_webhook_test"; version = "v0.02.1_01" }
}
$jsonPayload = $testHash | ConvertTo-Json -Compress

Write-Host "Payload: $jsonPayload" -ForegroundColor DarkGray

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:3040/api/v1/n8n/paperclip" `
        -Method POST `
        -Body $jsonPayload `
        -ContentType "application/json" `
        -TimeoutSec 10 `
        -UseBasicParsing

    $result = $response.Content | ConvertFrom-Json
    Write-Host "Webhook Response: $($result.message)" -ForegroundColor Green
} catch {
    Write-Host "Webhook not reachable (sync-server running?): $_" -ForegroundColor Red
}

# Wait for processing
Write-Host "Waiting 20s for workers to process..." -ForegroundColor DarkGray
Start-Sleep -Seconds 20

# --- Status Report ---
Write-Host "`n=== Status Report ===" -ForegroundColor Cyan

$inbox = Get-ChildItem "$DEVKITZ\Paperless_Inbox\*.json" -ErrorAction SilentlyContinue
$processed = Get-ChildItem "$DEVKITZ\Paperless_Inbox\processed\*.json" -ErrorAction SilentlyContinue
$doneFiles = Get-ChildItem "$DEVKITZ\Paperless_Inbox\*.done" -ErrorAction SilentlyContinue
$clipFiles = Get-ChildItem "$DEVKITZ\04_SYSTEM\ISSUES\clip_*.md" -ErrorAction SilentlyContinue

Write-Host "Paperless_Inbox/:       $($inbox.Count) JSON(s)"
Write-Host "processed/:              $($processed.Count) JSON(s)"
Write-Host ".done:                   $($doneFiles.Count) file(s)"
Write-Host "ISSUES/clip_*.md:        $($clipFiles.Count) file(s)"

if ($processed.Count -gt 0 -or $doneFiles.Count -gt 0) {
    Write-Host "Pipeline is running successfully!" -ForegroundColor Green
} else {
    Write-Host "No files processed yet. Workers still polling." -ForegroundColor Yellow
}

Write-Host "`n---" -ForegroundColor DarkGray
Write-Host "Jobs continue in background."
Write-Host "Stop:   Stop-Job -Id $($consumerJob.Id),$($gitNexusJob.Id)"
Write-Host "Logs:   Receive-Job -Id $($consumerJob.Id); Receive-Job -Id $($gitNexusJob.Id)"
