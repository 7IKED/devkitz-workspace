---
description: NLM Batch Content-Generierung — Alle Content-Typen für ein Thema auf einmal erstellen
---

# /nlm-batch-content — Vollständige NLM Content-Pipeline

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Komplette 7-Asset Pipeline pro Thema

### Schritt 1: Source-Datei erstellen
```markdown
# /tmp/nlm-src-[thema].md
# Struktur: Was? → Warum? → Zahlen → Nutzen → Einzigartigkeit
# 80-120 Zeilen, NUR Markdown
```

### Schritt 2: Notebook + Upload
```bash
nlm notebook create "DkZ - [THEMA]"
nlm source add [NB] --file "/tmp/nlm-src-[thema].md" --wait
```

### Schritt 3: Alle 7 Content-Typen
```bash
# 1. Podcast (DE)
nlm audio create [NB] --language de --confirm
# 2. Slides
nlm slides create [NB] --confirm
# 3. Infographic
nlm infographic create [NB] --orientation landscape --style professional --confirm
# 4. Video (DE)
nlm video create [NB] --language de --confirm
# 5. Mind Map
nlm mind-map create [NB] --confirm
# 6. Briefing
nlm briefing create [NB] --confirm
# 7. Study Guide
nlm study-guide create [NB] --confirm
```

### Schritt 4: Download (alle auf einmal)
```powershell
$OUT = "$env:USERPROFILE\Downloads\DKZ-[Thema]-Content"
mkdir -Force $OUT
nlm download audio      [NB] --output "$OUT/podcast-DE.wav"
nlm download slide-deck [NB] --output "$OUT/slides.pdf"
nlm download infographic [NB] --output "$OUT/infographic.png"
nlm download video      [NB] --output "$OUT/video-DE.mp4"
nlm download mind-map   [NB] --output "$OUT/mindmap.json"
nlm download briefing   [NB] --output "$OUT/briefing.pdf"
nlm download study-guide [NB] --output "$OUT/study-guide.pdf"
```

### Schritt 5: ZIP auf Desktop
```powershell
Compress-Archive -Path $OUT -DestinationPath "$env:USERPROFILE\Desktop\DKZ-[Thema]-Content.zip"
```
