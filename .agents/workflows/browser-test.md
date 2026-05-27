---
description: Nach jeder Implementierung automatisch im Browser testen, aufnehmen und Video auf Desktop ablegen
---

# /browser-test — Automatischer Browser-Test

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Wann verwenden?
- Nach jeder HTML/CSS/JS Änderung an einem Modul
- UI-Debugging und visuelles Testing
- Screenshots und Recordings für Walkthroughs
- Responsive Design prüfen

## Workflow

### 1. Modul im Browser öffnen
```
# Pfad zum Modul zusammensetzen:
C:/DEVKiTZ/01_PROJECTS/01_dashboard/modules/[MODUL]/index.html

# Oder Hub:
C:/DEVKiTZ/01_PROJECTS/01_dashboard/hub/index.html
```

### 2. Browser Subagent starten
```
browser_subagent mit Task:
1. URL öffnen: file:///C:/DEVKiTZ/01_PROJECTS/01_dashboard/modules/[MODUL]/index.html
2. Seite laden lassen (2 Sekunden warten)
3. Funktionale Tests:
   - Alle Buttons klickbar?
   - Navigation funktioniert?
   - Keine Console Errors?
4. Screenshot erstellen
5. Recording speichern
```

### 3. Prüf-Checkliste
- [ ] Seite lädt ohne Fehler
- [ ] DkZ Theme korrekt (Dark Background #060608)
- [ ] Fonts geladen (Inter + JetBrains Mono)
- [ ] Navigation (Hamburger ☰) funktioniert
- [ ] Responsive: Desktop + Tablet + Mobile
- [ ] Shared Scripts laden (dkz-navbar.js, dkz-debug.js etc.)
- [ ] Keine Console Errors
- [ ] Alle interaktiven Elemente reagieren

### 4. Screenshot auf Desktop
```
Recording wird automatisch als .webp gespeichert
Screenshot manuell als .png auf Desktop:
C:/Users/[USER]/Desktop/test-[modul]-[datum].png
```

### 5. Fehler-Report
```markdown
## Browser-Test Report: [MODUL]
- **Status:** ✅ PASS | ⚠️ WARN | ❌ FAIL
- **URL:** file:///...
- **Browser:** Chrome/Vivaldi [Version]
- **Fehler:** [Liste wenn vorhanden]
- **Screenshot:** [Pfad]
```

### 6. Nach Fixes erneut testen
```bash
# Fix implementieren → Erneut /browser-test
# Bis Status = ✅ PASS
```

### 7. Git Commit
```bash
git add -A
git commit -m "test([modul]): browser-test bestanden — UI validiert"
```

## Tipps
- **DevTools Console** immer offen (F12)
- **Lighthouse** Tab für Performance-Score
- **Network** Tab für fehlende Dateien (404s)
- **Application** Tab für localStorage/IndexedDB Daten
