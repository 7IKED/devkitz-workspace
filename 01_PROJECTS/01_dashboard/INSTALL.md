# Installation & Implementierung — DkZ Dashboard

## Voraussetzungen
- Git
- Moderner Browser (Chrome/Edge/Firefox)
- Optional: Node.js (fuer Live Server)

## Installation

```bash
# 1. Klonen
git clone https://github.com/BAZE2/devkitz-dashboard.git
cd devkitz-dashboard

# 2. Direkt oeffnen (kein Build noetig!)
start hub/index.html

# ODER mit Live Server:
npx serve .
```

## Standalone-Betrieb
Dieses Projekt funktioniert **eigenstaendig** ohne den DkZ Hub.
Einfach `hub/index.html` im Browser oeffnen.

## Integration ins DkZ Oekosystem
1. Ordner in `01_PROJECTS/` ablegen
2. `ORDNER.ini` pruefen/erstellen
3. `features.json` aktualisieren
4. In `REGISTRY.json` eintragen
5. Hub Auto-Discovery erkennt das Modul automatisch

## Tech Stack
- **Technologie:** HTML/CSS/JS
- **Design:** DkZ Design System v2 (Dark, #fa1e4e)
- **Fonts:** Inter + JetBrains Mono

## Versionierung
Format: `vX.XX.X_XX` (Major.Feature.Session_Step)
- v0.XX = Alpha | v01.XX = Beta | v1.XX = Release

## REGELWERK
Dieses Projekt folgt dem DEVKiTZ REGELWERK (20 Regeln, R0-R19).
Siehe: [REGELWERK.md](../../REGELWERK.md)
