#!/bin/bash
# ═══════════════════════════════════════════════════════════
# DkZ VPS — Model-Proxy installieren + GGUFs herunterladen
# Ausfuehren auf VPS als root:
#   bash /opt/devkitz/install-model-proxy.sh
# ═══════════════════════════════════════════════════════════
set -e
MODEL_DIR="/opt/devkitz/models"
PROXY_PORT=8900
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}✅${NC} $1"; }
warn() { echo -e "${YELLOW}⚠️ ${NC} $1"; }

mkdir -p "$MODEL_DIR"

# ─── 1. Node.js prüfen ───────────────────────────────────
echo "[1/4] Node.js prüfen..."
if ! command -v node &>/dev/null; then
    warn "Node.js fehlt — installiere..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
log "Node.js: $(node --version)"

# ─── 2. llama-server prüfen ──────────────────────────────
echo "[2/4] llama-server prüfen..."
if ! command -v llama-server &>/dev/null; then
    warn "llama-server fehlt — installiere llama.cpp..."
    apt-get install -y cmake build-essential
    git clone --depth 1 https://github.com/ggerganov/llama.cpp /opt/llamacpp
    cd /opt/llamacpp && cmake -B build && cmake --build build --target llama-server -j$(nproc)
    ln -sf /opt/llamacpp/build/bin/llama-server /usr/local/bin/llama-server
fi
log "llama-server: $(llama-server --version 2>&1 | head -1)"

# ─── 3. GGUFs herunterladen ──────────────────────────────
echo "[3/4] GGUF Modelle herunterladen..."
# pip/huggingface-cli für schnellen Download
pip install -q huggingface_hub[cli] 2>/dev/null || pip3 install -q huggingface_hub[cli] 2>/dev/null || true

dl() {
    local NAME="$1" REPO="$2" FILE="$3"
    local PATH_="$MODEL_DIR/$FILE"
    if [ -f "$PATH_" ]; then
        log "$NAME bereits vorhanden"
    else
        warn "Lade $NAME (~$(du -sh "$PATH_" 2>/dev/null || echo '?'))..."
        if command -v huggingface-cli &>/dev/null; then
            huggingface-cli download "$REPO" "$FILE" --local-dir "$MODEL_DIR" --quiet
        else
            warn "Manueller Download nötig: huggingface-cli download $REPO $FILE --local-dir $MODEL_DIR"
        fi
        [ -f "$PATH_" ] && log "$NAME ✓" || warn "$NAME FEHLT — bitte manuell herunterladen"
    fi
}

# Modelle herunterladen
dl "Qwen3 30B-A3B Q4 (~21GB)"    "Qwen/Qwen3-30B-A3B-GGUF"                      "qwen3-30b-a3b-q4_k_m.gguf"
dl "GPT-OSS 20B Q4 (~12GB)"      "openai/gpt-oss-20b-GGUF"                       "gpt-oss-20b-q4_k_m.gguf"
dl "DeepSeek Coder V2 16B Q4"    "bartowski/DeepSeek-Coder-V2-Lite-Instruct-GGUF" "DeepSeek-Coder-V2-Lite-Instruct-Q4_K_M.gguf"
dl "Qwen2.5-Coder 14B Q4 (~10GB)" "Qwen/Qwen2.5-Coder-14B-Instruct-GGUF"        "qwen2.5-coder-14b-instruct-q4_k_m.gguf"
# 7B bereits vorhanden
log "Qwen2.5-Coder 7B bereits im Einsatz (Port 8000)"

# ─── 4. Proxy als systemd Service ────────────────────────
echo "[4/4] Model-Proxy Service installieren..."
cp /opt/devkitz/model-proxy.js /opt/devkitz/model-proxy.js 2>/dev/null || true

cat > /etc/systemd/system/dkz-model-proxy.service << EOF
[Unit]
Description=DkZ Model-Switch Proxy (Port $PROXY_PORT)
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/devkitz
ExecStart=/usr/bin/node /opt/devkitz/model-proxy.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable dkz-model-proxy
systemctl restart dkz-model-proxy
sleep 2

if curl -sf "http://localhost:$PROXY_PORT/status" | grep -q "currentModel"; then
    log "Model-Proxy läuft auf Port $PROXY_PORT"
else
    warn "Proxy startet noch... Status: journalctl -u dkz-model-proxy -f"
fi

VPS_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ Setup fertig!${NC}"
echo ""
echo "  Proxy Endpoint : http://$VPS_IP:$PROXY_PORT/v1"
echo "  API Key        : DKZ-VLLM-2026-SECURE"
echo "  Status         : http://$VPS_IP:$PROXY_PORT/status"
echo ""
echo "  Modelle (alle über einen Endpoint):"
echo "    • qwen3:30b-a3b        → Reasoning/Agents"
echo "    • gpt-oss:20b          → Agentic Workflows"
echo "    • deepseek-coder-v2:16b → Pure Coding"
echo "    • qwen2.5-coder:14b    → Allround Coding"
echo "    • qwen2.5-coder:7b     → Schnell"
echo ""
echo "  OpenCode config: baseURL = http://$VPS_IP:$PROXY_PORT/v1"
echo "═══════════════════════════════════════════════════════════"
