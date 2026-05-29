#!/usr/bin/env python3
"""
CLOUDIA Health Monitor — Provider Status pruefen

Usage:
    python health-monitor.py                # Einmal checken
    python health-monitor.py --watch 300    # Alle 5 Min pruefen
    python health-monitor.py --json         # JSON Output
    python health-monitor.py --webhook      # Webhook triggern bei Fehler

@DKZ:TAG → [SYS:cloudia] [CAT:scripts] [LANG:py]
@version v1.00.0_01
"""
import os
import sys
import json
import time
import logging
import argparse
from datetime import datetime
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

# ═══ Config ═══
STATUS_FILE = Path(__file__).parent / "health-status.json"
WEBHOOK_HUB = "http://localhost:9090"

# Provider-Checks
PROVIDERS = [
    {"name": "Gateway",      "url": "http://localhost:3040/api/v1/health",  "icon": "🔌", "critical": True},
    {"name": "Webhook Hub",  "url": "http://localhost:9090/health",          "icon": "🔗", "critical": True},
    {"name": "n8n",          "url": "http://localhost:5678/healthz",         "icon": "⚡", "critical": False},
    {"name": "OpenHands",    "url": "http://localhost:3000/api/health",      "icon": "🤚", "critical": False},
    {"name": "VPS Ollama",   "url": "http://72.61.93.129:8811/api/tags",    "icon": "🧠", "critical": False},
]

# Lokale Checks (kein HTTP)
LOCAL_CHECKS = [
    {"name": "DEVKiTZ",       "path": "C:\\DEVKiTZ",                      "icon": "📁"},
    {"name": "DEEPKEEP",      "path": os.path.expanduser("~/Documents/DEEPKEEP"), "icon": "🔒"},
    {"name": "SecondBrain",   "path": os.path.expanduser("~/Documents/SecondBrain"), "icon": "🧠"},
]

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger('health-monitor')


def check_http(url, timeout=5):
    """HTTP Health-Check — gibt Status + Response-Time zurueck."""
    start = time.time()
    try:
        req = Request(url, headers={'User-Agent': 'DkZ-HealthMonitor/1.0'})
        resp = urlopen(req, timeout=timeout)
        elapsed = round((time.time() - start) * 1000, 1)
        return {
            "status": "GRUEN" if resp.status < 400 else "GELB",
            "code": resp.status,
            "response_ms": elapsed,
            "message": f"HTTP {resp.status} ({elapsed}ms)"
        }
    except HTTPError as e:
        elapsed = round((time.time() - start) * 1000, 1)
        return {
            "status": "GELB",
            "code": e.code,
            "response_ms": elapsed,
            "message": f"HTTP {e.code} ({elapsed}ms)"
        }
    except URLError as e:
        return {
            "status": "ROT",
            "code": 0,
            "response_ms": -1,
            "message": f"Nicht erreichbar: {str(e.reason)[:50]}"
        }
    except Exception as e:
        return {
            "status": "ROT",
            "code": 0,
            "response_ms": -1,
            "message": f"Fehler: {str(e)[:50]}"
        }


def check_local(path):
    """Lokales Verzeichnis pruefen."""
    p = Path(path)
    if not p.exists():
        return {"status": "ROT", "message": "Nicht gefunden", "files": 0, "size": "0 B"}

    try:
        file_count = sum(1 for _ in p.rglob('*') if _.is_file())
        total_size = sum(f.stat().st_size for f in p.rglob('*') if f.is_file())
        return {
            "status": "GRUEN",
            "message": f"{file_count} Dateien, {_format_size(total_size)}",
            "files": file_count,
            "size": _format_size(total_size)
        }
    except (OSError, PermissionError):
        return {"status": "GELB", "message": "Zugriff eingeschraenkt", "files": -1, "size": "?"}


def _format_size(b):
    if b < 1024: return f"{b} B"
    if b < 1048576: return f"{b/1024:.1f} KB"
    if b < 1073741824: return f"{b/1048576:.1f} MB"
    return f"{b/1073741824:.2f} GB"


