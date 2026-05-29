#!/usr/bin/env python3
"""
CLOUDIA Auto-Sorter — Automatische Datei-Organisation
Triggert: Manuell, Cron, oder Webhook

Usage:
    python cloudia-auto.py --scan          # Desktop/Downloads scannen
    python cloudia-auto.py --7day          # 7-Tage-Regel anwenden
    python cloudia-auto.py --sort <datei>  # Einzelne Datei sortieren
    python cloudia-auto.py --dry-run       # Nur simulieren
    python cloudia-auto.py --watch 60      # Live-Watcher (Intervall Sek.)

@DKZ:TAG → [SYS:cloudia] [CAT:scripts] [LANG:py]
@version v1.00.0_01
"""
import os
import sys
import json
import time
import shutil
import hashlib
import logging
import argparse
import fnmatch
from datetime import datetime, timedelta
from pathlib import Path

# ═══ Config ═══
DESKTOP = Path(os.path.expanduser("~/Desktop"))
DOWNLOADS = Path(os.path.expanduser("~/Downloads"))
DEEPKEEP_ROOT = Path(os.path.expanduser("~/Documents/DEEPKEEP"))
LOG_FILE = Path(__file__).parent / "cloudia-auto-log.json"
MAX_LOG = 200

# Sortier-Regeln (Pattern → Ziel-Ordner)
RULES = [
    {"pattern": "*.md",       "target": "02_RESEARCH/"},
    {"pattern": "*.txt",      "target": "02_RESEARCH/"},
    {"pattern": "*.pdf",      "target": "02_RESEARCH/"},
    {"pattern": "*.doc",      "target": "02_RESEARCH/"},
    {"pattern": "*.docx",     "target": "02_RESEARCH/"},
    {"pattern": "*.jpg",      "target": "03_MEDIA/images/"},
    {"pattern": "*.jpeg",     "target": "03_MEDIA/images/"},
    {"pattern": "*.png",      "target": "03_MEDIA/images/"},
    {"pattern": "*.svg",      "target": "03_MEDIA/images/"},
    {"pattern": "*.gif",      "target": "03_MEDIA/images/"},
    {"pattern": "*.webp",     "target": "03_MEDIA/images/"},
    {"pattern": "*.mp4",      "target": "03_MEDIA/videos/"},
    {"pattern": "*.webm",     "target": "03_MEDIA/videos/"},
    {"pattern": "*.mov",      "target": "03_MEDIA/videos/"},
    {"pattern": "*.avi",      "target": "03_MEDIA/videos/"},
    {"pattern": "*.mp3",      "target": "03_MEDIA/audio/"},
    {"pattern": "*.wav",      "target": "03_MEDIA/audio/"},
    {"pattern": "*.flac",     "target": "03_MEDIA/audio/"},
    {"pattern": "*.ogg",      "target": "03_MEDIA/audio/"},
    {"pattern": "*.zip",      "target": "99_ARCHIVE/"},
    {"pattern": "*.tar",      "target": "99_ARCHIVE/"},
    {"pattern": "*.tar.gz",   "target": "99_ARCHIVE/"},
    {"pattern": "*.7z",       "target": "99_ARCHIVE/"},
    {"pattern": "*.rar",      "target": "99_ARCHIVE/"},
    {"pattern": "*.js",       "target": "01_PROJECTS/"},
    {"pattern": "*.py",       "target": "01_PROJECTS/"},
    {"pattern": "*.html",     "target": "01_PROJECTS/"},
    {"pattern": "*.css",      "target": "01_PROJECTS/"},
    {"pattern": "*.ts",       "target": "01_PROJECTS/"},
    {"pattern": "*.json",     "target": "04_SYSTEM/"},
    {"pattern": "*.eml",      "target": "07_EMAIL_DRAFTS/"},
    {"pattern": "*.msg",      "target": "07_EMAIL_DRAFTS/"},
    {"pattern": "*.exe",      "target": "06_DOWNLOADS_KEEP/"},
    {"pattern": "*.msi",      "target": "06_DOWNLOADS_KEEP/"},
    {"pattern": "*.iso",      "target": "06_DOWNLOADS_KEEP/"},
]

# ═══ Logging ═══
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger('cloudia-auto')

# ═══ Helpers ═══
def sha256_file(filepath, chunk_size=8192):
    """Content-Hash berechnen."""
    h = hashlib.sha256()
    try:
        with open(filepath, 'rb') as f:
            while True:
                chunk = f.read(chunk_size)
                if not chunk:
                    break
                h.update(chunk)
        return h.hexdigest()[:16]
    except (OSError, PermissionError):
        return 'ERROR'

