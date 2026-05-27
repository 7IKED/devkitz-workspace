---
name: chatsearch
description: Chat-Session durchsuchen, Artefakte retten, Temp-Daten archivieren und als strukturierten Index in C:\Users\BAZE²\Documents\DkZ ablegen. Vollständige Tiefensuche über ALLE Datenquellen.
---

# ChatSearch™ — Session-Wissen retten & archivieren

> **Wann nutzen:** Wenn Chat-Kontext verloren geht, Sessions archiviert werden müssen,
> Temp-Dateien gesichert werden sollen, oder Wissen aus vergangenen Gesprächen gesucht wird.

---

## 🎯 Zweck

Dieser Skill rettet, durchsucht und archiviert Wissen aus:
1. **Antigravity Brain** — Conversation Logs, Artefakte, Scratchpads
2. **System Temp** — CSV, JSON, XML, Logs aus `%TEMP%` (zeitbasiert)
3. **Session-Recordings** — Browser-Screenshots + WebP-Videos
4. **Projekt-Kontext** — Code-Änderungen, Git-History, offene Tabs
5. **DEVKiTZ Codebase** — Alle geänderten Code/Config-Dateien
6. **User-Verzeichnisse** — Desktop, Downloads, Documents, SecondBrain, Pictures
7. **Cloud-Speicher** — Google Drive (DriveFS), OneDrive

Alles wird zentral in `C:\Users\BAZE²\Documents\DkZ\` gespeichert mit INDEX.md.

---

## 📋 Vollständiger Ablauf — 10 Phasen

### Phase 1: Konfiguration

```powershell
# === PARAMETER — VOR JEDER SUCHE ANPASSEN ===
$stunden       = 12                                          # Zeitfenster in Stunden
$cutoff        = (Get-Date).AddHours(-$stunden)              # Cutoff-Zeitpunkt
$dkzDir        = "C:\Users\BAZE²\Documents\DkZ"             # Ziel-Archiv
$brainPath     = "C:\Users\BAZE²\.gemini\antigravity\brain"  # Antigravity Brain
$devkitzPath   = "C:\DEVKiTZ"                                # Workspace
$tempPath      = "$env:LOCALAPPDATA\Temp"                    # System Temp
$secondBrain   = "C:\Users\BAZE²\Documents\SecondBrain"      # Second Brain

# Ziel-Ordner sicherstellen
$subDirs = @("session-artefakte","screenshots","recordings","logs","csv-als-pdf","temp-antworten","devkitz-code-12h","wissensrettung","sync")
foreach($d in $subDirs) { New-Item "$dkzDir\$d" -ItemType Directory -Force | Out-Null }

