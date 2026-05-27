#!/usr/bin/env python3
"""
DkZ Prompt Decomposer — Zerlegt Prompts in Builder-Chain-Kategorien
@DKZ:TAG [SCRIPT:prompt-decomposer] [CAT:tools] [LANG:python]

Analysiert Prompts und zerlegt sie in:
  - Actions: Einzelne Aktionsschritte
  - Skills: Benötigte Fähigkeiten
  - Workflows: Ablauf-Sequenzen
  - Agents: Beteiligte Agenten
  - Teams: Team-Zuordnungen
  - Quellen: Datenquellen/Referenzen

Speichert als JSON unter Apache-Iceberg-Kategorisierung.
"""

import json
import re
import sys
import os
from datetime import datetime
from hashlib import sha256

# ═══════════════════════════════════════
# KEYWORD PATTERNS für Builder-Chain
# ═══════════════════════════════════════
PATTERNS = {
    'actions': {
        'keywords': [
            'erstelle', 'generiere', 'analysiere', 'optimiere', 'teste',
            'prüfe', 'konvertiere', 'exportiere', 'importiere', 'deploye',
            'starte', 'stoppe', 'update', 'lösche', 'kopiere',
            'create', 'generate', 'analyze', 'optimize', 'test',
            'check', 'convert', 'export', 'import', 'deploy',
            'build', 'run', 'fix', 'debug', 'refactor',
            'installiere', 'konfiguriere', 'verbinde', 'speichere', 'lade'
        ],
        'patterns': [
            r'(?:soll|muss|bitte)\s+(\w+)',
            r'(\w+)\s+(?:die|das|den|eine[mnr]?)',
            r'(?:kannst du|könntest du)\s+(\w+)',
        ]
    },
    'skills': {
        'keywords': [
            'javascript', 'python', 'html', 'css', 'go', 'java', 'php',
            'api', 'rest', 'graphql', 'websocket', 'oauth',
            'react', 'vue', 'node', 'fastapi', 'express',
            'sql', 'mongodb', 'redis', 'elasticsearch',
            'git', 'docker', 'kubernetes', 'ci/cd',
            'seo', 'a11y', 'i18n', 'responsive',
            'llm', 'prompt', 'mistral', 'gpt', 'claude', 'gemini',
            'ocr', 'tts', 'stt', 'nlp', 'ki', 'ai',
            'dkz-theme', 'dkz-debug', 'nexuz', 'james',
        ],
        'patterns': [
            r'(?:mit|using|via|über)\s+(\w+)',
            r'(\w+)[-.](?:js|py|go|css|html)',
        ]
    },
    'workflows': {
        'keywords': [
            'workflow', 'pipeline', 'ablauf', 'prozess', 'schritt',
            'erst', 'dann', 'danach', 'anschließend', 'zuletzt',
            'phase', 'stufe', 'reihenfolge', 'sequenz',
            'wenn', 'falls', 'sonst', 'loop', 'schleife',
            'batch', 'queue', 'cron', 'schedule',
        ],
        'patterns': [
            r'(\d+)\.\s+(.+)',
            r'(?:schritt|step)\s+(\d+)',
            r'(?:erst|zuerst|dann|danach)\s+(.+?)(?:\.|,|$)',
        ]
    },
    'agents': {
        'keywords': [
            'james', 'copilot', 'agent', 'bot', 'assistant',
            'openclaw', 'picoclaw', 'orchestrator',
            'antigravity', 'gemini', 'claude',
            'evaluator', 'analyzer', 'builder', 'debugger',
        ],
        'patterns': [
            r'(?:agent|bot)\s+(\w+)',
            r'(\w+)[-_]agent',
        ]
    },
    'teams': {
        'keywords': [
            'team', 'gruppe', 'rolle', 'admin', 'developer',
            'viewer', 'user', 'guest', 'berechtigte',
            'projekt', 'zugang', 'berechtigung',
        ],
        'patterns': [
            r'(?:team|gruppe)\s+(\w+)',
            r'(?:als|role)\s+(\w+)',
        ]
    },
    'quellen': {
        'keywords': [
            'quelle', 'source', 'datei', 'file', 'url', 'link',
            'api', 'endpoint', 'datenbank', 'database',
            'localstorage', 'iceberg', 'json', 'csv',
            'wiki', 'docs', 'readme', 'playbook', 'blaupause',
            'github', 'registry', 'archiv',
        ],
        'patterns': [
            r'(?:aus|from|von)\s+(\S+)',
            r'(?:datei|file)\s+(\S+)',
            r'(https?://\S+)',
            r'(\w+\.(?:json|html|js|py|go|md|css))',
        ]
    }
}

