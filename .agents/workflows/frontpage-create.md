---
description: Frontpage/Landing Page für Projekte erstellen — mit NLM-Infografiken, Podcast-Player, Showcase und Signup-Guide
---

# 🍌 /frontpage-create — Frontpage Builder Workflow

> Erstellt eine Premium-Frontpage für neue User mit Einführung, visueller Präsentation und Anmelde-Guide.

// turbo-all

---

## Voraussetzungen

- Ziel-Projekt-Ordner existiert (z.B. `01_PROJECTS/10_devkitz-eu/`)
- NLM Mind Maps verfügbar in `02_RESEARCH/notebooklm/`
- Podcasts verfügbar in `02_RESEARCH/01_podcasts/`

---

## Schritt 1: Skill lesen

Lies den Frontpage Builder Skill:
```
view_file: C:\DEVKiTZ\.agents\skills\frontpage-builder\SKILL.md
```

## Schritt 2: Bestehende Seite analysieren

Prüfe ob bereits eine `index.html` oder `welcome.html` existiert:
```bash
ls C:\DEVKiTZ\01_PROJECTS\10_devkitz-eu\
```

## Schritt 3: Asset-Ordner erstellen

```bash
mkdir -p assets/img assets/mindmaps assets/podcasts
```

## Schritt 4: NLM Mind Maps kopieren

Kopiere 3 passende Mind Maps aus `02_RESEARCH/notebooklm/`:
```bash
cp "02_RESEARCH/notebooklm/NotebookLM Mind Map.png" assets/mindmaps/ecosystem-overview.png
cp "02_RESEARCH/notebooklm/NotebookLM Mind Map (5).png" assets/mindmaps/agent-network.png
cp "02_RESEARCH/notebooklm/NotebookLM Mind Map (6).png" assets/mindmaps/tech-stack.png
```

## Schritt 5: Podcasts kopieren

Wähle 3 thematisch passende Podcasts aus `02_RESEARCH/01_podcasts/`:
```bash
cp "02_RESEARCH/01_podcasts/SKILLED/Allwissender Super-Agent oder spezialisierte Skills.mp3" assets/podcasts/ki-agenten-skills.mp3
# + 2 weitere passende Podcasts
```

## Schritt 6: Vorschaubilder generieren

Nutze `generate_image` für:
1. **Dashboard Preview** — Dark UI Screenshot-Style
2. **Agent Network** — KI-Agenten Visualisierung
3. **Signup Guide** — Onboarding UI mit GitHub/Google

## Schritt 7: HTML erstellen

Erstelle `welcome.html` mit diesen Sektionen:
1. Navigation (fixed, glassmorphism)
2. Hero (Titel, Tagline, CTAs)
3. Einführung (6 Feature-Cards)
4. Infografiken (3 NLM Mind Maps + Lightbox)
5. Showcase Slider (3+ Slides mit Auto-Rotation)
6. Podcast Player (3 Podcasts mit Play/Pause/Seek)
7. Schritt-für-Schritt Timeline (4 Steps)
8. Signup Guide (GitHub + Google side-by-side)
9. Clone Box (git clone + Copy-Button)
10. CTA Section
11. Footer

**🍌 Banana-Theme:** Buttons, Icons und Backgrounds mit Banana-Elementen

## Schritt 8: CSS erstellen

Erstelle `welcome.css` basierend auf DkZ™ Design System v2:
- `--accent: #fa1e4e` (oder `#FFD700` für Banana-Theme)
- Glassmorphism, Dark Background, Inter + JetBrains Mono
- Responsive (768px Breakpoint)
- Podcast-Player Styles
- Lightbox Styles

## Schritt 9: JS erstellen

Erstelle `welcome.js` mit:
- Scroll-Reveal (IntersectionObserver)
- Showcase Slider (Auto-Rotation 6s)
- Podcast Player (Play/Pause, Progress-Seek, Zeitanzeige)
- Lightbox für Infografiken
- Hero Canvas Partikel
- Copy-to-Clipboard für Clone-Box
- Mobile Hamburger Menu

## Schritt 10: Browser-Test

Öffne die Seite im Browser und prüfe:
- [ ] Alle Sektionen sichtbar
- [ ] Showcase-Slider rotiert
- [ ] Podcast Play-Button funktioniert
- [ ] Lightbox öffnet/schließt
- [ ] Navigation scrollt korrekt
- [ ] Mobile-responsive

## Schritt 11: Git Commit

```bash
git add -A
git commit -m "feat(frontpage): welcome page mit podcasts, infografiken und signup-guide"
```

## Schritt 12: Dokumentation

- Antigravity-Artefakt erstellen (Walkthrough)
- Playbook §-Eintrag ergänzen
- ORDNER.ini aktualisieren

---

## Referenz-Dateien

| Datei | Pfad |
|:------|:-----|
| Skill | `.agents/skills/frontpage-builder/SKILL.md` |
| Referenz-HTML | `01_PROJECTS/10_devkitz-eu/welcome.html` |
| Referenz-CSS | `01_PROJECTS/10_devkitz-eu/welcome.css` |
| Referenz-JS | `01_PROJECTS/10_devkitz-eu/welcome.js` |
| NLM Mind Maps | `02_RESEARCH/notebooklm/` |
| Podcasts | `02_RESEARCH/01_podcasts/` |

---

*Workflow erstellt: 2026-04-02*
