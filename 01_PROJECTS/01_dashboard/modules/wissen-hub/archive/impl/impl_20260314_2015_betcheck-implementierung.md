# 📋 BETCHECK — Implementierungsplan

---
📋 METADATEN
├─ 🏷️ Projekt:    BETCHECK / BAZE²
├─ 📂 Kategorie:  I — Implementierung
├─ 🔖 Version:    v0.02.1_01
├─ 📅 Datum:      2026-03-14
├─ 👤 Autor:      antigravity
├─ 🚦 Status:     🟢 UMGESETZT
└─ 🏷️ Tags:       #betcheck #implementierung #architektur #tipico #wettschein #vanilla-js #html #css #javascript #dkz #sportwetten
---

## Architektur

**Single-Page App** — 3 Dateien (HTML/CSS/JS) in `01_PROJECTS/17_BAZE²/BETCHECK/src/`

### Datenmodell
- Wettschein-Objekt mit ID, Code, Einsatz, Max. Ausz., Gesamtquote
- Games-Array mit Home/Away/Bets/Status/Score/Links
- System-Reihen mit je eigener Quote und Wahrscheinlichkeit

### Externe Verknüpfungen
- SofaScore: `sofascore.com/{slug}` — Statistiken, Highlights
- Oddspedia: `oddspedia.com/{slug}` — Quoten-Vergleich
- LiveTV.sx: `livetv.sx/en/search/?q={team}` — Live-Streams, Highlights

### UI-Komponenten
1. Schein-Info-Bar (7 Felder)
2. Stats-Row (4 Karten)
3. System-Reihen Grid (4 Spalten)
4. Game-Cards mit Bet-Chips und Link-Row
5. Goal-Feed (Tor-Ticker Seite)
6. Tipps-Grid (Wett-Tipps Seite)
7. Highlights-Grid (Highlight-Karten)
8. Bottom-Ticker (scrollend, fixiert)
9. Side-Ticker (Pop-Up Buttons rechts)

### Live-Simulation
- 6-Sekunden-Intervall für Tor-Simulation
- Web Audio API für Tor-Sound (nur eigene Spiele)
- CSS Animation für Side-Goal Pop-Ups (12s Lebensdauer)
