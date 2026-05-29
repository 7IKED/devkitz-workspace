#!/usr/bin/env python3
"""
DEEPKEEP Sanitizer — Dateinamen saeubern und Ordner validieren

Usage:
    python deepkeep-sanitizer.py --scan <ordner>    # Nur scannen
    python deepkeep-sanitizer.py --fix <ordner>     # Umbenennen
    python deepkeep-sanitizer.py --validate         # DEEPKEEP Struktur pruefen
    python deepkeep-sanitizer.py --metadata <datei> # Metadata extrahieren

@DKZ:TAG → [SYS:deepkeep] [CAT:scripts] [LANG:py]
@version v1.00.0_01
"""
import os
import re
import sys
import json
import time
import hashlib
import logging
import argparse
import mimetypes
from datetime import datetime
from pathlib import Path

# ═══ Config ═══
DEEPKEEP_ROOT = Path(os.path.expanduser("~/Documents/DEEPKEEP"))
REPORT_FILE = Path(__file__).parent / "deepkeep-sanitizer-report.json"

# 12 Pflicht-Ordner
REQUIRED_FOLDERS = [
    "01_PROJECTS", "02_RESEARCH", "03_MEDIA/images",
    "03_MEDIA/videos", "03_MEDIA/audio", "04_SYSTEM",
    "05_DESKTOP_KEEP", "06_DOWNLOADS_KEEP", "07_EMAIL_DRAFTS",
    "08_BLOGS", "99_ARCHIVE", "_INBOX"
]

# Umlaut-Mapping
UMLAUT_MAP = {
    'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
    'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'à': 'a', 'á': 'a', 'â': 'a',
    'ù': 'u', 'ú': 'u', 'û': 'u',
    'ò': 'o', 'ó': 'o', 'ô': 'o',
    'ì': 'i', 'í': 'i', 'î': 'i',
    'ñ': 'n', 'ç': 'c'
}

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger('deepkeep-sanitizer')


def sanitize_filename(name):
    """Dateinamen saeubern — R8 konform."""
    base, ext = os.path.splitext(name)

    # 1. Umlaute ersetzen
    for ch, repl in UMLAUT_MAP.items():
        base = base.replace(ch, repl)

    # 2. Leerzeichen → Bindestriche
    base = base.replace(' ', '-')

    # 3. Nur erlaubte Zeichen (a-z, 0-9, -, _, .)
    base = re.sub(r'[^a-zA-Z0-9\-_.]', '', base)

    # 4. Doppelte Bindestriche/Unterstriche entfernen
    base = re.sub(r'-{2,}', '-', base)
    base = re.sub(r'_{2,}', '_', base)

    # 5. Fuehrende/Trailing Bindestriche/Unterstriche
    base = base.strip('-_.')

    # 6. Lowercase
    base = base.lower()

    if not base:
        base = 'unnamed'

    return base + ext.lower()


def sha256_file(filepath, chunk_size=8192):
    """SHA-256 Hash berechnen."""
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


def get_metadata(filepath):
    """Datei-Metadata extrahieren."""
    p = Path(filepath)
    try:
        stat = p.stat()
        mime, _ = mimetypes.guess_type(str(p))
        return {
            "filename": p.name,
            "path": str(p),
            "size_bytes": stat.st_size,
            "size_human": _format_size(stat.st_size),
            "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "extension": p.suffix.lower(),
            "mime_type": mime or "unknown",
            "hash": sha256_file(str(p)) if stat.st_size < 100_000_000 else "TOO_LARGE",
            "sanitized_name": sanitize_filename(p.name),
            "needs_rename": p.name != sanitize_filename(p.name)
        }
    except (OSError, PermissionError) as e:
        return {"filename": p.name, "error": str(e)}


def _format_size(b):
    """Bytes in lesbares Format."""
    if b < 1024: return f"{b} B"
    if b < 1048576: return f"{b/1024:.1f} KB"
    if b < 1073741824: return f"{b/1048576:.1f} MB"
    return f"{b/1073741824:.2f} GB"


