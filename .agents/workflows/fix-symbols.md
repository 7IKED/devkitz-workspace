---
description: Korrupte Symbole/Emojis in HTML-Dateien reparieren (Encoding-Fix)
---

# Symbol Fix Skill

Wenn Emojis in HTML-Dateien als `??` oder `???` angezeigt werden, liegt ein Encoding-Problem vor (UTF-8 Codepoints wurden zu `?` konvertiert).

## Diagnose

1. **Betroffene Dateien finden:**
```powershell
// turbo
Get-ChildItem "c:\DEVKiTZ\01_PROJECTS\01_dashboard\modules" -Recurse -Filter "*.html" | Where-Object { (Get-Content $_.FullName -Raw) -match '\?\?' } | ForEach-Object { $c = Get-Content $_.FullName -Raw; Write-Host "$($_.Directory.Name)/$($_.Name) ($([regex]::Matches($c,'\?\?').Count))" }
```

2. **Datenbanken pruefen (JSON Validierung):**
```powershell
// turbo
Get-ChildItem "c:\DEVKiTZ\01_PROJECTS\01_dashboard" -Filter "*.json" -ErrorAction SilentlyContinue | ForEach-Object { try { $null = (Get-Content $_.FullName -Raw) | ConvertFrom-Json; Write-Host "OK: $($_.Name)" } catch { Write-Host "BROKEN: $($_.Name) - $_" } }
```

## Reparatur

// turbo-all

3. **Shared Script `dkz-symbol-fix.js` laden** — Dieses Script ersetzt automatisch alle `??` in DOM-Elementen beim Laden:
```powershell
# Pruefen ob vorhanden
Test-Path "c:\DEVKiTZ\01_PROJECTS\01_dashboard\shared\dkz-symbol-fix.js"
```

4. **Deep Fix Script ausfuehren** fuer eingebettete JS-Strings und nicht-DOM-Inhalte:
```powershell
powershell -ExecutionPolicy Bypass -File "C:\tmp\fix-symbols.ps1"
```

5. **Git Commit:**
```powershell
cd c:\DEVKiTZ\01_PROJECTS\01_dashboard; git add -A; git commit -m "fix(encoding): restore corrupted emoji symbols"
```

## Symbol-Mapping (HTML Entities)

| Kontext | Korrupt | Ersetzung | Entity |
|---------|---------|-----------|--------|
| Action/Gear | ?? | ⚙ | `&#9881;` |
| Lightning | ?? | ⚡ | `&#9889;` |
| Brain/AI | ?? | 🧠 | `&#129504;` |
| Globe/Web | ?? | 🌐 | `&#127760;` |
| Folder | ?? | 📂 | `&#128194;` |
| Document | ?? | 📄 | `&#128196;` |
| Search | ?? | 🔍 | `&#128269;` |
| Trash | ??? | 🗑 | `&#128465;` |
| Laptop | ?? | 💻 | `&#128187;` |
| Save | ?? | 💾 | `&#128190;` |
| Info | ?? | ℹ | `&#8505;` |
| Lock | ?? | 🔒 | `&#128274;` |
| Key | ??? | 🔑 | `&#128273;` |
| Label/Tag | ??? | 🏷 | `&#127991;` |
| Rocket | ?? | 🚀 | `&#128640;` |
| Bug | ?? | 🐛 | `&#128027;` |
| Chart | ?? | 📊 | `&#128202;` |
| Clipboard | ?? | 📋 | `&#128203;` |
| Edit/Pen | ?? | 📝 | `&#128221;` |
| Book | ?? | 📖 | `&#128214;` |
| Link | ?? | 🔗 | `&#128279;` |
| Bell | ?? | 🔔 | `&#128276;` |
| Mail | ?? | 📧 | `&#128231;` |
| Arrow Down | ?? | ⬇ | `&#11015;` |
| Wrench | ?? | 🔧 | `&#128295;` |
| Package | ?? | 📦 | `&#128230;` |
| Green Dot | ?? | 🟢 | `&#128994;` |
| Red Dot | ?? | 🔴 | `&#128308;` |
| Question | ? | ❓ | `&#10067;` |
| Plus | ?? | ➕ | `&#10133;` |
| Art/Palette | ?? | 🎨 | `&#127912;` |
| Satellite | ?? | 📡 | `&#128225;` |
| Refresh | ?? | 🔄 | `&#128260;` |

## Praeventiv

Um zukuenftige Encoding-Probleme zu vermeiden:
- Dateien immer als **UTF-8 mit BOM** speichern
- Bei PowerShell-Operationen `[System.Text.Encoding]::UTF8` nutzen
- Emojis als **HTML Entities** statt Unicode-Zeichen schreiben (z.B. `&#9881;` statt ⚙)
