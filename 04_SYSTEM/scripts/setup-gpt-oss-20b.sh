#!/bin/bash
# ═══════════════════════════════════════════════════════
# DkZ VPS — GPT OSS 20B Setup
# Ausfuehren auf VPS als root:
#   bash /opt/devkitz/setup-gpt-oss-20b.sh
# ═══════════════════════════════════════════════════════
set -e

MODEL_DIR="/opt/devkitz/models"
VLLM_PORT=8000
LLAMACPP_PORT=8001
API_KEY="DKZ-VLLM-2026-SECURE"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[OK]${NC}  $1"; }
warn() { echo -e "${YELLOW}[!!]${NC}  $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; }

echo ""
echo "═══════════════════════════════════════════════════"
echo "  DkZ VPS — GPT OSS 20B Setup"
echo "═══════════════════════════════════════════════════"
echo ""

# ─── 1. System Check ────────────────────────────────────
echo "[1/6] System-Check..."
GPU_VRAM=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits 2>/dev/null | head -1 || echo "0")
RAM_GB=$(free -g | awk '/Mem:/{print $2}')
DISK_FREE=$(df -BG "$MODEL_DIR" 2>/dev/null | awk 'NR==2{print $4}' | tr -d 'G')

echo "  GPU VRAM : ${GPU_VRAM} MB"
echo "  RAM      : ${RAM_GB} GB"
echo "  Disk frei: ${DISK_FREE} GB"
mkdir -p "$MODEL_DIR"

# GPT OSS 20B Anforderungen: ~13GB GGUF Q4 / ~40GB GPU vRAM fuer vLLM
if [ "$GPU_VRAM" -gt 20000 ] 2>/dev/null; then
    MODE="vllm"
    log "Genuegend GPU-VRAM fuer vLLM"
elif [ "$RAM_GB" -gt 20 ] 2>/dev/null; then
    MODE="llamacpp"
    warn "Kein GPU oder zu wenig VRAM — nutze llama.cpp (CPU/RAM)"
else
    err "Zu wenig Ressourcen! Mindestens 20GB RAM oder 20GB VRAM benoetigt."
    exit 1
fi

echo "  Gewaehlter Modus: $MODE"
echo ""

# ─── 2. Modell herunterladen ─────────────────────────────
echo "[2/6] GPT OSS 20B GGUF herunterladen..."
MODEL_FILE="gpt-oss-20b-q4_k_m.gguf"
MODEL_PATH="$MODEL_DIR/$MODEL_FILE"

if [ -f "$MODEL_PATH" ]; then
    log "Modell bereits vorhanden: $MODEL_PATH"
else
    warn "Lade GPT OSS 20B Q4_K_M (~13GB) herunter..."
    # Hugging Face: OpenAI GPT-OSS-20B GGUF
    HF_REPO="openai/gpt-oss-20b-GGUF"
    HF_FILE="gpt-oss-20b-q4_k_m.gguf"
    HF_URL="https://huggingface.co/$HF_REPO/resolve/main/$HF_FILE"

    # Versuche mit huggingface-cli (schneller)
    if command -v huggingface-cli &>/dev/null; then
        log "Nutze huggingface-cli (empfohlen)..."
        huggingface-cli download "$HF_REPO" "$HF_FILE" --local-dir "$MODEL_DIR"
    else
        warn "huggingface-cli nicht installiert — installiere es..."
        pip install -q huggingface_hub[cli] 2>/dev/null || pip3 install -q huggingface_hub[cli]
        huggingface-cli download "$HF_REPO" "$HF_FILE" --local-dir "$MODEL_DIR"
    fi

    if [ ! -f "$MODEL_PATH" ]; then
        warn "HF Download fehlgeschlagen — versuche wget direkt..."
        wget -q --show-progress -O "$MODEL_PATH" "$HF_URL" || {
            err "Download fehlgeschlagen. Bitte manuell herunterladen:"
            echo "  wget -O $MODEL_PATH '$HF_URL'"
            echo "  ODER: huggingface-cli download $HF_REPO $HF_FILE --local-dir $MODEL_DIR"
            exit 1
        }
    fi
    log "Modell heruntergeladen: $MODEL_PATH"
fi

# ─── 3. Setup je nach Modus ─────────────────────────────
echo ""
if [ "$MODE" = "vllm" ]; then

    echo "[3/6] vLLM Setup..."
    # vLLM installieren falls nicht vorhanden
    if ! command -v vllm &>/dev/null; then
        warn "vLLM nicht installiert — installiere..."
        pip install -q vllm 2>/dev/null || pip3 install -q vllm
    fi
    log "vLLM verfuegbar"

    echo "[4/6] Stoppe alten vLLM-Prozess..."
    pkill -f "vllm serve" 2>/dev/null || true
    sleep 2

    echo "[5/6] Erstelle vLLM systemd Service..."
    cat > /etc/systemd/system/dkz-vllm-gpt20b.service << EOF
[Unit]
Description=DkZ vLLM — GPT OSS 20B
After=network.target
Wants=network.target

[Service]
Type=simple
WorkingDirectory=/opt/devkitz
ExecStart=vllm serve $MODEL_PATH \\
    --host 0.0.0.0 \\
    --port $VLLM_PORT \\
    --api-key $API_KEY \\
    --max-model-len 8192 \\
    --dtype auto \\
    --trust-remote-code
