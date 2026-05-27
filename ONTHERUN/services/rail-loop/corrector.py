"""
DEVKiTZ Rail-Loop Pipeline — Corrector
@DKZ:TAG → [SYS:rail-loop] [CAT:pipeline]
@version v1.0.0

Stufe 2: NanoBot korrigiert geparste Bloecke.
Regelbasiert + optionaler LLM-Fallback via Gateway.
"""

import re
import json
from typing import List, Dict
from urllib.request import Request, urlopen
from urllib.error import URLError

GATEWAY = 'http://localhost:3040'


def correct_blocks(blocks: List[Dict]) -> List[Dict]:
    """Korrigiert alle Bloecke regelbasiert."""
    corrected = []
    for block in blocks:
        fixed = dict(block)
        changes = []

        content = fixed.get('content', '')

        # 1. Trailing Whitespace entfernen
        cleaned = '\n'.join(line.rstrip() for line in content.split('\n'))
        if cleaned != content:
            changes.append('trailing-whitespace')
            content = cleaned

        # 2. Doppelte Leerzeilen → einzelne
        while '\n\n\n' in content:
            content = content.replace('\n\n\n', '\n\n')
            if 'double-blank-lines' not in changes:
                changes.append('double-blank-lines')

        # 3. Satzanfang Grossschreibung (nur fuer ABSATZ und NOTE)
        if fixed.get('type') in ('ABSATZ', 'NOTE'):
            lines = content.split('\n')
            for i, line in enumerate(lines):
                stripped = line.lstrip()
                if stripped and stripped[0].isalpha() and stripped[0].islower():
                    # Nicht bei Code oder Variablen
                    if not re.match(r'^(const |let |var |def |class |import )', stripped):
                        indent = line[:len(line) - len(stripped)]
                        lines[i] = indent + stripped[0].upper() + stripped[1:]
                        if 'capitalize-sentence' not in changes:
                            changes.append('capitalize-sentence')
            content = '\n'.join(lines)

        # 4. Fehlende Interpunktion am Satzende
        if fixed.get('type') == 'ABSATZ':
            lines = content.split('\n')
            for i, line in enumerate(lines):
                stripped = line.strip()
                if stripped and len(stripped) > 20:
                    if stripped[-1] not in '.!?:;,)]\'"…—–-':
                        lines[i] = line.rstrip() + '.'
                        if 'missing-punctuation' not in changes:
                            changes.append('missing-punctuation')
            content = '\n'.join(lines)

        # 5. Markdown Lint: Header Spacing
        content = re.sub(r'^(#{1,6})([^ #\n])', r'\1 \2', content, flags=re.MULTILINE)
        if content != fixed.get('content', ''):
            if 'header-spacing' not in changes:
                changes.append('header-spacing')

        # 6. MEETING: Datum-Format normalisieren
        if fixed.get('type') == 'MEETING':
            content = re.sub(
                r'(\d{1,2})\.(\d{1,2})\.(\d{4})',
                lambda m: f'{m.group(3)}-{m.group(2).zfill(2)}-{m.group(1).zfill(2)}',
                content
            )
            if content != fixed.get('content', ''):
                changes.append('date-normalized')

        fixed['content'] = content
        fixed['corrected'] = len(changes) > 0
        fixed['corrections'] = changes
        corrected.append(fixed)

    return corrected


def correct_with_llm(blocks: List[Dict]) -> List[Dict]:
    """Fallback: LLM-basierte Korrektur ueber Gateway."""
    try:
        payload = json.dumps({
            'message': 'Korrigiere diese Textbloecke. Nur Grammatik und Format, kein Inhalt aendern.',
            'blocks': [b['content'] for b in blocks],
            'max_tokens': 500
        }).encode('utf-8')

        req = Request(
            f'{GATEWAY}/api/v1/free-hub/cascade',
            data=payload,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            # Parse LLM response back into blocks
            return blocks  # Placeholder — LLM integration later
    except (URLError, TimeoutError):
        return blocks  # Gateway offline, skip LLM


if __name__ == '__main__':
    import sys
    data = json.loads(sys.stdin.read())
    result = correct_blocks(data if isinstance(data, list) else data.get('blocks', []))
    print(json.dumps(result, indent=2, ensure_ascii=False))
