# 🖥️ OBS FX Overlay Pro (MOD-087)

> **Version:** v1.0.0 | **Stand:** 2026-05-08 | **Status:** Active | **ID:** MOD-087

---

## 📌 Was macht dieses Modul?

Ein High-End Visual FX System für OBS-Streams mit:
- **Interaktiver Particle Engine** (Herzen, Sterne, Sparks auf Canvas)
- **Animierte Hexagon/Waben-Matrix** als Hintergrund-Effekt
- **Echtzeit-Steuerung** über ein DkZ™ Control Panel
- **50 UHD Streaming-Assets** (4K, schwarzer Hintergrund → transparent via OBS Additive Blending)
- **Zero-Latency Kommunikation** zwischen Panel und Overlay über `localStorage` Events

---

## 🏗️ Architektur

```
obs-fx-overlay/
├── index.html        ← 🎛️ Control Panel (DkZ™ Design)
├── overlay.html      ← 🖥️ OBS Browser Source (transparent/chroma key)
├── style.css         ← 🎨 Neon-Effekte, Hexagon-Matrix, Glassmorphism Alerts
├── overlay.js        ← ⚡ Particle Engine + localStorage Event Listener
├── features.json     ← 📋 Modul-Registrierung
├── README.md         ← 📖 DU BIST HIER
└── assets/           ← 🎬 50 UHD Streaming-Effekte (PNG)
    ├── fx_01_neon_hearts_rain.png
    ├── fx_02_gold_confetti_burst.png
    ├── ...
    └── fx_50_neon_love_text.png
```

---

## 🚀 Einbindung in OBS

### Overlay als Browser-Quelle
1. OBS → **Quellen** → **+** → **Browser**
2. **Lokale Datei** aktivieren
3. Pfad: `C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\obs-fx-overlay\overlay.html`
4. Breite: `1920` · Höhe: `1080`
5. ✅ Fertig — die Seite ist standardmäßig transparent

### UHD Assets als Bild-Quellen
1. OBS → **Quellen** → **+** → **Bild**
2. Bild aus `assets/` wählen
3. Rechtsklick → **Mischmodus** → **Hinzufügen (Additive)**
4. 🎉 Schwarzer Hintergrund wird unsichtbar!

---

## 🎛️ Control Panel

Das Control Panel (`index.html`) steuert die Overlay-Effekte in Echtzeit:

| Button | Effekt | Partikel-Typ |
|:-------|:-------|:-------------|
| ❤️ Liebe dalassen | Herzen-Explosion | `heart` |
| ✨ Danke, ich liebe euch | Sternen-Regen | `spark` |
| 🔥 Hype Mode | Doppel-Explosion (Herzen + Sparks) | `heart` + `spark` |
| 🌌 Szenenwechsel | Hexagon-Matrix ein/aus (3s) | CSS Animation |

### Einstellungen
- **Hintergrund-Modus:** Transparent (Standard) oder Neon-Grün (Chroma Key)
- **Partikel-Dichte:** 10–200 (Slider)
- **Partikel-Farbe:** Frei wählbar (Color Picker)
- **Waben-Farbe:** Frei wählbar (Color Picker)

---

## 🎬 Assets (50 UHD Effekte)

| Kategorie | Anzahl | Beispiele |
|:----------|:-------|:----------|
| 🔥 Partikel & Explosionen | 10 | Confetti, Fireworks, Meteore, Shockwave |
| ❤️ Liebe & Emotionen | 6 | Hearts, Rosen, Federn, Wings, LOVE Neon |
| 🌌 Atmosphäre | 10 | Schnee, Sakura, Galaxy, Nebel, Aurora |
| 🎮 Gaming & Action | 8 | Blitze, Dragonfire, Skull, Sturm, Shield |
| 🔮 Cyberpunk & Tech | 8 | Matrix, Hex, Glitch, Hologramm, DNA |
| 🎉 Celebration & Alerts | 8 | Krone, Portal, Musik-EQ, Glitter, Laser |

---

## ⚙️ Technische Details

- **Particle Engine:** Canvas 2D API, `requestAnimationFrame`, Physics (Gravity, Alpha-Fading)
- **Kommunikation:** `window.addEventListener('storage', ...)` für Cross-Tab Events
- **Farb-Engine:** `shadeColor()` Hilfsfunktion für Farbvariationen
- **CSS:** Custom Properties (`--hex-color`), Keyframe Animations, `clip-path` Hexagons
- **Keine Dependencies:** Vanilla HTML/CSS/JS — kein npm, kein Build, kein Framework

---

## 📐 DkZ™ Standards

- [x] DkZ Design System v2 (Farben, Fonts, Cards)
- [x] `esc()` XSS-Schutz
- [x] Shared Scripts eingebunden (dkz-navbar.js, dkz-guide.js)
- [x] `features.json` vorhanden
- [x] In `REGISTRY.json` registriert (MOD-087)
- [x] In `BLAUPAUSE.md` dokumentiert
- [x] Funktioniert offline
- [x] Portable (Shared Scripts optional)

---

*Erstellt von DEVKiTZ™ · 2026-05-08*
