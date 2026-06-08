# CleanMark Ultra™

> Universelle Desktop-/Mobile-/Cloud-App zur vollstaendigen Entfernung sichtbarer UND versteckter Wasserzeichen aus Videos, Fotos, Musik/Beat-Loops und Audio-Dateien.

---

## Mission

**Nach Verarbeitung bleibt KEIN EINZIGES Pixel, Sample, Metadata-Eintrag oder Fingerprint mehr erkennbar.** Ideal fuer den Verkauf von Assets an Unternehmen, die Material rebranding-frei ueberall einbinden.

---

## Projektstruktur

```
cleanmark-ultra/
├── CONTEXT.md                              ← Domain-Glossar
├── llms.txt                                ← LLM/NLM Entry-Point
├── README.md                               ← Diese Datei
├── docs/
│   ├── nlm/
│   │   ├── 01-watermark-history-timeline.md  ← Schritt 1: 70+ WM-Typen, 1954–2026
│   │   ├── 02-app-features.md                ← Schritt 2: 60+ Features
│   │   ├── 04-technical-architecture.md      ← Schritt 4: Architektur + Diagramme
│   │   └── 05-prototype-roadmap.md           ← Schritt 5: Roadmap + Code
│   ├── adr/                                  ← Architecture Decision Records
│   └── superpowers/                          ← Specs + Plans
├── patterns/
│   └── watermarks.patterns                   ← Schritt 3: 40+ Detection-Patterns
├── src/
│   ├── core/                                 ← Pipeline: Ingest→Detect→Remove→Verify→Export
│   ├── detectors/                            ← Visible, Spatial, Frequency, Neural, Audio, Metadata
│   ├── removers/                             ← Inpainting, Freq-Filter, Metadata-Strip, Audio-Clean
│   ├── plugins/                              ← Plugin-Interface (ABC)
│   └── ui/                                   ← Tauri Frontend (HTML/CSS/JS)
├── models/                                   ← ONNX-Modelle (LaMa, YOLO, SynthID Detector)
└── tests/                                    ← Pytest Test-Suite
```

---

## NLM-Repo Inhalt

| Dokument | Inhalt | Groesse |
|:---------|:-------|:--------|
| [01-watermark-history-timeline.md](docs/nlm/01-watermark-history-timeline.md) | Alle Watermark-Typen 1954–2026, 7 Kategorien (A–G), 70+ Eintraege, 10+ Angriffsmethoden | ~500 Zeilen |
| [02-app-features.md](docs/nlm/02-app-features.md) | 10 Feature-Gruppen (F1–F10), 60+ Sub-Features, Prioritaeten, 30+ Dateiformate | ~350 Zeilen |
| [watermarks.patterns](patterns/watermarks.patterns) | 40+ Patterns: Stock-Foto, Video-Apps, Copyright, AI-Plattformen, Audio-Frequenz, Metadata | ~350 Zeilen |
| [04-technical-architecture.md](docs/nlm/04-technical-architecture.md) | System-Diagramm, Tech-Stack (Tauri/Rust/Python), Plugin-Interface, Datenfluss, Sicherheit | ~400 Zeilen |
| [05-prototype-roadmap.md](docs/nlm/05-prototype-roadmap.md) | 3 Sprints, Code-Skizzen (Python), CLI-Interface, Dependencies, 10 naechste Schritte | ~400 Zeilen |
| [CONTEXT.md](CONTEXT.md) | Domain-Glossar, Watermark-Taxonomie, Systemkonzepte | ~120 Zeilen |

---

## Tech-Stack

| Komponente | Technologie |
|:-----------|:------------|
| Desktop | Tauri 2.x (Rust + WebView) |
| Mobile | Tauri Mobile / Flutter |
| Cloud API | FastAPI (Python) |
| CLI | Python + Typer |
| AI/ML | ONNX Runtime (GPU) |
| Video | FFmpeg |
| Audio | librosa + scipy |
| Bilder | OpenCV + Pillow |
| OCR | PaddleOCR |
| Object Detection | YOLOv8/v11 |
| Inpainting | LaMa (Large Mask) |
| Metadata | ExifTool + mat2 + mutagen |
| Datenbank | SQLCipher (verschluesselt) |

---

## Lizenz

Proprietaer — Kundenprojekt.

---

*Erstellt: 2026-05-31 · DEVKiTZ™ Antigravity Agent*
