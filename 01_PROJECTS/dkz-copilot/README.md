# DkZ CoPilot™ v2.0

> Self-Hosted KI Coding Agent — React + Tailwind Dashboard mit Webhooks

## Architektur

```
GitHub Webhooks ──→ server.py (FastAPI :3050) ──→ agent.py ──→ PR
                        │                           │
Dashboard (React)  ←────┘                           │
                                                    ↓
            ┌─────────────────┐              git_worker.py
            │   Webhooks      │              file_analyzer.py
            │  (Lokal+Remote) │              openhands_client.py
            └─────────────────┘
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
   cloudia.py   vps_ctrl.py   swarm.py
   (Drive Sync) (Docker/SSH)  (12 Bots)
```

## Quick Start

```bash
# 1. Dashboard (React + Tailwind)
cd dashboard && npm install && npm run dev

# 2. Backend (Python FastAPI)
pip install fastapi uvicorn httpx
python -m api.server

# 3. .env erstellen
cp .env.example .env
# GITHUB_TOKEN, WEBHOOK_SECRET eintragen
```

## Komponenten

| Datei | Funktion |
|:------|:---------|
| `api/server.py` | Zentraler Connector — ALLE API Routes |
| `api/agent.py` | Issue → LLM → Code → PR |
| `api/cloudia.py` | CLOUDIA² — Drive + VPS Sync |
| `api/webhook_server.py` | GitHub HMAC Verification |
| `api/webhook_local.py` | Lokaler Webhook Proxy + Simulator |
| `api/vps_controller.py` | VPS Docker/SSH Steuerung |
| `api/integrations.py` | 14 Module An/Aus Toggle |
| `api/swarm.py` | NanoBot Schwarm (12 Bots) |
| `api/desktop_agent.py` | OS-Copilot + Pico Claw |
| `api/file_analyzer.py` | Modul Scanner + XSS Check |
| `api/git_worker.py` | Clone/Branch/Commit/Push/PR |

## Dashboard Tabs

| Tab | Inhalt |
|:----|:-------|
| Home | Stats, Feed, Pico Herzschlag, Swarm |
| GitHub | Issues, PRs, Docs (RULES, PATTERNS, AGENTS) |
| Module | 14 Integration Toggles |
| Chat | Slash-Commands + Wissensbasis + LLM |
| VPS | Status, Docker, Deploy, Backup |
| Hooks | Webhook Tester (Lokal + Remote) |

## Tech Stack

- **Frontend:** React 19 + Vite 6 + Tailwind v4
- **Backend:** Python FastAPI + uvicorn
- **LLM:** vLLM / Ollama (Qwen 3.5 7B)
- **Sync:** rclone (Google Drive), SSH (VPS)
- **Hardware:** Pico Claw (MAX30102 Herzschlag)
