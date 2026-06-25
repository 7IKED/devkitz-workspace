---
name: second-brain-sync
description: Synchronisiert den Obsidian SecondBrain Vault mit Google Drive und erstellt ein Backup via second-brain-backup.js.
---

# SecondBrain Sync

> Obsidian Vault ↔ Drive Backup + Git Push

## Quellen
- Lokal: `C:\Users\BAZE²\Documents\SecondBrain\`
- Remote: `7IKED/dkz-second-brain`
- Drive Backup: via `google-drive-automation/second-brain-backup.js`

## Ablauf

### Schritt 1: Git Status pruefen
```powershell
cd "$env:USERPROFILE\Documents\SecondBrain"
git status
git log -5 --oneline
```

### Schritt 2: Pull (falls Remote neuer)
```powershell
git pull origin main
```

### Schritt 3: Lokale Aenderungen committen
```powershell
git add -A
git commit -m "sync(brain): auto-sync $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin main
```

### Schritt 4: Drive Backup
```powershell
cd C:\DEVKiTZ\google-drive-automation
node second-brain-backup.js
```

## Output
- SecondBrain Git-synchronisiert
- Drive-Backup erstellt
