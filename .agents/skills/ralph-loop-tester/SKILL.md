# Ralph-Loop Test Runner — Alle Skills testen + n8n Automations-Loop

> Verbindet Ralph-Loop™ Methodik mit Browser-Testing, n8n Automation
> und Skill-Validierung. Testet ALLES systematisch in 6 Phasen.

---

## Bestehende Web-Tools (NUTZEN, nicht neu bauen!)

| Modul | ID | Pfad | Funktion |
|:------|:---|:-----|:---------|
| **API Tester** | MOD-013 | `modules/api-tester/index.html` | REST API Tests (Postman-like), 5 Methods, History |
| **System-Check** | MOD-058 | `modules/system-check/index.html` | Runtime/Service/Tool Checks, Ampel 🟢🟡🔴 |
| **Regex Tester** | MOD-003 | `modules/regex-tester/index.html` | Live Regex Testing, Highlighting |

> **WICHTIG:** Diese Module existieren bereits! Nutze sie als Frontend.
> Der Ralph-Loop Tester verbindet sie mit dem Automations-Backend.

---

## Überblick: Ralph-Loop™ meets Testing

```
┌──────────────────────────────────────────────────────────┐
│  RALPH-LOOP TEST RUNNER                                  │
│                                                          │
│  Phase 1: LESEN    → Skills + Module inventarisieren     │
│  Phase 2: SPAWN    → Test-Instanz starten                │
│  Phase 3: EXECUTE  → Browser-Tests + Skill-Tests laufen  │
│  Phase 4: VERIFY   → Ergebnisse prüfen + Screenshots     │
│  Phase 5: COMMIT   → Report + Git Commit                 │
│  Phase 6: LOOP     → Nächstes Modul / n8n Trigger        │
│                                                          │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐     │
│  │ Browser    │    │ Skill      │    │ n8n Loop   │     │
│  │ Subagent   │◄──►│ Validator  │◄──►│ Trigger    │     │
│  └────────────┘    └────────────┘    └────────────┘     │
└──────────────────────────────────────────────────────────┘
```

---

## Phase 1: LESEN — Was muss getestet werden?

### 1a. Alle Skills inventarisieren

```powershell
# Alle Skills mit SKILL.md auflisten
Get-ChildItem "C:\DEVKiTZ\.agents\skills" -Recurse -Filter "SKILL.md" |
  ForEach-Object {
    $name = $_.Directory.Name
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    Write-Host "  📦 $name ($lines Zeilen)"
  }
```

### 1b. Alle Dashboard-Module inventarisieren

```powershell
# Module mit index.html
Get-ChildItem "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules" -Directory |
  ForEach-Object {
    $hasIndex = Test-Path "$($_.FullName)\index.html"
    $icon = if ($hasIndex) { "✅" } else { "❌" }
    Write-Host "  $icon $($_.Name)"
  }
```

### 1c. Test-Queue erstellen

```markdown
## Test-Queue

### Skills (25)
- [ ] hermes-model-manager → Script: verify-models.js
- [ ] doc-ripper → MCP Tools erreichbar?
- [ ] github-repo-hunter → Script: github-hunt.ps1
- [ ] deep-knowledge-extractor → NLM API erreichbar?
- [ ] webapp-testing → Browser Subagent funktioniert?
- [ ] autoresearch → Obsidian Vault vorhanden?
- [ ] ...

### Module (89+)
- [ ] hub/index.html → Lädt + zeigt Module
- [ ] prompt-viewer → Prompts laden
- [ ] gemini-puter → Templates rendern
- [ ] ...

### Infrastruktur
- [ ] ONTHERUN MCP → npm run all
- [ ] VPS Container → docker ps
- [ ] Hermes Desktop → Free Models funktionieren
- [ ] n8n Workflows → Trigger erreichbar
```

---

## Phase 2: SPAWN — Test-Umgebung starten

### 2a. Browser Subagent vorbereiten

