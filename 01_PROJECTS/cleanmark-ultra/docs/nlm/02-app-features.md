# CleanMark Ultra™ — App-Feature-Set

> Schritt 2: Detailliertes Feature-Set fuer Kunden-Praesentation
> Stand: 2026-05-31

---

## Kern-Pipeline: Ingest → Detect → Map → Remove → Verify → Export

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  INGEST  │───▶│  DETECT  │───▶│   MAP    │───▶│  REMOVE  │───▶│  VERIFY  │───▶│  EXPORT  │
│          │    │          │    │          │    │          │    │          │    │          │
│ Datei    │    │ AI-Scan  │    │ Detection│    │ AI-      │    │ Re-Scan  │    │ Saubere  │
│ einlesen │    │ Pattern  │    │ Map mit  │    │ Inpaint  │    │ 0 Funde  │    │ Datei    │
│ Format   │    │ Frequency│    │ Typ+Pos  │    │ Filter   │    │ = Clean  │    │ ohne WM  │
│ erkennen │    │ Metadata │    │ +Konfid. │    │ Strip    │    │ Zertif.  │    │ + Report │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## Feature-Katalog

### F1 — Automatische Multi-Layer Detection

| Sub-Feature | Beschreibung | Prioritaet |
|:------------|:-------------|:-----------|
| F1.1 Visible WM Detection | YOLO-basierte Logo-/Text-Erkennung + OCR (Tesseract/PaddleOCR) | P0 |
| F1.2 Invisible Spatial Detection | LSB-Analyse, Chi-Square, RS-Steganalyse, PVD-Histogram | P0 |
| F1.3 Invisible Frequency Detection | DCT/DWT/FFT-Koeffizienten-Analyse, Anomalie-Erkennung | P0 |
| F1.4 Neural WM Detection | Trainierte Classifier fuer SynthID, Stable Signature, HiDDeN-Patterns | P1 |
| F1.5 Audio WM Detection | Spektrogramm-Analyse >18kHz, Phase-Kohaerenz, Cepstrum, Multi-Band ML | P0 |
| F1.6 Metadata Scan | EXIF, XMP, IPTC, ID3, C2PA, PNG-Chunks, MP4-Atoms vollstaendig auslesen | P0 |
| F1.7 Pattern-DB Matching | Regex + Hash-Templates aus watermarks.patterns gegen Assets pruefen | P0 |
| F1.8 Perceptual Hash Check | pHash/dHash gegen bekannte WM-Logo-Datenbank | P1 |
| F1.9 Video Temporal Analysis | Frame-uebergreifende WM-Konsistenz-Analyse | P1 |
| F1.10 Beat-Loop Frequency Map | Multi-Band-Analyse fuer verschachtelte Audio-WM in Loops | P1 |

---

### F2 — Intelligente Removal Engine

| Sub-Feature | Beschreibung | Prioritaet |
|:------------|:-------------|:-----------|
| F2.1 AI-Inpainting (Bilder) | LaMa + Dual-Branch U-Net fuer sichtbare WM-Entfernung | P0 |
| F2.2 AI-Inpainting (Video) | Temporal-konsistentes Frame-Inpainting, kein Flicker | P0 |
| F2.3 Frequency-Domain Cleaning | DCT/DWT-Koeffizienten-Normalisierung, Spectral Gating | P0 |
| F2.4 LSB Randomization | Bit-Plane-Neuverteilung zum Zerstoeren von LSB-Steganographie | P0 |
| F2.5 Audio Spectral Gating | Bandpass + Notch-Filter fuer unhoerbare Frequenz-WM | P0 |
| F2.6 Phase Normalization | Phasen-Reset fuer Phase-Coding-basierte Audio-WM | P0 |
| F2.7 Neural WM Neutralization | Diffusions-Re-Noising + Autoencoder-Passage fuer SynthID/Stable Sig | P1 |
| F2.8 Metadata Strip (Total) | ALLE Container-Metadata auf NULL — kein einziger Tag bleibt | P0 |
| F2.9 Regeneration Engine | Komplette Bild-/Audio-Regeneration via Diffusion/VAE als letzte Stufe | P2 |
| F2.10 Quality Preservation | PSNR >40dB, SSIM >0.98, PESQ >4.0 als Mindest-Schwellen | P0 |

---

### F3 — Pattern-System (watermarks.patterns)

