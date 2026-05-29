#!/usr/bin/env python3
"""
DkZ Premium Injector — Fuegt dkz-premium.js in alle Module ein.

Usage:
    python dkz-premium-injector.py           # Trockenlauf (nur zaehlen)
    python dkz-premium-injector.py --inject  # Tatsaechlich einfuegen
    python dkz-premium-injector.py --check   # Nur pruefen welche es haben

@DKZ:TAG -> [SYS:scripts] [CAT:automation] [LANG:py]
@version v1.00.0_01
"""
import os
import sys
import re
from pathlib import Path

MODULES_DIR = Path(r'C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules')
PREMIUM_SCRIPT = '<script src="../../shared/dkz-premium.js" defer></script>'
PREMIUM_PATTERN = 'dkz-premium.js'


def scan_modules():
    """Scannt alle Module und gibt Status zurueck."""
    results = {'has': [], 'missing': [], 'no_index': [], 'errors': []}

    if not MODULES_DIR.exists():
        print(f'[FEHLER] Verzeichnis nicht gefunden: {MODULES_DIR}')
        return results

    for mod_dir in sorted(MODULES_DIR.iterdir()):
        if not mod_dir.is_dir():
            continue
        if mod_dir.name.startswith('.') or mod_dir.name == 'shared':
            continue

        index = mod_dir / 'index.html'
        if not index.exists():
            results['no_index'].append(mod_dir.name)
            continue

        try:
            content = index.read_text(encoding='utf-8', errors='replace')
            if PREMIUM_PATTERN in content:
                results['has'].append(mod_dir.name)
            else:
                results['missing'].append(mod_dir.name)
        except Exception as e:
            results['errors'].append((mod_dir.name, str(e)))

    return results


def inject_premium(dry_run=True):
    """Fuegt dkz-premium.js vor </body> ein."""
    results = scan_modules()
    injected = 0

    for mod_name in results['missing']:
        index = MODULES_DIR / mod_name / 'index.html'
        try:
            content = index.read_text(encoding='utf-8', errors='replace')

            # Strategie: Vor </body> einfuegen
            if '</body>' in content:
                # Finde die Stelle vor </body>
                insertion = f'\n{PREMIUM_SCRIPT}\n'
                new_content = content.replace('</body>', insertion + '</body>', 1)

                if not dry_run:
                    index.write_text(new_content, encoding='utf-8')

                injected += 1
                marker = 'INJECTED' if not dry_run else 'WOULD INJECT'
                print(f'  [{marker}] {mod_name}')
            else:
                print(f'  [SKIP] {mod_name} — kein </body> Tag')

        except Exception as e:
            print(f'  [ERROR] {mod_name}: {e}')

    return injected


def main():
    args = sys.argv[1:]
    mode = 'check'
    if '--inject' in args:
        mode = 'inject'
    elif '--check' in args:
        mode = 'check'

    print('=' * 60)
    print('  DkZ Premium Injector v1.0')
    print(f'  Modus: {mode.upper()}')
    print('=' * 60)

    results = scan_modules()

    print(f'\n  Module gesamt: {len(results["has"]) + len(results["missing"]) + len(results["no_index"])}')
    print(f'  Mit dkz-premium.js: {len(results["has"])}')
    print(f'  Ohne dkz-premium.js: {len(results["missing"])}')
    print(f'  Kein index.html: {len(results["no_index"])}')

    if results['has']:
        print(f'\n  BEREITS INTEGRIERT ({len(results["has"])}):')
        for m in results['has'][:10]:
            print(f'    OK {m}')
        if len(results['has']) > 10:
            print(f'    ... +{len(results["has"])-10} weitere')

    if mode == 'inject' and results['missing']:
        print(f'\n  INJECTING in {len(results["missing"])} Module...')
        count = inject_premium(dry_run=False)
        print(f'\n  {count} Module aktualisiert!')
    elif mode == 'check' and results['missing']:
        print(f'\n  FEHLEND ({len(results["missing"])}):')
        for m in results['missing']:
            print(f'    MISS {m}')
        print(f'\n  → Verwende --inject um einzufuegen')

    print()


if __name__ == '__main__':
    main()
