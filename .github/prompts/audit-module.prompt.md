---
description: Audit module for DkZ compliance and create fix PR
---

# DkZ Module Audit + Auto-Fix

Analysiere das Modul `{modulePath}` und pruefe:

## 1. Security (XSS)
- Suche ALLE `innerHTML` Verwendungen
- Pruefe ob `esc()` davor aufgerufen wird
- JEDE innerHTML Zeile MUSS esc() verwenden
- Fix: `element.innerHTML = esc(userInput)` statt `element.innerHTML = userInput`

## 2. Design System
- Suche hardcoded HEX Farben (#fa1e4e, #000000, #00ff88 etc.)
- Ersetze durch CSS Custom Properties: var(--accent), var(--bg), var(--green)
- Pruefe ob `<link rel="stylesheet" href="../../shared/dkz-core.css">` eingebunden ist

## 3. Shared Scripts
Am Ende von `<body>` muessen diese Scripts stehen:
```html
<script src="../../shared/dkz-debug.js"></script>
<script src="../../shared/dkz-guide.js"></script>
<script src="../../shared/dkz-navbar.js"></script>
```

## 4. Meta Tags
```html
<meta name="dkz-version" content="v2.00.0_01">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## 5. Hub Button
```html
<a href="../../hub/index.html" class="hub-btn" title="Hub">← Hub</a>
```

## 6. EN/DE Toggle
Pruefe ob ein Sprach-Toggle vorhanden ist. Wenn nicht, nachruestigen.

## Output
- Erstelle einen Fix-Commit pro gefundenem Problem
- Commit Message: `fix({moduleName}): [Problem] behoben`
- PR mit @7IKED als Reviewer
- PR Body: Liste aller gefundenen + behobenen Probleme
