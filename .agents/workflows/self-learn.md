---
description: Q-Loop — Autonomer Self-Improving Agent Loop mit dkz-self-learn.js
---

# /self-learn — Q-Loop Autonomer Agent

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Wann verwenden?
- Agent soll sich aus Fehlern selbst verbessern
- Autonome Code-Review + Fix Zyklen
- Qualitätsprüfung mit Lerneffekt
- Iterative Verbesserung von Modulen

## Workflow

### 1. Q-Loop Konzept
```
┌─────── Q-LOOP ───────┐
│                       │
│  1. ANALYSE     →     │
│  2. BEWERTUNG   →     │
│  3. VERBESSERUNG →    │
│  4. VALIDIERUNG →     │
│  5. LERNEN      →     │
│  └────── LOOP ────────┘
```

### 2. Script einbinden
```html
<script src="../../shared/dkz-self-learn.js"></script>
```

### 3. Pattern erkennen
```javascript
// Agent analysiert eigene Outputs
DkzSelfLearn.analyze({
    module: 'modul-name',
    action: 'was-gemacht',
    result: 'was-rauskam',
    expected: 'was-erwartet-war',
    score: 0.85  // 0-1 Qualität
});
```

### 4. Lernregeln
```javascript
// Agent speichert Learnings
DkzSelfLearn.learn({
    pattern: 'beschreibung-des-musters',
    solution: 'was-funktioniert-hat',
    avoid: 'was-nicht-funktioniert-hat',
    context: ['modul', 'feature', 'tech']
});
```

### 5. Selbst-Verbesserung aktivieren
```javascript
// Aus NanoBot Center:
DkzSelfLearn.startQLoop({
    module: 'ziel-modul',
    maxIterations: 5,
    targetScore: 0.95,
    autoFix: true       // Automatisch Fixes anwenden
});
```

### 6. Sicherheitsregeln
- **Max. 5 Iterationen** pro Loop (kein Endlos-Loop)
- **Keine Breaking Changes** ohne menschlichen Review
- **Logging** aller Änderungen in DkzNotes
- **Rollback** möglich bei Score-Verschlechterung
- **R24 ALARM** wenn strukturelle Änderungen nötig

### 7. Integration mit NanoBot Center
- Agent-Profile mit Q-Loop Capabilities
- UI: Q-Loop Status-Anzeige im NanoBot Panel
- History: Alle Iterations-Ergebnisse einsehbar

### 8. Git Commit
```bash
git add -A
git commit -m "feat(qloop): self-improving agent loop in [modul] aktiviert"
```
