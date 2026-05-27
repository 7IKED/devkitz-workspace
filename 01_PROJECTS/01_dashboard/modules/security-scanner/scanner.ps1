y# DkZ Security Scanner + FileOps v1.0
# Scannt System auf Malware, sortiert Desktop/Downloads, sichert in Drive
param(
    [switch]$ScanOnly,
    [switch]$SortDesktop,
    [switch]$SortDownloads,
    [switch]$BackupToDrive,
    [switch]$All,
    [string]$OutputJson = "scan-results.json"
)

$ErrorActionPreference = "SilentlyContinue"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$results = @{ timestamp = $timestamp; threats = @(); files = @(); actions = @() }

# === PHASE 1: SECURITY SCAN ===
function Invoke-SecurityScan {
    Write-Host "`n[SCAN] Registry Autostart..." -ForegroundColor Cyan
    $runKeys = Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
    $runKeys.PSObject.Properties | Where-Object { $_.Name -notmatch "^PS" } | ForEach-Object {
        $suspicious = $_.Value -match "AppData\\Local\\[A-Za-z0-9]{8,}\\" -or $_.Value -match "\.xml\b" -or $_.Value -match "conhost.*headless"
        $results.threats += @{ type="registry"; name=$_.Name; value=$_.Value; suspicious=$suspicious; path="HKCU\Run" }
        if ($suspicious) { Write-Host "  [!] VERDAECHTIG: $($_.Name) -> $($_.Value)" -ForegroundColor Red }
        else { Write-Host "  [OK] $($_.Name)" -ForegroundColor Green }
    }

    Write-Host "`n[SCAN] Node.js Prozesse..." -ForegroundColor Cyan
    Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
        $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine
        $suspicious = $cmd -match "AppData\\Local\\[A-Za-z0-9]{8,}\\" -or $cmd -match "\.xml\b"
        $results.threats += @{ type="process"; pid=$_.Id; cmd=$cmd; suspicious=$suspicious }
        if ($suspicious) { Write-Host "  [!] PID $($_.Id): $cmd" -ForegroundColor Red }
    }

    Write-Host "`n[SCAN] Verdaechtige AppData-Ordner..." -ForegroundColor Cyan
    $knownDirs = @("npm","npm-cache","Temp","Programs","Microsoft","Google","Discord","Vivaldi","Overwolf","electron","KeePassXC","AnthropicClaude","BraveSoftware","GitHubDesktop","GitKrakenCLI","ExpressVPN")
    Get-ChildItem "$env:LOCALAPPDATA" -Directory | Where-Object {
        $_.Name -match "^[A-Za-z0-9]{10,}$" -and $_.Name -notin $knownDirs
    } | ForEach-Object {
        $files = Get-ChildItem $_.FullName -File -Recurse
        $hasExe = $files | Where-Object { $_.Extension -in ".exe",".cmd",".bat",".xml",".bin",".ps1" }
        if ($hasExe) {
            Write-Host "  [!] $($_.Name) ($($files.Count) Dateien)" -ForegroundColor Yellow
            $results.threats += @{ type="folder"; path=$_.FullName; fileCount=$files.Count; suspicious=$true }
        }
    }

    $clean = ($results.threats | Where-Object { $_.suspicious }).Count -eq 0
    Write-Host "`n$(if($clean){'[OK] System sauber!'}else{'[!] Bedrohungen gefunden!'})" -ForegroundColor $(if($clean){"Green"}else{"Red"})
}

# === PHASE 2: DESKTOP SORTIEREN ===
function Sort-Desktop {
    $desktop = [Environment]::GetFolderPath("Desktop")
    $archive = "C:\DEVKiTZ\[DEEPKEEP]\desktop-archive\$timestamp"
    New-Item $archive -ItemType Directory -Force | Out-Null
    
    $files = Get-ChildItem $desktop -File | Where-Object { $_.Name -ne "security-scanner.lnk" }
    Write-Host "`n[SORT] Desktop: $($files.Count) Dateien -> $archive" -ForegroundColor Cyan
    
    foreach ($f in $files) {
        $cat = switch -Regex ($f.Extension) {
            '\.(png|jpg|jpeg|gif|webp|svg|ico|bmp)' { "bilder" }
            '\.(mp4|webm|avi|mkv|mov)' { "videos" }
            '\.(mp3|wav|flac|ogg|m4a)' { "musik" }
            '\.(pdf|doc|docx|txt|md|csv|xlsx)' { "dokumente" }
            '\.(zip|rar|7z|tar|gz)' { "archive" }
            '\.(exe|msi|bat|cmd|ps1)' { "installer" }
            '\.(js|py|html|css|json|yml)' { "code" }
            default { "sonstige" }
        }
        $dest = Join-Path $archive $cat
        New-Item $dest -ItemType Directory -Force | Out-Null
        Copy-Item $f.FullName $dest -Force
        $results.actions += @{ action="desktop-sort"; file=$f.Name; category=$cat; dest=$dest }
        Write-Host "  [$cat] $($f.Name)" -ForegroundColor DarkGray
    }
    Write-Host "  [OK] $($files.Count) Dateien archiviert" -ForegroundColor Green
}

# === PHASE 3: DOWNLOADS SORTIEREN ===
function Sort-Downloads {
    $dl = Join-Path $env:USERPROFILE "Downloads"
    $archive = "C:\DEVKiTZ\[DEEPKEEP]\downloads-archive\$timestamp"
    New-Item $archive -ItemType Directory -Force | Out-Null
    
    $files = Get-ChildItem $dl -File
    Write-Host "`n[SORT] Downloads: $($files.Count) Dateien" -ForegroundColor Cyan
    
    foreach ($f in $files) {
        $cat = switch -Regex ($f.Extension) {
            '\.(png|jpg|jpeg|gif|webp|svg)' { "bilder" }
            '\.(mp4|webm|avi|mkv|mov)' { "videos" }
            '\.(pdf|doc|docx|txt|md|csv|xlsx)' { "dokumente" }
            '\.(zip|rar|7z|tar|gz)' { "archive" }
            '\.(exe|msi)' { "installer" }
            default { "sonstige" }
        }
        $dest = Join-Path $archive $cat
        New-Item $dest -ItemType Directory -Force | Out-Null
        Copy-Item $f.FullName $dest -Force
        $results.actions += @{ action="download-sort"; file=$f.Name; category=$cat }
    }
    Write-Host "  [OK] $($files.Count) Dateien sortiert" -ForegroundColor Green
}

# === ERGEBNIS SPEICHERN ===
$results | ConvertTo-Json -Depth 5 | Out-File $OutputJson -Encoding UTF8

if ($All -or $ScanOnly) { Invoke-SecurityScan }
if ($All -or $SortDesktop) { Sort-Desktop }
if ($All -or $SortDownloads) { Sort-Downloads }

Write-Host "`n[DONE] Ergebnisse: $OutputJson" -ForegroundColor Green
