# Deep Knowledge Extractor — NLM-Driven Research Loop

> Autonomer Wissens-Extraktions-Workflow: YouTube Video → NLM Mind Map →
> Research → Markdown Blaupause → NLM Chat → Offene Fragen → Loop bis komplett.
> Der User sieht nur wie die Quellen wachsen — bis alles fertig ist.

---

## Überblick: Der Loop

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   📺 YouTube Video / Tutorial / Step-by-Step                │
│         │                                                   │
│         ▼                                                   │
│   🧠 NLM: Mind Map erstellen lassen                        │
│         │                                                   │
│         ▼                                                   │
│   📝 Mind Map → Markdown Blaupause konvertieren             │
│         │                                                   │
│         ▼                                                   │
│   🔬 Deep Research zu JEDEM Ast der Mind Map                │
│         │                                                   │
│         ▼                                                   │
│   📚 Research-Ergebnisse als Quellen in NLM hochladen       │
│         │                                                   │
│         ▼                                                   │
│   💬 NLM Chat: "Welche Fragen sind noch offen?"             │
│         │                                                   │
│         ├── Fragen gefunden? ──→ 🔬 Research Loop (zurück)  │
│         │                                                   │
│         └── Alles beantwortet? ──→ ✅ FERTIG                │
│                                                             │
│   👁️ User sieht: Quellen-Counter wächst stetig              │
│      [3/3] → [7/12] → [15/15] → ✅ Komplett                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Video einlesen & Transkript holen

### 1a. YouTube Video als Quelle erfassen

```
mcp_devkitz-autoresearch_ingest_url_to_obsidian(
  url: "https://www.youtube.com/watch?v=VIDEO_ID",
  title: "Tutorial - [Thema]"
)
```

### 1b. Video-Transkript extrahieren

```
mcp_dkz-n8n-research_youtube_search(
  query: "[Video-Titel oder Thema]",
  max_results: 5
)
```

### 1c. Blaupause starten

Erstelle sofort die erste Markdown-Datei:

```markdown
# Blaupause: [Thema]

> Status: 🔄 Phase 1 — Video analysiert
> Quellen: 1/? | Stand: YYYY-MM-DD
> Video: [URL]

---

## Quellen-Log

| # | Typ | Titel | Status |
|:--|:----|:------|:-------|
| 1 | 📺 Video | [Titel] | ✅ Eingelesen |

---

## Mind Map

(wird in Phase 2 befüllt)

---

## Offene Fragen

(wird in Phase 4 befüllt)

---

## Erkenntnisse

(wächst mit jeder Iteration)
```

**Speicherort:** `SecondBrain/01_Projekte/[thema]/blaupause.md`

---

## Phase 2: NLM Mind Map erstellen

### 2a. NotebookLM Notebook erstellen

```
mcp_devkitz-autoresearch_ingest_url_to_obsidian(
  url: "https://www.youtube.com/watch?v=VIDEO_ID",
  title: "NLM-Source: [Thema] Video"
)
```

### 2b. NLM anweisen: Mind Map generieren

Sende an NLM Chat:

```
Erstelle eine detaillierte Mind Map aus diesem Video.
Struktur:
- Hauptthema in der Mitte
- 5-8 Hauptäste (Kernkonzepte)
- Pro Ast: 3-5 Unteräste (Details)
- Pro Unterast: Schlüsselbegriffe, Tools, Befehle
- Markiere alles was UNKLAR oder UNVOLLSTÄNDIG ist mit ❓

Format: Verschachtelte Markdown-Liste
```

### 2c. Mind Map in Markdown umwandeln

```markdown
## Mind Map: [Thema]

- **🎯 [Hauptthema]**
  - **Ast 1: [Konzept]**
    - Detail A
    - Detail B
    - ❓ Unklar: [Was fehlt]
  - **Ast 2: [Konzept]**
    - Detail A
    - Tool: [Name]
    - ❓ Unklar: [Was fehlt]
  - **Ast 3: [Konzept]**
    - Step 1: ...
    - Step 2: ...
    - ❓ Unklar: [Was fehlt]
  - **Ast 4: [Konzept]**
    - ...
```

