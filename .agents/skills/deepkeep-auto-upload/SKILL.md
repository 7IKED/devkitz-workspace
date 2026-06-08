---
name: deepkeep-auto-upload
description: "Automatischer Upload aller erstellten Dateien, ZIPs, Skripte und Artefakte in [DEEPKEEP]/[SESSION_YYYY-MM] in Google Drive. Verwende diesen Skill IMMER am Ende jeder Aufgabe oder wenn neue Dateien erstellt wurden. Besonders fuer ZIPs, HTML-Dateien, Python-Skripte, Apps-Script-Dateien, QR-Codes und Daten-Exports. Alle Manus-Session-Artefakte werden automatisch thematisch sortiert in Google Drive gesichert."
---

# DeepKeep Auto-Upload

## Pflicht-Regel

**Nach jeder Aufgabe, bei der Dateien erstellt wurden:** Lade alle neuen Dateien automatisch in `[DEEPKEEP]/[SESSION_YYYY-MM]` hoch. Kein manuelles Eingreifen erforderlich.

## Upload-Skript

```bash
python3.11 /home/ubuntu/skills/deepkeep-auto-upload/scripts/upload_to_deepkeep.py <datei1> [datei2 ...]
```

**Optionen:**
- `--folder <pfad>` — ganzen Ordner hochladen
- `--subfolder "[NAME]"` — Ziel-Unterordner manuell setzen (überschreibt Auto-Erkennung)

## Automatische Zielordner (nach Dateityp)

| Dateityp | Ziel-Unterordner |
|---|---|
| `.zip`, `.gz`, `.tar` | `[RELEASES]` |
| `.py`, `.sh`, `.ps1`, `.bat`, `.xml`, `.plist` | `[SCRIPTS]` |
| `.html`, `.js`, `.css` | `[DASHBOARD]` |
| `.gs` (Apps Script) | `[APPS_SCRIPT]` |
| `.png`, `.jpg`, `.gif` | `[IMAGES]` |
| `.json`, `.txt`, `.log` | `[DATA_EXPORTS]` |
| `.md`, `.pdf` | `[DOCS]` |
| Alles andere | `[MISC]` |

## Konfiguration

- **DEEPKEEP_ID:** `154kjvPYPeD8HWEIITREecVk4i4ZK5fnO`
- **Session-Name:** `[SESSION_YYYY-MM]` — automatisch nach aktuellem Monat
- **Token-Quelle:** `/home/ubuntu/.gdrive-rclone.ini`

## Wann verwenden

1. **Am Ende jeder Aufgabe** — alle erstellten Dateien hochladen
2. **Nach ZIP-Erstellung** — sofort in `[RELEASES]` hochladen
3. **Nach HTML/Script-Erstellung** — in `[DASHBOARD]` oder `[SCRIPTS]`
4. **Nach Daten-Exports** — JSON/TXT in `[DATA_EXPORTS]`
5. **Neue Apps-Script-Dateien** — `.gs` in `[APPS_SCRIPT]`

## Beispiele

```bash
# Einzelne Datei
python3.11 /home/ubuntu/skills/deepkeep-auto-upload/scripts/upload_to_deepkeep.py /home/ubuntu/myapp.zip

# Mehrere Dateien
python3.11 /home/ubuntu/skills/deepkeep-auto-upload/scripts/upload_to_deepkeep.py \
  /home/ubuntu/script.py /home/ubuntu/dashboard.html /home/ubuntu/data.json

# Ganzen Ordner
python3.11 /home/ubuntu/skills/deepkeep-auto-upload/scripts/upload_to_deepkeep.py \
  --folder /home/ubuntu/driveboard/

# Mit manuellem Unterordner
python3.11 /home/ubuntu/skills/deepkeep-auto-upload/scripts/upload_to_deepkeep.py \
  --subfolder "[CHAT_PROTOKOLLE]" /home/ubuntu/chat_export.md
```

## Session-Struktur in [DEEPKEEP]

```
[DEEPKEEP]/
  [SESSION_2026-03]/
    [RELEASES]/          <- ZIPs, Pakete
    [DASHBOARD]/         <- HTML, JS, CSS
    [SCRIPTS]/           <- Python, Bash, PowerShell
    [APPS_SCRIPT]/       <- .gs Dateien
    [IMAGES]/            <- PNG, JPG, QR-Codes
    [DATA_EXPORTS]/      <- JSON, TXT, Logs
    [DOCS]/              <- Markdown, PDF
    [MISC]/              <- Alles andere
  [SESSION_2026-04]/     <- Naechster Monat automatisch
    ...
```

## Wichtig

- Dateien werden **niemals gelöscht** — nur hochgeladen
- Jeder Upload erstellt eine neue Datei (keine Überschreibung)
- Session-Ordner wird automatisch für jeden Monat erstellt
- Unterordner werden automatisch erstellt falls nicht vorhanden
