---
name: issue-factory
description: Erstellt GitHub Issues aus Audit-Ergebnissen, Implementierungsplaenen und TODO-Listen via gh CLI.
---

# Issue Factory

> Wandelt strukturierte Findings in GitHub Issues um

## Voraussetzungen
- `gh` CLI authentifiziert
- Ziel-Repo: `7IKED/devkitz-workspace`

## Ablauf

### Schritt 1: Findings sammeln
Lies die Quelle (Audit-Report, Implementierungsplan, task.md):
- `C:\Users\BAZE²\Documents\DEVKiTZ_Plaene\07_audit_report.md`
- Aktuelle `task.md` Artefakte
- Beliebige Markdown-Datei mit `- [ ]` Eintraegen

### Schritt 2: Issues generieren
Pro Finding ein Issue:
```powershell
gh issue create --repo 7IKED/devkitz-workspace `
  --title "<prefix>: <Beschreibung>" `
  --body "<Details + Quelle + Datum>" `
  --label "<label1>,<label2>"
```

Prefixe:
- `fix:` fuer Bugs
- `feat:` fuer Features
- `docs:` fuer Dokumentation
- `security:` fuer Sicherheit
- `chore:` fuer Wartung

### Schritt 3: Report
Liste alle erstellten Issues mit Nummern.

## Labels (Standard)
`audit`, `module`, `registry`, `config`, `security`, `docs`, `bug`, `copilot`

## Output
- GitHub Issues erstellt
- Report mit Issue-Nummern
