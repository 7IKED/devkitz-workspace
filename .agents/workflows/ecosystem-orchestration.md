---
description: DEVKiTZ Ökosystem-Orchestrierung — Alle Systeme synchron halten und automatisch aufbauen
---

# Ökosystem-Orchestrierung Workflow

> **Wann:** Nach großen Updates, neuen Modulen, Blog-Kampagnen, System-Erweiterungen
> **Ziel:** Alle DEVKiTZ Systeme synchron, konsistent und automatisch aufgebaut
> **Regeln:** R0, R2, R5, R13, R15, R17, R18, R26, R27, R30

---

## Phase 1: SYSTEM-STATUS ERFASSEN

// turbo
1. Ökosystem-Inventur:
```powershell
$root = "C:\DEVKiTZ"

# Dashboard Module zählen
$modules = (Get-ChildItem "$root\01_PROJECTS\01_dashboard\modules" -Directory | Measure-Object).Count
Write-Output "Dashboard Module: $modules"

# Shared Scripts zählen
$shared = (Get-ChildItem "$root\01_PROJECTS\01_dashboard\shared" -File | Measure-Object).Count
Write-Output "Shared Scripts: $shared"

# Workflows zählen
$workflows = (Get-ChildItem "$root\.agents\workflows" -File | Measure-Object).Count
Write-Output "Workflows: $workflows"

# Skills zählen
$skills = (Get-ChildItem "$root\.agents\skills" -Directory | Measure-Object).Count
Write-Output "Skills: $skills"

# Chrome Extensions zählen
$ext = (Get-ChildItem "$root\01_PROJECTS\chrome-extensions" -Directory | Measure-Object).Count
Write-Output "Chrome Extensions: $ext"

# REGISTRY.json Modulzahl
$reg = Get-Content "$root\01_PROJECTS\01_dashboard\REGISTRY.json" -Raw | ConvertFrom-Json
Write-Output "REGISTRY totalModules: $($reg.totalModules)"

# Git Status
cd $root
$uncommitted = (git status --short | Measure-Object).Count
Write-Output "Uncommitted Changes: $uncommitted"
```

## Phase 2: REGISTRY SYNC

// turbo
2. REGISTRY.json mit tatsächlichen Modulen abgleichen:
```powershell
$root = "C:\DEVKiTZ\01_PROJECTS\01_dashboard"
$actual = Get-ChildItem "$root\modules" -Directory | Select -ExpandProperty Name
$reg = Get-Content "$root\REGISTRY.json" -Raw | ConvertFrom-Json
$registered = $reg.modules | ForEach-Object { $_.folder -replace 'modules/', '' }

# Fehlende Module finden
$missing = $actual | Where-Object { $_ -notin $registered }
if ($missing.Count -gt 0) {
    Write-Output "NICHT REGISTRIERT:"
    $missing | ForEach-Object { Write-Output "  ❌ $_" }
} else {
    Write-Output "✅ Alle Module registriert"
}
```

## Phase 3: SHARED SCRIPTS AUDIT

// turbo
3. Shared Scripts Integration prüfen:
```powershell
$requiredInHead = @("dkz-theme.css")
$requiredInBody = @("dkz-debug.js", "dkz-guide.js", "dkz-crosslinks.js")
$fails = @()
Get-ChildItem "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules" -Directory | ForEach-Object {
    $f = Join-Path $_.FullName "index.html"
    if (Test-Path $f) {
        $c = Get-Content $f -Raw
        $requiredInBody | ForEach-Object {
            if ($c -notmatch [regex]::Escape($_)) {
                $fails += "$($_.Name): fehlt $_"
            }
        }
    }
}
if ($fails.Count -eq 0) { Write-Output "✅ Shared Scripts OK" }
else { $fails | ForEach-Object { Write-Output "  ❌ $_" } }
```

## Phase 4: BLOG ÖKOSYSTEM SYNC

4. Blog-Status prüfen:
   - Alle Blogs mit V2.1 Template?
   - Jeder Blog hat mindestens 1 Post?
   - Panel-Farben korrekt zugewiesen?

```powershell
# Blog-Liste aus design_blog.md
$blogDesign = "C:\DEVKiTZ\04_SYSTEM\docs\design_blog.md"
if (Test-Path $blogDesign) {
    $lines = Get-Content $blogDesign | Where-Object { $_ -match '^\| \*\*' }
    Write-Output "Blogs dokumentiert: $($lines.Count)"
} else {
    Write-Output "❌ design_blog.md fehlt!"
}
```

## Phase 5: DREIFACH-VERANKERUNG (R27/R30)

