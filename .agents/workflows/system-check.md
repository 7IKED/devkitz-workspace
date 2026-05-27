---
description: DkZ Vollständiger System-Check — Automatisierte Prüfung aller Module, Links und Shared Scripts
---

# DkZ System-Check Workflow

> **Wann:** Nach jedem größeren Update, nach Phase-Abschlüssen, vor Releases
> **Ziel:** Sicherstellen dass ALLE Module korrekt funktionieren
> **Ergebnis:** Status-Report als Markdown

---

## Phase 1: SHARED SCRIPTS AUDIT

// turbo
1. Prüfe ob alle 72 HTML-Dateien die Pflicht-Scripts haben:
```powershell
$dir = "c:\DEVKiTZ\01_PROJECTS\01_dashboard"
$requiredScripts = @("dkz-theme.css","dkz-debug.js","dkz-guide.js","dkz-copilot.js","dkz-shortcuts.js","dkz-export.js","dkz-crosslinks.js","dkz-a11y.js","dkz-test.js")
$fails = @()
Get-ChildItem "$dir\modules" -Directory | ForEach-Object {
    $f = Join-Path $_.FullName "index.html"
    if (Test-Path $f) {
        $c = Get-Content $f -Raw
        $requiredScripts | ForEach-Object { if ($c -notmatch [regex]::Escape($_)) { $fails += "$($_.Name): fehlt $_" } }
    }
}
if ($fails.Count -eq 0) { Write-Output "PASS: Alle Module haben alle Shared Scripts" }
else { $fails | ForEach-Object { Write-Output "FAIL: $_" } }
```

## Phase 2: CROSS-LINK VALIDATION

// turbo
2. Prüfe ob alle Hub-Links (`← Hub`) korrekt sind:
```powershell
Get-ChildItem "c:\DEVKiTZ\01_PROJECTS\01_dashboard\modules" -Directory | ForEach-Object {
    $f = Join-Path $_.FullName "index.html"
    if (Test-Path $f) {
        $c = Get-Content $f -Raw
        if ($c -notmatch '../../hub/index.html') { Write-Output "MISSING HUB LINK: $($_.Name)" }
    }
}
```

// turbo
3. Prüfe ob alle Cross-Links auf existierende Module zeigen:
```powershell
$modules = Get-ChildItem "c:\DEVKiTZ\01_PROJECTS\01_dashboard\modules" -Directory | Select -ExpandProperty Name
$crosslinks = Get-Content "c:\DEVKiTZ\01_PROJECTS\01_dashboard\shared\dkz-crosslinks.js" -Raw
$pattern = "'([a-z_-]+)':\s*\{"
[regex]::Matches($crosslinks, $pattern) | ForEach-Object {
    $mod = $_.Groups[1].Value
    if ($mod -notin $modules) { Write-Output "BROKEN CROSSLINK: $mod existiert nicht" }
}
```

## Phase 3: README FRESHNESS

// turbo
4. Prüfe ob alle Module ein README.md haben:
```powershell
$missing = @()
Get-ChildItem "c:\DEVKiTZ\01_PROJECTS\01_dashboard\modules" -Directory | ForEach-Object {
    if (!(Test-Path (Join-Path $_.FullName "README.md"))) { $missing += $_.Name }
}
if ($missing.Count -eq 0) { Write-Output "PASS: Alle Module haben README.md" }
else { Write-Output "MISSING READMEs: $($missing -join ', ')" }
```

## Phase 4: FEATURES.JSON AUDIT

// turbo
5. Prüfe ob alle features.json Dateien valides JSON sind:
```powershell
Get-ChildItem "c:\DEVKiTZ\01_PROJECTS\01_dashboard\modules" -Directory | ForEach-Object {
    $f = Join-Path $_.FullName "features.json"
    if (Test-Path $f) {
        try { Get-Content $f -Raw | ConvertFrom-Json | Out-Null }
        catch { Write-Output "INVALID JSON: $($_.Name)/features.json" }
    }
}
```

## Phase 5: GIT STATUS

// turbo
6. Prüfe ob es uncommittete Änderungen gibt:
```powershell
cd c:\DEVKiTZ
git status --short
```

## Phase 6: BUNDLE FRESHNESS

// turbo
7. Bundle neu bauen und Größe prüfen:
```powershell
node c:\DEVKiTZ\01_PROJECTS\01_dashboard\shared\build-bundle.js
```

## Phase 7: DOCS REGENERIEREN

// turbo
8. READMEs neu generieren:
```powershell
node c:\DEVKiTZ\01_PROJECTS\01_dashboard\shared\generate-docs.js
```

## Phase 8: ZUSAMMENFASSUNG

9. Erstelle einen Status-Report mit allen Ergebnissen als Markdown-Artifact.
   Format:
   ```markdown
   # System-Check Report — [DATUM]
   
   | Check | Status |
   |-------|--------|
   | Shared Scripts | ✅/❌ |
   | Hub Links | ✅/❌ |
   | Cross-Links | ✅/❌ |
   | READMEs | ✅/❌ |
   | features.json | ✅/❌ |
   | Git Clean | ✅/❌ |
   | Bundle | ✅ XX KB |
   ```

// turbo
10. `git add -A && git commit -m "chore: system-check workflow executed"` (R2)
