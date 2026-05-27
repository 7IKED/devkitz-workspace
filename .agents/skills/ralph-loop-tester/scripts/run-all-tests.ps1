param(
  [switch]$SkillTests,
  [switch]$InfraTests,
  [switch]$All
)

if ($All) { $SkillTests = $true; $InfraTests = $true }
if (-not $SkillTests -and -not $InfraTests) { $SkillTests = $true; $InfraTests = $true }

$report = @()
$pass = 0; $fail = 0; $warn = 0; $skip = 0
$startTime = Get-Date

Write-Host ""
Write-Host "=================================" -ForegroundColor Magenta
Write-Host "  RALPH-LOOP TEST RUNNER" -ForegroundColor White
Write-Host "  $( Get-Date -Format 'yyyy-MM-dd HH:mm:ss' )" -ForegroundColor DarkGray
Write-Host "=================================" -ForegroundColor Magenta

if ($SkillTests) {
  Write-Host ""
  Write-Host "SKILL TESTS" -ForegroundColor Cyan
  Write-Host ("-" * 40) -ForegroundColor DarkGray

  # 1. OpenRouter API
  Write-Host "  [1] OpenRouter API..." -NoNewline
  try {
    $r = Invoke-RestMethod "https://openrouter.ai/api/v1/models" -TimeoutSec 10
    $freeCount = @($r.data | Where-Object { $_.id -match ':free' }).Count
    Write-Host " PASS ($freeCount free)" -ForegroundColor Green
    $pass++
    $report += "OpenRouter API - Skill - PASS - $freeCount free models"
  } catch {
    Write-Host " FAIL" -ForegroundColor Red
    $fail++
    $report += "OpenRouter API - Skill - FAIL - Nicht erreichbar"
  }

  # 2. GitHub API
  Write-Host "  [2] GitHub API..." -NoNewline
  try {
    $r = Invoke-RestMethod "https://api.github.com/rate_limit" -TimeoutSec 10
    $rem = $r.resources.search.remaining
    Write-Host " PASS ($rem req left)" -ForegroundColor Green
    $pass++
    $report += "GitHub API - Skill - PASS - $rem requests left"
  } catch {
    Write-Host " FAIL" -ForegroundColor Red
    $fail++
    $report += "GitHub API - Skill - FAIL - Rate limited"
  }
  Start-Sleep 1

  # 3. Jina Reader
  Write-Host "  [3] Jina Reader..." -NoNewline
  try {
    $r = Invoke-WebRequest "https://r.jina.ai/https://example.com" -TimeoutSec 15 -UseBasicParsing
    $len = $r.Content.Length
    if ($len -gt 50) {
      Write-Host " PASS ($len chars)" -ForegroundColor Green
      $pass++
      $report += "Jina Reader - Skill - PASS - $len chars"
    } else {
      Write-Host " WARN (kurz)" -ForegroundColor Yellow
      $warn++
      $report += "Jina Reader - Skill - WARN - Kurze Antwort"
    }
  } catch {
    Write-Host " WARN (offline)" -ForegroundColor Yellow
    $warn++
    $report += "Jina Reader - Skill - WARN - Offline"
  }

  # 4. Skills Count
  Write-Host "  [4] Skills Count..." -NoNewline
  $sc = @(Get-ChildItem "C:\DEVKiTZ\.agents\skills" -Directory -ErrorAction SilentlyContinue).Count
  Write-Host " PASS ($sc skills)" -ForegroundColor Green
  $pass++
  $report += "Skills Directory - Count - PASS - $sc skills"

  # 5. Workflows Count
  Write-Host "  [5] Workflows Count..." -NoNewline
  $wc = @(Get-ChildItem "C:\DEVKiTZ\.agents\workflows" -Filter "*.md" -ErrorAction SilentlyContinue).Count
  Write-Host " PASS ($wc workflows)" -ForegroundColor Green
  $pass++
  $report += "Workflows - Count - PASS - $wc workflows"
}

