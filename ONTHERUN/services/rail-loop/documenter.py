"""
DEVKiTZ Rail-Loop Pipeline — Documenter
@DKZ:TAG → [SYS:rail-loop] [CAT:pipeline]
@version v1.0.0

Stufe 4: Ergebnisse dokumentieren — Git + Logs + Archive.
"""

import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Dict


def document_results(blocks: List[Dict], input_path: str, output_dir: str, pipeline_stats: dict) -> dict:
    """Dokumentiert Pipeline-Ergebnisse: Output-Datei, Log, Git Commit."""
    timestamp = datetime.now().strftime('%Y-%m-%d_%H%M%S')
    input_name = Path(input_path).stem

    # 1. Ergebnis-Datei schreiben
    output_file = os.path.join(output_dir, f'{input_name}_parsed_{timestamp}.json')
    result = {
        'meta': {
            'source': input_path,
            'generated': datetime.now().isoformat(),
            'pipeline': 'rail-loop-v1.0',
            'stats': pipeline_stats
        },
        'blocks': blocks
    }
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    # 2. Markdown-Report generieren
    md_file = os.path.join(output_dir, f'{input_name}_report_{timestamp}.md')
    _write_markdown_report(blocks, pipeline_stats, input_path, md_file)

    # 3. Log-Eintrag (JSON Lines)
    log_file = os.path.join(output_dir, 'pipeline.log.jsonl')
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'input': input_path,
        'output': output_file,
        'blocks': len(blocks),
        'verified': pipeline_stats.get('verified', False),
        'duration_s': pipeline_stats.get('duration_s', 0),
        'corrections': pipeline_stats.get('corrections', 0)
    }
    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')

    # 4. Git Commit (optional, silent fail)
    git_committed = _git_commit(output_dir, input_name, timestamp)

    return {
        'output_file': output_file,
        'report_file': md_file,
        'log_file': log_file,
        'git_committed': git_committed,
        'timestamp': timestamp
    }


def _write_markdown_report(blocks: List[Dict], stats: dict, source: str, path: str):
    """Generiert einen Markdown-Bericht."""
    lines = [
        f'# Rail-Loop Report',
        f'',
        f'> **Quelle:** `{source}`',
        f'> **Datum:** {datetime.now().strftime("%Y-%m-%d %H:%M")}',
        f'> **Duration:** {stats.get("duration_s", 0)}s',
        f'> **Verified:** {"✅ Ja" if stats.get("verified") else "❌ Nein"}',
        f'',
        f'---',
        f'',
        f'## Statistik',
        f'',
        f'| Metrik | Wert |',
        f'|:-------|:-----|',
        f'| Bloecke | {stats.get("total_blocks", len(blocks))} |',
        f'| Korrekturen | {stats.get("corrections", 0)} |',
        f'| Versuche | {stats.get("attempts", 1)} |',
        f'',
        f'## Block-Uebersicht',
        f'',
        f'| # | Typ | Zeilen | Confidence | Korrigiert |',
        f'|:--|:----|:-------|:-----------|:-----------|',
    ]

    for i, b in enumerate(blocks):
        corrected = '✅' if b.get('corrected') else '—'
        conf = f'{b.get("confidence", 0):.0%}'
        lines.append(f'| {i+1} | `{b.get("type", "?")}` | {b.get("line_start", "?")}-{b.get("line_end", "?")} | {conf} | {corrected} |')

    lines.extend(['', '---', '', f'*Generiert von Rail-Loop Pipeline v1.0*'])

    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))


def _git_commit(output_dir: str, name: str, timestamp: str) -> bool:
    """Git add + commit (silent fail wenn kein Git)."""
    try:
        subprocess.run(['git', 'add', output_dir], capture_output=True, timeout=10)
        subprocess.run(
            ['git', 'commit', '-m', f'docs(rail-loop): Pipeline Output {name} — {timestamp}', '--no-verify'],
            capture_output=True, timeout=10
        )
        return True
    except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
        return False


if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    result = document_results(
        blocks=data.get('blocks', []),
        input_path=data.get('input', 'unknown'),
        output_dir=data.get('output', './output'),
        pipeline_stats=data.get('stats', {})
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))
