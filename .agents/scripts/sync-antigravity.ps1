<#
.SYNOPSIS
    DEVKiTZ Antigravity Auto-Sync Script
    Scannt Skills + Workflows und regeneriert SKILLS_REFERENCE.md

.DESCRIPTION
    - Liest alle SKILL.md Frontmatter aus .agents/skills/
    - Liest alle Workflow .md Frontmatter aus .agents/workflows/
    - Zählt Knowledge-Dateien in .gemini/antigravity/
    - Generiert eine vollständige SKILLS_REFERENCE.md
    - Idempotent — kann jederzeit erneut laufen

.NOTES
    Stand: 2026-04-01
    Aufruf: powershell -ExecutionPolicy Bypass -File sync-antigravity.ps1
#>

param(
    [string]$RootDir = "C:\DEVKiTZ",
    [switch]$DryRun
)

$ErrorActionPreference = "Continue"

# Pfade
$SkillsDir = Join-Path $RootDir ".agents\skills"
$WorkflowsDir = Join-Path $RootDir ".agents\workflows"
$KnowledgeDir = Join-Path $RootDir ".gemini\antigravity"
$OutputFile = Join-Path $KnowledgeDir "SKILLS_REFERENCE.md"

$timestamp = Get-Date -Format "yyyy-MM-dd"

Write-Host "`n=== DEVKiTZ Antigravity Sync ===" -ForegroundColor Cyan
Write-Host "Root: $RootDir" -ForegroundColor DarkGray

# --- 1. Skills scannen ---
Write-Host "`n[1/3] Scanning Skills..." -ForegroundColor Yellow
$skills = @()
$skillDirs = Get-ChildItem -Path $SkillsDir -Directory -ErrorAction SilentlyContinue

foreach ($dir in $skillDirs) {
    $skillFile = Join-Path $dir.FullName "SKILL.md"
    $desc = "Keine Beschreibung"
    
    if (Test-Path $skillFile) {
        $content = Get-Content $skillFile -Raw -ErrorAction SilentlyContinue
        if ($content -match '(?m)^description:\s*(.+)$') {
            $desc = $matches[1].Trim()
        }
    }
    
    $skills += [PSCustomObject]@{
        Name = $dir.Name
        Description = $desc
    }
}

$skillCount = $skills.Count
Write-Host "  Found $skillCount skills" -ForegroundColor Green

# --- 2. Workflows scannen ---
Write-Host "`n[2/3] Scanning Workflows..." -ForegroundColor Yellow
$workflows = @()
$wfFiles = Get-ChildItem -Path $WorkflowsDir -Filter "*.md" -ErrorAction SilentlyContinue

foreach ($wf in $wfFiles) {
    $content = Get-Content $wf.FullName -Raw -ErrorAction SilentlyContinue
    $desc = "Keine Beschreibung"
    
    if ($content -match '(?m)^description:\s*(.+)$') {
        $desc = $matches[1].Trim()
    }
    
    $workflows += [PSCustomObject]@{
        Name = $wf.BaseName
        Description = $desc
    }
}

$wfCount = $workflows.Count
Write-Host "  Found $wfCount workflows" -ForegroundColor Green

# --- 3. Knowledge-Dateien zählen ---
Write-Host "`n[3/3] Counting Knowledge files..." -ForegroundColor Yellow
$knowledgeFiles = Get-ChildItem -Path $KnowledgeDir -Filter "*.md" -ErrorAction SilentlyContinue
$kbCount = $knowledgeFiles.Count
Write-Host "  Found $kbCount knowledge files" -ForegroundColor Green

# --- 4. SKILLS_REFERENCE.md generieren ---
Write-Host "`nGenerating SKILLS_REFERENCE.md..." -ForegroundColor Cyan

$md = @"
# DEVKiTZ™ Skills & Workflows — Vollreferenz

> Auto-generiert via ``sync-antigravity.ps1`` · Stand: $timestamp
> **$skillCount Skills · $wfCount Workflows · $kbCount Knowledge-Dateien**

---

## $skillCount Skills in ``.agents/skills/``

| # | Skill | Ordner | Beschreibung |
|:--|:------|:-------|:-------------|
"@

$i = 1
foreach ($skill in $skills | Sort-Object Name) {
    $md += "`n| $i | $($skill.Name) | ``$($skill.Name)/`` | $($skill.Description) |"
    $i++
}

$md += @"


---

## $wfCount Workflows in ``.agents/workflows/``

| # | Workflow | Beschreibung |
|:--|:---------|:-------------|
"@

$i = 1
foreach ($wf in $workflows | Sort-Object Name) {
    $md += "`n| $i | ``/$($wf.Name)`` | $($wf.Description) |"
    $i++
}

$md += @"


---

## $kbCount Knowledge-Dateien in ``.gemini/antigravity/``

| # | Datei | Größe |
|:--|:------|:------|
"@

$i = 1
foreach ($kb in $knowledgeFiles | Sort-Object Name) {
    $size = [math]::Round($kb.Length / 1024, 1)
    $md += "`n| $i | ``$($kb.Name)`` | ${size} KB |"
    $i++
}

$md += @"


---

## Auto-Sync

``````powershell
# Dieses Script erneut ausführen:
powershell -ExecutionPolicy Bypass -File "C:\DEVKiTZ\.agents\scripts\sync-antigravity.ps1"
``````

---

*Auto-generiert · DEVKiTZ™ · $skillCount Skills · $wfCount Workflows · Stand: $timestamp*
"@

if ($DryRun) {
    Write-Host "`n[DRY RUN] Would write to: $OutputFile" -ForegroundColor Magenta
    Write-Host $md
} else {
    $md | Out-File -FilePath $OutputFile -Encoding utf8 -Force
    Write-Host "`n✅ Written to: $OutputFile" -ForegroundColor Green
}

# --- Summary ---
Write-Host "`n=== Sync Complete ===" -ForegroundColor Cyan
Write-Host "  Skills:     $skillCount" -ForegroundColor White
Write-Host "  Workflows:  $wfCount" -ForegroundColor White
Write-Host "  Knowledge:  $kbCount" -ForegroundColor White
Write-Host "  Output:     $OutputFile" -ForegroundColor White
Write-Host ""
