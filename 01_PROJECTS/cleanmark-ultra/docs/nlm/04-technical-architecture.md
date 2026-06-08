# CleanMark Ultra™ — Technische Architektur

> Schritt 4: Architektur-Diagramm + Tech-Stack + Plugin-System
> Stand: 2026-05-31

---

## System-Architektur (Text-Diagramm)

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        CleanMark Ultra™ — System                             ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │                         PRESENTATION LAYER                              │  ║
║  │                                                                         │  ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  ║
║  │  │   Desktop    │  │    Mobile    │  │     CLI      │  │  REST API  │  │  ║
║  │  │   Tauri 2    │  │   Flutter    │  │   Python     │  │  FastAPI   │  │  ║
║  │  │   WebView    │  │   Dart       │  │   Click/     │  │  Uvicorn   │  │  ║
║  │  │   + Rust     │  │   + FFI      │  │   Typer      │  │            │  │  ║
║  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │  ║
║  │         │                 │                 │                │          │  ║
║  └─────────┼─────────────────┼─────────────────┼────────────────┼──────────┘  ║
║            │                 │                 │                │             ║
║            ▼                 ▼                 ▼                ▼             ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │                      CORE ENGINE (Python/Rust)                          │  ║
║  │                                                                         │  ║
║  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │  ║
║  │  │  Ingestion  │  │  Detection  │  │   Removal   │  │ Verification │  │  ║
║  │  │  Manager    │  │   Engine    │  │   Engine    │  │    Engine    │  │  ║
║  │  │             │  │             │  │             │  │              │  │  ║
║  │  │ • Format    │  │ • Multi-    │  │ • AI-       │  │ • Re-Scan    │  │  ║
║  │  │   Detection │  │   Layer     │  │   Inpaint   │  │ • Quality    │  │  ║
║  │  │ • Decode    │  │   Scan      │  │ • Freq-     │  │   Metrics    │  │  ║
║  │  │ • Metadata  │  │ • Pattern   │  │   Filter    │  │ • Clean      │  │  ║
║  │  │   Extract   │  │   Match     │  │ • Metadata  │  │   Certif.    │  │  ║
║  │  │ • Queue     │  │ • AI Model  │  │   Strip     │  │ • Diff       │  │  ║
║  │  │             │  │   Inference │  │ • Neural    │  │   Report     │  │  ║
║  │  │             │  │ • Heatmap   │  │   Neutral.  │  │              │  │  ║
║  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘  │  ║
║  └─────────┼────────────────┼────────────────┼────────────────┼───────────┘  ║
║            │                │                │                │              ║
║            ▼                ▼                ▼                ▼              ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │                         PLUGIN LAYER                                    │  ║
║  │                                                                         │  ║
║  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │  ║
║  │  │ Visible  │ │ Spatial  │ │Frequency │ │  Neural  │ │   Audio      │ │  ║
║  │  │ WM       │ │ WM       │ │ WM       │ │ WM       │ │   WM         │ │  ║
║  │  │ Plugin   │ │ Plugin   │ │ Plugin   │ │ Plugin   │ │   Plugin     │ │  ║
║  │  │          │ │          │ │          │ │          │ │              │ │  ║
║  │  │ YOLO     │ │ LSB      │ │ DCT      │ │ SynthID  │ │ Spectral    │ │  ║
║  │  │ OCR      │ │ PVD      │ │ DWT      │ │ StableSig│ │ Phase       │ │  ║
║  │  │ Template │ │ Histogram│ │ FFT      │ │ HiDDeN   │ │ Echo        │ │  ║
║  │  │ Inpaint  │ │ SpreadSp │ │ SVD      │ │ TreeRing │ │ Cinavia     │ │  ║
║  │  │          │ │          │ │          │ │ AudioSeal│ │ BeatLoop    │ │  ║
║  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │  ║
║  │                                                                         │  ║
║  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │  ║
║  │  │ Metadata │ │ Video    │ │ Pattern  │ │ Regen    │ │   Custom     │ │  ║
║  │  │ Strip    │ │ Temporal │ │ Matcher  │ │ Engine   │ │   (User)     │ │  ║
║  │  │ Plugin   │ │ Plugin   │ │ Plugin   │ │ Plugin   │ │   Plugins    │ │  ║
║  │  │          │ │          │ │          │ │          │ │              │ │  ║
║  │  │ EXIF     │ │ Frame-   │ │ Regex    │ │ Diffusion│ │ WASM/Python  │ │  ║
║  │  │ XMP      │ │ Consist  │ │ Hash     │ │ VAE      │ │ Sandboxed    │ │  ║
║  │  │ ID3/C2PA │ │ Flicker  │ │ Freq-Sig │ │ GAN      │ │ Hot-Reload   │ │  ║
║  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │                       DATA / STORAGE LAYER                              │  ║
║  │                                                                         │  ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  ║
║  │  │  Pattern DB  │  │  User Store  │  │  Model Cache │  │   Temp     │  │  ║
║  │  │  SQLite      │  │  SQLCipher   │  │  ONNX Models │  │   Secure   │  │  ║
║  │  │  watermarks  │  │  AES-256     │  │  GPU Cache   │  │   /tmp     │  │  ║
║  │  │  .patterns   │  │  Presets     │  │  Quantized   │  │   Encrypt  │  │  ║
║  │  │  Community   │  │  History     │  │  CUDA/Metal  │  │   Shred    │  │  ║
║  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │                      EXTERNAL LIBRARIES                                 │  ║
║  │                                                                         │  ║
║  │  FFmpeg · OpenCV · PyTorch/ONNX · ExifTool · mat2 · librosa · scipy    │  ║
║  │  Pillow · mutagen · c2patool · pngcrush · Tesseract · PaddleOCR        │  ║
║  │  ultralytics(YOLO) · LaMa · DnCNN · BM3D · ffprobe                    │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## Tech-Stack Empfehlung

