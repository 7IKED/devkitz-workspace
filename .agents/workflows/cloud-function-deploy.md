---
description: GCP Cloud Function deployen — Von Projekt-Setup bis Live-URL
---

# Cloud Function Deploy Workflow

## Voraussetzungen
- GCP Projekt mit aktivierter Billing
- Cloud Code Extension (Pre-Release) oder gcloud CLI
- APIs aktiviert: Cloud Functions, Cloud Build, Artifact Registry, Cloud Run, Logging, Pub/Sub

## Schritte

### 1. GCP Projekt wählen oder erstellen
```bash
# Projekte auflisten
gcloud projects list

# Neues Projekt erstellen
gcloud projects create dkz-functions-prod --name="DkZ Functions"

# Projekt setzen
gcloud config set project [PROJECT-ID]
```

### 2. APIs aktivieren
```bash
gcloud services enable \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  logging.googleapis.com \
  pubsub.googleapis.com
```

### 3. Function deployen (Gen2)
```bash
gcloud functions deploy [FUNCTION-NAME] \
  --gen2 \
  --runtime=python312 \
  --region=europe-west1 \
  --source=. \
  --entry-point=[ENTRY_POINT] \
  --trigger-http \
  --allow-unauthenticated
```

### 4. Deployment verifizieren
```bash
# Status prüfen
gcloud functions describe [FUNCTION-NAME] --region=europe-west1 --gen2

# URL abrufen
gcloud functions describe [FUNCTION-NAME] --region=europe-west1 --gen2 \
  --format="value(serviceConfig.uri)"

# Testen
curl $(gcloud functions describe [FUNCTION-NAME] --region=europe-west1 --gen2 --format="value(serviceConfig.uri)")
```

### 5. Logs prüfen
```bash
gcloud functions logs read [FUNCTION-NAME] --region=europe-west1 --gen2 --limit=20
```

### 6. Im DkZ™ Ökosystem registrieren
- `features.json` → Cloud Functions Eintrag hinzufügen
- ONTHERUN™ → Function-URL als Endpoint registrieren
- Agent Control Panel → Infrastruktur → GCP Functions Status

## Troubleshooting
- **Build fehlgeschlagen?** → Output Tab → Build Logs Link → Details in GCP Console
- **Permission denied?** → `gcloud auth login` + Billing prüfen
- **Timeout?** → `--timeout=540` Flag setzen (max 9 Min für Gen2)
- **Memory?** → `--memory=256Mi` bis `--memory=32Gi`
- **Cold Start?** → `--min-instances=1` für warme Instanzen

## Cleanup
```bash
# Function löschen
gcloud functions delete [FUNCTION-NAME] --region=europe-west1 --gen2 --quiet

# Ganzes Projekt löschen (VORSICHT!)
gcloud projects delete [PROJECT-ID]
```