# Session-Name-Mapping (Session-IDs → lesbare Namen)
$sessionMap = @{
    # Hier Session-IDs der letzten Conversations eintragen:
    # "7fef5a05" = "desktop-copilot"
    # "d3dfe594" = "persistent-copilot"
    # "88f552ac" = "agentic-audit"
}
```

### Phase 2: DEVKiTZ Codebase scannen (Kern-Bereiche)

```powershell
# DEVKiTZ — Gezielte Suche in Kern-Bereichen (schneller als Vollscan)
$targetDirs = @(
    "$devkitzPath\01_PROJECTS\01_dashboard",
    "$devkitzPath\01_PROJECTS\dkz-webapp",
    "$devkitzPath\01_PROJECTS\dkz-copilot-desktop",
    "$devkitzPath\01_PROJECTS\10_wiki-hub",
    "$devkitzPath\01_PROJECTS\10_devkitz-eu",
    "$devkitzPath\ONTHERUN",
    "$devkitzPath\BACKEND",
    "$devkitzPath\.agents",
    "$devkitzPath\04_SYSTEM"
)
$codeDir = "$dkzDir\devkitz-code-12h"
$copied = 0
foreach($dir in $targetDirs) {
    if(!(Test-Path $dir)) { continue }
    $files = Get-ChildItem $dir -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.LastWriteTime -gt $cutoff -and
        $_.FullName -notmatch '\\node_modules\\' -and
        $_.FullName -notmatch '\\dist\\' -and
        $_.FullName -notmatch '\\.git\\' -and
        $_.Name -notmatch 'package-lock' -and
        $_.Extension -match '\.(html|css|js|json|md|yml|yaml|txt|py|sh|ps1|ini)$' -and
        $_.Length -lt 200KB
    }
    foreach($f in $files) {
        $rel = $f.FullName.Replace("$devkitzPath\","").Replace("\","__")
        Copy-Item $f.FullName "$codeDir\$rel" -Force
        $copied++
    }
}
Write-Host "=== $copied DEVKiTZ Code-Dateien kopiert ===" -ForegroundColor Green
```

### Phase 3: Antigravity Brain — Alle Sessions scannen

```powershell
# Brain durchsuchen — ALLE Conversations der letzten N Stunden
Get-ChildItem $brainPath -Directory | ForEach-Object {
    $convDir = $_.FullName
    $convId = $_.Name
    $shortId = $convId.Substring(0,8)
    $name = if($sessionMap[$shortId]) { $sessionMap[$shortId] } else { $shortId }
    
    # Relevante Dateien zählen (ohne dom_ Snapshots)
    $recentFiles = Get-ChildItem $convDir -Recurse -File -EA 0 | Where-Object {
        $_.LastWriteTime -gt $cutoff -and $_.Name -notmatch '^dom_'
    }
    if($recentFiles.Count -eq 0) { return }
    Write-Host "`n[$shortId] $name — $($recentFiles.Count) Dateien" -ForegroundColor Cyan

    # 1. Artefakte (walkthrough, task, plan, notes)
    $mdFiles = Get-ChildItem $convDir -File -EA 0 | Where-Object {
        $_.LastWriteTime -gt $cutoff -and
        $_.Name -match '(walkthrough|task|implementation_plan|notes)\.md$' -and
        $_.Name -notmatch '\.(resolved|metadata)\.'
    }
    foreach($f in $mdFiles) {
        Copy-Item $f.FullName "$dkzDir\session-artefakte\${name}_$($f.Name)" -Force
    }

    # 2. Scratch-Dateien
    if(Test-Path "$convDir\scratch") {
        Get-ChildItem "$convDir\scratch" -File -EA 0 | Where-Object {
            $_.LastWriteTime -gt $cutoff -and $_.Name -notmatch '\.resolved\.'
        } | ForEach-Object {
            Copy-Item $_.FullName "$dkzDir\session-artefakte\${name}_scratch_$($_.Name)" -Force
        }
    }

    # 3. Browser Scratchpads
    if(Test-Path "$convDir\browser") {
        Get-ChildItem "$convDir\browser" -File -EA 0 | Where-Object {
            $_.LastWriteTime -gt $cutoff -and $_.Name -notmatch '\.resolved\.'
        } | ForEach-Object {
            Copy-Item $_.FullName "$dkzDir\session-artefakte\${name}_browser_$($_.Name)" -Force
        }
    }

    # 4. Session-Log
    $logFile = "$convDir\.system_generated\logs\overview.txt"
    if((Test-Path $logFile) -and (Get-Item $logFile).LastWriteTime -gt $cutoff) {
        Copy-Item $logFile "$dkzDir\logs\${name}_overview.txt" -Force
    }

    # 5. Click-Feedback Screenshots (blauer Rand)
    $clickDir = "$convDir\.system_generated\click_feedback"
    if(Test-Path $clickDir) {
        Get-ChildItem $clickDir -File -EA 0 | Where-Object { $_.LastWriteTime -gt $cutoff } | ForEach-Object {
            Copy-Item $_.FullName "$dkzDir\screenshots\${name}_$($_.Name)" -Force
        }
    }

    # 6. Recordings (.webp/.mp4/.gif)
    Get-ChildItem $convDir -File -EA 0 | Where-Object {
        $_.LastWriteTime -gt $cutoff -and $_.Extension -match '\.(webp|mp4|gif)$'
    } | ForEach-Object {
        Copy-Item $_.FullName "$dkzDir\recordings\${name}_$($_.Name)" -Force
    }

    # 7. Benannte Screenshots (.png im Root, NICHT media_)
    Get-ChildItem $convDir -File -EA 0 | Where-Object {
        $_.LastWriteTime -gt $cutoff -and $_.Extension -eq '.png' -and $_.Name -notmatch '^media_'
    } | ForEach-Object {
        Copy-Item $_.FullName "$dkzDir\screenshots\${name}_$($_.Name)" -Force
    }
}
```

### Phase 4: User-Verzeichnisse durchsuchen

```powershell
# Alle User-Ordner systematisch scannen
$userDirs = @(
    "C:\Users\BAZE²\Desktop",
    "C:\Users\BAZE²\Downloads",
    "C:\Users\BAZE²\Documents",
    "C:\Users\BAZE²\Documents\SecondBrain",
    "C:\Users\BAZE²\OneDrive",
    "C:\Users\BAZE²\Pictures"
)

