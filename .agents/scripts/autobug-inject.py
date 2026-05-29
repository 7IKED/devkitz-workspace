#!/usr/bin/env python3
"""
AutoBug Batch Injector — Fuegt dkz-autobug.js in alle Module ein die es noch nicht haben.

Usage:
    python autobug-inject.py             # Dry-Run (nur anzeigen)
    python autobug-inject.py --inject    # Wirklich einbauen
    python autobug-inject.py --report    # Report generieren

@DKZ:TAG -> [SYS:system] [CAT:scripts] [LANG:py]
@version v1.00.0_01
"""
import os
import re
import sys
import argparse
import logging
from pathlib import Path

MODULES_DIR = Path(r'C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules')
AUTOBUG_TAG = 'dkz-autobug'
AUTOBUG_SCRIPT = '<script src="../shared/dkz-autobug.js" defer></script>'

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s', datefmt='%H:%M:%S')
log = logging.getLogger('autobug-inject')


def find_modules_without_autobug():
    """Findet alle Module ohne dkz-autobug.js Einbindung."""
    missing = []
    has_it = []

    for module_dir in sorted(MODULES_DIR.iterdir()):
        if not module_dir.is_dir():
            continue
        index = module_dir / 'index.html'
        if not index.exists():
            continue

        content = index.read_text(encoding='utf-8', errors='ignore')
        if AUTOBUG_TAG in content.lower():
            has_it.append(module_dir.name)
        else:
            missing.append(module_dir.name)

    return missing, has_it


def inject_autobug(module_name):
    """Fuegt dkz-autobug.js vor </body> oder </html> ein."""
    index = MODULES_DIR / module_name / 'index.html'
    content = index.read_text(encoding='utf-8', errors='ignore')

    # Bereits vorhanden?
    if AUTOBUG_TAG in content.lower():
        return False, 'already_present'

    # Einfuegen vor </body>
    if '</body>' in content:
        content = content.replace('</body>', f'    {AUTOBUG_SCRIPT}\n</body>')
    elif '</html>' in content:
        content = content.replace('</html>', f'    {AUTOBUG_SCRIPT}\n</html>')
    else:
        content += f'\n{AUTOBUG_SCRIPT}\n'

    index.write_text(content, encoding='utf-8')
    return True, 'injected'


def main():
    parser = argparse.ArgumentParser(description='AutoBug Batch Injector')
    parser.add_argument('--inject', action='store_true', help='Wirklich einbauen')
    parser.add_argument('--report', action='store_true', help='Report generieren')
    args = parser.parse_args()

    missing, has_it = find_modules_without_autobug()

    if args.report or not args.inject:
        print(f'\n=== AutoBug Injection Report ===')
        print(f'Module MIT autobug: {len(has_it)}')
        print(f'Module OHNE autobug: {len(missing)}')
        print(f'\nFehlende Module:')
        for m in missing:
            print(f'  - {m}')
        if not args.inject:
            print(f'\nDry-Run: Nutze --inject um einzubauen')
        return

    if args.inject:
        injected = 0
        errors = 0
        for m in missing:
            try:
                ok, status = inject_autobug(m)
                if ok:
                    injected += 1
                    log.info(f'Injected: {m}')
                else:
                    log.info(f'Skip: {m} ({status})')
            except Exception as e:
                errors += 1
                log.warning(f'Error: {m} — {e}')

        print(f'\n=== AutoBug Injection Ergebnis ===')
        print(f'Injected: {injected}')
        print(f'Errors: {errors}')
        print(f'Total mit autobug: {len(has_it) + injected}')


if __name__ == '__main__':
    main()
