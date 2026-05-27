---
name: Async Subagents
description: Anleitung zur Erstellung und Nutzung von asynchronen Sub-Agenten für parallele Workflows (z.B. via /goal oder API).
tags: [async, subagent, workflows, antigravity]
---

# Async Subagents Skill

Mit asynchronen Multi-Agent Workflows können Tasks parallelisiert werden. Statt darauf zu warten, dass der Agent eine zeitintensive Aufgabe (wie Web-Research, Scrapping oder einen tiefen Codebase-Scan) beendet, delegierst du die Aufgabe an einen Sub-Agenten, der im Hintergrund arbeitet.

## 🎯 Kern-Konzepte

1. **Nicht-blockierende Ausführung:**
   Ein Sub-Agent blockiert deinen primären Chat- oder Event-Loop nicht. Du kannst weiterarbeiten, während der Sub-Agent im Hintergrund werkelt. Sobald er fertig ist, meldet er sich über eine Message oder einen Notification-Hook zurück.

2. **Spezialisierte Agenten-Rollen:**
   Vergib konkrete Rollen an deine Sub-Agenten:
   - **Research-Agent:** `Geh ins Web und finde alle Docs zu X.`
   - **Test-Agent:** `Lass die Test Suite laufen und repariere fehlschlagende Unit-Tests.`
   - **Review-Agent:** `Analysiere den Code aus PR #42 auf Security-Lücken.`

## 🛠 Ausführung

In der Antigravity CLI und dem DkZ Hub nutzt du oft den Befehl `/goal`, gepaart mit `/btw`, um den Kontext an Sub-Agenten weiterzugeben.

- **Workflow starten:** 
  Nutze `/goal "Führe Aufgabe X detailliert aus, bis sie zu 100% erfüllt ist."`
- **Kontext übergeben:**
  Mit `/btw` kannst du dem laufenden Goal-Agenten nebenbei neue Infos zustecken, ohne seinen Loop zu unterbrechen.
- **Programmgesteuert (API):** 
  Über das `invoke_subagent` Tool kannst du in Code-Skripten Arrays von Sub-Agenten starten (jeder mit `TypeName`, `Role` und `Prompt`).

## ⚠️ Best Practices

- **Handoffs:** Nutze kompakte Handoff-Dokumente, damit Sub-Agenten genau wissen, wo sie ansetzen müssen (vermeidet Context Drift).
- **Graceful Degradation:** Wenn ein Sub-Agent fehlschlägt, sollte der Main-Agent benachrichtigt werden, um die Aufgabe entweder einem anderen Modell zuzuweisen (siehe `multi-model-switch`) oder den Fehler strukturiert zu loggen.

> **Quelle:** Extracted from "Gemini CLI ist tot: Antigravity CLI live getestet!" by IAmFabian.
