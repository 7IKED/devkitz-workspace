"""
chirurg_guard.py — DkZ Chirurg-Architektur v2
================================================
REGEL #0: NIE ERSETZEN. NIE LOESCHEN. NUR VERSIONIEREN + ARCHIVIEREN.

Wird in JEDEM Container ausgefuehrt.
- Chirurg: Darf alles (versioniert)
- Kopist:  Nur lesen + kopieren
- Chat:    Nur lesen + kopieren
"""

import os
import sys
import shutil
import hashlib
import json
import datetime
import logging

# --- Config ---
ROLE = os.getenv('ROLE', 'kopist')
ALLOWED = os.getenv('ALLOWED_OPS', 'read,copy').split(',')
TRESOR = os.getenv('TRESOR_PATH', '/data/tresor')
ARCHIVE = os.getenv('ARCHIVE_PATH', '/data/archive')
VERSION_DIR = os.getenv('VERSION_PATH', '/data/versions')
LOG_DIR = os.getenv('LOG_PATH', '/data/logs')
MODEL = os.getenv('MODEL', 'unknown')

# --- Logging ---
os.makedirs(LOG_DIR, exist_ok=True)
logging.basicConfig(
    filename=os.path.join(LOG_DIR, f'guard_{ROLE}_{MODEL}.log'),
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
log = logging.getLogger('chirurg_guard')


def _timestamp():
    return datetime.datetime.now().strftime('%Y%m%d_%H%M%S')


def _hash_file(path):
    """SHA256 Hash einer Datei"""
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()


def _ensure_dirs():
    """Archiv-Verzeichnisse sicherstellen"""
    for d in [ARCHIVE, VERSION_DIR,
              os.path.join(ARCHIVE, 'deleted'),
              os.path.join(ARCHIVE, 'moved'),
              os.path.join(ARCHIVE, 'replaced')]:
        os.makedirs(d, exist_ok=True)


def _log_operation(op, path, details=None):
    """Jede Operation loggen (Audit Trail)"""
    entry = {
        'timestamp': datetime.datetime.now().isoformat(),
        'role': ROLE,
        'model': MODEL,
        'operation': op,
        'path': path,
        'details': details or {}
    }
    log.info(json.dumps(entry))
    # Append to audit file
    audit_file = os.path.join(LOG_DIR, 'audit_trail.jsonl')
    with open(audit_file, 'a') as f:
        f.write(json.dumps(entry) + '\n')


def guard(operation, path):
    """Prueft ob Operation erlaubt ist — REGEL #0 Enforcement"""
    # Ausserhalb Tresor = keine Einschraenkung
    if not path.startswith(TRESOR):
        if operation in ('read', 'copy'):
            return True
        if ROLE == 'chirurg':
            return True
        # Kopisten duerfen nur in ihrem tmpfs schreiben
        if path.startswith('/tmp/work') or path.startswith('/data/output'):
            return True
        raise PermissionError(
            f"BLOCKIERT: {ROLE} darf nicht auf {path} zugreifen"
        )

    # Im Tresor: Strenge Pruefung
    if operation not in ALLOWED:
        _log_operation(f'BLOCKED_{operation}', path)
        raise PermissionError(
            f"BLOCKIERT: {ROLE} darf nicht '{operation}' auf {path}\n"
            f"Erlaubt: {ALLOWED}\n"
            f"REGEL #0: Nur versionieren + archivieren!"
        )

    return True


# === Sichere Operationen ===

def safe_read(path):
    """Lesen — immer erlaubt"""
    guard('read', path)
    _log_operation('read', path)
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def safe_read_binary(path):
    """Binaer lesen"""
    guard('read', path)
    _log_operation('read_binary', path)
    with open(path, 'rb') as f:
        return f.read()


def safe_copy(src, dst):
    """Kopieren — Kopisten duerfen nur AUSSERHALB Tresor ablegen"""
    guard('copy', src)
    if dst.startswith(TRESOR) and ROLE != 'chirurg':
        raise PermissionError(
            "BLOCKIERT: Kopisten duerfen NICHT in den Tresor schreiben!\n"
            f"Ziel: {dst}\nNutze /tmp/work/ oder /data/output/"
        )
    shutil.copy2(src, dst)
    _log_operation('copy', src, {'destination': dst})
    return dst


def safe_write_versioned(path, content):
    """
    REGEL #0: Schreibt NIE direkt ueber eine Datei.
    1. Original archivieren (wenn vorhanden)
    2. Versionierte Kopie erstellen
    3. Erst dann aktualisieren (nur Chirurg!)
    """
    guard('write', path)
    _ensure_dirs()
    ts = _timestamp()
    basename = os.path.basename(path)
    name, ext = os.path.splitext(basename)
    subdir = os.path.dirname(path).replace(TRESOR, '').strip('/')

    archive_path = None
    old_hash = None

    # 1. Original archivieren (wenn vorhanden)
    if os.path.exists(path):
        old_hash = _hash_file(path)
        archive_subdir = os.path.join(ARCHIVE, 'replaced', subdir)
        os.makedirs(archive_subdir, exist_ok=True)
        archive_path = os.path.join(archive_subdir, f'{name}_{ts}{ext}')
        shutil.copy2(path, archive_path)

    # 2. Versionierte Kopie erstellen
    version_subdir = os.path.join(VERSION_DIR, subdir)
    os.makedirs(version_subdir, exist_ok=True)
    version_path = os.path.join(version_subdir, f'{name}_v{ts}{ext}')
    with open(version_path, 'w', encoding='utf-8') as f:
        f.write(content)

    # 3. Nur Chirurg darf Original aktualisieren
    if ROLE == 'chirurg':
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)

    new_hash = _hash_file(version_path)
    _log_operation('write_versioned', path, {
        'archive': archive_path,
        'version': version_path,
        'old_hash': old_hash,
        'new_hash': new_hash,
    })

    return version_path, archive_path


