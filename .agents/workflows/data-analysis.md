---
description: Datenanalyse und Research — Strukturierte Recherche mit Quellen, Bewertung und Report
---

# /data-analysis — Datenanalyse & Research Workflow

> **Kernregel:** Der passende und ordentlich eingetragene Workflow ist wichtiger als das Ergebnis.

## Wann verwenden?
- Marktanalyse / Wettbewerbsanalyse
- Sportdaten-Analyse (NBA, Bundesliga etc.)
- Technologie-Vergleiche
- SEO-Analyse
- Preisvergleiche

## Workflow

### 1. Fragestellung definieren
```markdown
## Research-Frage
- **Was?** [Konkrete Frage]
- **Warum?** [Ziel der Analyse]
- **Scope?** [Zeitraum, Region, Kategorien]
- **Output?** [Report, Tabelle, Empfehlung]
```

### 2. Datenquellen identifizieren
- Web-Recherche (search_web)
- Bestehende Daten im WissenHub
- APIs (ONTHERUN™ Proxy)
- Lokale Dateien (CSV, JSON)

### 3. Daten sammeln
```bash
# Web-Recherche mit Quellenangabe
# Immer Datum + URL dokumentieren
# Min. 3 unabhängige Quellen
```

### 4. Analyse-Template
```markdown
# [Thema] — Analyse Report

> Stand: [DATUM] · Quellen: [ANZAHL]

## Executive Summary
[3-5 Sätze Kernaussagen]

## Daten
| Metrik | Wert | Quelle |
|:-------|:-----|:-------|
| ... | ... | [URL] |

## Bewertung
- 🟢 Positiv: ...
- 🟡 Neutral: ...
- 🔴 Risiko: ...

## Empfehlung
[Konkrete Handlungsempfehlung]

## Quellen
1. [Titel](URL) — abgerufen am [Datum]
```

### 5. Report ablegen
```bash
# In WissenHub
modules/wissen-hub/archive/research/research_[datum]_[thema].md

# In Research Archive
modules/research-archive/ → master-index.json aktualisieren
```

### 6. Git Commit
```bash
git add -A
git commit -m "docs(research): [thema]-analyse erstellt"
```

## Qualitätsregeln
- **Immer Quellen** — keine unbelegten Aussagen
- **Aktualität** — Datum der Datenerhebung angeben
- **Bewertung** — nicht nur Daten, auch Einordnung
- **Actionable** — Report muss Handlungsempfehlung enthalten
