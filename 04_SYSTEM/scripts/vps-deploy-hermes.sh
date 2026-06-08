#!/bin/bash
# ==================================================
# DkZ VPS Deploy Script — Hermes + OpenCode
# Ausfuehren auf VPS: bash /opt/hermes/deploy.sh
# ==================================================

set -e
echo "⚡ DkZ VPS Deploy — Hermes + OpenCode"
echo "======================================"

# --- Config ---
HERMES_DATA="/opt/hermes-data"
OPENCODE_DATA="/opt/opencode-data"
GEMINI_KEY="${GEMINI_API_KEY:-AIzaSyDquV5JdPoLr_C9pqUD6J3vAcSQ_opuy_E}"
API_KEY="${API_SERVER_KEY:-dkz-hermes-$(openssl rand -hex 8)}"

# --- 1. Verzeichnisse ---
echo "[1/6] Verzeichnisse erstellen..."
mkdir -p "$HERMES_DATA" "$OPENCODE_DATA" /opt/hermes /opt/opencode

# --- 2. Hermes Agent klonen ---
echo "[2/6] Hermes Agent..."
if [ -d "/opt/hermes/hermes-agent/.git" ]; then
    echo "  Repo existiert — pulling latest..."
    cd /opt/hermes/hermes-agent && git pull --ff-only 2>/dev/null || echo "  Pull fehlgeschlagen, nutze bestehend"
else
    echo "  Klone Hermes Agent..."
    cd /opt/hermes
    git clone --depth 1 https://github.com/hermes-contrib/hermes-agent.git 2>/dev/null || \
    git clone --depth 1 https://github.com/lmstudio-ai/hermes.git hermes-agent 2>/dev/null || \
    echo "  WARNUNG: Konnte Repo nicht klonen. Nutze Docker Hub Image falls verfuegbar."
fi

# --- 3. Hermes .env ---
echo "[3/6] Hermes Config..."
cat > /opt/hermes/.env << EOF
GEMINI_API_KEY=${GEMINI_KEY}
GOOGLE_API_KEY=${GEMINI_KEY}
API_SERVER_KEY=${API_KEY}
API_SERVER_HOST=0.0.0.0
HERMES_UID=0
HERMES_GID=0
EOF

# Hermes Config in Data Volume
mkdir -p "$HERMES_DATA"
if [ ! -f "$HERMES_DATA/config.yaml" ]; then
    cat > "$HERMES_DATA/config.yaml" << 'YAML'
model:
  default: gemini/gemini-2.5-flash
  provider: gemini
terminal:
  backend: local
  timeout: 180
browser:
  inactivity_timeout: 120
memory:
  memory_enabled: true
  user_profile_enabled: true
streaming: true
agent:
  max_turns: 60
  reasoning_effort: medium
platforms:
  api_server:
    enabled: true
    extra:
      port: 8642
      host: 0.0.0.0
YAML
    echo "  Config erstellt"
else
    echo "  Config existiert bereits"
fi

# --- 4. Docker Compose ---
echo "[4/6] Docker Compose..."
cat > /opt/hermes/docker-compose.yml << 'COMPOSE'
services:
  gateway:
    build:
      context: ./hermes-agent
      dockerfile: Dockerfile
    image: hermes-agent:latest
    container_name: hermes
    restart: unless-stopped
    network_mode: host
    env_file: .env
    volumes:
      - /opt/hermes-data:/opt/data
    command: ["gateway", "run"]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8642/v1/models"]
      interval: 30s
      timeout: 10s
      retries: 3

  dashboard:
    image: hermes-agent:latest
    container_name: hermes-dashboard
    restart: unless-stopped
    network_mode: host
    depends_on:
      gateway:
        condition: service_healthy
    env_file: .env
    volumes:
      - /opt/hermes-data:/opt/data
    command: ["dashboard", "--host", "0.0.0.0", "--port", "9119", "--no-open"]
COMPOSE

# --- 5. OpenCode ---
echo "[5/6] OpenCode Web..."
if [ ! -f "/opt/opencode/opencode" ]; then
    echo "  Downloading OpenCode..."
    ARCH=$(uname -m)
    if [ "$ARCH" = "x86_64" ]; then
        curl -sL "https://github.com/opencode-ai/opencode/releases/latest/download/opencode_linux_amd64" -o /opt/opencode/opencode 2>/dev/null || \
        echo "  WARNUNG: Download fehlgeschlagen"
    else
        echo "  Architektur $ARCH — manueller Download noetig"
    fi
    chmod +x /opt/opencode/opencode 2>/dev/null
else
    echo "  OpenCode Binary existiert"
fi

# OpenCode als systemd Service
cat > /etc/systemd/system/opencode-web.service << EOF
[Unit]
Description=OpenCode Web UI
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/opencode
ExecStart=/opt/opencode/opencode web --port 9900 --host 0.0.0.0
Restart=always
RestartSec=5
Environment=GEMINI_API_KEY=${GEMINI_KEY}
Environment=OLLAMA_HOST=http://127.0.0.1:8811

[Install]
WantedBy=multi-user.target
EOF

# --- 6. Starten ---
echo "[6/6] Services starten..."
echo "  Building Hermes Docker image..."
cd /opt/hermes
if [ -d "hermes-agent" ]; then
    docker compose build --no-cache 2>&1 | tail -5
    docker compose up -d 2>&1
    echo "  Hermes: Gateway + Dashboard gestartet"
else
    echo "  SKIP: Hermes Repo nicht gefunden"
fi

if [ -f "/opt/opencode/opencode" ]; then
    systemctl daemon-reload
    systemctl enable opencode-web
    systemctl start opencode-web
    echo "  OpenCode Web: gestartet auf :9900"
else
    echo "  SKIP: OpenCode Binary nicht gefunden"
fi

echo ""
echo "======================================"
echo "✅ Deploy abgeschlossen!"
echo ""
echo "  Hermes Dashboard: http://$(hostname -I | awk '{print $1}'):9119"
echo "  Hermes API:       http://$(hostname -I | awk '{print $1}'):8642"
echo "  OpenCode Web:     http://$(hostname -I | awk '{print $1}'):9900"
echo "  API Key:          ${API_KEY}"
echo ""
echo "  Chatverlauf: /opt/hermes-data/ (persistent)"
echo "======================================"
