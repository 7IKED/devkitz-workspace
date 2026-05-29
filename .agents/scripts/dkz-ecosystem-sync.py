#!/usr/bin/env python3
"""
DkZ Ecosystem Sync — Haelt alle Registries aktuell. Kein LLM noetig.

Usage:
    python dkz-ecosystem-sync.py              # Alles sync
    python dkz-ecosystem-sync.py --features   # Nur features.json
    python dkz-ecosystem-sync.py --sitemap    # Nur global-sitemap.json
    python dkz-ecosystem-sync.py --ini        # Alle DIRECTORY.ini regenerieren
    python dkz-ecosystem-sync.py --validate   # Nur pruefen, nicht schreiben
"""

import os
import sys
import json
import argparse
import hashlib
from datetime import datetime
from pathlib import Path

# === KONFIGURATION ===
WORKSPACE = Path(r'C:\DEVKiTZ')
MODULES_DIR = WORKSPACE / '01_PROJECTS' / '01_dashboard' / 'modules'
FEATURES_JSON = WORKSPACE / '01_PROJECTS' / '01_dashboard' / 'features.json'
SITEMAP_JSON = WORKSPACE / '01_PROJECTS' / 'global-sitemap.json'
BASE_DOMAIN = 'devkitz.eu'

# Hauptordner fuer DIRECTORY.ini
MAIN_DIRS = [
    '00_INBOX', '01_PROJECTS', '02_RESEARCH', '03_MEDIA',
    '04_SYSTEM', '05_INTERN', '06_TEMPLATES', '99_ARCHIVE'
]

# Shared Scripts die in jedem Modul sein sollten
REQUIRED_SHARED = [
    'dkz-debug.js', 'dkz-navbar.js', 'dkz-autobug.js'
]


def log(msg):
    """Logging ohne print()"""
    sys.stdout.write(msg + '\n')
    sys.stdout.flush()


def scan_module(module_path):
    """Scannt ein einzelnes Modul und gibt Metadaten zurueck."""
    name = module_path.name
    index_html = module_path / 'index.html'
    readme_md = module_path / 'README.md'
    features_json = module_path / 'features.json'

    result = {
        'name': name.replace('-', ' ').title(),
        'hasIndex': index_html.exists(),
        'hasReadme': readme_md.exists(),
        'hasFeatures': features_json.exists(),
        'status': 'active',
        'files': len(list(module_path.rglob('*'))),
    }

    if index_html.exists():
        stat = index_html.stat()
        result['indexSize'] = stat.st_size
        result['lastModified'] = datetime.fromtimestamp(stat.st_mtime).isoformat()

        # Content Analysis
        try:
            content = index_html.read_text(encoding='utf-8', errors='ignore')
            result['hasEsc'] = 'function esc(' in content or 'esc(' in content
            result['hasHubButton'] = '../hub/' in content or 'hub/index.html' in content
            result['hasViewport'] = 'viewport' in content
            result['hasDkzVars'] = '--accent' in content
            result['hasAutobug'] = 'dkz-autobug' in content
            result['hasGoogleFonts'] = 'fonts.googleapis.com' in content
        except Exception:
            pass
    else:
        result['status'] = 'scaffold'
        result['indexSize'] = 0

    return result


