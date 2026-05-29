#!/usr/bin/env python3
"""
DkZ Open Connector — Multi-Service REST Bridge. Kein LLM noetig.

Verbindet: Paperless-ngx, OpenHands, n8n, GitHub, Drive, Webhook Hub.

Usage:
    python dkz-open-connector.py --list                    # Alle Services zeigen
    python dkz-open-connector.py --health                  # Alle Services pingen
    python dkz-open-connector.py --sync paperless          # Paperless sync
    python dkz-open-connector.py --sync openhands          # OpenHands Tasks
    python dkz-open-connector.py --push github             # Dateien zu GitHub
    python dkz-open-connector.py --webhook deepkeep-sync   # Webhook triggern
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

# === KONFIGURATION ===
CONFIG_FILE = Path(__file__).parent / 'services.json'
WORKSPACE = Path(r'C:\DEVKiTZ')

# Default Service Registry
DEFAULT_SERVICES = {
    "services": {
        "paperless": {
            "name": "Paperless-ngx",
            "url": "http://localhost:8000",
            "api": "/api/",
            "auth_type": "token",
            "env_key": "PAPERLESS_TOKEN",
            "description": "Dokumenten-Management mit OCR",
            "endpoints": {
                "documents": "/api/documents/",
                "tags": "/api/tags/",
                "search": "/api/documents/?query="
            }
        },
        "openhands": {
            "name": "OpenHands",
            "url": "http://localhost:3000",
            "api": "/api/",
            "auth_type": "none",
            "description": "AI Agent Workspace",
            "endpoints": {
                "tasks": "/api/tasks",
                "status": "/api/status"
            }
        },
        "n8n": {
            "name": "n8n Automation",
            "url": "http://localhost:5678",
            "api": "/api/v1/",
            "auth_type": "header",
            "env_key": "N8N_API_KEY",
            "description": "Workflow Automation Engine",
            "endpoints": {
                "workflows": "/api/v1/workflows",
                "executions": "/api/v1/executions"
            }
        },
        "gateway": {
            "name": "DkZ Gateway (ONTHERUN)",
            "url": "http://localhost:3040",
            "api": "/api/v1/",
            "auth_type": "none",
            "description": "NanoChat Bridge + LLM Cascade",
            "endpoints": {
                "health": "/api/v1/health",
                "cascade": "/api/v1/free-hub/cascade"
            }
        },
        "webhook-hub": {
            "name": "Webhook Hub",
            "url": "http://localhost:9090",
            "api": "/",
            "auth_type": "none",
            "description": "Event-basierte Webhook Verarbeitung",
            "endpoints": {
                "hooks": "/hooks",
                "health": "/health"
            }
        },
        "github": {
            "name": "GitHub API",
            "url": "https://api.github.com",
            "api": "/repos/7IKED/devkitz-workspace/",
            "auth_type": "bearer",
            "env_key": "GITHUB_TOKEN",
            "description": "Code Repository + Issues + Actions",
            "endpoints": {
                "issues": "/repos/7IKED/devkitz-workspace/issues",
                "releases": "/repos/7IKED/devkitz-workspace/releases",
                "actions": "/repos/7IKED/devkitz-workspace/actions/runs"
            }
        }
    }
}


def log(msg):
    sys.stdout.write(msg + '\n')
    sys.stdout.flush()


def load_config():
    """Laedt Service-Konfiguration."""
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    # Erstelle Default-Config
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(DEFAULT_SERVICES, f, indent=2, ensure_ascii=False)
    log(f'[Config] Default services.json erstellt: {CONFIG_FILE}')
    return DEFAULT_SERVICES


def http_request(url, method='GET', data=None, headers=None, timeout=5, retries=3):
    """HTTP Request mit Retry-Logik."""
    if headers is None:
        headers = {}
    headers.setdefault('User-Agent', 'DkZ-Open-Connector/1.0')
    headers.setdefault('Accept', 'application/json')

    for attempt in range(retries):
        try:
            body = json.dumps(data).encode('utf-8') if data else None
            if body:
                headers['Content-Type'] = 'application/json'

            req = Request(url, data=body, headers=headers, method=method)
            with urlopen(req, timeout=timeout) as resp:
                response_data = resp.read().decode('utf-8')
                try:
                    return json.loads(response_data), resp.status
                except json.JSONDecodeError:
                    return response_data, resp.status

        except HTTPError as e:
            if attempt < retries - 1 and e.code >= 500:
                wait = (2 ** attempt) * 0.5
                time.sleep(wait)
                continue
            return {'error': f'HTTP {e.code}: {e.reason}'}, e.code

        except (URLError, TimeoutError, OSError) as e:
            if attempt < retries - 1:
                wait = (2 ** attempt) * 0.5
                time.sleep(wait)
                continue
            return {'error': str(e)}, 0

    return {'error': 'Max retries erreicht'}, 0


def get_auth_headers(service):
    """Erstellt Auth-Headers basierend auf Service-Konfiguration."""
    headers = {}
    auth_type = service.get('auth_type', 'none')
    env_key = service.get('env_key', '')

    if auth_type == 'token' and env_key:
        token = os.environ.get(env_key, '')
        if token:
            headers['Authorization'] = f'Token {token}'
    elif auth_type == 'bearer' and env_key:
        token = os.environ.get(env_key, '')
        if token:
            headers['Authorization'] = f'Bearer {token}'
    elif auth_type == 'header' and env_key:
        token = os.environ.get(env_key, '')
        if token:
            headers['X-N8N-API-KEY'] = token

    return headers


def cmd_list(config):
    """Listet alle konfigurierten Services."""
    log('')
    log(f'  {"Service":<20} {"URL":<30} {"Auth":<10} Beschreibung')
    log('  ' + '-' * 80)

    for key, svc in config['services'].items():
        auth = svc.get('auth_type', 'none')
        env = svc.get('env_key', '')
        has_key = bool(os.environ.get(env, '')) if env else True
        auth_status = f'{auth} {"OK" if has_key else "MISSING"}'
        log(f'  {key:<20} {svc["url"]:<30} {auth_status:<10} {svc.get("description", "")}')

    log('')


def cmd_health(config):
    """Pingt alle Services."""
    log('')
    log(f'  {"Service":<20} {"Status":<10} {"Latency":<10} URL')
    log('  ' + '-' * 60)

    results = {}
    for key, svc in config['services'].items():
        url = svc['url']
        # Verwende health endpoint wenn vorhanden
        endpoints = svc.get('endpoints', {})
        health_path = endpoints.get('health', svc.get('api', '/'))
        full_url = url + health_path

        start = time.time()
        data, status = http_request(full_url, timeout=3, retries=1)
        latency = round((time.time() - start) * 1000)

        if status >= 200 and status < 400:
            emoji = 'GRUEN'
            results[key] = 'online'
        elif status > 0:
            emoji = 'GELB'
            results[key] = 'degraded'
        else:
            emoji = 'ROT'
            results[key] = 'offline'

        log(f'  {emoji:<4} {key:<16} {status:<10} {latency}ms      {full_url}')

    log('')

    online = sum(1 for v in results.values() if v == 'online')
    total = len(results)
    log(f'  {online}/{total} Services online')

    # Health Status speichern
    health_file = WORKSPACE / '04_SYSTEM' / 'health-status.json'
    health_data = {
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S'),
        'services': results,
        'online': online,
        'total': total
    }
    try:
        with open(health_file, 'w', encoding='utf-8') as f:
            json.dump(health_data, f, indent=2)
        log(f'  Health gespeichert: {health_file}')
    except Exception:
        pass

    log('')


def cmd_sync(config, service_name):
    """Synchronisiert mit einem Service."""
    if service_name not in config['services']:
        log(f'[Fehler] Service "{service_name}" nicht gefunden. Verfuegbar: {", ".join(config["services"].keys())}')
        return

    svc = config['services'][service_name]
    headers = get_auth_headers(svc)
    base_url = svc['url']

    if service_name == 'paperless':
        log('[Paperless] Lade Dokumente...')
        url = base_url + svc['endpoints']['documents']
        data, status = http_request(url, headers=headers)
        if status == 200 and isinstance(data, dict):
            count = data.get('count', 0)
            results = data.get('results', [])
            log(f'[Paperless] {count} Dokumente gefunden')
            for doc in results[:5]:
                title = doc.get('title', 'Ohne Titel')
                tags = ', '.join(str(t) for t in doc.get('tags', []))
                log(f'  - {title} (Tags: {tags})')
        else:
            log(f'[Paperless] Fehler: {data}')

    elif service_name == 'openhands':
        log('[OpenHands] Lade Tasks...')
        url = base_url + svc['endpoints'].get('tasks', '/api/tasks')
        data, status = http_request(url, headers=headers)
        if status == 200:
            log(f'[OpenHands] Response: {json.dumps(data, indent=2)[:500]}')
        else:
            log(f'[OpenHands] Status: {status} — {data}')

    elif service_name == 'github':
        log('[GitHub] Lade offene Issues...')
        url = base_url + svc['endpoints']['issues'] + '?state=open&per_page=10'
        data, status = http_request(url, headers=headers)
        if status == 200 and isinstance(data, list):
            log(f'[GitHub] {len(data)} Issues (letzte 10):')
            for issue in data:
                labels = ', '.join(l['name'] for l in issue.get('labels', []))
                log(f'  #{issue["number"]}: {issue["title"]} [{labels}]')
        else:
            log(f'[GitHub] Fehler: Status {status}')

    else:
        log(f'[{service_name}] Sync nicht implementiert. Verwende --health zum Pruefen.')


def cmd_webhook(config, webhook_name):
    """Triggert einen Webhook."""
    svc = config['services'].get('webhook-hub', {})
    url = svc.get('url', 'http://localhost:9090') + '/hooks/' + webhook_name

    log(f'[Webhook] Triggere: {url}')
    data, status = http_request(url, method='POST', data={
        'event': webhook_name,
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S'),
        'source': 'dkz-open-connector'
    })

    if status >= 200 and status < 400:
        log(f'[Webhook] Erfolgreich (Status {status})')
    else:
        log(f'[Webhook] Fehler: Status {status} — {data}')


def main():
    parser = argparse.ArgumentParser(description='DkZ Open Connector')
    parser.add_argument('--list', action='store_true', help='Services auflisten')
    parser.add_argument('--health', action='store_true', help='Health-Check')
    parser.add_argument('--sync', type=str, help='Mit Service synchronisieren')
    parser.add_argument('--push', type=str, help='Dateien pushen')
    parser.add_argument('--webhook', type=str, help='Webhook triggern')
    args = parser.parse_args()

    log('=' * 60)
    log('  DkZ Open Connector v1.0')
    log('  Multi-Service REST Bridge')
    log('=' * 60)

    config = load_config()

    if args.list:
        cmd_list(config)
    elif args.health:
        cmd_health(config)
    elif args.sync:
        cmd_sync(config, args.sync)
    elif args.webhook:
        cmd_webhook(config, args.webhook)
    else:
        log('[Info] Kein Befehl angegeben. Verwende --list, --health, --sync oder --webhook.')
        cmd_list(config)


if __name__ == '__main__':
    main()