Restart=always
RestartSec=10
Environment=CUDA_VISIBLE_DEVICES=0
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    echo "[6/6] Starte vLLM Service..."
    systemctl daemon-reload
    systemctl enable dkz-vllm-gpt20b
    systemctl restart dkz-vllm-gpt20b

    sleep 5
    # Test
    if curl -sf "http://localhost:$VLLM_PORT/v1/models" -H "Authorization: Bearer $API_KEY" | grep -q "model"; then
        log "vLLM laeuft! GPT OSS 20B bereit auf Port $VLLM_PORT"
    else
        warn "vLLM startet noch... (grosses Modell braucht 30-90s)"
        echo "  Status: systemctl status dkz-vllm-gpt20b"
        echo "  Logs:   journalctl -u dkz-vllm-gpt20b -f"
    fi

else  # llama.cpp

    echo "[3/6] llama.cpp Setup..."
    if ! command -v llama-server &>/dev/null && ! command -v llama.cpp &>/dev/null; then
        warn "llama.cpp nicht installiert — installiere..."
        LLAMACPP_VERSION="b4900"
        ARCH=$(uname -m)
        if [ "$ARCH" = "x86_64" ]; then
            LLAMACPP_URL="https://github.com/ggerganov/llama.cpp/releases/latest/download/llama-$LLAMACPP_VERSION-bin-ubuntu-x64.zip"
        else
            LLAMACPP_URL="https://github.com/ggerganov/llama.cpp/releases/latest/download/llama-$LLAMACPP_VERSION-bin-ubuntu-arm64.zip"
        fi
        mkdir -p /opt/llamacpp
        wget -q -O /tmp/llamacpp.zip "$LLAMACPP_URL"
        unzip -qo /tmp/llamacpp.zip -d /opt/llamacpp/
        chmod +x /opt/llamacpp/llama-server 2>/dev/null || true
        ln -sf /opt/llamacpp/llama-server /usr/local/bin/llama-server 2>/dev/null || true
        log "llama.cpp installiert"
    else
        log "llama.cpp verfuegbar"
    fi

    # Pfad herausfinden
    LLAMA_BIN=$(command -v llama-server 2>/dev/null || echo "/opt/llamacpp/llama-server")

    echo "[4/6] Stoppe alten llama-server..."
    pkill -f "llama-server" 2>/dev/null || true
    sleep 1

    echo "[5/6] Erstelle llama.cpp systemd Service..."
    # RAM-Threads optimal setzen
    CORES=$(nproc)
    THREADS=$((CORES > 8 ? 8 : CORES))

    cat > /etc/systemd/system/dkz-llamacpp-gpt20b.service << EOF
[Unit]
Description=DkZ llama.cpp — GPT OSS 20B
After=network.target
Wants=network.target

[Service]
Type=simple
WorkingDirectory=/opt/devkitz
ExecStart=$LLAMA_BIN \\
    --model $MODEL_PATH \\
    --host 0.0.0.0 \\
    --port $LLAMACPP_PORT \\
    --api-key $API_KEY \\
    --ctx-size 8192 \\
    --threads $THREADS \\
    --n-predict -1 \\
    --log-disable
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    echo "[6/6] Starte llama.cpp Service..."
    systemctl daemon-reload
    systemctl enable dkz-llamacpp-gpt20b
    systemctl restart dkz-llamacpp-gpt20b

    sleep 3
    if curl -sf "http://localhost:$LLAMACPP_PORT/v1/models" -H "Authorization: Bearer $API_KEY" 2>/dev/null | grep -q "model"; then
        log "llama.cpp laeuft! GPT OSS 20B bereit auf Port $LLAMACPP_PORT"
    else
        warn "llama.cpp startet noch... (braucht 10-30s)"
        echo "  Status: systemctl status dkz-llamacpp-gpt20b"
        echo "  Logs:   journalctl -u dkz-llamacpp-gpt20b -f"
    fi
fi

# ─── Zusammenfassung ────────────────────────────────────
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo "═══════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ Setup abgeschlossen!${NC}"
echo ""
if [ "$MODE" = "vllm" ]; then
    echo "  Endpoint : http://$VPS_IP:$VLLM_PORT/v1"
    echo "  API Key  : $API_KEY"
    echo "  Model ID : $MODEL_PATH"
    echo "  Test     : curl http://$VPS_IP:$VLLM_PORT/v1/models -H 'Authorization: Bearer $API_KEY'"
else
    echo "  Endpoint : http://$VPS_IP:$LLAMACPP_PORT/v1"
    echo "  API Key  : $API_KEY"
    echo "  Model ID : $MODEL_PATH"
    echo "  Test     : curl http://$VPS_IP:$LLAMACPP_PORT/v1/models -H 'Authorization: Bearer $API_KEY'"
fi
echo ""
echo "  OpenCode config.json update:"
echo "    model: \"vps-vllm/gpt-oss-20b\"   (fuer vLLM)"
echo "    oder"
echo "    model: \"local-llamacpp/gpt-oss-20b\"   (fuer llama.cpp)"
echo "═══════════════════════════════════════════════════"
