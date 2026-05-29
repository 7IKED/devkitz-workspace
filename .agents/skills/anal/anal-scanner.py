#!/usr/bin/env python3
"""
/anal — DEVKiTZ Wochen-Analyse Scanner

Automatische Analyse aller offenen Baustellen, Git-History, REDNOTE, Module.
Erstellt priorisierten Aktionsplan als Markdown.

Usage:
    python anal-scanner.py                  # Letzte 7 Tage
    python anal-scanner.py --days 14        # Letzte 14 Tage
    python anal-scanner.py --json           # JSON Output
    python anal-scanner.py --output plan.md # In Datei schreiben

@DKZ:TAG → [SYS:system] [CAT:skills] [LANG:py]
@version v1.00.0_01
"""
import os
import re
import sys
import json
import subprocess
import logging
import argparse
from datetime import datetime, timedelta
from pathlib import Path

WORKSPACE = Path(r'C:\DEVKiTZ')
REDNOTE_PATH = WORKSPACE / '04_SYSTEM' / 'REDNOTE.json'
FEATURES_PATH = WORKSPACE / '01_PROJECTS' / '01_dashboard' / 'features.json'
BRAIN_DIR = Path(r'C:\Users\BAZE²\.gemini\antigravity\brain')

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s', datefmt='%H:%M:%S')
log = logging.getLogger('anal')


def run_git(args, cwd=None):
    """Git Command ausfuehren und Output zurueckgeben."""
    try:
        result = subprocess.run(
            ['git'] + args,
            capture_output=True, text=True, cwd=str(cwd or WORKSPACE),
            timeout=30
        )
        return result.stdout.strip()
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return ''


def analyze_git(days=7):
    """Git-History der letzten N Tage analysieren."""
    since = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')

    # Commits zaehlen
    log_output = run_git(['log', f'--since={since}', '--oneline'])
    commits = log_output.split('\n') if log_output else []
    total = len(commits)

    # Nach Typ kategorisieren
    types = {}
    for line in commits:
        m = re.match(r'^[a-f0-9]+\s+(\w+)', line)
        if m:
            t = m.group(1)
            types[t] = types.get(t, 0) + 1

    # Unpushed
    unpushed_output = run_git(['log', '--oneline', 'origin/main..HEAD'])
    unpushed = len(unpushed_output.split('\n')) if unpushed_output.strip() else 0

    # Status
    status_output = run_git(['status', '--short'])
    dirty = [l for l in status_output.split('\n') if l.strip()] if status_output else []

    return {
        'total_commits': total,
        'types': types,
        'unpushed': unpushed,
        'dirty_files': len(dirty),
        'dirty_list': dirty[:10],
        'since': since
    }


