---
name: Grill
description: "Grill-Modus — NanoBot beantwortet Fragen statt User. Durchsucht WissenHub, Research-Archive und Internet für fundierte Antworten."
---

# Grill Mode

NanoBot-gestützter Frage-Antwort-Modus. Statt den User zu fragen, durchsucht NanoBot:

1. WissenHub (lokaler Katalog)
2. Research Archive (Artefakte)
3. Internet (Perplexity/DuckDuckGo)
4. vLLM (lokale Inferenz)

## Nutzung

```
.grill <frage>
```

NanoBot klont sich bei Bedarf und sammelt Antworten aus allen Quellen.
