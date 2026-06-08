# CleanMark Ultra™ — Prototyp-Roadmap & Code-Skizzen

> Schritt 5: Naechste Schritte fuer Prototyp-Entwicklung
> Stand: 2026-05-31

---

## Phase 1 — MVP Prototyp (Monat 1–3)

### Sprint 1: Core Detection Engine (Woche 1–4)

```
Ziel: Datei einlesen → Wasserzeichen finden → Report ausgeben
```

#### Task 1.1: Projekt-Setup

```bash
# Projekt-Struktur
cleanmark-ultra/
├── pyproject.toml           # Python Projekt-Config (uv/pip)
├── Cargo.toml               # Rust Workspace (Tauri Backend)
├── src/
│   ├── core/
│   │   ├── __init__.py
│   │   ├── ingestion.py     # Format-Erkennung + Laden
│   │   ├── detection.py     # Detection Engine Orchestrator
│   │   ├── removal.py       # Removal Engine Orchestrator
│   │   ├── verification.py  # Post-Removal Verification
│   │   └── export.py        # Saubere Datei exportieren
│   ├── detectors/
│   │   ├── __init__.py
│   │   ├── visible.py       # YOLO + OCR fuer sichtbare WM
│   │   ├── spatial.py       # LSB, PVD, Spread-Spectrum
│   │   ├── frequency.py     # DCT, DWT, FFT Analyse
│   │   ├── neural.py        # ONNX Model Inference
│   │   ├── audio.py         # Spektral, Phase, Cepstrum
│   │   ├── metadata.py      # EXIF/XMP/ID3/C2PA Scanner
│   │   └── pattern.py       # Regex/Hash Pattern Matcher
│   ├── removers/
│   │   ├── __init__.py
│   │   ├── inpainting.py    # LaMa + Dual-Branch U-Net
│   │   ├── freq_filter.py   # Frequency-Domain Cleaning
│   │   ├── metadata_strip.py # Vollstaendiger Metadata-Strip
│   │   ├── audio_clean.py   # Audio Spectral Gating + Phase Norm
│   │   └── neural_neutral.py # Neural WM Neutralisierung
│   ├── plugins/
│   │   ├── __init__.py
│   │   └── base.py          # Plugin Interface (ABC)
│   └── ui/                  # Tauri Frontend (HTML/CSS/JS)
├── patterns/
│   └── watermarks.patterns  # Pattern-Datenbank
├── models/                  # ONNX Modelle (Git LFS)
├── tests/
└── docs/
```

#### Task 1.2: Metadata-Detektor + Stripper (einfachster Einstieg)

