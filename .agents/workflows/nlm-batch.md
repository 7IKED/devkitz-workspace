---
description: NLM Batch Content-Generierung — Alle Content-Typen für ein Thema auf einmal erstellen
---

# /nlm-batch — NLM All-in-One Batch

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Komplette Pipeline
```powershell
# 1. Source vorbereiten
$TOPIC = "[THEMA]"
$SRC = "/tmp/nlm-source-$TOPIC.md"
# Source-Datei mit: Was?, Warum?, Zahlen, Nutzen (80-120 Zeilen)

# 2. Notebook erstellen
$NB = nlm notebook create "DkZ - $TOPIC"

# 3. Source hochladen
nlm source add $NB --file $SRC --wait

# 4. Alle Content-Typen generieren (parallel!)
nlm audio create $NB --language de --confirm
nlm slides create $NB --confirm
nlm infographic create $NB --orientation landscape --style professional --confirm

# 5. Status prüfen
nlm studio status $NB

# 6. Herunterladen
$OUT = "$env:USERPROFILE\Downloads\DKZ-$TOPIC-Content"
mkdir -Force $OUT
nlm download audio $NB --output "$OUT\podcast-DE.wav"
nlm download slide-deck $NB --output "$OUT\slides.pdf"
nlm download infographic $NB --output "$OUT\infographic.png"
```

## Qualitäts-Regeln
- Source: Kontext + Zahlen + Nutzen (NUR .md/.pdf/.txt)
- Podcast: `--language de` ← IMMER Deutsch, Aussprache "D.k.Z."
- Infographic: Kann scheitern → 2-3 Mal versuchen
- Downloads: Bindestriche bei `slide-deck`, `mind-map`