foreach($dir in $userDirs) {
    if(!(Test-Path $dir)) { Write-Host "  [SKIP] $dir" -ForegroundColor DarkGray; continue }
    $files = Get-ChildItem $dir -Recurse -File -EA 0 | Where-Object {
        $_.LastWriteTime -gt $cutoff -and
        $_.FullName -notmatch '\\node_modules\\' -and
        $_.FullName -notmatch '\\.git\\' -and
        $_.FullName -notmatch '\\\.gemini\\'
    }
    if($files.Count -gt 0) {
        Write-Host "`n=== $dir — $($files.Count) Dateien ===" -ForegroundColor Cyan
        $files | Sort-Object LastWriteTime -Descending | Select-Object -First 30 | ForEach-Object {
            $relPath = $_.FullName.Replace("C:\Users\BAZE²\","~\")
            $sizeKB = [math]::Round($_.Length/1KB,1)
            Write-Host "  $($_.LastWriteTime.ToString('HH:mm')) | $sizeKB KB | $relPath"
        }
    }
}
```

### Phase 5: Google Drive / Cloud-Speicher suchen

```powershell
# Google Drive Pfade durchsuchen (alle bekannten Mount-Punkte)
$drivePaths = @(
    "C:\Users\BAZE²\Google Drive",
    "C:\Users\BAZE²\My Drive",
    "G:\My Drive",
    "G:\Meine Ablage",
    "C:\Users\BAZE²\GoogleDrive",
    "$env:USERPROFILE\Google Drive",
    "$env:USERPROFILE\AppData\Local\Google\DriveFS"
)

Write-Host "=== GOOGLE DRIVE SUCHE ===" -ForegroundColor Magenta
$driveFound = $false
foreach($d in $drivePaths) {
    if(Test-Path $d) {
        Write-Host "  [FOUND] $d" -ForegroundColor Green
        $driveFound = $true
        Get-ChildItem $d -Recurse -File -EA 0 | Where-Object { $_.LastWriteTime -gt $cutoff } |
            Select-Object -First 20 | ForEach-Object {
                Write-Host "    $($_.LastWriteTime.ToString('HH:mm')) | $([math]::Round($_.Length/1KB,1)) KB | $($_.Name)"
            }
    }
}
if(!$driveFound) {
    Write-Host "  [WARN] Google Drive NICHT lokal gemountet — nur Browser-Zugriff möglich" -ForegroundColor Yellow
    # FALLBACK: Browser-Suche via chrome-devtools-mcp
    # mcp_chrome-devtools-mcp_new_page → https://drive.google.com
    # mcp_chrome-devtools-mcp_take_snapshot → Dateien auslesen
}

# OneDrive prüfen
$oneDrivePaths = @("C:\Users\BAZE²\OneDrive", "$env:OneDrive")
foreach($d in $oneDrivePaths) {
    if($d -and (Test-Path $d)) {
        Write-Host "`n=== OneDrive: $d ===" -ForegroundColor Blue
        Get-ChildItem $d -Recurse -File -EA 0 | Where-Object { $_.LastWriteTime -gt $cutoff } |
            Select-Object -First 20 | ForEach-Object {
                Write-Host "  $($_.LastWriteTime.ToString('HH:mm')) | $([math]::Round($_.Length/1KB,1)) KB | $($_.Name)"
            }
    }
}
```

### Phase 6: Temp-Dateien filtern & sichern

```powershell
# Temp-Ordner nach Zeitfenster durchsuchen
$relevantExts = '\.(csv|json|xml|txt|md|log|html|xlsx|pdf|png|jpg|webp)$'
$dateien = Get-ChildItem $tempPath -File -EA 0 | Where-Object {
    $_.LastWriteTime -gt $cutoff -and
    $_.Extension -match $relevantExts -and
    $_.Length -gt 1KB
} | Sort-Object LastWriteTime -Descending

Write-Host "=== TEMP — $($dateien.Count) relevante Dateien ===" -ForegroundColor Yellow
$dateien | Select-Object -First 30 | ForEach-Object {
    Write-Host "  $($_.LastWriteTime.ToString('HH:mm')) | $([math]::Round($_.Length/1KB,1)) KB | $($_.Name)"
}

# Kopieren (ohne CPU Profiles und System-Dateien)
$dateien | Where-Object { $_.Name -notmatch 'cpuprofile|renderer-|unleash-' } |
    Copy-Item -Destination "$dkzDir\temp-antworten" -Force
```

### Phase 7: CSV → HTML-Tabellen konvertieren

Für jede CSV-Datei eine HTML-Tabelle im DkZ™ Design erstellen:

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>[DATEINAME] — DkZ™ Tabellen-Viewer</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #060608; color: #e8e8ec; padding: 32px; }
        h1 { color: #fa1e4e; font-size: 24px; margin-bottom: 8px; }
        .meta { color: #8a8a9a; font-size: 13px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; font-family: 'JetBrains Mono', monospace; }
        th { background: rgba(250, 30, 78, 0.15); color: #fa1e4e; padding: 10px 12px; text-align: left; position: sticky; top: 0; border-bottom: 2px solid rgba(250, 30, 78, 0.3); }
        td { padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        tr:hover td { background: rgba(250, 30, 78, 0.05); }
        tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
    </style>
</head>
<body>
    <h1>[TITEL]</h1>
    <p class="meta">[ZEILEN] Zeilen · Quelle: [DATEI] · Erstellt: [DATUM]</p>
    <table>
        <thead><tr><!-- HEADER --></tr></thead>
        <tbody><!-- ROWS (max 500 bei großen Dateien) --></tbody>
    </table>
</body>
</html>
```

**Große CSVs (>500 Zeilen):** Nur Top-500 anzeigen, Titel anpassen: `"(Top 500 von X)"`

### Phase 8: Screenshots der Tabellen erstellen

```
1. HTML-Datei im Browser öffnen (Vivaldi/Chrome)
2. browser_subagent oder chrome-devtools-mcp nutzen:
   - mcp_chrome-devtools-mcp_navigate_page → HTML-Datei öffnen
   - mcp_chrome-devtools-mcp_take_screenshot → fullPage: true, format: png
   - Screenshot in csv-als-pdf/ ablegen
3. Bei sehr langen Tabellen: Seite in Abschnitte teilen (Scroll + Screenshot)
```

### Phase 9: Desktop-Dateien sichern

```powershell
# Desktop: NUR ABLEGEN, niemals bestehende ändern! (Eiserne Regel)
$desktop = "C:\Users\BAZE²\Desktop"
Get-ChildItem $desktop -File -EA 0 | Where-Object { $_.LastWriteTime -gt $cutoff } | ForEach-Object {
    $dest = "$dkzDir\screenshots\desktop_$($_.Name)"
    Copy-Item $_.FullName $dest -Force
    Write-Host "[DESKTOP] $($_.Name) gesichert" -ForegroundColor Green
}
```

### Phase 10: INDEX.md generieren

```powershell
# Gesamtinventar erstellen
$allFiles = Get-ChildItem $dkzDir -Recurse -File -EA 0
$totalSize = ($allFiles | Measure-Object -Property Length -Sum).Sum
$sizeMB = [math]::Round($totalSize/1MB,1)

$stats = @{}
Get-ChildItem $dkzDir -Directory | ForEach-Object {
    $subFiles = Get-ChildItem $_.FullName -Recurse -File -EA 0
    $subSize = ($subFiles | Measure-Object -Property Length -Sum).Sum
    $stats[$_.Name] = @{ Count = $subFiles.Count; SizeMB = [math]::Round($subSize/1MB,1) }
}

# INDEX.md schreiben (siehe Vorlage unten)
$index = "# DkZ Archiv — Vollständiges Inventar`n`n"
$index += "> Stand: $(Get-Date -Format 'yyyy-MM-dd HH:mm') · $($allFiles.Count) Dateien · $sizeMB MB`n`n"
$stats.GetEnumerator() | Sort-Object { $_.Value.Count } -Descending | ForEach-Object {
    $index += "| $($_.Key) | $($_.Value.Count) | $($_.Value.SizeMB) MB |`n"
}
$index | Out-File "$dkzDir\INDEX.md" -Encoding UTF8
```

---

## 🔍 Chat-Suche — Vergangene Sessions durchsuchen

### Conversation Logs finden

```powershell
# Alle Conversations auflisten (nach Datum sortiert)
Get-ChildItem $brainPath -Directory | 
  Sort-Object LastWriteTime -Descending |
  Select-Object Name, LastWriteTime -First 20

