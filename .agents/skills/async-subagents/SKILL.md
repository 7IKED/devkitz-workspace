---
name: async-subagents
description: Anleitung zur Erstellung und Nutzung von asynchronen Sub-Agenten fÃ¼r parallele Workflows (z.B. via /goal oder API).
tags: [async, subagent, workflows, antigravity]
---

# Async Subagents Skill

Mit asynchronen Multi-Agent Workflows kÃ¶nnen Tasks parallelisiert werden. Statt darauf zu warten, dass der Agent eine zeitintensive Aufgabe (wie Web-Research, Scrapping oder einen tiefen Codebase-Scan) beendet, delegierst du die Aufgabe an einen Sub-Agenten, der im Hintergrund arbeitet.

## ðŸŽ¯ Kern-Konzepte

1. **Nicht-blockierende AusfÃ¼hrung:**
   Ein Sub-Agent blockiert deinen primÃ¤ren Chat- oder Event-Loop nicht. Du kannst weiterarbeiten, wÃ¤hrend der Sub-Agent im Hintergrund werkelt. Sobald er fertig ist, meldet er sich Ã¼ber eine Message oder einen Notification-Hook zurÃ¼ck.

2. **Spezialisierte Agenten-Rollen:**
   Vergib konkrete Rollen an deine Sub-Agenten:
   - **Research-Agent:** `Geh ins Web und finde alle Docs zu X.`
   - **Test-Agent:** `Lass die Test Suite laufen und repariere fehlschlagende Unit-Tests.`
   - **Review-Agent:** `Analysiere den Code aus PR #42 auf Security-LÃ¼cken.`

## ðŸ›  AusfÃ¼hrung

In der Antigravity CLI und dem DkZ Hub nutzt du oft den Befehl `/goal`, gepaart mit `/btw`, um den Kontext an Sub-Agenten weiterzugeben.

- **Workflow starten:** 
  Nutze `/goal "FÃ¼hre Aufgabe X detailliert aus, bis sie zu 100% erfÃ¼llt ist."`
- **Kontext Ã¼bergeben:**
  Mit `/btw` kannst du dem laufenden Goal-Agenten nebenbei neue Infos zustecken, ohne seinen Loop zu unterbrechen.
- **Programmgesteuert (API):** 
  Ãœber das `invoke_subagent` Tool kannst du in Code-Skripten Arrays von Sub-Agenten starten (jeder mit `TypeName`, `Role` und `Prompt`).

## âš ï¸ Best Practices

- **Handoffs:** Nutze kompakte Handoff-Dokumente, damit Sub-Agenten genau wissen, wo sie ansetzen mÃ¼ssen (vermeidet Context Drift).
- **Graceful Degradation:** Wenn ein Sub-Agent fehlschlÃ¤gt, sollte der Main-Agent benachrichtigt werden, um die Aufgabe entweder einem anderen Modell zuzuweisen (siehe `multi-model-switch`) oder den Fehler strukturiert zu loggen.

> **Quelle:** Extracted from "Gemini CLI ist tot: Antigravity CLI live getestet!" by IAmFabian.
