---
description: DkZ Backup — Lokal (IndexedDB), Google Drive oder Cloudflare R2 sichern
---

# /backup — DkZ Backup Workflow

## Übersicht
Dreistufiges Backup-System für alle DkZ Daten (Prompts, Skills, Settings, Snippets, etc.)

## Provider-Optionen

### 1. Lokal (IndexedDB) — Immer aktiv
- Automatisch alle 5 Minuten
- Max. 50 Versionen in IndexedDB
- JSON Export möglich
- Kein Internet nötig

### 2. Google Drive (Apps Script)
1. Apps Script URL in Backup Panel eintragen
2. Manuell: ☁️ Backup → Google Drive Tab → Manuell
3. Auto: ☁️ Backup → Google Drive Tab → Auto (alle 5 Min)

### 3. Cloudflare R2 (S3-kompatibel)
1. Cloudflare Dashboard → R2 → Manage API Tokens
2. API Token erstellen (Object Read & Write)
3. In DkZ: ☁️ Backup → Cloudflare R2 Tab
4. Account ID, Access Key, Secret Key eintragen
5. "Credentials speichern" klicken
6. "Jetzt hochladen" für manuelles Backup

## Cloudflare R2 Setup (Schritt für Schritt)

```
1. https://dash.cloudflare.com → R2 Object Storage
2. "Create bucket" → Name: dkz-backups
3. "Manage API Tokens" → "Create API Token"
4. Permissions: Object Read & Write (Admin nicht nötig)
5. Apply to: Specific bucket → dkz-backups
6. "Create" → Access Key ID + Secret Access Key kopieren
7. Account ID findet sich auf der R2 Overview Seite
```

## Agent-Befehle

```bash
# Manuelles Backup im Browser auslösen
# → ☁️ Backup Button in jedem Modul-Header

# JSON Export
# → Lokal Tab → JSON Export → Download

# Auto-Backup aktivieren
# → Provider-Tab → Auto Button
```

## Was wird gesichert?

| ✅ Gesichert | ❌ Nicht gesichert |
|:------------|:------------------|
| Prompts | Dokumente/Projekte |
| Skills | Medien-Dateien |
| Settings | node_modules |
| Snippets | Git History |
| Preferences | Binärdateien |
| Shortcuts | API Keys (gefiltert!) |
| History | |

## Technisch

- **Script:** `shared/dkz-persist.js` v2.0
- **Lokal:** IndexedDB `dkz-backup-db`
- **Cloud:** Google Drive (Apps Script) ODER Cloudflare R2 (S3 API)
- **Proxy:** ONTHERUN™ (`localhost:9880/backup/r2`) für S3 Signierung
- **Fallback:** Immer lokal → dann Cloud
