---
name: frontpage-builder
description: Frontpage/Landing Page für Projekte erstellen — mit NLM-Infografiken, Podcast-Player, Showcase und Signup-Guide
---

# 🍌 Frontpage Builder Skill

> Erstellt Premium-Frontpages für neue User mit Einführung, visueller Präsentation und Anmelde-Guide.

---

## Wann verwenden

- Neue Landing Page für ein DkZ™ Projekt
- Welcome-Page für Neukunden
- Onboarding-Seite mit Podcast und Guide-Elementen
- Projekt-Vorstellung mit NLM-Infografiken

---

## Pflicht-Elemente jeder Frontpage

| # | Element | Beschreibung | Icon |
|:--|:--------|:-------------|:-----|
| 1 | 🍌 Hero Section | Titel, Tagline, CTA Buttons | Banana-Theme optional |
| 2 | 📋 Einführung | Was ist das Projekt? Feature-Cards (6x) | 🍌 als Deko |
| 3 | 📊 Infografiken | NLM Mind Maps, Diagramme — Lightbox zum Vergrößern | Mind Map PNGs |
| 4 | 📸 Showcase Slider | 3+ Slides mit Bildern + Beschreibung | Auto-Rotation |
| 5 | 🎙️ Podcast Player | Play/Pause, Progress-Bar, Zeitanzeige | MP3 aus `02_RESEARCH/01_podcasts/` |
| 6 | 🔢 Schritt-für-Schritt | Timeline mit 4 Steps zum Loslegen | Nummerierte Dots |
| 7 | 📝 Signup Guide | GitHub + Google Anmeldung Side-by-Side | SVG Logos |
| 8 | 📋 Clone Box | Git Clone Befehl mit Copy-Button | Code-Block |
| 9 | 🚀 CTA | Call-to-Action mit Repository-Link | Accent Button |
| 10 | 📄 Footer | Copyright + Branding | DkZ™ Standard |

---

## Dateistruktur

```
projekt-ordner/
├── welcome.html          ← Frontpage HTML
├── welcome.css           ← DkZ™ Design System v2 CSS
├── welcome.js            ← Interaktivität (Player, Slider, Lightbox)
├── assets/
│   ├── img/              ← Generierte Vorschaubilder
│   ├── mindmaps/         ← NLM Mind Map PNGs
│   └── podcasts/         ← MP3 Podcast-Dateien
└── index.html            ← Bestehende Hauptseite (unverändert!)
```

---

## 🍌 Banana-Theme (Optional)

Für spielerische Varianten:
- **Buttons:** `background: #FFD700;` mit 🍌-Emoji
- **Icons:** Banana-Emoji statt Standard-Icons
- **Backgrounds:** Subtile Banana-Pattern als CSS-Gradient
- **Akzent:** `--banana: #FFD700; --banana-soft: rgba(255,215,0,.12);`

```css
/* Banana Theme Override */
.banana-theme {
    --accent: #FFD700;
    --accent-soft: rgba(255, 215, 0, 0.12);
    --accent-glow: rgba(255, 215, 0, 0.4);
}
.banana-btn {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #1a1a1a;
}
.banana-btn::before { content: '🍌 '; }
```

---

## Podcast-Integration

### Quellen für Podcasts
```
C:/DEVKiTZ/02_RESEARCH/01_podcasts/  ← 35+ MP3 Dateien
```

### Player-Funktionen
1. **Play/Pause** — Klick auf rotem Circle-Button
2. **Progress-Seek** — Klick auf Progress-Bar springt zur Position
3. **Zeit-Anzeige** — Aktuelle Position + Gesamtlänge
4. **Single-Active** — Nur ein Podcast gleichzeitig aktiv

### Player HTML-Template
```html
<div class="podcast-play-btn" data-src="assets/podcasts/datei.mp3">
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
    </svg>
</div>
```

---

## NLM-Infografiken

### Quellen
```
C:/DEVKiTZ/02_RESEARCH/notebooklm/  ← Mind Map PNGs (11+)
```

### Lightbox-Funktion
- Klick auf Infografik → Vollbild-Overlay
- ESC oder Klick außerhalb → Schließen
- Zoom-Indikator (🔍) bei Hover

---

## Workflow-Ablauf

1. **Analyse** — Bestehende Seite + Assets prüfen
2. **Assets sammeln** — NLM Mind Maps + Podcasts kopieren
3. **Bilder generieren** — Dashboard-Preview, Agent-Network, Signup-Guide
4. **HTML erstellen** — `welcome.html` mit allen Sektionen
5. **CSS erstellen** — `welcome.css` mit DkZ™ Design System v2
6. **JS erstellen** — `welcome.js` mit Player, Slider, Lightbox
7. **Browser-Test** — Alle Sektionen visuell prüfen
8. **Git Commit** — `feat(frontpage): welcome page mit podcasts + infografiken`

---

## Checkliste vor Abschluss

- [ ] Hero Section mit CTA
- [ ] 6 Feature-Cards in Einführung
- [ ] 3+ NLM-Infografiken mit Lightbox
- [ ] 3+ Showcase-Slides mit Auto-Rotation
- [ ] 3+ Podcast-Player funktionieren
- [ ] 4-Schritt Timeline
- [ ] GitHub + Google Signup Guide
- [ ] Clone-Box mit Copy-Button
- [ ] CTA-Section
- [ ] Footer
- [ ] Responsive (Mobile)
- [ ] Browser getestet
- [ ] Git committed

---

*Erstellt: 2026-04-02 · Skill-ID: frontpage-builder*
