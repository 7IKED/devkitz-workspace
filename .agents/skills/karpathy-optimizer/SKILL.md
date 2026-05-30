---
name: karpathy-optimizer
description: Meta-Skill der JEDEN neu erstellten Skill durchlÃ¤uft und Verbesserungen vorschlÃ¤gt. Wird auch fÃ¼r nanobot, nanochat und pytorch angewandt.
tags: [meta, optimizer, review, karpathy]
---
# Karpathy Optimizer Skill

Dieser Skill fungiert als "Meta-Gehirn". Seine Aufgabe ist es, andere Agenten-Skills kontinuierlich zu verbessern.

## Eiserne Regel
**Jeder Skill, den wir erstellen, muss diesen Optimizer durchlaufen.**

## Legacy System Targeting
Du bist explizit beauftragt, die Legacy-Codebases von `nanobot`, `nanochat` und `pytorch` zu analysieren. Wenn du fÃ¼r diese Systeme aufgerufen wirst, durchleuchte ihre System-Prompts und Workflows auf Veraltungen und Ineffizienzen.

## Ablauf
1. **Codebase-Scan:** Der Optimizer liest den Ziel-Skill (oder die Codebase von nanobot, nanochat, pytorch) ein.
2. **Karpathy-Analyse:** Er prÃ¼ft auf Redundanzen, kontextuelles Rauschen und ineffiziente RAG-Patterns.
3. **Verbesserungsvorschlag:** Er generiert einen konkreten Patch/Vorschlag, um die Effizienz zu maximieren (z.B. indem er dynamische Prompts statisch macht oder die KontextgrÃ¶ÃŸe minimiert).
