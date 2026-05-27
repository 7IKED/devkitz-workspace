---
description: Cloudflare Domain einrichten mit DDoS-Schutz, SSL und DNS-Management
---

# Cloudflare Setup & Domain-Schutz

## 1. Domain zu Cloudflare hinzufügen
1. Cloudflare Dashboard → Add Site → Domain eingeben
2. Plan wählen (Free reicht für DDoS + SSL)
3. Nameserver bei Hostinger ändern auf CF-Nameserver

## 2. DNS-Records konfigurieren
```
A     @       → [Server-IP]     (Proxied ☁️)
A     www     → [Server-IP]     (Proxied ☁️)
CNAME mail    → mail.domain.de  (DNS only)
MX    @       → mail.domain.de  (Prio 10)
TXT   @       → v=spf1 ...
```

## 3. SSL/TLS aktivieren
- SSL Mode: **Full (Strict)**
- Always Use HTTPS: **ON**
- Minimum TLS: **1.2**
- HSTS: Aktivieren (max-age=31536000)

## 4. DDoS-Schutz
- Security Level: **Medium** (normal) / **Under Attack** (bei Angriff)
- Bot Fight Mode: **ON**
- Rate Limiting Rules: Nach Bedarf
- WAF Rules: OWASP Core Ruleset aktivieren

## 5. Cloudflare API (für Automatisierung)
```bash
# Zone-Liste abrufen
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CF_TOKEN"

# DNS-Record erstellen
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"A","name":"sub","content":"1.2.3.4","proxied":true}'

# Under Attack Mode aktivieren
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/security_level" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -d '{"value":"under_attack"}'
```

## 6. Im Agent Control Panel aktualisieren
- Infrastruktur → Cloudflare → API Token + Zone ID eintragen
- DDoS Schutz Toggle → ON
- MCP Kopplung → ON (ONTHERUN™ steuert CF API)
