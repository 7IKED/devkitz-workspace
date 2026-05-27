---
name: webapp-testing
description: Testet lokale Web-Applikationen mit Playwright — Frontend-Funktionalität, UI-Debugging, Screenshots
---

# Webapp Testing Skill

Testet Web-Applikationen systematisch mit Browser-Automatisierung.

## Wann nutzen
- Neues Modul fertig → Visuellen Test durchführen
- UI-Bugs debuggen → Screenshots vergleichen
- Nach CSS-Änderungen → Layout-Verifizierung
- Vor Git-Commit → Regressions-Check

## Anweisungen

### 1. Seite im Browser öffnen
Nutze den `browser_subagent` um die Ziel-URL zu öffnen:
- Lokale Dateien: `file:///C:/DEVKiTZ/01_PROJECTS/01_dashboard/modules/[modul]/index.html`
- Dev-Server: `http://localhost:[port]`

### 2. Visual Verification
- Screenshot jeder Sektion/Tab erstellen
- DkZ™ Design System prüfen (Farben, Fonts, Spacing)
- Mobile Responsive testen (Viewport 375px, 768px, 1440px)

### 3. Interaktions-Test
- Alle Buttons klicken
- Formulare ausfüllen
- Navigation testen (Tabs, Links, Hamburger-Menu)
- Toast-Notifications prüfen

### 4. Fehler-Protokoll
Alle gefundenen Fehler als Liste:
```
- [ ] [Schweregrad] Beschreibung — Wo gefunden
- [ ] [CRITICAL] Button XY funktioniert nicht — Tab Setup
- [ ] [MINOR] Farbe weicht ab — Header
```

### 5. Screenshots speichern
Artefakte in Brain-Verzeichnis ablegen:
`C:\Users\BAZE²\.gemini\antigravity\brain\[conversation-id]\`

## Beispiel
"Teste das Agent Control Panel v2 — alle 9 Tabs durchklicken, Screenshots machen, Layout-Fehler melden."