```python
# src/detectors/metadata.py
"""Metadata-Detektor — scannt ALLE bekannten Metadata-Tags."""

import subprocess
import json
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Optional


@dataclass
class MetadataFinding:
    """Ein gefundener Metadata-Eintrag."""
    tag_group: str          # exif, xmp, iptc, id3, c2pa, png_chunk
    tag_name: str           # z.B. "GPS:GPSLatitude"
    tag_value: str          # Der Wert
    risk_level: str         # low, medium, high, critical
    recommendation: str     # strip, flag, keep


class MetadataDetector:
    """Vollstaendiger Metadata-Scanner fuer alle Formate."""

    # Tags die IMMER entfernt werden muessen
    CRITICAL_TAGS = {
        'GPS', 'GPSLatitude', 'GPSLongitude', 'GPSPosition',
        'Copyright', 'CopyrightNotice', 'Rights',
        'Creator', 'Artist', 'Author', 'By-line',
        'Software', 'ProcessingSoftware', 'CreatorTool',
        'SerialNumber', 'CameraSerialNumber', 'LensSerialNumber',
        'OwnerName', 'CameraOwnerName',
        'ImageUniqueID', 'DocumentID', 'InstanceID',
    }

    HIGH_RISK_PATTERNS = [
        'c2pa', 'contentcredentials', 'synthid',
        'prompt', 'workflow', 'sampler', 'cfg_scale',
        'checkpoint', 'lora', 'seed', 'negative_prompt',
    ]

    def scan(self, file_path: Path) -> List[MetadataFinding]:
        """Scannt eine Datei auf ALLE Metadata."""
        findings = []

        # ExifTool fuer umfassenden Scan
        try:
            result = subprocess.run(
                ['exiftool', '-json', '-G', '-s', str(file_path)],
                capture_output=True, text=True, timeout=30
            )
            if result.returncode == 0:
                data = json.loads(result.stdout)
                if data:
                    for key, value in data[0].items():
                        if key == 'SourceFile':
                            continue
                        finding = self._classify_tag(key, str(value))
                        if finding:
                            findings.append(finding)
        except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError):
            pass

        return findings

    def _classify_tag(self, tag: str, value: str) -> Optional[MetadataFinding]:
        """Klassifiziert einen Metadata-Tag nach Risiko."""
        group = tag.split(':')[0] if ':' in tag else 'unknown'
        name = tag.split(':')[-1] if ':' in tag else tag

        # Critical: GPS, Copyright, Serial Numbers
        if any(ct.lower() in name.lower() for ct in self.CRITICAL_TAGS):
            return MetadataFinding(group, name, value, 'critical', 'strip')

        # High: AI Workflow, C2PA
        if any(p in tag.lower() or p in value.lower() for p in self.HIGH_RISK_PATTERNS):
            return MetadataFinding(group, name, value, 'high', 'strip')

        # Medium: Software, Timestamps
        if group.lower() in ('exif', 'xmp', 'iptc', 'id3'):
            return MetadataFinding(group, name, value, 'medium', 'strip')

        return MetadataFinding(group, name, value, 'low', 'flag')


class MetadataStripper:
    """Entfernt ALLE Metadata aus einer Datei."""

    def strip_all(self, input_path: Path, output_path: Path) -> dict:
        """Entfernt saemtliche Metadata, gibt Report zurueck."""
        report = {'stripped_tags': 0, 'errors': []}

        try:
            # ExifTool: ALLE Tags entfernen
            result = subprocess.run(
                [
                    'exiftool',
                    '-all=',                    # Alle Standard-Tags
                    '-overwrite_original',
                    '-P',                       # Timestamps erhalten
                    str(input_path)
                ],
                capture_output=True, text=True, timeout=60
            )

            if '1 image files updated' in result.stdout:
                report['stripped_tags'] += 1

            # mat2: Zusaetzliche Bereinigung
            try:
                subprocess.run(
                    ['mat2', '--inplace', str(input_path)],
                    capture_output=True, timeout=60
                )
            except FileNotFoundError:
                pass  # mat2 optional

        except Exception as e:
            report['errors'].append(str(e))

        return report
```

---

#### Task 1.3: Pattern Matcher

```python
# src/detectors/pattern.py
"""Pattern Matcher — liest watermarks.patterns und matched gegen Assets."""

import re
from pathlib import Path
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Pattern:
    """Ein geladenes Pattern aus der .patterns Datei."""
    type: str
    id: str
    name: str
    domain: str
    method: str
    pattern: str
    confidence: float
    action: str
    severity: str
    notes: str


@dataclass
class PatternMatch:
    """Ein Treffer."""
    pattern: Pattern
    match_text: str
    confidence: float
    position: Optional[dict] = None


class PatternMatcher:
    """Laedt und matched watermarks.patterns gegen Medien."""

    def __init__(self, patterns_path: Path):
        self.patterns = self._load_patterns(patterns_path)

    def _load_patterns(self, path: Path) -> List[Pattern]:
        """Parst die .patterns Datei."""
        patterns = []
        current = {}

        for line in path.read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if line == '[pattern]':
                if current and 'id' in current:
                    patterns.append(Pattern(**current))
                current = {}
                continue
            if ':' in line:
                key, _, value = line.partition(':')
                key = key.strip()
                value = value.strip()
                if key == 'confidence':
                    value = float(value)
                current[key] = value

        if current and 'id' in current:
            patterns.append(Pattern(**current))

        return patterns

    def match_text(self, text: str, domain: str = 'all') -> List[PatternMatch]:
        """Matched Text (z.B. OCR-Output) gegen Regex-Patterns."""
        matches = []
        for p in self.patterns:
            if p.method != 'regex':
                continue
            if p.domain not in (domain, 'all'):
                continue
            try:
                m = re.search(p.pattern, text)
                if m:
                    matches.append(PatternMatch(
                        pattern=p,
                        match_text=m.group(0),
                        confidence=p.confidence
                    ))
            except re.error:
                continue
        return matches

    def match_metadata(self, metadata: dict, domain: str = 'all') -> List[PatternMatch]:
        """Matched Metadata-Werte gegen Patterns."""
        matches = []
        meta_text = ' '.join(str(v) for v in metadata.values())
        return self.match_text(meta_text, domain)

    def get_patterns_for_domain(self, domain: str) -> List[Pattern]:
        """Gibt alle Patterns fuer ein Medium zurueck."""
        return [p for p in self.patterns if p.domain in (domain, 'all')]
```

