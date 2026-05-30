# DkZ Keep/Drive Sync
# ====================

$ErrorActionPreference = "Continue"
$NOTEPAD = "C:\DEVKiTZ\06_NOTEPAD"
$KEEP_IMPORT = "$NOTEPAD\note\keep-import"
$TAGS_DIR = "$NOTEPAD\note\tags"
$TS = Get-Date -Format "yyyy-MM-dd_HH-mm"

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " DkZ Keep/Drive Sync - $TS" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Ordner sicherstellen
$dirs = @($KEEP_IMPORT, $TAGS_DIR, "$NOTEPAD\note\idea", "$NOTEPAD\note\snippets", "$NOTEPAD\note\notebook", "$NOTEPAD\note\use-case", "$NOTEPAD\archive", "$NOTEPAD\todo", "$NOTEPAD\meeting")
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}

# DkZ Tags generieren
Write-Host "`n[1/3] DkZ Tags generieren..." -ForegroundColor Cyan

$tagsObj = [ordered]@{
    "dkz-copilot"    = "CoPilot Agent System"
    "dkz-dashboard"  = "Dashboard Module"
    "dkz-gateway"    = "Gateway v2"
    "dkz-graphify"   = "Knowledge Graph"
    "dkz-mirofish"   = "MiroFish Simulator"
    "dkz-gitnexus"   = "GitNexus Explorer"
    "dkz-openhumans" = "OpenHumans Hub"
    "dkz-openhands"  = "OpenHands Agent"
    "dkz-deepkeep"   = "Security Tresor"
    "dkz-cloudia"    = "Cloud Control"
    "type-bug"       = "Bug Report"
    "type-feature"   = "Feature Request"
    "type-idea"      = "Idee"
    "type-research"  = "Research"
    "type-task"      = "Task / TODO"
    "type-meeting"   = "Meeting Notes"
    "type-snippet"   = "Code Snippet"
    "prio-p0"        = "Kritisch"
    "prio-p1"        = "Hoch"
    "prio-p2"        = "Mittel"
    "prio-p3"        = "Niedrig"
    "status-open"    = "Offen"
    "status-wip"     = "In Arbeit"
    "status-done"    = "Erledigt"
    "status-blocked" = "Blockiert"
}

$tagsJson = $tagsObj | ConvertTo-Json -Depth 3
Set-Content -Path "$TAGS_DIR\dkz-tags.json" -Value $tagsJson -Encoding UTF8
Write-Host "Tags gespeichert: $($tagsObj.Count) Tags" -ForegroundColor Green

# GitHub Labels holen
Write-Host "`n[2/3] GitHub Labels holen..." -ForegroundColor Cyan
try {
    $ghUrl = "https://api.github.com/repos/7IKED/devkitz-workspace/labels"
    $headers = @{ "Accept" = "application/vnd.github.v3+json" }
    $ghLabels = Invoke-RestMethod -Uri $ghUrl -Method Get -Headers $headers -ErrorAction Stop
    $ghObj = [ordered]@{}
    foreach ($l in $ghLabels) {
        $ghObj[$l.name] = $l.description
    }
    $ghObj | ConvertTo-Json -Depth 3 | Set-Content "$TAGS_DIR\github-labels.json" -Encoding UTF8
    Write-Host "GitHub Labels: $($ghLabels.Count)" -ForegroundColor Green
} catch {
    Write-Host "GitHub Labels nicht abrufbar - Offline?" -ForegroundColor Yellow
}

# Takeout check
Write-Host "`n[3/3] Takeout pruefen..." -ForegroundColor Cyan
$downloads = "$env:USERPROFILE\Downloads"
$takeoutZip = Get-ChildItem -Path $downloads -Filter "takeout-*.zip" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($takeoutZip) {
    Write-Host "Takeout ZIP gefunden: $($takeoutZip.Name)" -ForegroundColor Green
    Write-Host "Entpacke..." -ForegroundColor Cyan
    $tempDir = "$KEEP_IMPORT\_takeout_temp"
    Expand-Archive -Path $takeoutZip.FullName -DestinationPath $tempDir -Force
    $keepDir = Get-ChildItem -Path $tempDir -Filter "Keep" -Directory -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($keepDir) {
        $jsonFiles = Get-ChildItem -Path $keepDir.FullName -Filter "*.json" -ErrorAction SilentlyContinue
        $count = 0
        foreach ($f in $jsonFiles) {
            try {
                $note = Get-Content $f.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
                $title = if ($note.title) { $note.title } else { $f.BaseName }
                $body = if ($note.textContent) { $note.textContent } else { "" }
                $safeName = ($title -replace '[\\/:*?"<>|]', '-').ToLower()
                if ($safeName.Length -gt 80) { $safeName = $safeName.Substring(0, 80) }
                $md = "# $title`n`n> Quelle: Google Keep`n> Import: $TS`n`n---`n`n$body"
                Set-Content -Path "$KEEP_IMPORT\$safeName.md" -Value $md -Encoding UTF8
                $count++
            } catch {
                Write-Host "Fehler: $($f.Name)" -ForegroundColor Yellow
            }
        }
        Write-Host "$count Notizen importiert" -ForegroundColor Green
    } else {
        Write-Host "Kein Keep-Ordner im ZIP" -ForegroundColor Yellow
    }
} else {
    Write-Host "Kein Takeout ZIP in Downloads gefunden" -ForegroundColor Yellow
    Write-Host "Optionen:" -ForegroundColor White
    Write-Host "  A) https://takeout.google.com - nur Keep - ZIP in Downloads" -ForegroundColor Gray
    Write-Host "  B) Apps Script: 04_SYSTEM/scripts/keep-to-drive.gs" -ForegroundColor Gray
}

# Git commit
Write-Host "`n[Git] Commit..." -ForegroundColor Cyan
Push-Location C:\DEVKiTZ
git add 06_NOTEPAD/ 04_SYSTEM/scripts/keep-to-drive.gs 2>$null
$changes = git diff --cached --name-only 2>$null
if ($changes) {
    git commit -m "feat(notepad): Keep/Drive Sync + DkZ Tags $TS" 2>$null
    Write-Host "Committed" -ForegroundColor Green
} else {
    Write-Host "Keine Aenderungen" -ForegroundColor Gray
}
Pop-Location

Write-Host "`n====================================" -ForegroundColor Cyan
Write-Host " Sync abgeschlossen" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "`nNaechste Schritte:" -ForegroundColor White
Write-Host "  1. Apps Script deployen: https://script.google.com" -ForegroundColor Gray
Write-Host "  2. keep-to-drive.gs einfuegen + Keep API Service aktivieren" -ForegroundColor Gray
Write-Host "  3. fullPipeline ausfuehren" -ForegroundColor Gray
Write-Host "  4. Nach Pruefung: deleteAllKeepNotes ausfuehren" -ForegroundColor Gray
Write-Host ""
