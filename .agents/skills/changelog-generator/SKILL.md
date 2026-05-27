---
name: changelog-generator
description: Automatisch Changelogs aus Git-Commits generieren — technische Commits in benutzerfreundliche Release-Notes umwandeln
---

# Changelog Generator Skill

Erstellt benutzerfreundliche Changelogs aus Git-History.

## Wann nutzen
- Vor Release / Version-Bump
- Wöchentliche Status-Updates
- Nach größeren Feature-Sprints
- Für WissenHub-Dokumentation

## Anweisungen

### 1. Git-Log analysieren
```bash
git log --oneline --since="1 week ago" --pretty=format:"%h %s"
```

### 2. Commits kategorisieren
| Prefix | Kategorie | Emoji |
|:-------|:----------|:------|
| feat() | ✨ Neue Features | Grün |
| fix() | 🐛 Bugfixes | Rot |
| docs() | 📚 Dokumentation | Blau |
| refactor() | ♻️ Refactoring | Gelb |
| chore() | 🔧 Wartung | Grau |

### 3. Changelog-Format
```markdown
# Changelog v[VERSION] — [DATUM]

## ✨ Neue Features
- **[Modul]**: Beschreibung was neu ist (#commit)

## 🐛 Bugfixes
- **[Modul]**: Was gefixt wurde

## ♻️ Verbesserungen
- **[Modul]**: Was verbessert wurde

## 📚 Dokumentation
- Neue/aktualisierte Docs

---
*Generiert am [DATUM] · [ANZAHL] Commits seit letztem Release*
```

### 4. Speichern
- Datei: `CHANGELOG.md` im Projekt-Root
- Backup: WissenHub als `changelog_[datum].md`

## Beispiel
"Generiere Changelog für die letzten 2 Wochen aus den Git-Commits von devkitz-ecosystem."
