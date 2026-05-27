---
name: notebooklm-research-lab
description: "Dual-Mode Research Lab fuer Antigravity — Google NotebookLM (CLI + Browser-Automation) plus lokaler Jupyter/OpenSwarm/Graphify Stack. 3 Pfade, 0 Abos."
---

# ≡ DEVKiTZ™ — NotebookLM Research Lab ≡

**Drei Pfade, ein Ziel: Maximale Recherche-Power.**

| Modus | Stack | Wann |
|:------|:------|:-----|
| **A) NLM CLI** | `nlm` CLI Tool via uv | Batch-Content: Podcast, Video, Slides, MindMap |
| **B) NLM Browser** | Patchright + Google Auth | Interaktive Fragen, Deep Research |
| **C) Lokal** | Jupyter + OpenSwarm + Graphify + OpenHands | Code-Analyse, Daten, Charts, Content-Pipeline |

**0 Abos. Google-Login reicht fuer Modus A+B.**

---

## Modus A: NLM CLI (Batch-Content)

### Wann verwenden

- User will Content generieren: Podcast, Video, Slides, MindMap, Report
- User erwaehnt "batch" oder "alle Content-Typen"
- Phrases: "erstelle podcast", "mach video", "generier slides"

### Session-Setup (IMMER zuerst!)

```powershell
$env:Path = "C:\Users\BAZE²\.local\bin;$env:Path"
$env:PYTHONIOENCODING = "utf-8"
```

### Quick Reference

```powershell
# Auth pruefen
nlm doctor

# Notebooks
nlm notebook list
nlm notebook create "DkZ - THEMA"
nlm notebook query <id> "Frage"

# Quellen (NUR .md, .pdf, .txt)
nlm source add <nb> --file "dokument.md" --wait
nlm source add <nb> --url "https://..."
nlm source add <nb> --youtube "https://..."

# Content generieren
nlm audio create <nb> --language de --confirm          # Podcast
nlm video create <nb> --language de --confirm          # Video
nlm report create <nb> --confirm                       # Report
nlm slides create <nb> --confirm                       # Slides
nlm mindmap create <nb> --confirm                      # Mind Map
nlm infographic create <nb> --orientation landscape --confirm
nlm data-table create <nb> "Beschreibung" --confirm

# Download (ACHTUNG: Bindestriche!)
nlm download audio       <nb> --id <art> --output podcast.wav
nlm download video       <nb> --id <art> --output video.mp4
nlm download report      <nb> --id <art> --output report.md
nlm download slide-deck  <nb> --id <art> --output slides.pdf
nlm download mind-map    <nb> --id <art> --output mindmap.json
nlm download infographic <nb> --id <art> --output infographic.png
nlm download data-table  <nb> --id <art> --output data.csv

# Status
nlm studio status <nb>
```

### Batch-Workflow (Alle Content-Typen)

```powershell
# 1. Notebook erstellen
$NB = nlm notebook create "DkZ - THEMA" --json | ConvertFrom-Json | Select -Expand id

# 2. Quellen hinzufuegen
nlm source add $NB --file "quelle.md" --wait

# 3. Alle Typen generieren
nlm audio create $NB --language de --confirm
nlm video create $NB --language de --confirm
nlm report create $NB --confirm
nlm slides create $NB --confirm
nlm mindmap create $NB --confirm

# 4. Status pruefen + Download
nlm studio status $NB
```

> **Vollstaendige CLI-Referenz:** Siehe [NLM-SYNTAX.md](NLM-SYNTAX.md) im selben Ordner.

---

## Modus B: NLM Browser (Interaktiv)

### Wann verwenden

- User will Dokumente mit Gemini interaktiv abfragen
- User teilt NotebookLM-URL (`notebooklm.google.com/...`)
- Deep Research mit Follow-Up-Fragen
- Phrases: "frag mein NotebookLM", "check meine Docs"

### Scripts

Alle Scripts liegen in `.opencode/skills/dkz-top10/notebooklm-oc/scripts/`:

```powershell
$NLM = "C:\DEVKiTZ\.opencode\skills\dkz-top10\notebooklm-oc"

# Auth
python "$NLM\scripts\run.py" auth_manager.py status
python "$NLM\scripts\run.py" auth_manager.py setup    # Browser oeffnet sich

# Notebooks verwalten
python "$NLM\scripts\run.py" notebook_manager.py list
python "$NLM\scripts\run.py" notebook_manager.py search --query "keyword"

# Fragen stellen
python "$NLM\scripts\run.py" ask_question.py --question "Was steht ueber X?"
python "$NLM\scripts\run.py" ask_question.py --question "..." --notebook-url "URL"
python "$NLM\scripts\run.py" ask_question.py --question "..." --show-browser
```

### Follow-Up Pflicht

Jede NLM-Antwort endet mit **"Is that ALL you need?"**

1. **STOP** — Nicht sofort antworten
2. **ANALYSE** — Antwort mit Original-Frage vergleichen
3. **LUECKEN** — Fehlende Infos identifizieren
4. **FOLLOW-UP** — Bei Luecken sofort nachfragen
5. **SYNTHESE** — Alle Antworten zusammenfuehren

---

## Modus C: Lokales Research Lab

### Wann verwenden

- Interaktive Datenanalyse mit Python
- Code-Analyse des DkZ-Oekosystems
- Content-Erstellung (Blog, Video-Skript, Thread)
- Wissens-Graphen visualisieren
- Phrases: "analysiere", "erstelle notebook", "research lab"

### Architektur

