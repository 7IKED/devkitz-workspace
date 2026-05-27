---
description: Dokumentations-Agent — README, Wiki, API-Docs, Inline-Kommentare systematisch erstellen
---

# /agent-docs — Dokumentations-Agent (DkZ Dokumentar™)

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Pflicht-Dokumentation pro Modul

### 1. README.md
```markdown
# [Modul-Name] — [Einzeiler]

> [Beschreibung] · MOD-[NNN] · Version [X.Y]

## Features
- ✅ Feature 1
- ✅ Feature 2

## Verwendung
[Kurze Anleitung]

## Shared Scripts
- `dkz-navbar.js` — Navigation
- `dkz-debug.js` — Debugging

## Changelog
- [Datum] — v[X.Y]: [Was neu ist]
```

### 2. Inline-Kommentare
```javascript
// ═══════════════════════════════════════
// [SEKTION] — [Beschreibung]
// ═══════════════════════════════════════

/**
 * [Funktion] — [Was sie tut]
 * @param {string} input - [Beschreibung]
 * @returns {Object} [Was zurückkommt]
 */
```

### 3. features.json
```json
{
    "id": "MOD-[NNN]",
    "name": "[modul-name]",
    "version": "[X.Y.Z]",
    "status": "active",
    "features": [
        { "name": "[Feature]", "status": "done" }
    ]
}
```

### 4. Wiki-Eintrag
```markdown
## [Modul-Name]
- **Pfad:** modules/[name]/
- **Status:** ✅ Active
- **Abhängigkeiten:** [Shared Scripts]
- **Zuletzt geändert:** [Datum]
```

### 5. Git Commit
```bash
git commit -m "docs([modul]): README + inline-docs + features.json aktualisiert"
```