if ($InfraTests) {
  Write-Host ""
  Write-Host "INFRA TESTS" -ForegroundColor Cyan
  Write-Host ("-" * 40) -ForegroundColor DarkGray

  # 6. Hermes Models
  Write-Host "  [6] Hermes Models..." -NoNewline
  $mp = Join-Path $env:USERPROFILE ".hermes\models.json"
  if (Test-Path $mp) {
    $mj = Get-Content $mp -Raw | ConvertFrom-Json
    $fc = @($mj | Where-Object { $_.model -match ':free' }).Count
    $tc = $mj.Count
    Write-Host " PASS ($tc total, $fc free)" -ForegroundColor Green
    $pass++
    $report += "Hermes Models - Config - PASS - $tc total $fc free"
  } else {
    Write-Host " FAIL" -ForegroundColor Red
    $fail++
    $report += "Hermes Models - Config - FAIL - Nicht gefunden"
  }

  # 7. ONTHERUN
  Write-Host "  [7] ONTHERUN MCP..." -NoNewline
  if (Test-Path "C:\DEVKiTZ\ONTHERUN\package.json") {
    Write-Host " PASS" -ForegroundColor Green
    $pass++
    $report += "ONTHERUN - File - PASS - package.json OK"
  } else {
    Write-Host " WARN" -ForegroundColor Yellow
    $warn++
    $report += "ONTHERUN - File - WARN - Nicht gefunden"
  }

  # 8. Dashboard Module
  Write-Host "  [8] Dashboard Module..." -NoNewline
  $mc = @(Get-ChildItem "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules" -Directory -ErrorAction SilentlyContinue).Count
  $ic = @(Get-ChildItem "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules" -Recurse -Filter "index.html" -ErrorAction SilentlyContinue).Count
  Write-Host " PASS ($mc dirs, $ic index)" -ForegroundColor Green
  $pass++
  $report += "Dashboard Module - Count - PASS - $mc dirs $ic index.html"

  # 9. Shared Scripts
  Write-Host "  [9] Shared Scripts..." -NoNewline
  $ss = @(Get-ChildItem "C:\DEVKiTZ\01_PROJECTS\01_dashboard\shared" -Filter "dkz-*.js" -ErrorAction SilentlyContinue).Count
  Write-Host " PASS ($ss scripts)" -ForegroundColor Green
  $pass++
  $report += "Shared Scripts - Count - PASS - $ss dkz-scripts"

  # 10. VPS SSH
  Write-Host "  [10] VPS SSH..." -NoNewline
  $sshKey = Join-Path $env:USERPROFILE ".ssh\dkz_hostinger"
  if (Test-Path $sshKey) {
    try {
      $vpsOut = & ssh.exe -i $sshKey -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@srv1368349.hstgr.cloud "docker ps --filter name=dkz- --format '{{.Names}}'" 2>&1
      if ($LASTEXITCODE -eq 0) {
        $cc = @($vpsOut | Where-Object { $_ -match 'dkz-' }).Count
        Write-Host " PASS ($cc container)" -ForegroundColor Green
        $pass++
        $report += "VPS SSH - Infra - PASS - $cc container"
      } else {
        Write-Host " WARN (SSH error)" -ForegroundColor Yellow
        $warn++
        $report += "VPS SSH - Infra - WARN - SSH error"
      }
    } catch {
      Write-Host " WARN (Timeout)" -ForegroundColor Yellow
      $warn++
      $report += "VPS SSH - Infra - WARN - Timeout"
    }
  } else {
    Write-Host " SKIP (kein Key)" -ForegroundColor DarkGray
    $skip++
    $report += "VPS SSH - Infra - SKIP - Kein SSH Key"
  }
}

# ERGEBNIS
$total = $pass + $fail + $warn + $skip
$score = if ($total -gt 0) { [math]::Round(($pass / $total) * 100) } else { 0 }
$dur = ((Get-Date) - $startTime).TotalSeconds

Write-Host ""
Write-Host "=================================" -ForegroundColor Magenta
Write-Host "  ERGEBNIS" -ForegroundColor White
Write-Host "=================================" -ForegroundColor Magenta
Write-Host "  PASS:  $pass" -ForegroundColor Green
Write-Host "  WARN:  $warn" -ForegroundColor Yellow
Write-Host "  FAIL:  $fail" -ForegroundColor Red
Write-Host "  SKIP:  $skip" -ForegroundColor DarkGray
Write-Host "  Score: $score%" -ForegroundColor White
Write-Host "  Dauer: $($dur.ToString('F1'))s" -ForegroundColor DarkGray
Write-Host "=================================" -ForegroundColor Magenta

# Report speichern
$reportDir = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\wissen-hub\archive\report"
if (-not (Test-Path $reportDir)) { New-Item -ItemType Directory -Path $reportDir -Force | Out-Null }
$reportPath = Join-Path $reportDir "test-report_$(Get-Date -Format 'yyyyMMdd_HHmm').md"

$lines = @()
$lines += "# Test-Report $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
$lines += ""
$lines += "Ralph-Loop Test Runner - Score: ${score}% - Dauer: $($dur.ToString('F1'))s"
$lines += ""
$lines += "## Ergebnisse"
$lines += ""
foreach ($r in $report) { $lines += "- $r" }
$lines += ""
$lines += "## Summary: PASS=$pass WARN=$warn FAIL=$fail SKIP=$skip Score=${score}%"

$lines -join "`r`n" | Out-File $reportPath -Encoding utf8
Write-Host ""
Write-Host "  Report: $reportPath" -ForegroundColor DarkCyan
Write-Host ""
