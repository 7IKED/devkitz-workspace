#!/usr/bin/env python3
"""
CLOUDIA AutoSortierer v2.0 — 5-Zonen Datei-Automatisierung

Zonen:
  PROTECTED  → Niemals anfassen (Notepad, SecondBrain, Dot-Ordner, [Klammer])
  ZONE A     → 00_INBOX: Dateien > 30 Tage → DEEPKEEP + Bereich
  ZONE B     → 01-08: Nur REINSORTIEREN, Research NIEMALS Archiv
  ZONE C     → 99_ARCHIVE: Reintun + Naming + Rausstellen
  ZONE D     → Lose Ordner/Dateien → DEEPKEEP (Original) + Bereich (Kopie)

Usage:
    python cloudia-auto.py --scan              # Alles analysieren (Dry-Run)
    python cloudia-auto.py --sort-loose        # ZONE D: Lose sortieren
    python cloudia-auto.py --check-inbox       # ZONE A: 30-Tage Check
    python cloudia-auto.py --resort            # ZONE B: Falsche Zuordnungen fixen
    python cloudia-auto.py --manage-archive    # ZONE C: Archiv-Naming
    python cloudia-auto.py --tag-old-research  # Research als "old" taggen
    python cloudia-auto.py --full              # Alles ausfuehren
    python cloudia-auto.py --execute           # Ohne --execute = Dry-Run!

@DKZ:TAG → [SYS:cloudia] [CAT:scripts] [LANG:py]
@version v2.00.0_01
"""
import os
import re
import sys
import json
import csv
import time
import shutil
import hashlib
import logging
import argparse
from datetime import datetime, timedelta
from pathlib import Path

# ═══════════════════════════════════════════════════════
# Konfiguration laden
# ═══════════════════════════════════════════════════════
SCRIPT_DIR = Path(__file__).parent
CONFIG_PATH = SCRIPT_DIR / 'autosortierer-config.json'
CSV_LOG_PATH = SCRIPT_DIR / 'autosortierer-log.csv'

def load_config():
    """Lade Regelwerk aus JSON."""
    try:
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logging.warning(f'Config nicht gefunden: {CONFIG_PATH}')
        return {}
    except json.JSONDecodeError as e:
        logging.error(f'Config JSON-Fehler: {e}')
        return {}

CONFIG = load_config()
WORKSPACE = Path(CONFIG.get('workspace_root', r'C:\DEVKiTZ'))
DEEPKEEP = Path(CONFIG.get('deepkeep_path', str(WORKSPACE / '[DEEPKEEP]')))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger('autosortierer')


# ═══════════════════════════════════════════════════════
# Schutz-Pruefungen
# ═══════════════════════════════════════════════════════

def is_protected_dir(name):
    """Pruefe ob Ordner geschuetzt ist."""
    prot = CONFIG.get('protected', {})

    # Exakte Namen
    if name in prot.get('directories', []):
        return True

    # Pattern-Match (Dot-Ordner, 09_BRAIN*)
    for pattern in prot.get('directory_patterns', []):
        if re.match(pattern, name):
            return True

    return False


def is_protected_file(name):
    """Pruefe ob Datei geschuetzt ist."""
    prot = CONFIG.get('protected', {})

    # Exakte Namen
    if name in prot.get('files', []):
        return True

    # Pattern-Match
    for pattern in prot.get('file_patterns', []):
        if re.match(pattern, name):
            return True

    return False


def is_numbered(name):
    """Pruefe ob Name mit 00-99 Prefix beginnt."""
    return bool(re.match(r'^\d{2}_', name))


def is_bracketed(name):
    """Pruefe ob Name mit [...] beginnt."""
    return name.startswith('[')


def get_number_prefix(name):
    """Extrahiere Nummer-Prefix (z.B. '01' aus '01_PROJECTS')."""
    m = re.match(r'^(\d{2})_', name)
    return int(m.group(1)) if m else None


# ═══════════════════════════════════════════════════════
# Bereich-Zuordnung
# ═══════════════════════════════════════════════════════

