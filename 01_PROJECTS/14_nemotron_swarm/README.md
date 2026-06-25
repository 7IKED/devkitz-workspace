# Nemotron Swarm

> Nvidia Nemotron-basiertes Multi-Agenten-System — YOLO-Mode fur parallele Datenverarbeitung

## Architektur

```
14_nemotron_swarm/
├── orchestrator/            ← Master-Node (Python)
│   ├── api_gateway.py       ← REST/WebSocket API (:3060)
│   ├── swarm_router.py      ← Task-Routing & Intent-Analyse
│   ├── llm_client.py        ← Ollama OpenAI-kompatibler Client
│   ├── start_swarm.py       ← Daemon: 3 Subprozesse
│   ├── telegram_bridge.py   ← Telegram Polling Bridge
│   ├── iceberg_client.py    ← Go Iceberg :9881 Query
│   ├── deepkeep.py          ← Sanitizer: Soft-Delete + Retention
│   ├── logger.py            ← JSON EventLog (LOGS/)
│   └── config.py            ← Agent-Settings
├── agents/                  ← Spezialisierte Worker
│   ├── agent_researcher.py  ← Web + Iceberg Recherche
│   ├── agent_coder.py       ← YOLO-Coder fur POCs
│   └── agent_reviewer.py    ← Nemotron Code Review
├── memory/                  ← Shared Context
├── LOGS/                    ← Strukturierte JSON-Logs
├── scratch/                 ← Arbeitsverzeichnis
├── BLAUPAUSE.md             ← Blueprint & Vision
└── KANBAN_NEMOTRON.md       ← Task Board (NEMO-*)
```

## Agenten-Rollen

| Rolle | ID | Aufgabe |
|:------|:---|:--------|
| **N-Orchestrator** | `nemo-master` | Task Routing, API, Telegram Bridge |
| **N-Researcher** | `nemo-res` | Kontext-Beschaffung, Iceberg Queries |
| **N-Coder** | `nemo-code` | Schnelle Skripte / POCs (YOLO-Modus) |
| **N-Reviewer** | `nemo-rev` | Code-Review + Struktur-Report |

## Quick Start

```bash
# Swarm starten (3 Subprozesse)
python orchestrator/start_swarm.py

# API Gateway einzeln
python orchestrator/api_gateway.py

# Telegram Bridge
python orchestrator/telegram_bridge.py
```

## API Endpoints

| Endpoint | Methode | Beschreibung |
|:---------|:--------|:-------------|
| `/api/v1/dispatch` | POST | Task an Swarm senden |
| `/api/v1/status` | GET | Swarm-Health |
| `/api/v1/logs` | GET | JSON-Logs abrufen |
| `/api/v1/iceberg/query` | POST | Iceberg-Query |
| `/api/v1/deepkeep/scan` | GET | Retention-Scan ausfuhren |

## Dependencies

- Python 3.10+
- Ollama (lokal) mit Nemotron Modell
- Go Iceberg Backend (:9881)
- Optional: DkZ Dashboard (:3089) fur Live-Status via WebSocket

---

*DEVKiTZ — Nemotron Swarm v1.00*