def analyze_rednote():
    """REDNOTE.json offene Eintraege."""
    try:
        with open(REDNOTE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {'open': [], 'stats': {}}

    entries = data.get('entries', [])
    open_entries = [e for e in entries if e.get('status') == 'open']
    in_progress = [e for e in entries if e.get('status') == 'in-progress']

    return {
        'stats': data.get('stats', {}),
        'open': open_entries,
        'in_progress': in_progress,
        'total': len(entries)
    }


def analyze_modules():
    """Module Status aus features.json."""
    try:
        with open(FEATURES_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {'total': 0, 'no_index': [], 'no_readme': []}

    modules = data.get('modules', {})
    no_index = []
    no_readme = []

    for name, info in modules.items():
        if not isinstance(info, dict):
            continue
        if not info.get('hasIndex'):
            no_index.append(name)
        if not info.get('hasReadme'):
            no_readme.append(name)

    return {
        'total': len(modules),
        'no_index': no_index,
        'no_readme': no_readme,
        'no_index_count': len(no_index),
        'no_readme_count': len(no_readme)
    }


def analyze_artefacts(days=7):
    """Brain-Artefakte der letzten N Tage zaehlen."""
    cutoff = datetime.now() - timedelta(days=days)
    artefacts = []

    if not BRAIN_DIR.exists():
        return artefacts

    for conv_dir in BRAIN_DIR.iterdir():
        if not conv_dir.is_dir() or conv_dir.name.startswith('.'):
            continue

        for fname in ['implementation_plan.md', 'task.md', 'walkthrough.md']:
            fpath = conv_dir / fname
            if fpath.exists():
                mtime = datetime.fromtimestamp(os.path.getmtime(fpath))
                if mtime > cutoff:
                    artefacts.append({
                        'file': fname,
                        'conversation': conv_dir.name[:8],
                        'modified': mtime.strftime('%Y-%m-%d'),
                        'size': fpath.stat().st_size
                    })

    return artefacts


def categorize_items(git_data, rednote_data, module_data):
    """Items in Prio-Kategorien einteilen."""
    items = []

    # REDNOTE critical = BLOCKER
    for entry in rednote_data.get('open', []):
        sev = entry.get('severity', 'low')
        prio = {
            'critical': 'BLOCKER',
            'high': 'PRIO-HIGH',
            'medium': 'PRIO-MED',
            'low': 'PRIO-LOW'
        }.get(sev, 'PRIO-LOW')

        items.append({
            'id': entry.get('id'),
            'title': entry.get('title'),
            'category': prio,
            'source': 'REDNOTE',
            'module': entry.get('module')
        })

    # Git unpushed = PRIO-HIGH
    if git_data.get('unpushed', 0) > 0:
        items.append({
            'id': 'GIT-PUSH',
            'title': f'{git_data["unpushed"]} Commits nicht auf GitHub',
            'category': 'PRIO-HIGH',
            'source': 'GIT'
        })

    # Dirty files = PRIO-MED
    if git_data.get('dirty_files', 0) > 0:
        items.append({
            'id': 'GIT-DIRTY',
            'title': f'{git_data["dirty_files"]} uncommitted Dateien',
            'category': 'PRIO-MED',
            'source': 'GIT'
        })

    # Module ohne index = PRIO-MED
    if module_data.get('no_index_count', 0) > 0:
        items.append({
            'id': 'MOD-INDEX',
            'title': f'{module_data["no_index_count"]} Module ohne index.html',
            'category': 'PRIO-MED',
            'source': 'FEATURES'
        })

    # Module ohne README = PRIO-LOW
    if module_data.get('no_readme_count', 0) > 0:
        items.append({
            'id': 'MOD-README',
            'title': f'{module_data["no_readme_count"]} Module ohne README.md',
            'category': 'PRIO-LOW',
            'source': 'FEATURES'
        })

    return items


def generate_report(days=7):
    """Kompletten Analyse-Report generieren."""
    git = analyze_git(days)
    rednote = analyze_rednote()
    modules = analyze_modules()
    artefacts = analyze_artefacts(days)
    items = categorize_items(git, rednote, modules)

    # Sortierung: BLOCKER → HIGH → MED → LOW
    prio_order = {'BLOCKER': 0, 'PRIO-HIGH': 1, 'PRIO-MED': 2, 'PRIO-LOW': 3}
    items.sort(key=lambda x: prio_order.get(x.get('category', ''), 4))

    emoji = {'BLOCKER': '🔴', 'PRIO-HIGH': '🟠', 'PRIO-MED': '🟡', 'PRIO-LOW': '🟢'}

    report = {
        'generated': datetime.now().isoformat(),
        'period_days': days,
        'git': git,
        'rednote': {
            'open': len(rednote.get('open', [])),
            'total': rednote.get('total', 0),
            'stats': rednote.get('stats', {})
        },
        'modules': modules,
        'artefacts': len(artefacts),
        'items': items,
        'blockers': sum(1 for i in items if i['category'] == 'BLOCKER'),
        'high': sum(1 for i in items if i['category'] == 'PRIO-HIGH'),
        'medium': sum(1 for i in items if i['category'] == 'PRIO-MED'),
        'low': sum(1 for i in items if i['category'] == 'PRIO-LOW')
    }

    return report


def print_report(report):
    """Report als ASCII-Tabelle ausgeben."""
    print('\n' + '=' * 60)
    print('  /anal — DEVKiTZ Wochen-Analyse')
    print(f'  Zeitraum: Letzte {report["period_days"]} Tage')
    print(f'  Generiert: {report["generated"][:19]}')
    print('=' * 60)

    git = report['git']
    print(f'\n  📊 Git-Aktivitaet (seit {git["since"]}):')
    print(f'     Commits:    {git["total_commits"]}')
    for t, c in sorted(git['types'].items(), key=lambda x: -x[1]):
        print(f'       {t}: {c}')
    print(f'     Unpushed:   {git["unpushed"]}')
    print(f'     Dirty:      {git["dirty_files"]}')

    print(f'\n  🔴 REDNOTE:')
    print(f'     Offen:      {report["rednote"]["open"]}')
    print(f'     Gesamt:     {report["rednote"]["total"]}')

    mod = report['modules']
    print(f'\n  📦 Module:')
    print(f'     Gesamt:     {mod["total"]}')
    print(f'     ⚠️ Ohne index: {mod["no_index_count"]}')
    print(f'     ⚠️ Ohne README: {mod["no_readme_count"]}')

    print(f'\n  📋 Artefakte (Brain): {report["artefacts"]}')

    print(f'\n  🎯 Offene Items ({len(report["items"])}):')
    print(f'     🔴 Blocker:   {report["blockers"]}')
    print(f'     🟠 High:      {report["high"]}')
    print(f'     🟡 Medium:    {report["medium"]}')
    print(f'     🟢 Low:       {report["low"]}')

    emoji = {'BLOCKER': '🔴', 'PRIO-HIGH': '🟠', 'PRIO-MED': '🟡', 'PRIO-LOW': '🟢'}
    if report['items']:
        print(f'\n  {"ID":<12} {"Prio":<6} {"Titel":<45} {"Quelle":<10}')
        print(f'  {"─" * 12} {"─" * 6} {"─" * 45} {"─" * 10}')
        for item in report['items']:
            e = emoji.get(item['category'], '⚪')
            title = item['title'][:45]
            print(f'  {item.get("id","?"):<12} {e}     {title:<45} {item.get("source",""):<10}')

    print(f'\n{"=" * 60}\n')


def main():
    parser = argparse.ArgumentParser(description='/anal — DEVKiTZ Wochen-Analyse')
    parser.add_argument('--days', type=int, default=7, help='Analyse-Zeitraum in Tagen')
    parser.add_argument('--json', action='store_true', help='JSON Output')
    parser.add_argument('--output', type=str, help='In Datei schreiben')
    args = parser.parse_args()

    report = generate_report(args.days)

    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False, default=str))
    else:
        print_report(report)

    if args.output:
        out_path = Path(args.output)
        try:
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False, default=str)
            log.info(f'Report gespeichert: {out_path}')
        except OSError as e:
            log.warning(f'Fehler beim Speichern: {e}')


if __name__ == '__main__':
    main()
