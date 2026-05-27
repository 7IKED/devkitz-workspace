# =============================================================================
# DkZ Full Indexer - Prompt-Datenbanken + Oekosystem vollstaendig indizieren
# =============================================================================
# Erzeugt: master-data.js (erweitert) + master-index.json (erweitert)
# Stand: 2026-03-23
# Kompatibel: PowerShell 5.1+
# =============================================================================

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Continue"

# --- Konfiguration ---
$ROOT_DEVKITZ = "C:\DEVKiTZ"

# Dynamisch BAZE-User Verzeichnis finden (wegen Sonderzeichen im Namen)
$BAZE_HOME = (Get-ChildItem "C:\Users" -Directory | Where-Object { $_.Name -match "BAZE" } | Select-Object -First 1).FullName
if (-not $BAZE_HOME) { $BAZE_HOME = $env:USERPROFILE }

$ROOT_PROMPTS = Join-Path $BAZE_HOME "Documents\DkZ-Prompt-Databases"
$BRAIN_DIR    = Join-Path $BAZE_HOME ".gemini\antigravity\brain"
$OUTPUT_DIR   = Join-Path $ROOT_DEVKITZ "01_PROJECTS\01_dashboard\modules\research-archive"

$MASTER_DATA_JS   = Join-Path $OUTPUT_DIR "master-data.js"
$MASTER_INDEX_JSON = Join-Path $OUTPUT_DIR "master-index.json"

Write-Host "User Home: $BAZE_HOME" -ForegroundColor DarkGray
Write-Host "Prompt-DBs: $ROOT_PROMPTS" -ForegroundColor DarkGray

# Backup alte Dateien
$oldDir = Join-Path $OUTPUT_DIR "old"
if (-not (Test-Path $oldDir)) { New-Item -ItemType Directory -Path $oldDir -Force | Out-Null }

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
if (Test-Path $MASTER_DATA_JS) {
    Copy-Item $MASTER_DATA_JS (Join-Path $oldDir "master-data_$timestamp.js") -Force
}
if (Test-Path $MASTER_INDEX_JSON) {
    Copy-Item $MASTER_INDEX_JSON (Join-Path $oldDir "master-index_$timestamp.json") -Force
}

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   DkZ Full Indexer - Prompt-DB + Oekosystem Scanner  " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# --- Tag-Zuordnung basierend auf Pfad ---
function Get-AutoTags {
    param([string]$FilePath, [string]$Extension)
    
    $tags = New-Object System.Collections.ArrayList
    $category = "other"
    $type = "file"
    
    # Prompt-DB Kategorien
    if ($FilePath -match "system-prompts|system_prompts") {
        [void]$tags.AddRange(@("system-prompt", "llm"))
        $category = "system-prompts"
        $type = "system-prompt"
    }
    elseif ($FilePath -match "chatgpt-prompts|awesome-chatgpt") {
        [void]$tags.AddRange(@("chatgpt", "prompt", "roleplay"))
        $category = "chatgpt-prompts"
        $type = "prompt"
    }
    elseif ($FilePath -match "prompt-engineering|prompt_engineering") {
        [void]$tags.AddRange(@("prompt-engineering", "tutorial"))
        $category = "prompt-engineering"
        $type = "tutorial"
    }
    elseif ($FilePath -match "n8n|workflow-templates") {
        [void]$tags.AddRange(@("n8n", "workflow", "automation"))
        $category = "n8n-workflows"
        $type = "workflow"
    }
    elseif ($FilePath -match "agent-templates|agent_templates|crewai|autogen|langchain") {
        [void]$tags.AddRange(@("agent", "template", "orchestration"))
        $category = "agent-templates"
        $type = "agent-template"
    }
    elseif ($FilePath -match "awesome-llm-skills|llm-skills") {
        [void]$tags.AddRange(@("skill", "llm", "community"))
        $category = "llm-skills"
        $type = "skill"
    }
    elseif ($FilePath -match "openclaw|open-claw") {
        [void]$tags.AddRange(@("openclaw", "agent", "framework"))
        $category = "openclaw"
        $type = "framework"
    }
    elseif ($FilePath -match "documentation|cookbook|docs") {
        [void]$tags.AddRange(@("docs", "api", "cookbook"))
        $category = "documentation"
        $type = "documentation"
    }
    # DEVKiTZ Oekosystem
    elseif ($FilePath -match "\.agents.workflows") {
        [void]$tags.AddRange(@("workflow", "devkitz", "automation"))
        $category = "dkz-workflows"
        $type = "workflow"
    }
    elseif ($FilePath -match "\.agents.skills") {
        [void]$tags.AddRange(@("skill", "devkitz"))
        $category = "dkz-skills"
        $type = "skill"
    }
    elseif ($FilePath -match "DEVKITZ_WIKI|wiki-hub|10_wiki") {
        [void]$tags.AddRange(@("wiki", "documentation"))
        $category = "wiki"
        $type = "wiki"
    }
    elseif ($FilePath -match "02_RESEARCH") {
        [void]$tags.AddRange(@("research", "docs"))
        $category = "research"
        $type = "research"
    }
    elseif ($FilePath -match "wissen-hub.archive") {
        [void]$tags.AddRange(@("wissen-hub", "iceberg", "archive"))
        $category = "wissen-hub"
        $type = "archive"
    }
    elseif ($FilePath -match "shared.") {
        [void]$tags.AddRange(@("shared", "script", "devkitz"))
        $category = "shared-scripts"
        $type = "script"
    }
    elseif ($FilePath -match "modules.") {
        [void]$tags.AddRange(@("module", "dashboard", "devkitz"))
        $category = "dashboard-module"
        $type = "module"
    }
    elseif ($FilePath -match "templates.|github-hub.templates") {
        [void]$tags.AddRange(@("template", "bmad", "devkitz"))
        $category = "templates"
        $type = "template"
    }
    elseif ($FilePath -match "ONTHERUN") {
        [void]$tags.AddRange(@("mcp", "server", "backend"))
        $category = "backend"
        $type = "backend"
    }
    elseif ($FilePath -match "BACKEND|iceberg|datalakehouse") {
        [void]$tags.AddRange(@("data", "iceberg", "duckdb"))
        $category = "data-layer"
        $type = "data"
    }
    
    # Extension Tags
    switch ($Extension) {
        ".md"   { [void]$tags.Add("markdown") }
        ".json" { [void]$tags.Add("json") }
        ".js"   { [void]$tags.Add("javascript") }
        ".ts"   { [void]$tags.Add("typescript") }
        ".py"   { [void]$tags.Add("python") }
        ".yml"  { [void]$tags.Add("yaml") }
        ".yaml" { [void]$tags.Add("yaml") }
        ".css"  { [void]$tags.Add("css") }
        ".html" { [void]$tags.Add("html") }
        ".ps1"  { [void]$tags.Add("powershell") }
        ".sh"   { [void]$tags.Add("shell") }
        ".mdx"  { [void]$tags.Add("mdx") }
        ".txt"  { [void]$tags.Add("text") }
        ".zip"  { [void]$tags.Add("archive"); $type = "archive" }
    }
    
    $uniqueTags = $tags | Select-Object -Unique
    
    return @{
        Tags = $uniqueTags
        Category = $category
        Type = $type
    }
}