def scan_directory(directory, max_depth=3):
    """Verzeichnis nach Dateien mit problematischen Namen scannen."""
    issues = []
    total = 0
    clean = 0
    p = Path(directory)

    if not p.exists():
        log.warning(f"Verzeichnis nicht gefunden: {directory}")
        return issues, 0, 0

    for root, dirs, files in os.walk(str(p)):
        depth = str(root).replace(str(p), '').count(os.sep)
        if depth >= max_depth:
            dirs.clear()
            continue

        for f in files:
            if f.startswith('.'):
                continue
            total += 1
            sanitized = sanitize_filename(f)
            if f != sanitized:
                issues.append({
                    "original": f,
                    "sanitized": sanitized,
                    "path": os.path.join(root, f),
                    "reason": _detect_issues(f)
                })
            else:
                clean += 1

    return issues, total, clean


def _detect_issues(name):
    """Probleme im Dateinamen erkennen."""
    reasons = []
    if any(c in name for c in 'äöüßÄÖÜ'):
        reasons.append('Umlaute')
    if ' ' in name:
        reasons.append('Leerzeichen')
    if re.search(r'[^a-zA-Z0-9\-_.\s]', os.path.splitext(name)[0]):
        reasons.append('Sonderzeichen')
    if name != name.lower():
        reasons.append('Grossbuchstaben')
    if '--' in name or '__' in name:
        reasons.append('Doppelte Trennzeichen')
    return ', '.join(reasons) if reasons else 'Format'


def fix_directory(directory, dry_run=False, max_depth=3):
    """Dateien im Verzeichnis umbenennen."""
    renamed = 0
    errors = 0
    p = Path(directory)

    if not p.exists():
        log.warning(f"Verzeichnis nicht gefunden: {directory}")
        return 0, 0

    for root, dirs, files in os.walk(str(p)):
        depth = str(root).replace(str(p), '').count(os.sep)
        if depth >= max_depth:
            dirs.clear()
            continue

        for f in files:
            if f.startswith('.'):
                continue
            sanitized = sanitize_filename(f)
            if f != sanitized:
                src = os.path.join(root, f)
                dst = os.path.join(root, sanitized)

                # Duplikat-Check
                if os.path.exists(dst):
                    base, ext = os.path.splitext(sanitized)
                    h = sha256_file(src)[:6]
                    dst = os.path.join(root, f"{base}_{h}{ext}")

                if dry_run:
                    log.info(f"[DRY-RUN] {f} → {os.path.basename(dst)}")
                else:
                    try:
                        os.rename(src, dst)
                        log.info(f"Umbenannt: {f} → {os.path.basename(dst)}")
                        renamed += 1
                    except (OSError, PermissionError) as e:
                        log.warning(f"Fehler: {f}: {e}")
                        errors += 1

    return renamed, errors


def validate_structure():
    """DEEPKEEP Ordnerstruktur validieren."""
    results = {
        "root_exists": DEEPKEEP_ROOT.exists(),
        "folders": {},
        "missing": [],
        "extra": [],
        "total_files": 0,
        "total_size": 0
    }

    if not DEEPKEEP_ROOT.exists():
        results["missing"] = REQUIRED_FOLDERS[:]
        return results

    for folder in REQUIRED_FOLDERS:
        fp = DEEPKEEP_ROOT / folder
        if fp.exists():
            file_count = sum(1 for _ in fp.rglob('*') if _.is_file())
            folder_size = sum(f.stat().st_size for f in fp.rglob('*') if f.is_file())
            results["folders"][folder] = {
                "exists": True,
                "files": file_count,
                "size": _format_size(folder_size)
            }
            results["total_files"] += file_count
            results["total_size"] += folder_size
        else:
            results["missing"].append(folder)
            results["folders"][folder] = {"exists": False, "files": 0, "size": "0 B"}

    # Extra-Ordner finden
    if DEEPKEEP_ROOT.exists():
        for item in DEEPKEEP_ROOT.iterdir():
            if item.is_dir() and not item.name.startswith('.'):
                rel = item.name
                if rel not in [f.split('/')[0] for f in REQUIRED_FOLDERS]:
                    results["extra"].append(rel)

    results["total_size_human"] = _format_size(results["total_size"])
    return results


