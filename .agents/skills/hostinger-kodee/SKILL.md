---
description: Hostinger Kodee Anforderungen stellen — Domains, VPS, WordPress, DNS einrichten
---

# Hostinger Kodee — Server & Domain Anforderungen

> Skill zum Einrichten und Verwalten von Hostinger-Diensten via Kodee-Bot

---

## 🏗️ Infrastruktur-Übersicht

### VPS Server

| VPS-ID | Name | Zweck | IP | Status |
|:-------|:-----|:------|:---|:-------|
| 1298466 | **KVM 8** | n8n Queue Mode + Dashboard Hosting | srv1298466.hstgr.cloud | 🟢 Aktiv |
| 1368349 | **KVM 4** | OpenClaw WhatsApp Bot | srv1368349.hstgr.cloud | 🟢 Aktiv |
| 1360185 | **KVM Test** | Test-Server | srv1360185.hstgr.cloud | 🟢 Aktiv |

### Domains

| Domain | Zweck | Ziel-VPS | Typ |
|:-------|:------|:---------|:----|
| `devkitz.eu` | Landing Page (Ökosystem) | VPS 1298466 | Hauptseite |
| `devkitz.sites` | Dashboard + Module | VPS 1298466 | Web-App |
| `care24.site` | WordPress Projekt | Shared/VPS | WordPress |

### SSH-Key

- **Name:** `dkz-ecosystem`
- **Typ:** ed25519
- **Angehängt an:** Alle 3 VPS (1298466, 1368349, 1360185)

---

## 📋 Kodee-Anforderung erstellen

### Schritt 1: Kodee im hPanel öffnen
1. https://hpanel.hostinger.com einloggen
2. Unten rechts auf Kodee-Chat klicken
3. Anforderung klar und strukturiert formulieren

### Schritt 2: Template für Domain-Anforderung

```
Hallo, bitte folgende Domain einrichten:

DOMAIN: [domain-name]
ZIEL: VPS [vps-id] (IP: [ip])
DNS:
- A-Record: [domain] → [ip]
- CNAME: www.[domain] → [domain]
- MX-Records: [beibehalten/neu]
SSL: Let's Encrypt einrichten

Danke!
```

### Schritt 3: Template für VPS-Passwort

```
Neues Root-Passwort für VPS [vps-id]: [passwort]
(12-50 Zeichen, min. 1 Zahl, 1 Groß-/1 Kleinbuchstabe, 
mind. 1 Sonderzeichen aus: -().&@?'#;/,+)
```

### Schritt 4: Template für WordPress

```
WordPress auf [domain]:
- Admin-Passwort resetten
  Username: [admin-user]
  Neues Passwort: [passwort]
- Neue Domain [neue-domain] hinzufügen als [Alias/Multisite]
```

---

## 🌐 Domain-Architektur DEVKiTZ™

```
devkitz.eu              → Landing Page (statisch)
  ├── index.html         01_PROJECTS/10_devkitz-eu/
  ├── style.css
  └── script.js

devkitz.sites           → Dashboard Hub
  ├── /                  hub/index.html
  ├── /n8n               modules/n8n-viewer/
  ├── /wiki              04_SYSTEM/DEVKITZ_WIKI/
  ├── /status            modules/server-dashboard/
  ├── /prompt            modules/prompt-generator/
  ├── /botnet            modules/botnet-marketplace/
  └── /[modul-name]      modules/[name]/

care24.site             → WordPress
```

---

## 🔧 Nginx Virtual Host Konfiguration

### devkitz.eu (Landing Page)