def get_bereich_for_extension(ext):
    """Ordne Extension einem Bereich zu."""
    ext = ext.lower()
    mapping = CONFIG.get('extension_to_bereich', {})
    return mapping.get(ext, '00_INBOX')


def get_bereich_for_folder(name):
    """Ordne Ordner-Name einem Bereich zu."""
    mapping = CONFIG.get('folder_to_bereich', {})
    return mapping.get(name, '01_PROJECTS')


def is_research_folder(name):
    """Ist es ein Research-Ordner?"""
    research = CONFIG.get('zone_b_bereiche', {}).get('research_folders', [])
    return name in research


# ═══════════════════════════════════════════════════════
# Datei-Operationen
# ═══════════════════════════════════════════════════════

def file_age_days(filepath):
    """Alter der Datei in Tagen (letzte Aenderung)."""
    try:
        mtime = os.path.getmtime(filepath)
        return (time.time() - mtime) / (24 * 3600)
    except OSError:
        return 0


def file_last_access_days(filepath):
    """Tage seit letztem Zugriff."""
    try:
        atime = os.path.getatime(filepath)
        return (time.time() - atime) / (24 * 3600)
    except OSError:
        return 0


def sha256_short(filepath, length=8):
    """Kurzer SHA-256 Hash fuer Duplikat-Check."""
    h = hashlib.sha256()
    try:
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                h.update(chunk)
        return h.hexdigest()[:length]
    except (OSError, PermissionError):
        return 'error'


def ensure_dir(dirpath):
    """Erstelle Ordner wenn nicht vorhanden."""
    Path(dirpath).mkdir(parents=True, exist_ok=True)


def safe_move(src, dst, dry_run=True):
    """Sichere Verschiebung mit Duplikat-Schutz."""
    if dry_run:
        log.info(f'  [DRY-RUN] MOVE {src} → {dst}')
        return True

    dst_path = Path(dst)
    if dst_path.exists():
        # Duplikat: Hash-Suffix anhaengen
        base, ext = os.path.splitext(dst_path.name)
        h = sha256_short(str(src), 6)
        dst = str(dst_path.parent / f'{base}_{h}{ext}')

    ensure_dir(os.path.dirname(dst))
    try:
        shutil.move(str(src), str(dst))
        log.info(f'  MOVED {src} → {dst}')
        return True
    except (OSError, PermissionError, shutil.Error) as e:
        log.warning(f'  FEHLER beim Verschieben: {e}')
        return False


def safe_copy(src, dst, dry_run=True):
    """Sichere Kopie mit Duplikat-Schutz."""
    if dry_run:
        log.info(f'  [DRY-RUN] COPY {src} → {dst}')
        return True

    dst_path = Path(dst)
    if dst_path.exists():
        base, ext = os.path.splitext(dst_path.name)
        h = sha256_short(str(src), 6)
        dst = str(dst_path.parent / f'{base}_{h}{ext}')

    ensure_dir(os.path.dirname(dst))
    try:
        if os.path.isdir(src):
            shutil.copytree(str(src), str(dst), dirs_exist_ok=True)
        else:
            shutil.copy2(str(src), str(dst))
        log.info(f'  COPIED {src} → {dst}')
        return True
    except (OSError, PermissionError, shutil.Error) as e:
        log.warning(f'  FEHLER beim Kopieren: {e}')
        return False


# ═══════════════════════════════════════════════════════
# Protokollierung (CSV + Google Sheets)
# ═══════════════════════════════════════════════════════

def log_action(action, source, target, filename, filetype, size, rule, status, dry_run=True):
    """Protokolliere Aktion in CSV (und optional Google Sheets)."""
    entry = {
        'timestamp': datetime.now().isoformat(),
        'action': action,
        'source': str(source),
        'target': str(target),
        'filename': filename,
        'filetype': filetype,
        'size_bytes': size,
        'rule': rule,
        'status': 'DRY-RUN' if dry_run else status
    }

    # CSV Fallback (immer)
    csv_path = Path(CONFIG.get('csv_log_path', str(CSV_LOG_PATH)))
    file_exists = csv_path.exists()
    try:
        with open(csv_path, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=entry.keys())
            if not file_exists:
                writer.writeheader()
            writer.writerow(entry)
    except OSError as e:
        log.warning(f'CSV-Log Fehler: {e}')

    # Google Sheets (wenn konfiguriert)
    sheets_url = CONFIG.get('sheets_url', '')
    if sheets_url and not dry_run:
        _log_to_sheets(sheets_url, entry)

    return entry


