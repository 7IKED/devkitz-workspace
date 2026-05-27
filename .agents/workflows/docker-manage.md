---
description: Docker Container auf Hostinger KVM verwalten — Start, Stop, Update, Logs
---

# Docker Container Management

## Container-Übersicht abrufen
```bash
ssh root@[IP] "docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
```

## Container starten/stoppen
```bash
# Einzeln
docker start [container-name]
docker stop [container-name]
docker restart [container-name]

# Alle via Compose
docker compose up -d
docker compose down
```

## Container aktualisieren (Watchtower oder manuell)
```bash
# Manuell
docker pull [image:tag]
docker compose up -d --force-recreate [service]

# Watchtower (Auto-Update)
docker run -d --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower --interval 3600
```

## Logs einsehen
```bash
docker logs [container-name] --tail 100 -f
```

## Ressourcen-Auslastung
```bash
docker stats --no-stream
```

## Cleanup (ungenutzte Images/Container entfernen)
```bash
docker system prune -af --volumes
```

## Standard-Container (DkZ Ökosystem)
| Container | Image | Port |
|:----------|:------|:-----|
| n8n | n8nio/n8n:latest | 5678 |
| openclaw | openclaw/agent:v2 | 3000 |
| portainer | portainer/portainer-ce | 9443 |
| traefik | traefik:v3.0 | 80,443 |
| watchtower | containrrr/watchtower | — |
| nginx-proxy | jc21/nginx-proxy-manager | 81 |
| duckdb-api | dkz/duckdb-api:latest | 8080 |
| supabase | supabase/supabase | 54321 |