```nginx
server {
    listen 80;
    server_name devkitz.eu www.devkitz.eu;
    root /var/www/devkitz-eu;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Caching für statische Assets
    location ~* \.(css|js|png|jpg|svg|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### devkitz.sites (Dashboard + Module)

```nginx
server {
    listen 80;
    server_name devkitz.sites www.devkitz.sites;
    root /var/www/devkitz-dashboard;
    index index.html;
    
    # Hub als Startseite
    location / {
        alias /var/www/devkitz-dashboard/hub/;
        try_files $uri $uri/ /hub/index.html;
    }
    
    # Module als Unterverzeichnisse
    location /n8n {
        alias /var/www/devkitz-dashboard/modules/n8n-viewer/;
        try_files $uri $uri/ /modules/n8n-viewer/index.html;
    }
    
    location /wiki {
        alias /var/www/devkitz-dashboard/wiki/;
        try_files $uri $uri/ =404;
    }
    
    # Shared Scripts
    location /shared {
        alias /var/www/devkitz-dashboard/shared/;
        expires 7d;
    }
    
    # Alle Module automatisch
    location ~ ^/modules/(.+) {
        alias /var/www/devkitz-dashboard/modules/$1;
        try_files $uri $uri/ =404;
    }
}
```

### SSL einrichten

```bash
# Let's Encrypt für beide Domains
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d devkitz.eu -d www.devkitz.eu
sudo certbot --nginx -d devkitz.sites -d www.devkitz.sites

# Auto-Renewal prüfen
sudo certbot renew --dry-run
```

---

## 🚀 Deploy-Workflow

### Lokales Dashboard auf VPS deployen

```bash
# 1. Dateien per rsync hochladen
rsync -avz --delete \
  -e "ssh -i ~/.ssh/dkz-ecosystem" \
  C:/DEVKiTZ/01_PROJECTS/01_dashboard/ \
  root@srv1298466.hstgr.cloud:/var/www/devkitz-dashboard/

# 2. Landing Page deployen
rsync -avz --delete \
  -e "ssh -i ~/.ssh/dkz-ecosystem" \
  C:/DEVKiTZ/01_PROJECTS/10_devkitz-eu/ \
  root@srv1298466.hstgr.cloud:/var/www/devkitz-eu/

# 3. Nginx neu laden
ssh -i ~/.ssh/dkz-ecosystem root@srv1298466.hstgr.cloud \
  "nginx -t && systemctl reload nginx"
```

### PowerShell Deploy-Script (Windows)

```powershell
# deploy-devkitz.ps1
$KEY = "$HOME\.ssh\dkz-ecosystem"
$VPS = "root@srv1298466.hstgr.cloud"

Write-Host "⚡ DEVKiTZ Deploy..." -ForegroundColor Cyan

# Dashboard
scp -i $KEY -r "C:\DEVKiTZ\01_PROJECTS\01_dashboard\*" "${VPS}:/var/www/devkitz-dashboard/"
Write-Host "✅ Dashboard deployed → devkitz.sites" -ForegroundColor Green

# Landing Page
scp -i $KEY -r "C:\DEVKiTZ\01_PROJECTS\10_devkitz-eu\*" "${VPS}:/var/www/devkitz-eu/"
Write-Host "✅ Landing Page deployed → devkitz.eu" -ForegroundColor Green

# Nginx reload
ssh -i $KEY $VPS "nginx -t && systemctl reload nginx"
Write-Host "✅ Nginx reloaded" -ForegroundColor Green
```

---

## 📊 Passwort-Regeln (Hostinger)

- **Länge:** 12–50 Zeichen
- **Pflicht:** Min. 1 Zahl, 1 Großbuchstabe, 1 Kleinbuchstabe
- **Sonderzeichen:** Mind. 1 aus: `-().&@?'#;/,+`
- **Beispiel-Format:** `Dkz-[Service]@[Jahr]!`

---

## 🔒 Sicherheits-Checkliste

- [ ] SSH-Key `dkz-ecosystem` auf allen VPS aktiv
- [ ] Root-Passwörter sicher gespeichert (NICHT im Git!)
- [ ] SSL-Zertifikate für alle Domains aktiv
- [ ] Firewall: Ports 80, 443, 22 offen — Rest zu
- [ ] Fail2ban installiert
- [ ] Nginx Logs aktiv (`/var/log/nginx/`)
- [ ] Auto-Backup eingerichtet

---

## ⚠️ Wichtige Hinweise

1. **Passwörter NIEMALS in Git committen** — nur in hPanel oder KeePass
2. **SSH-Key immer bevorzugen** über Passwort-Login
3. **DNS-Änderungen brauchen 5-60 Min** bis sie propagieren
4. **SSL erst einrichten NACHDEM DNS aktiv ist**
5. **Backups VOR Nginx-Änderungen** machen
