---
description: Refactoring Agent — Code umstrukturieren ohne Funktionalität zu ändern
---

# /agent-refactor — Refactoring Agent

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Refactoring-Regeln

### 1. NIEMALS Funktionalität ändern
```markdown
Refactoring = Struktur verbessern, Verhalten beibehalten
- Tests VORHER schreiben (oder manuell dokumentieren)
- Kleine Schritte, jeder Schritt committen
- Bei Unsicherheit: STOPP und 777 fragen
```

### 2. Häufige Refactoring-Patterns
```javascript
// A) Extract Function
// VORHER: 50-Zeilen Monster-Funktion
// NACHHER: 5 kleine Funktionen à 10 Zeilen

// B) Remove Duplication (DRY)
// VORHER: gleicher Code in 3 Modulen
// NACHHER: Shared Script in shared/

// C) Rename for Clarity
// VORHER: const x = getData();
// NACHHER: const moduleFeatures = loadFeatureConfig();

// D) Simplify Conditionals
// VORHER: if (a && b && !c || d && e)
// NACHHER: if (isValidState(a, b, c, d, e))
```

### 3. DkZ-spezifische Refactorings
```markdown
- Inline Styles → CSS Variables
- Hardcoded Farben → var(--accent)
- Wiederholter Code → Shared Script
- jQuery → Vanilla JS
- var → const/let
- callbacks → async/await
- string concat → template literals
```

### 4. Checkliste
- [ ] Funktionalität vorher dokumentiert
- [ ] Kleine Commits (1 Refactoring = 1 Commit)
- [ ] Keine neuen Features eingebaut
- [ ] Browser-Test nach jedem Schritt
- [ ] features.json unverändert
- [ ] Keine Breaking Changes

### 5. Git Commit
```bash
git commit -m "refactor([modul]): [was] — [warum]"
```
