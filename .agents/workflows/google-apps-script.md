---
description: Google Apps Script Projekte erstellen — Backend-Logik, API-Endpoints, Automatisierung
---

# /google-apps-script — Google Apps Script Workflow

> **Kernregel:** Der passende und ordentlich eingetragene Workflow ist wichtiger als das Ergebnis.

## Wann verwenden?
- Google Drive/Sheets/Docs Automatisierung
- Backend für DkZ Module (Web-App als API)
- Bookmark-Organizer, E-Mail-Automation
- Scheduler / Cron-Jobs in der Cloud
- Quick serverless APIs

## Workflow

### 1. Projekt-Struktur
```
Google Apps Script Projekt:
├── Code.gs          ← Haupt-Backend-Logik
├── Panel.html       ← UI (optional, Glassmorphism DkZ Style)
├── appsscript.json  ← Manifest (Scopes, Permissions)
└── Utils.gs         ← Helper-Funktionen (optional)
```

### 2. Standard-Template: Code.gs
```javascript
// ══════════  DkZ Apps Script Backend  ══════════
// Version: 1.0 · Projekt: [NAME]

function doGet(e) {
    const action = e?.parameter?.action || 'status';
    
    switch(action) {
        case 'status':
            return jsonResponse({ status: 'online', timestamp: new Date().toISOString() });
        case 'data':
            return jsonResponse(getData());
        default:
            return jsonResponse({ error: 'Unbekannte Aktion' }, 400);
    }
}

function doPost(e) {
    try {
        const payload = JSON.parse(e.postData.contents);
        const action = payload.action || 'save';
        
        switch(action) {
            case 'save':
                return jsonResponse(saveData(payload.data));
            case 'backup':
                return jsonResponse(createBackup(payload.data));
            default:
                return jsonResponse({ error: 'Unbekannte Aktion' }, 400);
        }
    } catch(err) {
        return jsonResponse({ error: err.message }, 500);
    }
}

function jsonResponse(data, code) {
    return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}
```

### 3. Panel.html Template (DkZ Design)
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            background: #060608;
            color: #e8e8ec;
            font-family: 'Inter', sans-serif;
            padding: 24px;
        }
        .card {
            background: rgba(18,18,24,0.85);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 12px;
            padding: 20px;
            backdrop-filter: blur(20px);
        }
        .btn {
            background: rgba(250,30,78,0.1);
            color: #fa1e4e;
            border: 1px solid rgba(250,30,78,0.2);
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="card">
        <h2>[PROJEKT] Control Panel</h2>
        <!-- UI hier -->
    </div>
</body>
</html>
```

### 4. Deployment
1. `script.google.com` → Neues Projekt
2. Code einfügen
3. Bereitstellen → Neue Bereitstellung
4. Typ: **Web-App**
5. Ausführen als: **Du selbst**
6. Zugriff: **Jeder** (für API-Zugriff)
7. URL kopieren und in DkZ eintragen

### 5. DkZ Integration
```javascript
// Im Modul die Apps Script URL nutzen
const SCRIPT_URL = localStorage.getItem('dkz-gscript-[projekt]') || '';

async function callBackend(action, data) {
    const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data })
    });
    return res;
}
```

### 6. Scope-Sicherheit
```json
// appsscript.json — NUR benötigte Scopes!
{
    "oauthScopes": [
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/script.external_request"
    ]
}
```

### 7. Git Commit
```bash
# Code auch lokal ablegen
git add -A
git commit -m "feat(gscript): [projekt] Google Apps Script Backend erstellt"
```
