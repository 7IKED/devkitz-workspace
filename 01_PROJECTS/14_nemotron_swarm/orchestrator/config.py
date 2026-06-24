"""
config.py — Zentrale Konfiguration fuer Nemotron Swarm

Alle hartcodierten Werte (Ports, Pfade, Timeouts, URLs) werden
hier als Modul-Konstanten definiert und von allen Modulen importiert.
"""

import os

# ---------------------------------------------------------------------------
# Projekt-Root (base dir aller relativen Pfade)
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..")
)

# ---------------------------------------------------------------------------
# API Gateway
# ---------------------------------------------------------------------------
API_HOST = "0.0.0.0"
API_PORT = 3060
SWARM_VERSION = "0.2.0"

# ---------------------------------------------------------------------------
# Vector Store
# ---------------------------------------------------------------------------
VECTOR_STORE_PATH = os.path.join(PROJECT_ROOT, "memory", "vector_store")

# ---------------------------------------------------------------------------
# Dashboard Hub (Node.js)
# ---------------------------------------------------------------------------
DASHBOARD_HUB_URL = "http://localhost:3040/api/v1/swarm/data/query"

# ---------------------------------------------------------------------------
# DEEPKEEP (Sanitizer / Archiv)
# ---------------------------------------------------------------------------
ARCHIVE_ROOT = os.path.join(PROJECT_ROOT, "99_ARCHIVE")
SECONDS_PER_DAY = 86400
RETENTION_DAYS = 7

# ---------------------------------------------------------------------------
# Iceberg Go-Backend (Port 9881)
# ---------------------------------------------------------------------------
ICEBERG_BASE = "http://localhost:9881"
ICEBERG_QUERY_PATH = "/api/v1/query"
ICEBERG_SCHEMA_PATH = "/api/v1/schema"
ICEBERG_TIMEOUT = 30
ICEBERG_CACHE_TTL = 300

# ---------------------------------------------------------------------------
# Ollama (LLM)
# ---------------------------------------------------------------------------
OLLAMA_BASE = "http://localhost:11434/v1"
OLLAMA_DEFAULT_MODEL = "mistral-nemo"
OLLAMA_TIMEOUT = 120
OLLAMA_MAX_RETRIES = 2

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
LOG_DIR = os.path.join(PROJECT_ROOT, "LOGS")

# ---------------------------------------------------------------------------
# Agenten
# ---------------------------------------------------------------------------
AGENTS_DIR = os.path.join(PROJECT_ROOT, "agents")

AGENT_SCRIPTS = {
    "nemo-code": os.path.join(AGENTS_DIR, "agent_coder.py"),
    "nemo-res": os.path.join(AGENTS_DIR, "agent_researcher.py"),
    "nemo-rev": os.path.join(AGENTS_DIR, "agent_reviewer.py"),
}

# ---------------------------------------------------------------------------
# Telegram Bridge
# ---------------------------------------------------------------------------
TELEGRAM_POLL_INTERVAL = 5
GATEWAY_URL = f"http://localhost:{API_PORT}/api/v1/swarm/task"
DOTENV_PATH = os.path.join(PROJECT_ROOT, "..", "..", ".env")
