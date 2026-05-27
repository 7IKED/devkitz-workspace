---
description: NotebookLM MCP Server verwenden — Notebooks, Quellen, Podcasts, Videos, Mind Maps generieren
---

# /notebooklm — NotebookLM Workflow

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Quick Commands
```bash
# Notebook erstellen
nlm notebook create "DkZ - [THEMA]"

# Source hochladen (NUR .md/.pdf/.txt!)
nlm source add [NB-ID] --file "/tmp/source.md" --wait

# Podcast generieren (Deutsch!)
nlm audio create [NB-ID] --language de --confirm

# Slides erstellen
nlm slides create [NB-ID] --confirm

# Infographic (2-3 Versuche nötig)
nlm infographic create [NB-ID] --orientation landscape --style professional --confirm

# Video (Deutsch!)
nlm video create [NB-ID] --language de --confirm

# Mind Map
nlm mind-map create [NB-ID] --confirm

# Timeline
nlm timeline create [NB-ID] --confirm

# Briefing
nlm briefing create [NB-ID] --confirm

# Study Guide
nlm study-guide create [NB-ID] --confirm

# Status prüfen
nlm studio status [NB-ID]

# Downloads
nlm download audio [NB-ID] --output "podcast.wav"
nlm download slide-deck [NB-ID] --output "slides.pdf"
nlm download infographic [NB-ID] --output "infographic.png"
nlm download video [NB-ID] --output "video.mp4"
nlm download mind-map [NB-ID] --output "mindmap.json"
```

## Regeln
- **IMMER `--language de`** für Audio/Video
- **Source-Dateien:** NUR .md, .pdf, .txt — KEINE .js/.json/.css!
- **Aussprache:** "D.k.Z." (Punkt nach jedem Buchstaben)
- **Infographic** scheitert manchmal → 2-3x versuchen
- **Download-Bindestriche:** `slide-deck`, `mind-map`, `study-guide`
- **Ordner:** `$env:USERPROFILE\Downloads\DKZ-[Thema]-Content\`

## Source-Template
```markdown
# [THEMA] — DkZ Content

## Was ist [THEMA]?
[Erklärung in 3-5 Sätzen]

## Kernfunktionen
1. [Feature A] — [Beschreibung]
2. [Feature B] — [Beschreibung]
3. [Feature C] — [Beschreibung]

## Zahlen & Fakten
- [Metrik 1]: [Wert]
- [Metrik 2]: [Wert]

## Nutzen
- Für Entwickler: [...]
- Für Teams: [...]
- Für Unternehmen: [...]
```