def _log_to_sheets(url, entry):
    """Sende Eintrag an Google Sheets via Apps Script."""
    try:
        from urllib.request import Request, urlopen
        data = json.dumps({'action': 'log', 'entry': entry}).encode('utf-8')
        req = Request(url, data=data, headers={'Content-Type': 'application/json'})
        urlopen(req, timeout=5)
    except Exception as e:
        log.warning(f'Sheets-Log Fehler: {e}')


# ═══════════════════════════════════════════════════════
# ZONE A — 00_INBOX (30-Tage-Regel)
# ═══════════════════════════════════════════════════════

def check_inbox(dry_run=True):
    """ZONE A: Dateien in 00_INBOX die > 30 Tage nicht geoeffnet → DEEPKEEP."""
    inbox_cfg = CONFIG.get('zone_a_inbox', {})
    inbox_name = inbox_cfg.get('folder', '00_INBOX')
    max_days = inbox_cfg.get('max_days_unopened', 30)
    inbox_path = WORKSPACE / inbox_name

    if not inbox_path.exists():
        log.info(f'  {inbox_name} existiert nicht — uebersprungen')
        return []

    results = []
    print(f'\n{"=" * 60}')
    print(f'  ZONE A — {inbox_name} (>{max_days} Tage Regel)')
    print(f'{"=" * 60}')

    for entry in os.scandir(str(inbox_path)):
        if entry.name.startswith('.'):
            continue

        if entry.is_file():
            access_days = file_last_access_days(entry.path)
            if access_days > max_days:
                ext = Path(entry.name).suffix
                bereich = get_bereich_for_extension(ext)
                deepkeep_dst = DEEPKEEP / '_INBOX' / entry.name
                bereich_dst = WORKSPACE / bereich / entry.name

                action = {
                    'file': entry.name,
                    'age_days': round(access_days, 1),
                    'deepkeep': str(deepkeep_dst),
                    'bereich': str(bereich_dst),
                    'bereich_name': bereich,
                    'size': entry.stat().st_size
                }
                results.append(action)

                print(f'  📦 {entry.name} ({round(access_days)}d)')
                print(f'     → DEEPKEEP: {deepkeep_dst}')
                print(f'     → Kopie:    {bereich}/')

                # Ausfuehren
                ok1 = safe_move(entry.path, str(deepkeep_dst), dry_run)
                if ok1 and not dry_run:
                    # Kopie in zugehoerigen Bereich (aus DEEPKEEP!)
                    safe_copy(str(deepkeep_dst), str(bereich_dst), dry_run)

                log_action('INBOX_TO_DEEPKEEP', entry.path, str(deepkeep_dst),
                           entry.name, ext, entry.stat().st_size,
                           f'ZONE_A:>{max_days}d', 'OK', dry_run)

        elif entry.is_dir():
            # Ordner in INBOX: Gleiches Prinzip
            age_days = file_age_days(entry.path)
            if age_days > max_days:
                bereich = get_bereich_for_folder(entry.name)
                deepkeep_dst = DEEPKEEP / '_INBOX' / entry.name
                bereich_dst = WORKSPACE / bereich / entry.name

                print(f'  📁 {entry.name}/ ({round(age_days)}d)')
                print(f'     → DEEPKEEP: {deepkeep_dst}')
                print(f'     → Kopie:    {bereich}/')

                safe_move(entry.path, str(deepkeep_dst), dry_run)
                if not dry_run:
                    safe_copy(str(deepkeep_dst), str(bereich_dst), dry_run)

                log_action('INBOX_DIR_TO_DEEPKEEP', entry.path, str(deepkeep_dst),
                           entry.name, 'DIR', 0, f'ZONE_A:>{max_days}d', 'OK', dry_run)

    if not results:
        print(f'  ✅ Keine Dateien > {max_days} Tage in {inbox_name}')

    return results