# Overview einer bestimmten Conversation lesen
$convId = "CONVERSATION-ID-HIER"
Get-Content "$brainPath\$convId\.system_generated\logs\overview.txt" -Encoding UTF8
```

### In allen Conversations suchen (Volltextsuche)

```powershell
$suchbegriff = "SUCHBEGRIFF"
Get-ChildItem "$brainPath\*\.system_generated\logs\overview.txt" -EA 0 |
  Select-String -Pattern $suchbegriff -Context 3,3 |
  ForEach-Object {
    $convId = ($_.Path -split '\\')[-4]
    Write-Host "=== Conversation: $convId ===" -ForegroundColor Cyan
    Write-Host $_.Line
  }
```

### Artefakte aller Sessions durchsuchen

```powershell
# Alle Walkthroughs / Tasks / Plans finden
@("walkthrough.md","task.md","implementation_plan.md") | ForEach-Object {
    $pattern = $_
    Write-Host "`n=== $pattern ===" -ForegroundColor Yellow
    Get-ChildItem "$brainPath\*\$pattern" -EA 0 |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 10 | ForEach-Object {
            $convId = ($_.FullName -split '\\')[-2].Substring(0,8)
            Write-Host "  $($_.LastWriteTime.ToString('MM-dd HH:mm')) | $convId | $($_.FullName)"
        }
}
```

---

## 🧠 Wissensrettung bei Amnesie

### Prompt 1: Session-Kontext rekonstruieren

```
Du bist ein KI-Agent der gerade seinen Kontext verloren hat.
Analysiere ALLE folgenden Quellen und erstelle eine vollständige
Zusammenfassung von:
1. Was wurde in der letzten Session gemacht?
2. Welche Dateien wurden geändert?
3. Welche Entscheidungen wurden getroffen?
4. Was sind die nächsten Schritte?