### Desktop (Primaer-Plattform)

| Komponente | Empfehlung | Begruendung |
|:-----------|:-----------|:------------|
| **Framework** | **Tauri 2.x** | 30-80 MB RAM (vs. 150-400 MB Electron), <1s Startup, Rust-Backend fuer GPU-nahe Medienverarbeitung, Mobile-Support via Tauri Mobile |
| **Backend** | **Rust + Python FFI** | Rust fuer I/O, Queue, Plugin-Management. Python (PyO3) fuer ML-Modelle und FFmpeg-Wrapper |
| **UI** | **Vanilla HTML/CSS/JS** (DkZ Design System) | Kein React/Vue — direkte WebView-Kontrolle, schneller, kein Build-Step. Alternative: Svelte fuer komplexere UI |
| **ML Runtime** | **ONNX Runtime** | Cross-Platform, GPU-beschleunigt (CUDA/DirectML/CoreML), Modelle von PyTorch exportiert |
| **Video** | **FFmpeg** (via ffmpeg-next Rust Crate) | Industrie-Standard, alle Codecs, Metadata-Strip, Frame-Extraction |
| **Audio** | **librosa + scipy** (Python) | Spektralanalyse, STFT, Phase-Analyse. Rust: rodio/symphonia fuer I/O |
| **Bilder** | **OpenCV** (via opencv-rust) + **Pillow** (Python) | Template Matching, Inpainting, Farbanalyse |
| **OCR** | **PaddleOCR** oder **Tesseract** | Text-Erkennung in Wasserzeichen |
| **Object Detection** | **YOLOv8/v11** (Ultralytics) | Logo-Erkennung, Wasserzeichen-Lokalisierung |
| **Inpainting** | **LaMa** (Large Mask Inpainting) | SOTA fuer grosse Masken, keine Artefakte |
| **Metadata** | **ExifTool** + **mat2** + **mutagen** | Umfassendstes Toolset fuer alle Formate |
| **Datenbank** | **SQLCipher** (verschluesseltes SQLite) | AES-256, GDPR-konform, keine Cloud noetig |

---

### Mobile

