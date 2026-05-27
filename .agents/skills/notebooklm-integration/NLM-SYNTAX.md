# NLM CLI — Vollständige Syntax-Referenz

> Quelle: github.com/jacob-bd/notebooklm-mcp-cli (CLI Guide)
> Version: v0.5.2+ | Stand: 2026-03-23
> Getestet auf: Windows 11 / PowerShell / Python 3.14

---

## Session-Setup (IMMER zuerst!)

```powershell
$env:Path = "C:\Users\BAZE²\.local\bin;$env:Path"
$env:PYTHONIOENCODING = "utf-8"
```

---

## Notebooks

```bash
nlm notebook list                       # Alle Notebooks auflisten
nlm notebook list --json                # JSON-Ausgabe
nlm notebook create "Titel"             # Neues Notebook erstellen
nlm notebook get <id>                   # Details anzeigen
nlm notebook describe <id>              # AI-Zusammenfassung
nlm notebook rename <id> "Neuer Titel"  # Umbenennen
nlm notebook delete <id> --confirm      # Löschen (IRREVERSIBEL!)
nlm notebook query <id> "Frage"         # Mit Quellen chatten
```

## Quellen

```bash
nlm source list <notebook>                          # Quellen auflisten
nlm source add <notebook> --url "https://..."       # URL hinzufügen
nlm source add <notebook> --file dokument.pdf --wait  # Datei hochladen + warten
nlm source add <notebook> --text "Inhalt" --title "Titel"  # Text als Quelle
nlm source add <notebook> --youtube "https://..."   # YouTube-Video
nlm source add <notebook> --drive <doc-id>          # Google Drive Doc
nlm source get <source-id>                          # Inhalt abrufen
nlm source describe <source-id>                     # AI-Zusammenfassung
nlm source delete <source-id> --confirm             # Löschen (IRREVERSIBEL!)
```

## Content generieren (Studio)

### Audio (Podcast)

```bash
nlm audio create <notebook> --confirm
nlm audio create <notebook> --format deep_dive --length long --confirm
nlm audio create <notebook> --language de --confirm    # DEUTSCH!
# Formate: deep_dive, brief, critique, debate
# Längen: short, default, long
```

### Video

```bash
nlm video create <notebook> --language de --confirm
nlm video create <notebook> --format explainer --style classic --confirm
# Formate: explainer, brief
# Styles: auto_select, classic, whiteboard, kawaii, anime, watercolor, retro_print, heritage, paper_craft
# ⚠️ Video hat --language Parameter! IMMER --language de verwenden!
```

### Report

```bash
nlm report create <notebook> --confirm
nlm report create <notebook> --format "Briefing Doc" --confirm
# Formate: "Briefing Doc", "Study Guide", "Blog Post", "Create Your Own"
```

### Quiz & Flashcards

```bash
nlm quiz create <notebook> --count 10 --difficulty medium --confirm
nlm flashcards create <notebook> --difficulty hard --confirm
# ⚠️ Python 3.14 Bug: OptionInfo not JSON serializable → Workaround: im Browser erstellen
```

### Mind Map

```bash
nlm mindmap create <notebook> --confirm
# Wird SYNCHRON erstellt (sofort fertig)
```

### Slides (Präsentation)

```bash
nlm slides create <notebook> --confirm
nlm slides revise <artifact-id> --slide '1 Titel größer' --confirm
```

### Infographic

```bash
nlm infographic create <notebook> --confirm
nlm infographic create <notebook> --orientation landscape --style professional --confirm
# ⚠️ Scheitert manchmal → 2-3x versuchen
```

### Data Table

```bash
nlm data-table create <notebook> "Beschreibung" --confirm
```

---

## Download

```bash
nlm download audio       <notebook> --id <artifact-id> --output podcast.wav
nlm download video       <notebook> --id <artifact-id> --output video.mp4
nlm download report      <notebook> --id <artifact-id> --output report.md
nlm download mind-map    <notebook> --id <artifact-id> --output mindmap.json    # ← Bindestrich!
nlm download slide-deck  <notebook> --id <artifact-id> --output slides.pdf     # ← Bindestrich!
nlm download infographic <notebook> --id <artifact-id> --output infographic.png
nlm download data-table  <notebook> --id <artifact-id> --output data.csv       # ← Bindestrich!
nlm download quiz        <notebook> --id <artifact-id> --format html --output quiz.html
nlm download flashcards  <notebook> --id <artifact-id> --format markdown --output cards.md
```

### ⚠️ Download-Befehle — BINDESTRICHE BEACHTEN!

| Create-Befehl | Download-Befehl | ⚠️ |
|:-------------|:----------------|:---|
| `nlm mindmap create` | `nlm download mind-map` | Bindestrich! |
| `nlm slides create` | `nlm download slide-deck` | Anderer Name! |
| `nlm data-table create` | `nlm download data-table` | Bindestrich! |
| `nlm audio create` | `nlm download audio` | ✅ gleich |
| `nlm video create` | `nlm download video` | ✅ gleich |
| `nlm report create` | `nlm download report` | ✅ gleich |
| `nlm infographic create` | `nlm download infographic` | ✅ gleich |

---

## Status prüfen

```bash
nlm studio status <notebook>            # Artefakt-Status prüfen
nlm studio delete <notebook> <artifact-id> --confirm  # Artefakt löschen
```

---

## Research

```bash
nlm research start "query" --notebook-id <id> --mode fast   # Schnellsuche
nlm research start "query" --notebook-id <id> --mode deep   # Tiefenrecherche
nlm research start "query" --notebook-id <id> --source drive  # Drive durchsuchen
nlm research status <notebook> --max-wait 300               # Auf Ergebnis warten
nlm research import <notebook> <task-id>                    # Quellen importieren
```

---

## Wartung

```bash
nlm login                               # Authentifizierung (Browser)
nlm doctor                              # System-Diagnose
nlm --version                           # Version prüfen
uv tool install --force notebooklm-mcp-cli  # Update erzwingen
```

---

## Bekannte Bugs (Stand v0.5.2 / Python 3.14)

| Bug | Symptom | Workaround |
|:----|:--------|:-----------|
| Quiz-Serialisierung | `OptionInfo not JSON serializable` | Im Browser erstellen |
| Flashcards | `Could not create flashcards` | Im Browser erstellen |
| Infographic | `Could not create infographic` | 2-3x versuchen, ggf. Browser |
| Video Download | `Download failed for video` | Länger warten (5-15 Min) |
| Video Sprache | GEFIXT: --language de funktioniert! | IMMER --language de |
| Session-Timeout | Auth nach ~20 Min ungültig | `nlm login` erneut |

---

## Wartezeiten

| Content-Typ | Typische Dauer |
|:-----------|:---------------|
| Mind Map | Sofort (synchron) |
| Report | ~30 Sekunden |
| Quiz/Flashcards | ~30 Sekunden |
| Data Table | ~60 Sekunden |
| Infographic | ~60 Sekunden |
| Slides | 2-5 Minuten |
| Audio (Podcast) | 3-5 Minuten |
| Video | 5-15 Minuten |