def safe_delete_never(path):
    """
    REGEL #0: LOESCHT NIEMALS — verschiebt NUR ins Archiv.
    Die Datei existiert danach in archive/deleted/
    """
    guard('delete', path)
    _ensure_dirs()
    ts = _timestamp()
    basename = os.path.basename(path)
    subdir = os.path.dirname(path).replace(TRESOR, '').strip('/')

    archive_subdir = os.path.join(ARCHIVE, 'deleted', subdir)
    os.makedirs(archive_subdir, exist_ok=True)
    archive_path = os.path.join(archive_subdir, f'{basename}_{ts}')

    file_hash = _hash_file(path) if os.path.isfile(path) else None
    shutil.move(path, archive_path)

    _log_operation('delete_to_archive', path, {
        'archive': archive_path,
        'hash': file_hash,
    })

    return archive_path


def safe_move_versioned(src, dst):
    """
    REGEL #0: VERSCHIEBT NIE ohne Archiv-Kopie.
    Original bleibt als Kopie in archive/moved/
    """
    guard('move', src)
    guard('write', dst)
    _ensure_dirs()
    ts = _timestamp()
    basename = os.path.basename(src)
    subdir = os.path.dirname(src).replace(TRESOR, '').strip('/')

    # Archiv-Kopie
    archive_subdir = os.path.join(ARCHIVE, 'moved', subdir)
    os.makedirs(archive_subdir, exist_ok=True)
    archive_path = os.path.join(archive_subdir, f'{basename}_{ts}')
    shutil.copy2(src, archive_path)

    # Verschieben
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.move(src, dst)

    _log_operation('move_versioned', src, {
        'destination': dst,
        'archive': archive_path,
    })

    return dst, archive_path


# === Utility ===

def list_versions(path):
    """Alle Versionen einer Datei auflisten"""
    basename = os.path.basename(path)
    name, ext = os.path.splitext(basename)
    subdir = os.path.dirname(path).replace(TRESOR, '').strip('/')

    versions = []
    version_subdir = os.path.join(VERSION_DIR, subdir)
    if os.path.isdir(version_subdir):
        for f in sorted(os.listdir(version_subdir)):
            if f.startswith(name) and f.endswith(ext):
                fp = os.path.join(version_subdir, f)
                versions.append({
                    'file': f,
                    'path': fp,
                    'size': os.path.getsize(fp),
                    'modified': datetime.datetime.fromtimestamp(
                        os.path.getmtime(fp)
                    ).isoformat()
                })
    return versions


def get_audit_trail(limit=50):
    """Letzte Audit-Eintraege lesen"""
    audit_file = os.path.join(LOG_DIR, 'audit_trail.jsonl')
    if not os.path.exists(audit_file):
        return []
    with open(audit_file, 'r') as f:
        lines = f.readlines()
    entries = []
    for line in lines[-limit:]:
        try:
            entries.append(json.loads(line.strip()))
        except json.JSONDecodeError:
            pass
    return entries


# === Self-Test ===

if __name__ == '__main__':
    print(f"Chirurg Guard v2")
    print(f"  Role:    {ROLE}")
    print(f"  Model:   {MODEL}")
    print(f"  Allowed: {ALLOWED}")
    print(f"  Tresor:  {TRESOR}")
    print(f"  Archive: {ARCHIVE}")
    print(f"  Versions:{VERSION_DIR}")
    print(f"  REGEL #0: AKTIV")
    print()

    # Test: Kopist darf nicht schreiben
    if ROLE == 'kopist':
        try:
            safe_write_versioned('/data/tresor/test.txt', 'hack')
            print("  FEHLER: Kopist konnte schreiben!")
        except PermissionError as e:
            print(f"  OK: {e}")
    else:
        print("  Chirurg-Modus: Vollzugriff (versioniert)")