| Sub-Feature | Beschreibung | Prioritaet |
|:------------|:-------------|:-----------|
| F3.1 Built-in Pattern Library | 200+ vordefinierte Patterns (Firmen, Apps, Plattformen) | P0 |
| F3.2 Regex Text Patterns | Firmennamen, Copyright-Texte, App-Namen als Regex | P0 |
| F3.3 Logo Hash Templates | pHash/dHash-Werte bekannter Wasserzeichen-Logos | P0 |
| F3.4 Frequency Signatures | Spektrale Fingerprints bekannter Audio-/Bild-WM | P1 |
| F3.5 Custom Pattern Editor | GUI zum Erstellen eigener Patterns (Regex + Bild + Audio) | P1 |
| F3.6 Pattern Import/Export | .patterns-Dateien teilen, Community-Patterns laden | P1 |
| F3.7 Auto-Learn Patterns | ML-basiertes Lernen neuer WM-Patterns aus Beispielen | P2 |
| F3.8 Pattern Versioning | Versionierte Pattern-Updates, Changelog | P2 |

---

### F4 — Batch-Verarbeitung

| Sub-Feature | Beschreibung | Prioritaet |
|:------------|:-------------|:-----------|
| F4.1 Drag & Drop Batch | Ordner/Dateien per Drag & Drop, automatische Typ-Erkennung | P0 |
| F4.2 Queue Management | Warteschlange mit Prioritaeten, Pause/Resume | P0 |
| F4.3 Parallel Processing | Multi-Thread/GPU-beschleunigte Parallelverarbeitung | P1 |
| F4.4 Preset Profiles | Gespeicherte Konfig-Profile (z.B. „Stock-Foto-Clean", „Audio-Full-Strip") | P1 |
| F4.5 Batch Report | CSV/JSON-Report ueber alle verarbeiteten Dateien | P0 |
| F4.6 Watch Folder | Ordner-Ueberwachung: neue Dateien automatisch verarbeiten | P2 |

---

### F5 — Preview & Vergleich

| Sub-Feature | Beschreibung | Prioritaet |
|:------------|:-------------|:-----------|
| F5.1 Side-by-Side Preview | Original vs. bereinigt nebeneinander | P0 |
| F5.2 Overlay-Slider | Interaktiver Slider: links Original, rechts bereinigt | P0 |
| F5.3 Detection Heatmap | Visuelle Karte aller gefundenen WM-Positionen | P1 |
| F5.4 Audio Waveform Diff | Wellenform-Vergleich Original vs. bereinigt | P0 |
| F5.5 Spektrogramm View | Audio-Spektrogramm vor/nach mit Highlight der entfernten Frequenzen | P1 |
| F5.6 Zoom & Pan | Pixelgenauer Vergleich fuer Bilder | P0 |
| F5.7 Video Scrubber | Frame-genauer Video-Vergleich mit Sync-Playback | P1 |

---

### F6 — Qualitaetssicherung

| Sub-Feature | Beschreibung | Prioritaet |
|:------------|:-------------|:-----------|
| F6.1 Post-Removal Verification | Automatischer Re-Scan nach Bereinigung = 0 Funde = Clean-Zertifikat | P0 |
| F6.2 Quality Metrics | PSNR, SSIM (Bild), PESQ, ViSQOL (Audio), VMAF (Video) anzeigen | P0 |
| F6.3 Clean Certificate | Exportierbares JSON/PDF-Zertifikat: „Asset wurde verifiziert sauber" | P1 |
| F6.4 Regression Check | Bei Pattern-Updates: alte Assets re-scannen, neue Funde melden | P2 |

---

### F7 — Undo & Versioning

| Sub-Feature | Beschreibung | Prioritaet |
|:------------|:-------------|:-----------|
| F7.1 Original Backup | Original-Datei IMMER behalten, nie ueberschreiben | P0 |
| F7.2 Step-by-Step Undo | Jeder Removal-Schritt einzeln rueckgaengig machbar | P1 |
| F7.3 Version History | Timeline aller Bearbeitungen pro Asset | P2 |
| F7.4 A/B Comparison | Verschiedene Removal-Strategien vergleichen | P2 |

---

### F8 — Branding-Management

| Sub-Feature | Beschreibung | Prioritaet |
|:------------|:-------------|:-----------|
| F8.1 Branding Removal | Altes Branding komplett entfernen (Logos, Text, Metadata) | P0 |
| F8.2 Neutral Re-Branding | Optional: neues neutrales Branding anwenden (eigenes Logo, Copyright) | P2 |
| F8.3 White-Label Export | Export ohne jede Herkunftskennung — ready for enterprise rebranding | P0 |