```
+-----------------------------------------------------------+
|              DkZ Research Lab Stack                        |
|                                                           |
|  +--------------+  +--------------+  +--------------+     |
|  | JupyterLab   |  | OpenSwarm    |  | OpenHands    |     |
|  | Port: 8888   |  | (4 Agenten)  |  | Port: 3000   |     |
|  |              |  |              |  |              |     |
|  | - Notebooks  |  | - Researcher |  | - Code Gen   |     |
|  | - Python     |  | - Writer     |  | - Refactor   |     |
|  | - Markdown   |  | - SEO        |  | - Bug Fix    |     |
|  | - Charts     |  | - Editor     |  | - Analyse    |     |
|  +------+-------+  +------+-------+  +------+-------+     |
|         |                 |                  |             |
|  +------+-----------------+------------------+--------+    |
|  |              Graphify Playbook Viewer               |    |
|  |     Wissens-Graph + Chat + Kategorien-Filter       |    |
|  +----------------------------------------------------+    |
|                                                           |
|  Daten: DuckDB - localStorage - SecondBrain (Obsidian)   |
+-----------------------------------------------------------+
```

### Befehle

```powershell
# JupyterLab starten
jupyter lab --notebook-dir="C:\DEVKiTZ\02_RESEARCH" --no-browser

# Template verwenden
# 02_RESEARCH/notebooks/templates/dkz-research-template.ipynb

# Graphify Playbook
start "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\graphify\index.html"

# OpenHands
openhands          # CLI
openhands web      # Web-UI -> http://localhost:3000
```

---

## Vergleich aller drei Modi

| Feature | A: NLM CLI | B: NLM Browser | C: Lokal |
|:--------|:-----------|:---------------|:---------|
| Podcast | ja (`nlm audio`) | nein | nein |
| Video | ja (`nlm video`) | nein | ja (Remotion) |
| Slides | ja (`nlm slides`) | nein | nein |
| Mind Map | ja (`nlm mindmap`) | nein | ja (Graphify) |
| Report | ja (`nlm report`) | nein | ja (Jupyter) |
| Interaktiv | nein | ja (Gemini-grounded) | nein |
| Deep Research | nein | ja (NLM Research) | ja (OpenSwarm) |
| Code ausfuehren | nein | nein | ja (Jupyter + OpenHands) |
| Charts | nein | nein | ja (matplotlib) |
| Content-Pipeline | nein | nein | ja (OpenSwarm) |
| Offline | nein | nein | ja |
| Rate Limit | 50/Tag | 50/Tag | Unbegrenzt |
| Auth | `nlm login` | Google Login | Keine |

---

## Entscheidungsbaum

```
User-Anfrage
|
+-- "Erstelle Podcast/Video/Slides/MindMap"
|   --> Modus A (NLM CLI)
|
+-- "Frag meine Dokumente" / "Was steht in..."
|   --> Modus B (NLM Browser)
|
+-- "Analysiere Code" / "Erstelle Chart" / "Schreib Blog"
|   --> Modus C (Lokal)
|
+-- "Erstelle alles fuer Thema X"
    --> Modus A (Batch) + Modus C (Content-Pipeline)
```

---

## Ports-Uebersicht

| Service | Port | URL |
|:--------|:-----|:----|
| JupyterLab | 8888 | `http://localhost:8888` |
| OpenHands | 3000 | `http://localhost:3000` |
| ONTHERUN API | 3040 | `http://localhost:3040` |
| Graphify | file:// | Lokal |

---

## Wartezeiten (NLM CLI)

| Content-Typ | Typische Dauer |
|:-----------|:---------------|
| Mind Map | Sofort (synchron) |
| Report | ~30 Sekunden |
| Data Table | ~60 Sekunden |
| Infographic | ~60 Sekunden |
| Slides | 2-5 Minuten |
| Audio (Podcast) | 3-5 Minuten |
| Video | 5-15 Minuten |

---

## Troubleshooting

| Problem | Loesung |
|:--------|:--------|
| `nlm` nicht gefunden | `$env:Path = "C:\Users\BAZE²\.local\bin;$env:Path"` |
| Auth abgelaufen | `nlm login` (CLI) oder `auth_manager.py setup` (Browser) |
| Rate Limit 50/Tag | Anderes Google-Konto oder Modus C |
| Video-Download failed | Laenger warten (5-15 Min), `nlm studio status` |
| Infographic scheitert | 2-3x versuchen |
| Jupyter nicht gefunden | `pip install jupyterlab notebook ipykernel` |
| Kernel fehlt | `python -m ipykernel install --user --name dkz-research` |
| OpenHands Fehler | `openhands --help` oder `uv tool upgrade openhands` |
| Patchright Auth fehlt | `python scripts/run.py auth_manager.py setup` |

---

## Ordner-Struktur

```
.agents/skills/notebooklm-integration/
+-- SKILL.md              # Diese Datei (Dual-Mode Skill)
+-- NLM-SYNTAX.md         # Vollstaendige CLI-Referenz

.opencode/skills/dkz-top10/notebooklm-oc/
+-- SKILL.md              # OpenCode-Version (fuer andere Agenten)
+-- scripts/              # Patchright Browser-Automation
|   +-- run.py            # Universal Runner
|   +-- ask_question.py   # NLM Fragen stellen
|   +-- auth_manager.py   # Google Auth
|   +-- notebook_manager.py # Bibliothek
+-- references/           # Erweiterte Docs
+-- data/                 # Session-Daten (auto)

02_RESEARCH/
+-- notebooks/
|   +-- templates/
|       +-- dkz-research-template.ipynb
+-- data/
+-- output/
```