def get_file_age_days(filepath):
    """Datei-Alter in Tagen."""
    try:
        mtime = os.path.getmtime(filepath)
        return (time.time() - mtime) / 86400
    except OSError:
        return 0

def match_rule(filename):
    """Sortier-Regel fuer Datei finden."""
    name_lower = filename.lower()
    for rule in RULES:
        if fnmatch.fnmatch(name_lower, rule["pattern"]):
            return rule
    return {"pattern": "*", "target": "_INBOX/"}

def ensure_deepkeep_structure():
    """DEEPKEEP Ordnerstruktur erstellen."""
    folders = [
        "01_PROJECTS", "02_RESEARCH", "03_MEDIA/images",
        "03_MEDIA/videos", "03_MEDIA/audio", "04_SYSTEM",
        "05_DESKTOP_KEEP", "06_DOWNLOADS_KEEP", "07_EMAIL_DRAFTS",
        "08_BLOGS", "99_ARCHIVE", "_INBOX"
    ]
    for f in folders:
        (DEEPKEEP_ROOT / f).mkdir(parents=True, exist_ok=True)
    log.info(f"DEEPKEEP Struktur sichergestellt: {DEEPKEEP_ROOT}")

def load_log():
    """Action-Log laden."""
    try:
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_log(entries):
    """Action-Log speichern."""
    entries = entries[-MAX_LOG:]
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)

def log_action(action, filename, source, target, dry_run=False):
    """Aktion loggen."""
    entries = load_log()
    entries.append({
        "ts": datetime.now().isoformat(),
        "action": action,
        "filename": filename,
        "source": str(source),
        "target": str(target),
        "dry_run": dry_run
    })
    save_log(entries)

# ═══ Scan ═══
def scan_directory(directory, max_files=100):
    """Verzeichnis scannen und Dateien auflisten."""
    results = []
    try:
        for entry in os.scandir(directory):
            if entry.is_file() and not entry.name.startswith('.'):
                try:
                    stat = entry.stat()
                    age = get_file_age_days(entry.path)
                    rule = match_rule(entry.name)
                    results.append({
                        "filename": entry.name,
                        "path": entry.path,
                        "size": stat.st_size,
                        "age_days": round(age, 1),
                        "rule_target": rule["target"],
                        "hash": sha256_file(entry.path) if stat.st_size < 50_000_000 else "TOO_LARGE"
                    })
                except (OSError, PermissionError):
                    continue
            if len(results) >= max_files:
                break
    except (OSError, PermissionError) as e:
        log.warning(f"Zugriffsfehler: {directory}: {e}")
    return results

# ═══ 7-Tage-Regel ═══
def check_7day(dry_run=False):
    """Dateien aelter als 7 Tage auf Desktop/Downloads finden und verschieben."""
    ensure_deepkeep_structure()
    moved = 0
    checked = 0

    for source_dir, keep_dir in [(DESKTOP, "05_DESKTOP_KEEP"), (DOWNLOADS, "06_DOWNLOADS_KEEP")]:
        if not source_dir.exists():
            log.warning(f"Verzeichnis nicht gefunden: {source_dir}")
            continue

        files = scan_directory(source_dir)
        for f in files:
            checked += 1
            if f["age_days"] >= 7:
                target = DEEPKEEP_ROOT / keep_dir / f["filename"]
                if dry_run:
                    log.info(f"[DRY-RUN] Wuerde verschieben: {f['filename']} → {keep_dir}/ ({f['age_days']:.0f} Tage)")
                    log_action("7day-dry", f["filename"], source_dir, keep_dir, dry_run=True)
                else:
                    try:
                        # Duplikat-Check
                        if target.exists():
                            base, ext = os.path.splitext(f["filename"])
                            target = DEEPKEEP_ROOT / keep_dir / f"{base}_{f['hash'][:8]}{ext}"
                        shutil.move(f["path"], str(target))
                        log.info(f"Verschoben: {f['filename']} → {keep_dir}/ ({f['age_days']:.0f} Tage)")
                        log_action("7day-move", f["filename"], source_dir, str(target))
                        moved += 1
                    except (OSError, PermissionError) as e:
                        log.warning(f"Fehler beim Verschieben: {f['filename']}: {e}")

    log.info(f"7-Tage-Check: {checked} geprueft, {moved} verschoben")
    return {"checked": checked, "moved": moved}

