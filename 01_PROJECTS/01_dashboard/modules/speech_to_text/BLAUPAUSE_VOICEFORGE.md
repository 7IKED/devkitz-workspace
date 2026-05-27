# 🎙️ VoiceForge™ — Blaupause

> **Version:** v0.01.1_01 | **Stand:** 2026-03-14 | **Status:** GEPLANT
> **Typ:** Standalone Tool | **Kategorie:** Audio / Produktivität
> **Quelle:** `_QUELLE/usecase und entwickling.txt`

> **tags:** [voice-to-text, speech-to-text, whisper, faster-whisper, audacity, python, offline, lokal, transkription, markdown, snippet-manager, fuellwort-filter, live-modus, multi-language, meeting-aufzeichnung, pyaudio, pyperclip, vosk, coqui-stt, clipboard, wav-export, noise-reduction, devkitz, geplant, desktop]

---

## 1. Vision

VoiceForge™ ist ein **lokales, offline, kostenloses** Voice-to-Text System — der direkte Ersatz für Wispr Flow (50 €/Monat). Du redest, der Computer schreibt mit, Füllwörter verschwinden automatisch, und am Ende steht sauberer Markdown-Text bereit. Alles bleibt auf deinem Rechner — keine Cloud, kein Tracking, keine Abo-Kacke.

**Kernprinzip:** Audacity ist die Schere, Whisper ist der Kopf, Python ist das Notizbuch, Markdown ist dein Tagebuch.

---

## 2. Architektur

```
┌─────────────────────────────────────────────────────────┐
│                    VoiceForge™ Pipeline                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   🎤 Mikrofon                                           │
│       │                                                 │
│       ▼                                                 │
│   ┌──────────┐    ┌───────────────┐    ┌─────────────┐  │
│   │ Audacity │───▶│ faster-whisper│───▶│ Python      │  │
│   │ (Record) │    │ (large-v3)   │    │ (Filter +   │  │
│   │ Noise-   │    │ 90+ Sprachen │    │  Format)    │  │
│   │ Reduction│    │ Offline/Lokal│    │             │  │
│   └──────────┘    └───────────────┘    └──────┬──────┘  │
│       WAV              JSON-Text              │         │
│                                               ▼         │
│                                    ┌──────────────────┐ │
│                                    │ Snippet-Manager  │ │
│                                    │ ├─ Clipboard     │ │
│                                    │ ├─ Markdown .md  │ │
│                                    │ └─ Live-Buffer   │ │
│                                    └──────────────────┘ │
│                                                         │
│   Alternativ-STT: VosK (offline) | Coqui STT (Akzente) │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Komponenten

| Komponente | Technologie | Aufgabe |
|:---|:---|:---|
| Audio-Frontend | Audacity | Aufnahme, Noise-Reduction, WAV-Export |
| Transkription (primär) | faster-whisper (large-v3) | Offline Speech-to-Text, 90+ Sprachen |
| Transkription (Fallback) | VosK / Coqui STT | Leichtgewichtige Alternative |
| Füllwort-Filter | Python (custom) | „ähm", „äh", „genau", „fisch" entfernen |
| Markdown-Export | Python → .md | Sauberer, fließender Text ohne Absatzbrüche |
| Snippet-Manager | Python + pyperclip | Letzte 5–10 Sätze als klickbare Snippets |
| Live-Modus | Python + PyAudio | Echtzeit-Mikro ohne Audacity |
| Multi-Language | Whisper auto-detect | Automatischer DE/EN/FR-Wechsel |
| Overlay / GUI | Tkinter oder HTML | Kleines Fenster mit Snippet-Buttons |

**Stack:** Python 3.11+ | faster-whisper | PyAudio | pyperclip | Audacity (optional)

---

## 4. Use-Cases

1. **Sprache → Markdown** — Audacity aufnehmen, Whisper transkribieren, Füllwörter filtern, `.md` exportieren
2. **Snippet-Manager** — Letzte Sätze als klickbare Liste, einzeln in Ablage kopieren
3. **Fließender Text** — Kein neuer Absatz pro Satz, alles hängt zusammen wie ein Gespräch
4. **Live-Modus** — Mikro direkt ohne Audacity, Echtzeit-Text-Scroll
5. **Multi-Language** — Automatisch zwischen Deutsch und Englisch wechseln
6. **Meeting-Aufzeichnung** — Komplette Sessions als `Meeting_YYYY-MM-DD_HH-MM.md` speichern
7. **Füllwort-Report** — Zeigt an wie oft „ähm" gesagt wurde (optional)
8. **Audacity Label-Track** — Timestamp-Marker für Schnitt in Audacity

---

## 5. Implementierungsschritte

### Phase 1: Basis-Pipeline (MVP)
- [ ] Python-Umgebung einrichten (`pip install faster-whisper pyaudio pyperclip`)
- [ ] Whisper large-v3 Modell herunterladen (~2–3 GB, einmalig)
- [ ] Basis-Skript: WAV einlesen → Whisper → Text ausgeben
- [ ] Füllwort-Filter implementieren (Regex-basiert)
- [ ] Markdown-Export (`.md` Datei schreiben)

### Phase 2: Snippet-Manager
- [ ] Buffer für letzte 10 Sätze
- [ ] Clipboard-Integration (pyperclip)
- [ ] Tkinter Mini-Fenster mit Snippet-Buttons
- [ ] „Alle kopieren" Button

### Phase 3: Live-Modus
- [ ] PyAudio Echtzeit-Stream
- [ ] Whisper im Streaming-Modus
- [ ] Live-Scroll im Overlay-Fenster

### Phase 4: Polish
- [ ] Multi-Language Auto-Detect
- [ ] Meeting-Speicherung mit Datum/Uhrzeit-Format
- [ ] Audacity Label-Track Export
- [ ] `features.json` erstellen

---

## 6. Ökosystem-Integration

| Aspekt | Integration |
|:---|:---|
| **DEVKiTZ™ Ordner** | `01_PROJECTS/XX_voiceforge/` |
| **Design System** | DkZ v2 (Overlay-Fenster mit `#fa1e4e` Accent) |
| **Shared Scripts** | `dkz-debug.js` für XSS-Schutz (falls Web-UI) |
| **REGISTRY.json** | Neuer Eintrag `MOD-XXX` |
| **REGELWERK** | Regel 23: Go→Python Fallback (optional) |
| **GrokBoard™** | VoiceForge™ liefert Transkripte an GrokBoard™ Voice-Layer |
| **WristLink™** | Uhr-Button startet VoiceForge™ Aufnahme |
| **DEEPKEEP™** | Meetings werden archiviert |

---

*Erstellt: 2026-03-14 | Quelle: Voice-Transkript Brainstorming-Session*
