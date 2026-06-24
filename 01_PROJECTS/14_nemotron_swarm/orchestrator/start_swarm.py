"""
start_swarm.py — Nemotron Daemon Launcher

Startet alle 3 Agenten + Telegram Bridge als parallele Subprozesse.
Logging pro Agent in logs/<agent_id>.log
"""

import os
import sys
import time
import signal
import subprocess

SWARM_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SWARM_DIR)
LOG_DIR = os.path.join(PROJECT_DIR, "logs")
AGENTS_DIR = os.path.join(PROJECT_DIR, "agents")

AGENTS = {
    "nemo-code": {"script": os.path.join(AGENTS_DIR, "agent_coder.py")},
    "nemo-res": {"script": os.path.join(AGENTS_DIR, "agent_researcher.py")},
    "nemo-rev": {"script": os.path.join(AGENTS_DIR, "agent_reviewer.py")},
}

BRIDGE_SCRIPT = os.path.join(SWARM_DIR, "telegram_bridge.py")

processes = []


def start_process(name: str, script_path: str) -> subprocess.Popen:
    log_file = os.path.join(LOG_DIR, f"{name}.log")
    os.makedirs(LOG_DIR, exist_ok=True)
    fh = open(log_file, "a", encoding="utf-8")
    proc = subprocess.Popen(
        [sys.executable, script_path],
        stdout=fh,
        stderr=subprocess.STDOUT,
        cwd=PROJECT_DIR,
    )
    print(f"[swarm] {name} gestartet (PID {proc.pid}) -> logs/{name}.log")
    return proc


def stop_all(signum=None, frame=None):
    print("\n[swarm] Herunterfahren aller Prozesse...")
    for proc in processes:
        if proc.poll() is None:
            proc.terminate()
    for proc in processes:
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
    print("[swarm] Alle Prozesse beendet.")
    sys.exit(0)


def main():
    signal.signal(signal.SIGINT, stop_all)
    signal.signal(signal.SIGTERM, stop_all)

    print("=" * 50)
    print("  Nemotron Swarm — Daemon Launcher")
    print("=" * 50)

    for name, cfg in AGENTS.items():
        if os.path.exists(cfg["script"]):
            proc = start_process(name, cfg["script"])
            processes.append(proc)
        else:
            print(f"[swarm] FEHLER: {cfg['script']} nicht gefunden!")

    if os.path.exists(BRIDGE_SCRIPT):
        proc = start_process("telegram-bridge", BRIDGE_SCRIPT)
        processes.append(proc)
    else:
        print(f"[swarm] FEHLER: {BRIDGE_SCRIPT} nicht gefunden!")

    print(f"\n[swarm] {len(processes)} Prozesse aktiv. Druecke Ctrl+C zum Stoppen.\n")

    while True:
        alive = [p for p in processes if p.poll() is None]
        dead = [p for p in processes if p.poll() is not None]
        if dead:
            for p in dead:
                idx = processes.index(p)
                print(f"[swarm] WARN: Prozess {idx} beendet (Code {p.returncode})")
            processes[:] = alive
        if not alive:
            print("[swarm] Alle Prozesse beendet.")
            break
        time.sleep(2)


if __name__ == "__main__":
    main()
