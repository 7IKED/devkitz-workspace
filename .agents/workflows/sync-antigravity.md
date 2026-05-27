---
description: Antigravity Skills + Workflows Referenz automatisch synchronisieren und SKILLS_REFERENCE.md neu generieren
---

# Sync Antigravity — Skills & Workflows Referenz aktualisieren

> Scannt alle Skills und Workflows und generiert `SKILLS_REFERENCE.md` neu

## Wann ausführen?
- Neuer Skill hinzugefügt
- Neuer Workflow erstellt
- Skill-Beschreibung geändert
- Workflow-Beschreibung geändert
- Neue Knowledge-Datei in `.gemini/antigravity/` angelegt

## Schritte

// turbo-all

1. Sync-Script ausführen:
```powershell
powershell -ExecutionPolicy Bypass -File "C:\DEVKiTZ\.agents\scripts\sync-antigravity.ps1"
```

2. Prüfen ob Output korrekt:
```powershell
Select-String -Pattern "Skills" -Path "C:\DEVKiTZ\.gemini\antigravity\SKILLS_REFERENCE.md" | Select-Object -First 3
```

3. Git Commit:
```powershell
cd C:\DEVKiTZ
git add .gemini/antigravity/SKILLS_REFERENCE.md
git commit -m "chore(antigravity): sync skills reference"
```

## Was das Script macht

1. Scannt `.agents/skills/` → liest SKILL.md Frontmatter (description)
2. Scannt `.agents/workflows/` → liest Workflow .md Frontmatter (description)
3. Zählt Knowledge-Dateien in `.gemini/antigravity/`
4. Regeneriert `SKILLS_REFERENCE.md` mit aktuellen Counts + Timestamp

## DryRun Modus

```powershell
powershell -ExecutionPolicy Bypass -File "C:\DEVKiTZ\.agents\scripts\sync-antigravity.ps1" -DryRun
```

Zeigt den Output an ohne die Datei zu überschreiben.