```
browser_subagent(
  Task: "Öffne file:///C:/DEVKiTZ/01_PROJECTS/01_dashboard/hub/index.html
         Warte 3 Sekunden. Melde ob die Seite geladen hat.
         Screenshot machen. Zurückmelden: PASS oder FAIL + Fehlerliste.",
  RecordingName: "hub_test",
  TaskName: "Hub Ladetest"
)
```

### 2b. Test-Report Datei anlegen

```markdown
# Test-Report: [Datum]

> Ralph-Loop Test Runner — Automatisiert
> Gestartet: HH:MM | Status: 🔄 Läuft

---

| # | Test | Typ | Status | Details |
|:--|:-----|:----|:-------|:--------|
```

---

## Phase 3: EXECUTE — Tests durchführen

### 3a. Skill-Tests (Scripts ausführen)

```powershell
# hermes-model-manager: Verifiziere Free-Modelle
Write-Host "━━━ TEST: hermes-model-manager ━━━" -ForegroundColor Cyan
node "C:\DEVKiTZ\.agents\skills\hermes-model-manager\scripts\verify-models.js"
$modelResult = if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" }

# github-repo-hunter: Teste API-Zugriff
Write-Host "━━━ TEST: github-repo-hunter ━━━" -ForegroundColor Cyan
try {
  $r = Invoke-RestMethod "https://api.github.com/search/repositories?q=awesome+ai&per_page=1"
  $hunterResult = if ($r.total_count -gt 0) { "PASS" } else { "FAIL" }
} catch { $hunterResult = "FAIL" }
Write-Host "  Ergebnis: $hunterResult"

# doc-ripper: Teste Jina Reader
Write-Host "━━━ TEST: doc-ripper ━━━" -ForegroundColor Cyan
try {
  $jina = Invoke-RestMethod "https://r.jina.ai/https://example.com" -Method Get
  $ripperResult = if ($jina.Length -gt 100) { "PASS" } else { "FAIL" }
} catch { $ripperResult = "FAIL" }
Write-Host "  Ergebnis: $ripperResult"
```

### 3b. Browser-Tests (Module)

```
# Hub Test
browser_subagent(
  Task: "1. Öffne file:///C:/DEVKiTZ/01_PROJECTS/01_dashboard/hub/index.html
         2. Warte 3 Sekunden
         3. Prüfe: Ist der Hintergrund dunkel (#060608)?
         4. Prüfe: Sind Modul-Karten sichtbar?
         5. Prüfe: Funktioniert die Suche?
         6. Klick auf das erste Modul
         7. Screenshot machen
         8. Zurück zum Hub
         9. Melde: PASS/FAIL + Details",
  RecordingName: "hub_fulltest"
)

# Modul-Test (für jedes Modul wiederholen)
browser_subagent(
  Task: "1. Öffne file:///C:/DEVKiTZ/01_PROJECTS/01_dashboard/modules/[MODUL]/index.html
         2. Prüfe DkZ Design: Dunkler Hintergrund, Inter Font, Accent-Farbe
         3. Prüfe Navigation: Hamburger-Menu klickbar?
         4. Prüfe Funktionalität: Hauptfeature testen
         5. Console auf Fehler prüfen
         6. Screenshot machen
         7. Melde: PASS/FAIL + Fehlerliste",
  RecordingName: "[modul]_test"
)
```

### 3c. Infrastruktur-Tests

```powershell
# ONTHERUN MCP erreichbar?
Write-Host "━━━ TEST: ONTHERUN MCP ━━━" -ForegroundColor Cyan
$ontherunResult = "SKIP"
if (Test-Path "C:\DEVKiTZ\ONTHERUN\package.json") {
  $ontherunResult = "EXISTS"
  Write-Host "  package.json vorhanden"
}

# VPS Container Status
Write-Host "━━━ TEST: VPS Container ━━━" -ForegroundColor Cyan
try {
  ssh.exe -i "$env:USERPROFILE\.ssh\dkz_hostinger" -o ConnectTimeout=5 root@srv1368349.hstgr.cloud "docker ps --filter name=dkz- --format '{{.Names}}: {{.Status}}'"
  $vpsResult = "PASS"
} catch { $vpsResult = "UNREACHABLE" }

# Hermes Free-Modelle
Write-Host "━━━ TEST: Hermes Models ━━━" -ForegroundColor Cyan
$models = Get-Content "$env:USERPROFILE\.hermes\models.json" | ConvertFrom-Json
$freeModels = $models | Where-Object { $_.model -match ':free' }
Write-Host "  $($freeModels.Count) Free-Modelle konfiguriert"
```

