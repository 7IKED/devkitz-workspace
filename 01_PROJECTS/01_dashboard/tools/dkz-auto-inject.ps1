#!/usr/bin/env pwsh
#
# DkZ Auto-Injector — Shared Scripts in ALLE Module injizieren
# Aufruf: pwsh dkz-auto-inject.ps1
# Oder: .\dkz-auto-inject.ps1 -Verify
#
# Wird automatisch bei jedem neuen Modul aufgerufen.
# Injiziert die 6 Shared Scripts (James, Memory, Compaction, Iceberg, PromptScore, Bridge)
# in jedes Modul das sie noch nicht hat.
#
# @DKZ:TAG [TOOL:auto-inject] [CAT:automation] [LANG:ps1]
# @DKZ:RULES R14 Kaizen, R9 Versionierung

param(
    [switch]$Verify,       # Nur pruefen, nichts aendern
    [switch]$Force,        # Auch bei bestehenden Scripts neu injizieren
    [string]$SingleModule  # Nur ein bestimmtes Modul injizieren
)

$BASE = "c:\DEVKiTZ\01_PROJECTS\01_dashboard"
$MODULES_DIR = "$BASE\modules"
$SCRIPTS = @(
    'dkz-james.js',
    'dkz-memory.js', 
    'dkz-compaction.js',
    'dkz-iceberg.js',
    'dkz-prompt-score.js',
    'dkz-builder-bridge.js'
)

$SCRIPT_BLOCK = @'

    <!-- DkZ Shared Scripts (Auto-Injected) -->
    <script src="../../shared/dkz-james.js"></script>
    <script src="../../shared/dkz-memory.js"></script>
    <script src="../../shared/dkz-compaction.js"></script>
    <script src="../../shared/dkz-iceberg.js"></script>
    <script src="../../shared/dkz-prompt-score.js"></script>
    <script src="../../shared/dkz-builder-bridge.js"></script>
'@

# Stats
$stats = @{ fixed = 0; skipped = 0; errors = 0; verified = 0; missing = @() }

# Get modules
if ($SingleModule) {
    $modules = @($SingleModule)
} else {
    $modules = Get-ChildItem $MODULES_DIR -Directory | Select -ExpandProperty Name
}

foreach ($mod in $modules) {
    $file = "$MODULES_DIR\$mod\index.html"
    if (-not (Test-Path $file)) { continue }

    $content = Get-Content $file -Raw -Encoding UTF8

    # Check existing scripts
    $missingScripts = @()
    foreach ($s in $SCRIPTS) {
        if ($content -notmatch [regex]::Escape($s)) { $missingScripts += $s }
    }

    if ($missingScripts.Count -eq 0 -and -not $Force) {
        $stats.verified++
        if ($Verify) { Write-Host "  OK  $mod" -ForegroundColor Green }
        continue
    }

    if ($Verify) {
        Write-Host "  MISSING  $mod : $($missingScripts -join ', ')" -ForegroundColor Yellow
        $stats.missing += "$mod : $($missingScripts -join ', ')"
        continue
    }

    # Inject
    $injected = $false

    # Strategy 1: Before dkz-debug.js
    if ($content -match '<script src="../../shared/dkz-debug.js">') {
        $content = $content -replace '(<script src="../../shared/dkz-debug.js">)', "$SCRIPT_BLOCK`n    `$1"
        $injected = $true
    }
    # Strategy 2: Before dkz-updater.js
    elseif ($content -match '<script src="../../shared/dkz-updater.js">') {
        $content = $content -replace '(<script src="../../shared/dkz-updater.js">)', "$SCRIPT_BLOCK`n    `$1"
        $injected = $true
    }
    # Strategy 3: Before </body>
    elseif ($content -match '</body>') {
        $content = $content -replace '(</body>)', "$SCRIPT_BLOCK`n`$1"
        $injected = $true
    }

    if ($injected) {
        Set-Content $file -Value $content -Encoding UTF8
        $stats.fixed++
        Write-Host "  FIXED  $mod" -ForegroundColor Cyan
    } else {
        $stats.errors++
        Write-Host "  ERROR  $mod (kein Injection-Punkt)" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n=== DkZ Auto-Injector ===" -ForegroundColor Magenta
Write-Host "Modules: $($modules.Count) | Verified: $($stats.verified) | Fixed: $($stats.fixed) | Errors: $($stats.errors)" 
if ($stats.missing.Count -gt 0) {
    Write-Host "Missing:" -ForegroundColor Yellow
    $stats.missing | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
}
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
