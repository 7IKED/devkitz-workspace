# DkZ Copilot & OpenCode System Manual

> **Stand:** 2026-06-24
> **Version:** 2.0 (Master Controller Update)

## Architektur-Übersicht

Das DEVKiTZ Copilot System besteht aus einem modularen Frontend- und Backend-Stack, der speziell für autonome Entwicklung, Agenten-Schwärme und tiefgreifende Git-Integration gebaut wurde.

### Komponenten
1. **Frontend (Copilot UI):** Läuft in jedem DEVKiTZ Modul (`dkz-copilot.js`).
2. **Go-Gateway (Port 3050):** Routet LLM-Requests dynamisch.
3. **Sync-Server (Port 3040):** Haupt-Backend für Datei-Synchronisation und Webhooks.
4. **Agent Hub (Port 3051):** Python-Backend für Git Nexus, Playwright, Voicebox.
5. **OpenResearch Server (Port 3042):** Für Live-Websuchen und Scraping.

---

## Modelle & Provider

Das System nutzt eine dynamische Priorisierung zwischen lokalen und VPS-Modellen:

- **Pi Agent:** Standard-Controller. Steuert Playwright, Open Manus und Browser Use.
- **OpenCode (Hermes):** Der Master-Builder für direkte Code-Generierung und Architektur.
- **Nemotron / Git Nexus:** Delegierender Orchestrator. Erstellt Nanobot-Schwärme für Teilaufgaben.

### Dynamisches LLM Routing
- **Code:** `qwen2.5-coder:7b` (VPS) oder `deepseek-coder-v2` (Local)
- **Logic:** `qwen2.5:32b` (VPS) oder `mistral-nemo:12b` (Local)
- **OCR:** `qwen2.5-vl:7b` (VPS) oder `qwen2-vl` (Local)
- **Vision/Audio/Design:** `gemma4:12b`

---

## Copilot Chat Befehle

Folgende Shortcuts können direkt im Copilot-Chat genutzt werden:

- `.research [Suchbegriff]`: Startet den OpenResearch-Server für eine Live-Websuche.
- `.settings`: Öffnet das Provider- und Modell-Menü.
- `.clear`: Leert den aktuellen Chat-Verlauf.

---

## Autonome Workflows (Git Nexus)

Wenn Issues im Ordner `04_SYSTEM/ISSUES` abgelegt werden, greift der **Nemotron Agent Swarm** automatisch ein:
1. Er analysiert das Issue.
2. Er generiert Nanobots für Dokumentation (`docs`) und Logik (`logic`).
3. Er erstellt einen Branch, commitet die Lösung und aktualisiert `KANBAN_AUTO.md` sowie `WALKTHROUGH_AUTO.md`.
