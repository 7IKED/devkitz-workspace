# DkZ™ Brand Guidelines

> Branding-Regeln für alle generierten Medien und Inhalte · Stand: 2026-03-23

---

## 🎯 Markenname

| Kontext | Name | Verwendung |
|:--------|:-----|:-----------|
| Offiziell (Vollständig) | DEVKiTZ™ | README, Impressum, About-Seite, rechtliche Dokumente |
| Branded Content | **DkZ** | Podcasts, Videos, Infografiken, Slides, Social Media, Beiträge |
| Code/Technik | `dkz-` | Dateinamen, CSS-Klassen, JS-Variablen, CLI-Befehle |
| Intern/Kurz | DkZ™ | Interne Dokumente, Agent-Kommunikation |

### Regel R33 — Branding in Medien (PFLICHT)

- **Audio (WAV/MP3):** Immer **DkZ** als Marke, nie "DEVKiTZ"
- **Video (MP4/WebM):** Immer **DkZ** als Marke, nie "DEVKiTZ"
- **Präsentationen (PDF/PPTX):** **DkZ** in Titelfolie und Footer
- **Infografiken (PNG):** **DkZ** Logo/Watermark
- **Social Media:** **DkZ** als Handle/Tag
- **NotebookLM Content:** Notebooks mit "DkZ - [Thema]" benennen

---

## 🎨 Visuelle Identität

### Farben

| Farbe | HEX | CSS Variable | Verwendung |
|:------|:----|:-------------|:-----------|
| DkZ Rot | `#fa1e4e` | `--accent` | Hauptakzent, CTAs, Highlights |
| Background | `#060608` | `--bg` | Hintergrund |
| Grün | `#00ff88` | `--green` | Status OK, Erfolg |
| Gelb | `#ffb800` | `--yellow` | Warnung, Degraded |
| Rot | `#ff3b5c` | `--red` | Fehler, Offline |
| Blau | `#3b82f6` | `--blue` | Info, Links |

### Fonts

| Font | Verwendung |
|:-----|:-----------|
| Inter | UI-Texte, Überschriften, Body |
| JetBrains Mono | Code, Terminal, Monospace |

### Logo-Elemente

- **Icon:** ⚡ (Blitz) — System-Identität
- **Tagline:** "Vanilla Developer Ecosystem"
- **Slogan:** "Build. Ship. Scale. — Pure Vanilla."

---

## 🌍 Sprache

| Kontext | Sprache | Regel |
|:--------|:--------|:------|
| **Standard** | 🇩🇪 Deutsch | IMMER Deutsch, außer explizit anders gewünscht |
| Alternative | 🇬🇧 Englisch | NUR wenn 777 explizit "English" sagt |
| Code-Kommentare | 🇩🇪 Deutsch | Deutsche Kommentare bevorzugt |
| Git Commits | 🇩🇪/🇬🇧 Mix | `feat(bereich): beschreibung` — Deutsch bevorzugt |
| NotebookLM | 🇩🇪 Deutsch | `--language de` IMMER setzen |

### NLM Sprach-Befehl (PFLICHT)

```bash
# RICHTIG — Deutsch als Standard
nlm audio create ID --language de

# NUR bei expliziter Anforderung
nlm audio create ID --language en
```

---

## 📁 Medien-Ordnerstruktur (pro Modul/Projekt)

```
modul-ordner/
├── Vorschau/              ← Browser-Test Videos + Clips
│   ├── clips/             ← Kurze GIF/WebP Clips
│   ├── screenshots/       ← Test-Screenshots + Metadata
│   └── recordings/        ← Vollständige Test-Recordings (WebP)
├── assets/                ← Statische Assets (Bilder, Icons)
├── docs/                  ← Dokumentation, Research
│   ├── research/          ← Deep Dive Daten, Gedanken
│   ├── chatlog/           ← Projekt-Chatlog Sicherungen
│   └── metadata/          ← JSON Metadaten zu Screenshots/Videos
└── features.json          ← Feature-Registry
```

### Vorschau-Pflicht (R34 — bei JEDEM Chat-Ende)

1. **Browser-Test** als Benutzer durchführen
2. **Video speichern** in `Vorschau/recordings/`
3. **Screenshots** in `Vorschau/screenshots/`
4. **Clips** (GIF/WebP) in `Vorschau/clips/`
5. **Metadata** (JSON) in `docs/metadata/`
6. **Alles sichern** in WissenHub + System Log Archive

### Sicherungs-Kategorien (für übersichtlichen Workflow)

| Kategorie | Inhalt | Pfad |
|:----------|:-------|:-----|
| 📹 Vorschau | Test-Videos, Clips, Screenshots | `Vorschau/` |
| 📋 Docs | Research, Deep Dives, Chatlog | `docs/` |
| 🧠 Gedanken | Agent-Überlegungen, Entscheidungen | `docs/research/` |
| 📊 Metadata | JSON zu jedem Medien-Asset | `docs/metadata/` |
| 📦 Archiv | Vollständige Sicherung | WissenHub + Log Archive |

---

## 📦 Dreifach-Sicherung (erweitert)

```
Medien/Content erstellt
     │
     ├──→ 1. Projekt-Ordner (Vorschau/clips/screenshots)
     │
     ├──→ 2. WissenHub (Iceberg)
     │       archive/[rubrik]/ + catalog.json
     │
     ├──→ 3. System Log Archive
     │       04_SYSTEM/ oder 99_ARCHIVE/
     │
     └──→ 4. GitHub (via Git Commit)
             Versioniert und nachvollziehbar
```

---

*DkZ™ — Build. Ship. Scale. — Pure Vanilla.*
