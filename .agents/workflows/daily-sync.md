---
description: Obsidian Second Brain täglich synchronisieren — Daily Note, Session-Logs, Research-Ingest
---

# Daily Sync Workflow

## Automatisch bei Session-Start ausführen

### 1. Daily Note erstellen/prüfen
```powershell
$date = Get-Date -Format "yyyy-MM-dd"
$dailyPath = "C:\DEVKiTZ\02_RESEARCH\ai-wiki\dailys\$date.md"

if (-not (Test-Path $dailyPath)) {
    # Template kopieren und Datum einsetzen
    $template = Get-Content "C:\DEVKiTZ\02_RESEARCH\ai-wiki\templates\daily-template.md" -Raw
    $template = $template -replace '\{\{date\}\}', $date
    $template | Set-Content $dailyPath -Encoding UTF8
    Write-Host "✅ Daily Note erstellt: $dailyPath"
} else {
    Write-Host "📋 Daily Note existiert bereits: $dailyPath"
}
```

### 2. Ordner-Struktur sicherstellen
```powershell
$paths = @(
    "C:\DEVKiTZ\02_RESEARCH\ai-wiki\dailys",
    "C:\DEVKiTZ\02_RESEARCH\ai-wiki\logs\sessions",
    "C:\DEVKiTZ\02_RESEARCH\ai-wiki\logs\deployments",
    "C:\DEVKiTZ\02_RESEARCH\ai-wiki\logs\errors",
    "C:\DEVKiTZ\02_RESEARCH\ai-wiki\skills",
    "C:\DEVKiTZ\02_RESEARCH\ai-wiki\projects",
    "C:\DEVKiTZ\02_RESEARCH\ai-wiki\research",
    "C:\DEVKiTZ\02_RESEARCH\ai-wiki\templates"
)

foreach ($p in $paths) {
    if (-not (Test-Path $p)) {
        New-Item -ItemType Directory -Path $p -Force | Out-Null
        Write-Host "📁 Erstellt: $p"
    }
}
```

### 3. Session-Log anlegen
```powershell
$date = Get-Date -Format "yyyy-MM-dd"
$sessionDir = "C:\DEVKiTZ\02_RESEARCH\ai-wiki\logs\sessions"
$existing = Get-ChildItem $sessionDir -Filter "${date}_session-*.md" | Measure-Object
$nr = $existing.Count + 1
$sessionPath = "$sessionDir\${date}_session-$('{0:D2}' -f $nr).md"

$template = Get-Content "C:\DEVKiTZ\02_RESEARCH\ai-wiki\templates\session-log-template.md" -Raw
$template = $template -replace '\{\{date\}\}', $date
$template = $template -replace '\{\{session-nr\}\}', ('{0:D2}' -f $nr)
$template | Set-Content $sessionPath -Encoding UTF8
Write-Host "🤖 Session-Log erstellt: $sessionPath"
```

### 4. Daily Note am Session-Ende aktualisieren
- Erledigte Aufgaben eintragen
- Neue Dateien loggen
- Metriken aktualisieren
- Learnings dokumentieren
- Session-Log verlinken

### 5. Vault-Statistik
```powershell
$vault = "C:\DEVKiTZ\02_RESEARCH\ai-wiki"
$total = (Get-ChildItem $vault -Recurse -File | Measure-Object).Count
$dailys = (Get-ChildItem "$vault\dailys" -File -ErrorAction SilentlyContinue | Measure-Object).Count
$sessions = (Get-ChildItem "$vault\logs\sessions" -File -ErrorAction SilentlyContinue | Measure-Object).Count
$research = (Get-ChildItem "$vault\research" -File -ErrorAction SilentlyContinue | Measure-Object).Count

Write-Host "📊 Vault-Statistik:"
Write-Host "   Total: $total Dateien"
Write-Host "   Dailys: $dailys"
Write-Host "   Sessions: $sessions"
Write-Host "   Research: $research"
```

## Mit Obsidian CLI (wenn installiert)
```bash
# Daily Note lesen
obsidian daily:read

# Aufgabe zum Daily hinzufügen
obsidian daily:append content="- [x] Cloud Functions Skills erstellt"

# Vault durchsuchen
obsidian search query="cloud functions" limit=10

# Tags auflisten
obsidian tags sort=count counts
```

## Auto-Trigger
| Event | Aktion |
|:------|:-------|
| Session-Start | Daily + Session-Log erstellen |
| Datei erstellt | Im Daily loggen |
| Deploy | Deploy-Log + Daily Update |
| Fehler | Error-Log erstellen |
| Session-Ende | Metriken + Learnings + Commit |