### 2d. Blaupause updaten

```markdown
> Status: 🔄 Phase 2 — Mind Map erstellt
> Quellen: 1/? | Äste: 6 | Offene Fragen: 4
```

---

## Phase 3: Deep Research zu jedem Ast

### 3a. Für JEDEN Ast der Mind Map researchen

```
# Ast 1
mcp_dkz-n8n-research_google_deep_research_max(
  query: "[Ast 1 Thema] tutorial guide setup",
  follow_links: 5
)

# Ast 2
mcp_dkz-n8n-research_google_deep_research_max(
  query: "[Ast 2 Thema] documentation best practices",
  follow_links: 5
)

# ... für jeden Ast wiederholen
```

### 3b. GitHub-Repos suchen

```
mcp_dkz-n8n-research_github_repo_overview(
  repo_url: "https://github.com/[relevantes-repo]"
)
```

### 3c. Reddit & X für Erfahrungsberichte

```
mcp_dkz-n8n-research_reddit_search(
  query: "[Thema] experience tips gotchas",
  max_results: 10
)

mcp_dkz-n8n-research_x_search(
  query: "[Thema] tutorial thread",
  max_results: 10
)
```

### 3d. YouTube für ergänzende Tutorials

```
mcp_dkz-n8n-research_youtube_search(
  query: "[Thema] step by step tutorial 2026",
  max_results: 5
)
```

### 3e. Jedes Ergebnis in Obsidian speichern

```
mcp_devkitz-autoresearch_ingest_url_to_obsidian(
  url: "[gefundene-url]",
  title: "Research: [Ast] - [Titel]"
)
```

### 3f. Blaupause updaten — Quellen wachsen

```markdown
> Status: 🔄 Phase 3 — Research läuft
> Quellen: 8/? | Äste: 6 | Recherchiert: 3/6

## Quellen-Log

| # | Typ | Titel | Status |
|:--|:----|:------|:-------|
| 1 | 📺 Video | Original Tutorial | ✅ |
| 2 | 🔬 Research | Ast 1 - Deep Dive | ✅ |
| 3 | 🔬 Research | Ast 1 - GitHub Repo | ✅ |
| 4 | 🔬 Research | Ast 2 - Docs | ✅ |
| 5 | 💬 Reddit | Ast 2 - Erfahrungen | ✅ |
| 6 | 📺 YouTube | Ast 3 - Alternatives Tutorial | ✅ |
| 7 | 🔬 Research | Ast 3 - API Docs | ✅ |
| 8 | 🐦 X/Twitter | Ast 3 - Community Tips | ✅ |
```

---

## Phase 4: NLM Chat — Offene Fragen finden

### 4a. Alle Research-Ergebnisse in NLM hochladen

Lade ALLE gesammelten Markdown-Dateien als Quellen in das NLM Notebook.

### 4b. NLM fragen: Was ist noch offen?

```
Analysiere ALLE hochgeladenen Quellen und das Original-Video.
Liste JEDE offene Frage auf — egal wie klein.

Kategorien:
1. 🔴 KRITISCH — Ohne Antwort kann man nicht weitermachen
2. 🟡 WICHTIG — Sollte geklärt werden
3. 🟢 NICE-TO-HAVE — Vertiefung, Optimierung

Format:
- [Frage] → Welche Quelle könnte antworten?
- [Frage] → Braucht neue Recherche zu: [Suchbegriff]
- [Frage] → Kann aus bestehenden Quellen beantwortet werden

Sei EXTREM gründlich. Jedes Detail zählt.
```

### 4c. Fragen in Blaupause eintragen

