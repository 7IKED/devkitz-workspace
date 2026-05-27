---
description: Codebase sanitizen — Hardcoded Pfade, API Keys, Tokens durch Env-Variablen ersetzen
---

# /sanitize-codebase — Portabilität & Sicherheit

> **Kernregel:** Der passende und ordentlich eingetragene Workflow ist wichtiger als das Ergebnis.

## Wann verwenden?
- Vor Git Push auf GitHub (öffentlich oder privat)
- Nach Import von fremdem Code
- Bei Wechsel des Arbeitsrechners
- Bei Security-Audit

## Workflow

### 1. Scan nach Hardcoded Pfaden
```bash
# Windows-spezifische Pfade finden
grep -rn "C:\\\\Users\\\\" --include="*.js" --include="*.html" --include="*.json" --include="*.md" .
grep -rn "C:/Users/" --include="*.js" --include="*.html" --include="*.json" --include="*.md" .
```

### 2. Scan nach API Keys & Tokens
```bash
# Bekannte Patterns
grep -rn "sk-[a-zA-Z0-9]\{20,\}" --include="*.js" --include="*.json" .     # OpenAI
grep -rn "ghp_[a-zA-Z0-9]\{36\}" --include="*.js" --include="*.json" .      # GitHub
grep -rn "Bearer [a-zA-Z0-9_-]\{20,\}" --include="*.js" --include="*.json" . # Bearer Tokens
grep -rn "AIza[a-zA-Z0-9_-]\{35\}" --include="*.js" --include="*.json" .     # Google API
```

### 3. Ersetzen durch Environment-Variablen
```javascript
// VORHER (VERBOTEN):
const apiKey = 'sk-abc123...';
const path = 'C:/Users/BAZE²/Desktop/';

// NACHHER (RICHTIG):
const apiKey = process.env.OPENAI_API_KEY || localStorage.getItem('dkz-api-key') || '';
const path = `${process.env.USERPROFILE || '~'}/Desktop/`;

// Im Browser:
const basePath = window.DKZ_BASE_PATH || '.';
```

### 4. .env Template erstellen
```bash
# .env.example (KEIN .env committen!)
OPENAI_API_KEY=
GITHUB_TOKEN=
CF_ACCOUNT_ID=
CF_API_TOKEN=
DKZ_BASE_PATH=C:/DEVKiTZ
```

### 5. .gitignore prüfen
```
# PFLICHT in .gitignore:
.env
.env.local
*.key
*.pem
node_modules/
```

### 6. Validierung
```bash
# Nochmal scannen — sollte 0 Ergebnisse liefern
grep -rn "sk-[a-zA-Z0-9]" --include="*.js" --include="*.json" .
grep -rn "ghp_" --include="*.js" --include="*.json" .
```

// turbo-all

### 7. Git Commit
```bash
git add -A
git commit -m "chore(security): hardcoded paths und API keys durch env-variablen ersetzt"
```

## Ausnahmen (NICHT ersetzen)
- `info@devkitz.eu` — öffentliche Kontakt-Email
- Relative Pfade (`../../shared/`) — sind OK
- localhost URLs — sind OK
- Beispiel-Strings in Dokumentation
