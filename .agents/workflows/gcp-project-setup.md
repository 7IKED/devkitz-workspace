---
description: GCP Projekt erstellen, APIs aktivieren, Service Accounts und Credentials konfigurieren
---

# GCP Projekt Setup Workflow

## 1. Neues GCP Projekt erstellen
```bash
# Projekt erstellen
gcloud projects create [PROJECT-ID] --name="[DISPLAY NAME]"

# Als aktives Projekt setzen
gcloud config set project [PROJECT-ID]

# Billing Account verknüpfen
gcloud billing accounts list
gcloud billing projects link [PROJECT-ID] --billing-account=[BILLING-ACCOUNT-ID]
```

## 2. Benötigte APIs aktivieren
```bash
# Cloud Functions Stack
gcloud services enable \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  logging.googleapis.com \
  pubsub.googleapis.com

# Cloud Run (Standalone)
gcloud services enable run.googleapis.com

# Zusätzlich für Storage-Trigger
gcloud services enable storage.googleapis.com

# Für Firestore-Trigger
gcloud services enable firestore.googleapis.com
```

## 3. Service Account erstellen (für CI/CD)
```bash
# Service Account erstellen
gcloud iam service-accounts create dkz-deployer \
  --display-name="DkZ Function Deployer"

# Rollen zuweisen
gcloud projects add-iam-policy-binding [PROJECT-ID] \
  --member="serviceAccount:dkz-deployer@[PROJECT-ID].iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.developer"

gcloud projects add-iam-policy-binding [PROJECT-ID] \
  --member="serviceAccount:dkz-deployer@[PROJECT-ID].iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding [PROJECT-ID] \
  --member="serviceAccount:dkz-deployer@[PROJECT-ID].iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Key erstellen (für lokale Nutzung / CI)
gcloud iam service-accounts keys create key.json \
  --iam-account=dkz-deployer@[PROJECT-ID].iam.gserviceaccount.com
```

## 4. Authentifizierung konfigurieren
```bash
# Lokal (Entwickler)
gcloud auth login
gcloud auth application-default login

# CI/CD (Service Account Key)
export GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json"

# Aktuelles Projekt verifizieren
gcloud config list project
```

## 5. Region konfigurieren
```bash
# Standard-Region setzen
gcloud config set functions/region europe-west1
gcloud config set run/region europe-west1
```

## 6. Verifizierung
```bash
# Alle aktiven APIs auflisten
gcloud services list --enabled --project=[PROJECT-ID]

# Projekt-Info anzeigen
gcloud projects describe [PROJECT-ID]
```

## DkZ™ Standard-Regionen
| Region | Use Case |
|:-------|:---------|
| `europe-west1` (Belgien) | Standard für EU-Compliance |
| `europe-west3` (Frankfurt) | DSGVO-kritische Daten |
| `us-central1` (Iowa) | Niedrigste Latenz für US APIs |

## Referenz
- GCP Console: https://console.cloud.google.com
- Billing: https://console.cloud.google.com/billing
- APIs: https://console.cloud.google.com/apis
