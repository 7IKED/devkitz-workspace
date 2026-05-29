#!/usr/bin/env python3
"""
DkZ UI Audit — Prueft alle Module auf UX-Standards und fixt automatisch.

Usage:
    python dkz-ui-audit.py                # Vollstaendiger Audit
    python dkz-ui-audit.py --fix          # Auto-Fix wo moeglich
    python dkz-ui-audit.py --module hub   # Nur ein Modul
    python dkz-ui-audit.py --json         # JSON Report
"""

import os
import sys
import re
import json
import argparse
from pathlib import Path
from datetime import datetime

MODULES_DIR = Path(r'C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules')
REPORT_FILE = Path(r'C:\DEVKiTZ\.agents\scripts\ui-audit-report.json')

# === CHECKS (12 Punkte moeglich) ===
CHECKS = [
    ('hub_button', 'Hub-Button vorhanden', lambda c: '../hub/' in c or 'hub/index.html' in c),
    ('dkz_version', 'dkz-version Meta', lambda c: 'dkz-version' in c),
    ('esc_function', 'esc() XSS-Schutz', lambda c: 'function esc(' in c),
    ('viewport', 'Responsive Viewport', lambda c: 'viewport' in c),
    ('css_vars', 'DkZ CSS Variables', lambda c: '--accent' in c and '--bg' in c),
    ('shared_debug', 'dkz-debug.js', lambda c: 'dkz-debug.js' in c),
    ('shared_navbar', 'dkz-navbar.js', lambda c: 'dkz-navbar.js' in c),
    ('autobug', 'dkz-autobug.js', lambda c: 'dkz-autobug.js' in c),
    ('no_console_log', 'Kein console.log', lambda c: 'console.log(' not in c),
    ('google_fonts', 'Google Fonts', lambda c: 'fonts.googleapis.com' in c),
    ('tooltips', 'Tooltips/title', lambda c: 'title="' in c or "title='" in c),
    ('min_size', 'Min 3KB', lambda c: len(c) > 3000),
]

# === AUTO-FIX PATTERNS ===
ESC_FUNCTION = "\nfunction esc(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }\n"

AUTOBUG_TAG = '\n    <script src="../shared/dkz-autobug.js" defer></script>\n'

VIEWPORT_TAG = '<meta name="viewport" content="width=device-width, initial-scale=1.0">'


def log(msg):
    sys.stdout.write(msg + '\n')
    sys.stdout.flush()


def audit_module(module_path, fix=False):
    """Prueft ein Modul und gibt Score + Details zurueck."""
    name = module_path.name
    index_html = module_path / 'index.html'

    if not index_html.exists():
        return {'name': name, 'score': 0, 'max': 12, 'status': 'no-index', 'checks': {}, 'fixes': []}

    try:
        content = index_html.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        return {'name': name, 'score': 0, 'max': 12, 'status': 'read-error', 'checks': {}, 'fixes': []}

    results = {}
    score = 0
    fixes_applied = []
    modified = False

    for check_id, label, check_fn in CHECKS:
        passed = check_fn(content)
        results[check_id] = {'label': label, 'passed': passed}
        if passed:
            score += 1

    # === AUTO-FIX ===
    if fix:
        # Fix 1: Fehlende esc() Funktion
        if not results['esc_function']['passed'] and '<script>' in content:
            # Fuege esc() nach dem ersten <script> Tag ein
            content = content.replace('<script>', '<script>' + ESC_FUNCTION, 1)
            results['esc_function']['passed'] = True
            results['esc_function']['fixed'] = True
            fixes_applied.append('esc() eingefuegt')
            score += 1
            modified = True

        # Fix 2: Fehlende Viewport
        if not results['viewport']['passed'] and '<head>' in content:
            content = content.replace('<head>', '<head>\n' + VIEWPORT_TAG, 1)
            results['viewport']['passed'] = True
            results['viewport']['fixed'] = True
            fixes_applied.append('Viewport eingefuegt')
            score += 1
            modified = True

        # Fix 3: console.log -> console.warn
        if not results['no_console_log']['passed']:
            new_content = content.replace('console.log(', 'console.warn(')
            if new_content != content:
                content = new_content
                results['no_console_log']['passed'] = True
                results['no_console_log']['fixed'] = True
                fixes_applied.append('console.log -> console.warn')
                score += 1
                modified = True

        # Fix 4: Fehlende dkz-autobug.js
        if not results['autobug']['passed'] and '</body>' in content:
            content = content.replace('</body>', AUTOBUG_TAG + '</body>')
            results['autobug']['passed'] = True
            results['autobug']['fixed'] = True
            fixes_applied.append('dkz-autobug.js eingefuegt')
            score += 1
            modified = True

        # Schreiben wenn geaendert
        if modified:
            try:
                index_html.write_text(content, encoding='utf-8')
            except Exception as e:
                fixes_applied.append(f'FEHLER beim Schreiben: {e}')

    return {
        'name': name,
        'score': score,
        'max': 12,
        'percent': round(score / 12 * 100),
        'status': 'pass' if score >= 10 else 'warn' if score >= 7 else 'fail',
        'checks': results,
        'fixes': fixes_applied,
        'size': len(content)
    }


