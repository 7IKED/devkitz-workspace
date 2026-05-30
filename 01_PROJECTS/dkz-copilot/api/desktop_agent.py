"""
DkZ CoPilot — Desktop Agent
Integriert: OS-Copilot, Open Interpreter, Computer Use, Pico Herzschlag
Steuert den Desktop, synchronisiert mit VPS, liest Biometrie-Daten.
"""

import asyncio
import json
import logging
import os
import subprocess
import sys
import time
import threading
from datetime import datetime
from pathlib import Path
from typing import Optional

logger = logging.getLogger("dkz-copilot.desktop")

# ============================================
# Pico Herzschlag Sensor (MAX30102 via USB)
# ============================================

class PicoHeartMonitor:
    """
    Liest Herzfrequenz-Daten vom Raspberry Pi Pico
    via USB Serial (MAX30102 Sensor).
    """

    def __init__(self, port: str = "COM3", baud: int = 115200):
        self.port = port
        self.baud = baud
        self.serial_conn = None
        self.running = False
        self.current_bpm = 0
        self.current_spo2 = 0
        self.history: list[dict] = []
        self._thread: Optional[threading.Thread] = None

    def connect(self) -> bool:
        """Verbindet mit dem Pico ueber USB Serial."""
        try:
            import serial
            self.serial_conn = serial.Serial(self.port, self.baud, timeout=1)
            logger.info(f"Pico verbunden auf {self.port}")
            return True
        except ImportError:
            logger.warning("pyserial nicht installiert: pip install pyserial")
            return False
        except Exception as e:
            logger.warning(f"Pico nicht verbunden ({self.port}): {e}")
            return False

    def start_monitoring(self):
        """Startet die Herzfrequenz-Ueberwachung im Hintergrund."""
        if not self.serial_conn:
            if not self.connect():
                return
        self.running = True
        self._thread = threading.Thread(target=self._read_loop, daemon=True)
        self._thread.start()
        logger.info("Herzschlag-Monitoring gestartet")

    def stop_monitoring(self):
        """Stoppt die Ueberwachung."""
        self.running = False
        if self.serial_conn:
            self.serial_conn.close()
        logger.info("Herzschlag-Monitoring gestoppt")

    def _read_loop(self):
        """Liest kontinuierlich Daten vom Pico."""
        red_buffer = []
        ir_buffer = []
        last_beat_time = time.time()
        beat_intervals = []

        while self.running:
            try:
                if self.serial_conn and self.serial_conn.in_waiting > 0:
                    line = self.serial_conn.readline().decode('utf-8').strip()
                    parts = line.split(',')

                    if len(parts) >= 2:
                        red = int(parts[0])
                        ir = int(parts[1])
                        red_buffer.append(red)
                        ir_buffer.append(ir)

                        # Einfache Peak-Erkennung fuer BPM
                        if len(red_buffer) > 10:
                            avg = sum(red_buffer[-10:]) / 10
                            if red > avg * 1.05 and time.time() - last_beat_time > 0.4:
                                interval = time.time() - last_beat_time
                                last_beat_time = time.time()
                                beat_intervals.append(interval)

                                if len(beat_intervals) > 5:
                                    beat_intervals = beat_intervals[-10:]
                                    avg_interval = sum(beat_intervals) / len(beat_intervals)
                                    self.current_bpm = int(60 / avg_interval)

                        # SpO2 Schaetzung (vereinfacht)
                        if len(red_buffer) > 50 and len(ir_buffer) > 50:
                            r_ac = max(red_buffer[-50:]) - min(red_buffer[-50:])
                            r_dc = sum(red_buffer[-50:]) / 50
                            ir_ac = max(ir_buffer[-50:]) - min(ir_buffer[-50:])
                            ir_dc = sum(ir_buffer[-50:]) / 50

                            if ir_dc > 0 and r_dc > 0:
                                ratio = (r_ac / r_dc) / (ir_ac / ir_dc)
                                self.current_spo2 = max(70, min(100, int(110 - 25 * ratio)))

                        # Buffer begrenzen
                        if len(red_buffer) > 200:
                            red_buffer = red_buffer[-100:]
                            ir_buffer = ir_buffer[-100:]

                        # History speichern (alle 10 Sekunden)
                        if len(self.history) == 0 or \
                           time.time() - self.history[-1].get("ts", 0) > 10:
                            self.history.append({
                                "ts": time.time(),
                                "bpm": self.current_bpm,
                                "spo2": self.current_spo2,
                                "time": datetime.now().strftime("%H:%M:%S")
                            })
                            # Max 360 Eintraege (1 Stunde)
                            if len(self.history) > 360:
                                self.history = self.history[-360:]

            except Exception as e:
                logger.error(f"Pico Lesefehler: {e}")
                time.sleep(1)

            time.sleep(0.01)

    def get_status(self) -> dict:
        """Aktueller Status."""
        return {
            "connected": self.serial_conn is not None and self.running,
            "port": self.port,
            "bpm": self.current_bpm,
            "spo2": self.current_spo2,
            "history_count": len(self.history),
            "alert": self._check_alert()
        }

    def _check_alert(self) -> Optional[str]:
        """Prueft ob Herzwerte im Normalbereich."""
        if self.current_bpm > 0:
            if self.current_bpm > 120:
                return "HIGH_BPM"
            if self.current_bpm < 50:
                return "LOW_BPM"
        if self.current_spo2 > 0 and self.current_spo2 < 90:
            return "LOW_SPO2"
        return None

    def export_data(self) -> list[dict]:
        """Exportiert History fuer OpenHumans Upload."""
        return self.history.copy()


