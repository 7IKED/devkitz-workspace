# 🎬 DEVKiTZ™ Kurzfilm-Clip Generator

> Spielfilm-Qualität Short-Clips über DEVKiTZ™ via Gemini Veo 3.1 API
> Stil: IT-Praxis Dr. Bauer / Die Chroniken des IT-Wikingers

---

## Überblick

Generiert **5 cineastische 8-Sekunden-Clips** mit Dialog, Soundeffekten und Filmqualität.
Jeder Clip zeigt eine überzeichnete Alltagsszene aus der DEVKiTZ™-Welt im IT-Comedy-Stil.

| Clip | Titel | Szene |
|:-----|:------|:------|
| 001 | Der Ralph-Loop™ Moment | Endlos-Loop + "Hast du esc() vergessen?" |
| 002 | James™ schlägt Alarm | R24 ALARM — "Ich wollte nur console.logs entfernen" |
| 003 | 89 Module und kein Ende | Admin im Kontrollraum — "Perfektion." |
| 004 | Der BotNet™ Marketplace | Cyberpunk KI-Agenten-Markt |
| 005 | Die Zukunft ist Vanilla | Regisseur im Schnitt-Studio |

---

## Setup

```bash
# 1. Dependencies installieren
npm install

# 2. API Key setzen
set GEMINI_API_KEY=dein-gemini-api-key
```

> **Voraussetzung:** Gemini API Key mit Veo 3.1 Zugang von [Google AI Studio](https://aistudio.google.com/)

---

## Nutzung

```bash
# Alle 5 Clips generieren
node generate-clips.js

# Nur Prompts anzeigen (kein API-Call)
node generate-clips.js --dry-run

# Nur einen bestimmten Clip generieren (z.B. Clip 3)
node generate-clips.js --clip 3

# Schnelleres Modell (Veo 3.1 Fast — günstiger)
node generate-clips.js --fast

# Kombinierbar
node generate-clips.js --fast --clip 1
```

---

## Ausgabe

Generierte Videos landen in `output/`:

```
output/
├── clip_001_ralph_loop.mp4
├── clip_002_james_alarm.mp4
├── clip_003_89_module.mp4
├── clip_004_botnet_marketplace.mp4
└── clip_005_zukunft_vanilla.mp4
```

---

## Spezifikationen

| Parameter | Wert |
|:----------|:-----|
| Modell | `veo-3.1-generate-preview` |
| Auflösung | 1080p |
| Seitenverhältnis | 16:9 |
| Dauer | 8 Sekunden pro Clip |
| Audio | Nativ (Dialog + SFX) |
| personGeneration | `allow_adult` (EU-Pflicht) |

---

## Prompts anpassen

Alle Prompts sind in `prompts.json` definiert. Du kannst:
- Bestehende Prompts bearbeiten
- Neue Clips hinzufügen (Array erweitern)
- Meta-Daten ändern (Auflösung, Dauer, etc.)

### Prompt-Tipps für Veo 3.1:

- **Dialog:** In Anführungszeichen, z.B. `'Das ist der Schlüssel'`
- **Kamera:** `close-up`, `wide shot`, `dolly shot`, `drone shot`
- **Licht:** `warm amber tones`, `neon-lit`, `film noir`
- **Audio:** `Sound: keyboard clacking, dramatic silence`
- **Stil:** `cinematic`, `cyberpunk`, `film grain`, `anamorphic`

---

## Kosten & Limits

- Jeder Clip kostet API-Credits → [Pricing](https://ai.google.dev/gemini-api/docs/pricing#veo-3.1)
- Latenz: 11s bis 6 Minuten pro Clip
- Videos werden 2 Tage auf Google Server gespeichert
- Alle Videos erhalten SynthID Wasserzeichen

---

*DEVKiTZ™ — Spielfilm-Qualität mit Veo 3.1*
