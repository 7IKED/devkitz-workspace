---
description: SSH-Verbindung zu Hostinger Servern mit Key-Auth und Tunnel — inkl. VPS-Übersicht und Domain-Mapping
---

# SSH-Verbindung zu Hostinger VPS

> Verbindung zu DEVKiTZ™ Servern herstellen

---

## 🖥️ Server-Übersicht

| VPS-ID | Hostname | Zweck | Services |
|:-------|:---------|:------|:---------|
| **1298466** | srv1298466.hstgr.cloud | n8n + Dashboard + Landing | n8n, PostgreSQL, Redis, Nginx · **Domains:** devkitz.eu, devkitz.space, devkitz.cloud, devkitz.blog |
| **1368349** | srv1368349.hstgr.cloud | OpenClaw | WhatsApp Bot, Node.js |
| **1360185** | srv1360185.hstgr.cloud | Test | Test-Umgebung |

## 🌐 Domain-Mapping

| Domain | Ziel | Pfad auf VPS |
|:-------|:-----|:-------------|
| `devkitz.eu` | VPS 1298466 | `/var/www/devkitz-eu/` |
| `devkitz.sites` | VPS 1298466 | `/var/www/devkitz-dashboard/` |
| `care24.site` | WordPress | Shared Hosting / WP |

## 🔑 SSH-Verbindung

```bash
# n8n Server (KVM 8)
ssh -i ~/.ssh/dkz_hostinger root@srv1298466.hstgr.cloud

# OpenClaw Server (KVM 4)
ssh -i ~/.ssh/dkz_hostinger root@srv1368349.hstgr.cloud

# Test Server
ssh -i ~/.ssh/dkz_hostinger root@srv1360185.hstgr.cloud
```

## 🔑 SSH-Key Info

- **Key-Name:** `dkz_hostinger`
- **Typ:** ed25519
- **Pfad lokal:** `%USERPROFILE%\.ssh\dkz_hostinger`
- **Angehängt an:** Alle 3 VPS (Account-Level + VPS-Level)

## ⚡ Schnellbefehle

```bash
# Docker Status prüfen (KVM 8)
ssh -i ~/.ssh/dkz_hostinger root@srv1298466.hstgr.cloud "docker ps"

# n8n Logs
ssh -i ~/.ssh/dkz_hostinger root@srv1298466.hstgr.cloud "docker logs n8n --tail 50"

# Nginx Status
ssh -i ~/.ssh/dkz_hostinger root@srv1298466.hstgr.cloud "systemctl status nginx"

# Disk Space
ssh -i ~/.ssh/dkz_hostinger root@srv1298466.hstgr.cloud "df -h"
```

## 🚀 Deploy-Befehle

```bash
# Dashboard deployen → devkitz.sites
rsync -avz --delete \
  -e "ssh -i ~/.ssh/dkz_hostinger" \
  /c/DEVKiTZ/01_PROJECTS/01_dashboard/ \
  root@srv1298466.hstgr.cloud:/var/www/devkitz-dashboard/

# Landing Page deployen → devkitz.eu  
rsync -avz --delete \
  -e "ssh -i ~/.ssh/dkz_hostinger" \
  /c/DEVKiTZ/01_PROJECTS/10_devkitz-eu/ \
  root@srv1298466.hstgr.cloud:/var/www/devkitz-eu/
```

## 🔒 Passwort-Regeln (Hostinger VPS)
- 12–50 Zeichen
- Min. 1 Zahl + 1 Großbuchstabe + 1 Kleinbuchstabe
- Mind. 1 Sonderzeichen aus: `-().&@?'#;/,+`
