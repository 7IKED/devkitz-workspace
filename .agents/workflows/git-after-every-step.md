---
description: Git commit nach jedem Schritt — IMMER
---

# Git Workflow — Nach JEDER Änderung committen

## ⚠️ GOLDENE REGEL: NIE LÖSCHEN — IMMER ARCHIVIEREN
> **Informationen, Wissen, Dateien und Daten werden NIEMALS gelöscht.**
> Stattdessen werden sie nach `99_ARCHIVE/` oder einem `99_archived/` Unterordner verschoben.
> Diese Regel gilt IMMER, ohne Ausnahme.

## Was ist Git?
Git speichert Versionen deiner Dateien. Nach jeder Änderung machst du einen "Commit".
Das ist wie ein Speicherpunkt in einem Videospiel.

## Projekt-Root
```
c:\DEVKiTZ\
```

## Schritt 1: Prüfen ob Git existiert

```powershell
cd c:\DEVKiTZ\01_PROJECTS\01_dashboard
git status
```

Wenn du siehst: `fatal: not a git repository` → Zuerst Schritt 1a.
Wenn du eine Liste von Dateien siehst → Gehe zu Schritt 2.

### Schritt 1a: Git Repository erstellen (nur 1x nötig)
```powershell
cd c:\DEVKiTZ\01_PROJECTS\01_dashboard
git init
git add -A
git commit -m "init: DkZ Dashboard Basis"
```

HINWEIS: Auf Windows kann `git init` fehlschlagen wegen "Controlled Folder Access".
Lösung: Windows Security → Ransomware Protection → Controlled Folder Access → Ordner erlauben.

## Schritt 2: Alle Änderungen stagen
```powershell
cd c:\DEVKiTZ\01_PROJECTS\01_dashboard
git add -A
```

`git add -A` bedeutet: ALLE geänderten, neuen und gelöschten Dateien zum Commit vormerken.

## Schritt 3: Commit mit Nachricht
```powershell
git commit -m "PREFIX(BEREICH): WAS WURDE GEMACHT"
```

### Commit-Message Prefixe (IMMER einen benutzen)

| Prefix | Wann verwenden | Beispiel |
|--------|---------------|---------|
| `feat` | Neues Feature oder Modul | `feat(suno-ai): initial module v0.01` |
| `fix` | Bug behoben | `fix(gallery): missing GALLERY_ITEMS entries` |
| `chore` | Aufräumen, Umbenennen | `chore: update BLAUPAUSE.md module count` |
| `docs` | Dokumentation geändert | `docs: add HTML_INVENTAR.md` |
| `style` | CSS/Design geändert | `style(suno-ai): apply DkZ v2 CSS` |
| `refactor` | Code umgebaut ohne neue Features | `refactor(playbook): fix XSS in addMsg` |
| `init` | Erstmalige Erstellung | `init: DkZ Dashboard Basis` |

### Bereich (in Klammern)
Der Ordnername des Moduls, z.B.:
- `feat(suno-ai)` → Modul suno-ai
- `fix(gallery)` → Modul gallery
- `docs` → Kein Bereich bei allgemeinen Docs
- `chore` → Kein Bereich bei allgemeinen Tasks

## Komplettes Beispiel

Nach dem Erstellen eines neuen Moduls "farb-mixer":
```powershell
cd c:\DEVKiTZ\01_PROJECTS\01_dashboard
git add -A
git commit -m "feat(farb-mixer): initial module v0.01 with color mixing, palette export, DkZ v2 design"
```

## WANN committen?

| Aktion | Commit? | Commit Message |
|--------|---------|---------------|
| Neues Modul erstellt | JA | `feat(name): initial module` |
| Feature hinzugefügt | JA | `feat(name): add FEATURE` |
| Bug gefixt | JA | `fix(name): fix BUG` |
| CSS geändet | JA | `style(name): update CSS` |
| features.json erstellt | JA | `docs(name): add features.json` |
| BLAUPAUSE.md aktualisiert | JA | `docs: update BLAUPAUSE` |
| Nur gelesen, nichts geändert | NEIN | — |

## PowerShell-Syntax
WICHTIG: In PowerShell benutze `;` statt `&&`:
```powershell
# RICHTIG (PowerShell):
git add -A ; git commit -m "feat: message"

# FALSCH (das ist Bash, nicht PowerShell):
git add -A && git commit -m "feat: message"
```
