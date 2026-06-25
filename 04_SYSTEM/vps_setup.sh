#!/bin/bash
# DEVKiTZ VPS / Puter Setup Skript (Playwright + OpenManus)

echo "🚀 Starte DEVKiTZ VPS Setup..."

# 1. Update & Basis-Pakete
sudo apt-get update
sudo apt-get install -y curl wget git python3 python3-pip xvfb

# 2. Node.js installieren (falls nicht vorhanden)
if ! command -v node &> /dev/null; then
    echo "📦 Installiere Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 3. Playwright & Browser Binaries installieren
echo "🎭 Richte Playwright ein..."
mkdir -p ~/devkitz_e2e && cd ~/devkitz_e2e
npm init -y
npm install -D @playwright/test
npx playwright install --with-deps chromium

# 4. OpenManus konfigurieren (falls Ordner existiert)
if [ -d "$HOME/openmanus" ]; then
    echo "🤖 Richte OpenManus ein..."
    cd ~/openmanus
    pip3 install -r requirements.txt
else
    echo "⚠️ OpenManus Ordner nicht gefunden. Überspringe Python deps."
fi

echo "✅ Setup abgeschlossen! Playwright und OpenManus sind bereit."
echo "Nutze 'xvfb-run npx playwright test --ui' um Tests mit GUI-Stream auszuführen!"
