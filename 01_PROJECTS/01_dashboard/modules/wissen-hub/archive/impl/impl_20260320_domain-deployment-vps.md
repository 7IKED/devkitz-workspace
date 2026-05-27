# Implementierungsplan — Domain-Deployment auf VPS 1298466

> SSL + Traefik + Landing Page + Multi-Domain Routing · Stand: 2026-03-20

---

## Phase 1: Traefik SSL für alle Domains (PRIORITÄT)

### 1.1 Traefik ACME konfigurieren

```bash
ssh kvm8
```

In `/root/n8n-docker/traefik.yml` ergänzen:

```yaml
certificatesResolvers:
  le:
    acme:
      email: info@devkitz.eu
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

### 1.2 Domains in docker-compose.yml routen

```yaml
# Neuer Service: devkitz-eu Landing Page
devkitz-landing:
  image: nginx:alpine
  volumes:
    - /var/www/devkitz-eu:/usr/share/nginx/html:ro
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.devkitz-eu.rule=Host(`devkitz.eu`) || Host(`www.devkitz.eu`)"
    - "traefik.http.routers.devkitz-eu.entrypoints=websecure"
    - "traefik.http.routers.devkitz-eu.tls.certresolver=le"
  restart: unless-stopped
```

### 1.3 Weitere Domains routen

```yaml
# devkitz.space → Dashboard (später)
# devkitz.cloud → API (später)
# devkitz.blog → Blog (später)
```

---

## Phase 2: Landing Page deployen

```bash
# Lokal: Dateien auf VPS kopieren
scp -r C:/DEVKiTZ/01_PROJECTS/10_devkitz-eu/* kvm8:/var/www/devkitz-eu/

# Auf VPS: Ordner vorbereiten
ssh kvm8 "mkdir -p /var/www/devkitz-eu"

# Docker Stack neu starten
ssh kvm8 "cd /root/n8n-docker && docker compose up -d"
```

---

## Phase 3: Verifikation

```bash
# SSL testen
curl -I https://devkitz.eu
curl -I https://devkitz.space
curl -I https://devkitz.cloud
curl -I https://devkitz.blog

# Seite testen
curl -s https://devkitz.eu | head -20
```

---

## Risiken

- Traefik-Restart kann n8n kurzzeitig unterbrechen (< 30s)
- Let's Encrypt Rate Limit: max 50 Zertifikate pro Woche
- Port 80 muss für ACME HTTP-Challenge offen sein

---

## Ergebnis

| Domain | Zeigt auf | SSL | Content |
|:-------|:----------|:----|:--------|
| devkitz.eu | VPS → Nginx Landing | Let's Encrypt | Profil-Seite |
| devkitz.space | VPS → (TODO) | Let's Encrypt | Dashboard |
| devkitz.cloud | VPS → (TODO) | Let's Encrypt | API |
| devkitz.blog | VPS → (TODO) | Let's Encrypt | Blog |