---

#### Task 1.4: Audio Frequency Detector (Skelett)

```python
# src/detectors/audio.py
"""Audio-spezifische Wasserzeichen-Detektion."""

import numpy as np
from typing import List, Optional

try:
    import librosa
    import scipy.signal as signal
except ImportError:
    librosa = None
    signal = None


@dataclass
class AudioWatermarkFinding:
    """Ein gefundenes Audio-Wasserzeichen."""
    type: str               # high_freq, mid_range, phase_shift, echo, neural
    frequency_band: str     # z.B. "19000-22000"
    confidence: float
    time_range: Optional[tuple]  # (start_sec, end_sec) oder None
    removal_strategy: str


class AudioWatermarkDetector:
    """Multi-Layer Audio-Wasserzeichen-Detektion."""

    def __init__(self, sr: int = 44100):
        self.sr = sr

    def detect_all(self, audio: np.ndarray) -> List[AudioWatermarkFinding]:
        """Fuehrt alle Audio-Detektoren aus."""
        findings = []
        findings.extend(self._detect_high_freq(audio))
        findings.extend(self._detect_phase_anomalies(audio))
        findings.extend(self._detect_echo_hiding(audio))
        return findings

    def _detect_high_freq(self, audio: np.ndarray) -> List[AudioWatermarkFinding]:
        """Erkennt unhoerbare Hochfrequenz-Marker (>18.5 kHz)."""
        if librosa is None:
            return []

        findings = []
        # STFT fuer Frequenzanalyse
        stft = librosa.stft(audio, n_fft=4096)
        magnitude = np.abs(stft)

        # Frequenz-Bins ueber 18.5 kHz
        freqs = librosa.fft_frequencies(sr=self.sr, n_fft=4096)
        high_mask = freqs > 18500

        # Energie in hohen Frequenzen
        high_energy = magnitude[high_mask, :].mean()
        total_energy = magnitude.mean()

        if high_energy / (total_energy + 1e-10) > 0.05:
            findings.append(AudioWatermarkFinding(
                type='high_freq_inaudible',
                frequency_band='18500-22050',
                confidence=min(0.95, high_energy / total_energy * 5),
                time_range=None,
                removal_strategy='lowpass_filter_18500'
            ))

        return findings

    def _detect_phase_anomalies(self, audio: np.ndarray) -> List[AudioWatermarkFinding]:
        """Erkennt Phasen-Inkonsistenzen (Phase-Coding WM)."""
        if librosa is None:
            return []

        findings = []
        stft = librosa.stft(audio, n_fft=2048)
        phase = np.angle(stft)

        # Phase-Differenz zwischen benachbarten Frames
        phase_diff = np.diff(phase, axis=1)
        phase_consistency = np.std(phase_diff, axis=1)

        # Niedrige Frequenz-Bins (20-500 Hz)
        freqs = librosa.fft_frequencies(sr=self.sr, n_fft=2048)
        low_mask = (freqs > 20) & (freqs < 500)

        low_phase_std = phase_consistency[low_mask].mean()

        # Anomalie: zu konsistente Phase deutet auf Kodierung hin
        if low_phase_std < 0.3:
            findings.append(AudioWatermarkFinding(
                type='phase_coding',
                frequency_band='20-500',
                confidence=0.6,
                time_range=None,
                removal_strategy='phase_normalization'
            ))

        return findings

    def _detect_echo_hiding(self, audio: np.ndarray) -> List[AudioWatermarkFinding]:
        """Erkennt Echo-Hiding via Cepstrum-Analyse."""
        if signal is None:
            return []

        findings = []
        # Reales Cepstrum
        spectrum = np.fft.fft(audio[:self.sr * 2])  # Erste 2 Sekunden
        log_spectrum = np.log(np.abs(spectrum) + 1e-10)
        cepstrum = np.fft.ifft(log_spectrum).real

        # Echo-Peaks bei 0.5-2ms (= 22-88 Samples bei 44.1kHz)
        echo_range = cepstrum[22:88]
        peak_height = np.max(np.abs(echo_range))
        baseline = np.median(np.abs(cepstrum[100:500]))

        if peak_height > baseline * 3:
            findings.append(AudioWatermarkFinding(
                type='echo_hiding',
                frequency_band='broadband',
                confidence=min(0.85, peak_height / baseline / 5),
                time_range=None,
                removal_strategy='deverberation'
            ))

        return findings
```

