---
description: Chrome/Vivaldi Extensions mit Gemini bauen — DkZ™ Hub Workflow
---

# DkZ™ Chrome Extension Builder Workflow

> Baue Chrome (und Vivaldi) Extensions mit DkZ™ Design System
> Tech: React + Tailwind + Supabase + DuckDB + MCP
> Pfad: `C:\DEVKiTZ\01_PROJECTS\chrome-extensions\`

---

## Schritt 1: Projekt-Setup

// turbo
1. `cd C:\DEVKiTZ\01_PROJECTS\chrome-extensions\dkz-hub`
2. `cmd /c "npm install"`

## Schritt 2: Build

// turbo
3. `cmd /c "npx vite build"`
4. Kopiere manifest.json + background.js + content/ + icons/ nach dist/

```bash
cmd /c "copy manifest.json dist\manifest.json && xcopy icons dist\icons\ /E /I /Y && copy src\background.js dist\background.js && xcopy src\content dist\content\ /E /I /Y"
```

## Schritt 3: In Chrome laden

5. Öffne Chrome → `chrome://extensions/`
6. **Entwicklermodus** aktivieren (Toggle oben rechts)
7. **"Entpackte Erweiterung laden"** klicken
8. Ordner wählen: `C:\DEVKiTZ\01_PROJECTS\chrome-extensions\dkz-hub\dist\`
9. DkZ™ Hub Icon erscheint in der Toolbar ⚡

## Schritt 4: In Vivaldi laden

10. Öffne Vivaldi → `vivaldi://extensions/`
11. Gleicher Prozess wie Chrome (Chromium-basiert)

## Schritt 5: Development Mode (Live Reload)

// turbo
12. `cmd /c "npx vite"`
13. Öffne `http://localhost:5173/src/popup/index.html` im Browser für Live-Preview

## Schritt 6: Rebuild nach Änderungen

// turbo
14. `cmd /c "cd /d C:\DEVKiTZ\01_PROJECTS\chrome-extensions\dkz-hub && npx vite build"`
15. In Chrome → Extensions → DkZ Hub → 🔄 Reload klicken

---

## Projektstruktur

```
dkz-hub/
├── manifest.json          ← Chrome Manifest V3
├── package.json           ← Dependencies
├── vite.config.js         ← Build Config
├── tailwind.config.js     ← DkZ™ Farben
├── src/
│   ├── popup/             ← Popup UI (React)
│   ├── options/           ← Options Page
│   ├── modules/           ← 8 Feature-Module
│   ├── components/        ← Shared Components
│   ├── lib/               ← Utils, Storage, Export, GAS
│   ├── content/           ← Content Scripts
│   └── background.js      ← Service Worker
├── icons/                 ← Extension Icons
└── dist/                  ← Build Output → In Chrome laden
```

## Features

| Modul | Funktion |
|:------|:---------|
| 🏠 Home | Status-Overview, Quick Stats |
| 🔖 Tabs | Tab Manager, Sessions, Gruppierung |
| 📋 Clips | Clipboard History, Suche, Favoriten |
| 🎨 Colors | EyeDropper, Paletten, WCAG Check |
| 🔍 Scraper | CSS Selektoren, Tabellen, Links |
| 🤖 AI | 344 Prompt-Templates, Inject, Dashboard |
| 🧠 Copilot | Chat mit 4 Providern (OpenAI/Claude/Gemini/Groq) |
| ⚙️ Settings | API Keys, GAS Config, Backup |
