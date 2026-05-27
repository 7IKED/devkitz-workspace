---
description: Cloud Function lokal testen mit Functions Framework — Python und Node.js
---

# Cloud Function Local Test Workflow

## Python Function testen

### 1. Virtualenv einrichten
```bash
cd [function-ordner]
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Linux/Mac
```

### 2. Dependencies installieren
```bash
pip install -r requirements.txt
```

### 3. Functions Framework starten
```bash
functions-framework --target=hello_get --port=8080 --debug
```

### 4. Testen
```bash
# GET Request
curl http://localhost:8080

# Mit Query-Parametern
curl "http://localhost:8080?name=DkZ"

# POST mit JSON Body
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{"name": "DkZ"}'
```

## Node.js Function testen

### 1. Dependencies installieren
```bash
cd [function-ordner]
npm install
```

### 2. Functions Framework starten
```bash
npx @google-cloud/functions-framework --target=helloGET --port=8080
```

### 3. Testen (gleiche curl Befehle wie oben)

## VS Code Debugging (Python)
```json
{
  "configurations": [
    {
      "name": "Debug Cloud Function",
      "type": "python",
      "request": "launch",
      "module": "functions_framework",
      "args": ["--target=hello_get", "--port=8080", "--debug"]
    }
  ]
}
```

## VS Code Debugging (Node.js)
```json
{
  "configurations": [
    {
      "name": "Debug Cloud Function",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npx",
      "args": ["@google-cloud/functions-framework", "--target=helloGET", "--port=8080"]
    }
  ]
}
```

## Häufige Fehler
- **ModuleNotFoundError** → `pip install functions-framework` vergessen
- **Port belegt** → `--port=8081` verwenden oder laufenden Prozess killen
- **Entry Point nicht gefunden** → `--target` muss exakt dem Funktionsnamen entsprechen
