#!/bin/bash
# DEVKiTZ VPS Deployment Script

echo "=> Starte DEVKiTZ VPS Deployment..."

# 1. Erstelle Datenverzeichnisse, falls nicht vorhanden
mkdir -p data/anythingllm data/dashy data/graphify data/gitnexus
touch data/dashy/conf.yml

# 2. Kopiere die NGINX Konfiguration (setzt NGINX voraus)
if [ -d "/etc/nginx/sites-available" ]; then
    echo "=> Kopiere nginx-proxy.conf nach /etc/nginx/sites-available/dkz-app"
    sudo cp nginx-proxy.conf /etc/nginx/sites-available/dkz-app
    sudo ln -sf /etc/nginx/sites-available/dkz-app /etc/nginx/sites-enabled/dkz-app
    sudo nginx -s reload
else
    echo "=> [WARNUNG] NGINX nicht gefunden, überspringe Proxy-Setup."
fi

# 3. Docker Compose ausführen
echo "=> Starte Docker Container..."
docker-compose pull
docker-compose up -d

echo "=> Deployment abgeschlossen! Die Dienste laufen nun auf dem VPS."
