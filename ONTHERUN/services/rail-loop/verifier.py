"""
DEVKiTZ Rail-Loop Pipeline — Verifier
@DKZ:TAG → [SYS:rail-loop] [CAT:pipeline]
@version v1.0.0

Stufe 3: 3 unabhaengige NanoBots pruefen.
Konsens: Alle 3 muessen zustimmen.
"""

import json
import sys
from typing import List, Dict


def _bot_schema_check(blocks: List[Dict]) -> dict:
    """Bot 1: Schema-Pruefung — hat jeder Block die Pflichtfelder?"""
    required = ['type', 'content', 'line_start', 'line_end']
    errors = []
    for i, b in enumerate(blocks):
        missing = [f for f in required if f not in b]
        if missing:
            errors.append({'block': i, 'missing': missing})
        if not b.get('content', '').strip():
            errors.append({'block': i, 'issue': 'empty-content'})
    return {
        'bot': 'schema-check',
        'passed': len(errors) == 0,
        'errors': errors
    }


def _bot_pattern_check(blocks: List[Dict]) -> dict:
    """Bot 2: Pattern-Pruefung — stimmen die erkannten Typen?"""
    valid_types = {'FRAGE', 'NOTE', 'MEETING', 'CODE', 'LISTE', 'TABELLE', 'ABSATZ'}
    errors = []
    for i, b in enumerate(blocks):
        btype = b.get('type', '')
        if btype not in valid_types:
            errors.append({'block': i, 'invalid_type': btype})
        conf = b.get('confidence', 0)
        if conf < 0.3:
            errors.append({'block': i, 'low_confidence': conf})
        # Cross-check: Frage sollte ? enthalten
        if btype == 'FRAGE' and '?' not in b.get('content', ''):
            errors.append({'block': i, 'issue': 'frage-ohne-fragezeichen'})
        # Meeting sollte Datum-artige Strings haben
        if btype == 'MEETING':
            import re
            if not re.search(r'\d{4}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}\.\d{4}', b.get('content', '')):
                errors.append({'block': i, 'issue': 'meeting-ohne-datum', 'severity': 'warning'})
    return {
        'bot': 'pattern-check',
        'passed': len([e for e in errors if e.get('severity') != 'warning']) == 0,
        'errors': errors
    }


def _bot_content_check(blocks: List[Dict]) -> dict:
    """Bot 3: Content-Pruefung — Vollstaendigkeit und Qualitaet."""
    errors = []
    total_chars = 0
    for i, b in enumerate(blocks):
        content = b.get('content', '')
        total_chars += len(content)
        # Zu kurzer Content (unter 5 Zeichen, kein Code/Tabelle)
        if len(content.strip()) < 5 and b.get('type') not in ('CODE', 'TABELLE'):
            errors.append({'block': i, 'issue': 'content-too-short', 'length': len(content)})
        # Zu langer Block (ueber 5000 Zeichen)
        if len(content) > 5000:
            errors.append({'block': i, 'issue': 'content-too-long', 'length': len(content), 'severity': 'warning'})
        # Korrektur-Check: Wurden Korrekturen angewendet?
        if b.get('corrected') and not b.get('corrections'):
            errors.append({'block': i, 'issue': 'corrected-but-no-corrections-listed'})
    return {
        'bot': 'content-check',
        'passed': len([e for e in errors if e.get('severity') != 'warning']) == 0,
        'errors': errors,
        'stats': {'total_chars': total_chars, 'avg_chars': total_chars // max(len(blocks), 1)}
    }


def verify_consensus(blocks: List[Dict]) -> dict:
    """Fuehrt alle 3 Bots aus und prueft Konsens."""
    results = [
        _bot_schema_check(blocks),
        _bot_pattern_check(blocks),
        _bot_content_check(blocks),
    ]

    votes = {r['bot']: r['passed'] for r in results}
    consensus = all(r['passed'] for r in results)
    rejections = [r for r in results if not r['passed']]

    return {
        'consensus': consensus,
        'votes': votes,
        'rejections': [{'bot': r['bot'], 'errors': r['errors']} for r in rejections],
        'details': results
    }


if __name__ == '__main__':
    data = json.loads(sys.stdin.read())
    blocks = data if isinstance(data, list) else data.get('blocks', [])
    result = verify_consensus(blocks)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    sys.exit(0 if result['consensus'] else 1)