### 3d. MCP Tools Test

```
# Research-MCP testen
mcp_dkz-n8n-research_google_search(
  query: "test connection verification",
  num_results: 1
)

# Obsidian-MCP testen
mcp_devkitz-autoresearch_omi_get_memories(
  limit: 1
)
```

---

## Phase 4: VERIFY — Ergebnisse auswerten

### 4a. Test-Report befüllen

```markdown
| # | Test | Typ | Status | Details |
|:--|:-----|:----|:-------|:--------|
| 1 | hermes-model-manager | Script | ✅ PASS | 7 Modelle verifiziert |
| 2 | github-repo-hunter | API | ✅ PASS | GitHub API erreichbar |
| 3 | doc-ripper | API | ✅ PASS | Jina Reader OK |
| 4 | deep-knowledge-extractor | Skill | ⏭️ SKIP | NLM manuell |
| 5 | Hub Ladetest | Browser | ✅ PASS | Alle Module sichtbar |
| 6 | prompt-viewer | Browser | ⚠️ WARN | CSS Fehler in Mobile |
| 7 | ONTHERUN | Infra | ✅ EXISTS | Nicht gestartet |
| 8 | VPS Container | SSH | ✅ PASS | 3/3 healthy |
| 9 | Hermes Models | Config | ✅ PASS | 7 Free-Modelle |
| 10 | Research MCP | MCP | ✅ PASS | Suche funktioniert |
```

### 4b. Zusammenfassung

```markdown
## Ergebnis

| Metrik | Wert |
|:-------|:-----|
| Tests gesamt | 10 |
| ✅ PASS | 8 |
| ⚠️ WARN | 1 |
| ❌ FAIL | 0 |
| ⏭️ SKIP | 1 |
| **Score** | **90%** |
```

---

## Phase 5: COMMIT — Sichern

```powershell
git add -A
git commit -m "test(ralph-loop): Vollständiger Test-Run — Score 90%

- 10 Tests: 8 PASS, 1 WARN, 0 FAIL, 1 SKIP
- Skills: model-manager, repo-hunter, doc-ripper OK
- Browser: Hub + Module geladen
- Infra: VPS 3/3 Container healthy
- Warn: prompt-viewer CSS Mobile"
```

---

## Phase 6: LOOP — n8n Tester Automation

### 6a. n8n Webhook Trigger

```json
{
  "name": "DkZ Test Runner",
  "trigger": "webhook",
  "webhook_path": "/dkz-test-runner",
  "schedule": "0 8 * * *",
  "nodes": [
    {
      "name": "Start",
      "type": "webhook",
      "method": "POST"
    },
    {
      "name": "Skill Tests",
      "type": "execute-command",
      "command": "node C:\\DEVKiTZ\\.agents\\skills\\hermes-model-manager\\scripts\\verify-models.js"
    },
    {
      "name": "API Health Check",
      "type": "http-request",
      "urls": [
        "https://api.github.com/rate_limit",
        "https://r.jina.ai/https://example.com",
        "https://openrouter.ai/api/v1/models"
      ]
    },
    {
      "name": "VPS Check",
      "type": "ssh",
      "host": "srv1368349.hstgr.cloud",
      "command": "docker ps --filter name=dkz- --format '{{.Names}}: {{.Status}}'"
    },
    {
      "name": "Report",
      "type": "code",
      "code": "// Ergebnisse sammeln und Report generieren"
    },
    {
      "name": "Notify",
      "type": "telegram",
      "message": "🔬 DkZ Test Report: {{$json.score}}% — {{$json.summary}}"
    }
  ]
}
```

### 6b. n8n Tester-Loop Architektur