# --- Zusammenfassung aus Dateiinhalt extrahieren ---
function Get-FileSummary {
    param([string]$FilePath, [int]$MaxChars = 200)
    
    $ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    $textExts = @(".md", ".txt", ".json", ".yml", ".yaml", ".js", ".ts", ".py", ".css", ".html", ".mdx", ".ps1", ".sh")
    
    if ($textExts -contains $ext) {
        try {
            $content = Get-Content $FilePath -TotalCount 5 -ErrorAction SilentlyContinue -Encoding UTF8
            if ($content) {
                $lines = $content | Where-Object { $_ -match '\S' } | Select-Object -First 3
                $summary = ($lines -join " ") -replace '[#*`>]', '' -replace '\s+', ' '
                if ($summary.Length -gt $MaxChars) {
                    $summary = $summary.Substring(0, $MaxChars) + "..."
                }
                return $summary.Trim()
            }
        } catch { }
    }
    elseif ($ext -eq ".zip") {
        try {
            $size = (Get-Item $FilePath -ErrorAction SilentlyContinue).Length
            $sizeKB = [math]::Round($size / 1024)
            return "ZIP Archive - ${sizeKB}KB"
        } catch { return "ZIP Archive" }
    }
    
    return [System.IO.Path]::GetFileName($FilePath)
}

# --- Scan-Quellen definieren ---
$scanSources = @()

$scanSources += ,@{
    Name = "Prompt-Databases"
    Path = $ROOT_PROMPTS
    Include = @("*.md", "*.json", "*.txt", "*.py", "*.ts", "*.mdx", "*.yml", "*.yaml", "*.js")
    Exclude = @("node_modules", ".git", "__pycache__", ".next", "dist", "build")
    Source = "prompt-db"
}

