---
description: Debug Agent — Systematisches Debugging mit Root-Cause-Analysis und Fix-Vorschlägen
---

# /agent-debug — Debugging Agent

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## 5-Schritt Debug-Prozess

### 1. Problem isolieren
```markdown
- **Was passiert?** [Symptom beschreiben]
- **Was sollte passieren?** [Erwartetes Verhalten]
- **Wann?** [Immer / Manchmal / Nach X]
- **Wo?** [Modul, Datei, Zeile]
- **Console Errors?** [Exakte Fehlermeldung]
```

### 2. Reproduzieren
```bash
# Modul öffnen und Fehler triggern
# DevTools Console (F12) öffnen
# Network Tab für 404s prüfen
# Application Tab für localStorage Daten
```

### 3. Root Cause Analysis
```markdown
Häufige Ursachen im DkZ Ökosystem:
1. Shared Script nicht geladen (Pfad falsch)
2. localStorage Key fehlt oder korrupt
3. CSS Variable nicht definiert (Theme fehlt)
4. Event Listener an falschem Element
5. Async/Await ohne Error Handling
6. CORS bei fetch() Aufrufen
7. innerHTML ohne esc() → XSS oder Encoding
8. Falsche relative Pfade (../../shared/)
```

### 4. Fix implementieren
```javascript
// IMMER mit Error Handling:
try {
    // Fix-Code
} catch (e) {
    console.warn('[DkZ Debug]', e.message);
    // Graceful Fallback
}
```

### 5. Validieren
```bash
# 1. Fix testen (/browser-test)
# 2. Keine neuen Console Errors
# 3. Andere Module nicht kaputt
# 4. Git Commit
git commit -m "fix([modul]): [was gefixt] — root cause: [ursache]"
```