# ═══════════════════════════════════════════════════════
# ZONE B — 01-08 (Nur Reinsortieren)
# ═══════════════════════════════════════════════════════

def resort_bereiche(dry_run=True):
    """ZONE B: Falsch einsortierte Dateien in richtigen Bereich verschieben."""
    folders = CONFIG.get('zone_b_bereiche', {}).get('folders', [])
    ext_map = CONFIG.get('extension_to_bereich', {})

    results = []
    print(f'\n{"=" * 60}')
    print(f'  ZONE B — Bereiche 01-08 (Reinsortieren)')
    print(f'{"=" * 60}')

    for folder_name in folders:
        folder_path = WORKSPACE / folder_name
        if not folder_path.exists():
            continue

        # Nur Root-Dateien in diesem Bereich pruefen (1 Ebene)
        for entry in os.scandir(str(folder_path)):
            if entry.name.startswith('.') or entry.is_dir():
                continue

            ext = Path(entry.name).suffix.lower()
            expected_bereich = ext_map.get(ext)

            if expected_bereich and expected_bereich != folder_name:
                # Datei ist FALSCH einsortiert
                correct_dst = WORKSPACE / expected_bereich / entry.name

                action = {
                    'file': entry.name,
                    'current': folder_name,
                    'correct': expected_bereich,
                    'path': entry.path
                }
                results.append(action)

                print(f'  🔄 {entry.name}')
                print(f'     {folder_name} → {expected_bereich}')

                ok = safe_copy(entry.path, str(correct_dst), dry_run)
                # ZONE B: NIEMALS aus Bereich ENTFERNEN — nur Kopie erstellen
                # Original bleibt wo es ist

                log_action('RESORT_COPY', entry.path, str(correct_dst),
                           entry.name, ext, entry.stat().st_size,
                           f'ZONE_B:{folder_name}→{expected_bereich}', 'OK', dry_run)

    if not results:
        print(f'  ✅ Alle Dateien korrekt einsortiert')

    return results


# ═══════════════════════════════════════════════════════
# ZONE C — 99_ARCHIVE (Reintun + Naming + Rausstellen)
# ═══════════════════════════════════════════════════════

def manage_archive(dry_run=True):
    """ZONE C: Archiv-Dateien umbenennen + Kopie in zugehoerigen Bereich."""
    archive_cfg = CONFIG.get('zone_c_archive', {})
    archive_name = archive_cfg.get('folder', '99_ARCHIVE')
    archive_path = WORKSPACE / archive_name
    naming_fmt = archive_cfg.get('naming_format', '{date}_{bereich}_{name}.{ext}')

    results = []
    print(f'\n{"=" * 60}')
    print(f'  ZONE C — {archive_name} (Naming + Rausstellen)')
    print(f'{"=" * 60}')

    if not archive_path.exists():
        print(f'  {archive_name} existiert nicht')
        return results

    for entry in os.scandir(str(archive_path)):
        if entry.name.startswith('.') or entry.is_dir():
            continue

        # Pruefe ob Datei schon benannt ist (YYYY-MM-DD Prefix)
        already_named = bool(re.match(r'^\d{4}-\d{2}-\d{2}_', entry.name))
        ext = Path(entry.name).suffix
        base = Path(entry.name).stem
        bereich = get_bereich_for_extension(ext)

        if not already_named:
            # Naming: [YYYY-MM-DD]_[bereich]_[name].[ext]
            date_str = datetime.now().strftime('%Y-%m-%d')
            bereich_short = bereich.split('_', 1)[-1].lower() if '_' in bereich else bereich.lower()
            new_name = f'{date_str}_{bereich_short}_{base.lower()}{ext.lower()}'
            new_path = archive_path / new_name

            print(f'  📝 NAMING: {entry.name} → {new_name}')

            if not dry_run:
                try:
                    os.rename(entry.path, str(new_path))
                except OSError as e:
                    log.warning(f'  Rename Fehler: {e}')

            log_action('ARCHIVE_RENAME', entry.path, str(new_path),
                       entry.name, ext, entry.stat().st_size,
                       f'ZONE_C:naming', 'OK', dry_run)

            source_for_copy = str(new_path) if not dry_run else entry.path
        else:
            new_name = entry.name
            source_for_copy = entry.path

        # Rausstellen: Kopie in zugehoerigen Bereich
        # Research-Dateien: NIEMALS archivieren (duerfen nur als old getaggt werden)
        if not is_research_folder(bereich):
            bereich_dst = WORKSPACE / bereich / new_name
            print(f'     → Kopie in {bereich}/')

            safe_copy(source_for_copy, str(bereich_dst), dry_run)
            log_action('ARCHIVE_REDISTRIBUTE', source_for_copy, str(bereich_dst),
                       new_name, ext, entry.stat().st_size,
                       f'ZONE_C:rausstellen→{bereich}', 'OK', dry_run)

        results.append({
            'file': entry.name,
            'new_name': new_name,
            'bereich': bereich,
            'already_named': already_named
        })

    if not results:
        print(f'  ✅ Archiv leer oder alle benannt')

    return results