def sync_features(validate_only=False):
    """Synchronisiert features.json mit dem Dateisystem."""
    log('[Features] Scanne Module...')

    # Bestehende features.json laden
    existing = {}
    if FEATURES_JSON.exists():
        try:
            with open(FEATURES_JSON, 'r', encoding='utf-8') as f:
                data = json.load(f)
                existing = data.get('modules', {})
        except Exception:
            pass

    # Alle Module scannen
    modules = {}
    total = 0
    with_index = 0
    with_readme = 0
    with_esc = 0
    with_autobug = 0

    for d in sorted(MODULES_DIR.iterdir()):
        if not d.is_dir() or d.name.startswith('.'):
            continue

        info = scan_module(d)
        modules[d.name] = info
        total += 1

        if info.get('hasIndex'):
            with_index += 1
        if info.get('hasReadme'):
            with_readme += 1
        if info.get('hasEsc'):
            with_esc += 1
        if info.get('hasAutobug'):
            with_autobug += 1

    stats = {
        'total': total,
        'withIndex': with_index,
        'withReadme': with_readme,
        'withEsc': with_esc,
        'withAutobug': with_autobug,
        'lastSync': datetime.now().isoformat(),
        'syncedBy': 'dkz-ecosystem-sync.py'
    }

    # Aenderungen erkennen
    added = [k for k in modules if k not in existing]
    removed = [k for k in existing if k not in modules]

    log(f'[Features] {total} Module | {with_index} Index | {with_readme} README | {with_esc} esc() | {with_autobug} AutoBug')
    if added:
        log(f'[Features] Neu: {", ".join(added[:10])}{"..." if len(added) > 10 else ""}')
    if removed:
        log(f'[Features] Entfernt: {", ".join(removed[:10])}')

    if validate_only:
        log('[Features] Validate-Modus — keine Aenderungen geschrieben.')
        return

    result = {
        'version': '2.0',
        'generated': datetime.now().isoformat(),
        'generator': 'dkz-ecosystem-sync.py',
        'stats': stats,
        'modules': modules
    }

    with open(FEATURES_JSON, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    log(f'[Features] features.json aktualisiert ({total} Module)')


def sync_sitemap(validate_only=False):
    """Generiert global-sitemap.json."""
    log('[Sitemap] Generiere...')

    sitemap = []

    # Projekte scannen
    projects_dir = WORKSPACE / '01_PROJECTS'
    for d in sorted(projects_dir.iterdir()):
        if not d.is_dir() or d.name.startswith('.'):
            continue
        index = d / 'index.html'
        if index.exists():
            sitemap.append({
                'id': d.name,
                'title': d.name.replace('-', ' ').replace('_', ' ').upper(),
                'url': f'https://{d.name}.{BASE_DOMAIN}/',
                'localPath': f'/{d.name}/',
                'type': 'project'
            })

    # Dashboard Module
    for d in sorted(MODULES_DIR.iterdir()):
        if not d.is_dir() or d.name.startswith('.'):
            continue
        index = d / 'index.html'
        if index.exists():
            sitemap.append({
                'id': d.name,
                'title': d.name.replace('-', ' ').title(),
                'url': f'https://{d.name}.{BASE_DOMAIN}/',
                'localPath': f'/01_dashboard/modules/{d.name}/',
                'type': 'module'
            })

    log(f'[Sitemap] {len(sitemap)} Eintraege generiert')

    if validate_only:
        log('[Sitemap] Validate-Modus — keine Aenderungen geschrieben.')
        return

    with open(SITEMAP_JSON, 'w', encoding='utf-8') as f:
        json.dump(sitemap, f, indent=2, ensure_ascii=False)

    log(f'[Sitemap] global-sitemap.json aktualisiert')


def sync_ini(validate_only=False):
    """Regeneriert DIRECTORY.ini in allen Hauptordnern."""
    log('[INI] Regeneriere DIRECTORY.ini...')

    count = 0
    for dirname in MAIN_DIRS:
        dirpath = WORKSPACE / dirname
        if not dirpath.exists():
            continue

        ini_path = dirpath / 'DIRECTORY.ini'
        subdirs = sorted([d.name for d in dirpath.iterdir() if d.is_dir() and not d.name.startswith('.')])
        files = sorted([f.name for f in dirpath.iterdir() if f.is_file() and not f.name.startswith('.')])

        content = f"""[directory]
name = {dirname}
path = {dirpath}
updated = {datetime.now().strftime('%Y-%m-%d %H:%M')}
generator = dkz-ecosystem-sync.py

[contents]
subdirectories = {len(subdirs)}
files = {len(files)}

[subdirs]
{chr(10).join(f'{i+1} = {s}' for i, s in enumerate(subdirs))}

[files]
{chr(10).join(f'{i+1} = {f}' for i, f in enumerate(files[:20]))}

[llm-directive]
purpose = {dirname.replace('_', ' ').strip('0123456789').strip()}
read_only = false
"""
        if validate_only:
            log(f'[INI] Wuerde aktualisieren: {ini_path}')
        else:
            with open(ini_path, 'w', encoding='utf-8') as f:
                f.write(content)
            count += 1

    log(f'[INI] {count} DIRECTORY.ini Dateien {"wuerden aktualisiert" if validate_only else "aktualisiert"}')


def main():
    parser = argparse.ArgumentParser(description='DkZ Ecosystem Sync')
    parser.add_argument('--features', action='store_true', help='Nur features.json')
    parser.add_argument('--sitemap', action='store_true', help='Nur global-sitemap.json')
    parser.add_argument('--ini', action='store_true', help='Nur DIRECTORY.ini')
    parser.add_argument('--validate', action='store_true', help='Nur pruefen')
    args = parser.parse_args()

    log('=' * 60)
    log('  DkZ Ecosystem Sync')
    log(f'  Workspace: {WORKSPACE}')
    log(f'  Modus: {"Validate" if args.validate else "Sync"}')
    log('=' * 60)

    run_all = not (args.features or args.sitemap or args.ini)

    if args.features or run_all:
        sync_features(args.validate)
    if args.sitemap or run_all:
        sync_sitemap(args.validate)
    if args.ini or run_all:
        sync_ini(args.validate)

    log('')
    log('[Sync] Fertig!')


if __name__ == '__main__':
    main()