# ============================================
# Desktop Agent (OS-Copilot + Computer Use)
# ============================================

class DesktopAgent:
    """
    Desktop-Steuerung — Dateien, Apps, Terminal, Browser.
    Nutzt OS-Copilot Framework + eigene Tools.
    """

    def __init__(self, llm_url: str = "http://localhost:11434/v1", model: str = "qwen3.5:7b"):
        self.llm_url = llm_url
        self.model = model
        self.workspace = Path(os.getenv("DKZ_WORKSPACE", r"C:\DEVKiTZ"))
        self.actions_log: list[dict] = []

    async def execute_command(self, command: str) -> dict:
        """Fuehrt einen Shell-Befehl aus."""
        try:
            result = subprocess.run(
                command, shell=True, capture_output=True, text=True,
                timeout=60, cwd=str(self.workspace)
            )
            output = {
                "command": command,
                "stdout": result.stdout[:5000],
                "stderr": result.stderr[:2000],
                "returncode": result.returncode,
                "timestamp": datetime.now().isoformat()
            }
            self.actions_log.append(output)
            return output
        except subprocess.TimeoutExpired:
            return {"command": command, "error": "Timeout nach 60s"}
        except Exception as e:
            return {"command": command, "error": str(e)}

    async def file_operation(self, action: str, path: str, content: str = "") -> dict:
        """Datei-Operationen: read, write, list, search."""
        full_path = self.workspace / path

        if action == "read":
            try:
                text = full_path.read_text(encoding="utf-8")
                return {"action": "read", "path": path, "content": text[:10000], "size": len(text)}
            except Exception as e:
                return {"action": "read", "error": str(e)}

        elif action == "write":
            try:
                full_path.parent.mkdir(parents=True, exist_ok=True)
                full_path.write_text(content, encoding="utf-8")
                return {"action": "write", "path": path, "bytes": len(content)}
            except Exception as e:
                return {"action": "write", "error": str(e)}

        elif action == "list":
            try:
                items = []
                for item in full_path.iterdir():
                    items.append({
                        "name": item.name,
                        "is_dir": item.is_dir(),
                        "size": item.stat().st_size if item.is_file() else 0
                    })
                return {"action": "list", "path": path, "items": items[:100]}
            except Exception as e:
                return {"action": "list", "error": str(e)}

        elif action == "search":
            try:
                result = subprocess.run(
                    ["grep", "-rnl", content, str(full_path)],
                    capture_output=True, text=True, timeout=30
                )
                files = result.stdout.strip().split("\n")[:20]
                return {"action": "search", "query": content, "files": files}
            except Exception as e:
                return {"action": "search", "error": str(e)}

        return {"error": f"Unbekannte Aktion: {action}"}

    async def git_status(self) -> dict:
        """Git-Status des Workspace."""
        result = await self.execute_command("git status --porcelain")
        log = await self.execute_command("git log --oneline -5")
        branch = await self.execute_command("git branch --show-current")
        return {
            "branch": branch.get("stdout", "").strip(),
            "changes": result.get("stdout", "").strip().split("\n"),
            "last_commits": log.get("stdout", "").strip().split("\n")
        }

    async def sync_to_vps(self, vps_host: str = "") -> dict:
        """Synchronisiert lokale Dateien mit VPS."""
        if not vps_host:
            return {"error": "VPS Host nicht konfiguriert"}

        commands = [
            f"git push origin main",
            # rsync wuerde hier kommen wenn SSH konfiguriert
        ]
        results = []
        for cmd in commands:
            r = await self.execute_command(cmd)
            results.append(r)

        return {"synced": True, "results": results}

    async def ask_llm(self, question: str, context: str = "") -> str:
        """Fragt das lokale LLM."""
        import httpx
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                resp = await client.post(
                    f"{self.llm_url}/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": "Du bist der DkZ Desktop Agent. Antworte kurz und praezise auf Deutsch. " + context},
                            {"role": "user", "content": question}
                        ],
                        "max_tokens": 2000
                    }
                )
                data = resp.json()
                return data.get("choices", [{}])[0].get("message", {}).get("content", "Keine Antwort")
        except Exception as e:
            return f"LLM Fehler: {e}"

    def get_system_info(self) -> dict:
        """Sammelt System-Informationen."""
        import platform
        return {
            "os": platform.system(),
            "version": platform.version(),
            "machine": platform.machine(),
            "python": platform.python_version(),
            "workspace": str(self.workspace),
            "actions_count": len(self.actions_log)
        }