| Komponente | Empfehlung | Begruendung |
|:-----------|:-----------|:------------|
| **Framework** | **Tauri Mobile** oder **Flutter** | Tauri Mobile fuer Code-Sharing mit Desktop. Flutter fuer native Performance wenn separat |
| **ML** | **ONNX Runtime Mobile** / **TFLite** | Quantisierte Modelle fuer On-Device Inference |
| **Processing** | **FFmpeg Mobile** (via ffmpegkit) | Bewaehterer Wrapper fuer iOS/Android |

---

### Cloud/API

| Komponente | Empfehlung | Begruendung |
|:-----------|:-----------|:------------|
| **API** | **FastAPI** (Python) | Async, schnell, Auto-Docs (OpenAPI), ML-freundlich |
| **Worker** | **Celery** + **Redis** | Async Task-Queue fuer Batch-Jobs |
| **GPU** | **NVIDIA A10G/T4** (Cloud) | ONNX Runtime CUDA fuer Inference |
| **Storage** | **MinIO** (S3-kompatibel, self-hosted) | Kein AWS-Zwang, lokal deploybar |
| **Container** | **Docker** + **Docker Compose** | Reproduzierbare Deployments |

---

## Plugin-System Architektur

```
┌────────────────────────────────────────────────────────┐
│                    Plugin Manager                       │
│                                                        │
│  load_plugin(path) → Plugin Interface                  │
│  register_detector(plugin) → Detection Engine          │
│  register_remover(plugin) → Removal Engine             │
│  hot_reload(plugin_id) → Neustart ohne App-Restart     │
└────────────┬───────────────────────────────┬────────────┘
             │                               │
     ┌───────▼───────┐              ┌───────▼───────┐
     │ Built-in      │              │ Custom/User   │
     │ Plugins       │              │ Plugins       │
     │               │              │               │
     │ Python Module │              │ WASM Module   │
     │ in /plugins/  │              │ Sandboxed     │
     │               │              │               │
     │ Trusted       │              │ Restricted    │
     │ Full Access   │              │ API-only      │
     └───────────────┘              └───────────────┘
```

### Plugin Interface (Python)

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional
import numpy as np


@dataclass
class DetectionResult:
    """Ergebnis einer Wasserzeichen-Detektion."""
    watermark_type: str        # z.B. "visible_logo", "lsb_stego", "synthid"
    confidence: float          # 0.0 - 1.0
    location: Optional[dict]   # {"x": 10, "y": 20, "w": 200, "h": 50} oder None
    frequency_band: Optional[str]  # z.B. "19000-22000" fuer Audio
    metadata_key: Optional[str]    # z.B. "exif:GPS" fuer Metadata
    removal_strategy: str      # z.B. "inpaint", "freq_filter", "strip", "regenerate"
    details: dict              # Plugin-spezifische Details


class CleanMarkPlugin(ABC):
    """Basis-Interface fuer alle CleanMark Plugins."""

    @property
    @abstractmethod
    def plugin_id(self) -> str:
        """Eindeutige Plugin-ID, z.B. 'visible-logo-detector'."""

    @property
    @abstractmethod
    def plugin_version(self) -> str:
        """Semantic Version, z.B. '1.2.0'."""

    @property
    @abstractmethod
    def supported_domains(self) -> List[str]:
        """['image', 'video', 'audio', 'all']"""

    @abstractmethod
    def detect(self, media_data: np.ndarray, metadata: dict) -> List[DetectionResult]:
        """
        Analyse des Mediums auf Wasserzeichen.
        
        Args:
            media_data: Bild als HxWxC Array, Audio als 1D/2D Array
            metadata: Dict aller extrahierten Metadata
            
        Returns:
            Liste aller gefundenen Wasserzeichen
        """

    @abstractmethod
    def remove(self, media_data: np.ndarray, detections: List[DetectionResult]) -> np.ndarray:
        """
        Entfernung der detektierten Wasserzeichen.
        
        Args:
            media_data: Originale Mediendaten
            detections: Zuvor gefundene Wasserzeichen
            
        Returns:
            Bereinigte Mediendaten
        """

    def initialize(self, config: dict) -> None:
        """Optionale Initialisierung (Modelle laden, etc.)."""
        pass

    def cleanup(self) -> None:
        """Optionale Ressourcen-Freigabe."""
        pass
