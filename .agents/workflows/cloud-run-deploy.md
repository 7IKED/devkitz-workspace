---
description: Container-Image oder lokalen Ordner auf Google Cloud Run deployen via MCP
---

# Cloud Run Deploy Workflow

## Via MCP (Antigravity Integration)

### 1. Verfügbare Projekte auflisten
Nutze den `cloudrun` MCP Server:
- `list_projects` → Alle GCP Projekte anzeigen
- `list_services` → Alle Services in einem Projekt

### 2. Container-Image deployen
```
mcp_cloudrun_deploy_container_image:
  project: [PROJECT-ID]
  imageUrl: gcr.io/[PROJECT]/[IMAGE]:[TAG]
  service: [SERVICE-NAME]
  region: europe-west1
```

### 3. Lokalen Ordner deployen
```
mcp_cloudrun_deploy_local_folder:
  project: [PROJECT-ID]
  folderPath: C:\DEVKiTZ\[PROJEKT-ORDNER]
  service: [SERVICE-NAME]
  region: europe-west1
```

### 4. File-Contents deployen (ohne lokale Dateien)
```
mcp_cloudrun_deploy_file_contents:
  project: [PROJECT-ID]
  files:
    - filename: main.py
      content: |
        from flask import Flask
        app = Flask(__name__)
        @app.route('/')
        def hello():
            return 'Hello DkZ!'
    - filename: requirements.txt
      content: flask>=3.0
```

## Via gcloud CLI

### 1. Source-Deploy (Buildpacks)
```bash
gcloud run deploy [SERVICE] \
  --source=. \
  --region=europe-west1 \
  --allow-unauthenticated
```

### 2. Container-Image Deploy
```bash
gcloud run deploy [SERVICE] \
  --image=gcr.io/[PROJECT]/[IMAGE]:[TAG] \
  --region=europe-west1 \
  --allow-unauthenticated \
  --port=8080 \
  --memory=256Mi \
  --cpu=1
```

### 3. Status & Logs
```bash
# Service-Info
gcloud run services describe [SERVICE] --region=europe-west1

# Logs
gcloud run services logs read [SERVICE] --region=europe-west1 --limit=50

# URL
gcloud run services describe [SERVICE] --region=europe-west1 --format="value(status.url)"
```

## Troubleshooting
- **Port-Fehler** → `--port=8080` und App muss auf `PORT` Env-Variable hören
- **Build-Fehler** → Dockerfile oder Procfile fehlt (Buildpacks brauchen Standard-Struktur)
- **Cold Start** → `--min-instances=1` für warme Instanzen
- **Memory-Fehler** → `--memory=512Mi` oder höher

## DkZ™ Standard-Regionen
| Region | Use Case |
|:-------|:---------|
| `europe-west1` | Standard |
| `europe-west3` | DSGVO |
| `us-central1` | US-nahe APIs |
