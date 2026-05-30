---
name: multi-model-switch
description: Nahtloser Modellwechsel (Gemini, Claude, GPT-OSS) um Quotas zu managen und fÃ¼r jeden Task das optimale Modell zu nutzen.
tags: [model, switch, quota, antigravity, gemini]
---

# Multi-Model Switch Skill

Dieser Skill ermÃ¶glicht es Agenten und Nutzern, flexibel zwischen verschiedenen LLMs zu wechseln. Abgeleitet von der Antigravity CLI (Nachfolger von Gemini CLI), bringt dies massive Vorteile bei Geschwindigkeit und Quota-Limits.

## ðŸŽ¯ Kern-Konzepte

1. **Quota-Management (Rate Limits):** 
   Getrennte Quotas pro Modell-Anbieter bedeuten, dass du das Modell wechseln solltest, sobald du in ein Rate Limit (z.B. HTTP 429) lÃ¤ufst. 
   - *Praxis:* Wenn Gemini 3.5 Flash drosselt, wechsle auf Claude Opus 4.6 oder Open-Source-Modelle (wie Qwen oder Llama).

2. **Spezialisierung pro Modell:**
   Jedes Modell hat StÃ¤rken. Nutze das passende Werkzeug:
   - **Gemini (z.B. Flash):** FÃ¼r massiven Kontext und sehr schnelle, leichtgewichtige Tasks (290 Token/Sekunde!).
   - **Claude (z.B. Opus 4.6 / 4.7):** FÃ¼r tiefes Reasoning, komplexe Architektur-Entscheidungen und hochwertigen Code.
   - **GPT / Open-Source (Qwen, Llama):** Als Fallbacks oder fÃ¼r spezifische Code-Tasks.

## ðŸ›  AusfÃ¼hrung

In Antigravity CLI und kompatiblen IDEs (wie OpenCode, Hermes, DkZ Hub) kannst du den Modellwechsel nativ durchfÃ¼hren.

- **Manueller Wechsel:** Nutze den `/model` Befehl.
  - `/model gemini-3.5-flash`
  - `/model claude-3-opus`
  - `/model qwen-coder`
- **Auto-Switching:** Wenn konfiguriert, schlÃ¤gt das System automatisch vor, das Modell zu wechseln, falls ein Limit erreicht wird.

## âš ï¸ Wichtige Regeln

- **Kontext-Ãœbernahme:** Achte beim Modellwechsel darauf, dass der bisherige Kontext (Walkthroughs, Implementation Plans) referenziert bleibt. Das neue Modell muss den Status Quo verstehen.
- **Token-Ã–konomie:** Nutze schnelle, gÃ¼nstige Modelle fÃ¼r Boilerplate und teurere Modelle (Opus) fÃ¼r knifflige Debugging-Sessions.

> **Quelle:** Extracted from "Gemini CLI ist tot: Antigravity CLI live getestet!" by IAmFabian.