def main():
    parser = argparse.ArgumentParser(description='DEEPKEEP Sanitizer v1.0')
    parser.add_argument('--scan', type=str, help='Verzeichnis scannen')
    parser.add_argument('--fix', type=str, help='Dateien umbenennen')
    parser.add_argument('--validate', action='store_true', help='DEEPKEEP Struktur pruefen')
    parser.add_argument('--metadata', type=str, help='Metadata einer Datei extrahieren')
    parser.add_argument('--dry-run', action='store_true', help='Nur simulieren')
    parser.add_argument('--json', action='store_true', help='JSON Output')
    args = parser.parse_args()

    print('=' * 50)
    print('  DEEPKEEP Sanitizer v1.0 — DEVKiTZ')
    print('=' * 50)

    if args.scan:
        issues, total, clean = scan_directory(args.scan)
        if args.json:
            print(json.dumps({"total": total, "clean": clean, "issues": len(issues), "details": issues}, indent=2, ensure_ascii=False))
        else:
            print(f"\n📂 Scan: {args.scan}")
            print(f"   Gesamt: {total} Dateien")
            print(f"   Sauber: {clean}")
            print(f"   Problematisch: {len(issues)}\n")
            if issues:
                print(f"{'Original':<40} {'Sanitized':<35} {'Grund':<20}")
                print('-' * 95)
                for i in issues[:30]:
                    print(f"{i['original'][:38]:<40} {i['sanitized'][:33]:<35} {i['reason'][:18]:<20}")
                if len(issues) > 30:
                    print(f"\n... und {len(issues) - 30} weitere")

    elif args.fix:
        renamed, errors = fix_directory(args.fix, dry_run=args.dry_run)
        status = '[DRY-RUN] ' if args.dry_run else ''
        print(f"\n{status}Fix abgeschlossen:")
        print(f"  Umbenannt: {renamed}")
        print(f"  Fehler: {errors}")

    elif args.validate:
        results = validate_structure()
        if args.json:
            print(json.dumps(results, indent=2, ensure_ascii=False))
        else:
            print(f"\n📁 DEEPKEEP Root: {DEEPKEEP_ROOT}")
            print(f"   Existiert: {'✅' if results['root_exists'] else '❌'}\n")
            print(f"{'Ordner':<25} {'Status':>8} {'Dateien':>10} {'Groesse':>12}")
            print('-' * 60)
            for folder in REQUIRED_FOLDERS:
                info = results['folders'].get(folder, {})
                status = '✅' if info.get('exists') else '❌'
                files = info.get('files', 0)
                size = info.get('size', '0 B')
                print(f"{folder:<25} {status:>8} {files:>10} {size:>12}")
            print(f"\n   Gesamt: {results['total_files']} Dateien, {results.get('total_size_human', '0 B')}")
            if results['missing']:
                print(f"\n   ⚠️ Fehlend: {', '.join(results['missing'])}")
            if results['extra']:
                print(f"   ℹ️ Extra: {', '.join(results['extra'])}")

        # Report speichern
        with open(REPORT_FILE, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"\n   Report: {REPORT_FILE}")

    elif args.metadata:
        meta = get_metadata(args.metadata)
        if args.json:
            print(json.dumps(meta, indent=2, ensure_ascii=False))
        else:
            print(f"\n📄 Metadata: {meta.get('filename', '?')}")
            for k, v in meta.items():
                if k != 'filename':
                    print(f"   {k}: {v}")

    else:
        parser.print_help()


if __name__ == '__main__':
    main()