```markdown
## Offene Fragen

### 🔴 Kritisch
- [ ] Wie konfiguriert man X in Production? → Research: "[X] production config"
- [ ] Welche API-Limits gelten? → Research: "[Tool] API rate limits pricing"

### 🟡 Wichtig
- [ ] Alternative zu Y wenn Z nicht verfügbar? → Research: "[Y] alternatives"
- [ ] Performance-Unterschied zwischen A und B? → Research: "[A] vs [B] benchmark"

### 🟢 Nice-to-Have
- [ ] Gibt es ein Dashboard-Plugin? → GitHub: "[Tool] dashboard plugin"
- [ ] Community Best Practices? → Reddit: "[Tool] best practices tips"
```

---

## Phase 5: Research-Loop (Wiederholen bis fertig)

### 5a. Jede offene Frage researchen

```
# Für jede Frage aus Phase 4:
mcp_dkz-n8n-research_google_deep_research_max(
  query: "[Frage als Suchbegriff]",
  follow_links: 3
)
```

### 5b. Ergebnisse in NLM hochladen

### 5c. NLM erneut fragen

```
Ich habe neue Quellen hochgeladen die folgende Fragen beantworten:
[Liste der beantworteten Fragen]

1. Sind diese Fragen jetzt VOLLSTÄNDIG beantwortet?
2. Welche NEUEN Fragen ergeben sich aus den neuen Quellen?
3. Gibt es noch IRGENDWELCHE Lücken — egal wie klein?

Antworte mit:
- ✅ Beantwortet: [Frage]
- ❓ Noch offen: [Frage] → Recherche: [Suchbegriff]
- 🆕 Neue Frage: [Frage] → Recherche: [Suchbegriff]
```

### 5d. Blaupause updaten — Fortschritt sichtbar

```markdown
> Status: 🔄 Phase 5 — Research Loop #2
> Quellen: 15/18 | Fragen: 12/15 beantwortet | Iterationen: 2
```

### 5e. Loop-Bedingung

```
WENN noch offene Fragen → zurück zu Phase 5a
WENN alle beantwortet → weiter zu Phase 6
```

---

## Phase 6: Finale Blaupause generieren

### 6a. NLM finale Zusammenfassung

```
Erstelle eine VOLLSTÄNDIGE Blaupause basierend auf ALLEN Quellen.

Struktur:
1. Übersicht (Was, Warum, Für wen)
2. Voraussetzungen (Tools, Accounts, Wissen)
3. Step-by-Step Anleitung (nummeriert, mit Code-Blöcken)
4. Konfiguration (alle Settings erklärt)
5. Troubleshooting (häufige Fehler + Lösungen)
6. Ressourcen (alle Quellen mit Links)
7. FAQ (alle beantworteten Fragen)
8. Glossar (Fachbegriffe erklärt)

Format: Markdown
Sprache: Deutsch
Tiefe: MAXIMALE Detailtiefe — nichts weglassen
```

### 6b. Finale Blaupause speichern

```markdown
# Blaupause: [Thema] — KOMPLETT

> Status: ✅ Fertig
> Quellen: 18/18 | Fragen: 15/15 beantwortet | Iterationen: 3
> Erstellt: YYYY-MM-DD | Dauer: ~X Stunden
> Video: [Original-URL]

---

## Quellen-Übersicht (18 Quellen)

| # | Typ | Titel | URL |
|:--|:----|:------|:----|
| 1 | 📺 | Original Tutorial | [link] |
| 2 | 🔬 | Deep Research: Setup | [link] |
| ... | ... | ... | ... |
| 18 | 💬 | NLM Chat: Finale Fragen | [intern] |

---

## 1. Übersicht
...

## 2. Voraussetzungen
...

## 3. Step-by-Step Anleitung
...

(kompletter Inhalt)
```

---