$scanSources += ,@{
    Name = "DkZ Workflows"
    Path = (Join-Path $ROOT_DEVKITZ ".agents\workflows")
    Include = @("*.md", "*.yml")
    Exclude = @()
    Source = "devkitz"
}

$scanSources += ,@{
    Name = "DkZ Skills"
    Path = (Join-Path $ROOT_DEVKITZ ".agents\skills")
    Include = @("*.md", "*.js", "*.py")
    Exclude = @("node_modules")
    Source = "devkitz"
}

$scanSources += ,@{
    Name = "LLM Skills"
    Path = (Join-Path $ROOT_DEVKITZ "02_RESEARCH\awesome-llm-skills")
    Include = @("*.md", "*.json", "*.yml")
    Exclude = @(".git")
    Source = "community"
}

$scanSources += ,@{
    Name = "Wiki Docs"
    Path = (Join-Path $ROOT_DEVKITZ "04_SYSTEM\DEVKITZ_WIKI")
    Include = @("*.md", "*.html", "*.json")
    Exclude = @()
    Source = "devkitz"
}

$scanSources += ,@{
    Name = "Research Docs"
    Path = (Join-Path $ROOT_DEVKITZ "02_RESEARCH")
    Include = @("*.md", "*.json", "*.py", "*.yml")
    Exclude = @("awesome-llm-skills", "node_modules", ".git", "__pycache__")
    Source = "devkitz"
}

$scanSources += ,@{
    Name = "Shared Scripts"
    Path = (Join-Path $ROOT_DEVKITZ "01_PROJECTS\01_dashboard\shared")
    Include = @("*.js", "*.css")
    Exclude = @()
    Source = "devkitz"
}

# [WORKSPACE] hat eckige Klammern - spezieller Pfad
$workspacePath = Join-Path $ROOT_DEVKITZ "[WORKSPACE]"
$bmadPath = Join-Path $workspacePath "github-hub\templates"
$scanSources += ,@{
    Name = "BMAD Templates"
    Path = $bmadPath
    Include = @("*.md", "*.json", "*.yml")
    Exclude = @()
    Source = "devkitz"
    UseLiteralPath = $true
}

# --- Hauptscan ---
$allEntries = New-Object System.Collections.ArrayList
$stats = @{}
$totalFiles = 0
$hashSet = @{}