Quellen:
- Git Log: `git log --oneline -20`
- Brain Artefakte: walkthrough.md, task.md, implementation_plan.md
- Conversation Log: overview.txt
- GEMINI.md: Projektgedächtnis
- CLAUDE.md: Claude-Gedächtnis
```

### Prompt 2: Projekt-Wissen extrahieren

```
Analysiere das DEVKiTZ Projekt und schreibe ALLES auf was du darüber weißt:
1. Architektur und Tech-Stack
2. Module und ihre Funktionen
3. Aktuelle Entwicklungsphase
4. Offene Tasks und Blocker
5. Infrastruktur (Server, VPS, Domains)
6. Letzte Änderungen (git diff HEAD~5)

Formatiere als strukturiertes Markdown.
Speichere in: C:\Users\BAZE²\Documents\DkZ\wissensrettung\[datum]_recovery.md
```

---

## 📁 Zielstruktur — C:\Users\BAZE²\Documents\DkZ

```
DkZ/
├── INDEX.md                    ← Master-Index (IMMER aktuell halten!)
├── temp-antworten/             ← Rohdaten aus %TEMP%
├── csv-als-pdf/                ← Konvertierte Tabellen (HTML + PNG)
├── session-artefakte/          ← Walkthroughs, Tasks, Plans, Scratchpads
├── screenshots/                ← Click-Feedback, UI-Screenshots, Desktop
├── recordings/                 ← WebP/MP4 Browser-Recordings
├── logs/                       ← Session-Transkripte (overview.txt)
├── devkitz-code-12h/           ← Alle geänderten Code-Dateien (flach)
├── wissensrettung/             ← Amnesie-Recovery Dateien
└── sync/                       ← Second Brain Sync
```

---

## 🔧 Infrastruktur-Kontext

### Server & VPS

| Server | Host | Dienste | SSH-Key |
|:-------|:-----|:--------|:--------|
| KVM8 | srv809348.hstgr.cloud | n8n, ONTHERUN Gateway | dkz_hostinger |
| KVM4 | (vLLM/OpenClaw) | vLLM Inference, OpenClaw Browser | dkz_hostinger |
| Lokal | 127.0.0.1:3040 | ONTHERUN Gateway | — |

### Suchraum-Matrix (ALLE durchsuchen!)

| Quelle | Pfad | Typ |
|:-------|:-----|:----|
| DEVKiTZ Workspace | `C:\DEVKiTZ\` | Code, Config, Docs |
| Antigravity Brain | `C:\Users\BAZE²\.gemini\antigravity\brain\` | Sessions, Artefakte |
| Knowledge Items | `C:\Users\BAZE²\.gemini\antigravity\knowledge\` | KI-Summaries |
| DkZ Archiv | `C:\Users\BAZE²\Documents\DkZ\` | Gesichertes Wissen |
| SecondBrain | `C:\Users\BAZE²\Documents\SecondBrain\` | Alle LLMs |
| Desktop | `C:\Users\BAZE²\Desktop\` | Abgelegte Dateien |
| Downloads | `C:\Users\BAZE²\Downloads\` | Heruntergeladenes |
| Pictures | `C:\Users\BAZE²\Pictures\` | Screenshots |
| Temp | `$env:LOCALAPPDATA\Temp\` | Flüchtige Daten |
| Google Drive | Diverse Mount-Punkte (siehe Phase 5) | Cloud-Dateien |
| OneDrive | `$env:OneDrive` | Cloud-Sync |

---

## ⚡ Schnellbefehle (One-Liner)

```powershell
# Letzte Session archivieren
$conv = (Get-ChildItem $brainPath -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1).Name; Write-Host "Archiviere: $conv"

