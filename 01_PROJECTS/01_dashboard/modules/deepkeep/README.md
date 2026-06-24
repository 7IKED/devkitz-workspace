# DEEPKEEP Tresor — DEVKiTZ™

> Unantastbarer RAW-Tresor — Write-Once, Read-Many Archiv-System

## Features

- Katalog-Verwaltung mit Ordner-Struktur (12 Ordner, DkZ-konform)
- Volltext-Suche (Name, Tags, Ordner)
- Datei-Hochladen per Drag&Drop oder Datei-Auswahl
- Tresor-Funktion: Commit in geschützten Katalog mit Hash-Prüfung
- 7-Tage-Regel: Automatische Erkennung veralteter Dateien
- Activity-Feed mit Zeitstempel
- CSV/JSON Export
- Unified Backend (Node.js, Port 3040) mit Google Drive Persistenz
- Seed-Initialisierung mit Demo-Daten

## Tech Stack

- **Frontend**: Vanilla HTML5 + CSS3 + JavaScript ES6+ (kein Framework)
- **Design**: DkZ Design System v2 (Glassmorphism, CSS Custom Properties)
- **Backend**: Node.js Express (`sync-server.js`, Port 3040)
- **Persistenz**: Google Drive via `dkz-drive-auth.js` (store/list/retrieve)
- **Globale API**: `window.DK` — IIFE-Objekt mit 8+ public Methoden

## Status

| Komponente | Version | Status |
|------------|---------|--------|
| Frontend | v1.00.00_01 | ✅ Active |
| Backend (sync-server.js) | — | ✅ Active (Port 3040) |
| server.py | — | ❌ **DEAD** (technologische Schuld) |
| localStorage→API | — | ❌ Migration ausstehend |

## Starten

```bash
# Backend starten (unified backend)
cd 01_PROJECTS/01_dashboard
node sync-server.js

# Frontend: index.html im Browser öffnen oder über DkZ Dashboard Hub
```

## API Endpoints (sync-server.js)

| Methode | Pfad | Zweck |
|---------|------|-------|
| POST | `/api/v1/deepkeep/store` | Datei/Eintrag speichern |
| GET | `/api/v1/deepkeep/list` | Alle Einträge abrufen |
| GET | `/api/v1/deepkeep/retrieve/:id` | Einzelnen Eintrag holen |

Alle Backend-Logik in `00_lib/dkz-drive-auth.js`:
- `storeDeepKeep({ content, filename?, mimeType? })` → `{ success, message, hash, filename }`
- `listDeepKeep()` → `{ success, files: [{ hash, filename, mimeType, storedAt, size }] }`
- `retrieveDeepKeep(id)` → `{ success, content, meta }`

## Wichtige Notizen

- **server.py ist tot**: Kein Code mehr darauf bezogen. Einziger Backend = `sync-server.js` Port 3040.
- **Migration ausstehend**: Frontend spricht aktuell noch mit localStorage, nicht mit der API. Siehe `Summary.md` für den Plan.
- **7-Tage-Regel**: Simuliert mit Dummy-Daten; kann später durch echte Dateisystem-Scans ersetzt werden.

## Pfad

`01_PROJECTS/01_dashboard/modules/deepkeep/`

---

*Teil des [DEVKiTZ™](https://github.com/7IKED/devkitz-workspace) Ökosystems.*