# ============================================
# Sync Manager (Desktop <-> VPS <-> GitHub)
# ============================================

class SyncManager:
    """Synchronisiert zwischen Desktop, VPS und GitHub."""

    def __init__(self, workspace: str = r"C:\DEVKiTZ"):
        self.workspace = Path(workspace)

    async def sync_features_json(self) -> dict:
        """Scannt Module und aktualisiert features.json."""
        modules_dir = self.workspace / "01_PROJECTS" / "01_dashboard" / "modules"
        features_path = self.workspace / "01_PROJECTS" / "01_dashboard" / "features.json"

        if not modules_dir.exists():
            return {"error": "modules/ nicht gefunden"}

        modules = []
        for mod_dir in sorted(modules_dir.iterdir()):
            if mod_dir.is_dir() and (mod_dir / "index.html").exists():
                html = (mod_dir / "index.html").read_text(encoding="utf-8", errors="ignore")
                modules.append({
                    "name": mod_dir.name,
                    "path": f"modules/{mod_dir.name}/index.html",
                    "has_esc": "esc(" in html,
                    "has_navbar": "dkz-navbar" in html,
                    "has_debug": "dkz-debug" in html,
                    "has_meta": "dkz-version" in html,
                    "size": len(html)
                })

        features_data = {"modules": modules, "count": len(modules), "updated": datetime.now().isoformat()}
        features_path.write_text(json.dumps(features_data, indent=2, ensure_ascii=False), encoding="utf-8")

        return {"synced": True, "count": len(modules)}

    async def sync_git(self) -> dict:
        """Git add, commit, push."""
        try:
            result = subprocess.run(
                "git add -A && git status --porcelain",
                shell=True, capture_output=True, text=True,
                cwd=str(self.workspace)
            )
            changes = result.stdout.strip()
            if not changes:
                return {"status": "no_changes"}

            subprocess.run(
                'git commit -m "sync: Desktop Auto-Sync"',
                shell=True, capture_output=True, text=True,
                cwd=str(self.workspace)
            )
            push = subprocess.run(
                "git push origin main",
                shell=True, capture_output=True, text=True,
                cwd=str(self.workspace)
            )
            return {"status": "pushed", "changes": changes}
        except Exception as e:
            return {"error": str(e)}


# ============================================
# Main — Desktop App Entry Point
# ============================================

def main():
    """Startet den Desktop Agent."""
    print("=" * 50)
    print("  DkZ CoPilot Desktop Agent")
    print("  OS-Copilot + Pico Herzschlag + Sync")
    print("=" * 50)

    # Pico Sensor (optional)
    pico = PicoHeartMonitor(port=os.getenv("PICO_PORT", "COM3"))
    if pico.connect():
        pico.start_monitoring()
        print(f"[x] Pico Herzschlag-Sensor auf {pico.port}")
    else:
        print("[ ] Pico nicht verbunden (optional)")

    # Desktop Agent
    agent = DesktopAgent()
    info = agent.get_system_info()
    print(f"[x] Desktop Agent: {info['os']} {info['machine']}")
    print(f"[x] Workspace: {info['workspace']}")

    # Sync Manager
    sync = SyncManager()
    print("[x] Sync Manager bereit")

    print("\nBereit! Starte die PWA App oder nutze die API.")
    print("Ctrl+C zum Beenden.\n")

    # Event Loop
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        # Periodisch Herzschlag loggen
        async def heartbeat_log():
            while True:
                if pico.running and pico.current_bpm > 0:
                    alert = pico._check_alert()
                    status = f"BPM: {pico.current_bpm} | SpO2: {pico.current_spo2}%"
                    if alert:
                        status += f" | ALERT: {alert}"
                    logger.info(status)
                await asyncio.sleep(30)

        loop.run_until_complete(heartbeat_log())

    except KeyboardInterrupt:
        pico.stop_monitoring()
        print("\nDesktop Agent beendet.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
    main()