def run_health_check():
    """Alle Provider pruefen."""
    results = {
        "timestamp": datetime.now().isoformat(),
        "overall": "GRUEN",
        "providers": [],
        "local": [],
        "summary": {"gruen": 0, "gelb": 0, "rot": 0}
    }

    # HTTP Provider
    for p in PROVIDERS:
        log.info(f"Pruefe {p['icon']} {p['name']}...")
        check = check_http(p["url"])
        entry = {
            "name": p["name"],
            "icon": p["icon"],
            "url": p["url"],
            "critical": p.get("critical", False),
            **check
        }
        results["providers"].append(entry)

        if check["status"] == "GRUEN":
            results["summary"]["gruen"] += 1
        elif check["status"] == "GELB":
            results["summary"]["gelb"] += 1
        else:
            results["summary"]["rot"] += 1

    # Lokale Checks
    for lc in LOCAL_CHECKS:
        log.info(f"Pruefe {lc['icon']} {lc['name']}...")
        check = check_local(lc["path"])
        entry = {
            "name": lc["name"],
            "icon": lc["icon"],
            "path": lc["path"],
            **check
        }
        results["local"].append(entry)

        if check["status"] == "GRUEN":
            results["summary"]["gruen"] += 1
        elif check["status"] == "GELB":
            results["summary"]["gelb"] += 1
        else:
            results["summary"]["rot"] += 1

    # Overall Status
    if results["summary"]["rot"] > 0:
        critical_down = any(p["status"] == "ROT" and p.get("critical") for p in results["providers"])
        results["overall"] = "ROT" if critical_down else "GELB"
    elif results["summary"]["gelb"] > 0:
        results["overall"] = "GELB"
    else:
        results["overall"] = "GRUEN"

    return results


def print_ascii_table(results):
    """ASCII-Tabelle fuer Terminal."""
    overall = results["overall"]
    ampel = {"GRUEN": "🟢", "GELB": "🟡", "ROT": "🔴"}.get(overall, "⚪")

    print(f"\n  {ampel} Overall: {overall}")
    print(f"  🕐 {results['timestamp'][:19]}")
    print()

    # Provider Table
    print(f"  {'Provider':<15} {'Status':>8} {'Response':>10} {'Details':<30}")
    print(f"  {'─' * 65}")

    for p in results["providers"]:
        icon = {"GRUEN": "🟢", "GELB": "🟡", "ROT": "🔴"}.get(p["status"], "⚪")
        resp = f"{p['response_ms']}ms" if p["response_ms"] >= 0 else "—"
        name = f"{p['icon']} {p['name']}"
        print(f"  {name:<15} {icon:>8} {resp:>10} {p['message'][:28]:<30}")

    print()
    print(f"  {'Lokal':<15} {'Status':>8} {'Dateien':>10} {'Groesse':<30}")
    print(f"  {'─' * 65}")

    for lc in results["local"]:
        icon = {"GRUEN": "🟢", "GELB": "🟡", "ROT": "🔴"}.get(lc["status"], "⚪")
        files = str(lc.get("files", "?"))
        name = f"{lc['icon']} {lc['name']}"
        print(f"  {name:<15} {icon:>8} {files:>10} {lc['message'][:28]:<30}")

    print()
    s = results["summary"]
    print(f"  Zusammenfassung: 🟢 {s['gruen']} · 🟡 {s['gelb']} · 🔴 {s['rot']}")
    print()


def send_webhook_alert(results):
    """Bei Statuswechsel Webhook triggern."""
    if results["overall"] == "GRUEN":
        return

    try:
        data = json.dumps({
            "event": "health-alert",
            "status": results["overall"],
            "timestamp": results["timestamp"],
            "providers_down": [p["name"] for p in results["providers"] if p["status"] == "ROT"],
            "summary": results["summary"]
        }).encode('utf-8')

        req = Request(
            f"{WEBHOOK_HUB}/hook/nanobot-broadcast",
            data=data,
            headers={'Content-Type': 'application/json', 'X-DKZ-Source': 'health-monitor'}
        )
        urlopen(req, timeout=3)
        log.info("Webhook Alert gesendet")
    except Exception:
        log.warning("Webhook Hub nicht erreichbar — Alert nicht gesendet")


def main():
    parser = argparse.ArgumentParser(description='CLOUDIA Health Monitor v1.0')
    parser.add_argument('--watch', type=int, nargs='?', const=300, help='Wiederhole alle N Sekunden (default: 300)')
    parser.add_argument('--json', action='store_true', help='JSON Output')
    parser.add_argument('--webhook', action='store_true', help='Webhook bei Fehler triggern')
    args = parser.parse_args()

    print('=' * 50)
    print('  CLOUDIA Health Monitor v1.0 — DEVKiTZ')
    print('=' * 50)

    if args.watch is not None:
        log.info(f"Watch-Modus: Pruefe alle {args.watch}s (Ctrl+C zum Beenden)")
        try:
            while True:
                results = run_health_check()

                if args.json:
                    print(json.dumps(results, indent=2, ensure_ascii=False))
                else:
                    print_ascii_table(results)

                # Status speichern
                with open(STATUS_FILE, 'w', encoding='utf-8') as f:
                    json.dump(results, f, indent=2, ensure_ascii=False)

                if args.webhook:
                    send_webhook_alert(results)

                time.sleep(args.watch)
        except KeyboardInterrupt:
            log.info("Watch-Modus beendet")
    else:
        results = run_health_check()

        if args.json:
            print(json.dumps(results, indent=2, ensure_ascii=False))
        else:
            print_ascii_table(results)

        # Status speichern
        with open(STATUS_FILE, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        if args.webhook:
            send_webhook_alert(results)


if __name__ == '__main__':
    main()
