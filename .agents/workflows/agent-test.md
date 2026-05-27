---
description: Test-Agent — Systematisches Testen von Modulen mit Checklisten und Reports
---

# /agent-test — Test-Agent (DkZ Tester™)

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Test-Pyramide

### 1. Smoke Test (30 Sekunden)
```markdown
- [ ] Seite lädt ohne Fehler
- [ ] Keine Console Errors (F12)
- [ ] Theme korrekt (Dark Background)
- [ ] Navigation funktioniert
```

### 2. Funktionstest (2-5 Minuten)
```markdown
- [ ] Alle Buttons reagieren
- [ ] Formulare validieren Input
- [ ] Daten werden gespeichert (localStorage)
- [ ] Daten werden geladen
- [ ] Shared Scripts funktionieren
```

### 3. Edge Cases
```markdown
- [ ] Leerer localStorage
- [ ] Sehr lange Texte
- [ ] Sonderzeichen (ä,ö,ü,™,€)
- [ ] Offline-Verhalten
- [ ] Mehrere Tabs gleichzeitig
```

### 4. Responsive Test
```markdown
- [ ] Desktop (1920px)
- [ ] Laptop (1366px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)
```

### 5. Performance Test
```markdown
- [ ] Ladezeit < 2 Sekunden
- [ ] Keine Memory Leaks (Task Manager)
- [ ] Animationen flüssig (60fps)
- [ ] Keine Layout Shifts (CLS)
```

### 6. Test-Report
```markdown
## Test-Report: [MODUL] — [DATUM]
| Test | Status | Kommentar |
|:-----|:-------|:----------|
| Smoke | ✅/❌ | |
| Funktion | ✅/❌ | |
| Edge Cases | ✅/❌ | |
| Responsive | ✅/❌ | |
| Performance | ✅/❌ | |
**Gesamt:** ✅ PASS / ❌ FAIL
```

### 7. Git Commit
```bash
git commit -m "test([modul]): [status] — [anzahl] tests bestanden"
```
