---
description: DkZ Modul auf Fehler prüfen — Automatisierung, Ausführung, Design
---

# Modul Audit & Fix Workflow

## Übersicht
Jedes DkZ Dashboard Modul durchläuft diesen Workflow um Qualität, UX und Standards sicherzustellen.

## Phase 1: Analyse
// turbo
1. Modul-Dateien scannen (index.html, features.json)
```powershell
$f = "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\MODULE_NAME\index.html"
$c = [System.IO.File]::ReadAllBytes($f)
$content = [System.Text.Encoding]::GetEncoding(1252).GetString($c)
# Prüfe Standards
$checks = @{
    "Shared Scripts" = $content -match 'dkz-debug\.js'
    "v2 Design"      = $content -match 'DkZ v2 BG Blobs|blob|blur\(1[2-9]0'
    "Hub Button"     = $content -match 'hub/index\.html|Hub'
    "Info Popup"     = $content -match 'showModuleInfo|info-modal'
    "Onboarding"     = $content -match 'onboarding'
    "Toast"          = $content -match 'toast'
}
$checks.GetEnumerator() | ForEach-Object { Write-Host "$($_.Key): $(if($_.Value){'✅'}else{'❌'})" }
```

## Phase 2: Fix — Info Popup + Onboarding einfügen
// turbo
2. Info Popup + Onboarding HTML vor `</body>` einfügen
3. Info Button im Header platzieren:
   - Module mit `header-actions` Klasse → Button als erstes Kind einfügen
   - Module mit `class="logo"` → Button nach Logo einfügen  
   - Module mit anderem Layout → Runtime-Injection via `<script>` mit `setTimeout(500)`

## Phase 3: Browser Test (Agent)
// turbo
4. Modul im Browser öffnen mit `browser_subagent`
5. Prüfen:
   - [ ] Seite lädt ohne JS-Fehler
   - [ ] Onboarding-Overlay erscheint beim ersten Besuch
   - [ ] "Los geht's!" Button schließt Overlay
   - [ ] ℹ️ Info-Button sichtbar im Header
   - [ ] Info-Popup öffnet sich beim Klick
   - [ ] ← Hub Button vorhanden
   - [ ] Toast-Benachrichtigungen funktionieren
   - [ ] Navigation zu verwandten Modulen möglich

## Phase 4: Userflow verbessern
6. Fehlende UX-Elemente ergänzen:
   - [ ] Next-Step Hinweise (Blinken, Tooltip)
   - [ ] Shortcut-Links zu verwandten Modulen
   - [ ] Leere Zustände mit hilfreichen Texten
   - [ ] Feedback bei Aktionen (Toasts)

## Phase 5: Git Commit
// turbo
7. Änderungen committen:
```powershell
git add 01_PROJECTS/01_dashboard/modules/MODULE_NAME/
git commit -m "feat(MODULE_NAME): add Info popup, onboarding tour, UX improvements"
```

## Encoding-Hinweise
- **UTF-8 Module** (die meisten): `[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)`
- **Windows-1252 Module** (analyser, converter, etc.): 
  ```powershell
  $bytes = [System.IO.File]::ReadAllBytes($f)
  $c = [System.Text.Encoding]::GetEncoding(1252).GetString($bytes)
  # ... modify $c ...
  $outBytes = [System.Text.Encoding]::GetEncoding(1252).GetBytes($c)
  [System.IO.File]::WriteAllBytes($f, $outBytes)
  ```
- **Keine Emojis in PowerShell-Strings** → HTML Entities verwenden (`&#9432;` statt ℹ️)

## Batch-Modus
Für viele Module gleichzeitig: PowerShell-Loop mit `[System.IO.File]` für encoding-sicheres Lesen/Schreiben.
Danach Stichproben-Browser-Test mit `browser_subagent`.
