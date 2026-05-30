# DkZ CoPilot&trade; — Self-Hosted Coding Agent

> Eigener GitHub Copilot auf deinem VPS. 0 Kosten. Unlimitiert.
> OpenHands + Ollama + Qwen 3.5 7B + OpenHumans

---

## Features

| Feature | Beschreibung |
|:--------|:-------------|
| **Issue &rarr; PR** | GitHub Issue erstellen &rarr; Agent fixt &rarr; PR erscheint |
| **Multi-LLM** | Qwen 3.5 7B (Coder) + Gemma 4 2B (Mini) + Qwen Coder (Deep) |
| **OpenHands** | Autonomer Coding Agent in Docker Sandbox |
| **PWA App** | Handy + Desktop Steuermodul |
| **Chat** | Chat mit dem Agent (Slash-Commands) |
| **Walkthroughs** | 6 Templates fuer Modul-Fix, Deploy, Audit |
| **Tickets** | Issue-System direkt aus der App |
| **Auto-Review** | PR-Agent fuer automatische Code Reviews |
| **OpenHumans** | Session-Daten fuer Open Science |
| **Offline-First** | PWA mit Service Worker |

## Quick Start

```bash
# 1. Auf VPS klonen
git clone https://github.com/D-VKITZ/KERN.git
cd dkz-copilot

# 2. Konfigurieren
cp .env.example .env
nano .env  # GitHub Token + Secrets eintragen

# 3. Starten
bash startup.sh
```

## Architektur

```
Handy (GitHub App)
  |
  | Issue erstellen + @dkz-bot
  v
VPS (KVM8 Docker)
  +-- DkZ CoPilot API (FastAPI :3050)
  +-- OpenHands (Coding Agent :3000)
  +-- Ollama (3 LLMs :11434)
  +-- n8n (Workflows :5678)
  +-- PR-Agent (Auto Review)
  +-- Nginx (Proxy :80/443)
```

## LLM Routing

| Task | LLM | Tokens |
|:-----|:----|:-------|
| Fix/Bug | Qwen 3.5 7B | ~2000 |
| Feature | Qwen 3.5 7B | ~4000 |
| Text/Summary | Gemma 4 2B | ~500 |
| Refactor | Qwen 2.5 Coder | ~3000 |
| Review | Qwen 2.5 Coder | ~1500 |

## PWA App

- **Dashboard**: Agent-Status, PRs, Issues, Token-Verbrauch
- **Tickets**: Issues erstellen mit LLM-Auswahl
- **Chat**: `/fix modul`, `/create modul`, `/sync`, `/status`
- **Walks**: 6 Walkthrough Templates
- **LLMs**: Multi-Model Status + Routing
- **Sync**: features.json, llms.txt, Git, VPS, Health, Backup

## Dateien

```
dkz-copilot/
  api/
    config.py           # Pydantic Settings
    webhook_server.py   # FastAPI Webhook + API
    agent.py            # Orchestrator
    file_analyzer.py    # Modul-Scanner
    git_worker.py       # Git Operations
    openhands_client.py # OpenHands Integration
    openhumans_client.py# OpenHumans Integration
  app/
    index.html          # PWA (6 Tabs)
    manifest.json       # PWA Manifest
    sw.js               # Service Worker
  java/
    ModuleScanner.java  # Parallel Modul-Scanner
    BatchFixer.java     # Regex-basierte Fixes
  docker-compose.yml    # 6 Services
  Dockerfile            # Python + Java + gh CLI
  nginx.conf            # Reverse Proxy
  startup.sh            # VPS Setup Script
  .env.example          # Environment Template
```

---

*DEVKiTZ&trade; &mdash; 0 Premium Requests. Volle Kontrolle.*
