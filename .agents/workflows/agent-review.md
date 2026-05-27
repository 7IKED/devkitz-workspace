---
description: Code Review Agent — Automatische Qualitätsprüfung nach DkZ-Regeln
---

# /agent-review — Code Review Agent (DkZ Reviewer™)

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Prüf-Checkliste (JEDER Review)

### Sicherheit
- [ ] `esc()` bei JEDEM innerHTML mit User-Input
- [ ] Keine API Keys / Tokens im Code
- [ ] Keine hardcoded Pfade (`C:\Users\...`)
- [ ] CORS korrekt konfiguriert

### DkZ Design System
- [ ] CSS Variables statt hardcoded Farben
- [ ] `--accent: #fa1e4e` nicht als Literal
- [ ] Inter + JetBrains Mono Fonts
- [ ] Glassmorphism (`backdrop-filter: blur(20px)`)
- [ ] Dark Theme (`--bg: #060608`)

### Code-Qualität
- [ ] Kein `console.log` in Produktion
- [ ] Kein jQuery oder Framework-Import
- [ ] Error Handling vorhanden
- [ ] Deutsche Kommentare wo hilfreich
- [ ] Funktionen < 50 Zeilen

### Shared Scripts
- [ ] `dkz-navbar.js` eingebunden
- [ ] `dkz-debug.js` verfügbar
- [ ] `dkz-theme.css` geladen
- [ ] Portable Modus: Scripts optional

### Registrierung
- [ ] `features.json` aktualisiert
- [ ] `REGISTRY.json` Eintrag vorhanden
- [ ] `BLAUPAUSE.md` Verzeichnis aktuell

## Bewertung
```
🟢 PASS — Alle Prüfungen bestanden
🟡 WARN — Nicht-kritische Mängel (fix empfohlen)
🔴 FAIL — Kritische Mängel (MUSS gefixt werden)
```

## Git Commit
```bash
git commit -m "review([modul]): code review bestanden — [status]"
```
