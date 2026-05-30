---
description: Create weekly status report and post as Issue
---

# Wochen-Report Generator

Erstelle einen automatischen Wochen-Report fuer DEVKiTZ.

## Daten sammeln

### 1. Git Activity
```bash
git log --since="7 days ago" --oneline | wc -l  # Commit-Anzahl
git log --since="7 days ago" --oneline --grep="fix"  # Fixes
git log --since="7 days ago" --oneline --grep="feat"  # Features
```

### 2. Issue Status
```bash
gh issue list --repo D-VKITZ/KERN --state open --json number --jq length  # Offen
gh issue list --repo D-VKITZ/KERN --state closed --json number --jq length  # Geschlossen
```

### 3. Module Status
- features.json auslesen
- Neue Module zaehlen
- Module ohne README zaehlen

### 4. CI Status
- Letzte 10 Workflow Runs pruefen
- Success/Failure Rate berechnen

## Report Format

Erstelle ein Issue in D-VKITZ/KERN mit:
- Titel: `[REPORT] KW{XX} — {Commits} Commits, {Issues} Issues`
- Labels: `📊 retro`, `📱 handy`
- Assignee: @7IKED
- Body: Tabelle mit allen Metriken

## @7IKED Mention

Schreibe am Ende: "@7IKED Wochen-Report ist da. Bitte reviewen."
