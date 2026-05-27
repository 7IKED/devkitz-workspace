"""
DEVKiTZ Rail-Loop Pipeline — Orchestrator
@DKZ:TAG → [SYS:rail-loop] [CAT:pipeline]
@version v1.0.0

4-Stufen Pipeline: PARSE → KORREKTUR → VERIFIZIERUNG → DOKUMENTATION
"""

import argparse
import json
import logging
import os
import sys
import time
from pathlib import Path
from datetime import datetime

from parser import parse_text
from corrector import correct_blocks
from verifier import verify_consensus
from documenter import document_results

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
log = logging.getLogger('rail-loop')


def emit_event(stage: str, status: str, data: dict = None):
    """JSON Event auf stdout fuer Dashboard-Integration."""
    event = {
        'timestamp': datetime.now().isoformat(),
        'stage': stage,
        'status': status,
        'data': data or {}
    }
    print(json.dumps(event, ensure_ascii=False), flush=True)


def run_pipeline(input_path: str, output_dir: str, max_retries: int = 3):
    """Fuehrt die komplette 4-Stufen Pipeline aus."""
    start = time.time()
    log.info(f'Rail-Loop Pipeline gestartet: {input_path}')

    # --- STUFE 1: PARSE ---
    emit_event('parse', 'started')
    log.info('[1/4] PARSE — Text in Bloecke zerlegen...')

    with open(input_path, 'r', encoding='utf-8') as f:
        text = f.read()

    parsed = parse_text(text)
    blocks = parsed['blocks']
    log.info(f'  → {parsed["total_blocks"]} Bloecke erkannt: {parsed["stats"]}')
    emit_event('parse', 'done', {'blocks': parsed['total_blocks'], 'stats': parsed['stats']})

    # --- STUFE 2: KORREKTUR ---
    emit_event('correct', 'started')
    log.info('[2/4] KORREKTUR — NanoBot korrigiert...')

    corrected = correct_blocks(blocks)
    changes = sum(1 for b in corrected if b.get('corrected'))
    log.info(f'  → {changes} Korrekturen vorgenommen')
    emit_event('correct', 'done', {'changes': changes})

    # --- STUFE 3: VERIFIZIERUNG (3-Bot Konsens) ---
    emit_event('verify', 'started')
    log.info('[3/4] VERIFIZIERUNG — 3 NanoBots pruefen...')

    attempt = 0
    verified = False
    rejection_log = []

    while attempt < max_retries and not verified:
        attempt += 1
        result = verify_consensus(corrected)
        verified = result['consensus']

        if not verified:
            log.warning(f'  ✗ Konsens NICHT erreicht (Versuch {attempt}/{max_retries})')
            rejection_log.append(result['rejections'])
            # Repair Street: Korrekturen nochmal anwenden
            corrected = correct_blocks(corrected)
        else:
            log.info(f'  ✓ Konsens erreicht: {result["votes"]}')

    if not verified:
        log.error(f'  ✗ Konsens nach {max_retries} Versuchen NICHT erreicht!')
        emit_event('verify', 'failed', {'attempts': attempt, 'rejections': rejection_log})
        # Trotzdem dokumentieren mit Warning-Flag
        corrected = [dict(b, verified=False) for b in corrected]
    else:
        corrected = [dict(b, verified=True) for b in corrected]

    emit_event('verify', 'done', {'consensus': verified, 'attempts': attempt})

    # --- STUFE 4: DOKUMENTATION ---
    emit_event('document', 'started')
    log.info('[4/4] DOKUMENTATION — Git + Logs + Archive...')

    os.makedirs(output_dir, exist_ok=True)
    doc_result = document_results(
        blocks=corrected,
        input_path=input_path,
        output_dir=output_dir,
        pipeline_stats={
            'total_blocks': len(corrected),
            'corrections': changes,
            'verified': verified,
            'attempts': attempt,
            'duration_s': round(time.time() - start, 2)
        }
    )

    log.info(f'  → Ergebnis: {doc_result["output_file"]}')
    log.info(f'  → Log: {doc_result["log_file"]}')
    emit_event('document', 'done', doc_result)

    # --- FERTIG ---
    duration = round(time.time() - start, 2)
    log.info(f'Pipeline abgeschlossen in {duration}s')
    emit_event('pipeline', 'complete', {
        'duration_s': duration,
        'blocks': len(corrected),
        'verified': verified
    })

    return {'success': True, 'duration': duration, 'blocks': len(corrected)}


# --- CLI ---
if __name__ == '__main__':
    p = argparse.ArgumentParser(description='DEVKiTZ Rail-Loop Pipeline')
    p.add_argument('--input', '-i', required=True, help='Input Textdatei (.md, .txt)')
    p.add_argument('--output', '-o', default='./output', help='Output Verzeichnis')
    p.add_argument('--retries', '-r', type=int, default=3, help='Max Versuche fuer Konsens')
    args = p.parse_args()

    result = run_pipeline(args.input, args.output, args.retries)
    sys.exit(0 if result['success'] else 1)
