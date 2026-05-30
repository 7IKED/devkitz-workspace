#!/bin/bash
# DkZ CoPilot — VPS Startup Script
# Ausfuehren auf KVM8: bash startup.sh

set -e

echo "============================================"
echo "  DkZ CoPilot — Self-Hosted Coding Agent"
echo "  OpenHands + Ollama + n8n + PR-Agent"
echo "============================================"

# 1. .env pruefen
if [ ! -f .env ]; then
    echo "[!] .env nicht gefunden — kopiere .env.example"
    cp .env.example .env
    echo "[!] BITTE .env EDITIEREN: nano .env"
    exit 1
fi

source .env

# 2. Docker pruefen
if ! command -v docker &>/dev/null; then
    echo "[!] Docker nicht installiert"
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "[x] Docker installiert — bitte neu einloggen"
fi

# 3. Docker Compose starten
echo ""
echo "[1/5] Docker Stack starten..."
docker compose up -d

# 4. Ollama Models laden
echo ""
echo "[2/5] LLM Models laden (kann dauern)..."
docker exec ollama ollama pull qwen3.5:7b
docker exec ollama ollama pull gemma4:2b
docker exec ollama ollama pull qwen2.5-coder:7b
echo "[x] 3 Models geladen"

# 5. GitHub Webhook einrichten
echo ""
echo "[3/5] GitHub Webhook pruefen..."
WEBHOOK_EXISTS=$(gh api repos/${REPO_OWNER:-D-VKITZ}/${DEFAULT_REPO:-KERN}/hooks \
    --jq '.[].config.url' 2>/dev/null | grep -c "webhook" || true)

if [ "$WEBHOOK_EXISTS" = "0" ]; then
    echo "    Webhook wird erstellt..."
    gh api repos/${REPO_OWNER:-D-VKITZ}/${DEFAULT_REPO:-KERN}/hooks \
        --method POST \
        -f name=web \
        -f "config[url]=http://${DOMAIN:-localhost}/webhook" \
        -f "config[content_type]=json" \
        -f "config[secret]=${WEBHOOK_SECRET}" \
        -f "events[]=issues" \
        -f "events[]=issue_comment" \
        -f "events[]=pull_request" \
        -f active=true 2>/dev/null
    echo "[x] Webhook erstellt"
else
    echo "[x] Webhook existiert bereits"
fi

# 6. Health Check
echo ""
echo "[4/5] Health Check..."
sleep 5

check_service() {
    local name=$1 url=$2
    if curl -sf "$url" >/dev/null 2>&1; then
        echo "    [x] $name: ONLINE"
    else
        echo "    [ ] $name: OFFLINE (startet noch...)"
    fi
}

check_service "CoPilot API" "http://localhost:3050/health"
check_service "OpenHands"   "http://localhost:3000"
check_service "Ollama"      "http://localhost:11434/api/tags"
check_service "n8n"         "http://localhost:5678"

# 7. Fertig
echo ""
echo "[5/5] Zusammenfassung"
echo "============================================"
echo "  CoPilot API:  http://${DOMAIN:-localhost}:3050"
echo "  CoPilot App:  http://${DOMAIN:-localhost}/copilot"
echo "  OpenHands:    http://${DOMAIN:-localhost}:3000"
echo "  n8n:          http://${DOMAIN:-localhost}:5678"
echo "  Ollama:       http://${DOMAIN:-localhost}:11434"
echo ""
echo "  Models: qwen3.5:7b, gemma4:2b, qwen2.5-coder:7b"
echo "  Webhook: http://${DOMAIN:-localhost}/webhook"
echo "============================================"
echo ""
echo "Teste: Erstelle ein Issue in D-VKITZ/KERN"
echo "mit Label 'copilot' oder assign an 'dkz-bot'"
