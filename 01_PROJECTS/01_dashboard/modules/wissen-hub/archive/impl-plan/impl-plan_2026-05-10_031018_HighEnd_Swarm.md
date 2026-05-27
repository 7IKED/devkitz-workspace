# 🌌 Swarm Mission Control — Vanilla High-End (Option B)

Wir bauen die grafisch extremste Version des Dashboards — strikt nach DEVKiTZ™ Regeln (Vanilla JS/HTML/CSS), aber mit kinoreifen Effekten.

## ⚠️ User Review Required

Bitte wirf einen kurzen Blick auf die Effekte. Wenn dir das so gefällt, lege ich sofort mit der Programmierung los!

## 🚀 Proposed Changes

### 1. Cinematic 8K Video Background
- Ein hochauflösendes, dunkles Tech-Loop-Video als Vollbild-Hintergrund (hinter dem Glassmorphism).
- Absolut ruckelfrei integriert via `<video autoplay loop muted>` mit CSS `object-fit: cover` und einem Dark-Overlay, damit der Kontrast zum Text perfekt bleibt.

### 2. Nanobot Particle Engine (HTML5 Canvas)
- Ich schreibe eine **Custom Canvas Engine** (`nanobot-engine.js`).
- Die Agenten-Knotenpunkte im Graph sind keine langweiligen Kreise mehr, sondern bestehen aus hunderten glühenden **"Nanobots" (Partikeln)**.
- **Animationen:** Wenn ein Agent "Standby" ist, schwirren die Partikel langsam umher. Bekommt er Arbeit, fliegen sie blitzschnell zusammen, bauen den Node auf und leuchten rot/neon auf. 

### 3. Glassmorphism HUD & Detailed Popups
- Die Menüs schweben als echte HUDs (Heads-Up-Displays) mit extremen `backdrop-filter: blur(30px)` über dem Video.
- Klickst du auf einen Agenten (Nanobot-Cluster), öffnet sich mit einer weichen 60fps CSS3-Animation eine detaillierte Seiten-Ansicht:
  - Aktueller Prompt/Task
  - Zuversichts-Score (Confidence)
  - Memory-Auslastung
  - Letzte Events
- Geschlossen wird das Popup, indem sich die Box flüssig auflöst.

## 🧪 Verification Plan

- [ ] Video-Performance: CPU-Last darf nicht explodieren.
- [ ] Partikel-Limit: Dynamische Limitierung der Nanobots für konstante 60 FPS.
- [ ] Responsive UI: Das HUD muss skalieren.
- [ ] HTML Auto-Open: Gemäß neuer Regel **R44** wird das Ergebnis am Ende sofort im Browser geöffnet.
