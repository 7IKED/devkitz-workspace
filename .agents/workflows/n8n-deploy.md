---
description: n8n Workflow auf Hostinger VPS deployen und verwalten
---

# n8n Deploy Workflow

## Voraussetzungen
- SSH-Zugang zum Hostinger VPS (n8n Server)
- n8n läuft als Docker-Container oder PM2-Prozess

## Schritte

1. SSH-Verbindung zum n8n-Server herstellen:
```bash
ssh root@[IP] -p 22
```

2. n8n Status prüfen:
```bash
pm2 status n8n
# oder Docker:
docker ps | grep n8n
```

3. n8n Workflow importieren (JSON):
```bash
# Via CLI
n8n import:workflow --input=workflow.json
# Via API
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @workflow.json
```

4. n8n Workflow aktivieren:
```bash
curl -X PATCH http://localhost:5678/api/v1/workflows/[ID] \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"active": true}'
```

5. Logs prüfen:
```bash
pm2 logs n8n --lines 50
```

6. Status im Agent Control Panel aktualisieren:
- Infrastruktur Tab → n8n Server → Status auf ONLINE
- MCP Kopplung aktivieren

## Troubleshooting
- Port 5678 blockiert? → `ufw allow 5678`
- Memory-Limit? → `pm2 start n8n --max-memory-restart 1G`
- SSL? → Nginx Reverse Proxy mit Let's Encrypt