---

### Sprint 2: Removal Engine (Woche 5–8)

```
Ziel: Gefundene Wasserzeichen entfernen + Qualitaet erhalten
```

#### Task 2.1: Visible WM Removal (LaMa Inpainting)

```python
# src/removers/inpainting.py
"""AI-basierte Inpainting-Entfernung fuer sichtbare Wasserzeichen."""

import numpy as np
from pathlib import Path

try:
    import onnxruntime as ort
    import cv2
except ImportError:
    ort = None
    cv2 = None


class LaMaInpainter:
    """Large Mask Inpainting — SOTA fuer Wasserzeichen-Entfernung."""

    def __init__(self, model_path: Path = None):
        if model_path is None:
            model_path = Path('models/lama_fp16.onnx')
        self.session = None
        if ort and model_path.exists():
            self.session = ort.InferenceSession(
                str(model_path),
                providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
            )

    def remove(self, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """
        Entfernt den maskierten Bereich via Inpainting.
        
        Args:
            image: HxWx3 uint8 Bild
            mask:  HxW uint8 Maske (255 = zu entfernen)
            
        Returns:
            HxWx3 uint8 bereinigtes Bild
        """
        if self.session is None:
            # Fallback: OpenCV Inpainting
            return cv2.inpaint(image, mask, 3, cv2.INPAINT_TELEA)

        # Preprocessing fuer LaMa
        h, w = image.shape[:2]
        # Resize auf 512x512 (LaMa Standard)
        img_resized = cv2.resize(image, (512, 512))
        mask_resized = cv2.resize(mask, (512, 512))

        # Normalisierung
        img_input = img_resized.astype(np.float32) / 255.0
        img_input = np.transpose(img_input, (2, 0, 1))  # CHW
        img_input = np.expand_dims(img_input, 0)         # NCHW

        mask_input = (mask_resized > 127).astype(np.float32)
        mask_input = np.expand_dims(np.expand_dims(mask_input, 0), 0)  # N1HW

        # Inference
        outputs = self.session.run(
            None,
            {'image': img_input, 'mask': mask_input}
        )

        # Postprocessing
        result = outputs[0][0]  # CHW
        result = np.transpose(result, (1, 2, 0))  # HWC
        result = np.clip(result * 255, 0, 255).astype(np.uint8)
        result = cv2.resize(result, (w, h))

        return result
```

---

### Sprint 3: CLI + Batch (Woche 9–12)

#### Task 3.1: CLI Interface