## Fortschritts-Anzeige (Was der User sieht)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Deep Knowledge Extractor: [Thema]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1: Video einlesen          ✅
Phase 2: Mind Map erstellen      ✅
Phase 3: Deep Research           🔄 [████████░░] 80%
Phase 4: Offene Fragen           ⏳
Phase 5: Research Loop           ⏳
Phase 6: Blaupause fertig        ⏳

Quellen:  [████████░░░] 8/12
Fragen:   [██████░░░░░] 6/15
Äste:     [██████████░] 5/6

Aktuell: Recherche zu Ast 5 — "API Integration"
```

---

## Automatisierung: Komplett-Script

### Start-Befehl

```
/deep-extract [YouTube-URL] [Thema]
```

### Ablauf (automatisch)

1. Video-URL → Jina Reader → Transkript als Markdown
2. Transkript → NLM → Mind Map generieren
3. Mind Map → Äste extrahieren → Research-Queue
4. Research-Queue → Deep Research MAX pro Ast
5. Ergebnisse → NLM hochladen → Offene Fragen
6. Offene Fragen → Research Loop bis 0 offen
7. Finale Blaupause → Markdown → SecondBrain

### Geschätzter Ablauf

| Phase | Dauer | Quellen |
|:------|:------|:--------|
| Video einlesen | ~2 min | +1 |
| Mind Map | ~3 min | +0 |
| Deep Research (6 Äste) | ~15 min | +6-12 |
| Offene Fragen | ~3 min | +0 |
| Research Loop #1 | ~10 min | +3-5 |
| Research Loop #2 | ~5 min | +1-3 |
| Finale Blaupause | ~5 min | +0 |
| **GESAMT** | **~45 min** | **~15-20 Quellen** |

---

## NLM Prompt-Vorlagen

### Mind Map erstellen

```
Analysiere dieses Video/Dokument und erstelle eine hierarchische Mind Map.
Jeder Ast muss folgendes enthalten:
- Kernkonzept
- Unterpunkte mit konkreten Details
- Erwähnte Tools/Technologien
- Genannte Befehle/Code
- ❓ für alles was unklar oder unvollständig ist
```

### Offene Fragen finden

```
Durchsuche ALLE Quellen nach Wissenslücken.
Finde JEDE Frage die noch nicht beantwortet ist.
Priorisiere: 🔴 Kritisch > 🟡 Wichtig > 🟢 Nice-to-Have
Für jede Frage: Schlage einen Suchbegriff für weitere Recherche vor.
```

### Finale Synthese

```
Kombiniere ALLE Quellen zu einer vollständigen Blaupause.
Nichts weglassen. Maximale Detailtiefe.
Jeder Schritt muss reproduzierbar sein.
Code-Blöcke für jeden technischen Schritt.
```

---

## Ablage im SecondBrain

```
SecondBrain/01_Projekte/[thema]/
├── blaupause.md              ← Finale Blaupause (Hauptdatei)
├── mindmap.md                ← Mind Map aus Phase 2
├── quellen/
│   ├── 01_video-transkript.md
│   ├── 02_research-ast1.md
│   ├── 03_research-ast2.md
│   ├── 04_github-repo.md
│   ├── 05_reddit-erfahrungen.md
│   ├── ...
│   └── 18_nlm-finale-fragen.md
├── fragen-log.md             ← Alle Fragen + Antworten
└── fortschritt.md            ← Quellen-Counter History
```

---

## Tipps

- **NLM Limit:** Max 50 Quellen pro Notebook — bei Bedarf zweites erstellen
- **Rate Limits:** 3 Sekunden Pause zwischen Research-Calls
- **Qualität > Quantität:** Lieber 5 gute Quellen als 20 oberflächliche
- **Immer Markdown:** ALLES als `.md` — nie als `.txt` oder `.html`
- **Git-Track:** Den kompletten Ordner committen für History
- **Iteration ist King:** 3-4 Loops sind normal — nicht nach 1x aufhören
