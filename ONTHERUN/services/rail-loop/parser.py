"""
DEVKiTZ Rail-Loop Pipeline — Parser
@DKZ:TAG → [SYS:rail-loop] [CAT:pipeline]
@version v1.0.0

Regelbasiertes Text-Parsing ohne LLM.
Zerlegt Text in Absaetze und erkennt Patterns:
[FRAGE], [NOTE], [MEETING], [CODE], [LISTE], [TABELLE]
"""

import re
import json
import sys
from dataclasses import dataclass, asdict
from typing import List, Optional
from enum import Enum


class PatternType(Enum):
    FRAGE = "FRAGE"
    NOTE = "NOTE"
    MEETING = "MEETING"
    CODE = "CODE"
    LISTE = "LISTE"
    TABELLE = "TABELLE"
    ABSATZ = "ABSATZ"


@dataclass
class ParsedBlock:
    type: str
    content: str
    line_start: int
    line_end: int
    confidence: float
    markers: List[str]


# --- Pattern Regeln ---

FRAGE_PATTERNS = [
    r'.*\?\s*$',                          # Endet mit ?
    r'^(wer|was|wie|warum|wann|wo|welch)', # Deutsche Fragewoerter
    r'^(who|what|how|why|when|where|which)',# Englische Fragewoerter
    r'^(ist|sind|hat|kann|soll|wird)\s',   # Ja/Nein Fragen DE
    r'^(is|are|has|can|should|will|do)\s',  # Ja/Nein Fragen EN
]

MEETING_PATTERNS = [
    r'(protokoll|meeting|besprechung|sitzung)',
    r'(teilnehmer|anwesend|datum|uhrzeit)',
    r'(tagesordnung|top\s?\d|agenda)',
    r'(beschluss|ergebnis|action\s?item)',
    r'\d{4}-\d{2}-\d{2}.*(?:uhr|:00|:30)',
]

NOTE_PATTERNS = [
    r'^(note|notiz|hinweis|wichtig|achtung|todo|fixme)',
    r'^(merke|beachte|reminder|info)',
    r'^\[?(note|info|tip|warning|caution)\]?:?\s',
]

CODE_PATTERNS = [
    r'^```',
    r'^(def |class |function |const |let |var |import |from )',
    r'^\s*(if|for|while|return|try|catch)\s*[\(:{]',
]

LISTE_PATTERNS = [
    r'^\s*[-*+]\s',
    r'^\s*\d+[.)]\s',
    r'^\s*[a-z][.)]\s',
]

TABELLE_PATTERNS = [
    r'^\|.*\|.*\|',
    r'^[-|:]+$',
]


def detect_pattern(lines: List[str]) -> tuple:
    """Erkennt das Pattern eines Textblocks."""
    text = '\n'.join(lines).strip()
    first_line = lines[0].strip().lower() if lines else ''
    full_lower = text.lower()

    # Code-Block?
    if any(re.match(p, first_line) for p in CODE_PATTERNS):
        return PatternType.CODE, 0.95, ['code-block']

    # Tabelle?
    table_lines = sum(1 for l in lines if re.match(r'^\|.*\|', l.strip()))
    if table_lines >= 2:
        return PatternType.TABELLE, 0.9, ['table-format']

    # Meeting?
    meeting_hits = sum(1 for p in MEETING_PATTERNS if re.search(p, full_lower))
    if meeting_hits >= 2:
        return PatternType.MEETING, min(0.5 + meeting_hits * 0.15, 0.95), [f'meeting-{meeting_hits}-hits']

    # Liste?
    list_lines = sum(1 for l in lines if any(re.match(p, l) for p in LISTE_PATTERNS))
    if list_lines >= 2 or (list_lines == 1 and len(lines) <= 3):
        return PatternType.LISTE, 0.85, ['list-format']

    # Frage?
    if any(re.match(p, first_line, re.IGNORECASE) for p in FRAGE_PATTERNS):
        return PatternType.FRAGE, 0.9, ['question-pattern']
    if text.strip().endswith('?'):
        return PatternType.FRAGE, 0.8, ['ends-with-questionmark']

    # Note?
    if any(re.match(p, first_line, re.IGNORECASE) for p in NOTE_PATTERNS):
        return PatternType.NOTE, 0.85, ['note-keyword']

    # Default: Absatz
    return PatternType.ABSATZ, 0.5, ['default-paragraph']


def split_into_blocks(text: str) -> List[ParsedBlock]:
    """Zerlegt Text in logische Bloecke und klassifiziert sie."""
    lines = text.split('\n')
    blocks = []
    current_block = []
    block_start = 1
    in_code = False

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        # Code-Block Toggle
        if stripped.startswith('```'):
            if in_code:
                current_block.append(line)
                pattern_type, confidence, markers = PatternType.CODE, 0.95, ['fenced-code']
                blocks.append(ParsedBlock(
                    type=pattern_type.value,
                    content='\n'.join(current_block),
                    line_start=block_start,
                    line_end=i,
                    confidence=confidence,
                    markers=markers
                ))
                current_block = []
                block_start = i + 1
                in_code = False
                continue
            else:
                if current_block:
                    _flush_block(current_block, block_start, i - 1, blocks)
                current_block = [line]
                block_start = i
                in_code = True
                continue

        if in_code:
            current_block.append(line)
            continue

        # Leere Zeile = Block-Trenner
        if not stripped:
            if current_block:
                _flush_block(current_block, block_start, i - 1, blocks)
                current_block = []
                block_start = i + 1
            else:
                block_start = i + 1
            continue

        # Markdown Header = neuer Block
        if stripped.startswith('#'):
            if current_block:
                _flush_block(current_block, block_start, i - 1, blocks)
            current_block = [line]
            block_start = i
            _flush_block(current_block, block_start, i, blocks)
            current_block = []
            block_start = i + 1
            continue

        # Horizontale Linie = Block-Trenner
        if re.match(r'^-{3,}$|^={3,}$|^\*{3,}$', stripped):
            if current_block:
                _flush_block(current_block, block_start, i - 1, blocks)
                current_block = []
                block_start = i + 1
            continue

        current_block.append(line)

    # Letzten Block flushen
    if current_block:
        _flush_block(current_block, block_start, len(lines), blocks)

    return blocks


def _flush_block(lines, start, end, blocks):
    """Erkennt Pattern und fuegt Block hinzu."""
    pattern_type, confidence, markers = detect_pattern(lines)
    blocks.append(ParsedBlock(
        type=pattern_type.value,
        content='\n'.join(lines),
        line_start=start,
        line_end=end,
        confidence=confidence,
        markers=markers
    ))


def parse_text(text: str) -> dict:
    """Hauptfunktion: Text parsen und als strukturiertes Ergebnis zurueckgeben."""
    blocks = split_into_blocks(text)

    stats = {}
    for b in blocks:
        stats[b.type] = stats.get(b.type, 0) + 1

    return {
        'version': '1.0.0',
        'total_blocks': len(blocks),
        'stats': stats,
        'blocks': [asdict(b) for b in blocks]
    }


# --- CLI ---
if __name__ == '__main__':
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        text = sys.stdin.read()

    result = parse_text(text)
    print(json.dumps(result, indent=2, ensure_ascii=False))
