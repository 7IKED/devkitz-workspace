# GitHub Issues — Session 2026-05-30
# ===================================
# Alle File-Changes als Issues hinterlegen
# Ausfuehren: powershell -ExecutionPolicy Bypass -File issues-batch.ps1

$REPO = "7IKED/devkitz-workspace"
$TOKEN = $env:GITHUB_TOKEN
if (-not $TOKEN) { $TOKEN = $env:GH_TOKEN }

$headers = @{
    "Authorization" = "token $TOKEN"
    "Accept" = "application/vnd.github.v3+json"
    "Content-Type" = "application/json"
}

$issues = @(
    @{
        title = "feat(copilot): Gateway v2 + Landing Page + EventLog + AutoSync"
        body = "## Commit: d111ed7d`n`n### Dateien:`n- gateway.py (NEU) — FastAPI Backend Port 3060`n- landing.html (NEU) — Standalone mit Webhook Trigger`n- dkz-eventlog.js Integration`n- AutoSync FileWatcher`n- HMAC Webhook-Verifizierung`n- Ticket-System dkz-XX-NNN`n`n### Labels: dkz-copilot, type-feature, prio-p1"
        labels = @("dkz-copilot", "type-feature", "prio-p1")
    },
    @{
        title = "feat(copilot): Graphify React Panel + i18n DE/EN + Contrast Mode"
        body = "## Commit: c21a23c6`n`n### Dateien:`n- GraphifyPanel.jsx (NEU) — React Canvas Force-Layout`n- App.jsx — i18n DE/EN Toggle, Contrast Mode, Graphify Tab`n- index.css — Hyperreal Glassmorphism, High-Contrast CSS`n- TICKETS.md (NEU) — Copilot Queue`n`n### Features:`n- Multi-Source: Playbook + GitNexus + MiroFish + OpenHumans + OpenHands`n- Stats Dashboard: Kategorien, Quellen, Ebenen`n- Source-Indicators im Canvas`n- Chat mit Source-Kontext`n`n### Labels: dkz-copilot, dkz-graphify, type-feature, prio-p1"
        labels = @("dkz-copilot", "dkz-graphify", "type-feature", "prio-p1")
    },
    @{
        title = "feat(notepad): Keep-to-Drive Sync + DkZ Tags + Takeout Import"
        body = "## Commit: a7e8d276`n`n### Dateien:`n- keep-to-drive.gs (NEU) — Google Apps Script: Keep Export + Keep Loeschen + GitHub Tags`n- sync-notes.ps1 (NEU) — PowerShell: Drive/Keep Sync + rclone + Takeout`n- 06_NOTEPAD/note/tags/dkz-tags.json — 26 DkZ Tags`n- 06_NOTEPAD/note/tags/github-labels.json — GitHub Labels Sync`n- 482+ Takeout-Dateien importiert`n`n### Labels: type-feature, prio-p2"
        labels = @("type-feature", "prio-p2")
    },
    @{
        title = "feat(dashboard): 4-Quellen Ring-Chart + Morph Reader + TTS Vorlesen"
        body = "## Commit: 99658ba3`n`n### Dateien:`n- DashboardPanel.jsx — Komplett neu geschrieben`n`n### Features:`n- 4-Quellen Conic-Gradient Ring-Chart (Playbook/GitNexus/MiroFish/OpenHumans)`n- Morph Reader Dauermodus (persistent localStorage)`n- TTS Vorlesen: Einzel + Alle + Auto-Sequenz`n- Module Quick-Access Grid (12 Module)`n- Tagesplan mit Status-Tracking`n- Health Panel: System-Status`n- News Feed mit Typ-Icons`n`n### Labels: dkz-copilot, dkz-dashboard, type-feature, prio-p1"
        labels = @("dkz-copilot", "dkz-dashboard", "type-feature", "prio-p1")
    },
    @{
        title = "docs(agents): AGENTS.md auf 51 Agenten erweitert + 10 Antigravity Session Agents"
        body = "### Neue Agenten (42-51):`n- DkZ CoPilot Builder`n- DkZ Issue Fixer`n- DkZ LLMs Builder`n- DkZ Module Builder v1 + v2`n- DkZ Module Scaffold`n- Git Cleanup Agent`n- Git Housekeeping`n- GitHub README Pusher`n- React Panel Builder`n`n### Labels: type-task, prio-p2"
        labels = @("type-task", "prio-p2")
    },
    @{
        title = "fix(health): NanoChat Bridge Port 3040 offline — Neustart erforderlich"
        body = "### Problem:`nNanoChat Bridge auf Port 3040 antwortet nicht.`nChat-Funktionen in Graphify und anderen Modulen eingeschraenkt.`n`n### Fix:`nNeustart mit dkz-opencode-start.bat oder manuell Node starten.`n`n### Labels: type-bug, prio-p1, status-open"
        labels = @("type-bug", "prio-p1", "status-open")
    },
    @{
        title = "feat(infra): Gateway v2 auf VPS deployen — systemd Service"
        body = "### TODO:`n- SSH-Verbindung zu KVM8 pruefen`n- Python Dependencies installieren (FastAPI, uvicorn)`n- gateway.py nach /opt/dkz-copilot/ kopieren`n- systemd Service einrichten`n- Nginx Reverse Proxy konfigurieren`n- SSL mit Certbot`n`n### Labels: dkz-copilot, type-task, prio-p0"
        labels = @("dkz-copilot", "type-task", "prio-p0")
    },
    @{
        title = "feat(keep): Google Apps Script deployen + Keep Notizen loeschen"
        body = "### TODO:`n1. https://script.google.com oeffnen`n2. keep-to-drive.gs einfuegen`n3. Google Keep API Service aktivieren`n4. fullPipeline ausfuehren`n5. Ergebnis pruefen`n6. deleteAllKeepNotes ausfuehren`n7. Trigger setzen: syncKeepToDrive alle 15 Min`n`n### Labels: type-task, prio-p2"
        labels = @("type-task", "prio-p2")
    }
)

if (-not $TOKEN) {
    Write-Host "Kein GITHUB_TOKEN gefunden. Issues als Markdown gespeichert." -ForegroundColor Yellow
    $md = "# GitHub Issues — Session 2026-05-30`n`n"
    foreach ($issue in $issues) {
        $md += "## $($issue.title)`n`n$($issue.body)`n`n---`n`n"
    }
    Set-Content -Path "C:\DEVKiTZ\01_PROJECTS\dkz-copilot\ISSUES-BATCH.md" -Value $md -Encoding UTF8
    Write-Host "$($issues.Count) Issues als ISSUES-BATCH.md gespeichert" -ForegroundColor Green
    exit
}

$created = 0
foreach ($issue in $issues) {
    try {
        $payload = @{
            title = $issue.title
            body = $issue.body
            labels = $issue.labels
        } | ConvertTo-Json -Depth 3

        $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$REPO/issues" -Method Post -Headers $headers -Body $payload -ErrorAction Stop
        Write-Host "Issue #$($response.number): $($issue.title)" -ForegroundColor Green
        $created++
    } catch {
        Write-Host "Fehler: $($issue.title) - $_" -ForegroundColor Red
    }
}

Write-Host "`n$created/$($issues.Count) Issues erstellt" -ForegroundColor Cyan