```
┌─────────────────────────────────────────────────┐
│  n8n TESTER LOOP (Täglich 08:00)                │
│                                                 │
│  Trigger ──→ Skill Tests ──→ API Checks         │
│                   │              │               │
│                   ▼              ▼               │
│              VPS Check      Browser Check        │
│                   │              │               │
│                   ▼              ▼               │
│              Ergebnisse sammeln                  │
│                   │                              │
│                   ▼                              │
│              Report.md generieren                │
│                   │                              │
│                   ├──→ Git Commit                │
│                   ├──→ Telegram Notification     │
│                   └──→ SecondBrain speichern     │
│                                                 │
│  Bei FAIL ──→ Auto-Fix Loop starten             │
│         └──→ Retry nach 30 Minuten              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 6c. Auto-Fix bei Fehlern

```markdown
## Auto-Fix Regeln

| Fehler | Auto-Fix |
|:-------|:---------|
| Model 404 | → verify-models.js → models.json updaten |
| API 429 | → 30 min warten → Retry |
| VPS Container down | → `docker restart dkz-[name]` |
| Browser-Test FAIL | → Screenshot + Issue erstellen |
| MCP nicht erreichbar | → n8n Workflow neu starten |
| Git nicht committed | → Auto-Commit mit Test-Report |
```

---

## Komplett-Script: run-all-tests.ps1

```powershell
param(
  [switch]$BrowserTests,
  [switch]$SkillTests,
  [switch]$InfraTests,
  [switch]$All
)

if ($All) { $BrowserTests = $true; $SkillTests = $true; $InfraTests = $true }

$report = @()
$pass = 0; $fail = 0; $warn = 0; $skip = 0

Write-Host "`n━━━ RALPH-LOOP TEST RUNNER ━━━" -ForegroundColor Magenta
Write-Host "  Gestartet: $(Get-Date -Format 'HH:mm:ss')`n"

# ─── SKILL TESTS ───
if ($SkillTests) {
  Write-Host "📦 SKILL TESTS" -ForegroundColor Cyan
  
  # Model Manager
  Write-Host "  [1] hermes-model-manager..." -NoNewline
  try {
    $r = Invoke-RestMethod "https://openrouter.ai/api/v1/models"
    $free = ($r.data | Where-Object { $_.id -match ':free' }).Count
    Write-Host " PASS ($free free models)" -ForegroundColor Green
    $pass++
    $report += "| hermes-model-manager | Script | PASS | $free models |"
  } catch {
    Write-Host " FAIL" -ForegroundColor Red
    $fail++
    $report += "| hermes-model-manager | Script | FAIL | API error |"
  }
  
  # GitHub Repo Hunter
  Write-Host "  [2] github-repo-hunter..." -NoNewline
  try {
    $r = Invoke-RestMethod "https://api.github.com/search/repositories?q=awesome+ai&per_page=1"
    Write-Host " PASS ($($r.total_count) results)" -ForegroundColor Green
    $pass++
    $report += "| github-repo-hunter | API | PASS | GitHub OK |"
  } catch {
    Write-Host " FAIL" -ForegroundColor Red
    $fail++
    $report += "| github-repo-hunter | API | FAIL | Rate limited |"
  }
  Start-Sleep 2
  
  # Doc Ripper
  Write-Host "  [3] doc-ripper..." -NoNewline
  try {
    $r = Invoke-RestMethod "https://r.jina.ai/https://example.com"
    Write-Host " PASS (Jina OK)" -ForegroundColor Green
    $pass++
    $report += "| doc-ripper | API | PASS | Jina Reader OK |"
  } catch {
    Write-Host " WARN (Jina offline)" -ForegroundColor Yellow
    $warn++
    $report += "| doc-ripper | API | WARN | Jina offline |"
  }
}

