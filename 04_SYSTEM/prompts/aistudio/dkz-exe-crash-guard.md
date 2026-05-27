# DkZ™ EXE Crash-Guard — Auto-Recovery & DuckDB Conflict Manager

> AI Studio Prompt · Stand: 2026-05-27 · Gemini / OpenCode
> Kategorie: System-Watchdog / EXE Wrapper

---

## Ziel

Baue einen ausfallsicheren **Crash-Guard (Watchdog)** fuer unsere DkZ™ Desktop EXEs (z.B. AiAi Kirk Desktop oder Dashboard-Server), der sicherstellt, dass die Applikation **niemals permanent stirbt**.

## Kern-Features

1. **Auto-Restart bei Crash**: Ueberwacht den EXE/Python-Prozess. Wenn er unerwartet beendet wird, startet der Watchdog ihn sofort neu.
2. **DuckDB Conflict Recovery**: Erkennt Lock-Errors (`database is locked`, `IO Error`). Wenn DuckDB blockiert ist, erzwingt der Guard einen Reconnect oder startet temporaer in einer InMemory/Fallback-DB, bis die Haupt-DB wieder frei ist.
3. **Out-of-Log Recovery**: Der Watchdog laeuft als unabhaengiger Prozess (Daemon), der nicht im selben Prozessbaum stirbt wie die Haupt-App.
4. **Boot-Autostart**: Traegt sich (auf Windows) in die Registry oder Autostart-Ordner ein, um nach einem System-Reboot direkt wieder hochzufahren.
5. **Conflict Resolution**: Wenn zwei Instanzen gestartet werden, killt der Guard die "Zombie"-Instanz, bevor er die neue startet (Single-Instance Enforcer).

---

## Tech Stack

- **Sprache**: Python 3.12 (oder Go 1.22 fuer eine kompilierte 2MB Binary)
- **Monitoring**: `psutil` fuer Prozess-Status und Zombie-Detection
- **OS-Integration**: `winreg` (Windows Registry) fuer Autostart
- **DB-Check**: DuckDB API Test-Connects

---

## Architektur (Der "Unkillable" Loop)

```
[System Boot]
     │
     ▼
[Crash-Guard Daemon] ────────┐
     │                       │ (Ping-Check alle 5s)
     ▼                       ▼
[Main EXE / App] ◄──── (Watchdog)
     │                       │
     ▼ (Crash!)              │
     X ──────────────────────┘
     │ (Restart initiiert)
     ▼
[Main EXE / App] (wieder online)
```

## Gewuenschte Funktionalitaet im Code

### 1. Watchdog Loop (Python Beispiel-Struktur)
```python
import time
import subprocess
import psutil

TARGET_APP = "kirk-desktop.exe"
DB_PATH = "C:\\DEVKiTZ\\data\\main.duckdb"

def is_app_running():
    for proc in psutil.process_iter(['name']):
        if proc.info['name'] == TARGET_APP:
            return True
    return False

def restart_app():
    print(f"[{time.strftime('%X')}] 🔴 App offline. Neustart...")
    # Schliesse eventuelle Zombie-Prozesse zuerst
    kill_zombies()
    # Pruefe DuckDB Locks
    resolve_duckdb_locks()
    # Neustart
    subprocess.Popen([TARGET_APP], creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)

def loop():
    while True:
        if not is_app_running():
            restart_app()
        time.sleep(5)
```

### 2. DuckDB Lock Resolution
- Wenn die App abstuerzt, hinterlaesst sie oft ein `.wal` File oder blockiert die Datei.
- Der Watchdog versucht einen simplen Connect: `duckdb.connect(DB_PATH, read_only=True)`.
- Schlaegt das fehl (Lock), kann der Watchdog entweder das `.wal` bereinigen oder den Prozess killen, der die DB noch festhaelt, bevor die App neugestartet wird.

### 3. Autostart Registration (Windows)
- Skript kopiert sich selbst in `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup` ODER
- Schreibt in `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run`.

## Anweisung fuer den Agenten

1. **Schreibe das vollstaendige Watchdog-Skript (`crash_guard.py` oder `main.go`).**
2. Es muss robust sein und Exceptions abfangen (der Watchdog selbst darf NIE abstuerzen).
3. Implementiere die `psutil` Prozess-Ueberwachung.
4. Implementiere die DuckDB-Lock-Pruefung.
5. Sorge dafuer, dass der Watchdog die App in einer neuen Prozessgruppe (`CREATE_NEW_PROCESS_GROUP`) startet, damit ein Kill des Watchdogs nicht die App killt und umgekehrt.
6. Halte dich an R31 (keine Umlaute in Kommentaren/Logs).