---

### F9 — Sicherheit & Datenschutz

| Sub-Feature | Beschreibung | Prioritaet |
|:------------|:-------------|:-----------|
| F9.1 Local-First Processing | ALLE Verarbeitung lokal, KEIN Upload zu Cloud-Diensten | P0 |
| F9.2 Encrypted Storage | Lokale DB mit AES-256 (SQLCipher) fuer User-Presets und History | P0 |
| F9.3 GDPR Compliance | Keine Telemetrie ohne Opt-in, Recht auf Loeschung, Datenexport | P0 |
| F9.4 Secure Temp Files | Temporaere Dateien verschluesselt, nach Verarbeitung sicher geloescht | P1 |
| F9.5 Air-Gap Mode | Vollstaendig offline-faehig, keine Netzwerkverbindung noetig | P1 |

---

### F10 — Export & Integration

| Sub-Feature | Beschreibung | Prioritaet |
|:------------|:-------------|:-----------|
| F10.1 Format Preservation | Export im Originalformat ohne Qualitaetsverlust | P0 |
| F10.2 Format Conversion | Optionale Konvertierung (z.B. TIFF→PNG, WAV→FLAC) | P1 |
| F10.3 CLI Interface | Kommandozeile fuer Automatisierung und Scripting | P1 |
| F10.4 REST API | HTTP-API fuer Cloud-Deployment und Integration | P2 |
| F10.5 DAM Integration | Anbindung an Digital Asset Management Systeme | P2 |
| F10.6 Webhook Notifications | Status-Updates per Webhook nach Batch-Verarbeitung | P2 |

---

## Unterstuetzte Formate

### Bilder
| Format | Extension | Metadata | Hinweise |
|:-------|:----------|:---------|:---------|
| JPEG | .jpg, .jpeg | EXIF, XMP, IPTC | Haupt-Zielformat, DCT-WM relevant |
| PNG | .png | tEXt, iTXt, zTXt | AI-Workflow-JSON in Chunks |
| TIFF | .tiff, .tif | EXIF, XMP | Professionelle Fotografie |
| WebP | .webp | XMP | Google-Format |
| HEIC/HEIF | .heic, .heif | EXIF | Apple-Format |
| BMP | .bmp | Minimal | LSB-Steganographie-Ziel |
| GIF | .gif | Comment | Animiert + statisch |
| SVG | .svg | XML | Text-basiert, Regex-relevant |
| RAW | .cr2, .nef, .arw | EXIF, MakerNotes | Kamera-RAW |
| PSD | .psd | XMP, Layer-Names | Adobe Photoshop |

### Video
| Format | Extension | Metadata | Hinweise |
|:-------|:----------|:---------|:---------|
| MP4 | .mp4 | MP4 Atoms | H.264/H.265/AV1 |
| MOV | .mov | QuickTime Atoms | Apple ProRes |
| AVI | .avi | RIFF Info | Legacy |
| MKV | .mkv | Matroska Tags | Container-agnostisch |
| WebM | .webm | Matroska Tags | VP9/AV1 |
| FLV | .flv | Minimal | Flash Video (Legacy) |

### Audio
| Format | Extension | Metadata | Hinweise |
|:-------|:----------|:---------|:---------|
| WAV | .wav | BWF, RIFF Info | Unkomprimiert, Beat-Loops |
| MP3 | .mp3 | ID3v1, ID3v2 | Haupt-Ziel, Suno/Udio Output |
| FLAC | .flac | Vorbis Comments | Verlustfrei |
| AAC | .aac, .m4a | MP4 Atoms | Apple Music |
| OGG | .ogg | Vorbis Comments | Open Source |
| AIFF | .aiff | AIFF Chunks | Apple Pro Audio |
| OPUS | .opus | Vorbis Comments | Moderner Codec |
| STEM | .stem.mp4 | Native Instruments | Multi-Track Beat-Loops |

---

## Prioritaets-Roadmap

```
Phase 1 (MVP — 3 Monate):
  P0-Features: Detection + Removal + Metadata Strip + Batch + Preview + Quality

Phase 2 (Feature-Complete — 3 Monate):
  P1-Features: Neural WM, Pattern Editor, CLI, Spectrogramm, Clean Certificate

Phase 3 (Enterprise — 3 Monate):
  P2-Features: API, DAM Integration, Auto-Learn, Watch Folder, Re-Branding
```