# ═══ Sort ═══
def sort_file(filepath, dry_run=False):
    """Einzelne Datei nach CLOUDIA Regeln sortieren."""
    ensure_deepkeep_structure()
    p = Path(filepath)
    if not p.exists():
        log.warning(f"Datei nicht gefunden: {filepath}")
        return None

    rule = match_rule(p.name)
    target = DEEPKEEP_ROOT / rule["target"] / p.name

    if dry_run:
        log.info(f"[DRY-RUN] {p.name} → {rule['target']}")
        return {"file": p.name, "target": rule["target"], "dry_run": True}

    try:
        if target.exists():
            base, ext = os.path.splitext(p.name)
            h = sha256_file(str(p))
            target = DEEPKEEP_ROOT / rule["target"] / f"{base}_{h[:8]}{ext}"
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(p), str(target))
        log.info(f"Sortiert: {p.name} → {rule['target']}")
        log_action("sort", p.name, str(p.parent), rule["target"])
        return {"file": p.name, "target": str(target)}
    except (OSError, PermissionError) as e:
        log.warning(f"Fehler: {e}")
        return None

# ═══ Watch ═══
def watch_mode(interval=60):
    """Live-Watcher fuer Desktop/Downloads."""
    log.info(f"Watch-Modus gestartet (Intervall: {interval}s)")
    log.info("Ctrl+C zum Beenden")
    known = set()
    try:
        while True:
            for d in [DESKTOP, DOWNLOADS]:
                if not d.exists():
                    continue
                for entry in os.scandir(d):
                    if entry.is_file() and entry.path not in known:
                        known.add(entry.path)
                        age = get_file_age_days(entry.path)
                        if age >= 7:
                            log.info(f"⏰ Alt: {entry.name} ({age:.0f} Tage) — verschiebe...")
                            sort_file(entry.path)
            time.sleep(interval)
    except KeyboardInterrupt:
        log.info("Watch-Modus beendet")

# ═══ Main ═══
def main():
    parser = argparse.ArgumentParser(description='CLOUDIA Auto-Sorter v1.0')
    parser.add_argument('--scan', action='store_true', help='Desktop/Downloads scannen')
    parser.add_argument('--7day', dest='sevenday', action='store_true', help='7-Tage-Regel anwenden')
    parser.add_argument('--sort', type=str, help='Einzelne Datei sortieren')
    parser.add_argument('--dry-run', action='store_true', help='Nur simulieren')
    parser.add_argument('--watch', type=int, nargs='?', const=60, help='Live-Watcher (Intervall Sek.)')
    parser.add_argument('--json', action='store_true', help='JSON Output')
    args = parser.parse_args()

    print('=' * 50)
    print('  CLOUDIA Auto-Sorter v1.0 — DEVKiTZ')
    print('=' * 50)

    if args.scan:
        print(f"\n📂 Scanne Desktop: {DESKTOP}")
        desk = scan_directory(DESKTOP)
        print(f"\n📂 Scanne Downloads: {DOWNLOADS}")
        down = scan_directory(DOWNLOADS)
        all_files = desk + down

        if args.json:
            print(json.dumps(all_files, indent=2, ensure_ascii=False))
        else:
            print(f"\n{'Datei':<40} {'Alter':>8} {'Groesse':>10} {'Ziel':<20}")
            print('-' * 80)
            for f in sorted(all_files, key=lambda x: x['age_days'], reverse=True):
                size_kb = f['size'] / 1024
                marker = '⚠️' if f['age_days'] >= 7 else '  '
                print(f"{marker}{f['filename'][:38]:<38} {f['age_days']:>6.0f}d {size_kb:>8.0f}KB {f['rule_target']:<20}")
            print(f"\nGesamt: {len(all_files)} Dateien ({sum(f['size'] for f in all_files) / 1048576:.1f} MB)")

    elif args.sevenday:
        result = check_7day(dry_run=args.dry_run)
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            print(f"\n{'[DRY-RUN] ' if args.dry_run else ''}7-Tage-Check abgeschlossen:")
            print(f"  Geprueft: {result['checked']}")
            print(f"  Verschoben: {result['moved']}")

    elif args.sort:
        result = sort_file(args.sort, dry_run=args.dry_run)
        if result and args.json:
            print(json.dumps(result, indent=2))

    elif args.watch is not None:
        watch_mode(args.watch)

    else:
        parser.print_help()

if __name__ == '__main__':
    main()