# ═══════════════════════════════════════
# PROMPT DECOMPOSER
# ═══════════════════════════════════════
def decompose(prompt_text):
    """Zerlegt einen Prompt in Builder-Chain-Kategorien."""
    result = {
        'id': 'PD-' + sha256(prompt_text.encode()).hexdigest()[:8],
        'timestamp': datetime.now().isoformat(),
        'original': prompt_text,
        'length': len(prompt_text),
        'tokens_est': len(prompt_text.split()),
        'categories': {}
    }

    text_lower = prompt_text.lower()
    sentences = re.split(r'[.!?\n]+', prompt_text)

    for cat, config in PATTERNS.items():
        found = []

        # Keyword matching
        for kw in config['keywords']:
            if kw.lower() in text_lower:
                # Find the sentence containing this keyword
                for sent in sentences:
                    if kw.lower() in sent.lower():
                        found.append({
                            'match': kw,
                            'context': sent.strip()[:120],
                            'type': 'keyword'
                        })
                        break

        # Pattern matching
        for pat in config['patterns']:
            matches = re.findall(pat, text_lower)
            for m in matches:
                match_str = m if isinstance(m, str) else ' '.join(m)
                if match_str.strip() and len(match_str) > 1:
                    found.append({
                        'match': match_str.strip(),
                        'type': 'pattern'
                    })

        # Deduplicate
        seen = set()
        unique = []
        for f in found:
            key = f['match'].lower()
            if key not in seen:
                seen.add(key)
                unique.append(f)

        result['categories'][cat] = {
            'count': len(unique),
            'items': unique[:10]  # max 10 per category
        }

    # Score: how well-distributed across categories
    counts = [result['categories'][c]['count'] for c in result['categories']]
    filled = sum(1 for c in counts if c > 0)
    result['coverage'] = round(filled / len(PATTERNS) * 100)
    result['score'] = min(100, sum(min(c, 3) * 5 for c in counts) + filled * 10)

    return result

# ═══════════════════════════════════════
# ICEBERG STORAGE (JSON-basiert)
# ═══════════════════════════════════════
STORE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'prompt-decompositions')

def save_decomposition(result):
    """Speichert Zerlegung in Apache-Iceberg-Struktur (JSON-Dateien)."""
    os.makedirs(STORE_DIR, exist_ok=True)

    # Main decomposition file
    filepath = os.path.join(STORE_DIR, result['id'] + '.json')
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    # Category index files
    for cat in result['categories']:
        cat_dir = os.path.join(STORE_DIR, 'categories', cat)
        os.makedirs(cat_dir, exist_ok=True)
        cat_file = os.path.join(cat_dir, 'index.json')

        # Load existing index
        index = []
        if os.path.exists(cat_file):
            with open(cat_file, 'r', encoding='utf-8') as f:
                index = json.load(f)

        index.append({
            'id': result['id'],
            'timestamp': result['timestamp'],
            'score': result['score'],
            'count': result['categories'][cat]['count'],
            'items': [i['match'] for i in result['categories'][cat]['items'][:5]]
        })

        with open(cat_file, 'w', encoding='utf-8') as f:
            json.dump(index, f, ensure_ascii=False, indent=2)

    # Combination scoring log
    combo_file = os.path.join(STORE_DIR, 'combinations.json')
    combos = []
    if os.path.exists(combo_file):
        with open(combo_file, 'r', encoding='utf-8') as f:
            combos = json.load(f)

    active_cats = sorted([c for c in result['categories'] if result['categories'][c]['count'] > 0])
    combo_key = '+'.join(active_cats)
    combos.append({
        'id': result['id'],
        'combination': combo_key,
        'categories': active_cats,
        'score': result['score'],
        'coverage': result['coverage'],
        'timestamp': result['timestamp']
    })

    with open(combo_file, 'w', encoding='utf-8') as f:
        json.dump(combos, f, ensure_ascii=False, indent=2)

    return filepath

def get_best_combinations(top_n=5):
    """Gibt die besten Kategorie-Kombinationen zurück."""
    combo_file = os.path.join(STORE_DIR, 'combinations.json')
    if not os.path.exists(combo_file):
        return []

    with open(combo_file, 'r', encoding='utf-8') as f:
        combos = json.load(f)

    # Group by combination key
    groups = {}
    for c in combos:
        key = c['combination']
        if key not in groups:
            groups[key] = {'combination': key, 'categories': c['categories'], 'scores': [], 'count': 0}
        groups[key]['scores'].append(c['score'])
        groups[key]['count'] += 1

    # Calculate averages
    for key in groups:
        groups[key]['avg_score'] = round(sum(groups[key]['scores']) / len(groups[key]['scores']), 1)
        groups[key]['best_score'] = max(groups[key]['scores'])

    # Sort by average score
    ranked = sorted(groups.values(), key=lambda x: x['avg_score'], reverse=True)
    return ranked[:top_n]


# ═══════════════════════════════════════
# CLI
# ═══════════════════════════════════════
if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python prompt_decomposer.py "<prompt_text>"')
        print('       python prompt_decomposer.py --best-combos')
        sys.exit(1)

    if sys.argv[1] == '--best-combos':
        combos = get_best_combinations()
        print(json.dumps(combos, ensure_ascii=False, indent=2))
    else:
        prompt = ' '.join(sys.argv[1:])
        result = decompose(prompt)
        save_decomposition(result)
        print(json.dumps(result, ensure_ascii=False, indent=2))
