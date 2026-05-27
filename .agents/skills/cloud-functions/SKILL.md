---
name: cloud-functions
description: GCP Cloud Functions (Gen2) erstellen, testen und deployen — Python oder Node.js HTTP-Trigger Functions
---

# Cloud Functions Skill

Erstellt und deployt serverlose Functions auf Google Cloud Platform (Gen2 / Cloud Run basiert).

## Wann nutzen
- Neue HTTP-getriggerte Cloud Function erstellen
- Bestehende Function updaten/redeployen
- Function lokal testen mit Functions Framework
- Multi-Function Projekte aufsetzen
- Event-getriggerte Functions (Pub/Sub, Storage, Firestore)

## Anweisungen

### 1. Projekt-Struktur (Python)
```
function-name/
├── .vscode/
│   ├── launch.json        # Cloud Code Deploy Config
│   └── settings.json      # VS Code Einstellungen
├── main.py                # Function Entry Point
├── requirements.txt       # Python Dependencies
└── README.md              # Dokumentation
```

### 2. Function erstellen (Python HTTP-Trigger)
```python
import functions_framework

@functions_framework.http
def hello_get(request):
    """HTTP Cloud Function.
    Args:
        request (flask.Request): Das Request-Objekt.
    Returns:
        Response text oder JSON.
    """
    name = request.args.get("name", "World")
    return f"Hello {name}!"
```

### 3. Function erstellen (Node.js HTTP-Trigger)
```javascript
const functions = require('@google-cloud/functions-framework');

functions.http('helloGET', (req, res) => {
  const name = req.query.name || 'World';
  res.send(`Hello ${name}!`);
});
```

### 4. Requirements / Dependencies
```txt
# Python
functions-framework==3.5.0

# Node.js (package.json)
{
  "dependencies": {
    "@google-cloud/functions-framework": "^3.0.0"
  }
}
```

### 5. VS Code Launch Config
```json
{
  "configurations": [
    {
      "name": "Deploy Cloud Function",
      "type": "cloudcode.cloudfunctions",
      "request": "launch",
      "functionName": "function-[name]",
      "gen": "GEN_2",
      "entryPoint": "hello_get"
    }
  ]
}
```

### 6. Lokal testen
```bash
# Python
pip install functions-framework
functions-framework --target=hello_get --port=8080 --debug

# Node.js
npx @google-cloud/functions-framework --target=helloGET --port=8080

# Test-Request
curl http://localhost:8080
curl http://localhost:8080?name=DkZ
```

### 7. Deploy via gcloud CLI
```bash
# Gen2 HTTP Function deployen
gcloud functions deploy function-name \
  --gen2 \
  --runtime=python312 \
  --region=europe-west1 \
  --source=. \
  --entry-point=hello_get \
  --trigger-http \
  --allow-unauthenticated

# Status prüfen
gcloud functions describe function-name --region=europe-west1 --gen2
```

### 8. Deploy via Cloud Code (VS Code)
1. Cloud Code Extension → Cloud Functions Section öffnen
2. Rechtsklick auf Function → `Deploy Function`
3. GCP Projekt wählen → Region → Runtime
4. URL wird im Output Tab angezeigt

## Naming Convention
- Ordner: `function-[name]/`
- Entry Point: `snake_case` (Python) / `camelCase` (Node.js)
- Function Name: `function-[kebab-case]`

## Voraussetzungen (APIs aktivieren)
- Cloud Functions API
- Cloud Build API
- Artifact Registry API
- Cloud Run API
- Logging API
- Pub/Sub API

## Referenz
- Template: `C:\Users\BAZE²\hello-world-1\`
- Workspace: `C:\DEVKiTZ\[HELLO WORLD]\`
- GCP Console: https://console.cloud.google.com/functions
- Doku: https://cloud.google.com/functions/docs