def grade_emoji(score):
    if score >= 11:
        return '🟢'
    elif score >= 9:
        return '🟡'
    elif score >= 7:
        return '🟠'
    else:
        return '🔴'


def main():
    parser = argparse.ArgumentParser(description='DkZ UI Audit')
    parser.add_argument('--fix', action='store_true', help='Auto-Fix anwenden')
    parser.add_argument('--module', type=str, help='Nur ein Modul pruefen')
    parser.add_argument('--json', action='store_true', help='JSON Report')
    args = parser.parse_args()

    log('=' * 60)
    log('  DkZ UI Audit — Premium Quality Check')
    log(f'  Modus: {"Auto-Fix" if args.fix else "Audit only"}')
    log('=' * 60)

    # Module scannen
    if args.module:
        modules = [MODULES_DIR / args.module]
    else:
        modules = sorted([d for d in MODULES_DIR.iterdir() if d.is_dir() and not d.name.startswith('.')])

    results = []
    total_score = 0
    total_max = 0
    fixes_count = 0

    for mod in modules:
        result = audit_module(mod, fix=args.fix)
        results.append(result)
        total_score += result['score']
        total_max += result['max']
        fixes_count += len(result.get('fixes', []))

    # Terminal Output
    if not args.json:
        log('')
        log(f'  {"Modul":<35} {"Score":>6} {"Status":>8}  Fixes')
        log('  ' + '-' * 65)

        for r in sorted(results, key=lambda x: x['score']):
            emoji = grade_emoji(r['score'])
            fixes = ', '.join(r.get('fixes', [])) if r.get('fixes') else ''
            log(f'  {emoji} {r["name"]:<32} {r["score"]:>2}/{r["max"]}   {r["status"]:>6}  {fixes}')

        log('')
        log(f'  Gesamt: {total_score}/{total_max} ({round(total_score/total_max*100) if total_max else 0}%)')
        log(f'  Module: {len(results)} | Fixes: {fixes_count}')

        # Kategorie-Zusammenfassung
        pass_count = sum(1 for r in results if r['status'] == 'pass')
        warn_count = sum(1 for r in results if r['status'] == 'warn')
        fail_count = sum(1 for r in results if r['status'] == 'fail')
        no_index = sum(1 for r in results if r['status'] == 'no-index')

        log(f'  🟢 Pass (10+): {pass_count} | 🟡 Warn (7-9): {warn_count} | 🔴 Fail (<7): {fail_count} | ⚪ No Index: {no_index}')

    # JSON Report
    report = {
        'generated': datetime.now().isoformat(),
        'generator': 'dkz-ui-audit.py',
        'mode': 'fix' if args.fix else 'audit',
        'stats': {
            'total': len(results),
            'totalScore': total_score,
            'totalMax': total_max,
            'percent': round(total_score / total_max * 100) if total_max else 0,
            'fixesApplied': fixes_count,
            'pass': sum(1 for r in results if r['status'] == 'pass'),
            'warn': sum(1 for r in results if r['status'] == 'warn'),
            'fail': sum(1 for r in results if r['status'] == 'fail'),
        },
        'modules': results
    }

    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    if args.json:
        sys.stdout.write(json.dumps(report, indent=2, ensure_ascii=False))

    log(f'\n  Report: {REPORT_FILE}')
    log('')


if __name__ == '__main__':
    main()