# ═══════════════════════════════════════════════════════
# ZONE D — Lose Ordner/Dateien (ohne 00-99 Prefix)
# ═══════════════════════════════════════════════════════

def sort_loose(dry_run=True):
    """ZONE D: Ordner/Dateien ohne 00-99 Prefix → DEEPKEEP + Bereich."""
    results = []
    print(f'\n{"=" * 60}')
    print(f'  ZONE D — Lose Ordner/Dateien (→ DEEPKEEP + Bereich)')
    print(f'{"=" * 60}')

    for entry in os.scandir(str(WORKSPACE)):
        name = entry.name

        # Skip: Nummerierte Ordner (00-99)
        if is_numbered(name):
            continue

        # Skip: Klammer-Ordner [...]
        if is_bracketed(name):
            continue

        # Skip: Protected
        if is_protected_dir(name) if entry.is_dir() else is_protected_file(name):
            continue

        # Skip: node_modules
        if name == 'node_modules':
            continue

        if entry.is_dir():
            bereich = get_bereich_for_folder(name)
            deepkeep_dst = DEEPKEEP / name
            bereich_dst = WORKSPACE / bereich / name

            action = {
                'name': name,
                'type': 'DIR',
                'deepkeep': str(deepkeep_dst),
                'bereich': bereich,
                'bereich_dst': str(bereich_dst)
            }
            results.append(action)

            print(f'  📁 {name}/')
            print(f'     → DEEPKEEP (Original): {deepkeep_dst}/')
            print(f'     → Kopie: {bereich}/{name}/')

            # Original → DEEPKEEP
            ok = safe_move(entry.path, str(deepkeep_dst), dry_run)
            if ok:
                # Kopie aus DEEPKEEP → Bereich
                copy_src = str(deepkeep_dst) if not dry_run else entry.path
                safe_copy(copy_src, str(bereich_dst), dry_run)

            log_action('LOOSE_DIR_TO_DEEPKEEP', entry.path, str(deepkeep_dst),
                       name, 'DIR', 0, f'ZONE_D:loose→deepkeep', 'OK', dry_run)

        elif entry.is_file():
            ext = Path(name).suffix
            bereich = get_bereich_for_extension(ext)
            deepkeep_dst = DEEPKEEP / name
            bereich_dst = WORKSPACE / bereich / name

            action = {
                'name': name,
                'type': 'FILE',
                'deepkeep': str(deepkeep_dst),
                'bereich': bereich,
                'size': entry.stat().st_size
            }
            results.append(action)

            print(f'  📄 {name} ({_format_size(entry.stat().st_size)})')
            print(f'     → DEEPKEEP (Original): {deepkeep_dst}')
            print(f'     → Kopie: {bereich}/{name}')

            ok = safe_move(entry.path, str(deepkeep_dst), dry_run)
            if ok:
                copy_src = str(deepkeep_dst) if not dry_run else entry.path
                safe_copy(copy_src, str(bereich_dst), dry_run)

            log_action('LOOSE_FILE_TO_DEEPKEEP', entry.path, str(deepkeep_dst),
                       name, ext, entry.stat().st_size, f'ZONE_D:loose→deepkeep', 'OK', dry_run)

    if not results:
        print(f'  ✅ Keine losen Ordner/Dateien gefunden')

    return results