```python
# src/cli.py
"""CleanMark Ultra™ — Command Line Interface."""

import typer
from pathlib import Path
from typing import Optional, List

app = typer.Typer(
    name='cleanmark',
    help='CleanMark Ultra™ — Wasserzeichen komplett entfernen.',
    add_completion=False
)


@app.command()
def scan(
    path: Path = typer.Argument(..., help='Datei oder Ordner zum Scannen'),
    patterns: Path = typer.Option('patterns/watermarks.patterns', help='Pattern-Datei'),
    output: str = typer.Option('json', help='Ausgabeformat: json, table, csv'),
    verbose: bool = typer.Option(False, '-v', help='Ausfuehrliche Ausgabe'),
):
    """Scannt Dateien auf Wasserzeichen (Detection only)."""
    typer.echo(f'🔍 Scanne: {path}')
    # ... Detection Pipeline aufrufen ...


@app.command()
def clean(
    path: Path = typer.Argument(..., help='Datei oder Ordner zum Bereinigen'),
    output_dir: Path = typer.Option('./cleaned', '-o', help='Ausgabe-Ordner'),
    patterns: Path = typer.Option('patterns/watermarks.patterns', help='Pattern-Datei'),
    quality: str = typer.Option('high', help='Qualitaet: low, medium, high, lossless'),
    skip_verify: bool = typer.Option(False, help='Verifikation ueberspringen'),
    dry_run: bool = typer.Option(False, help='Nur scannen, nicht entfernen'),
):
    """Vollstaendige Bereinigung: Detect → Remove → Verify → Export."""
    typer.echo(f'🧹 Bereinige: {path} → {output_dir}')
    # ... Full Pipeline aufrufen ...


@app.command()
def strip_metadata(
    path: Path = typer.Argument(..., help='Datei oder Ordner'),
    output_dir: Path = typer.Option('./stripped', '-o', help='Ausgabe-Ordner'),
):
    """Nur Metadata entfernen (schnell, kein AI noetig)."""
    typer.echo(f'📋 Strip Metadata: {path}')
    # ... Metadata Stripper aufrufen ...


if __name__ == '__main__':
    app()
```

---

## Abhaengigkeiten

```toml
# pyproject.toml
[project]
name = "cleanmark-ultra"
version = "0.1.0"
description = "Universelle Wasserzeichen-Entfernung fuer Bilder, Videos und Audio"
requires-python = ">=3.10"

[project.dependencies]
# Core
numpy = ">=1.24"
opencv-python-headless = ">=4.8"
pillow = ">=10.0"
onnxruntime-gpu = ">=1.17"

# Audio
librosa = ">=0.10"
scipy = ">=1.11"
soundfile = ">=0.12"
mutagen = ">=1.47"

# Detection
paddleocr = ">=2.7"
ultralytics = ">=8.1"

# CLI
typer = ">=0.12"
rich = ">=13.0"

# Metadata
# ExifTool: System-Paket (apt/brew/choco)
# mat2: System-Paket (pip install mat2)

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-cov>=4.0",
    "ruff>=0.3",
]
```

---

## Naechste Schritte (sofort umsetzbar)

| # | Schritt | Aufwand | Ergebnis |
|:--|:--------|:--------|:---------|
| 1 | Projekt-Skeleton erstellen (Ordner + pyproject.toml) | 1h | Basis steht |
| 2 | MetadataDetector + MetadataStripper implementieren | 4h | Erster funktionierender Detektor |
| 3 | PatternMatcher mit watermarks.patterns laden | 3h | Regex-basierte Erkennung |
| 4 | AudioWatermarkDetector (High-Freq + Phase) | 6h | Audio-Scan funktioniert |
| 5 | LaMa ONNX Modell beschaffen + Inpainter integrieren | 4h | Sichtbare WM entfernbar |
| 6 | CLI mit scan + clean + strip-metadata Befehlen | 3h | Tool per Kommandozeile nutzbar |
| 7 | Batch-Processing mit Fortschrittsbalken (rich) | 2h | Ordner-Verarbeitung |
| 8 | Tauri Desktop Shell (HTML/CSS UI + Rust Backend) | 8h | Desktop-App Grundgeruest |
| 9 | Test-Suite mit Beispiel-Wasserzeichen | 4h | Automatisierte Tests |
| 10 | Clean-Zertifikat-Generator (JSON Export) | 2h | Verifikationsnachweis |