foreach ($source in $scanSources) {
    $sourceName = $source.Name
    $sourcePath = $source.Path
    
    # LiteralPath fuer Pfade mit eckigen Klammern
    $useLiteral = $false
    if ($source.ContainsKey('UseLiteralPath')) { $useLiteral = $source.UseLiteralPath }
    
    if (-not (Test-Path -LiteralPath $sourcePath)) {
        Write-Host "  ! Quelle nicht gefunden: $sourcePath" -ForegroundColor Yellow
        $stats[$sourceName] = 0
        continue
    }
    
    Write-Host "Scanne: $sourceName ..." -ForegroundColor Green
    
    $files = @()
    foreach ($pattern in $source.Include) {
        if ($useLiteral) {
            $found = Get-ChildItem -LiteralPath $sourcePath -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue
        } else {
            $found = Get-ChildItem -Path $sourcePath -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue
        }
        if ($found) {
            # Exclude anwenden
            foreach ($f in $found) {
                $excluded = $false
                foreach ($ex in $source.Exclude) {
                    if ($ex -and $f.FullName -match [regex]::Escape($ex)) {
                        $excluded = $true
                        break
                    }
                }
                if (-not $excluded) {
                    $files += $f
                }
            }
        }
    }
    
    $sourceCount = 0
    
    foreach ($file in $files) {
        $relPath = $file.FullName
        if ($hashSet.ContainsKey($relPath)) { continue }
        $hashSet[$relPath] = $true
        
        $ext = $file.Extension.ToLower()
        $autoTags = Get-AutoTags -FilePath $file.FullName -Extension $ext
        $summary = Get-FileSummary -FilePath $file.FullName
        
        # Relativen Pfad berechnen
        $relativePath = $file.FullName
        if ($file.FullName.StartsWith($ROOT_PROMPTS)) {
            $relativePath = $file.FullName.Substring($ROOT_PROMPTS.Length + 1)
        }
        elseif ($file.FullName.StartsWith($ROOT_DEVKITZ)) {
            $relativePath = $file.FullName.Substring($ROOT_DEVKITZ.Length + 1)
        }
        $relativePath = $relativePath -replace '\\', '/'
        
        $entry = @{
            file     = $file.Name
            path     = $relativePath
            type     = $autoTags.Type
            category = $autoTags.Category
            tags     = $autoTags.Tags
            summary  = $summary
            date     = $file.LastWriteTime.ToString("yyyy-MM-ddTHH:mm:ssZ")
            size     = $file.Length
            source   = $source.Source
        }
        
        [void]$allEntries.Add($entry)
        $sourceCount++
        $totalFiles++
    }
    
    $stats[$sourceName] = $sourceCount
    Write-Host "  -> $sourceCount Dateien indexiert" -ForegroundColor Gray
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  GESAMT: $totalFiles neue Dateien indexiert" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan

# --- Statistiken berechnen ---
$tagCloud = @{}
foreach ($entry in $allEntries) {
    foreach ($tag in $entry.tags) {
        if ($tagCloud.ContainsKey($tag)) { $tagCloud[$tag]++ }
        else { $tagCloud[$tag] = 1 }
    }
}
$topTags = $tagCloud.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 30

# --- master-data.js generieren ---
Write-Host ""
Write-Host "Generiere master-data.js ..." -ForegroundColor Yellow

# Bestehende Daten laden
$existingBrainArtifacts = "[]"
$existingWissenHub = "[]"

if (Test-Path $MASTER_DATA_JS) {
    $existingContent = Get-Content $MASTER_DATA_JS -Raw -Encoding UTF8
    # Brain Artifacts via simplem Split extrahieren
    $brainStart = $existingContent.IndexOf('"brain_artifacts":')
    if ($brainStart -ge 0) {
        $bracketStart = $existingContent.IndexOf('[', $brainStart)
        if ($bracketStart -ge 0) {
            # Finde matching ]
            $depth = 0
            $pos = $bracketStart
            while ($pos -lt $existingContent.Length) {
                if ($existingContent[$pos] -eq '[') { $depth++ }
                elseif ($existingContent[$pos] -eq ']') { $depth--; if ($depth -eq 0) { break } }
                $pos++
            }
            $existingBrainArtifacts = $existingContent.Substring($bracketStart, $pos - $bracketStart + 1)
        }
    }
    # Wissen Hub extrahieren
    $wissenStart = $existingContent.IndexOf('"wissen_hub":')
    if ($wissenStart -ge 0) {
        $bracketStart = $existingContent.IndexOf('[', $wissenStart)
        if ($bracketStart -ge 0) {
            $depth = 0
            $pos = $bracketStart
            while ($pos -lt $existingContent.Length) {
                if ($existingContent[$pos] -eq '[') { $depth++ }
                elseif ($existingContent[$pos] -eq ']') { $depth--; if ($depth -eq 0) { break } }
                $pos++
            }
            $existingWissenHub = $existingContent.Substring($bracketStart, $pos - $bracketStart + 1)
        }
    }
}

# Neue Eintraege als JSON-Strings bauen
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("  ""ecosystem_files"": [")

$isFirst = $true
foreach ($entry in $allEntries) {
    if (-not $isFirst) { [void]$sb.AppendLine(",") }
    $isFirst = $false
    
    $tagsStr = ($entry.tags | ForEach-Object { """$_""" }) -join ", "
    $summaryClean = ($entry.summary -replace '"', '\"') -replace '[\r\n]', ' '
    $pathClean = $entry.path -replace '\\', '/'
    
    [void]$sb.Append("    { ")
    [void]$sb.Append("""file"": ""$($entry.file)"", ")
    [void]$sb.Append("""path"": ""$pathClean"", ")
    [void]$sb.Append("""type"": ""$($entry.type)"", ")
    [void]$sb.Append("""category"": ""$($entry.category)"", ")
    [void]$sb.Append("""tags"": [$tagsStr], ")
    [void]$sb.Append("""summary"": ""$summaryClean"", ")
    [void]$sb.Append("""date"": ""$($entry.date)"", ")
    [void]$sb.Append("""size"": $($entry.size), ")
    [void]$sb.Append("""source"": ""$($entry.source)""")
    [void]$sb.Append(" }")
}

[void]$sb.AppendLine("")
[void]$sb.AppendLine("  ]")

# Statistik-Strings
$catStatsArr = @()
foreach ($s in $stats.GetEnumerator()) {
    $catStatsArr += """$($s.Key)"": $($s.Value)"
}
$catStatsJson = $catStatsArr -join ", "

$topTagsArr = @()
foreach ($t in $topTags) {
    $topTagsArr += """$($t.Name)"": $($t.Value)"
}
$topTagsJson = $topTagsArr -join ", "

# Prompt-DB count
$promptDbCount = 0
if ($stats.ContainsKey("Prompt-Databases")) { $promptDbCount = $stats["Prompt-Databases"] }
$wfCount = 0
if ($stats.ContainsKey("DkZ Workflows")) { $wfCount = $stats["DkZ Workflows"] }
$skillCount = 0
if ($stats.ContainsKey("DkZ Skills")) { $skillCount = $stats["DkZ Skills"] }
$llmCount = 0
if ($stats.ContainsKey("LLM Skills")) { $llmCount = $stats["LLM Skills"] }

$dateStr = Get-Date -Format "yyyy-MM-dd HH:mm"
$scanDateStr = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
$totalCombined = 212 + $totalFiles

# Gesamt master-data.js zusammenstellen
$header = @"
// Auto-generated by DkZ Full Indexer - $dateStr
// Quellen: Prompt-DBs ($promptDbCount), Workflows ($wfCount), Skills ($skillCount), LLM ($llmCount)
const MASTER_INDEX = {
  "total_sessions": 91,
  "total_brain_artifacts": 212,
  "total_ecosystem_files": $totalFiles,
  "total_combined": $totalCombined,
  "scan_date": "$scanDateStr",
  "source_stats": { $catStatsJson },
  "top_tags": { $topTagsJson },
  "brain_artifacts": $existingBrainArtifacts,
$($sb.ToString()),
  "wissen_hub": $existingWissenHub
};
"@

if (-not $DryRun) {
    [System.IO.File]::WriteAllText($MASTER_DATA_JS, $header, [System.Text.Encoding]::UTF8)
    $fileSize = [math]::Round((Get-Item $MASTER_DATA_JS).Length / 1024)
    Write-Host "  -> master-data.js geschrieben (${fileSize}KB)" -ForegroundColor Green
} else {
    Write-Host "  [DRY RUN] master-data.js: $($header.Length) Zeichen" -ForegroundColor Yellow
}

# --- master-index.json generieren ---
Write-Host "Generiere master-index.json ..." -ForegroundColor Yellow

$catList = @()
$catGroups = $allEntries | Group-Object -Property { $_.category }
foreach ($grp in $catGroups) {
    $uniqueTypes = ($grp.Group | ForEach-Object { $_.type } | Select-Object -Unique)
    $catList += @{
        name  = $grp.Name
        count = $grp.Count
        types = $uniqueTypes
    }
}

$masterIndex = @{
    version          = "2.0.0"
    generated        = $scanDateStr
    generator        = "dkz-full-indexer.ps1"
    stats            = @{
        brain_artifacts  = 212
        ecosystem_files  = $totalFiles
        total_combined   = $totalCombined
        categories       = $stats.Count
        unique_tags      = $tagCloud.Count
    }
    source_breakdown = $stats
    categories       = $catList
}

if (-not $DryRun) {
    $masterIndex | ConvertTo-Json -Depth 5 | Out-File -FilePath $MASTER_INDEX_JSON -Encoding UTF8 -Force
    Write-Host "  -> master-index.json geschrieben" -ForegroundColor Green
} else {
    Write-Host "  [DRY RUN] master-index.json" -ForegroundColor Yellow
}

# --- Zusammenfassung ---
Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "              DkZ Full Indexer - Ergebnis             " -ForegroundColor Cyan
Write-Host "------------------------------------------------------" -ForegroundColor Cyan

foreach ($s in $stats.GetEnumerator()) {
    $padName = $s.Key.PadRight(22)
    $padCount = $s.Value.ToString().PadLeft(8)
    Write-Host "  $padName $padCount" -ForegroundColor White
}

Write-Host "------------------------------------------------------" -ForegroundColor Cyan
Write-Host "  GESAMT:                $($totalFiles.ToString().PadLeft(8))  Dateien" -ForegroundColor Green
Write-Host "  Kategorien:            $($stats.Count.ToString().PadLeft(8))" -ForegroundColor Gray
Write-Host "  Unique Tags:           $($tagCloud.Count.ToString().PadLeft(8))" -ForegroundColor Gray
Write-Host "  Brain Artifacts:              212  (beibehalten)" -ForegroundColor Gray
Write-Host "  Total Combined:        $($totalCombined.ToString().PadLeft(8))" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fertig! Dateien in: $OUTPUT_DIR" -ForegroundColor Green