# ═══════════════════════════════════════════════════════
# Research "old" Tag
# ═══════════════════════════════════════════════════════

def tag_old_research(max_age_days=180, dry_run=True):
    """Research-Ordner die > max_age_days alt sind als 'old' taggen."""
    research_folders = CONFIG.get('zone_b_bereiche', {}).get('research_folders', [])

    results = []
    print(f'\n{"=" * 60}')
    print(f'  RESEARCH — old-Tag (>{max_age_days} Tage)')
    print(f'{"=" * 60}')
    print(f'  ℹ️  Research geht NIEMALS ins Archiv — wird nur getaggt')

    for folder_name in research_folders:
        folder_path = WORKSPACE / folder_name
        if not folder_path.exists():
            continue

        for entry in os.scandir(str(folder_path)):
            if not entry.is_dir() or entry.name.startswith('.'):
                continue

            # Bereits getaggt?
            status_file = Path(entry.path) / '_status.json'
            if status_file.exists():
                try:
                    with open(status_file, 'r', encoding='utf-8') as f:
                        status = json.load(f)
                    if status.get('status') == 'old':
                        continue  # Bereits getaggt
                except (json.JSONDecodeError, OSError):
                    pass

            age = file_age_days(entry.path)
            if age > max_age_days:
                print(f'  🏷️  {folder_name}/{entry.name} ({round(age)}d) → [old]')

                if not dry_run:
                    tag_data = {
                        'status': 'old',
                        'tagged_at': datetime.now().isoformat(),
                        'age_days_at_tag': round(age),
                        'note': 'Automatisch getaggt — Research bleibt fuer immer einsortiert'
                    }
                    try:
                        with open(status_file, 'w', encoding='utf-8') as f:
                            json.dump(tag_data, f, indent=2, ensure_ascii=False)
                    except OSError as e:
                        log.warning(f'  Tag-Fehler: {e}')

                log_action('RESEARCH_TAG_OLD', entry.path, str(status_file),
                           entry.name, 'DIR', 0,
                           f'RESEARCH:old>{max_age_days}d', 'OK', dry_run)

                results.append({
                    'folder': f'{folder_name}/{entry.name}',
                    'age_days': round(age)
                })

    if not results:
        print(f'  ✅ Kein Research aelter als {max_age_days} Tage')

    return results


# ═══════════════════════════════════════════════════════
# Scan (Read-Only Analyse)
# ═══════════════════════════════════════════════════════

def full_scan():
    """Kompletter Read-Only Scan — zeigt was passieren WUERDE."""
    print('\n' + '=' * 60)
    print('  CLOUDIA AutoSortierer v2.0 — Vollstaendiger Scan')
    print('  Modus: READ-ONLY (kein --execute)')
    print('=' * 60)

    # Zaehle Kategorien
    numbered = []
    bracketed = []
    protected = []
    loose_dirs = []
    loose_files = []

    for entry in os.scandir(str(WORKSPACE)):
        name = entry.name
        if is_numbered(name):
            numbered.append(name)
        elif is_bracketed(name):
            bracketed.append(name)
        elif is_protected_dir(name) if entry.is_dir() else is_protected_file(name):
            protected.append(name)
        elif name == 'node_modules':
            protected.append(name)
        elif entry.is_dir():
            loose_dirs.append(name)
        else:
            loose_files.append(name)

    print(f'\n  📊 Workspace: {WORKSPACE}')
    print(f'     Nummeriert (00-99): {len(numbered)}')
    print(f'     [Klammer]:         {len(bracketed)}')
    print(f'     Protected:         {len(protected)}')
    print(f'     Lose Ordner:       {len(loose_dirs)}')
    print(f'     Lose Dateien:      {len(loose_files)}')

    if loose_dirs:
        print(f'\n  📁 Lose Ordner (→ DEEPKEEP):')
        for d in sorted(loose_dirs):
            bereich = get_bereich_for_folder(d)
            print(f'     {d}/ → {bereich}')

    if loose_files:
        print(f'\n  📄 Lose Dateien (→ DEEPKEEP):')
        for f in sorted(loose_files):
            ext = Path(f).suffix
            bereich = get_bereich_for_extension(ext)
            print(f'     {f} → {bereich}')

    print()

    # Alle Zonen im Dry-Run
    check_inbox(dry_run=True)
    resort_bereiche(dry_run=True)
    manage_archive(dry_run=True)
    sort_loose(dry_run=True)
    tag_old_research(dry_run=True)

    print(f'\n{"=" * 60}')
    print(f'  Scan abgeschlossen. Nutze --execute um auszufuehren.')
    print(f'{"=" * 60}\n')


