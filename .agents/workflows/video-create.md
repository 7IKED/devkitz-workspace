---
description: Promotional Video/Content erstellen — Branding, Wettbewerbsanalyse, 4K Assets
---

# /video-create — Video & Branded Content Workflow

> **Kernregel:** Der passende und ordentlich eingetragene Workflow ist wichtiger als das Ergebnis.

## Wann verwenden?
- Werbevideos für Projekte/Kunden
- Branded Content (Infografiken, Präsentationen)
- Social Media Assets
- Landing Page Hero-Videos

## Workflow

### 1. Briefing erstellen
```markdown
## Video-Briefing
- **Projekt:** [Name]
- **Zielgruppe:** [Wer?]
- **Dauer:** [15-60 Sekunden]
- **Format:** [4K/1080p, Landscape/Portrait/Square]
- **Stil:** [Modern, Corporate, Playful, Premium]
- **Markenfarben:** [Hex-Codes]
- **Domain/URL:** [Anzuzeigen]
- **CTA:** [Was soll Zuschauer tun?]
- **QR-Code:** [Ja/Nein → wohin?]
```

### 2. Wettbewerbsanalyse
```markdown
# Vor dem Erstellen IMMER:
1. Top 5 Wettbewerber identifizieren
2. Deren Videos/Content analysieren
3. USP herausarbeiten — Was macht UNS besser?
4. Design-Inspiration sammeln
```

### 3. Brand-Assets vorbereiten
- Logo (transparent PNG, min. 512px)
- Farbpalette (Primary, Secondary, Accent)
- Fonts (Google Fonts Name)
- Bestehende Bilder/Screenshots
- QR-Code generieren (wenn nötig)

### 4. Content erstellen
```bash
# Option A: generate_image Tool
# Für statische Assets, Hero Images, Infografiken

# Option B: NLM Pipeline
# Für Videos, Podcasts, Slides
# → /nlm-batch Workflow verwenden

# Option C: HTML/CSS Animation
# Für Web-Animationen, exportierbar als Video
```

### 5. DkZ Design Regeln für Video
- Endscreen: **Markenname** groß + Domain
- QR-Code: Unten rechts, weiß auf transparent
- Farben: Brand-Palette, NICHT DkZ-Rot
- Audio: Klare Aussprache, DE bevorzugt
- Text: Kurz, max. 5-7 Wörter pro Szene

### 6. Output ablegen
```
Downloads/
└── [Projekt]-Content/
    ├── video-4k.mp4
    ├── hero-image.png
    ├── infographic.png
    ├── qr-code.png
    └── briefing.md
```

### 7. Git Commit (wenn Projekt-intern)
```bash
git add -A
git commit -m "feat(content): [projekt] branded video/content erstellt"
```
