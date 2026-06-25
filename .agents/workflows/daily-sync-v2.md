---
description: Taeglicher Sync aller externen Systeme (Git + Drive + Docs + Brain) als Routine.
---

# /daily-sync — Taeglicher Sync

> **Wann:** Einmal taeglich oder bei Session-Start
> **Ziel:** Alle Systeme auf dem neuesten Stand
> **Regeln:** R1, R8

---

## Ablauf

### 1. Git Pull (Hauptrepo)
// turbo
```powershell
cd C:\DEVKiTZ
git pull origin main
```

### 2. GitHub Repos pruefen
```powershell
gh repo list 7IKED --limit 25 --json name,pushedAt | ConvertFrom-Json | Sort-Object pushedAt -Desc | Select-Object -First 5 | Format-Table
```

### 3. Drive-Sync (Dry-Run)
```powershell
cd C:\DEVKiTZ\google-drive-automation
node drive-sync.js --dry-run
```

### 4. SecondBrain Status
```powershell
cd "$env:USERPROFILE\Documents\SecondBrain"
git status --short
```

### 5. Documents Index aktualisieren
```powershell
$count = (Get-ChildItem "$env:USERPROFILE\Documents" -Recurse -File -EA 0).Count
Write-Host "Documents: $count Dateien"
```

## Checkliste
- [ ] Git pull clean
- [ ] Repos aktuell
- [ ] Drive-Sync Dry-Run sauber
- [ ] SecondBrain clean
- [ ] Documents-Count geprueft
