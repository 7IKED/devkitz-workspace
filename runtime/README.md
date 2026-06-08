# DEVKiTZ™ Runtime — Electron Desktop App

> Electron-Shell die das DEVKiTZ Dashboard als Desktop-App laedt.

---

## Quick Start (Entwicklung)

```bash
cd runtime
npm install
npm run dev
```

## Features

| Feature | Beschreibung |
|:--------|:-------------|
| **Auto-Clone** | Klont `devkitz-workspace` automatisch in Dokumente |
| **Auto-Update** | Prueft stuendlich auf neue Commits |
| **Tray Icon** | Minimiert in System Tray |
| **Global Shortcut** | `Ctrl+Shift+Space` togglet Fenster |
| **Offline-First** | Laedt lokalen Workspace wenn verfuegbar |

## Lade-Reihenfolge

1. **Dev-Modus** → Workspace-Root (eine Ebene ueber `runtime/`)
2. **Persoenlicher Clone** → `%DOCUMENTS%/DEVKiTZ_Ecosystem/`
3. **Lokaler Pfad** → `C:\DEVKiTZ\`
4. **Setup-Screen** → Klont das Repo automatisch

## Binaries

Die Chromium/Electron Binaries (DLLs, PAKs, Locales) sind NICHT im Git.
Installiere sie ueber `npm install` (Electron) oder kopiere sie aus
`C:\DEVKiTZ-Runtime\`.

## Dateistruktur

```
runtime/
├── main.js              # Electron Main Process
├── package.json         # Electron Config
├── .gitignore           # Binaries ausschliessen
├── desktop-app/
│   └── setup.html       # Setup/Installer Screen
└── README.md            # Diese Datei
```