```

---

## Datenfluss-Diagramm

```
Nutzer gibt Datei(en)
        │
        ▼
┌──────────────┐
│ 1. INGEST    │  Format erkennen, Metadata extrahieren,
│              │  Datei in Memory/Stream laden
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 2. DETECT    │  Alle Plugins parallel ausfuehren:
│              │  • Visible: YOLO + OCR + Pattern Match
│              │  • Invisible: LSB + DCT + DWT + FFT
│              │  • Neural: ONNX Model Inference
│              │  • Audio: Spectral + Phase + Cepstrum
│              │  • Metadata: Full Tag Scan
│              │  • Pattern DB: Regex + Hash Matching
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 3. MAP       │  Detection Map erstellen:
│              │  Typ + Position + Konfidenz + Strategie
│              │  Priorisierung: Critical > High > Medium
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 4. PREVIEW   │  Dem Nutzer zeigen:
│              │  • Gefundene WM markiert
│              │  • Vorgeschlagene Aktionen
│              │  • Nutzer kann anpassen/bestaetigen
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 5. REMOVE    │  Sequentiell nach Typ:
│              │  a) Metadata Strip (schnellste, zuerst)
│              │  b) Sichtbare WM → AI Inpaint
│              │  c) Frequency-Domain → Filter + Normalize
│              │  d) Spatial → LSB Randomize + Denoise
│              │  e) Neural → Re-Noising/Autoencoder
│              │  f) Regeneration (optional, letzte Stufe)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 6. VERIFY    │  Vollstaendiger Re-Scan:
│              │  • ALLE Detektoren nochmal ausfuehren
│              │  • 0 Funde = CLEAN
│              │  • >0 Funde = zurueck zu Schritt 5
│              │  • Quality-Check: PSNR, SSIM, PESQ
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 7. EXPORT    │  Saubere Datei exportieren:
│              │  • Originalformat (default)
│              │  • Optional: Konvertierung
│              │  • Clean-Zertifikat (JSON/PDF)
│              │  • Batch-Report
└──────────────┘
```

---

## Skalierbarkeits-Matrix

| Dimension | Aktuell (v1) | Zukunft (v2+) |
|:----------|:-------------|:--------------|
| **Medientypen** | Bild, Video, Audio | + 3D-Modelle, VR/360°, PDF, Dokumente |
| **Pattern-DB** | 200+ Built-in | 1000+ Community, Auto-Learn |
| **Plugins** | 10 Built-in | Marketplace, WASM-Sandbox |
| **Processing** | Single GPU | Multi-GPU, Cluster, Cloud Scale-Out |
| **AI Models** | ONNX (quantized) | Custom Fine-Tuned, Continual Learning |
| **Formate** | 30+ Audio/Bild/Video | + USDZ, glTF, STEP, SVG, EPS |

---

## Sicherheits-Architektur

```
┌────────────────────────────────────────────────┐
│              SECURITY PERIMETER                 │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Air-Gap  │  │ Encrypt  │  │ Secure Temp  │ │
│  │ Mode     │  │ at Rest  │  │ Files        │ │
│  │          │  │          │  │              │ │
│  │ Kein     │  │ SQLCipher│  │ AES-256      │ │
│  │ Netzwerk │  │ AES-256  │  │ Verschlüss.  │ │
│  │ noetig   │  │ User DB  │  │ + Shred      │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ No Tele- │  │ WASM     │  │ GDPR         │ │
│  │ metry    │  │ Sandbox  │  │ Compliance   │ │
│  │          │  │          │  │              │ │
│  │ Opt-in   │  │ Custom   │  │ Recht auf    │ │
│  │ only     │  │ Plugins  │  │ Loeschung    │ │
│  │          │  │ isoliert │  │ Datenexport  │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
└────────────────────────────────────────────────┘
```
