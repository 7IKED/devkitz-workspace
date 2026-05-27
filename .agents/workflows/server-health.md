---
description: Server Health-Check für alle Hostinger Server — CPU, RAM, Disk, Services
---

# Server Health-Check

## Alle Server prüfen
Führe für jeden Server folgende Checks durch:

### 1. System-Ressourcen
```bash
# CPU + RAM
ssh root@[IP] "free -h && echo '---' && top -bn1 | head -5"

# Disk
ssh root@[IP] "df -h / && echo '---' && du -sh /var/log/"

# Uptime + Load
ssh root@[IP] "uptime"
```

### 2. Services prüfen
```bash
# Docker
ssh root@[IP] "docker ps --format '{{.Names}}: {{.Status}}'"

# PM2 (n8n, OpenClaw)
ssh root@[IP] "pm2 list"

# Nginx/Apache
ssh root@[IP] "systemctl status nginx"
```

### 3. Netzwerk
```bash
# Offene Ports
ssh root@[IP] "ss -tlnp"

# Firewall
ssh root@[IP] "ufw status verbose"
```

### 4. Security
```bash
# Letzte Logins
ssh root@[IP] "last -10"

# Failed SSH Attempts
ssh root@[IP] "journalctl -u sshd --since '1 hour ago' | grep Failed | wc -l"

# Updates verfügbar
ssh root@[IP] "apt list --upgradable 2>/dev/null | wc -l"
```

## Server-Liste (Hostinger)
| Server | IP | Port | User |
|:-------|:---|:-----|:-----|
| n8n VPS | [IP] | 22 | root |
| WordPress | [IP] | 443 | — |
| Root 128GB | [IP] | 22 | root |
| OpenClaw KVM4 | [IP] | 22 | root |
| Docker KVM | [IP] | 22 | root |

## Ergebnis im Agent Control Panel eintragen
- Server-Status: ONLINE/OFFLINE aktualisieren
- Bei Problemen: Toast-Notification + Log-Eintrag