// turbo
5. WissenHub + Research Archive Integrität:
```powershell
# WissenHub
$wissenCatalog = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\wissen-hub\archive\catalog.json"
$wissenCount = 0
if (Test-Path $wissenCatalog) {
    $cat = Get-Content $wissenCatalog -Raw | ConvertFrom-Json
    $wissenCount = $cat.entries.Count
}
Write-Output "WissenHub: $wissenCount Einträge"

# Research Archive
$researchIndex = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\research-archive\master-index.json"
$researchCount = 0
if (Test-Path $researchIndex) {
    $idx = Get-Content $researchIndex -Raw | ConvertFrom-Json
    $researchCount = $idx.entries.Count
}
Write-Output "Research Archive: $researchCount Einträge"

# Differenz prüfen
$diff = [Math]::Abs($wissenCount - $researchCount)
if ($diff -gt 5) {
    Write-Output "⚠️ SYNC-DIFFERENZ: $diff — R30 verletzt!"
} else {
    Write-Output "✅ Archive sync (Differenz: $diff)"
}
```

## Phase 6: DOKUMENTATION AUF STAND

// turbo
6. Gedächtnis-Dateien Freshness:
```powershell
@("CLAUDE.md", "GEMINI.md", "REGELWERK.md") | ForEach-Object {
    $f = "C:\DEVKiTZ\$_"
    if (Test-Path $f) {
        $age = ((Get-Date) - (Get-Item $f).LastWriteTime).Days
        $status = if ($age -le 7) { "✅ aktuell" } elseif ($age -le 30) { "🟡 $age Tage alt" } else { "🔴 $age Tage alt!" }
        Write-Output "$_`: $status"
    }
}
```

## Phase 7: CROSSLINKS VALIDIEREN

// turbo
7. Modul-Crosslinks prüfen:
```powershell
$modules = Get-ChildItem "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules" -Directory | Select -ExpandProperty Name
$crosslinksFile = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\shared\dkz-crosslinks.js"
if (Test-Path $crosslinksFile) {
    $cls = Get-Content $crosslinksFile -Raw
    $pattern = "'([a-z0-9_-]+)':\s*\{"
    $linked = [regex]::Matches($cls, $pattern) | ForEach-Object { $_.Groups[1].Value }
    $unlinked = $modules | Where-Object { $_ -notin $linked }
    if ($unlinked.Count -gt 0) {
        Write-Output "Module OHNE Crosslinks:"
        $unlinked | ForEach-Object { Write-Output "  ⚠️ $_" }
    } else {
        Write-Output "✅ Alle Module haben Crosslinks"
    }
}
```

## Phase 8: AUTOMATISCHER AUFBAU (Auto-Setup)

8. Bei neuen Systemen/Modulen automatisch:
   - [ ] `features.json` generieren (MOD-ID + FT-IDs)
   - [ ] In `REGISTRY.json` eintragen (totalModules++)
   - [ ] In `BLAUPAUSE.md` Ordnerbaum ergänzen
   - [ ] In `dkz-crosslinks.js` Verlinkung hinzufügen
   - [ ] `ORDNER.ini` im Zielordner erstellen
   - [ ] README.md erstellen
   - [ ] Git Commit

## Phase 9: STATUS-REPORT

9. Report generieren:
```markdown
# Ökosystem-Check — [DATUM]

| System | Status | Details |
|:-------|:-------|:--------|
| Dashboard Module | ✅/❌ | XX Module, XX registriert |
| Shared Scripts | ✅/❌ | XX Scripts in XX Modulen |
| Blog Ökosystem | ✅/❌ | XX Blogs mit V2.1 |
| WissenHub | ✅/❌ | XX Einträge |
| Research Archive | ✅/❌ | XX Einträge |
| Archive Sync | ✅/❌ | Differenz: XX |
| Crosslinks | ✅/❌ | XX/XX Module verlinkt |
| Gedächtnis | ✅/❌ | CLAUDE/GEMINI/REGELWERK |
| Git Status | ✅/❌ | XX uncommitted |
| Workflows | ✅/❌ | XX definiert |
```

// turbo
10. Report als Artefakt speichern und committen:
```powershell
cd C:\DEVKiTZ
git add -A ; git commit -m "chore: ecosystem orchestration check"
```

## Automatische Pflege-Checkliste

| Was | Frequenz | Workflow |
|:----|:---------|:---------|
| REGISTRY.json sync | Bei jedem Modul | `/create-module` |
| Shared Scripts audit | Wöchentlich | `/system-check` |
| Archive sync (R30) | Jede Session | `/archive-maintain` |
| Blog Template deploy | Bei Änderung | `/blog-deploy` |
| Crosslinks update | Bei neuem Modul | `/create-module` |
| Gedächtnis-Dateien | Jede Session | `/startup` |
| Git commit | Nach JEDER Änderung | `/git-after-every-step` |
| System-Report | Wöchentlich | Dieser Workflow |