# Temp-Dateien der letzten N Stunden
$h = 12; Get-ChildItem $env:TEMP -File | Where-Object { $_.LastWriteTime -gt (Get-Date).AddHours(-$h) -and $_.Extension -match '\.(csv|json|xml|txt|md|html)$' -and $_.Length -gt 1KB } | Sort-Object Length -Descending | Format-Table Name, @{L='MB';E={[math]::Round($_.Length/1MB,2)}}, LastWriteTime

# Volltextsuche in allen Sessions
$q = "Suchbegriff"; Get-ChildItem "$brainPath\*\.system_generated\logs\overview.txt" -EA 0 | Select-String $q | Group-Object Path | ForEach-Object { $id = ($_.Name -split '\\')[-4]; "$id — $($_.Count) Treffer" }

# DkZ Ordner öffnen
Start-Process "C:\Users\BAZE²\Documents\DkZ"

# Archiv-Statistik
$d = "C:\Users\BAZE²\Documents\DkZ"; $f = Get-ChildItem $d -Recurse -File; Write-Host "$($f.Count) Dateien, $([math]::Round(($f|Measure-Object Length -Sum).Sum/1MB,1)) MB"
```

---

## 📌 Wichtige Pfade

| Was | Pfad |
|:----|:-----|
| Brain Root | `C:\Users\BAZE²\.gemini\antigravity\brain\` |
| Knowledge Items | `C:\Users\BAZE²\.gemini\antigravity\knowledge\` |
| DkZ Archiv | `C:\Users\BAZE²\Documents\DkZ\` |
| Second Brain | `C:\Users\BAZE²\Documents\SecondBrain\` |
| ONTHERUN | `C:\DEVKiTZ\ONTHERUN\` |
| Dashboard | `C:\DEVKiTZ\01_PROJECTS\01_dashboard\` |
| Temp | `C:\Users\BAZE²\AppData\Local\Temp\` |

---

*ChatSearch™ v2.0 — Kein Wissen geht verloren. Niemals.*