# ═══════════════════════════════════════════════════════
# Hilfsfunktionen
# ═══════════════════════════════════════════════════════

def _format_size(b):
    """Bytes in lesbares Format."""
    if b < 1024: return f'{b} B'
    if b < 1048576: return f'{b/1024:.1f} KB'
    if b < 1073741824: return f'{b/1048576:.1f} MB'
    return f'{b/1073741824:.2f} GB'


# ═══════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description='CLOUDIA AutoSortierer v2.0 — 5-Zonen Datei-Automatisierung',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Beispiele:
  python cloudia-auto.py --scan              # Alles analysieren
  python cloudia-auto.py --sort-loose        # Lose → DEEPKEEP (Dry-Run)
  python cloudia-auto.py --sort-loose --execute  # Lose → DEEPKEEP (ECHT!)
  python cloudia-auto.py --full --execute    # ALLES ausfuehren
'''
    )

    parser.add_argument('--scan', action='store_true',
                        help='Vollstaendiger Scan (Read-Only)')
    parser.add_argument('--sort-loose', action='store_true',
                        help='ZONE D: Lose Ordner/Dateien sortieren')
    parser.add_argument('--check-inbox', action='store_true',
                        help='ZONE A: 30-Tage Inbox-Check')
    parser.add_argument('--resort', action='store_true',
                        help='ZONE B: Falsche Zuordnungen fixen')
    parser.add_argument('--manage-archive', action='store_true',
                        help='ZONE C: Archiv Naming + Rausstellen')
    parser.add_argument('--tag-old-research', action='store_true',
                        help='Research als "old" taggen')
    parser.add_argument('--full', action='store_true',
                        help='Alle Zonen ausfuehren')
    parser.add_argument('--execute', action='store_true',
                        help='Wirklich ausfuehren (ohne = Dry-Run!)')
    parser.add_argument('--json', action='store_true',
                        help='JSON Output')

    args = parser.parse_args()
    dry_run = not args.execute

    print('=' * 60)
    print('  CLOUDIA AutoSortierer v2.0 — DEVKiTZ')
    print(f'  Modus: {"⚡ EXECUTE" if args.execute else "👁️ DRY-RUN (sicher)"}')
    print(f'  DEEPKEEP: {DEEPKEEP}')
    print('=' * 60)

    if not any([args.scan, args.sort_loose, args.check_inbox,
                args.resort, args.manage_archive, args.tag_old_research,
                args.full]):
        # Default: Scan
        full_scan()
        return

    if args.scan:
        full_scan()
        return

    all_results = {}

    if args.full or args.check_inbox:
        all_results['inbox'] = check_inbox(dry_run)

    if args.full or args.resort:
        all_results['resort'] = resort_bereiche(dry_run)

    if args.full or args.manage_archive:
        all_results['archive'] = manage_archive(dry_run)

    if args.full or args.sort_loose:
        all_results['loose'] = sort_loose(dry_run)

    if args.full or args.tag_old_research:
        all_results['research'] = tag_old_research(dry_run=dry_run)

    if args.json:
        print(json.dumps(all_results, indent=2, ensure_ascii=False, default=str))

    print(f'\n{"=" * 60}')
    if dry_run:
        print(f'  ℹ️  DRY-RUN — nichts wurde veraendert')
        print(f'  Nutze --execute um wirklich auszufuehren')
    else:
        print(f'  ✅ Ausfuehrung abgeschlossen')
        print(f'  📋 Log: {CSV_LOG_PATH}')
    print(f'{"=" * 60}\n')


if __name__ == '__main__':
    main()
