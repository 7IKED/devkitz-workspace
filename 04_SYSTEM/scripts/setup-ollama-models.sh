#!/bin/bash
# ═══════════════════════════════════════════════════════════
# DkZ VPS — Ollama Multi-Model Setup
# Alle 5 Modelle installieren + als Dienst einrichten
# Ausfuehren auf VPS: bash /opt/devkitz/setup-ollama-models.sh
# ═══════════════════════════════════════════════════════════
set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}✅${NC} $1"; }
warn() { echo -e "${YELLOW}⚠️ ${NC} $1"; }
err()  { echo -e "${RED}❌${NC} $1"; exit 1; }

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  DkZ VPS — Ollama Multi-Model Setup"
echo "  5 Modelle · On-Demand Loading · Port 8811"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ─── 1. Ollama installieren ──────────────────────────────────
echo "[1/4] Ollama prüfen / installieren..."
if command -v ollama &>/dev/null; then
    log "Ollama bereits installiert: $(ollama --version)"
else
    warn "Installiere Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    log "Ollama installiert"
fi

# ─── 2. Ollama systemd Service (Port 8811, alle IPs) ────────
echo ""
echo "[2/4] Ollama Service konfigurieren (Port 8811)..."
mkdir -p /etc/systemd/system/ollama.service.d/
cat > /etc/systemd/system/ollama.service.d/override.conf << 'EOF'
[Service]
Environment="OLLAMA_HOST=0.0.0.0:8811"
Environment="OLLAMA_KEEP_ALIVE=0"
Environment="OLLAMA_MAX_LOADED_MODELS=1"
Environment="OLLAMA_NUM_PARALLEL=1"
EOF

# Service starten
systemctl daemon-reload
systemctl enable ollama
systemctl restart ollama
sleep 3

if curl -sf http://localhost:8811/api/tags &>/dev/null; then
    log "Ollama laeuft auf Port 8811"
else
    err "Ollama Start fehlgeschlagen. Logs: journalctl -u ollama -n 20"
fi

# ─── 3. Modelle herunterladen ────────────────────────────────
echo ""
echo "[3/4] Modelle herunterladen (nur augewaehltes wird geladen)..."
echo "  OLLAMA_KEEP_ALIVE=0 → Modell wird nach Anfrage sofort entladen"
echo ""

MODELS=(
    "qwen3:30b-a3b"
    "gpt-oss:20b"
    "deepseek-coder-v2:16b"
    "qwen2.5-coder:14b"
    "qwen2.5-coder:7b"
)

NAMES=(
    "Qwen3.6 35B-A3B (MoE · 14-16 GB RAM)"
    "GPT-OSS 20B (13-15 GB RAM)"
    "DeepSeek Coder V2 16B (9-11 GB RAM)"
    "Qwen2.5-Coder 14B (8-10 GB RAM)"
    "Qwen3-Coder 7B (4-6 GB RAM)"
)

for i in "${!MODELS[@]}"; do
    MODEL="${MODELS[$i]}"
    NAME="${NAMES[$i]}"
    echo "  → ${NAME}..."
    if ollama list 2>/dev/null | grep -q "$MODEL"; then
        log "$MODEL bereits vorhanden"
    else
        ollama pull "$MODEL" && log "$MODEL heruntergeladen" || warn "$MODEL Download fehlgeschlagen (manuell: ollama pull $MODEL)"
    fi
    # Sofort entladen nach Pull
    ollama stop "$MODEL" 2>/dev/null || true
done

# ─── 4. Zusammenfassung ──────────────────────────────────────
echo ""
echo "[4/4] Modell-Liste prüfen..."
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
echo ""
ollama list
echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ Setup abgeschlossen!${NC}"
echo ""
echo "  Endpoint  : http://$VPS_IP:8811"
echo "  API (OAI) : http://$VPS_IP:8811/v1"
echo "  Modelle   :"
for i in "${!MODELS[@]}"; do
    echo "    • ${MODELS[$i]} — ${NAMES[$i]}"
done
echo ""
echo "  Modell wechseln (lokal testen):"
echo "    ollama run qwen2.5-coder:7b"
echo "    ollama run deepseek-coder-v2:16b"
echo ""
echo "  OpenCode: Modell im Selector wählen → automatisch geladen"
echo "═══════════════════════════════════════════════════════════"
