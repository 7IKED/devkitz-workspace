# CleanMark Ultra™ — Domain Glossary

> Bounded Context: Media Asset Sanitization
> Last updated: 2026-05-31

---

## Core Terms

### Watermark
An intentionally embedded signal in media (image, video, audio) that identifies ownership, origin, or licensing status. Watermarks can be **visible** (human-perceivable) or **invisible** (machine-detectable only).

### Visible Watermark
A watermark perceivable by humans without tools: overlay logos, text stamps, semi-transparent graphics, tiled patterns. Examples: stock photo logos (Shutterstock, Getty), video platform stamps (TikTok, CapCut), broadcaster bugs.

### Invisible Watermark
A watermark not perceivable by humans under normal conditions but detectable by algorithms. Includes steganographic, frequency-domain, neural, and metadata-based techniques. Also called: hidden watermark, digital fingerprint, forensic mark.

### Neural Watermark
A watermark embedded during AI content generation, baked into the model's output at the latent-space level. Cannot be removed by simple post-processing. Examples: Google SynthID, Meta Stable Signature, Suno audio patterns.

### Steganography
The practice of hiding information within media by modifying imperceptible properties (least significant bits, phase values, frequency coefficients). Distinct from watermarking in intent: steganography aims to hide the existence of the message, watermarking aims to prove ownership.

### Fingerprint (Digital)
A content-derived identifier computed from the media itself (perceptual hash, spectral signature). Unlike watermarks, fingerprints are not embedded — they are computed. Used for content matching (YouTube Content ID, Shazam).

### Metadata
Non-content data embedded in file containers: EXIF (images), XMP (Adobe), IPTC (news), ID3 (audio), C2PA (provenance). Contains creation timestamps, GPS coordinates, device info, editing history, AI generation parameters.

### Asset
Any media file processed by CleanMark Ultra: image (JPEG/PNG/TIFF/WebP/HEIC), video (MP4/MOV/AVI/MKV/WebM), audio (WAV/MP3/FLAC/AAC/OGG), or beat loop.

### Sanitization
The complete removal of ALL identifying markers from an asset: visible watermarks, invisible watermarks, metadata, fingerprints, neural signatures. The output asset must be forensically clean — no pixel, sample, metadata entry, or fingerprint remains.

### Detection
The process of identifying the presence, type, and location of watermarks in an asset BEFORE removal. Detection produces a **detection map** describing what was found and where.

### Removal
The process of eliminating detected watermarks while preserving maximum media quality. Methods vary by watermark type: inpainting for visible, frequency filtering for invisible, regeneration for neural.

### Pattern
A reusable detection rule in the `watermarks.patterns` format. Describes how to find a specific watermark type using regex, hash templates, frequency signatures, or neural model references.

### Quality Preservation
The requirement that sanitized output matches the original in perceptual quality. No visible artifacts, no audible distortion, no resolution loss. Measured by PSNR, SSIM, PESQ (audio), VMAF (video).

---

## Watermark Taxonomy

### By Visibility
- **Visible**: Overlay, Text, Logo, Tiled, Semi-transparent
- **Invisible**: Steganographic, Frequency-domain, Neural, Metadata

### By Domain
- **Spatial**: Modifications in pixel/sample values directly
- **Frequency**: Modifications in DCT/DWT/FFT transform coefficients
- **Temporal**: Modifications across video frames or audio segments
- **Latent**: Modifications in AI model latent space (neural watermarks)

### By Robustness
- **Fragile**: Destroyed by any modification (tamper detection)
- **Semi-fragile**: Survives mild processing, fails under heavy editing
- **Robust**: Survives compression, cropping, format conversion
- **Ultra-robust**: Survives re-recording, screenshots, AI regeneration

### By Purpose
- **Copyright**: Proves ownership (logos, invisible marks)
- **Forensic**: Traces leaker identity (unique per recipient)
- **Broadcast**: Identifies content on air (Cinavia, Content ID)
- **AI Provenance**: Marks AI-generated content (SynthID, C2PA)

---

## System Concepts

### Detection Map
A structured output from the detection phase. For each detected watermark: type, confidence score (0-1), spatial/temporal/spectral location, recommended removal strategy.

### Pattern Library
The user-extensible database of watermark detection patterns. Ships with 200+ built-in patterns. Users can add custom patterns via the pattern editor or by importing `.patterns` files.

### Processing Pipeline
The ordered sequence: **Ingest → Detect → Map → Remove → Verify → Export**. Each stage is a discrete module with defined inputs/outputs.

### Verification
Post-removal analysis confirming that ALL watermarks have been eliminated. Runs the full detection suite on the sanitized output. Only produces "clean" output if verification passes with zero detections.