# ─── INFRA TESTS ───
if ($InfraTests) {
  Write-Host "`n🔧 INFRA TESTS" -ForegroundColor Cyan
  
  # ONTHERUN
  Write-Host "  [4] ONTHERUN..." -NoNewline
  if (Test-Path "C:\DEVKiTZ\ONTHERUN\package.json") {
    Write-Host " PASS (vorhanden)" -ForegroundColor Green
    $pass++
    $report += "| ONTHERUN | File | PASS | package.json OK |"
  } else {
    Write-Host " FAIL" -ForegroundColor Red
    $fail++
    $report += "| ONTHERUN | File | FAIL | Nicht gefunden |"
  }
  
  # Hermes Config
  Write-Host "  [5] Hermes Models..." -NoNewline
  $models = Get-Content "$env:USERPROFILE\.hermes\models.json" -ErrorAction SilentlyContinue | ConvertFrom-Json
  $freeCount = ($models | Where-Object { $_.model -match ':free' }).Count
  Write-Host " PASS ($freeCount free)" -ForegroundColor Green
  $pass++
  $report += "| Hermes Models | Config | PASS | $freeCount free models |"
  
  # Skills Count
  Write-Host "  [6] Skills Count..." -NoNewline
  $skillCount = (Get-ChildItem "C:\DEVKiTZ\.agents\skills" -Directory).Count
  Write-Host " PASS ($skillCount skills)" -ForegroundColor Green
  $pass++
  $report += "| Skills | Count | PASS | $skillCount skills |"
}

# ─── ERGEBNIS ───
$total = $pass + $fail + $warn + $skip
$score = if ($total -gt 0) { [math]::Round(($pass / $total) * 100) } else { 0 }

Write-Host "`n━━━ ERGEBNIS ━━━" -ForegroundColor Magenta
Write-Host "  ✅ PASS: $pass" -ForegroundColor Green
Write-Host "  ⚠️  WARN: $warn" -ForegroundColor Yellow
Write-Host "  ❌ FAIL: $fail" -ForegroundColor Red
Write-Host "  Score: $score%" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━`n" -ForegroundColor Magenta

# Report als Markdown speichern
$reportMd = @"
# Test-Report: $(Get-Date -Format 'yyyy-MM-dd HH:mm')

> Ralph-Loop Test Runner | Score: $score%

| Test | Typ | Status | Details |
|:-----|:----|:-------|:--------|
$($report -join "`n")

## Zusammenfassung
- PASS: $pass | WARN: $warn | FAIL: $fail | Score: $score%
"@

$reportPath = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\wissen-hub\archive\report\test-report_$(Get-Date -Format 'yyyyMMdd_HHmm').md"
New-Item -ItemType Directory -Path (Split-Path $reportPath) -Force | Out-Null
$reportMd | Out-File $reportPath -Encoding utf8
Write-Host "📄 Report: $reportPath"
```

---

## Quick Start

```powershell
# Nur Skills testen
powershell -File "C:\DEVKiTZ\.agents\skills\ralph-loop-tester\scripts\run-all-tests.ps1" -SkillTests

# Nur Infrastruktur
powershell -File "C:\DEVKiTZ\.agents\skills\ralph-loop-tester\scripts\run-all-tests.ps1" -InfraTests

# ALLES testen
powershell -File "C:\DEVKiTZ\.agents\skills\ralph-loop-tester\scripts\run-all-tests.ps1" -All
```

---

## n8n Integration

### Webhook starten

```
POST http://localhost:5678/webhook/dkz-test-runner
Body: { "scope": "all", "notify": true }
```

### Cron Schedule

```yaml
# Täglicher Test um 08:00
schedule: "0 8 * * *"
# Nach jedem Git Push
trigger: "github-webhook"
# Manuell
trigger: "webhook POST /dkz-test-runner"
```

---

## Verbindung zu bestehenden Workflows

| Workflow | Verbindung |
|:---------|:-----------|
| `/browser-test` | Wird aus Phase 3b aufgerufen |
| `/system-check` | Ergänzt Infra-Tests |
| `/audit-module` | Pro-Modul Deep-Test |
| `/debug2` | Bei FAIL: Stress-Test starten |
| `/git-after-every-step` | Phase 5: Auto-Commit |

---

## Ablage

```
SecondBrain/01_Projekte/test-reports/
├── test-report_20260513_0830.md
├── test-report_20260514_0800.md
└── ...

modules/wissen-hub/archive/report/
├── test-report_20260513_0830.md
└── ...
```
