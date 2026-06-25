---
description: Synchronisiert den Obsidian SecondBrain Vault mit Git und erstellt ein Drive-Backup.
---

# /bind-brain — SecondBrain anbinden

> **Wann:** Nach Notizen-Aenderungen oder taeglicher Sync
> **Ziel:** SecondBrain Git-synchronisiert + Drive-Backup
> **Regeln:** R1 (nicht loeschen), R3 (DEEPKEEP nur kopieren)

---

## Phase 1: Git Status

// turbo
```powershell
cd "$env:USERPROFILE\Documents\SecondBrain"
git status --short
git log -3 --oneline
```

## Phase 2: Commit + Push

```powershell
git add -A
$msg = "sync(brain): $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git commit -m $msg
git push origin main
```

## Phase 3: Drive Backup

```powershell
cd C:\DEVKiTZ\google-drive-automation
node second-brain-backup.js
```

## Checkliste (ALLES muss ✅ sein)
- [ ] Git Status clean
- [ ] Push erfolgreich
- [ ] Drive Backup erstellt
