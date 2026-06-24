# 📋 Nemotron-Schwarm — KANBAN Board

> **Stand:** 2026-06-24 | **Phase:** YOLO-Init

---

## 🟢 Done

| Issue | Agent | Task | Beschreibung |
|:------|:------|:-----|:-------------|
| **NEMO-001** | N-Orchestrator | ✅ Router | `swarm_router.py` — Task-Routing & Intent-Analyse |
| **NEMO-002** | N-Orchestrator | ✅ Memory | `memory_manager.py` — Shared Context & JSON-Persistenz |
| **NEMO-003** | N-Orchestrator | ✅ API Gateway | `api_gateway.py` — REST-API auf Port 3060 für DkZ Dashboard |
| **NEMO-004** | N-Coder | ✅ Agent | `agent_coder.py` — LLM-gesteuerter Coding-Loop (Ollama), Code in `scratch/` |
| **NEMO-005** | N-Researcher | ✅ Agent | `agent_researcher.py` — LLM-Synthese aus Workspace-Scan + Iceberg-Query |
| **NEMO-006** | N-Reviewer | ✅ Agent | `agent_reviewer.py` — LLM-basiertes Code-Review mit Struktur-Report |
| **NEMO-007** | N-Orchestrator | ✅ Daemon + Bridge | `start_swarm.py` — 3 Subprozesse; `telegram_bridge.py` — Telegram-Poll & POST an Gateway |
| **NEMO-009** | Antigravity | ✅ Dashboard | Live-Status-WebSocket Bridge an DkZ Dashboard (via Port 3040) |
| **NEMO-010** | N-Researcher | ✅ Iceberg-Deep-Link | `iceberg_client.py` + API-Gateway-Endpoint + LLM-SQL-Integration in Researcher |
| **NEMO-011** | Alle | ✅ Logging | `logger.py` — Strukturierte JSON-Logs (EventLog-kompatibel) in `LOGS/swarm_YYYY-mm-dd.jsonl` |
| **NEMO-014** | Alle | ✅ LLM-Client | `llm_client.py` — Ollama OpenAI-kompatibler Client mit Retry, Timeout, Role-Prompts |
| **NEMO-021** | DEEPKEEP | ✅ Sanitizer | `deepkeep.py` — Soft-Delete + 7-Tage-Archiv-Regel + Retention-Scan + API-Endpoints in `api_gateway.py` |

---

## 🟡 In Progress

| Issue | Agent | Task | Beschreibung |
|:------|:------|:-----|:-------------|
| *(none — alle aktuellen Tasks abgeschlossen)* |

---

## ⚪ Backlog

| Issue | Agent | Task | Beschreibung |
|:------|:------|:-----|:-------------|
| **NEMO-008** | N-Orchestrator | ✅ Vector Store | `memory/vector_store/` — Ollama-Embedding-API + cosine-similarity Suche |
| NEMO-008 | N-Orchestrator | ⏳ Konfiguration | `config.yaml` — Agent-Settings, Ports, Iceberg-Endpunkt |
| NEMO-012 | N-Coder | ⏳ Template-Bibliothek | Prefab-Code-Templates für häufige Aufgaben |
| NEMO-013 | N-Reviewer | ⏳ Auto-Fix | Automatische Korrekturvorschläge statt nur Report |
| NEMO-015 | N-Coder | ⏳ Multi-File-Projekte | Ganzes Projekt-Scaffolding statt Einzeldateien |
| NEMO-016 | N-Orchestrator | ⏳ Webhook-Queue | n8n/Paperclip-kompatible Ingest-API |
| NEMO-017 | N-Researcher | ⏳ Web-Scraping | Live-Recherche via Firecrawl/WebFetch |
| NEMO-018 | N-Reviewer | ⏳ Security-Scan | Sicherheits-Check im Review (XSS, Injections, Secrets) |
| NEMO-019 | Alle | ⏳ Teststraße | Automatisierte Testkette für Agent-Outputs |
| NEMO-020 | N-Orchestrator | ⏳ Multi-Schwarm | Mehrere parallele Schwarm-Instanzen orchestrieren |

---

## 📊 Status-Legende

| Symbol | Bedeutung |
|:-------|:----------|
| ✅ Done | Feature fertig und getestet |
| 🟡 In Progress | Wird aktuell bearbeitet |
| ⚪ Backlog | Geplant, aber noch nicht gestartet |
| 🔴 Blocked | Abhaengigkeit nicht erfuellt |
